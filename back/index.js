import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import axios from 'axios';
import { Contract, JsonRpcProvider, Wallet } from 'ethers'; // Wallet 추가
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 환경 설정
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// 💡 재민님 도커 포트(3001:3002)에 맞춰 내부 포트는 3002로 고정하는 것이 안전합니다.
const port = process.env.PORT || 3002; 

app.use(cors());
app.use(express.json());

// 1. Web3Auth/Kakao 검증 설정
const client = jwksClient({ jwksUri: process.env.JWKS_URI });
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey() || key?.rsaPublicKey;
    callback(null, signingKey);
  });
}

// [보안 미들웨어]
const verifyTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: '인증 토큰이 없습니다.' });
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, getKey, { algorithms: ['RS256'], audience: process.env.TOKEN_AUDIENCE }, (err, decoded) => {
        if (err) return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        req.user = {
            walletAddress: decoded.wallets?.[0]?.address || decoded.Sub || decoded.sub,
            email: decoded.email
        };
        next();
    });
};

// 2. 블록체인 설정 (이전 server.js 로직 합체)
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// ABI 로드 (프로젝트 루트에 abi.json이 있어야 함)
const abiPath = path.join(__dirname, "abi.json");
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const provider = new JsonRpcProvider(RPC_URL);
const signer = new Wallet(PRIVATE_KEY, provider);
const writeContract = new Contract(CONTRACT_ADDRESS, contractABI, signer);

// 3. AWS S3 설정
const s3Client = new S3Client({ region: 'ap-northeast-2' });
const BUCKET_NAME = process.env.BUCKET_NAME;

// --- API 엔드포인트 ---

// 🔥 카카오 토큰 교환 (인가 코드 -> ID 토큰)
app.post('/api/auth/kakao', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "인가 코드가 없습니다." });

  try {
    const response = await axios.post("https://kauth.kakao.com/oauth/token", new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_REST_API_KEY, // 하드코딩 대신 env 사용 추천
      redirect_uri: "http://localhost:3000/auth/kakao/callback", // 카카오 설정과 반드시 일치!
      code,
    }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });

    res.json(response.data); 
  } catch (error) {
    if (error.response?.data?.error_code === 'KOE320') {
      return res.status(200).json({ message: "이미 처리된 코드입니다." });
    }
    res.status(500).json({ error: "카카오 통신 실패" });
  }
});

// 🔥 민팅 요청 (실제 블록체인 트랜잭션 수행)
app.post('/api/mint', verifyTokenMiddleware, async (req, res) => {
    try {
        const { userAddress } = req.user; // 토큰에서 추출한 지갑 주소
        const { raffleId } = req.body;

        console.log(`🚀 민팅 시작: 유저(${userAddress}), 래플ID(${raffleId})`);

        // 실제 컨트랙트 함수 실행 (가스비는 서버의 PRIVATE_KEY가 지불)
        const tx = await writeContract.mintRaffleTicket(userAddress, raffleId);
        const receipt = await tx.wait();

        res.json({ 
            success: true, 
            message: "민팅 성공!", 
            txHash: receipt.hash 
        });
    } catch (error) {
        console.error("❌ 민팅 에러:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`==========================================`);
    console.log(`🚀 No-Fake 통합 서버 가동 (Port: ${port})`);
    console.log(`🔗 Contract: ${CONTRACT_ADDRESS}`);
    console.log(`==========================================`);
});
