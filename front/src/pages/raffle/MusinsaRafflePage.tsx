import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Ticket,
  XCircle,
} from "lucide-react";
import { useAuthUser } from "../../lib/authUser";

// ─── Constants ────────────────────────────────────────────────────────────────

const API = (import.meta.env.VITE_API_BASE_URL as string) || "";
const LOGIN_TOKEN_KEY = "nofakeAccessToken";

const MUSINSA_RAFFLE_ID = 2;
const HYPERLEDGER_REWARD = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "idle" | "fetching-wallet" | "minting" | "rewarding" | "success" | "error";

interface ToastMsg {
  type: "success" | "error";
  message: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast, onDismiss }: { toast: ToastMsg; onDismiss: () => void }) {
  const Icon = toast.type === "success" ? CheckCircle2 : XCircle;
  const colors =
    toast.type === "success"
      ? "bg-green-50 border-green-200 text-green-800"
      : "bg-red-50 border-red-200 text-red-700";

  return (
    <div className={`fixed bottom-6 left-1/2 z-50 flex max-w-sm -translate-x-1/2 items-start gap-3 rounded-2xl border px-5 py-4 shadow-xl ${colors}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-semibold leading-snug">{toast.message}</p>
      <button onClick={onDismiss} className="ml-2 shrink-0 opacity-50 hover:opacity-100">
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}

function phaseLabel(phase: Phase): string {
  switch (phase) {
    case "fetching-wallet": return "지갑 정보 확인 중...";
    case "minting": return "NFT 민팅 중...";
    case "rewarding": return "포인트 지급 중...";
    default: return "";
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MusinsaRafflePage() {
  const navigate = useNavigate();
  const user = useAuthUser();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem(LOGIN_TOKEN_KEY);
    if (!token) return;

    setPhase("fetching-wallet");
    fetch(`${API}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { walletAddress?: string | null }) => {
        setWalletAddress(data.walletAddress ?? null);
      })
      .catch(() => {})
      .finally(() => setPhase("idle"));
  }, [user]);

  const showToast = (msg: ToastMsg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  const handleParticipate = async () => {
    if (!user) { navigate("/login"); return; }
    const token = localStorage.getItem(LOGIN_TOKEN_KEY);
    if (!token) { navigate("/login"); return; }

    if (!walletAddress) {
      showToast({ type: "error", message: "지갑 주소를 불러오지 못했습니다. 페이지를 새로고침해 주세요." });
      return;
    }

    try {
      setPhase("minting");
      const mintRes = await fetch(`${API}/api/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ raffleId: MUSINSA_RAFFLE_ID, userAddress: walletAddress }),
      });

      const mintData = (await mintRes.json()) as {
        success?: boolean; txHash?: string; error?: string; message?: string;
      };

      if (!mintRes.ok || mintData.success === false) {
        throw new Error(mintData.error || mintData.message || "NFT 민팅에 실패했습니다.");
      }

      setTxHash(mintData.txHash ?? "");

      setPhase("rewarding");
      const rewardRes = await fetch(`${API}/api/points/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ walletAddress, brand: "NOFAKE", amount: HYPERLEDGER_REWARD }),
      });

      if (!rewardRes.ok) {
        const rewardErr = await rewardRes.json().catch(() => ({}));
        console.warn("Hyperledger reward bridge failed:", rewardErr);
      }

      setPhase("success");
      showToast({
        type: "success",
        message: `응모 완료! NFT 민팅 및 ${HYPERLEDGER_REWARD.toLocaleString()} NOFAKE 포인트가 지급되었습니다.`,
      });
    } catch (err) {
      setPhase("error");
      const raw = err instanceof Error ? err.message : "";
      showToast({
        type: "error",
        message:
          raw === "PHONE_NOT_VERIFIED"
            ? "휴대폰을 인증해야 래플에 참여할 수 있습니다."
            : raw || "참여 처리 중 오류가 발생했습니다.",
      });
    }
  };

  const isLoading = phase === "fetching-wallet" || phase === "minting" || phase === "rewarding";
  const isSuccess = phase === "success";

  return (
    <>
      {toast && (
        <Toast toast={toast} onDismiss={() => { if (toastTimer.current) clearTimeout(toastTimer.current); setToast(null); }} />
      )}

      <main className="min-h-screen bg-white px-5 pb-24 pt-24 font-sans sm:px-10">
        {/* 뒤로가기 */}
        <div className="mx-auto mb-8 max-w-5xl">
          <button
            onClick={() => navigate("/raffles")}
            className="flex items-center gap-2 text-sm font-semibold text-gray-400 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            래플 목록으로
          </button>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-2">
          {/* ── 좌: 상품 이미지 ─────────────────────────────────────────── */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop"
              alt="무신사 스탠다드 — 한정 컬렉션"
              className="h-full w-full object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-[#ff4800] px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
              Limited
            </span>
          </div>

          {/* ── 우: 상세 + CTA ───────────────────────────────────────────── */}
          <div className="flex flex-col">
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#ff4800]">
              Musinsa
            </p>
            <h1 className="mb-3 text-3xl font-black leading-tight tracking-tight text-gray-900">
              무신사 스탠다드
              <br />
              리미티드 컬렉션
            </h1>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                스트리트
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                한정판
              </span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                진행 중
              </span>
            </div>

            <p className="mb-8 text-sm leading-relaxed text-gray-500">
              무신사 스탠다드와 국내 인기 디자이너의 협업으로 탄생한 한정 컬렉션.
              NOFAKE 플랫폼에서만 진행되는 블록체인 기반 공정 추첨에 참여하세요.
              당첨자에게는 NFT 선구매권과 무신사 스토어 전용 쿠폰이 발급됩니다.
            </p>

            {/* 래플 정보 그리드 */}
            <div className="mb-8 grid grid-cols-2 gap-4 rounded-2xl bg-gray-50 p-5">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">응모 기간</p>
                <p className="text-sm font-bold text-gray-800">2026.05.13 ~ 2026.05.17</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">당첨 발표</p>
                <p className="text-sm font-bold text-gray-800">2026.05.19</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">참여 보상</p>
                <p className="text-sm font-bold text-gray-800">{HYPERLEDGER_REWARD.toLocaleString()} NOFAKE P</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">검증 방식</p>
                <p className="text-sm font-bold text-gray-800">Hyperledger + ERC-721</p>
              </div>
            </div>

            {/* 지갑 정보 */}
            {user && walletAddress && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-green-500" />
                <span className="truncate font-mono text-xs text-gray-500">{walletAddress}</span>
              </div>
            )}

            {/* 진행 상태 */}
            {isLoading && (
              <div className="mb-4 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                {phaseLabel(phase)}
              </div>
            )}

            {/* 완료 상태 */}
            {isSuccess && txHash && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="mb-1 text-sm font-bold text-green-700">
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                  응모가 완료되었습니다
                </p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-xs text-green-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {txHash.slice(0, 18)}...{txHash.slice(-6)}
                </a>
              </div>
            )}

            {/* CTA 버튼 */}
            <button
              onClick={handleParticipate}
              disabled={isLoading || isSuccess}
              className="mt-auto flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#ff4800] text-sm font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-[#e03e00] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Ticket className="h-5 w-5" />
              )}
              {isLoading
                ? phaseLabel(phase)
                : isSuccess
                ? "응모 완료"
                : !user
                ? "로그인 후 참여하기"
                : "래플 참여하기"}
            </button>

            {!user && (
              <p className="mt-3 text-center text-xs text-gray-400">
                카카오 로그인 후 지갑 주소가 자동으로 연결됩니다.
              </p>
            )}

            <p className="mt-4 text-center text-xs leading-relaxed text-gray-400">
              모든 참여 기록은 Hyperledger Fabric 원장과 Ethereum Sepolia 네트워크에
              영구적으로 기록됩니다.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default MusinsaRafflePage;
