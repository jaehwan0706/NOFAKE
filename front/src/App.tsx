import { useEffect } from "react";
import { BrowserRouter, Outlet, Routes, Route, useLocation } from "react-router";
import { Header } from "./components/Header";
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
import { MyPage } from "./pages/user/MyPage";
import { BrandsPage } from "./pages/about/BrandsPage";
import { HowItWorksPage } from "./pages/about/HowItWorksPage";
import { PartnerPage } from "./pages/partnership/PartnerPage";

function Root() {
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

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Root />}>
          {/* 1. 메인 */}
          <Route index element={<Home />} />

          {/* 2. 서비스 소개 */}
          {/* nofake 소개 */}
          <Route path="about" element={<NOFAKEservicePage />} />
          {/* 핵심 가치 - 공정성 */}
          <Route path="about/fairness" element={<FairnessPage />} />
          {/* 핵심 가치 - 투명성 */}
          <Route path="about/transparency" element={<TransparencyPage />} />
          {/* 핵심 가치 - 신뢰 */}
          <Route path="about/trust" element={<TrustPage />} />
          {/* 회사소개 */}
          <Route path="company" element={<CompanyPage />} />
          {/* 브랜드 소개 */}
          <Route path="brands" element={<BrandsPage />} />
          {/* 래플 참여 방법 */}
          <Route path="how-it-works" element={<HowItWorksPage />} />

          {/* 3. 래플 이벤트 */}
          <Route path="raffles" element={<RafflesPage />} />

          {/* 4. 포인트 거래 */}
          <Route path="point-swap" element={<PointSwapPage />} />

          {/* 5. 고객센터 */}
          <Route path="support" element={<Support />} />
          {/* 공지사항 */}
          <Route path="notice" element={<Notice />} />
          {/* FAQ */}
          <Route path="faq" element={<FAQ />} />
          {/* 이용약관 */}
          <Route path="terms" element={<Terms />} />
          {/* 개인정보방침 */}
          <Route path="privacy" element={<Privacy />} />
          {/* 1:1 문의하기 */}
          <Route path="/support/contact" element={<ContactSupport />} />

          {/* 6. 파트너쉽 문의 */}
          <Route path="partnership" element={<Partnership />} />
          {/* 파트너 혜택 - 대규모 고객 접근 */}
          <Route path="partnership/audience" element={<MassAccessPage />} />
          {/* 파트너 혜택 - 빠른 캠페인 런칭 */}
          <Route path="partnership/launch" element={<FastLaunchPage />} />
          {/* 파트너 혜택 - 전담 매니저 지원 */}
          <Route path="partnership/manager" element={<ManagerSupportPage />} />
          {/* 파트너 혜택 - 파트너사 현황 */}
          <Route path="partnership/status" element={<PartnershipStatusPage />} />
          {/* 브랜드 입점 문의 */}
          <Route path="partnership/brand" element={<PartnerPage />} />
          {/* 7. 로그인  */}
          <Route path="login" element={<Login />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
          <Route path="/verify-phone" element={<PhoneVerification />} />
          
          
          {/* 8. 마이페이지 (로그인 후 활성화) */}
          <Route path="mypage" element={<MyPage />} />

          {/* 예외 처리 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
