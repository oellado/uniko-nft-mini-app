import pkg from "hardhat";
const { run } = pkg;
import dotenv from "dotenv";

// Explicitly load .env file
dotenv.config();

async function main() {
  const contractAddress = "0xC6504dC915Afe34abc9019B64EcC131623AA0aD4";
  
  console.log("🔍 Verifying contract on Basescan...");
  console.log("📍 Contract Address:", contractAddress);
  
  try {
    // Constructor arguments decoded from the actual deployment transaction bytecode
    const constructorArguments = [
      "Unikō",
      "UNIKO", 
      "https://your-domain.com/api/metadata/"
    ];
    
    console.log("🔧 Constructor Arguments:", constructorArguments);
    
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
    });
    
    console.log("✅ Contract verification completed successfully!");
    console.log("🌐 View on Basescan:", `https://sepolia.basescan.org/address/${contractAddress}#code`);
    
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
      console.log("🌐 View on Basescan:", `https://sepolia.basescan.org/address/${contractAddress}#code`);
    } else {
      console.error("❌ Verification failed:", error.message);
      console.log("\n🔍 Debugging info:");
      console.log("- Make sure the contract source code matches exactly");
      console.log("- Verify the constructor arguments are correct");
      console.log("- Check that the compiler version and settings match");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  }); 