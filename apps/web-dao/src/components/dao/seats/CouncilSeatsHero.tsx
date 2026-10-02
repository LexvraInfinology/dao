'use client';

import React from 'react';

export const CouncilSeatsHero: React.FC = () => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-white border border-[#E2EEF9] p-4 sm:p-6 shadow-[0_2px_12px_rgba(14,98,228,0.06)] font-sans">
      {/* Soft Ambient Radial Backdrop */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 bg-[#0E62E4]/10 rounded-full blur-2xl pointer-events-none" />

      {/* ===================== DESKTOP VERSION (Hidden on Mobile) ===================== */}
      <div className="hidden md:flex items-center justify-between gap-4 lg:gap-6 relative z-10">
        {/* Left Typography */}
        <div className="space-y-1.5 max-w-sm lg:max-w-md xl:max-w-xl">
          <div className="text-[10px] font-bold text-[#0E62E4] uppercase tracking-wider">
            GENESIS DAO
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#14304A] tracking-tight">
            Council Seats
          </h1>
          <p className="text-xs text-[#4F6D87] leading-relaxed">
            <span className="font-semibold text-[#0E62E4]">100</span> sovereign seats. Transparent. On-chain. Immutable.
          </p>
        </div>

        {/* Right Composition: Micro-tags + 3D Crystalline Asset */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          {/* Micro-tags */}
          <div className="text-right space-y-0.5 select-none">
            <div className="text-[8px] lg:text-[9px] font-semibold tracking-widest text-[#4F6D87] uppercase leading-tight">
              <div>SOVEREIGN</div>
              <div>OWNERSHIP</div>
              <div>COMMUNITY</div>
              <div>GOVERNANCE</div>
            </div>
            <div className="text-[8px] lg:text-[9px] font-bold tracking-wide text-[#0E62E4] pt-0.5">
              <div>100 SEATS • 1 PROTOCOL</div>
              <div>A STRONGER TOMORROW</div>
            </div>
          </div>

          {/* 3D EQUORA Graphic */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#EFF6FF] blur-md pointer-events-none" />
            <img
              src="/dao/equoranewlogo.png"
              alt="Soulbound Council Seats EQUORA Emblem"
              className="w-full h-full object-contain drop-shadow-[0_6px_16px_rgba(14,98,228,0.25)] animate-float"
            />
          </div>
        </div>
      </div>

      {/* ===================== MOBILE VERSION (Visible only on Mobile) ===================== */}
      <div className="md:hidden flex items-center justify-between gap-3 relative z-10">
        {/* Left Side */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#EFF6FF] border border-[#0E62E4]/20">
            <span className="text-[10px] font-bold text-[#0E62E4] uppercase tracking-wider">
              GENESIS COUNCIL
            </span>
          </div>
          <h1 className="text-lg font-bold text-[#14304A] tracking-tight">
            Council Seats
          </h1>
          <p className="text-[11px] text-[#4F6D87] leading-relaxed">
            <span className="font-semibold text-[#0E62E4]">100</span> sovereign seats. Transparent. On-chain. Immutable.
          </p>
        </div>

        {/* Right 3D Emblem */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#EFF6FF] blur-xs pointer-events-none" />
          <img
            src="/dao/equoranewlogo.png"
            alt="Soulbound Council Seats EQUORA Emblem"
            className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(14,98,228,0.2)] animate-float"
          />
        </div>
      </div>
    </div>
  );
};
