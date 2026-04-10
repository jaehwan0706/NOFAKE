import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, Ticket, ShieldCheck, Timer, Users, Zap, Award } from 'lucide-react';
import './NikeRaffle.css';
import { useNavigate } from 'react-router-dom';

// [수정] props로 walletAddress를 받습니다.
const NikeRaffle = ({ walletAddress }) => {
  const [wishlist, setWishlist] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 39 });
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const products = [
    { id: 1, name: '나이키 에어맥스 90', category: '라이프스타일', price: 179000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600' },
    { id: 2, name: '나이키 줌 베이퍼플라이', category: '러닝', price: 299000, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600' },
    { id: 3, name: '나이키 리액트 인피니티', category: '러닝', price: 199000, image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=80&w=600' },
    { id: 4, name: '나이키 조던 1 레트로', category: '농구', price: 219000, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // [핵심] 민팅 버튼 클릭 처리
  const handleRaffleButtonClick = async (raffleId) => {
    // 1. 로그인 여부 확인
    if (!walletAddress) {
      console.log("미로그인 상태 - 로그인 페이지로 이동합니다.");
      navigate('/login');
      return;
    }

    // 2. 로그인 상태면 백엔드에 민팅 요청
    try {
      console.log(`[Minting] 사용자: ${walletAddress}, 상품 ID: ${raffleId}`);
      
      const response = await fetch('http://localhost:3001/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: walletAddress,
          raffleId: raffleId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert("🎉 래플 응모 성공! 내 지갑으로 티켓(NFT)이 전송되었습니다.");
        navigate('/dashboard'); // 성공 후 대시보드로 이동
      } else {
        alert(`응모 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("서버 연결 실패:", error);
      alert("백엔드 서버가 닫혀있습니다.");
    }
  };

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="nike-page">
      {/* NAV 생략 (기존과 동일) */}
      <nav className={`nike-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="nav-logo">NIKE</div>
          <div className="nav-menu">
            {['남성', '여성', '키즈', '래플', '컬렉션', 'SALE'].map(link => (
              <span key={link} className={link === '래플' ? 'active' : ''}>{link}</span>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="raffle-hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <ShieldCheck size={13} />
            <span>ON-CHAIN VERIFIED · 공정 추첨 보장</span>
          </div>
          <h1 className="hero-title">한정판 스니커즈를<br /><em>만나는 가장</em><br />공정한 방법</h1>
          <div className="hero-actions">
            {/* [수정] 메인 히어로 버튼에도 로직 적용 */}
            <button className="btn-primary" onClick={() => handleRaffleButtonClick(1)}>
              지금 참여하기 →
            </button>
          </div>
        </div>
      </section>

      {/* MAIN RAFFLE SECTION */}
      <main className="raffle-main">
        <div className="raffle-column">
          <div className="main-raffle-card">
            <div className="card-text">
              <span className="drop-tag">LIMITED DROP</span>
              <h2>나이키 x 트래비스 스캇<br />에어 조던 1 로우</h2>
              {/* [수정] 참여 버튼 로직 적용 */}
              <button className="btn-raffle" onClick={() => handleRaffleButtonClick(1)}>
                {walletAddress ? "민팅하기 (On-Chain)" : "참여하기 (로그인 필요)"}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* 나머지 푸터 등은 기존 코드 유지 */}
    </div>
  );
};

export default NikeRaffle;