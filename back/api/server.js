import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
<<<<<<< HEAD
import axios from "axios";
import { Sequelize, DataTypes, Op } from "sequelize";
import crypto from "crypto";
=======
import { Sequelize, DataTypes, Op } from "sequelize";
import crypto from "crypto";
import axios from "axios"; // 에러 처리가 용이한 axios 권장
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

dotenv.config();
>>>>>>> efe679237a7bae3609e48e671cf299ca2859dc0e

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

<<<<<<< HEAD
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

const PORT = Number(process.env.PORT || 3002);
=======
const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // 프론트엔드 포트 명시
  credentials: true                // 인증 정보 허용
}));
app.use(express.json());

// --- 환경 변수 설정 (도커 3001:3002 매핑 기준) ---
const PORT = process.env.PORT || 3002;
>>>>>>> efe679237a7bae3609e48e671cf299ca2859dc0e
const RPC_URL = process.env.RPC_URL || "";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || process.env.PRIVATE_KEY || "";
const DB_STORAGE_PATH = process.env.DB_STORAGE_PATH || path.join(__dirname, "database.sqlite");

<<<<<<< HEAD
fs.mkdirSync(path.dirname(DB_STORAGE_PATH), { recursive: true });

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: DB_STORAGE_PATH,
  logging: false,
});

=======
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

>>>>>>> efe679237a7bae3609e48e671cf299ca2859dc0e
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
<<<<<<< HEAD

const RaffleSession = sequelize.define(
  "RaffleSession",
  {
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
  },
  {
    indexes: [{ unique: true, fields: ["raffleId", "sessionId"] }],
  }
);

const RaffleParticipant = sequelize.define(
  "RaffleParticipant",
  {
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
  },
  {
    indexes: [{ unique: true, fields: ["raffleId", "walletAddress"] }],
  }
);

// Users table to record Kakao-linked accounts and phone verification status
const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  kakaoId: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  phone_number: { type: DataTypes.STRING, allowNull: true },
  phone_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  phone_verified_at: { type: DataTypes.DATE, allowNull: true },
});

// Phone verification sessions - short-lived Octomo sessions
const PhoneVerificationSession = sequelize.define('PhoneVerificationSession', {
  sessionId: { type: DataTypes.STRING, primaryKey: true },
  kakaoId: { type: DataTypes.STRING, allowNull: true },
  phoneNumber: { type: DataTypes.STRING, allowNull: true },
  receiverNumber: { type: DataTypes.STRING, allowNull: true },
  txId: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('pending','verified','failed','expired'), allowNull: false, defaultValue: 'pending' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  expiresAt: { type: DataTypes.DATE, allowNull: true },
  verifiedAt: { type: DataTypes.DATE, allowNull: true },
  meta: { type: DataTypes.JSON, allowNull: true }
});



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

=======
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
>>>>>>> efe679237a7bae3609e48e671cf299ca2859dc0e
const abiPath = path.join(__dirname, "abi.json");
const rawAbi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const contractABI = Array.isArray(rawAbi) ? rawAbi : rawAbi.abi;

const provider = RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;
<<<<<<< HEAD
const readContract =
  provider && CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider) : null;
const signer =
  provider && OWNER_PRIVATE_KEY ? new ethers.Wallet(OWNER_PRIVATE_KEY, provider) : null;
const writeContract =
  signer && CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer) : null;

const buildProvenanceHash = () => {
  const metadataDir = path.join(__dirname, "metadata", "post-reveal");

  if (!fs.existsSync(metadataDir)) {
    throw new Error("post-reveal metadata directory not found.");
  }

  const files = fs
    .readdirSync(metadataDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    throw new Error("No post-reveal metadata files found.");
  }

  const combinedHashes = files
    .map((file) => {
      const fileData = fs.readFileSync(path.join(metadataDir, file));
      return crypto.createHash("sha256").update(fileData).digest("hex");
    })
    .join("");

  return crypto.createHash("sha256").update(combinedHashes).digest("hex");
};

const ensureReadContract = () => {
  if (!readContract) {
    throw new Error("Blockchain read contract is not configured. Check RPC_URL and CONTRACT_ADDRESS.");
  }

  return readContract;
};

