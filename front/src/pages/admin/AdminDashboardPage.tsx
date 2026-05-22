import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthUser } from '../../lib/authUser';

const ADMIN_WALLET = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";

const API = (import.meta.env.VITE_API_BASE_URL as string) || '';
const LOGIN_TOKEN_KEY = 'nofakeAccessToken';

function buildAdminHeaders(): HeadersInit {
  const token = localStorage.getItem(LOGIN_TOKEN_KEY);
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'ngrok-skip-browser-warning': '69420',
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: buildAdminHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `서버 오류 (${res.status})`);
  }
  const body = await res.json();
  return (body?.data ?? body) as T;
}

// ─── Metric card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  sublabel: string;
  value: number | null;
  suffix?: string;
  loading: boolean;
  error: string | null;
}

function MetricCard({ label, sublabel, value, suffix = 'P', loading, error }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-xs text-gray-400 mb-4">{sublabel}</p>

      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          불러오는 중...
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-red-500">오류: {error}</p>
      )}

      {!loading && !error && value !== null && (
        <p className="text-3xl font-bold text-gray-900">
          {value.toLocaleString()}
          <span className="ml-1 text-base font-medium text-gray-400">{suffix}</span>
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface TreasuryData { nofake: number; musinsa?: number; nike?: number; nofakeFees?: number; musinsaFees?: number; nikeFees?: number; total?: number }
interface StatsData { totalDistributed: number; participantCount: number }

type RaffleType = 'nike' | 'musinsa';

export default function AdminDashboardPage() {
  const user = useAuthUser();
  const [treasury, setTreasury] = useState<number | null>(null);
  const [treasuryBreakdown, setTreasuryBreakdown] = useState<{ nofake: number; musinsa: number; nike: number } | null>(null);
  const [treasuryLoading, setTreasuryLoading] = useState(true);
  const [treasuryError, setTreasuryError] = useState<string | null>(null);
  const [distributed, setDistributed] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Raffle reveal state
  const [raffleType, setRaffleType] = useState<RaffleType>('nike');
  const [scheduledAt, setScheduledAt] = useState('');
  const [revealLoading, setRevealLoading] = useState(false);
  const [revealMessage, setRevealMessage] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);

  const isRootAdmin = user?.walletAddress?.toLowerCase() === ADMIN_WALLET;

  useEffect(() => {
    if (!isRootAdmin) return;

    fetchJson<TreasuryData>(`${API}/api/admin/fees`)
      .then(d => {
        // Use pre-computed total when available; fall back to summing fields
        const total = d?.total ?? ((d?.nofakeFees ?? Number(d?.nofake ?? 0)) + (d?.musinsaFees ?? Number(d?.musinsa ?? 0)) + (d?.nikeFees ?? Number(d?.nike ?? 0)));
        setTreasury(total);
        setTreasuryBreakdown({
          nofake: d?.nofakeFees ?? Number(d?.nofake ?? 0),
          musinsa: d?.musinsaFees ?? Number(d?.musinsa ?? 0),
          nike: d?.nikeFees ?? Number(d?.nike ?? 0),
        });
      })
      .catch(e => setTreasuryError(e instanceof Error ? e.message : '알 수 없는 오류'))
      .finally(() => setTreasuryLoading(false));

    fetchJson<StatsData>(`${API}/api/admin/stats/points`)
      .then(d => setDistributed(Number(d?.totalDistributed ?? 0)))
      .catch(e => setStatsError(e instanceof Error ? e.message : '알 수 없는 오류'))
      .finally(() => setStatsLoading(false));
  }, [isRootAdmin]);

  if (!isRootAdmin) {
    return <Navigate to="/" replace />;
  }

  async function handleInstantReveal() {
    setRevealLoading(true);
    setRevealMessage(null);
    setRevealError(null);
    try {
      const token = localStorage.getItem('nofakeAccessToken');
      const res = await fetch(`${API}/api/admin/raffle/reveal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'ngrok-skip-browser-warning': '69420',
        },
        body: JSON.stringify({ raffleType }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `서버 오류 (${res.status})`);
      const winner = body.winnerWallet || '없음';
      setRevealMessage(`당첨자 공개 완료! 당첨 지갑: ${winner} (참가자 ${body.summary?.participants ?? '-'}명)`);
    } catch (e) {
      setRevealError(e instanceof Error ? e.message : '오류 발생');
    } finally {
      setRevealLoading(false);
    }
  }

  async function handleScheduledReveal() {
    if (!scheduledAt) { setRevealError('공개 일시를 선택해주세요.'); return; }
    setRevealLoading(true);
    setRevealMessage(null);
    setRevealError(null);
    try {
      const token = localStorage.getItem('nofakeAccessToken');
      const res = await fetch(`${API}/api/admin/raffle/reveal-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'ngrok-skip-browser-warning': '69420',
        },
        body: JSON.stringify({ raffleType, scheduledAt: new Date(scheduledAt).toISOString() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `서버 오류 (${res.status})`);
      setRevealMessage(`예약 완료! ${body.scheduledAt} 에 공개됩니다.`);
    } catch (e) {
      setRevealError(e instanceof Error ? e.message : '오류 발생');
    } finally {
      setRevealLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 pt-32 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="mb-10 text-sm text-gray-500">
          Hyperledger Fabric 원장 및 데이터베이스에서 집계한 플랫폼 지표
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Platform Treasury</p>
            <p className="text-xs text-gray-400 mb-4">누적 스왑 수수료 전체 (양방향 합산)</p>
            {treasuryLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />불러오는 중...
              </div>
            )}
            {!treasuryLoading && treasuryError && <p className="text-sm text-red-500">오류: {treasuryError}</p>}
            {!treasuryLoading && !treasuryError && treasury !== null && (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  {treasury.toLocaleString()}<span className="ml-1 text-base font-medium text-gray-400">P</span>
                </p>
                {treasuryBreakdown && (
                  <div className="mt-3 flex flex-col gap-1 text-xs text-gray-400">
                    <span>NOFAKE→Brand: <span className="font-semibold text-gray-600">{treasuryBreakdown.nofake.toLocaleString()} P</span></span>
                    <span>MUSINSA→NOFAKE: <span className="font-semibold text-gray-600">{treasuryBreakdown.musinsa.toLocaleString()} P</span></span>
                    <span>NIKE→NOFAKE: <span className="font-semibold text-gray-600">{treasuryBreakdown.nike.toLocaleString()} P</span></span>
                  </div>
                )}
              </>
            )}
          </div>
          <MetricCard
            label="총 지급된 포인트"
            sublabel={`래플 참여 보상 누계 (참여 1건당 500 P)`}
            value={distributed}
            loading={statsLoading}
            error={statsError}
          />
        </div>

        {/* Raffle Reveal Section */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">래플 결과 공개</p>
          <p className="text-xs text-gray-400 mb-6">Hyperledger Fabric 체인코드 RevealWinner 호출</p>

          {/* Raffle type selector */}
          <div className="flex items-center gap-3 mb-6">
            <label className="text-sm font-semibold text-gray-700">래플 선택</label>
            <select
              value={raffleType}
              onChange={(e) => setRaffleType(e.target.value as RaffleType)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="nike">Nike (Jordan 1 High OG Chicago)</option>
              <option value="musinsa">Musinsa (Standard Oversized Hoodie)</option>
            </select>
          </div>

          <div className="flex flex-col gap-4">
            {/* Instant reveal */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleInstantReveal}
                disabled={revealLoading}
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
              >
                {revealLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                즉시 공개
              </button>
            </div>

            {/* Scheduled reveal */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={handleScheduledReveal}
                disabled={revealLoading}
                className="rounded-lg border border-black px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                {revealLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                예약 공개
              </button>
            </div>
          </div>

          {revealMessage && (
            <p className="mt-4 text-sm font-semibold text-green-600">{revealMessage}</p>
          )}
          {revealError && (
            <p className="mt-4 text-sm font-semibold text-red-500">오류: {revealError}</p>
          )}
        </div>
      </div>
    </main>
  );
}
