import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { AlertCircle, CalendarDays, Loader2, LogIn, Search, Ticket, Users } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { useAuthUser } from "../../components/Header"; // 기존 Header에서 export된 훅 사용

interface ApiRaffle {
  id: number;
  title: string;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  participants?: number;
  maxParticipants?: number;
  status?: string;
  hasParticipated?: boolean;
  walletAddress?: string | null; // 유저별 지갑 주소
}

interface RaffleItem {
  id: number;
  brand: string;
  title: string;
  category: string;
  image: string;
  entryPeriod: string;
  participants: number;
  status: string;
  hasParticipated: boolean;
}

const CATEGORY_MAP: Record<string, string> = {
  all: "전체",
  sneakers: "스니커즈",
  clothing: "의류",
  accessories: "액세서리",
  limited: "한정판",
};

const CATEGORY_TO_QUERY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([key, value]) => [value, key]),
);

const fallbackItems: RaffleItem[] = [
  {
    id: 1,
    brand: "Nike",
    title: "Jordan 1 High OG Chicago",
    category: "스니커즈",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    entryPeriod: "2026.05.06 - 2026.05.10",
    participants: 24512,
    status: "MINTING",
    hasParticipated: false,
  },
  {
    id: 2,
    brand: "Adidas",
    title: "Yeezy Boost 350 V2 Onyx",
    category: "스니커즈",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
    entryPeriod: "2026.05.07 - 2026.05.12",
    participants: 12105,
    status: "MINTING",
    hasParticipated: false,
  },
  {
    id: 3,
    brand: "Supreme",
    title: "Box Logo Hoodie Grey",
    category: "의류",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
    entryPeriod: "2026.05.06 - 2026.05.09",
    participants: 15456,
    status: "MINTING",
    hasParticipated: false,
  },
  {
    id: 4,
    brand: "Gucci",
    title: "GG Marmont Shoulder Bag",
    category: "액세서리",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
    entryPeriod: "2026.05.06 - 2026.05.10",
    participants: 3320,
    status: "MINTING",
    hasParticipated: false,
  },
  {
    id: 5,
    brand: "Medicom Toy",
    title: "Be@rbrick Supreme 1000%",
    category: "한정판",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    entryPeriod: "2026.05.10 - 2026.05.20",
    participants: 7122,
    status: "MINTING",
    hasParticipated: false,
  },
];

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const toRaffleItem = (raffle: ApiRaffle): RaffleItem => {
  const [brand, ...titleParts] = raffle.title.split(" ");
  const start = formatDate(raffle.startAt);
  const end = formatDate(raffle.endAt);

  return {
    id: raffle.id,
    brand: brand || "NOFAKE",
    title: titleParts.join(" ") || raffle.title,
    category: raffle.category || "한정판",
    image: raffle.imageUrl || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    entryPeriod: start && end ? `${start} - ${end}` : "일정 확인 중",
    participants: Number(raffle.participants || 0),
    status: raffle.status || "READY",
    hasParticipated: Boolean(raffle.hasParticipated),
  };
};

