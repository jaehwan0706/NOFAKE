import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { AuthAdapter } from "@web3auth/auth-adapter";

const KakaoCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("로그인 상태 확인 중...");
  const hasExecuted = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasExecuted.current) return;
      hasExecuted.current = true;

      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x1",
          rpcTarget: "https://ethereum-rpc.publicnode.com", 
        };

        const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });
        
        const web3authInstance = new Web3Auth({
          clientId: "BIM03bGrMy99Cg7hx7q8SllvgY1pkow31eE7BOBfOwAZj99GWAckaF8HofUp6LhGD7NXnp6KxJ7LGM473OnJeC8",
          web3AuthNetwork: "sapphire_devnet",
          privateKeyProvider,
          uiConfig: { uxMode: "redirect" }
        });

        const authAdapter = new AuthAdapter({
          adapterSettings: {
            uxMode: "redirect",
            loginConfig: {
              jwt: {
                verifier: "kakao-custom-auth",
                typeOfLogin: "jwt",
                clientId: "d9c3641e6babf0f0d91c93a7ec557c40", 
              },
            },
          },
        });
        web3authInstance.configureAdapter(authAdapter);
        await web3authInstance.init();

        // ⭐️ [수정 1] 이미 연결된 경우에도 주소를 찍고 3초 대기 후 이동
        if (web3authInstance.connected) {
          const accounts = await web3authInstance.provider.request({ method: "eth_accounts" });
          const address = accounts[0];
          console.log("==========================================");
          console.log("✅ 기존 세션 지갑 주소:", address);
          console.log("==========================================");
          
          setStatus(`기존 지갑 연결됨: ${address.slice(0, 6)}...${address.slice(-4)}`);
          // 주소 확인할 시간을 주기 위해 3초 대기
          await new Promise(resolve => setTimeout(resolve, 3000));
          navigate('/dashboard');
          return;
        }

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          navigate('/login');
          return;
        }

        setStatus("카카오 토큰 발급 중...");
        const tokenRes = await fetch("http://localhost:3001/api/auth/kakao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }), 
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.id_token) throw new Error("토큰 발급 실패");

        setStatus("블록체인 지갑 생성 중...");
        
        await web3authInstance.connectTo("auth", {
          loginProvider: "jwt",
          extraLoginOptions: {
            id_token: tokenData.id_token,
            verifierIdField: "sub", 
          },
        });

        // ⭐️ [수정 2] 신규 로그인 시에도 주소 찍고 5초 대기
        if (web3authInstance.provider) {
          const accounts = await web3authInstance.provider.request({ method: "eth_accounts" });
          const address = accounts[0];
          console.log("==========================================");
          console.log("🔥 신규 생성 지갑 주소:", address);
          console.log("==========================================");
          
          setStatus(`🎉 신규 지갑 생성 성공! 주소: ${address.slice(0, 10)}...`);

          // 백엔드에 주소 전달
          await fetch("http://localhost:3001/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${tokenData.id_token}`
            },
            body: JSON.stringify({ address })
          });

          // 5초 동안 멈춰서 주소 확인할 시간 확보
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        setStatus("이동 중...");
        navigate('/dashboard');

      } catch (error) {
        console.error("❌ 상세 에러:", error);
        setStatus(`오류 발생: ${error.message}`);
      }
    };
    handleCallback();
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
      <div style={{ fontSize: "32px", fontWeight: 900, marginBottom: "24px" }}>NIKE</div>
      <div style={{ width: "40px", height: "40px", border: "4px solid #eee", borderTop: "4px solid #e00000", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ marginTop: "20px", color: "#555", fontWeight: "bold", textAlign: "center", padding: "0 20px" }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default KakaoCallback;
