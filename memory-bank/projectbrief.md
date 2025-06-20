# Unikō NFT Project Brief

## Project Overview
**Unikō** is a **100% onchain generative art NFT collection** featuring minimalist Unicode-based character faces. Every aspect of the NFT—metadata, traits, and SVG art—is generated and stored entirely onchain in the smart contract.

## Core Specifications

### Collection Details
- **Name**: Unikō (Unicode: "Unikō")
- **Symbol**: UNIKO
- **Total Supply**: 10,000 NFTs
- **Network**: Base Sepolia (testnet) → Base Mainnet (production)
- **Mint Price**: 0.000001 ETH (testnet) / 0.001 ETH (mainnet)
- **Contract Type**: ERC721 + ERC721Enumerable + ERC721Royalty + Pausable

### Art & Traits System
- **100% Onchain**: All art generation happens in the smart contract
- **Unicode-based**: Uses Unicode characters for eyes, mouths, cheeks, accessories
- **🍎 Cross-Platform Compatible**: Consistent rendering on iOS, Android, PC, Mac
- **Fixed Traits**: All trait combinations are predetermined and immutable
- **No Frontend Generation**: Frontend only mints and displays; contract handles all creation

### 🎯 V8 PURE GENERATIVE SYSTEM DEPLOYED ✅
- **LIVE DEPLOYMENT**: V8 eliminates predetermined designs for true 100% generative art
- **Contract Address**: `0x9499175452Da5a6aaDC779a03B9Ab454949d76Cf` (Base Sepolia)
- **Algorithmic Rarity**: Special backgrounds (rainbow, based, purple) provide natural rarity
- **Size Optimized**: 16.05 KB compiled with 8.14 KB buffer for advanced features
- **Enhanced iOS**: Improved font stack and text alignment for better mobile experience
- **Mini App Live**: Deployed to Vercel with full V8 integration
- **Admin Tools**: All scripts updated and operational

### Previous Ultra Rare System (V4 Reference)
- **10 Ultra Rares**: nounish, pika, 3Dglasses, pepe, imagine, duo, kuma, uniko, alien, mochi
- **Optimistic Reveal**: Users see art immediately; rarity revealed post-mint
- **Status**: Removed in V8 to achieve true generative integrity (V4 remains as reference)

### Royalties (CRITICAL)
- **Percentage**: 10% (1000 basis points)
- **Recipient**: `0xE765185a42D623a99864C790a88cd29825d8A4b9`
- **Implementation**: Hardcoded in contract via ERC2981
- **V8 Status**: ✅ Verified and deployed correctly

### **🍎 Cross-Platform Compatibility (ENHANCED IN V8)**
- **Enhanced Font Stack**: `"Segoe UI, Helvetica, Arial, sans-serif"` for better iOS typography
- **Text Alignment**: Added `dominant-baseline="middle"` and `dy="0.1em"`
- **iOS Tested**: Verified on actual iPad/iPhone devices
- **Character Support**: All 32 Unicode characters render correctly on iOS
- **Consistent Experience**: Enhanced appearance across iOS, Android, PC, Mac

## MANDATORY RULES (NEVER CHANGE)

### 🚫 CRITICAL RESTRICTIONS
1. **NEVER TEST MINT**: Only the owner should mint tokens. Agent must never test minting functionality.
2. **NEVER ALTER ROYALTIES**: 10% to `0xE765185a42D623a99864C790a88cd29825d8A4b9` - hardcoded and immutable
3. **NEVER CHANGE DESIGNS**: Ultra rare designs and trait system are fixed and immutable
4. **NEVER MODIFY TRAITS**: All trait combinations are predetermined and must not be altered
5. **NEVER CHANGE REVEAL SYSTEM**: Optimistic reveal mechanism is fixed and must not be modified

