'use client';

import React from 'react';
import type { LoungeData } from '@/hooks/useApi';

interface LoungeHeroProps {
  loungeData?: LoungeData | null;
  loading?: boolean;
}

export const LoungeHero: React.FC<LoungeHeroProps> = ({ loungeData, loading }) => {
  const memberId = loungeData?.soulboundPass?.memberId ?? '#???';
  const tier     = loungeData?.soulboundPass?.tier     ?? 'Genesis Council';

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E2ECF9] shadow-[0_4px_25px_rgba(15,23,42,0.03)]">
      <div className="ambient-glow top-0 right-1/4 w-96 h-96 bg-blue-400/10 pointer-events-none" />

      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between p-6 lg:p-7 xl:p-10 relative z-10 min-h-[200px] gap-4">
        <div className="space-y-2 max-w-sm lg:max-w-md xl:max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60">
            <span className="text-[11px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">
              MEMBER LOUNGE
            </span>
            {loading && (
              <span className="w-2 h-2 rounded-full bg-[#155EEF] animate-pulse" />
            )}
          </div>

          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black font-jakarta text-[#071A4A] tracking-tight pt-1">
            Your Command Center
          </h1>
          <p className="text-xs lg:text-sm text-[#4F6184] leading-relaxed font-jakarta">
            Track your earnings, manage your seat, and help govern the future.
          </p>
          {loungeData?.isMember && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-[#60739A] font-jakarta">{tier}</span>
              <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
              <span className="text-xs font-bold text-[#155EEF] font-mono">{memberId}</span>
            </div>
          )}
          <p className="text-xs text-[#94A3B8] italic font-jakarta pt-0.5">
            "Ownership today. A stronger tomorrow."
          </p>
        </div>

        <div className="flex items-center gap-4 xl:gap-8 shrink-0">
          <div className="text-right space-y-3 xl:space-y-4 select-none">
            <div className="space-y-0.5">
              <div className="text-[9px] xl:text-[10px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">100 PEOPLE</div>
              <div className="text-[9px] xl:text-[10px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">1 PROTOCOL</div>
              <div className="text-[9px] xl:text-[10px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">REAL IMPACT</div>
            </div>
            <div className="space-y-0.5 pt-1">
              <div className="text-[9px] xl:text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">GOVERNANCE</div>
              <div className="text-[9px] xl:text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">INCOME</div>
              <div className="text-[9px] xl:text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">FREEDOM</div>
            </div>
          </div>
          <div className="relative w-32 h-32 lg:w-36 lg:h-36 xl:w-48 xl:h-48 flex items-center justify-center shrink-0">
            <div className="absolute inset-2 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />
            <div className="absolute w-28 h-28 lg:w-32 lg:h-32 xl:w-40 xl:h-40 rounded-full border border-blue-200/50 -rotate-45 pointer-events-none" />
            <div className="absolute w-22 h-22 lg:w-26 lg:h-26 xl:w-32 xl:h-32 rounded-full border border-blue-300/40 rotate-12 pointer-events-none" />
            <div className="relative w-20 h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32 flex items-center justify-center animate-float">
              <img src="/dao/Central 3D Vector Polygonal Floating Ethereum-Style Shape.png" alt="3D Ethereum Jewel"
                className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(21,94,239,0.35)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden flex items-center justify-between p-5 sm:p-6 gap-4 relative z-10">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60">
            <span className="text-[10px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">MEMBER LOUNGE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">Your Command Center</h1>
          {loungeData?.isMember && (
            <p className="text-xs font-bold font-mono text-[#155EEF]">{memberId}</p>
          )}
          <p className="text-xs text-[#4F6184] leading-relaxed font-jakarta">Track your earnings, manage your seat, and help govern the future.</p>
        </div>
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
          <div className="absolute inset-1 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 animate-float">
            <img src="/dao/Central 3D Vector Polygonal Floating Ethereum-Style Shape.png" alt="3D Jewel"
              className="w-full h-full object-contain drop-shadow-[0_8px_18px_rgba(21,94,239,0.3)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
