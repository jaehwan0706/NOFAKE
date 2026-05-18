import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import axios from "axios";
import { Sequelize, DataTypes, Op } from "sequelize";
import crypto from "crypto";
import { importJWK, jwtVerify } from "jose";
import { Gateway, Wallets } from "fabric-network";

// ============================================
// 초기 설정
// ============================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON body:', err.message);
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

const PORT = process.env.PORT || 3002;
const RPC_URL = process.env.RPC_URL || "";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || process.env.PRIVATE_KEY || "";
const DB_STORAGE_PATH = process.env.DB_STORAGE_PATH || path.join(__dirname, "..", "database.sqlite");

// ============================================
// 데이터베이스 설정
// ============================================
fs.mkdirSync(path.dirname(DB_STORAGE_PATH), { recursive: true });

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || "sqlite",
  storage: process.env.DB_DIALECT === "mysql" ? undefined : DB_STORAGE_PATH,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
  dialectOptions: {
    connectTimeout: 60000
  }
});

// ============================================
// 데이터베이스 모델
// ============================================
const Raffle = sequelize.define("Raffle", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  imageUrl: { type: DataTypes.STRING },
  startAt: { type: DataTypes.DATE },
  endAt: { type: DataTypes.DATE },
  firstPrizeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  secondPrizeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM("READY", "MINTING", "CLOSED", "REVEALED"),
    defaultValue: "MINTING",
  },
  contractAddress: { type: DataTypes.STRING },
  provenanceHash: { type: DataTypes.STRING },
});

const RaffleSession = sequelize.define("RaffleSession", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  raffleId: { type: DataTypes.INTEGER, allowNull: false },
  sessionId: { type: DataTypes.STRING, allowNull: false },
  startedAt: { type: DataTypes.DATE, allowNull: false },
  completedAt: { type: DataTypes.DATE, allowNull: true },
  durationSeconds: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM("STARTED", "COMPLETED"),
    allowNull: false,
    defaultValue: "STARTED",
  },
}, {
  indexes: [{ unique: true, fields: ["raffleId", "sessionId"] }],
});

const RaffleParticipant = sequelize.define("RaffleParticipant", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  raffleId: { type: DataTypes.INTEGER, allowNull: false },
  walletAddress: { type: DataTypes.STRING, allowNull: false },
  joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  result: {
    type: DataTypes.ENUM("pending", "first", "second", "lose"),
    allowNull: false,
    defaultValue: "pending",
  },
  revealedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  indexes: [{ unique: true, fields: ["raffleId", "walletAddress"] }],
});

const User = sequelize.define("User", {
  kakaoId: { type: DataTypes.STRING, primaryKey: true, comment: "카카오 고유 ID" },
  nickname: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  phoneNumber: { type: DataTypes.STRING },
  phone_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  phone_verified_at: { type: DataTypes.DATE },
  walletAddress: { type: DataTypes.STRING, allowNull: true },
  did: { type: DataTypes.STRING, allowNull: true },
  points: { type: DataTypes.INTEGER, defaultValue: 0 },
  joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: true
});

const PointBalance = sequelize.define("PointBalance", {
  walletAddress: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
  nofake: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  musinsa: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  nike: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  timestamps: true,
  tableName: "PointBalances"
});

const PhoneVerificationSession = sequelize.define('PhoneVerificationSession', {
  sessionId: { type: DataTypes.STRING, primaryKey: true },
  kakaoId: { type: DataTypes.STRING, allowNull: true },
  phoneNumber: { type: DataTypes.STRING, allowNull: true },
  verificationCode: { type: DataTypes.STRING, allowNull: true }, // Octomo 인증 코드 (예: 123456)
  receiverNumber: { type: DataTypes.STRING, allowNull: true },
  txId: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('pending', 'verified', 'failed', 'expired'), allowNull: false, defaultValue: 'pending' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  expiresAt: { type: DataTypes.DATE, allowNull: true },
  verifiedAt: { type: DataTypes.DATE, allowNull: true },
  meta: { type: DataTypes.JSON, allowNull: true }
});

// ============================================
// 블록체인 설정
// ============================================
const abiPath = path.join(__dirname, "..", "abi.json");
const rawAbi = fs.existsSync(abiPath) ? JSON.parse(fs.readFileSync(abiPath, "utf8")) : [];
const contractABI = Array.isArray(rawAbi) ? rawAbi : rawAbi.abi || [];

const provider = RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;
const readContract = provider && CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider) : null;
const signer = provider && OWNER_PRIVATE_KEY ? new ethers.Wallet(OWNER_PRIVATE_KEY, provider) : null;
const writeContract = signer && CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer) : null;

