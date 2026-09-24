'use client';

import React from 'react';

export const CouncilSeatsHero: React.FC = () => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E2ECF9] p-5 sm:p-7 lg:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)]">
      {/* Soft Ambient Radial Backdrop */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* ===================== DESKTOP VERSION (Hidden on Mobile) ===================== */}
      <div className="hidden md:flex items-center justify-between gap-4 lg:gap-6 relative z-10">
        {/* Left Typography */}
        <div className="space-y-2.5 max-w-sm lg:max-w-md xl:max-w-xl">
          <div className="text-xs font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">
            GENESIS DAO
          </div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black font-jakarta text-[#071A4A] tracking-tight">
            Council Seats
          </h1>
          <p className="text-xs lg:text-sm text-[#4F6184] font-jakarta leading-relaxed">
            <span className="font-bold text-[#155EEF]">100</span> sovereign seats. Transparent. On-chain. Immutable.
          </p>
        </div>

        {/* Right Composition: Micro-tags + 3D Crystalline Asset */}
        <div className="flex items-center gap-3 lg:gap-4 xl:gap-6 shrink-0">
          {/* Micro-tags */}
          <div className="text-right space-y-1 select-none">
            <div className="text-[8px] lg:text-[9px] font-bold tracking-widest text-[#64748B] uppercase font-jakarta leading-tight">
              <div>SOVEREIGN</div>
              <div>OWNERSHIP</div>
              <div>COMMUNITY</div>
              <div>GOVERNANCE</div>
            </div>
            <div className="text-[8px] lg:text-[9px] font-black tracking-wide text-[#155EEF] font-jakarta pt-1">
              <div>100 SEATS • 1 PROTOCOL</div>
              <div>A STRONGER TOMORROW</div>
            </div>
          </div>

          {/* 3D Crystal Graphic matching Figma */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 flex items-center justify-center shrink-0">
            {/* Ambient Radial Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-blue-100/50 blur-lg pointer-events-none" />
            <img
              src="/dao/Futuristic 3D Crystalline Soulbound Asset graphic.png"
              alt="Soulbound Council Seats Crystal"
              className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(21,94,239,0.3)] animate-float"
            />
          </div>
        </div>
      </div>

      {/* ===================== MOBILE VERSION (Visible only on Mobile) ===================== */}
      <div className="md:hidden flex items-center justify-between gap-4 relative z-10">
        {/* Left Side */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]">
            <span className="text-[11px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">
              PHASE 1
            </span>
          </div>
          <h1 className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            Council Seats
          </h1>
          <p className="text-xs text-[#4F6184] font-jakarta leading-relaxed">
            <span className="font-bold text-[#155EEF]">100</span> sovereign seats. Transparent. On-chain. Immutable.
          </p>
        </div>

        {/* Right 3D Crystal */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-blue-100/60 blur-md pointer-events-none" />
          <img
            src="/dao/Futuristic 3D Crystalline Soulbound Asset graphic.png"
            alt="Soulbound Council Seats Crystal"
            className="w-full h-full object-contain drop-shadow-[0_6px_16px_rgba(21,94,239,0.25)] animate-float"
          />
        </div>
      </div>
    </div>
  );
};
