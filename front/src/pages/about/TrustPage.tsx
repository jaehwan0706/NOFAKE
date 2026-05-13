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
  amber: "#d97706",
  amberLight: "#fffbeb",
  amberBright: "#f59e0b",
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
      color: T.amber,
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

const TRUST_LAYERS = [
  {
    icon: "🔒",
    title: "ISO 27001 정보보안 인증",
    desc: "국제 정보보안 표준 인증을 획득해 데이터 처리·저장·전송 전 과정에 보안 체계를 적용합니다.",
  },
  {
    icon: "⛓",
    title: "Hyperledger Fabric 인프라",
    desc: "퍼미션드 블록체인 위에서 모든 래플 데이터를 관리하며, 허가된 노드만 참여하는 프라이빗 환경을 유지합니다.",
  },
  {
    icon: "👤",
    title: "DID 신원인증 & 개인정보 보호",
    desc: "개인 식별정보 없이 분산신원(DID)으로 본인 확인을 완료합니다. 최소한의 데이터만 수집합니다.",
  },
  {
    icon: "🛡",
    title: "99.9% SLA 가동률 보장",
    desc: "멀티 리전 인프라와 자동 페일오버를 통해 래플 진행 중 다운타임 없이 서비스를 제공합니다.",
  },
  {
    icon: "🏛",
    title: "공공기관 200+ 납품 실적",
    desc: "정부·지자체·금융기관 등 엄격한 심사를 통과한 공공 프로젝트에서 검증된 신뢰성을 보유합니다.",
  },
  {
    icon: "📋",
    title: "제3자 감사 & 규정 준수",
    desc: "독립된 외부 감사 기관의 정기 검토를 통해 운영 무결성을 유지하며, GDPR·개인정보보호법을 준수합니다.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "nofake를 도입한 후 래플 관련 고객 민원이 사실상 사라졌습니다. 결과 검증 링크 하나로 모든 의심을 해소할 수 있습니다.",
    name: "김지현",
    role: "마케팅 디렉터",
    company: "한정판 스니커즈 브랜드 A사",
    avatar: "👟",
  },
  {
    quote:
      "공공 청약 시스템에 블록체인을 적용하는 건 쉽지 않은 선택이었지만, nofake 팀의 기술력과 대응 속도가 모든 불안을 해소해줬습니다.",
    name: "이민준",
    role: "IT 인프라 팀장",
    company: "서울시 산하 공공기관",
    avatar: "🏛",
  },
  {
    quote:
      "IPO 추첨 공정성 강화를 위해 nofake를 선택했습니다. 감사 보고서 제출에도 블록체인 원장 데이터가 결정적인 역할을 했습니다.",
    name: "박서연",
    role: "컴플라이언스 담당",
    company: "핀테크 금융사",
    avatar: "🏦",
  },
];

const CERTIFICATIONS = [
  { label: "ISO 27001", sub: "정보보안 관리체계" },
  { label: "개인정보보호법", sub: "국내 규정 완전 준수" },
  { label: "GDPR", sub: "EU 개인정보보호 규정" },
  { label: "과기부 장관상", sub: "2024년 공공혁신 부문" },
];

