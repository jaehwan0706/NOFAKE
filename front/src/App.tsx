import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./components/Header";
import { useAuthUser, useAuthReady } from "./lib/authUser";
import { Footer } from "./components/Footer";
import { Home } from "./pages/main/Home";
import { RafflesPage } from "./pages/raffle/RafflesPage";
import { Support } from "./pages/support/Support";
import { FAQ } from "./pages/support/FAQ";
import { Notice } from "./pages/support/Notice";
import { Terms } from "./pages/support/Terms";
import { Privacy } from "./pages/support/Privacy";
import { Login } from "./pages/auth/KakaoLogin";
import { KakaoCallback } from "./pages/auth/KakaoCallback";
import PhoneVerification from "./pages/auth/PhoneVerification";
import { Partnership } from "./pages/partnership/Partnership";
import { ContactSupport } from "./pages/support/ContactSupport";
import { NOFAKEservicePage } from "./pages/about/NOFAKEservicePage";
import { CompanyPage } from "./pages/about/CompanyPage";
import { FairnessPage } from "./pages/about/FairnessPage";
import { TransparencyPage } from "./pages/about/TransparencyPage";
import { TrustPage } from "./pages/about/TrustPage";
import { MassAccessPage } from "./pages/partnership/MassAccessPage";
import { FastLaunchPage } from "./pages/partnership/FastLaunchPage";
import { ManagerSupportPage } from "./pages/partnership/ManagerSupportPage";
import { PartnershipStatusPage } from "./pages/partnership/PartnershipStatusPage";
import { PointSwapPage } from "./pages/points/PointSwapPage";
import { PointHistory } from "./pages/points/PointHistory";
import { MyPage } from "./pages/user/MyPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import { BrandsPage } from "./pages/about/BrandsPage";
import { HowItWorksPage } from "./pages/about/HowItWorksPage";
import { PartnerPage } from "./pages/partnership/PartnerPage";
import { NikeRafflePage } from "./pages/raffle/NikeRafflePage";
import { MusinsaRafflePage } from "./pages/raffle/MusinsaRafflePage";

function Root() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 💡 휴대폰 인증 가드: 로그인 상태인데 인증이 안 되어 있고, 현재 인증 페이지가 아니라면 강제 이동
    const publicPaths = ["/login", "/auth/kakao/callback", "/verify-phone"];
    const isPublicPath = publicPaths.some(path => location.pathname === path || location.pathname.startsWith(path + "/"));

    if (user && user.phone_verified === false && !isPublicPath) {
      console.warn("📱 휴대폰 인증 필요: /verify-phone으로 리다이렉트");
      navigate("/verify-phone", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}

function NotFound() {
  return (
    <main className="min-h-screen px-6 pt-32 text-center">
      <h1 className="text-3xl font-bold text-gray-900">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-gray-500">주소를 다시 확인해 주세요.</p>
    </main>
  );
}

const ADMIN_WALLET = ((import.meta.env.VITE_ROOT_ADMIN_WALLET as string) || "").toLowerCase();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const authReady = useAuthReady();
  const user = useAuthUser();

  // Wait for the initial token validation to finish before making any routing
  // decision — avoids redirecting the admin away before walletAddress is loaded.
  if (!authReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm font-semibold text-gray-400">관리자 세션 확인 중...</p>
      </main>
    );
  }

  const isAdmin = !!ADMIN_WALLET && !!user?.walletAddress &&
    user.walletAddress.toLowerCase() === ADMIN_WALLET;

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Root />}>
          {/* 1. 메인 */}
          <Route index element={<Home />} />

          {/* 2. 서비스 소개 */}
          <Route path="about" element={<NOFAKEservicePage />} />
          <Route path="about/fairness" element={<FairnessPage />} />
          <Route path="about/transparency" element={<TransparencyPage />} />
          <Route path="about/trust" element={<TrustPage />} />
          <Route path="company" element={<CompanyPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />

          {/* 3. 래플 이벤트 */}
          <Route path="raffles" element={<RafflesPage />} />
          <Route path="raffles/nike" element={<NikeRafflePage />} />
          <Route path="raffles/musinsa" element={<MusinsaRafflePage />} />

          {/* 4. 포인트 거래 */}
          <Route path="point-swap" element={<PointSwapPage />} />
          <Route path="points/history" element={<PointHistory />} />
          <Route path="admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

          {/* 5. 고객센터 */}
          <Route path="support" element={<Support />} />
          <Route path="notice" element={<Notice />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="support/contact" element={<ContactSupport />} />

          {/* 6. 파트너쉽 문의 */}
          <Route path="partnership" element={<Partnership />} />
          <Route path="partnership/audience" element={<MassAccessPage />} />
          <Route path="partnership/launch" element={<FastLaunchPage />} />
          <Route path="partnership/manager" element={<ManagerSupportPage />} />
          <Route path="partnership/status" element={<PartnershipStatusPage />} />
          <Route path="partnership/brand" element={<PartnerPage />} />
          
          {/* 7. 로그인  */}
          <Route path="login" element={<Login />} />
          <Route path="auth/kakao/callback" element={<KakaoCallback />} />
          <Route path="verify-phone" element={<PhoneVerification />} />
          
          {/* 8. 마이페이지 */}
          <Route path="mypage" element={<MyPage />} />

          {/* 예외 처리 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
