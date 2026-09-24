'use client';

import React from 'react';
import { Gem } from 'lucide-react';

export default function WalletInformationCard() {
  return (
    <>
      {/* ================= DESKTOP VIEW (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-[#071A4A]">
            Wallet Information
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Details about your connected wallet.
          </p>
        </div>

        {/* 5 Rows */}
        <div className="space-y-3 pt-1">
          {/* Row 1: Network */}
          <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
            <span className="text-xs font-medium text-[#64748B]">Network</span>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#071A4A]">
                <Gem className="w-3.5 h-3.5 text-[#155EEF]" />
                <span>Trobium Blockchain</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
                <span>Supported</span>
              </span>
            </div>
          </div>

          {/* Row 2: Wallet Type */}
          <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
            <span className="text-xs font-medium text-[#64748B]">Wallet Type</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#071A4A]">
              <span>🦊</span>
              <span>MetaMask</span>
            </div>
          </div>

          {/* Row 3: Connection Date */}
          <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
            <span className="text-xs font-medium text-[#64748B]">Connection Date</span>
            <span className="text-xs font-medium text-[#071A4A]">
              Aug 12, 2026, 10:24 AM
            </span>
          </div>

          {/* Row 4: Last Activity */}
          <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
            <span className="text-xs font-medium text-[#64748B]">Last Activity</span>
            <span className="text-xs font-medium text-[#071A4A]">
              Aug 14, 2026, 04:12 PM
            </span>
          </div>

          {/* Row 5: Status */}
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-medium text-[#64748B]">Status</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-3.5 sm:p-5 shadow-xs font-jakarta space-y-3 sm:space-y-3.5">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-[#071A4A]">
            Wallet Information
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Details about your connected institutional credentials.
          </p>
        </div>

        {/* 5 Shaded Rows */}
        <div className="space-y-1.5 pt-1">
          {/* Row 1: Network */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B] shrink-0">Network</span>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
              <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-[#155EEF]">
                <Gem className="w-3.5 h-3.5 text-[#155EEF] shrink-0" />
                <span className="truncate">Trobium Blockchain</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#EEF5FF] text-[#155EEF] text-[10px] font-semibold shrink-0">
                Supported
              </span>
            </div>
          </div>

          {/* Row 2: Wallet Type */}
          <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B]">Wallet Type</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#071A4A]">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
              <span>MetaMask</span>
            </div>
          </div>

          {/* Row 3: Connection Date */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B] shrink-0">Connection Date</span>
            <span className="text-[11px] sm:text-xs font-bold font-mono text-[#071A4A] text-right">
              Aug 12, 2026, 10:24 AM
            </span>
          </div>

          {/* Row 4: Last Activity */}
          <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B] shrink-0">Last Activity</span>
            <span className="text-[11px] sm:text-xs font-bold font-mono text-[#071A4A] text-right">
              Aug 14, 2026, 04:12 PM
            </span>
          </div>

          {/* Row 5: Status */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B]">Status</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>Active</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
