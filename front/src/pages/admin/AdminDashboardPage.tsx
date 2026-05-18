import React, { useEffect, useState } from 'react';

const API = (import.meta.env.VITE_API_BASE_URL as string) || '';
const ADMIN_WALLET = (import.meta.env.VITE_ROOT_ADMIN_WALLET as string) || '';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/admin/fees`, {
          headers: ADMIN_WALLET ? { 'X-Admin-Wallet': ADMIN_WALLET } : undefined,
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const body = await res.json();
        setData(body.data || body);
      } catch (err: any) {
        setError(err.message || 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <main className="min-h-screen px-6 pt-32">Loading...</main>;
  if (error) return <main className="min-h-screen px-6 pt-32">Error: {error}</main>;

  return (
    <main className="min-h-screen px-6 pt-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="mb-6 text-sm text-gray-600">NOFAKE_ADMIN accumulated fees</p>
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">NOFAKE</h3>
            <div className="mt-2 text-xl font-bold">{Number(data.nofake || 0).toLocaleString()} P</div>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">NIKE</h3>
            <div className="mt-2 text-xl font-bold">{Number(data.nike || 0).toLocaleString()} P</div>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">MUSINSA</h3>
            <div className="mt-2 text-xl font-bold">{Number(data.musinsa || 0).toLocaleString()} P</div>
          </div>
        </div>
      </div>
    </main>
  );
}
