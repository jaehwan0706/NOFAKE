/**
 * 카카오 인증 관련 설정을 관리합니다.
 */
export const getKakaoAuthConfig = () => {
  return {
    name: "Kakao Login",
    verifier: "YOUR_KAKAO_VERIFIER_NAME", // Web3Auth 대시보드에서 만든 Verifier 이름
    typeOfLogin: "kakao",
    clientId: "YOUR_KAKAO_CLIENT_ID", // 카카오 개발자 센터에서 발급받은 REST API 키
  };
};

/**
 * 로그인이 완료된 후 사용자 정보를 가져오는 함수
 */
export const getUserInfo = async (web3auth) => {
  if (!web3auth) return null;
  try {
    const user = await web3auth.getUserInfo();
    console.log("카카오 사용자 정보:", user);
    return user;
  } catch (error) {
    console.error("사용자 정보를 가져오는 데 실패했습니다.", error);
    return null;
  }
};