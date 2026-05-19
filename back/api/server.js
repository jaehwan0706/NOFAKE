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

// ============================================
// 초기 설정 및 환경 변수
// ============================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();

// [CORS 보안 설정 - ngrok 대응]
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'Accept']
}));
app.options('*', cors()); 

app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

const PORT = process.env.PORT || 3002;
const DB_STORAGE_PATH = process.env.DB_STORAGE_PATH || path.join(__dirname, "..", "database.sqlite");

// ============================================
// 데이터베이스 설정 및 모든 모델 통합
// ============================================
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: DB_STORAGE_PATH,
  logging: false
});

const Raffle = sequelize.define("Raffle", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM("READY", "MINTING", "CLOSED", "REVEALED"), defaultValue: "MINTING" },
  points: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const User = sequelize.define("User", {
  kakaoId: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  phoneNumber: { type: DataTypes.STRING },
  phone_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  points: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const PhoneVerificationSession = sequelize.define('PhoneVerificationSession', {
  sessionId: { type: DataTypes.STRING, primaryKey: true },
  kakaoId: { type: DataTypes.STRING },
  verificationCode: { type: DataTypes.STRING },
  receiverNumber: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending', 'verified', 'failed', 'expired'), defaultValue: 'pending' },
  expiresAt: { type: DataTypes.DATE }
});

// DB 동기화 (기능 복구를 위해 alter: true 필수)
await sequelize.sync({ alter: true });
console.log("✅ Database synced with all models");

// ============================================
// 인증 미들웨어 (OIDC & Kakao 통합)
// ============================================
const verifyTokenMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: '인증 토큰이 없습니다.' });
  const token = authHeader.split(' ')[1];

  try {
    // OIDC 검증 시도
    if (process.env.JWKS_URI) {
      try {
        const jwksResponse = await axios.get(process.env.JWKS_URI);
        const keys = jwksResponse.data?.keys || [];
        const decodedHeader = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString('utf8'));
        const jwk = keys.find((k) => k.kid === decodedHeader.kid);
        if (jwk) {
          const verificationKey = await importJWK(jwk, jwk.alg || 'RS256');
          const { payload } = await jwtVerify(token, verificationKey, {
            audience: process.env.TOKEN_AUDIENCE,
            issuer: process.env.TOKEN_ISSUER
          });
          const kakaoId = String(payload.sub || payload.Sub || '');
          const [user] = await User.findOrCreate({ where: { kakaoId }, defaults: { name: payload.name || "사용자", email: payload.email || "" } });
          req.user = { kakaoId: user.kakaoId, name: user.name, email: user.email, phone_verified: user.phone_verified };
          return next();
        }
      } catch (e) {}
    }

    // Kakao Access Token 검증
    const resp = await axios.get('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${token}` } });
    const kakaoId = String(resp.data.id || '');
    const [user] = await User.findOrCreate({ where: { kakaoId }, defaults: { name: resp.data.kakao_account?.profile?.nickname || "사용자", email: resp.data.kakao_account?.email || "" } });
    req.user = { kakaoId: user.kakaoId, name: user.name, email: user.email, phone_verified: user.phone_verified };
    next();
  } catch (err) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

async function ensurePhoneVerified(req, res, next) {
  const user = await User.findByPk(req.user?.kakaoId);
  if (user && user.phone_verified) {
    req.loginUser = user;
    return next();
  }
  res.status(403).json({ error: 'PHONE_NOT_VERIFIED' });
}

// ============================================
// API 엔드포인트 - /api 경로 대응
// ============================================

const apiRouter = express.Router();

// [인증 시작]
apiRouter.post('/phone-verification/start', verifyTokenMiddleware, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const kakaoId = req.user.kakaoId;
    const sessionId = `pv-${Date.now()}`;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 300000);

    await PhoneVerificationSession.create({ sessionId, kakaoId, verificationCode, receiverNumber: '1666-3538', status: 'pending', expiresAt });
    const user = await User.findByPk(kakaoId);
    if (user) await user.update({ phoneNumber });

    res.status(201).json({ sessionId, receiverNumber: '1666-3538', verificationCode, expiresAt, pollIntervalSeconds: 4 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [인증 상태 확인]
apiRouter.get('/phone-verification/status', async (req, res) => {
  const { sessionId } = req.query;
  const session = await PhoneVerificationSession.findByPk(sessionId);
  if (!session) return res.status(404).json({ error: 'not found' });

  if (session.status === 'pending' && process.env.OCTOMO_API_KEY) {
    const octomoResp = await axios.get(`https://api.octomo.octoverse.kr/v1/messages`, {
      params: { content: session.verificationCode },
      headers: { 'x-api-key': process.env.OCTOMO_API_KEY }
    });
    if (octomoResp.data?.data?.length > 0) {
      await session.update({ status: 'verified' });
      const user = await User.findByPk(session.kakaoId);
      if (user) await user.update({ phone_verified: true });
      return res.json({ status: 'verified' });
    }
  }
  res.json({ status: session.status });
});

apiRouter.get('/auth/me', verifyTokenMiddleware, (req, res) => {
  res.json({ success: true, ...req.user });
});

apiRouter.get('/mypage', verifyTokenMiddleware, ensurePhoneVerified, (req, res) => {
  res.json({ profile: req.loginUser, points: req.loginUser.points });
});

// Mock Verify (Debug)
apiRouter.post('/phone-verification/mock-verify', async (req, res) => {
  const { sessionId } = req.body;
  const session = await PhoneVerificationSession.findByPk(sessionId);
  if (session) {
    await session.update({ status: 'verified' });
    const user = await User.findByPk(session.kakaoId);
    if (user) await user.update({ phone_verified: true });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'not found' });
  }
});

// 통합 라우터 적용
app.use('/api', apiRouter);

// 헬스 체크
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🚀 NOFAKE Restored Server running on Port ${PORT}`);
});
