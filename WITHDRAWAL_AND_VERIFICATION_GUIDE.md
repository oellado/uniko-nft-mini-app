# 🔧 Contract Withdrawal & Verification Guide

This guide will help you withdraw funds from your deployed contract and verify it on Basescan for credibility and security.

## 📋 Prerequisites

1. **Contract deployed** at: `0xC6504dC915Afe34abc9019B64EcC131623AA0aD4`
2. **Owner wallet** with private key access
3. **Basescan API key** (free)

## 🔑 Step 1: Get Basescan API Key

1. Go to [https://basescan.org/](https://basescan.org/)
2. Create an account or sign in
3. Navigate to **"API-KEYs"** in your account dashboard
4. Click **"Add"** to create a new API key
5. Copy the generated API key

## ⚙️ Step 2: Set Up Environment Variables

Create a `.env` file in your project root (copy from `env.example`):

```bash
# Your wallet's private key (the one that deployed the contract)
PRIVATE_KEY=your_wallet_private_key_here

# Your Basescan API key from Step 1
BASESCAN_API_KEY=your_basescan_api_key_here

# RPC URLs (optional - using defaults)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

⚠️ **SECURITY WARNING**: Never commit your `.env` file to git! It's already in `.gitignore`.

## 💸 Step 3: Withdraw Contract Funds

Your contract currently has **0.003 ETH** from 3 minted NFTs that needs to be withdrawn manually.

### Run the withdrawal script:

```bash
npm run withdraw
```

This will:
- ✅ Check contract balance (should show 0.003 ETH)
- ✅ Call the `withdraw()` function
- ✅ Transfer all funds to the contract owner
- ✅ Show transaction details and gas costs

### Expected Output:
```
🔄 Starting withdrawal process...
👤 Owner address: 0x...
💰 Contract balance: 0.003 ETH
🚀 Calling withdraw function...
📝 Transaction hash: 0x...
✅ Transaction confirmed in block: 123456
💸 Amount withdrawn: 0.003 ETH
🎉 Withdrawal completed successfully!
```

## 🔍 Step 4: Verify Contract on Basescan

Contract verification is crucial for:
- 🛡️ **Security**: Users can read the contract code
- 🤝 **Trust**: Proves the contract does what it claims
- 🔧 **Interaction**: Enables direct contract interaction on Basescan

### Run the verification script:

```bash
npm run verify
```

This will:
- ✅ Submit your contract source code to Basescan
- ✅ Verify it matches the deployed bytecode
- ✅ Make the contract readable on Basescan

### Expected Output:
```
🔍 Starting contract verification...
📍 Contract address: 0xC6504dC915Afe34abc9019B64EcC131623AA0aD4
🚀 Verifying contract on Basescan...
✅ Contract verified successfully!
🌐 View on Basescan: https://sepolia.basescan.org/address/0xC6504dC915Afe34abc9019B64EcC131623AA0aD4#code
```

## 🛠️ Alternative: Manual Hardhat Commands

If you prefer using Hardhat directly:

### Withdrawal:
```bash
npx hardhat run scripts/withdraw.js --network baseSepolia
```

### Verification:
```bash
npx hardhat run scripts/verify.js --network baseSepolia
```

Or use the built-in verify command:
```bash
npx hardhat verify --network baseSepolia 0xC6504dC915Afe34abc9019B64EcC131623AA0aD4 "0xE765185a42D623a99864C790a88cd29825d8A4b9" 500
```

## 🔧 Troubleshooting

### Withdrawal Issues:

**"Ownable: caller is not the owner"**
- ✅ Make sure you're using the contract owner's private key
- ✅ Check that `PRIVATE_KEY` in `.env` matches the deployer wallet

**"No funds to withdraw"**
- ✅ Check if funds were already withdrawn
- ✅ Verify contract balance on Basescan

### Verification Issues:

**"Invalid API Key"**
- ✅ Double-check your `BASESCAN_API_KEY` in `.env`
- ✅ Make sure the API key is active on Basescan

**"Already Verified"**
- ✅ Great! Your contract is already verified
- ✅ Check the Basescan link in the output

**"Constructor arguments mismatch"**
- ✅ The script uses the correct arguments automatically
- ✅ If issues persist, check the deployment parameters

## 📊 After Verification

Once verified, users can:
- 📖 **Read the contract code** on Basescan
- 🔍 **Verify the contract logic** matches your claims
- 🤝 **Trust the contract** more easily
- 🔧 **Interact directly** through Basescan's interface

## 🎯 Quick Commands Summary

```bash
# Install dependencies (if needed)
npm install

# Withdraw contract funds
npm run withdraw

# Verify contract on Basescan
npm run verify
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your `.env` file is set up correctly
3. Ensure you have enough ETH for gas fees
4. Check Basescan API status

---

**🎉 Once completed, your contract will be fully verified and all funds withdrawn!** 