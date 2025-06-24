const { ethers } = require("hardhat");
require('dotenv').config();

async function checkContractStatus() {
    console.log("🔍 CHECKING CONTRACT STATUS...\n");
    
    try {
        const contractAddress = process.env.CONTRACT_ADDRESS;
        if (!contractAddress) {
            throw new Error("❌ CONTRACT_ADDRESS not set in .env file");
        }

        const [deployer] = await ethers.getSigners();
        console.log("👤 Connected wallet:", deployer.address);
        console.log("📄 Contract address:", contractAddress);
        
        // Load the ABI
        const contractABI = require("../../src/Uniko_01ABI.json"); // DUAL-CONTRACT SYSTEM
        const contract = new ethers.Contract(contractAddress, contractABI, deployer);
        
        // Get contract status
        console.log("\n📊 CONTRACT STATUS:");
        
        const totalSupply = await contract.totalSupply();
        const maxSupply = await contract.MAX_SUPPLY();
        const isPaused = await contract.paused();
        
        console.log(`   Total Supply: ${totalSupply}/${maxSupply}`);
        console.log(`   Contract Status: ${isPaused ? '⏸️  PAUSED' : '▶️  ACTIVE'}`);
        
        // Check ownership
        const owner = await contract.owner();
        const isOwner = owner.toLowerCase() === deployer.address.toLowerCase();
        console.log(`   Owner: ${owner}`);
        console.log(`   Connected as owner: ${isOwner ? '✅ YES' : '❌ NO'}`);
        
        // Get balance
        const balance = await ethers.provider.getBalance(contractAddress);
        console.log(`   Contract Balance: ${ethers.utils.formatEther(balance)} ETH`);
        
        // ALLOWLIST CONTRACT SPECIFIC STATUS
        try {
            const currentPhase = await contract.getCurrentPhase();
            const currentPrice = await contract.getCurrentPrice();
            const allowlistPrice = await contract.allowlistPrice();
            const publicPrice = await contract.publicPrice();
            const allowlistActive = await contract.allowlistActive();
            const publicActive = await contract.publicActive();
            
            console.log("\n🎯 ALLOWLIST CONTRACT STATUS:");
            console.log(`   Current Phase: ${currentPhase}`);
            console.log(`   Current Price: ${ethers.utils.formatEther(currentPrice)} ETH`);
            console.log(`   Allowlist Price: ${ethers.utils.formatEther(allowlistPrice)} ETH`);
            console.log(`   Public Price: ${ethers.utils.formatEther(publicPrice)} ETH`);
            console.log(`   Allowlist Active: ${allowlistActive ? '✅ YES' : '❌ NO'}`);
            console.log(`   Public Active: ${publicActive ? '✅ YES' : '❌ NO'}`);
            
            // Test allowlist status for connected wallet
            const isOnAllowlist = await contract.allowlist(deployer.address);
            console.log(`   Connected wallet on allowlist: ${isOnAllowlist ? '✅ YES' : '❌ NO'}`);
            
            // Check who can mint
            const [canMint, mintPrice, phase] = await contract.canMint(deployer.address);
            console.log(`   Connected wallet can mint: ${canMint ? '✅ YES' : '❌ NO'}`);
            if (canMint) {
                console.log(`   Mint price for connected wallet: ${ethers.utils.formatEther(mintPrice)} ETH`);
                console.log(`   Mint phase: ${phase}`);
            }
            
        } catch (e) {
            console.log("\n📝 This appears to be a standard UnikoOnchain8 contract (not allowlist version)");
            try {
                const mintPrice = await contract.MINT_PRICE();
                console.log(`   Standard Mint Price: ${ethers.utils.formatEther(mintPrice)} ETH`);
            } catch (err) {
                // Contract might not have MINT_PRICE constant
            }
        }
        
        console.log("\n✅ Status check complete!");
        
    } catch (error) {
        console.error("❌ Error checking contract status:", error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    checkContractStatus()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { checkContractStatus }; 