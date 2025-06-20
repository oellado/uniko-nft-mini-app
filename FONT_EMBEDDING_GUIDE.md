# Unikō Font Embedding Guide 🎯

## Overview
This guide walks through embedding a custom font subset in your Unikō smart contract to ensure perfect Unicode rendering across all devices, especially iOS.

## 📋 Prerequisites

### 1. Install Python Dependencies
```bash
pip install fonttools[woff]
```

### 2. Download Noto Sans Symbols2 Font
- Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Symbols+2
- Download `NotoSansSymbols2-Regular.ttf`
- Place it in your project root directory

## 🔧 Step-by-Step Process

### Step 1: Create Font Subset
```bash
python font-subset-script.py
```

**Expected Output:**
- `uniko-subset.ttf` - TTF subset (~2-4KB)
- `uniko-subset.woff2` - WOFF2 subset (~1-3KB) 
- `uniko-subset-base64.txt` - Base64 encoded string for contract

### Step 2: Contract Optimization (If Needed)
If current contract + font exceeds 24KB:

1. **Use optimized contract:** `UnikoOnchain4-optimized.sol`
2. **Estimated savings:** 5-6KB from comment removal
3. **Result:** ~20-21KB contract + 1-4KB font = ~21-25KB total

### Step 3: Integrate Font into Contract

#### A. Add Font Data Constant
```solidity
// Add near top of contract
string private constant FONT_DATA = "data:font/woff2;base64,d09GMgABAAAAABH..."; // From base64 file
```

#### B. Update SVG Generation Functions
Replace font-family references:

**Before:**
```solidity
font-family="Arial"
```

**After:**
```solidity
font-family="UnikoFont"
```

#### C. Add Font Definition to SVG
Update `_generateSVG()` and `_getUltraRareSVG()` functions:

```solidity
function _generateSVG(uint256 tokenId) internal view returns (string memory) {
    // ... existing code ...
    
    return string(abi.encodePacked(
        '<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280">',
        '<defs>',
        '<style>',
        '@font-face {',
        'font-family: "UnikoFont";',
        'src: url("', FONT_DATA, '") format("woff2");',
        '}',
        '</style>',
        '</defs>',
        backgroundSVG,
        faceSVG,
        '</svg>'
    ));
}
```

### Step 4: Test Before Deployment

#### A. Local Testing
```bash
# Compile optimized contract
npx hardhat compile

# Check contract size
npx hardhat run scripts/check-contract-size.js
```

#### B. Device Testing
1. Deploy to testnet
2. Mint test tokens
3. Test on actual iOS devices
4. Verify Unicode characters render correctly

### Step 5: Deployment Checklist

- [ ] Contract size under 24KB
- [ ] All Unicode characters included in subset
- [ ] Font renders correctly on iOS/Android
- [ ] Metadata validation passes
- [ ] Reveal function tested
- [ ] Royalties configured correctly

## 📊 Expected Results

### Font Subset Specifications
- **Characters:** 61 total (49 Unicode + 12 ASCII)
- **Original Font:** ~200KB+ 
- **Subset Size:** 1-4KB WOFF2
- **Base64 Size:** 1.3-5.3KB
- **Compression:** 98%+ size reduction

### Contract Size Impact
- **Current Contract:** ~26KB
- **Optimized Contract:** ~20-21KB  
- **With Font:** ~21-26KB total
- **24KB Limit:** Achievable with optimization

## 🎯 Unicode Characters Included

### Regular Traits (49 characters)
```
• ⚆ ⚈ ⨀ ⦿ ⤬ ◒ ◓ ◕ ∸ - ■ ⊡ ◨ ∩ ⬗ ⋒ ᴗ ⤻ ― ﹏ ⩊ ω ⟀ ~ ⩌ ︿ ᆺ ᴥ ʌ ⎦ – ⬤ ≈ ≋ ⁕ ∙ ∘ ♫ ✿ ★ ✧ ☾ ↑ ♥ ō ⌐ O
```

### ASCII Characters (12 characters)
```
^ > < = ~ (space) 3 . - / ( )
```

## 🚨 Important Notes

### Legal Compliance
- ✅ **Noto Sans Symbols2** uses Open Font License (OFL)
- ✅ **Commercial use** permitted
- ✅ **Embedding** explicitly allowed
- ✅ **No attribution** required in contract

### Technical Considerations
- Font embedding maintains **100% onchain** status
- WOFF2 format provides maximum compression
- Base64 encoding required for SVG data URLs
- Font-face declaration must be in SVG `<defs>` section

### Fallback Strategy
If font embedding fails or exceeds size limits:
1. Keep current Arial font
2. Accept minor iOS rendering differences
3. Consider post-reveal font updates for ultra rares only

## 🔧 Troubleshooting

### Contract Too Large
- Use `UnikoOnchain4-optimized.sol`
- Remove additional comments
- Optimize string literals
- Consider function name shortening

### Font Not Loading
- Verify base64 encoding is correct
- Check font-face declaration syntax
- Ensure WOFF2 format is used
- Test SVG in browser first

### Unicode Missing
- Verify all characters in subset
- Check character encoding in script
- Test specific problematic characters

## 📁 Files Created

1. **`uniko-complete-unicode-characters.txt`** - Complete character analysis
2. **`contracts/UnikoOnchain4-optimized.sol`** - Comment-free contract
3. **`font-subset-script.py`** - Font subsetting tool
4. **`FONT_EMBEDDING_GUIDE.md`** - This guide
5. **`memory-bank/techContext.md`** - Updated with contract notes

## 🎯 Success Metrics

### Before Font Embedding
- ⚠️ iOS devices: Some Unicode characters render oversized
- ⚠️ Cross-platform inconsistency
- ✅ Contract size compliant

### After Font Embedding
- ✅ Perfect Unicode rendering on all devices
- ✅ Consistent character sizing
- ✅ 100% onchain with embedded font
- ✅ Professional-grade NFT collection

This approach transforms your collection from "good enough" to "production-perfect" across all platforms! 🚀 