const ensureWriteContract = () => {
  if (!writeContract) {
    throw new Error("Blockchain write wallet is not configured. Set OWNER_PRIVATE_KEY in back/api/.env.");
  }

  return writeContract;
};

const normalizeWalletAddress = (value = "") => {
  const rawAddress = String(value || "").trim();
  if (!rawAddress || !ethers.isAddress(rawAddress)) {
    return "";
  }

  return ethers.getAddress(rawAddress);
};

const getContractParticipantStats = async () => {
  const contract = ensureReadContract();
  const totalSupply = Number(await contract.totalSupply());
  const byRaffleId = {};

  if (totalSupply === 0) {
    return { totalParticipants: 0, byRaffleId };
  }

  const raffleIds = await Promise.all(
    Array.from({ length: totalSupply }, (_, index) => contract.tokenToRaffleId(index + 1))
  );

  raffleIds.forEach((raffleIdValue) => {
    const raffleId = Number(raffleIdValue);
    byRaffleId[raffleId] = (byRaffleId[raffleId] || 0) + 1;
  });

  return {
    totalParticipants: totalSupply,
    byRaffleId,
  };
};

const buildAnalyticsByRaffleId = (sessions = []) => {
  const analyticsMap = {};

  sessions.forEach((session) => {
    const plain = session.toJSON ? session.toJSON() : session;
    const raffleId = Number(plain.raffleId);

    if (!analyticsMap[raffleId]) {
      analyticsMap[raffleId] = {
        startedCount: 0,
        completedCount: 0,
        totalDurationSeconds: 0,
      };
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

      return [
        raffleId,
        {
          views: startedCount,
          completions: completedCount,
          dropouts: dropoutCount,
          conversionRate,
          dropoutRate,
          avgEntryMinutes,
        },
      ];
    })
  );
};