// ============================================
// 인증 미들웨어
// ============================================
const verifyTokenMiddleware = async (req, res, next) => {
  if (process.env.USE_MOCK_AUTH === 'true') {
    req.user = {
      kakaoId: 'test_kakao_1234',
      walletAddress: '0x398591b6257b8BA14Baf06728a706a5B73dd2795',
      email: 'mock@example.com',
      name: 'Mock User'
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("⚠️ 인증 헤더 없음");
    return res.status(401).json({ error: '인증 토큰이 없습니다.' });
  }

  const token = authHeader.split(' ')[1];

  // 1. 먼저 JWT 검증 시도 (ID Token 등)
  if (process.env.JWKS_URI) {
    try {
      const jwksUri = process.env.JWKS_URI;
      const jwksResponse = await axios.get(jwksUri);
      const keys = jwksResponse.data?.keys || [];
      const decodedHeader = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString('utf8'));
      const jwk = keys.find((key) => key.kid === decodedHeader.kid);

      if (jwk) {
        const verificationKey = await importJWK(jwk, jwk.alg || 'RS256');
        const { payload } = await jwtVerify(token, verificationKey, {
          audience: process.env.TOKEN_AUDIENCE,
          issuer: process.env.TOKEN_ISSUER
        });

        console.log("✅ JWT 검증 성공:", payload.sub || payload.Sub);
        req.user = {
          walletAddress: payload.wallets?.[0]?.address || payload.Sub || payload.sub,
          email: payload.email,
          kakaoId: payload.sub || payload.Sub,
          name: payload.name || payload.nickname
        };
        return next();
      }

      console.log("ℹ️ JWKS 키를 찾을 수 없습니다. 카카오 액세스 토큰으로 재시도...");
    } catch (err) {
      console.log("ℹ️ JWT 검증 실패, 카카오 액세스 토큰으로 재시도...", err.message);
    }
  }

  // 2. JWT 검증에 실패하거나 JWKS_URI가 없으면 카카오 액세스 토큰으로 간주
  try {
    const resp = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const kakaoId = String(resp.data.id || resp.data?.id || '');
    console.log("✅ 카카오 토큰 검증 성공:", kakaoId);
    
    const user = await User.findOne({ where: { kakaoId } });
    
    if (user) {
      req.user = {
        kakaoId: user.kakaoId,
        email: user.email,
        name: user.name || user.nickname,
        walletAddress: user.walletAddress
      };
    } else {
      console.log("ℹ️ DB에 유저 정보 없음, 카카오 정보만 사용:", kakaoId);
      req.user = {
        kakaoId: kakaoId,
        email: resp.data.kakao_account?.email,
        name: resp.data.kakao_account?.profile?.nickname
      };
    }
    next();
  } catch (err) {
    console.warn("⚠️ 모든 인증 방식 실패:", err.message);
    if (err.response) {
      console.error("  카카오 API 에러 상세:", err.response.data);
    }
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

async function ensurePhoneVerified(req, res, next) {
  try {
    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) return res.status(401).json({ success: false, error: '카카오 토큰이 필요합니다.' });

    const resp = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const kakaoId = String(resp.data.id || resp.data?.id || '');
    if (!kakaoId) return res.status(401).json({ success: false, error: '유효하지 않은 카카오 토큰입니다.' });

    const user = await User.findOne({ where: { kakaoId } });
    if (!user) return res.status(403).json({ success: false, error: 'USER_NOT_FOUND', message: '추가 인증이 필요합니다.' });

    if (!user.phone_verified) {
      return res.status(403).json({ success: false, error: 'PHONE_NOT_VERIFIED', message: '휴대폰 인증이 필요합니다.' });
    }

    req.loginUser = user;
    next();
  } catch (err) {
    console.error('ensurePhoneVerified error:', err.message);
    return res.status(401).json({ success: false, error: '토큰 검증 실패' });
  }
}

// ============================================
// 유틸리티 함수
// ============================================
const buildProvenanceHash = () => {
  const metadataDir = path.join(__dirname, "..", "metadata", "post-reveal");
  if (!fs.existsSync(metadataDir)) {
    throw new Error("post-reveal metadata directory not found.");
  }

  const files = fs.readdirSync(metadataDir).filter(f => f.endsWith(".json")).sort();
  if (files.length === 0) throw new Error("No post-reveal metadata files found.");

  const combinedHashes = files.map(file => {
    const fileData = fs.readFileSync(path.join(metadataDir, file));
    return crypto.createHash("sha256").update(fileData).digest("hex");
  }).join("");

  return crypto.createHash("sha256").update(combinedHashes).digest("hex");
};

const normalizeWalletAddress = (value = "") => {
  const rawAddress = String(value || "").trim();
  if (!rawAddress || !ethers.isAddress(rawAddress)) return "";
  return ethers.getAddress(rawAddress);
};

const normalizeRafflePayload = (body = {}) => ({
  title: String(body.title ?? body.name ?? "").trim(),
  category: String(body.category ?? "").trim() || null,
  description: String(body.description ?? "").trim() || null,
  imageUrl: String(body.imageUrl ?? "").trim() || null,
  startAt: body.startAt || null,
  endAt: body.endAt || null,
  firstPrizeCount: Number(body.firstPrizeCount ?? body.firstPrize ?? 0) || 0,
  secondPrizeCount: Number(body.secondPrizeCount ?? body.secondPrize ?? 0) || 0,
  status: body.status || "MINTING",
});

const getContractParticipantStats = async () => {
  if (!readContract) return { totalParticipants: 0, byRaffleId: {} };

  try {
    const totalSupply = Number(await readContract.totalSupply());
    const byRaffleId = {};

    if (totalSupply === 0) return { totalParticipants: 0, byRaffleId };

    const raffleIds = await Promise.all(
      Array.from({ length: totalSupply }, (_, i) => readContract.tokenToRaffleId(i + 1))
    );

    raffleIds.forEach(raffleIdValue => {
      const raffleId = Number(raffleIdValue);
      byRaffleId[raffleId] = (byRaffleId[raffleId] || 0) + 1;
    });

    return { totalParticipants: totalSupply, byRaffleId };
  } catch (error) {
    console.error("Error getting contract stats:", error);
    return { totalParticipants: 0, byRaffleId: {} };
  }
};

const buildAnalyticsByRaffleId = (sessions = []) => {
  const analyticsMap = {};

  sessions.forEach(session => {
    const plain = session.toJSON ? session.toJSON() : session;
    const raffleId = Number(plain.raffleId);

    if (!analyticsMap[raffleId]) {
      analyticsMap[raffleId] = { startedCount: 0, completedCount: 0, totalDurationSeconds: 0 };
    }

    analyticsMap[raffleId].startedCount += 1;

    if (plain.status === "COMPLETED" || plain.completedAt) {
      analyticsMap[raffleId].completedCount += 1;
      analyticsMap[raffleId].totalDurationSeconds += Math.max(Number(plain.durationSeconds || 0), 0);
    }
  });

  return Object.fromEntries(
    Object.entries(analyticsMap).map(([raffleId, metrics]) => {
      const startedCount = metrics.startedCount;
      const completedCount = metrics.completedCount;
      const dropoutCount = Math.max(startedCount - completedCount, 0);
      const conversionRate = startedCount ? (completedCount / startedCount) * 100 : 0;
      const dropoutRate = startedCount ? (dropoutCount / startedCount) * 100 : 0;
      const avgEntryMinutes = completedCount ? metrics.totalDurationSeconds / completedCount / 60 : 0;

      return [raffleId, {
        views: startedCount,
        completions: completedCount,
        dropouts: dropoutCount,
        conversionRate,
        dropoutRate,
        avgEntryMinutes,
      }];
    })
  );
};

const getRaffleAnalyticsByIds = async (raffleIds = []) => {
  if (raffleIds.length === 0) return {};

  const sessions = await RaffleSession.findAll({
    where: { raffleId: { [Op.in]: raffleIds } }
  });

  return buildAnalyticsByRaffleId(sessions);
};

const serializeRaffle = (raffle, participantStats = {}, analyticsByRaffleId = {}) => {
  const plain = raffle.toJSON ? raffle.toJSON() : raffle;
  const analytics = analyticsByRaffleId[plain.id] || {};

  return {
    ...plain,
    participants: participantStats[plain.id] || 0,
    views: Number(analytics.views || 0),
    completions: Number(analytics.completions || 0),
    dropouts: Number(analytics.dropouts || 0),
    conversionRate: Number(analytics.conversionRate || 0),
    dropoutRate: Number(analytics.dropoutRate || 0),
    avgEntryMinutes: Number(analytics.avgEntryMinutes || 0),
  };
};

const serializeRaffleForUser = (raffle, participantStats = {}, analyticsByRaffleId = {}, participantByRaffleId = {}) => {
  const serialized = serializeRaffle(raffle, participantStats, analyticsByRaffleId);
  const participant = participantByRaffleId[Number(serialized.id)] || null;

  return {
    ...serialized,
    maxParticipants: 30,
    hasParticipated: Boolean(participant),
    userResult: participant?.result && participant.result !== "pending" ? participant.result : null,
    userJoinedAt: participant?.joinedAt || null,
  };
};

const getParticipantMapByRaffleId = async (raffleIds = [], walletAddress = "") => {
  const normalizedWallet = normalizeWalletAddress(walletAddress);
  if (!raffleIds.length || !normalizedWallet) return {};

  const participants = await RaffleParticipant.findAll({
    where: { raffleId: { [Op.in]: raffleIds }, walletAddress: normalizedWallet }
  });

  return Object.fromEntries(
    participants.map(p => {
      const plain = p.toJSON ? p.toJSON() : p;
      return [Number(plain.raffleId), plain];
    })
  );
};

const buildRevealAssignments = (participants = [], raffle) => {
  const raffleId = Number(raffle?.id || 0);
  const firstPrizeCount = Math.max(Number(raffle?.firstPrizeCount || 0), 0);
  const secondPrizeCount = Math.max(Number(raffle?.secondPrizeCount || 0), 0);
  const seedBase = `${raffleId}:${raffle?.provenanceHash || ""}:${participants.length}`;

  const rankedParticipants = [...participants].sort((left, right) => {
    const leftSeed = crypto.createHash("sha256")
      .update(`${seedBase}:${left.walletAddress}:${left.joinedAt}:${left.id}`).digest("hex");
    const rightSeed = crypto.createHash("sha256")
      .update(`${seedBase}:${right.walletAddress}:${right.joinedAt}:${right.id}`).digest("hex");
    return leftSeed.localeCompare(rightSeed);
  });

  const effectiveFirstPrizeCount = Math.min(firstPrizeCount, rankedParticipants.length);
  const effectiveSecondPrizeCount = Math.min(
    secondPrizeCount,
    Math.max(rankedParticipants.length - effectiveFirstPrizeCount, 0)
  );

  return rankedParticipants.map((participant, index) => {
    let result = "lose";
    if (index < effectiveFirstPrizeCount) {
      result = "first";
    } else if (index < effectiveFirstPrizeCount + effectiveSecondPrizeCount) {
      result = "second";
    }
    return { id: participant.id, result };
  });
};

// ============================================
// API 엔드포인트
// ============================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NOFAKE API server is running.",
    endpoints: ["/health", "/api/raffles", "/api/mint", "/api/admin/raffles", "/api/metadata/:tokenId"]
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    port: PORT,
    contractConfigured: Boolean(readContract),
    writeWalletConfigured: Boolean(writeContract),
  });
});

