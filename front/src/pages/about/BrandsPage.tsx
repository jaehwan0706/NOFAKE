export function BrandsPage() {
  const brands = [
    { name: "Nike", category: "스포츠", desc: "세계 1위 스포츠 브랜드", emoji: "👟", raffles: 12 },
    { name: "Adidas", category: "스포츠", desc: "독일의 글로벌 스포츠 브랜드", emoji: "🦎", raffles: 8 },
    { name: "New Balance", category: "스포츠", desc: "미국의 프리미엄 러닝화 브랜드", emoji: "🏃", raffles: 5 },
    { name: "Supreme", category: "스트릿", desc: "뉴욕 발 스트릿 컬처의 아이콘", emoji: "🔴", raffles: 3 },
    { name: "Stone Island", category: "하이엔드", desc: "이탈리아 기술 소재 전문 브랜드", emoji: "🧥", raffles: 4 },
    { name: "Off-White", category: "하이엔드", desc: "버질 아블로가 창립한 럭셔리 브랜드", emoji: "⬜", raffles: 6 },
    { name: "Asics", category: "스포츠", desc: "일본의 고성능 러닝화 브랜드", emoji: "🏅", raffles: 7 },
    { name: "Salehe Bembury", category: "콜라보", desc: "독창적인 디자인의 콜라보 브랜드", emoji: "🎨", raffles: 2 },
  ];

  const categories = ["전체", "스포츠", "스트릿", "하이엔드", "콜라보"];

  return (
    <main className="min-h-screen bg-white">
      {/* 헤더 */}
      <section className="bg-gray-950 text-white px-6 py-20 text-center">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          Verified Brands
        </p>
        <h1 className="text-4xl font-bold mb-4">브랜드 목록</h1>
        <p className="text-gray-400 text-base max-w-md mx-auto">
          nofake에 입점한 검증된 브랜드들을 만나보세요.
          모든 브랜드는 정품 인증을 거쳐 입점합니다.
        </p>
      </section>

      {/* 카테고리 필터 */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              className="px-4 py-1.5 rounded-full text-sm border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all first:bg-gray-900 first:text-white first:border-gray-900"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 브랜드 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="group border border-gray-100 rounded-2xl p-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="text-4xl mb-3">{brand.emoji}</div>
              <p className="text-xs text-gray-400 mb-1">{brand.category}</p>
              <h3 className="text-base font-bold text-gray-900 mb-1">{brand.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{brand.desc}</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-xs text-gray-400">진행 래플 {brand.raffles}개</span>
              </div>
            </div>
          ))}
        </div>

        {/* 입점 문의 CTA */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">브랜드 입점 문의</h2>
          <p className="text-sm text-gray-500 mb-5">
            nofake와 함께 공정한 래플로 브랜드 가치를 높여보세요.
          </p>
          <a
            href="/partner"
            className="inline-block bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
          >
            입점 문의하기
          </a>
        </div>
      </section>
    </main>
  );
}