// ==============================================================================
// EQUORA MATRIX PROTOCOL — READ-ONLY SAFE WEB3 WALLET CONNECTOR
// (apps/web-matrix/lib/web3Wallet.ts)
// Strictly Read-Only: Only reads public wallet address. NO blockchain writes.
// ==============================================================================

import { setStoredUserAddress } from "./api";

export interface WalletProviderState {
  hasInjected: boolean;
  isConnecting: boolean;
  address: string | null;
  error: string | null;
}

/** Pre-configured dummy test accounts for safe local and staging simulation */
export const DUMMY_TEST_ACCOUNTS = [
  {
    name: "Operative #1 (Root Genesis)",
    address: "0x71c85d7b561e723908f9c162590214b7e8d24982",
    tier: "Tier 4 (Slots 1–4 Active)",
  },
  {
    name: "Operative #101 (Direct Team A)",
    address: "0x2A197D6E94aF4a0c8B98b835F5302E1B4F48C45a",
    tier: "Tier 2 (Slots 1–2 Active)",
  },
  {
    name: "Operative #102 (Direct Team B)",
    address: "0x6f91B5c26b6f7902E39F80C6f6fD237A33eC5588",
    tier: "Tier 1 (Slot 1 Active)",
  },
  {
    name: "Operative #103 (Direct Team C)",
    address: "0x9E758d92B5F23F2bA7a31fF64B8D14f2B2a884E9",
    tier: "Tier 1 (Slot 1 Active)",
  },
];

/** Check if MetaMask, TrustWallet, Rabby, or any EIP-1193 provider exists */
export function hasInjectedProvider(): boolean {
  if (typeof window === "undefined") return false;
  return typeof (window as any).ethereum !== "undefined";
}

/**
 * Connect to injected Web3 wallet (MetaMask, Rabby, Trust, etc.)
 * Strictly READ-ONLY identity query: only retrieves public address.
 * Zero gas, zero blockchain transactions, 100% safe.
 */
export async function connectInjectedWallet(): Promise<string> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error(
      "No Web3 browser wallet detected. Please install MetaMask, Rabby, or use a Web3 mobile browser."
    );
  }

  const ethereum = (window as any).ethereum;

  try {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts authorized in your wallet.");
    }

    const address = accounts[0].toLowerCase();
    setStoredUserAddress(address);
    return address;
  } catch (err: any) {
    if (err.code === 4001) {
      throw new Error("Wallet connection request was rejected.");
    }
    throw new Error(err.message || "Failed to connect wallet.");
  }
}

/**
 * Register listener for wallet account switches
 */
export function setupWalletListeners(
  onAccountChange: (newAddress: string) => void,
  onDisconnect: () => void
): () => void {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    return () => {};
  }

  const ethereum = (window as any).ethereum;

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      const address = accounts[0].toLowerCase();
      setStoredUserAddress(address);
      onAccountChange(address);
    } else {
      onDisconnect();
    }
  };

  ethereum.on("accountsChanged", handleAccountsChanged);

  return () => {
    if (ethereum.removeListener) {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
    }
  };
}