// ============================================
// 인증 API
// ============================================

app.post("/api/auth/kakao", async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code) return res.status(400).json({ error: "인가 코드가 없습니다." });

  try {
    const tokenResponse = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_REST_API_KEY || "d9c3641e6babf0f0d91c93a7ec557c40",
        redirect_uri: redirectUri || process.env.KAKAO_REDIRECT_URI || "http://localhost:5173/auth/kakao/callback",
        code,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const kakaoAccount = userResponse.data.kakao_account ?? {};
    const profile = kakaoAccount.profile ?? {};
    const kakaoId = String(userResponse.data.id || userResponse.data?.id || "");

    try {
      await User.findOrCreate({
        where: { kakaoId },
        defaults: { name: profile.nickname, email: kakaoAccount.email },
      });

      res.json({
        success: true,
        accessToken: access_token,
        name: profile.nickname,
        email: kakaoAccount.email,
        phone_verified: false,
        phone_number: null,
      });
    } catch (dbErr) {
      console.error('User upsert failed:', dbErr.message);
      res.json({ success: true, accessToken: access_token, name: profile.nickname, email: kakaoAccount.email, phone_verified: false });
    }
  } catch (error) {
    console.error("카카오 로그인 실패:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "카카오 통신 중 오류 발생" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  if (process.env.USE_MOCK_AUTH === 'true') {
    return res.json({
      success: true,
      name: 'Mock User',
      email: 'mock@example.com'
    });
  }

  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  if (!token) return res.status(401).json({ success: false, error: "토큰이 없습니다." });

  try {
    const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const kakaoAccount = userResponse.data.kakao_account ?? {};
    const profile = kakaoAccount.profile ?? {};

    res.json({
      success: true,
      name: profile.nickname ?? "사용자",
      email: kakaoAccount.email ?? "",
    });
  } catch (error) {
    console.error("/api/auth/me 실패:", error.response?.data || error.message);
    res.status(401).json({ success: false, error: "유효하지 않은 토큰입니다." });
  }
});

