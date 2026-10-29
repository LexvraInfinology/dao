'use client';

import React from 'react';
import Image from 'next/image';

export const LandingMovement: React.FC = () => {
  const stats = [
    { value: '100', label: 'Council Seats', shortLabel: 'Seats' },
    { value: '68+', label: 'Countries', shortLabel: 'Nations' },
    { value: '120K', label: 'Community', shortLabel: 'Members' },
  ];

  return (
    <section id="about" className="scroll-mt-24 pt-6 sm:pt-12 lg:pt-14 pb-8 sm:pb-14 lg:pb-16 bg-[#FFFFFF] relative overflow-hidden border-b border-slate-200/80">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Text & Stats Column */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF8FF] border border-[#D1E9FF]">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#155EEF] uppercase font-inter">
                Who We Are
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-xl sm:text-3xl lg:text-[42px] font-bold uppercase text-[#0B132B] leading-tight tracking-tight">
              We&apos;re not just a DAO.<br />
              <span className="text-[#155EEF]">We&apos;re a movement.</span>
            </h2>

            {/* Paragraphs — Compact on mobile */}
            <div className="space-y-2.5 sm:space-y-4 text-xs sm:text-base text-[#475467] leading-relaxed">
              <p>
                100 early believers building permanent decentralized governance with real protocol treasury yield and lifetime rights.
              </p>
              <p className="hidden sm:block">
                Each Genesis Council member holds permanent voting authority and lifetime rights to the Protocol Matrix. Zero dilution. Pure alignment.
              </p>
            </div>

            {/* 3 Stat Cards Row — Fits cleanly without ugly truncation */}
            <div className="pt-2 sm:pt-4 grid grid-cols-3 gap-2 sm:gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="p-2.5 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-[#F8FAFC] border border-slate-200/80 text-center shadow-[0_2px_8px_rgba(15,23,42,0.02)] hover:shadow-md transition-shadow"
                >
                  <div className="text-base sm:text-2xl md:text-3xl font-bold leading-none tabular-nums text-[#0B132B]">
                    {s.value}
                  </div>
                  <div className="text-[9px] sm:text-[11px] text-[#64748B] font-semibold uppercase tracking-wider mt-1 sm:mt-1.5 whitespace-nowrap">
                    <span className="sm:hidden">{s.shortLabel}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Column with Movement Image & Badges */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[420px] sm:max-w-[540px]">
              {/* Main Image Frame */}
              <div className="relative aspect-[568/460] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(15,23,42,0.1)] border border-slate-100">
                <Image
                  src="/landing/movement-hands.webp"
                  alt="EQUORA Genesis Community Movement"
                  fill
                  sizes="(max-width: 768px) 100vw, 540px"
                  loading="lazy"
                  className="object-cover"
                />

                {/* Floating Badge Top Right: 100 SEATS ONLY */}
                <div className="absolute top-3 right-3 sm:top-6 sm:right-6 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#155EEF] text-white text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider shadow-[0_4px_16px_rgba(21,94,239,0.5)] border border-blue-400/50">
                  100 SEATS ONLY
                </div>

                {/* Floating Card Bottom Left: Multiverse */}
                <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/95 border border-white/80 shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#0052FF] flex items-center justify-center shadow-xs">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#0B132B]">
                    Multiverse
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
