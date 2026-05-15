export function ManagerSupportPage() {
  const services = [
    {
      icon: "👤",
      title: "1:1 전담 어카운트 매니저",
      desc: "캠페인 설정, 운영, 이슈 처리까지 하나의 창구로 명확하게 지원합니다. 담당자가 바뀌지 않아 일관된 소통이 가능합니다.",
    },
    {
      icon: "📊",
      title: "실시간 캠페인 모니터링",
      desc: "래플 진행 중 트래픽, 응모 현황, 비정상 활동을 실시간으로 확인할 수 있습니다. 이상 징후 발생 시 즉시 알림을 드립니다.",
    },
    {
      icon: "🎯",
      title: "당첨자 및 배송 인계 지원",
      desc: "래플 종료 후 당첨자 데이터를 정리하여 브랜드 측에 안전하게 인계합니다. 운영 리스크를 최소화하는 방식으로 진행됩니다.",
    },
    {
      icon: "📈",
      title: "캠페인 종료 후 성과 리뷰",
      desc: "주요 지표와 개선 포인트를 정리한 리포트를 제공합니다. 다음 캠페인을 더 효과적으로 설계할 수 있도록 돕습니다.",
    },
  ];

  const process = [
    { step: "01", title: "담당 매니저 배정", desc: "파트너십 계약 후 전담 매니저가 즉시 배정됩니다." },
    { step: "02", title: "캠페인 기획 협의", desc: "목표와 일정에 맞춘 래플 캠페인을 함께 설계합니다." },
    { step: "03", title: "런칭 및 실시간 운영", desc: "캠페인 오픈부터 종료까지 매니저가 함께합니다." },
    { step: "04", title: "결과 정리 및 인계", desc: "당첨자 데이터와 성과 리포트를 안전하게 전달합니다." },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* 헤더 */}
      <section className="bg-gray-950 text-white pt-36 pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-6">Enterprise Support</p>
          <h1 className="text-4xl font-bold mb-5">전담 매니저 지원</h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-2xl mx-auto">
            nofake는 단순한 래플 도구가 아닙니다.
            캠페인 준비부터 결과 정리까지 함께 운영하는 파트너를 지향합니다.
          </p>
        </div>
      </section>

      {/* 서비스 카드 */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((service) => (
            <div key={service.title} className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:border-gray-300 hover:shadow-sm transition-all">
              <span className="text-3xl mb-4 block">{service.icon}</span>
              <h2 className="text-base font-bold text-gray-900 mb-3">{service.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 지원 프로세스 */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">매니저 지원 프로세스</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((item, i) => (
              <div key={item.step} className="bg-white border border-gray-100 rounded-2xl p-6 text-center relative">
                <p className="text-2xl font-black text-gray-900 mb-3">{item.step}</p>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                {i < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-gray-300 text-lg">›</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">파트너십 문의하기</h2>
        <p className="text-sm text-gray-400 mb-6">전담 매니저가 3영업일 내에 연락드립니다.</p>
        <a
        href="/partnership"
        className="inline-block bg-gray-950 text-sm font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors border border-gray-800"
         style={{ color: '#ffffff' }}
        >
          파트너십 문의하기
        </a>
      </section>
    </main>
  );
}