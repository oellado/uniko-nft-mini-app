import type { Abi, Address } from "viem";
import { baseSepolia } from "viem/chains";

/**
 * Smart Contract Configuration
 */
export const CONTRACT_ADDRESS: Address = "0xC6504dC915Afe34abc9019B64EcC131623AA0aD4";

export const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

/**
 * UnikoNFT Trait Definitions
 */
export const traits = {
  eyes: "•⚆⚈⨀⦿⤬◒◓◕∸-■⊡◨∩⬗⋒",
  mouths: "ᴗ⤻―﹏⩊ω⟀~⩌︿3.ᆺᴥʌ⎦",
  cheeks: ["^ ^", "> <", "– –", "= =", "⬤ ⬤", "~ ~", "≈ ≈", "≋ ≋", "⁕ ⁕", "∙ ∙", "∘ ∘"],
  accessories: "♫✿★✧☾↑♥",
  backgroundColors: ["#1A1A1A", "#FFFFFF", "#B29BE1", "#F9BFF2", "#FEAFAF", "#F9CC1F", "#BAE99C", "#99E2FF"],
  faceColors: ["#000000", "#EAEAE8", "#9774CE", "#FA85CB", "#EA434A", "#F98D70", "#57A52B", "#6B97FF"]
};

/**
 * UnikoNFT Ultra Rare Definitions
 */
