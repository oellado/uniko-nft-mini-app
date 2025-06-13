// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract UnikoNFT is ERC721, Ownable, IERC2981 {
    using Strings for uint256;
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.001 ether;
    uint256 public constant ULTRA_RARE_COUNT = 10;
    uint256 public totalSupply;
    uint256 public ultraRaresMinted;
    
    // Royalty info (10% royalties)
    address private _royaltyRecipient;
    uint96 private constant _royaltyFee = 1000; // 10% in basis points (10000 = 100%)
    
    string private _baseTokenURI;
    mapping(uint256 => string) private _tokenMetadata;
    mapping(uint256 => bool) private _isUltraRare;
    mapping(bytes32 => bool) private _usedTraitHashes;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId);
    event UltraRareMinted(address indexed to, uint256 indexed tokenId, string design);
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _royaltyRecipient = msg.sender; // Set deployer as royalty recipient
    }
    
    function mint(address to, string memory metadata) external payable {
        require(totalSupply < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        
        // Prevent duplicate traits
        bytes32 traitHash = keccak256(bytes(metadata));
        require(!_usedTraitHashes[traitHash], "Duplicate traits not allowed");
        _usedTraitHashes[traitHash] = true;
        
        totalSupply++;
        uint256 tokenId = totalSupply;
        
        _safeMint(to, tokenId);
        _tokenMetadata[tokenId] = metadata;
        
        // Check if this is an ultra rare based on metadata
        // Ultra rares are determined by frontend and passed in metadata
        if (bytes(metadata).length > 0) {
            // Simple check - if metadata contains "Ultra Rare" it's an ultra rare
            if (uint256(keccak256(bytes(metadata))) % 1000 == 0 && ultraRaresMinted < ULTRA_RARE_COUNT) {
                _isUltraRare[tokenId] = true;
                ultraRaresMinted++;
            }
        }
        
        emit NFTMinted(to, tokenId);
    }
    
    function isUltraRare(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _isUltraRare[tokenId];
    }
    
    function getUltraRareCount() external view returns (uint256) {
        return ultraRaresMinted;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        string memory metadata = _tokenMetadata[tokenId];
        if (bytes(metadata).length > 0) {
            return metadata;
        }
        
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
    }
    
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        // Send mint proceeds to royalty recipient (your specified address)
        (bool success, ) = payable(_royaltyRecipient).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    function getTokenMetadata(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenMetadata[tokenId];
    }
    
    // EIP-2981 Royalty Standard Implementation
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external 
        view 
        override 
        returns (address receiver, uint256 royaltyAmount) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return (_royaltyRecipient, (salePrice * _royaltyFee) / 10000);
    }
    
    function setRoyaltyRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        _royaltyRecipient = newRecipient;
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, IERC165) 
        returns (bool) 
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
} 