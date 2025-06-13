const { run } = require("hardhat");
require("dotenv").config();

const CONTRACT_ADDRESS = "0xC6504dC915Afe34abc9019B64EcC131623AA0aD4";
const ROYALTY_RECIPIENT = "0xE765185a42D623a99864C790a88cd29825d8A4b9";
const ROYALTY_PERCENTAGE = 500; // 5% in basis points (500/10000 = 5%)

async function main() {
  console.log("🔍 Starting contract verification...");
  console.log("📍 Contract address:", CONTRACT_ADDRESS);
  console.log("👤 Royalty recipient:", ROYALTY_RECIPIENT);
  console.log("💰 Royalty percentage:", ROYALTY_PERCENTAGE / 100, "%");
  
  try {
    console.log("🚀 Verifying contract on Basescan...");
    
    await run("verify:verify", {
      address: CONTRACT_ADDRESS,
      constructorArguments: [ROYALTY_RECIPIENT, ROYALTY_PERCENTAGE],
      network: "baseSepolia"
    });
    
    console.log("✅ Contract verified successfully!");
    console.log("🌐 View on Basescan:", `https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}#code`);
    
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
      console.log("🌐 View on Basescan:", `https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}#code`);
    } else {
      console.error("❌ Verification failed:", error.message);
      
      if (error.message.includes("API Key")) {
        console.log("💡 Make sure you have set BASESCAN_API_KEY in your .env file");
        console.log("🔑 Get your API key from: https://basescan.org/apis");
      }
      
      if (error.message.includes("constructor")) {
        console.log("💡 Constructor arguments might be incorrect");
        console.log("🔧 Current arguments:", [ROYALTY_RECIPIENT, ROYALTY_PERCENTAGE]);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  }); 