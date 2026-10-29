// ==============================================================================
// EQUORA MATRIX PROTOCOL — WEB3 WALLET CONNECTOR (apps/web-matrix/lib/web3Wallet.ts)
// Supports TrobSafe (TrobChain native L1) for Chrome Extension, Android APK & iOS.
// Matches the exact wallet detection & connection standard of the DAO platform.
// Preserves sandbox test accounts for zero-risk local / offline simulation.
// ==============================================================================

import { setStoredUserAddress, clearStoredUserAddress } from "./api";
import { toHexAddress } from "./contracts";
import { wakeUpExtension } from "./walletConnect";

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

/**
 * Retrieves the TrobSafe provider across all supported environments:
 * - Chrome / Brave extension (window.trobSafe, window.tronWeb, window.trobWeb)
 * - Android APK WebView (window.trob, window.trobsafe, window.trobLink)
 * - iOS TestFlight / Mobile Bridge (window.__trobsafeBridge, window.trobium)
 */
export function getTrobSafeProvider(): any {
  if (typeof window === "undefined") return null;
  const w = window as any;

  // 1. Direct window properties (case variations and mobile app webview aliases)
  const direct =
    w.trobSafe ||
    w.trobsafe ||
    w.TrobSafe ||
    w.trob ||
    w.trobWeb ||
    w.trobLink ||
    w.troblink ||
    w.trobkit ||
    w.trobium ||
    w.trobiumWeb ||
    w.tronWeb ||
    w.tronLink ||
    w.trobSafeWallet ||
    w.trobProvider ||
    null;

  if (direct) return direct;

  // 2. Check window.ethereum or multi-provider arrays if marked as trobsafe/trob
  if (w.ethereum) {
    if (w.ethereum.isTrobSafe || w.ethereum.isTrob || w.ethereum.isTrobium) {
      return w.ethereum;
    }
    if (Array.isArray(w.ethereum.providers)) {
      const found = w.ethereum.providers.find(
        (p: any) => p.isTrobSafe || p.isTrob || p.isTrobium
      );
      if (found) return found;
    }
  }

  // 3. EIP-6963 announced provider
  if (w.__eip6963TrobProvider) {
    return w.__eip6963TrobProvider;
  }

  // 4. In-page bridge attribute or global bridge flag
  if (w.__trobsafeBridge) {
    return w;
  }
  if (typeof document !== "undefined" && document.documentElement?.hasAttribute("data-trobsafe-inpage")) {
    return w;
  }

  return null;
}

/** Check if TrobSafe provider exists across Chrome Extension, Android WebView, or iOS Bridge */
export function hasTrobSafeProvider(): boolean {
  if (typeof window === "undefined") return false;
  if (getTrobSafeProvider()) return true;
  const w = window as any;
  if (w.__trobsafeBridge) return true;
  if (typeof document !== "undefined" && document.documentElement?.hasAttribute("data-trobsafe-inpage")) return true;
  return false;
}

/**
 * Detects if a foreign/incompatible Web3 wallet is present (e.g. MetaMask, Phantom, Coinbase Wallet).
 * Equora Protocol exclusively uses TrobSafe for TrobChain Layer-1 transactions.
 */
export function getIncompatibleForeignWallet(): string | null {
  if (typeof window === "undefined") return null;
  if (hasTrobSafeProvider()) return null; // TrobSafe is present
  const w = window as any;
  if (w.ethereum?.isMetaMask) return "MetaMask";
  if (w.ethereum?.isPhantom || w.phantom) return "Phantom";
  if (w.ethereum?.isCoinbaseWallet) return "Coinbase Wallet";
  if (w.ethereum?.isRabby) return "Rabby Wallet";
  if (w.tronLink?.isTronLink && !w.trobSafe) return "TronLink (Foreign Tron Network)";
  if (w.ethereum) return "Incompatible EVM Wallet";
  return null;
}

/** Check if injected provider exists (TrobSafe is the exclusive provider) */
export function hasInjectedProvider(): boolean {
  return hasTrobSafeProvider();
}

