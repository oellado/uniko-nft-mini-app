const { ethers } = require("hardhat");
require("dotenv").config();

const CONTRACT_ADDRESS = "0xC6504dC915Afe34abc9019B64EcC131623AA0aD4";

async function main() {
  console.log("🔄 Starting withdrawal process...");
  
  // Get the contract factory and attach to deployed contract
  const UnikoNFT = await ethers.getContractFactory("UnikoNFT");
  const contract = UnikoNFT.attach(CONTRACT_ADDRESS);
  
  // Get signer (contract owner)
  const [owner] = await ethers.getSigners();
  console.log("👤 Owner address:", owner.address);
  
  // Check contract balance before withdrawal
  const contractBalance = await ethers.provider.getBalance(CONTRACT_ADDRESS);
  console.log("💰 Contract balance:", ethers.formatEther(contractBalance), "ETH");
  
  if (contractBalance === 0n) {
    console.log("❌ No funds to withdraw");
    return;
  }
  
  // Check owner balance before withdrawal
  const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
  console.log("👤 Owner balance before:", ethers.formatEther(ownerBalanceBefore), "ETH");
  
  try {
    console.log("🚀 Calling withdraw function...");
    
    // Call withdraw function
    const tx = await contract.withdraw();
    console.log("📝 Transaction hash:", tx.hash);
    
    // Wait for transaction confirmation
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    
    // Check balances after withdrawal
    const contractBalanceAfter = await ethers.provider.getBalance(CONTRACT_ADDRESS);
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
    
    console.log("\n📊 WITHDRAWAL SUMMARY:");
    console.log("💰 Contract balance after:", ethers.formatEther(contractBalanceAfter), "ETH");
    console.log("👤 Owner balance after:", ethers.formatEther(ownerBalanceAfter), "ETH");
    console.log("💸 Amount withdrawn:", ethers.formatEther(contractBalance), "ETH");
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    
    console.log("\n🎉 Withdrawal completed successfully!");
    
  } catch (error) {
    console.error("❌ Withdrawal failed:", error.message);
    
    // Check if it's an ownership error
    if (error.message.includes("Ownable")) {
      console.log("💡 Make sure you're using the contract owner's private key");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  }); 