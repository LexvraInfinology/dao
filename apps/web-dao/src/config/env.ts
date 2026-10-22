/**
 * Centralized Environment & External Endpoints Configuration
 * All external URLs, APIs, SR addresses, and testnet endpoints are configured via environment variables.
 * Designed for seamless deployment on Vercel and local development with safe fallbacks.
 */

// Official WhatsApp Community Group Invite URL
export const WHATSAPP_DAO_GROUP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_DAO_GROUP_URL ||
  'https://chat.whatsapp.com/CncHdH2u76s95lRSURuKaW?s=cl&p=a&mlu=4&ilr=4';

export const TARGET_NETWORK = (
  process.env.NEXT_PUBLIC_TARGET_NETWORK ||
  process.env.TARGET_NETWORK ||
  'testnet'
).toLowerCase();

export const IS_MAINNET = TARGET_NETWORK === 'mainnet';
export const NETWORK_NAME = IS_MAINNET ? 'TrobChain Mainnet' : 'TrobChain Testnet';

// Trobium Explorer Web URL
export const EXPLORER_BASE_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL ||
  (IS_MAINNET ? 'https://trobchain.com' : 'https://testnet.trobchain.com');

// Trobium Explorer Backend REST API URL (account transactions, detail lookup)
export const EXPLORER_API_URL =
  process.env.NEXT_PUBLIC_EXPLORER_API_URL ||
  process.env.TROB_BACKEND_EXPLORER_API_URL ||
  (IS_MAINNET ? 'https://backend.trobchain.com/v1' : 'https://testnet-backend.trobchain.com/v1');

// Fullnode RPC Node URL (wallet/getaccount, triggersmartcontract, createtransaction)
export const FULLNODE_RPC_URL =
  process.env.FULLNODE_URL ||
  process.env.RPC_URL ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  (IS_MAINNET ? 'https://fullnode-one.trobchain.com' : 'https://fullnode-one-testnet.trobchain.com');

// Live TROB Market Price API URL
export const TROB_PRICE_API_URL =
  process.env.TROB_PRICE_API_URL ||
  process.env.NEXT_PUBLIC_TROB_PRICE_API_URL ||
  (IS_MAINNET ? 'https://backend.trobchain.com/v1/market/price' : 'https://testnet-backend.trobchain.com/v1/market/price');

// Official Super Representative (SR) Addresses for Governance Staking & Voting
export const OFFICIAL_SR_TESTNET =
  process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS ||
  'TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5';

export const OFFICIAL_SR_MAINNET =
  process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS ||
  'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY';

export const OFFICIAL_SR = IS_MAINNET ? OFFICIAL_SR_MAINNET : OFFICIAL_SR_TESTNET;

// DAO Contract Address & Hex
export const ACTIVE_DAO_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_DAO_ADDRESS ||
  process.env.NEXT_PUBLIC_EQUORA_DAO_ADDRESS ||
  (IS_MAINNET ? 'TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto' : 'TLXYmgeyBpUQJaSh5LuumrufaQs6GmrGqz');

export const ACTIVE_DAO_CONTRACT_HEX =
  process.env.NEXT_PUBLIC_DAO_HEX ||
  (IS_MAINNET ? '0x0a59d6a2dcd3b18687c1efe1625642ad85679377' : '0x7623910543e34346067b5e40854497b095ce8ca0');

// Chain ID (Supports 1000, 1001 or custom)
export const CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID || process.env.CHAIN_ID || '1000',
  10
);

// Backend API Host, Port & URLs with Docker and local dev fallbacks (Backend port 4000, Web port 3000)
export const BACKEND_API_PORT = parseInt(process.env.API_PORT || process.env.BACKEND_API_PORT || '4000', 10);
export const WEB_PORT = parseInt(process.env.WEB_PORT || process.env.PORT || '3000', 10);
export const BACKEND_API_HOST = process.env.API_HOST || 'api.equorafidao.com';
export const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.equorafidao.com';
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.equorafidao.com';

// External Matrix URL (disabled for now as Matrix app code is not completed; Matrix Bridge is retained)
export const MATRIX_URL = '';

// TrobSafe APK Download URL
export const TROBSAFE_APK_URL =
  process.env.TROBSAFE_APK_URL ||
  process.env.NEXT_PUBLIC_TROBSAFE_APK_URL ||
  'https://trobium.com/download/';
