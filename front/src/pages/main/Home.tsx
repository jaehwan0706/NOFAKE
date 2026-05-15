import React, { useEffect, useRef, useState } from "react";

/*
  nofake home redesign preview
  - 외부 아이콘 라이브러리 없이 동작하도록 SVG Icon 컴포넌트를 직접 정의했습니다.
  - 기존 정보는 최대한 유지하면서 메인화면은 화이트/블랙/블루 톤,
    래플 참여 섹션은 블랙 배경으로 반전했습니다.
*/

function Icon({ name, className = "" }) {
  const commonProps: React.SVGProps<SVGSVGElement> = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    ticket: (
      <>
        <path d="M2 9a3 3 0 0 0 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 0 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
      </>
    ),
    calendar: (
      <>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
    gift: (
      <>
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
      </>
    ),
    server: (
      <>
        <rect x="2" y="3" width="20" height="8" rx="2" />
        <rect x="2" y="13" width="20" height="8" rx="2" />
        <path d="M6 7h.01" />
        <path d="M6 17h.01" />
      </>
    ),
    lock: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
    code: (
      <>
        <path d="m16 18 6-6-6-6" />
        <path d="m8 6-6 6 6 6" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    ),
    message: <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />,
    x: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
    mail: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </>
    ),
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.11 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.89.7 2.77a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.31-1.31a2 2 0 0 1 2.11-.45c.88.35 1.81.57 2.77.7A2 2 0 0 1 22 16.92z" />,
    star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />,
  };

  return <svg {...commonProps}>{paths[name] ?? paths.star}</svg>;
}

const stats = [
  { number: "1,200+", label: "진행된 추첨", icon: "ticket" },
  { number: "50만+", label: "누적 참여자", icon: "users" },
  { number: "99.9%", label: "검증 완료율", icon: "shield" },
];

const trustStats = [
  { value: "1,200+", label: "성공한 캠페인", icon: "ticket" },
  { value: "50만+", label: "누적 참여자", icon: "users" },
  { value: "99.9%", label: "플랫폼 안정성", icon: "shield" },
  { value: "15+", label: "협업 브랜드", icon: "star" },
];

const raffleItems = [
  {
    brand: "NIKE",
    title: "Air Jordan 1 Retro High OG",
    participants: "120,000명",
    days: "D-3",
    prize: "한정판 스니커즈 · 5명",
    color: "#111111",
    logo: "NIKE",
  },
  {
    brand: "Supreme",
    title: "Box Logo Hoodie",
    participants: "85,000명",
    days: "D-3",
    prize: "박스로고 후드 · 3명",
    color: "#ED1C24",
    logo: "Supreme",
  },
  {
    brand: "MUSINSA",
    title: "한정 컬래버 패션 세트",
    participants: "95,000명",
    days: "D-3",
    prize: "컬래버 패션 세트 · 10명",
    color: "#222222",
    logo: "musinsa",
  },
];

const partnerBrands = ["NIKE", "adidas", "MUSINSA", "Supreme", "JORDAN", "New Balance", "PUMA", "CONVERSE"];

const pointPartners = [
  { name: "NIKE", className: "left-[47%] top-[2%] bg-black text-white" },
  { name: "adidas", className: "right-[1%] top-[34%] bg-white text-black" },
  { name: "GIFT", className: "right-[8%] bottom-[8%] bg-white text-black" },
  { name: "PUMA", className: "left-[18%] bottom-[4%] bg-red-600 text-white" },
  { name: "MUSINSA", className: "left-[5%] top-[36%] bg-black text-white" },
];

const heroFeatures = [
  { title: "안전한 거래", desc: "블록체인 기반으로 투명하고 안전하게", icon: "shield" },
  { title: "간편한 교환", desc: "복잡한 절차 없이 쉽고 빠르게", icon: "arrow" },
  { title: "다양한 브랜드", desc: "패션, 스포츠, 라이프스타일 등 다양한 브랜드와 연결", icon: "globe" },
  { title: "포인트 통합 관리", desc: "여러 곳에 흩어진 포인트를 한 곳에서 관리", icon: "ticket" },
];

