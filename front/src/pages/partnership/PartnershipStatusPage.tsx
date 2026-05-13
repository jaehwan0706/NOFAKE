import React from "react";

export const PartnershipStatusPage = () => {
  return (
    <div style={{ paddingTop: "120px", paddingBottom: "100px", backgroundColor: "#ffffff", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <span style={{ color: "#2563eb", fontWeight: "bold", fontSize: "14px", letterSpacing: "1.5px" }}>OUR RERERENCES</span>
          <h1 style={{ fontSize: "40px", fontWeight: "800", color: "#0f172a", marginTop: "12px", marginBottom: "24px" }}>
            신뢰를 증명한 파트너사 현황
          </h1>
          <p style={{ fontSize: "18px", color: "#475569", maxWidth: "700px", margin: "0 auto", lineHeight: "1.6" }}>
            nofake는 정직한 기술을 원동력 삼아 대기업, 스트릿 패션 리테일러, 글로벌 제조사들과 검증된 협업 구조를 공고히 이어가고 있습니다.
          </p>
        </div>

        {/* 현재 협업 지표 */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: "24px", padding: "40px", backgroundColor: "#f8fafc", borderRadius: "32px", marginBottom: "80px", border: "1px solid #e2e8f0" }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>누적 파트너 브랜드</span>
            <h2 style={{ fontSize: "48px", fontWeight: "900", color: "#0f172a", marginTop: "8px" }}>120+ 개</h2>
          </div>
          <div style={{ height: "60px", width: "1px", backgroundColor: "#cbd5e1" }} />
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>블록체인 누적 추첨 횟수</span>
            <h2 style={{ fontSize: "48px", fontWeight: "900", color: "#0f172a", marginTop: "8px" }}>4,500+ 회</h2>
          </div>
          <div style={{ height: "60px", width: "1px", backgroundColor: "#cbd5e1" }} />
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>평균 클라이언트 만족도</span>
            <h2 style={{ fontSize: "48px", fontWeight: "900", color: "#2563eb", marginTop: "8px" }}>98.6%</h2>
          </div>
        </div>

        {/* 분야별 파트너사 목록 쇼케이스 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
          
          <div style={{ border: "1px solid #f1f5f9", padding: "32px", borderRadius: "24px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "20px", borderBottom: "2px solid #2563eb", paddingBottom: "10px", display: "inline-block" }}>글로벌 스니커즈 & 패션</h3>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>한정판 드롭 문화의 핵심 기둥인 패션 및 라이프스타일 컴퍼니군</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {["NIKE", "ADIDAS", "SUPREME", "NEW BALANCE"].map((item, idx) => (
                <span key={idx} style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", borderRadius: "8px", fontSize: "13px", fontWeight: "700", color: "#475569" }}>{item}</span>
              ))}
            </div>
          </div>

          <div style={{ border: "1px solid #f1f5f9", padding: "32px", borderRadius: "24px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "20px", borderBottom: "2px solid #2563eb", paddingBottom: "10px", display: "inline-block" }}>신진 크리에이티브 브랜드</h3>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>자신들만의 견고한 독창성 및 코어 팬덤을 구축 중인 하입 브랜드군</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {["IAB STUDIO", "Matin Kim", "thisisneverthat", "LMC"].map((item, idx) => (
                <span key={idx} style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", borderRadius: "8px", fontSize: "13px", fontWeight: "700", color: "#475569" }}>{item}</span>
              ))}
            </div>
          </div>

          <div style={{ border: "1px solid #f1f5f9", padding: "32px", borderRadius: "24px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "20px", borderBottom: "2px solid #2563eb", paddingBottom: "10px", display: "inline-block" }}>국내외 유통 채널 파트너</h3>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>대량의 제품 추첨 이벤트 및 실시간 정산을 필요로 하는 중대형 유통사군</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {["LOTTE SHOPPING", "MUSINSA", "KREAM", "SOLDOUT"].map((item, idx) => (
                <span key={idx} style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", borderRadius: "8px", fontSize: "13px", fontWeight: "700", color: "#475569" }}>{item}</span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};