// ============================================
// 사용자 프로필 API
// ============================================

app.get("/api/user/profile", verifyTokenMiddleware, async (req, res) => {
  try {
    res.json({
      name: req.user.name || "사용자",
      email: req.user.email || "",
      walletAddress: req.user.walletAddress || null,
    });
  } catch (error) {
    res.status(500).json({ error: "프로필 조회 실패" });
  }
});

app.post('/api/user/phone', async (req, res) => {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return res.status(401).json({ success: false, error: '카카오 토큰이 필요합니다.' });

  try {
    const userResp = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const kakaoId = String(userResp.data.id || userResp.data?.id || '');
    if (!kakaoId) return res.status(400).json({ success: false, error: '카카오 사용자 정보를 확인할 수 없습니다.' });

    const phoneNumber = String(req.body.phoneNumber || '').trim();
    if (!phoneNumber) return res.status(400).json({ success: false, error: 'phoneNumber is required' });

    const user = await User.findOne({ where: { kakaoId } });
    if (!user) return res.status(404).json({ success: false, error: 'user not found' });

    await user.update({ phoneNumber, phone_verified: false, phone_verified_at: null });

    const sessionId = `pv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const receiverNumber = process.env.OCTOMO_DEFAULT_RECEIVER || '+821055556666';
    const expiresAt = new Date(Date.now() + (Number(process.env.OCTOMO_TTL_SECONDS || 300) * 1000));

    await PhoneVerificationSession.create({
      sessionId, kakaoId, phoneNumber, receiverNumber, status: 'pending', expiresAt,
      meta: { createdBy: 'user_attach' }
    });

    return res.json({ success: true, phone_number: phoneNumber, sessionId, receiverNumber, expiresAt: expiresAt.toISOString() });
  } catch (err) {
    console.error('/api/user/phone error:', err.message);
    return res.status(500).json({ success: false, error: 'server error' });
  }
});

// ============================================
// 전화 인증 API
// ============================================

app.post('/api/phone-verification/start', async (req, res) => {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return res.status(401).json({ success: false, error: '카카오 토큰이 필요합니다.' });

  try {
    const userResp = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const kakaoId = String(userResp.data.id || userResp.data?.id || '');
    if (!kakaoId) return res.status(400).json({ success: false, error: '카카오 사용자 정보를 확인할 수 없습니다.' });

    const phoneNumber = String(req.body.phoneNumber || '').trim() || null;
    let sessionId = `pv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    // Octomo MO 인증 설정
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 랜덤 코드
    const receiverNumber = '1666-3538'; // Octomo 대표 번호
    const expiresAt = new Date(Date.now() + (Number(process.env.OCTOMO_TTL_SECONDS || 300) * 1000));

    await PhoneVerificationSession.create({
      sessionId, kakaoId, phoneNumber, verificationCode, receiverNumber, status: 'pending', expiresAt
    });

    return res.status(201).json({
      sessionId, receiverNumber, verificationCode, expiresAt: expiresAt.toISOString(), pollIntervalSeconds: 4
    });
  } catch (err) {
    console.error('phone verification start error:', err.message);
    return res.status(500).json({ success: false, error: 'server error' });
  }
});

app.get('/api/phone-verification/status', async (req, res) => {
  const sessionId = String(req.query.sessionId || '').trim();
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  try {
    const session = await PhoneVerificationSession.findByPk(sessionId);
    if (!session) return res.status(404).json({ error: 'session not found' });

    // 이미 인증되었으면 즉시 반환
    if (session.status === 'verified') {
      return res.json({ sessionId: session.sessionId, status: session.status, verifiedAt: session.verifiedAt });
    }

    // 만료 여부 확인
    if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
      await session.update({ status: 'expired' });
      return res.json({ sessionId: session.sessionId, status: 'expired' });
    }

    // [Octomo Polling Fallback]
    // 아직 대기 중이라면 Octomo API를 직접 조회하여 확인 시도
    if (session.status === 'pending' && process.env.OCTOMO_API_KEY && session.verificationCode) {
      try {
        const octomoResp = await axios.get(`https://api.octomo.octoverse.kr/v1/messages`, {
          params: { content: session.verificationCode },
          headers: { 'x-api-key': process.env.OCTOMO_API_KEY }
        });

        const messages = octomoResp.data?.data || [];
        // 해당 코드로 수신된 메시지가 있다면 인증 성공 처리
        if (messages.length > 0) {
          const msg = messages[0];
          await session.update({
            status: 'verified',
            verifiedAt: new Date(),
            phoneNumber: msg.sender // 실제 발신 번호로 업데이트
          });

          // 유저 정보 업데이트
          const user = await User.findOne({ where: { kakaoId: session.kakaoId } });
          if (user) {
            await user.update({
              phoneNumber: msg.sender,
              phone_verified: true,
              phone_verified_at: new Date()
            });
          }
          
          return res.json({ sessionId: session.sessionId, status: 'verified', verifiedAt: session.verifiedAt });
        }
      } catch (pollErr) {
        console.error('Octomo polling failed:', pollErr.message);
      }
    }

    return res.json({ sessionId: session.sessionId, status: session.status });
  } catch (err) {
    console.error('status check error:', err.message);
    return res.status(500).json({ error: 'server error' });
  }
});

