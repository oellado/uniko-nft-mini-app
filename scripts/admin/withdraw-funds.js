const { ethers } = require("hardhat");
require('dotenv').config();

async function withdrawFunds() {
    console.log("💰 WITHDRAWING CONTRACT FUNDS...\n");
    
    try {
        // Connect directly to Base Sepolia
        const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
        
        // Load private key from env
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("❌ PRIVATE_KEY not set in .env file");
        }
        
        // Create signer
        const signer = new ethers.Wallet(privateKey, provider);
        console.log("👤 Admin wallet:", signer.address);
        
        // Get the contract - DUAL-CONTRACT SYSTEM
        const contractAddress = process.env.CONTRACT_ADDRESS || "0x6Aa08b3FA75C395c8cbD23f235992EfedF3A8183";
        
        // Load contract ABI - DUAL-CONTRACT SYSTEM
        const contractABI = require("../../src/Uniko_01ABI.json");
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Check contract balance before withdrawal
        const contractBalance = await provider.getBalance(contractAddress);
        console.log(`📊 Contract balance: ${ethers.formatEther(contractBalance)} ETH`);
        
        if (contractBalance === 0n) {
            console.log("ℹ️ No funds to withdraw.");
            return;
        }
        
        // Check owner balance before
        const ownerBalanceBefore = await provider.getBalance(signer.address);
        console.log(`📊 Owner balance before: ${ethers.formatEther(ownerBalanceBefore)} ETH`);
        
        console.log("\n⏳ Withdrawing funds...");
        const tx = await contract.withdraw();
        console.log(`📝 Transaction hash: ${tx.hash}`);
        
        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();
        
        // Check balances after withdrawal
        const contractBalanceAfter = await provider.getBalance(contractAddress);
        const ownerBalanceAfter = await provider.getBalance(signer.address);
        
        console.log("\n🎉 WITHDRAWAL SUCCESSFUL!");
        console.log("📊 FINAL BALANCES:");
        console.log(`   Contract: ${ethers.formatEther(contractBalanceAfter)} ETH`);
        console.log(`   Owner: ${ethers.formatEther(ownerBalanceAfter)} ETH`);
        console.log(`   Withdrawn: ${ethers.formatEther(contractBalance)} ETH`);
        console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`   Time: ${new Date().toLocaleString()}`);
        
        console.log("\n⚠️ IMPORTANT:");
        console.log("   Funds withdrawn to contract owner address.");
        console.log("   Remember to transfer to royalty recipient:");
        console.log("   📍 0xE765185a42D623a99864C790a88cd29825d8A4b9");
        
    } catch (error) {
        console.error("❌ Error withdrawing funds:", error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    withdrawFunds()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { withdrawFunds }; 