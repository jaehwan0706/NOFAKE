// back/server.js
import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ABI 로드
const contractData = JSON.parse(fs.readFileSync('./artifacts/contracts/NoFakePlatform.sol/NoFakePlatform.json', 'utf8'));

app.post('/api/mint', async (req, res) => {
  const { userAddress, raffleId } = req.body;

  try {
    // 1. 공급자(RPC) 및 관리자 지갑 설정
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // 2. 컨트랙트 인스턴스 생성
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractData.abi, adminWallet);

    // 3. 민팅 트랜잭션 전송 (가스비는 서버가 냄)
    console.log(`[Server] Minting for: ${userAddress}`);
    const tx = await contract.mintRaffleTicket(userAddress, raffleId);
    const receipt = await tx.wait();

    res.json({ success: true, hash: receipt.hash });
  } catch (error) {
    console.error("Minting Error:", error);
    res.status(500).json({ success: false, error: error.reason || "이미 참여했거나 네트워크 오류입니다." });
  }
});

app.listen(3001, () => console.log("🛡️ NoFake Server is running on port 3001"));