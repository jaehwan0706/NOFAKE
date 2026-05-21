import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../../lib/authUser";

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
};

const BRANDS = {
  nofake: { name: "NoFake", logo: "💎", color: "#2563eb", colorLight: "#eff6ff", unit: "NoFake 포인트" },
  nike: { name: "Nike", logo: "👟", color: "#111", colorLight: "#f5f5f5", unit: "Nike 포인트", minAmount: 5000, description: "Nike.com, SNKRS 앱에서 사용 가능" },
  musinsa: { name: "무신사", logo: "🛍", color: "#ff4800", colorLight: "#fff3ef", unit: "무신사 포인트", minAmount: 3000, description: "무신사 스토어 전 브랜드에서 사용 가능" },
};

const NOFAKE_FEE_PERCENT = 5; // 5% fee when swapping involving NoFake

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function LoginPromptModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.white, borderRadius: "1.5rem", padding: "40px 36px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,.15)" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔐</div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: T.navy, marginBottom: 10 }}>로그인이 필요해요</h3>
        <p style={{ color: T.gray, fontSize: ".9rem", lineHeight: 1.7, marginBottom: 28 }}>포인트 교환은 로그인 후 이용할 수 있어요.<br />카카오 로그인으로 빠르게 시작하세요.</p>
        <button onClick={onLogin} style={{ width: "100%", padding: "14px", background: "#FEE500", color: "#191919", borderRadius: 12, fontWeight: 800, fontSize: "1rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: "1.2rem" }}>💬</span> 카카오로 로그인
        </button>
        <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "transparent", color: T.gray, borderRadius: 12, fontWeight: 600, fontSize: ".9rem", border: `1px solid ${T.border}`, cursor: "pointer" }}>나중에 할게요</button>
      </div>
    </div>
  );
}

type SwapDirection = "to-nofake" | "from-nofake";