app.post('/api/phone-verification/webhook', async (req, res) => {
  // Octomo Webhook 처리
  // Payload: { "event": "message.received", "data": { "sender": "...", "content": "..." } }
  const { event, data } = req.body;

  if (event !== 'message.received' || !data) {
    return res.status(200).json({ success: true, message: 'ignored event' });
  }

  const { sender, content } = data;

  try {
    // 해당 verificationCode를 가진 대기 중인 세션 찾기
    const session = await PhoneVerificationSession.findOne({
      where: { verificationCode: content, status: 'pending' }
    });

    if (session) {
      await session.update({
        status: 'verified',
        verifiedAt: new Date(),
        phoneNumber: sender
      });

      // 유저 정보 업데이트
      const user = await User.findOne({ where: { kakaoId: session.kakaoId } });
      if (user) {
        await user.update({
          phoneNumber: sender,
          phone_verified: true,
          phone_verified_at: new Date()
        });
      }
      console.log(`✅ Webhook: Phone verified for user ${session.kakaoId} (Code: ${content})`);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(500).json({ success: false, error: 'server error' });
  }
});

// ============================================
// 래플 API
// ============================================

app.get("/api/raffles", async (req, res) => {
  try {
    const raffles = await Raffle.findAll({ order: [["createdAt", "DESC"]] });
    const stats = await getContractParticipantStats().catch(() => ({ totalParticipants: 0, byRaffleId: {} }));
    const analyticsByRaffleId = await getRaffleAnalyticsByIds(raffles.map((r) => Number(r.id)));
    const participantByRaffleId = await getParticipantMapByRaffleId(raffles.map((r) => Number(r.id)), req.query.walletAddress);

    res.json(raffles.map((r) => serializeRaffleForUser(r, stats.byRaffleId, analyticsByRaffleId, participantByRaffleId)));
  } catch (error) {
    console.error("Failed to fetch raffles:", error);
    res.status(500).json({ error: "Failed to load raffles." });
  }
});

app.get("/api/admin/raffles", async (req, res) => {
  try {
    const raffles = await Raffle.findAll({ order: [["createdAt", "DESC"]] });
    const stats = await getContractParticipantStats().catch(() => ({ totalParticipants: 0, byRaffleId: {} }));
    const analyticsByRaffleId = await getRaffleAnalyticsByIds(raffles.map((r) => Number(r.id)));
    res.json({
      success: true,
      data: raffles.map((r) => serializeRaffle(r, stats.byRaffleId, analyticsByRaffleId)),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to load raffles." });
  }
});

app.post("/api/admin/raffles", async (req, res) => {
  try {
    const payload = normalizeRafflePayload(req.body);
    if (!payload.title) return res.status(400).json({ success: false, error: "title is required." });
    if (!payload.startAt || !payload.endAt) return res.status(400).json({ success: false, error: "startAt and endAt are required." });
    if (new Date(payload.startAt) >= new Date(payload.endAt)) return res.status(400).json({ success: false, error: "endAt must be later than startAt." });

    const newRaffle = await Raffle.create({
      ...payload,
      contractAddress: CONTRACT_ADDRESS,
      provenanceHash: buildProvenanceHash(),
    });

    res.status(201).json({
      success: true,
      message: "Raffle created successfully.",
      data: serializeRaffle(newRaffle, {}),
    });
  } catch (error) {
    res.status(400).json({ success: false, error: "Failed to create raffle.", details: error.message });
  }
});

app.post("/api/admin/raffles/:id/close", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);
    if (!raffle) return res.status(404).json({ success: false, error: "Raffle not found." });

    await raffle.update({ status: "CLOSED" });
    res.json({ success: true, message: "Raffle closed.", data: raffle });
  } catch (error) {
    res.status(400).json({ success: false, error: "Failed to close raffle.", details: error.message });
  }
});

app.post("/api/admin/raffles/:id/reveal", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);
    if (!raffle) return res.status(404).json({ success: false, error: "Raffle not found." });

    const participants = await RaffleParticipant.findAll({
      where: { raffleId: Number(req.params.id) },
      order: [["joinedAt", "ASC"], ["id", "ASC"]],
    });

    if (!participants.length) return res.status(400).json({ success: false, error: "No participants to reveal." });

    const revealAssignments = buildRevealAssignments(participants, raffle);
    const revealedAt = new Date();

    await Promise.all(
      revealAssignments.map((a) =>
        RaffleParticipant.update({ result: a.result, revealedAt }, { where: { id: a.id } })
      )
    );

    await raffle.update({ status: "REVEALED" });
    res.json({
      success: true,
      message: "Raffle result revealed.",
      data: raffle,
      summary: {
        participants: participants.length,
        firstWinners: revealAssignments.filter((a) => a.result === "first").length,
        secondWinners: revealAssignments.filter((a) => a.result === "second").length,
        loseCount: revealAssignments.filter((a) => a.result === "lose").length,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: "Failed to reveal raffle.", details: error.message });
  }
});

// ============================================
// 민팅 API
// ============================================

