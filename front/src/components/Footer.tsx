import { Link } from "react-router";
import { ChevronUp, MessageCircle } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">nofake</h3>
            <p className="text-sm">
              공정하고 투명한 래플 시스템으로
              <br />
              최고의 브랜드 제품을 만나보세요
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">브랜드 소개</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/raffles" className="hover:text-white">래플 이벤트</Link></li>
              <li><Link to="/faq" className="hover:text-white">이용약관</Link></li>
              <li><Link to="/terms" className="hover:text-white">개인정보처리방침</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">게시판/문의</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/support" className="hover:text-white">고객센터</Link></li>
              <li><Link to="/faq" className="hover:text-white">자주 묻는 질문</Link></li>
              <li><a href="mailto:help@raffle.io" className="hover:text-white">이메일 문의</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">프로모션 설명 대행</h4>
            <p className="text-sm mb-3">
              서비스 소개서 다운로드
            </p>
            <button className="border border-gray-600 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors text-sm">
              서비스 소개서 다운로드
            </button>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="text-sm space-y-2">
            <p>대표이사 : 김철수 | 개인정보보호책임 : 김철수 | 이메일 : help@raffle.io</p>
            <p>사업자 소재지 : 서울특별시 서초구 강남대로 375, 5층 3호 (서초동, 스타트업 캠퍼스빌)</p>
            <p>사업자등록 번호 : 561-80-01010 | 통신판매업 번호 : 10-1664601</p>
            <p className="text-gray-500">
              디프로모션의 자사정보들은 본 사이트를 통하여 거래에 참여하며 상품의 배송 및 반품 등은 10-1664601 정책에 따릅니다.
            </p>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4">
              <p className="text-sm">1533-2771</p>
              <p className="text-sm">고객센터 평일 10:00 ~ 18:30 | 점심시간 12:00 ~ 13:00</p>
              <p className="text-sm font-semibold">24 / 7</p>
              <p className="text-sm">1:1 문의는 365일 24시간 접수 가능합니다.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <span className="text-xs bg-gray-800 px-2 py-1 rounded">IF DESIGN AWARD 2018</span>
                <span className="text-xs bg-red-600 px-2 py-1 rounded">iF</span>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded">AWS</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Copyright 2022, raffle.io All rights reserved.
          </p>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        aria-label="맨 위로"
      >
        <ChevronUp size={24} />
      </button>

      <button
        className="fixed bottom-24 right-8 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors z-40"
        aria-label="상담하기"
      >
        <MessageCircle size={24} />
      </button>
    </footer>
  );
}
