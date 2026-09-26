'use client';

import React from 'react';
import { Share2, Lock, ChevronRight } from 'lucide-react';
import type { LoungeData } from '@/hooks/useApi';

interface IncomeChannelsCardProps {
  loungeData?: LoungeData | null;
}

export const IncomeChannelsCard: React.FC<IncomeChannelsCardProps> = ({ loungeData }) => {
  const daoEarnedUsd    = loungeData?.incomeChannels?.daoSeats.earnedUsd    ?? 512.40;
  const matrixEarnedUsd = loungeData?.incomeChannels?.matrixSlots.earnedUsd ?? 0;
  const hasMatrix       = !!loungeData?.incomeChannels?.matrixSlots.highestSlot;
  const highestSlot     = loungeData?.incomeChannels?.matrixSlots.highestSlot ?? 0;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold font-jakarta text-[#071A4A]">Income Channels</h3>

      <div className="space-y-2.5">
        {/* 300/N Distributions */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(15,23,42,0.02)] hover:border-blue-200 transition-all cursor-pointer">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs sm:text-sm font-bold font-jakarta text-[#071A4A] truncate">1. 300 / N Distributions</div>
              <div className="text-xs font-bold font-jakarta text-[#155EEF]">
                ${daoEarnedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[10px] font-bold text-[#059669]">Active</span>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          </div>
        </div>

        {/* Matrix Royalties */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(15,23,42,0.02)] hover:border-slate-300 transition-all cursor-pointer">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${hasMatrix ? 'bg-[#EFF6FF] border-[#BFDBFE]/40 text-[#155EEF]' : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8]'}`}>
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className={`text-xs sm:text-sm font-bold font-jakarta truncate ${hasMatrix ? 'text-[#071A4A]' : 'text-[#475569]'}`}>
                2. Retail Matrix Royalties
              </div>
              {hasMatrix
                ? <div className="text-xs font-bold font-jakarta text-[#155EEF]">${matrixEarnedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB • Slot {highestSlot}</div>
                : <div className="text-xs font-medium font-jakarta text-[#94A3B8]">Coming on Day 22</div>
              }
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${hasMatrix ? 'bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669]' : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]'}`}>
              {hasMatrix ? 'Active' : 'Locked'}
            </span>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          </div>
        </div>
      </div>
    </div>
  );
};
