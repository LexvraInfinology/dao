'use client';

import React from 'react';
import type { LoungeData } from '@/hooks/useApi';

interface TreasuryHeroProps {
  balance?: number;
  totalReceivedUsd?: number;
  totalReceivedTrob?: number;
  loungeData?: LoungeData | null;
}

export const TreasuryHero: React.FC<TreasuryHeroProps> = ({
  balance = 0,
  totalReceivedUsd,
  totalReceivedTrob,
  loungeData,
}) => {
  const displayUsd = totalReceivedUsd ?? loungeData?.totalReceivedUsd ?? balance ?? 0;
  const displayTrob = totalReceivedTrob ?? (displayUsd / 0.056);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E2ECF9] shadow-[0_4px_25px_rgba(15,23,42,0.03)]">
      <div className="ambient-glow top-0 right-1/4 w-96 h-96 bg-blue-400/10 pointer-events-none" />

      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between p-8 lg:p-10 relative z-10 min-h-[200px]">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60">
            <span className="text-[11px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">TREASURY</span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-black font-jakarta tracking-tight pt-1">
            <span className="text-[#071A4A]">Transparent Funds. </span>
            <span className="text-[#155EEF]">On-Chain.</span>
          </h1>
          <p className="text-sm text-[#4F6184] leading-relaxed font-jakarta">
            Track DAO treasury inflows and automated distributions. All cashbacks and pool earnings are pushed directly into member wallets on-chain with zero gas fees.
          </p>
          <div className="flex items-center gap-3 pt-1 flex-wrap text-xs font-jakarta">
            <span className="text-[#60739A]">Total Received On-Chain:</span>
            <span className="font-black text-[#059669] text-base">
              ${displayUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </span>
            <span className="text-[#CBD5E1]">·</span>
            <span className="font-semibold text-[#155EEF]">
              ≈ {displayTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB
            </span>
            <span className="text-[#CBD5E1]">·</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[10px] font-bold text-[#047857]">
              Pushed Directly to Wallet
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8 shrink-0">
          <div className="text-right space-y-3 select-none">
            <div className="space-y-0.5">
              {['TRUST', 'TRANSPARENCY', 'COMMUNITY', 'GROWTH'].map((t) => (
                <div key={t} className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">{t}</div>
              ))}
            </div>
            <div className="space-y-0.5 pt-1">
              {['THE TREASURY', 'BUILDS A STRONGER', 'TOMORROW'].map((t) => (
                <div key={t} className="text-[10px] font-black font-jakarta text-[#155EEF] uppercase tracking-wider">{t}</div>
              ))}
            </div>
          </div>
          <div className="relative w-40 h-40 xl:w-44 xl:h-44 flex items-center justify-center">
            <div className="absolute inset-1 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none animate-pulse">
              <img src="/dao/equoranewlogo.png" alt="EQUORA Accent" className="w-full h-full object-contain" />
            </div>
            <div className="relative w-28 h-28 xl:w-32 xl:h-32 animate-float flex items-center justify-center">
              <img src="/dao/equoranewlogo.png" alt="3D Treasury EQUORA Emblem"
                className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(21,94,239,0.35)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden flex items-center justify-between p-5 sm:p-6 gap-4 relative z-10">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60">
            <span className="text-[10px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">TREASURY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-jakarta text-[#071A4A] tracking-tight leading-tight">
            Transparent Funds.<br />On-Chain.
          </h1>
          <div className="space-y-0.5 pt-0.5">
            <div className="text-lg min-[360px]:text-xl font-black text-[#059669] font-jakarta tracking-tight">
              +${displayUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </div>
            <div className="text-[11px] font-semibold text-[#155EEF] font-jakarta truncate">
              ≈ {displayTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB (Direct On-Chain Push)
            </div>
          </div>
          <p className="text-[11px] text-[#4F6184] leading-relaxed font-jakarta pt-0.5">
            Pushed directly into your connected wallet with zero gas fees.
          </p>
        </div>
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
          <div className="absolute inset-1 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 animate-float">
            <img src="/dao/equoranewlogo.png" alt="3D Treasury EQUORA Emblem"
              className="w-full h-full object-contain drop-shadow-[0_8px_18px_rgba(21,94,239,0.3)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
