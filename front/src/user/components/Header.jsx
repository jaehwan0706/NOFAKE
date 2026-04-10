import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo-link">
          <h1 className="logo">NoFAKE</h1>
        </Link>
        <p className="subtitle">공정하고 투명한 이벤트에 참여하세요</p>
      </div>

      <div className="header-actions">
        <Link to="/participate" className="primary-btn">
          참여하기
        </Link>
        <button className="wallet-btn">지갑 연결됨</button>
      </div>
    </header>
  );
}