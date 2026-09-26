'use client';

import React from 'react';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Calendar, SlidersHorizontal } from 'lucide-react';
import type { TransactionItem } from '@/hooks/useApi';

interface TransactionsMobileMetricsProps {
  transactions?: TransactionItem[];
  bttPriceUsd?: number;
}

export const TransactionsMobileMetrics: React.FC<TransactionsMobileMetricsProps> = ({
  transactions = [],
  bttPriceUsd = 0,
}) => {
  const total = transactions.length;

  const inflows  = transactions.filter((t) => t.isPositive === true)
    .reduce((s, t) => s + t.amountUsd, 0);
  const outflows = transactions.filter((t) => t.isPositive === false)
    .reduce((s, t) => s + t.amountUsd, 0);

  const inflowsTrob  = bttPriceUsd > 0 ? (inflows  / bttPriceUsd) : 0;
  const outflowsTrob = bttPriceUsd > 0 ? (outflows / bttPriceUsd) : 0;

  const fmtK = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(2);

  const today = new Date();
  const dateLabel = `${today.toLocaleString('en-US', { month: 'short' })} 1 – ${today.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="space-y-3.5">
      {/* Total transactions card */}
      <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#60739A]">TOTAL TRANSACTIONS</div>
            <div className="text-2xl sm:text-3xl font-black font-jakarta text-[#071A4A] tracking-tight">{total}</div>
            <div className="text-[11px] text-[#60739A] font-medium truncate">This page</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60 text-xs font-semibold text-[#155EEF] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse" />Live Feed
        </span>
      </div>

      {/* Inflow / Outflow row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(15,23,42,0.02)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#60739A] font-medium font-jakarta">Inflows</span>
            <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#0284C7] flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black font-jakarta text-[#0369A1] tracking-tight">
            +${fmtK(inflows)}
          </div>
          <div className="text-[11px] text-[#60739A] font-medium font-jakarta">
            ≈ {fmtK(inflowsTrob)} TROB
          </div>
        </div>
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(15,23,42,0.02)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#60739A] font-medium font-jakarta">Outflows</span>
            <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black font-jakarta text-[#DC2626] tracking-tight">
            -${fmtK(outflows)}
          </div>
          <div className="text-[11px] text-[#60739A] font-medium font-jakarta">
            ≈ {fmtK(outflowsTrob)} TROB
          </div>
        </div>
      </div>

      {/* Title + date filter bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-jakarta text-[#071A4A]">Transactions</h3>
        </div>
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3 flex items-center justify-between shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
          <div className="flex items-center gap-2.5 text-xs font-bold font-jakarta text-[#071A4A]">
            <Calendar className="w-4 h-4 text-[#155EEF]" />
            <span>{dateLabel}</span>
          </div>
          <button className="w-8 h-8 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] flex items-center justify-center text-[#60739A] hover:text-[#071A4A] transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
