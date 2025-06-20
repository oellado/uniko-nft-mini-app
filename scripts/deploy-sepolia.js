const { ethers } = require("hardhat");

async function main() {
    console.log("\n🚀 DEPLOYING UNIKO V8 ENHANCED - SEPOLIA TESTNET");
    console.log("==================================================");

    // Get deployer account
    const signers = await ethers.getSigners();
    if (signers.length === 0) {
        throw new Error("No signers available. Please check your .env file and network configuration.");
    }
    const deployer = signers[0];
    console.log("Deploying with account:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Contract size verification
    console.log("\n📊 CONTRACT SIZE VERIFICATION:");
    const hre = require("hardhat");
    const artifact = await hre.artifacts.readArtifact("UnikoOnchain8");
    const bytecodeSize = (artifact.deployedBytecode.length / 2) - 1;
    const maxSize = 24576; // 24KB
    const sizeKB = (bytecodeSize / 1024).toFixed(2);
    const remainingBytes = maxSize - bytecodeSize;
    
    console.log(`Contract Size: ${bytecodeSize} bytes (${sizeKB} KB)`);
    console.log(`Size Limit: ${maxSize} bytes (24.00 KB)`);
    console.log(`Remaining: ${remainingBytes} bytes (${(remainingBytes/1024).toFixed(2)} KB)`);
    
    if (remainingBytes <= 0) {
        console.log("❌ CONTRACT TOO LARGE - DEPLOYMENT ABORTED");
        process.exit(1);
    }
    
    console.log("✅ Contract size verified - proceeding with deployment");

    // Deployment parameters
    const royaltyRecipient = "0xE765185a42D623a99864C790a88cd29825d8A4b9"; // Your address
    const royaltyBps = 1000; // 10% (1000 basis points)
    
    console.log("\n⚙️  DEPLOYMENT PARAMETERS:");
    console.log("Network: Sepolia Ethereum Testnet");
    console.log("Royalty Recipient:", royaltyRecipient);
    console.log("Royalty Percentage:", (royaltyBps / 100) + "%");

    console.log("\n🎨 ENHANCED V8 FEATURES:");
    console.log("• 18 Eye Options (including rare ō)");
    console.log("• Conditional Cheek Logic (monocle with geometric eyes)");
    console.log("• Rainbow Face Colors (2% ultra rare)");
    console.log("• Premium Backgrounds (Gold, Titanium, Champagne, Sunset)");
    console.log("• 5-Tier Rarity System");
    console.log("• Contract Inheritance Optimization");

    // Deploy contract
    console.log("\n🔄 Deploying enhanced contract...");
    const UnikoOnchain8 = await ethers.getContractFactory("UnikoOnchain8");
    const contract = await UnikoOnchain8.deploy(royaltyRecipient, royaltyBps);
    
    console.log("⏳ Waiting for deployment confirmation...");
    await contract.waitForDeployment();

    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=========================");
    console.log("Contract Address:", await contract.getAddress());
    console.log("Transaction Hash:", contract.deploymentTransaction().hash);
    console.log("Gas Used:", contract.deploymentTransaction().gasLimit.toString());
    
    // Contract verification info
    console.log("\n📋 CONTRACT DETAILS:");
    console.log("Name:", await contract.name());
    console.log("Symbol:", await contract.symbol());
    console.log("Max Supply:", (await contract.MAX_SUPPLY()).toString());
    console.log("Mint Price:", ethers.formatEther(await contract.MINT_PRICE()), "ETH");
    console.log("Owner:", await contract.owner());
    
    console.log("\n✅ ENHANCED V8 TRAIT SYSTEM:");
    console.log("• Eyes: 18 options (17 standard + ō rare)");
    console.log("• Mouths: 16 options (enhanced with •)");
    console.log("• Cheeks: 12 options (11 standard + conditional monocle)");
    console.log("• Accessories: 7 options");
    console.log("• Face Colors: 9 options (8 solid + rainbow)");
    console.log("• Backgrounds: 8 options (4 common + 4 premium)");
    
    console.log("\n🎯 RARITY DISTRIBUTION:");
    console.log("• Legendary: Rainbow background (1%)");
    console.log("• Ultra Rare: Premium backgrounds (2% each), Rainbow faces (2%)");
    console.log("• Rare: Based/Purple/Sunset (3% each)");
    console.log("• Uncommon: ō eyes (3%)");
    console.log("• Common: Standard combinations");
    
    // Save deployment info
    const deploymentInfo = {
        contractName: "UnikoOnchain8Enhanced",
        contractAddress: await contract.getAddress(),
        transactionHash: contract.deploymentTransaction().hash,
        deployerAddress: deployer.address,
        royaltyRecipient: royaltyRecipient,
        royaltyBps: royaltyBps,
        contractSize: bytecodeSize,
        timestamp: new Date().toISOString(),
        network: hre.network.name,
        enhancements: {
            eyeOptions: 18,
            conditionalCheeks: true,
            rainbowFaces: true,
            premiumBackgrounds: 4,
            rarityTiers: 5
        }
    };
    
    const fs = require('fs');
    fs.writeFileSync('deployment-sepolia.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployment-sepolia.json");
    
    console.log("\n🚀 ENHANCED V8 READY FOR TESTING!");
    console.log("Contract deployed with all advanced trait features");
    console.log("\n📝 NEXT STEPS:");
    console.log("1. Verify contract on Sepolia Etherscan");
    console.log("2. Test mint functionality with new traits");
    console.log("3. Verify rarity distribution system");
    console.log("4. Update frontend with new contract address");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Enhanced deployment failed:", error);
        process.exit(1);
    }); 