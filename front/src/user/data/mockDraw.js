const mockDraw = {
  banner: {
    title: "이벤트 당첨 결과 확인",
    description: "추첨이 완료되었습니다. 내 지갑에서 당첨 결과를 확인하세요",
    buttonText: "당첨 확인하기",
  },
  summary: {
    participants: 12,
    totalProducts: 33,
    remainingTime: "2일 5시간",
  },
  products: [
    {
      rank: "1등",
      name: "특별 NFT 선구매권",
      description: "나이키에서 제공하는 한정판 상품을 선구매할 수 있습니다",
      quantity: "3개",
    },
    {
      rank: "2등",
      name: "퍼즐 조각 (1개)",
      description: "일정 개수를 모으면 퍼즐교환소에서 보상과 교환할 수 있습니다",
      quantity: "10개",
    },
    {
      rank: "3등",
      name: "퍼즐 조각 (3개)",
      description: "일정 개수를 모으면 퍼즐교환소에서 보상과 교환할 수 있습니다",
      quantity: "20개",
    },
  ],
  liveEntries: [
    { address: "0x1234...5678", time: "2분 전", amount: "1장" },
    { address: "0xabcd...ef01", time: "5분 전", amount: "2장" },
    { address: "0x9876...5432", time: "8분 전", amount: "1장" },
    { address: "0x4567...8901", time: "12분 전", amount: "1장" },
    { address: "0xdef0...1234", time: "15분 전", amount: "3장" },
  ],
  // 일단 확인용
  totalApplicants: 12,
  totalRewards: 33,
  remainingTime: "2일 5시간",
  result: "first", // first | second | lose
  isRevealed: true,  //이게 true면 드로우 현황의 결과 공개 버튼 활성화, false면 비활성화
};

export default mockDraw;