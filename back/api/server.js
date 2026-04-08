import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// 🔗 블록체인 초기 세팅
// ==========================================
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const abiPath = path.join(__dirname, 'abi.json');
const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const contractAddress = process.env.CONTRACT_ADDRESS;

const contract = new ethers.Contract(contractAddress, contractABI, provider);

// ==========================================
// 🚀 메타데이터 제공 API
// ==========================================
app.get('/api/metadata/:tokenId', async (req, res) => {
    const tokenId = parseInt(req.params.tokenId);

    if (isNaN(tokenId) || tokenId < 1 || tokenId > 30) {
        return res.status(400).json({ error: "Invalid tokenId. Must be between 1 and 30." });
    }

    try {
        // [수정 완료] 정민님이 만든 리빌 확인 변수명 반영
        const isRevealed = await contract.revealed();

        if (!isRevealed) {
            const unrevealedPath = path.join(__dirname, 'metadata', 'pre-reveal', 'unrevealed.json');
            const data = JSON.parse(fs.readFileSync(unrevealedPath, 'utf8'));
            return res.status(200).json(data);
        }

        const revealedPath = path.join(__dirname, 'metadata', 'post-reveal', `${tokenId}.json`);
        let metadata = JSON.parse(fs.readFileSync(revealedPath, 'utf8'));

        const attributes = metadata.attributes;

        // 1. Contract Address 주입
        const contractAddrIdx = attributes.findIndex(attr => attr.trait_type === "Contract Address");
        if (contractAddrIdx !== -1) {
            attributes[contractAddrIdx].value = contractAddress;
        }

        // 2. Minted Date 주입 (⚠️ getMintTimestamp 함수명 확인 필요)
        const mintedDateIdx = attributes.findIndex(attr => attr.trait_type === "Minted Date");
        if (mintedDateIdx !== -1) {
            try {
                const mintTimeBN = await contract.getMintTimestamp(tokenId);
                attributes[mintedDateIdx].value = Number(mintTimeBN);
            } catch (err) {
                console.warn(`[Warning] Failed to fetch Minted Date for tokenId ${tokenId}.`);
                attributes[mintedDateIdx].value = 0; 
            }
        }

        // 3. Ticket Expiration 계산 및 주입
        if (tokenId >= 1 && tokenId <= 6) {
            // ⚠️ getRevealTimestamp 함수명 확인 필요
            const revealTimeBN = await contract.getRevealTimestamp();
            const revealTime = Number(revealTimeBN);

            let expirationTime = 0;
            if (tokenId === 1) {
                expirationTime = revealTime + (13 * 86400); // 1등 13일
            } else if (tokenId >= 2 && tokenId <= 6) {
                expirationTime = revealTime + (90 * 86400); // 2등 90일
            }

            const expAttrIndex = attributes.findIndex(attr => attr.trait_type === "Ticket Expiration");
            if (expAttrIndex !== -1) {
                attributes[expAttrIndex].value = expirationTime;
            } else {
                attributes.push({ display_type: "date", trait_type: "Ticket Expiration", value: expirationTime });
            }
        }

        res.status(200).json(metadata);

    } catch (error) {
        console.error(`Error processing tokenId ${tokenId}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 NOFAKE API Server is running on http://localhost:${PORT}`);
});