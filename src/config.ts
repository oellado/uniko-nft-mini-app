/**
 * Unikō NFT Configuration
 * 100% Onchain NFT Collection - Frontend only handles minting and display
 */

// Contract Configuration - V8 ENHANCED TRAIT SYSTEM
export const config = {
  CONTRACT_ADDRESS: "0x7Ed40cce63DD95B448f26A5361Bef20143e6F49a" as `0x${string}`,
  CURRENT_CHAIN: "baseSepolia" as const,
      address: "0x7Ed40cce63DD95B448f26A5361Bef20143e6F49a" as `0x${string}`,
} as const;

/**
 * Environment Configuration
 */
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Log which network we're using (helpful for debugging)
console.log(`🌐 Using ${IS_PRODUCTION ? 'MAINNET' : 'TESTNET'} - Contract: ${config.CONTRACT_ADDRESS}`);

/**
 * Import ABI from extracted file
 */
import UnikoABI from './UnikoOnchain8ABI.json';

/**
 * Smart Contract ABI - Complete UnikoOnchain8.sol ABI - PURE GENERATIVE VERSION
 */
export const CONTRACT_ABI = UnikoABI;

// NOTE: All NFT generation, traits, and metadata are now 100% onchain!
// V8 ENHANCED TRAIT SYSTEM: Advanced features with sophisticated rarities
// Features: 18 eyes, conditional cheeks, rainbow faces, premium backgrounds, 5-tier rarity

export const NETWORK_ID = 84532 // Base Sepolia
export const MINT_PRICE = "0.000001" // ETH
export const MAX_MINT_PER_TX = 10
export const VERSION = "v8-enhanced-traits" 