const fs = require('fs');
const path = require('path');

async function main() {
    const contractName = 'UnikoOnchain7FontEmbedded';
    console.log(`🔍 Checking size of ${contractName}...`);

    try {
        const artifactsPath = path.join(__dirname, 'artifacts', 'contracts', `${contractName}.sol`);
        const contractArtifact = require(path.join(artifactsPath, `${contractName}.json`));
        
        const bytecode = contractArtifact.bytecode;
        if (!bytecode || bytecode === "0x") {
            throw new Error("Bytecode not found. Please compile the contract first.");
        }
        
        const sizeInBytes = (bytecode.length - 2) / 2;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        const maxSize = 24 * 1024; // 24KB

        console.log(`\nContract Size: ${sizeInBytes} bytes (${sizeInKB} KB)`);

        if (sizeInBytes > maxSize) {
            console.error(`❌ OVER LIMIT - Contract size of ${sizeInKB} KB exceeds the 24KB limit.`);
        } else {
            const remaining = maxSize - sizeInBytes;
            console.log(`✅ UNDER LIMIT - Remaining space: ${remaining} bytes.`);
        }

    } catch (error) {
        console.error("An error occurred during size check:");
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 