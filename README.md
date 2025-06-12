# UnikoNFT Mini App

A **Farcaster Mini App** for minting UnikoNFT - your cute on-chain companion! This Mini App allows users to preview and mint unique Unicode-based NFTs directly within Farcaster clients like Warpcast.

## ✨ Features

- **100% On-Chain Generation**: All NFT art is generated on-chain using Unicode symbols
- **Real-time Preview**: See your randomly generated Uniko before minting
- **Ultra Rare Designs**: Special hand-crafted ultra rare NFTs with unique designs
- **Trait System**: Eyes (guaranteed), mouths, cheeks, and accessories (all optional)
- **Rainbow Backgrounds**: Rare gradient backgrounds with 1% probability
- **Wallet Integration**: Seamless wallet connection through Farcaster
- **Responsive Design**: Mobile-optimized interface for Farcaster clients

## 🎨 NFT Traits

### Regular Traits
- **Eyes**: `•⚆⚈⨀⦿⤬◒◓◕∸-■⊡◨∩⬗⋒` (always present)
- **Mouths**: `ᴗ⤻―﹏⩊ω⟀~⩌︿3.ᆺᴥʌ⎦` (50% chance)
- **Cheeks**: Various paired symbols like `^ ^`, `> <`, `⬤ ⬤` (50% chance)
- **Accessories**: `♫✿★✧☾↑♥` (50% chance)
- **Background Colors**: 8 solid colors + 1% rainbow gradient
- **Face Colors**: 8 different colors for the Unicode symbols

### Ultra Rare Designs
- **nounish**: Nouns-inspired with distinctive glasses
- **pika**: Pokémon-inspired yellow with red cheeks
- **alien**: Green alien design with unique symbols
- **uniko**: The classic original Uniko design

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- A Farcaster account for testing

### Installation

1. **Clone or download this project**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` to see your Mini App!

## ⚙️ Configuration

Before deploying, you'll need to update several configuration values in `src/config.ts`:

### Required Updates

1. **Contract Information:**
   ```typescript
   export const contractConfig = {
     address: "YOUR_CONTRACT_ADDRESS_HERE", // Replace with deployed contract
     // ... rest of config
   };
   ```

2. **Creator Information:**
   ```typescript
   creator: {
     name: "Your Name",
     fid: YOUR_FARCASTER_ID, // Your Farcaster ID number
     profileImageUrl: "https://your-domain.com/profile.png",
   },
   ```

3. **Embed Configuration:**
   ```typescript
   export const embedConfig = {
     imageUrl: "https://your-domain.com/preview.png", // Preview image
     button: {
       action: {
         url: "https://your-deployed-app.com/", // Your deployed URL
       },
     },
   };
   ```

4. **Pricing:**
   ```typescript
   priceEth: "0.001", // Set your desired mint price
   ```

## 🏗️ Building and Deployment

### Build for Production

```bash
npm run build
```

### Deployment Options

#### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Deploy automatically

#### Option 2: Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify

#### Option 3: Any Static Host
The Mini App is a static React application and can be deployed to any static hosting service.

## 🔗 Smart Contract Integration

This Mini App is designed to work with the UnikoNFT smart contract. To integrate:

1. **Deploy your UnikoNFT contract** to Base (or your preferred chain)
2. **Update the contract configuration** in `src/config.ts`
3. **Add your contract's ABI** to the `contractConfig.abi` array
4. **Update the mint function call** in `src/App.tsx` to match your contract

### Sample Contract Integration

```typescript
// In src/App.tsx - handleMint function
const { writeContract } = useWriteContract();

const handleMint = async () => {
  if (!isConnected) {
    handleConnect();
    return;
  }

  setIsMinting(true);
  try {
    await writeContract({
      address: contractConfig.address,
      abi: contractConfig.abi,
      functionName: 'mint',
      args: [account.address],
      value: parseEther(mintMetadata.priceEth),
    });
    
    setShowSuccess(true);
    generatePreview();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Minting failed");
  } finally {
    setIsMinting(false);
  }
};
```

## 📱 Testing in Farcaster

1. **Deploy your Mini App** to a public URL
2. **Update the embed configuration** with your deployment URL
3. **Create a Farcaster cast** with the Mini App embed
4. **Test in Warpcast** or other Farcaster clients

### Frame Embed Example

```html
<meta name="fc:frame" content='{
  "version": "next",
  "imageUrl": "https://your-domain.com/preview.png",
  "button": {
    "title": "Mint Uniko",
    "action": {
      "type": "launch_frame",
      "name": "UnikoNFT Mint",
      "url": "https://your-domain.com/"
    }
  }
}'>
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run code linting

### Project Structure

```
src/
├── components/          # React components
│   ├── UnikoCard.tsx   # NFT display component
│   ├── MintButton.tsx  # Minting button
│   ├── PreviewSection.tsx # Preview controls
│   ├── SuccessSheet.tsx   # Success modal
│   └── ErrorSheet.tsx     # Error modal
├── lib/
│   └── utils.ts        # Utility functions
├── config.ts           # Main configuration
├── wagmi.ts           # Wallet configuration
├── App.tsx            # Main app component
├── main.tsx           # React entry point
└── index.css          # Styles
```

## 🎯 Features to Add

This is a foundation for your UnikoNFT Mini App. Consider adding:

- **Real contract integration** with your deployed UnikoNFT contract
- **Transaction tracking** and confirmations
- **Gallery view** of minted NFTs
- **Leaderboard** for most active minters
- **Social sharing** of minted NFTs
- **Notifications** for successful mints

## 🔧 Troubleshooting

### Common Issues

1. **Build errors**: Make sure all dependencies are installed with `npm install`
2. **Wallet connection issues**: Ensure you're testing in a Farcaster-compatible environment
3. **Contract errors**: Verify your contract address and ABI are correct

### Debug Mode

Enable debug mode by adding this to your `.env.local`:
```
VITE_DEBUG=true
```

## 📄 License

MIT License - feel free to use this code for your own NFT projects!

## 🤝 Contributing

This is a starter template for your UnikoNFT project. Feel free to customize and extend it to match your specific needs!

---

**Built with ❤️ for the Farcaster ecosystem** 