import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

const T = {
  blue: "#2563eb",
  navy: "#0f172a",
  gray: "#64748b",
  grayLight: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
  text: "#1e293b",
  sub: "#475569",
  green: "#10b981",
  greenLight: "#ecfdf5",
  purple: "#7c3aed",
  amber: "#f59e0b",
  red: "#ef4444",
};

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setVis(true); obs.disconnect(); }
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis] as const;
}

function FadeIn({ children, delay = 0, y = 24, style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : `translateY(${y}px)`,
        transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const Container = ({ children, style = {} }) => (
  <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)", ...style }}>
    {children}
  </div>
);

const Label = ({ children, center = false }) => (
  <p style={{
    color: T.blue, fontWeight: 700, letterSpacing: ".1em",
    textTransform: "uppercase", fontSize: ".78rem", marginBottom: 10,
    textAlign: center ? "center" : undefined,
  }}>
    {children}
  </p>
);

/* ─── DATA ─────────────────────────────────────────── */

const STATS = [
  { num: "1.2M+", label: "누적 응모 건수",  sub: "2023년 기준" },
  { num: "340+",  label: "파트너 브랜드",   sub: "글로벌·로컬 합산" },
  { num: "0건",   label: "당첨 분쟁 발생",  sub: "서비스 출시 이후" },
  { num: "99.9%", label: "시스템 가동률",   sub: "SLA 보장" },
];

const PARTNERS = [
  "Nike","Adidas","New Balance","Asics","Salehe Bembury",
  "Kith","SNKRS","Kasina","Reebok","Puma",
];

const LIVE_RAFFLES = [
  { brand: "Nike",        name: "Air Jordan 1 Retro High OG", deadline: "D-3", participants: "38,204", winners: "500",  status: "진행중" },
  { brand: "New Balance", name: "990v6 Made in USA",           deadline: "D-7", participants: "21,580", winners: "200",  status: "진행중" },
  { brand: "Adidas",      name: "Yeezy Boost 350 V2",          deadline: "D-1", participants: "54,912", winners: "800",  status: "마감임박" },
];

const VALUES = [
  {
    icon: "⚖️", title: "공정성", color: T.green, colorLight: T.greenLight,
    desc: "스마트컨트랙트가 추첨 전 과정을 자동 실행합니다. 어떤 관리자도 결과를 바꿀 수 없습니다.",
    path: "/about/fairness",
  },
  {
    icon: "🔍", title: "투명성", color: T.purple, colorLight: "#f5f3ff",
    desc: "모든 트랜잭션은 블록체인 원장에 기록되며, 참가자 누구나 결과를 직접 검증할 수 있습니다.",
    path: "/about/transparency",
  },
  {
    icon: "🤝", title: "신뢰", color: T.amber, colorLight: "#fffbeb",
    desc: "ISO 27001, DID 인증, 200+ 공공기관 납품 실적. 데이터 무결성 위의 변하지 않는 약속입니다.",
    path: "/about/trust",
  },
];

const PROCESS = [
  { num: "01", title: "파트너 신청",            icon: "📋", desc: "브랜드가 래플 정보(상품명·수량·기간)를 제출합니다. 대시보드에서 5분 내 등록 완료." },
  { num: "02", title: "응모 페이지 자동 생성",  icon: "🎟", desc: "nofake가 DID 인증 기반 응모 페이지를 자동으로 만들어드립니다. 중복 응모 원천 차단." },
  { num: "03", title: "하이퍼레저 추첨 실행",   icon: "⛓", desc: "마감 즉시 스마트컨트랙트가 VRF 기반 추첨을 자동 실행합니다. 인간 개입 불가." },
  { num: "04", title: "결과 공개 & 검증",       icon: "📣", desc: "당첨 트랜잭션 해시가 즉시 공개됩니다. 누구나 블록 익스플로러에서 검증 가능." },
];

// ✅ 홈 CoreServices에서 이전
const CORE_SERVICES = [
  {
    icon: "📈",
    title: "캠페인 관리",
    description: "실시간 대시보드로 캠페인 성과를 한눈에 파악하고 관리합니다.",
    features: ["실시간 분석", "참여자 통계", "자동 추첨"],
    color: T.blue,
  },
  {
    icon: "🔒",
    title: "블록체인 보안",
    description: "Hyperledger Fabric 기반으로 모든 거래를 불변 기록합니다.",
    features: ["위변조 방지", "투명성 보장", "감사 추적"],
    color: T.purple,
  },
  {
    icon: "👥",
    title: "사용자 인증",
    description: "1인 1계정 시스템으로 공정성을 보장합니다.",
    features: ["본인인증", "중복 차단", "AI 모니터링"],
    color: "#EC4899",
  },
];

// ✅ 홈 ActiveRaffles에서 이전
const RAFFLE_ITEMS = [
  {
    brand: "NIKE",    title: "Air Jordan 1 Retro High OG", image: "🏀",
    deadline: "2025-05-20", participants: 120000, prize: "한정판 스니커즈 (5명)", color: "#111111",
  },
  {
    brand: "Supreme", title: "Box Logo Hoodie",             image: "👕",
    deadline: "2025-05-25", participants: 85000,  prize: "박스로고 후드 (3명)",   color: "#ED1C24",
  },
  {
    brand: "MUSINSA", title: "한정 컬래버 패션 세트",       image: "👔",
    deadline: "2025-05-30", participants: 95000,  prize: "컬래버 패션 세트 (10명)", color: "#FF5C00",
  },
];

const ECOSYSTEM = [
  { type: "Global Brands",       icon: "🌐", desc: "전 세계 주요 스포츠 및 럭셔리 브랜드의 공식 래플 연동" },
  { type: "Local Select Shops",  icon: "🏪", desc: "국내외 대형 편집숍 및 온라인 플랫폼의 실시간 이벤트 통합" },
  { type: "Artists & Creators",  icon: "🎨", desc: "개인 아티스트 및 신진 디자이너의 한정판 드롭 지원" },
];

/* ─── EXISTING SECTIONS ─────────────────────────── */

function HeroSection() {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${T.navy} 0%, #1e3a8a 100%)`,
      padding: "clamp(80px,10vw,140px) 0 clamp(64px,8vw,100px)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)",
        backgroundSize: "60px 60px", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", top: "-80px", right: "-80px",
        width: 520, height: 520,
        background: "radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)",
        zIndex: 0,
      }} />
      <Container style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 64 }}>
          <div style={{ flex: "1 1 320px" }}>
            <FadeIn>
              <span style={{
                display: "inline-block", padding: "5px 14px",
                backgroundColor: "rgba(96,165,250,.2)", border: "1px solid rgba(96,165,250,.4)",
                borderRadius: 999, fontSize: ".78rem", color: "#93c5fd",
                fontWeight: 700, letterSpacing: ".08em", marginBottom: 20,
              }}>
                BLOCKCHAIN-POWERED RAFFLE PLATFORM
              </span>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 900, color: T.white, lineHeight: 1.15, marginBottom: 24 }}>
                세상의 모든 한정판 래플을<br />
                <span style={{ color: "#60a5fa" }}>단 하나의 채널</span>에서
              </h1>
            </FadeIn>
            <FadeIn delay={0.14}>
              <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.8, marginBottom: 40, maxWidth: 520 }}>
                글로벌 스포츠 브랜드부터 트렌디한 로컬 편집숍까지.<br />
                흩어져 있는 래플 이벤트를 nofake가 블록체인 기술로 하나로 연결합니다.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 36 }}>
                <Link to="/raffles" style={{
                  padding: "14px 32px", backgroundColor: T.blue,
                  color: T.white, borderRadius: 10, fontWeight: 700,
                  fontSize: "1rem", textDecoration: "none", display: "inline-block",
                }}>
                  통합 래플 센터 입장 →
                </Link>
                <Link to="/partnership" style={{
                  padding: "14px 28px", backgroundColor: "rgba(255,255,255,.08)",
                  color: T.white, border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 10, fontWeight: 600, fontSize: "1rem",
                  textDecoration: "none", display: "inline-block",
                }}>
                  파트너 입점 문의
                </Link>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {["✓ 하이퍼레저 패브릭 기반", "✓ DID 신원인증"].map((t) => (
                  <span key={t} style={{
                    padding: "5px 12px", background: "rgba(255,255,255,.08)",
                    borderRadius: 999, fontSize: ".8rem", color: "#94a3b8",
                  }}>{t}</span>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.28} style={{ flex: "1 1 280px", maxWidth: 400 }}>
            <div style={{
              background: "rgba(255,255,255,.06)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,.12)", borderRadius: "2rem", padding: "32px 28px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: T.green, display: "inline-block", boxShadow: "0 0 0 3px rgba(16,185,129,.3)" }} />
                <span style={{ color: "#6ee7b7", fontSize: ".8rem", fontWeight: 700 }}>LIVE 래플 현황</span>
              </div>
              {LIVE_RAFFLES.map((r, i) => (
                <div key={i} style={{ padding: "14px 0", borderBottom: i < LIVE_RAFFLES.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#60a5fa", fontSize: ".75rem", fontWeight: 700 }}>{r.brand}</span>
                    <span style={{
                      fontSize: ".72rem", fontWeight: 700, padding: "2px 8px",
                      backgroundColor: r.status === "마감임박" ? "rgba(239,68,68,.2)" : "rgba(16,185,129,.2)",
                      color: r.status === "마감임박" ? "#fca5a5" : "#6ee7b7",
                      borderRadius: 999,
                    }}>{r.deadline}</span>
                  </div>
                  <p style={{ color: T.white, fontWeight: 600, fontSize: ".87rem", margin: "0 0 4px" }}>{r.name}</p>
                  <p style={{ color: "#64748b", fontSize: ".75rem", margin: 0 }}>{r.participants}명 응모 · {r.winners}명 당첨</p>
                </div>
              ))}
              <Link to="/raffles" style={{
                display: "block", textAlign: "center", marginTop: 20, padding: "10px",
                backgroundColor: "rgba(37,99,235,.3)", border: "1px solid rgba(96,165,250,.3)",
                borderRadius: 10, color: "#93c5fd", fontWeight: 600, fontSize: ".85rem", textDecoration: "none",
              }}>
                전체 래플 보기 →
              </Link>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}

function StatsSection() {
  return (
    <section style={{ backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
      <Container>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {STATS.map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{
                padding: "48px 32px", textAlign: "center",
                borderRight: i < STATS.length - 1 ? `1px solid ${T.border}` : "none",
              }}>
                <p style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 900, color: T.navy, margin: 0, lineHeight: 1 }}>{s.num}</p>
                <p style={{ fontWeight: 700, color: T.text, margin: "8px 0 4px", fontSize: ".95rem" }}>{s.label}</p>
                <p style={{ color: T.gray, fontSize: ".78rem", margin: 0 }}>{s.sub}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PartnerStrip() {
  return (
    <section style={{ backgroundColor: T.grayLight, padding: "40px 0", borderBottom: `1px solid ${T.border}` }}>
      <Container>
        <p style={{ textAlign: "center", fontSize: ".78rem", fontWeight: 700, color: T.gray, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 24 }}>
          함께하는 파트너 브랜드
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 32px" }}>
          {PARTNERS.map((p, i) => (
            <span key={i} style={{ fontSize: ".95rem", fontWeight: 800, color: "#94a3b8", letterSpacing: ".04em", padding: "4px 0" }}>{p}</span>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ✅ 홈 ActiveRaffles에서 이전 — 파트너 스트립 직후 배치
function ActiveRafflesSection() {
  const [modalRaffle, setModalRaffle] = useState(null);

  return (
    <section style={{ padding: "96px 0", backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
      <Container>
        <FadeIn>
          <Label center>🎫 Live Raffles</Label>
          <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.25rem)", fontWeight: 800, color: T.navy, textAlign: "center", marginBottom: 16 }}>
            지금 응모 가능한 래플
          </h2>
          <p style={{ color: T.sub, textAlign: "center", marginBottom: 64 }}>
            글로벌 브랜드의 한정 상품을 공정하게 응모해보세요
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {RAFFLE_ITEMS.map((raffle, i) => {
            const daysLeft = Math.max(0, Math.ceil((new Date(raffle.deadline).getTime() - Date.now()) / 86400000));
            return (
              <FadeIn key={i} delay={i * 0.1}>
                <div
                  onClick={() => setModalRaffle(raffle)}
                  style={{
                    backgroundColor: T.white, border: `1px solid ${T.border}`,
                    borderRadius: "1.5rem", overflow: "hidden", cursor: "pointer",
                    transition: "box-shadow .2s, transform .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.1)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ height: "4px", backgroundColor: raffle.color }} />
                  <div style={{ padding: "32px 28px 20px", background: T.grayLight, textAlign: "center" }}>
                    <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>{raffle.image}</div>
                    <p style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: T.gray, marginBottom: 4 }}>Brand</p>
                    <h3 style={{ fontWeight: 900, color: T.navy, fontSize: "1.3rem" }}>{raffle.brand}</h3>
                  </div>
                  <div style={{ padding: "20px 28px 28px" }}>
                    <p style={{ fontWeight: 600, color: T.text, fontSize: ".9rem", marginBottom: 16, lineHeight: 1.5 }}>{raffle.title}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                      {[
                        ["🎟", `${raffle.participants.toLocaleString()}명 응모`],
                        ["📅", `${daysLeft}일 남음`],
                        ["🎁", raffle.prize],
                      ].map(([icon, text]) => (
                        <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem", color: T.sub }}>
                          <span>{icon}</span><span>{text}</span>
                        </div>
                      ))}
                    </div>
                    {/* 마감 진행바 */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: ".72rem", color: T.gray, marginBottom: 6 }}>마감까지</div>
                      <div style={{ backgroundColor: T.border, borderRadius: 99, height: 6, overflow: "hidden" }}>
                        <div style={{
                          width: `${Math.max(10, Math.min(100, (daysLeft / 30) * 100))}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, ${T.blue}, ${T.purple})`,
                          borderRadius: 99,
                        }} />
                      </div>
                    </div>
                    <button style={{
                      width: "100%", padding: "12px",
                      background: `linear-gradient(135deg, ${T.blue}, ${T.purple})`,
                      color: T.white, borderRadius: 10, fontWeight: 700,
                      fontSize: ".9rem", border: "none", cursor: "pointer",
                    }}>
                      응모하기 →
                    </button>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link to="/raffles" style={{
              display: "inline-block", padding: "13px 32px",
              backgroundColor: T.navy, color: T.white,
              borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: ".95rem",
            }}>
              전체 래플 보기 →
            </Link>
          </div>
        </FadeIn>
      </Container>

      {/* 응모 모달 */}
      {modalRaffle && (
        <RaffleModal raffle={modalRaffle} onClose={() => setModalRaffle(null)} />
      )}
    </section>
  );
}

function RaffleModal({ raffle, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const allFilled = form.name && form.email && form.phone;
  const ticketNum = "#NF" + Math.random().toString(36).substring(2, 9).toUpperCase();

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: T.white, borderRadius: "1.5rem", maxWidth: 400, width: "100%", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,.15)" }}
      >
        {/* 헤더 */}
        <div style={{ background: `linear-gradient(135deg, ${T.navy}, #1e3a8a)`, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: T.white, fontWeight: 700, fontSize: ".9rem", margin: 0 }}>래플 응모</p>
            <p style={{ color: "#93c5fd", fontSize: ".75rem", margin: "2px 0 0" }}>{raffle.brand} — {raffle.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
        </div>

        <div style={{ padding: 24 }}>
          {step === 1 && (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: "3rem", marginBottom: 8 }}>{raffle.image}</div>
                <p style={{ fontWeight: 700, color: T.navy, margin: "0 0 4px" }}>{raffle.brand}</p>
                <p style={{ color: T.gray, fontSize: ".85rem", margin: 0 }}>{raffle.title}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {[["성명", "name", "text"], ["이메일", "email", "email"], ["휴대폰 번호", "phone", "tel"]].map(([ph, key, type]) => (
                  <input
                    key={key} type={type} placeholder={ph}
                    value={form[key]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{ padding: "10px 14px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: ".9rem", outline: "none" }}
                  />
                ))}
              </div>
              <div style={{ background: T.grayLight, borderRadius: 8, padding: "12px 14px", marginBottom: 20, fontSize: ".8rem", color: T.sub, lineHeight: 1.7 }}>
                <strong>상품:</strong> {raffle.prize}<br />
                <strong>마감:</strong> {raffle.deadline}
              </div>
              <button
                onClick={() => allFilled && setStep(2)}
                style={{
                  width: "100%", padding: "12px", borderRadius: 8, border: "none",
                  background: allFilled ? T.blue : T.border,
                  color: allFilled ? T.white : T.gray,
                  fontWeight: 700, cursor: allFilled ? "pointer" : "not-allowed",
                }}
              >
                본인인증 진행
              </button>
            </>
          )}

          {step === 2 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 64, height: 64, background: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "1.8rem" }}>🛡️</div>
              <h3 style={{ fontWeight: 800, color: T.navy, marginBottom: 8 }}>본인인증 완료</h3>
              <p style={{ color: T.gray, fontSize: ".9rem", marginBottom: 24 }}>{form.name}님이 인증되었습니다.<br />래플에 응모하시겠습니까?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => setStep(3)} style={{ padding: "12px", backgroundColor: T.blue, color: T.white, borderRadius: 8, border: "none", fontWeight: 700, cursor: "pointer" }}>응모하기</button>
                <button onClick={() => setStep(1)} style={{ padding: "12px", backgroundColor: T.white, color: T.gray, borderRadius: 8, border: `1px solid ${T.border}`, fontWeight: 600, cursor: "pointer" }}>뒤로가기</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 64, height: 64, background: T.greenLight, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "1.8rem" }}>✅</div>
              <h3 style={{ fontWeight: 800, color: T.navy, marginBottom: 8 }}>응모 완료!</h3>
              <p style={{ color: T.gray, fontSize: ".9rem", marginBottom: 20 }}>
                {raffle.brand} {raffle.title} 래플에<br />성공적으로 응모했습니다.
              </p>
              <div style={{ background: T.greenLight, borderRadius: 8, padding: "12px 14px", marginBottom: 20, fontSize: ".8rem", color: T.sub, lineHeight: 1.7, textAlign: "left" }}>
                <strong>응모 번호:</strong> {ticketNum}<br />
                <strong>추첨 예정일:</strong> {raffle.deadline}<br />
                <strong>결과 안내:</strong> 이메일로 발송됩니다
              </div>
              <button onClick={onClose} style={{ width: "100%", padding: "12px", backgroundColor: T.blue, color: T.white, borderRadius: 8, border: "none", fontWeight: 700, cursor: "pointer" }}>닫기</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ValuesSection() {
  return (
    <section style={{ backgroundColor: T.grayLight, padding: "96px 0" }}>
      <Container>
        <FadeIn>
          <Label center>Core Values</Label>
          <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.25rem)", fontWeight: 800, color: T.navy, textAlign: "center", marginBottom: 16 }}>
            nofake가 추구하는 핵심 가치
          </h2>
          <p style={{ color: T.sub, textAlign: "center", marginBottom: 64, lineHeight: 1.8 }}>
            공정성, 투명성, 신뢰 — 세 가지 가치가 모든 기술의 기반입니다.
          </p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {VALUES.map((v, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{
                backgroundColor: T.white, padding: "40px 36px", borderRadius: "1.5rem",
                border: `1px solid ${T.border}`, height: "100%", boxSizing: "border-box",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{
                  width: 56, height: 56, backgroundColor: v.colorLight,
                  borderRadius: "1rem", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.6rem", marginBottom: 24,
                }}>{v.icon}</div>
                <h4 style={{ fontSize: "1.25rem", fontWeight: 800, color: T.navy, marginBottom: 12 }}>{v.title}</h4>
                <p style={{ color: T.gray, lineHeight: 1.7, fontSize: ".93rem", flex: 1, marginBottom: 28 }}>{v.desc}</p>
                <Link to={v.path} style={{
                  fontSize: ".85rem", fontWeight: 700, color: v.color, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "10px 20px", backgroundColor: v.colorLight,
                  borderRadius: 8, border: `1px solid ${v.color}22`,
                }}>
                  자세히 알아보기 →
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProcessSection() {
  return (
    <section style={{ padding: "96px 0" }}>
      <Container>
        <FadeIn>
          <Label center>How It Works</Label>
          <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.25rem)", fontWeight: 800, color: T.navy, textAlign: "center", marginBottom: 16 }}>
            래플 정보 제출부터 결과 발표까지
          </h2>
          <p style={{ color: T.sub, textAlign: "center", marginBottom: 64 }}>4단계로 완성되는 공정한 추첨 프로세스</p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {PROCESS.map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{
                backgroundColor: T.white, border: `1px solid ${T.border}`,
                borderRadius: "1.5rem", padding: "36px 28px",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 16, right: 20, fontSize: "3rem", fontWeight: 900, color: T.border, lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: "2rem", marginBottom: 20 }}>{s.icon}</div>
                <div style={{ width: 36, height: 3, backgroundColor: T.blue, marginBottom: 16, borderRadius: 99 }} />
                <h4 style={{ fontWeight: 700, color: T.navy, marginBottom: 10, fontSize: "1rem" }}>{s.title}</h4>
                <p style={{ color: T.gray, fontSize: ".875rem", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ✅ 홈 CoreServices에서 이전 — ProcessSection 다음 배치
function CoreServicesSection() {
  return (
    <section style={{ padding: "96px 0", backgroundColor: T.grayLight, borderTop: `1px solid ${T.border}` }}>
      <Container>
        <FadeIn>
          <Label center>Core Services</Label>
          <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.25rem)", fontWeight: 800, color: T.navy, textAlign: "center", marginBottom: 16 }}>
            핵심 솔루션
          </h2>
          <p style={{ color: T.sub, textAlign: "center", marginBottom: 64 }}>
            래플 플랫폼 운영에 필요한 모든 기능
          </p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {CORE_SERVICES.map((svc, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{
                backgroundColor: T.white, border: `1px solid ${T.border}`,
                borderRadius: "1.5rem", overflow: "hidden",
                transition: "box-shadow .2s, transform .2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.08)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ height: "4px", backgroundColor: svc.color }} />
                <div style={{ padding: "32px 28px" }}>
                  <div style={{
                    width: 56, height: 56, backgroundColor: `${svc.color}15`,
                    borderRadius: "1rem", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "1.8rem", marginBottom: 20,
                  }}>{svc.icon}</div>
                  <h3 style={{ fontWeight: 800, color: T.navy, fontSize: "1.2rem", marginBottom: 10 }}>{svc.title}</h3>
                  <p style={{ color: T.sub, fontSize: ".9rem", lineHeight: 1.7, marginBottom: 20 }}>{svc.description}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {svc.features.map((f, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem", color: T.text }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: `${svc.color}15`, color: svc.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".65rem", fontWeight: 700, flexShrink: 0 }}>✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

function EcosystemSection() {
  return (
    <section style={{ padding: "96px 0", backgroundColor: T.grayLight }}>
      <Container>
        <FadeIn>
          <Label center>Ecosystem</Label>
          <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.25rem)", fontWeight: 800, color: T.navy, textAlign: "center", marginBottom: 16 }}>
            함께 성장하는 래플 에코시스템
          </h2>
          <p style={{ color: T.sub, textAlign: "center", marginBottom: 64 }}>
            어떤 플랫폼이든 nofake 엔진과 연동되어 공정한 추첨 생태계에 참여할 수 있습니다.
          </p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {ECOSYSTEM.map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{ backgroundColor: T.white, padding: "36px 32px", borderRadius: "1.5rem", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: "2rem", marginBottom: 16 }}>{item.icon}</div>
                <h4 style={{ color: T.blue, fontWeight: 800, fontSize: "1.1rem", marginBottom: 12 }}>{item.type}</h4>
                <p style={{ color: T.sub, fontSize: ".95rem", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PointSwapSection() {
  return (
    <section style={{ padding: "96px 0" }}>
      <Container>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 64, alignItems: "center" }}>
          <FadeIn>
            <Label>Point Swap</Label>
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.25rem)", fontWeight: 800, color: T.navy, marginBottom: 24 }}>
              포인트의 경계를 허무는<br />
              <span style={{ color: T.blue }}>스왑 시스템</span>
            </h2>
            <p style={{ color: T.sub, lineHeight: 1.8, marginBottom: 32 }}>
              여러 곳에 흩어져 소멸되던 포인트를 nofake 하나로 통합하세요.
              제휴된 모든 플랫폼의 적립금이나 상품권으로 자유롭게 교환할 수 있습니다.
            </p>
            {["제휴 파트너사별 맞춤 포인트 전환", "블록체인 기반 투명한 수수료 정산", "즉시 사용 가능한 기프트 카드 스왑"].map((li, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: "#eff6ff", color: T.blue, fontWeight: 700, fontSize: ".75rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✓</span>
                <span style={{ fontWeight: 600, color: T.text, fontSize: ".93rem" }}>{li}</span>
              </div>
            ))}
            <Link to="/point-swap" style={{ display: "inline-block", marginTop: 32, padding: "13px 28px", backgroundColor: T.blue, color: T.white, borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: ".95rem" }}>
              포인트 교환하기 →
            </Link>
          </FadeIn>
          <FadeIn delay={0.12}>
            <div style={{ backgroundColor: T.navy, padding: "56px 48px", borderRadius: "2rem", color: T.white, textAlign: "center" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: 20 }}>🔄</div>
              <h4 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 12 }}>Unified Point Ledger</h4>
              <p style={{ color: "#94a3b8", fontSize: ".9rem", lineHeight: 1.7, marginBottom: 28 }}>
                하이퍼레저 패브릭 원장이<br />모든 교환 거래의 무결성을 증명합니다.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
                {[["340+", "파트너사"], ["즉시", "전환"], ["0%", "오차율"]].map(([num, label]) => (
                  <div key={label}>
                    <p style={{ color: "#60a5fa", fontWeight: 900, fontSize: "1.4rem", margin: 0 }}>{num}</p>
                    <p style={{ color: "#64748b", fontSize: ".75rem", margin: "4px 0 0" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}

function InfraSection() {
  return (
    <section style={{ padding: "96px 0", background: "#f1f5f9" }}>
      <Container>
        <FadeIn>
          <Label center>Infrastructure</Label>
          <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.25rem)", fontWeight: 800, color: T.navy, textAlign: "center", marginBottom: 64 }}>
            무한한 확장이 가능한 기술력
          </h2>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            { title: "오픈 API 아키텍처", icon: "🔌", desc: "새로운 플랫폼이 합류할 때 별도 구축 비용 없이 즉시 연동 가능한 표준화된 API 시스템을 제공합니다." },
            { title: "범용 온체인 증명",  icon: "⛓",  desc: "어떤 플랫폼에서 발생한 응모든 블록체인 원장에 동일한 규격으로 기록되어 신뢰도를 확보합니다." },
            { title: "유연한 포인트 브릿지", icon: "🌉", desc: "파트너사의 정산 시스템과 블록체인 원장을 연결하여 오차 없는 포인트 전환 환경을 구축합니다." },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{ padding: "36px 32px", backgroundColor: T.white, borderRadius: "1.5rem", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 16 }}>{item.icon}</div>
                <h4 style={{ fontWeight: 800, color: T.navy, marginBottom: 12, fontSize: "1rem" }}>{item.title}</h4>
                <p style={{ color: T.sub, fontSize: ".93rem", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CTASection() {
  return (
    <section style={{ padding: "0 0 100px" }}>
      <Container>
        <FadeIn>
          <div style={{
            backgroundColor: T.navy, borderRadius: "2.5rem",
            padding: "clamp(48px,6vw,80px)", textAlign: "center",
            color: T.white, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "-60px", right: "-60px", width: 340, height: 340, background: "radial-gradient(circle, rgba(96,165,250,.15) 0%, transparent 70%)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, marginBottom: 20 }}>전 세계 한정판 시장을 하나로</h2>
              <p style={{ color: "#94a3b8", maxWidth: 560, margin: "0 auto 44px", lineHeight: 1.8, fontSize: "1.05rem" }}>
                이미 수많은 글로벌 리테일러와 로컬 숍들이 nofake의 공정한 생태계에 합류하고 있습니다.
                지금 바로 통합 래플의 편리함을 경험하세요.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/raffles" style={{ padding: "15px 36px", backgroundColor: T.blue, color: T.white, borderRadius: 10, fontWeight: 800, fontSize: "1rem", textDecoration: "none", display: "inline-block" }}>사용자로 시작하기</Link>
                <Link to="/partnership" style={{ padding: "15px 36px", backgroundColor: "rgba(255,255,255,.1)", color: T.white, border: "1px solid rgba(255,255,255,.3)", borderRadius: 10, fontWeight: 800, fontSize: "1rem", textDecoration: "none", display: "inline-block" }}>파트너 입점 문의</Link>
              </div>
              <p style={{ color: "#475569", fontSize: ".8rem", marginTop: 24 }}>신용카드 불필요 · 언제든 해지 가능 · 데이터 즉시 삭제</p>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}

/* ─── MAIN EXPORT ────────────────────────────────── */
export const NOFAKEservicePage = () => (
  <div style={{ paddingTop: 96, backgroundColor: T.white, fontFamily: "sans-serif" }}>
    <HeroSection />
    <StatsSection />
    <PartnerStrip />
    {/* ✅ 홈에서 이전: 지금 응모 가능한 래플 */}
    <ActiveRafflesSection />
    <ValuesSection />
    <ProcessSection />
    {/* ✅ 홈에서 이전: 핵심 솔루션 */}
    <CoreServicesSection />
    <EcosystemSection />
    <PointSwapSection />
    <InfraSection />
    <CTASection />
  </div>
);
