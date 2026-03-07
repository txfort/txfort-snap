/**
 * Chain ID Mapping Utilities
 * Converts MetaMask CAIP-2 chain IDs to TxFort chain names
 */

import type { SupportedChain, ChainMapping } from '../types';

/**
 * Mapping from CAIP-2 chain IDs to TxFort chain names
 * CAIP-2 format: namespace:reference
 * - EIP155 namespace for EVM chains (reference is chain ID in decimal)
 */
export const CHAIN_MAPPING: ChainMapping = {
  // Ethereum Mainnet
  'eip155:1': 'ethereum',
  // Ethereum Goerli Testnet
  'eip155:5': 'ethereum',
  // Ethereum Sepolia Testnet
  'eip155:11155111': 'ethereum',
  
  // Polygon Mainnet
  'eip155:137': 'polygon',
  // Polygon Mumbai Testnet
  'eip155:80001': 'polygon',
  // Polygon Amoy Testnet
  'eip155:80002': 'polygon',
  
  // BSC Mainnet
  'eip155:56': 'bsc',
  // BSC Testnet
  'eip155:97': 'bsc',
  
  // Tron Mainnet
  'tron:mainnet': 'tron',
  // Tron Shasta Testnet
  'tron:shasta': 'tron',
};

/**
 * Convert a CAIP-2 chain ID to TxFort chain name
 */
export function caip2ToChainName(caip2Id: string): SupportedChain {
  const normalizedId = caip2Id.toLowerCase();
  const chain = CHAIN_MAPPING[normalizedId];
  
  if (!chain) {
    console.warn(`Unknown chain ID: ${caip2Id}, defaulting to ethereum`);
    return 'ethereum';
  }
  
  return chain;
}

/**
 * Get a human-readable chain name
 */
export function getChainDisplayName(chain: SupportedChain): string {
  const displayNames: Record<SupportedChain, string> = {
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    bsc: 'BNB Smart Chain',
    tron: 'Tron',
  };
  
  return displayNames[chain] || chain;
}

/**
 * Check if a chain is supported
 */
export function isChainSupported(caip2Id: string): boolean {
  const normalizedId = caip2Id.toLowerCase();
  return normalizedId in CHAIN_MAPPING;
}

/**
 * Get chain info from CAIP-2 ID
 */
export function getChainInfo(caip2Id: string): {
  name: SupportedChain;
  displayName: string;
  isSupported: boolean;
} {
  const name = caip2ToChainName(caip2Id);
  const isSupported = isChainSupported(caip2Id);
  
  return {
    name,
    displayName: getChainDisplayName(name),
    isSupported,
  };
}