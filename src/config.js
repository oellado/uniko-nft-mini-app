var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { base } from "viem/chains";
/**
 * UnikoNFT Trait Definitions
 */
export var traits = {
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
export var ultraRares = [
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
        svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"250\" height=\"250\">\n      <defs>\n        <linearGradient id=\"mochiGradient\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n          <stop offset=\"0%\" stop-color=\"#FFFFFF\"/>\n          <stop offset=\"100%\" stop-color=\"#FFB6F9\"/>\n        </linearGradient>\n      </defs>\n      <rect width=\"100%\" height=\"100%\" fill=\"url(#mochiGradient)\"/>\n      <text y=\"50%\" font-size=\"24\" text-anchor=\"middle\" dominant-baseline=\"central\" font-family=\"Segoe UI\" fill=\"#FA85CB\">\n        <tspan x=\"35%\">(</tspan>\n        <tspan x=\"43%\">\u2022</tspan>\n        <tspan x=\"50%\">\u1D17</tspan>\n        <tspan x=\"57%\">\u2022</tspan>\n        <tspan x=\"65%\">)</tspan>\n      </text>\n    </svg>",
        bgColor: "gradient white to #FFB6F9",
        faceColor: "#FA85CB"
    }
];
/**
 * NFT Generation Function
 */
export function generateUnikoNFT(seed) {
    // Check for ultra rare first (1% chance for demo, will be 0.1% in production)
    var ultraRareChance = Math.abs(Array.from(seed).reduce(function (acc, char) { return acc + char.charCodeAt(0); }, 0)) % 100;
    if (ultraRareChance === 0) {
        var ultraRareIndex = Math.abs(Array.from(seed + "ultra").reduce(function (acc, char) { return acc + char.charCodeAt(0); }, 0)) % ultraRares.length;
        return __assign(__assign({}, ultraRares[ultraRareIndex]), { isUltraRare: true, type: "Ultra Rare" });
    }
    // Generate regular NFT
    var timestamp = Date.now();
    var randomOffset = Math.floor(Math.random() * 1000000);
    var baseHash = Array.from(seed + timestamp + randomOffset).reduce(function (acc, char) {
        return acc + char.charCodeAt(0) + (acc << 5) - acc;
    }, 0);
    // Generate separate seeds for each trait
    var eyeSeed = Math.abs(baseHash * 2654435761) % 2147483647;
    var mouthSeed = Math.abs(baseHash * 3074457345) % 2147483647;
    var cheekSeed = Math.abs(baseHash * 1073741827) % 2147483647;
    var accessorySeed = Math.abs(baseHash * 5915587277) % 2147483647;
    var bgColorSeed = Math.abs(baseHash * 1500450271) % 2147483647;
    var faceColorSeed = Math.abs(baseHash * 3267000013) % 2147483647;
    var rainbowSeed = Math.abs(baseHash * 982451653) % 2147483647;
    // Eyes are guaranteed
    var eyeIndex = eyeSeed % traits.eyes.length;
    var eye = traits.eyes[eyeIndex];
    // Other traits are optional (50% chance each)
    var hasMouth = (mouthSeed % 100) < 50;
    var hasCheeks = (cheekSeed % 100) < 50;
    var hasAccessory = (accessorySeed % 100) < 50;
    var mouth = hasMouth ? traits.mouths[mouthSeed % traits.mouths.length] : '';
    var cheeks = hasCheeks ?
        traits.cheeks[cheekSeed % traits.cheeks.length].split(" ") :
        ['', ''];
    var accessory = hasAccessory ? traits.accessories[accessorySeed % traits.accessories.length] : '';
    // Colors (1% chance for rainbow background)
    var isRainbow = (rainbowSeed % 100) === 0;
    var bgColor = isRainbow ? "rainbow" : traits.backgroundColors[bgColorSeed % traits.backgroundColors.length];
    var faceColor = traits.faceColors[faceColorSeed % traits.faceColors.length];
    // Generate SVG
    var svg = generateSVG(eye, mouth, cheeks, accessory, bgColor, faceColor, isRainbow);
    return {
        name: "Uniko #".concat(Date.now()),
        svg: svg,
        bgColor: bgColor,
        faceColor: faceColor,
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
export function generatePreviewNFT() {
    var svg = generateSVG("•", "ᴗ", ["", ""], "", "#FFFFFF", "#000000", false);
    return {
        name: "Preview Uniko",
        svg: svg,
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
export function generateSVG(eye, mouth, cheeks, accessory, bgColor, faceColor, isRainbow) {
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"250\" height=\"250\">\n    ".concat(isRainbow ? "\n    <defs>\n      <linearGradient id=\"rainbowGradient\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n        <stop offset=\"0%\" stop-color=\"#B29AE1\"/>\n        <stop offset=\"20%\" stop-color=\"#F8BEF1\"/>\n        <stop offset=\"40%\" stop-color=\"#FDAFAE\"/>\n        <stop offset=\"60%\" stop-color=\"#F8CC1F\"/>\n        <stop offset=\"80%\" stop-color=\"#B9E99C\"/>\n        <stop offset=\"100%\" stop-color=\"#99E1FF\"/>\n      </linearGradient>\n    </defs>" : '', "\n    <rect width=\"100%\" height=\"100%\" fill=\"").concat(isRainbow ? 'url(#rainbowGradient)' : bgColor, "\"/>\n    <text y=\"50%\" font-size=\"20\" text-anchor=\"middle\" dominant-baseline=\"central\" font-family=\"Segoe UI\" fill=\"").concat(faceColor, "\">\n      <tspan x=\"35%\">").concat(cheeks[0], "</tspan>\n      <tspan x=\"43%\">").concat(eye, "</tspan>\n      <tspan x=\"50%\">").concat(mouth, "</tspan>\n      <tspan x=\"57%\">").concat(eye, "</tspan>\n      <tspan x=\"65%\">").concat(cheeks[1], "</tspan>\n      <tspan x=\"72%\">").concat(accessory, "</tspan>\n    </text>\n  </svg>");
}
/**
 * NFT Metadata Configuration
 */
export var mintMetadata = {
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
};
/**
 * Contract Configuration (You'll need to update these when deployed)
 */
export var contractConfig = {
    address: "0x0000000000000000000000000000000000000000", // Update with your contract address
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
    ],
};
/**
 * Farcaster Frame Embed Configuration
 */
export var embedConfig = {
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
};
/**
 * Main App Configuration
 */
export var config = __assign(__assign({}, mintMetadata), { contract: contractConfig, embed: embedConfig, traits: traits, ultraRares: ultraRares, generateUnikoNFT: generateUnikoNFT });
