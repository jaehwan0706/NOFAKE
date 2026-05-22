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
  Clock,
  Trophy,
  Zap,
} from "lucide-react";
import { useAuthUser } from "../../lib/authUser";

const API = (import.meta.env.VITE_API_BASE_URL as string) || "";
const LOGIN_TOKEN_KEY = "nofakeAccessToken";
const MUSINSA_RAFFLE_ID = 2;
const HYPERLEDGER_REWARD = 500;

type Phase = "idle" | "fetching-wallet" | "minting" | "rewarding" | "success" | "error";
interface ToastMsg { type: "success" | "error"; message: string; }

function Toast({ toast, onDismiss }: { toast: ToastMsg; onDismiss: () => void }) {
  const Icon = toast.type === "success" ? CheckCircle2 : XCircle;
  return (
    <div className={`fixed bottom-6 left-1/2 z-50 flex max-w-sm -translate-x-1/2 items-start gap-3 rounded-2xl border px-5 py-4 shadow-xl ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-semibold leading-snug">{toast.message}</p>
      <button onClick={onDismiss} className="ml-2 shrink-0 opacity-50 hover:opacity-100"><XCircle className="h-4 w-4" /></button>
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
    // Use wallet already enriched in auth context (populated at startup).
    if (user.walletAddress) {
      setWalletAddress(user.walletAddress);
      return;
    }
    // Fallback: explicit profile fetch (covers first-login edge cases).
    const token = localStorage.getItem(LOGIN_TOKEN_KEY);
    if (!token) return;
    setPhase("fetching-wallet");
    fetch(`${API}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "69420",
      },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { walletAddress?: string | null }) => setWalletAddress(data.walletAddress ?? null))
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
      const mintData = await mintRes.json() as { success?: boolean; txHash?: string; error?: string; message?: string; };
      if (!mintRes.ok || mintData.success === false) throw new Error(mintData.error || mintData.message || "NFT 민팅에 실패했습니다.");
      setTxHash(mintData.txHash ?? "");
      setPhase("rewarding");
      const rewardRes = await fetch(`${API}/api/points/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ walletAddress, brand: "NOFAKE", fromBrand: "MUSINSA", amount: HYPERLEDGER_REWARD }),
      });
      if (!rewardRes.ok) console.warn("Hyperledger reward bridge failed:", await rewardRes.json().catch(() => ({})));
      setPhase("success");
      showToast({ type: "success", message: `응모 완료! NFT 민팅 및 ${HYPERLEDGER_REWARD.toLocaleString()} NOFAKE 포인트가 지급되었습니다.` });
    } catch (err) {
      setPhase("error");
      const raw = err instanceof Error ? err.message : "";
      let userMessage: string;
      if (raw === "PHONE_NOT_VERIFIED") {
        userMessage = "휴대폰을 인증해야 래플에 참여할 수 있습니다.";
      } else if (raw.includes("Already participated")) {
        userMessage = "이미 참여한 래플입니다!";
      } else {
        userMessage = raw || "래플 참여 중 오류가 발생했습니다. 다시 시도해 주세요.";
      }
      showToast({ type: "error", message: userMessage });
    }
  };

  const isLoading = phase === "fetching-wallet" || phase === "minting" || phase === "rewarding";
  const isSuccess = phase === "success";

  // 무신사 스탠다드 블랙 워싱 데님 재킷
  const PRODUCT_IMAGE = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1400&auto=format&fit=crop&q=80";
  const PRODUCT_IMAGE_SMALL = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80";

  return (
    <>
      {toast && <Toast toast={toast} onDismiss={() => { if (toastTimer.current) clearTimeout(toastTimer.current); setToast(null); }} />}

      <main className="min-h-screen bg-[#0d0a08] font-sans">

        {/* 히어로 배경 */}
        <div className="relative h-[520px] overflow-hidden">
          <img
            src={PRODUCT_IMAGE}
            alt="무신사 스탠다드 블랙 워싱 데님 재킷"
            className="h-full w-full object-cover object-top"
            style={{ filter: "brightness(0.28)" }}
          />
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0a08]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a08]/70 to-transparent" />
          {/* 무신사 오렌지 글로우 */}
          <div
            className="absolute bottom-0 left-0 h-64 w-[500px] rounded-full blur-3xl"
            style={{ background: "rgba(255,72,0,0.10)" }}
          />

          {/* 뒤로가기 */}
          <div className="absolute left-0 right-0 top-0 mx-auto max-w-6xl px-6 pt-28">
            <button
              onClick={() => navigate("/raffles")}
              className="flex items-center gap-2 text-sm font-semibold text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              래플 목록으로
            </button>
          </div>

          {/* 히어로 텍스트 */}
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-6 pb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-white backdrop-blur-sm">
                Limited
              </span>
              <span
                className="rounded-full border px-3 py-1 text-xs font-bold"
                style={{ background: "rgba(255,72,0,0.15)", borderColor: "rgba(255,72,0,0.35)", color: "#ff7a40" }}
              >
                진행 중
              </span>
            </div>
            <p
              className="text-sm font-black uppercase tracking-[0.2em] mb-3"
              style={{ color: "rgba(255,72,0,0.55)" }}
            >
              무신사 스탠다드
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight text-white sm:text-6xl">
              블랙 워싱<br />
              <span style={{ color: "#ff4800" }}>데님 재킷</span><br />
              <span className="text-2xl sm:text-3xl font-bold text-white/40">Black Washed Denim Jacket</span>
            </h1>
          </div>
        </div>

        {/* 본문 */}
        <div className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:items-start pt-10">

            {/* 왼쪽 */}
            <div>
              {/* 태그 */}
              <div className="flex flex-wrap gap-2 mb-8">
                {["아우터", "데님", "한정판", "ERC-721"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/50">
                    {tag}
                  </span>
                ))}
              </div>

              {/* 설명 */}
              <p className="text-base leading-relaxed text-white/50 mb-10 max-w-xl">
                무신사 스탠다드의 시그니처 블랙 워싱 데님 재킷이 한정 수량으로 출시됩니다.
                빈티지한 워싱 처리와 오버핏 실루엣으로 완성된 이번 시즌 핵심 아이템.
                NOFAKE 플랫폼에서만 진행되는 블록체인 기반 공정 추첨에 지금 참여하세요.
                당첨자에게는 NFT 선구매권이 발급됩니다.
              </p>

              {/* 상품 스펙 */}
              <div className="mb-10 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-white/30 mb-4">상품 정보</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {[
                    { label: "소재", value: "코튼 100%" },
                    { label: "핏", value: "오버핏" },
                    { label: "색상", value: "블랙 워싱" },
                    { label: "사이즈", value: "S / M / L / XL" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-white/30 mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-white/70">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 래플 정보 카드 */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-10">
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-white/30" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/30">응모 기간</span>
                  </div>
                  <p className="text-sm font-bold text-white leading-snug">2026.05.15<br />~ 05.22</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-4 w-4 text-white/30" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/30">당첨 발표</span>
                  </div>
                  <p className="text-sm font-bold text-white">2026.05.25</p>
                </div>
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "rgba(255,72,0,0.06)", border: "1px solid rgba(255,72,0,0.2)" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4" style={{ color: "rgba(255,72,0,0.6)" }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,72,0,0.6)" }}>참여 보상</span>
                  </div>
                  <p className="text-sm font-bold" style={{ color: "#ff7a40" }}>{HYPERLEDGER_REWARD.toLocaleString()} NOFAKE P</p>
                </div>
              </div>

              {/* 블록체인 검증 배지 */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-green-400" />
                <div>
                  <p className="text-xs font-bold text-white/60">블록체인 검증</p>
                  <p className="text-xs text-white/30">Hyperledger Fabric + Ethereum Sepolia (ERC-721)</p>
                </div>
              </div>
            </div>

            {/* 오른쪽 — CTA 패널 */}
            <div className="lg:sticky lg:top-24">
              <div
                className="rounded-3xl overflow-hidden"
                style={{ border: "1px solid rgba(255,72,0,0.15)", background: "rgba(255,72,0,0.03)" }}
              >
                {/* 상품 이미지 */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={PRODUCT_IMAGE_SMALL}
                    alt="무신사 스탠다드 블랙 워싱 데님 재킷"
                    className="h-full w-full object-cover object-top"
                    style={{ filter: "brightness(0.55)" }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(13,10,8,0.9), transparent)" }}
                  />
                  {/* 가격 뱃지 */}
                  <div className="absolute bottom-4 left-4">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-black text-white"
                      style={{ background: "#ff4800" }}
                    >
                      NFT 선구매권
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* 지갑 주소 */}
                  {user && walletAddress && (
                    <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/[0.06] px-4 py-3">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-green-400" />
                      <span className="truncate font-mono text-xs text-green-300/70">{walletAddress}</span>
                    </div>
                  )}

                  {/* 진행 상태 */}
                  {isLoading && (
                    <div
                      className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3"
                      style={{ background: "rgba(255,72,0,0.08)", border: "1px solid rgba(255,72,0,0.2)" }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#ff7a40" }} />
                      <span className="text-sm font-semibold" style={{ color: "#ff7a40" }}>{phaseLabel(phase)}</span>
                    </div>
                  )}

                  {/* 완료 상태 */}
                  {isSuccess && txHash && (
                    <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/[0.08] px-4 py-3">
                      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-green-400">
                        <CheckCircle2 className="h-4 w-4" /> 응모가 완료되었습니다
                      </p>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-xs text-green-400/60 hover:text-green-400 transition-colors"
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
                    className="w-full rounded-2xl py-4 text-sm font-black uppercase tracking-widest text-white transition-all disabled:cursor-not-allowed disabled:opacity-30"
                    style={{
                      background: isLoading || isSuccess ? "rgba(255,255,255,0.08)" : "#ff4800",
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
                      {isLoading ? phaseLabel(phase) : isSuccess ? "응모 완료" : !user ? "로그인 후 참여하기" : "래플 참여하기"}
                    </span>
                  </button>

                  {!user && (
                    <p className="mt-3 text-center text-xs text-white/25">
                      카카오 로그인 후 지갑 주소가 자동 연결됩니다
                    </p>
                  )}

                  <p className="mt-4 text-center text-xs leading-relaxed text-white/20">
                    모든 참여 기록은 Hyperledger Fabric 원장과<br />Ethereum Sepolia 네트워크에 영구 기록됩니다
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}

export default MusinsaRafflePage;