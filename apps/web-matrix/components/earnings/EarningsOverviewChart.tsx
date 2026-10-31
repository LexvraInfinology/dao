"use client";

import React, { useState, useMemo } from "react";
import { useFinanceStore } from "@/lib/stores";

export interface EarningsOverviewChartProps {
  payouts?: any[];
}

export function EarningsOverviewChart({ payouts: propPayouts }: EarningsOverviewChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("Last 7 Days");
  const [timeframeDropdownOpen, setTimeframeDropdownOpen] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const storePayouts = useFinanceStore((s) => s.earnings?.recentPayouts);
  const payouts = propPayouts !== undefined ? propPayouts : storePayouts;

  const numDays = selectedTimeframe === "Last 30 Days" ? 30 : selectedTimeframe === "Last 14 Days" ? 14 : 7;

  // Generate dynamic day buckets ending on today
  const chartData = useMemo(() => {
    const buckets: { day: string; value: number; heightPct: number; label: string }[] = [];
    const now = new Date();

    // Map payouts by date key (YYYY-MM-DD)
    const payoutByDate: Record<string, number> = {};
    if (Array.isArray(payouts)) {
      payouts.forEach((p) => {
        try {
          const d = new Date(p.timestamp);
          if (!isNaN(d.getTime())) {
            const key = d.toISOString().slice(0, 10);
            payoutByDate[key] = (payoutByDate[key] || 0) + Number(p.amountUsd || p.amount || 0);
          }
        } catch {}
      });
    }

    // Determine max value for proportional scaling
    let maxVal = 0;
    const dailyValues: { day: string; value: number }[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      const val = payoutByDate[key] || 0;
      if (val > maxVal) maxVal = val;
      dailyValues.push({ day: dayLabel, value: val });
    }

    const scaleMax = maxVal > 0 ? Math.max(60, Math.ceil(maxVal / 10) * 10) : 60;

    return dailyValues.map((item) => ({
      day: item.day,
      value: item.value,
      heightPct: maxVal > 0 ? Math.max(3, (item.value / scaleMax) * 100) : 0,
      label: `$${item.value.toFixed(2)} USD`,
    }));
  }, [payouts, numDays]);

  const maxTick = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.value), 0);
    return maxVal > 0 ? Math.max(60, Math.ceil(maxVal / 10) * 10) : 60;
  }, [chartData]);

  const ticks = [maxTick, Math.round(maxTick * 0.75), Math.round(maxTick * 0.5), Math.round(maxTick * 0.25), 0];

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
            {ticks.map((tick) => (
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
                      item.value > 0
                        ? isHovered
                          ? "bg-gradient-to-t from-[#1d4ed8] to-[#60a5fa] shadow-md shadow-blue-500/30 scale-y-[1.02]"
                          : "bg-gradient-to-t from-[#2563eb] to-[#3b82f6]"
                        : "bg-[#e2e8f0]/40 h-[2px]"
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
