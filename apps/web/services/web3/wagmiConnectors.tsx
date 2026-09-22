"use client";

import "./idbPatch";
import {
  connectorsForWallets,
  type Wallet,
  type WalletDetailsParams,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  tokenPocketWallet,
  rainbowWallet,
  walletConnectWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { injected } from "wagmi/connectors";
import { createConnector } from "wagmi";
import scaffoldConfig from "../../scaffold.config";

const { walletConnectProjectId } = scaffoldConfig;

/**
 * smartMetaMaskWallet
 * Uses Wagmi's direct injected connector to interface with the MetaMask browser extension.
 * This completely eliminates @metamask/sdk overhead, preventing:
 *  - `Invalid dappMetadata.iconUrl` validation errors
 *  - Desktop `metamask://connect` mobile deep link failures
 */
const smartMetaMaskWallet = ({ projectId, walletConnectParameters }: any): Wallet => {
  const defaultWallet = metaMaskWallet({ projectId, walletConnectParameters });
  return {
    ...defaultWallet,
    createConnector: (walletDetails: WalletDetailsParams) => {
      return createConnector((config) => {
        const injectedConn = injected({
          target: () => {
            if (typeof window === "undefined") return undefined;
            const eth = (window as any).ethereum;
            if (!eth) return undefined;
            if (Array.isArray(eth.providers)) {
              const mm = eth.providers.find((p: any) => p.isMetaMask);
              if (mm) return { id: "metaMask", name: "MetaMask", provider: mm };
            }
            return { id: "metaMask", name: "MetaMask", provider: eth };
          },
        })(config);

        return {
          ...injectedConn,
          ...walletDetails,
        };
      });
    },
  };
};

// Only include walletConnectWallet if a valid project ID is configured (avoid placeholder loop)
const isPlaceholderId =
  !walletConnectProjectId ||
  walletConnectProjectId === "7663d51173c43f7ad40158edb7e88859" ||
  walletConnectProjectId === "3a8170812b534d0ff9d794f19a901d64";

const wallets = isPlaceholderId
  ? [smartMetaMaskWallet, injectedWallet, tokenPocketWallet, trustWallet, rainbowWallet]
  : [smartMetaMaskWallet, injectedWallet, tokenPocketWallet, trustWallet, rainbowWallet, walletConnectWallet];

const walletGroups = [
  {
    groupName: "Recommended",
    wallets,
  },
];

const appUrl =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const appIcon = `${appUrl}/assets/branding/equorafilogo-removebg-preview.png`;

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
  appIcon,
});


