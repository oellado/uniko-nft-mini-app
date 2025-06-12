import type { Abi, Address } from "viem";
import { base } from "viem/chains";

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
    svg: generateSVG("◨", "-", ["", ""], "", "#FFFFFF", "#EA434A", false),
    bgColor: "#FFFFFF",
    faceColor: "#EA434A"
  },
  {
    name: "pika",
    svg: generateSVG("⬤", "⩊", ["", ""], "", "#F9CC1F", "#000000", false),
    bgColor: "#F9CC1F",
    faceColor: "black"
  },
  {
    name: "alien",
    svg: generateSVG("⬤", "ᴗ", ["⟁", "⟁"], "", "#9DFFA2", "#000000", false),
    bgColor: "#9DFFA2",
    faceColor: "black"
  },
  {
    name: "uniko",
    svg: generateSVG("•", "ᴗ", ["", ""], "", "#FFFFFF", "#000000", false),
    bgColor: "#FFFFFF",
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
      <text y="50%" font-size="24" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI" fill="#FA85CB">
        <tspan x="35%">(</tspan>
        <tspan x="43%">•</tspan>
        <tspan x="50%">ᴗ</tspan>
        <tspan x="57%">•</tspan>
        <tspan x="65%">)</tspan>
      </text>
    </svg>`,
    bgColor: "gradient white to #FFB6F9",
    faceColor: "#FA85CB"
  }
];

/**
 * NFT Generation Function
 */
export function generateUnikoNFT(seed: string) {
  // Check for ultra rare first (1% chance for demo, will be 0.1% in production)
  const ultraRareChance = Math.abs(Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 100;
  
  if (ultraRareChance === 0) {
    const ultraRareIndex = Math.abs(Array.from(seed + "ultra").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % ultraRares.length;
    return {
      ...ultraRares[ultraRareIndex],
      isUltraRare: true,
      type: "Ultra Rare"
    };
  }

  // Generate regular NFT
  const timestamp = Date.now();
  const randomOffset = Math.floor(Math.random() * 1000000);
  const baseHash = Array.from(seed + timestamp + randomOffset).reduce((acc, char) => {
    return acc + char.charCodeAt(0) + (acc << 5) - acc;
  }, 0);
  
  // Generate separate seeds for each trait
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
  
  // Generate SVG
  const svg = generateSVG(eye, mouth, cheeks, accessory, bgColor, faceColor, isRainbow);
  
  return {
    name: `Uniko #${Date.now()}`,
    svg,
    bgColor,
    faceColor,
    isUltraRare: false,
    type: "Regular",
    traits: {
      eyes: eye,
      mouth: mouth || "none",
      leftCheek: cheeks[0] || "none",
      rightCheek: cheeks[1] || "none",
      accessory: accessory || "none",
      background: bgColor,
      face: faceColor
    }
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
 * Contract Configuration (You'll need to update these when deployed)
 */
export const contractConfig = {
  address: "0x0000000000000000000000000000000000000000" as Address, // Update with your contract address
  chain: base,
  abi: [
    // Add your contract ABI here when deployed
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
      ],
      name: "mint",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
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