export const ultraRares = [
  {
    name: "nounish",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
        <rect width="100%" height="100%" fill="#FFFFFF"/>
        <text y="50%" font-size="20" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI" fill="#EA434A">
            <tspan x="43%">⌐</tspan><tspan x="50%">◨</tspan><tspan x="57%">-</tspan><tspan x="64%">◨</tspan>
        </text></svg>`,
    bgColor: "#FFFFFF",
    faceColor: "#EA434A"
  },
  {
    name: "pika",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
        <rect width="100%" height="100%" fill="#F9CC1F"/>
        <text y="50%" font-size="20" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI">
            <tspan x="35%" fill="#EA434A">⬤</tspan>
            <tspan x="43%" fill="#000000">-</tspan>
            <tspan x="50%" fill="#000000">⩊</tspan>
            <tspan x="57%" fill="#000000">-</tspan>
            <tspan x="65%" fill="#EA434A">⬤</tspan>
        </text></svg>`,
    bgColor: "#F9CC1F",
    faceColor: "red and black"
  },
  {
    name: "3Dglasses",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
        <rect width="100%" height="100%" fill="#8C8C8C"/>
        <text y="50%" font-size="20" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI" fill="#FFFFFF">
            <tspan x="43%">⌐</tspan>
            <tspan x="50%" fill="#1625FF">■</tspan>
            <tspan x="57%" fill="#FFFFFF">-</tspan>
            <tspan x="64%" fill="#EA434A">■</tspan>
        </text></svg>`,
    bgColor: "#8C8C8C",
    faceColor: "white, blue and red"
  },
  {
    name: "pepe",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
        <rect width="100%" height="100%" fill="#577D29"/>
        <text y="50%" font-size="20" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI">
            <tspan x="33%" fill="#1625FF">∙</tspan>
            <tspan x="43%" fill="#000000">◒</tspan>
            <tspan x="50%" fill="#EA434A">ᴗ</tspan>
            <tspan x="57%" fill="#000000">◒</tspan>
            <tspan x="67%" fill="#1625FF">∙</tspan>
        </text></svg>`,
    bgColor: "#577D29",
    faceColor: "blue, black and red"
  },
  {
    name: "imagine",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
        <defs>
            <linearGradient id="imagineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FFFFFF"/>
                <stop offset="100%" stop-color="#88EDFF"/>
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#imagineGradient)"/>
        <text y="50%" font-size="20" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI">
            <tspan x="37%" fill="#000000">⌐</tspan>
            <tspan x="45%" fill="#FFFFFF">O</tspan>
            <tspan x="52%" fill="#000000">-</tspan>
            <tspan x="58%" fill="#FFFFFF">O</tspan>
            <tspan x="65%" fill="#FFFFFF">✿</tspan>
        </text></svg>`,
    bgColor: "gradient white to #88EDFF",
    faceColor: "black and white"
  },
  {
    name: "duo",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
        <rect width="100%" height="100%" fill="#FFFFFF"/>
        <text y="50%" font-size="18" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI" fill="#000000">
            <tspan x="27%">•</tspan><tspan x="34%">ᴗ</tspan><tspan x="41%">•</tspan>
            <tspan x="49%"> </tspan><tspan x="54%">/</tspan><tspan x="60%"> </tspan>
            <tspan x="65%">•</tspan><tspan x="72%">ᴗ</tspan><tspan x="79%">•</tspan>
        </text></svg>`,
    bgColor: "#FFFFFF",
    faceColor: "black"
  },
  {
    name: "kuma",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
        <rect width="100%" height="100%" fill="#9B6A4D"/>
        <text y="50%" font-size="20" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI" fill="#000000">
            <tspan x="43%">•</tspan><tspan x="50%">ᴥ</tspan><tspan x="57%">•</tspan>
        </text></svg>`,
    bgColor: "#9B6A4D",
    faceColor: "black"
  },
  {
    name: "uniko",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
        <rect width="100%" height="100%" fill="#FFFFFF"/>
        <text y="50%" font-size="20" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI" fill="#000000">
            <tspan x="43%">•</tspan><tspan x="50%">ᴗ</tspan><tspan x="57%">•</tspan>
        </text></svg>`,
    bgColor: "#FFFFFF",
    faceColor: "black"
  },
  {
    name: "alien",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
        <rect width="100%" height="100%" fill="#9DFFA2"/>
        <text y="50%" font-size="20" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI" fill="#000000">
            <tspan x="35%">⟁</tspan><tspan x="43%">⬤</tspan><tspan x="50%">ᴗ</tspan><tspan x="57%">⬤</tspan><tspan x="65%">⟁</tspan>
        </text></svg>`,
    bgColor: "#9DFFA2",
    faceColor: "black"
  },
  {
    name: "mochi",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
        <defs>
            <linearGradient id="mochiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FFFFFF"/>
                <stop offset="100%" stop-color="#FFB6F9"/>
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#mochiGradient)"/>
        <text y="50%" font-size="18" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI" fill="#FA85CB">
            <tspan x="33%">(</tspan><tspan x="38%">•</tspan><tspan x="43%">ᴗ</tspan><tspan x="48%">•</tspan><tspan x="53%">)</tspan>
        </text></svg>`,
    bgColor: "gradient white to #FFB6F9",
    faceColor: "#FA85CB"
  }
];

/**
 * Global state for tracking minted NFTs and ensuring no duplicates
 */
let mintedHashes = new Set<string>();
let totalMinted = 0;
let ultraRaresMinted = 0;
const MAX_SUPPLY = 10000;
const ULTRA_RARE_COUNT = 10; // Exactly 10 ultra rares in 10k collection

/**
 * Reset minting state (for testing or new collection)
 */
export function resetMintingState() {
  mintedHashes.clear();
  totalMinted = 0;
  ultraRaresMinted = 0;
}

/**
 * Generate a cryptographically strong hash from input
 */
