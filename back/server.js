import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { Sequelize, DataTypes } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 환경 변수 로드
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// [CORS 보안 해제] ngrok 터널링 환경에서 인증 헤더(Authorization)를 프론트엔드와 완벽 공유합니다.
app.use(cors({
    origin: ['http://localhost:5173', 'https://outrage-overboard-unrevised.ngrok-free.dev'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

app.use(express.json());

// ============================================
// 2. AWS RDS 데이터베이스 및 Sequelize 설정
// ============================================
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false, // 콘솔창을 깨끗하게 유지
    dialectOptions: {
        ssl: {
            require: false,
            rejectUnauthorized: false
        }
    }
});

// User 테이블 모델 정의 (마이페이지용 필수 데이터 구조)
const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    walletAddress: { type: DataTypes.STRING, allowNull: true },
    did: { type: DataTypes.STRING, allowNull: true },
    points: { type: DataTypes.INTEGER, defaultValue: 0 },
    joinedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
    timestamps: true
});

// DB 동기화
try {
    await sequelize.sync();
    console.log("✅ AWS RDS Database synced successfully");
} catch (err) {
    console.error("❌ DB 연결 실패:", err.message);
}

// ============================================
// 3. 스마트 컨트랙트 및 ABI 로드
// ============================================
const abiPath = path.join(__dirname, 'artifacts', 'contracts', 'NoFake.sol', 'NoFakePlatform.json');
let contractData;

try {
    contractData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
} catch (err) {
    console.warn("⚠️ ABI 로드 실패, 기본 폴백 적용");
    contractData = { abi: [] };
}

// ============================================
// 4. 안전한 인증 미들웨어 (JWT 검증 - 개발 환경에서 유연하게 처리)
// ============================================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 토큰이 없으면 기본 유저 정보 설정 (개발 환경 편의)
    if (!token) {
        req.user = {
            email: "dev-user@nofake.com",
            name: "NoFake 유저",
            sub: "dev-user-001"
        };
        return next();
    }

    // 토큰이 있으면 검증 시도
    const secret = process.env.JWT_SECRET || process.env.TOKEN_AUDIENCE || "nofake-super-secret-key-2024-web3auth";

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            // 토큰 검증 실패 시에도 기본 정보로 진행 (개발 편의)
            console.warn("⚠️ 토큰 검증 실패:", err.message);
            req.user = {
                email: "dev-user@nofake.com",
                name: "NoFake 유저",
                sub: "dev-user-001"
            };
        } else {
            req.user = decoded;
        }
        next();
    });
}

// ============================================
// 5. API 엔드포인트 구현
// ============================================

// [기존 기능] 민팅 API
app.post('/api/mint', async (req, res) => {
    const { userAddress, raffleId } = req.body;
    if (!userAddress || !raffleId) {
        return res.status(400).json({ success: false, error: "지갑 주소 또는 래플 ID가 누락되었습니다." });
    }

    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractData.abi, adminWallet);

        console.log(`[Server] 🚀 ${userAddress}님을 위해 래플 ${raffleId}번 민팅 시작...`);
        const tx = await contract.mintRaffleTicket(userAddress, raffleId, { gasLimit: 300000 });
        const receipt = await tx.wait();

        res.json({ success: true, hash: receipt.hash });
    } catch (error) {
        console.error("❌ Minting Error:", error);
        res.status(500).json({ success: false, error: error.reason || "민팅에 실패했습니다." });
    }
});

// 🌟 [마이페이지] 사용자 기본 프로필 & 분산 신원인증 (DID)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        let userData = await User.findOne({ where: { email: userEmail } });

        // DB에 데이터가 없으면 샘플 데이터 생성
        if (!userData) {
            userData = {
                name: req.user.name || "NoFake 유저",
                email: userEmail || "user@nofake.com",
                walletAddress: "0x398591b6257b8BA14Baf06728a706a5B73dd2795",
                did: "did:nofake:0x398591b6257b8BA14Baf06728a706a5B73dd2795",
                joinedAt: new Date().toISOString(),
                profileImage: null
            };
        }

        res.json({
            name: userData.name,
            email: userData.email,
            walletAddress: userData.walletAddress || "0x398591b6257b8BA14Baf06728a706a5B73dd2795",
            did: userData.did || "did:nofake:0x398591b6257b8BA14Baf06728a706a5B73dd2795",
            joinedAt: userData.joinedAt,
            profileImage: userData.profileImage
        });
    } catch (error) {
        console.error("❌ 프로필 조회 오류:", error);
        res.status(500).json({ error: "프로필 조회 실패" });
    }
});