/**
 * Normalizes an address from either Base58, Tron 41-hex, or JSON storage into canonical 0x hex
 */
export function normalizeTo0x(raw: string): string {
  if (!raw) return "";
  let clean = String(raw).trim();
  if (clean.startsWith("{")) {
    try {
      const parsed = JSON.parse(clean);
      if (parsed.hex) return normalizeTo0x(parsed.hex);
      if (parsed.base58) return normalizeTo0x(parsed.base58);
    } catch {}
  }
  if (clean.startsWith("T") && clean.length >= 33 && clean.length <= 35) {
    try {
      return toHexAddress(clean);
    } catch {
      return clean.toLowerCase();
    }
  }
  if (clean.startsWith("41") && clean.length === 42) {
    return "0x" + clean.slice(2).toLowerCase();
  }
  if (clean.startsWith("0x") || clean.startsWith("0X")) {
    return clean.toLowerCase();
  }
  return clean.toLowerCase();
}

/**
 * Checks if a wallet is already authorized without triggering any popup prompts.
 * Dynamic detection on any device (Chrome extension, Android APK, iOS bridge).
 * Respects explicit user disconnects.
 */
export function getInjectedAuthorizedAccount(): string | null {
  if (typeof window === "undefined") return null;

  // If user explicitly disconnected, do not auto-reconnect
  try {
    if (localStorage.getItem("equora_wallet_explicit_disconnect") === "true") {
      return null;
    }
  } catch {}

  const tw = getTrobSafeProvider();
  if (tw) {
    // 1. Check defaultAddress (TronWeb / TrobSafe standard)
    if (tw.defaultAddress) {
      const raw = tw.defaultAddress.base58 || tw.defaultAddress.hex;
      if (raw && raw !== "0" && raw !== "0x0" && raw !== "410000000000000000000000000000000000000000") {
        const norm = normalizeTo0x(raw);
        if (norm.startsWith("0x") && norm.length === 42) return norm;
      }
    }
    // 2. Check address property directly
    if (tw.address && typeof tw.address === "string" && tw.address.length > 5) {
      const norm = normalizeTo0x(tw.address);
      if (norm.startsWith("0x") && norm.length === 42) return norm;
    }
    // 3. Check selectedAddress (EVM/TrobSafe dual provider)
    if (tw.selectedAddress && typeof tw.selectedAddress === "string" && tw.selectedAddress.length > 5) {
      const norm = normalizeTo0x(tw.selectedAddress);
      if (norm.startsWith("0x") && norm.length === 42) return norm;
    }
  }

  // 4. Sync with DAO platform's equora_auth_address, trobsafe_address, or matrix storage
  try {
    const rawStored = localStorage.getItem("trobsafe_address");
    if (rawStored) {
      try {
        const parsed = JSON.parse(rawStored);
        const val = parsed.hex || parsed.base58;
        if (val && typeof val === "string") {
          const norm = normalizeTo0x(val);
          if (norm.startsWith("0x") && norm.length === 42) return norm;
        }
      } catch {
        const norm = normalizeTo0x(rawStored.trim());
        if (norm.startsWith("0x") && norm.length === 42) return norm;
      }
    }
    const candidates = [
      localStorage.getItem("equora_auth_address"),
      localStorage.getItem("equora_user_address"),
      localStorage.getItem("equora_matrix_address"),
    ];
    for (const c of candidates) {
      if (c && c.trim().length > 5 && c !== "0x0" && c !== "0") {
        const norm = normalizeTo0x(c.trim());
        if (norm.startsWith("0x") && norm.length === 42) return norm;
      }
    }
  } catch {}

  return null;
}

/**
 * Automatically detects whether TrobSafe wallet is installed on this device
 * and attempts seamless connection. Returns the connected address or null.
 */
export async function autoDetectAndConnectTrobSafe(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  wakeUpExtension();

  // 1. Check if already authorized / stored
  const authorized = getInjectedAuthorizedAccount();
  if (authorized && authorized.startsWith("0x")) {
    setStoredUserAddress(authorized);
    return authorized;
  }

  // 2. If provider is present and already unlocked, attempt connection
  if (hasTrobSafeProvider()) {
    try {
      const address = await connectTrobSafe();
      if (address && address.startsWith("0x")) {
        return address;
      }
    } catch (e) {
      console.warn("[web3Wallet] Auto-connect prompt pending or declined:", e);
    }
  }

  return null;
}

