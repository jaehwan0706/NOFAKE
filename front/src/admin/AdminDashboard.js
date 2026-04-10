import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Ticket, CheckCircle, Settings } from "lucide-react";
import "./AdminDashboard.css";

const initialParticipantSeries = [11240, 11480, 11620, 11810, 11940, 12110, 12482];

const raffleList = [
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
        <polyline
          fill="url(#participantArea)"
          stroke="none"
          points={`0,${height} ${points} ${width},${height}`}
        />
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [participantSeries, setParticipantSeries] = useState(initialParticipantSeries);

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

  const stats = useMemo(
    () => [
      {
        title: "총 참여자",
        count: participantSeries[participantSeries.length - 1].toLocaleString(),
        icon: <Users />,
        color: "#4F46E5",
      },
      { title: "진행 중인 래플", count: "3", icon: <Ticket />, color: "#10B981" },
      { title: "완료된 추첨", count: "24", icon: <CheckCircle />, color: "#F59E0B" },
    ],
    [participantSeries]
  );

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>NOFAKE 관리자 상황판</h1>
        <p>서비스 전체 현황을 실시간으로 모니터링합니다.</p>
      </header>

      <div className="stats-grid">
        {stats.map((item, idx) => (
          <div key={idx} className={`stat-card${idx === 0 ? " stat-card--participants" : ""}`}>
            <div className="stat-card-top">
              <div className="stat-icon" style={{ backgroundColor: item.color }}>
                {item.icon}
              </div>
              <div className="stat-info">
                <span>{item.title}</span>
                <h3>{item.count}명</h3>
              </div>
            </div>
            {idx === 0 && <ParticipantTrendChart data={participantSeries} />}
          </div>
        ))}
      </div>

      <section className="raffle-list-section">
        <h2>래플 관리 목록</h2>
        <div className="raffle-table">
          <div className="table-header">
            <span>상품명</span>
            <span>상태</span>
            <span>참여인원</span>
            <span>관리</span>
          </div>
          {raffleList.map((raffle) => (
            <div key={raffle.id} className="table-row">
              <span className="name">{raffle.name}</span>
              <span className="status active">{raffle.status}</span>
              <span>{raffle.participants.toLocaleString()}명</span>
              <button className="btn-manage" onClick={() => navigate(`/admin/raffle/${raffle.id}`)}>
                <Settings size={16} /> 관리하기
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