const techStack = [
  {
    icon: "database",
    title: "Hyperledger Fabric",
    desc: "추첨 기록을 위변조하기 어렵게 저장하고 검증 가능한 흐름을 제공합니다.",
  },
  {
    icon: "server",
    title: "AWS 클라우드 인프라",
    desc: "대규모 참여 트래픽에도 안정적으로 운영될 수 있는 서버 구조를 지향합니다.",
  },
  {
    icon: "lock",
    title: "사용자 인증 & 보안",
    desc: "본인인증, 중복 참여 차단, 실시간 모니터링으로 공정성을 보조합니다.",
  },
  {
    icon: "code",
    title: "React 기반 프론트엔드",
    desc: "래플 참여와 포인트 환전을 직관적으로 사용할 수 있는 UI를 제공합니다.",
  },
];

function runDataTests() {
  console.assert(stats.length === 3, "Hero stats should contain 3 items.");
  console.assert(trustStats.length === 4, "Trust stats should contain 4 items.");
  console.assert(raffleItems.length === 3, "Raffle list should contain 3 items.");
  console.assert(techStack.length === 4, "Tech stack should contain 4 items.");
  console.assert(partnerBrands.includes("MUSINSA"), "Partner brands should include MUSINSA.");
}

function DotRaffleIllustration() {
  const blueDots = [
    [18, 34, 1.1, 0.45], [27, 25, 1.7, 0.32], [34, 38, 0.9, 0.28],
    [47, 29, 0.9, 0.55], [63, 29, 0.9, 0.55], [77, 25, 1.7, 0.32],
    [88, 35, 1.15, 0.45], [94, 48, 0.9, 0.32], [88, 62, 1.1, 0.45],
    [77, 73, 1.2, 0.7], [63, 80, 0.8, 0.28], [47, 80, 0.8, 0.28],
    [32, 73, 1.2, 0.7], [20, 62, 1.1, 0.45], [14, 49, 0.9, 0.32],
  ];

  const blueRings = [
    [23, 43, 1.55], [87, 43, 1.55], [73, 67, 1.35], [37, 67, 1.35],
  ];

  return (
    <div className="relative h-[320px] w-full max-w-[500px] md:h-[390px]">
      <svg viewBox="0 0 110 100" className="absolute inset-0 h-full w-full">
        <defs>
          <filter id="heroObjectShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1D4ED8" floodOpacity="0.08" />
          </filter>
        </defs>

        {blueDots.map(([cx, cy, r, opacity], index) => (
          <circle key={`dot-${index}`} cx={cx} cy={cy} r={r} fill="#2563EB" opacity={opacity} />
        ))}
        {blueRings.map(([cx, cy, r], index) => (
          <circle key={`ring-${index}`} cx={cx} cy={cy} r={r} fill="none" stroke="#2563EB" strokeWidth="0.55" opacity="0.85" />
        ))}

        <g stroke="#0F172A" strokeWidth="1.6" fill="white" strokeLinecap="round" strokeLinejoin="round">
          <path d="M45 34 Q45 31 48 31 H62 Q65 31 65 34 V58 H45 Z" />
        </g>

        <g filter="url(#heroObjectShadow)" stroke="#0F172A" strokeWidth="1.6" fill="white" strokeLinecap="round" strokeLinejoin="round">
          <path d="M34 50 H76 L84 60 H26 Z" />
          <path d="M26 60 H84 V83 Q84 87 80 87 H30 Q26 87 26 83 Z" />
        </g>

        <path d="M43 55 H67" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />

        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M45 34 Q45 31 48 31 H62 Q65 31 65 34 V55 H45 Z" fill="white" stroke="#0F172A" strokeWidth="1.6" />
          <path
            d="M55 39 L57.1 43.8 L62.3 44.2 L58.2 47.5 L59.5 52.6 L55 49.8 L50.5 52.6 L51.8 47.5 L47.7 44.2 L52.9 43.8 Z"
            fill="none"
            stroke="#F97316"
            strokeWidth="1.4"
          />
        </g>

        <path d="M43 55 H67" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />

        <g stroke="#2563EB" strokeWidth="1.55" strokeLinecap="round">
          <path d="M55 23 V18" />
          <path d="M62 25 L65 20" />
          <path d="M48 25 L45 20" />
        </g>
      </svg>
    </div>
  );
}

