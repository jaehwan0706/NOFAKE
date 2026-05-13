import React from "react";

export const FastLaunchPage = () => {
  return (
    <div style={{ paddingTop: "120px", paddingBottom: "100px", backgroundColor: "#ffffff", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <span style={{ color: "#2563eb", fontWeight: "bold", fontSize: "14px", letterSpacing: "1.5px" }}>AGILE OPERATION</span>
          <h1 style={{ fontSize: "40px", fontWeight: "800", color: "#0f172a", marginTop: "12px", marginBottom: "24px" }}>
            아이디어에서 런칭까지 단 24시간
          </h1>
          <p style={{ fontSize: "18px", color: "#475569", maxWidth: "700px", margin: "0 auto", lineHeight: "1.6" }}>
            복잡한 계약 프로세스와 인프라 구축으로 마케팅 타이밍을 놓치지 마세요. nofake의 자동화 빌더 시스템을 활용해 원스톱으로 온체인 캠페인을 오픈합니다.
          </p>
        </div>

        {/* 타임라인 UI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "80px" }}>
          {[
            { step: "Step 01", title: "어드민 계정 생성", desc: "파트너 가입 승인 후 10분 만에 관리자 대시보드가 발급됩니다." },
            { step: "Step 02", title: "상품 등록 & 조건 설정", desc: "추첨일시, 응모 요건(SNS 미션, 로그인 등)을 직관적으로 입력합니다." },
            { step: "Step 03", title: "체인코드 자동 배포", desc: "클릭 한 번으로 하이퍼레저 블록체인에 전용 추첨 컨트랙트가 프로비저닝됩니다." },
            { step: "Step 04", title: "실시간 캠페인 활성화", desc: "생성된 전용 랜딩 페이지를 통해 고객 응모를 즉시 접수받습니다." }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "32px", border: "1px solid #e2e8f0", borderRadius: "24px", position: "relative", backgroundColor: "#f8fafc" }}>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "#2563eb" }}>{item.step}</span>
              <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginTop: "12px", marginBottom: "12px" }}>{item.title}</h4>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 기술 스펙 요약 */}
        <div style={{ backgroundColor: "#0f172a", borderRadius: "32px", padding: "48px", color: "#ffffff" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "32px" }}>
            <div style={{ flex: "1", minWidth: "300px" }}>
              <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>엔지니어 프리(Engineer-Free) 솔루션</h3>
              <p style={{ color: "#94a3b8", lineHeight: "1.7" }}>
                파트너사의 내부 개발자 지원이 없어도 괜찮습니다. nofake가 제공하는 고가용성 SaaS 백엔드와 SDK를 통해, 웹 연동부터 인증까지 모든 비즈니스 로직이 코딩 없이 처리됩니다.
              </p>
            </div>
            <button style={{ backgroundColor: "#2563eb", color: "#ffffff", border: "none", padding: "16px 32px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
              퀵 가이드 문서 보기
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};