app.post("/api/mint", ensurePhoneVerified, async (req, res) => {
  try {
    const { userAddress, raffleId } = req.body || {};
    if (!userAddress || !ethers.isAddress(userAddress)) {
      return res.status(400).json({ success: false, error: "Valid userAddress is required." });
    }

    const raffle = await Raffle.findByPk(raffleId);
    if (!raffle) return res.status(404).json({ success: false, error: "Raffle not found." });
    if (raffle.status !== "MINTING") return res.status(400).json({ success: false, error: "This raffle is not open for minting." });

    if (!writeContract) throw new Error("블록체인 쓰기 권한이 설정되지 않았습니다.");

    const tx = await writeContract.mintRaffleTicket(userAddress, raffle.id);
    const receipt = await tx.wait();

    const participantWallet = normalizeWalletAddress(userAddress);

    // ✅ (래플 단위 1회 규칙) 이미 해당 raffleId에 참여한 적이 있으면 재민팅 차단
    const existing = await RaffleParticipant.findOne({
      where: { raffleId: raffle.id, walletAddress: participantWallet },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "ALREADY_PARTICIPATED_FOR_RAFFLE",
        message: "해당 래플(raffleId)은 이미 참여했습니다.",
      });
    }

    await RaffleParticipant.create({
      raffleId: raffle.id,
      walletAddress: participantWallet,
      joinedAt: new Date(),
      result: "pending",
    });

    const stats = await getContractParticipantStats();
    res.json({
      success: true,
      txHash: receipt?.hash || tx.hash,
      raffleId: raffle.id,
      participants: stats.byRaffleId[raffle.id] || 0,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || "Mint failed." });
  }
});

