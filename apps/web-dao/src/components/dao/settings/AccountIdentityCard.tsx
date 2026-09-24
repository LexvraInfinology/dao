'use client';

import React, { useState } from 'react';
import { Crown, Copy, Check, Box } from 'lucide-react';

interface AccountIdentityCardProps {
  className?: string;
}

export default function AccountIdentityCard({ className = '' }: AccountIdentityCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('0x8A3F4c19B8204eA367E3F45E2091F2');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ================= DESKTOP IDENTITY CARD (lg:flex) ================= */}
      <div
        className={`hidden lg:flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta ${
          className || 'h-full min-h-[460px]'
        }`}
      >
        {/* Glowing 3D Spherical Avatar with Fingerprint */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <img
            src="/dao/Futuristic Glowing Blue 3D Spherical Avatar_margin.png"
            alt="Futuristic Glowing Blue 3D Avatar"
            className="w-full h-full object-contain drop-shadow-[0_10px_35px_rgba(21,94,239,0.28)]"
          />
        </div>

        {/* Member Name */}
        <h2 className="text-2xl font-black text-[#071A4A] tracking-tight mt-6 mb-3 font-jakarta">
          Member #1042
        </h2>

        {/* Status Badges */}
        <div className="flex flex-col items-center gap-2">
          {/* Active Member */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            <span>Active Member</span>
          </div>

          {/* Council Seat #86 */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] text-xs font-semibold">
            <Crown className="w-3.5 h-3.5 text-[#155EEF]" />
            <span>Council Seat #86</span>
          </div>
        </div>

        {/* Wallet Address Box */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] text-xs font-mono text-[#475569]">
          <span>0x8A3F...91F2</span>
          <button
            onClick={handleCopy}
            className="text-[#64748B] hover:text-[#155EEF] transition-colors cursor-pointer"
            title="Copy wallet address"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* ================= MOBILE IDENTITY CARD (lg:hidden) ================= */}
      <div className="lg:hidden p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2ECF9] shadow-[0_2px_15px_rgba(21,94,239,0.02)] flex items-center gap-3 sm:gap-3.5 font-jakarta">
        {/* Left Glowing Orb Avatar */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-b from-[#0284FE] via-[#0062E3] to-[#0047C7] shadow-[0_4px_16px_rgba(2,132,254,0.35)] border border-[#38BDF8]/40">
          <Box className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={1.75} />
        </div>

        {/* Right Info */}
        <div className="min-w-0 flex-1">
          {/* Top Line: Member #1042 + Active Member */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-black text-[#071A4A] tracking-tight">
              Member #1042
            </h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[11px] font-semibold border border-[#A7F3D0]/50">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>Active Member</span>
            </div>
          </div>

          {/* Bottom Line: Council Seat #86 + Wallet Address */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE]/70 text-[#155EEF] text-xs font-semibold">
              Council Seat #86
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2ECF9] text-[#475569] text-xs font-mono">
              <span>0x8A3F...91F2</span>
              <button
                onClick={handleCopy}
                className="text-[#64748B] hover:text-[#155EEF] transition-colors cursor-pointer"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
