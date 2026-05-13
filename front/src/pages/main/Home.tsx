import { ArrowRight, BarChart3, CheckCircle2, Database, LockKeyhole, ShieldCheck, Sparkles, Ticket, Users } from "lucide-react";
import { Link } from "react-router";
import { useEffect } from "react";

const stats = [
  { value: "1,200+", label: "성공 캠페인" },
  { value: "50만+", label: "활성 사용자" },
  { value: "99.9%", label: "서비스 안정성" },
];

const features = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "검증 가능한 추첨",
    desc: "래플 등록부터 결과 공개까지 주요 데이터를 검증 가능한 방식으로 기록합니다.",
  },
  {
    icon: <LockKeyhole className="h-6 w-6" />,
    title: "부정 참여 방지",
    desc: "지갑 주소와 참여 이력을 기준으로 중복 응모를 막고 공정성을 높입니다.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "캠페인 운영 지표",
    desc: "조회, 응모, 이탈 데이터를 캠페인 단위로 확인할 수 있습니다.",
  },
];

const raffleCards = [
  {
    brand: "Nike",
    title: "Jordan 1 High OG Chicago",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    status: "진행 중",
  },
  {
    brand: "Adidas",
    title: "Yeezy Boost 350 V2 Onyx",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
    status: "진행 중",
  },
  {
    brand: "Supreme",
    title: "Box Logo Hoodie Grey",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    status: "오픈 예정",
  },
];

function SEOMeta() {
  useEffect(() => {
    document.title = "nofake | 공정한 래플 플랫폼";

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta(
      "description",
      "nofake는 브랜드와 사용자가 신뢰할 수 있는 블록체인 기반 공정 래플 플랫폼입니다.",
    );
    setMeta("keywords", "래플 플랫폼, 블록체인 추첨, 공정 래플, 브랜드 캠페인");
  }, []);

  return null;
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_18%_18%,#60a5fa_0,#2563eb_28%,#7c3aed_58%,#db2777_100%)] pt-28 text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      <div className="mx-auto grid min-h-[720px] max-w-7xl grid-cols-1 items-center gap-14 px-5 pb-20 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
        <div className="max-w-3xl text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur">
            <Sparkles className="h-4 w-4 text-yellow-200" />
            Enterprise Raffle Platform
          </div>

          <h1 className="m-0 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-7xl">
            블록체인으로 증명하는
            <span className="mt-2 block text-yellow-100">공정한 래플</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
            Hyperledger Fabric 기반의 투명한 추첨 기록, 참여 관리, 캠페인 분석을 하나의 운영 화면에서
            제공합니다.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/raffles"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-black text-blue-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              래플 보러가기
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/partnership"
              className="inline-flex h-13 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 text-base font-bold text-white backdrop-blur transition hover:bg-white/15"
            >
              파트너십 문의
            </Link>
          </div>

          <div className="mt-14 grid max-w-2xl grid-cols-3 gap-3 sm:gap-5">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-black sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-xs font-semibold text-white/70 sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="absolute -left-5 top-8 hidden rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur-xl lg:block">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
                <Database className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-black">검증 기록</div>
                <div className="text-xs text-white/70">모든 응모 이력 추적</div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/20 bg-white/13 p-4 shadow-2xl backdrop-blur-xl">
            <div className="overflow-hidden rounded-[1.5rem] bg-white text-gray-950">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-600">Live Raffle</div>
                  <div className="mt-1 text-lg font-black">Jordan 1 High OG</div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">MINTING</span>
              </div>
              <div className="grid grid-cols-[1fr_.9fr] gap-4 p-5">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
                  alt="Jordan sneakers"
                  className="aspect-square rounded-2xl object-cover"
                />
                <div className="flex flex-col justify-between">
                  <div className="space-y-3">
                    {["응모 등록", "중복 검증", "추첨 대기"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="text-xs font-bold text-gray-400">참여자</div>
                    <div className="mt-1 text-2xl font-black">24,512명</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-7 right-0 rounded-2xl border border-white/20 bg-white/14 p-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-purple-600">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-black">50만+ 사용자</div>
                <div className="text-xs text-white/70">브랜드 캠페인 확장</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left">
          <p className="text-sm font-black uppercase tracking-widest text-blue-600">Why nofake</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            래플 운영에 필요한 핵심 기능을 한 화면에
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            사용자는 공정하게 참여하고, 브랜드는 운영 데이터를 명확하게 확인할 수 있습니다.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-7 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                {feature.icon}
              </div>
              <h3 className="mt-6 text-xl font-black text-gray-950">{feature.title}</h3>
              <p className="mt-3 leading-7 text-gray-600">{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RafflePreview() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 text-left md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-600">Current Raffles</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              지금 응모 가능한 래플
            </h2>
          </div>
          <Link to="/raffles" className="inline-flex items-center gap-2 text-sm font-black text-blue-600">
            전체 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {raffleCards.map((raffle) => (
            <article key={raffle.title} className="overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm">
              <img src={raffle.image} alt={raffle.title} className="aspect-[4/3] w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">{raffle.brand}</span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">{raffle.status}</span>
                </div>
                <h3 className="mt-3 min-h-14 text-lg font-black leading-7 text-gray-950">{raffle.title}</h3>
                <button className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 text-sm font-black text-white hover:bg-gray-800">
                  <Ticket className="h-4 w-4" />
                  참여하기
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-gray-950 px-6 py-14 text-center text-white sm:px-10">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">공정한 래플 캠페인을 시작하세요</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-300">
            브랜드 캠페인 설계부터 응모 관리, 결과 검증까지 nofake가 함께합니다.
          </p>
          <Link
            to="/partnership"
            className="mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-white px-7 font-black text-gray-950"
          >
            파트너십 문의
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Home() {
  return (
    <main className="bg-white">
      <SEOMeta />
      <Hero />
      <FeatureSection />
      <RafflePreview />
      <CTASection />
    </main>
  );
}