export const RafflesPage = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const user = useAuthUser();

  const [items, setItems] = useState<RaffleItem[]>(fallbackItems);
  const [productKeyword, setProductKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "info" | "success" | "error"; message: string } | null>(null);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  // 유저 이메일을 지갑 주소로 사용 (실제 서비스에서는 별도 walletAddress 필드 사용)
  const userWalletAddress = user?.email ?? null;

  const currentCategoryKey = useMemo(() => {
    const query = new URLSearchParams(search).get("category") || "all";
    return CATEGORY_MAP[query] ? query : "all";
  }, [search]);

  const selectedLabel = CATEGORY_MAP[currentCategoryKey];

  const loadRaffles = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const raffles = await apiRequest<ApiRaffle[]>("/api/raffles");
      setItems(raffles.length ? raffles.map(toRaffleItem) : fallbackItems);
      if (!raffles.length) {
        setNotice({ type: "info", message: "백엔드에 등록된 래플이 없어 샘플 목록을 보여주고 있습니다." });
      }
    } catch (error) {
      setItems(fallbackItems);
      setNotice({
        type: "info",
        message: error instanceof Error ? error.message : "백엔드 연결에 실패해 샘플 목록을 보여주고 있습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRaffles();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = appliedKeyword.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = currentCategoryKey === "all" || item.category === selectedLabel;
      const target = `${item.brand} ${item.title} ${item.category}`.toLowerCase();
      const matchesKeyword = !keyword || target.includes(keyword);
      return matchesCategory && matchesKeyword;
    });
  }, [appliedKeyword, currentCategoryKey, items, selectedLabel]);

  const handleSearch = () => {
    setAppliedKeyword(productKeyword);
  };

  const handleJoin = async (raffle: RaffleItem) => {
    // 비로그인 상태: 로그인 페이지로 유도
    if (!user || !userWalletAddress) {
      setNotice({ type: "error", message: "래플 참여는 로그인 후 이용할 수 있습니다." });
      return;
    }

    setJoiningId(raffle.id);
    setNotice(null);
    try {
      await apiRequest("/api/mint", {
        method: "POST",
        body: {
          raffleId: raffle.id,
          userAddress: userWalletAddress,
        },
      });
      setNotice({ type: "success", message: `${raffle.brand} ${raffle.title} 응모가 완료되었습니다.` });
      await loadRaffles();
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "응모 요청에 실패했습니다.",
      });
    } finally {
      setJoiningId(null);
    }
  };

  const noticeColors = {
    info: "bg-blue-50 text-blue-800",
    success: "bg-green-50 text-green-800",
    error: "bg-red-50 text-red-700",
  };

  return (
    <main className="min-h-screen bg-white px-5 pb-16 pt-28 font-sans sm:px-10">
      <section className="mx-auto mb-8 flex max-w-7xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">NOFAKE raffles</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-gray-950">래플 이벤트</h1>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <div className="relative min-w-0 sm:w-[460px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={productKeyword}
              onChange={(event) => setProductKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              placeholder="상품명 또는 브랜드 검색"
              className="h-12 w-full rounded-xl border border-gray-200 py-0 pl-12 pr-4 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>
          <button
            onClick={handleSearch}
            className="h-12 rounded-xl bg-gray-950 px-6 text-base font-bold text-white transition-colors hover:bg-gray-800"
          >
            조회
          </button>
        </div>
      </section>

      <nav className="mx-auto mb-8 flex max-w-7xl gap-7 overflow-x-auto border-b border-gray-100">
        {Object.values(CATEGORY_MAP).map((label) => (
          <button
            key={label}
            onClick={() => navigate(`/raffles?category=${CATEGORY_TO_QUERY[label]}`)}
            className={`relative whitespace-nowrap pb-4 text-sm font-bold transition-colors ${
              selectedLabel === label ? "text-black" : "text-gray-300 hover:text-gray-500"
            }`}
          >
            {label}
            {selectedLabel === label && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-black" />}
          </button>
        ))}
      </nav>

      {notice && (
        <div
          className={`mx-auto mb-8 flex max-w-7xl items-center gap-2 rounded-lg px-4 py-3 text-sm ${noticeColors[notice.type]}`}
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{notice.message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-80 items-center justify-center text-gray-500">
          <Loader2 className="mr-2 animate-spin" size={18} />
          래플을 불러오는 중입니다.
        </div>
      ) : filteredItems.length ? (
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <article key={item.id} className="flex flex-col">
              <div className="relative mb-5 aspect-square overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <span className="mb-1.5 text-xs font-black uppercase tracking-wider text-black">{item.brand}</span>
              <h2 className="mb-3 min-h-10 text-sm font-medium leading-tight text-gray-800">{item.title}</h2>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-400">
                <CalendarDays size={13} />
                {item.entryPeriod}
              </div>
              <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-gray-500">
                <Users size={13} />
                현재 {item.participants.toLocaleString()}명 응모 중
              </div>
              <button
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                  } else {
                    handleJoin(item);
                  }
                }}
                disabled={
                  joiningId === item.id ||
                  (!!user && (item.hasParticipated || item.status !== "MINTING"))
                }
                className="mt-auto flex h-12 items-center justify-center gap-2 rounded-lg bg-black text-sm font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {joiningId === item.id ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : !user ? (
                  <LogIn size={16} />
                ) : (
                  <Ticket size={16} />
                )}
                {joiningId === item.id
                  ? "처리 중..."
                  : item.hasParticipated
                  ? "응모 완료"
                  : item.status !== "MINTING"
                  ? "대기 중"
                  : !user
                  ? "로그인 필요"
                  : "참여하기"}
              </button>
            </article>
          ))}
        </section>
      ) : (
        <div className="mx-auto flex min-h-80 max-w-7xl items-center justify-center rounded-2xl border border-dashed border-gray-200 text-gray-500">
          검색 조건에 맞는 상품이 없습니다.
        </div>
      )}
    </main>
  );
};