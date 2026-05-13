import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

const T = {
  blue: "#2563eb",
  blueLight: "#eff6ff",
  navy: "#0f172a",
  gray: "#64748b",
  grayLight: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
  text: "#1e293b",
  sub: "#475569",
  purple: "#7c3aed",
  purpleLight: "#f5f3ff",
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
      color: T.purple,
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

/* 가상 트랜잭션 타임라인 데이터 */
const TIMELINE = [
  {
    step: "01",
    event: "래플 등록",
    hash: "0x3f8a...c291",
    desc: "브랜드가 래플 정보(상품명, 수량, 기간)를 제출하고 스마트컨트랙트에 등록합니다.",
    status: "confirmed",
    time: "2025.07.01 09:00",
  },
  {
    step: "02",
    event: "응모 접수 시작",
    hash: "0x9d2b...f440",
    desc: "응모 기간이 시작되면 참가자의 DID 인증 정보가 암호화돼 원장에 순차 기록됩니다.",
    status: "confirmed",
    time: "2025.07.01 10:00",
  },
  {
    step: "03",
    event: "응모 마감",
    hash: "0x1c7e...a883",
    desc: "마감 시각이 되면 스마트컨트랙트가 자동으로 응모를 닫습니다. 이후 추가 응모는 불가합니다.",
    status: "confirmed",
    time: "2025.07.31 18:00",
  },
  {
    step: "04",
    event: "VRF 난수 생성",
    hash: "0x5e3a...b112",
    desc: "Verifiable Random Function이 실행되고, 난수 시드와 증명값이 블록에 함께 기록됩니다.",
    status: "confirmed",
    time: "2025.07.31 18:01",
  },
  {
    step: "05",
    event: "당첨자 확정 & 공개",
    hash: "0xa4f9...d657",
    desc: "당첨자 목록이 블록체인에 기록되고, 참가자는 트랜잭션 해시로 직접 결과를 검증할 수 있습니다.",
    status: "confirmed",
    time: "2025.07.31 18:02",
  },
];

const VERIFY_STEPS = [
  {
    num: "1",
    title: "이메일로 해시 수신",
    desc: "추첨 완료 시 당첨 트랜잭션 해시값을 이메일로 발송합니다.",
  },
  {
    num: "2",
    title: "블록 익스플로러 접속",
    desc: "nofake 검증 페이지 또는 Hyperledger 공개 익스플로러에 해시를 입력합니다.",
  },
  {
    num: "3",
    title: "결과 독립 검증",
    desc: "입력 데이터, 난수 증명, 당첨자 목록을 누구나 직접 확인할 수 있습니다.",
  },
];

export const TransparencyPage = () => (
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
        background: `linear-gradient(135deg, ${T.navy} 0%, #2e1065 100%)`,
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
            "radial-gradient(circle, rgba(124,58,237,.25) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />
      <Container style={{ position: "relative", zIndex: 1 }}>
        <FadeIn>
          <Link
            to="/about"
            style={{
              color: "#c4b5fd",
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
              backgroundColor: "rgba(124,58,237,.2)",
              border: "1px solid rgba(124,58,237,.4)",
              borderRadius: 999,
              fontSize: ".78rem",
              color: "#c4b5fd",
              fontWeight: 700,
              letterSpacing: ".08em",
              marginBottom: 20,
            }}
          >
            CORE VALUE · 투명성
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
            모든 트랜잭션은
            <br />
            <span style={{ color: "#a78bfa" }}>
              누구나 검증
            </span>
            할 수 있습니다
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
            nofake는 추첨 과정의 모든 단계를 블록체인 원장에
            기록합니다. 브랜드도, 참가자도, 제3자도 결과를 직접
            검증할 수 있습니다.
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
              ["온체인 기록", "전 과정 원장 저장"],
              ["실시간 검증", "트랜잭션 해시 공개"],
              ["제3자 감사", "독립 검증 가능"],
            ].map(([k, v]) => (
              <div key={k}>
                <p
                  style={{
                    color: "#a78bfa",
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

    {/* 트랜잭션 타임라인 */}
    <section style={{ padding: "96px 0" }}>
      <Container>
        <FadeIn>
          <Label>On-Chain Timeline</Label>
          <h2
            style={{
              fontSize: "clamp(1.6rem,3.5vw,2.25rem)",
              fontWeight: 800,
              color: T.navy,
              marginBottom: 16,
            }}
          >
            래플 전 과정이 블록체인에 기록됩니다
          </h2>
          <p
            style={{
              color: T.sub,
              lineHeight: 1.8,
              maxWidth: 600,
              marginBottom: 64,
            }}
          >
            아래는 실제 래플 이벤트의 온체인 타임라인
            예시입니다. 각 단계의 트랜잭션 해시를 클릭하면 블록
            익스플로러에서 직접 확인할 수 있습니다.
          </p>
        </FadeIn>
        <div style={{ maxWidth: 780, position: "relative" }}>
          {/* 세로선 */}
          <div
            style={{
              position: "absolute",
              left: 28,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: T.border,
              zIndex: 0,
            }}
          />
          {TIMELINE.map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div
                style={{
                  display: "flex",
                  gap: 32,
                  marginBottom: 40,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: T.purple,
                    color: T.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: ".85rem",
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: T.white,
                    border: `1px solid ${T.border}`,
                    borderRadius: "1.25rem",
                    padding: "24px 28px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <h4
                      style={{
                        fontWeight: 700,
                        color: T.navy,
                        fontSize: "1rem",
                        margin: 0,
                      }}
                    >
                      {item.event}
                    </h4>
                    <span
                      style={{
                        fontSize: ".78rem",
                        color: T.gray,
                      }}
                    >
                      {item.time}
                    </span>
                  </div>
                  <p
                    style={{
                      color: T.sub,
                      fontSize: ".9rem",
                      lineHeight: 1.7,
                      marginBottom: 14,
                    }}
                  >
                    {item.desc}
                  </p>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 14px",
                      backgroundColor: T.purpleLight,
                      borderRadius: 8,
                      border: `1px solid #ede9fe`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: ".75rem",
                        color: T.purple,
                        fontWeight: 700,
                      }}
                    >
                      TX
                    </span>
                    <span
                      style={{
                        fontSize: ".82rem",
                        color: T.purple,
                        fontFamily: "monospace",
                      }}
                    >
                      {item.hash}
                    </span>
                    <span
                      style={{
                        fontSize: ".75rem",
                        color: "#10b981",
                        fontWeight: 700,
                      }}
                    >
                      ✓ CONFIRMED
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>

    {/* 검증 방법 */}
    <section
      style={{
        backgroundColor: T.grayLight,
        padding: "96px 0",
      }}
    >
      <Container>
        <FadeIn>
          <Label center>How To Verify</Label>
          <h2
            style={{
              fontSize: "clamp(1.6rem,3.5vw,2.25rem)",
              fontWeight: 800,
              color: T.navy,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            결과를 직접 검증하는 방법
          </h2>
          <p
            style={{
              color: T.sub,
              textAlign: "center",
              marginBottom: 64,
            }}
          >
            별도 프로그램 없이 3단계로 누구나 추첨 결과를 확인할
            수 있습니다.
          </p>
        </FadeIn>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          {VERIFY_STEPS.map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div
                style={{
                  backgroundColor: T.white,
                  border: `1px solid ${T.border}`,
                  borderRadius: "1.5rem",
                  padding: "40px 32px",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: T.purple,
                    color: T.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    marginBottom: 24,
                  }}
                >
                  {s.num}
                </div>
                <h4
                  style={{
                    fontWeight: 700,
                    color: T.navy,
                    marginBottom: 10,
                    fontSize: "1.05rem",
                  }}
                >
                  {s.title}
                </h4>
                <p
                  style={{
                    color: T.gray,
                    lineHeight: 1.7,
                    fontSize: ".9rem",
                  }}
                >
                  {s.desc}
                </p>
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
              background: `linear-gradient(135deg, ${T.navy} 0%, #2e1065 100%)`,
              borderRadius: "2rem",
              padding: "clamp(48px,6vw,80px)",
              textAlign: "center",
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
              투명한 래플을 직접 경험해보세요
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
              모든 트랜잭션을 공개하는 nofake로 브랜드 신뢰를
              높이세요.
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
                  backgroundColor: T.purple,
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
                to="/about/trust"
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
                신뢰 페이지 →
              </Link>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  </div>
);
