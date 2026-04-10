import { Link } from "react-router-dom";
import mockDraw from "../data/mockDraw";

export default function DrawStatus() {
  const { banner, summary, products, liveEntries } = mockDraw;

  return (
    <section className="draw-page">
      <div className="page-heading">
        <h2>드로우 현황</h2>
        <p>실시간 응모자 수와 상품 정보를 확인하세요</p>
      </div>

      <div className="draw-banner">
        <div className="draw-banner-icon">✓</div>
        <h3>{banner.title}</h3>
        <p>{banner.description}</p>
        <Link to="/my-wallet" className="banner-btn">
          {banner.buttonText}
        </Link>
      </div>

      <div className="draw-summary-grid">
        <div className="draw-summary-card">
          <span className="summary-label">총 응모자</span>
          <strong>{summary.participants}명</strong>
        </div>

        <div className="draw-summary-card">
          <span className="summary-label">총 상품 수</span>
          <strong>{summary.totalProducts}개</strong>
        </div>

        <div className="draw-summary-card">
          <span className="summary-label">남은 시간</span>
          <strong>{summary.remainingTime}</strong>
        </div>
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

          <div className="live-entry-list">
            {liveEntries.map((entry, index) => (
              <div key={index} className="live-entry-item">
                <div>
                  <strong>{entry.address}</strong>
                  <p>{entry.time}</p>
                </div>
                <span className="entry-amount">{entry.amount}</span>
              </div>
            ))}
          </div>

          <p className="helper-text center-text">실시간으로 업데이트됩니다</p>
        </div>
      </div>
    </section>
  );
}