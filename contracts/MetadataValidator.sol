// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MetadataValidator
 * @dev Contract mixin that enforces metadata validation for NFTs
 */
abstract contract MetadataValidator {
    using Strings for uint256;

    // Required trait types that must be present in every token
    string[] private REQUIRED_TRAITS;

    constructor() {
        REQUIRED_TRAITS.push("Eyes");
        REQUIRED_TRAITS.push("Mouth");
        REQUIRED_TRAITS.push("Left Cheek");
        REQUIRED_TRAITS.push("Right Cheek");
        REQUIRED_TRAITS.push("Accessory");
        REQUIRED_TRAITS.push("Background");
        REQUIRED_TRAITS.push("Face Color");
    }

    // Custom errors
    error InvalidMetadata(uint256 tokenId, string reason);
    error InvalidSVG(uint256 tokenId, string reason);
    error MissingRequiredTrait(uint256 tokenId, string traitType);
    error InvalidTokenName(uint256 tokenId, string expected, string received);

    /**
     * @dev Validates the metadata JSON structure
     * @param tokenId The token ID being validated
     * @param metadata The metadata JSON string
     */
    function validateMetadata(uint256 tokenId, string memory metadata) internal view {
        // Basic structure validation
        if (bytes(metadata).length == 0) {
            revert InvalidMetadata(tokenId, "Empty metadata");
        }

        // Validate required fields are present
        bool hasName = _containsField(metadata, '"name"');
        bool hasDescription = _containsField(metadata, '"description"');
        bool hasImage = _containsField(metadata, '"image"');
        bool hasAttributes = _containsField(metadata, '"attributes"');

        if (!hasName) revert InvalidMetadata(tokenId, "Missing name field");
        if (!hasDescription) revert InvalidMetadata(tokenId, "Missing description field");
        if (!hasImage) revert InvalidMetadata(tokenId, "Missing image field");
        if (!hasAttributes) revert InvalidMetadata(tokenId, "Missing attributes field");

        // Validate token name format
        string memory expectedName = string(abi.encodePacked("Uniko #", tokenId.toString()));
        if (!_containsField(metadata, expectedName)) {
            revert InvalidTokenName(tokenId, expectedName, "Invalid name format");
        }

        // Validate SVG data
        if (!_containsField(metadata, "data:image/svg+xml;base64,")) {
            revert InvalidSVG(tokenId, "Invalid SVG data format");
        }

        // Validate required traits
        for (uint i = 0; i < REQUIRED_TRAITS.length; i++) {
            if (!_containsField(metadata, REQUIRED_TRAITS[i])) {
                revert MissingRequiredTrait(tokenId, REQUIRED_TRAITS[i]);
            }
        }
    }

    /**
     * @dev Checks if a field exists in the metadata JSON
     * @param json The JSON string to search in
     * @param field The field to search for
     */
    function _containsField(string memory json, string memory field) private pure returns (bool) {
        bytes memory jsonBytes = bytes(json);
        bytes memory fieldBytes = bytes(field);
        
        if (jsonBytes.length < fieldBytes.length) return false;
        
        for (uint i = 0; i < jsonBytes.length - fieldBytes.length; i++) {
            bool found = true;
            for (uint j = 0; j < fieldBytes.length; j++) {
                if (jsonBytes[i + j] != fieldBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        return false;
    }

    /**
     * @dev Hook that is called before any token operation
     * Override this in your token contract
     */
    function _beforeTokenOperation(uint256 tokenId, string memory metadata) internal view virtual {
        validateMetadata(tokenId, metadata);
    }
} 