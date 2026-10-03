/**
 * Centralized Environment & External Endpoints Configuration
 * All external URLs, APIs, SR addresses, and testnet endpoints are configured via environment variables.
 * Designed for seamless deployment on Vercel and local development with safe fallbacks.
 */

// Official WhatsApp Community Group Invite URL
export const WHATSAPP_DAO_GROUP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_DAO_GROUP_URL ||
  'https://chat.whatsapp.com/GR19373Pgq7LezBKtXC0ng';

// Trobium Explorer Web URL
export const EXPLORER_BASE_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL ||
  'https://trobchain.com';

// Trobium Explorer Backend REST API URL (account transactions, detail lookup)
export const EXPLORER_API_URL =
  process.env.NEXT_PUBLIC_EXPLORER_API_URL ||
  process.env.TROB_BACKEND_EXPLORER_API_URL ||
  'https://backend.trobchain.com/v1';

// Fullnode RPC Node URL (wallet/getaccount, triggersmartcontract, createtransaction)
export const FULLNODE_RPC_URL =
  process.env.FULLNODE_URL ||
  process.env.RPC_URL ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  'https://fullnode-one.trobchain.com';

// Live TROB Market Price API URL
export const TROB_PRICE_API_URL =
  process.env.TROB_PRICE_API_URL ||
  process.env.NEXT_PUBLIC_TROB_PRICE_API_URL ||
  'https://backend.trobchain.com/v1/market/price';

// Official Super Representative (SR) Addresses for Governance Staking & Voting
export const OFFICIAL_SR_TESTNET =
  process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS ||
  'TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5';

export const OFFICIAL_SR_MAINNET =
  process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS ||
  'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY';

// DAO Contract Address & Hex
export const ACTIVE_DAO_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_DAO_ADDRESS ||
  process.env.NEXT_PUBLIC_EQUORA_DAO_ADDRESS ||
  'TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto';

export const ACTIVE_DAO_CONTRACT_HEX =
  process.env.NEXT_PUBLIC_DAO_HEX ||
  '0x0a59d6a2dcd3b18687c1efe1625642ad85679377';

// External Matrix URL (configurable via env only, no hardcoded live URL)
export const MATRIX_URL = process.env.NEXT_PUBLIC_MATRIX_URL || '';

// TrobSafe APK Download URL
export const TROBSAFE_APK_URL =
  process.env.TROBSAFE_APK_URL ||
  process.env.NEXT_PUBLIC_TROBSAFE_APK_URL ||
  'https://trobium.com/download/';
