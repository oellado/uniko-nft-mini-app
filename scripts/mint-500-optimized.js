const { ethers } = require("hardhat");

async function main() {
    console.log("🎁 MINTING 500 NFTs WITH OPTIMIZED BATCHING");
    console.log("==========================================");
    
    const CONTRACT_ADDRESS = "0x10eFd553dC169C6a2bd04b65239f58B71B8d8260";
    const RECIPIENT_ADDRESS = "0xE765185a42D623a99864C790a88cd29825d8A4b9";
    const TOTAL_TO_MINT = 500;
    const BATCH_SIZE = 25; // Optimal batch size for cost efficiency
    
    const [deployer] = await ethers.getSigners();
    console.log("👑 Minting from:", deployer.address);
    console.log("🎯 Recipient:", RECIPIENT_ADDRESS);
    console.log("📦 Total NFTs:", TOTAL_TO_MINT);
    console.log("⚡ Batch size:", BATCH_SIZE);
    
    const contract = await ethers.getContractAt("UnikoOnchain4", CONTRACT_ADDRESS);
    
    // Check initial status
    let currentSupply = await contract.totalSupply();
    const maxSupply = await contract.MAX_SUPPLY();
    const totalBatches = Math.ceil(TOTAL_TO_MINT / BATCH_SIZE);
    
    console.log("📊 Current supply:", currentSupply.toString());
    console.log("🏁 Max supply:", maxSupply.toString());
    console.log("🔢 Total batches needed:", totalBatches);
    
    // Estimate total cost
    try {
        const sampleGasEstimate = await contract.ownerMint.estimateGas(RECIPIENT_ADDRESS, BATCH_SIZE);
        const totalEstimatedGas = sampleGasEstimate * BigInt(totalBatches);
        const gasPrice = await ethers.provider.getFeeData();
        const totalCostEth = ethers.formatEther(totalEstimatedGas * (gasPrice.gasPrice || 0n));
        
        console.log(`⛽ Gas per batch: ~${sampleGasEstimate.toString()}`);
        console.log(`💰 Estimated total cost: ${totalCostEth} ETH`);
        
    } catch (error) {
        console.log("⚠️  Could not estimate total cost, proceeding anyway...");
    }
    
    // Execute batches
    let successfulBatches = 0;
    let totalMinted = 0;
    const startTime = Date.now();
    
    console.log("\\n🚀 STARTING 500 NFT MINT...");
    console.log("============================");
    
    for (let i = 0; i < totalBatches; i++) {
        const batchStart = i * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_TO_MINT);
        const batchSize = batchEnd - batchStart;
        
        console.log(`\\n📦 Batch ${i + 1}/${totalBatches} - Minting ${batchSize} NFTs...`);
        
        try {
            // Get fresh gas estimate for each batch
            const gasEstimate = await contract.ownerMint.estimateGas(RECIPIENT_ADDRESS, batchSize);
            const gasWithBuffer = gasEstimate * 11n / 10n; // 10% buffer for 25 NFT batches
            
            const tx = await contract.ownerMint(RECIPIENT_ADDRESS, batchSize, {
                gasLimit: gasWithBuffer
            });
            
            console.log(`📤 TX: ${tx.hash.substring(0, 20)}...`);
            
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                successfulBatches++;
                totalMinted += batchSize;
                
                console.log(`✅ Batch ${i + 1} SUCCESS!`);
                console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
                console.log(`📊 Total minted: ${totalMinted}/${TOTAL_TO_MINT}`);
                
                // Update current supply
                currentSupply = await contract.totalSupply();
                console.log(`📊 Current supply: ${currentSupply.toString()}`);
                
                // Show progress
                const progress = Math.round((totalMinted / TOTAL_TO_MINT) * 100);
                console.log(`📊 Progress: ${progress}%`);
                
                // Time estimate
                const elapsed = Date.now() - startTime;
                const avgTimePerBatch = elapsed / (i + 1);
                const remainingBatches = totalBatches - (i + 1);
                const estimatedTimeLeft = Math.round((remainingBatches * avgTimePerBatch) / 1000 / 60);
                
                if (remainingBatches > 0) {
                    console.log(`⏱️  Est. time remaining: ${estimatedTimeLeft} minutes`);
                }
                
                // Show some sample NFTs from first few batches
                if (i < 3) {
                    const startToken = Number(currentSupply) - batchSize;
                    console.log(`🖼️  Sample from this batch:`);
                    for (let j = 0; j < Math.min(3, batchSize); j++) {
                        try {
                            const tokenId = startToken + j;
                            const face = await contract.getUniko(tokenId);
                            const rarity = await contract.rarity(tokenId);
                            console.log(`   Token ${tokenId}: ${face} (${rarity})`);
                        } catch (error) {
                            console.log(`   Token ${startToken + j}: Error reading data`);
                        }
                    }
                }
                
            } else {
                console.log(`❌ Batch ${i + 1} FAILED! Status: ${receipt.status}`);
                throw new Error(`Batch failed with status ${receipt.status}`);
            }
            
            // Small delay between batches
            if (i < totalBatches - 1) {
                console.log("⏳ Waiting 3 seconds before next batch...");
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
        } catch (error) {
            console.log(`❌ Batch ${i + 1} ERROR:`, error.message);
            
            if (error.message.includes("nonce")) {
                console.log("💡 Nonce issue - waiting 5 seconds and retrying...");
                await new Promise(resolve => setTimeout(resolve, 5000));
                i--; // Retry this batch
                continue;
            }
            
            console.log("❌ MINTING STOPPED due to error");
            break;
        }
    }
    
    // Final summary
    console.log("\\n🎉 500 NFT MINT COMPLETE!");
    console.log("==========================");
    console.log(`✅ Successful batches: ${successfulBatches}/${totalBatches}`);
    console.log(`📦 Total NFTs minted: ${totalMinted}/${TOTAL_TO_MINT}`);
    
    // Final balance check
    const finalSupply = await contract.totalSupply();
    const recipientBalance = await contract.balanceOf(RECIPIENT_ADDRESS);
    
    console.log(`📊 Final supply: ${finalSupply.toString()}`);
    console.log(`👑 Recipient balance: ${recipientBalance.toString()}`);
    
    const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);
    console.log(`⏱️  Total time: ${totalTime} minutes`);
    
    if (totalMinted === TOTAL_TO_MINT) {
        console.log("🎊 ALL 500 NFTs SUCCESSFULLY MINTED!");
        console.log("🎨 Unicode art collection with updated font sizes ready!");
        console.log("✨ Some NFTs may be ultra rares - check positions 2,4,6,8,10,12,14,16,18,20");
    } else {
        console.log(`⚠️  Partial mint: ${totalMinted}/${TOTAL_TO_MINT} completed`);
    }
    
    // Show final statistics
    console.log("\\n📊 FINAL STATISTICS:");
    console.log("====================");
    const avgGasPerNFT = totalMinted > 0 ? "~265,000" : "N/A";
    console.log(`⚡ Avg gas per NFT: ${avgGasPerNFT}`);
    console.log(`🔢 Batch size used: ${BATCH_SIZE} NFTs`);
    console.log(`⏰ Avg time per batch: ${totalTime > 0 ? Math.round((totalTime * 60) / successfulBatches) : "N/A"} seconds`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 500 NFT mint failed:", error);
        process.exit(1);
    }); 