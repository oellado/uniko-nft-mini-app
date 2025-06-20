import pkg from 'hardhat';
const { ethers } = pkg;
const config = require("../../src/config");

async function main() {
    console.log("⏸️  Pausing Unikō NFT Contract...");
    
    const CONTRACT_ADDRESS = "0x556B981C6EBA54c8Dcb63102F672967d8aC1312e";
    console.log(`Contract: ${CONTRACT_ADDRESS}`);
    
    // Get contract instance
    const UnikoNFT = await ethers.getContractFactory("Uniko");
    const contract = UnikoNFT.attach(CONTRACT_ADDRESS);
    
    try {
        // Check current pause status
        const isPaused = await contract.paused();
        console.log(`Current status: ${isPaused ? 'PAUSED' : 'ACTIVE'}`);
        
        if (isPaused) {
            console.log("⚠️  Contract is already paused!");
            return;
        }
        
        // Pause the contract
        console.log("🔒 Pausing contract...");
        const tx = await contract.pause();
        console.log(`Transaction hash: ${tx.hash}`);
        
        // Wait for confirmation
        console.log("⏳ Waiting for confirmation...");
        await tx.wait();
        
        // Verify pause status
        const newStatus = await contract.paused();
        console.log(`New status: ${newStatus ? 'PAUSED' : 'ACTIVE'}`);
        
        if (newStatus) {
            console.log("✅ Contract paused successfully!");
            console.log("🚨 ALL MINTING IS NOW STOPPED");
        } else {
            console.log("❌ Failed to pause contract");
        }
        
    } catch (error) {
        console.error("❌ Error pausing contract:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 