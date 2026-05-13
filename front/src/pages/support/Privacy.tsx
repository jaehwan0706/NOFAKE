import React from "react";

export const Privacy: React.FC = () => {
  return (
    // pt-32를 통해 헤더 뒷부분으로 내용이 잘려 들어가는 것을 방지합니다.
    <div className="max-w-5xl mx-auto pt-32 pb-20 px-6 min-h-screen bg-white">
      {/* 페이지 제목 영역 */}
      <div className="border-b-2 border-gray-900 pb-6 mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          개인정보처리방침
        </h1>
        <p className="text-sm text-gray-400 mt-3">
          시행일자: 2026. 05. 01
        </p>
      </div>

      {/* 본문 영역 */}
      <div className="space-y-12 text-gray-800">
        {/* 제 1 조 */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-gray-900">
            제 1 조 (개인정보의 수집 및 이용 목적)
          </h3>
          <p className="leading-relaxed mb-4">
            회사는 다음의 목적을 위하여 개인정보를 처리합니다.
            처리하고 있는 개인정보는 다음의 목적 이외의 용도로는
            이용되지 않으며, 이용 목적이 변경되는 경우에는
            별도의 동의를 받는 등 필요한 조치를 이행할
            예정입니다.
          </p>
          <ul className="list-disc list-inside space-y-2 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <li>홈페이지 회원가입 및 관리</li>
            <li>서비스 제공에 따른 본인 식별·인증</li>
            <li>래플 이벤트 당첨자 선정 및 경품 배송</li>
            <li>고객 상담 및 민원 처리</li>
          </ul>
        </section>

        {/* 제 2 조 */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-gray-900">
            제 2 조 (수집하는 개인정보의 항목)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 border border-gray-200 font-semibold">
                    구분
                  </th>
                  <th className="p-3 border border-gray-200 font-semibold">
                    수집 항목
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-gray-200 bg-gray-50/30">
                    필수 항목
                  </td>
                  <td className="p-3 border border-gray-200">
                    이메일 주소, 비밀번호, 닉네임
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border border-gray-200 bg-gray-50/30">
                    이벤트 참여
                  </td>
                  <td className="p-3 border border-gray-200">
                    이름, 휴대전화 번호, 배송지 주소
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 제 3 조 */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-gray-900">
            제 3 조 (개인정보의 보유 및 이용기간)
          </h3>
          <p className="leading-relaxed">
            회사는 법령에 따른 개인정보 보유·이용기간 또는
            정보주체로부터 개인정보를 수집 시에 동의 받은
            개인정보 보유·이용기간 내에서 개인정보를
            처리·보유합니다. 원칙적으로 개인정보 수집 및
            이용목적이 달성된 후에는 해당 정보를 지체 없이
            파기합니다.
          </p>
        </section>
      </div>

      {/* 하단 안내 */}
      <div className="mt-20 pt-10 border-t border-gray-100 text-sm text-gray-400">
        본 방침에 대한 문의사항이 있으신 경우 고객센터를 이용해
        주시기 바랍니다.
      </div>
    </div>
  );
};