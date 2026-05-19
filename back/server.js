import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { Sequelize, DataTypes, Op } from 'sequelize';
import axios from 'axios';
import crypto from 'crypto';
import { importJWK, jwtVerify } from "jose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 환경 변수 로드
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// [CORS 보안 해제]
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

app.use(express.json());

// ============================================
// 2. 데이터베이스 설정 (Sequelize)
// ============================================
const isMysql = process.env.DB_DIALECT === 'mysql';
const sequelize = isMysql 
  ? new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: { require: false, rejectUnauthorized: false }
        }
    })
  : new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, 'database.sqlite'),
        logging: false
    });

// 모델 정의
const User = sequelize.define('User', {
    kakaoId: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    nickname: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, allowNull: true },
    phoneNumber: { type: DataTypes.STRING },
    phone_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    phone_verified_at: { type: DataTypes.DATE },
    walletAddress: { type: DataTypes.STRING, allowNull: true },
    did: { type: DataTypes.STRING, allowNull: true },
    points: { type: DataTypes.INTEGER, defaultValue: 0 },
    joinedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
    timestamps: true
});

const PhoneVerificationSession = sequelize.define('PhoneVerificationSession', {
  sessionId: { type: DataTypes.STRING, primaryKey: true },
  kakaoId: { type: DataTypes.STRING, allowNull: true },
  phoneNumber: { type: DataTypes.STRING, allowNull: true },
  verificationCode: { type: DataTypes.STRING, allowNull: true },
  receiverNumber: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('pending', 'verified', 'failed', 'expired'), allowNull: false, defaultValue: 'pending' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  expiresAt: { type: DataTypes.DATE, allowNull: true },
  verifiedAt: { type: DataTypes.DATE, allowNull: true }
});

// DB 동기화
try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced successfully");
} catch (err) {
    console.error("❌ DB 연결 실패:", err.message);
}

// ============================================
// 3. 인증 미들웨어 (OIDC & Kakao 통합)
// ============================================

const verifyTokenMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: '인증 토큰이 없습니다.' });

  const token = authHeader.split(' ')[1];

  // 1. JWT 검증 (OIDC)
  if (process.env.JWKS_URI) {
    try {
      const jwksResponse = await axios.get(process.env.JWKS_URI);
      const keys = jwksResponse.data?.keys || [];
      const decodedHeader = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString('utf8'));
      const jwk = keys.find((key) => key.kid === decodedHeader.kid);

      if (jwk) {
        const verificationKey = await importJWK(jwk, jwk.alg || 'RS256');
        const { payload } = await jwtVerify(token, verificationKey, {
          audience: process.env.TOKEN_AUDIENCE,
          issuer: process.env.TOKEN_ISSUER
        });

        const kakaoId = String(payload.sub || payload.Sub || '');
        const [user] = await User.findOrCreate({
          where: { kakaoId },
          defaults: {
            name: payload.name || payload.nickname || "사용자",
            email: payload.email || "",
            phone_verified: false,
            points: 0
          }
        });

        req.user = { kakaoId: user.kakaoId, email: user.email, name: user.name, phone_verified: user.phone_verified };
        return next();
      }
    } catch (err) { /* JWT 실패 시 Kakao API로 전이 */ }
  }

  // 2. Kakao Access Token 검증
  try {
    const resp = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const kakaoId = String(resp.data.id || '');
    const [user] = await User.findOrCreate({
      where: { kakaoId },
      defaults: {
        name: resp.data.kakao_account?.profile?.nickname || "사용자",
        email: resp.data.kakao_account?.email || "",
        phone_verified: false,
        points: 0
      }
    });
    req.user = { kakaoId: user.kakaoId, email: user.email, name: user.name, phone_verified: user.phone_verified };
    next();
  } catch (err) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

async function ensurePhoneVerified(req, res, next) {
  if (req.user && req.user.phone_verified) return next();
  const user = await User.findByPk(req.user?.kakaoId);
  if (user && user.phone_verified) {
      req.loginUser = user;
      return next();
  }
  return res.status(403).json({ error: 'PHONE_NOT_VERIFIED', message: '휴대폰 인증이 필요합니다.' });
}

// ============================================
// 4. API 엔드포인트
// ============================================

// [인증 시작]
app.post('/api/phone-verification/start', verifyTokenMiddleware, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const kakaoId = req.user.kakaoId;
    
    const user = await User.findByPk(kakaoId);
    if (user && phoneNumber) await user.update({ phoneNumber });

    const sessionId = `pv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const receiverNumber = '1666-3538';
    const expiresAt = new Date(Date.now() + 300000);

    await PhoneVerificationSession.create({
      sessionId, kakaoId, phoneNumber, verificationCode, receiverNumber, status: 'pending', expiresAt
    });

    res.status(201).json({ sessionId, receiverNumber, verificationCode, expiresAt, pollIntervalSeconds: 4 });
  } catch (err) {
    res.status(500).json({ error: '인증 시작 실패', message: err.message });
  }
});

// [인증 상태 확인]
app.get('/api/phone-verification/status', async (req, res) => {
  const { sessionId } = req.query;
  try {
    const session = await PhoneVerificationSession.findByPk(sessionId);
    if (!session) return res.status(404).json({ error: 'session not found' });

    if (session.status === 'pending' && process.env.OCTOMO_API_KEY) {
      const octomoResp = await axios.get(`https://api.octomo.octoverse.kr/v1/messages`, {
        params: { content: session.verificationCode },
        headers: { 'x-api-key': process.env.OCTOMO_API_KEY }
      });
      if (octomoResp.data?.data?.length > 0) {
        const msg = octomoResp.data.data[0];
        await session.update({ status: 'verified', verifiedAt: new Date() });
        const user = await User.findByPk(session.kakaoId);
        if (user) await user.update({ phone_verified: true, phone_verified_at: new Date(), phoneNumber: msg.sender });
        return res.json({ status: 'verified' });
      }
    }
    res.json({ status: session.status });
  } catch (err) {
    res.status(500).json({ error: '상태 확인 실패' });
  }
});

// [기존 API들...]
app.get('/api/mypage', verifyTokenMiddleware, ensurePhoneVerified, async (req, res) => {
    const user = req.loginUser;
    res.json({
        profile: { name: user.name, email: user.email, walletAddress: user.walletAddress || "0x...", did: user.did || "did:..." },
        points: user.points || 55000,
        raffleHistory: [],
        pointHistory: []
    });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🚀 NoFake Server is running on Port ${PORT}`);
});