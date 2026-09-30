'use client';

import React from 'react';
import MatrixCountdownCard from '@/components/dao/matrix/MatrixCountdownCard';
import MatrixFeatureCards from '@/components/dao/matrix/MatrixFeatureCards';
import MatrixTreeGraph from '@/components/dao/matrix/MatrixTreeGraph';

export default function MatrixBridgePage() {
  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 animate-fadeIn font-sans py-2 sm:py-6 lg:py-8 max-w-5xl mx-auto w-full px-1">
      {/* Header Section (Centered) */}
      <div className="text-center flex flex-col items-center">
        {/* Status Pill Badge: COMING SOON */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EBF3FA] border border-[#3C78B1]/25 mb-3 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3C78B1] animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#3C78B1]">
            COMING SOON
          </span>
        </div>

        {/* Main Heading: The Matrix Is Coming. */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-[#14304A] tracking-tight leading-tight">
          The <span className="text-[#3C78B1]">Matrix</span> Is Coming.
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#4F6D87] max-w-md sm:max-w-xl mx-auto leading-relaxed mt-2 px-2">
          The Retail Matrix will launch on Day 22, connecting the Genesis DAO with the wider EQUORA_FI ecosystem.
        </p>
      </div>

      {/* Live Countdown Card */}
      <MatrixCountdownCard />

      {/* 5 Feature Highlights (Desktop 5-col grid vs Mobile stacked) */}
      <MatrixFeatureCards />

      {/* Tree Graph Start Requirement Info Banner */}
      <div className="bg-white border border-[#E2EEF9] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-[0_2px_12px_rgba(60,120,177,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-xs mt-0.5">
            2×
          </div>
          <div>
            <div className="font-bold text-[#14304A] text-xs sm:text-sm">
              Personal Tree Graph Eligibility
            </div>
            <p className="text-[11px] sm:text-xs text-[#4F6D87] mt-0.5 leading-relaxed max-w-2xl">
              Any member can join Slot 1 ($30). Your personal 14-node tree graph and downline spillover placements officially start once you complete <strong className="text-[#14304A]">2 direct referrals</strong> (Genesis Root Matrix Owner is automatically active as the top apex).
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/80 shrink-0 self-start sm:self-auto">
          <span>Active on 2 Directs</span>
        </div>
      </div>

      {/* 14-Node Visual Matrix Tree Graph */}
      <MatrixTreeGraph />
    </div>
  );
}
