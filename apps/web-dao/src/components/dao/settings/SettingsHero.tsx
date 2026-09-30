'use client';

import React from 'react';

export default function SettingsHero() {
  return (
    <>
      {/* ================= DESKTOP HERO (lg:flex) ================= */}
      <div className="hidden lg:flex relative rounded-2xl bg-white border border-[#E2EEF9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(14,98,228,0.06)] items-center justify-between min-h-[140px] overflow-hidden font-sans">
        {/* Left Content */}
        <div className="space-y-1 z-10 max-w-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E62E4]" />
            <span className="text-[10px] font-bold text-[#0E62E4] uppercase tracking-wider">
              SETTINGS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#14304A] tracking-tight">
            Account & Preferences
          </h1>
          <p className="text-xs text-[#4F6D87] font-normal leading-relaxed">
            Manage your DAO account and security preferences.
          </p>
        </div>

        {/* Right Graphic: Polyhedral Vector + Microcopy */}
        <div className="flex items-center gap-5 z-10 shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <img
              src="/dao/trobiumdashboard.png"
              alt="Trobium Emblem"
              className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(14,98,228,0.2)]"
            />
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[9px] tracking-[0.2em] font-semibold text-[#4F6D87] uppercase leading-[1.35]">
              PEOPLE
            </span>
            <span className="text-[9px] tracking-[0.2em] font-semibold text-[#4F6D87] uppercase leading-[1.35]">
              OWNERSHIP
            </span>
            <span className="text-[9px] tracking-[0.2em] font-semibold text-[#4F6D87] uppercase leading-[1.35]">
              GOVERNANCE
            </span>
            <span className="text-[9px] tracking-[0.2em] font-semibold text-[#4F6D87] uppercase leading-[1.35]">
              FREEDOM
            </span>

            <span className="text-[9px] tracking-[0.15em] font-bold text-[#0E62E4] uppercase mt-1.5">
              A SAFER TOMORROW
            </span>
          </div>
        </div>
      </div>

      {/* ================= MOBILE HERO (lg:hidden) ================= */}
      <div className="lg:hidden relative rounded-xl bg-white border border-[#E2EEF9] p-4 shadow-xs flex items-center justify-between overflow-hidden font-sans">
        {/* Left Content */}
        <div className="z-10">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#0E62E4] font-semibold text-[10px] uppercase tracking-wide mb-1.5">
            SETTINGS
          </div>
          <h1 className="text-lg font-bold text-[#14304A] leading-[1.2] tracking-tight mb-1">
            Account & Preferences
          </h1>
          <p className="text-[11px] text-[#4F6D87] leading-relaxed max-w-[210px]">
            Manage your DAO account and security preferences.
          </p>
        </div>

        {/* Right Graphic: 3D Trobium Emblem with glow */}
        <div className="relative shrink-0 flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 bg-[#0E62E4]/10 rounded-full blur-md pointer-events-none" />
          <img
            src="/dao/trobiumdashboard.png"
            alt="3D Trobium Emblem"
            className="w-14 h-14 object-contain relative z-10 drop-shadow-[0_2px_8px_rgba(14,98,228,0.2)]"
          />
        </div>
      </div>
    </>
  );
}
