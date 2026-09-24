'use client';

import React from 'react';
import { User, BarChart2, Calendar, ShieldCheck } from 'lucide-react';

export const LoungeStatCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. YOUR SEAT */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2ECF9] shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center gap-4 hover:border-blue-200 transition-colors">
        <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/40 flex items-center justify-center text-[#155EEF] shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#60739A]">
            YOUR SEAT
          </div>
          <div className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            #0012
          </div>
          <div className="text-xs text-[#60739A] font-medium truncate">
            Soulbound NFT
          </div>
        </div>
      </div>

      {/* 2. VOTING POWER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2ECF9] shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center gap-4 hover:border-blue-200 transition-colors">
        <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/40 flex items-center justify-center text-[#155EEF] shrink-0">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#60739A]">
            VOTING POWER
          </div>
          <div className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            1.0%
          </div>
          <div className="text-xs text-[#60739A] font-medium truncate">
            1 Seat = 1 Vote
          </div>
        </div>
      </div>

      {/* 3. MEMBER SINCE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2ECF9] shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center gap-4 hover:border-blue-200 transition-colors">
        <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/40 flex items-center justify-center text-[#155EEF] shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#60739A]">
            MEMBER SINCE
          </div>
          <div className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            Jan 12, 2025
          </div>
          <div className="text-xs text-[#60739A] font-medium truncate">
            Genesis Phase 1
          </div>
        </div>
      </div>

      {/* 4. SEAT STATUS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2ECF9] shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center gap-4 hover:border-emerald-200 transition-colors">
        <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]/60 flex items-center justify-center text-[#10B981] shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#60739A]">
            SEAT STATUS
          </div>
          <div className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] mr-2 shrink-0 animate-pulse" />
            <span>Active</span>
          </div>
          <div className="text-xs text-[#60739A] font-medium truncate">
            In Good Standing
          </div>
        </div>
      </div>
    </div>
  );
};