const getRaffleAnalyticsByIds = async (raffleIds = []) => {
  if (raffleIds.length === 0) {
    return {};
  }

  const sessions = await RaffleSession.findAll({
    where: {
      raffleId: {
        [Op.in]: raffleIds,
      },
    },
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

const serializeRaffleForUser = (
  raffle,
  participantStats = {},
  analyticsByRaffleId = {},
  participantByRaffleId = {}
) => {
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
  if (!raffleIds.length || !normalizedWallet) {
    return {};
  }

  const participants = await RaffleParticipant.findAll({
    where: {
      raffleId: {
        [Op.in]: raffleIds,
      },
      walletAddress: normalizedWallet,
    },
  });

  return Object.fromEntries(
    participants.map((participant) => {
      const plain = participant.toJSON ? participant.toJSON() : participant;
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
    const leftSeed = crypto
      .createHash("sha256")
      .update(`${seedBase}:${left.walletAddress}:${left.joinedAt}:${left.id}`)
      .digest("hex");
    const rightSeed = crypto
      .createHash("sha256")
      .update(`${seedBase}:${right.walletAddress}:${right.joinedAt}:${right.id}`)
      .digest("hex");

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

    return {
      id: participant.id,
      result,
    };
  });
};

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NOFAKE API server is running.",
    endpoints: [
      "/health",
      "/api/raffles",
      "/api/mint",
      "/api/admin/raffles",
      "/api/admin/contract-stats",
      "/api/metadata/:tokenId",
    ],
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
app.post("/api/auth/kakao", async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code) return res.status(400).json({ error: "인가 코드가 없습니다." });

  try {
    // Step 1: 카카오 토큰 교환
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

    // Step 2: 카카오 유저 정보 조회
    const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const kakaoAccount = userResponse.data.kakao_account ?? {};
    const profile = kakaoAccount.profile ?? {};

    const name = profile.nickname ?? "사용자";
    const email = kakaoAccount.email ?? "";
    const kakaoId = String(userResponse.data.id || userResponse.data?.id || "");

    // Upsert into local Users table (only to track phone verification status)
    try {
      const [user, created] = await User.findOrCreate({
        where: { kakaoId },
        defaults: { name, email },
      });

      if (!created) {
        // keep name/email reasonably up-to-date
        await user.update({ name: name || user.name, email: email || user.email });
      }

      // Step 3: 프론트가 필요한 형태로 반환
      res.json({
        success: true,
        accessToken: access_token,
        name,
        email,
        phone_verified: Boolean(user.phone_verified),
        phone_number: user.phone_number || null,
      });
    } catch (dbErr) {
      console.error('User upsert failed:', dbErr.message);
      // still return Kakao tokens so frontend can proceed; phone_verified will be false by default
      res.json({ success: true, accessToken: access_token, name, email, phone_verified: false });
    }
  } catch (error) {
    console.error("카카오 로그인 실패:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "카카오 통신 중 오류 발생" });
  }
});

// Attach/Update phone number for current Kakao user (requires Kakao access token in Authorization header)
app.post('/api/user/phone', async (req, res) => {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return res.status(401).json({ success: false, error: '카카오 토큰이 필요합니다.' });

  try {
    const userResp = await axios.get('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${token}` } });
    const kakaoId = String(userResp.data.id || userResp.data?.id || '');
    if (!kakaoId) return res.status(400).json({ success: false, error: '카카오 사용자 정보를 확인할 수 없습니다.' });

    const phoneNumber = String(req.body.phoneNumber || '').trim();
    if (!phoneNumber) return res.status(400).json({ success: false, error: 'phoneNumber is required' });

    const user = await User.findOne({ where: { kakaoId } });
    if (!user) return res.status(404).json({ success: false, error: 'user not found' });

    await user.update({ phone_number: phoneNumber, phone_verified: false, phone_verified_at: null });

    // also create a pending PhoneVerificationSession to track state (created by user)
    const sessionId = `pv-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const receiverNumber = process.env.OCTOMO_DEFAULT_RECEIVER || '+821055556666';
    const expiresAt = new Date(Date.now() + (Number(process.env.OCTOMO_TTL_SECONDS || 300) * 1000));

    await PhoneVerificationSession.create({ sessionId, kakaoId, phoneNumber, receiverNumber, status: 'pending', expiresAt, meta: { createdBy: 'user_attach' } });

    return res.json({ success: true, phone_number: phoneNumber, sessionId, receiverNumber, expiresAt: expiresAt.toISOString() });
  } catch (err) {
    console.error('/api/user/phone error:', err.message);
    return res.status(500).json({ success: false, error: 'server error' });
  }
});

// Start Octomo verification session (creates session and returns receiverNumber)
app.post('/api/phone-verification/start', async (req, res) => {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return res.status(401).json({ success: false, error: '카카오 토큰이 필요합니다.' });

  try {
    const userResp = await axios.get('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${token}` } });
    const kakaoId = String(userResp.data.id || userResp.data?.id || '');
    if (!kakaoId) return res.status(400).json({ success: false, error: '카카오 사용자 정보를 확인할 수 없습니다.' });

    const phoneNumber = String(req.body.phoneNumber || '').trim() || null;

    // create session (call Octomo if configured)
    let sessionId = `pv-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    let receiverNumber = process.env.OCTOMO_DEFAULT_RECEIVER || '+821055556666';
    let txId = null;
    let expiresAt = new Date(Date.now() + (Number(process.env.OCTOMO_TTL_SECONDS || 300) * 1000));

    if (process.env.OCTOMO_API_URL) {
      try {
        const r = await axios.post(process.env.OCTOMO_API_URL.replace(/\/$/, '') + '/sessions', { phoneNumber }, { headers: { Authorization: `Bearer ${process.env.OCTOMO_API_KEY || ''}` }, timeout: 5000 });
        const d = r.data || {};
        sessionId = d.sessionId || d.id || sessionId;
        receiverNumber = d.receiverNumber || d.receiver_number || receiverNumber;
        txId = d.txId || d.tx_id || txId;
        if (d.expiresAt) expiresAt = new Date(d.expiresAt);
      } catch (err) {
        console.error('Octomo create session failed:', err.response?.data || err.message);
      }
    }

    await PhoneVerificationSession.create({ sessionId, kakaoId, phoneNumber, receiverNumber, txId, status: 'pending', expiresAt });

    return res.status(201).json({ sessionId, receiverNumber, expiresAt: expiresAt.toISOString(), pollIntervalSeconds: 4 });
  } catch (err) {
    console.error('phone verification start error:', err.message);
    return res.status(500).json({ success: false, error: 'server error' });
  }
});

// Polling status endpoint
app.get('/api/phone-verification/status', async (req, res) => {
  const sessionId = String(req.query.sessionId || '').trim();
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const session = await PhoneVerificationSession.findByPk(sessionId);
  if (!session) return res.status(404).json({ error: 'session not found' });

  return res.json({ sessionId: session.sessionId, status: session.status, txId: session.txId, verifiedAt: session.verifiedAt });
});

// Webhook to mark phone_verified when Octomo notifies verification (expects { sessionId, phoneNumber, status, txId })
app.post('/api/phone-verification/webhook', async (req, res) => {
  // Use captured rawBody (from express.json verify) if available for HMAC verification
  const signatureHeader = String(req.headers['x-octomo-signature'] || req.headers['x-hub-signature'] || '');
  const secret = process.env.OCTOMO_WEBHOOK_SECRET || '';
  const rawBody = req.rawBody || (req.body && Object.keys(req.body).length ? Buffer.from(JSON.stringify(req.body)) : null);

  if (secret) {
    if (!rawBody) {
      console.warn('No raw body available for HMAC verification');
      return res.status(400).json({ success: false, error: 'raw body required for signature verification' });
    }

    try {
      let sig = signatureHeader.replace(/^sha256=/i, '').trim();
      if (!sig) return res.status(401).json({ success: false, error: 'missing signature' });
      const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
      const a = Buffer.from(expected, 'hex');
      const b = Buffer.from(sig, 'hex');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        console.warn('Webhook signature mismatch');
        return res.status(401).json({ success: false, error: 'invalid signature' });
      }
    } catch (err) {
      console.error('Webhook HMAC verify error:', err.message);
      return res.status(401).json({ success: false, error: 'invalid signature' });
    }
  }

  // parse payload (prefer rawBody to preserve exact content)
  let payload = null;
  try {
    if (rawBody) payload = JSON.parse(rawBody.toString('utf8'));
    else payload = req.body || {};
  } catch (err) {
    console.error('Invalid webhook JSON:', err.message);
    return res.status(400).json({ success: false, error: 'invalid json' });
  }

  const sessionId = String(payload.sessionId || '') || null;
  const phoneNumber = String(payload.phoneNumber || payload.receiverNumber || '').trim();
  const status = String(payload.status || '').toLowerCase();
  const txId = payload.txId || payload.tx_id || null;

  if (!phoneNumber && !sessionId) return res.status(400).json({ success: false, error: 'phoneNumber or sessionId required' });

  try {
    // update session if exists
    if (sessionId) {
      const session = await PhoneVerificationSession.findByPk(sessionId);
      if (session) {
        await session.update({ status: status || session.status, txId: txId || session.txId, verifiedAt: status === 'verified' ? new Date() : session.verifiedAt, meta: { ...(session.meta||{}), webhook: payload } });
      }
    }

    // update users by phoneNumber
    if (phoneNumber) {
      const users = await User.findAll({ where: { phone_number: phoneNumber } });
      if (!users || users.length === 0) return res.status(404).json({ success: false, error: 'no users for phone' });

      if (status === 'verified') {
        await Promise.all(users.map((u) => u.update({ phone_verified: true, phone_verified_at: new Date() })));
        return res.json({ success: true });
      }

      await Promise.all(users.map((u) => u.update({ phone_verified: false })));
      return res.json({ success: true });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('phone verification webhook error:', err.message);
    return res.status(500).json({ success: false, error: 'server error' });
  }
});

app.get("/api/auth/me", async (req, res) => {
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
    // 토큰 만료 or 유효하지 않음
    res.status(401).json({ success: false, error: "유효하지 않은 토큰입니다." });
  }
});

app.get("/api/admin/contract-stats", async (req, res) => {
  try {
    const stats = await getContractParticipantStats();
    const contractAddress = CONTRACT_ADDRESS || "";
    const networkName = process.env.NETWORK_NAME || "Ethereum Sepolia";
    const etherscanBaseUrl = process.env.ETHERSCAN_BASE_URL || "https://sepolia.etherscan.io/address";

    res.json({
      success: true,
      totalParticipants: stats.totalParticipants,
      contractAddress,
      networkName,
      etherscanUrl: contractAddress ? `${etherscanBaseUrl}/${contractAddress}` : etherscanBaseUrl,
    });
  } catch (error) {
    console.error("Failed to load contract stats:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to load contract stats." });
  }
});

app.get("/api/raffles", async (req, res) => {
  try {
    const raffles = await Raffle.findAll({ order: [["createdAt", "DESC"]] });
    const stats = await getContractParticipantStats().catch(() => ({ totalParticipants: 0, byRaffleId: {} }));
    const analyticsByRaffleId = await getRaffleAnalyticsByIds(raffles.map((raffle) => Number(raffle.id)));
    const participantByRaffleId = await getParticipantMapByRaffleId(
      raffles.map((raffle) => Number(raffle.id)),
      req.query.walletAddress
    );

    res.json(
      raffles.map((raffle) =>
        serializeRaffleForUser(raffle, stats.byRaffleId, analyticsByRaffleId, participantByRaffleId)
      )
    );
  } catch (error) {
    console.error("Failed to fetch raffles:", error);
=======
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
>>>>>>> efe679237a7bae3609e48e671cf299ca2859dc0e
    res.status(500).json({ error: "Failed to load raffles." });
  }
});

<<<<<<< HEAD
app.get("/api/admin/raffles", async (req, res) => {
  try {
    const raffles = await Raffle.findAll({ order: [["createdAt", "DESC"]] });
    const stats = await getContractParticipantStats().catch(() => ({ totalParticipants: 0, byRaffleId: {} }));
    const analyticsByRaffleId = await getRaffleAnalyticsByIds(raffles.map((raffle) => Number(raffle.id)));
    res.json({
      success: true,
      data: raffles.map((raffle) => serializeRaffle(raffle, stats.byRaffleId, analyticsByRaffleId)),
    });
  } catch (error) {
    console.error("Failed to load admin raffles:", error);
    res.status(500).json({ success: false, error: "Failed to load raffles." });
  }
});

app.get("/api/admin/raffles/:id", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    const stats = await getContractParticipantStats().catch(() => ({ totalParticipants: 0, byRaffleId: {} }));
    const analyticsByRaffleId = await getRaffleAnalyticsByIds([Number(req.params.id)]);
    res.json({ success: true, data: serializeRaffle(raffle, stats.byRaffleId, analyticsByRaffleId) });
  } catch (error) {
    console.error("Failed to load raffle detail:", error);
    res.status(500).json({ success: false, error: "Failed to load raffle detail." });
  }
});

app.post("/api/analytics/raffles/:id/session/start", async (req, res) => {
  try {
    const raffleId = Number(req.params.id);
    const sessionId = String(req.body?.sessionId || "").trim();
    const startedAt = req.body?.startedAt ? new Date(req.body.startedAt) : new Date();

    if (!raffleId || !sessionId) {
      return res.status(400).json({ success: false, error: "raffleId and sessionId are required." });
    }

    const raffle = await Raffle.findByPk(raffleId);
    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    await RaffleSession.upsert({
      raffleId,
      sessionId,
      startedAt,
      status: "STARTED",
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to start raffle session:", error);
    res.status(400).json({ success: false, error: "Failed to start raffle session." });
  }
});

app.post("/api/analytics/raffles/:id/session/complete", async (req, res) => {
  try {
    const raffleId = Number(req.params.id);
    const sessionId = String(req.body?.sessionId || "").trim();
    const startedAt = req.body?.startedAt ? new Date(req.body.startedAt) : new Date();
    const completedAt = req.body?.completedAt ? new Date(req.body.completedAt) : new Date();
    const durationSeconds = Math.max(Number(req.body?.durationSeconds || 0), 0);

    if (!raffleId || !sessionId) {
      return res.status(400).json({ success: false, error: "raffleId and sessionId are required." });
    }

    const raffle = await Raffle.findByPk(raffleId);
    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    await RaffleSession.upsert({
      raffleId,
      sessionId,
      startedAt,
      completedAt,
      durationSeconds,
      status: "COMPLETED",
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to complete raffle session:", error);
    res.status(400).json({ success: false, error: "Failed to complete raffle session." });
  }
});

app.post("/api/admin/raffles", async (req, res) => {
  try {
    const payload = normalizeRafflePayload(req.body);

    if (!payload.title) {
      return res.status(400).json({ success: false, error: "title is required." });
    }

    if (!payload.startAt || !payload.endAt) {
      return res.status(400).json({ success: false, error: "startAt and endAt are required." });
    }

    if (new Date(payload.startAt) >= new Date(payload.endAt)) {
      return res.status(400).json({ success: false, error: "endAt must be later than startAt." });
    }

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
    console.error("Failed to create raffle:", error);
    res.status(400).json({ success: false, error: "Failed to create raffle.", details: error.message });
  }
});

app.patch("/api/admin/raffles/:id/config", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    const startAt = req.body.startAt || raffle.startAt;
    const endAt = req.body.endAt || raffle.endAt;
    const firstPrizeCount =
      Number(req.body.firstPrizeCount ?? req.body.firstPrize ?? raffle.firstPrizeCount ?? 0) || 0;
    const secondPrizeCount =
      Number(req.body.secondPrizeCount ?? req.body.secondPrize ?? raffle.secondPrizeCount ?? 0) || 0;

    if (!startAt || !endAt) {
      return res.status(400).json({ success: false, error: "startAt and endAt are required." });
    }

    if (new Date(startAt) >= new Date(endAt)) {
      return res.status(400).json({ success: false, error: "endAt must be later than startAt." });
    }

    await raffle.update({
      startAt,
      endAt,
      firstPrizeCount,
      secondPrizeCount,
      status: "MINTING",
    });

    res.json({ success: true, message: "Raffle configuration updated.", data: raffle });
  } catch (error) {
    console.error("Failed to update raffle config:", error);
    res.status(400).json({ success: false, error: "Failed to update raffle config.", details: error.message });
  }
});

app.post("/api/admin/raffles/:id/close", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    await raffle.update({ status: "CLOSED" });
    res.json({ success: true, message: "Raffle closed.", data: raffle });
  } catch (error) {
    console.error("Failed to close raffle:", error);
    res.status(400).json({ success: false, error: "Failed to close raffle.", details: error.message });
  }
});

app.post("/api/admin/raffles/:id/reveal", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    const participants = await RaffleParticipant.findAll({
      where: { raffleId: Number(req.params.id) },
      order: [["joinedAt", "ASC"], ["id", "ASC"]],
    });

    if (!participants.length) {
      return res.status(400).json({ success: false, error: "No participants to reveal." });
    }

    const revealAssignments = buildRevealAssignments(participants, raffle);
    const revealedAt = new Date();

    await Promise.all(
      revealAssignments.map((assignment) =>
        RaffleParticipant.update(
          {
            result: assignment.result,
            revealedAt,
          },
          { where: { id: assignment.id } }
        )
      )
    );

    await raffle.update({ status: "REVEALED" });
    res.json({
      success: true,
      message: "Raffle result revealed.",
      data: raffle,
      summary: {
        participants: participants.length,
        firstWinners: revealAssignments.filter((assignment) => assignment.result === "first").length,
        secondWinners: revealAssignments.filter((assignment) => assignment.result === "second").length,
        loseCount: revealAssignments.filter((assignment) => assignment.result === "lose").length,
      },
    });
  } catch (error) {
    console.error("Failed to reveal raffle:", error);
    res.status(400).json({ success: false, error: "Failed to reveal raffle.", details: error.message });
  }
});

app.delete("/api/admin/raffles/:id", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    await raffle.destroy();
    res.json({ success: true, message: "Raffle deleted." });
  } catch (error) {
    console.error("Failed to delete raffle:", error);
    res.status(400).json({ success: false, error: "Failed to delete raffle.", details: error.message });
  }
});

// Middleware: ensure Kakao access token belongs to a user who completed phone verification
async function ensurePhoneVerified(req, res, next) {
  try {
    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) return res.status(401).json({ success: false, error: '카카오 토큰이 필요합니다.' });

    // Validate token with Kakao and get kakaoId
    const resp = await axios.get('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${token}` } });
    const kakaoId = String(resp.data.id || resp.data?.id || '');
    if (!kakaoId) return res.status(401).json({ success: false, error: '유효하지 않은 카카오 토큰입니다.' });

    const user = await User.findOne({ where: { kakaoId } });
    if (!user) return res.status(403).json({ success: false, error: 'USER_NOT_FOUND', message: '추가 인증이 필요합니다.' });

    if (!user.phone_verified) {
      return res.status(403).json({ success: false, error: 'PHONE_NOT_VERIFIED', message: '휴대폰 인증이 필요합니다.' });
    }

    // attach user to request for downstream handlers
    req.loginUser = user;
    next();
  } catch (err) {
    console.error('ensurePhoneVerified error:', err.message);
    return res.status(401).json({ success: false, error: '토큰 검증 실패' });
  }
}

