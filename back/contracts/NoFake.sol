// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title NoFake Raffle Ticket
 * @dev 주최자조차 당첨자를 조작할 수 없는 투명한 추첨 시스템
 */
contract NoFake is ERC721, Ownable {
    using Strings for uint256;

    // 1. 최대 인원 30명 설정 (Constant: 상수)
    uint256 public constant MAX_SUPPLY = 30; 
    uint256 public totalSupply = 0;
    
    bytes32 public provenanceHash; // 모든 데이터의 무결성 증명 해시
    string public unrevealedURI;   // 리빌 전 (물음표 상자) 주소
    string public baseURI;         // 리빌 후 (실제 결과) 폴더 주소
    
    bool public mintingActive = true;
    bool public revealed = false;

    // 핵심 보안 요소: 리빌 시 생성될 무작위 숫자 (Offset)
    uint256 public revealOffset; 

    constructor(
        bytes32 _provenanceHash,
        string memory _unrevealedURI
    ) ERC721("NoFakeTicket", "NFTK") Ownable(msg.sender) {
        provenanceHash = _provenanceHash;
        unrevealedURI = _unrevealedURI;
    }

    // [참여자] 티켓 받기 (최대 30명)
    function mintTicket() public {
        require(mintingActive, "Minting is closed.");
        require(totalSupply < MAX_SUPPLY, "Exceeds max supply.");
        
        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    // [주최자] 민팅 종료
    function closeMinting() public onlyOwner {
        mintingActive = false;
    }

    // [주최자] 결과 리빌 (이때 0~29 사이의 난수를 생성해 순서를 섞음)
    function reveal(string memory _baseURI) public onlyOwner {
        require(!mintingActive, "Close minting first.");
        require(!revealed, "Already revealed.");

        // 블록체인 데이터를 활용한 예측 불가능한 난수 생성
        revealOffset = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % MAX_SUPPLY;
        
        baseURI = _baseURI;
        revealed = true;
    }

    // 각 티켓 번호에 맞는 JSON 파일 주소를 반환 (오프셋 적용)
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        if (!revealed) {
            return unrevealedURI;
        }

        // 실제 데이터 번호 계산: (내 번호 + 랜덤 숫자) % 30
        uint256 shiftedTokenId = (tokenId + revealOffset) % MAX_SUPPLY;
        if (shiftedTokenId == 0) shiftedTokenId = MAX_SUPPLY; 

        return string(abi.encodePacked(baseURI, shiftedTokenId.toString(), ".json"));
    }
}