import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Building2,
  Users,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";
// import axios from "axios"; // API 연동 시 주석 해제

// ─── 타입 ───────────────────────────────────────────
interface FormValues {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  privacyAgreed: boolean;
}

interface FormErrors {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  inquiryType?: string;
  message?: string;
  privacyAgreed?: string;
}

// ─── 유효성 검사 ────────────────────────────────────
const validate = (data: FormValues): FormErrors => {
  const errors: FormErrors = {};
  if (!data.companyName.trim()) errors.companyName = "회사명을 입력해주세요.";
  if (!data.contactName.trim()) errors.contactName = "담당자명을 입력해주세요.";
  if (!data.email.trim()) errors.email = "이메일을 입력해주세요.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "올바른 이메일 형식이 아닙니다.";
  if (!data.phone.trim()) errors.phone = "전화번호를 입력해주세요.";
  else if (!/^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/.test(data.phone)) errors.phone = "형식에 맞게 입력해주세요. (예: 02-1234-5678)";
  if (!data.inquiryType) errors.inquiryType = "문의 유형을 선택해주세요.";
  if (!data.message.trim()) errors.message = "문의 내용을 입력해주세요.";
  else if (data.message.trim().length < 10) errors.message = "문의 내용을 10자 이상 입력해주세요.";
  if (!data.privacyAgreed) errors.privacyAgreed = "개인정보 수집 및 이용에 동의해주세요.";
  return errors;
};

