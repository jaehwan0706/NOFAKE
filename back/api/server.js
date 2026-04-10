import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import crypto from 'crypto'; // 💡 [추가] Provenance Hash 계산용 내장 암호화 모듈

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
// 🧬 Provenance Hash 자동 계산 로직 (서버 구동 시 1회 실행)
// ==========================================
let cachedProvenanceHash = "";

async function calculateProvenanceHash() {
    try {
        const metadataPath = path.join(__dirname, 'metadata', 'post-reveal');
        let combinedHashes = "";

        // 1번부터 30번까지의 JSON 파일을 순차적으로 읽어 해시화
        for (let i = 1; i <= 30; i++) {
            const filePath = path.join(metadataPath, `${i}.json`);
            if (fs.existsSync(filePath)) {
                // 공백과 줄바꿈을 제거하여 무결성 유지
                const fileData = fs.readFileSync(filePath, 'utf8').replace(/\s+/g, '');
                const fileHash = crypto.createHash('sha256').update(fileData).digest('hex');
                combinedHashes += fileHash;
            }
        }

        // 30개의 해시를 합친 문자열을 최종 암호화하여 완성
        const finalHash = '0x' + crypto.createHash('sha256').update(combinedHashes).digest('hex');
        console.log(`✅ Provenance Hash 자동 계산 완료: ${finalHash}`);
        return finalHash;
    } catch (error) {
        console.error("❌ 해시 계산 중 오류 발생:", error);
        return "Calculation Error";
    }
}

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

        // 💡 [추가] 1.5 Provenance Hash 주입 (자동 계산된 값 사용)
        const provIdx = attributes.findIndex(attr => attr.trait_type === "Provenance Hash");
        if (provIdx !== -1) {
            attributes[provIdx].value = cachedProvenanceHash;
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

        // 3. Ticket Expiration 계산 및 주입 (오직 2등 퍼즐 조각만 해당!)
        if (tokenId >= 2 && tokenId <= 6) {
            // ⚠️ getRevealTimestamp 함수명 확인 필요
            const revealTimeBN = await contract.getRevealTimestamp();
            const revealTime = Number(revealTimeBN);

            // 2등: 리빌 시간 + 90일
            const expirationTime = revealTime + (90 * 86400);

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

// ==========================================
// 🚀 서버 구동
// ==========================================
app.listen(PORT, async () => {
    // 💡 서버가 시작될 때 즉시 해시값을 계산하여 메모리에 저장합니다.
    cachedProvenanceHash = await calculateProvenanceHash();
    console.log(`🚀 NOFAKE API Server is running on http://localhost:${PORT}`);
});