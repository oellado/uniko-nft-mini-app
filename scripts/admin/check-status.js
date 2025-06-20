const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0xd6B2cdf183cD40A3B88a444D0fDe518f0AC2965F";
    
    // Get contract instance
    const UnikoNFT = await ethers.getContractFactory("UnikoOnchain8");
    const contract = UnikoNFT.attach(contractAddress);
    
    try {
        // Check current pause status
        const isPaused = await contract.paused();
        // Output just the status for the batch file to read
        process.stdout.write(isPaused ? "PAUSED" : "ACTIVE");
    } catch (error) {
        console.error("Error checking contract status:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 