import { useState } from "react";
import { useNavigate } from "react-router-dom";

function generateMockWalletAddress() {
  const chars = "abcdef0123456789";
  let address = "0x";
  for (let i = 0; i < 40; i += 1) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);

  const handleKakaoLogin = async () => {
    try {
      setIsKakaoLoading(true);

      // TODO:
      // 1) Web3Auth + Kakao 로그인 연결
      // 2) 로그인 성공 후 지갑 주소 생성/복구
      // 3) onLoginSuccess(walletAddress)
      // 4) /home 이동

      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("카카오 로그인 연동 준비 중입니다.");
    } catch (error) {
      console.error(error);
      alert("카카오 로그인에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsKakaoLoading(false);
    }
  };

  const handleTestLogin = async () => {
    try {
      setIsTestLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const walletAddress = generateMockWalletAddress();

      onLoginSuccess(walletAddress);
      navigate("/home", { replace: true });
    } catch (error) {
      console.error(error);
      alert("임시 로그인에 실패했습니다.");
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-card">
        <h1>NoFAKE</h1>
        <p>공정하고 투명한 이벤트 참여를 위해 로그인하세요</p>

        <div className="login-button-group">
          <button
            type="button"
            className="login-btn kakao-login-btn"
            onClick={handleKakaoLogin}
            disabled={isKakaoLoading || isTestLoading}
          >
            {isKakaoLoading ? "카카오 로그인 처리 중..." : "카카오로 로그인"}
          </button>

          <button
            type="button"
            className="login-btn test-login-btn"
            onClick={handleTestLogin}
            disabled={isKakaoLoading || isTestLoading}
          >
            {isTestLoading ? "임시 로그인 처리 중..." : "임시 로그인"}
          </button>
        </div>

        <p className="login-helper-text">
          임시 로그인은 내부 테스트용입니다.
        </p>
      </div>
    </section>
  );
}