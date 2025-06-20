const { ethers } = require("hardhat");

// CURRENT CONTRACT ADDRESS - V5 GAS OPTIMIZED VERSION
const CONTRACT_ADDRESS = "0x7Ed40cce63DD95B448f26A5361Bef20143e6F49a";

async function main() {
    console.log("🎭 Unikō Admin Tool - Reveal Ultra Rares");
    console.log("📍 Contract Address:", CONTRACT_ADDRESS);
    
    // Ultra rare configuration (SAME AS DEPLOYMENT)
    const SECRET_KEY = "uniko2024";
    const ULTRA_RARE_POSITIONS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    
    console.log("🔑 Secret Key:", SECRET_KEY);
    console.log("📍 Ultra Rare Positions:", ULTRA_RARE_POSITIONS);
    
    // Get contract instance
    const UnikoOnchain8 = await ethers.getContractFactory("UnikoOnchain8");
    const contract = UnikoOnchain8.attach(CONTRACT_ADDRESS);
    
    // Get signer (must be contract owner)
    const [signer] = await ethers.getSigners();
    console.log("👤 Admin Address:", signer.address);
    
    try {
        // Check if already revealed
        const isRevealed = await contract.isRevealed();
        console.log("📊 Current Status:", isRevealed ? "REVEALED" : "NOT REVEALED");
        
        if (isRevealed) {
            console.log("ℹ️ Ultra rares are already revealed!");
            
            // Show which tokens are ultra rare
            console.log("\n🎭 Current Ultra Rare Tokens:");
            for (const tokenId of ULTRA_RARE_POSITIONS) {
                try {
                    const exists = await contract.ownerOf(tokenId).then(() => true).catch(() => false);
                    if (exists) {
                        const isUltra = await contract.isUltraRare(tokenId);
                        console.log(`   Token #${tokenId}: ${isUltra ? '✨ ULTRA RARE' : '❌ Not ultra rare'}`);
                    } else {
                        console.log(`   Token #${tokenId}: ⏳ Not minted yet`);
                    }
                } catch (error) {
                    console.log(`   Token #${tokenId}: ❓ Error checking status`);
                }
            }
            return;
        }
        
        console.log("\n🎭 Revealing ultra rares...");
        const tx = await contract.reveal(SECRET_KEY, ULTRA_RARE_POSITIONS);
        console.log("📝 Transaction Hash:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("✅ Ultra rares revealed successfully!");
        console.log("⛽ Gas Used:", receipt.gasUsed.toString());
        
        // Verify revelation
        const newStatus = await contract.isRevealed();
        console.log("📊 New Status:", newStatus ? "REVEALED" : "NOT REVEALED");
        
        console.log("\n🎭 Ultra Rare Tokens Revealed:");
        for (const tokenId of ULTRA_RARE_POSITIONS) {
            try {
                const exists = await contract.ownerOf(tokenId).then(() => true).catch(() => false);
                if (exists) {
                    const isUltra = await contract.isUltraRare(tokenId);
                    console.log(`   Token #${tokenId}: ${isUltra ? '✨ ULTRA RARE' : '❌ Not ultra rare'}`);
                } else {
                    console.log(`   Token #${tokenId}: ⏳ Not minted yet (will be ultra rare when minted)`);
                }
            } catch (error) {
                console.log(`   Token #${tokenId}: ❓ Error checking status`);
            }
        }
        
    } catch (error) {
        console.error("❌ Reveal failed:", error.message);
        if (error.message.includes("Ownable: caller is not the owner")) {
            console.log("💡 Make sure you're using the contract owner account");
        } else if (error.message.includes("Already revealed")) {
            console.log("💡 Ultra rares have already been revealed");
        } else if (error.message.includes("Invalid reveal parameters")) {
            console.log("💡 Check that secret key and positions match deployment");
        }
    }
}

main()
    .then(() => {
        console.log("\n🎉 Reveal operation completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    }); 