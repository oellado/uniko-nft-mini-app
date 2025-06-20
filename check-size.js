const fs = require('fs');

function checkContractSize(contractName) {
    try {
        const artifact = JSON.parse(fs.readFileSync(`./artifacts/contracts/${contractName}.sol/${contractName}.json`));
        const bytecode = artifact.bytecode;
        const sizeInBytes = (bytecode.length - 2) / 2;
        
        console.log(`\n=== ${contractName.toUpperCase()} SIZE ANALYSIS ===`);
        console.log('Contract Size:', sizeInBytes, 'bytes');
        console.log('Size Limit:', 24576, 'bytes');
        console.log('Remaining:', 24576 - sizeInBytes, 'bytes');
        console.log('Percentage Used:', ((sizeInBytes / 24576) * 100).toFixed(2) + '%');
        
        if (sizeInBytes > 24576) {
            console.log('❌ CONTRACT TOO LARGE - CANNOT DEPLOY');
        } else {
            console.log('✅ Contract size OK for deployment');
        }
        
        return sizeInBytes;
    } catch (error) {
        console.error(`Error checking ${contractName}:`, error.message);
        return 0;
    }
}

// Check all contracts
const v4Size = checkContractSize('UnikoOnchain4');
const v6Size = checkContractSize('UnikoOnchain6');
const helperSize = checkContractSize('UnikoHelpers');

console.log('\n=== SIZE COMPARISON ===');
console.log('UnikoOnchain4 (current):', v4Size, 'bytes');
console.log('UnikoOnchain6 (new):', v6Size, 'bytes');
console.log('UnikoHelpers (library):', helperSize, 'bytes');
console.log('Combined V6 + Helpers:', v6Size + helperSize, 'bytes');
console.log('Size reduction:', v4Size - v6Size, 'bytes');
console.log('Percentage reduction:', (((v4Size - v6Size) / v4Size) * 100).toFixed(2) + '%'); 