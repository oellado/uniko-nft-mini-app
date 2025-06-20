const { ethers } = require("hardhat");

async function main() {
    console.log("💰 Withdrawing funds from Unikō NFT Contract...");
    
    const contractAddress = "0x556B981C6EBA54c8Dcb63102F672967d8aC1312e";
    const recipientAddress = "0xE765185a42D623a99864C790a88cd29825d8A4b9";
    
    console.log(`Contract: ${contractAddress}`);
    console.log(`Recipient: ${recipientAddress}`);
    
    // Get contract instance
    const UnikoNFT = await ethers.getContractFactory("Uniko");
    const contract = UnikoNFT.attach(contractAddress);
    
    try {
        // Get current balance
        const balance = await ethers.provider.getBalance(contractAddress);
        console.log(`\nCurrent contract balance: ${ethers.formatEther(balance)} ETH`);
        
        if (balance === 0n) {
            console.log("⚠️  No funds to withdraw!");
            return;
        }
        
        // Withdraw funds
        console.log("\n📤 Sending withdrawal transaction...");
        const tx = await contract.withdraw();
        console.log(`Transaction hash: ${tx.hash}`);
        
        // Wait for confirmation
        console.log("\n⏳ Waiting for confirmation...");
        await tx.wait();
        
        // Verify new balance
        const newBalance = await ethers.provider.getBalance(contractAddress);
        console.log(`\n✅ Withdrawal complete!`);
        console.log(`New contract balance: ${ethers.formatEther(newBalance)} ETH`);
        
    } catch (error) {
        console.error("\n❌ Error withdrawing funds:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 