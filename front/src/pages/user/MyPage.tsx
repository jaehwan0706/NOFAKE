import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthUser, logoutUser } from "../../components/Header";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ??
  "https://outrage-overboard-unrevised.ngrok-free.dev";
const LOGIN_TOKEN_KEY = "nofakeAccessToken";

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

const STATUS_CONFIG: Record<string, { color: string; bg: string; dot: boolean }> = {
  진행중:   { color: T.green,  bg: T.greenLight, dot: true  },
  당첨:     { color: "#fff",   bg: T.blue,       dot: false },
  미당첨:   { color: T.gray,   bg: "#f1f5f9",    dot: false },
  마감임박: { color: T.amber,  bg: "#fffbeb",    dot: false },
  발송완료: { color: T.purple, bg: "#f5f3ff",    dot: false },
};

interface RaffleItem {
  id: string;
  brand: string;
  brandColor: string;
  name: string;
  image: string;
  applyDate: string;
  deadline: string;
  resultDate: string;
  participants: string;
  winners: string;
  myNumber: string;
  status: string;
  txHash: string | null;
  size: string;
  price: string;
  purchaseDeadline: string | null;
  trackingNum?: string;
}

const FILTER_TABS = ["전체", "진행중", "당첨", "미당첨", "발송완료"];
type TabId = "raffles" | "points" | "settings";

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function StatCard({ num, label, sub, color = T.navy }: { num: string | number; label: string; sub?: string; color?: string }) {
  return (
    <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: "1.25rem", padding: "28px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color, lineHeight: 1 }}>{num}</div>
      <div style={{ fontWeight: 700, color: T.text, marginTop: 8, fontSize: ".9rem" }}>{label}</div>
      {sub && <div style={{ color: T.gray, fontSize: ".75rem", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { color: T.gray, bg: "#f1f5f9", dot: false };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: ".75rem", whiteSpace: "nowrap" }}>
      {cfg.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: cfg.color, display: "inline-block", boxShadow: `0 0 0 2px ${cfg.color}44` }} />}
      {status}
    </span>
  );
}

function RaffleCard({ raffle }: { raffle: RaffleItem }) {
  const [expanded, setExpanded] = useState(false);
  const details: [string, string][] = [
    ["응모 번호", raffle.myNumber], ["마감일", raffle.deadline], ["결과 발표", raffle.resultDate],
    ["총 응모", `${raffle.participants}명`], ["당첨 인원", `${raffle.winners}명`], ["정가", raffle.price],
    ...(raffle.purchaseDeadline ? [["구매 마감", raffle.purchaseDeadline] as [string, string]] : []),
    ...(raffle.trackingNum      ? [["운송장",   raffle.trackingNum]      as [string, string]] : []),
  ];

  return (
    <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: "1.25rem", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", cursor: "pointer", userSelect: "none" }} onClick={() => setExpanded(v => !v)}>
        <div style={{ width: 48, height: 48, borderRadius: "0.875rem", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{raffle.image}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: ".72rem", fontWeight: 800, color: raffle.brandColor, letterSpacing: ".04em" }}>{raffle.brand}</span>
            <StatusBadge status={raffle.status} />
          </div>
          <div style={{ fontWeight: 700, color: T.navy, fontSize: ".9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{raffle.name}</div>
          <div style={{ color: T.gray, fontSize: ".75rem", marginTop: 4 }}>응모일 {raffle.applyDate} · 사이즈 {raffle.size}</div>
        </div>
        <div style={{ color: T.gray, fontSize: "1rem", transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>▾</div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "20px 24px", background: T.grayLight }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
            {details.map(([k, v]) => (
              <div key={k} style={{ background: T.white, borderRadius: 10, padding: "12px 14px", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: ".7rem", color: T.gray, marginBottom: 4 }}>{k}</div>
                <div style={{ fontWeight: 700, color: T.navy, fontSize: ".85rem" }}>{v}</div>
              </div>
            ))}
          </div>
          {raffle.txHash && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: T.navy, borderRadius: 10 }}>
              <span style={{ fontSize: "1rem" }}>⛓</span>
              <div>
                <div style={{ color: "#94a3b8", fontSize: ".7rem" }}>블록체인 검증 해시</div>
                <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: ".8rem", fontFamily: "monospace" }}>{raffle.txHash}</div>
              </div>
              <button style={{ marginLeft: "auto", padding: "5px 12px", background: "rgba(96,165,250,.2)", border: "1px solid rgba(96,165,250,.3)", borderRadius: 6, color: "#93c5fd", fontSize: ".72rem", fontWeight: 700, cursor: "pointer" }}>Explorer →</button>
            </div>
          )}
          {raffle.status === "당첨" && (
            <button style={{ marginTop: 12, width: "100%", padding: "13px", background: T.blue, color: "#fff", borderRadius: 10, fontWeight: 800, fontSize: ".9rem", border: "none", cursor: "pointer" }}>구매 진행하기 →</button>
          )}
        </div>
      )}
    </div>
  );
}