### ✅ REQUIRED VALIDATIONS
- Always verify royalties before deployment
- Always verify reveal function compatibility (hash methods must match)
- Always confirm ultra rare designs match specifications
- Always test contract functions (except minting) before deployment
- Always update all admin scripts with new contract addresses
- **🍎 NEW**: Always verify cross-platform SVG compatibility

## Technical Architecture

### Smart Contract Evolution

#### Current: UnikoOnchain8.sol (PURE GENERATIVE DEPLOYED) ✅
- **Address**: `0x9499175452Da5a6aaDC779a03B9Ab454949d76Cf` (Base Sepolia)
- **Status**: ✅ Deployed, ✅ Verified, ✅ Live System
- **100% Onchain Storage**: `mapping(uint256 => string) private _tokenTraits`
- **Pure Generative**: No predetermined designs, 100% algorithmic
- **Optimized Size**: 16.05 KB compiled (8.14 KB under blockchain limit)
- **Enhanced iOS**: Improved font stack and text alignment
- **Mini App**: Live at https://uniko-nft-mini-fv8uszhcp-mgrsts-projects.vercel.app

#### Reference: UnikoOnchain4.sol (iOS-Compatible with Ultra Rares)
- **Address**: `0xd6B2cdf183cD40A3B88a444D0fDe518f0AC2965F`
- **Status**: Working testnet deployment with ultra rares (development reference)
- **Purpose**: Reference implementation and development platform

#### Critical Functions (All Versions)
- `mint(uint256 quantity)` - Public minting
- `tokenURI(uint256 tokenId)` - Returns complete metadata
- `getTokenMetadata(uint256 tokenId)` - Raw metadata for BaseScan
- `getUniko(uint256 tokenId)` - Returns face display
- `rarity(uint256 tokenId)` - Returns rarity status

### Frontend (Farcaster Mini App)
- **Platform**: Farcaster Frame integration
- **Purpose**: Minting interface and collection display
- **Framework**: React + Vite + Wagmi
- **Grid Layout**: 3x3 consistent layout (9 NFTs per page)
- **Network**: Base Sepolia testnet
- **🍎 Cross-Platform**: Works perfectly on iOS, Android, PC, Mac

## Current Development Status

### 🚀 V8 PURE GENERATIVE DEPLOYMENT COMPLETE ✅
- **Contract**: UnikoOnchain8.sol - 100% algorithmic generative
- **Status**: ✅ Deployed, ✅ Verified, ✅ Live on Base Sepolia
- **Address**: `0x9499175452Da5a6aaDC779a03B9Ab454949d76Cf`
- **Size**: 16.05 KB compiled (33% under 24 KB limit)
- **Achievement**: Pure generative integrity + enhanced iOS compatibility + live system

### Live System Components ✅
- **Smart Contract**: Deployed and verified on Base Sepolia
- **Mini App**: Live at https://uniko-nft-mini-fv8uszhcp-mgrsts-projects.vercel.app
- **Administrative Tools**: All scripts updated and operational
- **Cross-Platform**: Enhanced typography across all devices

### Version Evolution Summary
- **V4**: iOS-compatible with ultra rares (reference implementation)
- **V5**: Gas-optimized but 28.2KB (too large for mainnet)
- **V6**: Optimized but 24.7KB (85 bytes over limit)
- **V7**: Pure generative breakthrough at 14.7KB (created but not deployed)
- **V8**: Live deployment at 16.05KB with enhanced features (CURRENT)

## Business Requirements

### Immutability
- **Art Must Not Be Altered**: Designs are fixed unless explicitly commanded
- **Trait Preservation**: All traits (purple, rainbow, based backgrounds) are locked
- **Ultra Rare Designs**: 10 designs are immutable and predefined

### Deployment Standards
1. **Verify Contract**: Always verify on BaseScan after deployment
2. **Update Frontend**: Update contract address in mini app
3. **Generate Admin Scripts**: Create .bat files for maintenance
4. **Confirm Royalties**: Verify 10% to correct recipient
5. **Test Reveal Function**: Verify hash compatibility before deployment
6. **🍎 NEW**: Verify cross-platform compatibility on iOS devices