function HeroSlideBar({ activeSlide, onSlideChange }) {
  return (
    <div className="mx-auto mb-8 w-[360px] max-w-[70vw]">
      <div className="h-3 overflow-hidden rounded-full bg-neutral-200/60 shadow-inner">
        <div
          className="h-full w-1/2 rounded-full bg-neutral-300/90 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${activeSlide * 100}%)` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-2 text-center text-sm font-semibold text-neutral-400">
        <button
          type="button"
          onClick={() => onSlideChange(0)}
          className={`transition ${activeSlide === 0 ? "text-neutral-500" : "hover:text-neutral-500"}`}
        >
          1/2
        </button>
        <button
          type="button"
          onClick={() => onSlideChange(1)}
          className={`transition ${activeSlide === 1 ? "text-neutral-500" : "hover:text-neutral-500"}`}
        >
          2/2
        </button>
      </div>
    </div>
  );
}

function PointExchangeIllustration() {
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[420px]">
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/40" />
      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/25" />

      <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] bg-blue-600 text-center text-2xl font-black leading-tight text-white shadow-[0_0_50px_rgba(37,99,235,0.55)]">
        nofake<br />POINT
      </div>

      {pointPartners.map((partner) => (
        <div
          key={partner.name}
          className={`absolute flex h-16 w-16 items-center justify-center rounded-2xl text-xs font-black shadow-2xl ${partner.className}`}
        >
          {partner.name}
        </div>
      ))}

      {["left-[22%] top-[20%]", "right-[8%] top-[18%]", "left-[20%] bottom-[30%]"].map((position, index) => (
        <div
          key={index}
          className={`absolute ${position} flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white shadow-lg`}
        >
          P
        </div>
      ))}
    </div>
  );
}

function PointExchangePanel() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[#071226] p-8 text-white shadow-[0_18px_60px_rgba(15,23,42,0.16)] lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.22),transparent_34%),radial-gradient(circle_at_30%_85%,rgba(37,99,235,0.12),transparent_34%)]" />

      <div className="relative grid min-h-[520px] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="mb-8 inline-flex rounded-full bg-blue-500/10 px-4 py-2 text-xs font-black tracking-[0.18em] text-blue-400">
            POINT SWAP PLATFORM
          </div>

          <h2 className="text-4xl font-black leading-[1.14] tracking-[-0.05em] md:text-5xl">
            흩어진 포인트를<br />
            하나로 <span className="text-blue-500">연결</span>하는<br />
            플랫폼
          </h2>

          <p className="mt-7 text-base leading-8 text-slate-300">
            Nike, 무신사, Adidas 등 다양한 브랜드와 연결된 포인트 교환 시스템을 제공합니다.
          </p>

          <p className="mt-7 text-base font-black leading-7 text-blue-500">
            여러 브랜드 포인트를<br />
            쉽고 빠르게 관리하세요.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <button className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-black text-white shadow-[0_12px_34px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 active:scale-[0.98]">
              포인트 교환하기
              <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="rounded-full border border-white/20 px-7 py-4 text-sm font-black text-white transition-all duration-300 hover:bg-white/5 active:scale-[0.98]">
              제휴 브랜드 보기
            </button>
          </div>
        </div>

        <PointExchangeIllustration />
      </div>
    </div>
  );
}

