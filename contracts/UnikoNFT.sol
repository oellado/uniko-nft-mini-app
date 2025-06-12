// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract UnikoNFT is ERC721, Ownable {
    using Strings for uint256;
    
    uint256 private _nextTokenId = 1;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.001 ether;
    
    struct Traits {
        uint8 eyes;
        uint8 mouth;
        uint8 leftCheek;
        uint8 rightCheek;
        uint8 accessory;
        uint8 background;
        uint8 faceColor;
        bool isUltraRare;
    }
    
    mapping(uint256 => Traits) private _traits;
    
    // Trait arrays - exactly matching your config.ts
    string[] private eyes = [unicode"○", unicode"●", unicode"◉", unicode"⊙", unicode"◎", unicode"•", unicode"∘", unicode"⚬", unicode"⚫", unicode"⚪"];
    string[] private mouths = [unicode"‿", unicode"⌄", unicode"ᴗ", unicode"∀", unicode"◡", unicode"⌣", unicode"∩", unicode"⊃", unicode"⊂", unicode"⌒"];
    string[] private cheeks = ["", unicode"◡", unicode"⌣", unicode"∩", unicode"ᴗ", unicode"•", unicode"○", unicode"◉"];
    string[] private accessories = ["", unicode"♪", unicode"♫", unicode"♬", unicode"★", unicode"☆", unicode"♦", unicode"♠", unicode"♣", unicode"♥"];
    string[] private backgrounds = ["#FFE4E1", "#E6E6FA", "#F0FFFF", "#F5FFFA", "#FFF8DC", "#FFEBCD", "#FFE4B5", "#FFEFD5"];
    string[] private faceColors = ["#000000", "#4A4A4A", "#8B4513", "#2F4F4F", "#483D8B", "#8B0000"];
    
    constructor() ERC721("Uniko NFT", "UNIKO") Ownable(msg.sender) {}
    
    function mint() external payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        
        // Generate traits using block data for randomness
        _generateTraits(tokenId);
    }
    
    function _generateTraits(uint256 tokenId) private {
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            tokenId,
            msg.sender
        )));
        
        // Check for ultra rare (1% chance)
        bool isUltraRare = (seed % 100) == 0;
        
        if (isUltraRare) {
            // Rainbow background for ultra rare
            _traits[tokenId] = Traits({
                eyes: uint8(seed % eyes.length),
                mouth: uint8((seed >> 8) % mouths.length),
                leftCheek: uint8((seed >> 16) % cheeks.length),
                rightCheek: uint8((seed >> 24) % cheeks.length),
                accessory: uint8((seed >> 32) % accessories.length),
                background: 255, // Special value for rainbow
                faceColor: uint8((seed >> 40) % faceColors.length),
                isUltraRare: true
            });
        } else {
            _traits[tokenId] = Traits({
                eyes: uint8(seed % eyes.length),
                mouth: uint8((seed >> 8) % mouths.length),
                leftCheek: uint8((seed >> 16) % cheeks.length),
                rightCheek: uint8((seed >> 24) % cheeks.length),
                accessory: uint8((seed >> 32) % accessories.length),
                background: uint8((seed >> 40) % backgrounds.length),
                faceColor: uint8((seed >> 48) % faceColors.length),
                isUltraRare: false
            });
        }
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        Traits memory traits = _traits[tokenId];
        string memory svg = _generateSVG(traits);
        string memory json = _generateMetadata(tokenId, traits, svg);
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }
    
    function _generateSVG(Traits memory traits) private view returns (string memory) {
        string memory bgDef;
        string memory bgFill;
        
        if (traits.isUltraRare && traits.background == 255) {
            // Rainbow gradient
            bgDef = '<defs><linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#B29AE1"/><stop offset="20%" style="stop-color:#F8BEF1"/><stop offset="40%" style="stop-color:#FDAFAE"/><stop offset="60%" style="stop-color:#F8CC1F"/><stop offset="80%" style="stop-color:#B9E99C"/><stop offset="100%" style="stop-color:#99E1FF"/></linearGradient></defs>';
            bgFill = 'fill="url(#rainbow)"';
        } else {
            bgDef = "";
            bgFill = string(abi.encodePacked('fill="', backgrounds[traits.background], '"'));
        }
        
        return string(abi.encodePacked(
            '<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">',
            bgDef,
            '<rect width="300" height="300" ', bgFill, '/>',
            '<text x="150" y="105" font-family="Arial" font-size="20" text-anchor="middle" fill="', faceColors[traits.faceColor], '">', eyes[traits.eyes], '</text>',
            '<text x="150" y="129" font-family="Arial" font-size="20" text-anchor="middle" fill="', faceColors[traits.faceColor], '">', mouths[traits.mouth], '</text>',
            _renderCheeks(traits),
            _renderAccessory(traits),
            '</svg>'
        ));
    }
    
    function _renderCheeks(Traits memory traits) private view returns (string memory) {
        if (traits.leftCheek == 0 && traits.rightCheek == 0) return "";
        
        string memory leftCheekSvg = traits.leftCheek > 0 ? 
            string(abi.encodePacked('<text x="105" y="153" font-family="Arial" font-size="20" text-anchor="middle" fill="', faceColors[traits.faceColor], '">', cheeks[traits.leftCheek], '</text>')) : "";
        
        string memory rightCheekSvg = traits.rightCheek > 0 ? 
            string(abi.encodePacked('<text x="195" y="153" font-family="Arial" font-size="20" text-anchor="middle" fill="', faceColors[traits.faceColor], '">', cheeks[traits.rightCheek], '</text>')) : "";
        
        return string(abi.encodePacked(leftCheekSvg, rightCheekSvg));
    }
    
    function _renderAccessory(Traits memory traits) private view returns (string memory) {
        if (traits.accessory == 0) return "";
        
        return string(abi.encodePacked(
            '<text x="150" y="195" font-family="Arial" font-size="20" text-anchor="middle" fill="', faceColors[traits.faceColor], '">', accessories[traits.accessory], '</text>'
        ));
    }
    
    function _generateMetadata(uint256 tokenId, Traits memory traits, string memory svg) private view returns (string memory) {
        string memory attributes = string(abi.encodePacked(
            '[{"trait_type":"Eyes","value":"', eyes[traits.eyes], '"},',
            '{"trait_type":"Mouth","value":"', mouths[traits.mouth], '"},',
            '{"trait_type":"Left Cheek","value":"', traits.leftCheek > 0 ? cheeks[traits.leftCheek] : "None", '"},',
            '{"trait_type":"Right Cheek","value":"', traits.rightCheek > 0 ? cheeks[traits.rightCheek] : "None", '"},',
            '{"trait_type":"Accessory","value":"', traits.accessory > 0 ? accessories[traits.accessory] : "None", '"},',
            '{"trait_type":"Background","value":"', traits.isUltraRare && traits.background == 255 ? "Rainbow" : backgrounds[traits.background], '"},',
            '{"trait_type":"Face Color","value":"', faceColors[traits.faceColor], '"},',
            '{"trait_type":"Rarity","value":"', traits.isUltraRare ? "Ultra Rare" : "Common", '"}]'
        ));
        
        return string(abi.encodePacked(
            '{"name":"Uniko #', tokenId.toString(), '",',
            '"description":"A cute on-chain companion, 100% onchain generative project by @miguelgarest.eth",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
            '"attributes":', attributes, '}'
        ));
    }
    
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
} 