import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

const KakaoCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("카카오 로그인 처리 중...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. URL에서 카카오가 넘겨준 code 추출
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          setStatus("로그인 코드가 없습니다. 다시 시도해주세요.");
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        setStatus("카카오 토큰 발급 중...");

        // 2. 카카오 code → access_token 교환
        const KAKAO_CLIENT_ID = "d9c3641e6babf0f0d91c93a7ec557c40"; // ← 실제 키로 교체
        const REDIRECT_URI = "http://localhost:3000/auth/kakao/callback";

        const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: KAKAO_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            code,
          }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.id_token) {
          console.error("토큰 발급 실패:", tokenData);
          setStatus("토큰 발급 실패. 다시 시도해주세요.");
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        setStatus("블록체인 지갑 생성 중...");

        // 3. Web3Auth 초기화
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x1",
          rpcTarget: "https://rpc.ankr.com/eth",
          displayName: "Ethereum Mainnet",
          ticker: "ETH",
          tickerName: "Ethereum",
        };

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3authInstance = new Web3Auth({
          clientId: "BIM03bGrMy99Cg7hx7q8SllvgY1pkow31eE7BOBfOwAZj99GWAckaF8HofUp6LhGD7NXnp6KxJ7LGM473OnJeC8",
          web3AuthNetwork: "sapphire_devnet",
          privateKeyProvider,
        });

        await web3authInstance.init();

        // 4. Web3Auth에 카카오 JWT 전달 → 지갑 자동 생성
        await web3authInstance.connectTo("auth", {
          verifier: "kakao-custom-auth", // ← Web3Auth 대시보드의 Auth Connection ID
          idToken: tokenData.id_token,   // 카카오가 발급한 JWT
        });

        setStatus("로그인 성공! 이동 중...");
        navigate('/dashboard');

      } catch (error) {
        console.error("콜백 처리 실패:", error);
        setStatus("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
      fontFamily: "sans-serif",
    }}>
      <div style={{ fontSize: "32px", fontWeight: 900, marginBottom: "24px" }}>NIKE</div>
      <div style={{
        width: "40px", height: "40px",
        border: "4px solid #eee",
        borderTop: "4px solid #e00000",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        marginBottom: "20px",
      }} />
      <p style={{ color: "#555", fontSize: "14px" }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default KakaoCallback;