function BrandCard({ brand, selected, onSelect }: { brand: any; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} style={{ background: selected ? brand.colorLight : T.white, border: `2px solid ${selected ? brand.color : T.border}`, borderRadius: "1.25rem", padding: "24px 20px", cursor: "pointer", textAlign: "left", transition: "all .2s", width: "100%", boxSizing: "border-box", position: "relative", outline: "none" }}>
      {selected && <span style={{ position: "absolute", top: 12, right: 14, width: 20, height: 20, borderRadius: "50%", background: brand.color, color: "#fff", fontSize: ".65rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>✓</span>}
      <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>{brand.logo}</div>
      <div style={{ fontWeight: 800, color: T.navy, fontSize: "1rem", marginBottom: 4 }}>{brand.name}</div>
      {brand.description && <div style={{ fontSize: ".72rem", color: T.sub, lineHeight: 1.5 }}>{brand.description}</div>}
    </button>
  );
}

function SwapPanel({ fromBrand, toBrand, myBalances, onSuccess, onLoginRequired }: { direction: SwapDirection; fromBrand: any; toBrand: any; myBalances: { nofake: number; nike: number; musinsa: number }; onSuccess: (amount: number) => void; onLoginRequired: () => void }) {
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  const user = useAuthUser();

  const inputNum = parseInt(amount.replace(/,/g, "")) || 0;
  
  // Calculate fee: apply 5% when either side is NoFake
  const fee = (fromBrand === BRANDS.nofake || toBrand === BRANDS.nofake) ? Math.floor(inputNum * (NOFAKE_FEE_PERCENT / 100)) : 0;
  const receive = inputNum - fee;
  
  // Get available balance for fromBrand
  const fromBrandKey = fromBrand === BRANDS.nofake ? "nofake" : fromBrand === BRANDS.nike ? "nike" : "musinsa";
  const availableBalance = myBalances[fromBrandKey as keyof typeof myBalances];
  const minAmount = 5000; // Enforce minimum swap amount across all directions
  
  const isValid = inputNum >= minAmount && inputNum <= availableBalance && inputNum > 0;

  const handleSwap = () => {
    if (!user) {
      onLoginRequired();
      return;
    }
    if (!isValid) return;
    setDone(true);
    (async () => {
      try {
        const token = localStorage.getItem(LOGIN_TOKEN_KEY);
        const fromBrandName = fromBrand === BRANDS.nofake ? "NOFAKE" : fromBrand === BRANDS.nike ? "NIKE" : "MUSINSA";
        const toBrandName = toBrand === BRANDS.nofake ? "NOFAKE" : toBrand === BRANDS.nike ? "NIKE" : "MUSINSA";
        
        const res = await fetch(`${API_BASE_URL}/api/points/swap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fromBrand: fromBrandName, toBrand: toBrandName, amount: inputNum })
        });
        if (res.ok) {
          await res.json().catch(() => null);
          onSuccess(inputNum);
        } else {
          console.error('Swap failed', await res.text());
          setDone(false);
        }
      } catch (err) {
        console.error('Swap error', err);
        setDone(false);
      } finally {
        setAmount("");
      }
    })();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw ? parseInt(raw).toLocaleString() : "");
  };

  const quickAmounts = [1000, 5000, 10000, availableBalance].filter(v => v <= availableBalance && v >= minAmount);

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: 20 }}>✅</div>
        <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: T.navy, marginBottom: 12 }}>교환 완료!</h3>
        <p style={{ color: T.gray, lineHeight: 1.7 }}>{receive.toLocaleString()} {toBrand.unit}이<br />곧 적립됩니다.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, padding: "20px 24px", background: fromBrand.colorLight, borderRadius: "1rem", border: `1px solid ${fromBrand.color}22` }}>
        <span style={{ fontSize: "2.2rem" }}>{fromBrand.logo}</span>
        <div>
          <div style={{ fontWeight: 800, color: T.navy, fontSize: "1.1rem" }}>{fromBrand.name} → {toBrand.name}</div>
          <div style={{ fontSize: ".8rem", color: T.sub, marginTop: 2 }}>
            {(fromBrand === BRANDS.nofake || toBrand === BRANDS.nofake) ? `수수료 ${NOFAKE_FEE_PERCENT}%` : "수수료 없음"}
          </div>
        </div>
      </div>

      <div style={{ background: T.navy, borderRadius: "1rem", padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#64748b", fontSize: ".78rem", marginBottom: 4 }}>보유 {fromBrand.name} 포인트</div>
          <div style={{ color: "#60a5fa", fontSize: "1.6rem", fontWeight: 900 }}>{availableBalance.toLocaleString()} P</div>
        </div>
        <div style={{ fontSize: "2rem" }}>{fromBrand.logo}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: ".78rem", color: T.gray, fontWeight: 600, marginBottom: 10 }}>빠른 선택</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {quickAmounts.map((v) => (
            <button key={v} onClick={() => setAmount(v.toLocaleString())} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: amount === v.toLocaleString() ? T.blue : T.white, color: amount === v.toLocaleString() ? "#fff" : T.text, fontWeight: 700, fontSize: ".8rem", cursor: "pointer", transition: "all .15s" }}>
              {v === availableBalance ? "전체" : `${v.toLocaleString()}P`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: ".78rem", color: T.gray, fontWeight: 600, marginBottom: 8 }}>교환할 포인트 입력</label>
        <div style={{ position: "relative" }}>
          <input type="text" value={amount} onChange={handleAmountChange} placeholder={`최소 ${minAmount.toLocaleString()}P`} style={{ width: "100%", padding: "14px 50px 14px 18px", border: `2px solid ${amount && !isValid ? T.red : amount && isValid ? T.green : T.border}`, borderRadius: 10, fontSize: "1.1rem", fontWeight: 700, color: T.navy, outline: "none", boxSizing: "border-box", transition: "border .2s" }} />
          <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: T.gray, fontWeight: 700, fontSize: ".85rem" }}>P</span>
        </div>
        {amount && inputNum < minAmount && <p style={{ color: T.red, fontSize: ".78rem", marginTop: 6 }}>최소 {minAmount.toLocaleString()}P 이상 입력해주세요.</p>}
        {amount && inputNum > availableBalance && <p style={{ color: T.red, fontSize: ".78rem", marginTop: 6 }}>보유 포인트를 초과했습니다.</p>}
      </div>

      {inputNum > 0 && (
        <div style={{ background: T.grayLight, borderRadius: "1rem", padding: "20px 24px", marginBottom: 24, border: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: ".88rem" }}>
            <span style={{ color: T.sub }}>교환 신청액</span>
            <span style={{ fontWeight: 700, color: T.text }}>{inputNum.toLocaleString()} {fromBrand.unit}</span>
          </div>
          {fee > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: ".88rem" }}>
              <span style={{ color: T.sub }}>수수료 ({NOFAKE_FEE_PERCENT}%)</span>
              <span style={{ fontWeight: 700, color: T.red }}>− {fee.toLocaleString()} P</span>
            </div>
          )}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 800, color: T.navy }}>실수령 포인트</span>
            <span style={{ fontWeight: 900, color: T.blue, fontSize: "1.1rem" }}>{receive.toLocaleString()} {toBrand.unit}</span>
          </div>
        </div>
      )}

      <button onClick={handleSwap} disabled={!isValid} style={{ width: "100%", padding: "16px", background: isValid ? T.blue : T.border, color: isValid ? "#fff" : T.gray, borderRadius: 12, fontWeight: 800, fontSize: "1rem", border: "none", cursor: isValid ? "pointer" : "not-allowed", transition: "background .2s" }}>
        {isValid ? `${fromBrand.name}에서 ${toBrand.name}로 교환하기` : "포인트 금액을 입력해주세요"}
      </button>
      <p style={{ color: T.gray, fontSize: ".75rem", textAlign: "center", marginTop: 12 }}>교환 후 취소가 불가합니다 · 블록체인 원장에 즉시 기록됩니다</p>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export const PointSwapPage = () => {
  const [direction, setDirection] = useState<SwapDirection>("from-nofake");
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [myBalances, setMyBalances] = useState({ nofake: 0, nike: 0, musinsa: 0 });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const user = useAuthUser();

  const fetchUserBalances = async () => {
    if (!user) {
      setIsLoading(false);
      setMyBalances({ nofake: 0, nike: 0, musinsa: 0 });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem(LOGIN_TOKEN_KEY);
      const res = await fetch(`${API_BASE_URL}/api/points/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const fetched = data.data || { nofake: 0, nike: 0, musinsa: 0 };
        setMyBalances({
          nofake: Number(fetched.nofake ?? 0),
          nike: Number(fetched.nike ?? 0),
          musinsa: Number(fetched.musinsa ?? 0)
        });
      } else {
        setMyBalances({ nofake: 0, nike: 0, musinsa: 0 });
      }
    } catch {
      console.error("포인트 정보를 가져오는데 실패했습니다.");
      setMyBalances({ nofake: 0, nike: 0, musinsa: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBalances();
  }, [user]);

  const handleSelectBrand = (brand: any) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setSelectedBrand(brand);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const handleSuccess = () => {
    fetchUserBalances();
    setSelectedBrand(null);
  };

  // Determine from and to brands based on direction
  let fromBrand, toBrand, availableBrands;

  if (direction === "from-nofake") {
    fromBrand = BRANDS.nofake;
    availableBrands = [BRANDS.nike, BRANDS.musinsa];
    toBrand = selectedBrand || availableBrands[0];
  } else {
    fromBrand = selectedBrand || BRANDS.nike;
    toBrand = BRANDS.nofake;
    availableBrands = [BRANDS.nike, BRANDS.musinsa];
  }

  return (
    <div style={{ paddingTop: 96, minHeight: "100vh", backgroundColor: T.grayLight, fontFamily: "sans-serif" }}>
      {showLoginModal && <LoginPromptModal onClose={() => setShowLoginModal(false)} onLogin={handleLoginRedirect} />}

      <div style={{ backgroundColor: T.navy, padding: "48px 0 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
          <p style={{ color: "#60a5fa", fontSize: ".78rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Point Swap</p>
          <h1 style={{ color: "#fff", fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, marginBottom: 12 }}>포인트 교환 센터</h1>
          <p style={{ color: "#94a3b8", fontSize: ".95rem", lineHeight: 1.7 }}>브랜드 포인트와 NoFake 포인트를 자유롭게 교환하세요.</p>
          <p style={{ color: "#f3f4f6", fontSize: ".9rem", marginTop: 8 }}><strong>안내:</strong> NoFake와의 교환(양방향)에 대해 5% 수수료가 적용됩니다.</p>

          {user ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16, marginTop: 20 }}>
              <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 16, padding: "20px" }}>
                <div style={{ color: "#94a3b8", fontSize: ".78rem", marginBottom: 8 }}>💎 NoFake</div>
                <div style={{ color: "#60a5fa", fontWeight: 900, fontSize: "1.7rem" }}>{isLoading ? "..." : `${myBalances.nofake.toLocaleString()} P`}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 16, padding: "20px" }}>
                <div style={{ color: "#94a3b8", fontSize: ".78rem", marginBottom: 8 }}>👟 Nike</div>
                <div style={{ color: "#111", fontWeight: 900, fontSize: "1.7rem" }}>{isLoading ? "..." : `${myBalances.nike.toLocaleString()} P`}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 16, padding: "20px" }}>
                <div style={{ color: "#94a3b8", fontSize: ".78rem", marginBottom: 8 }}>🛍 무신사</div>
                <div style={{ color: "#ff4800", fontWeight: 900, fontSize: "1.7rem" }}>{isLoading ? "..." : `${myBalances.musinsa.toLocaleString()} P`}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 20, padding: "12px 20px", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 10, cursor: "pointer" }} onClick={() => setShowLoginModal(true)}>
              <span style={{ fontSize: "1.2rem" }}>🔐</span>
              <span style={{ color: "#94a3b8", fontSize: ".85rem", fontWeight: 600 }}>로그인 후 포인트를 확인하세요</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px clamp(16px,4vw,48px)" }}>
        {/* Swap Direction Toggle */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ fontSize: ".78rem", color: T.gray, fontWeight: 700, marginBottom: 12, display: "block", textTransform: "uppercase" }}>교환 방향</label>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => { setDirection("from-nofake"); setSelectedBrand(null); }}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 10,
                border: `2px solid ${direction === "from-nofake" ? T.blue : T.border}`,
                background: direction === "from-nofake" ? "#eff6ff" : T.white,
                color: T.navy,
                fontWeight: 700,
                fontSize: ".9rem",
                cursor: "pointer",
                transition: "all .2s"
              }}
            >
              💎 NoFake → 브랜드
            </button>
            <button
              onClick={() => { setDirection("to-nofake"); setSelectedBrand(null); }}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 10,
                border: `2px solid ${direction === "to-nofake" ? T.blue : T.border}`,
                background: direction === "to-nofake" ? "#eff6ff" : T.white,
                color: T.navy,
                fontWeight: 700,
                fontSize: ".9rem",
                cursor: "pointer",
                transition: "all .2s"
              }}
            >
              브랜드 → 💎 NoFake
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedBrand ? "1fr 420px" : "1fr", gap: 28, alignItems: "start" }}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: T.navy, marginBottom: 20 }}>
              {direction === "from-nofake" ? "교환받을 브랜드 선택" : "제공할 브랜드 선택"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {availableBrands.map((b) => (
                <BrandCard key={b.name} brand={b} selected={selectedBrand?.name === b.name} onSelect={() => handleSelectBrand(b)} />
              ))}
            </div>
          </div>

          {selectedBrand && user && (
            <div style={{ background: T.white, borderRadius: "1.5rem", border: `1px solid ${T.border}`, overflow: "hidden", position: "sticky", top: 112, boxShadow: "0 8px 32px rgba(0,0,0,.06)" }}>
              <SwapPanel
                direction={direction}
                fromBrand={fromBrand}
                toBrand={toBrand}
                myBalances={myBalances}
                onSuccess={handleSuccess}
                onLoginRequired={() => setShowLoginModal(true)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
