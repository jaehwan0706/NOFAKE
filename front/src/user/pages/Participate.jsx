import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios"; // 1. axios 임포트 추가
import SimpleToast from "../components/SimpleToast";

export default function Participate({ walletAddress, events = [] }) {
  const { slug } = useParams();
  const [isMinting, setIsMinting] = useState(false);
  const [mintedEvents, setMintedEvents] = useState(() => {
    const saved = localStorage.getItem("mintedEvents");
    return saved ? JSON.parse(saved) : {};
  });
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const event = useMemo(() => {
    return events.find((item) => item.slug === slug);
  }, [events, slug]);

  const isWalletConnected = Boolean(walletAddress);
  const isMinted = event ? Boolean(mintedEvents[event.slug]) : false;

  const showToast = (message, type) => {
    setToast({
      open: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2200);
  };

  // [핵심 함수] 사용자가 아닌 서버가 가스비를 내는 핸들러
  const handleMint = async () => {
    if (!isWalletConnected) {
      showToast("지갑 연결 후 다시 시도해 주세요.", "error");
      return;
    }

    if (!event) return;

    if (isMinted) {
      showToast("이미 민팅이 완료되었습니다.", "error");
      return;
    }

    try {
      setIsMinting(true);

      // 2. 관리자 서버(server.js) API 호출
      // 사용자 지갑(walletAddress)을 인식하여 서버로 넘깁니다.
      const response = await axios.post("http://localhost:3001/api/mint", {
        userAddress: walletAddress, // 인식된 사용자 지갑 주소
        raffleId: 13,               // 시연용 래플 ID (DB나 event 객체에서 가져오도록 수정 가능)
      });

      if (response.data.success) {
        // 3. 민팅 성공 시 로컬 상태 업데이트
        setMintedEvents((prev) => {
          const next = {
            ...prev,
            [event.slug]: true,
          };
          localStorage.setItem("mintedEvents", JSON.stringify(next));
          return next;
        });

        // 티켓 정보 생성 및 저장 (기존 로직 유지)
        const savedMintedTickets = localStorage.getItem("mintedTickets");
        const mintedTickets = savedMintedTickets ? JSON.parse(savedMintedTickets) : [];

        const alreadyExists = mintedTickets.some(
          (ticket) => ticket.eventSlug === event.slug && ticket.source === "minted"
        );

        if (!alreadyExists) {
          const statusText = event.result === "first" ? "1등" : event.result === "second" ? "2등" : "미당첨";
          const rewardText = event.result === "first" ? event.rewardInfo?.first || "1등 보상" : event.result === "second" ? event.rewardInfo?.second || "2등 보상" : "당첨 내역 없음";
          const usageGuideText = event.result === "first" ? "당첨 보상을 확인하고 사용 안내를 확인하세요." : event.result === "second" ? "퍼즐 조각 보상을 확인하세요." : "아쉽지만 이번 이벤트는 미당첨입니다.";

          const newTicket = {
            id: Date.now(),
            eventSlug: event.slug,
            title: `${event.shortTitle} 미스터리 박스`,
            eventName: event.shortTitle,
            image: "",
            contractAddress: event.transparency.contractAddress,
            mintedDate: new Date().toLocaleDateString("ko-KR"),
            expiryDate: "2026-12-31",
            status: statusText,
            reward: rewardText,
            usageGuide: usageGuideText,
            isPrePurchaseReward: event.result === "first",
            source: "minted",
          };

          const nextTickets = [...mintedTickets, newTicket];
          localStorage.setItem("mintedTickets", JSON.stringify(nextTickets));
        }

        showToast("자동 민팅에 성공했습니다! (가스비 무료)", "success");
      }
    } catch (error) {
      console.error("서버 민팅 에러:", error);
      const errorMsg = error.response?.data?.error || "민팅에 실패했습니다. 다시 시도해 주세요.";
      showToast(errorMsg, "error");
    } finally {
      setIsMinting(false);
    }
  };

  if (!event) {
    return (
      <section className="participate-page">
        <div className="page-heading">
          <h2>이벤트를 찾을 수 없습니다</h2>
          <p>존재하지 않거나 삭제된 이벤트입니다.</p>
        </div>
      </section>
    );
  }

  const { title, overviewSubtitle, status, transparency, rewardInfo } = event;

  return (
    <>
      <section className="participate-page">
        <div className="page-heading">
          <h2>{title}</h2>
          <p>{overviewSubtitle}</p>
        </div>

        <div className="participate-mint-top">
          <div className="home-card mint-top-card">
            <h3 className="card-title">미스터리 박스 민팅</h3>
            <div className="mint-card-body">
              <div className="mint-placeholder">BOX</div>
              <p className="mint-card-title">{event.mintTitle}</p>
              <p className="mint-card-desc">{event.mintDescription}</p>

              <div className="mint-cost-box">
                <div>
                  <span>민팅 비용</span>
                  <strong>무료 (이벤트)</strong>
                </div>
                <div>
                  <span>가스비 부담</span>
                  <strong>관리자 대납 ✅</strong>
                </div>
              </div>

              <button
                type="button"
                className={`mint-btn ${isMinted ? "completed" : ""}`}
                onClick={handleMint}
                disabled={!isWalletConnected || isMinting || isMinted}
              >
                {isMinted ? "민팅 완료" : isMinting ? "민팅 처리 중..." : "민팅하기"}
              </button>
            </div>
          </div>
        </div>

        {/* 하단 상세 정보 섹션 (기존과 동일) */}
        <div className="participate-overview-grid">
          <div className="overview-column">
            <div className="home-card">
              <h3 className="card-title">이벤트 상태</h3>
              <div className="info-row">
                <span>참여자 수</span>
                <span>{status.participants} / {status.maxParticipants}</span>
              </div>
              <div className="info-row">
                <span>당첨자 수</span>
                <span>{status.winners}</span>
              </div>
              <div className="divider" />
              <div className="info-row">
                <span>현재 상태</span>
                <span className="status-active">{status.statusText}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill orange" style={{ width: `${status.progress}%` }} />
              </div>
            </div>
          </div>

          <div className="overview-column">
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
              <button type="button" className="full-btn">블록체인에서 확인</button>
            </div>
          </div>
        </div>
      </section>

      <SimpleToast open={toast.open} message={toast.message} type={toast.type} />
    </>
  );
}