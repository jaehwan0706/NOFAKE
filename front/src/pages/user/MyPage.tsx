import React, { useState } from "react";
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
  red: "#ef4444",
  amber: "#f59e0b",
  purple: "#7c3aed",
};

const USER = {
  name: "김나이키",
  email: "nike***@gmail.com",
  did: "did:nofake:0x3a9f…c12e",
  joinDate: "2023.08.14",
  points: 42500,
  totalEntry: 47,
  totalWin: 3,
};

const STATUS_CONFIG = {
  진행중: { color: T.green, bg: T.greenLight, dot: true },
  당첨: { color: "#fff", bg: T.blue, dot: false },
  미당첨: { color: T.gray, bg: "#f1f5f9", dot: false },
  마감임박: { color: T.amber, bg: "#fffbeb", dot: false },
  발송완료: { color: T.purple, bg: "#f5f3ff", dot: false },
};

const RAFFLE_HISTORY = [
  {
    id: "R2025-0421",
    brand: "Nike",
    brandColor: "#111",
    name: "Air Jordan 1 Retro High OG 'Chicago'",
    image: "👟",
    applyDate: "2025.04.18",
    deadline: "2025.04.21",
    resultDate: "2025.04.22",
    participants: "38,204",
    winners: "500",
    myNumber: "NFR-38204-A",
    status: "당첨",
    txHash: "0x7f3a…b12c",
    size: "270",
    price: "219,000원",
    purchaseDeadline: "2025.04.28",
  },
  {
    id: "R2025-0415",
    brand: "New Balance",
    brandColor: "#cf102d",
    name: "990v6 Made in USA 'Navy'",
    image: "🔵",
    applyDate: "2025.04.10",
    deadline: "2025.04.15",
    resultDate: "2025.04.16",
    participants: "21,580",
    winners: "200",
    myNumber: "NFR-21580-B",
    status: "미당첨",
    txHash: "0x2c8e…7af1",
    size: "265",
    price: "249,000원",
    purchaseDeadline: null,
  },
  {
    id: "R2025-0408",
    brand: "Adidas",
    brandColor: "#000",
    name: "Yeezy Boost 350 V2 'Bone'",
    image: "🔱",
    applyDate: "2025.04.05",
    deadline: "2025.04.08",
    resultDate: "2025.04.09",
    participants: "54,912",
    winners: "800",
    myNumber: "NFR-54912-C",
    status: "발송완료",
    txHash: "0x9d1b…3e22",
    size: "270",
    price: "289,000원",
    purchaseDeadline: "2025.04.15",
    trackingNum: "CJ-123456789",
  },
  {
    id: "R2025-0501",
    brand: "Kith",
    brandColor: "#c8a96e",
    name: "Kith x New Balance 998 'Tan'",
    image: "🏪",
    applyDate: "2025.04.28",
    deadline: "2025.05.01",
    resultDate: "2025.05.02",
    participants: "12,430",
    winners: "150",
    myNumber: "NFR-12430-D",
    status: "진행중",
    txHash: null,
    size: "265",
    price: "329,000원",
    purchaseDeadline: null,
  },
  {
    id: "R2025-0503",
    brand: "Asics",
    brandColor: "#1a56db",
    name: "Gel-Lyte III OG 'Lichen'",
    image: "🟦",
    applyDate: "2025.04.30",
    deadline: "2025.05.03",
    resultDate: "2025.05.04",
    participants: "8,901",
    winners: "100",
    myNumber: "NFR-8901-E",
    status: "마감임박",
    txHash: null,
    size: "270",
    price: "149,000원",
    purchaseDeadline: null,
  },
];

const FILTER_TABS = ["전체", "진행중", "당첨", "미당첨", "발송완료"];

