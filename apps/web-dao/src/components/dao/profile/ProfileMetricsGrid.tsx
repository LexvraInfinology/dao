'use client';

import React from 'react';
import { Vote, Wallet, ShieldCheck, Info, BarChart3, CircleDollarSign } from 'lucide-react';
import type { ProfileData } from '@/hooks/useApi';
import { calculateMemberEarnedUsd } from '@/utils/daoEconomics';

interface ProfileMetricsGridProps {
  profile?: ProfileData | null;
}

export const ProfileMetricsGrid: React.FC<ProfileMetricsGridProps> = ({ profile }) => {
  const isMember = Boolean(profile?.isMember && (profile?.position ?? 0) > 0);
  const isUnderfunded = profile?.status === 'underfunded';
  const isCapped       = profile?.status === 'capped';
  const pos            = profile?.position ?? 0;
  const retopupCount   = (profile as any)?.retopupCount ?? 0;
  const onChainBtt     = profile?.pushedAmountBtt || profile?.totalEarnedBtt || 0;

  // Smart contract constants from EquoraDAOv2:
  // 5X Cap is strictly pegged on-chain at 26,785.71 TROB ($1,500.00 USD).
  // Fixed conversion rate is $0.056 USD / TROB ($300 / 5,357.14 TROB entry fee).
  const CONTRACT_CAP_TROB = 26785.714285;
  const CONTRACT_PEG      = 0.056;

  // Current cycle on-chain truth vs lifetime across all cycles
  const currentCycleTrob = isUnderfunded ? 0 : isCapped ? CONTRACT_CAP_TROB : onChainBtt;
  const currentCycleUsd  = isUnderfunded ? 0 : isCapped ? 1500 : Math.min(1500, Math.round(currentCycleTrob * CONTRACT_PEG * 100) / 100);
  const capProgressPct   = isMember ? (isUnderfunded ? 0 : isCapped ? 100 : Math.min(100, Math.max(0, (currentCycleTrob / CONTRACT_CAP_TROB) * 100))) : 0;
  const remainingCapTrob = isMember ? (isCapped ? 0 : Math.max(0, CONTRACT_CAP_TROB - currentCycleTrob)) : 0;
  const remainingCapUsd  = isMember ? (isCapped ? 0 : Math.max(0, 1500 - currentCycleUsd)) : 0;

  const totalEarnedUsd = isMember ? Math.round(((retopupCount * 1500) + currentCycleUsd) * 100) / 100 : 0;
  const totalEarnedBtt = isMember ? Math.round(((retopupCount * CONTRACT_CAP_TROB) + currentCycleTrob) * 100) / 100 : 0;

  const status   = isMember ? (profile?.status ?? 'active') : 'unclaimed';
  const isActive = isMember && status === 'active';

  return (
    <>
      {/* Desktop 4-col */}
      <div className="hidden lg:grid grid-cols-4 gap-4 xl:gap-5">
        {/* Voting Power */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">VOTING POWER</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isMember ? 'bg-[#EEF2FE] text-[#4F46E5]' : 'bg-slate-100 text-slate-400'}`}>
              <Vote className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">{isMember ? '1.0%' : '0.0%'}</div>
          <div className="flex items-center gap-1 text-xs text-[#64748B] font-jakarta pt-0.5">
            <Info className="w-3.5 h-3.5 text-[#94A3B8]" /><span>{isMember ? '1 Seat = 1 Vote' : 'Council Seat Required'}</span>
          </div>
        </div>

        {/* Lifetime Earnings */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">LIFETIME EARNINGS</span>
            <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            ${totalEarnedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#64748B] font-jakarta truncate pt-0.5">
            ≈ {totalEarnedBtt.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB (On-Chain Direct)
          </div>
        </div>

        {/* 5X Cap Progress */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">5X CAP PROGRESS</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              capProgressPct >= 100
                ? 'bg-rose-100 border border-rose-300 text-rose-700'
                : capProgressPct >= 90
                ? 'bg-red-50 border border-red-200 text-red-600'
                : capProgressPct >= 70
                ? 'bg-amber-50 border border-amber-200 text-amber-700'
                : 'bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#047857]'
            }`}>
              {capProgressPct >= 100 ? '5X CAPPED' : capProgressPct >= 90 ? 'NEAR CAP' : capProgressPct >= 70 ? 'CAUTION' : 'SAFE ZONE'}
            </span>
          </div>
          <div className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            {capProgressPct.toFixed(1)}%
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="h-1.5 w-full bg-[#EEF2FE] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  capProgressPct >= 100 ? 'bg-rose-500' : 'bg-[#155EEF]'
                }`}
                style={{ width: `${Math.min(100, capProgressPct)}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-1 text-[9px] xl:text-[10px] text-[#64748B] font-jakarta">
              <span>Cap: 26,786 TROB ($1,500 max)</span>
              <span>${remainingCapUsd.toFixed(2)} USD remaining</span>
            </div>
          </div>
        </div>

        {/* Seat Status */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">SEAT STATUS</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-slate-100 text-slate-400'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#10B981]' : 'bg-slate-400'}`} />
            <span className="capitalize">{status}</span>
          </div>
          <div className={`text-xs font-semibold font-jakarta pt-0.5 ${isActive ? 'text-[#059669]' : 'text-slate-400'}`}>
            {isActive ? 'In Good Standing' : 'No Active Seat'}
          </div>
        </div>
      </div>

      {/* Mobile 2×2 */}
      <div className="lg:hidden grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs min-[360px]:text-sm font-bold font-jakarta text-[#071A4A] truncate">{isMember ? '1.0%' : '0.0%'}</div>
            <div className="text-[10px] text-[#64748B] font-jakarta truncate">Voting Power</div>
          </div>
        </div>

        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs min-[360px]:text-sm font-bold font-jakarta text-[#071A4A] truncate">
              ${totalEarnedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-[#64748B] font-jakarta truncate">Lifetime Earnings</div>
          </div>
        </div>

        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex items-center gap-3">
          <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <path className="text-blue-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-[#155EEF]" strokeDasharray={`${Math.min(100, capProgressPct)}, 100`}
                strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-xs min-[360px]:text-sm font-bold font-jakarta text-[#071A4A] truncate">{capProgressPct.toFixed(1)}%</div>
            <div className="text-[10px] text-[#64748B] font-jakarta truncate">5X Cap Progress</div>
          </div>
        </div>

        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-[#ECFDF5]' : 'bg-slate-100'}`}>
            <span className={`w-3.5 h-3.5 rounded-full ${isActive ? 'bg-[#10B981]' : 'bg-slate-400'}`} />
          </div>
          <div className="min-w-0">
            <div className="text-xs min-[360px]:text-sm font-bold font-jakarta text-[#071A4A] capitalize truncate">{status}</div>
            <div className="text-[10px] text-[#64748B] font-jakarta truncate">Seat Status</div>
          </div>
        </div>
      </div>
    </>
  );
};
