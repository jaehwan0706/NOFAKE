# 🎯 NoFake - 통합 웹사이트 프로젝트

통합된 블록체인 기반 래플 시스템으로, backend API, frontend 웹사이트, 그리고 Hyperledger Fabric chaincode가 한 데 모여 작동합니다.

## 📋 프로젝트 구조

```
NoFake2/
├── back/                      # Backend API 서버
│   ├── api/
│   │   └── server.js         # 통합 Express API 서버
│   ├── package.json          # 백엔드 의존성
│   ├── Dockerfile.backend    # 백엔드 Docker 이미지
│   └── .env                  # 백엔드 환경 변수
├── front/                     # React + Vite 프론트엔드
│   ├── src/                  # React 컴포넌트 및 페이지
│   ├── package.json          # 프론트엔드 의존성
│   ├── vite.config.ts        # Vite 설정 (API 프록시)
│   └── .env                  # 프론트엔드 환경 변수
├── chaincode/                 # Hyperledger Fabric Chaincode (Java)
│   └── app/                  # Java 애플리케이션
├── docker-compose.yml        # 전체 서비스 오케스트레이션
├── Dockerfile                # 프론트엔드 + Nginx 이미지
├── nginx.conf                # Nginx 설정 (역할: API 프록시)
└── .env.example              # 환경 변수 템플릿
```

## 🚀 빠른 시작 (로컬 개발)

### 1️⃣ 요구사항
- Node.js 20+
- Docker & Docker Compose (선택사항)
- Git

### 2️⃣ 설정

#### Step 1: 리포지토리 클론 및 환경 변수 설정
```bash
cd NoFake2
cp .env.example back/.env
cp .env.example front/.env
```

#### Step 2: 환경 변수 수정
`back/.env` 파일을 편집하여 다음을 설정하세요:
```env
# 블록체인
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...

# 카카오 (필수)
KAKAO_REST_API_KEY=d9c3641e6babf0f0d91c93a7ec557c40
KAKAO_REDIRECT_URI=http://localhost:5173/auth/kakao/callback
```

`front/.env` 파일도 동일하게 업데이트하세요.

### 3️⃣ 로컬에서 실행 (터미널 2개 필요)

**터미널 1 - 백엔드 시작:**
```bash
cd back
npm install
npm start
# API 서버가 http://localhost:3002 에서 실행됨
```

**터미널 2 - 프론트엔드 시작:**
```bash
cd front
npm install
npm run dev
# 웹사이트가 http://localhost:5173 에서 실행됨
```

### 4️⃣ 테스트
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3002
- API 문서: http://localhost:3002 (라우트 목록 조회)

## 🐳 Docker로 배포 (프로덕션)

### 한 줄 명령어로 실행
```bash
docker-compose up -d
```

이 명령어는:
- 백엔드 API 서버 (포트 3001)
- 프론트엔드 웹사이트 (포트 80 → Nginx)
- SQLite 데이터베이스 (볼륨: nofake_sqlite)

를 동시에 실행합니다.

### 상태 확인
```bash
docker-compose ps
docker-compose logs -f nofake-api
docker-compose logs -f nofake-web
```

### 중지 및 정리
```bash
docker-compose down
docker-compose down -v  # 데이터까지 삭제
```

## 📡 API 엔드포인트

### 인증 (Authentication)
- `POST /api/auth/kakao` - 카카오 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `GET /api/user/profile` - 사용자 프로필 조회
- `PATCH /api/user/name` - 이름 변경
- `PATCH /api/user/email` - 이메일 변경

### 전화 인증 (Phone Verification)
- `POST /api/user/phone` - 휴대폰 번호 등록
- `POST /api/phone-verification/start` - 인증 시작
- `GET /api/phone-verification/status` - 인증 상태 조회
- `POST /api/phone-verification/webhook` - Octomo 웹훅

### 래플 (Raffle)
- `GET /api/raffles` - 래플 목록 조회
- `POST /api/mint` - 래플 티켓 발행 (민팅)
- `GET /api/admin/raffles` - 어드민 래플 목록
- `POST /api/admin/raffles` - 새 래플 생성
- `POST /api/admin/raffles/:id/close` - 래플 종료
- `POST /api/admin/raffles/:id/reveal` - 당첨자 공개

