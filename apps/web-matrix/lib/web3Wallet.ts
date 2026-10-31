// ==============================================================================
// EQUORA MATRIX PROTOCOL — WEB3 WALLET CONNECTOR (apps/web-matrix/lib/web3Wallet.ts)
// Supports TrobSafe (TrobChain native L1) for Chrome Extension, Android APK & iOS.
// Matches the exact wallet detection & connection standard of the DAO platform.
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
    w.trob ||
    w.trobSafe ||
    w.trobsafe ||
    w.TrobSafe ||
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
 * Connect to TrobSafe specifically.
 * Directly prompts native TrobSafe authorization sheet on Mobile APK & Chrome extension,
 * automatically resolving the active address without requiring manual typing.
 */
export async function connectTrobSafe(): Promise<string> {
  if (typeof window === "undefined") throw new Error("Window not available");

  // 0. Explicit connection intent: clear the explicit disconnect flag
  try {
    localStorage.removeItem("equora_wallet_explicit_disconnect");
  } catch {}

  // 1. Dispatch wakeup signals
  wakeUpExtension();

  const foreign = getIncompatibleForeignWallet();
  if (foreign) {
    throw new Error(
      `Incompatible wallet detected (${foreign}). Equora Protocol exclusively runs on TrobChain Layer-1 and requires the official TrobSafe Wallet (Extension, Android APK, or iOS App).`
    );
  }

  // If provider not immediately ready, poll briefly for injection
  let tw = getTrobSafeProvider();
  if (!tw) {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 100));
      tw = getTrobSafeProvider();
      if (tw) break;
    }
  }

  const w = typeof window !== "undefined" ? (window as any) : null;
  const hasBridge = Boolean(
    w?.__trobsafeBridge ||
    (typeof document !== "undefined" && document.documentElement?.hasAttribute("data-trobsafe-inpage"))
  );

  if (!tw && !hasBridge) {
    const stored = getInjectedAuthorizedAccount();
    if (stored && stored.startsWith("0x")) {
      setStoredUserAddress(stored);
      return stored;
    }
    throw new Error(
      "TrobSafe wallet was not detected. Please install TrobSafe extension for Chrome/Brave/Edge or open this page inside the TrobSafe Mobile App (Android APK / iOS)."
    );
  }

  try {
    let resolvedBase58 = "";
    let resolvedHex = "";

    // Check defaultAddress on trob object first (if already authorized)
    if (tw?.defaultAddress?.base58 || tw?.defaultAddress?.hex) {
      resolvedBase58 = tw.defaultAddress.base58 || "";
      resolvedHex = (tw.defaultAddress.hex || "").toLowerCase();
    }

    // Method 1: tw.getDetails() - official TrobSafe API (triggers native dialog in TrobSafe mobile app)
    if (!resolvedBase58 && !resolvedHex && typeof tw?.getDetails === "function") {
      try {
        const details: any = await tw.getDetails();
        if (details) {
          const addrObj = details.address || details;
          resolvedBase58 = addrObj.base58 || (typeof addrObj === "string" && !addrObj.startsWith("0x") ? addrObj : "") || "";
          resolvedHex = (addrObj.hex || (typeof addrObj === "string" && addrObj.startsWith("0x") ? addrObj : "") || "").toLowerCase();
        }
      } catch (e: any) {
        const m = (e?.message || String(e)).toLowerCase();
        if (e?.code === 4001 || m.includes("user rejected") || m.includes("rejected")) {
          throw new Error("Connection request was rejected in TrobSafe.");
        }
        if (m.includes("locked")) {
          throw new Error("Your TrobSafe Wallet is locked. Please unlock it to continue.");
        }
      }
    }

    // Method 2: tw.request({ method: 'trob_requestAccounts' }) - standard TrobSafe native prompt
    if (!resolvedBase58 && !resolvedHex && typeof tw?.request === "function") {
      try {
        const reqRes: any = await tw.request({ method: "trob_requestAccounts" });
        if (reqRes) {
          const data = reqRes.data || reqRes;
          if (typeof data === "string") {
            if (data.startsWith("0x")) resolvedHex = data.toLowerCase();
            else resolvedBase58 = data;
          } else if (Array.isArray(data) && data[0]) {
            if (data[0].startsWith("0x")) resolvedHex = data[0].toLowerCase();
            else resolvedBase58 = data[0];
          } else if (typeof data === "object") {
            resolvedBase58 = data.base58 || data.address || "";
            resolvedHex = (data.hex || "").toLowerCase();
          }
        }
      } catch (e: any) {
        const m = (e?.message || String(e)).toLowerCase();
        if (e?.code === 4001 || m.includes("user rejected") || m.includes("rejected")) {
          throw new Error("Connection request was rejected in TrobSafe.");
        }
        if (m.includes("locked")) {
          throw new Error("Your TrobSafe Wallet is locked. Please unlock it to continue.");
        }
      }
    }

    // Method 3: tw.request({ method: 'eth_requestAccounts' })
    if (!resolvedBase58 && !resolvedHex && typeof tw?.request === "function") {
      try {
        const ethRes: any = await tw.request({ method: "eth_requestAccounts" });
        if (ethRes && Array.isArray(ethRes) && ethRes[0]) {
          resolvedHex = ethRes[0].toLowerCase();
        }
      } catch (e: any) {
        const m = (e?.message || String(e)).toLowerCase();
        if (e?.code === 4001 || m.includes("user rejected") || m.includes("rejected")) {
          throw new Error("Connection request was rejected in TrobSafe.");
        }
      }
    }

    // Method 4: tw.request({ method: 'tron_requestAccounts' })
    if (!resolvedBase58 && !resolvedHex && typeof tw?.request === "function") {
      try {
        const tronRes: any = await tw.request({ method: "tron_requestAccounts" });
        if (tronRes) {
          const d = tronRes.data || tronRes;
          if (typeof d === "string") {
            if (d.startsWith("0x")) resolvedHex = d.toLowerCase();
            else resolvedBase58 = d;
          } else if (Array.isArray(d) && d[0]) {
            if (d[0].startsWith("0x")) resolvedHex = d[0].toLowerCase();
            else resolvedBase58 = d[0];
          }
        }
      } catch (e: any) {
        const m = (e?.message || String(e)).toLowerCase();
        if (e?.code === 4001 || m.includes("user rejected") || m.includes("rejected")) {
          throw new Error("Connection request was rejected in TrobSafe.");
        }
      }
    }

    // Method 5: tw.enable() (TronWeb/TronLink/TrobWeb standard)
    if (!resolvedBase58 && !resolvedHex && typeof tw?.enable === "function") {
      try {
        const enableRes: any = await tw.enable();
        if (enableRes) {
          if (Array.isArray(enableRes) && enableRes[0]) {
            if (enableRes[0].startsWith("0x")) resolvedHex = enableRes[0].toLowerCase();
            else resolvedBase58 = enableRes[0];
          } else if (typeof enableRes === "object") {
            resolvedBase58 = enableRes.base58 || "";
            resolvedHex = (enableRes.hex || "").toLowerCase();
          }
        }
      } catch (e: any) {
        const m = (e?.message || String(e)).toLowerCase();
        if (e?.code === 4001 || m.includes("user rejected") || m.includes("rejected")) {
          throw new Error("Connection request was rejected in TrobSafe.");
        }
      }
    }

    // Method 6: Check window.tronWeb, window.trobWeb, window.trobSafe defaultAddress
    if (!resolvedBase58 && !resolvedHex && typeof window !== "undefined") {
      const alt = w?.trob || w?.tronWeb || w?.trobWeb || w?.trobSafe || w?.trobsafe;
      if (alt?.defaultAddress) {
        resolvedBase58 = alt.defaultAddress.base58 || "";
        resolvedHex = (alt.defaultAddress.hex || "").toLowerCase();
      }
    }

    // Method 7: Fallback to stored address
    if (!resolvedBase58 && !resolvedHex) {
      const stored = getInjectedAuthorizedAccount();
      if (stored && stored.startsWith("0x")) {
        resolvedHex = stored;
      }
    }

    if (!resolvedBase58 && !resolvedHex) {
      throw new Error("Please unlock your TrobSafe wallet or approve connection.");
    }

    const clean = normalizeTo0x(resolvedHex || resolvedBase58);
    if (!clean || !clean.startsWith("0x") || clean.length !== 42) {
      throw new Error("Could not resolve valid TrobChain address from TrobSafe.");
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("equora_wallet_explicit_disconnect");
      if (resolvedBase58 || resolvedHex) {
        localStorage.setItem(
          "trobsafe_address",
          JSON.stringify({ base58: resolvedBase58 || "", hex: resolvedHex || clean })
        );
      }
      localStorage.setItem("equora_auth_address", clean);
      localStorage.setItem("equora_matrix_address", clean);
      localStorage.setItem("equora_user_address", clean);
    }

    setStoredUserAddress(clean);
    return clean;
  } catch (err: any) {
    if (err?.code === 4001 || err?.message?.includes("User rejected") || err?.message?.includes("rejected")) {
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
