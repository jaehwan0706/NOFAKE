import { useMemo, useState } from "react";
import mockPuzzle from "../data/mockPuzzle";

export default function PuzzleExchange() {
  const [pieces, setPieces] = useState(mockPuzzle.pieces);

  const { progress, rewards, process } = mockPuzzle;

  const ownedCount = pieces.length;

  const selectedPieces = useMemo(() => {
    return pieces.filter((piece) => piece.selected);
  }, [pieces]);

  const selectedCount = selectedPieces.length;
  const targetCount = progress.target;

  const helperText =
    ownedCount >= targetCount
      ? "교환 가능한 조건을 충족했습니다"
      : `${targetCount - ownedCount}개 더 필요합니다`;

  const progressPercent =
    targetCount > 0 ? Math.min((ownedCount / targetCount) * 100, 100) : 0;

  const handleTogglePiece = (pieceId) => {
    setPieces((prev) =>
      prev.map((piece) =>
        piece.id === pieceId
          ? { ...piece, selected: !piece.selected }
          : piece
      )
    );
  };

  const handleExchange = (requiredCount) => {
    if (selectedCount < requiredCount) {
      alert(`퍼즐 ${requiredCount}개가 필요합니다.`);
      return;
    }

    const selectedIdsToRemove = selectedPieces
      .slice(0, requiredCount)
      .map((piece) => piece.id);

    setPieces((prev) =>
      prev.filter((piece) => !selectedIdsToRemove.includes(piece.id))
    );

    alert(`퍼즐 ${requiredCount}개가 교환되었습니다.`);
  };

  return (
    <section className="puzzle-page">
      <div className="page-heading">
        <h2>퍼즐 교환소</h2>
        <p>퍼즐 조각을 모아 선구매권 또는 쿠폰으로 교환하세요</p>
      </div>

      {/* 상단 진행 카드 */}
      <div className="puzzle-top-card">
        <span className="puzzle-top-label">현재 보유 퍼즐 조각</span>
        <strong>
          {ownedCount} / {targetCount}
        </strong>

        <div className="progress-track">
          <div
            className="progress-fill gradient"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="helper-text">{helperText}</p>
      </div>

      <div className="puzzle-content-grid">
        {/* 좌측 */}
        <div className="home-card">
          <div className="card-header-row">
            <h3 className="card-title">내 퍼즐 조각</h3>
            <span className="status-badge purple">{ownedCount}개</span>
          </div>

          <div className="puzzle-piece-grid">
            {pieces.map((piece) => (
              <button
                key={piece.id}
                type="button"
                className={`puzzle-piece-item ${piece.selected ? "selected" : ""}`}
                onClick={() => handleTogglePiece(piece.id)}
              >
                <div className="puzzle-piece-icon">🧩</div>
                <strong>#{piece.id}</strong>
              </button>
            ))}
          </div>

          <p className="helper-text center-text">
            선택된 퍼즐: {selectedCount}개
          </p>
        </div>

        {/* 우측 */}
        <div className="puzzle-right-column">
          <div className="home-card">
            <h3 className="card-title">교환 가능 보상</h3>

            <div className="exchange-reward-list">
              {rewards.map((reward, index) => {
                const canExchange = selectedCount >= reward.need;
                const remainCount = Math.max(reward.need - selectedCount, 0);
                const actionText = canExchange ? "교환하기" : `${remainCount}개 더 필요`;

                return (
                  <div
                    key={index}
                    className={
                      canExchange
                        ? "exchange-reward-item active"
                        : "exchange-reward-item"
                    }
                  >
                    <strong>{reward.title}</strong>
                    <p>{reward.description}</p>

                    <div className="info-row">
                      <span>필요 수량</span>
                      <span>{reward.need}개</span>
                    </div>

                    {canExchange ? (
                      <button
                        type="button"
                        className="exchange-btn"
                        onClick={() => handleExchange(reward.need)}
                      >
                        {actionText}
                      </button>
                    ) : (
                      <div className="disabled-box">{actionText}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="home-card">
            <h3 className="card-title">교환 프로세스</h3>

            <ol className="process-list">
              {process.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}