### 메타데이터 (Metadata)
- `GET /api/metadata/:tokenId` - NFT 메타데이터 조회

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐    ┌──────────────────────────────┐   │
│  │  nofake-web      │    │     nofake-api               │   │
│  │  (Nginx/React)   │───▶│  (Express.js)                │   │
│  │  Port 80         │    │  Port 3002                   │   │
│  └──────────────────┘    ├──────────────────────────────┤   │
│         │                │  SQLite DB                   │   │
│         │                │  /data/database.sqlite       │   │
│         │                └──────────────────────────────┘   │
│         │                           │                        │
│         └───────────────────────────┼────────────────────┐   │
│                                     ▼                    │   │
│  ┌─────────────────────────────────────────────┐        │   │
│  │ Blockchain (Ethereum Sepolia)               │        │   │
│  │ - Smart Contracts                           │        │   │
│  │ - User Wallet Interactions                  │        │   │
│  └─────────────────────────────────────────────┘        │   │
│                                                 │        │   │
│  ┌─────────────────────────────────────────────────┐    │   │
│  │ External Services                               │    │   │
│  │ - Kakao OAuth (로그인)                         │    │   │
│  │ - Octomo (전화 인증)                           │    │   │
│  │ - AWS S3 (메타데이터 저장소)                  │    │   │
│  └─────────────────────────────────────────────────┘    │   │
│                                                          │   │
└──────────────────────────────────────────────────────────┘   │
```

## 🔐 보안 기능

- ✅ JWT 토큰 검증 (Web3Auth)
- ✅ 카카오 OAuth 2.0 인증
- ✅ 휴대폰 인증 (Octomo)
- ✅ 스마트 컨트랙트 보안
- ✅ CORS 설정
- ✅ 환경 변수 관리

## 📊 데이터베이스 스키마

### Raffle
```sql
CREATE TABLE Raffles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  imageUrl VARCHAR(500),
  startAt DATETIME,
  endAt DATETIME,
  firstPrizeCount INT,
  secondPrizeCount INT,
  status ENUM('READY', 'MINTING', 'CLOSED', 'REVEALED'),
  contractAddress VARCHAR(255),
  provenanceHash VARCHAR(255)
);
```

### User
```sql
CREATE TABLE Users (
  kakaoId VARCHAR(255) PRIMARY KEY,
  nickname VARCHAR(255),
  email VARCHAR(255),
  name VARCHAR(255),
  phoneNumber VARCHAR(20),
  phone_verified BOOLEAN DEFAULT false
);
```

### RaffleParticipant
```sql
CREATE TABLE RaffleParticipants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  raffleId INT NOT NULL,
  walletAddress VARCHAR(255) NOT NULL,
  joinedAt DATETIME,
  result ENUM('pending', 'first', 'second', 'lose'),
  revealedAt DATETIME
);
```

## 🧪 테스트

### API 테스트 (curl)
```bash
# 헬스 체크
curl http://localhost:3002/health

# 래플 목록 조회
curl http://localhost:3002/api/raffles

# 카카오 로그인 (인가 코드 필요)
curl -X POST http://localhost:3002/api/auth/kakao \
  -H "Content-Type: application/json" \
  -d '{"code": "YOUR_KAKAO_AUTH_CODE"}'
```

## 📱 Chaincode 통합 (Hyperledger Fabric)

Chaincode는 `chaincode/` 디렉토리에 위치합니다. Java로 작성되었으며:
- 래플 데이터 검증
- 블록체인 기록 관리
- 스마트 컨트랙트 로직

자세한 내용은 [chaincode/README.md](chaincode/README.md)를 참고하세요.

## 📝 환경 변수 가이드

| 변수 | 설명 | 예시 |
|------|------|------|
| `DB_DIALECT` | 데이터베이스 타입 | `sqlite` 또는 `mysql` |
| `RPC_URL` | Ethereum RPC 엔드포인트 | `https://sepolia.infura.io/...` |
| `CONTRACT_ADDRESS` | 스마트 컨트랙트 주소 | `0x...` |
| `KAKAO_REST_API_KEY` | 카카오 애플리케이션 키 | (카카오 대시보드에서 획득) |
| `PORT` | 백엔드 포트 | `3002` |

## 🐛 트러블슈팅

### 백엔드 실행 오류
```bash
# npm 모듈 재설치
cd back && rm -rf node_modules package-lock.json && npm install
```

### 포트 충돌
```bash
# 포트 변경 (back/.env)
PORT=3003
```

### 데이터베이스 오류
```bash
# SQLite 데이터베이스 초기화
rm database.sqlite
npm start  # 자동으로 재생성됨
```

## 📚 추가 문서

- [Backend API 문서](back/README.md)
- [Frontend 문서](front/README.md)
- [Chaincode 문서](chaincode/README.md)
- [배포 가이드](docs/DEPLOYMENT.md)

## 🤝 기여

버그 리포트 및 기능 제안은 이슈를 통해 제출해주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**마지막 업데이트:** 2026년 5월 15일  
**상태:** 🟢 통합 완료 및 배포 준비
