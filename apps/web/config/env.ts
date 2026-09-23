/**
 * Centralized Environment & Site Configuration for apps/web
 * ==============================================================================
 * All environment variables are typed and accessed here.
 * NEVER hardcode URLs, contract addresses, or domain names in UI components.
 * ==============================================================================
 */

export const siteConfig = {
  // URLs & Domains
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  matrixDomain:
    process.env.NEXT_PUBLIC_MATRIX_DOMAIN || "equorafi.com",
  daoDomain:
    process.env.NEXT_PUBLIC_DAO_DOMAIN || "equorafidao.com",
  matrixUrl:
    process.env.NEXT_PUBLIC_MATRIX_URL || "https://equorafi.com",
  daoUrl:
    process.env.NEXT_PUBLIC_DAO_URL || "https://equorafidao.com",

  // Web3 & Network Configuration
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "7663d51173c43f7ad40158edb7e88859",
  targetNetwork:
    process.env.NEXT_PUBLIC_TARGET_NETWORK || "hardhat",
  chainId:
    parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337", 10),
  rpcUrl:
    process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545",
} as const;
