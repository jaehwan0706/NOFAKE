import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 우리가 만든 컴포넌트들
import NikeWebsite from './Nike'           // 1단계: 나이키 홈 페이지 
import NikeRaffle from './NikeRaffle';           // 2단계: 나이키 래플 페이지
import Login from './user/pages/KakaoLogin';  // 3단계: 카카오 로그인
import UserDashboard from './user/UserDashboard'; // 4단계: 사용자 대시보드
import KakaoCallback from './user/pages/KakaoCallback'; // 로그인 처리 콜백
import NoFakeDashboard from './admin/Dashboard';       // 관리자 대시보드 

function App() {

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* [1단계] 메인 나이키 홈 */}
          <Route path="/" element={<NikeWebsite />} />
 
          {/* [2단계] 래플 랜딩 페이지 */}
          <Route path="/raffle" element={<NikeRaffle />} />

          {/* [3단계] 인증: 카카오 로그인 페이지 */}
          <Route path="/login" element={<Login />} />
          
          {/* 카카오 인증 후 돌아오는 주소 (필요 시) */}
          <Route path="/oauth/callback/kakao" element={<KakaoCallback />} />

          {/* [4단계] 목적지: 사용자 대시보드 */}
          <Route path="/dashboard/*" element={<UserDashboard />} />

          {/* 관리자 대시보드 */}
          <Route path="/admin/Dashboard" element={<NoFakeDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;