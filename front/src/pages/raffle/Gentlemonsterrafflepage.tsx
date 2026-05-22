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
const GENTLE_MONSTER_RAFFLE_ID = 3;
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

export function GentleMonsterRafflePage() {
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
    fetch(`${API}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
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
        body: JSON.stringify({ raffleId: GENTLE_MONSTER_RAFFLE_ID, userAddress: walletAddress }),
      });
      const mintData = await mintRes.json() as { success?: boolean; txHash?: string; error?: string; message?: string; };
      if (!mintRes.ok || mintData.success === false) throw new Error(mintData.error || mintData.message || "NFT 민팅에 실패했습니다.");
      setTxHash(mintData.txHash ?? "");
      setPhase("rewarding");
      const rewardRes = await fetch(`${API}/api/points/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ walletAddress, brand: "NOFAKE", fromBrand: "GENTLEMONSTER", amount: HYPERLEDGER_REWARD }),
      });
      if (!rewardRes.ok) console.warn("Hyperledger reward bridge failed:", await rewardRes.json().catch(() => ({})));
      setPhase("success");
      showToast({ type: "success", message: `응모 완료! NFT 민팅 및 ${HYPERLEDGER_REWARD.toLocaleString()} NOFAKE 포인트가 지급되었습니다.` });
    } catch (err) {
      setPhase("error");
      const raw = err instanceof Error ? err.message : "";
      showToast({ type: "error", message: raw === "PHONE_NOT_VERIFIED" ? "휴대폰을 인증해야 래플에 참여할 수 있습니다." : raw || "참여 처리 중 오류가 발생했습니다." });
    }
  };

  const isLoading = phase === "fetching-wallet" || phase === "minting" || phase === "rewarding";
  const isSuccess = phase === "success";

  // 젠틀몬스터 선글라스 이미지 (Unsplash)
  const PRODUCT_IMAGE = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1400&auto=format&fit=crop&q=80";
  const PRODUCT_IMAGE_SMALL = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80";

  // 젠틀몬스터 브랜드 컬러: 크림 화이트 & 딥 블랙 & 골드 포인트
  const BRAND_GOLD = "#c9a84c";
  const BRAND_GOLD_DIM = "rgba(201,168,76,0.6)";
  const BRAND_GOLD_GLOW = "rgba(201,168,76,0.10)";
  const BRAND_GOLD_BORDER = "rgba(201,168,76,0.22)";
  const BG = "#07070a";

  return (
    <>
      {toast && <Toast toast={toast} onDismiss={() => { if (toastTimer.current) clearTimeout(toastTimer.current); setToast(null); }} />}

      <main className="min-h-screen font-sans" style={{ background: BG }}>

        {/* 히어로 배경 */}
        <div className="relative h-[520px] overflow-hidden">
          <img
            src={PRODUCT_IMAGE}
            alt="젠틀몬스터 한정판 선글라스"
            className="h-full w-full object-cover object-center"
            style={{ filter: "brightness(0.22) saturate(0.6)" }}
          />
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${BG})` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, rgba(7,7,10,0.75), transparent)` }} />
          {/* 골드 글로우 */}
          <div
            className="absolute bottom-0 left-0 h-72 w-[600px] rounded-full blur-3xl"
            style={{ background: "rgba(201,168,76,0.08)" }}
          />

          {/* 뒤로가기 */}
          <div className="absolute left-0 right-0 top-0 mx-auto max-w-6xl px-6 pt-28">
            <button
              onClick={() => navigate("/raffles")}
              className="flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            >
              <ArrowLeft className="h-4 w-4" />
              래플 목록으로
            </button>
          </div>

          {/* 히어로 텍스트 */}
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-6 pb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-black uppercase tracking-widest text-white backdrop-blur-sm">
                Limited
              </span>
              <span
                className="rounded-full border px-3 py-1 text-xs font-bold"
                style={{ background: BRAND_GOLD_GLOW, borderColor: BRAND_GOLD_BORDER, color: BRAND_GOLD }}
              >
                진행 중
              </span>
            </div>
            <p
              className="text-sm font-black uppercase tracking-[0.25em] mb-3"
              style={{ color: BRAND_GOLD_DIM }}
            >
              Gentle Monster
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight text-white sm:text-6xl">
              NOVA 02<br />
              <span style={{ color: BRAND_GOLD }}>선글라스</span><br />
              <span className="text-2xl sm:text-3xl font-bold text-white/35">Limited Edition Sunglasses</span>
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
                {["선글라스", "아이웨어", "한정판", "ERC-721"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/45">
                    {tag}
                  </span>
                ))}
              </div>

              {/* 설명 */}
              <p className="text-base leading-relaxed text-white/45 mb-10 max-w-xl">
                젠틀몬스터의 아이코닉 NOVA 라인업 최신작, NOVA 02가 한정 수량으로 출시됩니다.
                실험적인 프레임 디자인과 고급 렌즈 코팅이 결합된 이번 시즌 아이웨어.
                NOFAKE 플랫폼에서만 진행되는 블록체인 기반 공정 추첨에 지금 참여하세요.
                당첨자에게는 NFT 선구매권이 발급됩니다.
              </p>

              {/* 상품 스펙 */}
              <div
                className="mb-10 rounded-2xl p-6"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-white/25 mb-4">상품 정보</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {[
                    { label: "소재", value: "티타늄 프레임" },
                    { label: "렌즈", value: "그라디언트 미러" },
                    { label: "색상", value: "실버 / 다크 골드" },
                    { label: "스타일", value: "오버사이즈 스퀘어" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-white/25 mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-white/65">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 래플 정보 카드 */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-10">
                <div
                  className="rounded-2xl p-5"
                  style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-white/25" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/25">응모 기간</span>
                  </div>
                  <p className="text-sm font-bold text-white leading-snug">2026.05.15<br />~ 05.22</p>
                </div>
                <div
                  className="rounded-2xl p-5"
                  style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-4 w-4 text-white/25" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/25">당첨 발표</span>
                  </div>
                  <p className="text-sm font-bold text-white">2026.05.25</p>
                </div>
                <div
                  className="rounded-2xl p-5"
                  style={{ background: BRAND_GOLD_GLOW, border: `1px solid ${BRAND_GOLD_BORDER}` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4" style={{ color: BRAND_GOLD_DIM }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND_GOLD_DIM }}>참여 보상</span>
                  </div>
                  <p className="text-sm font-bold" style={{ color: BRAND_GOLD }}>{HYPERLEDGER_REWARD.toLocaleString()} NOFAKE P</p>
                </div>
              </div>

              {/* 블록체인 검증 배지 */}
              <div
                className="flex items-center gap-3 rounded-2xl px-5 py-4"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
              >
                <ShieldCheck className="h-5 w-5 shrink-0 text-green-400" />
                <div>
                  <p className="text-xs font-bold text-white/55">블록체인 검증</p>
                  <p className="text-xs text-white/25">Hyperledger Fabric + Ethereum Sepolia (ERC-721)</p>
                </div>
              </div>
            </div>

            {/* 오른쪽 — CTA 패널 */}
            <div className="lg:sticky lg:top-24">
              <div
                className="rounded-3xl overflow-hidden"
                style={{ border: `1px solid ${BRAND_GOLD_BORDER}`, background: BRAND_GOLD_GLOW }}
              >
                {/* 상품 이미지 */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={PRODUCT_IMAGE_SMALL}
                    alt="젠틀몬스터 NOVA 02 선글라스"
                    className="h-full w-full object-cover object-center"
                    style={{ filter: "brightness(0.45) saturate(0.7)" }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, rgba(7,7,10,0.92), transparent)` }}
                  />
                  {/* 뱃지 */}
                  <div className="absolute bottom-4 left-4">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-black text-black"
                      style={{ background: BRAND_GOLD }}
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
                      style={{ background: BRAND_GOLD_GLOW, border: `1px solid ${BRAND_GOLD_BORDER}` }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin" style={{ color: BRAND_GOLD }} />
                      <span className="text-sm font-semibold" style={{ color: BRAND_GOLD }}>{phaseLabel(phase)}</span>
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
                    className="w-full rounded-2xl py-4 text-sm font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-30"
                    style={{
                      background: isLoading || isSuccess ? "rgba(255,255,255,0.07)" : BRAND_GOLD,
                      color: isLoading || isSuccess ? "rgba(255,255,255,0.4)" : "#07070a",
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
                      {isLoading ? phaseLabel(phase) : isSuccess ? "응모 완료" : !user ? "로그인 후 참여하기" : "래플 참여하기"}
                    </span>
                  </button>

                  {!user && (
                    <p className="mt-3 text-center text-xs text-white/20">
                      카카오 로그인 후 지갑 주소가 자동 연결됩니다
                    </p>
                  )}

                  <p className="mt-4 text-center text-xs leading-relaxed text-white/18">
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

export default GentleMonsterRafflePage;