app.get("/api/admin/contract-stats", async (req, res) => {
  try {
    const stats = await getContractParticipantStats();
    res.json({
      success: true,
      totalParticipants: stats.totalParticipants,
      contractAddress: CONTRACT_ADDRESS || "",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Failed to load contract stats." });
  }
});

app.get("/api/metadata/:tokenId", async (req, res) => {
  try {
    if (!readContract) {
      return res.status(503).json({ error: "Blockchain read contract is not configured." });
    }

    const tokenId = req.params.tokenId;
    const isRevealed = await readContract.isRevealed(tokenId);

    if (!isRevealed) {
      return res.json({
        name: "Nike X No-Fake Mystery Box",
        description: "Reveal will make the final raffle result visible.",
        image: "https://nofake.s3.ap-northeast-2.amazonaws.com/hidden.png",
        attributes: [{ trait_type: "Status", value: "Unrevealed" }],
      });
    }

    const filePath = path.join(__dirname, "..", "metadata", "post-reveal", `${tokenId}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Metadata file not found." });
    }

    const metadata = JSON.parse(fs.readFileSync(filePath, "utf8"));
    metadata.contract_address = CONTRACT_ADDRESS;
    return res.json(metadata);
  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }
});

// ============================================
// 마이페이지 API
// ============================================

// 🌟 [마이페이지] 종합 데이터 (모든 데이터 통합)
app.get('/api/mypage', verifyTokenMiddleware, async (req, res) => {
  try {
    const kakaoId = req.user.kakaoId;
    let userData = await User.findOne({ where: { kakaoId } });
    const currentPoints = userData ? userData.points : 55000;

    res.json({
      // 1. 사용자 기본 프로필
      profile: {
        name: userData?.name || userData?.nickname || req.user.name || "NoFake 유저",
        email: userData?.email || req.user.email,
        walletAddress: userData?.walletAddress || "0x398591b6257b8BA14Baf06728a706a5B73dd2795",
        did: userData?.did || "did:nofake:0x398591b6257b8BA14Baf06728a706a5B73dd2795",
        joinedAt: userData?.joinedAt || new Date().toISOString(),
        profileImage: null
      },

      // 2. 포인트 잔액
      points: currentPoints,
      privateBlockchain: {
        nofakePoints: currentPoints,
        lastUpdated: new Date().toISOString(),
        chain: "Private Blockchain"
      },

      // 3. 래플 응모 내역 (샘플 데이터 + 실제 연동 가능 구조)
      raffleHistory: [
        {
          id: "raffle-01",
          brand: "NIKE",
          brandColor: "#ff0000",
          name: "나이키 에어포스 1 '07 로우 사카이 하이브리드",
          image: "👟",
          applyDate: "2026.05.10",
          deadline: "2026.05.20",
          resultDate: "2026.05.22",
          participants: "1,245",
          winners: "1",
          myNumber: "N-4029",
          status: "진행중",
          txHash: "0x7a5b3c2d1e6f4a8b9c0d1e2f3a4b5c6d7e8f9a0b",
          size: "270",
          price: "159,000원",
          purchaseDeadline: null,
          nftMetadata: {
            tokenId: "1001",
            contractAddress: CONTRACT_ADDRESS,
            chain: "Ethereum Sepolia"
          }
        }
      ],

      // 4. 포인트 변동 이력
      pointHistory: [
        { id: "h-001", label: "웰컴 회원가입 보너스", date: "2026.05.10", amount: "+50,000", color: "#10b981", type: "bonus" },
        { id: "h-002", label: "출석 체크 포인트", date: "2026.05.15", amount: "+5,000", color: "#10b981", type: "attendance" }
      ],

      stats: {
        totalApply: 1,
        winCount: 0,
        winRate: "0.0",
        activeCount: 1
      }
    });
  } catch (error) {
    console.error("❌ 마이페이지 데이터 조회 오류:", error);
    res.status(500).json({ error: "마이페이지 데이터 조회 실패" });
  }
});

// 🌟 [마이페이지] 포인트 잔액 전용
app.get('/api/mypage/points', verifyTokenMiddleware, async (req, res) => {
  try {
    const kakaoId = req.user.kakaoId;
    let userData = await User.findOne({ where: { kakaoId } });
    const currentPoints = userData ? userData.points : 55000;

    res.json({
      privateBlockchain: {
        nofakePoints: currentPoints,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: "포인트 조회 실패" });
  }
});

// 🌟 [개발용] 휴대폰 인증 강제 완료 (Mock)
app.post('/api/phone-verification/mock-verify', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  try {
    const session = await PhoneVerificationSession.findByPk(sessionId);
    if (!session) return res.status(404).json({ error: 'session not found' });

    await session.update({ status: 'verified', verifiedAt: new Date() });

    if (session.phoneNumber) {
      const users = await User.findAll({ where: { phoneNumber: session.phoneNumber } });
      await Promise.all(users.map(u => u.update({ phone_verified: true, phone_verified_at: new Date() })));
    } else if (session.kakaoId) {
      const user = await User.findOne({ where: { kakaoId: session.kakaoId } });
      if (user) await user.update({ phone_verified: true, phone_verified_at: new Date() });
    }

    res.json({ success: true, message: 'Mock verification successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// Fabric Gateway 연동 (간단 클라이언트)
// ============================================

// 간단한 Fabric 클라이언트 모듈 (mock 또는 실제 연결 확장 가능)
const useFabricMock = (process.env.FABRIC_MOCK || 'true') === 'true';
const FABRIC_CONFIG_PATH = process.env.FABRIC_CONFIG_PATH || path.resolve(__dirname, '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com');
const FABRIC_USER_ID = process.env.FABRIC_USER_ID || 'User1@org1.example.com';
const FABRIC_IDENTITY_LABEL = process.env.FABRIC_IDENTITY_LABEL || 'appUser';
const FABRIC_CHANNEL = process.env.FABRIC_CHANNEL || 'nofake-channel';
const FABRIC_CHAINCODE = process.env.FABRIC_CHAINCODE || 'point-cc';

const TEST_WALLET_ADDRESS = '0x398591b6257b8BA14Baf06728a706a5B73dd2795';
const TEST_KAKAO_ID = 'test_kakao_1234';

const BRAND_KEY_MAP = {
  NOFAKE: 'nofake',
  MUSINSA: 'musinsa',
  NIKE: 'nike'
};

const normalizeBrandKey = (brand = '') => {
  if (!brand || typeof brand !== 'string') return null;
  return BRAND_KEY_MAP[brand.toUpperCase()] || null;
};

function normalizeConnectionProfile(profile) {
  if (!profile || typeof profile !== 'object') return profile;
  const patched = JSON.parse(JSON.stringify(profile));
  const fixPath = (value) => {
    if (typeof value !== 'string') return value;
    if (value.startsWith('..') || value.startsWith('./')) {
      return path.resolve(FABRIC_CONFIG_PATH, value);
    }
    return value;
  };

  if (patched.peers) {
    for (const peer of Object.values(patched.peers)) {
      if (peer.tlsCACerts?.path) peer.tlsCACerts.path = fixPath(peer.tlsCACerts.path);
    }
  }
  if (patched.certificateAuthorities) {
    for (const ca of Object.values(patched.certificateAuthorities)) {
      if (ca.tlsCACerts?.path) ca.tlsCACerts.path = fixPath(ca.tlsCACerts.path);
    }
  }
  return patched;
}

async function buildFabricWallet() {
  const wallet = await Wallets.newInMemoryWallet();
  if (await wallet.get(FABRIC_IDENTITY_LABEL)) return wallet;

  const certDir = path.join(FABRIC_CONFIG_PATH, 'users', FABRIC_USER_ID, 'msp', 'signcerts');
  const keyDir = path.join(FABRIC_CONFIG_PATH, 'users', FABRIC_USER_ID, 'msp', 'keystore');
  const certFiles = fs.existsSync(certDir)
    ? fs.readdirSync(certDir).filter((name) => name.endsWith('.pem') || name.endsWith('.crt'))
    : [];
  const keyFiles = fs.existsSync(keyDir)
    ? fs.readdirSync(keyDir).filter((name) => name.endsWith('.pem') || name.endsWith('.key') || name.endsWith('_sk'))
    : [];

  if (!certFiles.length || !keyFiles.length) {
    throw new Error(`Fabric identity files not found in ${certDir} or ${keyDir}`);
  }

  const certificate = fs.readFileSync(path.join(certDir, certFiles[0]), 'utf8');
  const privateKey = fs.readFileSync(path.join(keyDir, keyFiles[0]), 'utf8');

  await wallet.put(FABRIC_IDENTITY_LABEL, {
    credentials: {
      certificate,
      privateKey,
    },
    mspId: 'Org1MSP',
    type: 'X.509',
  });

  return wallet;
}

async function connectFabricContract() {
  const ccpPath = path.join(FABRIC_CONFIG_PATH, 'connection-org1.json');
  if (!fs.existsSync(ccpPath)) {
    throw new Error(`Fabric connection profile not found: ${ccpPath}`);
  }

  const ccp = normalizeConnectionProfile(JSON.parse(fs.readFileSync(ccpPath, 'utf8')));
  const wallet = await buildFabricWallet();
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: FABRIC_IDENTITY_LABEL,
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork(FABRIC_CHANNEL);
  console.log('Fabric network object type:', network?.constructor?.name, 'getContract:', typeof network?.getContract);
  if (typeof network?.getContract !== 'function') {
    console.error('Fabric network object does not expose getContract()', network);
    gateway.disconnect();
    throw new Error('Fabric network error: getContract unavailable');
  }
  const contract = network.getContract(FABRIC_CHAINCODE);
  return { gateway, contract };
}

async function queryBalancesFabric(walletAddress) {
  const { gateway, contract } = await connectFabricContract();
  try {
    const resultBytes = await contract.evaluateTransaction('GetBalances', walletAddress);
    return JSON.parse(resultBytes.toString());
  } finally {
    gateway.disconnect();
  }
}

async function submitSwapTransactionFabric(walletAddress, fromBrand, toBrand, amount) {
  const { gateway, contract } = await connectFabricContract();
  try {
    const tx = contract.createTransaction('SwapPoint');
    const resultBytes = await tx.submit(walletAddress, fromBrand.toUpperCase(), toBrand.toUpperCase(), String(amount));
    const result = JSON.parse(resultBytes.toString());
    return { txId: tx.getTransactionId(), result };
  } finally {
    gateway.disconnect();
  }
}

async function getOrCreatePointBalance(walletAddress) {
  const normalizedWallet = normalizeWalletAddress(walletAddress);
  if (!normalizedWallet) {
    return { walletAddress, nofake: 0, musinsa: 0, nike: 0 };
  }

  const [record] = await PointBalance.findOrCreate({
    where: { walletAddress: normalizedWallet },
    defaults: { walletAddress: normalizedWallet, nofake: 0, musinsa: 0, nike: 0 }
  });

  return {
    walletAddress: record.walletAddress,
    nofake: Number(record.nofake || 0),
    musinsa: Number(record.musinsa || 0),
    nike: Number(record.nike || 0)
  };
}

async function submitSwapTransactionMock(walletAddress, fromBrand, toBrand, amount) {
  const normalizedWallet = normalizeWalletAddress(walletAddress);
  if (!normalizedWallet) {
    throw new Error('Invalid walletAddress');
  }

  const fromKey = normalizeBrandKey(fromBrand);
  const toKey = normalizeBrandKey(toBrand);
  if (!fromKey || !toKey) {
    throw new Error('Invalid fromBrand or toBrand');
  }
  if (fromKey === toKey) {
    throw new Error('fromBrand and toBrand must differ');
  }
  const amountNumber = Number(amount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    throw new Error('Amount must be a positive integer');
  }

  const balanceRecord = await getOrCreatePointBalance(normalizedWallet);
  if (balanceRecord[fromKey] < amountNumber) {
    throw new Error('INSUFFICIENT_BALANCE: not enough balance');
  }

  const fee = fromKey === 'nofake' && (toKey === 'musinsa' || toKey === 'nike')
    ? Math.floor(amountNumber * 0.05)
    : 0;
  const finalAmount = amountNumber - fee;

  const updated = {
    nofake: balanceRecord.nofake,
    musinsa: balanceRecord.musinsa,
    nike: balanceRecord.nike
  };

  updated[fromKey] -= amountNumber;
  updated[toKey] += finalAmount;

  await PointBalance.upsert({
    walletAddress: normalizedWallet,
    nofake: updated.nofake,
    musinsa: updated.musinsa,
    nike: updated.nike
  });

  return {
    txId: `MOCK_TX_${Date.now()}`,
    result: {
      walletAddress: normalizedWallet,
      fromBrand: fromBrand.toUpperCase(),
      toBrand: toBrand.toUpperCase(),
      amount: amountNumber,
      fee,
      finalAmount
    },
    balances: updated
  };
}

async function queryBalancesMock(walletAddress) {
  return getOrCreatePointBalance(walletAddress);
}

// GET 잔액 조회 (체인코드 조회)
app.get('/api/points/balance', verifyTokenMiddleware, async (req, res) => {
  try {
    const walletAddress = req.user?.walletAddress || req.query.walletAddress;
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress required' });

    if (useFabricMock) {
      const balances = await queryBalancesMock(walletAddress);
      return res.json({ success: true, data: balances });
    }

    const balances = await queryBalancesFabric(walletAddress);
    return res.json({ success: true, data: balances });
  } catch (err) {
    console.error('/api/points/balance error:', err);
    return res.status(500).json({ error: err.message || 'server error' });
  }
});

// POST 포인트 스왑 (체인코드 SwapPoint 호출)
app.post('/api/points/swap', verifyTokenMiddleware, async (req, res) => {
  try {
    const walletAddress = req.user?.walletAddress || req.body.walletAddress;
    const { fromBrand, toBrand, amount } = req.body;
    if (!walletAddress || !fromBrand || !toBrand || !amount) return res.status(400).json({ error: 'walletAddress, fromBrand, toBrand, amount required' });

    if (useFabricMock) {
      const result = await submitSwapTransactionMock(walletAddress, fromBrand, toBrand, Number(amount));
      return res.json({ success: true, txHash: result.txId, result: result.result, data: result.balances });
    }

    const swapResponse = await submitSwapTransactionFabric(walletAddress, fromBrand, toBrand, Number(amount));
    const finalBalances = await queryBalancesFabric(walletAddress);

    return res.json({
      success: true,
      txHash: swapResponse.txId,
      result: swapResponse.result,
      data: finalBalances
    });
  } catch (err) {
    console.error('/api/points/swap error:', err);
    return res.status(500).json({ error: err.message || 'server error' });
  }
});

// ============================================
// 서버 시작
// ============================================

const ensureSchema = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log(`✅ Database synced successfully (with alter)`);
  } catch (error) {
    console.error(`❌ Database sync error:`, error);
  }
};

const ensureTestData = async () => {
  try {
    await PointBalance.upsert({
      walletAddress: TEST_WALLET_ADDRESS,
      nofake: 0,
      musinsa: 0,
      nike: 10000
    });

    await User.upsert({
      kakaoId: TEST_KAKAO_ID,
      nickname: 'Mock User',
      name: 'Mock User',
      email: 'mock@example.com',
      walletAddress: TEST_WALLET_ADDRESS,
      points: 0
    });
    console.log(`✅ Test balance initialized for wallet ${TEST_WALLET_ADDRESS}`);
  } catch (error) {
    console.error('❌ Test data initialization failed:', error);
  }
};

ensureSchema().then(async () => {
  await ensureTestData();
  app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`🚀 NOFAKE 통합 서버 가동 (Port: ${PORT})`);
    console.log(`📋 Contract: ${CONTRACT_ADDRESS || "not configured"}`);
    console.log(`==========================================`);
  });
}).catch(error => {
  console.error(`❌ Failed to start server:`, error);
  process.exit(1);
});

app.get('/api/test/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('데이터 조회 에러:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default app;
