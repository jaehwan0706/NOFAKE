import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router";

/* ─── Navigation helper ─── */
function useNav() {
  const navigate = useNavigate();
  return useCallback((path: string) => navigate(path), [navigate]);
}

/* ─── Icon ─── */
function Icon({ name, className = "" }: { name: string; className?: string }) {
  const commonProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<string, React.ReactNode> = {
    arrow: (<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    users: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
    ticket: (<><path d="M2 9a3 3 0 0 0 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 0 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" /></>),
    calendar: (<><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></>),
    gift: (<><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" /></>),
    database: (<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" /></>),
    server: (<><rect x="2" y="3" width="20" height="8" rx="2" /><rect x="2" y="13" width="20" height="8" rx="2" /><path d="M6 7h.01" /><path d="M6 17h.01" /></>),
    lock: (<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>),
    code: (<><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></>),
    globe: (<><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>),
    message: <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />,
    x: (<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>),
    mail: (<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>),
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.11 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.89.7 2.77a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.31-1.31a2 2 0 0 1 2.11-.45c.88.35 1.81.57 2.77.7A2 2 0 0 1 22 16.92z" />,
    star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />,

    check: (<><path d="M20 6 9 17l-5-5" /></>),
    clipboard: (<><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" /></>),
    trophy: (<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></>),
    image: (<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>),
    quote: (<><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></>),
  };

  return <svg {...commonProps}>{paths[name] ?? paths.star}</svg>;
}

/* ─── Data ─── */
const trustStats = [
  { value: "1,200+", label: "성공한 캠페인", icon: "ticket" },
  { value: "50만+", label: "누적 참여자", icon: "users" },
  { value: "99.9%", label: "플랫폼 안정성", icon: "shield" },
  { value: "15+", label: "협업 브랜드", icon: "star" },
];

const raffleItems = [
  { brand: "NIKE", title: "Air Jordan 1 Retro High OG", participants: "120,000명", days: "D-3", prize: "한정판 스니커즈 · 5명", color: "#111111", logo: "/brands/nike2.png", },
  { brand: "Supreme", title: "Box Logo Hoodie", participants: "85,000명", days: "D-3", prize: "박스로고 후드 · 3명", color: "#ED1C24", logo: "/brands/supreme2.png" },
  { brand: "MUSINSA", title: "한정 컬래버 패션 세트", participants: "95,000명", days: "D-3", prize: "컬래버 패션 세트 · 10명", color: "#222222", logo: "/brands/musinsa2.png" },
  { brand: "Adidas", title: "Samba OG Cloud White", participants: "72,000명", days: "D-4", prize: "한정판 스니커즈 · 7명", color: "#0F172A", logo: "/brands/adidas2.png" },
  { brand: "New Balance", title: "Made in USA 990v6", participants: "68,000명", days: "D-5", prize: "프리미엄 스니커즈 · 4명", color: "#334155", logo: "/brands/newbalance2.png" },
];
// 텍스트 브랜드 로고
// const partnerBrands = ["NIKE", "adidas", "MUSINSA", "Supreme", "JORDAN", "New Balance", "PUMA", "CONVERSE"];

// 이미지 브랜드 로고
const partnerBrands = [
  { name: "NIKE", logo: "/brands/nike.svg" },
  { name: "adidas", logo: "/brands/adidas.svg" },
  { name: "MUSINSA", logo: "/brands/musinsa.jpeg" },
  { name: "Supreme", logo: "/brands/supreme.png" },
  { name: "JORDAN", logo: "/brands/jordan.svg" },
  { name: "New Balance", logo: "/brands/newbalance.svg" },
  { name: "PUMA", logo: "/brands/puma.svg" },
  { name: "CONVERSE", logo: "/brands/converse.svg" },
];

const pointPartners = [
  { name: "NIKE", className: "left-[47%] top-[2%] bg-black text-white" },
  { name: "adidas", className: "right-[1%] top-[34%] bg-white text-black" },
  { name: "GIFT", className: "right-[8%] bottom-[8%] bg-white text-black" },
  { name: "PUMA", className: "left-[18%] bottom-[4%] bg-red-600 text-white" },
  { name: "MUSINSA", className: "left-[5%] top-[36%] bg-black text-white" },
];

const partnershipPartners = [
  { name: "NIKE", className: "left-[12%] top-[22%] bg-black text-white" },
  { name: "MUSINSA", className: "right-[8%] top-[16%] bg-white text-black" },
  { name: "adidas", className: "left-[4%] bottom-[18%] bg-white text-black" },
  { name: "Supreme", className: "right-[3%] bottom-[20%] bg-black text-white" },
];


// 히어로 피처 — 각각 라우트 경로 연결
const heroFeatures = [
  { title: "안전한 거래", desc: "블록체인 기반으로 투명하고 안전하게", icon: "shield", path: "/about/trust" },
  { title: "간편한 교환", desc: "복잡한 절차 없이 쉽고 빠르게", icon: "arrow", path: "/point-swap" },
  { title: "다양한 브랜드", desc: "패션, 스포츠, 라이프스타일 등 다양한 브랜드와 연결", icon: "globe", path: "/brands" },
  { title: "포인트 통합 관리", desc: "여러 곳에 흩어진 포인트를 한 곳에서 관리", icon: "ticket", path: "/point-swap" },
];

const techStack = [
  { icon: "database", title: "Hyperledger Fabric", desc: "추첨 기록을 위변조하기 어렵게 저장하고 검증 가능한 흐름을 제공합니다." },
  { icon: "server", title: "AWS 클라우드 인프라", desc: "대규모 참여 트래픽에도 안정적으로 운영될 수 있는 서버 구조를 지향합니다." },
  { icon: "lock", title: "사용자 인증 & 보안", desc: "본인인증, 중복 참여 차단, 실시간 모니터링으로 공정성을 보조합니다." },
  { icon: "code", title: "React 기반 프론트엔드", desc: "래플 참여와 포인트 환전을 직관적으로 사용할 수 있는 UI를 제공합니다." },
];


/* ─── NEW: How it works steps ─── */
const howItWorksSteps = [
  {
    step: "01",
    icon: "clipboard",
    title: "응모",
    desc: "원하는 래플을 찾아 간단하게 참여하세요. 중복 참여 방지 시스템으로 1인 1회가 보장됩니다.",
    badge: "APPLY",
  },
  {
    step: "02",
    icon: "database",
    title: "추첨",
    desc: "마감 후 Hyperledger Fabric 기반 블록체인이 무작위로 당첨자를 선정합니다. 조작은 구조적으로 불가능합니다.",
    badge: "DRAW",
  },
  {
    step: "03",
    icon: "globe",
    title: "결과 공개",
    desc: "추첨 결과와 블록체인 트랜잭션 해시가 즉시 공개됩니다. 누구나 직접 검증할 수 있습니다.",
    badge: "VERIFY",
  },
];

/* ─── NEW: Why us / competitive advantage ─── */
const whyUsPoints = [
  {
    title: "블록체인 기반 추첨",
    desc: "Hyperledger Fabric으로 추첨 과정을 완전히 기록하고 누구나 검증할 수 있습니다.",
    icon: "shield",
  },
  {
    title: "중복 참여 원천 차단",
    desc: "본인인증 + 실시간 모니터링으로 다중 계정을 통한 어뷰징을 차단합니다.",
    icon: "lock",
  },
  {
    title: "즉시 결과 공개",
    desc: "추첨 완료 즉시 트랜잭션 해시와 함께 결과가 공개되어 신뢰성을 극대화합니다.",
    icon: "globe",
  },
  {
    title: "브랜드 공식 캠페인",
    desc: "15개 이상의 글로벌 브랜드가 직접 참여하는 공식 래플만을 운영합니다.",
    icon: "trophy",
  },
];

/* ─── NEW: Testimonials ─── */
const testimonials = [
  {
    name: "김민준",
    handle: "@minjun_k",
    brand: "Nike Air Jordan 1",
    text: "진짜로 블록체인에서 검증하니까 믿음이 가요. 다른 래플 사이트는 당첨 기준이 불투명한데 nofake는 트랜잭션까지 직접 확인할 수 있어서 납득이 됩니다.",
    verified: true,
    productImg: "/brands/airjordan2.png",
    color: "#111",
  },
  {
    name: "이서연",
    handle: "@seoyeon_fits",
    brand: "Supreme Box Logo",
    text: "Supreme 박스로고 후드 당첨됐을 때 반신반의했는데 수령 인증까지 완벽하게 됐어요. 친구들한테 무조건 추천하고 있습니다.",
    verified: true,
    productImg: "/brands/supreme2.png",
    color: "#ED1C24",
  },
  {
    name: "박준호",
    handle: "@junho_sneakers",
    brand: "Adidas Samba OG",
    text: "포인트 교환이 생각보다 훨씬 편리해요. Nike 포인트를 adidas 래플 응모에 바로 쓸 수 있는 게 너무 좋습니다.",
    verified: true,
    productImg: "/brands/adidas2.png",
    color: "#0F172A",
  },
  {
    name: "최지은",
    handle: "@jieun.picks",
    brand: "New Balance 990v6",
    text: "1,000명 넘는 응모에서 당첨된 게 아직도 믿기지 않아요. 당첨자 발표 때 내 이름 옆에 블록체인 해시가 붙어 있는 거 보고 소름 돋았습니다.",
    verified: true,
    productImg: "/brands/newbalance2.png",
    color: "#334155",
  },
];


/* ─── Illustrations ─── */
function DotRaffleIllustration() {
  const blueDots: [number, number, number, number][] = [
    [18,34,1.1,.45],[27,25,1.7,.32],[34,38,.9,.28],[47,29,.9,.55],[63,29,.9,.55],
    [77,25,1.7,.32],[88,35,1.15,.45],[94,48,.9,.32],[88,62,1.1,.45],[77,73,1.2,.7],
    [63,80,.8,.28],[47,80,.8,.28],[32,73,1.2,.7],[20,62,1.1,.45],[14,49,.9,.32],
  ];
  const blueRings: [number, number, number][] = [[23,43,1.55],[87,43,1.55],[73,67,1.35],[37,67,1.35]];

  return (
    <div className="relative h-[320px] w-full max-w-[500px] md:h-[390px]">
      <svg viewBox="0 0 110 100" className="absolute inset-0 h-full w-full">
        <defs>
          <filter id="heroObjectShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1D4ED8" floodOpacity="0.08" />
          </filter>
        </defs>
        {blueDots.map(([cx,cy,r,opacity],i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#2563EB" opacity={opacity} />)}
        {blueRings.map(([cx,cy,r],i) => <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="#2563EB" strokeWidth="0.55" opacity="0.85" />)}
        <g stroke="#0F172A" strokeWidth="1.6" fill="white" strokeLinecap="round" strokeLinejoin="round">
          <path d="M45 34 Q45 31 48 31 H62 Q65 31 65 34 V58 H45 Z" />
        </g>
        <g filter="url(#heroObjectShadow)" stroke="#0F172A" strokeWidth="1.6" fill="white" strokeLinecap="round" strokeLinejoin="round">
          <path d="M34 50 H76 L84 60 H26 Z" /><path d="M26 60 H84 V83 Q84 87 80 87 H30 Q26 87 26 83 Z" />
        </g>
        <path d="M43 55 H67" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M45 34 Q45 31 48 31 H62 Q65 31 65 34 V55 H45 Z" fill="white" stroke="#0F172A" strokeWidth="1.6" />
          <path d="M55 39 L57.1 43.8 L62.3 44.2 L58.2 47.5 L59.5 52.6 L55 49.8 L50.5 52.6 L51.8 47.5 L47.7 44.2 L52.9 43.8 Z" fill="none" stroke="#F97316" strokeWidth="1.4" />
        </g>
        <path d="M43 55 H67" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
        <g stroke="#2563EB" strokeWidth="1.55" strokeLinecap="round">
          <path d="M55 23 V18" /><path d="M62 25 L65 20" /><path d="M48 25 L45 20" />
        </g>
      </svg>
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
      {pointPartners.map((p) => (
        <div key={p.name} className={`absolute flex h-16 w-16 items-center justify-center rounded-2xl text-xs font-black shadow-2xl ${p.className}`}>
          {p.name}
        </div>
      ))}
      {(["left-[22%] top-[20%]","right-[8%] top-[18%]","left-[20%] bottom-[30%]"] as string[]).map((pos,i) => (
        <div key={i} className={`absolute ${pos} flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white shadow-lg`}>P</div>
      ))}
    </div>
  );
}
//이전거 이미지가 뭔가 AI가 만든 거 같다 지적 받은것
// function PartnershipIllustration() {
//   return (
//     <div className="relative mx-auto h-[300px] w-full max-w-[460px]">
//       <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/20 bg-blue-50/60" />
//       <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/20" />
//       <div className="absolute left-1/2 top-1/2 h-28 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-blue-300/50 bg-[radial-gradient(circle,rgba(37,99,235,0.16),transparent_65%)]" />
//       <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center">
//         <div className="h-16 w-24 rounded-br-[30px] rounded-tl-[18px] border-2 border-blue-700 bg-blue-100" />
//         <div className="-ml-5 -mr-5 flex h-20 w-28 items-center justify-center rounded-full border-2 border-blue-700 bg-white shadow-xl">
//           <Icon name="users" className="h-11 w-11 text-blue-600" />
//         </div>
//         <div className="h-16 w-24 rounded-bl-[30px] rounded-tr-[18px] border-2 border-blue-700 bg-blue-100" />
//       </div>
//       {partnershipPartners.map((p) => (
//         <div key={p.name} className={`absolute flex h-16 w-20 items-center justify-center rounded-full border border-blue-100 text-xs font-black shadow-xl ${p.className}`}>
//           {p.name}
//         </div>
//       ))}
//       {(["left-[27%] top-[12%]","right-[26%] top-[8%]","left-[28%] bottom-[10%]","right-[29%] bottom-[9%]"] as string[]).map((pos,i) => (
//         <span key={i} className={`absolute ${pos} h-2 w-2 rounded-full bg-blue-500/45`} />
//       ))}
//     </div>
//   );
// }
//새로 만든거 이미지 추가
function PartnershipIllustration() {
  return (
    <div className="flex justify-center lg:justify-end">
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
        <img
          src="/images/partnership-handshake.png"
          alt="비즈니스 파트너십 미팅"
          className="h-[460px] w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

        {/* <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-4 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold tracking-[0.14em] text-blue-600">
            BRAND PARTNERSHIP
          </p>
          <p className="mt-1 text-lg font-bold text-neutral-950">
            신뢰 기반 캠페인 운영
          </p>
        </div> */}
      </div>
    </div>
  );
}

/* ─── Hero Panels ─── */
function RaffleHeroPanel({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="border-y border-neutral-200 bg-white px-8 py-12 lg:px-16">
      <div className="grid h-[560px] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-7 text-sm font-semibold text-blue-600">
            공정한 래플
          </div>

          <h1 className="max-w-3xl text-4xl font-bold leading-[1.18] tracking-[-0.035em] text-neutral-950 md:text-6xl">
            추첨 결과를<br />
            누구나 확인할 수 있게
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-neutral-600">
            Hyperledger Fabric 기반 검증 시스템으로 래플 참여, 추첨 기록, 결과
            공개까지 공정한 흐름을 제공합니다.

          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate("/raffles")}
              className="group inline-flex items-center gap-2 rounded-md bg-neutral-950 px-8 py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 active:scale-[0.98]"
            >
              추첨 참여하기
              <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate("/about/fairness")}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-8 py-4 text-sm font-bold text-neutral-900 transition-all duration-300 hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98]"
            >
              검증 시스템 보기
            </button>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <DotRaffleIllustration />
        </div>
      </div>
    </div>
  );
}




function PointExchangePanel({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="relative overflow-hidden bg-[#071226] px-8 py-12 text-white lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_30%_85%,rgba(37,99,235,0.10),transparent_34%)]" />

      <div className="relative grid h-[560px] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="mb-7 text-sm font-semibold text-blue-400">
            포인트 교환
          </div>
          <h2 className="text-4xl font-bold leading-[1.18] tracking-[-0.035em] md:text-6xl">
            흩어진 포인트를<br />
            하나로 연결하는<br />
            플랫폼
          </h2>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-300">
            Nike, 무신사, Adidas 등 다양한 브랜드와 연결된 포인트 교환 시스템을 제공합니다.
          </p>

          <p className="mt-6 text-base font-semibold leading-7 text-blue-400">
            여러 브랜드 포인트를 쉽고 빠르게 관리하세요.
          </p>

          <div className="mt-10 flex min-h-[56px] flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate("/point-swap")}
              className="group inline-flex items-center gap-2 rounded-md bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_34px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 active:scale-[0.98]"
            >
              포인트 교환하기
              <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onNavigate("/brands")}
              className="rounded-md border border-white/20 px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/5 active:scale-[0.98]"
            >

              제휴 브랜드 보기
            </button>
          </div>
        </div>
        <PointExchangeIllustration />
      </div>
    </div>
  );
}

function PartnershipPanel({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="relative overflow-hidden border-y border-neutral-200 bg-white px-8 py-12 lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_24%,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_34%_78%,rgba(37,99,235,0.06),transparent_34%)]" />

      <div className="relative grid h-[560px] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-7 text-sm font-semibold text-blue-600">
            브랜드 파트너십
          </div>

          <h2 className="max-w-3xl text-4xl font-bold leading-[1.18] tracking-[-0.035em] text-neutral-950 md:text-6xl">
            브랜드 캠페인을<br />
            신뢰 가능한 경험으로
          </h2>

          <p className="mt-7 max-w-xl text-base leading-8 text-neutral-600">
            nofake와 함께 공정한 래플 캠페인을 운영하고, 브랜드 포인트를 더 많은 사용자에게 연결하세요.
          </p>

          <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-blue-600">
            캠페인 기획부터 운영, 검증 리포트까지 브랜드 성장을 함께 지원합니다.
          </p>

          <div className="mt-10 flex min-h-[56px] flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate("/partnership")}
              className="group inline-flex items-center gap-2 rounded-md bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 active:scale-[0.98]"
            >
              파트너십 확인하기
              <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onNavigate("/support/contact")}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-7 py-4 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98]"
            >
              제휴 문의하기
            </button>
          </div>
        </div>

        <PartnershipIllustration />
      </div>
    </div>
  );
}

/* ─── Hero ─── */
function Hero() {
  const go = useNav();
  const SLIDE_COUNT = 3;
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // 무한 루프: 마지막 클론 슬라이드 도달 시 순간이동
  useEffect(() => {
    if (activeSlide !== SLIDE_COUNT) return;
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setActiveSlide(0);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsTransitioning(true))
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeSlide]);

  const handleDotClick = (i: number) => {
    setIsTransitioning(true);
    setActiveSlide(i);
  };

  return (
    <section className="relative overflow-hidden bg-neutral-50">
      <div className="w-full pb-10 pt-20">
        <div className="overflow-hidden">
          <div
            className={`flex ${isTransitioning ? "transition-transform duration-1000 ease-in-out" : "transition-none"}`}
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {/* Slide 1 — 래플 */}
            <div className="w-full shrink-0">
              <RaffleHeroPanel onNavigate={go} />
            </div>
            {/* Slide 2 — 포인트 */}
            <div className="w-full shrink-0">
              <PointExchangePanel onNavigate={go} />
            </div>
            {/* Slide 3 — 파트너십 */}
            <div className="w-full shrink-0">
              <PartnershipPanel onNavigate={go} />
            </div>
            {/* Clone of Slide 1 for seamless loop */}
            <div className="w-full shrink-0">
              <RaffleHeroPanel onNavigate={go} />
            </div>
          </div>
        </div>

        {/* 슬라이드 인디케이터 */}
        <div className="mt-5 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`rounded-full transition-all duration-300 ${
                (activeSlide % SLIDE_COUNT) === i
                  ? "h-3 w-8 bg-blue-600"
                  : "h-3 w-3 bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>

        {/* 피처 스트립 */}
        <div className="mt-6 grid grid-cols-1 gap-5 rounded-[2rem] bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)] md:grid-cols-2 xl:grid-cols-4">
          {heroFeatures.map(({ title, desc, icon, path }) => (
            <button
              key={title}
              onClick={() => go(path)}
              className="flex items-center gap-4 rounded-2xl p-2 text-left transition hover:bg-neutral-50"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Icon name={icon} className="h-7 w-7" />
              </span>
              <span>
                <span className="block text-base font-black text-neutral-950">{title}</span>
                <span className="mt-1 block text-sm leading-6 text-neutral-500">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}



/* ─── ActiveRaffles ─── */
function ActiveRaffles() {
  const go = useNav();
  const sectionRef = useRef<HTMLElement>(null);
  const [darkProgress, setDarkProgress] = useState(0);

  // 래플 카드 자동 슬라이딩 (파일 2)
  const VISIBLE_COUNT = 3;
  const [activeRaffleIndex, setActiveRaffleIndex] = useState(0);
  const [isRafflePaused, setIsRafflePaused] = useState(false);
  const [isRaffleTransitioning, setIsRaffleTransitioning] = useState(true);
  const loopedRaffleItems = [...raffleItems, ...raffleItems.slice(0, VISIBLE_COUNT)];

  // 스크롤 다크 오버레이
  useEffect(() => {
    let ticking = false;
    const smoothStep = (v: number) => { const c = Math.max(0, Math.min(1, v)); return c * c * (3 - 2 * c); };
    const update = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const fadeDistance = vh * 0.22;
      const enterLine = vh * 0.34;
      const exitLine = vh * 0.66;

      const fadeIn = smoothStep((enterLine - rect.top) / fadeDistance);
      const fadeOut = smoothStep((rect.bottom - exitLine) / fadeDistance);

      setDarkProgress(Math.min(fadeIn, fadeOut));
      ticking = false;
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    return () => { window.removeEventListener("scroll", req); window.removeEventListener("resize", req); };
  }, []);

  // 래플 카드 자동 넘기기
  useEffect(() => {
    if (isRafflePaused) return;
    const interval = setInterval(() => {
      setActiveRaffleIndex((prev) => prev + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, [isRafflePaused]);

  // 무한 루프 리셋
  useEffect(() => {
    if (activeRaffleIndex !== raffleItems.length) return;
    const timer = setTimeout(() => {
      setIsRaffleTransitioning(false);
      setActiveRaffleIndex(0);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsRaffleTransitioning(true))
      );
    }, 700);
    return () => clearTimeout(timer);
  }, [activeRaffleIndex]);

  const primaryTextColor = darkProgress > 0.45 ? "#ffffff" : "#0a0a0a";
  const secondaryTextColor = darkProgress > 0.45 ? "#a3a3a3" : "#525252";
  const borderColor = `rgba(255,255,255,${0.1 + darkProgress * 0.16})`;

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-28" style={{ color: primaryTextColor }}>
      <div className="pointer-events-none fixed inset-0 z-30 bg-black transition-opacity duration-150" style={{ opacity: darkProgress * 0.76 }} />
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{ opacity: darkProgress, background: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.20), transparent 38%), radial-gradient(circle at 90% 40%, rgba(37,99,235,0.12), transparent 30%)" }}
      />
      <div className="relative z-40 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-black tracking-[0.3em] text-blue-500">INTERACTIVE EXPERIENCE</p>
            <h2 className="text-5xl font-black tracking-tight transition-colors duration-300" style={{ color: primaryTextColor }}>지금 응모 가능한 래플</h2>
            <p className="mt-4 transition-colors duration-300" style={{ color: secondaryTextColor }}>글로벌 브랜드의 한정 상품을 공정하게 응모해보세요.</p>
          </div>
          <button
            onClick={() => go("/raffles")}
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

        {/* 자동 슬라이딩 래플 카드 */}
        <div
          className="overflow-hidden px-2 py-3"
          onMouseEnter={() => setIsRafflePaused(true)}
          onMouseLeave={() => setIsRafflePaused(false)}
        >
          <div
            className={`flex gap-7 ${isRaffleTransitioning ? "transition-transform duration-700 ease-in-out" : "transition-none"}`}
            style={{
              transform: `translateX(calc(-${activeRaffleIndex} * (((100% - 56px) / 3) + 28px)))`,
            }}
          >
            {loopedRaffleItems.map((item, index) => (
              <article
                key={`${item.brand}-${index}`}
                className="w-[calc((100%_-_56px)/3)] shrink-0 overflow-hidden rounded-[28px] border border-neutral-200 bg-neutral-50 text-black shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_22px_55px_rgba(15,23,42,0.14)]"
                style={{
                  borderColor,
                }}
              >
                {/* <div
                  className="flex h-24 items-center justify-center border-b border-white/10 text-2xl font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}, #111827)`,
                  }}
                >
                  {item.logo}
                </div> */}
                <div
                  className="flex h-24 items-center justify-center border-b border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}, #111827)`,
                  }}
                >
                  <img
                    src={item.logo}
                    alt={item.brand}
                    className={`object-contain ${
                      item.brand === "Supreme"
                        ? "h-40 w-64"
                        : item.brand === "MUSINSA"
                        ? "h-40 w-64"
                        : item.brand === "NIKE"
                        ? "h-26 w-44"
                        : item.brand === "Adidas"
                        ? "h-30 w-44"
                        : item.brand === "New Balance"
                        ? "h-30 w-52"
                        : "h-16 w-44"
                    }`}
                  />
                </div>
                <div className="p-7">
                  <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-neutral-400">BRAND</p>
                  <h3 className="text-2xl font-black">{item.brand}</h3>
                  <p className="mt-3 min-h-12 text-lg font-bold leading-snug text-neutral-900">{item.title}</p>
                  <div className="my-6 h-px bg-neutral-200" />
                  <div className="space-y-3 text-sm font-medium text-neutral-700">
                    <div className="flex items-center gap-3"><Icon name="users" className="h-4 w-4 text-blue-600" />참여자 {item.participants}</div>
                    <div className="flex items-center gap-3"><Icon name="calendar" className="h-4 w-4 text-blue-600" />{item.days} 마감</div>
                    <div className="flex items-center gap-3"><Icon name="gift" className="h-4 w-4 text-blue-600" />{item.prize}</div>
                  </div>
                  <button
                    onClick={() => go("/raffles")}
                    className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-4 text-sm font-black text-white shadow-[0_8px_22px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 active:scale-[0.98]"
                  >
                    추첨 참여하기
                    <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}




/* ─── TrustIndicators (Social Proof) ─── */
function TrustIndicators() {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50 py-20">
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
        {/* Partner brand logos row */}
        <div className="mt-14 text-center">
          <p className="mb-6 text-xs font-black tracking-[0.3em] text-neutral-400">PARTNER BRANDS</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* {partnerBrands.map((brand) => (
              <span key={brand} className="rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-black text-neutral-700 shadow-sm">
                {brand}
              </span>
            ))} */}
            {partnerBrands.map((brand) => (
              <span
                key={brand.name}
                className="flex h-24 w-60 items-center justify-center rounded-3xl border border-neutral-200 bg-white shadow-sm"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className={`object-contain ${
                    brand.name === "CONVERSE"
                      ? "h-8 w-28"
                      : brand.name === "SUPREME"
                      ? "h-10 w-28"
                      : brand.name === "MUSINSA"
                      ? "h-14 w-14"
                      : "h-12 w-20"
                  }`}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── HowItWorks ─── */
function HowItWorks() {
  const go = useNav();

  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-black tracking-[0.3em] text-blue-600">HOW IT WORKS</p>
          <h2 className="text-4xl font-black tracking-tight text-neutral-950 md:text-5xl">3단계로 완성되는 공정한 래플</h2>
          <p className="mt-4 text-neutral-500">응모부터 결과 공개까지, 모든 과정이 블록체인에 기록됩니다.</p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-[3.5rem] hidden h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent md:block" />

          {howItWorksSteps.map((step, idx) => (
            <div key={step.step} className="relative flex flex-col items-center text-center">
              {/* step number + icon */}
              <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-full border-2 border-blue-100 bg-white shadow-[0_8px_32px_rgba(37,99,235,0.12)]">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Icon name={step.icon} className="h-9 w-9" />
                </div>
                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-xs font-black text-white">
                  {idx + 1}
                </span>
              </div>

              <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black tracking-[0.18em] text-blue-600">
                {step.badge}
              </div>
              <h3 className="mb-3 text-2xl font-black text-neutral-950">{step.title}</h3>
              <p className="text-sm leading-7 text-neutral-500">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <button
            onClick={() => go("/raffles")}
            className="group inline-flex items-center gap-2 rounded-md bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(37,99,235,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 active:scale-[0.98]"
          >
            지금 래플 참여하기
            <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}



/* ─── PartnerBrands ─── */
function PartnerBrands() {
  const go = useNav();
  const marqueeBrands = [...partnerBrands, ...partnerBrands];

  return (
    <section className="overflow-hidden bg-white py-24">
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
          {/* {marqueeBrands.map((brand, i) => (
            <button
              key={`${brand}-${i}`}
              onClick={() => go("/brands")}
              className="flex h-24 min-w-[240px] items-center justify-center rounded-3xl border border-neutral-200 bg-white px-10 text-2xl font-black tracking-tight text-neutral-950 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >
              {brand}
            </button>
          ))} */}
          {marqueeBrands.map((brand, i) => (
            <button
              key={`${brand.name}-${i}`}
              onClick={() => go("/brands")}
              className="flex h-28 w-[260px] items-center justify-center rounded-xl border border-neutral-200 bg-white px-8 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-12 w-auto max-w-[180px] object-contain"
              />
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes brand-marquee-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .brand-marquee { animation: brand-marquee-scroll 28s linear infinite; padding-left: 2rem; }
        .brand-marquee:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
}

/* ─── WhyUs ─── */
function WhyUs() {
  const go = useNav();

  const competitors = [
    { label: "블록체인 추첨 검증", nofake: true, others: false },
    { label: "실시간 결과 공개", nofake: true, others: false },
    { label: "중복 참여 원천 차단", nofake: true, others: false },
    { label: "브랜드 공식 캠페인", nofake: true, others: true },
    { label: "포인트 통합 관리", nofake: true, others: false },
    { label: "수령 인증 시스템", nofake: true, others: false },
  ];

  return (
    <section className="bg-neutral-50 py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-black tracking-[0.3em] text-blue-600">WHY NOFAKE</p>
          <h2 className="text-4xl font-black tracking-tight text-neutral-950 md:text-5xl">
            블록체인 기반 공정성,<br />경쟁사와의 차별점
          </h2>
          <p className="mt-4 text-neutral-500">공정성은 약속이 아니라 기술로 증명합니다.</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* Why us cards */}
          <div className="grid gap-5 sm:grid-cols-2">
            {whyUsPoints.map((point) => (
              <div key={point.title} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon name={point.icon} className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-base font-black text-neutral-950">{point.title}</h3>
                <p className="text-sm leading-7 text-neutral-500">{point.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 border-b border-neutral-100 bg-neutral-50 px-6 py-4">
              <span className="text-sm font-black text-neutral-500">기능</span>
              <span className="text-center text-sm font-black text-blue-600">nofake</span>
              <span className="text-center text-sm font-black text-neutral-400">경쟁사</span>
            </div>
            {competitors.map((row, i) => (
              <div key={row.label} className={`grid grid-cols-3 items-center px-6 py-4 ${i !== competitors.length - 1 ? "border-b border-neutral-100" : ""}`}>
                <span className="text-sm font-semibold text-neutral-700">{row.label}</span>
                <span className="flex justify-center">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${row.nofake ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-400"}`}>
                    <Icon name={row.nofake ? "check" : "x"} className="h-4 w-4" />
                  </span>
                </span>
                <span className="flex justify-center">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${row.others ? "bg-neutral-200 text-neutral-700" : "bg-neutral-100 text-neutral-300"}`}>
                    <Icon name={row.others ? "check" : "x"} className="h-4 w-4" />
                  </span>
                </span>
              </div>

            ))}
            <div className="border-t border-neutral-100 bg-blue-50 px-6 py-4">
              <button
                onClick={() => go("/about/fairness")}
                className="group flex items-center gap-2 text-sm font-black text-blue-600 transition hover:gap-3"
              >
                공정성 시스템 자세히 보기
                <Icon name="arrow" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── TechnologyStack ─── */
function TechnologyStack() {
  const go = useNav();
  const [activeTechIndex, setActiveTechIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTechIndex((c) => (c + 1) % techStack.length), 3200);
    return () => clearInterval(t);
  }, []);

  const activeTech = techStack[activeTechIndex];

  return (
    <section className="border-y border-neutral-200 bg-neutral-50 py-24">
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
                <p className="mb-4 text-xs font-black tracking-[0.24em] text-blue-600">0{activeTechIndex + 1} / 04</p>
                <h3 className="text-4xl font-black tracking-tight text-neutral-950">{activeTech.title}</h3>
                <p className="mt-5 text-lg leading-8 text-neutral-600">{activeTech.desc}</p>
              </div>
            </div>
            <div className="relative mt-10 flex items-center justify-center gap-3">
              {techStack.map((item, i) => (
                <button key={item.title} onClick={() => setActiveTechIndex(i)} className="group flex h-8 w-8 items-center justify-center rounded-full">
                  <span className={`block rounded-full transition-all duration-300 ${activeTechIndex === i ? "h-3 w-8 bg-blue-600" : "h-3 w-3 bg-neutral-300 group-hover:bg-neutral-500"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 text-center">
          <button
            onClick={() => go("/about/fairness")}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-7 py-4 text-sm font-bold text-neutral-900 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
          >
            공정성 더 알아보기
            <Icon name="arrow" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes tech-fade { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        .animate-tech-fade { animation: tech-fade 0.45s ease-out both; }
      `}</style>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => {
    setVisible(false);
    setTimeout(() => {
      setActiveIdx(i);
      setVisible(true);
    }, 320);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      goTo((activeIdx + 1) % testimonials.length);
    }, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeIdx, goTo]);

  const t = testimonials[activeIdx];

  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-black tracking-[0.3em] text-blue-600">WINNER STORIES</p>
          <h2 className="text-4xl font-black tracking-tight text-neutral-950 md:text-5xl">당첨자 후기 &amp; 수령 인증</h2>
          <p className="mt-4 text-neutral-500">실제 당첨자들이 직접 전하는 nofake 경험입니다.</p>
        </div>

        {/* Main layout: big card left, mini cards right */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

          {/* Featured card with opacity fade */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.32s ease, transform 0.32s ease",
            }}
            className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-50 blur-3xl" />

            {/* Quote mark */}
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M11.3 6C8 6.9 6 9.1 6 12.1V18h5v-6H8.5c0-2 1-3.5 3-4.5L11.3 6zm7 0C15 6.9 13 9.1 13 12.1V18h5v-6h-2.5c0-2 1-3.5 3-4.5L18.3 6z" />
              </svg>
            </div>

            <p className="relative text-xl font-semibold leading-9 text-neutral-800">
              {t.text}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
                  style={{ backgroundColor: t.color }}
                >
                  <img
                    src={t.productImg}
                    alt={t.brand}
                    className="h-24 w-24 object-contain"
                  />
                </div>
                <div>
                  <p className="text-base font-black text-neutral-950">{t.name}</p>
                  <p className="text-sm text-neutral-400">{t.handle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
                <Icon name="check" className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-black text-blue-600">수령 인증 완료</span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-neutral-100 bg-neutral-50 px-5 py-3">
              <span className="text-xs font-bold text-neutral-400">당첨 상품 · </span>
              <span className="text-xs font-black text-neutral-700">{t.brand}</span>
            </div>

            {/* Dots inside card */}
            <div className="mt-6 flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: activeIdx === i ? "2rem" : "0.75rem",
                    height: "0.75rem",
                    backgroundColor: activeIdx === i ? "#2563EB" : "#D4D4D4",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Mini cards stacked vertically */}
          <div className="flex flex-col gap-4">
            {testimonials.map((item, i) => (
              <button
                key={item.handle}
                onClick={() => goTo(i)}
                className="flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  borderColor: activeIdx === i ? "#BFDBFE" : "#E5E5E5",
                  backgroundColor: activeIdx === i ? "#EFF6FF" : "#FFFFFF",
                  boxShadow: activeIdx === i ? "0 4px 18px rgba(37,99,235,0.10)" : "none",
                }}
              >
                {/* Avatar */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow"
                  style={{ backgroundColor: item.color }}
                >
                  <img
                    src={item.productImg}
                    alt={item.brand}
                    className="h-16 w-16 object-contain"
                  />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-neutral-950">{item.name}</p>
                    {item.verified && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">
                        <Icon name="check" className="h-3 w-3" />
                        인증
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-400">{item.handle}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{item.text}</p>
                  <p className="mt-2 text-xs font-bold text-blue-600">{item.brand}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


/* ─── PartnershipCTA ─── */
function PartnershipCTA() {
  const go = useNav();

  return (
    <section className="relative overflow-hidden bg-[#071226] py-28 text-center text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.28),transparent_50%)]" />
      <div className="relative mx-auto max-w-3xl px-6">
        <Icon name="globe" className="mx-auto mb-6 h-12 w-12 text-blue-500" />
        <p className="mb-4 text-xs font-black tracking-[0.3em] text-blue-400">FINAL CTA</p>
        <h2 className="text-4xl font-black tracking-tight md:text-5xl">공정한 래플 문화를 만들어갑니다</h2>
        <p className="mx-auto mt-5 max-w-2xl px-6 leading-8 text-slate-400">
          nofake는 투명한 검증 시스템과 브랜드 캠페인 운영 경험을 바탕으로 신뢰할 수 있는 래플 생태계를 지향합니다.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => go("/raffles")}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            추첨 참여하기 <Icon name="arrow" className="h-4 w-4" />
          </button>
          <button
            onClick={() => go("/partnership")}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/5"
          >
            파트너십 문의 <Icon name="users" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes tech-fade { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        .animate-tech-fade { animation: tech-fade 0.45s ease-out both; }
      `}</style>
    </section>
  );
}


/* ─── FloatingChat ─── */
function FloatingChat() {
  const go = useNav();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
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
          <button
            onClick={() => { go("/support/contact"); setOpen(false); }}
            className="mt-4 w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white transition hover:bg-blue-700"
          >
            문의하기
          </button>
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1"><Icon name="mail" className="h-3 w-3" /> partnership@nofake.io</span>
            <span className="flex items-center gap-1"><Icon name="phone" className="h-3 w-3" /> 1533-2771</span>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:bg-blue-700"
        aria-label="문의하기"
      >
        <Icon name={open ? "x" : "message"} className="h-6 w-6" />
      </button>
    </div>
  );
}

/* ─── Home (export) ─── */
export function Home() {
  useEffect(() => {
    document.title = "nofake | 공정한 래플 플랫폼";
  }, []);

  return (
    <main className="min-h-screen bg-white font-sans text-neutral-950">

      {/* 1. Hero — 래플 플랫폼 소개 + 참여하기 버튼 */}
      <Hero />
      {/* 2. Social Proof — 1,200+ 캠페인, 파트너 브랜드 로고 */}
      <TrustIndicators />
      {/* 3. 핵심 기능 — 래플 / 포인트 교환 / 파트너십 카드 (ActiveRaffles에 통합) */}
      {/* 4. How it works — 응모→추첨→결과 공개 3단계 */}
      <HowItWorks />
      {/* 5. 실제 콘텐츠 — 현재 진행중인 래플 카드 */}
      <ActiveRaffles />
      {/* Partner brand marquee */}
      <PartnerBrands />
      {/* 6. Why us — 블록체인 기반 공정성 (경쟁사와 차별점) */}
      <WhyUs />
      {/* Technology stack */}
      <TechnologyStack />
      {/* 7. 후기 — 당첨자 후기, 수령 인증 */}
      <Testimonials />
      {/* 8. 최종 CTA — 래플 참여 or 파트너십 문의 */}
      <PartnershipCTA />
      <FloatingChat />
    </main>
  );
}