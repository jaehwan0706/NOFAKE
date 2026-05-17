import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { apiRequest } from '../../lib/api';

const LOGIN_TOKEN_KEY = 'nofakeAccessToken';

interface PhoneVerificationSession {
  sessionId: string;
  receiverNumber: string;
  verificationCode: string; // Octomo 인증 코드 추가
  expiresAt: string;
  pollIntervalSeconds?: number;
}

interface VerificationStatusResponse {
  status: 'pending' | 'verified' | 'expired' | string;
}

export function PhoneVerification() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [session, setSession] = useState<PhoneVerificationSession | null>(null);
  const [status, setStatus] = useState('');
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(LOGIN_TOKEN_KEY);
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!session) return;

    const poll = async () => {
      try {
        const token = localStorage.getItem(LOGIN_TOKEN_KEY) || '';
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/phone-verification/status?sessionId=${session.sessionId}`, {
          headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': '69420' },
        });
        const data = await res.json() as VerificationStatusResponse;
        
        if (data.status === 'verified') {
          setStatus('휴대폰 인증 성공! 로그인 처리 중...');
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          setTimeout(() => navigate('/', { replace: true }), 800);
        } else if (data.status === 'expired') {
          setStatus('인증 시간이 만료되었습니다. 다시 시도해주세요.');
          if (pollingRef.current) window.clearInterval(pollingRef.current);
        }
      } catch (err) {
        console.error('poll error', err);
      }
    };

    const intervalMs = session.pollIntervalSeconds ? session.pollIntervalSeconds * 1000 : 3000;
    pollingRef.current = window.setInterval(poll, intervalMs);
    return () => { if (pollingRef.current) window.clearInterval(pollingRef.current); };
  }, [session, navigate]);

  const startVerification = async () => {
    const token = localStorage.getItem(LOGIN_TOKEN_KEY) || '';
    if (!token) return navigate('/login');

    try {
      // start session (Octomo MO 인증 시작)
      const startResp = await apiRequest<PhoneVerificationSession>('/api/phone-verification/start', { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}` }, 
        body: { phoneNumber: phone } 
      });
      
      setSession(startResp);
      setStatus('인증 대기 중...');
    } catch (err) {
      console.error(err);
      setStatus('인증 시작에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="text-3xl font-black text-gray-900">휴대폰 소유 확인</div>
      {!session ? (
        <div className="mt-6 w-full max-w-md">
          <label className="block text-left text-sm font-medium text-gray-700">휴대폰 번호 (예: 01012345678)</label>
          <input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="01012345678"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none" 
          />
          <button onClick={startVerification} className="mt-4 w-full rounded bg-yellow-400 px-4 py-2 font-bold hover:bg-yellow-500 transition-colors">
            인증 시작하기
          </button>
          <p className="mt-4 text-sm text-gray-500">
            안내에 따라 본인 휴대폰에서 지정된 번호로 문자를 전송하면 인증이 완료됩니다.
          </p>
        </div>
      ) : (
        <div className="mt-6 w-full max-w-md text-left">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
            <p className="text-sm font-bold text-blue-800 mb-4">아래 정보를 확인하여 문자를 보내주세요:</p>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">받는 사람</span>
                <div className="text-2xl font-mono font-black text-blue-900">{session.receiverNumber}</div>
              </div>
              
              <div>
                <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">문자 내용</span>
                <div className="text-4xl font-mono font-black text-blue-900 tracking-widest">{session.verificationCode}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-700 font-medium">
              ✅ <span className="text-blue-600">{session.receiverNumber}</span> 번호로 <span className="text-blue-600 font-bold">{session.verificationCode}</span> 숫자를 문자(SMS)로 보내주세요.
            </p>
            <p className="text-sm text-gray-600">
              ✅ 문자 전송 후 잠시 기다리시면 인증이 자동으로 완료됩니다.
            </p>
            <p className="text-xs text-gray-400">
              만료 시간: {new Date(session.expiresAt).toLocaleString()}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 py-3 px-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="text-sm font-bold text-gray-600">{status}</div>
          </div>

          {/* 개발용 테스트 버튼 */}
          <div className="mt-10 p-4 border-2 border-dashed border-yellow-200 rounded-lg bg-yellow-50">
            <p className="text-xs font-bold text-yellow-700 mb-2">⚠️ 개발자 전용 (테스트용)</p>
            <button
              onClick={async () => {
                try {
                  await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/phone-verification/mock-verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: session.sessionId })
                  });
                  setStatus('Mock 인증 요청 완료. 잠시만 기다려주세요...');
                } catch (err) {
                  console.error('Mock verify failed', err);
                }
              }}
              className="w-full py-2 bg-gray-800 text-white text-xs font-bold rounded hover:bg-black transition-colors"
            >
              인증 강제 완료 처리 (SMS 무시)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default PhoneVerification;
