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
  // - Use [chains.hardhat] during development
  // - Use [chains.bscTestnet] for staging
  // - Use [chains.bsc] for mainnet
  targetNetworks: [chains.hardhat],

  // Polling interval for reading contract data (ms)
  pollingInterval: 30000,

  // Alchemy API key (optional — for mainnet/testnet RPC)
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "",

  // WalletConnect Project ID — get from https://cloud.walletconnect.com/
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only use local burner wallets in development
  onlyLocalBurnerWallet: true,
});

export default scaffoldConfig;
