import { useState } from "react";

export function PartnerPage() {
  const [form, setForm] = useState({
    brand: "",
    name: "",
    email: "",
    phone: "",
    category: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: 실제 API 연동
    setSubmitted(true);
  };

  const benefits = [
    { icon: "👥", title: "대규모 고객 접근", desc: "nofake의 검증된 래플 고객층에 브랜드를 노출하세요." },
    { icon: "🚀", title: "빠른 캠페인 런칭", desc: "입점 후 최소 3일 내 래플 캠페인을 시작할 수 있습니다." },
    { icon: "🎯", title: "타겟 마케팅", desc: "스니커즈·패션에 관심 높은 핵심 고객층을 정확히 공략합니다." },
    { icon: "🤝", title: "전담 매니저 지원", desc: "입점부터 래플 운영까지 전담 매니저가 함께합니다." },
  ];

  if (submitted) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-6">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">문의가 접수되었습니다</h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
          담당 매니저가 영업일 기준 1~2일 내에 입력하신 이메일로 연락드리겠습니다.
        </p>
        <a href="/" className="mt-8 text-sm text-gray-400 underline hover:text-gray-700">
          홈으로 돌아가기
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 헤더 */}
      <section className="bg-gray-950 text-white px-6 py-20 text-center">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          Brand Partnership
        </p>
        <h1 className="text-4xl font-bold mb-4">브랜드 입점 문의</h1>
        <p className="text-gray-400 text-base max-w-md mx-auto">
          nofake와 함께 공정한 래플로 브랜드 가치를 높이세요.
          검증된 고객층과 만날 수 있는 최적의 채널입니다.
        </p>
      </section>

      {/* 혜택 */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">파트너 혜택</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {benefits.map((b) => (
            <div key={b.title} className="bg-gray-50 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-3">{b.icon}</div>
              <p className="text-sm font-bold text-gray-900 mb-1">{b.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* 문의 폼 */}
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">입점 문의하기</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">브랜드명 *</label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="브랜드 이름"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">담당자명 *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">이메일 *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contact@brand.com"
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">연락처</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="010-0000-0000"
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">브랜드 카테고리</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors bg-white"
              >
                <option value="">카테고리 선택</option>
                <option value="sports">스포츠</option>
                <option value="street">스트릿</option>
                <option value="luxury">하이엔드/럭셔리</option>
                <option value="collab">콜라보레이션</option>
                <option value="etc">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">문의 내용</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="브랜드 소개 및 래플 진행 희망 제품 등을 자유롭게 작성해주세요."
                rows={4}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!form.brand || !form.name || !form.email}
              className="w-full bg-gray-900 text-white font-semibold text-sm h-12 rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              문의 보내기
            </button>

            <p className="text-xs text-gray-400 text-center">
              영업일 기준 1~2일 내 이메일로 답변드립니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}