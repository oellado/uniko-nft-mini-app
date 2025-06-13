const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying UnikoNFT contract...");

  // Get the deployer account
  const signers = await ethers.getSigners();
  console.log("Number of signers:", signers.length);
  
  if (signers.length === 0) {
    throw new Error("No signers found. Check your PRIVATE_KEY in .env file");
  }
  
  const [deployer] = signers;
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const UnikoNFT = await ethers.getContractFactory("UnikoNFT");
  const unikoNFT = await UnikoNFT.deploy(
    "Unikō", // name
    "UNIKO", // symbol
    "https://your-domain.com/api/metadata/" // baseURI - will be updated later
  );
  
  await unikoNFT.waitForDeployment();
  const contractAddress = await unikoNFT.getAddress();

  console.log("UnikoNFT deployed to:", contractAddress);
  console.log("Contract deployer:", deployer.address);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
    mintPrice: "0.001 ETH",
    maxSupply: "10000",
    contractName: "UnikoNFT",
    symbol: "UNIKO"
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Wait for a few blocks before verification
  console.log("\nWaiting for 5 block confirmations...");
  await unikoNFT.deploymentTransaction().wait(5);

  console.log("\n=== Contract Interface ===");
  console.log("mint() - Cost: 0.001 ETH");
  console.log("totalSupply() - View total minted");
  console.log("tokenURI(tokenId) - Get NFT metadata");
  console.log("withdraw() - Owner only");

  return contractAddress;
}

main()
  .then((contractAddress) => {
    console.log(`\nDeployment successful! Contract: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  }); 