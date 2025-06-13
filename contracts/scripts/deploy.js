const hre = require("hardhat");

async function main() {
  console.log("Deploying UnikoNFT to Base Sepolia...");

  // Get the contract factory
  const UnikoNFT = await hre.ethers.getContractFactory("UnikoNFT");

  // Deploy the contract
  const unikoNFT = await UnikoNFT.deploy(
    "Unikō", // name
    "UNIKO", // symbol
    "https://uniko-nft-mini-app.vercel.app/api/metadata/" // baseURI
  );

  // Set custom royalty recipient
  console.log("Setting royalty recipient to 0xE765185a42D623a99864C790a88cd29825d8A4b9...");
  await unikoNFT.setRoyaltyRecipient("0xE765185a42D623a99864C790a88cd29825d8A4b9");

  await unikoNFT.waitForDeployment();

  const contractAddress = await unikoNFT.getAddress();
  console.log("UnikoNFT deployed to:", contractAddress);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await unikoNFT.deploymentTransaction().wait(5);

  // Verify the contract
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        "Unikō",
        "UNIKO",
        "https://uniko-nft-mini-app.vercel.app/api/metadata/"
      ],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.log("Verification failed:", error.message);
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Base Sepolia");
  console.log("Explorer: https://sepolia.basescan.org/address/" + contractAddress);
  console.log("OpenSea: https://testnets.opensea.io/assets/base-sepolia/" + contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 