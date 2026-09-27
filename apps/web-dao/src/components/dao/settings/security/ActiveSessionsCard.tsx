'use client';

import React from 'react';
import { Monitor, ArrowRight, LogOut, ShieldCheck } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';

export default function ActiveSessionsCard() {
  const wallet = useWallet();
  const auth   = useAuthContext();

  const isAuthenticated = auth.isAuthenticated;
  const shortAddress = (() => {
    const addr = wallet.base58Address ?? wallet.hexAddress ?? '';
    return addr.length > 14 ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : addr || '—';
  })();

  const handleSignOut = () => {
    auth.signOut();
    wallet.disconnect();
  };

  return (
    <>
      {/* ================= DESKTOP VIEW (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-[#071A4A]">
            Active Sessions
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            View and manage your active wallet sessions.
          </p>
        </div>

        {/* Row Container */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
          {/* Left Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
                Current Session
              </h4>
              <div className="text-xs text-[#64748B] mt-0.5 font-mono">
                {shortAddress}
              </div>
              <div className={`text-xs font-medium mt-0.5 ${isAuthenticated ? 'text-[#059669]' : 'text-slate-400'}`}>
                {isAuthenticated ? 'JWT Authenticated · Active now' : 'Not authenticated'}
              </div>
            </div>
          </div>

          {/* Right Action & Status */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isAuthenticated
                ? 'bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669]'
                : 'bg-slate-100 border border-slate-200 text-slate-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAuthenticated ? 'bg-[#059669]' : 'bg-slate-400'}`} />
              <span>{isAuthenticated ? 'Active' : 'Inactive'}</span>
            </span>

            {isAuthenticated && (
              <button
                onClick={handleSignOut}
                className="px-3.5 py-1.5 rounded-xl bg-[#FEE2E2]/60 border border-[#FECACA]/60 text-[#DC2626] hover:bg-red-100/70 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Security info row */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] w-fit">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span className="text-[11px] font-semibold text-[#16A34A]">
            Sessions are protected by SIWE wallet signature (EIP-4361)
          </span>
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-xs font-jakarta space-y-3.5">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-[#071A4A]">
            Active Sessions
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            View and manage your active wallet sessions.
          </p>
        </div>

        {/* Row Box */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#071A4A]">
                Current Session
              </h4>
              <div className={`text-[11px] font-medium mt-0.5 ${isAuthenticated ? 'text-[#059669]' : 'text-slate-400'}`}>
                {isAuthenticated ? 'Active now' : 'Not authenticated'}
              </div>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            isAuthenticated
              ? 'bg-[#ECFDF5] border border-[#A7F3D0]/50 text-[#059669]'
              : 'bg-slate-100 border border-slate-200 text-slate-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAuthenticated ? 'bg-[#059669]' : 'bg-slate-400'}`} />
            <span>{isAuthenticated ? 'Active' : 'Inactive'}</span>
          </span>
        </div>

        {/* Bottom Link */}
        {isAuthenticated && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSignOut}
              className="text-xs font-bold text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
        {!isAuthenticated && (
          <div className="flex justify-end pt-1">
            <span className="text-xs font-bold text-[#155EEF] flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Connect wallet to start a session</span>
            </span>
          </div>
        )}
      </div>
    </>
  );
}
