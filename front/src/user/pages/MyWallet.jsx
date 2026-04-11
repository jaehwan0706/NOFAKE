import { useEffect, useMemo, useState } from "react";
import mockWallet from "../data/mockWallet";
import NFTDetailModal from "../components/NFTDetailModal";
import { derivePuzzlePieces } from "../utils/derivePuzzlePieces";

export default function MyWallet({ revealState = {} }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mintedTickets, setMintedTickets] = useState([]);

  useEffect(() => {
    const loadMintedTickets = () => {
      const savedMintedTickets = localStorage.getItem("mintedTickets");
      const parsedTickets = savedMintedTickets ? JSON.parse(savedMintedTickets) : [];
      setMintedTickets(parsedTickets);
    };

    loadMintedTickets();
    window.addEventListener("minted-events-updated", loadMintedTickets);

    return () => {
      window.removeEventListener("minted-events-updated", loadMintedTickets);
    };
  }, []);

  const allTickets = useMemo(() => [...mockWallet.tickets, ...mintedTickets], [mintedTickets]);

  const ticketsWithDisplayStatus = useMemo(() => {
    return allTickets.map((ticket) => {
      const revealKey = ticket.eventSlug || ticket.slug || ticket.event?.slug || "";
      const revealMeta = revealState[revealKey] || {};
      const isEventRevealed = revealMeta.isRevealed ?? false;
      const resolvedResult = revealMeta.result;

      const displayStatus = isEventRevealed
        ? resolvedResult === "second"
          ? "2등"
          : resolvedResult === "first"
          ? "당첨"
          : ticket.status
        : "미공개";

      const displayReward = isEventRevealed
        ? resolvedResult === "second"
          ? "2등 퍼즐 조각"
          : ticket.reward
        : "미공개";

      return {
        ...ticket,
        displayStatus,
        displayReward,
        displayUsageGuide: isEventRevealed
          ? resolvedResult === "second"
            ? "2등 당첨으로 퍼즐 조각 1개가 지급되었습니다."
            : ticket.usageGuide
          : "리빌 후 결과를 확인할 수 있습니다.",
      };
    });
  }, [allTickets, revealState]);

  const puzzlePieces = useMemo(() => derivePuzzlePieces(mintedTickets, revealState), [mintedTickets, revealState]);

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
          <p>보유 중인 NFT 티켓과 퍼즐 조각을 확인할 수 있습니다.</p>
        </div>

        <div className="wallet-summary-grid">
          <div className="home-card wallet-summary-card">
            <span className="summary-label">NFT 티켓</span>
            <strong className="summary-value">{ticketsWithDisplayStatus.length}</strong>
          </div>

          <div className="home-card wallet-summary-card">
            <span className="summary-label">퍼즐 조각</span>
            <strong className="summary-value">{puzzlePieces.length}</strong>
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
                    <span className="ticket-status-badge">{ticket.displayStatus}</span>

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

          {puzzlePieces.length === 0 ? (
            <p className="helper-text">2등 당첨 시 퍼즐 조각이 지급됩니다.</p>
          ) : (
            <div className="wallet-puzzle-list">
              {puzzlePieces.map((puzzle) => (
                <div key={puzzle.id} className="info-row">
                  <span>{puzzle.type}</span>
                  <strong>{puzzle.title}</strong>
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
