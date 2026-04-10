import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Settings, Ticket, Users } from "lucide-react";
import "./AdminDashboard.css";

const RAFFLE_STORAGE_KEY = "nofake_admin_raffles";
const initialParticipantSeries = [11240, 11480, 11620, 11810, 11940, 12110, 12482];
const defaultRaffles = [
  { id: 1, name: "나이키 x 트래비스 스캇 조던 1", status: "진행 중", participants: 8432 },
  { id: 2, name: "에어맥스 90 골프", status: "진행 중", participants: 4050 },
];

const ParticipantTrendChart = ({ data }) => {
  const width = 100;
  const height = 44;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 1);

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="participant-chart-wrap">
      <div className="participant-chart-meta">
        <span>최근 유입 추이</span>
        <strong>실시간</strong>
      </div>
      <svg className="participant-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="participantLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c73ff" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="participantArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(79, 70, 229, 0.45)" />
            <stop offset="100%" stopColor="rgba(79, 70, 229, 0.02)" />
          </linearGradient>
        </defs>
        <polyline fill="url(#participantArea)" stroke="none" points={`0,${height} ${points} ${width},${height}`} />
        <polyline
          fill="none"
          stroke="url(#participantLine)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
      <div className="participant-chart-labels">
        <span>6분 전</span>
        <span>지금</span>
      </div>
    </div>
  );
};

const loadStoredRaffles = () => {
  try {
    const raw = window.localStorage.getItem(RAFFLE_STORAGE_KEY);
    if (!raw) return defaultRaffles;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultRaffles;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load raffles:", error);
    return defaultRaffles;
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [participantSeries, setParticipantSeries] = useState(initialParticipantSeries);
  const [raffles, setRaffles] = useState(loadStoredRaffles);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [raffleName, setRaffleName] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setParticipantSeries((prev) => {
        const lastValue = prev[prev.length - 1];
        const delta = Math.floor(Math.random() * 90) - 10;
        const nextValue = Math.max(lastValue + delta, 10000);
        return [...prev.slice(1), nextValue];
      });
    }, 3000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(RAFFLE_STORAGE_KEY, JSON.stringify(raffles));
  }, [raffles]);

  const activeRaffleCount = useMemo(
    () => raffles.filter((raffle) => raffle.status !== "종료").length,
    [raffles]
  );

  const totalParticipants = participantSeries[participantSeries.length - 1].toLocaleString();

  const handleAddRaffle = () => {
    const trimmedName = raffleName.trim();

    if (!trimmedName) {
      return;
    }

    const nextRaffle = {
      id: Date.now(),
      name: trimmedName,
      status: "설정 전",
      participants: 0,
      createdAt: new Date().toISOString(),
    };

    setRaffles((prev) => [nextRaffle, ...prev]);
    setRaffleName("");
    setIsAddOpen(false);
  };

  return (
    <div className="admin-container">
      <div className="admin-shell">
        <header className="admin-header">
          <h1>NOFAKE 관리자 대시보드</h1>
          <p>서비스 전체 현황을 실시간으로 모니터링합니다.</p>
        </header>

        <div className="dashboard-stack">
          <section className="stat-card stat-card--participants">
            <div className="stat-card-top">
              <div className="stat-icon" style={{ backgroundColor: "#4F46E5" }}>
                <Users />
              </div>
              <div className="stat-info">
                <span>총 참여자</span>
                <h3>{totalParticipants}명</h3>
              </div>
            </div>
            <ParticipantTrendChart data={participantSeries} />
          </section>

          <section className="stat-card stat-card--raffles">
            <div className="stat-card-top stat-card-top--between">
              <div className="stat-card-top">
                <div className="stat-icon" style={{ backgroundColor: "#10B981" }}>
                  <Ticket />
                </div>
                <div className="stat-info">
                  <span>진행 중인 래플</span>
                  <h3>{activeRaffleCount}개</h3>
                </div>
              </div>

              <button className="add-raffle-btn" onClick={() => setIsAddOpen((prev) => !prev)}>
                <Plus size={16} />
                래플 추가
              </button>
            </div>

            {isAddOpen && (
              <div className="add-raffle-panel">
                <label className="add-raffle-label" htmlFor="raffleName">
                  새 래플 이름
                </label>
                <div className="add-raffle-row">
                  <input
                    id="raffleName"
                    className="add-raffle-input"
                    type="text"
                    placeholder="예: 덩크 로우 레트로"
                    value={raffleName}
                    onChange={(event) => setRaffleName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleAddRaffle();
                      }
                    }}
                  />
                  <button className="add-raffle-submit" onClick={handleAddRaffle}>
                    저장
                  </button>
                </div>
                <p className="add-raffle-help">추가한 래플은 이 브라우저에 저장되고, 관리 버튼으로 상세 설정 화면으로 이동할 수 있습니다.</p>
              </div>
            )}

            <div className="mini-raffle-list">
              {raffles.map((raffle) => (
                <div key={raffle.id} className="mini-raffle-item">
                  <div className="mini-raffle-copy">
                    <div className="mini-raffle-title-row">
                      <strong>{raffle.name}</strong>
                      <span className={`mini-raffle-status mini-raffle-status--${raffle.status === "진행 중" ? "live" : raffle.status === "종료" ? "done" : "draft"}`}>
                        {raffle.status}
                      </span>
                    </div>
                    <span>{raffle.participants.toLocaleString()}명 참여</span>
                  </div>
                  <button className="mini-manage-btn" onClick={() => navigate(`/admin/raffle/${raffle.id}`)}>
                    <Settings size={14} />
                    관리
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