/**
 * Connect to TrobSafe specifically
 */
export async function connectTrobSafe(): Promise<string> {
  if (typeof window === "undefined") throw new Error("Window not available");
  wakeUpExtension();

  const foreign = getIncompatibleForeignWallet();
  if (foreign) {
    throw new Error(
      `Incompatible wallet detected (${foreign}). Equora Protocol exclusively runs on TrobChain Layer-1 and requires the official TrobSafe Wallet (Extension, Android APK, or iOS App).`
    );
  }

  const tw = getTrobSafeProvider();

  if (!tw) {
    throw new Error(
      "TrobSafe wallet was not detected. Please install TrobSafe extension for Chrome/Brave/Edge or open this page inside the TrobSafe Mobile App (Android APK / iOS)."
    );
  }

  try {
    if (tw.request) {
      try {
        await tw.request({ method: "tron_requestAccounts" });
      } catch (e: any) {
        if (e?.code === 4001 || e?.message?.includes("User rejected")) {
          throw new Error("Connection request was rejected in TrobSafe.");
        }
      }
    }

    if (typeof tw.enable === "function") {
      try {
        const res = await tw.enable();
        if (res && Array.isArray(res) && res[0]) {
          const clean = normalizeTo0x(res[0]);
          setStoredUserAddress(clean);
          return clean;
        }
      } catch {}
    }

    const rawAddr =
      tw.defaultAddress?.base58 ||
      tw.defaultAddress?.hex ||
      tw.address ||
      tw.selectedAddress;

    if (!rawAddr || rawAddr === "0" || rawAddr === "0x0") {
      throw new Error("Please unlock your TrobSafe wallet or approve connection.");
    }
    const clean = normalizeTo0x(rawAddr);
    setStoredUserAddress(clean);
    return clean;
  } catch (err: any) {
    if (err?.code === 4001 || err?.message?.includes("User rejected")) {
      throw new Error("Connection request was rejected in TrobSafe.");
    }
    throw new Error(err.message || "Failed to connect TrobSafe.");
  }
}

/**
 * Connect to injected Web3 wallet (TrobSafe)
 */
export async function connectInjectedWallet(): Promise<string> {
  return await connectTrobSafe();
}

/**
 * Explicitly disconnect wallet
 */
export function disconnectWallet(): void {
  clearStoredUserAddress();
}

/**
 * Register listeners for wallet account changes and disconnects across TrobSafe
 */
export function setupWalletListeners(
  onAccountChange: (newAddress: string) => void,
  onDisconnect: () => void
): () => void {
  if (typeof window === "undefined") return () => {};

  let lastKnownAddress = getInjectedAuthorizedAccount();

  const handleMessage = (e: MessageEvent) => {
    if (e.data?.message?.action === "setAccount" || e.data?.action === "accountsChanged") {
      const addr = e.data?.message?.data?.address || e.data?.data?.address;
      if (addr) {
        const clean = normalizeTo0x(addr);
        if (clean && clean !== lastKnownAddress) {
          lastKnownAddress = clean;
          setStoredUserAddress(clean);
          onAccountChange(clean);
        }
      }
    }
    if (e.data?.action === "disconnect" || e.data?.message?.action === "disconnect") {
      disconnectWallet();
      onDisconnect();
    }
  };

  window.addEventListener("message", handleMessage);

  // Periodic check for TrobSafe account switch
  const interval = setInterval(() => {
    try {
      const current = getInjectedAuthorizedAccount();
      if (current && current !== lastKnownAddress) {
        lastKnownAddress = current;
        setStoredUserAddress(current);
        onAccountChange(current);
      }
    } catch {}
  }, 1000);

  return () => {
    window.removeEventListener("message", handleMessage);
    clearInterval(interval);
  };
}
