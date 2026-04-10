
///////

const mockWallet = {
  summary: {
    ticketCount: 2,
    puzzleCount: 3,
    prePurchaseCount: 1,
  },

  tickets: [
    {
      id: 1,
      title: "티켓 #1",
      image: "https://placehold.co/600x400/111827/FFFFFF?text=NFT+Ticket+1",
      contractAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0EbDb",
      eventName: "4월 이벤트",
      mintedDate: "2026-04-01",
      expiryDate: "2026-04-14까지 사용 가능",
      status: "미공개",
      reward: "-",
      usageGuide: "결과 공개 후 내 지갑에서 당첨 여부를 확인할 수 있습니다.",
    },
    {
      id: 2,
      title: "티켓 #2",
      image: "https://placehold.co/600x400/1f2937/FFFFFF?text=NFT+Ticket+2",
      contractAddress: "0x8e12b7A5d3f6C2B12aB9424A95dD8E1F8d5Bc123",
      eventName: "3월 이벤트",
      mintedDate: "2026-03-15",
      expiryDate: "2026-03-29까지 사용 가능",
      status: "당첨",
      reward: "선구매권",
      usageGuide:
        "유효기간 내 선구매권을 사용하면 상품 결제가 가능하며, 사용 후에는 더 이상 이용할 수 없습니다.",
    },
  ],

  puzzles: [
    {
      id: 1234,
      type: "퍼즐 조각",
      rarity: "희귀",
    },
    {
      id: 2345,
      type: "퍼즐 조각",
      rarity: "일반",
    },
    {
      id: 3456,
      type: "퍼즐 조각",
      rarity: "희귀",
    },
  ],

  prePurchase: {
    title: "특별 NFT 선구매권",
    usable: true,
    expiryDate: "2026-06-30",
    buttonText: "사용하기",
  },
};

export default mockWallet;