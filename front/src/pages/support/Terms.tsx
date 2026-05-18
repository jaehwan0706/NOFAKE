export function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">이용약관</h1>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
            <p className="text-gray-600 leading-relaxed">
              본 약관은 RAFFLE(이하 "회사"라 합니다)가 운영하는 래플 서비스(이하 "서비스"라 합니다)의 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>"서비스"란 회사가 제공하는 래플 참여 및 관련 서비스를 의미합니다.</li>
                <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                <li>"회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 자를 의미합니다.</li>
                <li>"래플"이란 추첨을 통해 제한된 수량의 상품 구매 기회를 제공하는 서비스를 말합니다.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 효력 및 변경)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>① 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</p>
              <p>② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</p>
              <p>③ 약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 서비스 내 공지사항을 통해 공지합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제4조 (회원가입)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</p>
              <p>② 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제5조 (래플 참여)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>① 회원은 회사가 제공하는 래플에 참여할 수 있으며, 1인당 1회만 참여 가능합니다.</p>
              <p>② 래플 당첨자는 무작위 추첨을 통해 선정되며, 모든 참여자에게 동일한 당첨 확률이 적용됩니다.</p>
              <p>③ 당첨자는 회사가 정한 기한 내에 결제를 완료해야 하며, 미결제 시 당첨이 취소됩니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제6조 (개인정보보호)</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력합니다.
              개인정보의 보호 및 이용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제7조 (환불 및 교환)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>① 당첨 상품의 특성상 단순 변심에 의한 환불 및 교환은 불가합니다.</p>
              <p>② 상품에 하자가 있는 경우 수령 후 7일 이내에 교환 또는 환불을 요청할 수 있습니다.</p>
            </div>
          </section>

          <section className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">시행일: 2026년 1월 1일</p>
          </section>
        </div>
      </div>
    </div>
  );
}
