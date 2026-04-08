import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// 1. 환경 설정 로드
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 2. Web3Auth 검증 클라이언트 설정 (백엔드 C 영역)
const client = jwksClient({
  // 이제 주소를 직접 적지 않고 .env에서 가져옵니다.
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
    jwt.verify(token, getKey, { 
    algorithms: ['RS256'],
    // 수신자(Audience)도 .env에서 가져옵니다.
    audience: process.env.TOKEN_AUDIENCE 
}, (err, decoded) => { ... });
        if (err) return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        
        // [핵심 업데이트] 어제 성공한 지갑 주소(또는 고유 ID) 추출 로직 반영
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
    
    // 리빌 상태에 따른 S3 경로 설정
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
    // TODO: 정민님의 스마트 컨트랙트 연동 로직 추가 예정
    res.json({ success: true, message: "민팅 보안 검증 통과", user: req.user });
});

app.listen(port, () => {
    console.log(`==========================================`);
    console.log(`🚀 No-Fake 통합 보안 서버 가동 중 (Port: ${port})`);
    console.log(`🔐 S3 연동 및 Web3Auth 미들웨어 활성화 완료`);
    console.log(`==========================================`);
});
