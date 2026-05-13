import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import "./KakaoLogin.css";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const REDIRECT_URI =
  import.meta.env.VITE_KAKAO_REDIRECT_URI ?? `${window.location.origin}/auth/kakao/callback`;

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2C5.582 2 2 4.91 2 8.5c0 2.27 1.387 4.262 3.488 5.42l-.888 3.305a.25.25 0 0 0 .376.271L8.94 15.2A9.87 9.87 0 0 0 10 15.27c4.418 0 8-2.91 8-6.5S14.418 2 10 2Z"
        fill="#3A1D1D"
      />
    </svg>
  );
}

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const kakaoAuthUrl = useMemo(() => {
    if (!KAKAO_REST_API_KEY) return "";

    const params = new URLSearchParams({
      response_type: "code",
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: REDIRECT_URI,
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }, []);

  const handleKakaoLogin = () => {
    if (!kakaoAuthUrl) {
      setErrorMessage("카카오 REST API 키가 설정되지 않았습니다.");
      return;
    }

    setIsLoading(true);
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="login-page">
      <nav className="login-nav">
        <button className="nav-logo" type="button" onClick={() => navigate("/")}>
          NOFAKE
        </button>
      </nav>

      <main className="login-container">
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-header">
            <div className="nike-swoosh">NOFAKE</div>
            <h1 id="login-title">로그인</h1>
            <p>
              래플 참여를 위해 카카오 계정으로 간편하게 로그인하세요.
              <br />
              별도의 회원가입 없이 안전하게 시작할 수 있습니다.
            </p>
          </div>

          <button className="kakao-btn" type="button" onClick={handleKakaoLogin} disabled={isLoading}>
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner" />
                카카오로 이동 중...
              </span>
            ) : (
              <span className="btn-inner">
                <KakaoIcon />
                카카오로 로그인
              </span>
            )}
          </button>

          {errorMessage && <p className="login-error">{errorMessage}</p>}

          <div className="login-notice">
            <p>카카오 계정 인증 후 NOFAKE 서비스를 이용할 수 있습니다.</p>
            <p>로그인 정보는 서비스 인증 목적으로만 사용됩니다.</p>
          </div>

          <div className="divider">
            <span>VERIFIED RAFFLE</span>
          </div>

          <p className="login-terms">
            로그인하면 NOFAKE의 <span>이용약관</span> 및 <span>개인정보처리방침</span>에 동의한 것으로 간주됩니다.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Login;
