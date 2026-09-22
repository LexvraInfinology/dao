import { defineChain } from "viem";
import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

const defineConfig = (config: ScaffoldConfig) => config;

const scaffoldConfig = defineConfig({
  // Which chains to target:
  // - Hardhat (31337) for local testing
  // - BSC Testnet (97) for staging
  // - BSC Mainnet (56) for production
  targetNetworks: [chains.hardhat, chains.bscTestnet, chains.bsc],

  // Polling interval for reading contract data (ms)
  pollingInterval: 15000,

  // Alchemy / Infura API key (optional)
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "",

  // Reown (WalletConnect) Project ID
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "7663d51173c43f7ad40158edb7e88859",

  // Only use local burner wallets in development
  onlyLocalBurnerWallet: false,
});

export default scaffoldConfig;
