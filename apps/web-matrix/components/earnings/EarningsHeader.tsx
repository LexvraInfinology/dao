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

            {/* Date Range Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDateRangeDropdownOpen(!dateRangeDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl shadow-xs hover:border-[#cbd5e1] transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="text-[#2563eb]">
                    <rect x="2" y="3.5" width="14" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M2 7.5h14M5.5 2v3M12.5 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-[13px] font-semibold text-[#0f172a]">{selectedDateRange}</span>
                </div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`text-[#64748b] transition-transform ${dateRangeDropdownOpen ? "rotate-180" : ""}`}
                >
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Date dropdown menu */}
              {dateRangeDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-20 py-1 text-[13px]">
                  {[
                    "12 Sep 2026 – 18 Sep 2026",
                    "05 Sep 2026 – 11 Sep 2026",
                    "29 Aug 2026 – 04 Sep 2026",
                    "Custom Range...",
                  ].map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => {
                        setSelectedDateRange(range);
                        setDateRangeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-[#f8fafc] flex items-center justify-between cursor-pointer ${
                        selectedDateRange === range ? "text-[#2563eb] font-semibold bg-[#eff6ff]" : "text-[#334155]"
                      }`}
                    >
                      {range}
                      {selectedDateRange === range && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7l3 3 5-5" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
  );
}
