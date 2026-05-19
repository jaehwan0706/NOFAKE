import React, { useEffect, useState } from 'react';

const API = (import.meta.env.VITE_API_BASE_URL as string) || '';
const ADMIN_WALLET = (import.meta.env.VITE_ROOT_ADMIN_WALLET as string) || '';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [nofake, setNofake] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API}/api/admin/fees`, {
          headers: ADMIN_WALLET ? { 'X-Admin-Wallet': ADMIN_WALLET } : undefined,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as any).error || `서버 오류 (${res.status})`);
        }
        const body = await res.json();
        const balance = body?.data ?? body;
        setNofake(Number(balance?.nofake ?? 0));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen px-6 pt-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Platform Treasury</h1>
        <p className="mb-8 text-sm text-gray-500">
          Hyperledger Fabric 원장에서 조회한 누적 NOFAKE 플랫폼 수수료
        </p>

        {loading && (
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 inline-block" />
            블록체인에서 데이터를 불러오는 중...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            조회 실패: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm w-full max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">NOFAKE</p>
            <p className="text-3xl font-bold text-gray-900">
              {nofake.toLocaleString()}
              <span className="ml-1 text-base font-medium text-gray-400">P</span>
            </p>
            <p className="mt-2 text-xs text-gray-400">
              키: NOFAKE_PLATFORM_TREASURY
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
