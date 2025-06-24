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

// --- Interface for the external renderer contract ---
interface IUnikoRenderer {
    function renderTokenSVG(string calldata traits) external pure returns (string memory);
}

/**
 * @title Unikō_01 - Main Contract
 * @dev Manages minting, ownership, and metadata for Unikō NFTs.
 * Art generation is delegated to an external Renderer contract.
 * @notice ERC721Enumerable restored for frontend compatibility.
 */
contract Uniko_01 is ERC721, ERC721Enumerable, ERC721Pausable, ERC721Royalty, Ownable, ReentrancyGuard {
    
    // --- State Variables ---
    uint256 public constant MAX_SUPPLY = 10000;
    
    // Sale Management
    uint256 public allowlistPrice = 0.000001 ether;
    uint256 public publicPrice = 0.0000015 ether;
    enum Phase { INACTIVE, ALLOWLIST, PUBLIC }
    Phase public currentPhase = Phase.INACTIVE;
    mapping(address => bool) public allowlist;

    // Art & Metadata
    IUnikoRenderer public renderer;
    uint256 private _tokenIdCounter;
    mapping(bytes32 => bool) private _usedTraitCombinations;
    mapping(uint256 => string) private _tokenTraits;
    mapping(uint256 => uint256) public tokenSeeds;

    // --- Trait Arrays (for generation) ---
    string[] private eyes = [ unicode"•", unicode"⚆", unicode"⚈", unicode"⨀", unicode"⦿", unicode"⤬", unicode"◒", unicode"◓", unicode"◕", unicode"∸", unicode"-", unicode"■", unicode"⊡", unicode"◨", unicode"∩", unicode"⬗", unicode"⋒", unicode"ö", unicode"ō" ];
    string[] private mouths = [ unicode"ᴗ", unicode"⤻", unicode"―", unicode"﹏", unicode"⩊", unicode"ω", unicode"⟀", unicode"~", unicode"⩌", unicode"︿", unicode"3", unicode"•", unicode"ᆺ", unicode"ᴥ", unicode"ʌ", unicode"⎦", unicode"◠", unicode"⌓" ];
    string[] private cheeks = [ "^ ^", "> <", unicode"– –", "= =", unicode"● ●", "~ ~", unicode"≈ ≈", unicode"≋ ≋", unicode"⁕ ⁕", unicode"∙ ∙", unicode"∘ ∘", unicode"⌐ " ];
    string[] private accessories = [ unicode"♫", unicode"✿", unicode"★", unicode"✧", unicode"☾", unicode"↑", unicode"♥" ];
    string[] private backgroundColors = [ "#1A1A1A", "#FFFFFF", "#B29BE1", "#F9BFF2", "#FEAFAF", "#F9CC1F", "#BAE99C", "#99E2FF" ];
    string[] private faceColors = [ "#000000", "#EAEAE8", "#9774CE", "#FA85CB", "#EA434A", "#E55A2B", "#57A52B", "#6B97FF", "rainbow" ];
    
    // --- Events ---
    event NFTMinted(address indexed to, uint256 indexed tokenId, string traits);
    event TokenGenerated(uint256 indexed tokenId, uint256 seed, uint256 attempts);
    event RareTraitGenerated(uint256 indexed tokenId, string traitType, string value);
    event PhaseChanged(Phase newPhase);
    event AllowlistUpdated(address indexed user, bool status);
    event PriceUpdated(string priceType, uint256 newPrice);
    event RendererUpdated(address indexed newRenderer);

    constructor(address royaltyRecipient, uint96 royaltyBps) ERC721(unicode"Unikō", "UNIKO") {
        _setDefaultRoyalty(royaltyRecipient, royaltyBps);
    }

    // --- Admin & Setup ---
    function setRenderer(address _rendererAddress) external onlyOwner {
        require(_rendererAddress != address(0), "zero addr");
        renderer = IUnikoRenderer(_rendererAddress);
        emit RendererUpdated(_rendererAddress);
    }
    
    // --- Sale Management ---
    function setPhase(Phase _phase) external onlyOwner { currentPhase = _phase; emit PhaseChanged(_phase); }
    function startAllowlistPhase() external onlyOwner { currentPhase = Phase.ALLOWLIST; emit PhaseChanged(Phase.ALLOWLIST); }
    function startPublicPhase() external onlyOwner { currentPhase = Phase.PUBLIC; emit PhaseChanged(Phase.PUBLIC); }
    function endMinting() external onlyOwner { currentPhase = Phase.INACTIVE; emit PhaseChanged(Phase.INACTIVE); }
    function setAllowlistPrice(uint256 _price) external onlyOwner { allowlistPrice = _price; emit PriceUpdated("ALLOWLIST", _price); }
    function setPublicPrice(uint256 _price) external onlyOwner { publicPrice = _price; emit PriceUpdated("PUBLIC", _price); }
    function addToAllowlist(address[] calldata a) external onlyOwner { for (uint i=0;i<a.length;i++){allowlist[a[i]]=true;emit AllowlistUpdated(a[i],true);}}
    function removeFromAllowlist(address[] calldata a) external onlyOwner { for (uint i=0;i<a.length;i++){allowlist[a[i]]=false;emit AllowlistUpdated(a[i],false);}}
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    function withdraw() external onlyOwner nonReentrant { (bool s,)=owner().call{value:address(this).balance}("");require(s,"w"); }

    // --- View Functions ---
    function getCurrentPrice() external view returns (uint256) { if (currentPhase == Phase.ALLOWLIST) return allowlistPrice; if (currentPhase == Phase.PUBLIC) return publicPrice; return 0; }
    function canMint(address u) external view returns (bool,uint256,string memory) {if(currentPhase==Phase.ALLOWLIST&&allowlist[u]){return(true,allowlistPrice,"ALLOWLIST");}if(currentPhase==Phase.PUBLIC){return(true,publicPrice,"PUBLIC");}return(false,0,"INACTIVE");}

    // --- Overrides ---
    function _baseURI() internal pure override returns (string memory) { return ""; }
    function _burn(uint256 id) internal override(ERC721, ERC721Royalty) { super._burn(id); }
    function _beforeTokenTransfer(address from, address to, uint256 id, uint256 n) internal override(ERC721, ERC721Enumerable, ERC721Pausable) { super._beforeTokenTransfer(from, to, id, n); }
    function supportsInterface(bytes4 id) public view override(ERC721, ERC721Enumerable, ERC721Royalty) returns (bool) { return super.supportsInterface(id); }

    // --- Minting ---
    function mint(uint256 quantity) external payable nonReentrant whenNotPaused {
        require(quantity > 0 && quantity <= 10, "q");
        uint256 total = _tokenIdCounter + quantity;
        require(total <= MAX_SUPPLY, "max");
        
        uint256 price;
        if (currentPhase == Phase.ALLOWLIST) { require(allowlist[msg.sender], "al"); price = allowlistPrice; } 
        else if (currentPhase == Phase.PUBLIC) { price = publicPrice; } 
        else { revert("inactive"); }
        
        require(msg.value >= price * quantity, "pay");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            (string memory traits, uint256 seed, uint256 attempts) = _generateUniqueTraits(tokenId, msg.sender);
            _tokenTraits[tokenId] = traits;
            tokenSeeds[tokenId] = seed;
            
            _safeMint(msg.sender, tokenId);
            emit NFTMinted(msg.sender, tokenId, traits);
            emit TokenGenerated(tokenId, seed, attempts);
            
            _tokenIdCounter++;
        }
    }
    
    // --- Owner Mint ---
    function ownerMint(address to, uint256 quantity) external onlyOwner nonReentrant {
        require(to != address(0), "Zero address");
        require(quantity > 0 && quantity <= 50, "Invalid quantity");
        uint256 total = _tokenIdCounter + quantity;
        require(total <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            (string memory traits, uint256 seed, uint256 attempts) = _generateUniqueTraits(tokenId, to);
            _tokenTraits[tokenId] = traits;
            tokenSeeds[tokenId] = seed;
            
            _safeMint(to, tokenId);
            emit NFTMinted(to, tokenId, traits);
            emit TokenGenerated(tokenId, seed, attempts);
            
            _tokenIdCounter++;
        }
    }
    
    // --- Trait Generation ---
    function _generateUniqueTraits(uint256 tokenId, address minter) private returns (string memory, uint256, uint256) {
        for (uint256 attempt = 0; attempt < 100; attempt++) {
            uint256 seed = uint256(keccak256(abi.encodePacked(tokenId,minter,block.timestamp,block.prevrandao,attempt)));
            
            // eyeIndex: 19 total eyes (0-18). Index 18 is rare (ō). ~3% chance.
            uint256 eyeIndex; 
            if ((seed & 0xFFFF) < 2000) { 
                eyeIndex = 18; // ō at index 18
            } else { 
                eyeIndex = ((seed >> 16) & 0xFFFF) % 18; // Use the first 18 eyes (0-17)
            }
            
            uint256 mouthIndex;
            uint256 mouthRand = (seed >> 32) & 0xFFFF; // 0-65535
            if (mouthRand < 655) { // ~1% for ◠ (mouth at index 16)
                mouthIndex = 16;
            } else if (mouthRand < 1966) { // ~2% for ⌓ (mouth at index 17) 
                mouthIndex = 17;
            } else {
                // Exclude rare mouths (indices 16,17) from random selection - only available through conditionals above
                // We want: 0-15 (regular mouths) + 18 (no mouth) - total 17 options
                uint256 randomMouth = ((seed >> 48) & 0xFFFF) % 17;
                if (randomMouth >= 16) {
                    mouthIndex = 18; // "no mouth" option (index 18 = mouths.length)
                } else {
                    mouthIndex = randomMouth; // Regular mouth indices 0-15 (skipping rare mouths at 16,17)
                }
            }

            uint256 cheekIndex; 
            bool isCompatibleEye = (eyeIndex==3||eyeIndex==11||eyeIndex==12||eyeIndex==13||eyeIndex==15); 
            if (isCompatibleEye && ((seed >> 64) & 0xFFFF) < 5243) { // ~8% for special cheek with compatible eye
                cheekIndex = 11; // ⌐ monocle
            } else { 
                // Exclude monocle (index 11) from random selection - only available through conditional above
                // We want indices: 0-10 (regular cheeks) + 12 (no cheeks) - total 12 options
                uint256 randomCheek = ((seed >> 80) & 0xFFFF) % 12; 
                if (randomCheek >= 11) {
                    cheekIndex = 12; // "no cheeks" option (index 12 = cheeks.length)
                } else {
                    cheekIndex = randomCheek; // Regular cheek indices 0-10 (skipping monocle at 11)
                }
            }

            uint256 accessoryIndex = ((seed >> 96) & 0xFFFF) % (accessories.length + 1); // +1 for "no accessory"
            
            uint256 faceColorIndex; 
            if (((seed >> 112) & 0xFFFF) < 1310) { // ~2% for rainbow face
                faceColorIndex = 8; 
            } else { 
                faceColorIndex = ((seed >> 128) & 0xFFFF) % 8; 
            }
            
            string memory background; 
            uint256 bgHash = (seed >> 144) & 0xFFFF; // 0-65535
            if (bgHash < 655) { background = "rainbow"; } // ~1%
            else if (bgHash < 1966) { background = "titanium"; } // ~2%
            else if (bgHash < 3277) { background = "gold"; } // ~2%
            else if (bgHash < 4588) { background = "champagne"; } // ~2%
            else if (bgHash < 6554) { background = "based"; } // ~3%
            else if (bgHash < 8520) { background = "purple"; } // ~3%
            else if (bgHash < 9831) { background = "sakura"; } // ~2%
            else { background = backgroundColors[((seed >> 160) & 0xFFFF) % backgroundColors.length]; }

            bytes32 traitHash = keccak256(abi.encodePacked(eyeIndex,mouthIndex,cheekIndex,accessoryIndex,faceColorIndex,keccak256(bytes(background))));
            
            if (!_usedTraitCombinations[traitHash]) {
                _usedTraitCombinations[traitHash] = true;
                if (eyeIndex == 18) emit RareTraitGenerated(tokenId, "Eyes", eyes[18]);
                if (mouthIndex == 16) emit RareTraitGenerated(tokenId, "Mouth", mouths[16]);
                if (mouthIndex == 17) emit RareTraitGenerated(tokenId, "Mouth", mouths[17]);
                if (faceColorIndex == 8) emit RareTraitGenerated(tokenId, "Face Color", "rainbow");
                if (keccak256(abi.encodePacked(background)) == keccak256(abi.encodePacked("rainbow"))) emit RareTraitGenerated(tokenId, "Background", "rainbow");
                if (keccak256(abi.encodePacked(background)) == keccak256(abi.encodePacked("sakura"))) emit RareTraitGenerated(tokenId, "Background", "sakura");

                string memory traitsJson = string(abi.encodePacked('{"eyes":"',eyes[eyeIndex],'","mouth":"',mouthIndex < mouths.length ? mouths[mouthIndex]:"",'","cheeks":"',cheekIndex < cheeks.length ? cheeks[cheekIndex]:"",'","accessory":"',accessoryIndex < accessories.length ? accessories[accessoryIndex]:"",'","background":"',background,'","faceColor":"',faceColors[faceColorIndex],'"}'));
                return (traitsJson, seed, attempt + 1);
            }
        }
        revert("gen");
    }
    
    // --- Metadata ---
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ne");
        require(address(renderer) != address(0), "no renderer");

        string memory traits = _tokenTraits[tokenId];
        string memory svg = generateSVG(tokenId); // Use generateSVG for proper format conversion
        string memory attributes = _formatAttributes(traits);

        string memory json = string(abi.encodePacked(
            unicode'{"name":"Unikō #', Strings.toString(tokenId), '",',
            unicode'"description":"Your cute onchain companions, a generative project by Miguelgarest",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
            '"attributes":', attributes, '}'
        ));
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function _formatAttributes(string memory t) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '[{"trait_type":"Eyes","value":"', _extractTraitValue(t, "eyes"), '"},',
            '{"trait_type":"Mouth","value":"', _extractTraitValue(t, "mouth"), '"},',
            '{"trait_type":"Cheeks","value":"', _extractTraitValue(t, "cheeks"), '"},',
            '{"trait_type":"Accessory","value":"', _extractTraitValue(t, "accessory"), '"},',
            '{"trait_type":"Background","value":"', _extractTraitValue(t, "background"), '"},',
            '{"trait_type":"Face Color","value":"', _extractTraitValue(t, "faceColor"), '"}]'
        ));
    }

    function _extractTraitValue(string memory j, string memory k) internal pure returns (string memory) {
        bytes memory b = bytes(j);
        bytes memory key = bytes(string(abi.encodePacked('"', k, '":"')));
        for (uint i = 0; i + key.length < b.length; i++) {
            bool isMatch = true;
            for (uint x = 0; x < key.length; x++) {
                if (b[i + x] != key[x]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                uint s = i + key.length;
                uint e = s;
                while (e < b.length && b[e] != '"') { e++; }
                bytes memory val = new bytes(e - s);
                for (uint x = 0; x < val.length; x++) { val[x] = b[s + x]; }
                return string(val);
            }
        }
        return "";
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

    /**
     * @dev Generate SVG for a specific token using the external renderer
     */
    function generateSVG(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        require(address(renderer) != address(0), "Renderer not set");
        
        // Pass JSON traits directly to renderer (same format as v8)
        string memory traits = _tokenTraits[tokenId];
        
        return renderer.renderTokenSVG(traits);
    }
} 