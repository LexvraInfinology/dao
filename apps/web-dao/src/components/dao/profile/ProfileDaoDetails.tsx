'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  LayoutGrid,
  Copy,
  Check,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ProfileDaoDetails: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('0x8A3F...91F2');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      {/* =========================================================================
          DESKTOP VIEW (Visible on lg and above - exactly matching Desktop Figma)
         ========================================================================= */}
      <div className="hidden lg:block bg-white border border-[#E2ECF9] rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF2FE] text-[#155EEF] flex items-center justify-center shrink-0">
              <Box className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-jakarta text-[#071A4A]">
              DAO Details
            </h3>
          </div>

          <span className="px-2.5 py-0.5 rounded-md bg-[#EEF2FE] text-[#155EEF] text-[10px] font-bold font-mono uppercase tracking-wider">
            IMMUTABLE RECORD
          </span>
        </div>

        {/* Rows with clean dividers */}
        <div className="space-y-0 text-xs font-jakarta divide-y divide-[#F8FAFC]">
          {/* Member ID */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Member ID</span>
            <span className="font-bold text-[#071A4A]">#1042</span>
          </div>

          {/* Council Seat */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Council Seat</span>
            <Link
              href="/dao/seats"
              className="font-bold text-[#155EEF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Seat #86</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Connected Wallet */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Connected Wallet</span>
            <div className="flex items-center gap-1.5 font-mono text-[#071A4A] font-semibold">
              <span>0x8A3F...91F2</span>
              <button
                onClick={handleCopy}
                className="text-[#64748B] hover:text-[#155EEF] transition-colors cursor-pointer"
                title="Copy address"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Voting Power */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Voting Power</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-[#071A4A]">1.0%</span>
              <span className="text-[#64748B] font-medium">(Genesis Tier)</span>
            </div>
          </div>

          {/* Member Since */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Member Since</span>
            <span className="font-bold text-[#071A4A]">Aug 12, 2026</span>
          </div>

          {/* Soulbound NFT */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Soulbound NFT</span>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EEF2FE] text-[#155EEF] font-bold text-xs font-mono">
              <Lock className="w-3 h-3" />
              <span>#0086</span>
            </div>
          </div>
        </div>

        {/* Bottom Notice Box */}
        <div className="p-3.5 rounded-2xl bg-[#F0F5FF] border border-[#DCE7F6]/60 flex items-start gap-2.5 mt-4">
          <ShieldCheck className="w-4 h-4 text-[#155EEF] shrink-0 mt-0.5" />
          <p className="text-xs text-[#4F6184] font-jakarta leading-relaxed">
            Non-transferable Soulbound governance parameters secured by Trobium Core consensus.
          </p>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (Visible below lg - exactly matching Mobile Figma)
         ========================================================================= */}
      <div className="lg:hidden bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#155EEF]" />
            <h3 className="text-sm font-bold font-jakarta text-[#071A4A]">
              DAO Details
            </h3>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-[#EEF2FE] text-[#155EEF] text-[9px] font-bold uppercase tracking-wider font-mono">
            CANONICAL
          </span>
        </div>

        {/* Shaded Alternating Zebra Rows */}
        <div className="space-y-1 text-xs font-jakarta">
          {/* Row 1 (Shaded) */}
          <div className="bg-[#F0F4FC] rounded-xl px-3 py-2.5 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Member ID</span>
            <span className="font-bold text-[#071A4A]">#1042</span>
          </div>

          {/* Row 2 (White) */}
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Council Seat</span>
            <Link
              href="/dao/seats"
              className="font-bold text-[#155EEF] hover:underline"
            >
              Seat #86
            </Link>
          </div>

          {/* Row 3 (Shaded) */}
          <div className="bg-[#F0F4FC] rounded-xl px-3 py-2.5 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Wallet</span>
            <span className="font-mono font-bold text-[#071A4A]">0x8A3F...91F2</span>
          </div>

          {/* Row 4 (White) */}
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Voting Power</span>
            <span className="font-bold text-[#071A4A]">1.0% (1 Vote)</span>
          </div>

          {/* Row 5 (Shaded) */}
          <div className="bg-[#F0F4FC] rounded-xl px-3 py-2.5 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Member Since</span>
            <span className="font-bold text-[#071A4A]">Aug 12, 2026</span>
          </div>

          {/* Row 6 (White) */}
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Soulbound NFT</span>
            <div className="flex items-center gap-1 font-mono font-bold text-[#071A4A]">
              <Lock className="w-3 h-3 text-[#155EEF]" />
              <span>#0086</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
