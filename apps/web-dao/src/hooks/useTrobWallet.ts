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
  /** Disconnect (clears local state only — extension stays authorized) */
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Primary hook for TrobSafe wallet interaction.
 *
 * Usage:
 *   const { status, hexAddress, connect, signMessage, callContract } = useTrobWallet();
 *
 * The hook:
 * 1. Waits up to 1.5s for window.trob to appear (extension inject).
 * 2. Restores previously connected address from localStorage.
 * 3. Listens for addressChanged events from the extension.
 * 4. Exposes connect(), disconnect(), signMessage(), callContract().
 */
export function useTrobWallet(): TrobWalletState {
  const [status, setStatus]   = useState<WalletStatus>('detecting');
  const [address, setAddress] = useState<TrobAddress | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const detectionTimer        = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────
  const getTrob = (): TrobWalletAPI | null =>
    typeof window !== 'undefined' ? (window.trob ?? null) : null;

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
    } catch { /* storage blocked */ }
  }, []);

  const clearAddress = useCallback(() => {
    setAddress(null);
    setStatus('disconnected');
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
  }, []);

  // ── Detect extension + restore session ──────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tryDetect = () => {
      const trob = getTrob();
      if (trob?.ready) {
        if (detectionTimer.current) clearTimeout(detectionTimer.current);

        // Restore previously connected address
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed: TrobAddress = JSON.parse(stored);
            if (parsed.base58 || parsed.hex) {
              // Also sync with what extension reports
              const liveAddr = trob.defaultAddress;
              const resolvedBase58 = liveAddr?.base58 || parsed.base58;
              const resolvedHex    = liveAddr?.hex    || parsed.hex;
              if (resolvedBase58 || resolvedHex) {
                applyAddress({ base58: resolvedBase58, hex: resolvedHex });
                return;
              }
            }
          }
        } catch { /* */ }

        // Check if extension already has an address loaded
        if (trob.defaultAddress?.base58 || trob.defaultAddress?.hex) {
          applyAddress(trob.defaultAddress);
        } else {
          setStatus('disconnected');
        }
        return;
      }
      // Extension not yet injected — keep waiting
    };

    // Poll until found or timed out
    const pollId = setInterval(tryDetect, 100);
    detectionTimer.current = setTimeout(() => {
      clearInterval(pollId);
      if (!getTrob()?.ready) setStatus('not_installed');
    }, DETECTION_TIMEOUT_MS);

    // Also listen for the custom trobReady event
    const onTrobReady = () => {
      clearInterval(pollId);
      if (detectionTimer.current) clearTimeout(detectionTimer.current);
      tryDetect();
    };
    window.addEventListener('trobReady', onTrobReady);
    window.addEventListener('trobLinkReady', onTrobReady);

    return () => {
      clearInterval(pollId);
      if (detectionTimer.current) clearTimeout(detectionTimer.current);
      window.removeEventListener('trobReady', onTrobReady);
      window.removeEventListener('trobLinkReady', onTrobReady);
    };
  }, [applyAddress]);

  // ── Listen for address changes from extension ─────────────────────────────
  useEffect(() => {
    const trob = getTrob();
    if (!trob) return;

    const handleAddressChange = (data: unknown) => {
      const { base58, hex } = data as TrobAddress;
      if (!base58 && !hex) {
        clearAddress();
      } else {
        applyAddress({ base58: base58 ?? '', hex: hex ?? '' });
      }
    };

    trob.on('addressChanged', handleAddressChange);
    return () => trob.off('addressChanged', handleAddressChange);
  }, [status, applyAddress, clearAddress]);

  // ── connect ───────────────────────────────────────────────────────────────
  const connect = useCallback(async (): Promise<TrobAddress | null> => {
    const trob = getTrob();
    if (!trob) {
      setStatus('not_installed');
      setError('TrobSafe wallet extension is not installed.');
      return null;
    }

    setStatus('connecting');
    setError(null);

    try {
      const details = await trob.getDetails();
      const addr: TrobAddress = {
        base58: details.address?.base58 ?? trob.defaultAddress?.base58 ?? '',
        hex:    details.address?.hex    ?? trob.defaultAddress?.hex    ?? '',
      };

      if (!addr.base58 && !addr.hex) {
        throw new Error('No address returned from TrobSafe. Please unlock your wallet.');
      }

      applyAddress(addr);
      return addr;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect TrobSafe wallet.';
      setError(msg);
      setStatus('error');
      return null;
    }
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
    isConnected:   status === 'connected',
    isInstalled:   status !== 'not_installed' && status !== 'detecting',
    error,
    connect,
    disconnect,
    signMessage,
    callContract,
  };
}
