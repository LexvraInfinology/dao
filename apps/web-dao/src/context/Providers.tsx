'use client';

import React from 'react';
import { WalletProvider } from './WalletContext';
import { AuthProvider } from './AuthContext';

/**
 * Providers — single 'use client' boundary that wraps all global context.
 * Import once in the root layout (server component).
 *
 * Order matters:
 *   WalletProvider (window.trob detection)
 *     └─ AuthProvider (depends on useWallet via useAuth)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </WalletProvider>
  );
}
