import hre from "hardhat";

async function main() {
    console.log("📋 Toggling Allowlist Minting...");
    
    const contractAddress = "0x66B4F1758B5266ba2f6282Fb0F9dE7845265f417";
    console.log(`Contract: ${contractAddress}`);
    
    // Get contract instance
    const UnikoNFT = await hre.ethers.getContractFactory("UnikoNFTv05");
    const contract = UnikoNFT.attach(contractAddress);
    
    try {
        // Check current allowlist status
        const isActive = await contract.allowlistMintActive();
        console.log(`Current allowlist status: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
        
        // Toggle allowlist minting
        console.log(`📋 ${isActive ? 'Deactivating' : 'Activating'} allowlist minting...`);
        const tx = await contract.toggleAllowlistMint();
        console.log(`Transaction hash: ${tx.hash}`);
        
        // Wait for confirmation
        console.log("⏳ Waiting for confirmation...");
        await tx.wait();
        
        // Verify new status
        const newStatus = await contract.allowlistMintActive();
        console.log(`New allowlist status: ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
        
        if (newStatus !== isActive) {
            console.log("✅ Allowlist minting toggled successfully!");
            if (newStatus) {
                console.log("🎯 ALLOWLIST MINTING IS NOW ACTIVE");
                
                // Check if this started the 24-hour period
                const startTime = await contract.allowlistStartTime();
                if (startTime > 0) {
                    const now = Math.floor(Date.now() / 1000);
                    const timeLeft = (Number(startTime) + 24 * 60 * 60) - now;
                    if (timeLeft > 0) {
                        console.log(`⏰ 24-hour allowlist period: ${Math.floor(timeLeft / 3600)} hours ${Math.floor((timeLeft % 3600) / 60)} minutes remaining`);
                    }
                }
            } else {
                console.log("🚫 ALLOWLIST MINTING IS NOW INACTIVE");
            }
        } else {
            console.log("❌ Failed to toggle allowlist minting");
        }
        
    } catch (error) {
        console.error("❌ Error toggling allowlist minting:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 