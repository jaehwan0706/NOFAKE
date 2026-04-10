import { useMemo, useState } from "react";
import DrawResultModal from "../components/DrawResultModal";
import mockDraw from "../data/mockDraw";

export default function DrawStatus({ events = [] }) {
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [selectedEventSlug, setSelectedEventSlug] = useState(mockDraw[0]?.slug || "");

  const selectedDraw = useMemo(() => {
    return mockDraw.find((event) => event.slug === selectedEventSlug) || mockDraw[0];
  }, [selectedEventSlug]);

  const selectedEvent = useMemo(() => {
    return events.find((event) => event.slug === selectedEventSlug) || events[0];
  }, [events, selectedEventSlug]);

  if (!selectedDraw || !selectedEvent) {
    return (
      <section className="draw-page">
        <div className="page-heading">
          <h2>드로우 현황</h2>
          <p>표시할 이벤트가 없습니다.</p>
        </div>
      </section>
    );
  }

  const { products, eventName, banner } = selectedDraw;
  const { status, result } = selectedEvent;

  const isRevealed = status?.isRevealed ?? false;
  const participantCount = status?.participants ?? 0;
  const maxParticipants = status?.maxParticipants ?? 0;
  const remainingTime = status?.remainingTime ?? "-";
  const progressPercent =
    status?.progress ??
    (maxParticipants > 0
      ? Math.min(Math.round((participantCount / maxParticipants) * 100), 100)
      : 0);

  const bannerTitle = isRevealed
    ? banner?.title || "이벤트 당첨 결과 확인"
    : "이벤트 결과 공개 대기 중";

  const bannerDescription = isRevealed
    ? banner?.revealedDescription ||
      "추첨이 완료되었습니다. 내 지갑에서 당첨 결과를 확인하세요."
    : banner?.waitingDescription ||
      "관리자 리빌 이후 당첨 결과를 확인할 수 있습니다.";

  const bannerButtonText = isRevealed
    ? banner?.revealedButtonText || "당첨 확인하기"
    : "결과 공개 대기 중";

  return (
    <section className="draw-page">
      <div className="page-heading">
        <h2>드로우 현황</h2>
        <p>이벤트 참여 현황과 상품 정보를 확인하세요</p>
      </div>

      <div className="draw-event-tabs">
        {mockDraw.map((event) => (
          <button
            key={event.slug}
            type="button"
            className={`draw-event-tab ${selectedEventSlug === event.slug ? "active" : ""}`}
            onClick={() => {
              setSelectedEventSlug(event.slug);
              setIsResultOpen(false);
            }}
          >
            {event.eventName}
          </button>
        ))}
      </div>

      <div className="selected-event-label">
        <strong>{eventName}</strong>
      </div>

      <div className={`draw-banner ${isRevealed ? "revealed" : "waiting"}`}>
        <div className="draw-banner-icon">{isRevealed ? "✓" : "⏳"}</div>
        <h3>{bannerTitle}</h3>
        <p>{bannerDescription}</p>

        <button
          type="button"
          className={`banner-btn ${!isRevealed ? "disabled" : ""}`}
          onClick={() => {
            if (isRevealed) setIsResultOpen(true);
          }}
          disabled={!isRevealed}
        >
          {bannerButtonText}
        </button>
      </div>

      <div className="draw-content-grid">
        <div className="home-card">
          <h3 className="card-title">상품 정보</h3>

          <div className="draw-product-list">
            {products.map((product, index) => (
              <div key={index} className="draw-product-item">
                <div className="draw-product-left">
                  <span className="rank-badge">{product.rank}</span>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{product.description}</p>
                  </div>
                </div>
                <span className="quantity-text">{product.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-card">
          <h3 className="card-title">실시간 참여 현황</h3>

          <div className="draw-live-status-card">
            <div className="draw-live-status-top">
              <div className="draw-live-status-item">
                <span className="summary-label">참여자 수</span>
                <strong>{participantCount}명</strong>
              </div>

              <div className="draw-live-status-item">
                <span className="summary-label">모집 인원</span>
                <strong>{maxParticipants}명</strong>
              </div>

              <div className="draw-live-status-item">
                <span className="summary-label">남은 시간</span>
                <strong>{remainingTime}</strong>
              </div>
            </div>

            <div className="draw-live-progress-header">
              <span>
                {participantCount} / {maxParticipants} 참여 중
              </span>
              <strong>{progressPercent}%</strong>
            </div>

            <div className="draw-live-progress-bar">
              <div
                className="draw-live-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="helper-text center-text">실시간으로 업데이트됩니다</p>
          </div>
        </div>
      </div>

      <DrawResultModal
        isOpen={isResultOpen}
        onClose={() => setIsResultOpen(false)}
        result={result}
      />
    </section>
  );
}