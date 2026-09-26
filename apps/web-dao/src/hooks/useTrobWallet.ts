'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TrobWalletAPI, TrobAddress } from '@/types/trobsafe.d';

// ─── Extension detection ──────────────────────────────────────────────────────

const TROBSAFE_EXTENSION_ID = 'trobsafe';
const TROBSAFE_INSTALL_URL   = '/trobsafe-install'; // handled by our own page

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

// ─── Storage key ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'trobsafe_address';

export function readStoredAddress(): TrobAddress | null {
  if (typeof window === 'undefined') return null;
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
  const [status, setStatus]   = useState<WalletStatus>('detecting');
  const [address, setAddress] = useState<TrobAddress | null>(null);
  const [error, setError]     = useState<string | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────
  const getTrob = (): TrobWalletAPI | null => {
    if (typeof window === 'undefined') return null;
    const w = window as any;
    const t = w.trob || w.trobLink || w.trobkit || null;
    return t;
  };

  const isTrobActive = (t: any): boolean => {
    if (!t) return false;
    return Boolean(t.ready || t.installed || typeof t.getDetails === 'function' || typeof t.request === 'function');
  };

  const applyAddress = useCallback((addr: TrobAddress) => {
    const normalized: TrobAddress = {
      base58: addr.base58 ?? '',
      hex: addr.hex ? addr.hex.toLowerCase() : '',
    };
    setAddress(normalized);
    setStatus('connected');
    setError(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      if (normalized.hex) {
        localStorage.setItem('equora_auth_address', normalized.hex);
      } else if (normalized.base58) {
        localStorage.setItem('equora_auth_address', normalized.base58);
      }
    } catch { /* storage blocked */ }
  }, []);

  const clearAddress = useCallback(() => {
    setAddress(null);
    setStatus('disconnected');
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('equora_auth_address');
      localStorage.removeItem('equora_jwt');
      localStorage.removeItem('equora_dao_preview');
    } catch { /* */ }
  }, []);

  // ── Detect extension + restore session ──────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Immediately restore stored session if present
    const stored = readStoredAddress();
    if (stored && (stored.base58 || stored.hex)) {
      applyAddress(stored);
    }

    const tryDetect = (): boolean => {
      const trob = getTrob();
      const currentStored = readStoredAddress();

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

      if (isTrobActive(trob)) {
        if (trob?.defaultAddress?.base58 || trob?.defaultAddress?.hex) {
          applyAddress(trob.defaultAddress);
          return true;
        } else {
          setStatus('disconnected');
          return true;
        }
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
        setStatus((prev) => {
          if (prev === 'connected') return prev;
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
    window.addEventListener('trobReady', onTrobReady);
    window.addEventListener('trobLinkReady', onTrobReady);

    return () => {
      clearInterval(fastPoll);
      clearInterval(slowPoll);
      window.removeEventListener('trobReady', onTrobReady);
      window.removeEventListener('trobLinkReady', onTrobReady);
    };
  }, [applyAddress]);

  // ── Listen for address changes from extension ─────────────────────────────
  useEffect(() => {
    const trob = getTrob();
    if (!trob || typeof trob.on !== 'function') return;

    const handleAddressChange = (data: unknown) => {
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
  }, [applyAddress, clearAddress]);

  // ── connect ───────────────────────────────────────────────────────────────
  const connect = useCallback(async (): Promise<TrobAddress | null> => {
    const trob = getTrob();
    if (!trob) {
      const stored = readStoredAddress();
      if (stored && (stored.base58 || stored.hex)) {
        applyAddress(stored);
        return stored;
      }
      setStatus('not_installed');
      setError('TrobSafe wallet extension is not installed.');
      return null;
    }

    setStatus('connecting');
    setError(null);

    try {
      let resolvedBase58 = '';
      let resolvedHex = '';

      // 1. Try trob_requestAccounts via trob.request
      if (typeof trob.request === 'function') {
        try {
          const reqRes: any = await trob.request({ method: 'trob_requestAccounts' });
          if (reqRes) {
            if (typeof reqRes === 'string') {
              if (reqRes.startsWith('0x')) resolvedHex = reqRes.toLowerCase();
              else resolvedBase58 = reqRes;
            } else if (typeof reqRes === 'object') {
              resolvedBase58 = reqRes.base58 || reqRes.address || '';
              resolvedHex = (reqRes.hex || '').toLowerCase();
            }
          }
        } catch {
          // fall through
        }
      }

      // 2. If not yet resolved, try eth_requestAccounts
      if (!resolvedBase58 && !resolvedHex && typeof trob.request === 'function') {
        try {
          const ethRes: any = await trob.request({ method: 'eth_requestAccounts' });
          if (Array.isArray(ethRes) && ethRes[0]) {
            resolvedHex = ethRes[0].toLowerCase();
          } else if (typeof ethRes === 'string') {
            resolvedHex = ethRes.toLowerCase();
          }
        } catch {
          // fall through
        }
      }

      // 3. Try trob.getDetails()
      if (!resolvedBase58 && !resolvedHex && typeof trob.getDetails === 'function') {
        try {
          const details: any = await trob.getDetails();
          if (details) {
            resolvedBase58 = details.address?.base58 || details.base58 || '';
            resolvedHex = (details.address?.hex || details.hex || '').toLowerCase();
          }
        } catch {
          // fall through
        }
      }

      // 4. Fallback to defaultAddress on trob object
      if (!resolvedBase58 && !resolvedHex && trob.defaultAddress) {
        resolvedBase58 = trob.defaultAddress.base58 || '';
        resolvedHex = (trob.defaultAddress.hex || '').toLowerCase();
      }

      // 5. Fallback to stored address
      if (!resolvedBase58 && !resolvedHex) {
        const stored = readStoredAddress();
        if (stored && (stored.base58 || stored.hex)) {
          resolvedBase58 = stored.base58;
          resolvedHex = stored.hex;
        }
      }

      if (!resolvedBase58 && !resolvedHex) {
        throw new Error('Please unlock your TrobSafe wallet and select an account.');
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
      setStatus('error');
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
      return trob.triggersmartcontract(payload);
    },
    [status]
  );

  return {
    status,
    address,
    hexAddress:    address?.hex    ? address.hex.toLowerCase()   : null,
    base58Address: address?.base58 ? address.base58              : null,
    isConnected:   status === 'connected' && Boolean(address?.base58 || address?.hex),
    isInstalled:   status !== 'not_installed' && status !== 'detecting',
    error,
    connect,
    connectWithAddress,
    disconnect,
    signMessage,
    callContract,
  };
}
