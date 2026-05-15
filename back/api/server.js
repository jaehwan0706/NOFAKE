import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { Sequelize, DataTypes, Op } from "sequelize";
import crypto from "crypto";
import axios from "axios"; // 에러 처리가 용이한 axios 권장
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // 프론트엔드 포트 명시
  credentials: true                // 인증 정보 허용
}));
app.use(express.json());

// --- 환경 변수 설정 (도커 3001:3002 매핑 기준) ---
const PORT = process.env.PORT || 3002;
const RPC_URL = process.env.RPC_URL || "";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || process.env.PRIVATE_KEY || "";
const DB_STORAGE_PATH = process.env.DB_STORAGE_PATH || path.join(__dirname, "database.sqlite");

// --- Web3Auth/Kakao 토큰 검증 설정 ---
const client = jwksClient({
  jwksUri: process.env.JWKS_URI 
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey() || key?.rsaPublicKey;
    callback(null, signingKey);
  });
}

// 🛡️ [보안 미들웨어] 민팅 전 유저 검증
const verifyTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: '인증 토큰이 없습니다.' });

    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, getKey, { 
        algorithms: ['RS256'],
        audience: process.env.TOKEN_AUDIENCE 
    }, (err, decoded) => {
        if (err) {
            console.error("❌ 토큰 검증 실패:", err.message);
            return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        }
        
        // 토큰에서 지갑 주소 추출
        req.user = {
            walletAddress: decoded.wallets?.[0]?.address || decoded.Sub || decoded.sub,
            email: decoded.email
        };
        next();
    });
};

// --- DB 설정 ---
fs.mkdirSync(path.dirname(DB_STORAGE_PATH), { recursive: true });
const sequelize = new Sequelize(
  process.env.DB_NAME,     // DB 이름 (NOFAKE)
  process.env.DB_USER,     // 계정명 (NOFAKE)
  process.env.DB_PASSWORD, // 비밀번호 (asdfasdf)
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",      // sqlite 대신 mysql 사용
    logging: false,        // 터미널이 지저분해지면 false, 쿼리를 보고 싶으면 console.log
    dialectOptions: {
      connectTimeout: 60000 // 연결 시간 초과 방지
    }
  }
);

const Raffle = sequelize.define("Raffle", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  imageUrl: { type: DataTypes.STRING },
  startAt: { type: DataTypes.DATE },
  endAt: { type: DataTypes.DATE },
  firstPrizeCount: { type: DataTypes.INTEGER },
  secondPrizeCount: { type: DataTypes.INTEGER },
  status: {
    type: DataTypes.ENUM("READY", "MINTING", "CLOSED", "REVEALED"),
    defaultValue: "MINTING",
  },
  contractAddress: { type: DataTypes.STRING },
  provenanceHash: { type: DataTypes.STRING },
});
const User = sequelize.define("User", {
  kakaoId: { 
    type: DataTypes.STRING, 
    primaryKey: true, 
    comment: "카카오 고유 ID" 
  },
  nickname: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  phoneNumber: { type: DataTypes.STRING }
});
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "유저 목록을 불러오지 못했습니다." });
  }
});
// --- 블록체인 설정 ---
const abiPath = path.join(__dirname, "abi.json");
const rawAbi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const contractABI = Array.isArray(rawAbi) ? rawAbi : rawAbi.abi;

const provider = RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;
const readContract = provider && CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider) : null;
const signer = provider && OWNER_PRIVATE_KEY ? new ethers.Wallet(OWNER_PRIVATE_KEY, provider) : null;
const writeContract = signer && CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer) : null;

// --- API 엔드포인트 ---

// 1. 카카오 인증 라우트 (인가 코드 -> ID 토큰 교환)
app.post("/api/auth/kakao", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "인가 코드가 없습니다." });

  try {
    // 1단계: 인가 코드를 액세스 토큰으로 교환 (기존 로직)
    const response = await axios.post("https://kauth.kakao.com/oauth/token", new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_REST_API_KEY,
      redirect_uri: "http://localhost:5173/auth/kakao/callback", 
      code,
    }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const { access_token } = response.data;

    // 2단계: ✨ [추가] 액세스 토큰으로 카카오 사용자 상세 정보 가져오기
    const userInfoResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const kakaoUser = userInfoResponse.data;
    const kakaoAccount = kakaoUser.kakao_account;

    // 3단계: ✨ [추가] DB에 저장 (Upsert: 있으면 업데이트, 없으면 생성)
    await User.upsert({
      kakaoId: kakaoUser.id.toString(),
      nickname: kakaoAccount.profile?.nickname || "",
      email: kakaoAccount.email || "",
      name: kakaoAccount.name || "",
      phoneNumber: kakaoAccount.phone_number || ""
    });

    console.log(`✅ 유저 정보 DB 저장 완료: ${kakaoAccount.name || kakaoUser.id}`);
    
    // 프론트엔드에는 원래 주던 토큰 정보를 그대로 줍니다.
    res.json(response.data); 

  } catch (error) {
    const errorData = error.response?.data;
    if (errorData?.error_code === 'KOE320') {
      return res.status(200).json({ message: "이미 처리된 코드입니다." });
    }
    console.error("❌ 카카오 인증/DB 저장 에러:", errorData || error.message);
    res.status(500).json({ error: "카카오 인증 실패" });
  }
});

