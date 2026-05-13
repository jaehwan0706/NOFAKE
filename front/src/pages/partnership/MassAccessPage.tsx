import React from "react";

export const MassAccessPage = () => {
  return (
    <div style={{ paddingTop: "120px", paddingBottom: "100px", backgroundColor: "#f8fafc", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* 헤더 */}
        <div style={{ marginBottom: "60px" }}>
          <span style={{ color: "#2563eb", fontWeight: "bold", fontSize: "14px", letterSpacing: "1.5px", textTransform: "uppercase" }}>Target Audience</span>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", marginTop: "12px", marginBottom: "20px" }}>
            준비된 대규모 잠재 고객과의 만남
          </h1>
          <p style={{ fontSize: "18px", color: "#475569", lineHeight: "1.6", maxWidth: "800px" }}>
            nofake는 한정판 및 트렌디 제품에 몰입하는 활성 유저층을 보유하고 있습니다. 단순 노출을 넘어 실제 구매 전환과 자발적 바이럴로 이어지는 핵심 타겟층에 즉각적으로 도달하세요.
          </p>
        </div>

        {/* 핵심 통계 지표 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "60px" }}>
          {[
            { label: "월간 활성 이용자 (MAU)", value: "1,200,000+", desc: "트렌드에 민감한 2030 핵심 소비자층 대거 포진" },
            { label: "평균 응모 참여율", value: "84.3%", desc: "단순 방문을 넘어 실제 액션으로 이어지는 고관여 유저" },
            { label: "핵심 타겟층 비율 (MZ)", value: "92.1%", desc: "구매력과 소셜 파급력을 동시에 갖춘 세대 집중" },
            { label: "캠페인 당 평균 유입", value: "350,000+", desc: "브랜드 런칭 및 프로모션 파급 효과 극대화" }
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>{stat.label}</span>
              <h3 style={{ fontSize: "36px", fontWeight: "800", color: "#2563eb", margin: "12px 0" }}>{stat.value}</h3>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* 상세 분석 섹션 */}
        <div style={{ backgroundColor: "#ffffff", padding: "48px", borderRadius: "32px", border: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center" }}>
          <div style={{ flex: "1", minWidth: "300px" }}>
            <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>왜 nofake 유저들은 다를까요?</h3>
            <p style={{ color: "#475569", lineHeight: "1.8", marginBottom: "24px" }}>
              일반 광고 피드에 피로감을 느끼는 유저들이 '공정한 기회'라는 가치 아래 자발적으로 모였습니다. 이들은 조작 없는 무결한 온체인 추첨 방식에 깊은 신뢰를 보이며, 브랜드가 진행하는 이벤트에 적극적으로 호응합니다.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#334155", fontWeight: "600" }}>✓ 타 플랫폼 대비 바이럴 공유 발생율 3.8배 달성</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#334155", fontWeight: "600" }}>✓ 허수 계정 및 매크로 어뷰징 차단 기술로 실제 유효 타겟 매칭</div>
            </div>
          </div>
          <div style={{ flex: "1", minWidth: "300px", height: "240px", backgroundColor: "#eff6ff", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "#3b82f6", fontWeight: "bold" }}>
            [ 핵심 타겟 인포그래픽 영역 ]
          </div>
        </div>

      </div>
    </div>
  );
};