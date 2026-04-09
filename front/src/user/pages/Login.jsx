import { useNavigate } from "react-router-dom";
import KakaoLoginButton from "../components/KakaoLoginButton";
import { loginWithKakao } from "../services/kakaoAuth";

export default function Login() {
  const navigate = useNavigate();

  const handleKakaoLogin = () => {
    loginWithKakao();
  };

  // 임시로그인 전체 연동시 제거(1)
  const handleTempLogin = () => {
    navigate("/");
  };
  // 여기까지 (1) 끝났다고 표시

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>NoFAKE</h1>
        <p>공정하고 투명한 이벤트에 참여하세요</p>

        <div className="login-actions">
          <KakaoLoginButton onClick={handleKakaoLogin} />

          {/* 임시로그인 전체 연동시 제거 (1) */}
          <button className="temp-login-btn" onClick={handleTempLogin}>
            임시 로그인
          </button>
          {/* 여기까지 (1) 끝났다고 표시 */}
        </div>
      </div>
    </div>
  );
}