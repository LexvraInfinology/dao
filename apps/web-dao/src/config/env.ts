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
  'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT';

export const ACTIVE_DAO_CONTRACT_HEX =
  process.env.NEXT_PUBLIC_DAO_HEX ||
  '419031dbc5faddd365a9b3d40ddc0c550ca0f369e4';

// Chain ID (TrobChain Mainnet is 1000)
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1000', 10);

// Hardcoded Backend API URL for EQUORA DAO production service
export const BACKEND_API_URL = 'https://api.equorafidao.com';
export const NEXT_PUBLIC_API_URL = 'https://api.equorafidao.com';

// External Matrix URL (disabled for now as Matrix app code is not completed; Matrix Bridge is retained)
export const MATRIX_URL = '';

// TrobSafe APK Download URL
export const TROBSAFE_APK_URL =
  process.env.TROBSAFE_APK_URL ||
  process.env.NEXT_PUBLIC_TROBSAFE_APK_URL ||
  'https://trobium.com/download/';
