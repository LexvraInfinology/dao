'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TrobWalletAPI, TrobAddress } from '@/types/trobsafe.d';

// ─── Extension detection ──────────────────────────────────────────────────────

const TROBSAFE_EXTENSION_ID = 'trobsafe';
const TROBSAFE_INSTALL_URL   = 'https://chromewebstore.google.com/detail/trobsafe-wallet/hmijkpcbnkmkijljblhojfndfapidkkk';

/**
 * How long to wait (ms) for the extension to inject window.trob
 * after the page loads before declaring it "not installed".
 */
const DETECTION_TIMEOUT_MS = 1500;

// ─── Types ────────────────────────────────────────────────────────────────────

export type WalletStatus =
  | 'detecting'    // waiting for extension injection
  | 'not_installed'
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export interface TrobWalletState {
  status: WalletStatus;
  address: TrobAddress | null;
  /** Canonical 0x hex address (lower-case) — used for API calls and SIWE */
  hexAddress: string | null;
  /** Trobium native base58 address */
  base58Address: string | null;
  isConnected: boolean;
  isInstalled: boolean;
  error: string | null;
  /** Connect wallet (opens TrobSafe permission dialog) */
  connect: () => Promise<TrobAddress | null>;
  /** Connect directly with a specific wallet address */
  connectWithAddress: (addr: string) => TrobAddress;
  /** Disconnect (clears local state and stored sessions) */
  disconnect: () => void;
  /**
   * Sign a plain-text message via TrobSafe.
   * Used for SIWE authentication.
   */
  signMessage: (message: string) => Promise<string>;
  /**
   * Call a smart contract via TrobSafe.
   * Used for seat minting and withdrawals.
   */
  callContract: (payload: Parameters<TrobWalletAPI['triggersmartcontract']>[0]) => Promise<{ txid: string; result: boolean }>;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'trobsafe_address';
export const DISCONNECTED_KEY = 'equora_wallet_explicit_disconnect';

export function isWalletExplicitlyDisconnected(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(DISCONNECTED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function readStoredAddress(): TrobAddress | null {
  if (typeof window === 'undefined') return null;
  if (isWalletExplicitlyDisconnected()) return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && (parsed.base58 || parsed.hex)) {
          return {
            base58: parsed.base58 || '',
            hex: parsed.hex ? parsed.hex.toLowerCase() : '',
          };
        }
      } catch {
        if (typeof stored === 'string' && stored.trim().length > 6) {
          const trimmed = stored.trim();
          if (trimmed.startsWith('0x')) {
            return { base58: '', hex: trimmed.toLowerCase() };
          }
          return { base58: trimmed, hex: '' };
        }
      }
    }

    // Fallback: check equora_auth_address
    const authAddr = localStorage.getItem('equora_auth_address');
    if (authAddr && typeof authAddr === 'string' && authAddr.trim().length > 6) {
      const trimmed = authAddr.trim();
      if (trimmed.startsWith('0x')) {
        return { base58: '', hex: trimmed.toLowerCase() };
      }
      return { base58: trimmed, hex: '' };
    }
  } catch {
    /* storage blocked */
  }
  return null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Primary hook for TrobSafe wallet interaction.
 */
