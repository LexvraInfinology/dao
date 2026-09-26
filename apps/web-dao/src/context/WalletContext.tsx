'use client';

import React, { createContext, useContext } from 'react';
import { useTrobWallet, type TrobWalletState } from '@/hooks/useTrobWallet';

/**
 * WalletContext — makes TrobSafe wallet state available throughout the app.
 *
 * Wrap the root layout with <WalletProvider> once.
 * Anywhere in the tree: const wallet = useWallet();
 */

const WalletContext = createContext<TrobWalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wallet = useTrobWallet();
  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * useWallet — consume TrobSafe wallet state from any client component.
 *
 * @throws if used outside <WalletProvider>
 */
export function useWallet(): TrobWalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used inside <WalletProvider>');
  }
  return ctx;
}