function StatCard({ num, label, sub, color = T.navy }) {
  return (
    <div
      style={{
        backgroundColor: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: "1.25rem",
        padding: "28px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color, lineHeight: 1 }}>
        {num}
      </div>
      <div style={{ fontWeight: 700, color: T.text, marginTop: 8, fontSize: ".9rem" }}>{label}</div>
      {sub && <div style={{ color: T.gray, fontSize: ".75rem", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { color: T.gray, bg: "#f1f5f9", dot: false };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 999,
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: ".75rem",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: cfg.color,
            display: "inline-block",
            boxShadow: `0 0 0 2px ${cfg.color}44`,
          }}
        />
      )}
      {status}
    </span>
  );
}

function RaffleCard({ raffle }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        backgroundColor: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: "1.25rem",
        overflow: "hidden",
        transition: "box-shadow .2s",
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "20px 24px",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Brand Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "0.875rem",
            backgroundColor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            flexShrink: 0,
          }}
        >
          {raffle.image}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: ".72rem",
                fontWeight: 800,
                color: raffle.brandColor,
                letterSpacing: ".04em",
              }}
            >
              {raffle.brand}
            </span>
            <StatusBadge status={raffle.status} />
          </div>
          <div
            style={{
              fontWeight: 700,
              color: T.navy,
              fontSize: ".9rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {raffle.name}
          </div>
          <div style={{ color: T.gray, fontSize: ".75rem", marginTop: 4 }}>
            응모일 {raffle.applyDate} · 사이즈 {raffle.size}
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            color: T.gray,
            fontSize: "1rem",
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform .2s",
            flexShrink: 0,
          }}
        >
          ▾
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            padding: "20px 24px",
            background: T.grayLight,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {[
              ["응모 번호", raffle.myNumber],
              ["마감일", raffle.deadline],
              ["결과 발표", raffle.resultDate],
              ["총 응모", `${raffle.participants}명`],
              ["당첨 인원", `${raffle.winners}명`],
              ["정가", raffle.price],
              ...(raffle.purchaseDeadline
                ? [["구매 마감", raffle.purchaseDeadline]]
                : []),
              ...(raffle.trackingNum
                ? [["운송장", raffle.trackingNum]]
                : []),
            ].map(([k, v]) => (
              <div key={k} style={{ background: T.white, borderRadius: 10, padding: "12px 14px", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: ".7rem", color: T.gray, marginBottom: 4 }}>{k}</div>
                <div style={{ fontWeight: 700, color: T.navy, fontSize: ".85rem" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Blockchain Proof */}
          {raffle.txHash && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                background: T.navy,
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: "1rem" }}>⛓</span>
              <div>
                <div style={{ color: "#94a3b8", fontSize: ".7rem" }}>블록체인 검증 해시</div>
                <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: ".8rem", fontFamily: "monospace" }}>
                  {raffle.txHash}
                </div>
              </div>
              <button
                style={{
                  marginLeft: "auto",
                  padding: "5px 12px",
                  background: "rgba(96,165,250,.2)",
                  border: "1px solid rgba(96,165,250,.3)",
                  borderRadius: 6,
                  color: "#93c5fd",
                  fontSize: ".72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Explorer →
              </button>
            </div>
          )}

          {/* Action Buttons */}
          {raffle.status === "당첨" && (
            <button
              style={{
                marginTop: 12,
                width: "100%",
                padding: "13px",
                background: T.blue,
                color: "#fff",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: ".9rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              구매 진행하기 →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const MyPage = () => {
  const [activeFilter, setActiveFilter] = useState("전체");
  const [activeTab, setActiveTab] = useState("raffles");

  const filtered =
    activeFilter === "전체"
      ? RAFFLE_HISTORY
      : RAFFLE_HISTORY.filter((r) => r.status === activeFilter);

  const winRate = ((USER.totalWin / USER.totalEntry) * 100).toFixed(1);

  return (
    <div
      style={{
        paddingTop: 96,
        minHeight: "100vh",
        backgroundColor: T.grayLight,
        fontFamily: "sans-serif",
      }}
    >
      {/* Profile Header */}
      <div style={{ backgroundColor: T.navy, padding: "48px 0 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                flexShrink: 0,
              }}
            >
              👤
            </div>
            <div>
              <h1 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 900, margin: 0 }}>
                {USER.name}
              </h1>
              <p style={{ color: "#64748b", fontSize: ".82rem", margin: "4px 0" }}>{USER.email}</p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 10px",
                  background: "rgba(96,165,250,.15)",
                  border: "1px solid rgba(96,165,250,.25)",
                  borderRadius: 999,
                }}
              >
                <span style={{ fontSize: ".6rem" }}>🔐</span>
                <span style={{ color: "#93c5fd", fontSize: ".72rem", fontFamily: "monospace" }}>
                  {USER.did}
                </span>
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <div
                style={{
                  padding: "10px 20px",
                  background: "rgba(96,165,250,.15)",
                  border: "1px solid rgba(96,165,250,.3)",
                  borderRadius: 10,
                  textAlign: "center",
                }}
              >
                <div style={{ color: "#64748b", fontSize: ".72rem" }}>nofake 포인트</div>
                <div style={{ color: "#60a5fa", fontWeight: 900, fontSize: "1.3rem" }}>
                  {USER.points.toLocaleString()} P
                </div>
              </div>
            </div>
          </div>

          {/* Tab Nav */}
          <div style={{ display: "flex", gap: 0 }}>
            {[
              { id: "raffles", label: "래플 내역" },
              { id: "points", label: "포인트" },
              { id: "settings", label: "설정" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "14px 24px",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "2px solid #60a5fa" : "2px solid transparent",
                  color: activeTab === tab.id ? "#60a5fa" : "#64748b",
                  fontWeight: 700,
                  fontSize: ".88rem",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px clamp(16px,4vw,40px)" }}>
        {activeTab === "raffles" && (
          <>
            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 14,
                marginBottom: 28,
              }}
            >
              <StatCard num={USER.totalEntry} label="총 응모 수" sub="누적" color={T.navy} />
              <StatCard num={USER.totalWin} label="당첨 횟수" sub="전체 기간" color={T.blue} />
              <StatCard num={`${winRate}%`} label="당첨률" sub="나의 승률" color={T.green} />
              <StatCard
                num={RAFFLE_HISTORY.filter((r) => r.status === "진행중" || r.status === "마감임박").length}
                label="진행 중인 래플"
                sub="현재"
                color={T.amber}
              />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {FILTER_TABS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 999,
                    border: `1px solid ${activeFilter === f ? T.blue : T.border}`,
                    background: activeFilter === f ? T.blue : T.white,
                    color: activeFilter === f ? "#fff" : T.text,
                    fontWeight: 700,
                    fontSize: ".82rem",
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  {f}
                  {f !== "전체" && (
                    <span style={{ marginLeft: 6, opacity: 0.7 }}>
                      {RAFFLE_HISTORY.filter((r) => r.status === f).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Raffle Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.length > 0 ? (
                filtered.map((r) => <RaffleCard key={r.id} raffle={r} />)
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "64px 32px",
                    background: T.white,
                    borderRadius: "1.25rem",
                    border: `1px solid ${T.border}`,
                    color: T.gray,
                  }}
                >
                  해당 상태의 래플이 없습니다.
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "points" && (
          <div>
            {/* Point Summary */}
            <div
              style={{
                background: T.navy,
                borderRadius: "1.5rem",
                padding: "36px 32px",
                marginBottom: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <div style={{ color: "#64748b", fontSize: ".82rem", marginBottom: 8 }}>
                  총 보유 nofake 포인트
                </div>
                <div style={{ color: "#60a5fa", fontSize: "2.4rem", fontWeight: 900 }}>
                  {USER.points.toLocaleString()} P
                </div>
              </div>
              <Link
                to="/point-swap"
                style={{
                  padding: "13px 28px",
                  background: T.blue,
                  color: "#fff",
                  borderRadius: 10,
                  fontWeight: 800,
                  textDecoration: "none",
                  fontSize: ".9rem",
                }}
              >
                포인트 교환하기 →
              </Link>
            </div>

            {/* Point History Placeholder */}
            <div
              style={{
                background: T.white,
                borderRadius: "1.25rem",
                border: `1px solid ${T.border}`,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, color: T.navy }}>
                포인트 내역
              </div>
              {[
                { label: "Air Jordan 1 래플 응모 보상", date: "2025.04.18", amount: "+500", color: T.green },
                { label: "무신사 포인트 교환", date: "2025.04.10", amount: "−10,000", color: T.red },
                { label: "래플 당첨 보너스", date: "2025.04.09", amount: "+2,000", color: T.green },
                { label: "Nike 포인트 교환", date: "2025.03.25", amount: "−5,000", color: T.red },
                { label: "신규 가입 포인트", date: "2023.08.14", amount: "+5,000", color: T.green },
              ].map((item, i, arr) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 24px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: T.text, fontSize: ".88rem" }}>{item.label}</div>
                    <div style={{ color: T.gray, fontSize: ".75rem", marginTop: 3 }}>{item.date}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: item.color, fontSize: ".95rem" }}>
                    {item.amount} P
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div
            style={{
              background: T.white,
              borderRadius: "1.25rem",
              border: `1px solid ${T.border}`,
              overflow: "hidden",
            }}
          >
            {[
              { label: "이름", value: USER.name, icon: "👤" },
              { label: "이메일", value: USER.email, icon: "📧" },
              { label: "DID 인증", value: USER.did, icon: "🔐" },
              { label: "가입일", value: USER.joinDate, icon: "📅" },
            ].map((item, i, arr) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: ".75rem", color: T.gray }}>{item.label}</div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: T.navy,
                        fontSize: ".9rem",
                        fontFamily: item.label === "DID 인증" ? "monospace" : "inherit",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
                {item.label !== "가입일" && item.label !== "DID 인증" && (
                  <button
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      background: T.white,
                      color: T.sub,
                      fontWeight: 700,
                      fontSize: ".78rem",
                      cursor: "pointer",
                    }}
                  >
                    변경
                  </button>
                )}
              </div>
            ))}
            <div style={{ padding: "20px 24px", background: "#fff5f5" }}>
              <button
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: `1px solid ${T.red}33`,
                  background: "#fff",
                  color: T.red,
                  fontWeight: 700,
                  fontSize: ".85rem",
                  cursor: "pointer",
                }}
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};