import { Link } from "react-router";
import { ChevronUp, MessageCircle, Shield, CheckCircle, Lock } from "lucide-react";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* 상단 4컬럼 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* 브랜드 */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">nofake</h3>
            <p className="text-sm leading-relaxed">
              공정하고 투명한 래플 시스템으로
              <br />
              최고의 브랜드 제품을 만나보세요
            </p>
            {/* SNS */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://instagram.com/nofake"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                aria-label="nofake 인스타그램"
              >
                <InstagramIcon size={16} />
                <span>Instagram</span>
              </a>
              <a
                href="https://pf.kakao.com/_nofake"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                aria-label="nofake 카카오채널"
              >
                {/* 카카오 아이콘 (lucide에 없어서 SVG 인라인) */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.6 5.08 4.03 6.52L5 21l4.7-2.5c.74.1 1.51.16 2.3.16 5.523 0 10-3.477 10-7.86C22 6.477 17.523 3 12 3z" />
                </svg>
                <span>카카오채널</span>
              </a>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="text-white font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/raffles" className="hover:text-white transition-colors">래플 이벤트</Link></li>
              <li><Link to="/brands" className="hover:text-white transition-colors">브랜드 목록</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">래플 참여 방법</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h4 className="text-white font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/support" className="hover:text-white transition-colors">고객센터</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">자주 묻는 질문</Link></li>
              <li>
                <a href="mailto:help@nofake.kr" className="hover:text-white transition-colors">
                  이메일 문의
                </a>
              </li>
              <li>
                <a
                  href="https://pf.kakao.com/_nofake"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  카카오 1:1 문의
                </a>
              </li>
            </ul>
          </div>

          {/* B2B 브랜드 입점 */}
          <div>
            <h4 className="text-white font-semibold mb-4">브랜드 파트너십</h4>
            <p className="text-sm text-gray-400 mb-3 leading-relaxed">
              nofake와 함께 공정한 래플로
              <br />
              브랜드 가치를 높여보세요.
            </p>
            <Link
              to="/partner"
              className="inline-block border border-gray-600 text-white px-5 py-2 rounded hover:bg-gray-800 transition-colors text-sm"
            >
              입점 문의하기
            </Link>
            <p className="text-xs text-gray-500 mt-2">
              제안서 및 소개서는 문의 후 전달드립니다.
            </p>
          </div>
        </div>

        {/* 하단 법적 정보 */}
        <div className="border-t border-gray-800 pt-8">
          <div className="text-sm space-y-2">
            <p>
              대표이사 : ??? | 개인정보보호책임자 : ??? | 이메일 :{" "}
              <a href="mailto:help@nofake.kr" className="hover:text-white transition-colors">
                help@nofake.kr
              </a>
            </p>
            <p>사업자 소재지 : ???</p>
            <p>사업자등록번호 : ???-??-????? | 통신판매업 신고번호 : 제????-?????-????호</p>
            <p className="text-gray-500">
              nofake의 래플 서비스는 본 사이트를 통해 운영되며, 상품의 배송 및 반품은 각 브랜드 정책에 따릅니다.
            </p>
          </div>

          {/* 고객센터 운영 + 인증 뱃지 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold text-white">고객센터 : 0??-????-????</span>
              <span>평일 10:00 ~ 18:30 | 점심 12:00 ~ 13:00</span>
              <span className="text-gray-400">카카오 1:1 문의는 365일 24시간 접수 가능</span>
            </div>

            {/* 신뢰 뱃지 - nofake 취지에 맞게 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-1 text-xs bg-gray-800 border border-gray-700 px-2 py-1.5 rounded">
                <Shield size={12} className="text-blue-400" />
                <span>공정 래플 인증</span>
              </span>
              <span className="flex items-center gap-1 text-xs bg-gray-800 border border-gray-700 px-2 py-1.5 rounded">
                <CheckCircle size={12} className="text-green-400" />
                <span>정품 보증</span>
              </span>
              <span className="flex items-center gap-1 text-xs bg-gray-800 border border-gray-700 px-2 py-1.5 rounded">
                <Lock size={12} className="text-yellow-400" />
                <span>개인정보 보호</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Copyright {new Date().getFullYear()}, nofake. All rights reserved.
          </p>
        </div>
      </div>

      {/* 맨 위로 */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-gray-600 transition-colors z-40"
        aria-label="맨 위로"
      >
        <ChevronUp size={24} />
      </button>

      {/* 카카오 채팅 상담 */}
      <a
        href="https://pf.kakao.com/_nofake"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-24 right-8 bg-yellow-400 text-gray-900 p-3 rounded-full shadow-lg hover:bg-yellow-300 transition-colors z-40"
        aria-label="카카오 상담하기"
      >
        <MessageCircle size={24} />
      </a>
    </footer>
  );
}
