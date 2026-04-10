import { useState } from "react";
import mockWallet from "../data/mockWallet";
import NFTDetailModal from "../components/NFTDetailModal";

export default function MyWallet() {
  const { summary, tickets, puzzles, prePurchase } = mockWallet;

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
  };

  return (
    <section className="wallet-page">
      <div className="page-heading">
        <h2>내 지갑</h2>
        <p>보유 중인 NFT 티켓, 퍼즐, 선구매권을 관리하세요</p>
      </div>

      <div className="wallet-summary-grid">
        <div className="wallet-summary-card orange-card">
          <span className="summary-label">NFT 티켓</span>
          <strong>{summary.ticketCount}</strong>
        </div>

        <div className="wallet-summary-card purple-card">
          <span className="summary-label">퍼즐 조각</span>
          <strong>{summary.puzzleCount}</strong>
        </div>

        <div className="wallet-summary-card blue-card">
          <span className="summary-label">선구매권</span>
          <strong>{summary.prePurchaseCount}</strong>
        </div>
      </div>

      <div className="wallet-main-card">
        <h3 className="card-title">NFT 티켓</h3>

        <div className="wallet-ticket-grid">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="wallet-ticket-card">
              <div className="ticket-top-row">
                <div>
                  <strong>{ticket.title}</strong>
                  <p>{ticket.eventName}</p>
                </div>

                <span
                  className={
                    ticket.status === "당첨"
                      ? "status-badge green"
                      : "status-badge gray"
                  }
                >
                  {ticket.status}
                </span>
              </div>

              <div className="wallet-ticket-info">
                <div className="info-row">
                  <span>민팅일</span>
                  <span>{ticket.mintedDate}</span>
                </div>

                <div className="info-row">
                  <span>당첨 상품</span>
                  <span>{ticket.reward}</span>
                </div>
              </div>

              <button
                className="full-btn wallet-detail-btn"
                onClick={() => handleOpenModal(ticket)}
              >
                상세보기
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="wallet-bottom-grid">
        <div className="home-card">
          <h3 className="card-title">퍼즐 조각 NFT</h3>

          <div className="wallet-puzzle-list">
            {puzzles.map((puzzle) => (
              <div key={puzzle.id} className="wallet-puzzle-item">
                <div>
                  <strong>
                    {puzzle.type} #{puzzle.id}
                  </strong>
                  <p>{puzzle.rarity}</p>
                </div>
                <button className="icon-btn">↗</button>
              </div>
            ))}
          </div>
        </div>

        <div className="home-card">
          <h3 className="card-title">선구매권</h3>

          <div className="prepurchase-detail-box">
            <strong>{prePurchase.title}</strong>

            <div className="wallet-ticket-info">
              <div className="info-row">
                <span>상태</span>
                <span className="status-badge green">
                  {prePurchase.usable ? "사용 가능" : "사용 불가"}
                </span>
              </div>

              <div className="info-row">
                <span>유효기간</span>
                <span>{prePurchase.expiryDate}</span>
              </div>
            </div>

            <button className="prepurchase-use-btn">
              {prePurchase.buttonText}
            </button>
          </div>
        </div>
      </div>

      <NFTDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ticket={selectedTicket}
      />
    </section>
  );
}