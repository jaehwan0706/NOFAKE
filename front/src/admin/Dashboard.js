"use client";

import { useState, useCallback } from "react";
import "./Dashboard.css";

/* ────────────────────────────────────────
   상수
──────────────────────────────────────── */
const PARTICIPANTS = [
  { id: 1, name: "참여자 #001", addr: "0x3f4a...b9c2" },
  { id: 2, name: "참여자 #002", addr: "0x7d1e...4a8f" },
  { id: 3, name: "참여자 #003", addr: "0x9b2c...e3d1" },
  { id: 4, name: "참여자 #004", addr: "0x1a5f...c7b4" },
];

/* ────────────────────────────────────────
   아이콘
──────────────────────────────────────── */
const Icon = ({ d, size = 14, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const QRIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3"  y="3"  width="7" height="7" rx="1" />
    <rect x="14" y="3"  width="7" height="7" rx="1" />
    <rect x="3"  y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="3" height="3" />
    <rect x="18" y="14" width="3" height="3" />
    <rect x="14" y="18" width="3" height="3" />
    <rect x="18" y="18" width="3" height="3" />
  </svg>
);

const FakeQRSvg = () => (
  <svg width="140" height="140" viewBox="0 0 140 140">
    <rect width="140" height="140" fill="white" />
    <g fill="black">
      <rect x="10" y="10" width="35" height="35" rx="2" /><rect x="15" y="15" width="25" height="25" fill="white" rx="1" /><rect x="20" y="20" width="15" height="15" rx="1" />
      <rect x="95" y="10" width="35" height="35" rx="2" /><rect x="100" y="15" width="25" height="25" fill="white" rx="1" /><rect x="105" y="20" width="15" height="15" rx="1" />
      <rect x="10" y="95" width="35" height="35" rx="2" /><rect x="15" y="100" width="25" height="25" fill="white" rx="1" /><rect x="20" y="105" width="15" height="15" rx="1" />
      <rect x="55" y="10" width="5" height="5" /><rect x="65" y="10" width="5" height="5" /><rect x="75" y="10" width="5" height="5" />
      <rect x="55" y="20" width="5" height="5" /><rect x="75" y="20" width="5" height="5" /><rect x="60" y="30" width="10" height="5" />
      <rect x="50" y="55" width="5" height="5" /><rect x="60" y="50" width="5" height="5" /><rect x="70" y="55" width="5" height="5" />
      <rect x="80" y="50" width="5" height="5" /><rect x="90" y="55" width="5" height="5" /><rect x="55" y="65" width="15" height="5" />
      <rect x="75" y="60" width="5" height="10" /><rect x="50" y="70" width="5" height="5" />
      <rect x="95" y="55" width="5" height="5" /><rect x="100" y="60" width="5" height="10" />
      <rect x="110" y="55" width="5" height="5" /><rect x="115" y="60" width="5" height="5" />
      <rect x="50" y="80" width="10" height="5" /><rect x="65" y="80" width="5" height="5" />
      <rect x="75" y="80" width="10" height="5" /><rect x="50" y="90" width="5" height="5" />
      <rect x="60" y="85" width="5" height="10" /><rect x="70" y="90" width="5" height="5" />
      <rect x="80" y="85" width="5" height="5" /><rect x="90" y="80" width="5" height="5" />
      <rect x="100" y="85" width="5" height="5" /><rect x="110" y="80" width="5" height="10" />
    </g>
  </svg>
);

/* ────────────────────────────────────────
   메인
──────────────────────────────────────── */
export default function NoFakeDashboard() {

  /* ── 상태 ── */
  const [winnerInput, setWinnerInput]         = useState(10);
  const [winnerCount, setWinnerCount]         = useState(10);
  const [mintClosed, setMintClosed]           = useState(false);
  const [revealed, setRevealed]               = useState(false);
  const [qrApplied, setQrApplied]             = useState(false);
  const [qrModal, setQrModal]                 = useState({ open: false, fromApply: false });
  const [winnerModal, setWinnerModal]         = useState(false);
  const [selectedWinners, setSelectedWinners] = useState(new Set());
  const [toast, setToast]                     = useState("");

  /* ── 토스트 ── */
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }, []);

  /* ── 핸들러 ── */
  const handleQRButton = () => setQrModal({ open: true, fromApply: false });

  const handleReset = () => {
    setQrApplied(false);
    showToast("리셋 완료 — 다음 적용 시 새로운 QR이 발급됩니다.");
  };

  const handleApply = () => {
    const val = parseInt(winnerInput);
    if (isNaN(val) || val < 1 || val > 19) { showToast("1명 이상 19명 이하로 설정해주세요."); return; }
    setWinnerCount(val);
    setQrApplied(true);
    setQrModal({ open: true, fromApply: true });
    showToast(`당첨자 수 ${val}명 적용 — QR이 생성되었습니다.`);
  };

  const handleMint = () => {
    if (mintClosed) return;
    if (!window.confirm("민팅을 마감하시겠습니까?\n마감 후에는 추가 참여가 불가능합니다.")) return;
    setMintClosed(true);
    showToast("민팅이 마감되었습니다. 이제 결과를 공개할 수 있습니다.");
  };

  const handleReveal = () => {
    if (!mintClosed) { showToast("민팅 마감 후에만 결과를 공개할 수 있습니다."); return; }
    if (!window.confirm("결과를 공개하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.")) return;
    setRevealed(true);
    showToast("🎉 결과가 공개되었습니다!");
  };

  const toggleWinner = (id) => {
    setSelectedWinners((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const confirmWinners = () => {
    if (selectedWinners.size > 0) {
      setWinnerCount(selectedWinners.size);
      setWinnerInput(selectedWinners.size);
      showToast(`${selectedWinners.size}명의 당첨자가 선택되었습니다.`);
    }
    setWinnerModal(false);
  };

  /* ── 파생 값 ── */
  const qrTitle = qrModal.fromApply ? "참여자 QR 생성 완료" : "참여자 QR";
  const qrHint  = `당첨자 수 ${winnerCount}명이 적용된 QR입니다.\n참여자에게 공유하세요.`;

  /* ── 렌더 ── */
  return (
    <div className="nf-root">
      <div className="nf-app">

        {/* 페이지 헤더 */}
        <div className="nf-page-header">
          <div>
            <h1>NoFAKE</h1>
            <p>이벤트를 관리하고 결과를 공개하세요</p>
          </div>
          <div className="nf-header-actions">
            {qrApplied && (
              <button className="nf-btn-qr" onClick={handleQRButton}>
                <QRIcon size={14} /> 참여자 QR
              </button>
            )}
            <button className="nf-btn-reset" onClick={handleReset}>
              <Icon size={13} d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              리셋
            </button>
          </div>
        </div>

        {/* 메인 그리드 */}
        <div className="nf-grid">

          {/* 왼쪽 — Provenance Hash + 통계 */}
          <div className="nf-col">

            <div className="nf-card">
              <div className="nf-card-title">
                <Icon size={13} d={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} />
                Provenance Hash
              </div>
              <div className="nf-hash-box">
                0x7ba1cL782d87d7E37b0d780eb30d0d5d0530e79%27ddf883.7n685tbea4sore9
              </div>
              <a className="nf-hash-link">
                <Icon size={11} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                블록체인에 기록됨
              </a>
            </div>

            <div className="nf-card">
              <div className="nf-card-title">
                <Icon size={13} d={<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>} strokeWidth={2} />
                실시간 통계
              </div>

              <div className="nf-stat-row">
                <div>
                  <div className="nf-stat-label">참여자 수</div>
                  <div className="nf-stat-value">4</div>
                  <div className="nf-stat-sub">/ 30</div>
                  <div className="nf-progress-bar">
                    <div className="nf-progress-fill" style={{ width: "13%" }} />
                  </div>
                </div>
                <Icon size={15} strokeWidth={2} stroke="var(--muted)"
                  d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                />
              </div>

              <div className="nf-stat-row">
                <div>
                  <div className="nf-stat-label">당첨자 수</div>
                  <div className="nf-stat-value nf-stat-value--orange">{winnerCount}</div>
                  <div className="nf-stat-sub">
                    현재 내보기 중
                    <button className="nf-btn-inline" onClick={() => setWinnerModal(true)}>
                      ✏️ 직접 선택
                    </button>
                  </div>
                </div>
                <Icon size={15} strokeWidth={2} stroke="var(--muted)"
                  d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>}
                />
              </div>

              <div className="nf-stat-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <div className="nf-stat-label">상태</div>
                <div className="nf-status-list">
                  <div className="nf-status-item">
                    <div className="nf-status-dot" style={{ background: mintClosed ? "var(--orange)" : "var(--muted)" }} />
                    {mintClosed ? "민팅 마감됨" : "민팅 비활성"}
                  </div>
                  <div className="nf-status-item">
                    <div className="nf-status-dot" style={{ background: revealed ? "var(--green)" : "var(--muted)" }} />
                    {revealed ? "결과 공개 완료" : mintClosed ? "결과 공개 대기 중" : "결과 공개"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 — 설정 단계 */}
          <div className="nf-col">
            <div className="nf-card nf-card-flex">

              <div className="nf-section-label">
                <Icon size={12} d={<><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></>} />
                설정 단계
              </div>

              <div className="nf-winner-setting">
                <label>당첨자 수 설정</label>
                <div className="nf-winner-row">
                  <input
                    type="number" className="nf-winner-input"
                    value={winnerInput} min={1} max={19}
                    onChange={e => setWinnerInput(e.target.value)}
                  />
                  <button className="nf-btn-apply" onClick={handleApply}>적용</button>
                </div>
                <div className="nf-winner-hint">19명 이하까지 설정 가능</div>
              </div>

              <div className="nf-mint-section">
                <div className="nf-section-label">
                  <Icon size={12} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />
                  민팅 마감
                </div>
                <div className="nf-mint-desc">마감 이후에는 추가 참여가 불가능합니다</div>
                <button
                  className={`nf-btn-mint${mintClosed ? " nf-btn-mint--closed" : ""}`}
                  onClick={handleMint} disabled={mintClosed}
                >
                  <Icon size={14} d={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} />
                  {mintClosed ? "✓ 민팅 마감 완료" : "민팅 마감하기"}
                </button>
              </div>

              <div className="nf-hash-done">
                <div className="nf-hash-done__title">
                  <Icon size={12} d={<polyline points="20 6 9 17 4 12"/>} stroke="var(--green)" />
                  해시 선거름 완료
                </div>
                <div className="nf-hash-done__desc">
                  설정한 무작위와 Provenance Hash가 스마트 계약에 의해 기록되어 있습니다.<br />
                  이는 특정 참여자의 조작이 불가능함을 보장합니다.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 마무리 단계 */}
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
              <strong>주의:</strong> Reveal 버튼을 누르면 모든 참가자의 마스터리 텍스트가 동시에 열립니다.
              이 작업은 되돌릴 수 없으며, <strong>민팅 마감 이후에만 활성화</strong>됩니다. 한번 진행하면 취소할 수 없습니다.
            </span>
          </div>
          <button
            className={`nf-btn-reveal${revealed ? " nf-btn-reveal--done" : mintClosed ? " nf-btn-reveal--active" : ""}`}
            onClick={handleReveal} disabled={!mintClosed || revealed}
          >
            <Icon size={14} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />
            {revealed ? "✓ 결과 공개 완료" : "결과 공개 (Reveal)"}
          </button>
          <div className="nf-reveal-hint">
            {revealed ? "결과가 공개되었습니다." : mintClosed ? "준비 완료 — 결과 공개 가능 상태입니다." : "민팅 마감 후 활성화됩니다"}
          </div>
        </div>

      </div>

      {/* QR 모달 */}
      {qrModal.open && (
        <div className="nf-modal-overlay" onClick={() => setQrModal(m => ({ ...m, open: false }))}>
          <div className="nf-modal nf-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="nf-modal__header">
              <span className="nf-modal__title">{qrTitle}</span>
              <button className="nf-modal__close" onClick={() => setQrModal(m => ({ ...m, open: false }))}>×</button>
            </div>
            <div className="nf-qr-body">
              <div className="nf-qr-image"><FakeQRSvg /></div>
              <div className="nf-qr-hint">{qrHint}</div>
            </div>
          </div>
        </div>
      )}

      {/* 당첨자 선택 모달 */}
      {winnerModal && (
        <div className="nf-modal-overlay" onClick={() => setWinnerModal(false)}>
          <div className="nf-modal" onClick={e => e.stopPropagation()}>
            <div className="nf-modal__header">
              <span className="nf-modal__title">당첨자 직접 선택</span>
              <button className="nf-modal__close" onClick={() => setWinnerModal(false)}>×</button>
            </div>
            <p className="nf-modal__desc">참여자 목록에서 당첨자를 직접 선택할 수 있습니다.</p>
            <div className="nf-participant-list">
              {PARTICIPANTS.map(p => {
                const sel = selectedWinners.has(p.id);
                return (
                  <div key={p.id}
                    className={`nf-participant-item${sel ? " nf-participant-item--selected" : ""}`}
                    onClick={() => toggleWinner(p.id)}
                  >
                    <div>
                      <div className="nf-participant-item__name">{p.name}</div>
                      <div className="nf-participant-item__addr">{p.addr}</div>
                    </div>
                    <div className={`nf-participant-item__check${sel ? " nf-participant-item__check--on" : ""}`}>
                      {sel && <Icon size={9} d={<polyline points="20 6 9 17 4 12"/>} stroke="#fff" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="nf-modal__footer">
              <button className="nf-btn-modal-cancel" onClick={() => setWinnerModal(false)}>취소</button>
              <button className="nf-btn-modal-confirm" onClick={confirmWinners}>선택 완료</button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      <div className={`nf-toast${toast ? " nf-toast--show" : ""}`}>{toast}</div>

    </div>
  );
}