// 2. 민팅 라우트 (보안 미들웨어 적용)
app.post("/api/mint", verifyTokenMiddleware, async (req, res) => {
  try {
    const { raffleId } = req.body;
    const userAddress = req.user.walletAddress; // 토큰에서 안전하게 추출

    const raffle = await Raffle.findByPk(raffleId);
    if (!raffle || raffle.status !== "MINTING") {
      return res.status(400).json({ success: false, error: "민팅 가능한 래플이 아닙니다." });
    }

    if (!writeContract) throw new Error("블록체인 쓰기 권한이 설정되지 않았습니다.");

    console.log(`🚀 민팅 시도: 유저(${userAddress}), 래플(${raffleId})`);
    
    // 가스비는 서버 지갑(signer)이 부담
    const tx = await writeContract.mintRaffleTicket(userAddress, raffle.id);
    const receipt = await tx.wait();

    res.json({ success: true, txHash: receipt.hash, user: userAddress });
  } catch (error) {
    console.error("❌ 민팅 실패:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 기타 기본 API들 (Raffles 조회 등)
app.get("/api/raffles", async (req, res) => {
  try {
    const raffles = await Raffle.findAll({ order: [["createdAt", "DESC"]] });
    res.json(raffles);
  } catch (error) {
    res.status(500).json({ error: "Failed to load raffles." });
  }
});

app.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", port: PORT });
});
// --- [1] 내 프로필 조회 (GET /api/user/profile) ---
app.get("/api/user/profile", verifyTokenMiddleware, async (req, res) => {
  try {
    const userInfo = await User.findOne({
      where: { email: req.user.email },
      attributes: ["name", "email"] // 프론트 요구사항에 맞춰 이름과 이메일만 가져옵니다.
    });

    if (!userInfo) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    
    // ✨ 프론트엔드의 UserProfile 인터페이스 규격에 완벽히 맞춰서 응답 포장
    const profileResponse = {
      name: userInfo.name,
      email: userInfo.email,
      walletAddress: null, // 아직 블록체인 연동 전이므로 null 처리
      did: null,           // DID 발급 전이므로 null 처리
      joinedAt: null,      // 가입일 임시 null
      profileImage: null
    };

    res.json(profileResponse);
  } catch (error) {
    res.status(500).json({ error: "프로필 조회 실패" });
  }
});

// --- [2] 이름 변경 (PATCH /api/user/name) ---
app.patch("/api/user/name", verifyTokenMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "변경할 이름이 없습니다." });

    await User.update({ name: name }, { where: { email: req.user.email } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "이름 변경 실패" });
  }
});

// --- [3] 이메일 변경 (PATCH /api/user/email) - 프론트 코드에 새로 추가된 부분! ---
app.patch("/api/user/email", verifyTokenMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "변경할 이메일이 없습니다." });

    await User.update({ email: email }, { where: { email: req.user.email } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "이메일 변경 실패" });
  }
});

// --- [4] 마이페이지 종합 정보 (GET /api/mypage) ---
app.get("/api/mypage", verifyTokenMiddleware, async (req, res) => {
  try {
    // 💡 화면 디자인 확인용 가짜(Mock) 데이터 유지
    const myPageData = {
      points: 1500,
      stats: { totalApply: 2, winCount: 1, winRate: "50.0", activeCount: 1 },
      raffleHistory: [
        {
          id: "1", brand: "NIKE", brandColor: "#000000", name: "Travis Scott x Air Jordan 1 Low",
          image: "👟", applyDate: "2026.05.10", deadline: "2026.05.20", resultDate: "2026.05.21",
          participants: "1,204", winners: "10", myNumber: "NOFAKE-0842", status: "당첨",
          txHash: "0x3f2e...9a1b", size: "270", price: "189,000원", purchaseDeadline: "2026.05.25"
        }
      ],
      pointHistory: [
        { label: "회원가입 축하 포인트", date: "2026.05.10", amount: "+2,000", color: "#10b981" }
      ]
    };
    
    res.json(myPageData);
  } catch (error) {
    res.status(500).json({ error: "마이페이지 데이터 조회 실패" });
  }
});
// --- 서버 실행 ---
const ensureSchema = async () => {
  await sequelize.sync();
};

ensureSchema().then(() => {
  console.log(`==========================================`);
  console.log(`🛡️ NOFAKE 통합 서버 가동 (Port: ${PORT})`);
  console.log(`🔗 Redirect URI: http://localhost:5173/auth/kakao/callback`);
  console.log(`==========================================`);
  app.listen(PORT, () => {});
});
