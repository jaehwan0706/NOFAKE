import React, { useState, useEffect, useRef } from "react";

const tokens = {
  blue: "#2563eb",
  blueDark: "#1d4ed8",
  blueLight: "#dbeafe",
  navy: "#111827",
  gray: "#6b7280",
  grayLight: "#f9fafb",
  border: "#f3f4f6",
  white: "#ffffff",
  text: "#1f2937",
  sub: "#4b5563",
};

const font = `'DM Sans', 'Pretendard', sans-serif`;

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── DATA ─────────────────────────────────────────── */

const STATS = [
  { value: "3+",   label: "년 운영 경험" },
  { value: "98%",  label: "추첨 무결성 보장율" },
  { value: "200+", label: "파트너사 납품 실적" },
  { value: "5M+",  label: "누적 추첨 처리 건수" },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TECH = [
  { icon: "⛓",  title: "Private Blockchain", desc: "하이퍼레저 패브릭 기반의 독자적인 원장 구조 설계" },
  { icon: "📜",  title: "Smart Contract",     desc: "조작 불가능한 온체인 추첨 로직 구현" },
  { icon: "🤖",  title: "AI Matching",        desc: "실시간 고성능 AI 매칭 알고리즘 운용" },
  { icon: "🔐",  title: "DID Auth",           desc: "카카오/DID 통합 분산신원인증 시스템" },
];

// ✅ 홈에서 이전: 기술 스택 상세 (TechnologyStack)
const TECH_STACK = [
  {
    category: "블록체인 인프라",
    icon: "🗄️",
    title: "Hyperledger Fabric",
    description: "엔터프라이즈급 블록체인으로 투명성과 보안을 동시에 보장합니다.",
    features: ["프라이빗 채널", "스마트 컨트랙트", "합의 메커니즘", "감사 추적"],
    color: "#3B82F6",
  },
  {
    category: "백엔드 아키텍처",
    icon: "🖥️",
    title: "AWS 클라우드 + 마이크로서비스",
    description: "확장 가능하고 안정적인 인프라로 대규모 트래픽을 처리합니다.",
    features: ["ECS 컨테이너", "RDS 데이터베이스", "CDN 배포", "오토 스케일링"],
    color: "#F97316",
  },
  {
    category: "인증 & 보안",
    icon: "🛡️",
    title: "다층 인증 시스템",
    description: "카카오 OAuth, 2FA, 생체인증으로 사용자를 보호합니다.",
    features: ["본인인증", "중복 탐지 AI", "실시간 모니터링", "암호화 저장"],
    color: "#9333EA",
  },
  {
    category: "프론트엔드",
    icon: "💻",
    title: "React + TypeScript",
    description: "반응형 UI/UX로 모든 기기에서 최적의 경험을 제공합니다.",
    features: ["SSR 최적화", "PWA 지원", "접근성 준수", "성능 최적화"],
    color: "#06B6D4",
  },
];

// ✅ 홈에서 이전: 래플 추첨 프로세스
const RAFFLE_PROCESS = [
  { step: "01", label: "캠페인 등록",          desc: "브랜드가 래플 캠페인을 Hyperledger Fabric에 등록" },
  { step: "02", label: "참여자 모집",          desc: "본인인증 후 공정하게 참여 (중복 차단 AI)" },
  { step: "03", label: "스마트 컨트랙트 추첨", desc: "Fabric 합의 메커니즘으로 당첨자 선정" },
  { step: "04", label: "결과 공개",            desc: "블록체인에서 누구나 결과 검증 가능" },
];

// ✅ 홈에서 이전: 구축 실적 (Portfolio)
const PORTFOLIO = [
  {
    brand: "NIKE",
    campaign: "Air Jordan 1 Retro High OG 래플",
    result: "참여자 12만 명, 부정 참여 0건",
    metric: "120,000",
    metricLabel: "참여자",
    color: "#111111",
    tag: "한정판 스니커즈",
  },
  {
    brand: "Supreme",
    campaign: "Box Logo Hoodie 시즌 캠페인",
    result: "서버 무중단, 당첨 결과 블록체인 공개",
    metric: "99.99%",
    metricLabel: "업타임",
    color: "#ED1C24",
    tag: "스트리트웨어",
  },
  {
    brand: "MUSINSA",
    campaign: "무신사 한정 컬래버 래플",
    result: "모바일 참여율 78%, 재참여율 65%",
    metric: "78%",
    metricLabel: "모바일 참여율",
    color: "#FF5C00",
    tag: "패션 플랫폼",
  },
];

// ✅ 홈에서 이전: 글로벌 파트너 브랜드 (PartnerBrands)
const PARTNER_BRANDS = [
  { name: "NIKE",        color: "#111111", size: "1.4rem", spacing: "0.1em" },
  { name: "adidas",      color: "#000000", size: "1.3rem", spacing: "0.05em" },
  { name: "MUSINSA",     color: "#FF5C00", size: "1rem",   spacing: "0.15em" },
  { name: "Supreme",     color: "#ED1C24", size: "1.4rem", spacing: "normal" },
  { name: "JORDAN",      color: "#CE1126", size: "1rem",   spacing: "0.2em" },
  { name: "New Balance", color: "#CF0A2C", size: "1rem",   spacing: "0.05em" },
  { name: "PUMA",        color: "#111111", size: "1.2rem", spacing: "0.25em" },
  { name: "CONVERSE",    color: "#E41C23", size: "1rem",   spacing: "0.12em" },
];

const TIMELINE = [
  { year: "2021", title: "nofake 설립",          desc: "블록체인 기반 투명 추첨 솔루션 연구 시작" },
  { year: "2022", title: "첫 B2B 파트너십 체결", desc: "공공기관 3곳 대상 PoC 성공적 완료" },
  { year: "2023", title: "서비스 정식 론칭",      desc: "Private Blockchain 메인넷 가동, 50개사 계약" },
  { year: "2024", title: "시리즈 A 투자 유치",    desc: "누적 투자 50억, 글로벌 시장 진출 준비" },
  { year: "2025", title: "글로벌 확장",           desc: "일본·동남아 시장 진출 및 200+ 파트너사 달성" },
];

const TEAM = [
  { name: "김지훈", role: "CEO / Co-Founder",  tag: "블록체인 아키텍트",    initial: "K" },
  { name: "이수연", role: "CTO / Co-Founder",  tag: "스마트컨트랙트 전문가", initial: "L" },
  { name: "박민재", role: "Head of Product",   tag: "UX & 서비스 전략",     initial: "P" },
  { name: "최지은", role: "Lead Engineer",     tag: "분산시스템 개발",       initial: "C" },
];

const VALUES = [
  { title: "Innovation",   desc: "끊임없는 기술 스택 업그레이드와 연구 개발",   color: tokens.blue },
  { title: "Collaboration", desc: "팀의 성장이 곧 서비스의 성장이라는 믿음",   color: "#10b981" },
  { title: "Integrity",    desc: "어떤 상황에서도 데이터의 정직함을 최우선",   color: "#f59e0b" },
];

const AWARDS = [
  { year: "2023", title: "과학기술정보통신부 장관상", org: "블록체인 혁신 기업 부문" },
  { year: "2024", title: "ISO 27001 인증 취득",       org: "정보보안 관리체계" },
  { year: "2024", title: "벤처기업 인증",             org: "중소벤처기업부" },
];

/* ─── SHARED COMPONENTS ──────────────────────────── */

function SectionLabel({ children, light = false }) {
  return (
    <p style={{
      color: light ? "#93c5fd" : tokens.blue,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontSize: "0.8rem",
      marginBottom: "12px",
    }}>
      {children}
    </p>
  );
}

function SectionTitle({ children, light = false }) {
  return (
    <h2 style={{
      fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)",
      fontWeight: 800,
      color: light ? tokens.white : tokens.navy,
      lineHeight: 1.2,
      marginBottom: "20px",
    }}>
      {children}
    </h2>
  );
}

