const { ethers } = require('hardhat');

async function test() {
    try {
        console.log('Testing contract existence...');
        const provider = ethers.provider;
        const network = await provider.getNetwork();
        console.log('Network:', network.name, 'Chain ID:', network.chainId);
        
        const code1 = await provider.getCode('0xd6B2cdf183cD40A3B88a444D0fDe518f0AC2965F');
        const code2 = await provider.getCode('0x10eFd553dC169C6a2bd04b65239f58B71B8d8260');
        
        console.log('V4 contract (0xd6B2...65F) exists:', code1 !== '0x');
        console.log('V5 contract (0x10eF...260) exists:', code2 !== '0x');
        
        if (code1 !== '0x') {
            console.log('Trying V4 contract...');
            const UnikoNFT = await ethers.getContractFactory("UnikoOnchain4");
            const contract = UnikoNFT.attach('0xd6B2cdf183cD40A3B88a444D0fDe518f0AC2965F');
            const totalSupply = await contract.totalSupply();
            console.log('V4 Total supply:', totalSupply.toString());
        }
        
    } catch(e) {
        console.log('Error:', e.message);
    }
}

test(); 