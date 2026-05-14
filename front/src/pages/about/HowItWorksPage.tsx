export function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      title: "카카오로 로그인",
      desc: "별도 회원가입 없이 카카오 계정으로 바로 시작할 수 있습니다. 1인 1계정 인증으로 공정한 참여를 보장합니다.",
      icon: "💬",
    },
    {
      step: "02",
      title: "래플 이벤트 탐색",
      desc: "진행 중인 래플 이벤트를 확인하세요. 브랜드, 제품, 래플 마감일을 한눈에 볼 수 있습니다.",
      icon: "🔍",
    },
    {
      step: "03",
      title: "래플 신청",
      desc: "원하는 래플에 참여 신청합니다. 사이즈와 배송지를 입력하면 신청이 완료됩니다.",
      icon: "✅",
    },
    {
      step: "04",
      title: "당첨 발표",
      desc: "래플 마감 후 공정한 알고리즘으로 당첨자를 선정합니다. 당첨 결과는 실시간으로 공개됩니다.",
      icon: "🎯",
    },
    {
      step: "05",
      title: "결제 및 배송",
      desc: "당첨되면 안내 메시지를 받고 결제를 진행합니다. 정품 검수 후 안전하게 배송됩니다.",
      icon: "📦",
    },
  ];

  const faqs = [
    {
      q: "래플에 몇 번이나 참여할 수 있나요?",
      a: "1인 1계정 정책으로 동일 래플에는 1번만 참여 가능합니다. 공정한 당첨 확률을 보장하기 위한 정책입니다.",
    },
    {
      q: "당첨 알고리즘은 어떻게 되나요?",
      a: "완전 무작위 방식으로 당첨자를 선정하며, 결과는 실시간으로 공개됩니다. 어떠한 조작도 없습니다.",
    },
    {
      q: "낙첨되면 어떻게 되나요?",
      a: "낙첨 시 별도의 비용이 발생하지 않습니다. 다음 래플에 다시 도전하세요!",
    },
    {
      q: "정품 보증은 어떻게 하나요?",
      a: "nofake에 입점한 모든 브랜드는 정품 인증을 거칩니다. 배송 전 전문가 검수를 진행합니다.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* 헤더 */}
      <section className="bg-gray-950 text-white px-6 py-20 text-center">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          How It Works
        </p>
        <h1 className="text-4xl font-bold mb-4">래플 참여 방법</h1>
        <p className="text-gray-400 text-base max-w-md mx-auto">
          nofake 래플은 누구나 쉽고 공정하게 참여할 수 있습니다.
          5단계로 완성되는 간단한 과정을 확인해보세요.
        </p>
      </section>

      {/* 스텝 */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="relative">
          {/* 연결선 */}
          <div className="absolute left-8 top-10 bottom-10 w-px bg-gray-100 hidden md:block" />

          <div className="space-y-8">
            {steps.map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                {/* 아이콘 */}
                <div className="shrink-0 w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center text-2xl z-10">
                  {item.icon}
                </div>
                {/* 내용 */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400 tracking-widest">STEP {item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">자주 묻는 질문</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl p-6 border border-gray-100">
                <p className="text-sm font-semibold text-gray-900 mb-2">Q. {faq.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">지금 바로 시작해보세요</h2>
        <p className="text-sm text-gray-500 mb-6">카카오 계정만 있으면 바로 참여할 수 있습니다.</p>
        <a
          href="/login"
          className="inline-block bg-[#FEE500] text-gray-900 font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-[#F0D900] transition-colors"
        >
          카카오로 시작하기
        </a>
      </section>
    </main>
  );
}