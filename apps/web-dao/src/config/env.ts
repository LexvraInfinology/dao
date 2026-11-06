/**
 * Centralized Environment & External Endpoints Configuration
 * All external URLs, APIs, SR addresses, and testnet endpoints are configured via environment variables.
 * Designed for seamless deployment on Vercel and local development with safe fallbacks.
 */

// Official WhatsApp Community Group Invite URL
export const WHATSAPP_DAO_GROUP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_DAO_GROUP_URL ||
  'https://chat.whatsapp.com/CncHdH2u76s95lRSURuKaW?s=cl&p=a&mlu=4&ilr=4';

export const IS_MAINNET =
  process.env.NEXT_PUBLIC_IS_MAINNET === 'true' ||
  process.env.IS_MAINNET === 'true';

export const TARGET_NETWORK = IS_MAINNET ? 'mainnet' : 'testnet';
export const NETWORK_NAME = IS_MAINNET ? 'TrobChain Mainnet' : 'TrobChain Testnet';

// Trobium Explorer Web URL
export const EXPLORER_BASE_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL ||
  (IS_MAINNET ? 'https://trobchain.com' : 'https://testnet.trobchain.com');

// Trobium Explorer Backend REST API URL (account transactions, detail lookup)
export const EXPLORER_API_URL =
  process.env.NEXT_PUBLIC_EXPLORER_API_URL ||
  (IS_MAINNET ? 'https://backend.trobchain.com/v1' : 'https://testnet-backend.trobchain.com/v1');

// Fullnode RPC Node URL (wallet/getaccount, triggersmartcontract, createtransaction)
export const FULLNODE_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.RPC_URL ||
  process.env.FULLNODE_URL ||
  (IS_MAINNET ? 'https://fullnode-one.trobchain.com' : 'https://fullnode-one-testnet.trobchain.com');

// Live TROB Market Price API URL
export const TROB_PRICE_API_URL =
  process.env.NEXT_PUBLIC_TROB_PRICE_API_URL ||
  process.env.TROB_PRICE_API_URL ||
  'https://backend.trobchain.com/v1/market/price';

// Official Super Representative (SR) Addresses for Governance Staking & Voting
export const OFFICIAL_SR_MAINNET =
  process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS || 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY';

export const OFFICIAL_SR_TESTNET =
  process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS || 'TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5';

export const OFFICIAL_SR = IS_MAINNET ? OFFICIAL_SR_MAINNET : OFFICIAL_SR_TESTNET;

// DAO Contract Address & Hex (TrobChain Testnet by default)
export const ACTIVE_DAO_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_DAO_ADDRESS ||
  (IS_MAINNET ? 'TLvBFwu7bakVPBTS9GfBmkeLZVkQ4UpXhf' : 'TP8PVXguepBjLwvuS6TmCC1nuXbjM6UEau');

export const ACTIVE_DAO_CONTRACT_HEX =
  process.env.NEXT_PUBLIC_DAO_HEX ||
  (IS_MAINNET ? '417816ae352da7d1a806eea8446aebbe551420429b' : '41905622dd4a442843a9ff8238c9c7a8cb5d61a1f1');

// Matrix Contract Address (TrobChain Testnet by default)
export const ACTIVE_MATRIX_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_MATRIX_ADDRESS ||
  (IS_MAINNET ? 'TSRv5fcx5RFLyoPjhBc3MKuaQQdbCintEx' : 'TXiYqDTWp3m7EFtAA7f5CBUaPEZNdU36GJ');

// Vault Contract Address (TrobChain Testnet by default)
export const ACTIVE_VAULT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
  (IS_MAINNET ? 'TKGvMuxfwy31qHYi4cNNJK184d8vT9E2L9' : 'TESBwN1LgNQobMML7PkQhYS6P9M5UV5qvs');

// Registry Contract Address (TrobChain Testnet by default)
export const ACTIVE_REGISTRY_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  (IS_MAINNET ? 'TVpGmrzHpmbP7hY7pyEYBUtNpzEjPcpr7T' : 'TGqsxzj8QCLT5SMHy48kGvjSDVo58Dahmq');

// Token Contract Address (TrobChain Testnet by default)
export const ACTIVE_TOKEN_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
  (IS_MAINNET ? 'TR94a7NtVh2wrTvUVojd8g4MBWnUsrW4p8' : 'TR94a7NtVh2wrTvUVojd8g4MBWnUsrW4p8');

// Chain ID (1001 for Testnet, 1000 for Mainnet)
export const CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID || process.env.CHAIN_ID || (IS_MAINNET ? '1000' : '1001'),
  10
);

// Backend API Host, Port & URLs with Docker and local dev fallbacks (Backend port 4000, Web port 3000)
export const BACKEND_API_PORT = parseInt(process.env.API_PORT || process.env.BACKEND_API_PORT || '4000', 10);
export const WEB_PORT = parseInt(process.env.WEB_PORT || process.env.PORT || '3000', 10);
export const BACKEND_API_HOST = process.env.API_HOST || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'localhost:4000' : 'api.equorafidao.com');
export const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:4000'
    : 'https://api.equorafidao.com');
export const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : 'https://api.equorafidao.com');

// External URLs (Port 3001: equorafimatrix.com, Port 3000: equorafidao.com)
export const MATRIX_URL =
  process.env.NEXT_PUBLIC_MATRIX_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : 'https://equorafimatrix.com');

export const DAO_URL =
  process.env.NEXT_PUBLIC_DAO_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin
    : 'https://equorafidao.com');

// TrobSafe APK Download URL
export const TROBSAFE_APK_URL =
  process.env.TROBSAFE_APK_URL ||
  process.env.NEXT_PUBLIC_TROBSAFE_APK_URL ||
  'https://trobium.com/download/';
