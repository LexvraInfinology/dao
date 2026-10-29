"use client";

import React from "react";
import { useFinanceStore } from "@/lib/stores";

export interface TransactionsStatsProps {
  stats?: {
    totalInflow: number;
    totalOutflow: number;
    pendingCount: number;
    netProfit: number;
  } | null;
}

export function TransactionsStats({ stats: propStats }: TransactionsStatsProps) {
  const storeStats = useFinanceStore((s) => s.transactionStats);
  const stats = propStats !== undefined ? propStats : storeStats;
  const totalInflow = stats?.totalInflow ?? 0.0;
  const totalOutflow = stats?.totalOutflow ?? 0.0;
  const pendingCount = stats?.pendingCount ?? 0;
  const netProfit = stats?.netProfit ?? Math.max(0, totalInflow - totalOutflow);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
      {/* Total Received */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-3.5 lg:p-4 shadow-xs">
        <div className="flex items-start justify-between mb-1.5">
          <span className="text-[10.5px] lg:text-[11.5px] font-semibold text-[#64748b]">Total Received</span>
          <div className="w-7 h-7 rounded-lg bg-[#ecfdf5] flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v16M5 15l7 7 7-7" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="text-[18px] lg:text-[22px] font-black text-[#0f172a] leading-tight">
          ${totalInflow.toFixed(2)} <span className="text-[11px] font-bold text-[#64748b]">USD</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-[10.5px] font-bold text-[#16a34a] flex items-center gap-0.5">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Inflow
          </div>
        </div>
      </div>

      {/* Total Sent */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-3.5 lg:p-4 shadow-xs">
        <div className="flex items-start justify-between mb-1.5">
          <span className="text-[10.5px] lg:text-[11.5px] font-semibold text-[#64748b]">Total Outflow</span>
          <div className="w-7 h-7 rounded-lg bg-[#fff1f2] flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 20V4M5 11l7-7 7 7" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="text-[18px] lg:text-[22px] font-black text-[#0f172a] leading-tight">
          ${totalOutflow.toFixed(2)} <span className="text-[11px] font-bold text-[#64748b]">USD</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-[10.5px] font-bold text-[#e11d48] flex items-center gap-0.5">
            Outflow
          </div>
        </div>
      </div>

      {/* Pending Volume */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-3.5 lg:p-4 shadow-xs">
        <div className="flex items-start justify-between mb-1.5">
          <span className="text-[10.5px] lg:text-[11.5px] font-semibold text-[#64748b]">Pending Ops</span>
          <div className="w-7 h-7 rounded-lg bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" />
              <polyline points="12 6 12 12 16 14" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="text-[18px] lg:text-[22px] font-black text-[#0f172a] leading-tight">
          {pendingCount} <span className="text-[11px] font-bold text-[#64748b]">Txs</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-[#64748b]">On-chain verification</span>
        </div>
      </div>

      {/* Net Profit */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-3.5 lg:p-4 shadow-xs">
        <div className="flex items-start justify-between mb-1.5">
          <span className="text-[10.5px] lg:text-[11.5px] font-semibold text-[#64748b]">Net Profit</span>
          <div className="w-7 h-7 rounded-lg bg-[#ecfdf5] flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="text-[18px] lg:text-[22px] font-black text-[#16a34a] leading-tight">
          {netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`} <span className="text-[11px] font-bold text-[#64748b]">USD</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-[#16a34a] font-semibold">Net Accumulated</span>
        </div>
      </div>
    </div>
  );
}
