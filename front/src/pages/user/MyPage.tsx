import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthUser, logoutUser, loginUser } from "../../lib/authUser";
import { fetchPointBalances } from "../../lib/pointBalances";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ?? "";
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

// ─── 백엔드에서 받아오는 유저 프로필 타입 ────────────────────────────────────
interface UserProfile {
  name: string;
  email: string | null;
  walletAddress: string | null;
  did: string | null;
  joinedAt: string | null;
  profileImage: string | null;
}

interface Stats {
  totalApply: number;
  winCount: number;
  winRate: string;
  activeCount: number;
}

interface PointHistoryItem {
  id: string;
  label: string;
  date: string;
  amount: string;
  color: string;
  type: string;
}

interface PointTx {
  id: number;
  type: "earn" | "swap";
  fromBrand: string | null;
  toBrand: string;
  amount: number;
  fee: number;
  txId: string | null;
  createdAt: string;
}

const BRAND_LABEL_MAP: Record<string, string> = {
  NOFAKE: "nofake", NIKE: "나이키", MUSINSA: "무신사", RAFFLE: "래플",
};
const toBrandLabel = (key: string | null) =>
  !key ? "" : (BRAND_LABEL_MAP[key.toUpperCase()] ?? key.toLowerCase());

function formatTxDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd}/${hh}:${min}`;
}

const POINT_FILTERS = ["전체", "적립", "사용"] as const;
type PointFilter = (typeof POINT_FILTERS)[number];

interface MyPageResponse {
  profile?: UserProfile;
  points?: number;
  raffleHistory?: RaffleItem[];
  pointHistory?: PointHistoryItem[];
  stats?: Stats;
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
  const label = status === '당첨' ? '당첨 🎉' : status;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: ".75rem", whiteSpace: "nowrap" }}>
      {cfg.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: cfg.color, display: "inline-block", boxShadow: `0 0 0 2px ${cfg.color}44` }} />}
      {label}
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

function RafflesTab({ raffles, stats }: { raffles: RaffleItem[]; stats: Stats }) {
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

function PointsTab({ points }: { points: number }) {
  const [txs, setTxs] = useState<PointTx[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PointFilter>("전체");

  useEffect(() => {
    const token = localStorage.getItem(LOGIN_TOKEN_KEY);
    if (!token) { setTxLoading(false); return; }
    setTxLoading(true);
    setTxError(null);
    fetch(`${API_BASE_URL}/api/points/history`, {
      headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "69420" },
    })
      .then(res => res.ok ? res.json() : res.json().then((b: { error?: string }) => Promise.reject(b.error || `오류 (${res.status})`)))
      .then((body: { success: boolean; data: PointTx[] }) => setTxs(body.data ?? []))
      .catch(e => setTxError(typeof e === "string" ? e : "거래 내역 조회 실패"))
      .finally(() => setTxLoading(false));
  }, []);

  const filtered = filter === "전체" ? txs : txs.filter(tx => filter === "적립" ? tx.type === "earn" : tx.type === "swap");

  return (
    <div>
      <div style={{ background: T.navy, borderRadius: "1.5rem", padding: "36px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ color: "#64748b", fontSize: ".82rem", marginBottom: 8 }}>총 보유 nofake 포인트</div>
          <div style={{ color: "#60a5fa", fontSize: "2.4rem", fontWeight: 900 }}>{points.toLocaleString()} P</div>
        </div>
        <Link to="/point-swap" style={{ padding: "13px 28px", background: T.blue, color: "#fff", borderRadius: 10, fontWeight: 800, textDecoration: "none", fontSize: ".9rem" }}>포인트 교환하기 →</Link>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {POINT_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: 999, border: `1px solid ${filter === f ? T.blue : T.border}`, background: filter === f ? T.blue : T.white, color: filter === f ? "#fff" : T.text, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", transition: "all .15s" }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: T.white, borderRadius: "1.25rem", border: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, color: T.navy }}>포인트 내역</div>

        {txLoading && (
          <div style={{ padding: "40px", textAlign: "center", color: T.gray, fontSize: ".88rem" }}>불러오는 중…</div>
        )}

        {!txLoading && txError && (
          <div style={{ padding: "24px", color: T.red, fontSize: ".85rem" }}>조회 실패: {txError}</div>
        )}

        {!txLoading && !txError && filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: T.gray }}>포인트 내역이 없습니다.</div>
        )}

        {!txLoading && !txError && filtered.map((tx, i) => {
          const from = toBrandLabel(tx.fromBrand);
          const to = toBrandLabel(tx.toBrand);
          const flow = from ? `${from} -> ${to}` : to;
          const line = `${flow} ${tx.amount}포인트, 수수료${tx.fee}포인트 ${formatTxDate(tx.createdAt)}`;

          return (
            <div key={tx.id} style={{ padding: "14px 24px", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none", fontWeight: 500, color: T.text, fontSize: ".88rem", fontFamily: "monospace" }}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 인라인 편집 필드 공통 컴포넌트 ─────────────────────────────────────────
function EditableRow({
  icon, label, value, apiEndpoint, fieldKey, type = "text", validate, onSaved,
}: {
  icon: string; label: string; value: string | null;
  apiEndpoint: string; fieldKey: string;
  type?: string;
  validate?: (v: string) => string | null;
  onSaved: (newVal: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    const trimmed = input.trim();
    if (!trimmed) { setError("값을 입력해주세요."); return; }
    if (validate) {
      const msg = validate(trimmed);
      if (msg) { setError(msg); return; }
    }
    setSaving(true); setError(null);
    try {
      const token = localStorage.getItem(LOGIN_TOKEN_KEY);
      const res = await fetch(apiEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "69420" },
        body: JSON.stringify({ [fieldKey]: trimmed }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "저장 실패" }));
        throw new Error((err as { message?: string }).message ?? "저장 실패");
      }
      onSaved(trimmed);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setInput(value ?? ""); setEditing(false); setError(null); };

  return (
    <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}` }}>
      {!editing ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <div>
              <div style={{ fontSize: ".75rem", color: T.gray }}>{label}</div>
              <div style={{ fontWeight: 600, color: value ? T.navy : T.gray, fontSize: ".9rem" }}>
                {value || "—"}
              </div>
              {success && <div style={{ fontSize: ".72rem", color: T.green, marginTop: 2 }}>✓ 저장되었습니다</div>}
            </div>
          </div>
          <button
            onClick={() => { setEditing(true); setInput(value ?? ""); }}
            style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.white, color: T.sub, fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}
          >변경</button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <span style={{ fontSize: ".75rem", color: T.gray }}>{label}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type={type} value={input} autoFocus
              onChange={e => { setInput(e.target.value); setError(null); }}
              onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
              style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8, border: `1.5px solid ${error ? T.red : T.blue}`, fontSize: ".88rem", outline: "none", color: T.navy }}
            />
            <button onClick={handleSave} disabled={saving}
              style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: T.blue, color: "#fff", fontWeight: 700, fontSize: ".82rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "저장 중…" : "저장"}
            </button>
            <button onClick={handleCancel} disabled={saving}
              style={{ padding: "9px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.white, color: T.sub, fontWeight: 700, fontSize: ".82rem", cursor: "pointer" }}>
              취소
            </button>
          </div>
          {error && <div style={{ marginTop: 6, fontSize: ".75rem", color: T.red }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

// ─── SettingsTab ─────────────────────────────────────────────────────────────
function SettingsTab({
  profile, debugLog, onLogout, onNameUpdated, onEmailUpdated,
}: {
  profile: UserProfile;
  debugLog: string | null;
  onLogout: () => void;
  onNameUpdated: (name: string) => void;
  onEmailUpdated: (email: string) => void;
}) {
  const joinedDisplay = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, "")
    : "—";

  return (
    <div>
      {debugLog && (
        <div style={{ marginBottom: 16, padding: "14px 18px", background: "#fffbeb", border: `1px solid ${T.amber}44`, borderRadius: 12 }}>
          <div style={{ fontWeight: 700, color: T.amber, fontSize: ".8rem", marginBottom: 6 }}>⚠ API 연결 상태</div>
          <pre style={{ margin: 0, fontSize: ".72rem", color: T.sub, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{debugLog}</pre>
        </div>
      )}

      <div style={{ background: T.white, borderRadius: "1.25rem", border: `1px solid ${T.border}`, overflow: "hidden" }}>

        <EditableRow
          icon="👤" label="이름" value={profile.name}
          apiEndpoint={`${API_BASE_URL}/api/user/name`} fieldKey="name"
          validate={v => v.length < 2 ? "이름은 2자 이상 입력해주세요." : null}
          onSaved={onNameUpdated}
        />

        <EditableRow
          icon="📧" label="이메일" value={profile.email}
          apiEndpoint={`${API_BASE_URL}/api/user/email`} fieldKey="email"
          type="email"
          validate={v => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "올바른 이메일 형식이 아닙니다." : null}
          onSaved={onEmailUpdated}
        />

        <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${T.border}`, gap: 12 }}>
          <span style={{ fontSize: "1.2rem" }}>💎</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: ".75rem", color: T.gray }}>지갑 주소</div>
            <div style={{ fontWeight: 600, color: profile.walletAddress ? T.navy : T.gray, fontSize: ".88rem", fontFamily: "monospace", wordBreak: "break-all" }}>
              {profile.walletAddress || "—"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${T.border}`, gap: 12 }}>
          <span style={{ fontSize: "1.2rem" }}>🔐</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: ".75rem", color: T.gray }}>DID 인증</div>
            <div style={{ fontWeight: 600, color: profile.did ? T.navy : T.gray, fontSize: ".88rem", fontFamily: "monospace", wordBreak: "break-all" }}>
              {profile.did || "—"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${T.border}`, gap: 12 }}>
          <span style={{ fontSize: "1.2rem" }}>📅</span>
          <div>
            <div style={{ fontSize: ".75rem", color: T.gray }}>
              가입일 <span style={{ fontStyle: "italic" }}>(Web3 최초 로그인)</span>
            </div>
            <div style={{ fontWeight: 600, color: profile.joinedAt ? T.navy : T.gray, fontSize: ".9rem" }}>{joinedDisplay}</div>
          </div>
        </div>

        <div style={{ padding: "20px 24px", background: "#fff5f5" }}>
          <button onClick={onLogout} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${T.red}33`, background: "#fff", color: T.red, fontWeight: 700, fontSize: ".85rem", cursor: "pointer" }}>
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export const MyPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [raffleHistory, setRaffleHistory] = useState<RaffleItem[]>([]);
  const [, setPointHistory] = useState<PointHistoryItem[]>([]);
  const [stats, setStats] = useState<Stats>({ totalApply: 0, winCount: 0, winRate: "0.0", activeCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [debugLog, setDebugLog] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchMyData = async () => {
      const logs: string[] = [];
      let profileOk = false;
      let mypageOk = false;
      let balanceOk = false;

      try {
        const token = localStorage.getItem(LOGIN_TOKEN_KEY);
        logs.push(`토큰: ${token ? token.slice(0, 20) + "…" : "없음 ❌"}`);

        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420",
        };

        const profilePromise = fetch(`${API_BASE_URL}/api/user/profile`, { headers });
        const mypagePromise = fetch(`${API_BASE_URL}/api/mypage`, { headers });
        const balancePromise = fetchPointBalances(token);

        const [profileSettled, mypageSettled, balanceSettled] = await Promise.allSettled([
          profilePromise,
          mypagePromise,
          balancePromise,
        ]);

        if (profileSettled.status === "fulfilled") {
          const profileRes = profileSettled.value as Response;
          logs.push(`GET /api/user/profile → ${profileRes.status} ${profileRes.ok ? "✓" : "❌"}`);
          if (profileRes.ok) {
            const profileData = (await profileRes.json()) as UserProfile;
            logs.push(`profile 수신 OK: DID=${profileData.did ? "✓" : "—"}`);
            setProfile(profileData);
            profileOk = true;
          } else {
            const text = await profileRes.text().catch(() => "");
            logs.push(`profile 에러: ${profileRes.status} - ${text.slice(0, 80)}`);
          }
        } else {
          logs.push(`GET /api/user/profile → ❌ ${String(profileSettled.reason)}`);
        }

        if (mypageSettled.status === "fulfilled") {
          const mypageRes = mypageSettled.value as Response;
          logs.push(`GET /api/mypage → ${mypageRes.status} ${mypageRes.ok ? "✓" : "❌"}`);
          if (mypageRes.ok) {
            const data = (await mypageRes.json()) as MyPageResponse;
            logs.push(`mypage 수신 완료`);
            if (data.profile) {
              logs.push(`  ✓ 프로필: ${data.profile.name}, DID=${data.profile.did ? "있음" : "없음"}`);
              setProfile(data.profile);
            }
            if (data.raffleHistory) {
              logs.push(`  ✓ 래플: ${data.raffleHistory.length}개`);
              setRaffleHistory(data.raffleHistory);
              // Compute stats from real raffle data
              const history = data.raffleHistory;
              const winCount = history.filter(r => r.status === '당첨').length;
              const activeCount = history.filter(r => r.status === '진행중').length;
              const winRate = history.length > 0 ? ((winCount / history.length) * 100).toFixed(1) : '0.0';
              setStats({ totalApply: history.length, winCount, winRate, activeCount });
              logs.push(`  ✓ 통계 계산: 총응모=${history.length}, 당첨=${winCount}`);
            }
            if (data.pointHistory) {
              logs.push(`  ✓ 포인트 이력: ${data.pointHistory.length}개`);
              setPointHistory(data.pointHistory);
            }
            mypageOk = true;
          } else {
            const text = await mypageRes.text().catch(() => "");
            logs.push(`mypage 에러: ${mypageRes.status} - ${text.slice(0, 80)}`);
          }
        } else {
          logs.push(`GET /api/mypage → ❌ ${String(mypageSettled.reason)}`);
        }

        if (balanceSettled.status === "fulfilled") {
          const balanceData = balanceSettled.value as { nofake: number; nike: number; musinsa: number };
          logs.push(`GET /api/points/balance → ✓`);
          setPoints(balanceData.nofake ?? 0);
          balanceOk = true;
        } else {
          logs.push(`GET /api/points/balance → ❌ ${String(balanceSettled.reason)}`);
        }

        if (profileOk && mypageOk && balanceOk) {
          setDebugLog(null);
        } else {
          setDebugLog(logs.join("\n"));
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logs.push(`네트워크 오류: ${message}`);
        setDebugLog(logs.join("\n"));
        console.error("📡 데이터 로드 실패:", error);
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

  const displayProfile: UserProfile = profile ?? {
    name: user.name,
    email: user.email ?? null,
    walletAddress: null,
    did: null,
    joinedAt: null,
    profileImage: null,
  };

  const avatarInitial = displayProfile.name ? displayProfile.name.charAt(0).toUpperCase() : "U";

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
              <h1 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 900, margin: 0 }}>{displayProfile.name}</h1>
              {displayProfile.email && <p style={{ color: "#64748b", fontSize: ".82rem", margin: "4px 0" }}>{displayProfile.email}</p>}
              {displayProfile.did && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", background: "rgba(96,165,250,.15)", border: "1px solid rgba(96,165,250,.25)", borderRadius: 999 }}>
                  <span style={{ fontSize: ".6rem" }}>🔐</span>
                  <span style={{ color: "#93c5fd", fontSize: ".72rem", fontFamily: "monospace" }}>{displayProfile.did}</span>
                </div>
              )}
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
        {activeTab === "points"   && <PointsTab points={points} />}
        {activeTab === "settings" && (
          <SettingsTab
            profile={displayProfile}
            debugLog={debugLog}
            onLogout={handleLogout}
            onNameUpdated={(newName) => {
              setProfile(prev => prev ? { ...prev, name: newName } : { ...displayProfile, name: newName });
              loginUser({
                name: newName,
                email: displayProfile.email ?? "",
                phone_verified: true,
                walletAddress: user?.walletAddress ?? null,
              });
            }}
            onEmailUpdated={(newEmail) => {
              setProfile(prev => prev ? { ...prev, email: newEmail } : { ...displayProfile, email: newEmail });
              loginUser({
                name: displayProfile.name,
                email: newEmail,
                phone_verified: true,
                walletAddress: user?.walletAddress ?? null,
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MyPage;
