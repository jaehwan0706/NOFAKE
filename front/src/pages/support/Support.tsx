import { useState } from "react";
import { Link } from "react-router"; // 페이지 이동을 위해 추가
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";

export function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const categories = [
    {
      title: "래플 참여",
      posts: [
        {
          id: 1,
          title: "래플 참여 방법",
          date: "2026-04-25",
          views: 1234,
          content:
            "원하시는 상품의 상세 페이지에서 '응모하기' 버튼을 클릭하세요. 본인 인증이 완료된 계정당 1회 참여가 가능합니다.",
        },
        {
          id: 2,
          title: "당첨 확인 및 수령 안내",
          date: "2026-04-20",
          views: 2345,
          content:
            "마이페이지 > 내 응모 내역에서 결과를 확인하실 수 있습니다. 당첨자에게는 알림톡이나 이메일로 개별 안내가 발송됩니다.",
        },
        {
          id: 3,
          title: "참여 자격 안내",
          date: "2026-04-15",
          views: 890,
          content:
            "대한민국 거주자 중 만 14세 이상의 본인 인증 회원이라면 누구나 참여 가능합니다.",
        },
      ],
    },
    {
      title: "계정 관리",
      posts: [
        {
          id: 4,
          title: "회원가입 및 로그인",
          date: "2026-04-28",
          views: 3456,
          content:
            "카카오, 구글, 이메일 가입을 지원합니다. SNS 연동을 통해 간편하게 로그인하실 수 있습니다.",
        },
        {
          id: 5,
          title: "비밀번호 찾기",
          date: "2026-04-22",
          views: 1567,
          content:
            "로그인 화면 하단의 '비밀번호 찾기'를 클릭한 뒤 가입한 이메일을 입력해 주세요.",
        },
        {
          id: 6,
          title: "개인정보 수정",
          date: "2026-04-18",
          views: 678,
          content:
            "마이페이지 설정 메뉴에서 닉네임, 프로필 사진 등을 수정할 수 있습니다.",
        },
      ],
    },
    {
      title: "결제 및 환불",
      posts: [
        {
          id: 7,
          title: "결제 수단 안내",
          date: "2026-04-30",
          views: 2890,
          content:
            "신용카드, 체크카드, 다양한 간편 결제(카카오, 네이버)를 이용하실 수 있습니다.",
        },
        {
          id: 8,
          title: "환불 정책",
          date: "2026-04-26",
          views: 1890,
          content:
            "래플 응모 취소는 응모 기간 내에만 가능하며, 당첨 후 결제 시 취소가 어려울 수 있습니다.",
        },
        {
          id: 9,
          title: "결제 오류 해결",
          date: "2026-04-24",
          views: 456,
          content:
            "결제 오류 발생 시 잠시 후 다시 시도하거나 고객센터 1:1 문의를 이용해 주세요.",
        },
      ],
    },
    {
      title: "배송 및 반품",
      posts: [
        {
          id: 10,
          title: "배송 조회",
          date: "2026-05-01",
          views: 4567,
          content:
            "출고 완료 후 마이페이지에서 운송장 번호를 확인하실 수 있습니다.",
        },
        {
          id: 11,
          title: "반품 및 교환 안내",
          date: "2026-04-29",
          views: 2345,
          content:
            "상품 수령 후 7일 이내에 신청이 가능하며, 상품 가치가 훼손된 경우 제한될 수 있습니다.",
        },
        {
          id: 12,
          title: "배송 지연 안내",
          date: "2026-04-27",
          views: 1234,
          content:
            "주문 폭주 시 지연될 수 있으며, 지연 시 별도 안내 문자를 발송해 드립니다.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 및 검색 섹션 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            고객센터
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            무엇을 도와드릴까요? 궁금하신 내용을 검색해 보세요.
          </p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* 4개 섹션 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
                {category.title}
              </h2>
              <div className="space-y-4">
                {category.posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-50 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <div
                      onClick={() => toggleAccordion(post.id)}
                      className={`flex items-center justify-between p-5 cursor-pointer transition-all ${
                        openId === post.id
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-lg mb-1 ${openId === post.id ? "text-blue-600" : "text-gray-800"}`}
                        >
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{post.date}</span>
                          <span>
                            조회 {post.views.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {openId === post.id ? (
                        <ChevronUp className="w-5 h-6 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-6 text-gray-300" />
                      )}
                    </div>
                    {openId === post.id && (
                      <div className="px-6 py-6 bg-white text-gray-600 leading-relaxed border-t border-blue-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex gap-2">
                          <span className="text-blue-500 font-bold font-mono">
                            A.
                          </span>
                          <p>{post.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 세련된 하단 배너 (1:1 문의 페이지 연결 반영) */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-12 text-center shadow-2xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>

          <div className="relative z-10">
            <h2 className="text-sm font-bold text-blue-400 tracking-[0.4em] mb-4 uppercase">
              Support Service
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              더 도움이 필요하신가요?
            </h3>
            <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              찾으시는 답변이 없으신가요? 1:1 상담을 통해 상세한
              안내를 받으실 수 있습니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Link 컴포넌트로 변경하여 실제 페이지 이동 지원 */}
              <Link
                to="/support/contact"
                className="group relative px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold transition-all hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95"
              >
                <span className="flex items-center gap-2">
                  1:1 문의하기
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <button className="px-10 py-4 bg-slate-800 text-slate-200 rounded-2xl font-bold border border-slate-700 transition-all hover:bg-slate-700 hover:text-white active:scale-95 cursor-default">
                전화 상담{" "}
                <span className="text-blue-400 ml-2 font-mono">
                  1533-2771
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}