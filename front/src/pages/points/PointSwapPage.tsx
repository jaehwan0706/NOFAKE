import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthUser } from "../../components/Header";

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

const PARTNERS = [
  { id: "nike", name: "Nike", logo: "👟", color: "#111", colorLight: "#f5f5f5", fee: 3, unit: "Nike 포인트", minAmount: 5000, description: "Nike.com, SNKRS 앱에서 사용 가능" },
  { id: "musinsa", name: "무신사", logo: "🛍", color: "#ff4800", colorLight: "#fff3ef", fee: 2, unit: "무신사 포인트", minAmount: 3000, description: "무신사 스토어 전 브랜드에서 사용 가능" },
  { id: "adidas", name: "Adidas", logo: "🔱", color: "#000", colorLight: "#f5f5f5", fee: 3, unit: "Adidas 포인트", minAmount: 5000, description: "Adidas 공식몰, 아울렛에서 사용 가능" },
  { id: "newbalance", name: "New Balance", logo: "🔵", color: "#cf102d", colorLight: "#fff0f2", fee: 3, unit: "NB 포인트", minAmount: 5000, description: "New Balance 공식몰에서 사용 가능" },
  { id: "giftcard", name: "기프트카드", logo: "🎁", color: "#7c3aed", colorLight: "#f5f3ff", fee: 5, unit: "원 기프트카드", minAmount: 10000, description: "문화상품권, 신세계상품권으로 교환" },
  { id: "kasina", name: "Kasina", logo: "🏪", color: "#1d4ed8", colorLight: "#eff6ff", fee: 2, unit: "카시나 포인트", minAmount: 3000, description: "카시나 온·오프라인 매장에서 사용 가능" },
];

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

