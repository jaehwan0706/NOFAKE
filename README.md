# 🎟 NOFAKE — 블록체인 기반 공정 래플(응모) 플랫폼

> 브랜드 한정판 응모(래플)의 당첨 과정을 블록체인에 기록해, 결과를 누구나 검증할 수 있게 만든 플랫폼입니다.

- **기간**: 2026.04 – 2026.06 (K-디지털 트레이닝 팀 프로젝트)
- **내 역할**: **프론트엔드 총괄**

<br>

## 📌 주요 기능

| 기능 | 설명 |
| --- | --- |
| 래플 응모 | 진행 중인 래플 조회, 응모권을 NFT(ERC-721)로 발급 |
| 당첨 공개 | 관리자가 래플을 마감·공개하면 당첨자가 컨트랙트 이벤트로 기록 |
| 공정성 검증 | 응모 데이터를 정해진 순서로 묶어 SHA-256 해시를 만들어 결과 조작 여부 확인 |
| 브랜드 포인트 교환 | 브랜드 간 포인트 교환 요청 (Hyperledger Fabric 체인코드) |
| 회원 | 카카오 로그인, 마이페이지 |
| 관리자 | 래플 생성·마감·공개·삭제, 컨트랙트 통계 |

<br>

## 🛠 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js (Express), SQLite |
| Blockchain | Solidity (ERC-721, OpenZeppelin), Hardhat, Hyperledger Fabric (Java 체인코드) |
| 인증 | Kakao OAuth |
| 배포 | Docker Compose, Nginx (프론트 서빙 + `/api` 프록시) |

<br>

## 🖥 프론트엔드 구성 (내 담당)

```
front/src/pages/
├── main/          메인 홈
├── raffle/        래플 목록 · 응모
├── points/        브랜드 포인트 교환
├── user/          마이페이지
├── auth/          카카오 로그인 · 콜백
├── about/         서비스 소개 · 공정성 · 투명성 · 이용 방법 · 브랜드 · 회사
├── partnership/   입점 · 제휴 안내
└── support/       공지 · FAQ · 문의 · 약관 · 개인정보처리방침
```

- 공통 `Header` · `Footer` 컴포넌트와 `lib/api.ts`로 API 호출을 한곳에서 관리

<br>

## ▶ 실행 방법

```bash
# 프론트
cd front && npm install && npm run dev

# 백엔드
cd back && npm install && node server.js
```
