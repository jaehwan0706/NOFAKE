export default function KakaoLoginButton({ onClick }) {
  return (
    <button type="button" className="social-login-btn kakao-login-btn" onClick={onClick}>
      카카오 로그인
    </button>
  );
}