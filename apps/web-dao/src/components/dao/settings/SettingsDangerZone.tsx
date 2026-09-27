'use client';

import React, { useState } from 'react';
import { Trash2, Power, AlertTriangle, X, Check } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';

export default function SettingsDangerZone() {
  const wallet = useWallet();
  const auth   = useAuthContext();
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const handleDeactivate = () => {
    // Sign out JWT session + disconnect wallet
    auth.signOut();
    wallet.disconnect();
    setShowConfirm(false);
    setDone(true);
  };

  if (done) {
    return (
      <>
        {/* Desktop — success state */}
        <div className="hidden lg:flex items-center gap-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] p-4 sm:px-6 font-jakarta">
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[#15803D]">
            Wallet disconnected successfully. You have been signed out.
          </p>
        </div>
        {/* Mobile — success state */}
        <div className="lg:hidden rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] p-4 flex items-center gap-3 font-jakarta">
          <Check className="w-5 h-5 text-[#16A34A] shrink-0" />
          <p className="text-xs font-semibold text-[#15803D]">
            Wallet disconnected and signed out.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ================= DESKTOP DANGER ZONE (lg:flex) ================= */}
      <div className="hidden lg:block font-jakarta">
        {/* Main bar */}
        <div className="flex items-center justify-between rounded-2xl bg-[#FEF2F2]/60 border border-[#FECACA] p-4 sm:px-6 shadow-[0_2px_10px_rgba(239,68,68,0.03)]">
          {/* Left: Icon + Text */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#991B1B]">
                Danger Zone
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                These actions are irreversible. Disconnect your wallet and sign out from this DAO portal.
              </p>
            </div>
          </div>

          {/* Right: Deactivate Button */}
          <button
            onClick={() => setShowConfirm(true)}
            className="px-5 py-2.5 rounded-xl bg-white border border-[#FCA5A5] text-[#DC2626] hover:bg-red-50 font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Deactivate Access
          </button>
        </div>

        {/* Inline Confirm Dialog */}
        {showConfirm && (
          <div className="mt-3 rounded-2xl bg-white border border-[#FECACA] p-5 shadow-sm flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] flex items-center justify-center text-[#DC2626] shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#991B1B]">Are you sure?</p>
              <p className="text-xs text-[#64748B] mt-0.5">
                This will disconnect your wallet and sign out from the DAO portal. You can reconnect at any time.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleDeactivate}
                  className="px-4 py-2 rounded-xl bg-[#DC2626] text-white hover:bg-red-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Yes, Disconnect
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2ECF9] text-[#475569] hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-[#94A3B8] hover:text-[#475569] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ================= MOBILE DANGER ZONE (lg:hidden) ================= */}
      <div className="lg:hidden font-jakarta">
        {/* Main bar */}
        <div className="rounded-2xl bg-[#FEF2F2]/70 border border-[#FECACA]/60 p-4 space-y-3.5">
          {/* Top: Icon + Text */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] shrink-0 mt-0.5">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#991B1B]">
                Danger Zone
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                These actions are irreversible. Proceed with caution.
              </p>
            </div>
          </div>

          {/* Bottom: Full Width Button */}
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-3 rounded-xl bg-white border border-[#FCA5A5] text-[#DC2626] hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Power className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Deactivate Access</span>
          </button>
        </div>

        {/* Mobile Confirm Dialog */}
        {showConfirm && (
          <div className="mt-3 rounded-2xl bg-white border border-[#FECACA] p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#991B1B]">Are you sure?</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  This will disconnect your wallet and sign you out. You can reconnect anytime.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={handleDeactivate}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Yes, Disconnect
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2ECF9] text-[#475569] font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
