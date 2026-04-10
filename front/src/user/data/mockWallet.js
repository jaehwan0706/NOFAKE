import { normalizeTicketMetadata } from "../utils/normalizeTicketMetadata";

const rawTicketMetadataList = [
  {
    name: "NOFAKE Mystery Ticket",
    description:
      "어떤 상품이 들어있을까요? 주최자의 리빌(Reveal)을 기다려주세요!",
    image:
      "https://nofake.s3.ap-northeast-2.amazonaws.com/images/pre-reveal/unrevealed.png",
    attributes: [
      { trait_type: "Event Name", value: "나이키X백석 콜라보이벤트" },
      { trait_type: "Status", value: "Unrevealed" },
    ],
  },
  {
    name: "NOFAKE #1",
    description:
      "주최자도 개입할 수 없는 투명한 추첨 시스템, NOFAKE를 통한 나이키X백석대 콜라보 이벤트 당첨 티켓입니다.",
    image:
      "https://nofake.s3.ap-northeast-2.amazonaws.com/images/post-reveal/1.png",
    attributes: [
      { trait_type: "Event Name", value: "나이키X백석대 콜라보이벤트" },
      { trait_type: "Issuer", value: "NIKE X BAEKSEOK" },
      { trait_type: "Contract Address", value: "" },
      { display_type: "date", trait_type: "Minted Date", value: 0 },
      { trait_type: "Status", value: "Revealed" },
      { trait_type: "Winning Prize", value: "1등: 나이키 한정판 선구매권" },
      { trait_type: "Provenance Hash", value: "" },
      { trait_type: "Shoe Serial Number", value: "SN-XXXX-XXXX" },
    ],
  },
  {
    name: "NOFAKE #2",
    description:
      "주최자도 개입할 수 없는 투명한 추첨 시스템, NOFAKE를 통한 나이키X백석대 콜라보 이벤트 당첨 티켓입니다.",
    image:
      "https://nofake.s3.ap-northeast-2.amazonaws.com/images/post-reveal/2.png",
    attributes: [
      { trait_type: "Event Name", value: "나이키X백석대 콜라보이벤트" },
      { trait_type: "Issuer", value: "NIKE X BAEKSEOK" },
      { trait_type: "Contract Address", value: "" },
      { display_type: "date", trait_type: "Minted Date", value: 0 },
      { trait_type: "Status", value: "Revealed" },
      { trait_type: "Winning Prize", value: "2등: 스니커즈 퍼즐 조각" },
      { trait_type: "Provenance Hash", value: "" },
      { display_type: "date", trait_type: "Ticket Expiration", value: 0 },
    ],
  },
  {
    name: "NOFAKE #8",
    description:
      "주최자도 개입할 수 없는 투명한 추첨 시스템, NOFAKE를 통한 나이키X백석대 콜라보 이벤트 참여 기념 티켓입니다.",
    image:
      "https://nofake.s3.ap-northeast-2.amazonaws.com/images/post-reveal/gg.png",
    attributes: [
      { trait_type: "Event Name", value: "나이키X백석대 콜라보이벤트" },
      { trait_type: "Issuer", value: "NIKE X BAEKSEOK" },
      { trait_type: "Contract Address", value: "" },
      { display_type: "date", trait_type: "Minted Date", value: 0 },
      { trait_type: "Status", value: "Revealed" },
      { trait_type: "Winning Prize", value: "꽝: 일반 기념 티켓" },
      { trait_type: "Provenance Hash", value: "" },
    ],
  },
];

const tickets = rawTicketMetadataList.map((metadata, index) =>
  normalizeTicketMetadata(metadata, {
    id: index + 1,
    eventSlug: "baekseok-collab",
  })
);

const mockWallet = {
  summary: {
    ticketCount: tickets.length,
    puzzleCount: 3,
  },

  tickets,

  puzzles: [
    {
      id: 1234,
      type: "퍼즐 조각",
    },
    {
      id: 2345,
      type: "퍼즐 조각",
    },
    {
      id: 3456,
      type: "퍼즐 조각",
    },
  ],
};

export default mockWallet;