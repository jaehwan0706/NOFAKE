import mockPuzzle from "../data/mockPuzzle";

export default function PuzzleExchange() {
  const { progress, pieces, selectedCount, rewards, process } = mockPuzzle;

  return (
    <section className="puzzle-page">
      <div className="page-heading">
        <h2>퍼즐 교환소</h2>
        <p>퍼즐 조각을 모아 선구매권 또는 쿠폰으로 교환하세요</p>
      </div>

      <div className="puzzle-top-card">
        <span className="puzzle-top-label">현재 보유 퍼즐 조각</span>
        <strong>
          {progress.current} / {progress.target}
        </strong>

        <div className="progress-track">
          <div
            className="progress-fill gradient"
            style={{ width: `${(progress.current / progress.target) * 100}%` }}
          />
        </div>

        <p className="helper-text">{progress.helperText}</p>
      </div>

      <div className="puzzle-content-grid">
        <div className="home-card">
          <div className="card-header-row">
            <h3 className="card-title">내 퍼즐 조각</h3>
            <span className="status-badge purple">{selectedCount}개</span>
          </div>

          <div className="puzzle-piece-grid">
            {pieces.map((piece) => (
              <div key={piece.id} className="puzzle-piece-item">
                <div className="puzzle-piece-icon">🧩</div>
                <strong>#{piece.id}</strong>
                <span
                  className={
                    piece.label === "희귀"
                      ? "status-badge purple"
                      : "status-badge gray"
                  }
                >
                  {piece.label}
                </span>
              </div>
            ))}
          </div>

          <p className="helper-text center-text">선택된 퍼즐: {selectedCount}개</p>
        </div>

        <div className="puzzle-right-column">
          <div className="home-card">
            <h3 className="card-title">교환 가능 보상</h3>

            <div className="exchange-reward-list">
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className={
                    reward.active
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

                  {reward.active ? (
                    <button className="exchange-btn">{reward.actionText}</button>
                  ) : (
                    <div className="disabled-box">{reward.actionText}</div>
                  )}
                </div>
              ))}
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