function RafflesTab({ raffles, stats }: { raffles: RaffleItem[]; stats: any }) {
  const [activeFilter, setActiveFilter] = useState("전체");
  const filtered = activeFilter === "전체" ? raffles : raffles.filter(r => r.status === activeFilter);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard num={stats.totalApply} label="총 응모 수" sub="누적" color={T.navy} />
        <StatCard num={stats.winCount} label="당첨 횟수" sub="전체 기간" color={T.blue} />
        <StatCard num={`${stats.winRate}%`} label="당첨률" sub="나의 승률" color={T.green} />
        <StatCard num={stats.activeCount} label="진행 중인 래플" sub="현재" color={T.amber} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {FILTER_TABS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "7px 16px", borderRadius: 999, border: `1px solid ${activeFilter === f ? T.blue : T.border}`, background: activeFilter === f ? T.blue : T.white, color: activeFilter === f ? "#fff" : T.text, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", transition: "all .15s" }}>
            {f}{f !== "전체" && <span style={{ marginLeft: 6, opacity: 0.7 }}>{raffles.filter(r => r.status === f).length}</span>}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length > 0
          ? filtered.map(r => <RaffleCard key={r.id} raffle={r} />)
          : <div style={{ textAlign: "center", padding: "64px 32px", background: T.white, borderRadius: "1.25rem", border: `1px solid ${T.border}`, color: T.gray }}>해당 상태의 래플이 없습니다.</div>
        }
      </div>
    </>
  );
}

