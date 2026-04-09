// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NoFakePlatform is ERC721, Ownable {
    using Strings for uint256;

    uint256 public totalSupply = 0;
    string public unrevealedURI;

    // 래플별 관리를 위한 매핑 (핵심 변경 사항)
    mapping(uint256 => bool) public isRevealed;          // 래플 ID -> 리빌 여부
    mapping(uint256 => uint256) public raffleOffsets;    // 래플 ID -> 랜덤 값
    mapping(uint256 => string) public raffleBaseURIs;    // 래플 ID -> 실제 이미지 경로
    
    // 토큰별 정보 저장
    mapping(uint256 => uint256) public tokenToRaffleId;  // 토큰 ID -> 소속 래플 ID
    mapping(uint256 => uint256) public mintTimestamp;    // 토큰 ID -> 발행 시간
    
    uint256 public constant EXPIRY_DURATION = 90 days;
    mapping(uint256 => mapping(address => bool)) public hasParticipated;

    constructor(
        string memory _unrevealedURI
    ) ERC721("NoFake Raffle Platform", "NFP") {
        unrevealedURI = _unrevealedURI;
    }

    /**
     * @dev [함수: 민팅] 특정 래플 ID를 지정하여 티켓 발행
     */
    function mintRaffleTicket(address _to, uint256 _raffleId) public onlyOwner {
        require(totalSupply < 10000, "Global limit reached"); 
        require(!hasParticipated[_raffleId][_to], "Already entered this raffle");

        totalSupply++;
        tokenToRaffleId[totalSupply] = _raffleId; // 이 토큰이 어떤 래플인지 기록
        mintTimestamp[totalSupply] = block.timestamp;
        hasParticipated[_raffleId][_to] = true;
        _safeMint(_to, totalSupply);
    }

    /**
     * @dev [함수: 리빌] 특정 래플 ID에 대해 딱 한 번만 결과 공개 (교수님 요구사항 충족)
     */
    function revealRaffle(uint256 _raffleId, string memory _baseURI) public onlyOwner {
        // 보안 체크: 해당 래플 ID에 대해 리빌은 단 한 번만 가능 (State 0 -> 1)
        require(!isRevealed[_raffleId], "This raffle is already revealed");

        // 랜덤 오프셋 생성 (래플 ID를 섞어서 중복 방지)
        raffleOffsets[_raffleId] = uint256(
            keccak256(abi.encodePacked(block.prevrandao, block.timestamp, _raffleId))
        ) % 10000; // 래플당 최대 범위 설정
        
        raffleBaseURIs[_raffleId] = _baseURI;
        isRevealed[_raffleId] = true; // 해당 래플 상태 고정
    }

    /**
     * @dev [함수: 조회] 소속된 래플의 리빌 상태에 따라 URI 반환
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        
        uint256 raffleId = tokenToRaffleId[tokenId];

        // 유효기간 체크
        if (block.timestamp > mintTimestamp[tokenId] + EXPIRY_DURATION) {
            return "ipfs://expired_metadata_uri"; 
        }

        // 해당 래플이 아직 리빌되지 않았다면 공개 전 이미지 반환
        if (!isRevealed[raffleId]) return unrevealedURI;

        // 리빌되었다면 해당 래플의 오프셋을 적용한 이미지 반환
        uint256 shiftedId = (tokenId + raffleOffsets[raffleId]) % 10000;
        return string(abi.encodePacked(raffleBaseURIs[raffleId], shiftedId.toString(), ".json"));
    }

    /**
     * @dev [로직] 퍼즐 10개 -> 쿠폰 교환 (기존 로직 유지)
     */
    function swapPuzzlesForCoupon(uint256[] memory tokenIds) public {
        require(tokenIds.length == 10, "Need exactly 10 puzzles");
        for (uint i = 0; i < 10; i++) {
            require(ownerOf(tokenIds[i]) == msg.sender, "Not the owner");
            require(block.timestamp <= mintTimestamp[tokenIds[i]] + EXPIRY_DURATION, "Puzzle expired");
            _burn(tokenIds[i]); 
        }
        totalSupply++;
        mintTimestamp[totalSupply] = block.timestamp;
        _safeMint(msg.sender, totalSupply);
    }
}