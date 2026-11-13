"use client";

import React, { useState } from "react";

export function EarningsHeader() {
  const [selectedDateRange, setSelectedDateRange] = useState("12 Sep 2026 – 18 Sep 2026");
  const [dateRangeDropdownOpen, setDateRangeDropdownOpen] = useState(false);

  return (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
            <div>
              {/* Row 1: EARNINGS badge + VERIFIED PROTOCOL */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] lg:text-[11.5px] font-bold text-[#2563eb] tracking-widest uppercase">
                  EARNINGS
                </span>

                {/* VERIFIED PROTOCOL Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eef2ff] border border-[#e0e7ff] text-[#2563eb] font-bold text-[9.5px] tracking-wider uppercase">
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 1.5L2 3.5v4c0 3.5 5 5 5 5s5-1.5 5-5v-4l-5-2z"
                      stroke="#2563eb"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path d="M5 7l1.5 1.5 3-3" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>VERIFIED PROTOCOL</span>
                </div>
              </div>

              <h1 className="text-[23px] sm:text-[27px] lg:text-[30px] font-black text-[#0f172a] tracking-tight mt-0.5">
                My Earnings
              </h1>
              <p className="text-[13px] sm:text-[14px] text-[#64748b] mt-0.5 max-w-[500px]">
                Track your earnings, rewards and transactions across the Matrix.
              </p>
            </div>

            {/* Live Blockchain Settlement Status */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#e2e8f0] rounded-xl shadow-xs text-[12px] font-semibold text-[#0f172a]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Blockchain Settlement</span>
              <span className="text-[11px] font-bold text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-md">100% P2P Instant</span>
            </div>
          </div>
  );
}
