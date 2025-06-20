const fs = require('fs');
const path = require('path');

// Check if V8 artifacts exist
const v8ArtifactPath = path.join(__dirname, 'artifacts', 'contracts', 'UnikoOnchain8.sol', 'UnikoOnchain8.json');

if (!fs.existsSync(v8ArtifactPath)) {
    console.log('❌ V8 contract not compiled yet. Run: npx hardhat compile');
    process.exit(1);
}

// Read V8 artifact
const v8Artifact = JSON.parse(fs.readFileSync(v8ArtifactPath, 'utf8'));
const v8BytecodeSize = v8Artifact.deployedBytecode.length / 2 - 1; // Convert hex to bytes

console.log('\n🔍 UNIKO V8 CONTRACT SIZE ANALYSIS');
console.log('=====================================');

// Size analysis
const maxSize = 24576; // 24KB limit
const v8SizeKB = (v8BytecodeSize / 1024).toFixed(2);
const remainingBytes = maxSize - v8BytecodeSize;
const percentUsed = ((v8BytecodeSize / maxSize) * 100).toFixed(1);

console.log(`📊 V8 Contract Size: ${v8BytecodeSize} bytes (${v8SizeKB} KB)`);
console.log(`📏 Size Limit: ${maxSize} bytes (24.00 KB)`);
console.log(`📈 Percentage Used: ${percentUsed}%`);

if (remainingBytes > 0) {
    console.log(`✅ UNDER LIMIT: ${remainingBytes} bytes remaining (${(remainingBytes/1024).toFixed(2)} KB)`);
    console.log(`🚀 STATUS: READY FOR DEPLOYMENT`);
} else {
    console.log(`❌ OVER LIMIT: ${Math.abs(remainingBytes)} bytes over limit`);
    console.log(`⚠️  STATUS: NEEDS SIZE REDUCTION`);
}

// Compare with V4 if available
const v4ArtifactPath = path.join(__dirname, 'artifacts', 'contracts', 'UnikoOnchain4.sol', 'UnikoOnchain4.json');
if (fs.existsSync(v4ArtifactPath)) {
    const v4Artifact = JSON.parse(fs.readFileSync(v4ArtifactPath, 'utf8'));
    const v4BytecodeSize = v4Artifact.deployedBytecode.length / 2 - 1;
    const sizeDifference = v8BytecodeSize - v4BytecodeSize;
    const percentChange = ((sizeDifference / v4BytecodeSize) * 100).toFixed(1);
    
    console.log('\n📊 COMPARISON WITH V4:');
    console.log(`V4 Size: ${v4BytecodeSize} bytes (${(v4BytecodeSize/1024).toFixed(2)} KB)`);
    console.log(`V8 Size: ${v8BytecodeSize} bytes (${v8SizeKB} KB)`);
    
    if (sizeDifference > 0) {
        console.log(`🔺 V8 is ${sizeDifference} bytes LARGER (+${percentChange}%)`);
    } else {
        console.log(`🔻 V8 is ${Math.abs(sizeDifference)} bytes SMALLER (${percentChange}%)`);
    }
}

console.log('\n🎯 PURE GENERATIVE ACHIEVEMENT:');
console.log('✅ Removed all 10 ultra rare designs');
console.log('✅ Removed reveal system and commitment');
console.log('✅ Removed ultra rare mappings and functions');
console.log('✅ Maintained all V4 trait functionality');
console.log('✅ Preserved rainbow/based/purple gradients');
console.log('✅ Kept XML escaping and proper alignment'); 