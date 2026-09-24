'use client';

import React from 'react';
import Image from 'next/image';

export const LandingMovement: React.FC = () => {
  const stats = [
    { value: '100', label: 'Council Seats' },
    { value: '68+', label: 'Countries' },
    { value: '120K', label: 'Community' },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text & Stats Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFF8FF] border border-[#D1E9FF]">
              <span className="text-[12px] font-semibold tracking-wider text-[#155EEF] font-inter uppercase">
                Who We Are
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold font-inter text-[#0B132B] leading-[1.12] tracking-tight">
              We&apos;re not just a DAO.<br />
              <span className="text-[#155EEF]">We&apos;re a movement.</span>
            </h2>

            {/* Paragraphs */}
            <div className="space-y-4 text-[15px] sm:text-[16px] text-[#475467] leading-relaxed font-inter">
              <p>
                100 early believers who saw the power of decentralized governance and decided to build something permanent. Not a temporary hype cycle. A sovereign collective with real treasury yield.
              </p>
              <p>
                Each Genesis Council member holds permanent voting authority and lifetime rights to the Protocol Matrix. Zero dilution. Pure alignment.
              </p>
            </div>

            {/* 3 Stat Cards Row */}
            <div className="pt-4 grid grid-cols-3 gap-2.5 sm:gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="p-3 sm:p-4 md:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 text-center shadow-[0_2px_8px_rgba(15,23,42,0.02)] hover:shadow-md transition-shadow"
                >
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold font-sora text-[#0B132B] tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#64748B] font-medium mt-1 truncate">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Column with Movement Image & Badges */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[540px]">
              {/* Main Image Frame */}
              <div className="relative aspect-[568/480] w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-100">
                <Image
                  src="/landing/movement-hands.png"
                  alt="EQUORA Genesis Community Movement"
                  fill
                  className="object-cover"
                />

                {/* Floating Badge Top Right: 100 SEATS ONLY */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 px-4 py-2 rounded-full bg-[#155EEF] text-white text-[12px] font-bold tracking-wide shadow-[0_4px_16px_rgba(21,94,239,0.5)] border border-blue-400/50 backdrop-blur-md">
                  100 SEATS ONLY
                </div>

                {/* Floating Card Bottom Left: Multiverse */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#0052FF] flex items-center justify-center shadow-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-[#0B132B] font-inter">
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
