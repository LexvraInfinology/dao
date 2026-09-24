'use client';

import React from 'react';

export const TreasuryHero: React.FC = () => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E2ECF9] shadow-[0_4px_25px_rgba(15,23,42,0.03)]">
      {/* Ambient background glow */}
      <div className="ambient-glow top-0 right-1/4 w-96 h-96 bg-blue-400/10 pointer-events-none" />

      {/* =========================================================================
          DESKTOP HERO (Visible on lg and above - matching Desktop Treasury)
         ========================================================================= */}
      <div className="hidden lg:flex items-center justify-between p-8 lg:p-10 relative z-10 min-h-[200px]">
        {/* Left Content */}
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60">
            <span className="text-[11px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">
              TREASURY
            </span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black font-jakarta tracking-tight pt-1">
            <span className="text-[#071A4A]">Transparent Funds. </span>
            <span className="text-[#155EEF]">On-Chain.</span>
          </h1>

          <p className="text-sm text-[#4F6184] leading-relaxed font-jakarta">
            Track DAO funds and manage your available balance.
          </p>
        </div>

        {/* Right Composition: Micro-tags + 3D Faceted Crystal with Accent */}
        <div className="flex items-center gap-8 shrink-0">
          {/* Micro-tags Stacks */}
          <div className="text-right space-y-3 select-none">
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">
                TRUST
              </div>
              <div className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">
                TRANSPARENCY
              </div>
              <div className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">
                COMMUNITY
              </div>
              <div className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">
                GROWTH
              </div>
            </div>

            <div className="space-y-0.5 pt-1">
              <div className="text-[10px] font-black font-jakarta text-[#155EEF] uppercase tracking-wider">
                THE TREASURY
              </div>
              <div className="text-[10px] font-black font-jakarta text-[#155EEF] uppercase tracking-wider">
                BUILDS A STRONGER
              </div>
              <div className="text-[10px] font-black font-jakarta text-[#155EEF] uppercase tracking-wider">
                TOMORROW
              </div>
            </div>
          </div>

          {/* 3D Crystal Graphic Composition */}
          <div className="relative w-40 h-40 xl:w-44 xl:h-44 flex items-center justify-center">
            {/* Ambient Radial Halo */}
            <div className="absolute inset-1 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

            {/* Diamond Star Accent */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none animate-pulse">
              <img
                src="/dao/Diamond Crystal Graphic Graphic Accent.png"
                alt="Accent diamond"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Central 3D Floating Crystal */}
            <div className="relative w-28 h-28 xl:w-32 xl:h-32 animate-float flex items-center justify-center">
              <img
                src="/dao/Central 3D Vector Polygonal Floating Ethereum-Style Shape.png"
                alt="3D Polyhedral Treasury Crystal"
                className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(21,94,239,0.35)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE HERO (Visible below lg - matching Mobile Treasury)
         ========================================================================= */}
      <div className="lg:hidden flex items-center justify-between p-5 sm:p-6 gap-4 relative z-10">
        {/* Left Typography */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60">
            <span className="text-[10px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">
              TREASURY
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black font-jakarta text-[#071A4A] tracking-tight leading-tight">
            Transparent Funds.<br />On-Chain.
          </h1>

          <p className="text-xs text-[#4F6184] leading-relaxed font-jakarta">
            Track DAO funds and manage your available balance.
          </p>
        </div>

        {/* Right 3D Visual */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
          <div className="absolute inset-1 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />
          <div className="absolute w-20 h-20 rounded-full border border-blue-200/50 -rotate-45 pointer-events-none" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 animate-float flex items-center justify-center">
            <img
              src="/dao/Central 3D Vector Polygonal Floating Ethereum-Style Shape.png"
              alt="3D Treasury Jewel"
              className="w-full h-full object-contain drop-shadow-[0_8px_18px_rgba(21,94,239,0.3)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
