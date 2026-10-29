/**
 * Trobium Blockchain Explorer URL utilities.
 * Default official explorer: https://testnet.trobchain.com
 */

import { EXPLORER_BASE_URL } from '@/config/env';

export const DEFAULT_EXPLORER_URL = EXPLORER_BASE_URL;

export function getExplorerBaseUrl(): string {
  return EXPLORER_BASE_URL.replace(/\/+$/, '');
}

/**
 * Returns the explorer URL for a given transaction hash.
 * If the hash is missing or not a valid on-chain hash, safely falls back
 * to the explorer's transactions index page.
 */
export function getExplorerTxUrl(txHash?: string | null): string {
  const base = getExplorerBaseUrl();
  if (!txHash) {
    return `${base}/blockchain/transactions`;
  }

  const clean = txHash.trim();
  // Filter out internal mock IDs (e.g. 0x_claim, seat-act-1, etc.)
  if (clean.startsWith('0x_') || clean.length < 10) {
    return `${base}/blockchain/transactions`;
  }

  // Trobium Explorer route: /blockchain/transaction/:hash
  return `${base}/blockchain/transaction/${encodeURIComponent(clean)}`;
}

/**
 * Returns the explorer URL for a given wallet or contract address.
 * If the address is missing, safely falls back to the accounts index page.
 */
export function getExplorerAddressUrl(address?: string | null): string {
  const base = getExplorerBaseUrl();
  if (!address) {
    return `${base}/blockchain/accounts`;
  }

  let clean = address.trim();
  // Strip trailing label annotations like ' (You)'
  clean = clean.replace(/\s*\(You\)$/i, '').trim();

  if (!clean || clean === '—' || clean === '-') {
    return `${base}/blockchain/accounts`;
  }

  // Trobium Explorer route: /blockchain/account/:address
  return `${base}/blockchain/account/${encodeURIComponent(clean)}`;
}

/**
 * Returns the explorer URL for a given block number.
 */
export function getExplorerBlockUrl(blockNumber?: number | string | null): string {
  const base = getExplorerBaseUrl();
  if (blockNumber === undefined || blockNumber === null || blockNumber === '') {
    return `${base}/blockchain/blocks`;
  }
  return `${base}/blockchain/block/blockdetails/${encodeURIComponent(String(blockNumber))}`;
}
