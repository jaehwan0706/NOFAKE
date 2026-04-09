export default function NFTDetailModal({ isOpen, onClose, ticket }) {
  if (!isOpen || !ticket) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="nft-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>NFT 상세 정보</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-image-wrap">
            <img
              src={ticket.image}
              alt={ticket.title}
              className="modal-image"
            />
          </div>

          <div className="modal-info-grid">
            <div className="modal-info-box">
              <span className="modal-info-label">티켓 번호</span>
              <strong>{ticket.title}</strong>
            </div>

            <div className="modal-info-box">
              <span className="modal-info-label">컨트랙트 주소</span>
              <strong className="address-text">{ticket.contractAddress}</strong>
            </div>

            <div className="modal-info-box">
              <span className="modal-info-label">이벤트</span>
              <strong>{ticket.eventName}</strong>
            </div>

            <div className="modal-info-box">
              <span className="modal-info-label">민팅일</span>
              <strong>{ticket.mintedDate}</strong>
            </div>

            <div className="modal-info-box">
              <span className="modal-info-label">티켓 유효기간</span>
              <strong className="expiry-text">{ticket.expiryDate}</strong>
            </div>

            <div className="modal-info-box">
              <span className="modal-info-label">상태</span>
              <strong>{ticket.status}</strong>
            </div>

            <div className="modal-info-box">
              <span className="modal-info-label">당첨 상품</span>
              <strong>{ticket.reward}</strong>
            </div>

            <div className="modal-info-box">
              <span className="modal-info-label">사용 방법</span>
              <p className="usage-guide">{ticket.usageGuide}</p>
            </div>
          </div>

          <a
            href="https://etherscan.io/"
            target="_blank"
            rel="noreferrer"
            className="modal-link-btn"
          >
            Etherscan에서 보기
          </a>
        </div>
      </div>
    </div>
  );
}