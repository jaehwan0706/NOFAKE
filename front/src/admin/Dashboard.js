// React 훅 및 외부 라이브러리 임포트
import { useState, useCallback, useRef, useEffect } from "react";
import QRCode from "qrcode";
import "./Dashboard.css";

const PROVENANCE_HASH = "0x7ba1cf782d87d7e37b0d780eb30d0d5d0530e79";

const PARTICIPANTS = [
  { id: 1, name: "참여자 #001", addr: "0x3f4a...b9c2", joinedAt: "2024-03-01 14:22" },
  { id: 2, name: "참여자 #002", addr: "0x7d1e...4a8f", joinedAt: "2024-03-01 14:35" },
  { id: 3, name: "참여자 #003", addr: "0x9b2c...e3d1", joinedAt: "2024-03-01 15:01" },
  { id: 4, name: "참여자 #004", addr: "0x1a5f...c7b4", joinedAt: "2024-03-01 15:18" },
];

/* ────────────────────────────────────────
   아이콘 컴포넌트
──────────────────────────────────────── */
const Icon = ({ d, size = 14, stroke = "currentColor", strokeWidth = 2.5 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={stroke} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
  >
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const QRIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
    <rect x="3"  y="3"  width="7" height="7" rx="1" />
    <rect x="14" y="3"  width="7" height="7" rx="1" />
    <rect x="3"  y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="3" height="3" />
    <rect x="18" y="14" width="3" height="3" />
    <rect x="14" y="18" width="3" height="3" />
    <rect x="18" y="18" width="3" height="3" />
  </svg>
);

/* ────────────────────────────────────────
   QR 캔버스 컴포넌트
──────────────────────────────────────── */
const QRCanvas = ({ url }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !url) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 200, margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).catch((err) => console.error("QR 생성 실패:", err));
  }, [url]);
  return <canvas ref={canvasRef} style={{ borderRadius: 8, display: "block", border: "1px solid #333" }} />;
};

