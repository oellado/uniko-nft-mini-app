// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Unikō V8 - PURE GENERATIVE VERSION
 * @dev 100% ALGORITHMIC GENERATIVE VERSION:
 * - ✅ NO ULTRA RARES: Pure generative system (removed all 10 ultra rare designs)
 * - ✅ ALL V4 FUNCTIONALITY: Same traits, gradients, XML escaping
 * - ✅ MASSIVE SIZE SAVINGS: Removed ~3KB of ultra rare SVGs and reveal system
 * - ✅ SIMPLIFIED: No commitment, reveal, or ultra rare mappings
 * - ✅ OPTIMIZED INHERITANCE: ERC721Royalty includes ERC721 (no redundancy)
 */
contract UnikoOnchain8 is ERC721Enumerable, ERC721Pausable, ERC721Royalty, Ownable, ReentrancyGuard {
    
    // --- Constants ---
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.000001 ether;
    
    // --- State Variables ---
    uint256 private _tokenIdCounter;
    mapping(bytes32 => bool) private _usedTraitCombinations;
    mapping(uint256 => string) private _tokenTraits;

    // --- Trait Arrays ---
    string[] private eyes = [ unicode"•", unicode"⚆", unicode"⚈", unicode"⨀", unicode"⦿", unicode"⤬", unicode"◒", unicode"◓", unicode"◕", unicode"∸", unicode"-", unicode"■", unicode"⊡", unicode"◨", unicode"∩", unicode"⬗", unicode"⋒", unicode"ō" ];
    string[] private mouths = [ unicode"ᴗ", unicode"⤻", unicode"―", unicode"﹏", unicode"⩊", unicode"ω", unicode"⟀", unicode"~", unicode"⩌", unicode"︿", unicode"3", unicode"•", unicode"ᆺ", unicode"ᴥ", unicode"ʌ", unicode"⎦" ];
    string[] private cheeks = [ "^ ^", "> <", unicode"– –", "= =", unicode"● ●", "~ ~", unicode"≈ ≈", unicode"≋ ≋", unicode"⁕ ⁕", unicode"∙ ∙", unicode"∘ ∘", unicode"⌐ " ];
    string[] private accessories = [ unicode"♫", unicode"✿", unicode"★", unicode"✧", unicode"☾", unicode"↑", unicode"♥" ];
    string[] private backgroundColors = [ "#1A1A1A", "#FFFFFF", "#B29BE1", "#F9BFF2", "#FEAFAF", "#F9CC1F", "#BAE99C", "#99E2FF" ];
    string[] private faceColors = [ "#000000", "#EAEAE8", "#9774CE", "#FA85CB", "#EA434A", "#F98D70", "#57A52B", "#6B97FF", "rainbow" ];
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, string traits);

    constructor(address royaltyRecipient, uint96 royaltyBps) ERC721(unicode"Unikō", "UNIKO") {
        _setDefaultRoyalty(royaltyRecipient, royaltyBps);
    }

    // --- Overrides for OpenZeppelin v4.9 Compatibility ---

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721Royalty) {
        super._burn(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal override(ERC721, ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function totalSupply() public view override(ERC721Enumerable) returns (uint256) {
        return super.totalSupply();
    }

    // --- Minting Functions ---

    function mint(uint256 quantity) external payable nonReentrant whenNotPaused {
        require(quantity > 0 && quantity <= 10, "Invalid quantity");
        require(_tokenIdCounter + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            string memory traits = _generateUniqueTraits(tokenId, msg.sender);
            _tokenTraits[tokenId] = traits;
            
            _safeMint(msg.sender, tokenId);
            emit NFTMinted(msg.sender, tokenId, traits);
            
            _tokenIdCounter++;
        }
    }
    
    function ownerMint(address to, uint256 quantity) external onlyOwner nonReentrant {
        require(quantity > 0, "Invalid quantity");
        require(_tokenIdCounter + quantity <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            string memory traits = _generateUniqueTraits(tokenId, to);
             _tokenTraits[tokenId] = traits;

            _safeMint(to, tokenId);
            emit NFTMinted(to, tokenId, traits);
            
            _tokenIdCounter++;
        }
    }

    // --- Display Functions ---

    /**
     * @dev Returns raw metadata JSON for BaseScan integration
     */
    function getTokenMetadata(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenTraits[tokenId];
    }

    /**
     * @dev Get the Uniko face display for a token (returns face like "• ᴗ •")
     */
    function getUniko(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        string memory traits = _tokenTraits[tokenId];
        require(bytes(traits).length > 0, "No traits found");
        
        string memory eyeValue = _extractTraitValue(traits, "eyes");
        string memory mouthValue = _extractTraitValue(traits, "mouth");
        string memory cheeksValue = _extractTraitValue(traits, "cheeks");
        string memory accessoryValue = _extractTraitValue(traits, "accessory");
        
        string[] memory cheekParts = new string[](2);
        (cheekParts[0], cheekParts[1]) = _splitString(cheeksValue);
        
        // Build face: leftCheek eyes mouth eyes rightCheek accessory
        string memory face = "";
        
        if (!_isEmptyString(cheekParts[0])) {
            face = string(abi.encodePacked(face, cheekParts[0], " "));
        }
        if (!_isEmptyString(eyeValue)) {
            face = string(abi.encodePacked(face, eyeValue, " "));
        }
        if (!_isEmptyString(mouthValue)) {
            face = string(abi.encodePacked(face, mouthValue, " "));
        }
        if (!_isEmptyString(eyeValue)) {
            face = string(abi.encodePacked(face, eyeValue, " "));
        }
        if (!_isEmptyString(cheekParts[1])) {
            face = string(abi.encodePacked(face, cheekParts[1], " "));
        }
        if (!_isEmptyString(accessoryValue)) {
            face = string(abi.encodePacked(face, accessoryValue));
        }
        
        // Remove trailing space if exists
        bytes memory faceBytes = bytes(face);
        if (faceBytes.length > 0 && faceBytes[faceBytes.length - 1] == 0x20) {
            bytes memory trimmed = new bytes(faceBytes.length - 1);
            for (uint i = 0; i < trimmed.length; i++) {
                trimmed[i] = faceBytes[i];
            }
            return string(trimmed);
        }
        
        return face;
    }



    // --- Onchain Trait Generation ---

    function _generateUniqueTraits(uint256 tokenId, address minter) private returns (string memory traits) {
        uint256 maxAttempts = 100;
        for (uint256 attempt = 0; attempt < maxAttempts; attempt++) {
            uint256 seed = uint256(keccak256(abi.encodePacked(
                tokenId,
                minter,
                block.timestamp,
                block.prevrandao,
                attempt
            )));

            // --- Generate trait indices and values from the seed ---
            // Eyes: Make ō (index 17) more rare (3% vs 97% for others)
            uint256 rareEyeCheck = (seed >> 56) % 100;
            uint256 eyeIndex;
            if (rareEyeCheck < 3) {
                eyeIndex = 17; // 3% chance for ō
            } else {
                eyeIndex = (seed >> 0) % 17; // 97% chance for other 17 eyes
            }
            
            uint256 mouthIndex = (seed >> 8) % (mouths.length + 1);
            
            // Cheeks: Conditional logic for special "⌐ " cheek
            uint256 cheekIndex;
            bool isCompatibleEye = (eyeIndex == 3 || eyeIndex == 11 || eyeIndex == 12 || eyeIndex == 13 || eyeIndex == 15); // ⨀■⊡◨⬗
            uint256 cheekSeed = (seed >> 16) % 100;
            
            if (isCompatibleEye && cheekSeed < 8) {
                cheekIndex = 11; // 8% chance for special "⌐ " cheek with compatible eyes
            } else if (cheekSeed < 20) {
                cheekIndex = cheeks.length; // 20% no cheeks
            } else {
                cheekIndex = (seed >> 24) % 11; // 72% regular cheeks
            }
            
            uint256 accessoryIndex = (seed >> 24) % (accessories.length + 1);
            
            // Face Colors: Make rainbow face rare (2% vs 98% for regular colors)
            uint256 rareFaceCheck = (seed >> 60) % 100;
            uint256 faceColorIndex;
            if (rareFaceCheck < 2) {
                faceColorIndex = 8; // 2% chance for rainbow face
            } else {
                faceColorIndex = (seed >> 32) % 8; // 98% chance for regular colors
            }
            
            uint256 bgSeed = (seed >> 40) % 100;
            string memory background;
            if (bgSeed == 0) { background = "rainbow"; }           // 1%
            else if (bgSeed <= 2) { background = "titanium"; }     // 2%
            else if (bgSeed <= 4) { background = "gold"; }         // 2%
            else if (bgSeed <= 6) { background = "champagne"; }    // 2%
            else if (bgSeed <= 9) { background = "based"; }        // 3%
            else if (bgSeed <= 12) { background = "purple"; }      // 3%
            else if (bgSeed <= 15) { background = "sunset"; }      // 3%
            else { background = backgroundColors[(seed >> 48) % backgroundColors.length]; } // 84%
            
            // --- Hash the components for a gas-efficient uniqueness check ---
            bytes32 traitHash = keccak256(abi.encodePacked(
                eyeIndex,
                mouthIndex,
                cheekIndex,
                accessoryIndex,
                faceColorIndex,
                keccak256(bytes(background))
            ));
            
            if (!_usedTraitCombinations[traitHash]) {
                _usedTraitCombinations[traitHash] = true;
                
                // --- Now that it's unique, construct the full JSON string to be stored ---
                return string(abi.encodePacked(
                    '{"eyes":"', eyes[eyeIndex], '",',
                    '"mouth":"', mouthIndex < mouths.length ? mouths[mouthIndex] : "", '",',
                    '"cheeks":"', cheekIndex < cheeks.length ? cheeks[cheekIndex] : "", '",',
                    '"accessory":"', accessoryIndex < accessories.length ? accessories[accessoryIndex] : "", '",',
                    '"background":"', background, '",',
                    '"faceColor":"', faceColors[faceColorIndex], '"}'
                ));
            }
        }
        revert("Unable to generate unique traits");
    }
    
    // --- Metadata and SVG Generation ---

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        string memory svg = generateSVG(tokenId);
        string memory svgBase64 = Base64.encode(bytes(svg));
        
        string memory traits = _tokenTraits[tokenId];
        string memory attributes = _formatAttributes(traits);
        
        string memory json = string(abi.encodePacked(
            unicode'{"name":"Unikō #', Strings.toString(tokenId), '",',
            '"description":"Your cute onchain companions, a generative project by Miguelgarest",',
            '"image":"data:image/svg+xml;base64,', svgBase64, '",',
            '"attributes":', attributes, '}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function generateSVG(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _generateSVGFromTraits(_tokenTraits[tokenId]);
    }
    
    function _generateSVGFromTraits(string memory traits) internal pure returns (string memory) {
        string memory eye = _extractTraitValue(traits, "eyes");
        string memory mouth = _extractTraitValue(traits, "mouth");
        string memory cheeksValue = _extractTraitValue(traits, "cheeks");
        string memory accessory = _extractTraitValue(traits, "accessory");
        string memory background = _extractTraitValue(traits, "background");
        string memory faceColor = _extractTraitValue(traits, "faceColor");

        string[] memory cheekParts = new string[](2);
        (cheekParts[0], cheekParts[1]) = _splitString(cheeksValue);

        // Background gradients and face color handling
        string memory bgColor;
        string memory gradientDefs = "";
        string memory faceColorFill;
        
        // Handle rainbow face color
        if(_stringsEqual(faceColor, "rainbow")) { 
            faceColorFill = "url(#rainbowFace)";
            gradientDefs = string(abi.encodePacked(gradientDefs, '<linearGradient id="rainbowFace" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FF6B9D"/><stop offset="16%" stop-color="#FF8E53"/><stop offset="33%" stop-color="#FFD23F"/><stop offset="50%" stop-color="#00D4AA"/><stop offset="66%" stop-color="#4ECDC4"/><stop offset="83%" stop-color="#45B7D1"/><stop offset="100%" stop-color="#96CEB4"/></linearGradient>'));
        } else { 
            faceColorFill = faceColor; 
        }
        
        // Handle background gradients
        if(_stringsEqual(background, "rainbow")) { 
            bgColor = "url(#rainbow)";
            gradientDefs = string(abi.encodePacked(gradientDefs, '<linearGradient id="rainbow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#B29AE1"/><stop offset="20%" stop-color="#F8BEF1"/><stop offset="40%" stop-color="#FDAFAE"/><stop offset="60%" stop-color="#F8CC1F"/><stop offset="80%" stop-color="#B9E99C"/><stop offset="100%" stop-color="#99E1FF"/></linearGradient>'));
        } else if (_stringsEqual(background, "based")) { 
            bgColor = "url(#based)";
            gradientDefs = string(abi.encodePacked(gradientDefs, '<linearGradient id="based" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#366CFF"/></linearGradient>'));
        } else if (_stringsEqual(background, "purple")) { 
            bgColor = "url(#purple)";
            gradientDefs = string(abi.encodePacked(gradientDefs, '<linearGradient id="purple" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#5B24FF"/></linearGradient>'));
        } else if (_stringsEqual(background, "titanium")) { 
            bgColor = "url(#titanium)";
            gradientDefs = string(abi.encodePacked(gradientDefs, '<linearGradient id="titanium" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#B8B8B8"/><stop offset="30%" stop-color="#808080"/><stop offset="70%" stop-color="#505050"/><stop offset="100%" stop-color="#202020"/></linearGradient>'));
        } else if (_stringsEqual(background, "gold")) { 
            bgColor = "url(#gold)";
            gradientDefs = string(abi.encodePacked(gradientDefs, '<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF700"/><stop offset="30%" stop-color="#FFD700"/><stop offset="70%" stop-color="#DAA520"/><stop offset="100%" stop-color="#B8860B"/></linearGradient>'));
        } else if (_stringsEqual(background, "sunset")) { 
            bgColor = "url(#sunset)";
            gradientDefs = string(abi.encodePacked(gradientDefs, '<linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFE066"/><stop offset="40%" stop-color="#FF9A56"/><stop offset="70%" stop-color="#FF6B35"/><stop offset="100%" stop-color="#D2691E"/></linearGradient>'));
        } else if (_stringsEqual(background, "champagne")) { 
            bgColor = "url(#champagne)";
            gradientDefs = string(abi.encodePacked(gradientDefs, '<linearGradient id="champagne" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFEAA7"/><stop offset="40%" stop-color="#FDCB6E"/><stop offset="70%" stop-color="#E17055"/><stop offset="100%" stop-color="#A0522D"/></linearGradient>'));
        } else { 
            bgColor = background; 
        }

        return string(abi.encodePacked(
            '<svg width="280" height="280" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">',
            '<defs>', gradientDefs, '</defs>',
            '<rect width="100%" height="100%" fill="', bgColor, '"/>',
            '<text y="50%" font-size="40" text-anchor="middle" dominant-baseline="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif" fill="', faceColorFill, '" dy="0.1em">',
            '<tspan x="25%">', _escapeXML(cheekParts[0]), '</tspan>',
            '<tspan x="35%">', _escapeXML(eye), '</tspan>',
            '<tspan x="50%">', _escapeXML(mouth), '</tspan>',
            '<tspan x="65%">', _escapeXML(eye), '</tspan>',
            '<tspan x="75%">', _escapeXML(cheekParts[1]), '</tspan>',
            '<tspan x="85%">', _escapeXML(accessory), '</tspan>',
            '</text></svg>'
        ));
    }

    /**
     * @dev Escape XML special characters
     * Converts: > → &gt;, < → &lt;, & → &amp;, " → &quot;, ' → &apos;
     */
    function _escapeXML(string memory str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length == 0) return str;
        
        // Count special characters to determine new length
        uint256 extraLength = 0;
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == '>') extraLength += 3;
            else if (strBytes[i] == '<') extraLength += 3;
            else if (strBytes[i] == '&') extraLength += 4;
            else if (strBytes[i] == '"') extraLength += 5;
            else if (strBytes[i] == '\'') extraLength += 5;
        }
        
        if (extraLength == 0) return str;
        
        bytes memory result = new bytes(strBytes.length + extraLength);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == '>') {
                result[resultIndex++] = '&';
                result[resultIndex++] = 'g';
                result[resultIndex++] = 't';
                result[resultIndex++] = ';';
            } else if (strBytes[i] == '<') {
                result[resultIndex++] = '&';
                result[resultIndex++] = 'l';
                result[resultIndex++] = 't';
                result[resultIndex++] = ';';
            } else if (strBytes[i] == '&') {
                result[resultIndex++] = '&';
                result[resultIndex++] = 'a';
                result[resultIndex++] = 'm';
                result[resultIndex++] = 'p';
                result[resultIndex++] = ';';
            } else if (strBytes[i] == '"') {
                result[resultIndex++] = '&';
                result[resultIndex++] = 'q';
                result[resultIndex++] = 'u';
                result[resultIndex++] = 'o';
                result[resultIndex++] = 't';
                result[resultIndex++] = ';';
            } else if (strBytes[i] == '\'') {
                result[resultIndex++] = '&';
                result[resultIndex++] = 'a';
                result[resultIndex++] = 'p';
                result[resultIndex++] = 'o';
                result[resultIndex++] = 's';
                result[resultIndex++] = ';';
            } else {
                result[resultIndex++] = strBytes[i];
            }
        }
        
        return string(result);
    }

    // --- Admin Functions ---

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    function withdraw() external onlyOwner nonReentrant {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // --- Helper Functions ---

    function _formatAttributes(string memory traits) internal pure returns (string memory) {
        string memory rarityValue = _getRarityFromTraits(traits);
        return string(abi.encodePacked("[",
            '{"trait_type":"Eyes","value":"', _extractTraitValue(traits, "eyes"), '"},',
            '{"trait_type":"Mouth","value":"', _extractTraitValue(traits, "mouth"), '"},',
            '{"trait_type":"Cheeks","value":"', _extractTraitValue(traits, "cheeks"), '"},',
            '{"trait_type":"Accessory","value":"', _extractTraitValue(traits, "accessory"), '"},',
            '{"trait_type":"Background","value":"', _extractTraitValue(traits, "background"), '"},',
            '{"trait_type":"Face Color","value":"', _extractTraitValue(traits, "faceColor"), '"},',
            '{"trait_type":"Rarity","value":"', rarityValue, '"}',
        "]"));
    }

    function _extractTraitValue(string memory json, string memory key) internal pure returns (string memory) {
        bytes memory jsonBytes = bytes(json);
        bytes memory keyBytes = bytes(string(abi.encodePacked('"', key, '":"')));
        
        for (uint i = 0; i + keyBytes.length < jsonBytes.length; i++) {
            bool isMatch = true;
            for (uint j = 0; j < keyBytes.length; j++) {
                if (jsonBytes[i + j] != keyBytes[j]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                uint start = i + keyBytes.length;
                uint end = start;
                while (end < jsonBytes.length && jsonBytes[end] != '"') { end++; }
                bytes memory valueBytes = new bytes(end - start);
                for (uint k = 0; k < valueBytes.length; k++) { valueBytes[k] = jsonBytes[start + k]; }
                return string(valueBytes);
            }
        }
        return "";
    }

    function _stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function _splitString(string memory str) internal pure returns (string memory, string memory) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length == 0) {
            return ("", "");
        }
        for(uint i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == ' ') {
                bytes memory part1 = new bytes(i);
                bytes memory part2 = new bytes(strBytes.length - i - 1);
                for(uint j = 0; j < i; j++) {
                    part1[j] = strBytes[j];
                }
                for(uint j = 0; j < part2.length; j++) {
                    part2[j] = strBytes[i + 1 + j];
                }
                return (string(part1), string(part2));
            }
        }
        return (str, "");
    }

    function _isEmptyString(string memory str) internal pure returns (bool) {
        return bytes(str).length == 0;
    }

    function _getRarityFromTraits(string memory traits) internal pure returns (string memory) {
        string memory background = _extractTraitValue(traits, "background");
        
        if (_stringsEqual(background, "rainbow")) {
            return "rainbow";
        } else if (_stringsEqual(background, "based")) {
            return "based";
        } else if (_stringsEqual(background, "purple")) {
            return "purple";
        }
        
        return "regular";
    }
} 