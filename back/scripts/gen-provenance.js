const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. 백엔드 B가 준 JSON 파일들이 모여있는 폴더 경로
const metadataDir = path.join(__dirname, '../metadata/30개의 json파일'); 

function generateProvenance() {
    const files = fs.readdirSync(metadataDir).sort((a, b) => {
        return parseInt(a) - parseInt(b); // 1.json, 2.json 순서대로 정렬
    });ㄴ

    let combinedHashes = "";

    files.forEach(file => {
        const content = fs.readFileSync(path.join(metadataDir, file), 'utf8');
        // 공백 및 줄바꿈 제거 후 해시 생성 (데이터 무결성 극대화)
        const cleanContent = content.replace(/\s+/g, '');
        const hash = crypto.createHash('sha256').update(cleanContent).digest('hex');
        combinedHashes += hash;
    });

    // 모든 파일의 해시를 이어 붙인 최종 해시 (봉인)
    const finalProvenance = crypto.createHash('sha256').update(combinedHashes).digest('hex');
    
    console.log("======================================");
    console.log("최종 PROVENANCE_HASH:", finalProvenance);
    console.log("======================================");
    
    // txt 파일로 자동 저장
    fs.writeFileSync(path.join(__dirname, '../metadata/provenance_hash.txt'), finalProvenance);
}

generateProvenance();