'use client';

import React from 'react';
import {
  Vote,
  Wallet,
  ShieldCheck,
  Info,
  BarChart3,
  CircleDollarSign,
} from 'lucide-react';

export const ProfileMetricsGrid: React.FC = () => {
  return (
    <>
      {/* =========================================================================
          DESKTOP VIEW (Visible on lg and above - exactly matching Desktop Figma)
         ========================================================================= */}
      <div className="hidden lg:grid grid-cols-4 gap-4 xl:gap-5">
        {/* Card 1: VOTING POWER */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">
              VOTING POWER
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EEF2FE] text-[#4F46E5] flex items-center justify-center shrink-0">
              <Vote className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            1.0%
          </div>

          <div className="flex items-center gap-1 text-xs text-[#64748B] font-jakarta pt-0.5">
            <Info className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>1 Seat = 1 Vote</span>
          </div>
        </div>

        {/* Card 2: LIFETIME EARNINGS */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">
              LIFETIME EARNINGS
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            $1,280.40
          </div>

          <div className="text-[11px] text-[#64748B] font-jakarta truncate pt-0.5">
            ≈ 8,445.91 TROB($0.1516/TROB)
          </div>
        </div>

        {/* Card 3: 5X CAP PROGRESS */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">
              5X CAP PROGRESS
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[10px] font-bold text-[#047857]">
              SAFE ZONE
            </span>
          </div>

          <div className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            85.3%
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="h-1.5 w-full bg-[#EEF2FE] rounded-full overflow-hidden">
              <div className="h-full bg-[#155EEF] rounded-full" style={{ width: '85.3%' }} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-1 text-[9px] xl:text-[10px] text-[#64748B] font-jakarta">
              <span>Cap: 500% Baseline</span>
              <span>$219.60 remaining</span>
            </div>
          </div>
        </div>

        {/* Card 4: SEAT STATUS */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">
              SEAT STATUS
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span>Active</span>
          </div>

          <div className="text-xs font-semibold text-[#059669] font-jakarta pt-0.5">
            In Good Standing
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (Visible below lg - 2x2 Grid exactly matching Mobile Figma)
         ========================================================================= */}
      <div className="lg:hidden grid grid-cols-2 gap-3">
        {/* Card 1: 1.0% Voting Power */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold font-jakarta text-[#071A4A]">
              1.0%
            </div>
            <div className="text-[10px] text-[#64748B] font-jakarta truncate">
              Voting Power
            </div>
          </div>
        </div>

        {/* Card 2: $1,280.40 Lifetime Earnings */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold font-jakarta text-[#071A4A]">
              $1,280.40
            </div>
            <div className="text-[10px] text-[#64748B] font-jakarta truncate">
              Lifetime Earnings
            </div>
          </div>
        </div>

        {/* Card 3: 85.3% 5X Cap Progress with Circular Ring */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex items-center gap-3">
          <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-blue-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#155EEF]"
                strokeDasharray="85.3, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold font-jakarta text-[#071A4A]">
              85.3%
            </div>
            <div className="text-[10px] text-[#64748B] font-jakarta truncate">
              5X Cap Progress
            </div>
          </div>
        </div>

        {/* Card 4: Active Seat Status with Green Dot */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
            <span className="w-3.5 h-3.5 rounded-full bg-[#10B981]" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold font-jakarta text-[#071A4A]">
              Active
            </div>
            <div className="text-[10px] text-[#64748B] font-jakarta truncate">
              Seat Status
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