/* ────────────────────────────────────────
   커스텀 확인 모달
──────────────────────────────────────── */
const ConfirmModal = ({ open, title, message, confirmLabel, confirmVariant = "orange", onConfirm, onCancel, warning }) => {
  if (!open) return null;
  return (
    <div className="nf-modal-overlay" onClick={onCancel}>
      <div className="nf-modal nf-modal--confirm" onClick={(e) => e.stopPropagation()}>
        <div className="nf-modal__header">
          <span className="nf-modal__title">{title}</span>
          <button className="nf-modal__close" onClick={onCancel}>×</button>
        </div>
        <p className="nf-confirm-message">{message}</p>
        {warning && (
          <div className="nf-warning-box nf-warning-box--sm">
            <span style={{ flexShrink: 0 }}>⚠️</span>
            <span>{warning}</span>
          </div>
        )}
        <div className="nf-confirm-actions">
          <button className="nf-btn-apply nf-confirm-cancel" onClick={onCancel}>취소</button>
          <button className={`nf-confirm-ok nf-confirm-ok--${confirmVariant}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────
   참여자 목록 모달
──────────────────────────────────────── */
const ParticipantsModal = ({ participants, onClose }) => (
  <div className="nf-modal-overlay" onClick={onClose}>
    <div className="nf-modal nf-modal--md" onClick={(e) => e.stopPropagation()}>
      <div className="nf-modal__header">
        <span className="nf-modal__title">참여자 목록</span>
        <button className="nf-modal__close" onClick={onClose}>×</button>
      </div>
      <div className="nf-participants-count">총 <strong>{participants.length}</strong>명 참여 중</div>
      <div className="nf-participants-list">
        {participants.map((p) => (
          <div key={p.id} className="nf-participant-item">
            <div className="nf-participant-avatar">{String(p.id).padStart(3, "0")}</div>
            <div className="nf-participant-info">
              <div className="nf-participant-name">{p.name}</div>
              <div className="nf-participant-addr">{p.addr}</div>
            </div>
            <div className="nf-participant-time">{p.joinedAt}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ────────────────────────────────────────
   메인 컴포넌트
──────────────────────────────────────── */
export default function NoFakeDashboard() {

  // ── 래플 설정 통합 상태 ──────────────────
  const toLocalInput = (date) => {
    const p = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
  };
  const now = new Date();
  const later = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const [startAt, setStartAt]         = useState(toLocalInput(now));
  const [endAt, setEndAt]             = useState(toLocalInput(later));
  const [prizeInputs, setPrizeInputs] = useState({ first: 1, second: 3 });

  // 적용 후 확정된 값
  const [applied, setApplied]         = useState(null); // { startAt, endAt, first, second }
  const [prizeCounts, setPrizeCounts] = useState({ first: 1, second: 3 });

  // 카운트다운
  const [countdown, setCountdown]     = useState("");
  const [status, setStatus]           = useState("");

  // ── 나머지 상태 ──────────────────────────
  const [mintClosed, setMintClosed]               = useState(false);
  const [mintClosedAt, setMintClosedAt]           = useState(null);
  const [revealed, setRevealed]                   = useState(false);
  const [qrApplied, setQrApplied]                 = useState(false);
  const [qrModal, setQrModal]                     = useState({ open: false, fromApply: false });
  const [participantsModal, setParticipantsModal] = useState(false);
  const [toast, setToast]                         = useState("");
  const [confirmModal, setConfirmModal]           = useState({ open: false, type: null });

  const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3000";
  const qrUrl = `${BASE_URL}/user/pages/Home`;

  // ── 카운트다운 타이머 ────────────────────
  useEffect(() => {
    if (!applied) return;
    const fmt = (ms) => {
      const s = Math.floor(ms / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      const p = (n) => String(n).padStart(2, "0");
      return d > 0 ? `${d}일 ${p(h)}:${p(m)}:${p(sec)}` : `${p(h)}:${p(m)}:${p(sec)}`;
    };
    const tick = () => {
      if (mintClosedAt) {
        setStatus("종료");
        setCountdown("민팅이 수동 마감되었습니다");
        return;
      }

      const n = Date.now();
      const s = new Date(applied.startAt).getTime();
      const e = new Date(applied.endAt).getTime();
      if (n < s)                { setStatus("예정");   setCountdown(fmt(s - n) + " 후 시작"); }
      else if (n >= s && n < e) { setStatus("진행중"); setCountdown(fmt(e - n) + " 남음"); }
      else                      { setStatus("종료");   setCountdown("래플 종료됨"); }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [applied, mintClosedAt]);

  const statusColor = { "예정": "#888", "진행중": "var(--color-green)", "종료": "var(--color-orange)" }[status] || "#888";

  // ── 유틸 ────────────────────────────────
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }, []);

  // ── ✅ 통합 적용 핸들러 ──────────────────
  const handleApply = () => {
    // 기간 유효성
    if (!startAt || !endAt) { showToast("래플 기간을 입력해주세요."); return; }
    if (new Date(startAt) >= new Date(endAt)) { showToast("종료 시간은 시작 시간보다 늦어야 합니다."); return; }

    // 당첨자 수 유효성
    const first  = parseInt(prizeInputs.first);
    const second = parseInt(prizeInputs.second);
    if (isNaN(first)  || first  < 1) { showToast("1등 당첨자 수를 1명 이상으로 설정해주세요."); return; }
    if (isNaN(second) || second < 1) { showToast("2등 당첨자 수를 1명 이상으로 설정해주세요."); return; }
    if (first + second >= PARTICIPANTS.length) { showToast("당첨자 합계가 전체 참여자 수를 초과할 수 없습니다."); return; }

    // 모두 통과 → 한번에 적용
    setApplied({ startAt, endAt, first, second });
    setPrizeCounts({ first, second });
    setQrApplied(true);
    setQrModal({ open: true, fromApply: true });

    const existing = JSON.parse(localStorage.getItem("nofake_raffles") || "[]");
    const newRaffle = {
      id: Date.now(),
      first, second,
      startAt, endAt,
      hash: PROVENANCE_HASH,
      createdAt: new Date().toLocaleString("ko-KR"),
    };
    localStorage.setItem("nofake_raffles", JSON.stringify([newRaffle, ...existing]));
    showToast(`래플 설정 완료 · 1등 ${first}명 · 2등 ${second}명`);
  };

  const handleQRButton = () => setQrModal({ open: true, fromApply: false });

  const handleReset = () => {
    setMintClosed(false);
    setMintClosedAt(null);
    setRevealed(false);
    setQrApplied(false);
    setApplied(null);
    setCountdown("");
    setStatus("");
    localStorage.removeItem("nofake_raffles");
    showToast("리셋 완료 — 민팅을 다시 시작할 수 있습니다.");
  };

  const handleMint = () => {
    if (mintClosed) return;
    if (!applied) { showToast("먼저 래플 기간과 당첨자 수를 적용해 주세요."); return; }
    setConfirmModal({ open: true, type: "mint" });
  };

  const handleMintConfirm = () => {
    setConfirmModal({ open: false, type: null });
    setMintClosed(true);
    setMintClosedAt(new Date().toISOString());
    showToast("민팅이 마감되었습니다. 이제 결과를 공개할 수 있습니다.");
  };

  const handleReveal = () => {
    if (!applied) { showToast("먼저 래플 설정을 적용해 주세요."); return; }
    if (mintClosed || status === "종료") {
      setConfirmModal({ open: true, type: "reveal" });
      return;
    }
    if (!mintClosed) { showToast("민팅 마감 후에만 결과를 공개할 수 있습니다."); return; }
    setConfirmModal({ open: true, type: "reveal" });
  };

  const handleRevealConfirm = () => {
    setConfirmModal({ open: false, type: null });
    setRevealed(true);
    showToast("🎉 결과가 공개되었습니다!");
  };

  const handleConfirmCancel = () => setConfirmModal({ open: false, type: null });

  const dtStyle = {
    width: "100%", padding: "7px 10px",
    background: "#111", border: "1px solid #333",
    borderRadius: 6, color: "#fff",
    fontSize: 12, boxSizing: "border-box", colorScheme: "dark",
  };

  return (
    <div className="nf-root">
      <div className="nf-app">

        {/* ── 헤더 ── */}
        <div className="nf-page-header">
          <div>
            <h1 className="nf-title">NOFAKE</h1>
            <p className="nf-subtitle">이벤트를 관리하고 결과를 공개하세요</p>
          </div>
          <div className="nf-header-actions">
            {qrApplied && (
              <button className="nf-btn-ghost nf-btn-ghost--blue" onClick={handleQRButton}>
                <QRIcon size={14} /> 참여자 QR
              </button>
            )}
            <button className="nf-btn-ghost" onClick={handleReset}>
              <Icon size={13} d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              리셋
            </button>
          </div>
        </div>

        {/* ── 2열 그리드 ── */}
        <div className="nf-grid">

          {/* 왼쪽 열 */}
          <div className="nf-col">

            {/* Provenance Hash 카드 */}
            <div className="nf-card">
              <div className="nf-card-title">
                <Icon size={13} d={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} />
                Provenance Hash
              </div>
              <div className="nf-hash-box">{PROVENANCE_HASH}</div>
              <a className="nf-hash-link"
                href={`https://etherscan.io/tx/${PROVENANCE_HASH}`}
                target="_blank" rel="noopener noreferrer">
                <Icon size={11} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                블록체인에 기록됨
              </a>
            </div>

            {/* 실시간 통계 카드 */}
            <div className="nf-card">
              <div className="nf-card-title">
                <Icon size={13} d={<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>} strokeWidth={2} />
                실시간 통계
              </div>

              <div className="nf-stat-row">
                <div>
                  <div className="nf-stat-label">참여자 수</div>
                  <div className="nf-stat-value">{PARTICIPANTS.length}</div>
                  <div className="nf-stat-sub">/ 30</div>
                  <div className="nf-progress-bar">
                    <div className="nf-progress-fill" style={{ width: `${(PARTICIPANTS.length / 30) * 100}%` }} />
                  </div>
                </div>
                <button className="nf-stat-icon-btn" onClick={() => setParticipantsModal(true)} title="참여자 목록 보기">
                  <Icon size={18} strokeWidth={2}
                    d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                  />
                </button>
                {mintClosedAt && (
                  <div className="nf-winner-hint" style={{ marginTop: 10, marginBottom: 0 }}>
                    수동 마감 시각: {new Date(mintClosedAt).toLocaleString("ko-KR")}
                  </div>
                )}
              </div>

              <div className="nf-stat-row">
                <div>
                  <div className="nf-stat-label">당첨자 수</div>
                  <div className="nf-stat-value nf-stat-value-orange">{prizeCounts.first + prizeCounts.second}</div>
                  <div className="nf-stat-sub">🥇 {prizeCounts.first}명 &nbsp;·&nbsp; 🥈 {prizeCounts.second}명</div>
                </div>
                <Icon size={18} strokeWidth={2} stroke="var(--color-muted)"
                  d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>}
                />
              </div>

              <div className="nf-stat-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <div className="nf-stat-label">상태</div>
                <div className="nf-status-list">
                  <div className="nf-status-item">
                    <div className="nf-status-dot" style={{ background: mintClosed ? "var(--color-orange)" : "var(--color-muted)" }} />
                    {mintClosed ? "민팅 마감됨" : "민팅 비활성"}
                  </div>
                  <div className="nf-status-item">
                    <div className="nf-status-dot" style={{ background: revealed ? "var(--color-green)" : "var(--color-muted)" }} />
                    {revealed ? "결과 공개 완료" : mintClosed ? "결과 공개 대기 중" : "결과 공개"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 열: 설정 단계 카드 */}
          <div className="nf-col">
            <div className="nf-card nf-card-flex">

              <div className="nf-section-label">
                <Icon size={12} d={<><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></>} />
                설정 단계
              </div>

              {/* ✅ 통합 설정 폼 */}
              <div className="nf-winner-setting">

                {/* 래플 기간 */}
                <label className="nf-winner-label">래플 기간</label>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>시작 일시</div>
                  <input type="datetime-local" value={startAt}
                    onChange={(e) => setStartAt(e.target.value)} style={dtStyle} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>종료 일시</div>
                  <input type="datetime-local" value={endAt}
                    onChange={(e) => setEndAt(e.target.value)} style={dtStyle} />
                </div>

                {/* 구분선 */}
                <div style={{ borderTop: "1px solid #2a2a2a", marginBottom: 16 }} />

                {/* 당첨자 수 */}
                <label className="nf-winner-label">당첨자 수</label>
                <div className="nf-prize-row">
                  <span className="nf-prize-badge nf-prize-badge--gold">🥇 1등</span>
                  <input
                    type="text" inputMode="numeric" className="nf-winner-input"
                    value={prizeInputs.first}
                    onChange={(e) => setPrizeInputs((p) => ({ ...p, first: e.target.value.replace(/[^0-9]/g, "") }))}
                  />
                  <span className="nf-prize-unit">명</span>
                </div>
                <div className="nf-prize-row">
                  <span className="nf-prize-badge nf-prize-badge--silver">🥈 2등</span>
                  <input
                    type="text" inputMode="numeric" className="nf-winner-input"
                    value={prizeInputs.second}
                    onChange={(e) => setPrizeInputs((p) => ({ ...p, second: e.target.value.replace(/[^0-9]/g, "") }))}
                  />
                  <span className="nf-prize-unit">명</span>
                </div>

                <div className="nf-winner-hint" style={{ marginBottom: 12 }}>
                  합계 {(parseInt(prizeInputs.first) || 0) + (parseInt(prizeInputs.second) || 0)}명 · 참여자 {PARTICIPANTS.length}명 중
                </div>

                {/* ✅ 적용 버튼 하나 */}
                <button className="nf-btn-apply nf-btn-apply--full" onClick={handleApply}>
                  래플 설정 적용
                </button>

                {/* 적용 후 카운트다운 */}
                {applied && (
                  <div style={{
                    marginTop: 12, padding: "10px 12px",
                    background: "#111", borderRadius: 8, border: "1px solid #2a2a2a"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: statusColor }}>{status}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                      ⏱ {countdown}
                    </div>
                    <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7 }}>
                      <div>시작: {new Date(applied.startAt).toLocaleString("ko-KR")}</div>
                      <div>종료: {new Date(applied.endAt).toLocaleString("ko-KR")}</div>
                      <div style={{ marginTop: 4 }}>🥇 {applied.first}명 &nbsp;·&nbsp; 🥈 {applied.second}명</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 민팅 마감 */}
              <div className="nf-mint-section">
                <div className="nf-section-label">
                  <Icon size={12} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />
                  민팅 마감
                </div>
                <div className="nf-mint-desc">마감 이후에는 추가 참여가 불가능합니다</div>
                <button
                  className={`nf-btn-mint${mintClosed ? " nf-btn-mint--closed" : ""}`}
                  onClick={handleMint} disabled={mintClosed}>
                  <Icon size={14} d={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} />
                  {mintClosed ? "✓ 민팅 마감 완료" : "민팅 마감하기"}
                </button>
              </div>

              {/* 해시 서명 완료 안내 */}
              <div className="nf-hash-done">
                <div className="nf-hash-done__title">
                  <Icon size={12} d={<polyline points="20 6 9 17 4 12"/>} stroke="var(--color-green)" />
                  해시 서명 완료
                </div>
                <div className="nf-hash-done__desc">
                  설정한 무작위값과 Provenance Hash가 스마트 계약에 의해 기록되어 있습니다.<br />
                  이는 특정 참여자의 조작이 불가능함을 보장합니다.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 마무리 단계 ── */}
        <div className="nf-finalize">
          <div className="nf-section-label">
            <Icon size={12} d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} />
            마무리 단계
          </div>
          <p className="nf-mint-desc" style={{ marginBottom: 14 }}>
            이벤트를 종료하고 모든 참가자에게 결과를 공개합니다.
          </p>
          <div className="nf-warning-box">
            <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <span>
              <strong>주의:</strong> Reveal 버튼을 누르면 모든 참가자의 결과가 동시에 공개됩니다.
              이 작업은 되돌릴 수 없으며, <strong>민팅 마감 이후에만 활성화</strong>됩니다.
            </span>
          </div>
          <button
            className={["nf-btn-reveal",
              revealed ? "nf-btn-reveal--done" : (mintClosed || status === "종료") ? "nf-btn-reveal--active" : ""]
              .filter(Boolean).join(" ")}
            onClick={handleReveal} disabled={(!mintClosed && status !== "종료") || revealed}>
            <Icon size={14} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />
            {revealed ? "✓ 결과 공개 완료" : "결과 공개 (Reveal)"}
          </button>
          <div className="nf-reveal-hint">
            {revealed ? "결과가 공개되었습니다."
              : mintClosed ? "준비 완료 — 결과 공개 가능 상태입니다."
              : "민팅 마감 후 활성화됩니다"}
          </div>
        </div>
      </div>

      {/* ── 민팅 마감 확인 모달 ── */}
      <ConfirmModal
        open={confirmModal.open && confirmModal.type === "mint"}
        title="민팅 마감"
        message="민팅을 마감하시겠습니까? 마감 후에는 추가 참여가 불가능합니다."
        confirmLabel="마감하기" confirmVariant="orange"
        onConfirm={handleMintConfirm} onCancel={handleConfirmCancel}
      />

      {/* ── 결과 공개 확인 모달 ── */}
      <ConfirmModal
        open={confirmModal.open && confirmModal.type === "reveal"}
        title="결과 공개 (Reveal)"
        message="결과를 공개하시겠습니까? 공개 후에는 모든 참가자에게 즉시 표시됩니다."
        confirmLabel="공개하기" confirmVariant="green"
        onConfirm={handleRevealConfirm} onCancel={handleConfirmCancel}
        warning="이 작업은 되돌릴 수 없습니다."
      />

      {/* ── QR 모달 ── */}
      {qrModal.open && (
        <div className="nf-modal-overlay" onClick={() => setQrModal((m) => ({ ...m, open: false }))}>
          <div className="nf-modal nf-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="nf-modal__header">
              <span className="nf-modal__title">{qrModal.fromApply ? "참여자 QR 생성 완료" : "참여자 QR"}</span>
              <button className="nf-modal__close" onClick={() => setQrModal((m) => ({ ...m, open: false }))}>×</button>
            </div>
            <div className="nf-qr-body">
              <QRCanvas url={qrUrl} />
              <div className="nf-qr-hint">QR을 찍으면 사용자 대시보드로 이동합니다.<br />추첨 목록이 실시간으로 반영됩니다.</div>
              <div className="nf-qr-url">{qrUrl}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── 참여자 목록 모달 ── */}
      {participantsModal && (
        <ParticipantsModal participants={PARTICIPANTS} onClose={() => setParticipantsModal(false)} />
      )}

      {/* ── 토스트 알림 ── */}
      <div className={`nf-toast${toast ? " nf-toast--show" : ""}`}>{toast}</div>
    </div>
  );
}
