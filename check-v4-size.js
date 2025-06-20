const fs = require('fs');

try {
    const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/UnikoOnchain4.sol/UnikoOnchain4.json'));
    const bytecode = artifact.bytecode;
    const sizeInBytes = (bytecode.length - 2) / 2;
    
    console.log('=== UNIKOONCHAIN4 iOS-OPTIMIZED SIZE ===');
    console.log('Contract Size:', sizeInBytes, 'bytes');
    console.log('Size Limit:', 24576, 'bytes');
    console.log('Over limit by:', sizeInBytes - 24576, 'bytes');
    console.log('Percentage Used:', ((sizeInBytes / 24576) * 100).toFixed(2) + '%');
    
    if (sizeInBytes > 24576) {
        console.log('❌ CONTRACT TOO LARGE - CANNOT DEPLOY');
        console.log('Need to reduce by:', sizeInBytes - 24576, 'bytes');
    } else {
        console.log('✅ Contract size OK for deployment');
    }
} catch (error) {
    console.error('Error:', error.message);
} 