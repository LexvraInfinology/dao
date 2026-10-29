'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAuth, type AuthState } from '@/hooks/useAuth';

/**
 * AuthContext — wraps the useAuth hook and makes the session available globally.
 *
 * Must be nested INSIDE <WalletProvider> since useAuth depends on useWallet.
 *
 * On mount, automatically restores any existing JWT session from localStorage.
 */

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // Restore session from localStorage on first mount
  useEffect(() => {
    auth.restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuthContext — consume authentication state from any client component.
 *
 * @throws if used outside <AuthProvider>
 */
export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return ctx;
}
