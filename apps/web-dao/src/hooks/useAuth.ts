'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  address: string;
  chainId: number;
  isRegistered: boolean;
  userId: number | null;
  sponsor: string | null;
  isQualified: boolean;
  /** DAO membership status from session profile */
  daoMember: boolean;
  daoPosition: number | null;
  nftBadgesCount: number;
}

export type AuthStatus =
  | 'idle'
  | 'requesting_nonce'
  | 'waiting_signature'
  | 'verifying'
  | 'authenticated'
  | 'error';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  error: string | null;
  isAuthenticated: boolean;
  /** Full SIWE sign-in flow: nonce → sign → verify → JWT */
  signIn: () => Promise<boolean>;
  /** Clear JWT + user from memory and localStorage */
  signOut: () => void;
  /** Re-fetch session profile using stored JWT (call on page load) */
  restoreSession: () => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE    = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY   = 'equora_jwt';
const ADDRESS_KEY = 'equora_auth_address';

// ─── SIWE message builder ─────────────────────────────────────────────────────

function buildSiweMessage(params: {
  domain: string;
  address: string;
  nonce: string;
  chainId: number;
  issuedAt: string;
  statement: string;
  uri: string;
}): string {
  return [
    `${params.domain} wants you to sign in with your Trobium account:`,
    params.address,
    '',
    params.statement,
    '',
    `URI: ${params.uri}`,
    `Version: 1`,
    `Chain ID: ${params.chainId}`,
    `Nonce: ${params.nonce}`,
    `Issued At: ${params.issuedAt}`,
  ].join('\n');
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useAuth — drives the SIWE authentication flow on top of TrobSafe wallet.
 *
 * Flow:
 *   1. signIn() called
 *   2. POST /api/auth/nonce  →  server generates one-time nonce
 *   3. Build EIP-4361 SIWE message
 *   4. trob.signMessageV2(message)  →  user signs in TrobSafe popup
 *   5. POST /api/auth/verify  →  server verifies, returns JWT + user
 *   6. JWT stored in localStorage; user stored in state
 */
export function useAuth(): AuthState {
  const wallet = useWallet();

  const [status, setStatus] = useState<AuthStatus>(() => {
    // Restore from storage on first render
    if (typeof window !== 'undefined' && localStorage.getItem(TOKEN_KEY)) {
      return 'authenticated';
    }
    return 'idle';
  });

  const [user, setUser]   = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  );
  const [error, setError] = useState<string | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  const persist = (jwt: string, address: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, jwt);
      localStorage.setItem(ADDRESS_KEY, address);
    } catch { /* private mode */ }
  };

  const clearPersisted = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADDRESS_KEY);
    } catch { /* */ }
  };

  // ── restoreSession ────────────────────────────────────────────────────────

  const restoreSession = useCallback(async () => {
    const jwt = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!jwt) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/session`, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        // Token expired or invalid — clear
        clearPersisted();
        setToken(null);
        setUser(null);
        setStatus('idle');
        return;
      }

      const body = await res.json();
      const profile = body.data;

      setUser({
        address:        profile.address,
        chainId:        profile.chainId ?? 0,
        isRegistered:   profile.isRegistered,
        userId:         profile.userId,
        sponsor:        profile.sponsor,
        isQualified:    profile.isQualified,
        daoMember:      profile.daoMember,
        daoPosition:    profile.daoPosition,
        nftBadgesCount: profile.nftBadgesCount,
      });
      setToken(jwt);
      setStatus('authenticated');
    } catch {
      // Network error — keep token for retry, don't clear
    }
  }, []);

  // ── signIn ────────────────────────────────────────────────────────────────

  const signIn = useCallback(async (): Promise<boolean> => {
    if (!wallet.isConnected || !wallet.hexAddress) {
      setError('Connect your TrobSafe wallet before signing in.');
      setStatus('error');
      return false;
    }

    const address = wallet.hexAddress; // canonical 0x lower-case
    setError(null);

    try {
      // 1. Request nonce
      setStatus('requesting_nonce');
      const nonceRes = await fetch(`${API_BASE}/api/auth/nonce`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ address }),
      });

      if (!nonceRes.ok) {
        throw new Error(`Nonce request failed (${nonceRes.status})`);
      }
      const nonceBody = await nonceRes.json();
      const nonce: string = nonceBody.data?.nonce;
      if (!nonce) throw new Error('Server returned empty nonce.');

      // 2. Build SIWE message
      const domain    = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
      const uri       = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const issuedAt  = new Date().toISOString();
      const chainId   = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '31337', 10);

      const message = buildSiweMessage({
        domain,
        address,
        nonce,
        chainId,
        issuedAt,
        uri,
        statement: 'Sign in to EQUORA Genesis DAO with your TrobSafe wallet.',
      });

      // 3. Ask TrobSafe to sign
      setStatus('waiting_signature');
      const signature = await wallet.signMessage(message);

      // 4. Verify on server
      setStatus('verifying');
      const verifyRes = await fetch(`${API_BASE}/api/auth/verify`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) {
        const errBody = await verifyRes.json().catch(() => ({}));
        throw new Error(errBody?.error ?? `Verification failed (${verifyRes.status})`);
      }

      const verifyBody = await verifyRes.json();
      const jwt: string   = verifyBody.data?.token;
      const userData      = verifyBody.data?.user;

      if (!jwt) throw new Error('Server did not return a token.');

      // 5. Fetch full session profile (includes daoMember, daoPosition)
      const sessionRes = await fetch(`${API_BASE}/api/auth/session`, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: 'no-store',
      });
      const sessionBody = sessionRes.ok ? await sessionRes.json() : { data: {} };
      const profile     = sessionBody.data ?? {};

      const authUser: AuthUser = {
        address:        userData?.address ?? address,
        chainId:        userData?.chainId ?? chainId,
        isRegistered:   userData?.isRegistered ?? false,
        userId:         userData?.userId ?? null,
        sponsor:        userData?.sponsor ?? null,
        isQualified:    userData?.isQualified ?? false,
        daoMember:      profile.daoMember  ?? false,
        daoPosition:    profile.daoPosition ?? null,
        nftBadgesCount: profile.nftBadgesCount ?? 0,
      };

      persist(jwt, address);
      setToken(jwt);
      setUser(authUser);
      setStatus('authenticated');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      setError(msg);
      setStatus('error');
      return false;
    }
  }, [wallet]);

  // ── signOut ───────────────────────────────────────────────────────────────

  const signOut = useCallback(() => {
    clearPersisted();
    setToken(null);
    setUser(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    status,
    user,
    token,
    error,
    isAuthenticated: status === 'authenticated' && !!token,
    signIn,
    signOut,
    restoreSession,
  };
}