### Maintenance Requirements
- Pause/unpause functionality for emergencies
- Withdraw function for collected funds
- Reveal function for ultra rare system
- Owner-only administrative functions

## Ultra Rare System Details

### Current Configuration (iOS-Compatible)
- **Commitment Hash**: `0x1e086c6004779eb3679b4944cd2a1f6ce478f14a3a2bc62164c6e4a0a7add8e0`
- **Secret Key**: `"uniko2024"` (synchronized across all scripts)
- **Positions**: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
- **Hash Method**: `abi.encode()` (both deployment and contract)

### Reveal Function Status
- **Status**: ✅ WORKING (Hash methods synchronized)
- **Compatibility**: ✅ VERIFIED - Hash methods match
- **Ready for Testing**: Owner can test reveal functionality

### Ultra Rare Designs
1. **nounish**: ⌐◨-◨ (nounish glasses)
2. **pika**: ⬤-⩊-⬤ (Pikachu-inspired)
3. **pepe**: ∙◒ᴗ◒∙ (Pepe-inspired)
4. **3Dglasses**: ⌐■-■ (3D glasses)
5. **imagine**: ⌐O-O✿ (John Lennon glasses) - Updated with centered positioning
6. **duo**: •ᴗ• / •ᴗ• (duo face)
7. **kuma**: •ᴥ• (bear face)
8. **uniko**: •ᴗ• (classic Uniko)
9. **alien**: ⟁⬤ᴗ⬤⟁ (alien face)
10. **mochi**: (•ᴗ•) (mochi face)

## **🍎 Cross-Platform Achievement Documentation**

### Problem Identified
- **Issue**: SVGs rendered differently on iOS vs other platforms
- **Impact**: Poor user experience for iOS users (significant portion of mobile users)
- **Root Cause**: Font fallback issues with `Segoe UI` not available on iOS

### Solution Process
1. **Analysis**: Created comprehensive compatibility testing file
2. **User Testing**: Real device testing on iPad/iPhone
3. **Font Optimization**: Simplified to universal `"Arial"` font
4. **Character Testing**: Verified all 32 Unicode characters work on iOS
5. **Contract Deployment**: Successfully deployed within blockchain size limits

### Results Achieved ✅
- **Universal Rendering**: Identical appearance across all platforms
- **User Verification**: Confirmed good rendering on actual iOS devices
- **Character Support**: All Unicode characters work acceptably
- **Size Optimization**: Font simplification helped with contract size constraints

### Future Standard Established
- **Cross-Platform Testing**: Established protocol for iOS device testing
- **Universal Fonts**: Use of web-safe fonts for NFT collections
- **Real Device Verification**: Testing on actual user devices, not just simulators
- **Comprehensive Documentation**: Complete process documentation for future projects

## 🚀 MILESTONE: V8 PURE GENERATIVE DEPLOYMENT COMPLETE

### Major Achievement: Live Pure Generative System ✅
Unikō V8 represents the successful deployment of the pure generative vision:
- ✅ **Pure Generative**: True 100% algorithmic art (no predetermined designs)
- ✅ **Live System**: Deployed and operational on Base Sepolia
- ✅ **Size Optimized**: 16.05 KB with 8.14 KB buffer remaining
- ✅ **Enhanced iOS**: Improved font stack and text alignment
- ✅ **Cross-Platform**: Universal compatibility preserved and enhanced
- ✅ **Mini App Live**: Full frontend deployment with V8 integration

### Technical Innovation Realized
- **Philosophical Achievement**: Pure generative system successfully deployed
- **User Experience**: Enhanced iOS compatibility with improved typography
- **System Integration**: Complete deployment with all tools operational
- **Future Ready**: Significant space available for advanced features

The V8 deployment represents the successful realization of the pure generative NFT vision with excellent user experience across all platforms. 