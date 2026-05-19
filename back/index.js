import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import axios from 'axios';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes, Op } from 'sequelize';
import { importJWK, jwtVerify } from "jose";

// 환경 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const port = process.env.PORT || 3002; 

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// 로깅 미들웨어 (디버깅용)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// 데이터베이스 설정
// ============================================
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

const User = sequelize.define('User', {
  kakaoId: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  phone_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  phoneNumber: { type: DataTypes.STRING },
  points: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const PhoneVerificationSession = sequelize.define('PhoneVerificationSession', {
  sessionId: { type: DataTypes.STRING, primaryKey: true },
  kakaoId: { type: DataTypes.STRING },
  verificationCode: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending', 'verified', 'expired'), defaultValue: 'pending' },
  expiresAt: { type: DataTypes.DATE }
});

sequelize.sync({ alter: true });

// ============================================
// 인증 미들웨어
// ============================================
const verifyTokenMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: '인증 토큰이 없습니다.' });
  const token = authHeader.split(' ')[1];

  try {
    // OIDC / JWT 검증 시도
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
      } catch (e) { /* skip */ }
    }

    // Kakao Access Token 검증 폴백
    const resp = await axios.get('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${token}` } });
    const kakaoId = String(resp.data.id || '');
    const [user] = await User.findOrCreate({ where: { kakaoId }, defaults: { name: resp.data.kakao_account?.profile?.nickname || "사용자", email: resp.data.kakao_account?.email || "" } });
    req.user = { kakaoId: user.kakaoId, name: user.name, email: user.email, phone_verified: user.phone_verified };
    next();
  } catch (err) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

// ============================================
// API 엔드포인트
// ============================================

app.post('/api/phone-verification/start', verifyTokenMiddleware, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const kakaoId = req.user.kakaoId;
    const sessionId = `pv-${Date.now()}`;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 300000);

    await PhoneVerificationSession.create({ sessionId, kakaoId, verificationCode, status: 'pending', expiresAt });
    const user = await User.findByPk(kakaoId);
    if (user) await user.update({ phoneNumber });

    res.status(201).json({ sessionId, receiverNumber: '1666-3538', verificationCode, expiresAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/phone-verification/status', async (req, res) => {
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

// 기존 index.js 기능
app.post('/api/auth/kakao', async (req, res) => {
  const { code } = req.body;
  const response = await axios.post("https://kauth.kakao.com/oauth/token", new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_REST_API_KEY,
    redirect_uri: "http://localhost:3000/auth/kakao/callback",
    code,
  }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  res.json(response.data); 
});

app.get("/api/auth/me", verifyTokenMiddleware, (req, res) => {
  res.json({ success: true, ...req.user });
});

app.listen(port, () => {
  console.log(`🚀 Unified Backup Server running on Port ${port}`);
});
