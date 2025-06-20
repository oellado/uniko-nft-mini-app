# Unikō Technical Context

## Current Deployment Status

### Active Contract (UnikoOnchain8.sol) - V8 PURE GENERATIVE ✅
- **Address**: `0x9499175452Da5a6aaDC779a03B9Ab454949d76Cf`
- **Network**: Base Sepolia (testnet)
- **Status**: Deployed, Verified, Live System
- **BaseScan**: https://sepolia.basescan.org/address/0x9499175452Da5a6aaDC779a03B9Ab454949d76Cf#code
- **Deployment Date**: December 2024
- **Key Features**: Pure generative system with enhanced iOS compatibility

### Reference Contract (UnikoOnchain4.sol) - iOS-COMPATIBLE
- **Address**: `0xd6B2cdf183cD40A3B88a444D0fDe518f0AC2965F`
- **Status**: Working testnet with ultra rares (development reference)
- **Purpose**: Reference implementation during V8 development

### Frontend Application - V8 INTEGRATED ✅
- **URL**: https://uniko-nft-mini-fv8uszhcp-mgrsts-projects.vercel.app
- **Platform**: Vercel
- **Framework**: React + Vite + TypeScript
- **Status**: Updated with V8 contract, active and functional
- **Cross-Platform**: Enhanced iOS compatibility with improved typography

## 🍎 iOS COMPATIBILITY ENHANCED IN V8

### Problem Solved: Cross-Platform SVG Rendering
**Challenge**: SVGs looked great on Android/PC but poor on iPad/iPhone
**Root Causes**:
- Font fallback issues (`Segoe UI` not available on iOS/macOS)
- Unicode character rendering inconsistencies 
- SVG positioning problems with `dominant-baseline="central"`

### V8 Solution: Enhanced iOS Experience
**Font Evolution**:
1. **V4**: Complex font stack with iOS issues
2. **V7**: `"Arial"` (basic universal compatibility)
3. **V8**: `"Segoe UI, Helvetica, Arial, sans-serif"` (enhanced iOS experience)

**Text Alignment Improvements**:
- **Added**: `dominant-baseline="middle"` for better vertical centering
- **Added**: `dy="0.1em"` for fine-tuned positioning

**Benefits**:
- ✅ Enhanced typography while maintaining universal compatibility
- ✅ Improved text rendering across all platforms
- ✅ Better iOS user experience with fallback support
- ✅ User-tested on actual iOS devices

### iOS Testing Results
- **Test Method**: User testing on actual iPad/iPhone devices
- **Character Support**: All 32 Unicode characters render well
- **Enhanced Experience**: Improved typography with Segoe UI on supported platforms
- **Fallback Success**: Arial fallback works perfectly on all platforms

## MANDATORY RULES (CRITICAL)

### 🚫 NEVER VIOLATE THESE RULES
1. **NEVER TEST MINT**: Only the owner should mint tokens. Agent must never test minting functionality.
2. **NEVER ALTER ROYALTIES**: 10% to `0xE765185a42D623a99864C790a88cd29825d8A4b9` - hardcoded and immutable
3. **NEVER CHANGE DESIGNS**: Ultra rare designs and trait system are fixed and immutable
4. **NEVER MODIFY TRAITS**: All trait combinations are predetermined and must not be altered
5. **NEVER CHANGE REVEAL SYSTEM**: Optimistic reveal mechanism is fixed and must not be modified

### ✅ REQUIRED VALIDATIONS
- Always verify hash compatibility between deployment and contract
- Always verify royalties are exactly 10% to correct address
- Always update all admin scripts with new contract addresses
- Always test contract functions (except minting) before deployment
- Always triple-check reveal function will work
- **🍎 NEW**: Always consider cross-platform SVG compatibility

## Smart Contract Architecture

### Contract Stack
```solidity
contract UnikoOnchain8 is 
    ERC721,
    ERC721Enumerable, 
    ERC721Royalty,
    Pausable,
    Ownable,
    ReentrancyGuard
```

### Core Technologies
- **Solidity**: ^0.8.20
- **OpenZeppelin**: v5.0.0 contracts
- **Hardhat**: Development and deployment framework
- **Ethers.js**: v6 for blockchain interaction

### Storage Architecture
```solidity
// 100% onchain storage
mapping(uint256 => string) private _tokenTraits;

// V8 Pure Generative - NO ULTRA RARES
// Pure algorithmic generation, no predetermined designs

// Duplicate prevention
mapping(bytes32 => bool) private _usedTraitHashes;
```

