'use client';

import React from 'react';
import { User } from 'lucide-react';

export const LoungeCompactMemberCard: React.FC = () => {
  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex items-center justify-between gap-3">
      {/* Left Icon + Text Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/40 flex items-center justify-center text-[#155EEF] shrink-0">
          <User className="w-5 h-5" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-black font-jakarta text-[#071A4A] tracking-tight">
              #0012
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[10px] font-semibold text-[#60739A]">
              Soulbound NFT
            </span>
          </div>

          <div className="text-[10px] sm:text-[11px] text-[#60739A] font-medium flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span>1.0% Voting Power</span>
            <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
            <span>Member Since Jan 2025</span>
          </div>
        </div>
      </div>

      {/* Right Status Pill */}
      <div className="shrink-0">
        <span className="px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-xs font-bold text-[#059669] shadow-2xs">
          Active
        </span>
      </div>
    </div>
  );
};
