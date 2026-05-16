import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ArrowLeftRight,
  Building,
  ChevronDown,
  Eye,
  Gift,
  Handshake,
  HeadphonesIcon,
  HelpCircle,
  History,
  Info,
  LogOut,
  Menu,
  Scale,
  Settings,
  ShieldCheck,
  Ticket,
  User,
  X,
} from "lucide-react";

const LOGIN_TOKEN_KEY = "nofakeAccessToken";
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ??
  "https://outrage-overboard-unrevised.ngrok-free.dev";

// ─── 전역 인증 상태 ───────────────────────────────────────────────────────────

let _user: { name: string; email: string } | null = null;

export function loginUser(user: { name: string; email: string }) {
  _user = user;
  window.dispatchEvent(new Event("auth-change"));
}

export function logoutUser() {
  _user = null;
  localStorage.removeItem(LOGIN_TOKEN_KEY);
  window.dispatchEvent(new Event("auth-change"));
}

export function useAuthUser() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(_user);

  useEffect(() => {
    const handleAuthSync = () => {
      setUser(_user ? { ..._user } : null);
    };
    handleAuthSync();
    window.addEventListener("auth-change", handleAuthSync);
    return () => window.removeEventListener("auth-change", handleAuthSync);
  }, []);

  return user;
}

// ─── 앱 시작 시 토큰으로 유저 정보 복원 ──────────────────────────────────────

(async () => {
  const token = localStorage.getItem(LOGIN_TOKEN_KEY);
  if (!token) {
    if (_user !== null) logoutUser();
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "69420",
      },
    });
    if (!res.ok) { logoutUser(); return; }
    const data = (await res.json()) as { success: boolean; name?: string; email?: string };
    if (data.success && data.name) {
      loginUser({ name: data.name, email: data.email ?? "" });
    } else {
      logoutUser();
    }
  } catch {
    // 네트워크 오류 시 무시
  }
})();

// ─── 네비게이션 데이터 ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    name: "서비스 소개",
    path: "/about",
    dropdown: {
      sections: [
        {
          title: "서비스 소개",
          items: [
            { icon: <Info className="h-4 w-4" />, name: "nofake 소개", desc: "공정한 래플 플랫폼 nofake", path: "/about" },
            { icon: <Building className="h-4 w-4" />, name: "회사 소개", desc: "nofake를 만드는 사람들", path: "/company" },
          ],
        },
        {
          title: "핵심 가치",
          items: [
            { icon: <Scale className="h-4 w-4" />, name: "공정성", desc: "조작 없는 추첨 시스템", path: "/about/fairness" },
            { icon: <Eye className="h-4 w-4" />, name: "투명성", desc: "모든 트랜잭션 검증", path: "/about/transparency" },
            { icon: <ShieldCheck className="h-4 w-4" />, name: "신뢰", desc: "데이터 무결성 보장", path: "/about/trust" },
          ],
        },
      ],
    },
  },
  {
    name: "래플 이벤트",
    path: "/raffles",
    dropdown: {
      sections: [
        {
          title: "래플 소개",
          items: [
            { icon: <Ticket className="h-4 w-4" />, name: "nofake 래플", desc: "블록체인 기반 추첨 시스템", path: "/raffles" },
          ],
        },
        {
          title: "카테고리",
          items: [
            { name: "스니커즈", path: "/raffles?category=sneakers" },
            { name: "의류", path: "/raffles?category=clothing" },
            { name: "액세서리", path: "/raffles?category=accessories" },
            { name: "한정판", path: "/raffles?category=limited" },
          ],
        },
      ],
    },
  },
  {
    name: "포인트 거래",
    path: "/point-swap",
    dropdown: {
      sections: [
        {
          title: "포인트 교환",
          items: [
            { icon: <ArrowLeftRight className="h-4 w-4" />, name: "포인트 교환", desc: "파트너 포인트로 교환", path: "/point-swap" },
          ],
        },
        {
          title: "파트너",
          items: [
            { name: "Nike", path: "/point-swap?partner=nike" },
            { name: "무신사", path: "/point-swap?partner=musinsa" },
            { name: "Adidas", path: "/point-swap?partner=adidas" },
            { name: "기프트카드", path: "/point-swap?partner=giftcard" },
          ],
        },
      ],
    },
  },
  {
    name: "고객센터",
    path: "/support",
    dropdown: {
      sections: [
        {
          title: "고객 지원",
          items: [
            { icon: <HeadphonesIcon className="h-4 w-4" />, name: "1:1 문의", desc: "담당자가 답변해드립니다.", path: "/support" },
            { icon: <HelpCircle className="h-4 w-4" />, name: "FAQ", desc: "자주 묻는 질문", path: "/faq" },
          ],
        },
        {
          title: "안내",
          items: [
            { name: "공지사항", path: "/notice" },
            { name: "이용약관", path: "/terms" },
            { name: "개인정보처리방침", path: "/privacy" },
          ],
        },
      ],
    },
  },
  {
    name: "파트너십",
    path: "/partnership",
    dropdown: {
      sections: [
        {
          title: "파트너십 소개",
          items: [
            { icon: <Handshake className="h-4 w-4" />, name: "브랜드 파트너십", desc: "nofake와 캠페인 시작", path: "/partnership" },
          ],
        },
        {
          title: "혜택",
          items: [
            { name: "고객 접근", path: "/partnership/audience" },
            { name: "매니저 지원", path: "/partnership/manager" },
            { name: "빠른 론칭", path: "/partnership/launch" },
            { name: "파트너 현황", path: "/partnership/status" },
          ],
        },
      ],
    },
  },
];