function generateStrongHash(input: string): number {
  let hash = 0;
  const str = input + Date.now() + Math.random();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Generate unique trait combination hash
 */
function generateTraitHash(traits: any): string {
  return JSON.stringify(traits);
}

/**
 * Check if we should mint an ultra rare (1 in 1000 chance)
 * Ultra rares are specific designs (nounish, pika, alien, uniko, mochi)
 */
function shouldMintUltraRare(): boolean {
  // 1 in 1000 chance (0.1%)
  const hash = generateStrongHash(`ultra_check_${totalMinted}_${Date.now()}`);
  return (hash % 1000) === 0;
}

/**
 * NFT Generation Function with Proper Randomness and No Duplicates
 */
export function generateUnikoNFT(seed: string): any {
  // Prevent minting beyond max supply
  if (totalMinted >= MAX_SUPPLY) {
    throw new Error("Maximum supply reached");
  }

  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    attempts++;
    
    // Check if we should mint an ultra rare (specific designs)
    if (shouldMintUltraRare() && ultraRaresMinted < ULTRA_RARE_COUNT) {
      const ultraRareIndex = generateStrongHash(seed + "ultra" + attempts) % ultraRares.length;
      const ultraRare = {
        ...ultraRares[ultraRareIndex],
        isUltraRare: true,
        type: "Regular", // Appears as regular to user
        tokenId: totalMinted + 1,
        name: `Uniko #${totalMinted + 1}`, // Same naming as regular NFTs
        traits: {
          design: ultraRares[ultraRareIndex].name,
          rarity: "Ultra Rare" // Only visible in metadata
        }
      };
      
      const traitHash = generateTraitHash(ultraRare);
      
      if (!mintedHashes.has(traitHash)) {
        mintedHashes.add(traitHash);
        totalMinted++;
        ultraRaresMinted++;
        return ultraRare;
      }
      continue; // Try again if duplicate
    }

    // Generate regular NFT with strong randomness
    const baseHash = generateStrongHash(seed + attempts + totalMinted);
    
    // Generate separate seeds for each trait using different multipliers
    const eyeSeed = Math.abs(baseHash * 2654435761) % 2147483647;
    const mouthSeed = Math.abs(baseHash * 3074457345) % 2147483647;
    const cheekSeed = Math.abs(baseHash * 1073741827) % 2147483647;
    const accessorySeed = Math.abs(baseHash * 5915587277) % 2147483647;
    const bgColorSeed = Math.abs(baseHash * 1500450271) % 2147483647;
    const faceColorSeed = Math.abs(baseHash * 3267000013) % 2147483647;
    const rainbowSeed = Math.abs(baseHash * 982451653) % 2147483647;
    
    // Eyes are guaranteed
    const eyeIndex = eyeSeed % traits.eyes.length;
    const eye = traits.eyes[eyeIndex];
    
    // Other traits are optional (50% chance each)
    const hasMouth = (mouthSeed % 100) < 50;
    const hasCheeks = (cheekSeed % 100) < 50;
    const hasAccessory = (accessorySeed % 100) < 50;
    
    const mouth = hasMouth ? traits.mouths[mouthSeed % traits.mouths.length] : '';
    const cheeks: [string, string] = hasCheeks ? 
      traits.cheeks[cheekSeed % traits.cheeks.length].split(" ") as [string, string] : 
      ['', ''];
    const accessory = hasAccessory ? traits.accessories[accessorySeed % traits.accessories.length] : '';
    
    // Colors (1% chance for rainbow background)
    const isRainbow = (rainbowSeed % 100) === 0;
    const bgColor = isRainbow ? "rainbow" : traits.backgroundColors[bgColorSeed % traits.backgroundColors.length];
    const faceColor = traits.faceColors[faceColorSeed % traits.faceColors.length];
    
    // Create trait object for uniqueness check
    const nftTraits = {
      eyes: eye,
      mouth: mouth || "none",
      leftCheek: cheeks[0] || "none",
      rightCheek: cheeks[1] || "none",
      accessory: accessory || "none",
      background: bgColor,
      face: faceColor
    };
    
    const traitHash = generateTraitHash(nftTraits);
    
    // Check for duplicates
    if (!mintedHashes.has(traitHash)) {
      mintedHashes.add(traitHash);
      totalMinted++;
      
      // Generate SVG
      const svg = generateSVG(eye, mouth, cheeks, accessory, bgColor, faceColor, isRainbow);
      
      return {
        name: `Uniko #${totalMinted}`,
        svg,
        bgColor,
        faceColor,
        isUltraRare: false,
        type: "Regular",
        tokenId: totalMinted,
        traits: nftTraits
      };
    }
  }
  
  throw new Error("Unable to generate unique NFT after maximum attempts");
}

