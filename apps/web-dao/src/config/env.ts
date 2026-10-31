/**
 * Centralized Environment & External Endpoints Configuration
 * All external URLs, APIs, SR addresses, and testnet endpoints are configured via environment variables.
 * Designed for seamless deployment on Vercel and local development with safe fallbacks.
 */

// Official WhatsApp Community Group Invite URL
export const WHATSAPP_DAO_GROUP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_DAO_GROUP_URL ||
  'https://chat.whatsapp.com/CncHdH2u76s95lRSURuKaW?s=cl&p=a&mlu=4&ilr=4';

const isBrowserMainnet = typeof window !== 'undefined' && (
  window.location.hostname.includes('equorafidao.com') ||
  window.location.hostname.includes('equorafimatrix.com')
);
const rawMainnetEnv = process.env.NEXT_PUBLIC_IS_MAINNET ?? process.env.IS_MAINNET;
export const IS_MAINNET = isBrowserMainnet || (rawMainnetEnv !== undefined
  ? (String(rawMainnetEnv).trim().toLowerCase() === 'true' || String(rawMainnetEnv).trim() === '1')
  : (process.env.NEXT_PUBLIC_TARGET_NETWORK || process.env.TARGET_NETWORK || 'mainnet').trim().toLowerCase() === 'mainnet');

export const TARGET_NETWORK = IS_MAINNET ? 'mainnet' : 'testnet';
export const NETWORK_NAME = IS_MAINNET ? 'TrobChain Mainnet' : 'TrobChain Testnet';

// Trobium Explorer Web URL
export const EXPLORER_BASE_URL = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_EXPLORER_URL ||
      (process.env.NEXT_PUBLIC_EXPLORER_URL && !process.env.NEXT_PUBLIC_EXPLORER_URL.includes("testnet")
        ? process.env.NEXT_PUBLIC_EXPLORER_URL
        : 'https://trobchain.com'))
  : (process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL ||
      process.env.NEXT_PUBLIC_EXPLORER_URL ||
      'https://testnet.trobchain.com');

// Trobium Explorer Backend REST API URL (account transactions, detail lookup)
export const EXPLORER_API_URL = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_EXPLORER_API_URL ||
      (process.env.NEXT_PUBLIC_EXPLORER_API_URL && !process.env.NEXT_PUBLIC_EXPLORER_API_URL.includes("testnet")
        ? process.env.NEXT_PUBLIC_EXPLORER_API_URL
        : 'https://backend.trobchain.com/v1'))
  : (process.env.NEXT_PUBLIC_TESTNET_EXPLORER_API_URL ||
      process.env.NEXT_PUBLIC_EXPLORER_API_URL ||
      'https://testnet-backend.trobchain.com/v1');

// Fullnode RPC Node URL (wallet/getaccount, triggersmartcontract, createtransaction)
export const FULLNODE_RPC_URL = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_RPC_URL ||
      (process.env.NEXT_PUBLIC_RPC_URL && !process.env.NEXT_PUBLIC_RPC_URL.includes("testnet")
        ? process.env.NEXT_PUBLIC_RPC_URL
        : 'https://fullnode-one.trobchain.com'))
  : (process.env.NEXT_PUBLIC_TESTNET_RPC_URL ||
      process.env.NEXT_PUBLIC_RPC_URL ||
      'https://fullnode-one-testnet.trobchain.com');

// Live TROB Market Price API URL
export const TROB_PRICE_API_URL = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_TROB_PRICE_API_URL ||
      (process.env.NEXT_PUBLIC_TROB_PRICE_API_URL && !process.env.NEXT_PUBLIC_TROB_PRICE_API_URL.includes("testnet")
        ? process.env.NEXT_PUBLIC_TROB_PRICE_API_URL
        : 'https://backend.trobchain.com/v1/market/price'))
  : (process.env.NEXT_PUBLIC_TESTNET_TROB_PRICE_API_URL ||
      process.env.NEXT_PUBLIC_TROB_PRICE_API_URL ||
      'https://testnet-backend.trobchain.com/v1/market/price');

// Official Super Representative (SR) Addresses for Governance Staking & Voting
export const OFFICIAL_SR_TESTNET =
  process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS ||
  'TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5';

export const OFFICIAL_SR_MAINNET =
  process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS ||
  'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY';

export const OFFICIAL_SR = IS_MAINNET ? OFFICIAL_SR_MAINNET : OFFICIAL_SR_TESTNET;

// DAO Contract Address & Hex (Strictly Network Guarded)
export const ACTIVE_DAO_CONTRACT_ADDRESS = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_DAO_ADDRESS ||
      (process.env.NEXT_PUBLIC_DAO_ADDRESS && process.env.NEXT_PUBLIC_DAO_ADDRESS !== 'THMpusD2dp3icewyNQRWF64k4r2rJypE57'
        ? process.env.NEXT_PUBLIC_DAO_ADDRESS
        : null) ||
      process.env.NEXT_PUBLIC_EQUORA_DAO_ADDRESS ||
      'THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V')
  : (process.env.NEXT_PUBLIC_TESTNET_DAO_ADDRESS ||
      process.env.NEXT_PUBLIC_DAO_ADDRESS ||
      process.env.NEXT_PUBLIC_EQUORA_DAO_ADDRESS ||
      'THMpusD2dp3icewyNQRWF64k4r2rJypE57');

export const ACTIVE_DAO_CONTRACT_HEX = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_DAO_HEX || process.env.NEXT_PUBLIC_DAO_HEX || '0x51114b92df6041f5a0e7ebc13e6ed68298fd28b0')
  : (process.env.NEXT_PUBLIC_TESTNET_DAO_HEX || process.env.NEXT_PUBLIC_DAO_HEX || '0x511002195c1808843d3e45899cc53977dcc01c50');

// Matrix Contract Address (Strictly Network Guarded)
export const ACTIVE_MATRIX_CONTRACT_ADDRESS = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_MATRIX_ADDRESS ||
      (process.env.NEXT_PUBLIC_MATRIX_ADDRESS && process.env.NEXT_PUBLIC_MATRIX_ADDRESS !== 'TJTgouvq6T6eMNr6d2xfJmzS646bG1MoSL'
        ? process.env.NEXT_PUBLIC_MATRIX_ADDRESS
        : null) ||
      'TNjaJr6pHV2uBkBG9sDGtuxo4AAzqHBCJi')
  : (process.env.NEXT_PUBLIC_TESTNET_MATRIX_ADDRESS ||
      process.env.NEXT_PUBLIC_MATRIX_ADDRESS ||
      'TJTgouvq6T6eMNr6d2xfJmzS646bG1MoSL');

// Chain ID (Supports 1000, 1001 or custom)
export const CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID || process.env.CHAIN_ID || '1000',
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