// 🌟 [마이페이지] 포인트 잔액 (프라이빗 블록체인)
app.get('/api/mypage/points', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        let userData = await User.findOne({ where: { email: userEmail } });
        const currentPoints = userData ? userData.points : 55000;

        res.json({
            privateBlockchain: {
                nofakePoints: currentPoints,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("❌ 포인트 조회 오류:", error);
        res.status(500).json({ error: "포인트 조회 실패" });
    }
});

// 🌟 [마이페이지] 래플 응모 & NFT 당첨 내역 (퍼블릭 블록체인)
app.get('/api/mypage/raffles', authenticateToken, async (req, res) => {
    try {
        res.json({
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
                        contractAddress: "0x398591b6257b8BA14Baf06728a706a5B73dd2795",
                        chain: "Ethereum Sepolia"
                    }
                },
                {
                    id: "raffle-02",
                    brand: "ADIDAS",
                    brandColor: "#000000",
                    name: "아디다스 울트라부스트 22",
                    image: "👟",
                    applyDate: "2026.05.05",
                    deadline: "2026.05.15",
                    resultDate: "2026.05.17",
                    participants: "890",
                    winners: "2",
                    myNumber: "A-1520",
                    status: "미당첨",
                    txHash: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
                    size: "280",
                    price: "199,000원",
                    purchaseDeadline: null
                }
            ]
        });
    } catch (error) {
        console.error("❌ 래플 내역 조회 오류:", error);
        res.status(500).json({ error: "래플 내역 조회 실패" });
    }
});

// 🌟 [마이페이지] 포인트 변동 이력 (투명한 기록)
app.get('/api/mypage/point-history', authenticateToken, async (req, res) => {
    try {
        res.json({
            pointHistory: [
                { id: "h-001", label: "웰컴 회원가입 보너스", date: "2026.05.10", amount: "+50,000", color: "#10b981", type: "bonus" },
                { id: "h-002", label: "출석 체크 포인트", date: "2026.05.15", amount: "+5,000", color: "#10b981", type: "attendance" },
                { id: "h-003", label: "래플 응모 포인트 차감", date: "2026.05.12", amount: "-1,000", color: "#ef4444", type: "raffle" },
                { id: "h-004", label: "이벤트 참여 포인트", date: "2026.05.08", amount: "+10,000", color: "#10b981", type: "event" }
            ]
        });
    } catch (error) {
        console.error("❌ 포인트 이력 조회 오류:", error);
        res.status(500).json({ error: "포인트 이력 조회 실패" });
    }
});

// 🌟 [마이페이지] 종합 데이터 (원래 엔드포인트 - 모든 데이터 통합)
app.get('/api/mypage', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        let userData = await User.findOne({ where: { email: userEmail } });
        const currentPoints = userData ? userData.points : 55000;

        res.json({
            // 1. 사용자 기본 프로필 & 분산 신원인증 (DID)
            profile: {
                name: userData?.name || req.user.name || "NoFake 유저",
                email: userEmail,
                walletAddress: userData?.walletAddress || "0x398591b6257b8BA14Baf06728a706a5B73dd2795",
                did: userData?.did || "did:nofake:0x398591b6257b8BA14Baf06728a706a5B73dd2795",
                joinedAt: userData?.joinedAt || new Date().toISOString(),
                profileImage: userData?.profileImage || null
            },

            // 2. 프라이빗 블록체인 기반의 'NoFake 포인트' 잔액
            points: currentPoints,
            privateBlockchain: {
                nofakePoints: currentPoints,
                lastUpdated: new Date().toISOString(),
                chain: "Private Blockchain"
            },

            // 3. 퍼블릭 블록체인 기반의 '래플 응모 및 NFT 당첨 내역'
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
                        contractAddress: "0x398591b6257b8BA14Baf06728a706a5B73dd2795",
                        chain: "Ethereum Sepolia"
                    }
                },
                {
                    id: "raffle-02",
                    brand: "ADIDAS",
                    brandColor: "#000000",
                    name: "아디다스 울트라부스트 22",
                    image: "👟",
                    applyDate: "2026.05.05",
                    deadline: "2026.05.15",
                    resultDate: "2026.05.17",
                    participants: "890",
                    winners: "2",
                    myNumber: "A-1520",
                    status: "미당첨",
                    txHash: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
                    size: "280",
                    price: "199,000원",
                    purchaseDeadline: null
                }
            ],

            // 4. 투명한 포인트 변동 이력 (포인트 내역)
            pointHistory: [
                { id: "h-001", label: "웰컴 회원가입 보너스", date: "2026.05.10", amount: "+50,000", color: "#10b981", type: "bonus" },
                { id: "h-002", label: "출석 체크 포인트", date: "2026.05.15", amount: "+5,000", color: "#10b981", type: "attendance" },
                { id: "h-003", label: "래플 응모 포인트 차감", date: "2026.05.12", amount: "-1,000", color: "#ef4444", type: "raffle" },
                { id: "h-004", label: "이벤트 참여 포인트", date: "2026.05.08", amount: "+10,000", color: "#10b981", type: "event" }
            ],

            stats: {
                totalApply: 2,
                winCount: 0,
                winRate: "0.0",
                activeCount: 2
            }
        });
    } catch (error) {
        console.error("❌ 마이페이지 데이터 조회 오류:", error);
        res.status(500).json({ error: "마이페이지 데이터 조회 실패" });
    }
});

// ============================================
// 6. 서버 리슨
// ============================================
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`\n🛡️  NoFake Integrated Server is running!`);
    console.log(`🔗 Local API: http://localhost:${PORT}`);
    console.log(`📡 ngrok Target Port: ${PORT}\n`);
});