function Divider() {
  return <div style={{ height: "1px", backgroundColor: tokens.border, margin: "80px 0" }} />;
}

/* ─── SECTIONS ───────────────────────────────────── */

// ✅ 홈 CompanyInfo의 Vision/Mission + 기존 MissionSection 통합
function MissionSection() {
  return (
    <FadeIn>
      <div style={{ maxWidth: "780px", marginBottom: "96px" }}>
        <SectionLabel>Our Mission</SectionLabel>
        <h1 style={{
          fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
          fontWeight: 900,
          color: tokens.navy,
          lineHeight: 1.15,
          marginBottom: "28px",
        }}>
          공정한 래플 문화를<br />
          <span style={{ color: tokens.blue }}>기술로 증명합니다.</span>
        </h1>
        <p style={{ fontSize: "1.15rem", color: tokens.sub, lineHeight: 1.9, maxWidth: "640px", marginBottom: "32px" }}>
          nofake는 '기회는 평등해야 한다'는 단순한 진리를 지키기 위해 모였습니다.
          Hyperledger Fabric 기반의 엔터프라이즈급 블록체인 솔루션으로
          투명하고 신뢰할 수 있는 래플 생태계를 구축해왔습니다.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "640px" }}>
          <div style={{
            background: `linear-gradient(135deg, ${tokens.blue}, #7c3aed)`,
            borderRadius: "1.25rem",
            padding: "28px",
            color: tokens.white,
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "12px" }}>🌏</div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bfdbfe", marginBottom: "8px" }}>Vision</p>
            <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "8px" }}>모든 래플이 공정한 세상</h3>
            <p style={{ fontSize: "0.82rem", color: "#bfdbfe", lineHeight: 1.7 }}>
              전 세계 어디서나 누구나 공정하게 참여할 수 있는 래플 문화를 만듭니다.
            </p>
          </div>
          <div style={{
            backgroundColor: tokens.white,
            border: `1px solid ${tokens.border}`,
            borderRadius: "1.25rem",
            padding: "28px",
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "12px" }}>✅</div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: tokens.blue, marginBottom: "8px" }}>Mission</p>
            <h3 style={{ fontWeight: 800, fontSize: "1rem", color: tokens.navy, marginBottom: "8px" }}>기술로 신뢰를 증명한다</h3>
            <p style={{ fontSize: "0.82rem", color: tokens.gray, lineHeight: 1.7 }}>
              1인 1계정 인증으로 부정 참여를 차단하고, 모든 추첨 과정을 투명하게 공개합니다.
            </p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function StatsSection() {
  return (
    <FadeIn>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "2px",
        marginBottom: "96px",
        backgroundColor: tokens.border,
        border: `1px solid ${tokens.border}`,
        borderRadius: "1.25rem",
        overflow: "hidden",
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ backgroundColor: tokens.white, padding: "40px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, color: tokens.blue, marginBottom: "8px" }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.85rem", color: tokens.gray, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

// ✅ 홈 TechnologyStack을 회사소개 기술력 섹션으로 이전·강화
function TechStackSection() {
  return (
    <section style={{ marginBottom: "96px" }}>
      <FadeIn>
        <SectionLabel>Technology Stack</SectionLabel>
        <SectionTitle>엔터프라이즈급 기술력</SectionTitle>
        <p style={{ color: tokens.sub, lineHeight: 1.8, marginBottom: "48px", maxWidth: "600px" }}>
          Hyperledger Fabric을 중심으로 한 프로덕션 수준의 기술 스택으로
          안정성과 확장성을 보장합니다.
        </p>
      </FadeIn>

      {/* 상세 기술 카드 4개 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {TECH_STACK.map((tech, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{
              backgroundColor: tokens.white,
              border: `1px solid ${tokens.border}`,
              borderRadius: "1.5rem",
              overflow: "hidden",
            }}>
              <div style={{ height: "4px", background: tech.color }} />
              <div style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "12px",
                    background: tech.color, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "1.4rem", flexShrink: 0,
                  }}>
                    {tech.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: tokens.gray, marginBottom: "4px" }}>
                      {tech.category}
                    </p>
                    <h3 style={{ fontWeight: 800, color: tokens.navy, fontSize: "1rem" }}>{tech.title}</h3>
                  </div>
                </div>
                <p style={{ color: tokens.sub, fontSize: "0.87rem", lineHeight: 1.7, marginBottom: "16px" }}>{tech.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {tech.features.map((f, j) => (
                    <span key={j} style={{
                      fontSize: "0.72rem", backgroundColor: tokens.grayLight,
                      color: tokens.gray, borderRadius: "999px", padding: "3px 10px", fontWeight: 500,
                    }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* ✅ 홈에서 이전: 래플 추첨 프로세스 */}
      <FadeIn>
        <div style={{
          backgroundColor: tokens.white,
          border: `1px solid ${tokens.border}`,
          borderRadius: "1.5rem",
          padding: "40px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        }}>
          <h3 style={{ fontWeight: 800, color: tokens.navy, fontSize: "1.25rem", textAlign: "center", marginBottom: "36px" }}>
            래플 추첨 프로세스
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {RAFFLE_PROCESS.map((p, i) => (
              <div key={i} style={{
                textAlign: "center",
                padding: "24px 16px",
                backgroundColor: tokens.grayLight,
                borderRadius: "1rem",
                border: `1px solid ${tokens.border}`,
                position: "relative",
              }}>
                <div style={{ fontSize: "2.5rem", fontWeight: 900, color: `${tokens.blue}55`, marginBottom: "10px" }}>
                  {p.step}
                </div>
                <div style={{ fontWeight: 700, color: tokens.navy, marginBottom: "8px" }}>{p.label}</div>
                <div style={{ fontSize: "0.82rem", color: tokens.gray, lineHeight: 1.6 }}>{p.desc}</div>
                {i < RAFFLE_PROCESS.length - 1 && (
                  <div style={{
                    position: "absolute", right: "-10px", top: "50%",
                    transform: "translateY(-50%)", fontSize: "1.2rem", color: tokens.blue,
                    display: "none", // 모바일에서 숨김 (데스크탑에서만 보이게 하려면 JS로 처리)
                  }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ✅ 홈 PartnerBrands를 회사소개로 이전
function GlobalPartnersSection() {
  return (
    <section style={{ marginBottom: "96px", overflow: "hidden" }}>
      <FadeIn>
        <SectionLabel>Trusted By</SectionLabel>
        <SectionTitle>글로벌 브랜드와의 협업 실적</SectionTitle>
        <p style={{ color: tokens.sub, lineHeight: 1.8, marginBottom: "36px", maxWidth: "540px" }}>
          세계적으로 인정받는 브랜드들이 nofake를 선택했습니다.
        </p>
      </FadeIn>

      {/* 마퀴 슬라이더 */}
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", inset: "0", left: 0, width: "120px", zIndex: 1,
          background: "linear-gradient(to right, white, transparent)",
        }} />
        <div style={{
          position: "absolute", inset: "0", right: 0, left: "auto", width: "120px", zIndex: 1,
          background: "linear-gradient(to left, white, transparent)",
        }} />
        <div style={{
          display: "flex",
          borderTop: `1px solid ${tokens.border}`,
          borderBottom: `1px solid ${tokens.border}`,
          padding: "28px 0",
          width: "max-content",
          animation: "marquee 40s linear infinite",
        }}>
          {[...PARTNER_BRANDS, ...PARTNER_BRANDS].map((brand, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <span style={{
                fontWeight: 900,
                whiteSpace: "nowrap",
                padding: "0 40px",
                color: brand.color,
                fontSize: brand.size,
                letterSpacing: brand.spacing,
              }}>
                {brand.name}
              </span>
              <span style={{ width: "1px", height: "20px", backgroundColor: tokens.border, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ✅ 홈 Portfolio를 구축 실적으로 이전 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "48px" }}>
        {PORTFOLIO.map((c, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{
              backgroundColor: tokens.white,
              border: `1px solid ${tokens.border}`,
              borderRadius: "1.5rem",
              overflow: "hidden",
            }}>
              <div style={{ height: "4px", backgroundColor: c.color }} />
              <div style={{ padding: "28px" }}>
                <span style={{
                  display: "inline-block",
                  fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: tokens.gray,
                  backgroundColor: tokens.grayLight, borderRadius: "999px",
                  padding: "3px 10px", marginBottom: "14px",
                }}>
                  {c.tag}
                </span>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: c.color, marginBottom: "4px" }}>
                  {c.brand}
                </div>
                <h3 style={{ fontWeight: 700, color: tokens.navy, fontSize: "0.95rem", marginBottom: "16px", lineHeight: 1.5 }}>
                  {c.campaign}
                </h3>
                <div style={{
                  backgroundColor: tokens.grayLight,
                  borderRadius: "0.75rem",
                  padding: "16px",
                  marginBottom: "14px",
                }}>
                  <div style={{ fontSize: "1.6rem", fontWeight: 900, color: tokens.navy }}>{c.metric}</div>
                  <div style={{ fontSize: "0.75rem", color: tokens.gray, marginTop: "2px" }}>{c.metricLabel}</div>
                </div>
                <p style={{ fontSize: "0.85rem", color: tokens.sub, lineHeight: 1.7 }}>{c.result}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

function TimelineSection() {
  return (
    <section style={{ marginBottom: "96px" }}>
      <FadeIn>
        <SectionLabel>History</SectionLabel>
        <SectionTitle>nofake의 걸어온 길</SectionTitle>
      </FadeIn>
      <div style={{ position: "relative", marginTop: "48px" }}>
        <div style={{
          position: "absolute", left: "50%", top: 0, bottom: 0,
          width: "2px", backgroundColor: tokens.border, transform: "translateX(-50%)",
        }} />
        {TIMELINE.map((item, i) => {
          const isLeft = i % 2 === 0;
          return (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{
                display: "flex",
                justifyContent: isLeft ? "flex-start" : "flex-end",
                marginBottom: "40px",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", left: "50%", top: "20px",
                  transform: "translate(-50%,-50%)",
                  width: "14px", height: "14px",
                  backgroundColor: tokens.blue, borderRadius: "50%",
                  border: `3px solid ${tokens.white}`,
                  boxShadow: `0 0 0 2px ${tokens.blue}`, zIndex: 1,
                }} />
                <div style={{
                  width: "calc(50% - 48px)",
                  backgroundColor: tokens.white,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: "1rem",
                  padding: "24px 28px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}>
                  <span style={{
                    display: "inline-block", backgroundColor: tokens.blueLight,
                    color: tokens.blue, fontSize: "0.78rem", fontWeight: 700,
                    padding: "2px 10px", borderRadius: "999px", marginBottom: "10px",
                  }}>
                    {item.year}
                  </span>
                  <h4 style={{ fontWeight: 700, color: tokens.navy, marginBottom: "6px" }}>{item.title}</h4>
                  <p style={{ fontSize: "0.875rem", color: tokens.gray, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section style={{ marginBottom: "96px" }}>
      <FadeIn>
        <SectionLabel>Team</SectionLabel>
        <SectionTitle>함께 만드는 사람들</SectionTitle>
        <p style={{ color: tokens.sub, marginBottom: "48px", maxWidth: "540px", lineHeight: 1.8 }}>
          블록체인 아키텍트, 스마트컨트랙트 개발자, 보안 전문가,
          UX 디자이너가 하나의 목표 아래 모였습니다.
        </p>
      </FadeIn>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
        {TEAM.map((m, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{
              backgroundColor: tokens.white,
              border: `1px solid ${tokens.border}`,
              borderRadius: "1.25rem",
              padding: "32px 24px",
              textAlign: "center",
            }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                backgroundColor: tokens.blueLight, color: tokens.blue,
                fontSize: "1.6rem", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                {m.initial}
              </div>
              <h4 style={{ fontWeight: 700, color: tokens.navy, marginBottom: "4px" }}>{m.name}</h4>
              <p style={{ fontSize: "0.8rem", color: tokens.blue, fontWeight: 600, marginBottom: "8px" }}>{m.role}</p>
              <span style={{
                fontSize: "0.75rem", backgroundColor: tokens.grayLight,
                color: tokens.gray, padding: "3px 10px", borderRadius: "999px",
              }}>
                {m.tag}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <FadeIn>
      <section style={{
        backgroundColor: tokens.navy,
        borderRadius: "2rem",
        padding: "clamp(40px, 6vw, 80px)",
        color: tokens.white,
        position: "relative",
        overflow: "hidden",
        marginBottom: "96px",
      }}>
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: "320px", height: "320px",
          backgroundColor: "rgba(37,99,235,0.25)",
          filter: "blur(90px)", zIndex: 0,
        }} />
        <div style={{
          position: "relative", zIndex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "48px", alignItems: "start",
        }}>
          <div>
            <div style={{ width: "44px", height: "44px", backgroundColor: tokens.blue, borderRadius: "50%", marginBottom: "28px" }} />
            <SectionLabel light>Culture</SectionLabel>
            <SectionTitle light>The nofake Team</SectionTitle>
            <p style={{ color: "#9ca3af", lineHeight: 1.8, marginBottom: "28px" }}>
              수평적인 소통을 통해 최고의 솔루션을 도출합니다.
              모든 팀원은 개발자이자 설계자로서 프로젝트의 방향성을 함께 고민합니다.
            </p>
            <button style={{
              background: "none", border: "none", color: tokens.white,
              fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px",
              padding: 0, fontSize: "0.95rem",
            }}>
              채용 정보 확인하기 <span style={{ color: tokens.blue }}>↗</span>
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {VALUES.map((v, i) => (
              <div key={i} style={{ borderLeft: `2px solid ${i === 0 ? v.color : "#374151"}`, paddingLeft: "24px" }}>
                <h4 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "6px" }}>{v.title}</h4>
                <p style={{ color: "#9ca3af", fontSize: "0.875rem", lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

function AwardsSection() {
  return (
    <section style={{ marginBottom: "96px" }}>
      <FadeIn>
        <SectionLabel>Awards & Certifications</SectionLabel>
        <SectionTitle>수상 및 인증</SectionTitle>
      </FadeIn>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginTop: "36px" }}>
        {AWARDS.map((a, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{
              display: "flex", gap: "20px", alignItems: "flex-start",
              padding: "24px 28px",
              backgroundColor: tokens.grayLight,
              borderRadius: "1rem", border: `1px solid ${tokens.border}`,
            }}>
              <div style={{
                width: "44px", height: "44px", flexShrink: 0,
                backgroundColor: tokens.blueLight, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem",
              }}>🏆</div>
              <div>
                <span style={{ fontSize: "0.75rem", color: tokens.blue, fontWeight: 700 }}>{a.year}</span>
                <h4 style={{ fontWeight: 700, color: tokens.navy, margin: "4px 0", fontSize: "0.95rem" }}>{a.title}</h4>
                <p style={{ fontSize: "0.8rem", color: tokens.gray }}>{a.org}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function ContactCTA() {
  return (
    <FadeIn>
      <section style={{
        backgroundColor: tokens.blueLight,
        borderRadius: "2rem",
        padding: "clamp(40px, 6vw, 72px)",
        textAlign: "center",
      }}>
        <SectionLabel>Contact</SectionLabel>
        <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", fontWeight: 800, color: tokens.navy, marginBottom: "16px" }}>
          nofake와 함께 시작해보세요
        </h2>
        <p style={{ color: tokens.sub, lineHeight: 1.8, maxWidth: "500px", margin: "0 auto 36px" }}>
          공정한 추첨 시스템이 필요하신가요? 도입 상담부터 기술 검토까지 함께합니다.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{
            backgroundColor: tokens.blue, color: tokens.white,
            padding: "14px 32px", borderRadius: "0.75rem",
            border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem",
          }}>
            도입 문의하기
          </button>
          <button style={{
            backgroundColor: tokens.white, color: tokens.navy,
            padding: "14px 32px", borderRadius: "0.75rem",
            border: `1px solid ${tokens.border}`,
            fontWeight: 700, cursor: "pointer", fontSize: "0.95rem",
          }}>
            자료 다운로드
          </button>
        </div>
      </section>
    </FadeIn>
  );
}

/* ─── MAIN EXPORT ────────────────────────────────── */
export const CompanyPage = () => {
  return (
    <div style={{ paddingTop: "96px", paddingBottom: "96px", backgroundColor: tokens.white, fontFamily: font }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(16px, 4vw, 48px)" }}>

        {/* 1. 미션 + 비전 (홈 CompanyInfo 통합) */}
        <MissionSection />

        {/* 2. 핵심 수치 */}
        <StatsSection />

        <Divider />

        {/* 3. 엔터프라이즈급 기술력 + 래플 추첨 프로세스 (홈에서 이전) */}
        <TechStackSection />

        <Divider />

        {/* 4. 글로벌 브랜드 협업 실적 + 구축 실적 (홈에서 이전) */}
        <GlobalPartnersSection />

        <Divider />

        {/* 5. 연혁 */}
        <TimelineSection />

        <Divider />

        {/* 6. 팀 */}
        <TeamSection />

        {/* 7. 핵심 가치 */}
        <ValuesSection />

        {/* 8. 수상 및 인증 */}
        <AwardsSection />

        {/* 9. CTA */}
        <ContactCTA />

      </div>
    </div>
  );
};
