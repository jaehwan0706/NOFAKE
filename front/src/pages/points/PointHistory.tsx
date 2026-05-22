import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { useAuthUser } from "../../lib/authUser";

const API = (import.meta.env.VITE_API_BASE_URL as string) || "";
const LOGIN_TOKEN_KEY = "nofakeAccessToken";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BRAND_LABEL: Record<string, string> = {
  NOFAKE: "NOFAKE",
  NIKE: "Nike",
  MUSINSA: "무신사",
  RAFFLE: "래플",
};

function brandLabel(key: string | null): string {
  if (!key) return "—";
  return BRAND_LABEL[key.toUpperCase()] ?? key;
}

const TYPE_META = {
  earn: { label: "적립", bg: "bg-emerald-900/40", text: "text-emerald-400" },
  swap: { label: "스왑", bg: "bg-blue-900/40", text: "text-blue-400" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PointHistory() {
  const navigate = useNavigate();
  const user = useAuthUser();

  const [rows, setRows] = useState<PointTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    const token = localStorage.getItem(LOGIN_TOKEN_KEY);
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/points/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `서버 오류 (${res.status})`);
      }
      const body = (await res.json()) as { success: boolean; data: PointTx[] };
      setRows(body.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user === null) {
      // Still resolving auth — wait
      return;
    }
    if (!user) {
      navigate("/login");
      return;
    }
    fetchHistory();
  }, [user]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-zinc-950 px-5 pb-24 pt-28 font-sans text-white sm:px-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-gray-500">
              NOFAKE
            </p>
            <h1 className="text-3xl font-black tracking-tight">포인트 거래 내역</h1>
            <p className="mt-1 text-sm text-gray-400">
              래플 적립 및 포인트 스왑 이력을 확인하세요.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-gray-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-40"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-24 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">거래 내역을 불러오는 중...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            조회 실패: {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 py-24 text-center text-sm text-gray-500">
            아직 거래 내역이 없습니다.
            <br />
            <span className="text-xs">래플에 참여하거나 포인트를 교환하면 여기에 기록됩니다.</span>
          </div>
        )}

        {/* Table */}
        {!loading && !error && rows.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_80px_160px_120px_160px] gap-4 border-b border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">
              <span>포인트 흐름</span>
              <span className="text-center">구분</span>
              <span className="text-right">수량</span>
              <span className="text-right">수수료</span>
              <span className="text-right">일시</span>
            </div>

            {/* Rows */}
            <ul className="divide-y divide-white/5">
              {rows.map((tx) => {
                const meta = TYPE_META[tx.type];
                const isEarn = tx.type === "earn";

                return (
                  <li
                    key={tx.id}
                    className="grid grid-cols-[1fr_80px_160px_120px_160px] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03]"
                  >
                    {/* Brand flow */}
                    <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                      <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                        {brandLabel(tx.fromBrand)}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                      <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                        {brandLabel(tx.toBrand)}
                      </span>
                    </div>

                    {/* Type badge */}
                    <div className="flex justify-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.bg} ${meta.text}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <span
                        className={`font-bold tabular-nums ${isEarn ? "text-emerald-400" : "text-white"}`}
                      >
                        {isEarn ? "+" : ""}
                        {tx.amount.toLocaleString()}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">P</span>
                    </div>

                    {/* Fee */}
                    <div className="text-right text-sm tabular-nums text-gray-500">
                      {tx.fee > 0 ? (
                        <>
                          -{tx.fee.toLocaleString()}
                          <span className="ml-1 text-xs">P</span>
                        </>
                      ) : (
                        <span className="text-gray-700">—</span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-right text-xs tabular-nums text-gray-500">
                      {formatDate(tx.createdAt)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Row count */}
        {!loading && !error && rows.length > 0 && (
          <p className="mt-3 text-right text-xs text-gray-600">
            최근 {rows.length}건 표시 (최대 100건)
          </p>
        )}
      </div>
    </main>
  );
}

export default PointHistory;
