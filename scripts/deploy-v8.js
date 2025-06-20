const { ethers } = require("hardhat");

async function main() {
    console.log("\n🚀 DEPLOYING UNIKO V8 - PURE GENERATIVE VERSION");
    console.log("=================================================");

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
    console.log("Royalty Recipient:", royaltyRecipient);
    console.log("Royalty Percentage:", (royaltyBps / 100) + "%");

    // Deploy contract
    console.log("\n🔄 Deploying contract...");
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
    
    console.log("\n✅ PURE GENERATIVE FEATURES:");
    console.log("• NO ULTRA RARES - 100% algorithmic generation");
    console.log("• Rainbow/Based/Purple gradient backgrounds");
    console.log("• XML-escaped special characters");
    console.log("• Improved iOS font compatibility");
    console.log("• Configurable 10% royalties");
    
    // Save deployment info
    const deploymentInfo = {
        contractName: "UnikoOnchain8",
        contractAddress: await contract.getAddress(),
        transactionHash: contract.deploymentTransaction().hash,
        deployerAddress: deployer.address,
        royaltyRecipient: royaltyRecipient,
        royaltyBps: royaltyBps,
        contractSize: bytecodeSize,
        timestamp: new Date().toISOString(),
        network: hre.network.name
    };
    
    const fs = require('fs');
    fs.writeFileSync('deployment-v8.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployment-v8.json");
    
    console.log("\n🚀 READY FOR MINTING!");
    console.log("Contract is deployed and ready for public minting");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 