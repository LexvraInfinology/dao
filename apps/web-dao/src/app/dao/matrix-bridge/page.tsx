'use client';

import React from 'react';
import MatrixCountdownCard from '@/components/dao/matrix/MatrixCountdownCard';
import MatrixFeatureCards from '@/components/dao/matrix/MatrixFeatureCards';
import MatrixTreeGraph from '@/components/dao/matrix/MatrixTreeGraph';

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

      {/* 5 Feature Highlights (Desktop 5-col grid vs Mobile stacked) */}
      <MatrixFeatureCards />

      {/* Tree Graph Start Requirement Info Banner */}
      <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_2px_15px_rgba(21,94,239,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-sm mt-0.5">
            2×
          </div>
          <div>
            <div className="font-bold text-[#071A4A] text-sm sm:text-base">
              Personal Tree Graph Eligibility
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed max-w-2xl">
              Any member can join Slot 1 ($30). Your personal 14-node tree graph and downline spillover placements officially start once you complete <strong className="text-[#071A4A]">2 direct referrals</strong> (Genesis Root Matrix Owner is automatically active as the top apex).
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/80 shrink-0 self-start sm:self-auto">
          <span>Active on 2 Directs</span>
        </div>
      </div>

      {/* 14-Node Visual Matrix Tree Graph */}
      <MatrixTreeGraph />
    </div>
  );
}
