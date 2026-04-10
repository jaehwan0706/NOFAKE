// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NoFakePlatform is ERC721, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 30; 
    uint256 public totalSupply = 0;
    string public unrevealedURI;
    
    string public PROVENANCE_HASH;
    bool public isMintingPaused = false;

    mapping(uint256 => bool) public isRevealed;
    mapping(uint256 => uint256) public raffleOffsets;
    mapping(uint256 => string) public raffleBaseURIs;
    
    mapping(uint256 => uint256) public tokenToRaffleId;
    mapping(uint256 => uint256) public mintTimestamp;
    
    uint256 public constant EXPIRY_DURATION = 90 days;
    mapping(uint256 => mapping(address => bool)) public hasParticipated;

    // [수정] Ownable 생성자에 msg.sender(초기 관리자)를 전달해야 합니다.
    constructor(
        string memory _unrevealedURI
    ) ERC721("NoFake Raffle Platform", "NFP") Ownable(msg.sender) {
        unrevealedURI = _unrevealedURI;
    }

    function setMintingPaused(bool _state) public onlyOwner { isMintingPaused = _state; }
    
    function setProvenanceHash(string memory _provenanceHash) public onlyOwner {
        require(bytes(PROVENANCE_HASH).length == 0, "Already set");
        PROVENANCE_HASH = _provenanceHash;
    }

    function mintRaffleTicket(address _to, uint256 _raffleId) public onlyOwner {
        require(!isMintingPaused, "Closed");
        require(totalSupply < MAX_SUPPLY, "Full"); 
        require(!hasParticipated[_raffleId][_to], "Already in");

        totalSupply++;
        tokenToRaffleId[totalSupply] = _raffleId;
        mintTimestamp[totalSupply] = block.timestamp;
        hasParticipated[_raffleId][_to] = true;
        _safeMint(_to, totalSupply);
    }

    function revealRaffle(uint256 _raffleId, string memory _baseURI) external onlyOwner {
        require(!isRevealed[_raffleId], "Already revealed");
        uint256 currentParticipants = totalSupply; 
        require(currentParticipants > 0, "No participants");

        raffleOffsets[_raffleId] = uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, _raffleId))) % currentParticipants;

        raffleBaseURIs[_raffleId] = _baseURI;
        isRevealed[_raffleId] = true;
    }

    /**
     * @dev [수정] OpenZeppelin 5.0에서는 _exists 대신 _ownerOf를 사용하여 존재 여부를 체크합니다.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // [변경] _exists(tokenId) -> _ownerOf(tokenId) != address(0)
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        
        uint256 raffleId = tokenToRaffleId[tokenId];

        if (block.timestamp > mintTimestamp[tokenId] + EXPIRY_DURATION) return "ipfs://expired";
        if (!isRevealed[raffleId]) return unrevealedURI;

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
    }
}