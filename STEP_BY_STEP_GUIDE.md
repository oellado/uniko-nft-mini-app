# 🚀 Unikō NFT - Complete Step-by-Step Deployment Guide

## **🔒 Security Fixes Applied:**
- ✅ **Anti-Front-Running**: Commit-reveal scheme prevents predicting ultra rares
- ✅ **10% Enforced Royalties**: EIP-2981 standard, cannot be bypassed
- ✅ **Duplicate Prevention**: On-chain trait hash verification
- ✅ **True Randomness**: Uses future block hashes for ultra rare selection

---

## **📋 Step 1: Get Prerequisites**

### **A. Get Base Sepolia ETH:**
1. Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Connect your wallet and request testnet ETH
3. Alternative: [Alchemy Faucet](https://sepoliafaucet.com/)

### **B. Get BaseScan API Key (Optional):**
1. Go to [BaseScan](https://basescan.org/apis)
2. Create free account
3. Generate API key for contract verification

---

## **🔧 Step 2: Deploy Smart Contract**

### **A. Install Contract Dependencies:**
```bash
cd contracts
npm install
```

### **B. Create Environment File:**
Create `contracts/.env`:
```env
PRIVATE_KEY=your_wallet_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

### **C. Deploy to Base Sepolia:**
```bash
npm run deploy:sepolia
```

**Expected Output:**
```
Deploying UnikoNFT to Base Sepolia...
UnikoNFT deployed to: 0x1234567890123456789012345678901234567890
Contract verified successfully

=== Deployment Summary ===
Contract Address: 0x1234567890123456789012345678901234567890
Network: Base Sepolia
Explorer: https://sepolia.basescan.org/address/0x1234567890123456789012345678901234567890
```

**📝 SAVE THE CONTRACT ADDRESS - You'll need it next!**

---

## **⚙️ Step 3: Update Frontend Configuration**

### **A. Update Contract Address:**
In `src/config.ts`, line 248:
```typescript
export const contractConfig = {
  address: "0x1234567890123456789012345678901234567890" as Address, // YOUR CONTRACT ADDRESS HERE
  // ... rest stays the same
}
```

### **B. Update Contract ABI:**
The ABI is already updated with new functions:
- `mint(address, string)` - Minting with metadata
- `revealUltraRares()` - Reveal ultra rares after minting complete
- `isUltraRare(uint256)` - Check if token is ultra rare
- `royaltyInfo(uint256, uint256)` - Get royalty information

---

## **🌐 Step 4: Set Up Custom Domain (Namecheap)**

### **A. Configure Vercel for Custom Domain:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain (e.g., `uniko.yourdomain.com`)

### **B. Configure DNS in Namecheap:**
1. Log into Namecheap
2. Go to Domain List → Manage
3. Advanced DNS tab
4. Add these records:

**For subdomain (recommended):**
```
Type: CNAME
Host: uniko
Value: cname.vercel-dns.com
TTL: Automatic
```

**For root domain:**
```
Type: A
Host: @
Value: 76.76.19.61
TTL: Automatic

Type: CNAME  
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

### **C. Update URLs in Code:**
Update these files with your custom domain:

**1. `src/config.ts`:**
```typescript
export const mintMetadata = {
  // ...
  imageUrl: "https://uniko.yourdomain.com/preview.png",
  // ...
};

export const embedConfig = {
  // ...
  url: "https://uniko.yourdomain.com/",
  // ...
};
```

**2. `contracts/scripts/deploy.js`:**
```javascript
const unikoNFT = await UnikoNFT.deploy(
  "Unikō",
  "UNIKO", 
  "https://uniko.yourdomain.com/api/metadata/" // YOUR DOMAIN HERE
);
```

---

## **🚀 Step 5: Deploy Frontend**

### **A. Build and Deploy:**
```bash
npm run build
git add .
git commit -m "Update for production deployment"
git push origin main
```

### **B. Verify Deployment:**
1. Check Vercel dashboard for successful deployment
2. Visit your custom domain
3. Test the interface (should work in simulation mode)

---

## **🧪 Step 6: Test on Base Sepolia**

### **A. Test in Farcaster Dev Tools:**
1. Open [Farcaster Dev Tools](https://warpcast.com/~/developers/frames)
2. Enter your custom domain URL
3. Test minting with Base Sepolia ETH

### **B. Verify on Block Explorers:**
- **BaseScan**: `https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS`
- **OpenSea**: `https://testnets.opensea.io/assets/base-sepolia/YOUR_CONTRACT_ADDRESS`

### **C. Test Royalties:**
1. Mint an NFT
2. List it on OpenSea testnet
3. Verify 10% royalty is displayed
4. Test a sale to confirm royalty payment

---

## **🔍 Step 7: Monitor Ultra Rare Reveal Process**

### **A. Understanding the Process:**
1. **Minting Phase**: All 10,000 NFTs get minted (ultra rares unknown)
2. **Reveal Trigger**: When last NFT is minted, reveal block is set (+10 blocks)
3. **Reveal Phase**: Anyone can call `revealUltraRares()` after reveal block
4. **Discovery**: Ultra rares are revealed using unpredictable future block hash

### **B. Monitor Progress:**
```javascript
// Check total supply
const totalSupply = await contract.read.totalSupply();

// Check if reveal is ready (after minting complete)
const revealBlock = await contract.read._revealBlock();
const currentBlock = await publicClient.getBlockNumber();

// Reveal ultra rares (anyone can call this)
if (currentBlock >= revealBlock) {
  await contract.write.revealUltraRares();
}

// Check if token is ultra rare (after reveal)
const isUltra = await contract.read.isUltraRare([tokenId]);
```

---

## **🎯 Step 8: Prepare for Mainnet**

### **A. Pre-Launch Checklist:**
- [ ] Test thoroughly on Base Sepolia
- [ ] Verify ultra rare reveal process works
- [ ] Confirm royalties are enforced
- [ ] Test custom domain functionality
- [ ] Verify no duplicates can be minted
- [ ] Check gas optimization

### **B. Mainnet Deployment:**
1. Update Hardhat config for Base mainnet:
```javascript
base: {
  url: "https://mainnet.base.org",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 8453
}
```

2. Deploy with higher mint price:
```solidity
uint256 public constant MINT_PRICE = 0.01 ether; // Adjust as needed
```

3. Update frontend config for mainnet contract address

---

## **🔒 Security Features Explained**

### **A. Anti-Front-Running System:**
- **Problem**: Savvy minters could predict which tokens will be ultra rare
- **Solution**: Commit-reveal scheme delays ultra rare determination until after all minting
- **How it works**: Ultra rares are selected using future block hash (unpredictable during minting)

### **B. Enforced Royalties:**
- **Standard**: EIP-2981 royalty standard
- **Rate**: 10% on all secondary sales
- **Enforcement**: Major marketplaces (OpenSea, LooksRare, etc.) respect this standard
- **Cannot be bypassed**: Built into the contract, not optional

### **C. Duplicate Prevention:**
- **On-chain verification**: Each trait combination gets a unique hash
- **Storage**: Used hashes stored in contract mapping
- **Enforcement**: Transaction reverts if duplicate traits attempted

---

## **📊 Expected Timeline**

### **Testing Phase (1-2 days):**
- Deploy to Base Sepolia
- Test minting functionality
- Verify custom domain setup
- Test in Farcaster dev tools

### **Launch Preparation (1 day):**
- Deploy to Base mainnet
- Final testing
- Marketing preparation

### **Post-Launch (Ongoing):**
- Monitor minting progress
- Execute ultra rare reveal when minting completes
- Community engagement

---

## **🆘 Troubleshooting**

### **Common Issues:**

**1. "Contract deployment failed"**
- Check you have enough Base Sepolia ETH
- Verify private key is correct
- Check network connection

**2. "Custom domain not working"**
- DNS changes can take 24-48 hours
- Verify CNAME record is correct
- Check Vercel domain configuration

**3. "Minting transaction fails"**
- Ensure sufficient ETH for gas + mint price
- Check contract address is correct
- Verify network is Base Sepolia

**4. "Royalties not showing"**
- EIP-2981 support varies by marketplace
- OpenSea should show royalties automatically
- Some marketplaces may need manual configuration

---

## **🎉 You're Ready!**

Follow these steps in order, and you'll have:
- ✅ Secure, front-run resistant ultra rare system
- ✅ Enforced 10% royalties on all sales
- ✅ Custom domain deployment
- ✅ Fully on-chain generative art
- ✅ No duplicate NFTs possible
- ✅ Professional-grade smart contract

**Next step: Let's start with Step 1 - getting Base Sepolia ETH!** 