app.post("/api/mint", ensurePhoneVerified, async (req, res) => {
  try {
    const { userAddress, raffleId } = req.body || {};

    if (!userAddress || !ethers.isAddress(userAddress)) {
      return res.status(400).json({ success: false, error: "Valid userAddress is required." });
    }

    const raffle = await Raffle.findByPk(raffleId);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    if (raffle.status !== "MINTING") {
      return res.status(400).json({ success: false, error: "This raffle is not open for minting." });
    }

    if (raffle.startAt && new Date() < new Date(raffle.startAt)) {
      return res.status(400).json({ success: false, error: "This raffle has not started yet." });
    }

    if (raffle.endAt && new Date() > new Date(raffle.endAt)) {
      return res.status(400).json({ success: false, error: "This raffle is already closed." });
    }

    const contract = ensureWriteContract();
    const tx = await contract.mintRaffleTicket(userAddress, raffle.id);
    const receipt = await tx.wait();

    await RaffleParticipant.upsert({
      raffleId: raffle.id,
      walletAddress: normalizeWalletAddress(userAddress),
      joinedAt: new Date(),
      result: "pending",
      revealedAt: null,
    });

    const stats = await getContractParticipantStats();
    const participantCount = stats.byRaffleId[raffle.id] || 0;

    res.json({
      success: true,
      txHash: receipt?.hash || tx.hash,
      raffleId: raffle.id,
      participants: participantCount,
      totalParticipants: stats.totalParticipants,
    });
  } catch (error) {
    console.error("Mint request failed:", error);
    res.status(400).json({
      success: false,
      error: error.shortMessage || error.message || "Mint failed.",
    });
  }
});