function HeroFeatureStrip() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 rounded-[2rem] bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)] md:grid-cols-2 xl:grid-cols-4">
      {heroFeatures.map(({ title, desc, icon }) => (
        <div key={title} className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Icon name={icon} className="h-7 w-7" />
          </span>
          <span>
            <span className="block text-base font-black text-neutral-950">{title}</span>
            <span className="mt-1 block text-sm leading-6 text-neutral-500">{desc}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

const navigationMenus = [
  {
    label: "서비스 소개",
    width: "max-w-4xl",
    columns: [
      {
        title: "서비스 소개",
        items: [
          { icon: "shield", title: "nofake 소개", desc: "공정한 래플 플랫폼 nofake를 소개합니다" },
          { icon: "database", title: "회사 소개", desc: "nofake를 만드는 사람들" },
        ],
      },
      {
        title: "핵심 가치",
        items: [
          { icon: "ticket", title: "공정성", desc: "조작 없는 온체인 추첨 시스템" },
          { icon: "globe", title: "투명성", desc: "모든 트랜잭션을 누구나 검증" },
          { icon: "lock", title: "신뢰", desc: "데이터 무결성 위의 변하지 않는 약속" },
        ],
      },
    ],
  },
  {
    label: "래플 이벤트",
    width: "max-w-4xl",
    columns: [
      {
        title: "래플 소개",
        items: [
          { icon: "ticket", title: "nofake 래플", desc: "공정한 블록체인 기반 추첨 시스템" },
        ],
      },
      { title: "카테고리", gridItems: ["스니커즈", "의류", "액세서리", "한정판 컬렉션"] },
    ],
  },
  {
    label: "포인트 거래",
    width: "max-w-4xl",
    columns: [
      {
        title: "포인트 교환",
        items: [
          { icon: "arrow", title: "포인트 교환 센터", desc: "nofake 포인트를 파트너 브랜드 포인트로 교환" },
        ],
      },
      { title: "교환 가능 파트너", gridItems: ["Nike", "무신사", "Adidas", "기프트카드"] },
    ],
  },
  {
    label: "고객센터",
    width: "max-w-4xl",
    columns: [
      {
        title: "고객 지원",
        items: [
          { icon: "message", title: "1:1 문의", desc: "담당자가 직접 답변해드립니다" },
          { icon: "shield", title: "FAQ", desc: "자주 묻는 질문 모음" },
        ],
      },
      { title: "안내", gridItems: ["공지사항", "이용약관", "개인정보처리방침"] },
    ],
  },
  {
    label: "파트너십",
    width: "max-w-4xl",
    columns: [
      {
        title: "파트너십",
        items: [
          { icon: "users", title: "브랜드 제휴", desc: "공정한 래플 캠페인을 함께 운영합니다" },
          { icon: "mail", title: "제휴 문의", desc: "파트너십 담당자에게 문의하기" },
        ],
      },
      { title: "운영 지원", gridItems: ["캠페인 설계", "포인트 제휴", "검증 리포트", "정산 지원"] },
    ],
  },
];

function MegaMenuPanel({ menu }) {
  return (
    <div className="absolute left-1/2 top-full z-50 w-[min(920px,calc(100vw-48px))] -translate-x-1/2 pt-3">
      <div className="overflow-hidden rounded-[28px] border border-neutral-100 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {menu.columns.map((column) => (
            <div key={column.title}>
              <p className="mb-6 text-sm font-black text-neutral-400">{column.title}</p>

              {column.items && (
                <div className="space-y-5">
                  {column.items.map((item) => (
                    <a key={item.title} href="#" className="group flex items-start gap-4 rounded-2xl p-2 transition hover:bg-neutral-50">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <Icon name={item.icon} className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-base font-black text-neutral-950">{item.title}</span>
                        <span className="mt-1 block text-sm leading-6 text-neutral-400">{item.desc}</span>
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {column.gridItems && (
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-base font-medium text-neutral-600">
                  {column.gridItems.map((item) => (
                    <a key={item} href="#" className="transition hover:text-blue-600">
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Header() {
  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md transition-shadow duration-300" onMouseLeave={() => setActiveMenu(null)}>
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="text-2xl font-black tracking-tight text-neutral-950">nofake</div>

        <nav className="hidden items-center gap-2 text-sm font-semibold text-neutral-700 md:flex">
          {navigationMenus.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                type="button"
                onMouseEnter={() => setActiveMenu(menu.label)}
                className={`rounded-2xl px-5 py-3 transition-all duration-200 ${
                  activeMenu === menu.label
                    ? "bg-blue-50 text-blue-600"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                }`}
              >
                {menu.label}
              </button>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm font-semibold">
          <button className="hidden rounded-2xl px-4 py-3 text-neutral-700 transition hover:bg-neutral-50 sm:block">로그인</button>
        </div>

        {activeMenu && <MegaMenuPanel menu={navigationMenus.find((menu) => menu.label === activeMenu)} />}
      </div>
    </header>
  );
}

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-neutral-50 pt-28">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <HeroSlideBar activeSlide={activeSlide} onSlideChange={setActiveSlide} />

        <div className="overflow-hidden rounded-[2rem]">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            <div className="w-full shrink-0 rounded-[2rem] bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:p-10">
              <div className="grid min-h-[520px] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <div className="mb-8 inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black tracking-[0.18em] text-blue-600">
                    TRANSPARENT RAFFLE PLATFORM
                  </div>

                  <h1 className="max-w-3xl text-5xl font-black leading-[1.12] tracking-[-0.06em] text-neutral-950 md:text-7xl">
                    모든 추첨을<br />
                    투명하게,<br />
                    누구나 <span className="text-blue-600">검증</span>할 수 있게
                  </h1>

                  <p className="mt-7 max-w-xl text-lg leading-8 text-neutral-600">
                    Hyperledger Fabric 기반 검증 시스템으로 래플 참여, 추첨 기록, 결과 공개까지 공정한 흐름을 제공합니다.
                  </p>

                  <div className="mt-10 flex flex-wrap gap-4">
                    <button className="group inline-flex items-center gap-2 rounded-full bg-neutral-950 px-8 py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98]">
                      추첨 참여하기
                      <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-8 py-4 text-sm font-bold text-neutral-900 transition-all duration-300 hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98]">
                      검증 시스템 보기
                    </button>
                  </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                  <DotRaffleIllustration />
                </div>
              </div>
            </div>

            <div className="w-full shrink-0">
              <PointExchangePanel />
            </div>
          </div>
        </div>

        <HeroFeatureStrip />
      </div>
    </section>
  );
}

function TrustIndicators() {
  return (
    <section id="service" className="border-y border-neutral-200 bg-neutral-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-black tracking-[0.3em] text-blue-600">PROVEN TRACK RECORD</p>
          <h2 className="text-4xl font-black tracking-tight text-neutral-950">신뢰할 수 있는 수치로 증명합니다</h2>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {trustStats.map(({ value, label, icon }) => (
            <div key={label} className="rounded-3xl border border-neutral-200 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <Icon name={icon} className="mx-auto mb-5 h-8 w-8 text-blue-600" />
              <div className="text-3xl font-black text-neutral-950">{value}</div>
              <div className="mt-2 text-sm font-semibold text-neutral-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActiveRaffles() {
  const sectionRef = useRef(null);
  const [darkProgress, setDarkProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const smoothStep = (value) => {
      const clamped = Math.max(0, Math.min(1, value));
      return clamped * clamped * (3 - 2 * clamped);
    };

    const updateDarkProgress = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const fadeDistance = viewportHeight * 0.8;
      const fadeIn = smoothStep((viewportHeight - rect.top) / fadeDistance);
      const fadeOut = smoothStep(rect.bottom / fadeDistance);
      const nextProgress = Math.min(fadeIn, fadeOut);

      setDarkProgress(nextProgress);
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateDarkProgress);
    };

    updateDarkProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const overlayOpacity = darkProgress * 0.76;
  const primaryTextColor = darkProgress > 0.45 ? "#ffffff" : "#0a0a0a";
  const secondaryTextColor = darkProgress > 0.45 ? "#a3a3a3" : "#525252";
  const borderColor = `rgba(255,255,255,${0.1 + darkProgress * 0.16})`;

  return (
    <section ref={sectionRef} id="raffles" className="relative overflow-hidden bg-white py-28" style={{ color: primaryTextColor }}>
      <div className="pointer-events-none fixed inset-0 z-30 bg-black transition-opacity duration-150" style={{ opacity: overlayOpacity }} />
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: darkProgress,
          background:
            "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.20), transparent 38%), radial-gradient(circle at 90% 40%, rgba(37,99,235,0.12), transparent 30%)",
        }}
      />

      <div className="relative z-40 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-black tracking-[0.3em] text-blue-500">INTERACTIVE EXPERIENCE</p>
            <h2 className="text-5xl font-black tracking-tight transition-colors duration-300" style={{ color: primaryTextColor }}>
              지금 응모 가능한 래플
            </h2>
            <p className="mt-4 transition-colors duration-300" style={{ color: secondaryTextColor }}>
              글로벌 브랜드의 한정 상품을 공정하게 응모해보세요.
            </p>
          </div>
          <button
            className="w-fit rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              border: `1px solid ${darkProgress > 0.45 ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.14)"}`,
              color: primaryTextColor,
              backgroundColor: darkProgress > 0.45 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.78)",
            }}
          >
            전체 래플 보기
          </button>
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
          {raffleItems.map((item, index) => (
            <article
              key={item.brand}
              className="overflow-hidden rounded-3xl bg-white text-black shadow-2xl transition duration-500 hover:-translate-y-1"
              style={{
                border: `1px solid ${borderColor}`,
                boxShadow: darkProgress > 0.45 ? "0 28px 80px rgba(0,0,0,0.42)" : "0 18px 45px rgba(15,23,42,0.10)",
                transform: `translateY(${(1 - darkProgress) * (10 + index * 3)}px)`,
              }}
            >
              <div className="flex h-24 items-center justify-center text-2xl font-black text-white" style={{ backgroundColor: item.color }}>
                {item.logo}
              </div>
              <div className="p-7">
                <p className="mb-2 text-xs font-bold tracking-[0.22em] text-neutral-400">BRAND</p>
                <h3 className="text-2xl font-black">{item.brand}</h3>
                <p className="mt-3 min-h-12 text-lg font-bold leading-snug text-neutral-900">{item.title}</p>
                <div className="my-6 h-px bg-neutral-200" />
                <div className="space-y-3 text-sm font-medium text-neutral-700">
                  <div className="flex items-center gap-3"><Icon name="users" className="h-4 w-4 text-blue-600" />참여자 {item.participants}</div>
                  <div className="flex items-center gap-3"><Icon name="calendar" className="h-4 w-4 text-blue-600" />{item.days} 마감</div>
                  <div className="flex items-center gap-3"><Icon name="gift" className="h-4 w-4 text-blue-600" />{item.prize}</div>
                </div>
                <button className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-4 text-sm font-black text-white shadow-[0_8px_22px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98]">
                  추첨 참여하기
                  <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerBrands() {
  const marqueeBrands = [...partnerBrands, ...partnerBrands];

  return (
    <section id="partner" className="overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-black tracking-[0.3em] text-blue-600">TRUSTED BY</p>
          <h2 className="text-4xl font-black tracking-tight text-neutral-950 md:text-5xl">글로벌 브랜드와의 협업 실적</h2>
          <p className="mt-4 text-neutral-500">세계적으로 인정받는 브랜드들이 nofake를 선택했습니다.</p>
        </div>
      </div>

      <div className="relative border-y border-neutral-200 bg-neutral-50 py-8">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-white via-white/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-white via-white/80 to-transparent" />

        <div className="brand-marquee flex w-max items-center gap-4">
          {marqueeBrands.map((brand, index) => (
            <div key={`${brand}-${index}`} className="flex h-24 min-w-[240px] items-center justify-center rounded-3xl border border-neutral-200 bg-white px-10 text-2xl font-black tracking-tight text-neutral-950 shadow-sm">
              {brand}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes brand-marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .brand-marquee {
          animation: brand-marquee-scroll 28s linear infinite;
          padding-left: 2rem;
        }

        .brand-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

function TechnologyStack() {
  const [activeTechIndex, setActiveTechIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTechIndex((current) => (current + 1) % techStack.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const activeTech = techStack[activeTechIndex];

  return (
    <section id="point" className="border-y border-neutral-200 bg-neutral-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-black tracking-[0.3em] text-blue-600">TECHNOLOGY STACK</p>
          <h2 className="text-4xl font-black tracking-tight text-neutral-950 md:text-5xl">공정성을 위한 기술 구조</h2>
          <p className="mt-4 text-neutral-500">블록체인, 보안, 클라우드, 프론트엔드가 하나의 검증 경험으로 연결됩니다.</p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-10 shadow-sm md:p-14">
            <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-blue-50 blur-3xl" />

            <div className="relative grid min-h-[280px] grid-cols-1 items-center gap-10 md:grid-cols-[0.9fr_1.1fr]">
              <div className="flex items-center justify-center">
                <div className="flex h-40 w-40 items-center justify-center rounded-[2rem] border border-blue-100 bg-blue-50 text-blue-600">
                  <Icon name={activeTech.icon} className="h-20 w-20" />
                </div>
              </div>

              <div key={activeTech.title} className="animate-tech-fade">
                <p className="mb-4 text-xs font-black tracking-[0.24em] text-blue-600">
                  0{activeTechIndex + 1} / 04
                </p>
                <h3 className="text-4xl font-black tracking-tight text-neutral-950">
                  {activeTech.title}
                </h3>
                <p className="mt-5 text-lg leading-8 text-neutral-600">
                  {activeTech.desc}
                </p>
              </div>
            </div>

            <div className="relative mt-10 flex items-center justify-center gap-3">
              {techStack.map((item, index) => (
                <button key={item.title} type="button" onClick={() => setActiveTechIndex(index)} aria-label={`${item.title} 보기`} className="group flex h-8 w-8 items-center justify-center rounded-full">
                  <span className={`block rounded-full transition-all duration-300 ${activeTechIndex === index ? "h-3 w-8 bg-blue-600" : "h-3 w-3 bg-neutral-300 group-hover:bg-neutral-500"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tech-fade {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-tech-fade {
          animation: tech-fade 0.45s ease-out both;
        }
      `}</style>
    </section>
  );
}

function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <div id="support" className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 rounded-3xl border border-neutral-200 bg-white p-5 shadow-2xl">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="font-black">nofake 파트너십 문의</div>
              <div className="mt-1 text-xs text-neutral-500">평균 응답시간 2시간 이내</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="닫기"><Icon name="x" className="h-5 w-5" /></button>
          </div>
          <p className="text-sm leading-6 text-neutral-600">파트너십에 관심 있으신가요? 간단히 남겨주시면 담당자가 연락드립니다.</p>
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1"><Icon name="mail" className="h-3 w-3" /> partnership@nofake.io</span>
            <span className="flex items-center gap-1"><Icon name="phone" className="h-3 w-3" /> 1533-2771</span>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((value) => !value)} className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:bg-blue-700" aria-label="문의하기">
        <Icon name={open ? "x" : "message"} className="h-6 w-6" />
      </button>
    </div>
  );
}

export function Home() {
  useEffect(() => {
    document.title = "nofake | 공정한 래플 플랫폼";
    runDataTests();
  }, []);

  return (
    <main className="min-h-screen bg-white font-sans text-neutral-950">
      <Hero />
      <TrustIndicators />
      <ActiveRaffles />
      <PartnerBrands />
      <TechnologyStack />
      <section className="bg-white py-24 text-center">
        <Icon name="globe" className="mx-auto mb-6 h-10 w-10 text-blue-600" />
        <h2 className="text-4xl font-black tracking-tight">공정한 래플 문화를 만들어갑니다</h2>
        <p className="mx-auto mt-5 max-w-2xl px-6 leading-8 text-neutral-600">
          nofake는 투명한 검증 시스템과 브랜드 캠페인 운영 경험을 바탕으로 신뢰할 수 있는 래플 생태계를 지향합니다.
        </p>
      </section>
      <FloatingChat />
    </main>
  );
}
