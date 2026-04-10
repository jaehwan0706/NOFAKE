const mockPuzzle = {
  progress: {
    current: 7,
    target: 10,
    helperText: "3개 더 필요합니다",
  },
  pieces: [
    { id: 1234, label: "희귀" },
    { id: 2345, label: "일반" },
    { id: 3456, label: "희귀" },
    { id: 4567, label: "일반" },
    { id: 5678, label: "일반" },
    { id: 6789, label: "희귀" },
  ],
  selectedCount: 7,
  rewards: [
    {
      title: "20% 할인쿠폰",
      description: "퍼즐 10개를 모아 20% 할인쿠폰을 획득하세요",
      need: 10,
      current: 7,
      actionText: "3개 더 필요",
      active: false,
    },
    {
      title: "15% 할인쿠폰",
      description: "퍼즐 8개를 모아 15% 할인쿠폰을 획득하세요",
      need: 8,
      current: 7,
      actionText: "1개 더 필요",
      active: false,
    },
    {
      title: "10% 할인쿠폰",
      description: "퍼즐 6개를 모아 10% 할인쿠폰을 획득하세요",
      need: 6,
      current: 7,
      actionText: "교환하기",
      active: true,
    },
  ],
  process: [
    "퍼즐 조각을 10개 이상 수집",
    "교환할 조각 선택",
    "선구매권 NFT 또는 쿠폰 발행",
  ],
};

export default mockPuzzle;