export const TrustPage = () => (
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
        background: `linear-gradient(135deg, ${T.navy} 0%, #451a03 100%)`,
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
            "radial-gradient(circle, rgba(245,158,11,.2) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />
      <Container style={{ position: "relative", zIndex: 1 }}>
        <FadeIn>
          <Link
            to="/about"
            style={{
              color: "#fcd34d",
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
              backgroundColor: "rgba(245,158,11,.2)",
              border: "1px solid rgba(245,158,11,.4)",
              borderRadius: 999,
              fontSize: ".78rem",
              color: "#fcd34d",
              fontWeight: 700,
              letterSpacing: ".08em",
              marginBottom: 20,
            }}
          >
            CORE VALUE · 신뢰
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
            데이터 무결성 위에 세운
            <br />
            <span style={{ color: "#fbbf24" }}>
              변하지 않는 약속
            </span>
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
            nofake는 기술적 보증, 법적 준수, 실증된 레퍼런스를
            통해 브랜드와 참가자 모두에게 변하지 않는 신뢰를
            제공합니다.
          </p>
        </FadeIn>
        <FadeIn delay={0.22}>
          <div
            style={{
              display: "flex",
              gap: 48,
              flexWrap: "wrap",
            }}
          >
            {[
              ["200+", "공공기관 납품"],
              ["99.9%", "SLA 가동률 보장"],
              ["0건", "데이터 무결성 위반"],
            ].map(([num, label]) => (
              <div key={label}>
                <p
                  style={{
                    color: "#fbbf24",
                    fontWeight: 900,
                    fontSize: "2rem",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {num}
                </p>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: ".82rem",
                    margin: "4px 0 0",
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </section>

    {/* 신뢰 레이어 */}
    <section style={{ padding: "96px 0" }}>
      <Container>
        <FadeIn>
          <Label>Trust Layers</Label>
          <h2
            style={{
              fontSize: "clamp(1.6rem,3.5vw,2.25rem)",
              fontWeight: 800,
              color: T.navy,
              marginBottom: 16,
            }}
          >
            신뢰를 구성하는 6가지 레이어
          </h2>
          <p
            style={{
              color: T.sub,
              lineHeight: 1.8,
              maxWidth: 600,
              marginBottom: 64,
            }}
          >
            보안 인증, 기술 인프라, 법적 준수, 검증된 운영
            실적으로 쌓인 신뢰입니다.
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
          {TRUST_LAYERS.map((item, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div
                style={{
                  border: `1px solid ${T.border}`,
                  borderRadius: "1.25rem",
                  padding: "32px 28px",
                  backgroundColor: T.white,
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "1rem",
                    backgroundColor: T.amberLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <h4
                    style={{
                      fontWeight: 700,
                      color: T.navy,
                      marginBottom: 8,
                      fontSize: ".97rem",
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    style={{
                      color: T.gray,
                      fontSize: ".87rem",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>

    {/* 인증 배지 */}
    <section
      style={{
        backgroundColor: T.grayLight,
        padding: "64px 0",
      }}
    >
      <Container>
        <FadeIn>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: T.navy,
              textAlign: "center",
              marginBottom: 40,
            }}
          >
            인증 및 규정 준수
          </h3>
        </FadeIn>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {CERTIFICATIONS.map((cert, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div
                style={{
                  backgroundColor: T.white,
                  border: `1px solid ${T.border}`,
                  borderRadius: "1rem",
                  padding: "20px 28px",
                  textAlign: "center",
                  minWidth: 160,
                }}
              >
                <p
                  style={{
                    fontWeight: 800,
                    color: T.amber,
                    fontSize: "1rem",
                    marginBottom: 4,
                  }}
                >
                  {cert.label}
                </p>
                <p
                  style={{
                    color: T.gray,
                    fontSize: ".8rem",
                    margin: 0,
                  }}
                >
                  {cert.sub}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>

    {/* 고객 증언 */}
    <section style={{ padding: "96px 0" }}>
      <Container>
        <FadeIn>
          <Label center>Customer Voices</Label>
          <h2
            style={{
              fontSize: "clamp(1.6rem,3.5vw,2.25rem)",
              fontWeight: 800,
              color: T.navy,
              textAlign: "center",
              marginBottom: 56,
            }}
          >
            nofake를 선택한 이유
          </h2>
        </FadeIn>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div
                style={{
                  border: `1px solid ${T.border}`,
                  borderRadius: "1.5rem",
                  padding: "36px 32px",
                  backgroundColor: T.white,
                }}
              >
                <div
                  style={{
                    fontSize: "1.8rem",
                    marginBottom: 20,
                  }}
                >
                  ❝
                </div>
                <p
                  style={{
                    color: T.text,
                    lineHeight: 1.8,
                    fontSize: ".93rem",
                    marginBottom: 28,
                    fontStyle: "italic",
                  }}
                >
                  {t.quote}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      backgroundColor: T.amberLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: 700,
                        color: T.navy,
                        margin: 0,
                        fontSize: ".9rem",
                      }}
                    >
                      {t.name}
                    </p>
                    <p
                      style={{
                        color: T.gray,
                        fontSize: ".8rem",
                        margin: 0,
                      }}
                    >
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>

    {/* CTA */}
    <section style={{ padding: "0 0 96px" }}>
      <Container>
        <FadeIn>
          <div
            style={{
              background: `linear-gradient(135deg, ${T.navy} 0%, #451a03 100%)`,
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
              신뢰받는 래플 플랫폼을 선택하세요
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
              공정성, 투명성, 신뢰 — 세 가지 핵심 가치가
              nofake의 모든 기술을 이끕니다.
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
                  backgroundColor: T.amberBright,
                  color: T.navy,
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
                to="/about/fairness"
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
                공정성 페이지 →
              </Link>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  </div>
);
