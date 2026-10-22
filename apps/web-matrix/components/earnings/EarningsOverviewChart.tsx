"use client";

import React, { useState } from "react";

export function EarningsOverviewChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("Last 7 Days");
  const [timeframeDropdownOpen, setTimeframeDropdownOpen] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const chartData = [
    { day: "12 Sep", value: 46, heightPct: 76.6, label: "46.00 TROB" },
    { day: "13 Sep", value: 20, heightPct: 33.3, label: "20.00 TROB" },
    { day: "14 Sep", value: 31, heightPct: 51.6, label: "31.00 TROB" },
    { day: "15 Sep", value: 16, heightPct: 26.6, label: "16.00 TROB" },
    { day: "16 Sep", value: 38, heightPct: 63.3, label: "38.00 TROB" },
    { day: "17 Sep", value: 28, heightPct: 46.6, label: "28.00 TROB" },
    { day: "18 Sep", value: 14, heightPct: 23.3, label: "14.00 TROB" },
  ];

  return (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#eef2f6] p-4 sm:p-5 lg:p-6 shadow-xs flex flex-col justify-between">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] lg:text-[17px] font-black text-[#0f172a] tracking-tight">
                    Earnings Overview
                  </h2>
                  <p className="text-[12px] text-[#64748b] mt-0.5">Real-time dynamic yield</p>
                </div>

                {/* Timeframe Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTimeframeDropdownOpen(!timeframeDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[11.5px] sm:text-[12px] font-semibold text-[#475569] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                  >
                    <span>{selectedTimeframe}</span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      className={`text-[#64748b] transition-transform ${timeframeDropdownOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M2.5 4L5 6.5 7.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {timeframeDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-36 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-20 py-1 text-[12px]">
                      {["Last 7 Days", "Last 14 Days", "Last 30 Days"].map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => {
                            setSelectedTimeframe(tf);
                            setTimeframeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-[#f8fafc] cursor-pointer ${
                            selectedTimeframe === tf ? "text-[#2563eb] font-bold bg-[#eff6ff]" : "text-[#334155]"
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Body with Y-Axis and Bars */}
              <div className="mt-6 pt-2">
                <div className="relative h-[190px] flex items-end">
                  {/* Horizontal Grid lines & Y-axis labels */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[60, 45, 30, 15, 0].map((tick) => (
                      <div key={tick} className="flex items-center w-full">
                        <span className="text-[11px] text-[#94a3b8] font-medium w-5 text-left">{tick}</span>
                        <div className="flex-1 border-b border-[#f1f5f9] ml-1.5" />
                      </div>
                    ))}
                  </div>

                  {/* Bars Container */}
                  <div className="relative w-full h-[170px] pl-7 pr-1 flex items-end justify-between gap-1.5 sm:gap-4 z-10">
                    {chartData.map((item, index) => {
                      const isHovered = hoveredBarIndex === index;
                      return (
                        <div
                          key={item.day}
                          className="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer"
                          onMouseEnter={() => setHoveredBarIndex(index)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                        >
                          {/* Tooltip on Hover */}
                          {isHovered && (
                            <div className="absolute -top-6 bg-[#0f172a] text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap z-30 animate-in fade-in zoom-in-95">
                              {item.label} ({item.day})
                            </div>
                          )}

                          {/* The Bar with blue gradient */}
                          <div
                            style={{ height: `${item.heightPct}%` }}
                            className={`w-full max-w-[20px] sm:max-w-[32px] rounded-t-sm sm:rounded-t-md transition-all duration-300 ${
                              isHovered
                                ? "bg-gradient-to-t from-[#1d4ed8] to-[#60a5fa] shadow-md shadow-blue-500/30 scale-y-[1.02]"
                                : "bg-gradient-to-t from-[#2563eb] to-[#3b82f6]"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="pl-7 pr-1 mt-3 flex justify-between gap-1.5 sm:gap-4 text-center">
                  {chartData.map((item, index) => (
                    <div
                      key={item.day}
                      className={`flex-1 text-[10.5px] sm:text-[12px] font-medium transition-colors ${
                        hoveredBarIndex === index ? "text-[#2563eb] font-bold" : "text-[#64748b]"
                      }`}
                    >
                      {item.day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
  );
}
