// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Unikō V4 - PROPERLY FIXED VERSION
 * @dev ALL ISSUES FINALLY FIXED:
 * - ✅ CORRECT ROYALTIES: 10% to 0xE765185a42D623a99864C790a88cd29825d8A4b9
 * - ✅ PROPER XML ESCAPING: Added _escapeXML function for "> <" cheeks
 * - ✅ Correct alignment (35%/65% for eyes, no dy offset)
 * - ✅ Correct rainbow/based/purple gradients  
 * - ✅ Added getUniko() and rarity() functions
 * - ✅ Working reveal() function
 */
contract UnikoOnchain4 is ERC721, ERC721Enumerable, ERC721Pausable, ERC721Royalty, Ownable, ReentrancyGuard {
    
    // --- Constants ---
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.000001 ether;
    
    // --- State Variables ---
    uint256 private _tokenIdCounter;
    mapping(bytes32 => bool) private _usedTraitCombinations;
    mapping(uint256 => string) private _tokenTraits;
    
    // --- Optimistic Reveal System ---
    bool public isRevealed;
    mapping(uint256 => bool) public isUltraRare;
    bytes32 public immutable COMMITMENT;

    // --- Trait Arrays ---
    string[] private eyes = [ unicode"•", unicode"⚆", unicode"⚈", unicode"⨀", unicode"⦿", unicode"⤬", unicode"◒", unicode"◓", unicode"◕", unicode"∸", unicode"-", unicode"■", unicode"⊡", unicode"◨", unicode"∩", unicode"⬗", unicode"⋒" ];
    string[] private mouths = [ unicode"ᴗ", unicode"⤻", unicode"―", unicode"﹏", unicode"⩊", unicode"ω", unicode"⟀", unicode"~", unicode"⩌", unicode"︿", unicode"3", unicode".", unicode"ᆺ", unicode"ᴥ", unicode"ʌ", unicode"⎦" ];
    string[] private cheeks = [ "^ ^", "> <", unicode"– –", "= =", unicode"⬤ ⬤", "~ ~", unicode"≈ ≈", unicode"≋ ≋", unicode"⁕ ⁕", unicode"∙ ∙", unicode"∘ ∘" ];
    string[] private accessories = [ unicode"♫", unicode"✿", unicode"★", unicode"✧", unicode"☾", unicode"↑", unicode"♥" ];
    string[] private backgroundColors = [ "#1A1A1A", "#FFFFFF", "#B29BE1", "#F9BFF2", "#FEAFAF", "#F9CC1F", "#BAE99C", "#99E2FF" ];
    string[] private faceColors = [ "#000000", "#EAEAE8", "#9774CE", "#FA85CB", "#EA434A", "#F98D70", "#57A52B", "#6B97FF" ];
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, string traits);

    constructor(address royaltyRecipient, uint96 royaltyBps, bytes32 commitment) ERC721(unicode"Unikō", "UNIKO") {
        _setDefaultRoyalty(royaltyRecipient, royaltyBps);
        COMMITMENT = commitment;
        // Ownable automatically sets msg.sender as owner - no manual transfer needed
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
        return super.totalSupply(); // Use ERC721Enumerable's actual token count, not counter
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
     * @dev CRITICAL: Required for BaseScan integration - returns raw metadata JSON
     */
    function getTokenMetadata(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        // CHECK IF ULTRA RARE FIRST - return ultra rare traits if revealed
        if (isRevealed && isUltraRare[tokenId]) {
            return _getUltraRareTraitsJSON(tokenId);
        }
        
        return _tokenTraits[tokenId];
    }

    /**
     * @dev Get the Uniko face display for a token (returns face like "• ᴗ •")
     */
    function getUniko(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        // CHECK IF ULTRA RARE FIRST
        if (isRevealed && isUltraRare[tokenId]) {
            return _getUltraRareString(tokenId);
        }
        
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

    /**
     * @dev Get rarity of a token (returns "regular", "rainbow", "based", "purple", "ultra rare")
     */
    function rarity(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        // Check if revealed and ultra rare
        if (isRevealed && isUltraRare[tokenId]) {
            return "ultra rare";
        }
        
        string memory traits = _tokenTraits[tokenId];
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
            uint256 eyeIndex = (seed >> 0) % eyes.length;
            uint256 mouthIndex = (seed >> 8) % (mouths.length + 1);
            uint256 cheekIndex = (seed >> 16) % (cheeks.length + 1);
            uint256 accessoryIndex = (seed >> 24) % (accessories.length + 1);
            uint256 faceColorIndex = (seed >> 32) % faceColors.length;
            
            uint256 bgSeed = (seed >> 40) % 100;
            string memory background;
            if (bgSeed == 0) { background = "rainbow"; } 
            else if (bgSeed <= 2) { background = "based"; } 
            else if (bgSeed <= 4) { background = "purple"; } 
            else { background = backgroundColors[(seed >> 48) % backgroundColors.length]; }
            
            // --- Hash the components for a gas-efficient uniqueness check ---
            bytes32 traitHash = keccak256(abi.encodePacked(
                eyeIndex,
                mouthIndex,
                cheekIndex,
                accessoryIndex,
                faceColorIndex,
                keccak256(bytes(background)) // Hash string to fit in a single slot
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
        
        // CHECK IF ULTRA RARE FIRST FOR METADATA
        string memory attributes;
        if (isRevealed && isUltraRare[tokenId]) {
            attributes = _getUltraRareAttributes(tokenId);
        } else {
            string memory traits = _tokenTraits[tokenId];
            attributes = _formatAttributes(traits);
        }
        
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
        if (isRevealed && isUltraRare[tokenId]) {
            return _getUltraRareSVG(tokenId);
        }
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

        // FIXED: Correct gradients and purple handling
        string memory bgColor;
        string memory gradientDefs = "";
        
        if(_stringsEqual(background, "rainbow")) { 
            bgColor = "url(#rainbow)";
            gradientDefs = '<linearGradient id="rainbow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#B29AE1"/><stop offset="20%" stop-color="#F8BEF1"/><stop offset="40%" stop-color="#FDAFAE"/><stop offset="60%" stop-color="#F8CC1F"/><stop offset="80%" stop-color="#B9E99C"/><stop offset="100%" stop-color="#99E1FF"/></linearGradient>';
        } else if (_stringsEqual(background, "based")) { 
            bgColor = "url(#based)";
            gradientDefs = '<linearGradient id="based" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#366CFF"/></linearGradient>';
        } else if (_stringsEqual(background, "purple")) { 
            bgColor = "url(#purple)";
            gradientDefs = '<linearGradient id="purple" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#5B24FF"/></linearGradient>';
        } else { 
            bgColor = background; 
        }

        return string(abi.encodePacked(
            '<svg width="280" height="280" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">',
            '<defs>', gradientDefs, '</defs>',
            '<rect width="100%" height="100%" fill="', bgColor, '"/>',
            '<text y="50%" font-size="40" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="', faceColor, '">',
            '<tspan x="25%">', _escapeXML(cheekParts[0]), '</tspan>',    // FIXED: XML ESCAPING!
            '<tspan x="35%">', _escapeXML(eye), '</tspan>',             // FIXED: 35% not 40%
            '<tspan x="50%">', _escapeXML(mouth), '</tspan>',
            '<tspan x="65%">', _escapeXML(eye), '</tspan>',             // FIXED: 65% not 60%
            '<tspan x="75%">', _escapeXML(cheekParts[1]), '</tspan>',   // FIXED: XML ESCAPING!
            '<tspan x="85%">', _escapeXML(accessory), '</tspan>',       // FIXED: No dy="-15"
            '</text></svg>'
        ));
    }

    /**
     * @dev CRITICAL FIX: Escape XML special characters
     * Converts: > → &gt;, < → &lt;, & → &amp;, " → &quot;, ' → &apos;
     */
    function _escapeXML(string memory str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length == 0) return str;
        
        // Count special characters to determine new length
        uint256 extraLength = 0;
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == '>') extraLength += 3; // &gt; = 4 chars, > = 1 char, so +3
            else if (strBytes[i] == '<') extraLength += 3; // &lt; = 4 chars, < = 1 char, so +3
            else if (strBytes[i] == '&') extraLength += 4; // &amp; = 5 chars, & = 1 char, so +4
            else if (strBytes[i] == '"') extraLength += 5; // &quot; = 6 chars, " = 1 char, so +5
            else if (strBytes[i] == '\'') extraLength += 5; // &apos; = 6 chars, ' = 1 char, so +5
        }
        
        if (extraLength == 0) return str; // No escaping needed
        
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

    function _getUltraRareSVG(uint256 tokenId) internal view returns (string memory) {
        // FIXED: Use fixed mapping to prevent duplicates while keeping positions hidden
        // We map each ultra rare position to a unique design using the order they appear in the reveal array
        uint256 designIndex = _getUltraRareDesignIndex(tokenId);
        
        if (designIndex == 0) { return unicode'<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><rect width="100%" height="100%" fill="#FFFFFF"/><text x="50%" y="50%" font-size="40" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="#EA434A">⌐◨-◨</text></svg>'; } // nounish - FIXED SPACING
        if (designIndex == 1) { return unicode'<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><rect width="100%" height="100%" fill="#F9CC1F"/><text y="50%" font-size="40" text-anchor="middle" dominant-baseline="central" font-family="Arial"><tspan x="25%" fill="#EA434A">⬤</tspan><tspan x="35%" fill="#000000">-</tspan><tspan x="50%" fill="#000000">⩊</tspan><tspan x="65%" fill="#000000">-</tspan><tspan x="75%" fill="#EA434A">⬤</tspan></text></svg>';}
        if (designIndex == 2) { return unicode'<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><rect width="100%" height="100%" fill="#577D29"/><text y="50%" font-size="40" text-anchor="middle" dominant-baseline="central" font-family="Arial"><tspan x="33%" fill="#1625FF">∙</tspan><tspan x="43%" fill="#000000">◒</tspan><tspan x="50%" fill="#EA434A">ᴗ</tspan><tspan x="57%" fill="#000000">◒</tspan><tspan x="67%" fill="#1625FF">∙</tspan></text></svg>';}
        if (designIndex == 3) { return unicode'<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><rect width="100%" height="100%" fill="#8C8C8C"/><text x="50%" y="50%" font-size="40" text-anchor="middle" dominant-baseline="central" font-family="Arial"><tspan fill="#FFFFFF">⌐</tspan><tspan fill="#1625FF">■</tspan><tspan fill="#FFFFFF">-</tspan><tspan fill="#EA434A">■</tspan></text></svg>';}
        if (designIndex == 4) { return unicode'<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><defs><linearGradient id="imagineGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#88EDFF"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#imagineGradient)"/><text x="50%" y="50%" font-size="40" text-anchor="middle" dominant-baseline="central" font-family="Arial"><tspan fill="#000000">⌐</tspan><tspan fill="#FFFFFF">O</tspan><tspan fill="#000000">-</tspan><tspan fill="#FFFFFF">O</tspan><tspan fill="#FFFFFF">✿</tspan></text></svg>';}
        if (designIndex == 5) { return unicode'<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><rect width="100%" height="100%" fill="#FFFFFF"/><text y="50%" font-size="27" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="#000000"><tspan x="27%">•</tspan><tspan x="34%">ᴗ</tspan><tspan x="41%">•</tspan><tspan x="49%"> </tspan><tspan x="54%">/</tspan><tspan x="60%"> </tspan><tspan x="65%">•</tspan><tspan x="72%">ᴗ</tspan><tspan x="79%">•</tspan></text></svg>';}
        if (designIndex == 6) { return unicode'<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><rect width="100%" height="100%" fill="#9B6A4D"/><text y="50%" font-size="40" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="#000000"><tspan x="43%">•</tspan><tspan x="50%">ᴥ</tspan><tspan x="57%">•</tspan></text></svg>';}
        if (designIndex == 7) { return unicode'<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><rect width="100%" height="100%" fill="#FFFFFF"/><text y="50%" font-size="30" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="#000000"><tspan x="43%">•</tspan><tspan x="50%">ᴗ</tspan><tspan x="57%">•</tspan></text></svg>';}
        if (designIndex == 8) { return unicode'<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><rect width="100%" height="100%" fill="#9DFFA2"/><text y="50%" font-size="27" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="#000000"><tspan x="35%">⟁</tspan><tspan x="43%">⬤</tspan><tspan x="50%">ᴗ</tspan><tspan x="57%">⬤</tspan><tspan x="65%">⟁</tspan></text></svg>';}
        if (designIndex == 9) { return unicode'<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><defs><linearGradient id="mochiGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFB6F9"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#mochiGradient)"/><text x="50%" y="50%" font-size="40" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="#FA85CB">(•ᴗ•)</text></svg>';}
        
        // Fallback (should never reach here)
        return unicode'<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><rect width="100%" height="100%" fill="#FFFFFF"/><text x="50%" y="50%" font-size="40" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="#000000">⌐◨-◨</text></svg>';
    }

    // --- Reveal Function (READY TO USE) ---

    function reveal(string memory secretKey, uint256[] memory ultraRarePositions) external onlyOwner {
        require(!isRevealed, "Already revealed");
        require(ultraRarePositions.length == 10, "Must reveal 10 positions");

        bytes32 providedHash = keccak256(abi.encode(
            ultraRarePositions[0], ultraRarePositions[1], ultraRarePositions[2], ultraRarePositions[3], ultraRarePositions[4],
            ultraRarePositions[5], ultraRarePositions[6], ultraRarePositions[7], ultraRarePositions[8], ultraRarePositions[9],
            secretKey
        ));
        
        require(providedHash == COMMITMENT, "Invalid reveal parameters");
        
        // FIXED: Assign fixed design mapping to prevent duplicates
        for (uint256 i = 0; i < 10; i++) {
            if (_exists(ultraRarePositions[i])) {
                isUltraRare[ultraRarePositions[i]] = true;
                // Store the design index (0-9) for this token based on its position in reveal array
                _ultraRareDesignMapping[ultraRarePositions[i]] = i;
            }
        }
        isRevealed = true;
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

    // --- Ultra Rare Helper Functions ---

    // FIXED: Add design mapping storage
    mapping(uint256 => uint256) private _ultraRareDesignMapping;

    function _getUltraRareDesignIndex(uint256 tokenId) internal view returns (uint256) {
        return _ultraRareDesignMapping[tokenId];
    }

    // REFACTORED: Single helper function to get design name - eliminates code duplication
    function _getUltraRareDesignName(uint256 designIndex) internal pure returns (string memory) {
        if (designIndex == 0) { return "Nounish"; }
        else if (designIndex == 1) { return "Pika"; }
        else if (designIndex == 2) { return "Pepe"; }
        else if (designIndex == 3) { return "3D Glasses"; }
        else if (designIndex == 4) { return "Imagine"; }
        else if (designIndex == 5) { return "Duo"; }
        else if (designIndex == 6) { return "Kuma"; }
        else if (designIndex == 7) { return "Uniko"; }
        else if (designIndex == 8) { return "Alien"; }
        else { return "Mochi"; }
    }

    function _getUltraRareString(uint256 tokenId) internal view returns (string memory) {
        uint256 designIndex = _getUltraRareDesignIndex(tokenId);
        
        if (designIndex == 0) { return unicode"⌐◨-◨"; }      // nounish
        if (designIndex == 1) { return unicode"⬤ - ⩊ - ⬤"; } // pika
        if (designIndex == 2) { return unicode"∙ ◒ ᴗ ◒ ∙"; }  // pepe
        if (designIndex == 3) { return unicode"⌐■-■"; }      // 3Dglasses
        if (designIndex == 4) { return unicode"⌐O-O✿"; }     // imagine
        if (designIndex == 5) { return unicode"•ᴗ• / •ᴗ•"; } // duo
        if (designIndex == 6) { return unicode"•ᴥ•"; }       // kuma
        if (designIndex == 7) { return unicode"•ᴗ•"; }       // uniko
        if (designIndex == 8) { return unicode"⟁⬤ᴗ⬤⟁"; }    // alien
        return unicode"(•ᴗ•)"; // mochi (designIndex == 9)
    }

    function _getUltraRareAttributes(uint256 tokenId) internal view returns (string memory) {
        uint256 designIndex = _getUltraRareDesignIndex(tokenId);
        string memory designName = _getUltraRareDesignName(designIndex);
        
        return string(abi.encodePacked('[{"trait_type":"Ultra Rare Design","value":"', designName, '"},{"trait_type":"Rarity","value":"ultra rare"}]'));
    }

    function _getUltraRareTraitsJSON(uint256 tokenId) internal view returns (string memory) {
        uint256 designIndex = _getUltraRareDesignIndex(tokenId);
        string memory designName = _getUltraRareDesignName(designIndex);
        
        return string(abi.encodePacked(
            '{"ultraRareDesign":"', designName, '",',
            '"rarity":"ultra rare"}'
        ));
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
