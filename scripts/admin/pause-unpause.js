const { ethers } = require("hardhat");

// ENHANCED V8 CONTRACT ADDRESS - ADVANCED TRAIT SYSTEM
const CONTRACT_ADDRESS = "0x7Ed40cce63DD95B448f26A5361Bef20143e6F49a";

async function main() {
    console.log("🔧 Unikō Admin Tool - Pause/Unpause Contract");
    console.log("📍 Contract Address:", CONTRACT_ADDRESS);
    
    // Get contract instance
    const UnikoOnchain8 = await ethers.getContractFactory("UnikoOnchain8");
    const contract = UnikoOnchain8.attach(CONTRACT_ADDRESS);
    
    // Get signer (must be contract owner)
    const [signer] = await ethers.getSigners();
    console.log("👤 Admin Address:", signer.address);
    
    try {
        // Check current pause status
        const isPaused = await contract.paused();
        console.log("📊 Current Status:", isPaused ? "PAUSED" : "ACTIVE");
        
        if (isPaused) {
            console.log("\n🔓 Unpausing contract...");
            const tx = await contract.unpause();
            console.log("📝 Transaction Hash:", tx.hash);
            await tx.wait();
            console.log("✅ Contract UNPAUSED successfully!");
        } else {
            console.log("\n⏸️ Pausing contract...");
            const tx = await contract.pause();
            console.log("📝 Transaction Hash:", tx.hash);
            await tx.wait();
            console.log("✅ Contract PAUSED successfully!");
        }
        
        // Verify new status
        const newStatus = await contract.paused();
        console.log("📊 New Status:", newStatus ? "PAUSED" : "ACTIVE");
        
    } catch (error) {
        console.error("❌ Operation failed:", error.message);
        if (error.message.includes("Ownable: caller is not the owner")) {
            console.log("💡 Make sure you're using the contract owner account");
        }
    }
}

main()
    .then(() => {
        console.log("\n🎉 Admin operation completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    }); 