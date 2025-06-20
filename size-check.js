const fs = require('fs');
const path = require('path');

function checkContractSize(contractName) {
    try {
        const artifactPath = path.join(__dirname, 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
        
        if (!fs.existsSync(artifactPath)) {
            console.log(`❌ Artifact not found: ${artifactPath}`);
            return null;
        }
        
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        
        const bytecode = artifact.bytecode;
        const sizeInBytes = (bytecode.length - 2) / 2; // Remove 0x prefix and convert hex to bytes
        const sizeInKB = sizeInBytes / 1024;
        const limit = 24576; // 24KB
        const isUnderLimit = sizeInBytes < limit;
        
        console.log(`\n📄 Contract: ${contractName}`);
        console.log(`📏 Size: ${sizeInBytes} bytes (${sizeInKB.toFixed(2)} KB)`);
        console.log(`🎯 Limit: ${limit} bytes (24.00 KB)`);
        console.log(`📊 Status: ${isUnderLimit ? '✅' : '❌'} ${isUnderLimit ? 'UNDER LIMIT' : 'OVER LIMIT'}`);
        
        if (!isUnderLimit) {
            const overBy = sizeInBytes - limit;
            const percentage = (overBy / limit * 100).toFixed(1);
            console.log(`🚨 Over by: ${overBy} bytes (${percentage}% too large)`);
        } else {
            const remaining = limit - sizeInBytes;
            const percentage = (remaining / limit * 100).toFixed(1);
            console.log(`✅ Remaining: ${remaining} bytes (${percentage}% headroom)`);
        }
        
        return { sizeInBytes, sizeInKB, isUnderLimit };
    } catch (error) {
        console.log(`❌ Could not check ${contractName}: ${error.message}`);
        return null;
    }
}

// Check all available contract versions
const contracts = ['UnikoOnchain4', 'UnikoOnchain5', 'UnikoOnchain6'];
console.log('🔍 CONTRACT SIZE ANALYSIS\n');

const results = [];
contracts.forEach(contract => {
    const result = checkContractSize(contract);
    if (result) results.push({ contract, ...result });
});

console.log('\n📊 SUMMARY:');
results.forEach(r => {
    console.log(`${r.contract}: ${r.sizeInKB.toFixed(2)} KB ${r.isUnderLimit ? '✅' : '❌'}`);
});

console.log('\n📋 OPTIMIZATION STRATEGIES FOR OVERSIZE CONTRACTS:');
console.log('1. 🎨 Compress Ultra Rare SVGs: Move hardcoded SVGs to external storage or compress');
console.log('2. 📦 Optimize String Storage: Use bytes32 for short strings, pack data better');
console.log('3. 🔧 Remove Redundant Code: Eliminate duplicate string literals and functions');
console.log('4. 📊 Efficient Arrays: Use memory arrays instead of storage for static data');
console.log('5. 🎭 Function Visibility: Make internal functions private where possible');
console.log('6. 📝 Optimize Comments: Remove verbose comments from production code');
console.log('7. 🔀 Library Extraction: Move reusable code to external libraries'); 