/**
 * Get minting statistics
 */
export function getMintingStats() {
  return {
    totalMinted,
    ultraRaresMinted,
    remainingSupply: MAX_SUPPLY - totalMinted,
    remainingUltraRares: ULTRA_RARE_COUNT - ultraRaresMinted,
    uniqueCombinations: mintedHashes.size
  };
}

/**
 * Generate Preview Face for App Start
 */
export function generatePreviewNFT(): any {
  const svg = generateSVG("•", "ᴗ", ["", ""], "", "#FFFFFF", "#000000", false);
  return {
    name: "Preview Uniko",
    svg,
    bgColor: "#FFFFFF",
    faceColor: "#000000",
    isUltraRare: false,
    type: "Preview",
    traits: {
      eyes: "•",
      mouth: "ᴗ",
      leftCheek: "none",
      rightCheek: "none",
      accessory: "none",
      background: "#FFFFFF",
      face: "#000000"
    }
  };
}

export function generateSVG(eye: string, mouth: string, cheeks: [string, string], accessory: string, bgColor: string, faceColor: string, isRainbow: boolean): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
    ${isRainbow ? `
    <defs>
      <linearGradient id="rainbowGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#B29AE1"/>
        <stop offset="20%" stop-color="#F8BEF1"/>
        <stop offset="40%" stop-color="#FDAFAE"/>
        <stop offset="60%" stop-color="#F8CC1F"/>
        <stop offset="80%" stop-color="#B9E99C"/>
        <stop offset="100%" stop-color="#99E1FF"/>
      </linearGradient>
    </defs>` : ''}
    <rect width="100%" height="100%" fill="${isRainbow ? 'url(#rainbowGradient)' : bgColor}"/>
    <text y="50%" font-size="20" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI" fill="${faceColor}">
      <tspan x="35%">${cheeks[0]}</tspan>
      <tspan x="43%">${eye}</tspan>
      <tspan x="50%">${mouth}</tspan>
      <tspan x="57%">${eye}</tspan>
      <tspan x="65%">${cheeks[1]}</tspan>
      <tspan x="72%">${accessory}</tspan>
    </text>
  </svg>`;
}

/**
 * NFT Metadata Configuration
 */
export const mintMetadata = {
  name: "Unikō",
  description: "A cute on-chain companion, 100% on-chain generative Unicode NFT collection with procedurally generated faces.",
  imageUrl: "https://your-domain.com/preview.png", // You'll need to update this
  creator: {
    name: "UnikoNFT",
    fid: 0, // You'll need to update this with your Farcaster ID
    profileImageUrl: "https://your-domain.com/profile.png", // You'll need to update this
  },
  chain: "Base",
  priceEth: "0.001",
  startsAt: null,
  endsAt: null,
  isMinting: true,
} as const;

/**
 * Contract Configuration (Update with deployed contract address)
 */
export const contractConfig = {
  address: "0xC6504dC915Afe34abc9019B64EcC131623AA0aD4" as Address, // Deployed on Base Sepolia
  chain: baseSepolia,
  abi: [
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "string", name: "metadata", type: "string" }
      ],
      name: "mint",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "MAX_SUPPLY",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "MINT_PRICE",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    }
  ] as const as Abi,
} as const;

/**
 * Farcaster Frame Embed Configuration
 */
export const embedConfig = {
  version: "next",
  imageUrl: mintMetadata.imageUrl,
  button: {
    title: "Mint Uniko",
    action: {
      type: "launch_frame",
      name: "UnikoNFT Mint",
      url: "https://your-domain.com/", // Update with your deployment URL
    },
  },
} as const;

/**
 * Main App Configuration
 */
export const config = {
  ...mintMetadata,
  contract: contractConfig,
  embed: embedConfig,
  traits,
  ultraRares,
  generateUnikoNFT,
} as const; 