const MY_MENU = [
  { icon: <History className="h-4 w-4" />, name: "래플 내역", path: "/mypage" },
  { icon: <Gift className="h-4 w-4" />, name: "포인트", path: "/mypage?tab=points" },
  { icon: <ArrowLeftRight className="h-4 w-4" />, name: "포인트 교환", path: "/point-swap" },
];

// ─── Header 컴포넌트 ──────────────────────────────────────────────────────────

export function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const user = useAuthUser();
  const avatarInitial = user?.name ? user.name[0] : "U";

  // 경로 변경 시 메뉴 닫기
  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // 외부 클릭 시 유저 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(name);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 120);
  };

  const handleLogout = () => {
    logoutUser();
    setIsUserMenuOpen(false);
    setOpenDropdown(null);
    navigate("/");
  };

  const isActiveNav = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-sky-100 bg-sky-100/60 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-6">

          {/* 로고 */}
          <Link to="/" className="flex shrink-0 items-center">
            <span className="text-2xl font-black tracking-tight text-gray-950">
              nofake
            </span>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden min-w-0 items-center justify-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    isActiveNav(item.path)
                      ? "text-blue-600"
                      : "text-gray-700 hover:bg-blue-100/60 hover:text-blue-600"
                  }`}
                >
                  {item.name}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`}
                  />
                </button>

                {openDropdown === item.name && item.dropdown && (
                  <div className="absolute left-1/2 top-full mt-3 w-[640px] -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-xl">
                    <div className="grid grid-cols-2 gap-7 p-5">
                      {item.dropdown.sections.map((section, si) => (
                        <div key={si}>
                          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                            {section.title}
                          </p>
                          {"icon" in section.items[0] ? (
                            <div className="space-y-1">
                              {section.items.map((subItem: any, ii) => (
                                <Link
                                  key={ii}
                                  to={subItem.path}
                                  onClick={() => setOpenDropdown(null)}
                                  className="group flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-gray-50"
                                >
                                  {subItem.icon && (
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                                      {subItem.icon}
                                    </span>
                                  )}
                                  <span className="min-w-0">
                                    <span className="block text-sm font-bold text-gray-950 group-hover:text-blue-600">
                                      {subItem.name}
                                    </span>
                                    {subItem.desc && (
                                      <span className="mt-0.5 block whitespace-nowrap text-xs leading-5 text-gray-500">
                                        {subItem.desc}
                                      </span>
                                    )}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-1">
                              {section.items.map((subItem: any, ii) => (
                                <Link
                                  key={ii}
                                  to={subItem.path}
                                  onClick={() => setOpenDropdown(null)}
                                  className="rounded-lg px-2 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600"
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* 데스크탑 우측 */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-blue-100/60"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                    {avatarInitial}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      {user.email && (
                        <p className="mt-0.5 truncate text-xs text-gray-400">{user.email}</p>
                      )}
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/mypage"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600"
                      >
                        <User className="h-4 w-4" />
                        마이페이지
                      </Link>
                      <Link
                        to="/mypage?tab=points"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600"
                      >
                        <Gift className="h-4 w-4" />
                        포인트
                      </Link>
                      <Link
                        to="/mypage?tab=settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600"
                      >
                        <Settings className="h-4 w-4" />
                        설정
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 p-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-5 py-2 text-sm font-semibold text-gray-800 transition-colors hover:border-blue-300 hover:bg-blue-50"
              >
                <User className="h-3.5 w-3.5" />
                로그인
              </Link>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="justify-self-end p-1 text-gray-900 md:hidden"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-blue-100 bg-white shadow-lg md:hidden">
          <div className="space-y-1 px-4 py-3">
            {NAV_ITEMS.map((item) => (
              <div key={item.path}>
                <button
                  onClick={() =>
                    setMobileOpenDropdown(mobileOpenDropdown === item.name ? null : item.name)
                  }
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <span className={isActiveNav(item.path) ? "text-blue-600" : ""}>
                    {item.name}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileOpenDropdown === item.name ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileOpenDropdown === item.name && item.dropdown && (
                  <div className="mb-2 ml-3 mt-1 space-y-3 border-l-2 border-gray-100 pl-3">
                    {item.dropdown.sections.map((section, si) => (
                      <div key={si}>
                        <p className="mb-1 px-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                          {section.title}
                        </p>
                        {section.items.map((subItem: any, ii) => (
                          <Link
                            key={ii}
                            to={subItem.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                          >
                            {subItem.icon && (
                              <span className="text-gray-400">{subItem.icon}</span>
                            )}
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="border-t border-gray-100 pt-3">
              {user ? (
                <div className="space-y-1">
                  <div className="mb-2 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                      {avatarInitial}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
                    </div>
                  </div>
                  {MY_MENU.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  <User className="h-3.5 w-3.5" />
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}