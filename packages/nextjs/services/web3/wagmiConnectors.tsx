"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  trustWallet,
  oktoWallet,
} from "@rainbow-me/rainbowkit/wallets";
import scaffoldConfig from "../../scaffold.config";

const { walletConnectProjectId } = scaffoldConfig;

const walletGroups = [
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet,
      rainbowWallet,
      walletConnectWallet,
      trustWallet,
    ],
  },
];

/**
 * wagmiConnectors
 * Returns the list of wallet connectors for RainbowKit.
 * NOTE: coinbaseWallet / safeWallet removed — they pull in @coinbase/cdp-sdk
 * which has an unresolved @x402/evm/upto/client dependency.
 */
export const wagmiConnectors = connectorsForWallets(walletGroups, {
  appName: "B-TITAN",
  projectId: walletConnectProjectId,
  appDescription: "B-TITAN Web3 Matrix Platform",
  appUrl: "https://btitan.app",
  appIcon: "/logo.png",
});
