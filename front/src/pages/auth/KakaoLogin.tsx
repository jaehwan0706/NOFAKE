import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

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
        fill="#191600"
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
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="flex items-center justify-between px-8 h-16 border-b border-gray-100">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-base font-bold text-gray-900 hover:opacity-60 transition-opacity"
        >
          nofake
        </button>
        <Link to="/support" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          고객지원
        </Link>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">nofake에 오신 걸 환영합니다</h1>
            <p className="text-base text-gray-500">
              카카오 계정 하나로 공정한 래플에 참여하세요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#F0D900] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 font-bold text-base h-14 rounded-2xl transition-all shadow-sm"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                카카오로 이동 중...
              </>
            ) : (
              <>
                <KakaoIcon />
                카카오로 계속하기
              </>
            )}
          </button>

          {errorMessage && <p className="mt-3 text-sm text-red-500 text-center">{errorMessage}</p>}

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { title: "1인 1계정", desc: "중복 참여를 줄입니다" },
              { title: "정품 보증", desc: "검증된 상품만 취급합니다" },
              { title: "투명 공개", desc: "래플 결과를 확인합니다" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-2 p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-gray-400 text-center leading-relaxed">
            계속 진행하면 nofake의{" "}
            <Link to="/terms" className="text-gray-500 underline underline-offset-2 hover:text-gray-800 transition-colors">
              이용약관
            </Link>{" "}
            및{" "}
            <Link to="/privacy" className="text-gray-500 underline underline-offset-2 hover:text-gray-800 transition-colors">
              개인정보처리방침
            </Link>
            에 동의한 것으로 간주됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
