import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { loginUser, useAuthUser } from '../../lib/authUser';
import { MessageSquare, Phone, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

const LOGIN_TOKEN_KEY = 'nofakeAccessToken';

interface PhoneVerificationSession {
  sessionId: string;
  receiverNumber: string;
  verificationCode: string;
  expiresAt: string;
  pollIntervalSeconds?: number;
}

interface VerificationStatusResponse {
  status: 'pending' | 'verified' | 'expired' | string;
}

export function PhoneVerification() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const [phone, setPhone] = useState('');
  const [session, setSession] = useState<PhoneVerificationSession | null>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    if (user && user.phone_verified === true) {
      navigate('/', { replace: true });
      return;
    }
    
    const token = localStorage.getItem(LOGIN_TOKEN_KEY);
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!session) return;

    const poll = async () => {
      try {
        const token = localStorage.getItem(LOGIN_TOKEN_KEY) || '';
        const data = await apiRequest<VerificationStatusResponse>(`/api/phone-verification/status?sessionId=${session.sessionId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '69420'
          },
        });
        
        if (data.status === 'verified') {
          setStatus('verified');
          if (user) {
            loginUser({ ...user, phone_verified: true });
          }
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          setTimeout(() => navigate('/', { replace: true }), 1500);
        } else if (data.status === 'expired') {
          setStatus('expired');
          if (pollingRef.current) window.clearInterval(pollingRef.current);
        }
      } catch (err) {
        console.error('poll error', err);
      }
    };

    const intervalMs = session.pollIntervalSeconds ? session.pollIntervalSeconds * 1000 : 3000;
    pollingRef.current = window.setInterval(poll, intervalMs);
    return () => { if (pollingRef.current) window.clearInterval(pollingRef.current); };
  }, [session, navigate, user]);

  const startVerification = async () => {
    if (!phone) return;
    setIsLoading(true);
    const token = localStorage.getItem(LOGIN_TOKEN_KEY) || '';
    
    try {
      const startResp = await apiRequest<PhoneVerificationSession>('/api/phone-verification/start', { 
        method: 'POST', 
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        }, 
        body: { phoneNumber: phone } 
      });
      
      setSession(startResp);
      setStatus('pending');
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : '알 수 없는 오류';
      alert(`인증 시작에 실패했습니다. (${errMsg})\n다시 시도해주세요.`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    if (pollingRef.current) window.clearInterval(pollingRef.current);
    setSession(null);
    setStatus('');
  };

  const handleDevBypass = async () => {
    let currentSessionId = session?.sessionId;
    
    // 세션이 없으면 먼저 시작
    if (!currentSessionId) {
      try {
        const token = localStorage.getItem(LOGIN_TOKEN_KEY) || '';
        const startResp = await apiRequest<PhoneVerificationSession>('/api/phone-verification/start', { 
          method: 'POST', 
          headers: { Authorization: `Bearer ${token}` }, 
          body: { phoneNumber: '01000000000' } 
        });
        currentSessionId = startResp.sessionId;
        setSession(startResp);
      } catch (err) {
        console.error('Failed to start session for bypass', err);
        return;
      }
    }

    // 강제 인증 호출
    try {
      const token = localStorage.getItem(LOGIN_TOKEN_KEY) || '';
      await apiRequest('/api/phone-verification/mock-verify', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        },
        body: { sessionId: currentSessionId }
      });
      
      setStatus('verified');
      if (user) {
        loginUser({ ...user, phone_verified: true });
      }
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err) {
      console.error('Mock verify failed', err);
      alert('인증 건너뛰기에 실패했습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-black p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">휴대폰 본인 확인</h1>
          <p className="text-gray-400 text-sm">안전한 서비스 이용을 위해 인증이 필요합니다.</p>
        </div>

        <div className="p-8">
          {!session ? (
            <div className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-gray-700 ml-1">휴대폰 번호</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="tel"
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                    placeholder="숫자만 입력해 주세요"
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium text-lg" 
                  />
                </div>
              </div>

              <button 
                onClick={startVerification} 
                disabled={isLoading || !phone}
                className="group w-full h-14 bg-black text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    인증 시작하기
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex gap-3 text-left">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-blue-500">i</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    본인 명의의 휴대폰으로만 인증이 가능합니다. 별도의 발송 비용 없이 옥토모(OCTOMO) 시스템을 통해 안전하게 진행됩니다.
                  </p>
                </div>
              </div>

              {/* Dev Bypass Section */}
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <button
                  onClick={handleDevBypass}
                  className="w-full h-12 bg-amber-50 text-amber-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-100 transition-all"
                >
                  인증 건너뛰기 (개발용)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Step 1: Send Message */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">1</span>
                  <h2 className="font-bold text-gray-900">문자 메시지 보내기</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">받는 사람</span>
                    <span className="text-lg font-black text-gray-900 font-mono tracking-tighter">{session.receiverNumber}</span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">문자 내용</span>
                    <span className="text-2xl font-black text-blue-600 font-mono tracking-widest">{session.verificationCode}</span>
                  </div>
                </div>
              </div>

              {/* Status Display */}
              <div className="relative">
                {status === 'verified' ? (
                  <div className="bg-emerald-50 text-emerald-600 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center gap-2 animate-in zoom-in-95 duration-300">
                    <CheckCircle2 className="w-10 h-10" />
                    <span className="font-bold text-lg">인증이 완료되었습니다!</span>
                  </div>
                ) : status === 'expired' ? (
                  <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center space-y-3">
                    <p className="font-bold">인증 시간이 만료되었습니다.</p>
                    <button 
                      onClick={resetSession}
                      className="text-sm underline font-bold"
                    >
                      다시 시도하기
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-sm font-bold text-gray-600">인증 대기 중입니다...</span>
                    </div>
                    <p className="text-xs text-gray-400 text-center leading-relaxed">
                      문자를 보내시면 자동으로 확인됩니다.<br/>잠시만 기다려 주세요.
                    </p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-left bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <div className="flex gap-3">
                  <MessageSquare className="w-4 h-4 text-zinc-400 mt-0.5" />
                  <p className="text-xs text-zinc-600 leading-normal">
                    본인의 휴대폰에서 <span className="font-bold text-zinc-900">{session.receiverNumber}</span> 번호로 <span className="font-bold text-zinc-900">{session.verificationCode}</span> 숫자만 입력하여 전송해 주세요.
                  </p>
                </div>
                <button 
                  onClick={resetSession}
                  className="w-full mt-2 text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  입력한 번호가 틀리셨나요? 처음으로 돌아가기
                </button>
              </div>

              {/* Dev Bypass Section */}
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <button
                  onClick={handleDevBypass}
                  className="w-full h-10 bg-amber-50 text-amber-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-100 transition-all opacity-50 hover:opacity-100"
                >
                  강제 인증 완료 (개발용)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default PhoneVerification;
