'use client';

import React from 'react';
import MatrixCountdownCard from '@/components/dao/matrix/MatrixCountdownCard';
import MatrixFeatureCards from '@/components/dao/matrix/MatrixFeatureCards';

export default function MatrixBridgePage() {
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 animate-fadeIn font-jakarta py-4 sm:py-8 lg:py-12 max-w-5xl mx-auto w-full px-1">
      {/* Header Section (Centered) */}
      <div className="text-center flex flex-col items-center">
        {/* Status Pill Badge: COMING SOON */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EEF4FF] border border-[#BFDBFE]/60 shadow-2xs mb-4 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#155EEF]">
            COMING SOON
          </span>
        </div>

        {/* Main Heading: The Matrix Is Coming. */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black text-[#071A4A] tracking-tight leading-tight">
          The <span className="text-[#155EEF]">Matrix</span> Is Coming.
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#4F6184] max-w-md sm:max-w-xl mx-auto leading-relaxed mt-2.5 sm:mt-3 px-2">
          The Retail Matrix will launch on Day 22, connecting the Genesis DAO with the wider EQUORA_FI ecosystem.
        </p>
      </div>

      {/* Live Countdown Card */}
      <MatrixCountdownCard />

      {/* 3 Feature Highlights (Desktop 3-col grid vs Mobile stacked) */}
      <MatrixFeatureCards />
    </div>
  );
}
