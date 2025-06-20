const hre = require("hardhat");
const config = require("../../src/config");

async function main() {
    console.log("🚀 Starting 24-Hour Allowlist Period...");
    
    const contractAddress = "0x6fA941a7AD33F2376146333Bd0EA833CdD58061f";
    console.log(`Contract: ${contractAddress}`);
    
    // Get contract instance
    const UnikoNFT = await hre.ethers.getContractFactory("UnikoNFTFinal");
    const contract = UnikoNFT.attach(contractAddress);
    
    try {
        // Check current status
        const allowlistActive = await contract.allowlistMintActive();
        const startTime = await contract.allowlistStartTime();
        
        console.log(`Current allowlist status: ${allowlistActive ? 'ACTIVE' : 'INACTIVE'}`);
        
        if (startTime > 0) {
            const now = Math.floor(Date.now() / 1000);
            const timeLeft = (startTime.toNumber() + 24 * 60 * 60) - now;
            
            if (timeLeft > 0) {
                console.log(`⚠️  Allowlist period already started! ${Math.floor(timeLeft / 3600)} hours ${Math.floor((timeLeft % 3600) / 60)} minutes remaining`);
                return;
            } else {
                console.log("Previous allowlist period has ended. Starting new period...");
            }
        }
        
        // Start allowlist period
        console.log("🚀 Starting 24-hour allowlist period...");
        const tx = await contract.startAllowlistMint();
        console.log(`Transaction hash: ${tx.hash}`);
        
        // Wait for confirmation
        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();
        
        // Get the new start time
        const newStartTime = await contract.allowlistStartTime();
        const newStatus = await contract.allowlistMintActive();
        
        console.log(`New allowlist status: ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
        
        if (newStatus && newStartTime > 0) {
            console.log("✅ Allowlist period started successfully!");
            console.log("⏰ 24-HOUR COUNTDOWN HAS BEGUN!");
            
            const startDate = new Date(newStartTime.toNumber() * 1000);
            const endDate = new Date((newStartTime.toNumber() + 24 * 60 * 60) * 1000);
            
            console.log(`📅 Start time: ${startDate.toLocaleString()}`);
            console.log(`📅 End time: ${endDate.toLocaleString()}`);
            console.log("");
            console.log("🎯 ALLOWLIST ADDRESSES CAN NOW MINT!");
            console.log("🚫 Public minting will be available after 24 hours");
            
        } else {
            console.log("❌ Failed to start allowlist period");
        }
        
    } catch (error) {
        console.error("❌ Error starting allowlist period:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 