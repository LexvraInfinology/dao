"use client";

import "./idbPatch";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  tokenPocketWallet,
  rainbowWallet,
  walletConnectWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import scaffoldConfig from "../../scaffold.config";

const { walletConnectProjectId } = scaffoldConfig;

// Only include walletConnectWallet if a valid project ID is configured (avoid placeholder loop)
const isPlaceholderId =
  !walletConnectProjectId ||
  walletConnectProjectId === "7663d51173c43f7ad40158edb7e88859" ||
  walletConnectProjectId === "3a8170812b534d0ff9d794f19a901d64";

const wallets = isPlaceholderId
  ? [injectedWallet, metaMaskWallet, tokenPocketWallet, trustWallet, rainbowWallet]
  : [injectedWallet, metaMaskWallet, tokenPocketWallet, trustWallet, rainbowWallet, walletConnectWallet];

const walletGroups = [
  {
    groupName: "Recommended",
    wallets,
  },
];

const appUrl =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

/**
 * wagmiConnectors
 * Configures wallet connectors using direct subpath imports to avoid bundling
 * heavy third-party SDKs (@coinbase/wallet-sdk, @base-org/account, @safe-global).
 */
export const wagmiConnectors = connectorsForWallets(walletGroups, {
  appName: "EQUORA_Fi",
  projectId: walletConnectProjectId,
  appDescription: "EQUORA_Fi Autonomous Web3 Protocol",
  appUrl,
  appIcon: "/logo.png",
});

