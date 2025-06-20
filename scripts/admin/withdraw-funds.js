const { ethers } = require('hardhat');

// ENHANCED V8 CONTRACT ADDRESS - ADVANCED TRAIT SYSTEM
const CONTRACT_ADDRESS = "0x7Ed40cce63DD95B448f26A5361Bef20143e6F49a";

async function main() {
    console.log("💰 Unikō Admin Tool - Withdraw Funds");
    console.log("📍 Contract Address:", CONTRACT_ADDRESS);
    
    // Get contract instance
    const UnikoOnchain8 = await ethers.getContractFactory("UnikoOnchain8");
    const contract = UnikoOnchain8.attach(CONTRACT_ADDRESS);
    
    // Get signer (must be contract owner)
    const [signer] = await ethers.getSigners();
    console.log("👤 Admin Address:", signer.address);
    
    try {
        // Check contract balance
        const contractBalance = await ethers.provider.getBalance(CONTRACT_ADDRESS);
        const balanceInEth = ethers.formatEther(contractBalance);
        
        console.log("📊 Contract Balance:", balanceInEth, "ETH");
        
        if (contractBalance === 0n) {
            console.log("ℹ️ No funds to withdraw");
            return;
        }
        
        // Get owner address (funds will be sent here)
        const ownerAddress = await contract.owner();
        console.log("💳 Funds will be sent to owner:", ownerAddress);
        
        // Get owner's current balance
        const ownerBalanceBefore = await ethers.provider.getBalance(ownerAddress);
        console.log("💰 Owner balance before:", ethers.formatEther(ownerBalanceBefore), "ETH");
        
        console.log("\n💸 Withdrawing funds...");
        const tx = await contract.withdraw();
        console.log("📝 Transaction Hash:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("✅ Withdrawal successful!");
        console.log("⛽ Gas Used:", receipt.gasUsed.toString());
        
        // Verify withdrawal
        const newContractBalance = await ethers.provider.getBalance(CONTRACT_ADDRESS);
        const ownerBalanceAfter = await ethers.provider.getBalance(ownerAddress);
        
        console.log("\n📊 Final Status:");
        console.log("   Contract Balance:", ethers.formatEther(newContractBalance), "ETH");
        console.log("   Owner Balance:", ethers.formatEther(ownerBalanceAfter), "ETH");
        console.log("   Withdrawn Amount:", ethers.formatEther(contractBalance), "ETH");
        
    } catch (error) {
        console.error("❌ Withdrawal failed:", error.message);
        if (error.message.includes("Ownable: caller is not the owner")) {
            console.log("💡 Make sure you're using the contract owner account");
        }
    }
}

main()
    .then(() => {
        console.log("\n🎉 Withdrawal operation completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    }); 