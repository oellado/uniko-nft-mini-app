# Unikō - 100% Onchain Generative Art

**Unikō** is a 100% onchain generative art NFT collection featuring minimalist Unicode-based character faces. Every aspect of the NFT—metadata, traits, and SVG art—is generated and stored entirely onchain using a revolutionary dual-contract architecture.

## 🎨 Art Project Overview

- **Total Supply**: 10,000 unique NFTs
- **Art Style**: Minimalist Unicode character faces
- **Network**: Base Blockchain
- **Architecture**: Dual smart contract system
- **Storage**: 100% onchain (no IPFS dependencies)

## 🏗️ Technical Architecture

### Dual-Contract System
- **Uniko_01.sol**: Main contract handling minting, ownership, and metadata
- **UnikoRenderer.sol**: Dedicated art engine for SVG generation
- **Innovation**: Solved blockchain size limits with 39% size reduction

### Features
- **Pure Generative**: Algorithmic trait generation with rarity distribution
- **Cross-Platform**: Consistent rendering on iOS, Android, PC, Mac
- **Anti-MEV**: Optimistic reveal prevents rare trait sniping
- **Enterprise RPC**: Alchemy infrastructure for reliable performance

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Hardhat development environment

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file:
```
PRIVATE_KEY=your_private_key
BASE_SEPOLIA_RPC_URL=your_alchemy_rpc_url
BASESCAN_API_KEY=your_basescan_api_key
```

### Testing
```bash
# Run contract tests
npx hardhat test

# Check contract sizes
node scripts/check-contract-info.js
```

### Deployment
```bash
# Deploy to Base Sepolia (testnet)
npx hardhat run scripts/deploy.js --network baseSepolia

# Verify contracts
npx hardhat verify --network baseSepolia CONTRACT_ADDRESS
```

## 📱 Frontend Application

The minting interface is a React-based Farcaster Mini App:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

## 🎯 Key Files

- `contracts/Uniko_01.sol` - Main NFT contract
- `contracts/UnikoRenderer.sol` - Art generation engine
- `src/App.tsx` - Frontend minting interface
- `scripts/admin/` - Contract management tools

## 📊 Contract Addresses

### Base Sepolia (Testnet)
- **Main Contract**: `0x6Aa08b3FA75C395c8cbD23f235992EfedF3A8183`
- **Renderer**: `0xF9e51af323Bb26f43Da75729896d327c84E06BeD`

### Base Mainnet
- Coming soon

## 🌐 Live Application
- **Minting Site**: https://uniko.miguelgarest.com

## 🎨 Art Specifications

- **Dimensions**: 280x280 SVG
- **Characters**: Unicode-based eyes, mouths, cheeks, accessories
- **Backgrounds**: 9 gradient and solid color options
- **Rarity**: Algorithmic distribution with ultra-rare traits

## 🛡️ Security

- Comprehensive security review completed (EXCELLENT rating)
- Pure stateless rendering contract
- No external dependencies or IPFS risks
- All art generation happens onchain

## 📖 Documentation

For detailed information, see the [docs/](docs/) folder:
- **[USER_GUIDE.md](docs/USER_GUIDE.md)** - How to mint and view Unikō NFTs
- **[INCIDENT_RESPONSE.md](docs/INCIDENT_RESPONSE.md)** - Emergency procedures
- **[MONITORING_SETUP.md](docs/MONITORING_SETUP.md)** - Health monitoring guide

## 📄 License

This project is an art collection. See LICENSE file for details.

---

**Unikō** - Permanent art that lives forever onchain. 