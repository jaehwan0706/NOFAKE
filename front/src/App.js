import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 우리가 만든 컴포넌트들
import NikeMain from './user/nike';           // 사용자 메인 (나이키 페이지)
import UserDashboard from './user/pages/Home'; // 사용자 대시보드 (내 지갑/NFT)
import AdminDashboard from './admin/Dashboard'; // 관리자 대시보드
import Login from './user/pages/KakaoLogin'; // 로그인 페이지
import KakaoCallback from './user/pages/KakaoCallback'; // 카카오 로그인 콜백 페이지 (추후 구현 예정)

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* --- 사용자(User Side) 경로 --- */}
          <Route path="/" element={<NikeMain />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          
          {/* --- 관리자(Admin Side) 경로 --- */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 로그인 페이지 */}
          <Route path="/login" element={<Login />} />

          {/* 카카오 로그인 콜백 페이지 */}
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;