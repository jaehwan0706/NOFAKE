export const ManagerSupportPage = () => {
  const services = [
    {
      title: "1:1 account manager",
      body: "Campaign setup, operations, and issue handling are managed through one clear support channel.",
    },
    {
      title: "Live campaign monitoring",
      body: "Traffic, entry progress, and abnormal activity can be checked while a raffle is running.",
    },
    {
      title: "Winner and delivery handoff",
      body: "After reveal, winner data can be organized for fulfillment while keeping operational risk low.",
    },
    {
      title: "Post-campaign review",
      body: "Performance metrics and follow-up actions are prepared so the next campaign can improve.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-24 pt-32">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Enterprise support</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">전담 매니저 지원</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          NOFAKE는 단순한 래플 도구가 아니라 캠페인 준비부터 결과 정리까지 함께 운영하는 파트너를 지향합니다.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <article key={service.title} className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">{service.title}</h2>
              <p className="mt-4 leading-7 text-slate-600">{service.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};
