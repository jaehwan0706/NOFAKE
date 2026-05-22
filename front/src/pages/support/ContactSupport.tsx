import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, CheckCircle2 } from "lucide-react";

export function ContactSupport() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    category: "일반 문의",
    title: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 API 연동 로직이 들어갈 자리입니다.
    console.log("문의 내용:", formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-20 h-20 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">접수 완료!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            문의하신 내용이 성공적으로 접수되었습니다.<br />
            영업일 기준 24시간 이내에 답변해 드릴게요.
          </p>
          <button
            onClick={() => navigate("/support")}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all"
          >
            고객센터 메인으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          뒤로 가기
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-slate-900 p-10 text-white">
            <h1 className="text-3xl font-bold mb-2">1:1 문의하기</h1>
            <p className="text-slate-400">도움이 필요하신 내용을 상세히 적어주세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">문의 유형</label>
              <select
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800 appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option>일반 문의</option>
                <option>래플 및 이벤트</option>
                <option>계정 및 본인인증</option>
                <option>결제 및 환불</option>
                <option>기타</option>
              </select>
            </div>

            {/* 이메일 주소 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">답변받을 이메일</label>
              <input
                type="email"
                required
                placeholder="example@email.com"
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">제목</label>
              <input
                type="text"
                required
                placeholder="제목을 입력해 주세요"
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">문의 내용</label>
              <textarea
                required
                rows={6}
                placeholder="문의하실 내용을 상세히 입력해 주세요."
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>

            {/* 파일 첨부 (UI만 구현) */}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">파일 첨부하기 (선택 사항)</p>
                </div>
                <input type="file" className="hidden" />
              </label>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              문의 보내기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}