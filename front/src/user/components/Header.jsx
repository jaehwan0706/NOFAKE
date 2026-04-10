import { Link } from "react-router-dom";

function formatWalletAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Header({ walletAddress, onLogout }) {
  const isConnected = Boolean(walletAddress);

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/home" className="logo-link">
          <h1 className="logo">NoFAKE</h1>
        </Link>
        <p className="subtitle">공정하고 투명한 이벤트에 참여하세요</p>
      </div>

      <div className="header-actions">
        {isConnected && (
          <div className="wallet-status connected">
            <span className="wallet-status-label">지갑 연결됨</span>
            <strong className="wallet-status-address">
              {formatWalletAddress(walletAddress)}
            </strong>
          </div>
        )}

        {isConnected && (
          <button type="button" className="header-logout-btn" onClick={onLogout}>
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
}