// ─── 전화번호 자동 포맷 ──────────────────────────────
const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("02")) {
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

// ─── 정적 데이터 ─────────────────────────────────────
const BENEFITS = [
  { icon: <Users className="w-6 h-6 text-gray-900" />, title: "대규모 고객 접근", desc: "50만 이상의 활성 사용자에게 브랜드를 노출하세요" },
  { icon: <Shield className="w-6 h-6 text-gray-900" />, title: "공정한 시스템", desc: "블록체인 기반 추첨으로 브랜드 신뢰도를 높입니다" },
  { icon: <Zap className="w-6 h-6 text-gray-900" />, title: "빠른 캠페인 런칭", desc: "최소 3일 이내 캠페인 오픈 가능합니다" },
  { icon: <Building2 className="w-6 h-6 text-gray-900" />, title: "전담 매니저 지원", desc: "캠페인 기획부터 운영까지 1:1 전담 지원" },
];

const PROCESS = [
  { step: "01", title: "파트너십 문의", desc: "문의 폼 작성 및 제출" },
  { step: "02", title: "상담 진행", desc: "3영업일 내 담당자 연락" },
  { step: "03", title: "제안서 검토", desc: "캠페인 기획 및 견적 제공" },
  { step: "04", title: "계약 체결", desc: "파트너십 계약 및 온보딩" },
  { step: "05", title: "캠페인 런칭", desc: "플랫폼 캠페인 오픈" },
];

const PARTNER_LOGOS = ["NIKE", "adidas", "MUSINSA", "Supreme", "JORDAN", "New Balance", "PUMA", "CONVERSE", "Vans", "Reebok"];

const INQUIRY_TYPES = ["신규 래플 캠페인 진행", "장기 파트너십 계약", "단발성 이벤트 협업", "기타 문의"];

const INITIAL_FORM: FormValues = {
  companyName: "", contactName: "", email: "", phone: "", inquiryType: "", message: "", privacyAgreed: false,
};

// ─── 공통 컴포넌트 ────────────────────────────────────
const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  ) : null;

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-300 focus:ring-red-100 bg-red-50"
      : "border-gray-200 focus:ring-gray-200 focus:border-gray-400"
  }`;

// ─── 메인 컴포넌트 ────────────────────────────────────
export function Partnership() {
  const [formData, setFormData] = useState<FormValues>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
      // ↓↓↓ API 연동 시 아래 주석 해제하고 setTimeout 블록 삭제 ↓↓↓
      // await axios.post(`${import.meta.env.VITE_API_URL}/partnership/inquiry`, {
      //   companyName:  formData.companyName,
      //   contactName:  formData.contactName,
      //   email:        formData.email,
      //   phone:        formData.phone,
      //   inquiryType:  formData.inquiryType,
      //   message:      formData.message,
      // });
      // ↑↑↑ 여기까지 ↑↑↑

      // 임시 딜레이 (API 연동 후 아래 블록 삭제)
      await new Promise((res) => setTimeout(res, 1200));

      setSubmittedEmail(formData.email);
      setIsSuccess(true);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ── 제출 완료 화면 ──
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md w-full">
          <div className="w-14 h-14 bg-gray-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">문의가 접수되었습니다</h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            입력하신 이메일(<span className="font-medium text-gray-700">{submittedEmail}</span>)로
            <br />3영업일 내 담당자가 연락드릴 예정입니다.
          </p>
          <button
            onClick={() => { setFormData(INITIAL_FORM); setIsSuccess(false); }}
            className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-900 transition-colors"
          >
            새로운 문의하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="bg-gray-950 text-white pt-36 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-6">Brand Partnership</p>
          <h1 className="text-5xl font-bold mb-6">브랜드 파트너십</h1>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            국내 최대 래플 플랫폼 nofake와 함께
            <br />브랜드 가치를 높이고 고객과의 신뢰를 구축하세요
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {["월 50만+ 활성 사용자", "15+ 글로벌 브랜드 파트너", "99.9% 고객 만족도"].map((text) => (
              <div key={text} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 shrink-0 text-gray-300" />
                <span className="text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 혜택 ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">파트너십 혜택</h2>
            <p className="text-gray-400 text-sm">nofake와 함께하면 이런 점이 좋습니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-5">
                  {b.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 진행 절차 ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">파트너십 진행 절차</h2>
            <p className="text-gray-400 text-sm">간단한 5단계로 시작하세요</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {PROCESS.map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center h-full">
                  <div className="text-gray-900 font-black text-2xl mb-3">{item.step}</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                {i < PROCESS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-5 h-5 text-gray-300 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 파트너사 로고 ── */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-2">현재 파트너사</h3>
            <p className="text-gray-400 text-sm">글로벌 브랜드들이 신뢰하는 플랫폼</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {PARTNER_LOGOS.map((logo) => (
              <div key={logo} className="flex items-center justify-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors">
                <span className="text-sm font-bold text-gray-700">{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 문의 폼 ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">파트너십 문의하기</h2>
            <p className="text-gray-400 text-sm">담당자가 3영업일 내에 연락드립니다</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
            {isError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  회사명 <span className="text-red-400">*</span>
                </label>
                <input
                  value={formData.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  className={inputClass(!!errors.companyName)}
                  placeholder="주식회사 나이키코리아"
                />
                <FieldError message={errors.companyName} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  담당자명 <span className="text-red-400">*</span>
                </label>
                <input
                  value={formData.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  className={inputClass(!!errors.contactName)}
                  placeholder="홍길동"
                />
                <FieldError message={errors.contactName} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  이메일 <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputClass(!!errors.email)}
                  placeholder="contact@company.com"
                />
                <FieldError message={errors.email} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  전화번호 <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => set("phone", formatPhone(e.target.value))}
                  maxLength={13}
                  className={inputClass(!!errors.phone)}
                  placeholder="02-1234-5678"
                />
                <FieldError message={errors.phone} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                문의 유형 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.inquiryType}
                onChange={(e) => set("inquiryType", e.target.value)}
                className={`${inputClass(!!errors.inquiryType)} bg-white`}
              >
                <option value="">유형을 선택해주세요</option>
                {INQUIRY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <FieldError message={errors.inquiryType} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                문의 내용 <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={5}
                value={formData.message}
                onChange={(e) => set("message", e.target.value)}
                className={inputClass(!!errors.message)}
                placeholder="파트너십 관련 문의 사항을 자유롭게 작성해주세요 (최소 10자)"
              />
              <div className="flex items-start justify-between mt-1">
                <FieldError message={errors.message} />
                <span className={`text-xs ml-auto shrink-0 ${formData.message.length >= 10 ? "text-gray-400" : "text-red-400"}`}>
                  {formData.message.length}자
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
              <p className="text-xs text-gray-400 leading-relaxed">
                수집 항목: 회사명, 담당자명, 이메일, 전화번호 · 수집 목적: 파트너십 상담 및 안내 · 보유 기간: 문의 처리 완료 후 1년
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.privacyAgreed}
                  onChange={(e) => set("privacyAgreed", e.target.checked)}
                  className="w-4 h-4 accent-gray-900"
                />
                <span className="text-sm text-gray-700">
                  개인정보 수집 및 이용에 동의합니다 <span className="text-red-400">*</span>
                </span>
              </label>
              <FieldError message={errors.privacyAgreed} />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gray-950 text-white h-12 rounded-xl font-semibold text-sm hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  제출 중...
                </>
              ) : (
                "파트너십 문의 제출"
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              <span className="text-red-400">*</span> 표시는 필수 입력 항목입니다
            </p>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm mb-3">빠른 상담을 원하시나요?</p>
            <div className="flex items-center justify-center gap-6">
              <a href="mailto:partnership@nofake.io" className="text-sm text-gray-700 font-semibold hover:text-gray-900 transition-colors">
                📧 partnership@???.??
              </a>
              <a href="tel:1533-2771" className="text-sm text-gray-700 font-semibold hover:text-gray-900 transition-colors">
                📞 ????-????
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}