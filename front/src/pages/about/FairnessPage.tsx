import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ── Design Tokens ── */
const T = {
  blue: "#2563eb",
  blueDark: "#1e40af",
  blueLight: "#eff6ff",
  navy: "#0f172a",
  gray: "#64748b",
  grayLight: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
  text: "#1e293b",
  sub: "#475569",
  green: "#10b981",
  greenLight: "#ecfdf5",
  amber: "#f59e0b",
};
const FONT = `'Pretendard', 'DM Sans', 'Noto Sans KR', sans-serif`;

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis] as const;
}

function FadeIn({ children, delay = 0, y = 24, style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : `translateY(${y}px)`,
        transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const Container = ({ children, style = {} }) => (
  <div
    style={{
      maxWidth: 1280,
      margin: "0 auto",
      padding: "0 clamp(16px,4vw,48px)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Label = ({ children, center = false }) => (
  <p
    style={{
      color: T.blue,
      fontWeight: 700,
      letterSpacing: ".1em",
      textTransform: "uppercase",
      fontSize: ".78rem",
      marginBottom: "10px",
      textAlign: center ? "center" : undefined,
    }}
  >
    {children}
  </p>
);

/* ── 공정성 페이지 데이터 ── */
const PILLARS = [
  {
    icon: "⛓",
    title: "스마트컨트랙트 자동 실행",
    desc: "추첨 로직 전체가 Hyperledger Fabric 스마트컨트랙트에 코드로 고정됩니다. 운영자가 개입할 수 있는 어떠한 입력창도 존재하지 않습니다.",
    detail:
      "당첨 알고리즘은 배포 시 블록체인에 고정되며, 이후 어떤 관리자도 코드를 수정하거나 결과를 바꿀 수 없습니다.",
  },
  {
    icon: "🎲",
    title: "검증된 무작위성 (VRF)",
    desc: "Verifiable Random Function(VRF)을 사용해 당첨 난수를 생성합니다. 결과값과 증명값이 함께 블록에 기록됩니다.",
    detail:
      "누구나 VRF 증명값을 오픈소스 도구로 검증할 수 있으며, 난수 생성 시드를 사전에 조작하는 것은 수학적으로 불가능합니다.",
  },
  {
    icon: "👁",
    title: "참가자 동등 원칙",
    desc: "응모 마감 직전까지 등록된 모든 참가자는 동일한 당첨 확률을 가집니다. 계정 등급이나 결제 내역이 확률에 영향을 미치지 않습니다.",
    detail:
      "1인 1응모 원칙은 DID 기반 신원인증으로 보장됩니다. 중복 계정을 통한 확률 조작을 원천 차단합니다.",
  },
  {
    icon: "📜",
    title: "감사 가능한 전체 이력",
    desc: "응모 접수부터 당첨 발표까지 모든 단계의 트랜잭션이 변경 불가능한 원장에 순서대로 기록됩니다.",
    detail:
      "제3자 감사 기관이 블록체인 원장에 직접 접근해 전체 이력을 독립적으로 검증할 수 있습니다.",
  },
];

const COMPARE = [
  {
    aspect: "당첨 로직 결정",
    before: "운영자 재량 · 블랙박스",
    after: "스마트컨트랙트 고정 코드",
  },
  {
    aspect: "난수 생성",
    before: "서버 내부 함수 (검증 불가)",
    after: "VRF · 온체인 증명 첨부",
  },
  {
    aspect: "이력 보존",
    before: "DB 수정 가능",
    after: "불변 블록체인 원장",
  },
  {
    aspect: "1인 1응모",
    before: "이메일 중복 확인 (우회 가능)",
    after: "DID 신원인증 강제",
  },
  {
    aspect: "결과 공개",
    before: "운영자 공지 의존",
    after: "트랜잭션 해시 즉시 공개",
  },
];

export const FairnessPage = () => (
  <div
    style={{
      paddingTop: 96,
      backgroundColor: T.white,
      fontFamily: FONT,
    }}
  >
    {/* Hero */}
    <section
      style={{
        background: `linear-gradient(135deg, ${T.navy} 0%, #14532d 100%)`,
        padding:
          "clamp(80px,10vw,140px) 0 clamp(64px,8vw,100px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: 480,
          height: 480,
          background:
            "radial-gradient(circle, rgba(16,185,129,.2) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />
      <Container style={{ position: "relative", zIndex: 1 }}>
        <FadeIn>
          <Link
            to="/about"
            style={{
              color: "#6ee7b7",
              fontSize: ".85rem",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 28,
            }}
          >
            ← 서비스 소개로 돌아가기
          </Link>
        </FadeIn>
        <FadeIn delay={0.06}>
          <span
            style={{
              display: "inline-block",
              padding: "5px 14px",
              backgroundColor: "rgba(16,185,129,.2)",
              border: "1px solid rgba(16,185,129,.4)",
              borderRadius: 999,
              fontSize: ".78rem",
              color: "#6ee7b7",
              fontWeight: 700,
              letterSpacing: ".08em",
              marginBottom: 20,
            }}
          >
            CORE VALUE · 공정성
          </span>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1
            style={{
              fontSize: "clamp(2.4rem,5.5vw,3.8rem)",
              fontWeight: 900,
              color: T.white,
              lineHeight: 1.1,
              marginBottom: 28,
              maxWidth: 720,
            }}
          >
            인간의 개입이{" "}
            <span style={{ color: "#34d399" }}>불가능한</span>
            <br />
            추첨 시스템
          </h1>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p
            style={{
              fontSize: "1.15rem",
              color: "#94a3b8",
              lineHeight: 1.8,
              maxWidth: 580,
              marginBottom: 40,
            }}
          >
            nofake의 공정성은 '약속'이 아니라 '코드'입니다.
            스마트컨트랙트가 추첨 전 과정을 자동 실행하며, 어떤
            관리자도 결과를 바꿀 수 없습니다.
          </p>
        </FadeIn>
        <FadeIn delay={0.22}>
          <div
            style={{
              display: "flex",
              gap: 32,
              flexWrap: "wrap",
            }}
          >
            {[
              ["VRF 기반", "무작위성 보장"],
              ["DID 인증", "1인 1응모 강제"],
              ["스마트컨트랙트", "결과 불변"],
            ].map(([k, v]) => (
              <div key={k}>
                <p
                  style={{
                    color: "#34d399",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    margin: 0,
                  }}
                >
                  {k}
                </p>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: ".82rem",
                    margin: 0,
                  }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </section>

    {/* 4 Pillars */}
    <section style={{ padding: "96px 0" }}>
      <Container>
        <FadeIn>
          <Label>How We Ensure Fairness</Label>
          <h2
            style={{
              fontSize: "clamp(1.6rem,3.5vw,2.25rem)",
              fontWeight: 800,
              color: T.navy,
              marginBottom: 16,
            }}
          >
            공정성을 보장하는 4가지 기술 원칙
          </h2>
          <p
            style={{
              color: T.sub,
              lineHeight: 1.8,
              maxWidth: 600,
              marginBottom: 64,
            }}
          >
            nofake는 브랜드로부터 래플 정보를 제공받아,
            하이퍼레저 기술 기반으로 참가자 모두에게 동등한
            기회를 보장합니다.
          </p>
        </FadeIn>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {PILLARS.map((p, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div
                style={{
                  border: `1px solid ${T.border}`,
                  borderRadius: "1.5rem",
                  padding: "40px 32px",
                  height: "100%",
                  boxSizing: "border-box",
                  backgroundColor: T.white,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: T.greenLight,
                    borderRadius: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                    marginBottom: 24,
                  }}
                >
                  {p.icon}
                </div>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: T.navy,
                    marginBottom: 10,
                  }}
                >
                  {p.title}
                </h4>
                <p
                  style={{
                    color: T.gray,
                    lineHeight: 1.7,
                    fontSize: ".93rem",
                    marginBottom: 16,
                  }}
                >
                  {p.desc}
                </p>
                <div
                  style={{
                    padding: "14px 16px",
                    backgroundColor: T.grayLight,
                    borderRadius: 10,
                    borderLeft: `3px solid ${T.green}`,
                  }}
                >
                  <p
                    style={{
                      color: T.sub,
                      fontSize: ".82rem",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {p.detail}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>

    {/* Before / After 비교 */}
    <section
      style={{
        backgroundColor: T.grayLight,
        padding: "96px 0",
      }}
    >
      <Container>
        <FadeIn>
          <Label center>Before vs After</Label>
          <h2
            style={{
              fontSize: "clamp(1.6rem,3.5vw,2.25rem)",
              fontWeight: 800,
              color: T.navy,
              textAlign: "center",
              marginBottom: 56,
            }}
          >
            기존 래플과 nofake의 차이
          </h2>
        </FadeIn>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 0,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                fontWeight: 700,
                color: T.sub,
                fontSize: ".8rem",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              항목
            </div>
            <div
              style={{
                padding: "12px 16px",
                fontWeight: 700,
                color: "#ef4444",
                fontSize: ".8rem",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                textAlign: "center",
              }}
            >
              기존 방식
            </div>
            <div
              style={{
                padding: "12px 16px",
                fontWeight: 700,
                color: T.green,
                fontSize: ".8rem",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                textAlign: "center",
              }}
            >
              nofake
            </div>
          </div>
          {COMPARE.map((row, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  backgroundColor:
                    i % 2 === 0 ? T.white : "transparent",
                  borderRadius: 10,
                  overflow: "hidden",
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    padding: "16px 16px",
                    fontWeight: 600,
                    color: T.text,
                    fontSize: ".9rem",
                  }}
                >
                  {row.aspect}
                </div>
                <div
                  style={{
                    padding: "16px 16px",
                    color: "#ef4444",
                    fontSize: ".87rem",
                    lineHeight: 1.5,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "#fef2f2",
                      padding: "4px 10px",
                      borderRadius: 6,
                    }}
                  >
                    {row.before}
                  </span>
                </div>
                <div
                  style={{
                    padding: "16px 16px",
                    color: T.green,
                    fontSize: ".87rem",
                    lineHeight: 1.5,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: T.greenLight,
                      padding: "4px 10px",
                      borderRadius: 6,
                    }}
                  >
                    {row.after}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>

    {/* CTA */}
    <section style={{ padding: "80px 0" }}>
      <Container>
        <FadeIn>
          <div
            style={{
              background: `linear-gradient(135deg, ${T.navy} 0%, #14532d 100%)`,
              borderRadius: "2rem",
              padding: "clamp(48px,6vw,80px)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(1.6rem,3.5vw,2.2rem)",
                fontWeight: 900,
                color: T.white,
                marginBottom: 20,
              }}
            >
              공정한 래플을 지금 시작해보세요
            </h2>
            <p
              style={{
                color: "#94a3b8",
                marginBottom: 40,
                maxWidth: 480,
                margin: "0 auto 40px",
                lineHeight: 1.8,
              }}
            >
              브랜드 래플 정보를 제출하면 nofake가 하이퍼레저
              기반으로 공정한 추첨을 대신 진행합니다.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/about"
                style={{
                  padding: "14px 32px",
                  backgroundColor: T.green,
                  color: T.white,
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
              >
                서비스 전체 보기 →
              </Link>
              <Link
                to="/about/transparency"
                style={{
                  padding: "14px 28px",
                  backgroundColor: "rgba(255,255,255,.08)",
                  color: T.white,
                  border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 10,
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
              >
                투명성 페이지 →
              </Link>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  </div>
);
