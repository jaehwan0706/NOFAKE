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

interface TreasuryData { nofake: number }
interface StatsData { totalDistributed: number; participantCount: number }

export default function AdminDashboardPage() {
  const user = useAuthUser();
  const [treasury, setTreasury] = useState<number | null>(null);
  const [treasuryLoading, setTreasuryLoading] = useState(true);
  const [treasuryError, setTreasuryError] = useState<string | null>(null);
  const [distributed, setDistributed] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const isRootAdmin = user?.walletAddress?.toLowerCase() === ADMIN_WALLET;

  useEffect(() => {
    if (!isRootAdmin) return;

    fetchJson<TreasuryData>(`${API}/api/admin/fees`)
      .then(d => setTreasury(Number(d?.nofake ?? 0)))
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

  return (
    <main className="min-h-screen px-6 pt-32 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="mb-10 text-sm text-gray-500">
          Hyperledger Fabric 원장 및 데이터베이스에서 집계한 플랫폼 지표
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <MetricCard
            label="Platform Treasury"
            sublabel="누적 스왑 수수료 (NOFAKE_PLATFORM_TREASURY)"
            value={treasury}
            loading={treasuryLoading}
            error={treasuryError}
          />
          <MetricCard
            label="총 지급된 포인트"
            sublabel={`래플 참여 보상 누계 (참여 1건당 500 P)`}
            value={distributed}
            loading={statsLoading}
            error={statsError}
          />
        </div>
      </div>
    </main>
  );
}
