/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { AuthAdapter } from "@web3auth/auth-adapter";

const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(window.atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch (error) {
    console.error("JWT parsing failed:", error);
    return null;
  }
};

const KakaoCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("카카오 로그인 처리 중...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          setStatus("로그인 코드가 없습니다.");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        setStatus("카카오 토큰 발급 중...");

        const KAKAO_CLIENT_ID = "d9c3641e6babf0f0d91c93a7ec557c40";
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
          return;
        }

        setStatus("블록체인 지갑 생성 중...");

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

        const web3auth = new Web3Auth({
          clientId: "BIM03bGrMy99Cg7hx7q8SllvgY1pkow31eE7BOBfOwAZj99GWAckaF8HofUp6LhGD7NXnp6KxJ7LGM473OnJeC8",
          web3AuthNetwork: "sapphire_mainnet",
          privateKeyProvider,
        });

        const authAdapter = new AuthAdapter({
          adapterSettings: {
            uxMode: "redirect",
            loginConfig: {
              jwt: {
                verifier: "kakao-custom-auth",
                typeOfLogin: "jwt",
                clientId: KAKAO_CLIENT_ID,
              },
            },
          },
        });

        web3auth.configureAdapter(authAdapter);
        await web3auth.initModal();

        await web3auth.connectTo("auth", {
          loginProvider: "jwt",
          extraLoginOptions: {
            id_token: tokenData.id_token,
            verifierIdField: "sub",
          },
        });

        const decodedToken = parseJwt(tokenData.id_token);
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

        await fetch(`${apiBaseUrl}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData.id_token}`,
          },
          body: JSON.stringify({
            name: decodedToken?.nickname || decodedToken?.name || decodedToken?.email || "카카오 사용자",
            email: decodedToken?.email || "",
            joinedAt: new Date().toISOString(),
            loginProvider: "kakao-web3auth",
          }),
        });

        setStatus("로그인 성공! 대시보드로 이동합니다.");
        navigate("/dashboard");
      } catch (error) {
        console.error("콜백 처리 실패:", error);
        setStatus("로그인 중 오류가 발생했습니다.");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
      <div style={{ fontSize: "32px", fontWeight: 900, marginBottom: "24px" }}>NIKE</div>
      <div className="spinner" />
      <p>{status}</p>
      <style>{`
        .spinner { width: 40px; height: 40px; border: 4px solid #eee; border-top: 4px solid #000; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default KakaoCallback;
