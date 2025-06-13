import { generateUnikoNFT } from '../../src/config.js';

export default function handler(req, res) {
  const { tokenId } = req.query;
  
  if (!tokenId) {
    return res.status(400).json({ error: 'Token ID is required' });
  }

  try {
    // Generate NFT based on token ID as seed
    const nft = generateUnikoNFT(`token_${tokenId}`);
    
    // Convert SVG to base64 data URI
    const svgBase64 = Buffer.from(nft.svg).toString('base64');
    const imageDataUri = `data:image/svg+xml;base64,${svgBase64}`;
    
    // Create OpenSea-compatible metadata
    const metadata = {
      name: `Unikō #${tokenId}`,
      description: "A cute on-chain companion, 100% on-chain generative Unicode NFT collection with procedurally generated faces.",
      image: imageDataUri,
      external_url: `https://uniko-nft-mini-app.vercel.app/`,
      attributes: [
        {
          trait_type: "Eyes",
          value: nft.traits.eyes
        },
        {
          trait_type: "Mouth", 
          value: nft.traits.mouth
        },
        {
          trait_type: "Left Cheek",
          value: nft.traits.leftCheek
        },
        {
          trait_type: "Right Cheek", 
          value: nft.traits.rightCheek
        },
        {
          trait_type: "Accessory",
          value: nft.traits.accessory
        },
        {
          trait_type: "Background",
          value: nft.traits.background
        },
        {
          trait_type: "Face Color",
          value: nft.traits.face
        },
        {
          trait_type: "Rarity",
          value: nft.isUltraRare ? "Ultra Rare" : "Regular"
        }
      ]
    };

    // Set proper headers for NFT metadata
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    return res.status(200).json(metadata);
    
  } catch (error) {
    console.error('Error generating metadata:', error);
    return res.status(500).json({ error: 'Failed to generate metadata' });
  }
} 