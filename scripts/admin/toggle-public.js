import hre from "hardhat";

async function main() {
    console.log("🌍 Toggling Public Minting...");
    
    const contractAddress = "0x66B4F1758B5266ba2f6282Fb0F9dE7845265f417";
    console.log(`Contract: ${contractAddress}`);
    
    // Get contract instance
    const UnikoNFT = await hre.ethers.getContractFactory("UnikoNFTv05");
    const contract = UnikoNFT.attach(contractAddress);
    
    try {
        // Check current public mint status
        const isActive = await contract.publicMintActive();
        console.log(`Current public mint status: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
        
        // Check allowlist period status
        const allowlistStartTime = await contract.allowlistStartTime();
        const allowlistActive = await contract.allowlistMintActive();
        
        if (allowlistStartTime > 0 && allowlistActive) {
            const now = Math.floor(Date.now() / 1000);
            const timeLeft = (Number(allowlistStartTime) + 24 * 60 * 60) - now;
            
            if (timeLeft > 0) {
                console.log(`⚠️  WARNING: Allowlist period still active for ${Math.floor(timeLeft / 3600)} hours ${Math.floor((timeLeft % 3600) / 60)} minutes`);
                console.log("Public minting will be restricted until allowlist period ends");
            }
        }
        
        // Toggle public minting
        console.log(`🌍 ${isActive ? 'Deactivating' : 'Activating'} public minting...`);
        const tx = await contract.togglePublicMint();
        console.log(`Transaction hash: ${tx.hash}`);
        
        // Wait for confirmation
        console.log("⏳ Waiting for confirmation...");
        await tx.wait();
        
        // Verify new status
        const newStatus = await contract.publicMintActive();
        console.log(`New public mint status: ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
        
        if (newStatus !== isActive) {
            console.log("✅ Public minting toggled successfully!");
            if (newStatus) {
                console.log("🎯 PUBLIC MINTING IS NOW ACTIVE");
                
                // Check if allowlist period is still active
                if (allowlistStartTime > 0) {
                    const now = Math.floor(Date.now() / 1000);
                    const timeLeft = (Number(allowlistStartTime) + 24 * 60 * 60) - now;
                    
                    if (timeLeft > 0) {
                        console.log(`⏰ Note: Public minting will be available after allowlist period ends in ${Math.floor(timeLeft / 3600)} hours ${Math.floor((timeLeft % 3600) / 60)} minutes`);
                    } else {
                        console.log("🚀 Public minting is immediately available!");
                    }
                }
            } else {
                console.log("🚫 PUBLIC MINTING IS NOW INACTIVE");
            }
        } else {
            console.log("❌ Failed to toggle public minting");
        }
        
    } catch (error) {
        console.error("❌ Error toggling public minting:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 