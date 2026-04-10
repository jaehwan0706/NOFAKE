import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 이동을 위해 추가
import { Users, Ticket, CheckCircle, Settings } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate(); // ✅ 네비게이트 함수 생성

  // 통계 데이터
  const stats = [
    { title: '총 참여자', count: '12,482', icon: <Users />, color: '#4F46E5' },
    { title: '진행 중인 래플', count: '3', icon: <Ticket />, color: '#10B981' },
    { title: '완료된 추첨', count: '24', icon: <CheckCircle />, color: '#F59E0B' },
  ];

  // 래플 목록 데이터
  const raffleList = [
    { id: 1, name: '나이키 x 트래비스 스캇 조던 1', status: '진행 중', participants: 8432 },
    { id: 2, name: '에어맥스 90 골프', status: '진행 중', participants: 4050 },
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>NOFAKE 관리자 상황판</h1>
        <p>서비스 전체 현황을 실시간으로 모니터링합니다.</p>
      </header>

      {/* 1. 상단 통계 카드 */}
      <div className="stats-grid">
        {stats.map((item, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: item.color }}>{item.icon}</div>
            <div className="stat-info">
              <span>{item.title}</span>
              <h3>{item.count}명</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 2. 래플 관리 목록 */}
      <section className="raffle-list-section">
        <h2>래플 관리 목록</h2>
        <div className="raffle-table">
          <div className="table-header">
            <span>제품명</span>
            <span>상태</span>
            <span>참여인원</span>
            <span>관리</span>
          </div>
          {raffleList.map(raffle => (
            <div key={raffle.id} className="table-row">
              <span className="name">{raffle.name}</span>
              <span className="status active">{raffle.status}</span>
              <span>{raffle.participants.toLocaleString()}명</span>
              
              {/* ✅ 버튼 클릭 시 특정 래플의 상세 관리 페이지(/admin/raffle/1)로 이동 */}
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