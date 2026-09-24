'use client';

import React from 'react';
import { ArrowLeftRight, Trash2, ChevronRight } from 'lucide-react';

export default function WalletManagementCard() {
  const handleSwitch = () => {
    alert('Switch wallet modal requested.');
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect your current wallet from this DAO portal?')) {
      alert('Wallet disconnected.');
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-[#E2ECF9] p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-[#071A4A]">
          Wallet Management
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          Manage your wallet connection and permissions.
        </p>
      </div>

      {/* 2 Rows */}
      <div className="space-y-3 pt-1">
        {/* Row 1: Switch Wallet */}
        <div
          onClick={handleSwitch}
          className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9] cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#071A4A] group-hover:text-[#155EEF] transition-colors">
                Switch Wallet
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                Connect a different wallet to your account.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#155EEF] transition-colors" />
        </div>

        {/* Row 2: Disconnect Wallet */}
        <div
          onClick={handleDisconnect}
          className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9] cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#071A4A] group-hover:text-[#DC2626] transition-colors">
                Disconnect Wallet
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                Disconnect your current wallet from this DAO portal.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#DC2626] transition-colors" />
        </div>
      </div>
    </div>
  );
}
