/**
 * Unikō NFT Configuration
 * 100% Onchain NFT Collection - Frontend only handles minting and display
 */

// Contract Configuration - DUAL-CONTRACT SYSTEM (V7 FIXED TRAITS)
export const config = {
  contractAddress: "0x6Aa08b3FA75C395c8cbD23f235992EfedF3A8183" as `0x${string}`,
  CURRENT_CHAIN: "baseSepolia" as const,
} as const;

/**
 * Environment Configuration
 */
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Log which network we're using (helpful for debugging)
console.log(`🌐 Using ${IS_PRODUCTION ? 'MAINNET' : 'TESTNET'} - Contract: ${config.contractAddress}`);

/**
 * Import ABI from extracted file
 */
import UnikoABI from './Uniko_01ABI.json';

/**
 * Smart Contract ABI - Complete Uniko_01.sol ABI - DUAL-CONTRACT SYSTEM
 */
export const CONTRACT_ABI = UnikoABI;

// NOTE: All NFT generation, traits, and metadata are now 100% onchain!
// DUAL-CONTRACT SYSTEM: Revolutionary 39% size reduction while preserving all V8 functionality
// Features: 19 eyes (including ō), special mouth rarities (◠ 1%, ⌓ 2%), monocle, rainbow faces, sakura gradient, allowlist/public phases

export const NETWORK_ID = 84532 // Base Sepolia
export const MINT_PRICE = "0.000001" // ETH (fallback only - prices now read from contract)
export const MAX_MINT_PER_TX = 10
export const VERSION = "dual-contract-v7-fixed-traits" 