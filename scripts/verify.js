import pkg from "hardhat";
const { run } = pkg;
import dotenv from "dotenv";

// Explicitly load .env file
dotenv.config();

const CONTRACT_ADDRESS = "0xC6504dC915Afe34abc9019B64EcC131623AA0aD4";

// Possible constructor argument combinations to try
const POSSIBLE_CONSTRUCTOR_ARGS = [
  // Option 1: Standard NFT deployment
  ["Uniko NFT", "UNIKO", ""],
  
  // Option 2: With different name variations
  ["UnikoNFT", "UNIKO", ""],
  
  // Option 3: With base URI
  ["Uniko NFT", "UNIKO", "https://api.uniko.com/metadata/"],
  
  // Option 4: Simple names
  ["Uniko", "UNIKO", ""],
  
  // Option 5: Empty base URI with different format
  ["Uniko NFT", "UNIKO", "ipfs://"],
];

async function main() {
  console.log("🔍 Starting contract verification...");
  console.log("📍 Contract address:", CONTRACT_ADDRESS);
  
  for (let i = 0; i < POSSIBLE_CONSTRUCTOR_ARGS.length; i++) {
    const args = POSSIBLE_CONSTRUCTOR_ARGS[i];
    console.log(`\n🔧 Trying constructor arguments ${i + 1}/${POSSIBLE_CONSTRUCTOR_ARGS.length}:`, args);
    
    try {
      console.log("🚀 Verifying contract on Basescan...");
      
      await run("verify:verify", {
        address: CONTRACT_ADDRESS,
        constructorArguments: args,
        network: "baseSepolia"
      });
      
      console.log("✅ Contract verified successfully!");
      console.log("🌐 View on Basescan:", `https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}#code`);
      return; // Exit if successful
      
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract is already verified!");
        console.log("🌐 View on Basescan:", `https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}#code`);
        return; // Exit if already verified
      } else {
        console.log(`❌ Attempt ${i + 1} failed:`, error.message.split('\n')[0]);
        
        // If this is the last attempt, show detailed error
        if (i === POSSIBLE_CONSTRUCTOR_ARGS.length - 1) {
          console.error("\n💥 All verification attempts failed!");
          console.log("🔍 Last error details:", error.message);
          
          if (error.message.includes("API Key")) {
            console.log("💡 Make sure you have set BASESCAN_API_KEY in your .env file");
            console.log("🔑 Get your API key from: https://basescan.org/apis");
          }
        }
      }
    }
  }
  
  console.log("\n💡 Manual verification steps:");
  console.log("1. Go to https://sepolia.basescan.org/address/" + CONTRACT_ADDRESS + "#code");
  console.log("2. Click 'Verify and Publish'");
  console.log("3. Select 'Solidity (Single file)'");
  console.log("4. Upload the flattened contract source code");
  console.log("5. Try different constructor argument combinations");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  }); 