app.get("/api/metadata/:tokenId", async (req, res) => {
  try {
    const contract = ensureReadContract();
    const tokenId = req.params.tokenId;
    const raffleId = await contract.tokenToRaffleId(tokenId);
    const isRevealed = await contract.isRevealed(raffleId);

    if (!isRevealed) {
      return res.json({
        name: "Nike X No-Fake Mystery Box",
        description: "Reveal will make the final raffle result visible.",
        image: "https://nofake.s3.ap-northeast-2.amazonaws.com/hidden.png",
        attributes: [{ trait_type: "Status", value: "Unrevealed" }],
      });
    }

    const filePath = path.join(__dirname, "metadata", "post-reveal", `${tokenId}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Metadata file not found." });
    }

    const metadata = JSON.parse(fs.readFileSync(filePath, "utf8"));
    metadata.contract_address = CONTRACT_ADDRESS;
    metadata.external_url = `http://15.164.104.0:${PORT}/api/metadata/${tokenId}`;

    return res.json(metadata);
  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }
});

const ensureSchema = async () => {
  await sequelize.sync();

  const queryInterface = sequelize.getQueryInterface();
  const raffleTable = await queryInterface.describeTable("Raffles");

  if (!raffleTable.description) {
    await queryInterface.addColumn("Raffles", "description", {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  }

  await RaffleSession.sync();
};

ensureSchema().then(() => {
  console.log(`DB synced (Contract: ${CONTRACT_ADDRESS || "not configured"})`);
  app.listen(PORT, () => {
    console.log(`NOFAKE Server running on http://localhost:${PORT}`);
  });
=======
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
>>>>>>> efe679237a7bae3609e48e671cf299ca2859dc0e
});
