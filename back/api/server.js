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
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

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
  phone_verified_at: { type: DataTypes.DATE }
});

const PhoneVerificationSession = sequelize.define('PhoneVerificationSession', {
  sessionId: { type: DataTypes.STRING, primaryKey: true },
  kakaoId: { type: DataTypes.STRING, allowNull: true },
  phoneNumber: { type: DataTypes.STRING, allowNull: true },
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
const client = jwksClient({
  jwksUri: process.env.JWKS_URI || ""
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey() || key?.rsaPublicKey;
    callback(null, signingKey);
  });
}

const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: '인증 토큰이 없습니다.' });

  const token = authHeader.split(' ')[1];

  if (process.env.JWKS_URI) {
    jwt.verify(token, getKey, {
      algorithms: ['RS256'],
      audience: process.env.TOKEN_AUDIENCE
    }, (err, decoded) => {
      if (err) {
        console.error("❌ 토큰 검증 실패:", err.message);
        return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
      }

      req.user = {
        walletAddress: decoded.wallets?.[0]?.address || decoded.Sub || decoded.sub,
        email: decoded.email
      };
      next();
    });
  } else {
    req.user = { walletAddress: "0x0", email: "test@test.com" };
    next();
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
    let receiverNumber = process.env.OCTOMO_DEFAULT_RECEIVER || '+821055556666';
    let expiresAt = new Date(Date.now() + (Number(process.env.OCTOMO_TTL_SECONDS || 300) * 1000));

    await PhoneVerificationSession.create({
      sessionId, kakaoId, phoneNumber, receiverNumber, status: 'pending', expiresAt
    });

    return res.status(201).json({
      sessionId, receiverNumber, expiresAt: expiresAt.toISOString(), pollIntervalSeconds: 4
    });
  } catch (err) {
    console.error('phone verification start error:', err.message);
    return res.status(500).json({ success: false, error: 'server error' });
  }
});

app.get('/api/phone-verification/status', async (req, res) => {
  const sessionId = String(req.query.sessionId || '').trim();
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const session = await PhoneVerificationSession.findByPk(sessionId);
  if (!session) return res.status(404).json({ error: 'session not found' });

  return res.json({ sessionId: session.sessionId, status: session.status, txId: session.txId, verifiedAt: session.verifiedAt });
});

app.post('/api/phone-verification/webhook', async (req, res) => {
  const signatureHeader = String(req.headers['x-octomo-signature'] || req.headers['x-hub-signature'] || '');
  const secret = process.env.OCTOMO_WEBHOOK_SECRET || '';
  const rawBody = req.rawBody;

  if (secret && !rawBody) {
    return res.status(400).json({ success: false, error: 'raw body required for signature verification' });
  }

  if (secret && rawBody) {
    try {
      let sig = signatureHeader.replace(/^sha256=/i, '').trim();
      if (!sig) return res.status(401).json({ success: false, error: 'missing signature' });
      const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
      const a = Buffer.from(expected, 'hex');
      const b = Buffer.from(sig, 'hex');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return res.status(401).json({ success: false, error: 'invalid signature' });
      }
    } catch (err) {
      return res.status(401).json({ success: false, error: 'invalid signature' });
    }
  }

  let payload = null;
  try {
    if (rawBody) payload = JSON.parse(rawBody.toString('utf8'));
    else payload = req.body || {};
  } catch (err) {
    return res.status(400).json({ success: false, error: 'invalid json' });
  }

  const sessionId = String(payload.sessionId || '') || null;
  const phoneNumber = String(payload.phoneNumber || '').trim();
  const status = String(payload.status || '').toLowerCase();

  if (!phoneNumber && !sessionId) return res.status(400).json({ success: false, error: 'phoneNumber or sessionId required' });

  try {
    if (sessionId) {
      const session = await PhoneVerificationSession.findByPk(sessionId);
      if (session) {
        await session.update({
          status: status || session.status,
          verifiedAt: status === 'verified' ? new Date() : session.verifiedAt
        });
      }
    }

    if (phoneNumber && status === 'verified') {
      const users = await User.findAll({ where: { phoneNumber } });
      if (users && users.length > 0) {
        await Promise.all(users.map((u) => u.update({ phone_verified: true, phone_verified_at: new Date() })));
      }
    }

    return res.json({ success: true });
  } catch (err) {
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

    await RaffleParticipant.upsert({
      raffleId: raffle.id,
      walletAddress: normalizeWalletAddress(userAddress),
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
// 서버 시작
// ============================================

const ensureSchema = async () => {
  try {
    await sequelize.sync();
    console.log(`✅ Database synced successfully`);
  } catch (error) {
    console.error(`❌ Database sync error:`, error);
  }
};

ensureSchema().then(() => {
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

export default app;
