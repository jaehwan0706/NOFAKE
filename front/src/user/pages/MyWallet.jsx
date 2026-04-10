import { useEffect, useMemo, useState } from "react";
import mockWallet from "../data/mockWallet";
import NFTDetailModal from "../components/NFTDetailModal";

export default function MyWallet({ revealState = {} }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mintedTickets, setMintedTickets] = useState([]);

  useEffect(() => {
    const savedMintedTickets = localStorage.getItem("mintedTickets");
    const parsedTickets = savedMintedTickets ? JSON.parse(savedMintedTickets) : [];
    setMintedTickets(parsedTickets);
  }, []);

  const allTickets = useMemo(() => {
    return [...mockWallet.tickets, ...mintedTickets];
  }, [mintedTickets]);

  const ticketsWithDisplayStatus = useMemo(() => {
    return allTickets.map((ticket) => {
      const revealKey =
        ticket.eventSlug ||
        ticket.slug ||
        ticket.event?.slug ||
        "";

      const isEventRevealed = revealState[revealKey] ?? false;

      return {
        ...ticket,
        displayStatus: isEventRevealed ? ticket.status : "미공개",
        displayReward: isEventRevealed ? ticket.reward : "미공개",
        displayUsageGuide: isEventRevealed
          ? ticket.usageGuide
          : "리빌 이후 결과를 확인할 수 있습니다.",
      };
    });
  }, [allTickets, revealState]);

  const handleOpenDetail = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <>
      <section className="wallet-page">
        <div className="page-heading">
          <h2>내 지갑</h2>
          <p>보유 중인 NFT 티켓과 퍼즐 조각을 확인하세요.</p>
        </div>

        <div className="wallet-summary-grid">
          <div className="home-card wallet-summary-card">
            <span className="summary-label">NFT 티켓</span>
            <strong className="summary-value">
              {ticketsWithDisplayStatus.length}
            </strong>
          </div>

          <div className="home-card wallet-summary-card">
            <span className="summary-label">퍼즐 조각</span>
            <strong className="summary-value">{mockWallet.puzzles.length}</strong>
          </div>
        </div>

        <div className="home-card">
          <h3 className="card-title">NFT 티켓</h3>

          {ticketsWithDisplayStatus.length === 0 ? (
            <p className="helper-text">보유 중인 NFT 티켓이 없습니다.</p>
          ) : (
            <div className="wallet-ticket-grid">
              {ticketsWithDisplayStatus.map((ticket) => (
                <div key={ticket.id} className="wallet-ticket-card">
                  <div className="wallet-ticket-image">
                    {ticket.image ? (
                      <img src={ticket.image} alt={ticket.title} />
                    ) : (
                      <div className="wallet-ticket-image-placeholder">NFT</div>
                    )}
                  </div>

                  <div className="wallet-ticket-body">
                    <strong className="wallet-ticket-title">{ticket.title}</strong>
                    <p className="wallet-ticket-event">{ticket.eventName}</p>
                    <span className="ticket-status-badge">
                      {ticket.displayStatus}
                    </span>

                    <button
                      type="button"
                      className="outline-btn wallet-detail-btn"
                      onClick={() => handleOpenDetail(ticket)}
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="home-card">
          <h3 className="card-title">퍼즐 조각</h3>

          {mockWallet.puzzles.length === 0 ? (
            <p className="helper-text">보유 중인 퍼즐 조각이 없습니다.</p>
          ) : (
            <div className="wallet-puzzle-list">
              {mockWallet.puzzles.map((puzzle) => (
                <div key={puzzle.id} className="info-row">
                  <span>{puzzle.type}</span>
                  <strong>ID: {puzzle.id}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <NFTDetailModal
        isOpen={isModalOpen}
        ticket={
          selectedTicket
            ? {
                ...selectedTicket,
                status: selectedTicket.displayStatus,
                reward: selectedTicket.displayReward,
                usageGuide: selectedTicket.displayUsageGuide,
              }
            : null
        }
        onClose={handleCloseDetail}
      />
    </>
  );
}