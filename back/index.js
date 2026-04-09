import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// 1. 환경 설정 로드
// 현재 구조상 .env가 상위 폴더(root)에 있으므로 경로를 명시해줍니다.
dotenv.config({ path: '../.env' }); 

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 2. Web3Auth/Kakao 검증 클라이언트 설정
const client = jwksClient({
  jwksUri: process.env.JWKS_URI 
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey() || key?.rsaPublicKey;
    callback(null, signingKey);
  });
}

// 🛡️ [보안 미들웨어] 모든 API 요청 전에 토큰을 검사하고 지갑 주소를 추출합니다.
const verifyTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: '인증 토큰이 없습니다.' });

    const token = authHeader.split(' ')[1];
    
    // ✅ SyntaxError 유발했던 '...'를 실제 로직으로 교체했습니다.
    jwt.verify(token, getKey, { 
        algorithms: ['RS256'],
        audience: process.env.TOKEN_AUDIENCE 
    }, (err, decoded) => {
        if (err) {
            console.error("❌ 토큰 검증 실패:", err.message);
            return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        }
        
        // 지갑 주소 또는 고유 ID 추출 (어제 성공한 로직)
        req.user = {
            walletAddress: decoded.wallets?.[0]?.address || decoded.sub,
            email: decoded.email
        };
        
        console.log("✅ 인증 성공:", req.user.walletAddress);
        next();
    });
};

// 3. AWS S3 설정 (백엔드 B 영역)
const s3Client = new S3Client({ region: 'ap-northeast-2' });
const BUCKET_NAME = process.env.BUCKET_NAME;
let isRevealed = process.env.IS_REVEALED === 'true';

// ==========================================
// [API] 로그인 및 사용자 확인 (백엔드 C)
// ==========================================
app.post('/api/login', verifyTokenMiddleware, (req, res) => {
    res.json({ success: true, user: req.user });
});

// ==========================================
// [API] 참여자용: 메타데이터 가져오기 (인증 필수 - 백엔드 B)
// ==========================================
app.get('/api/metadata/:id', verifyTokenMiddleware, async (req, res) => {
    const { id } = req.params;
    
    const s3Key = isRevealed 
        ? `metadata/post-reveal/${id}.json` 
        : `metadata/pre-reveal/unrevealed.json`;

    try {
        const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key });
        const response = await s3Client.send(command);
        
        res.setHeader('Content-Type', response.ContentType);
        response.Body.pipe(res);
    } catch (error) {
        console.error("S3 Error:", error);
        res.status(404).json({ error: '데이터를 찾을 수 없습니다.' });
    }
});

// ==========================================
// [API] 민팅 요청 (수요일 백엔드 A 합체용 공간)
// ==========================================
app.post('/api/mint', verifyTokenMiddleware, (req, res) => {
    res.json({ success: true, message: "민팅 보안 검증 통과", user: req.user });
});

app.listen(port, () => {
    console.log(`==========================================`);
    console.log(`🚀 No-Fake 통합 보안 서버 가동 중 (Port: ${port})`);
    console.log(`🔐 S3 연동 및 Web3Auth 미들웨어 활성화 완료`);
    console.log(`==========================================`);
});
