// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title NoFakePlatform
 * @dev 나이키,무신사 포인트 교환 및 래플 NFT 관리 플랫폼
 */
contract NoFakePlatform is ERC721, Ownable {
    using Strings for uint256;

    // --- NFT 및 래플 변수 --- 
    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public totalSupply = 0;
    string public unrevealedURI;

    mapping(uint256 => bool) public isRevealed;
    mapping(uint256 => uint256) public winningTokenId; // 래플 ID별 당첨 번호
    mapping(uint256 => address) public raffleWinners;   // 래플 ID별 당첨자 주소
    mapping(uint256 => uint256) public tokenToRaffleId;
    mapping(uint256 => mapping(address => bool)) public hasParticipated;

    // --- 포인트 교환 정책 (나이키, 무신사 전용) ---
    struct BrandConfig {
        uint256 feePercent;
        uint256 minAmount;
        bool isActive;
    }
    mapping(string => BrandConfig) public brands;

    // --- 이벤트 (하이퍼레저 정산 및 프론트엔드 연동용) ---
    event PointExchangeRequested(
        address indexed user,
        string targetBrand,
        uint256 sentAmount,
        uint256 feeAmount,
        uint256 receivedAmount
    );
    event RaffleWinnerDeclared(uint256 indexed raffleId, address indexed winner, uint256 tokenId);

    constructor(string memory _unrevealedURI) ERC721("NoFake Raffle", "NFR") Ownable() {
        unrevealedURI = _unrevealedURI;
        
        // 기업 파트너십 설정 (나이키: 3% 수수료, 최소 5000P / 무신사: 2% 수수료, 최소 3000P)
        brands["nike"] = BrandConfig(3, 5000, true);
        brands["musinsa"] = BrandConfig(2, 3000, true);
    }

    // --- [핵심 기능 1] 포인트 교환 로직 ---

    /**
     * @dev 사용자가 NoFake 포인트를 타 브랜드로 교환 요청할 때 호출
     * 실제 잔액 차감은 하이퍼레저에서 수행하며, 이 함수는 온체인 영수증 역할을 함
     */
    function requestPointSwap(string memory _targetBrand, uint256 _amount) public {
        BrandConfig memory config = brands[_targetBrand];
        require(config.isActive, "Unsupported brand");
        require(_amount >= config.minAmount, "Below minimum amount");

        uint256 fee = (_amount * config.feePercent) / 100;
        uint256 receiveAmount = _amount - fee;

        emit PointExchangeRequested(msg.sender, _targetBrand, _amount, fee, receiveAmount);
    }

    // --- [핵심 기능 2] 래플 및 NFT 로직 ---

    /**
     * @dev 래플 참여 시 티켓 민팅 (1인 1계정 검증 포함)
     */
    function mintRaffleTicket(address _to, uint256 _raffleId) public onlyOwner {
        require(totalSupply < MAX_SUPPLY, "Max supply reached");
        require(!hasParticipated[_raffleId][_to], "Already participated in this raffle");

        totalSupply++;
        tokenToRaffleId[totalSupply] = _raffleId;
        hasParticipated[_raffleId][_to] = true;
        _safeMint(_to, totalSupply);
    }

    /**
<<<<<<< HEAD
     * @dev 래플 마감 후 리빌 및 당첨자 선발 (보안 난수 적용)
     */
    function revealRaffle(uint256 _raffleId) external onlyOwner {
        require(!isRevealed[_raffleId], "Already revealed");
        require(totalSupply > 0, "No participants");

        // 온체인 난수를 이용한 당첨자 선정 (Index 1 ~ totalSupply)
        uint256 winnerTokenId = (uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, _raffleId))) % totalSupply) + 1;

        winningTokenId[_raffleId] = winnerTokenId;
        raffleWinners[_raffleId] = ownerOf(winnerTokenId);
        isRevealed[_raffleId] = true;

        emit RaffleWinnerDeclared(_raffleId, raffleWinners[_raffleId], winnerTokenId);
    }

    /**
     * @dev 토큰 ID에 따른 메타데이터 반환 (당첨자만 선구매권 NFT 노출)
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Nonexistent token");
        uint256 raffleId = tokenToRaffleId[tokenId];

        if (!isRevealed[raffleId]) return unrevealedURI;
        
        // 당첨자에게는 전용 선구매권 메타데이터 제공 (예: 1등 NFT)
        if (tokenId == winningTokenId[raffleId]) {
            return string(abi.encodePacked("ipfs://winner-metadata/", raffleId.toString(), ".json"));
        }
        
        // 낙첨자에게는 일반 참여 인증 메타데이터 제공
        return string(abi.encodePacked("ipfs://participant-metadata/", raffleId.toString(), ".json"));
    }

    // --- 관리자 기능 ---
    function setUnrevealedURI(string memory _uri) public onlyOwner {
        unrevealedURI = _uri;
=======
     * @dev 현재 참여 인원(totalSupply) 범위 내에서 난수 생성
     */
    function revealRaffle(uint256 _raffleId, string memory _baseURI) external onlyOwner {
        require(!isRevealed[_raffleId], "Already revealed");
        uint256 currentParticipants = totalSupply; 
        require(currentParticipants > 0, "No participants");

        // [정보보호] block.prevrandao를 사용하여 온체인 난수 생성 (보안성 확보)
        raffleOffsets[_raffleId] = uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, _raffleId))) % currentParticipants;

        raffleBaseURIs[_raffleId] = _baseURI;
        isRevealed[_raffleId] = true;
    }

    /**
     * @dev 1.json ~ 30.json 규격에 맞춘 동적 매핑 (+1 연산)
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // [수정] OpenZeppelin 4.x 버전에서는 _exists(tokenId)를 그대로 사용합니다.
        // (5.x 버전은 _ownerOf(tokenId) != address(0) 로 써야 함)
        require(_exists(tokenId), "Nonexistent token");
        
        uint256 raffleId = tokenToRaffleId[tokenId];

        if (block.timestamp > mintTimestamp[tokenId] + EXPIRY_DURATION) return "ipfs://expired";
        if (!isRevealed[raffleId]) return unrevealedURI;

        // 참여 인원 범위 내에서 순환하도록 수정하고 +1 하여 파일명 일치시킴
        uint256 shiftedId = ((tokenId + raffleOffsets[raffleId]) % totalSupply) + 1;
        
        return string(abi.encodePacked(raffleBaseURIs[raffleId], shiftedId.toString(), ".json"));
    }

    function swapPuzzlesForCoupon(uint256[] memory tokenIds) public {
        require(tokenIds.length == 10, "10 puzzles required");
        for (uint i = 0; i < 10; i++) {
            require(ownerOf(tokenIds[i]) == msg.sender, "Not owner");
            _burn(tokenIds[i]); 
        }
        totalSupply++;
        _safeMint(msg.sender, totalSupply);
>>>>>>> efe679237a7bae3609e48e671cf299ca2859dc0e
    }
}