function PointsTab({ points, history }: { points: number; history: any[] }) {
  return (
    <div>
      <div style={{ background: T.navy, borderRadius: "1.5rem", padding: "36px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ color: "#64748b", fontSize: ".82rem", marginBottom: 8 }}>총 보유 nofake 포인트</div>
          <div style={{ color: "#60a5fa", fontSize: "2.4rem", fontWeight: 900 }}>{points.toLocaleString()} P</div>
        </div>
        <Link to="/point-swap" style={{ padding: "13px 28px", background: T.blue, color: "#fff", borderRadius: 10, fontWeight: 800, textDecoration: "none", fontSize: ".9rem" }}>포인트 교환하기 →</Link>
      </div>
      <div style={{ background: T.white, borderRadius: "1.25rem", border: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, color: T.navy }}>포인트 내역</div>
        {history.length > 0 ? (
          history.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: i < history.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div>
                <div style={{ fontWeight: 600, color: T.text, fontSize: ".88rem" }}>{item.label}</div>
                <div style={{ color: T.gray, fontSize: ".75rem", marginTop: 3 }}>{item.date}</div>
              </div>
              <div style={{ fontWeight: 800, color: item.color, fontSize: ".95rem" }}>{item.amount} P</div>
            </div>
          ))
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: T.gray }}>포인트 내역이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

function SettingsTab({ user, onLogout }: { user: { name: string; email: string }; onLogout: () => void }) {
  const rows = [
    { label: "이름",     value: user.name,                    icon: "👤", editable: true,  mono: false },
    { label: "이메일",   value: user.email || "—",            icon: "📧", editable: true,  mono: false },
    { label: "DID 인증", value: "did:nofake:0x3a9f…c12e",    icon: "🔐", editable: false, mono: true  },
    { label: "가입일",   value: "2023.08.14",                 icon: "📅", editable: false, mono: false },
  ];
  return (
    <div style={{ background: T.white, borderRadius: "1.25rem", border: `1px solid ${T.border}`, overflow: "hidden" }}>
      {rows.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: ".75rem", color: T.gray }}>{item.label}</div>
              <div style={{ fontWeight: 600, color: T.navy, fontSize: ".9rem", fontFamily: item.mono ? "monospace" : "inherit" }}>{item.value}</div>
            </div>
          </div>
          {item.editable && (
            <button style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.white, color: T.sub, fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>변경</button>
          )}
        </div>
      ))}
      <div style={{ padding: "20px 24px", background: "#fff5f5" }}>
        <button onClick={onLogout} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${T.red}33`, background: "#fff", color: T.red, fontWeight: 700, fontSize: ".85rem", cursor: "pointer" }}>
          로그아웃
        </button>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export const MyPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthUser();

  // ✅ 초기 상태값을 0 또는 빈 배열로 설정 (하드코딩 제거)
  const [points, setPoints] = useState<number>(0);
  const [raffleHistory, setRaffleHistory] = useState<RaffleItem[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalApply: 0, winCount: 0, winRate: "0.0", activeCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchMyData = async () => {
      try {
        const token = localStorage.getItem(LOGIN_TOKEN_KEY);
        const res = await fetch(`${API_BASE_URL}/api/mypage`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setPoints(data.points ?? 0);
          setRaffleHistory(data.raffleHistory ?? []);
          setPointHistory(data.pointHistory ?? []);
          setStats(data.stats ?? { totalApply: 0, winCount: 0, winRate: "0.0", activeCount: 0 });
        } else {
          throw new Error("API 연동 실패");
        }
      } catch (error) {
        // ✅ API 호출 실패 시 가짜 데이터를 넣지 않고 기본 상태를 유지합니다.
        console.warn("데이터 로드 실패: 초기화된 데이터를 표시합니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyData();
  }, [user, navigate]);

  if (!user || isLoading) return null;

  const tabParam = searchParams.get("tab");
  const activeTab: TabId = tabParam === "points" || tabParam === "settings" ? tabParam : "raffles";

  const setTab = (id: TabId) => {
    if (id === "raffles") setSearchParams({});
    else setSearchParams({ tab: id });
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/", { replace: true });
  };

  // ✅ 이름 첫 글자를 안전하게 추출
  const avatarInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  const TABS: { id: TabId; label: string }[] = [
    { id: "raffles",  label: "래플 내역" },
    { id: "points",   label: "포인트"   },
    { id: "settings", label: "설정"     },
  ];

  return (
    <div style={{ paddingTop: 96, minHeight: "100vh", backgroundColor: T.grayLight, fontFamily: "sans-serif" }}>
      {/* 프로필 헤더 */}
      <div style={{ backgroundColor: T.navy, padding: "48px 0 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", fontWeight: 900, color: "#fff", flexShrink: 0 }}>
              {avatarInitial}
            </div>
            <div>
              <h1 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 900, margin: 0 }}>{user.name}</h1>
              {user.email && <p style={{ color: "#64748b", fontSize: ".82rem", margin: "4px 0" }}>{user.email}</p>}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", background: "rgba(96,165,250,.15)", border: "1px solid rgba(96,165,250,.25)", borderRadius: 999 }}>
                <span style={{ fontSize: ".6rem" }}>🔐</span>
                <span style={{ color: "#93c5fd", fontSize: ".72rem", fontFamily: "monospace" }}>did:nofake:0x3a9f…c12e</span>
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <div style={{ padding: "10px 20px", background: "rgba(96,165,250,.15)", border: "1px solid rgba(96,165,250,.3)", borderRadius: 10, textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: ".72rem" }}>nofake 포인트</div>
                <div style={{ color: "#60a5fa", fontWeight: 900, fontSize: "1.3rem" }}>{points.toLocaleString()} P</div>
              </div>
            </div>
          </div>

          {/* 탭 */}
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setTab(tab.id)} style={{ padding: "14px 24px", background: "none", border: "none", borderBottom: activeTab === tab.id ? "2px solid #60a5fa" : "2px solid transparent", color: activeTab === tab.id ? "#60a5fa" : "#64748b", fontWeight: 700, fontSize: ".88rem", cursor: "pointer", transition: "all .15s" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px clamp(16px,4vw,40px)" }}>
        {activeTab === "raffles"  && <RafflesTab raffles={raffleHistory} stats={stats} />}
        {activeTab === "points"   && <PointsTab points={points} history={pointHistory} />}
        {activeTab === "settings" && <SettingsTab user={user} onLogout={handleLogout} />}
      </div>
    </div>
  );
};

export default MyPage;