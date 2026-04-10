import "./Home.css";

const mockHome = {
  eventStatus: {
    participants: 12,
    maxParticipants: 30,
    winners: 3,
    statusText: "참여 가능",
    progress: 55,
  },
  rewards: {
    puzzleCount: 3,
    puzzleGoal: 10,
    hasPrePurchase: true,
    prePurchaseText: "당첨을 축하합니다! 선구매권이 지급되었습니다",
  },
  transparency: {
    contractAddress: "0x1234...5678",
    provenanceHash: "0xabcd...ef01",
    description1: "이 이벤트는 블록체인에 기록된 데이터로 검증됩니다.",
    description2: "누구나 원본 해시와 기록 내용을 비교해 확인할 수 있습니다.",
  },
  puzzleExchange: {
    currentPieces: 7,
    targetPieces: 10,
    rewardName: "한정판 응모권",
    neededText: "교환까지 퍼즐 3개가 더 필요합니다.",
    guideText: "이벤트 참여를 통해 퍼즐 조각을 추가로 획득할 수 있습니다.",
  },
};

export default function Home() {
  const { eventStatus, rewards, transparency, puzzleExchange } = mockHome;

  return (
    <section className="home-page">
      <div className="page-heading">
        <h2>이벤트 개요</h2>
        <p>현재 진행 중인 이벤트의 참여현황을 확인하세요</p>
      </div>

      <div className="home-grid">
        {/* 왼쪽 */}
        <div className="home-column">
          <div className="home-card">
            <h3 className="card-title">이벤트 상태</h3>

            <div className="info-row">
              <span>참여자 수</span>
              <span>{eventStatus.participants} / {eventStatus.maxParticipants}</span>
            </div>

            <div className="info-row">
              <span>당첨자 수</span>
              <span>{eventStatus.winners}</span>
            </div>

            <div className="divider" />

            <div className="info-row">
              <span>현재 상태</span>
              <span className="status-active">{eventStatus.statusText}</span>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill orange"
                style={{ width: `${eventStatus.progress}%` }}
              />
            </div>
          </div>

          <div className="home-card">
            <h3 className="card-title">투명성 센터</h3>

            <div className="info-box">
              <span className="info-label">컨트랙트 주소</span>
              <strong>{transparency.contractAddress}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">원본 증명 해시</span>
              <strong>{transparency.provenanceHash}</strong>
            </div>

            <div className="notice-box">
              <p>{transparency.description1}</p>
              <p>{transparency.description2}</p>
            </div>

            <button className="full-btn">블록체인에서 확인</button>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="home-column">
          <div className="home-card">
            <h3 className="card-title">내 보상</h3>

            <div className="reward-box">
              <div className="info-row">
                <span>퍼즐 조각</span>
                <span>{rewards.puzzleCount} / {rewards.puzzleGoal}</span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill purple"
                  style={{
                    width: `${(rewards.puzzleCount / rewards.puzzleGoal) * 100}%`,
                  }}
                />
              </div>
            </div>

            {rewards.hasPrePurchase && (
              <div className="prepurchase-box">
                <strong>선구매권</strong>
                <p>{rewards.prePurchaseText}</p>
              </div>
            )}

            <div className="button-row">
              <button className="half-btn">사용하기</button>
              <button className="half-btn">교환소 이동</button>
            </div>
          </div>

          <div className="home-card">
            <h3 className="card-title">퍼즐 교환소</h3>

            <div className="puzzle-big-number">
              <span>현재 보유 퍼즐 조각</span>
              <strong>{puzzleExchange.currentPieces} / {puzzleExchange.targetPieces}</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill gradient"
                style={{
                  width: `${(puzzleExchange.currentPieces / puzzleExchange.targetPieces) * 100}%`,
                }}
              />
            </div>

            <div className="reward-preview">
              <span className="info-label">교환 가능 보상</span>
              <strong>{puzzleExchange.rewardName}</strong>
            </div>

            <div className="disabled-box">{puzzleExchange.neededText}</div>
            <p className="helper-text">{puzzleExchange.guideText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}