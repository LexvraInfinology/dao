'use client';

import React from 'react';
import { Trash2, Power } from 'lucide-react';

export default function SettingsDangerZone() {
  const handleDeactivate = () => {
    if (confirm('Are you sure you want to deactivate access? This will disconnect your wallet from the DAO portal.')) {
      alert('Wallet access disconnected.');
    }
  };

  return (
    <>
      {/* ================= DESKTOP DANGER ZONE (lg:flex) ================= */}
      <div className="hidden lg:flex items-center justify-between rounded-2xl bg-[#FEF2F2]/60 border border-[#FECACA] p-4 sm:px-6 shadow-[0_2px_10px_rgba(239,68,68,0.03)] font-jakarta">
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
              These actions are irreversible. Proceed with caution. Disconnect your wallet from this DAO portal.
            </p>
          </div>
        </div>

        {/* Right: Deactivate Button */}
        <button
          onClick={handleDeactivate}
          className="px-5 py-2.5 rounded-xl bg-white border border-[#FCA5A5] text-[#DC2626] hover:bg-red-50 font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          Deactivate Access
        </button>
      </div>

      {/* ================= MOBILE DANGER ZONE (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-[#FEF2F2]/70 border border-[#FECACA]/60 p-4 space-y-3.5 font-jakarta">
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
          onClick={handleDeactivate}
          className="w-full py-3 rounded-xl bg-white border border-[#FCA5A5] text-[#DC2626] hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Power className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Deactivate Access</span>
        </button>
      </div>
    </>
  );
}
