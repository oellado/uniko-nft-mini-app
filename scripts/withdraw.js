import pkg from "hardhat";
const { ethers } = pkg;
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Try multiple ways to load environment variables
console.log("🔧 Loading environment variables...");

// Method 1: Standard dotenv
dotenv.config();

// Method 2: Explicit path
const envPath = path.resolve(process.cwd(), '.env');
console.log("📁 .env file path:", envPath);
console.log("📄 .env file exists:", fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ Loaded .env from explicit path");
}

const CONTRACT_ADDRESS = "0xC6504dC915Afe34abc9019B64EcC131623AA0aD4";

async function main() {
  console.log("🔄 Starting withdrawal process...");
  
  // Debug environment variables
  console.log("🔍 Debug info:");
  console.log("- Current working directory:", process.cwd());
  console.log("- PRIVATE_KEY exists:", !!process.env.PRIVATE_KEY);
  console.log("- PRIVATE_KEY length:", process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : 0);
  console.log("- BASESCAN_API_KEY exists:", !!process.env.BASESCAN_API_KEY);
  
  // If still no private key, try to read .env manually
  if (!process.env.PRIVATE_KEY && fs.existsSync(envPath)) {
    console.log("🔧 Attempting manual .env parsing...");
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log("📝 .env content preview:", envContent.substring(0, 50) + "...");
    
    // Parse manually
    const lines = envContent.split('\n');
    for (const line of lines) {
      const [key, value] = line.split('=');
      if (key === 'PRIVATE_KEY' && value) {
        process.env.PRIVATE_KEY = value.trim();
        console.log("✅ Manually set PRIVATE_KEY");
      }
      if (key === 'BASESCAN_API_KEY' && value) {
        process.env.BASESCAN_API_KEY = value.trim();
        console.log("✅ Manually set BASESCAN_API_KEY");
      }
    }
  }
  
  // Get signers
  const signers = await ethers.getSigners();
  console.log("- Number of signers:", signers.length);
  
  if (signers.length === 0) {
    console.error("❌ No signers found. Please check your PRIVATE_KEY in .env file");
    console.log("💡 Make sure your private key starts with '0x' and is 64 characters long");
    return;
  }
  
  // Get the contract factory and attach to deployed contract
  const UnikoNFT = await ethers.getContractFactory("UnikoNFT");
  const contract = UnikoNFT.attach(CONTRACT_ADDRESS);
  
  // Get signer (contract owner)
  const [owner] = signers;
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