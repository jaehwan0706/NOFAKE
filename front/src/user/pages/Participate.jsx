import mockParticipate from "../data/mockParticipate";

export default function Participate() {
  const { qr, mint, login, guide } = mockParticipate;

  return (
    <section className="participate-page">
      <div className="page-heading">
        <h2>이벤트 참여하기</h2>
        <p>QR 코드를 스캔하거나 카카오 로그인으로 참여하세요</p>
      </div>

      <div className="participate-grid">
        {/* 왼쪽: QR 카드 */}
        <div className="participate-card qr-card">
          <h3 className="card-title">{qr.title}</h3>

          <div className="qr-visual">
            <div className="qr-icon-box">QR</div>
          </div>

          <div className="participate-card-text">
            <strong>{qr.description}</strong>
            <p>{qr.subText}</p>
          </div>

          <div className="button-row">
            <button className="half-btn primary-orange">{qr.cameraButton}</button>
            <button className="half-btn">{qr.uploadButton}</button>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="participate-right-column">
          <div className="participate-card">
            <h3 className="card-title">{mint.title}</h3>

            <div className="mint-visual">
              <div className="mint-box-icon">□</div>
            </div>

            <div className="participate-card-text center">
              <strong>{mint.description}</strong>
              <p>{mint.subText}</p>
            </div>

            <div className="cost-box">
              <div className="info-row">
                <span>민팅 비용</span>
                <span>{mint.mintCost}</span>
              </div>
              <div className="info-row">
                <span>가스비 예상</span>
                <span>{mint.gasEstimate}</span>
              </div>
              <div className="info-row total">
                <span>총 비용</span>
                <span>{mint.totalCost}</span>
              </div>
            </div>

            <button className="full-btn disabled-btn">{mint.buttonText}</button>
          </div>

          <div className="participate-card">
            <h3 className="card-title">{login.title}</h3>
            <p className="login-description">{login.description}</p>

            <button className="kakao-btn">{login.buttonText}</button>

            <p className="helper-text">{login.guideText}</p>
          </div>
        </div>
      </div>

      <div className="participate-guide-card">
        <h3 className="card-title">{guide.title}</h3>
        <ul className="guide-list">
          {guide.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}