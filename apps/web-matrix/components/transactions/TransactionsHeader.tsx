"use client";

import React, { useState } from "react";

export type TimeframeTab = "All Time" | "30 Days" | "7 Days";

export interface TransactionsHeaderProps {
  timeframe: TimeframeTab;
  setTimeframe: (t: TimeframeTab) => void;
}

export function TransactionsHeader({ timeframe, setTimeframe }: TransactionsHeaderProps) {
  return (
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-1.5">
                <span className="text-[11px] lg:text-[11.5px] font-extrabold text-[#2563eb] tracking-wider uppercase">TRANSACTIONS</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[10.5px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                  Live On-Chain
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-medium text-[#64748b]">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Mainnet Synced
                </div>
              </div>
              <h1 className="text-2xl sm:text-[28px] lg:text-[32px] font-black text-[#0f172a] tracking-tight leading-tight">On-Chain Activity</h1>
              <p className="text-[12px] lg:text-[13px] text-[#64748b] mt-1">View all your protocol transactions in real time</p>
            </div>
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 lg:gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-[#e2e8f0] text-[11.5px] sm:text-[12.5px] font-medium text-[#334155] cursor-pointer hover:bg-[#f8fafc]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#64748b" strokeWidth="1.8" />
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span>1 Jul 2026 – 31 Jul 2026</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2.5 4L5 6.5 7.5 4" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center bg-[#f1f5f9] p-0.5 sm:p-1 rounded-xl border border-[#e2e8f0]">
                {(["All Time", "30 Days", "7 Days"] as TimeframeTab[]).map((t) => (
                  <button key={t} type="button" onClick={() => setTimeframe(t)}
                    className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-[12.5px] font-semibold transition-all cursor-pointer ${timeframe === t ? "bg-[#2563eb] text-white shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
  );
}
