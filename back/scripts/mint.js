const { ethers } = require("hardhat");
require("dotenv").config(); // .env 파일의 환경변수 로드

async function main() {
    // .env에 저장한 컨트랙트 주소 가져오기
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const NoFake = await ethers.getContractAt("NoFakePlatform", contractAddress);

    // 민팅 대상 정보 (테스트용)
    const userAddress = "0x...정민님지갑주소"; 
    const raffleId = 1; // 상품 번호

    console.log(`${userAddress}에게 ${raffleId}번 상품 티켓 발행 중...`);

    // [함수 호출: Mint]
    const tx = await NoFake.mintRaffleTicket(userAddress, raffleId);
    
    // 트랜잭션 확정 대기
    await tx.wait();

    console.log("민팅 완료! 트랜잭션 해시:", tx.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});