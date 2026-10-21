'use client';

import React from 'react';
import { Monitor, LogOut, ShieldCheck, Wallet } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';

export default function ActiveSessionsCard() {
  const wallet = useWallet();
  const auth   = useAuthContext();

  const isWalletConnected = Boolean(wallet.isConnected || wallet.base58Address || wallet.hexAddress || auth.isAuthenticated);

  const shortAddress = (() => {
    const addr = wallet.base58Address ?? wallet.hexAddress ?? '';
    if (addr.length > 14) return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
    if (addr) return addr;
    return 'Local Device (Unconnected)';
  })();

  const sessionTypeLabel = auth.isAuthenticated
    ? 'SIWE Authenticated · Active now'
    : wallet.base58Address
    ? 'TrobSafe Connected · Active now'
    : wallet.isConnected
    ? 'Wallet Session · Active now'
    : 'Local Browser Session · Active';

  const handleSignOut = () => {
    if (auth.isAuthenticated) {
      auth.signOut();
    }
    wallet.disconnect();
  };

  const handleConnect = () => {
    wallet.connect().catch(() => {});
  };

  return (
    <div className="rounded-3xl bg-white border border-[#E2ECF9] p-5 sm:p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta flex flex-col justify-between space-y-4 h-full">
      {/* Header */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#071A4A]">
          Active Sessions
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          View and manage your current device and wallet sessions.
        </p>
      </div>

      {/* Row Container */}
      <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-[#E2ECF9]">
        {/* Left Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#071A4A] truncate">
              Current Session
            </h4>
            <div className="text-xs text-[#64748B] mt-0.5 font-mono truncate max-w-[200px] sm:max-w-none">
              {shortAddress}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold mt-0.5 text-[#059669]">
              {sessionTypeLabel}
            </div>
          </div>
        </div>

        {/* Right Action & Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold shrink-0 bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
            </span>
            <span>Active</span>
          </span>

          {isWalletConnected ? (
            <button
              onClick={handleSignOut}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#FEE2E2]/60 border border-[#FECACA]/60 text-[#DC2626] hover:bg-red-100/70 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              title="End active session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              title="Connect your wallet"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Security info row */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] w-fit text-[#16A34A]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
        <span className="text-[11px] sm:text-xs font-semibold text-[#16A34A]">
          Sessions are cryptographically verified by Trobium Network (EIP-4361)
        </span>
      </div>
    </div>
  );
}

