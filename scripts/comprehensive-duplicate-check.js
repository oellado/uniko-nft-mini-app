const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 COMPREHENSIVE DUPLICATE CHECK (INCLUDING COLORS)");
    console.log("===================================================");
    
    const CONTRACT_ADDRESS = "0x10eFd553dC169C6a2bd04b65239f58B71B8d8260";
    
    const contract = await ethers.getContractAt("UnikoOnchain5", CONTRACT_ADDRESS);
    
    const totalSupply = await contract.totalSupply();
    console.log(`📦 Total Supply: ${totalSupply.toString()}`);
    
    // Previously identified "duplicates" (same Unicode face only)
    const suspectedDuplicates = [
        { original: 7, duplicate: 104, face: "∙ • • ∙ ✿" },
        { original: 37, duplicate: 170, face: "∘ ◕ . ◕ ∘ ♫" },
        { original: 74, duplicate: 264, face: "^ ⚈ ― ⚈ ^" },
        { original: 228, duplicate: 380, face: "∘ - ⎦ - ∘ ↑" },
        { original: 348, duplicate: 387, face: "⁕ ◕ ⟀ ◕ ⁕ ✿" },
        { original: 200, duplicate: 407, face: "⚈ 3 ⚈" },
        { original: 179, duplicate: 492, face: "⤬ ⩌ ⤬ ✿" },
        { original: 193, duplicate: 560, face: "⁕ - ⩌ - ⁕ ✿" },
        { original: 346, duplicate: 594, face: "⬤ ⤬ ~ ⤬ ⬤" }
    ];
    
    console.log("🎨 DETAILED VISUAL COMPARISON (INCLUDING COLORS):");
    console.log("================================================");
    
    let trueDuplicates = 0;
    let colorDifferentiated = 0;
    
    for (let i = 0; i < suspectedDuplicates.length; i++) {
        const dup = suspectedDuplicates[i];
        console.log(`\n🔎 Checking Pair #${i + 1}:`);
        console.log(`   Tokens: #${dup.original} vs #${dup.duplicate}`);
        console.log(`   Unicode Face: "${dup.face}"`);
        
        try {
            // Get FULL traits for both tokens (including colors)
            const originalSVG = await contract.generateSVG(dup.original);
            const duplicateSVG = await contract.generateSVG(dup.duplicate);
            
            // Get tokenURI to extract full metadata
            const originalURI = await contract.tokenURI(dup.original);
            const duplicateURI = await contract.tokenURI(dup.duplicate);
            
            // Decode and parse the metadata
            const originalMetadata = JSON.parse(Buffer.from(originalURI.split(',')[1], 'base64').toString());
            const duplicateMetadata = JSON.parse(Buffer.from(duplicateURI.split(',')[1], 'base64').toString());
            
            console.log(`\n   📊 Original Token #${dup.original}:`);
            console.log(`      Attributes: ${JSON.stringify(originalMetadata.attributes)}`);
            
            console.log(`\n   📊 Duplicate Token #${dup.duplicate}:`);
            console.log(`      Attributes: ${JSON.stringify(duplicateMetadata.attributes)}`);
            
            // Extract colors from SVG
            const originalColors = extractColorsFromSVG(originalSVG);
            const duplicateColors = extractColorsFromSVG(duplicateSVG);
            
            console.log(`\n   🎨 Visual Analysis:`);
            console.log(`      Original background: ${originalColors.background}`);
            console.log(`      Duplicate background: ${duplicateColors.background}`);
            console.log(`      Original face color: ${originalColors.faceColor}`);
            console.log(`      Duplicate face color: ${duplicateColors.faceColor}`);
            
            // Check if SVGs are identical
            const svgsIdentical = originalSVG === duplicateSVG;
            console.log(`\n   🖼️  SVG Comparison:`);
            console.log(`      SVGs Identical: ${svgsIdentical ? 'YES ❌' : 'NO ✅'}`);
            
            if (svgsIdentical) {
                trueDuplicates++;
                console.log(`      🚨 TRUE DUPLICATE - Same Unicode face AND same colors!`);
            } else {
                colorDifferentiated++;
                console.log(`      ✅ NOT A DUPLICATE - Different colors make them unique!`);
                
                // Show the differences
                if (originalColors.background !== duplicateColors.background) {
                    console.log(`         💡 Different backgrounds: ${originalColors.background} vs ${duplicateColors.background}`);
                }
                if (originalColors.faceColor !== duplicateColors.faceColor) {
                    console.log(`         💡 Different face colors: ${originalColors.faceColor} vs ${duplicateColors.faceColor}`);
                }
            }
            
        } catch (error) {
            console.log(`   ❌ Error analyzing pair: ${error.message}`);
        }
    }
    
    // Now do a COMPREHENSIVE check of ALL tokens for TRUE duplicates
    console.log("\n🔍 COMPREHENSIVE COLLECTION-WIDE DUPLICATE CHECK:");
    console.log("=================================================");
    console.log("Checking ALL tokens for identical SVGs (face + colors)...");
    
    const svgHashes = new Map();
    let collectionTrueDuplicates = 0;
    
    console.log("⏳ Processing all tokens...");
    
    for (let tokenId = 1; tokenId < Number(totalSupply); tokenId++) {
        try {
            const svg = await contract.generateSVG(tokenId);
            const svgHash = ethers.keccak256(ethers.toUtf8Bytes(svg));
            
            if (svgHashes.has(svgHash)) {
                collectionTrueDuplicates++;
                const originalToken = svgHashes.get(svgHash);
                console.log(`🚨 TRUE DUPLICATE FOUND: Token #${tokenId} identical to Token #${originalToken}`);
                
                // Show the identical SVG details
                const colors = extractColorsFromSVG(svg);
                console.log(`   Background: ${colors.background}, Face: ${colors.faceColor}`);
            } else {
                svgHashes.set(svgHash, tokenId);
            }
            
            // Progress indicator
            if (tokenId % 100 === 0) {
                console.log(`   📊 Processed ${tokenId}/${Number(totalSupply) - 1} tokens...`);
            }
            
        } catch (error) {
            console.log(`❌ Error processing token ${tokenId}: ${error.message}`);
        }
    }
    
    // FINAL RESULTS
    console.log("\n🎉 FINAL DUPLICATE ANALYSIS RESULTS:");
    console.log("====================================");
    console.log(`📊 Initially suspected duplicates: ${suspectedDuplicates.length}`);
    console.log(`❌ True duplicates (same face + colors): ${trueDuplicates}`);
    console.log(`✅ Color-differentiated (NOT duplicates): ${colorDifferentiated}`);
    console.log(`🔍 Collection-wide true duplicates: ${collectionTrueDuplicates}`);
    
    if (collectionTrueDuplicates === 0) {
        console.log("\n🎊 EXCELLENT NEWS!");
        console.log("✅ NO TRUE DUPLICATES FOUND in the collection!");
        console.log("✅ Tokens with same Unicode faces have different colors");
        console.log("✅ Each token is visually unique!");
        console.log("✅ The duplicate prevention system IS working correctly!");
        console.log("✅ Collection is ready for continued minting or mainnet!");
    } else {
        console.log(`\n🚨 ${collectionTrueDuplicates} TRUE DUPLICATES found!`);
        console.log("❌ These tokens are identical in ALL aspects");
        console.log("❌ Investigation needed for duplicate prevention system");
    }
}

// Helper function to extract colors from SVG
function extractColorsFromSVG(svg) {
    const colors = {
        background: "unknown",
        faceColor: "unknown"
    };
    
    try {
        // Extract background color
        if (svg.includes('fill="url(#rainbow)"')) {
            colors.background = "rainbow";
        } else if (svg.includes('fill="url(#based)"')) {
            colors.background = "based";
        } else if (svg.includes('fill="url(#purple)"')) {
            colors.background = "purple";
        } else {
            // Extract solid color
            const bgMatch = svg.match(/fill="([^"]*)"(?=\/>)/);
            if (bgMatch) {
                colors.background = bgMatch[1];
            }
        }
        
        // Extract face color
        const faceMatch = svg.match(/fill="([^"]*)"[^>]*>[^<]*<tspan/);
        if (faceMatch) {
            colors.faceColor = faceMatch[1];
        }
        
    } catch (error) {
        console.log(`Error extracting colors: ${error.message}`);
    }
    
    return colors;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Comprehensive check failed:", error);
        process.exit(1);
    }); 