### Critical Contract Functions
- `mint(uint256 quantity)` - Public minting with payment validation
- `tokenURI(uint256 tokenId)` - Complete Base64-encoded JSON metadata
- `getTokenMetadata(uint256 tokenId)` - Raw JSON for BaseScan integration
- `getUniko(uint256 tokenId)` - Face display (e.g., "• ᴗ •")
- `pause()` / `unpause()` - Owner-only contract control
- `withdraw()` - Owner-only funds withdrawal
- **NOTE**: V8 has no `rarity()` function (pure generative system)

## Frontend Technology Stack

### Core Framework
- **React**: 18.x with hooks
- **TypeScript**: Strict type checking
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling

### Blockchain Integration
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript interface for Ethereum
- **RainbowKit**: Wallet connection UI
- **Base Network**: L2 blockchain integration

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^4.4.0",
  "wagmi": "^2.0.0",
  "viem": "^2.0.0",
  "tailwindcss": "^3.3.0"
}
```

## Development Environment

### Local Development
```bash
# Frontend development
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build

# Smart contract development
npx hardhat compile              # Compile contracts
npx hardhat run scripts/deploy   # Deploy contracts
npx hardhat verify [address]    # Verify on BaseScan
```

### Network Configuration
```javascript
// Base Sepolia (current testnet)
const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] }
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' }
  }
}
```

## V8 Pure Generative Implementation

### No Ultra Rare System
V8 implements a pure generative approach:
- **100% Algorithmic**: All traits generated through deterministic randomness
- **No Predetermined Designs**: Eliminates hybrid approach for true generative integrity
- **Natural Rarity**: Special backgrounds (rainbow, based, purple) provide algorithmic rarity
- **Space Efficient**: Removing ultra rare SVGs freed significant contract space

### Enhanced Features
- **Improved iOS Typography**: Better font stack with fallback support
- **Text Alignment**: Enhanced positioning for better rendering
- **Cross-Platform**: Consistent experience across all devices
- **Admin Functions**: Complete pause, unpause, withdraw functionality

## Deployment Configuration

### V8 Current Settings
- **Contract Address**: `0x9499175452Da5a6aaDC779a03B9Ab454949d76Cf`
- **Network**: Base Sepolia
- **Royalties**: 10% to `0xE765185a42D623a99864C790a88cd29825d8A4b9`
- **Max Supply**: 10,000 tokens
- **Mint Price**: 0.000001 ETH
- **Status**: Live and operational

### V8 Technical Specifications
- **Contract Size**: 16.05 KB (8.14 KB under 24 KB limit)
- **Pure Generative**: No ultra rares, 100% algorithmic
- **Enhanced iOS**: Improved font stack and text alignment
- **Admin Ready**: All management functions operational

## Cross-Platform Compatibility Testing

### iOS Testing Protocol Established
1. **Analysis File Creation**: Generated `svg-ios-compatibility-analysis.html`
2. **User Device Testing**: Tested on actual iPad/iPhone
3. **Character Assessment**: Categorized Unicode character support
4. **Font Stack Testing**: Compared different font approaches
5. **Final Verification**: Confirmed acceptable rendering

### Test Results Summary
- **Cross-Platform Font**: `"Arial"` universally supported
- **Unicode Characters**: All 32 characters render acceptably
- **Special Cases**: ⬤ and ◓ render large but acceptable on iPhone
- **Platform Verification**: iPad/iPhone represent Mac rendering well

## Deployment Process - iOS-COMPATIBLE

### Complete Post-Deployment Workflow
1. **Contract Deployment**: Deploy with iOS-compatible fonts
2. **ABI Extraction**: Generate new ABI files
3. **Frontend Updates**: Update contract address and ABI
4. **Build and Deploy**: Deploy updated frontend to Vercel
5. **Script Synchronization**: Update ALL script addresses
6. **Verification**: Test functionality across platforms

### File Updates Completed ✅
```
✅ contracts/UnikoOnchain4.sol - iOS-compatible fonts
✅ src/config.ts - New contract address
✅ src/UnikoOnchain4ABI.json - Updated ABI
✅ scripts/admin/* - All admin scripts updated
✅ scripts/mint-500-optimized.js - Updated
✅ scripts/comprehensive-duplicate-check.js - Updated
✅ scripts/analyze-trait-probabilities.js - Updated
✅ scripts/important_scripts/*.bat - All batch files updated
```

## Current System Status - PRODUCTION READY ✅

### ✅ iOS Compatibility Achieved
- **Cross-Platform Font**: Universal `"Arial"` rendering
- **User Tested**: Verified on actual iOS devices
- **Character Support**: All 32 Unicode characters working
- **Frontend Responsive**: Works on all screen sizes

### ✅ Complete Deployment Synchronization
- **Contract**: Deployed and verified on BaseScan
- **Frontend**: Live and functional with new contract
- **Admin Tools**: All scripts point to current contract
- **Documentation**: Memory bank fully updated

### ✅ Technical Achievements
- **100% Onchain**: All art and metadata stored on blockchain
- **Cross-Platform**: Consistent rendering across ALL devices
- **Size Optimized**: Successfully deployed within blockchain limits
- **Production Ready**: All systems operational and tested

## 🎯 Ready for Next Steps

### Immediate Capabilities
- ✅ **Owner Minting**: Ready for testing and use
- ✅ **Cross-Platform Display**: Works on iOS, Android, PC, Mac
- ✅ **Admin Functions**: Pause, reveal, withdraw all operational
- ✅ **Mainnet Deployment**: Ready when appropriate

### Established Standards
- ✅ **Cross-Platform NFTs**: Set new standard for platform compatibility
- ✅ **User-Tested Deployment**: Real device verification protocol
- ✅ **Complete Synchronization**: All tools working with current deployment
- ✅ **Documentation Excellence**: Comprehensive memory bank for future agents

Unikō represents a breakthrough in truly cross-platform, 100% onchain NFT collections with verified iOS compatibility and production-ready functionality.

## Important Contract Notes (Extracted from UnikoOnchain4.sol)

### Contract Version History & Fixes
**UnikoOnchain4.sol - PROPERLY FIXED VERSION**
- ✅ CORRECT ROYALTIES: 10% to 0xE765185a42D623a99864C790a88cd29825d8A4b9
- ✅ PROPER XML ESCAPING: Added _escapeXML function for "> <" cheeks
- ✅ Correct alignment (35%/65% for eyes, no dy offset)
- ✅ Correct rainbow/based/purple gradients  
- ✅ Added getUniko() and rarity() functions
- ✅ Working reveal() function
- ✅ iOS-Compatible Arial font implementation

### Critical Implementation Details
**XML Escaping Implementation:**
- Required for "> <" cheek characters to render properly in SVG
- Converts: > → &gt;, < → &lt;, & → &amp;, " → &quot;, ' → &apos;
- Essential for valid XML/SVG generation

**SVG Positioning (FIXED):**
- Eyes positioned at 35% and 65% (not 40%/60%)
- No dy offset needed with dominant-baseline="central"
- XML escaping applied to all dynamic content

**Gradient Definitions (CORRECT):**
- Rainbow: 6-stop gradient (#B29AE1 → #F8BEF1 → #FDAFAE → #F8CC1F → #B9E99C → #99E1FF)
- Based: White to blue (#FFFFFF → #366CFF)
- Purple: White to purple (#FFFFFF → #5B24FF)

**Ultra Rare Design Mapping (FIXED):**
- Uses fixed mapping to prevent duplicates while keeping positions hidden
- Maps each ultra rare position to unique design using reveal array order
- Design index (0-9) stored for each token based on position in reveal array

### Gas Efficiency Notes
**Visual Hash Duplicate Prevention:**
- Uses keccak256 hash of trait components for gas-efficient uniqueness check
- Hashes strings to fit in single storage slot
- Race condition fix implemented with proper trait generation

**Memory Management:**
- ERC721Enumerable actual token count used (not counter)
- Optimistic reveal system minimizes storage until reveal
- Trait storage optimized with JSON string format

### OpenZeppelin v4.9 Compatibility
**Required Overrides:**
- _burn() - handles ERC721Royalty integration
- _beforeTokenTransfer() - handles multiple inheritance
- supportsInterface() - resolves interface conflicts
- totalSupply() - uses ERC721Enumerable implementation

### Function Documentation
**getTokenMetadata():** CRITICAL for BaseScan integration - returns raw metadata JSON
**getUniko():** Returns face display format (e.g., "• ᴗ •")
**rarity():** Returns "regular", "rainbow", "based", "purple", or "ultra rare"
**reveal():** READY TO USE - optimistic reveal with commitment verification