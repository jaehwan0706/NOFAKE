import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

const REDIRECT_URI =
  import.meta.env.VITE_KAKAO_REDIRECT_URI ?? `${window.location.origin}/auth/kakao/callback`;
const LOGIN_TOKEN_KEY = "nofakeAccessToken";

type KakaoLoginResponse = {
  success?: boolean;
  accessToken?: string;
  token?: string;
  message?: string;
  error?: string;
};

export function KakaoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasHandled = useRef(false);
  const [status, setStatus] = useState("카카오 로그인을 처리하고 있습니다...");

  useEffect(() => {
    const handleCallback = async () => {
      if (hasHandled.current) return;
      hasHandled.current = true;

      const code = searchParams.get("code");
      const kakaoError = searchParams.get("error");

      if (kakaoError || !code) {
        setStatus("카카오 로그인이 취소되었거나 인증 코드가 없습니다.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch("/api/auth/kakao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code, redirectUri: REDIRECT_URI }),
        });

        const data = (await response.json().catch(() => ({}))) as KakaoLoginResponse;

        if (!response.ok || data.success === false) {
          throw new Error(data.message || data.error || "카카오 로그인에 실패했습니다.");
        }

        const token = data.accessToken ?? data.token;
        if (token) {
          localStorage.setItem(LOGIN_TOKEN_KEY, token);
        }

        setStatus("로그인되었습니다. 메인 화면으로 이동합니다...");
        navigate("/", { replace: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : "카카오 로그인 처리 중 오류가 발생했습니다.";
        console.error("Kakao login callback failed:", error);
        setStatus(message);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="text-3xl font-black text-gray-900">NOFAKE</div>
      <div className="mt-8 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-yellow-400" />
      <p className="mt-6 text-sm font-semibold text-gray-600">{status}</p>
      <button
        type="button"
        onClick={() => navigate("/login", { replace: true })}
        className="mt-6 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        로그인 화면으로 돌아가기
      </button>
    </main>
  );
}

export default KakaoCallback;