export function useTrobWallet(): TrobWalletState {
  const [status, setStatus]           = useState<WalletStatus>('detecting');
  const [address, setAddress]         = useState<TrobAddress | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  // ── helpers ──────────────────────────────────────────────────────────────
  const getTrob = (): TrobWalletAPI | any | null => {
    if (typeof window === 'undefined') return null;
    const w = window as any;

    // 1. Direct window properties (case variations and aliases)
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

    // 2. Check window.ethereum or multi-provider arrays
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

    // 3. EIP-6963 announced provider cached in memory
    if (w.__eip6963TrobProvider) {
      return w.__eip6963TrobProvider;
    }

    // 4. Fallback to window.ethereum if it has a request method
    if (w.ethereum && typeof w.ethereum.request === 'function') {
      return w.ethereum;
    }

    return null;
  };

  const isTrobActive = (t: any): boolean => {
    if (!t) return false;
    // Any object or function injected as provider indicates extension is present!
    if (typeof t === 'object' || typeof t === 'function') {
      return true;
    }
    return false;
  };

  const applyAddress = useCallback((addr: TrobAddress) => {
    if (!addr || (!addr.base58 && !addr.hex)) return;
    const normalized: TrobAddress = {
      base58: addr.base58 ?? '',
      hex: addr.hex ? addr.hex.toLowerCase() : '',
    };
    try {
      localStorage.removeItem(DISCONNECTED_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      if (normalized.hex) {
        localStorage.setItem('equora_auth_address', normalized.hex);
      } else if (normalized.base58) {
        localStorage.setItem('equora_auth_address', normalized.base58);
      }
    } catch { /* storage blocked */ }
    setAddress(normalized);
    setStatus('connected');
    setError(null);
  }, []);

  const clearAddress = useCallback(() => {
    try {
      localStorage.setItem(DISCONNECTED_KEY, 'true');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('equora_auth_address');
      localStorage.removeItem('equora_jwt');
      localStorage.removeItem('equora_dao_preview');
      localStorage.removeItem('equora_dev_mode');
    } catch { /* */ }
    setAddress(null);
    setStatus('disconnected');
    setError(null);
  }, []);

  // ── Detect extension + restore session ──────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkInstalled = (): boolean => {
      const trob = getTrob();
      const w = typeof window !== 'undefined' ? (window as any) : null;
      const hasBridge = Boolean(
        w?.__trobsafeBridge ||
        (typeof document !== 'undefined' && document.documentElement?.hasAttribute('data-trobsafe-inpage'))
      );
      const isInst = Boolean((trob && isTrobActive(trob)) || hasBridge);
      if (isInst) {
        setIsInstalled(true);
      }
      return isInst;
    };

    checkInstalled();

    // Immediately restore stored session ONLY if user has NOT explicitly signed out
    if (!isWalletExplicitlyDisconnected()) {
      const stored = readStoredAddress();
      if (stored && (stored.base58 || stored.hex)) {
        applyAddress(stored);
      }
    } else {
      setStatus('disconnected');
    }

    const tryDetect = (): boolean => {
      checkInstalled();
      const isDisc = isWalletExplicitlyDisconnected();
      if (isDisc) {
        setStatus('disconnected');
        return true;
      }

      const trob = getTrob();
      const currentStored = readStoredAddress();
      const w = typeof window !== 'undefined' ? (window as any) : null;
      const hasBridge = Boolean(
        w?.__trobsafeBridge ||
        (typeof document !== 'undefined' && document.documentElement?.hasAttribute('data-trobsafe-inpage'))
      );

      // Only restore session if user had previously connected and saved a session
      if (currentStored && (currentStored.base58 || currentStored.hex)) {
        if (isTrobActive(trob)) {
          const liveAddr = trob?.defaultAddress;
          const resolvedBase58 = (liveAddr?.base58 && liveAddr.base58.length > 5) ? liveAddr.base58 : currentStored.base58;
          const resolvedHex    = (liveAddr?.hex && liveAddr.hex.length > 5) ? liveAddr.hex.toLowerCase() : currentStored.hex;
          applyAddress({ base58: resolvedBase58, hex: resolvedHex });
        } else {
          applyAddress(currentStored);
        }
        return true;
      }

      // Extension is present, but user is NOT connected yet.
      // Status is 'disconnected'. DO NOT auto-connect without user clicking connect!
      if (isTrobActive(trob) || hasBridge) {
        setStatus('disconnected');
        return true;
      }

      return false;
    };

    if (tryDetect()) return;

    // Fast poll for the first 2 seconds (every 100ms)
    let pollCount = 0;
    const fastPoll = setInterval(() => {
      pollCount++;
      if (tryDetect()) {
        clearInterval(fastPoll);
      } else if (pollCount >= 20) {
        clearInterval(fastPoll);
        const w = typeof window !== 'undefined' ? (window as any) : null;
        const hasBridge = Boolean(
          w?.__trobsafeBridge ||
          (typeof document !== 'undefined' && document.documentElement?.hasAttribute('data-trobsafe-inpage'))
        );
        setStatus((prev) => {
          if (prev === 'connected') return prev;
          if (hasBridge || isWalletExplicitlyDisconnected()) return 'disconnected';
          return prev === 'detecting' ? 'not_installed' : prev;
        });
      }
    }, 100);

    // Continuous background check every 600ms
    const slowPoll = setInterval(() => {
      if (tryDetect()) {
        clearInterval(slowPoll);
      }
    }, 600);

    const onTrobReady = () => {
      clearInterval(fastPoll);
      clearInterval(slowPoll);
      tryDetect();
    };

    // Extension bridge inpage message listeners (direct TrobSafe content script broadcast)
    const handleInpageMessage = (event: MessageEvent) => {
      if (typeof window === 'undefined' || event.source !== window) return;
      const data = event.data;
      if (!data || !data.__trobsafe) return;

      setIsInstalled(true);

      // If user explicitly signed out or has not connected, do NOT auto-connect from background announcements!
      if (isWalletExplicitlyDisconnected()) return;
      if (!readStoredAddress()) return;

      if (data.type === 'TROBSAFE_SET_ADDRESS' || data.type === 'TROBSAFE_ADDRESS_CHANGED') {
        const b58 = String(data.base58 ?? '').trim();
        const hx = String(data.hex ?? '').trim();
        if (b58 || hx) {
          applyAddress({ base58: b58, hex: hx });
        }
      }

      if (data.type === 'TROBSAFE_EVENT') {
        const detail = data.detail || {};
        const b58 = String(detail.base58 || detail.wallet_address || detail.address || '').trim();
        const hx = String(detail.hex ?? '').trim();
        if (b58 || hx) {
          applyAddress({ base58: b58, hex: hx });
        }
      }
    };
    window.addEventListener('message', handleInpageMessage);

    // EIP-6963 standard provider discovery
    const handleEip6963 = (event: any) => {
      const detail = event?.detail;
      if (detail?.provider) {
        const name = (detail.info?.name || '').toLowerCase();
        const rdns = (detail.info?.rdns || '').toLowerCase();
        if (name.includes('trob') || rdns.includes('trob') || !(window as any).__eip6963TrobProvider) {
          (window as any).__eip6963TrobProvider = detail.provider;
          onTrobReady();
        }
      }
    };
    window.addEventListener('eip6963:announceProvider', handleEip6963);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    window.addEventListener('trobReady', onTrobReady);
    window.addEventListener('trobLinkReady', onTrobReady);
    window.addEventListener('trobSafe_ready', onTrobReady);
    window.addEventListener('trobsafe_ready', onTrobReady);
    window.addEventListener('ethereum#initialized', onTrobReady);

    return () => {
      clearInterval(fastPoll);
      clearInterval(slowPoll);
      window.removeEventListener('message', handleInpageMessage);
      window.removeEventListener('eip6963:announceProvider', handleEip6963);
      window.removeEventListener('trobReady', onTrobReady);
      window.removeEventListener('trobLinkReady', onTrobReady);
      window.removeEventListener('trobSafe_ready', onTrobReady);
      window.removeEventListener('trobsafe_ready', onTrobReady);
      window.removeEventListener('ethereum#initialized', onTrobReady);
    };
  }, [applyAddress]);

  // ── Listen for address changes from extension ─────────────────────────────
  useEffect(() => {
    const trob = getTrob();
    if (!trob || typeof trob.on !== 'function') return;

    const handleAddressChange = (data: unknown) => {
      // If user explicitly signed out or is not connected, do not auto-connect
      if (isWalletExplicitlyDisconnected() || status !== 'connected') return;

      const { base58, hex } = (data || {}) as TrobAddress;
      if (!base58 && !hex) {
        clearAddress();
      } else {
        applyAddress({ base58: base58 ?? '', hex: hex ?? '' });
      }
    };

    trob.on('addressChanged', handleAddressChange);
    return () => {
      if (typeof trob.off === 'function') {
        trob.off('addressChanged', handleAddressChange);
      }
    };
  }, [applyAddress, clearAddress, status]);

  // ── connect ───────────────────────────────────────────────────────────────
  const connect = useCallback(async (): Promise<TrobAddress | null> => {
    // 0. Explicit connection intent: clear the explicit disconnect flag
    try {
      localStorage.removeItem(DISCONNECTED_KEY);
    } catch {}
    // 1. Dispatch wakeup signals
    try {
      window.postMessage({ target: 'trobsafe-inpage', action: 'connect' }, '*');
      window.postMessage({ type: 'TROBSAFE_CONNECT' }, '*');
      window.postMessage({ type: 'TROBSAFE_REQUEST_ACCOUNTS' }, '*');
      window.dispatchEvent(new CustomEvent('trob_requestAccounts'));
      window.dispatchEvent(new CustomEvent('trobSafe_connect'));
      window.dispatchEvent(new Event('eip6963:requestProvider'));
    } catch {}

    let trob = getTrob();

    // If extension not immediately found, poll for up to 1500ms
    if (!trob) {
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 100));
        trob = getTrob();
        if (trob) break;
      }
    }

    const w = typeof window !== 'undefined' ? (window as any) : null;
    const hasBridge = Boolean(
      w?.__trobsafeBridge ||
      (typeof document !== 'undefined' && document.documentElement?.hasAttribute('data-trobsafe-inpage'))
    );

    if (!trob && !hasBridge) {
      const stored = readStoredAddress();
      if (stored && (stored.base58 || stored.hex)) {
        applyAddress(stored);
        return stored;
      }
      setStatus('not_installed');
      setError('TrobSafe extension not detected. Please ensure your TrobSafe extension is enabled in your browser extensions.');
      return null;
    }

    setStatus('connecting');
    setError(null);

    try {
      let resolvedBase58 = '';
      let resolvedHex = '';

      // Check defaultAddress on trob object first (if already unlocked and set)
      if (trob?.defaultAddress?.base58 || trob?.defaultAddress?.hex) {
        resolvedBase58 = trob.defaultAddress.base58 || '';
        resolvedHex = (trob.defaultAddress.hex || '').toLowerCase();
      }

      // Method 1: trob.getDetails() - official TrobSafe API
      if (!resolvedBase58 && !resolvedHex && typeof trob?.getDetails === 'function') {
        try {
          const details: any = await trob.getDetails();
          if (details) {
            const addrObj = details.address || details;
            resolvedBase58 = addrObj.base58 || (typeof addrObj === 'string' && !addrObj.startsWith('0x') ? addrObj : '') || '';
            resolvedHex = (addrObj.hex || (typeof addrObj === 'string' && addrObj.startsWith('0x') ? addrObj : '') || '').toLowerCase();
          }
        } catch (e: any) {
          const m = (e?.message || String(e)).toLowerCase();
          if (m.includes('locked')) {
            throw new Error('Your TrobSafe Wallet is locked. Please click the TrobSafe icon in your browser toolbar to unlock it.');
          }
        }
      }

      // Method 2: trob.request({ method: 'trob_requestAccounts' })
      if (!resolvedBase58 && !resolvedHex && typeof trob?.request === 'function') {
        try {
          const reqRes: any = await trob.request({ method: 'trob_requestAccounts' });
          if (reqRes) {
            const data = reqRes.data || reqRes;
            if (typeof data === 'string') {
              if (data.startsWith('0x')) resolvedHex = data.toLowerCase();
              else resolvedBase58 = data;
            } else if (Array.isArray(data) && data[0]) {
              if (data[0].startsWith('0x')) resolvedHex = data[0].toLowerCase();
              else resolvedBase58 = data[0];
            } else if (typeof data === 'object') {
              resolvedBase58 = data.base58 || data.address || '';
              resolvedHex = (data.hex || '').toLowerCase();
            }
          }
        } catch (e: any) {
          const m = (e?.message || String(e)).toLowerCase();
          if (m.includes('locked')) {
            throw new Error('Your TrobSafe Wallet is locked. Please click the TrobSafe icon in your browser toolbar to unlock it.');
          }
        }
      }

      // Method 3: trob.enable() (TronWeb/TronLink/TrobWeb standard)
      if (!resolvedBase58 && !resolvedHex && typeof trob?.enable === 'function') {
        try {
          const enableRes: any = await trob.enable();
          if (enableRes) {
            if (Array.isArray(enableRes) && enableRes[0]) {
              if (enableRes[0].startsWith('0x')) resolvedHex = enableRes[0].toLowerCase();
              else resolvedBase58 = enableRes[0];
            } else if (typeof enableRes === 'object') {
              resolvedBase58 = enableRes.base58 || '';
              resolvedHex = (enableRes.hex || '').toLowerCase();
            }
          }
        } catch {}
      }

      // Method 4: Check window.tronWeb or window.trobWeb or window.trobSafe
      if (!resolvedBase58 && !resolvedHex && typeof window !== 'undefined') {
        const tw = w?.tronWeb || w?.trobWeb || w?.trobSafe || w?.trobsafe;
        if (tw?.defaultAddress) {
          resolvedBase58 = tw.defaultAddress.base58 || '';
          resolvedHex = (tw.defaultAddress.hex || '').toLowerCase();
        }
      }

      // Method 5: Fallback to stored address
      if (!resolvedBase58 && !resolvedHex) {
        const stored = readStoredAddress();
        if (stored && (stored.base58 || stored.hex)) {
          resolvedBase58 = stored.base58;
          resolvedHex = stored.hex;
        }
      }

      if (!resolvedBase58 && !resolvedHex) {
        throw new Error('Please click the TrobSafe extension icon in your browser toolbar to unlock or approve connection.');
      }

      const addr: TrobAddress = {
        base58: resolvedBase58,
        hex: resolvedHex,
      };

      applyAddress(addr);
      return addr;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect TrobSafe wallet.';
      setError(msg);
      setStatus(hasBridge || Boolean(trob) ? 'disconnected' : 'error');
      return null;
    }
  }, [applyAddress]);

  // ── connectWithAddress ────────────────────────────────────────────────────
  const connectWithAddress = useCallback((rawAddr: string): TrobAddress => {
    const trimmed = rawAddr.trim();
    const addr: TrobAddress = {
      base58: trimmed.startsWith('0x') ? '' : trimmed,
      hex: trimmed.startsWith('0x') ? trimmed.toLowerCase() : '',
    };
    applyAddress(addr);
    return addr;
  }, [applyAddress]);

  // ── disconnect ────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    clearAddress();
  }, [clearAddress]);

  // ── signMessage ───────────────────────────────────────────────────────────
  const signMessage = useCallback(async (message: string): Promise<string> => {
    const trob = getTrob();
    if (!trob) throw new Error('TrobSafe wallet is not installed.');
    if (status !== 'connected') throw new Error('Wallet not connected. Please connect first.');

    const signature = await trob.signMessageV2(message);
    if (!signature) throw new Error('TrobSafe returned empty signature.');
    return signature as string;
  }, [status]);

  // ── callContract ──────────────────────────────────────────────────────────
  const callContract = useCallback(
    async (payload: Parameters<TrobWalletAPI['triggersmartcontract']>[0]) => {
      const trob = getTrob();
      if (!trob) throw new Error('TrobSafe wallet is not installed.');
      if (status !== 'connected') throw new Error('Wallet not connected.');
      if (typeof trob.triggersmartcontract === 'function') {
        return trob.triggersmartcontract(payload);
      }
      if (typeof trob.transactionBuilder?.triggerSmartContract === 'function') {
        const p = (Array.isArray(payload) ? payload[0] : payload) as any;
        const tx = await trob.transactionBuilder.triggerSmartContract(
          p.contract_address,
          p.function_selector,
          {
            feeLimit: p.fee_limit || 100_000_000,
            callValue: p.call_value || 0,
          },
          [],
          p.owner_address
        );
        const signedTx = await trob.trx.sign(tx.transaction);
        const broadcast = await trob.trx.sendRawTransaction(signedTx);
        return { txid: broadcast.txid || tx.transaction?.txID || 'confirmed', result: Boolean(broadcast.result) };
      }
      throw new Error('Contract trigger not supported by current wallet provider.');
    },
    [status]
  );

  return {
    status,
    address,
    hexAddress:    address?.hex    ? address.hex.toLowerCase()   : null,
    base58Address: address?.base58 ? address.base58              : null,
    isConnected:   status === 'connected' && Boolean(address?.base58 || address?.hex),
    isInstalled,
    error,
    connect,
    connectWithAddress,
    disconnect,
    signMessage,
    callContract,
  };
}
