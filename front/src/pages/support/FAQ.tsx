import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(
    null,
  );

  // 1. 누락되었던 FAQ 데이터를 다시 모두 채웠습니다.
  const faqs = [
    {
      question: "래플이란 무엇인가요?",
      answer:
        "래플(Raffle)은 추첨을 통해 제한된 수량의 상품을 구매할 수 있는 기회를 제공하는 시스템입니다. 한정판 제품에 대한 공정한 기회를 모든 참가자에게 제공합니다.",
    },
    {
      question: "래플 참여는 어떻게 하나요?",
      answer:
        "회원가입 후 진행 중인 래플 이벤트에서 '참여하기' 버튼을 클릭하시면 됩니다. 참여 마감 후 당첨자가 무작위로 선정되며, 당첨 시 등록하신 이메일과 앱 알림으로 안내드립니다.",
    },
    {
      question: "당첨 확률은 어떻게 되나요?",
      answer:
        "당첨 확률은 래플마다 다르며, 참여 인원 수와 상품 수량에 따라 결정됩니다. 모든 참가자에게 동일한 확률이 적용되며, 블록체인 기술을 활용한 투명한 추첨 시스템을 사용합니다.",
    },
    {
      question: "한 사람이 여러 번 참여할 수 있나요?",
      answer:
        "한 래플당 1인 1회만 참여 가능합니다. 중복 참여가 적발될 경우 모든 참여가 무효 처리되며, 향후 래플 참여가 제한될 수 있습니다.",
    },
    {
      question: "당첨되면 반드시 구매해야 하나요?",
      answer:
        "네, 당첨 시 안내된 기한 내에 결제를 완료하셔야 합니다. 기한 내 미결제 시 당첨이 취소되며, 다음 대기자에게 기회가 넘어갑니다.",
    },
    {
      question: "결제는 어떤 방법으로 할 수 있나요?",
      answer:
        "신용카드, 체크카드, 계좌이체, 간편결제(카카오페이, 네이버페이 등) 등 다양한 결제 수단을 지원합니다. 당첨 안내 메시지에서 결제 페이지로 이동하실 수 있습니다.",
    },
    {
      question: "배송은 언제 되나요?",
      answer:
        "결제 완료 후 통상 2-5 영업일 내에 발송됩니다. 브랜드 및 재고 상황에 따라 배송 기간이 달라질 수 있으며, 정확한 배송 일정은 개별 안내드립니다.",
    },
    {
      question: "교환 및 환불이 가능한가요?",
      answer:
        "당첨 상품의 특성상 단순 변심에 의한 교환 및 환불은 불가합니다. 단, 상품 하자가 있는 경우 수령 후 7일 이내에 고객센터로 연락주시면 교환 또는 환불 처리해드립니다.",
    },
    {
      question: "개인정보는 안전하게 보호되나요?",
      answer:
        "고객님의 개인정보는 관련 법령에 따라 안전하게 암호화되어 보관되며, 래플 진행 및 상품 배송 목적 외에는 사용되지 않습니다. 자세한 내용은 개인정보처리방침을 참고해주세요.",
    },
    {
      question: "참여 이력은 어디서 확인하나요?",
      answer:
        "마이페이지에서 참여한 래플 이력과 당첨 내역을 확인하실 수 있습니다. 진행 중인 래플과 종료된 래플을 모두 확인 가능합니다.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            자주 묻는 질문
          </h1>
          <p className="text-gray-600 text-lg">
            궁금하신 내용을 빠르게 찾아보세요
          </p>
        </div>

        {/* 2. 질문 리스트 렌더링 섹션 */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all"
            >
              <button
                onClick={() =>
                  setOpenIndex(
                    openIndex === index ? null : index,
                  )
                }
                className={`w-full flex items-center justify-between p-6 text-left transition-colors ${
                  openIndex === index
                    ? "bg-blue-50/50"
                    : "hover:bg-gray-50"
                }`}
              >
                <h3
                  className={`text-lg font-semibold pr-4 ${openIndex === index ? "text-blue-600" : "text-gray-800"}`}
                >
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index
                      ? "rotate-180 text-blue-500"
                      : ""
                  }`}
                />
              </button>

              {/* 3. 펼쳐지는 답변 로직 복구 */}
              {openIndex === index && (
                <div className="px-6 pb-6 bg-white animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="pt-4 border-t border-gray-50">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 4. 고객센터 바로가기 버튼 (동작 활성화) */}
        <div className="mt-12 bg-blue-50 rounded-2xl p-10 text-center border border-blue-100">
          <h2 className="text-2xl font-bold mb-2 text-slate-800">
            원하는 답변을 찾지 못하셨나요?
          </h2>
          <p className="text-gray-600 mb-8">
            고객센터를 통해 문의해 주시면 친절히 안내해
            드리겠습니다.
          </p>

          <Link
            to="/support"
            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
          >
            고객센터 바로가기
          </Link>
        </div>
      </div>
    </div>
  );
}