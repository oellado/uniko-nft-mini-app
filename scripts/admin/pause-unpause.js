const { ethers } = require("hardhat");
require('dotenv').config();

async function togglePause() {
    console.log("⏸️ TOGGLING CONTRACT PAUSE STATE...\n");
    
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
        
        // Check current pause state
        const isPaused = await contract.paused();
        console.log(`📊 Current state: ${isPaused ? "PAUSED" : "UNPAUSED"}`);
        
        // Toggle pause state
        const action = isPaused ? "Unpausing" : "Pausing";
        console.log(`⏳ ${action} contract...`);
        
        const tx = isPaused ? await contract.unpause() : await contract.pause();
        console.log(`📝 Transaction hash: ${tx.hash}`);
        
        console.log("⏳ Waiting for confirmation...");
        await tx.wait();
        
        // Verify the change
        const newState = await contract.paused();
        console.log(`\n🎉 CONTRACT ${newState ? "PAUSED" : "UNPAUSED"}!`);
        console.log(`📊 New state: ${newState ? "PAUSED" : "UNPAUSED"}`);
        console.log(`   ${newState ? "❌ No minting allowed" : "✅ Minting allowed"}`);
        console.log(`   Time: ${new Date().toLocaleString()}`);
        
    } catch (error) {
        console.error("❌ Error toggling pause state:", error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    togglePause()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { togglePause }; 