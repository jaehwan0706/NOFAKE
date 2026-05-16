import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { apiRequest } from '../../lib/api';

const LOGIN_TOKEN_KEY = 'nofakeAccessToken';

interface PhoneVerificationSession {
  sessionId: string;
  receiverNumber: string;
  expiresAt: string;
  pollIntervalSeconds?: number;
}

interface VerificationStatusResponse {
  status: 'pending' | 'verified' | string;
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
      // attach phone
      await apiRequest('/api/user/phone', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: { phoneNumber: phone } });

      // start session
      const startResp = await apiRequest<PhoneVerificationSession>('/api/phone-verification/start', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: { phoneNumber: phone } });
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
          <label className="block text-left text-sm font-medium text-gray-700">휴대폰 번호 (예: +821012345678)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" />
          <button onClick={startVerification} className="mt-4 w-full rounded bg-yellow-400 px-4 py-2 font-semibold">인증 시작</button>
          <p className="mt-2 text-sm text-gray-500">안내에 따라 본인 휴대폰에서 안내 번호로 문자 전송 후 인증이 완료됩니다.</p>
        </div>
      ) : (
        <div className="mt-6 w-full max-w-md text-left">
          <p className="text-sm text-gray-700">문자를 다음 번호로 보내세요:</p>
          <div className="mt-2 rounded-md border p-4 bg-gray-50">
            <div className="font-mono text-lg">{session.receiverNumber}</div>
            <div className="mt-2 text-sm text-gray-600">만료: {new Date(session.expiresAt).toLocaleString()}</div>
          </div>
          <p className="mt-4 text-sm text-gray-700">문자 전송 후 인증이 자동으로 확인됩니다. 완료되면 메인으로 이동합니다.</p>
          <div className="mt-4 text-sm text-gray-500">상태: {status}</div>

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
