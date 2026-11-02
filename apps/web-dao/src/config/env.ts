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
  (IS_MAINNET ? 'https://backend.trobchain.com/v1/market/price' : 'https://testnet-backend.trobchain.com/v1/market/price');

// Official Super Representative (SR) Addresses for Governance Staking & Voting
export const OFFICIAL_SR_MAINNET =
  process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS || 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY';

export const OFFICIAL_SR_TESTNET =
  process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS || 'TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5';

export const OFFICIAL_SR = IS_MAINNET ? OFFICIAL_SR_MAINNET : OFFICIAL_SR_TESTNET;

// DAO Contract Address & Hex (TrobChain Testnet by default)
export const ACTIVE_DAO_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_DAO_ADDRESS ||
  (IS_MAINNET ? 'TJRYjqygAEUcrcB2WkgizGFPYeBmyhDqM2' : 'TVBLDggu9VULMQnxucjftLgg6QfAKN5rUW');

export const ACTIVE_DAO_CONTRACT_HEX =
  process.env.NEXT_PUBLIC_DAO_HEX ||
  (IS_MAINNET ? '419031dbc5faddd365a9b3d40ddc0c550ca0f369e4' : '41d2b5680da9913bdc7ebe8a00ed419ecb60b669c5');

// Matrix Contract Address (TrobChain Testnet by default)
export const ACTIVE_MATRIX_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_MATRIX_ADDRESS ||
  (IS_MAINNET ? 'TQuf5qo6EdRYDdEihbfbj51yo6rtzQCkCV' : 'TNU8aUC8H8osyfhr2TnNzNNEMZPtGV4D8o');

// Vault Contract Address (TrobChain Testnet by default)
export const ACTIVE_VAULT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
  (IS_MAINNET ? 'TUZjyaLc1TghdoccJWTKhoBcEU12AG327J' : 'TXn5f6qg8egX1fww3aUAfrpoM3K91Lpq3Q');

// Registry Contract Address (TrobChain Testnet by default)
export const ACTIVE_REGISTRY_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  (IS_MAINNET ? 'TNxk5Uguc16mxReUjXHDctKj12Y3MUSQZj' : 'TDeTkVTHDv8i9aHi1eZBMUPSvuReypxAw1');

// Token Contract Address (TrobChain Testnet by default)
export const ACTIVE_TOKEN_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
  (IS_MAINNET ? 'TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn' : 'TMg7ZffXNkopbA5KWsq8vUFW5oL5ZqKPbx');

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
