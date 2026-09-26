'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface EarningsCapCardProps {
  variant?: 'desktop' | 'mobile' | 'auto';
  capProgressPct?: number;
  pushedUsd?: number;
  earningsCapUsd?: number;
}

export const EarningsCapCard: React.FC<EarningsCapCardProps> = ({
  variant = 'auto',
  capProgressPct = 0,
  pushedUsd = 0,
  earningsCapUsd = 1500,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const pct         = Math.min(100, capProgressPct);
  const remaining   = Math.max(0, earningsCapUsd - pushedUsd);
  const zone        = pct >= 90 ? 'Danger Zone' : pct >= 70 ? 'Caution' : 'Safe Zone';
  const zoneColor   = pct >= 90 ? 'text-[#DC2626] bg-red-50 border-red-200' : pct >= 70 ? 'text-[#D97706] bg-amber-50 border-amber-200' : 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]/60';

  const radius        = 33;
  const circumference = 2 * Math.PI * radius;
  const dashoffset    = circumference * (1 - pct / 100);

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm sm:text-base font-bold font-jakarta text-[#071A4A]">5X Earnings Cap</h3>
          <button onClick={() => setModalOpen(true)} className="text-[#94A3B8] hover:text-[#155EEF] transition-colors" aria-label="Info">
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] sm:bg-transparent text-[11px] sm:text-xs font-semibold sm:font-bold text-[#155EEF] hover:underline transition-all">
          What is this?
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r={radius} stroke="#F1F5F9" strokeWidth="7" fill="transparent" />
            <circle cx="42" cy="42" r={radius} stroke="#00D492" strokeWidth="7"
              strokeDasharray={circumference} strokeDashoffset={dashoffset}
              strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg sm:text-xl font-black font-jakarta text-[#071A4A]">{Math.round(pct)}%</span>
          </div>
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
              ${pushedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs sm:text-sm font-semibold font-jakarta text-[#60739A]">
              / ${earningsCapUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-xs font-medium font-jakarta text-[#60739A]">TROB Earned</div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-bold ${zoneColor}`}>
            {zone}
          </span>
        </div>
      </div>

      {(variant === 'desktop' || variant === 'auto') && (
        <div className={`space-y-4 pt-1 ${variant === 'auto' ? 'hidden lg:block' : ''}`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#60739A] font-medium font-jakarta">Earnings remaining until cap:</span>
              <span className="font-bold font-jakarta text-[#071A4A]">${remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
              <div className="h-full rounded-full bg-[#00D492] transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] p-3.5 text-xs text-[#60739A] leading-relaxed font-jakarta">
            When you reach ${earningsCapUsd.toLocaleString()} (5X), a $300 TROB re-top-up is required within 48 hours to reset your cap and continue earning.
          </div>
        </div>
      )}

      {(variant === 'mobile' || variant === 'auto') && (
        <div className={`space-y-2 pt-1 ${variant === 'auto' ? 'lg:hidden' : ''}`}>
          <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
            <div className="h-full rounded-full bg-[#00D492] transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs pt-0.5">
            <div className="text-[#60739A] font-medium font-jakarta">
              Remaining: <span className="font-bold text-[#071A4A]">${remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB</span>
            </div>
            <div className="text-[11px] text-[#94A3B8] font-jakarta">Re-top: $300 TROB</div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2ECF9] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2ECF9] pb-3">
              <h3 className="text-base font-bold text-[#071A4A] font-jakarta flex items-center gap-2">
                <Info className="w-4 h-4 text-[#155EEF]" />5X Earnings Cap Policy
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[#94A3B8] hover:text-[#071A4A] text-sm font-bold">✕</button>
            </div>
            <div className="space-y-3 text-xs text-[#4F6184] font-jakarta leading-relaxed">
              <p>Each Council Seat earns up to <strong>5X its initial seat cost</strong> ($300 TROB × 5 = <strong>${earningsCapUsd.toLocaleString()} max cap</strong>).</p>
              <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/60 space-y-1">
                <div className="font-bold text-[#155EEF]">Current Status: {zone} ({Math.round(pct)}%)</div>
                <div>You have accumulated ${pushedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} with ${remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })} remaining.</div>
              </div>
              <p>Once the cap is reached, a <strong>$300 TROB re-top-up</strong> resets the 5X cycle.</p>
            </div>
            <button onClick={() => setModalOpen(false)} className="w-full py-2.5 rounded-xl bg-[#155EEF] text-white font-bold text-xs hover:bg-[#0052E6] transition-all">
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
