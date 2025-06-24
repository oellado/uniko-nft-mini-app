// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title UnikoRenderer - External SVG Renderer for Uniko NFTs
 * @dev Handles SVG generation with embedded fonts and cross-platform compatibility.
 * This contract contains the exact visual logic from UnikoOnchain8.sol but as an external renderer
 * to reduce the main contract size while maintaining identical output.
 */
contract UnikoRenderer {
    
    /**
     * @dev Renders an SVG for a token based on its traits (JSON format)
     * @param traits JSON string containing all trait values 
     * Format: {"eyes":"•","mouth":"ᴗ","cheeks":"^ ^","accessory":"♫","background":"sakura","faceColor":"#000000"}
     */
    function renderTokenSVG(string calldata traits) external pure returns (string memory) {
        // Extract individual traits from JSON
        string memory eye = _extractTraitValue(traits, "eyes");
        string memory mouth = _extractTraitValue(traits, "mouth");
        string memory cheeksValue = _extractTraitValue(traits, "cheeks");
        string memory accessory = _extractTraitValue(traits, "accessory");
        string memory background = _extractTraitValue(traits, "background");
        string memory faceColor = _extractTraitValue(traits, "faceColor");

        // Split cheeks into left and right parts
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
        } else if (_stringsEqual(background, "champagne")) { 
            bgColor = "url(#champagne)";
            gradientDefs = string(abi.encodePacked(gradientDefs, '<linearGradient id="champagne" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFEAA7"/><stop offset="40%" stop-color="#FDCB6E"/><stop offset="70%" stop-color="#E17055"/><stop offset="100%" stop-color="#A0522D"/></linearGradient>'));
        } else if (_stringsEqual(background, "sakura")) { 
            bgColor = "url(#sakura)";
            gradientDefs = string(abi.encodePacked(gradientDefs, '<linearGradient id="sakura" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F098FF"/><stop offset="100%" stop-color="#FFFFFF"/></linearGradient>'));
        } else { 
            bgColor = background; 
        }

        //SVG structure
        return string(abi.encodePacked(
            '<svg width="280" height="280" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">',
            '<defs>', gradientDefs, '</defs>',
            '<rect width="100%" height="100%" fill="', bgColor, '"/>',
            '<text y="50%" font-size="40" text-anchor="middle" dominant-baseline="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif" fill="', faceColorFill, '" dy="0.1em">',
            '<tspan x="25%"', _getCharacterAdjustment(cheekParts[0]), '>', _escapeXML(cheekParts[0]), '</tspan>',
            '<tspan x="35%">', _escapeXML(eye), '</tspan>',
            '<tspan x="50%">', _escapeXML(mouth), '</tspan>',
            '<tspan x="65%">', _escapeXML(eye), '</tspan>',
            '<tspan x="75%"', _getCharacterAdjustment(cheekParts[1]), '>', _escapeXML(cheekParts[1]), '</tspan>',
            '<tspan x="85%">', _escapeXML(accessory), '</tspan>',
            '</text></svg>'
        ));
    }

    // --- Helper Functions ---

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

    /**
     * @dev Escape XML special characters (exact copy from v8)
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

    /**
     * @dev Get character-specific vertical adjustment for cross-platform alignment
     * Fixes iOS positioning issues for certain Unicode characters
     */
    function _getCharacterAdjustment(string memory str) internal pure returns (string memory) {
        // Monocle character needs to be lowered on iOS to align with other platforms
        if (_stringsEqual(str, unicode"⌐")) {
            return " dy=\"0.3em\"";
        }
        return "";
    }
} 