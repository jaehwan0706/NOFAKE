import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const s3Client = new S3Client({ region: 'ap-northeast-2' });
const BUCKET_NAME = process.env.BUCKET_NAME;
const IMAGE_BASE_URL = `https://${BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/images/post-reveal/`;

// 🎯 서버 메모리 상태값 (실제 상용화 시에는 DB에 저장하는 것을 권장합니다)
let isRevealed = process.env.IS_REVEALED === 'true';

// ==========================================
// [1] 참여자용 API: 메타데이터 가져오기 (리빌 상태에 따라 다르게 응답)
// ==========================================
app.get('/api/metadata/:id', async (req, res) => {
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
        res.status(404).json({ error: '데이터를 찾을 수 없습니다.' });
    }
});

// ==========================================
// [2] 관리자용 API: 새로운 래플 데이터 무작위 생성 & S3 직접