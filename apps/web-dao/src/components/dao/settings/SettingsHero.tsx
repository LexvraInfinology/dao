'use client';

import React from 'react';

export default function SettingsHero() {
  return (
    <>
      {/* ================= DESKTOP HERO (lg:flex) ================= */}
      <div className="hidden lg:flex relative rounded-3xl bg-white border border-[#E2ECF9] p-8 shadow-[0_4px_25px_rgba(21,94,239,0.03)] items-center justify-between min-h-[160px] overflow-hidden">
        {/* Left Content */}
        <div className="space-y-1.5 z-10 max-w-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
            <span className="text-xs font-bold text-[#155EEF] uppercase tracking-wider font-jakarta">
              SETTINGS
            </span>
          </div>
          <h1 className="text-[32px] font-bold text-[#071A4A] tracking-tight font-jakarta">
            Account & Preferences
          </h1>
          <p className="text-sm text-[#4F6184] font-normal leading-relaxed font-jakarta">
            Manage your DAO account and security preferences.
          </p>
        </div>

        {/* Right Graphic: Polyhedral Vector + Microcopy */}
        <div className="flex items-center gap-6 z-10 shrink-0">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <img
              src="/dao/Polyhedral Vector.png"
              alt="Polyhedral Isometric Cube"
              className="w-full h-full object-contain drop-shadow-[0_4px_20px_rgba(21,94,239,0.12)]"
            />
          </div>

          <div className="flex flex-col text-right font-jakarta">
            <span className="text-[10px] tracking-[0.2em] font-semibold text-[#64748B] uppercase leading-[1.35]">
              PEOPLE
            </span>
            <span className="text-[10px] tracking-[0.2em] font-semibold text-[#64748B] uppercase leading-[1.35]">
              OWNERSHIP
            </span>
            <span className="text-[10px] tracking-[0.2em] font-semibold text-[#64748B] uppercase leading-[1.35]">
              GOVERNANCE
            </span>
            <span className="text-[10px] tracking-[0.2em] font-semibold text-[#64748B] uppercase leading-[1.35]">
              FREEDOM
            </span>

            <span className="text-[10px] tracking-[0.15em] font-bold text-[#155EEF] uppercase mt-2">
              A SAFER TOMORROW
            </span>
          </div>
        </div>
      </div>

      {/* ================= MOBILE HERO (lg:hidden) ================= */}
      <div className="lg:hidden relative rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-[0_2px_15px_rgba(21,94,239,0.02)] flex items-center justify-between overflow-hidden">
        {/* Left Content */}
        <div className="z-10">
          <div className="inline-block px-3 py-0.5 rounded-full bg-[#EEF5FF] text-[#155EEF] font-bold text-[11px] uppercase tracking-wide font-jakarta mb-2">
            SETTINGS
          </div>
          <h1 className="text-[22px] font-extrabold text-[#071A4A] leading-[1.2] tracking-tight font-jakarta mb-2">
            Account &<br />Preferences
          </h1>
          <p className="text-xs text-[#4F6184] leading-relaxed max-w-[210px] font-jakarta">
            Manage your DAO account and security preferences.
          </p>
        </div>

        {/* Right Graphic: 3D Crystalline Ethereum Jewel with glow */}
        <div className="relative shrink-0 flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 bg-[#155EEF]/10 rounded-full blur-xl pointer-events-none" />
          <img
            src="/dao/3D Crystalline Ethereum Jewel Visual.png"
            alt="3D Crystalline Ethereum Jewel Visual"
            className="w-20 h-20 object-contain relative z-10 drop-shadow-[0_4px_16px_rgba(21,94,239,0.18)]"
          />
        </div>
      </div>
    </>
  );
}
