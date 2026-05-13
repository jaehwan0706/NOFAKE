import { useState } from "react";
import { useNavigate } from "react-router";

export function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"login" | "verify">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleKakaoLogin = () => {
    console.log("카카오 로그인 시도");
    setStep("verify");
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("사용자 정보 확인:", { name, phone });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center px-4 pt-16">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">nofake</h1>
          <p className="text-gray-600">
            {step === "login" ? "카카오로 간편하게 로그인하세요" : "추가 정보를 입력해주세요"}
          </p>
        </div>

        {step === "login" ? (
          <div className="space-y-6">
            <button
              onClick={handleKakaoLogin}
              className="w-full bg-[#FEE500] hover:bg-[#FFEB3B] text-gray-900 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.548 1.67 4.78 4.215 6.094l-1.104 4.014c-.06.223.177.408.377.293l4.518-2.59C10.658 18.438 11.32 18.5 12 18.5c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
              </svg>
              카카오 로그인
            </button>

            <div className="text-center text-sm text-gray-500">
              <p>1인 1계정으로 공정한 래플 참여가 가능합니다</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                형식: 010-1234-5678
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>1인 1계정 정책</strong>
                <br />
                전화번호는 본인 인증에 사용되며, 중복 가입을 방지하여 공정한 래플 참여를 보장합니다.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              확인
            </button>

            <button
              type="button"
              onClick={() => setStep("login")}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
            >
              뒤로 가기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