function PartnerCard({ partner, selected, onSelect }: { partner: any; selected: boolean; onSelect: (p: any) => void }) {
  return (
    <button onClick={() => onSelect(partner)} style={{ background: selected ? partner.colorLight : T.white, border: `2px solid ${selected ? partner.color : T.border}`, borderRadius: "1.25rem", padding: "24px 20px", cursor: "pointer", textAlign: "left", transition: "all .2s", width: "100%", boxSizing: "border-box", position: "relative", outline: "none" }}>
      {selected && <span style={{ position: "absolute", top: 12, right: 14, width: 20, height: 20, borderRadius: "50%", background: partner.color, color: "#fff", fontSize: ".65rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>✓</span>}
      <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>{partner.logo}</div>
      <div style={{ fontWeight: 800, color: T.navy, fontSize: "1rem", marginBottom: 4 }}>{partner.name}</div>
      <div style={{ fontSize: ".75rem", color: T.gray, marginBottom: 8 }}>수수료 {partner.fee}% · 최소 {partner.minAmount.toLocaleString()}P</div>
      <div style={{ fontSize: ".72rem", color: T.sub, lineHeight: 1.5 }}>{partner.description}</div>
    </button>
  );
}

function ExchangePanel({ partner, myPoints, onSuccess, onLoginRequired }: { partner: any; myPoints: number; onSuccess: (amount: number) => void; onLoginRequired: () => void }) {
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  const user = useAuthUser();

  const inputNum = parseInt(amount.replace(/,/g, "")) || 0;
  const fee = Math.floor(inputNum * (partner.fee / 100));
  const receive = inputNum - fee;
  const isValid = inputNum >= partner.minAmount && inputNum <= myPoints && inputNum > 0;

  const handleExchange = () => {
    if (!user) {
      onLoginRequired();
      return;
    }
    if (!isValid) return;
    setDone(true);
    (async () => {
      try {
        const token = localStorage.getItem(LOGIN_TOKEN_KEY);
        const res = await fetch(`${API_BASE_URL}/api/points/swap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fromBrand: 'NOFAKE', toBrand: partner.name.toUpperCase(), amount: inputNum })
        });
        if (res.ok) {
          const body = await res.json();
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

  const quickAmounts = [5000, 10000, 20000, myPoints].filter(v => v <= myPoints && v >= partner.minAmount);

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: 20 }}>✅</div>
        <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: T.navy, marginBottom: 12 }}>교환 신청 완료!</h3>
        <p style={{ color: T.gray, lineHeight: 1.7 }}>{receive.toLocaleString()} {partner.unit}이<br />곧 적립됩니다.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, padding: "20px 24px", background: partner.colorLight, borderRadius: "1rem", border: `1px solid ${partner.color}22` }}>
        <span style={{ fontSize: "2.2rem" }}>{partner.logo}</span>
        <div>
          <div style={{ fontWeight: 800, color: T.navy, fontSize: "1.1rem" }}>{partner.name} 포인트 교환</div>
          <div style={{ fontSize: ".8rem", color: T.sub, marginTop: 2 }}>수수료 {partner.fee}% · {partner.description}</div>
        </div>
      </div>

      <div style={{ background: T.navy, borderRadius: "1rem", padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#64748b", fontSize: ".78rem", marginBottom: 4 }}>보유 nofake 포인트</div>
          <div style={{ color: "#60a5fa", fontSize: "1.6rem", fontWeight: 900 }}>{myPoints.toLocaleString()} P</div>
        </div>
        <div style={{ fontSize: "2rem" }}>💎</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: ".78rem", color: T.gray, fontWeight: 600, marginBottom: 10 }}>빠른 선택</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {quickAmounts.map((v) => (
            <button key={v} onClick={() => setAmount(v.toLocaleString())} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: amount === v.toLocaleString() ? T.blue : T.white, color: amount === v.toLocaleString() ? "#fff" : T.text, fontWeight: 700, fontSize: ".8rem", cursor: "pointer", transition: "all .15s" }}>
              {v === myPoints ? "전체" : `${v.toLocaleString()}P`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: ".78rem", color: T.gray, fontWeight: 600, marginBottom: 8 }}>교환할 포인트 입력</label>
        <div style={{ position: "relative" }}>
          <input type="text" value={amount} onChange={handleAmountChange} placeholder={`최소 ${partner.minAmount.toLocaleString()}P`} style={{ width: "100%", padding: "14px 50px 14px 18px", border: `2px solid ${amount && !isValid ? T.red : amount && isValid ? T.green : T.border}`, borderRadius: 10, fontSize: "1.1rem", fontWeight: 700, color: T.navy, outline: "none", boxSizing: "border-box", transition: "border .2s" }} />
          <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: T.gray, fontWeight: 700, fontSize: ".85rem" }}>P</span>
        </div>
        {amount && inputNum < partner.minAmount && <p style={{ color: T.red, fontSize: ".78rem", marginTop: 6 }}>최소 {partner.minAmount.toLocaleString()}P 이상 입력해주세요.</p>}
        {amount && inputNum > myPoints && <p style={{ color: T.red, fontSize: ".78rem", marginTop: 6 }}>보유 포인트를 초과했습니다.</p>}
      </div>

      {inputNum > 0 && (
        <div style={{ background: T.grayLight, borderRadius: "1rem", padding: "20px 24px", marginBottom: 24, border: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: ".88rem" }}>
            <span style={{ color: T.sub }}>교환 신청액</span>
            <span style={{ fontWeight: 700, color: T.text }}>{inputNum.toLocaleString()} P</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: ".88rem" }}>
            <span style={{ color: T.sub }}>수수료 ({partner.fee}%)</span>
            <span style={{ fontWeight: 700, color: T.red }}>− {fee.toLocaleString()} P</span>
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 800, color: T.navy }}>실수령 포인트</span>
            <span style={{ fontWeight: 900, color: T.blue, fontSize: "1.1rem" }}>{receive.toLocaleString()} {partner.unit}</span>
          </div>
        </div>
      )}

      <button onClick={handleExchange} disabled={!isValid} style={{ width: "100%", padding: "16px", background: isValid ? T.blue : T.border, color: isValid ? "#fff" : T.gray, borderRadius: 12, fontWeight: 800, fontSize: "1rem", border: "none", cursor: isValid ? "pointer" : "not-allowed", transition: "background .2s" }}>
        {isValid ? `${partner.name} 포인트로 교환하기` : "포인트 금액을 입력해주세요"}
      </button>
      <p style={{ color: T.gray, fontSize: ".75rem", textAlign: "center", marginTop: 12 }}>교환 후 취소가 불가합니다 · 블록체인 원장에 즉시 기록됩니다</p>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export const PointSwapPage = () => {
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [myPoints, setMyPoints] = useState(0); // ✅ 초기값을 0으로 설정
  const [history, setHistory] = useState<any[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const user = useAuthUser();

  // ✅ 사용자 포인트 실시간 로드
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
        try {
          const token = localStorage.getItem(LOGIN_TOKEN_KEY);
          const res = await fetch(`${API_BASE_URL}/api/points/balance`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setMyPoints(data.data?.nofake ?? 0);
          }
      } catch (error) {
        console.error("포인트 정보를 가져오는데 실패했습니다.");
        setMyPoints(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPoints();
  }, [user]);

  const handleSelectPartner = (partner: any) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setSelectedPartner(partner);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const handleSuccess = (amount: number) => {
    setMyPoints((prev) => prev - amount);
    setHistory((prev) => [
      {
        partner: selectedPartner.name,
        logo: selectedPartner.logo,
        amount,
        fee: Math.floor(amount * (selectedPartner.fee / 100)),
        receive: amount - Math.floor(amount * (selectedPartner.fee / 100)),
        unit: selectedPartner.unit,
        date: new Date().toLocaleDateString("ko-KR"),
      },
      ...prev,
    ]);
    setSelectedPartner(null);
  };

  return (
    <div style={{ paddingTop: 96, minHeight: "100vh", backgroundColor: T.grayLight, fontFamily: "sans-serif" }}>
      {showLoginModal && <LoginPromptModal onClose={() => setShowLoginModal(false)} onLogin={handleLoginRedirect} />}

      <div style={{ backgroundColor: T.navy, padding: "48px 0 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
          <p style={{ color: "#60a5fa", fontSize: ".78rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Point Swap</p>
          <h1 style={{ color: "#fff", fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, marginBottom: 12 }}>포인트 교환 센터</h1>
          <p style={{ color: "#94a3b8", fontSize: ".95rem", lineHeight: 1.7 }}>nofake 포인트를 파트너 브랜드 포인트로 교환하세요. 수수료만 차감 후 즉시 적립됩니다.</p>
          <p style={{ color: "#f3f4f6", fontSize: ".9rem", marginTop: 8 }}><strong>안내:</strong> NoFake 포인트를 다른 브랜드로 교환 시 5%의 수수료가 발생합니다.</p>

          {user ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 20, padding: "12px 20px", background: "rgba(96,165,250,.15)", border: "1px solid rgba(96,165,250,.3)", borderRadius: 10 }}>
              <span style={{ fontSize: "1.2rem" }}>💎</span>
              <div>
                <span style={{ color: "#94a3b8", fontSize: ".75rem" }}>보유 포인트</span>
                <span style={{ color: "#60a5fa", fontWeight: 900, fontSize: "1.2rem", marginLeft: 10 }}>
                  {isLoading ? "..." : `${myPoints.toLocaleString()} P`}
                </span>
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
        <div style={{ display: "grid", gridTemplateColumns: selectedPartner ? "1fr 420px" : "1fr", gap: 28, alignItems: "start" }}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: T.navy, marginBottom: 20 }}>교환할 파트너 선택</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {PARTNERS.map((p) => (
                <PartnerCard key={p.id} partner={p} selected={selectedPartner?.id === p.id} onSelect={handleSelectPartner} />
              ))}
            </div>
          </div>

          {selectedPartner && user && (
            <div style={{ background: T.white, borderRadius: "1.5rem", border: `1px solid ${T.border}`, overflow: "hidden", position: "sticky", top: 112, boxShadow: "0 8px 32px rgba(0,0,0,.06)" }}>
              <ExchangePanel partner={selectedPartner} myPoints={myPoints} onSuccess={handleSuccess} onLoginRequired={() => setShowLoginModal(true)} />
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: T.navy, marginBottom: 20 }}>최근 교환 내역</h2>
            <div style={{ background: T.white, borderRadius: "1.25rem", border: `1px solid ${T.border}`, overflow: "hidden" }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: i < history.length - 1 ? `1px solid ${T.border}` : "none", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: "1.6rem" }}>{h.logo}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: T.navy, fontSize: ".9rem" }}>{h.partner} 포인트 교환</div>
                      <div style={{ color: T.gray, fontSize: ".75rem", marginTop: 2 }}>{h.date} · 수수료 {h.fee.toLocaleString()}P 차감</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: T.red, fontWeight: 700, fontSize: ".85rem" }}>− {h.amount.toLocaleString()} P</div>
                    <div style={{ color: T.green, fontWeight: 700, fontSize: ".85rem" }}>+ {h.receive.toLocaleString()} {h.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};