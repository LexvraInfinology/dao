'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, ShieldCheck, Info, BarChart3, CircleDollarSign, Wallet } from 'lucide-react';
import type { ProfileData } from '@/hooks/useApi';
import { calculateMemberEarnedUsd } from '@/utils/daoEconomics';

interface ProfileMetricsGridProps {
  profile?: ProfileData | null;
  loading?: boolean;
}

export const ProfileMetricsGrid: React.FC<ProfileMetricsGridProps> = ({ profile, loading = false }) => {
  if (loading && !profile) {
    return (
      <>
        {/* Desktop Skeleton */}
        <div className="hidden lg:grid grid-cols-4 gap-4 xl:gap-5 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 bg-slate-200 rounded" />
                <div className="w-7 h-7 rounded-lg bg-slate-100" />
              </div>
              <div className="h-8 w-36 bg-slate-200 rounded-lg" />
              <div className="h-3 w-48 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
        {/* Mobile Skeleton */}
        <div className="lg:hidden grid grid-cols-2 gap-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

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
  const currentCycleUsd  = isUnderfunded ? 0 : isCapped ? 1500 : (typeof (profile as any)?.currentCycleUsd === 'number' ? (profile as any).currentCycleUsd : Math.min(1500, Math.round(onChainBtt * CONTRACT_PEG * 100) / 100));
  const currentCycleTrob = isUnderfunded ? 0 : isCapped ? CONTRACT_CAP_TROB : Math.round((currentCycleUsd / CONTRACT_PEG) * 100) / 100;
  const capProgressPct   = isMember ? (isUnderfunded ? 0 : isCapped ? 100 : Math.min(100, Math.max(0, (currentCycleUsd / 1500) * 100))) : 0;
  const remainingCapTrob = isMember ? (isCapped ? 0 : Math.max(0, CONTRACT_CAP_TROB - currentCycleTrob)) : 0;
  const remainingCapUsd  = isMember ? (isCapped ? 0 : Math.max(0, 1500 - currentCycleUsd)) : 0;

  const totalEarnedUsd = isMember ? Math.round(((retopupCount * 1500) + currentCycleUsd) * 100) / 100 : 0;
  const totalEarnedBtt = isMember ? Math.round(((retopupCount * CONTRACT_CAP_TROB) + currentCycleTrob) * 100) / 100 : 0;

  // Inflow (What member deposited) vs Outflow (What member received in dividends)
  const depositCount = isMember ? 1 + retopupCount : 0;
  const memberInflowUsd = depositCount * 300;
  const memberInflowTrob = isMember ? Math.round(depositCount * (300 / CONTRACT_PEG) * 100) / 100 : 0;
  const memberOutflowUsd = totalEarnedUsd;
  const memberOutflowTrob = totalEarnedBtt;
  const netGainUsd = isMember ? Math.round((memberOutflowUsd - memberInflowUsd) * 100) / 100 : 0;
  const roiPct = isMember && memberInflowUsd > 0 ? ((memberOutflowUsd / memberInflowUsd) * 100).toFixed(0) : '0';
  const multiplier = isMember && memberInflowUsd > 0 ? (memberOutflowUsd / memberInflowUsd).toFixed(2) : '0.00';

  const status   = isMember ? (profile?.status ?? 'active') : 'unclaimed';
  const isActive = isMember && status === 'active';

  return (
    <>
      {/* Desktop 4-col */}
      <div className="hidden lg:grid grid-cols-4 gap-4 xl:gap-5">
        {/* Card 1: Total Deposited (Paid Entry) */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#0369A1] uppercase tracking-wider">TOTAL DEPOSITED (PAID)</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isMember ? 'bg-[#EFF6FF] text-[#0284C7]' : 'bg-slate-100 text-slate-400'}`}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-jakarta text-[#0369A1] tracking-tight">
            ${memberInflowUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#64748B] font-jakarta pt-0.5 truncate">
            <span>≈ {memberInflowTrob.toLocaleString(undefined, { maximumFractionDigits: 0 })} TROB ({depositCount} {depositCount === 1 ? 'Deposit' : 'Deposits'})</span>
          </div>
        </div>

        {/* Card 2: Dividends Received (Wallet Inflow) */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#059669] uppercase tracking-wider">DIVIDENDS RECEIVED (INFLOW)</span>
            <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
            ${memberOutflowUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#64748B] font-jakarta truncate pt-0.5">
            ≈ {memberOutflowTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB (Direct to Wallet)
          </div>
        </div>

        {/* Card 3: Net Return & Multiplier */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#047857] uppercase tracking-wider">NET RETURN (P&L)</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${netGainUsd >= 0 ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-slate-100 text-slate-500'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-jakarta tracking-tight ${netGainUsd >= 0 ? 'text-[#059669]' : 'text-slate-700'}`}>
            {netGainUsd >= 0 ? '+' : ''}${netGainUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#047857] font-semibold font-jakarta pt-0.5">
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">{multiplier}X Realized</span>
            <span>({roiPct}% Total Payout)</span>
          </div>
        </div>

        {/* Card 4: 5X Cap Progress */}
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
              {capProgressPct >= 100 ? '5X CAPPED' : capProgressPct >= 90 ? 'NEAR CAP' : capProgressPct >= 70 ? 'CAUTION' : 'ACTIVE'}
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
              <span>Cap: $1,500</span>
              <span>${remainingCapUsd.toFixed(2)} USD remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile 2×2 */}
      <div className="lg:hidden grid grid-cols-2 gap-3">
        {/* Mobile Total Deposited */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#0284C7] flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs min-[360px]:text-sm font-bold font-jakarta text-[#0369A1] truncate">
              ${memberInflowUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-[#64748B] font-jakarta truncate">Total Deposited</div>
          </div>
        </div>

        {/* Mobile Dividends Received */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs min-[360px]:text-sm font-bold font-jakarta text-[#071A4A] truncate">
              ${memberOutflowUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-[#64748B] font-jakarta truncate">Dividends (Inflow)</div>
          </div>
        </div>

        {/* Mobile Net Gain */}
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs min-[360px]:text-sm font-bold font-jakarta text-[#059669] truncate">
              {netGainUsd >= 0 ? '+' : ''}${netGainUsd.toFixed(2)} ({multiplier}X)
            </div>
            <div className="text-[10px] text-[#64748B] font-jakarta truncate">Net Return</div>
          </div>
        </div>

        {/* Mobile 5X Progress */}
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
      </div>
    </>
  );
};
