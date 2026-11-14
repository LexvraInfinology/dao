"use client";

import React, { useState, useMemo } from "react";
import { useFinanceStore } from "@/lib/stores";

export type TimeframeMode = "Days" | "Weeks" | "Months" | "Year";

export interface EarningsOverviewChartProps {
  payouts?: any[];
}

export function EarningsOverviewChart({ payouts: propPayouts }: EarningsOverviewChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeMode>("Days");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const storePayouts = useFinanceStore((s) => s.earnings?.recentPayouts);
  const payouts = propPayouts !== undefined ? propPayouts : storePayouts;

  const TIMEFRAMES: { id: TimeframeMode; label: string }[] = [
    { id: "Days", label: "Days" },
    { id: "Weeks", label: "Weeks" },
    { id: "Months", label: "Months" },
    { id: "Year", label: "Year" },
  ];

  // Dynamic grouping across Days, Weeks, Months, and Year
  const chartData = useMemo(() => {
    const now = new Date();

    // Clean and validate all incoming payouts
    const cleanPayouts: { amount: number; date: Date; dateKey: string }[] = [];
    if (Array.isArray(payouts)) {
      payouts.forEach((p) => {
        const amt = Number(p.amountUsd || p.amount || 0);
        if (amt <= 0) return;
        let d = p.timestamp ? new Date(p.timestamp) : null;
        if (!d || isNaN(d.getTime())) {
          // If live on-chain placement without event timestamp, fallback to slot activation date (Nov 07, 2026)
          d = new Date("2026-11-07T11:00:00.000Z");
        }
        cleanPayouts.push({
          amount: amt,
          date: d,
          dateKey: d.toISOString().slice(0, 10),
        });
      });
    }

    if (selectedTimeframe === "Days") {
      // 10-day window anchored to cover active payout activity (Nov 06–07)
      const buckets: { key: string; label: string; fullLabel: string; value: number; count: number }[] = [];
      const maxPayoutTime = cleanPayouts.length > 0 ? Math.max(...cleanPayouts.map((p) => p.date.getTime())) : now.getTime();
      const endTime = Math.max(now.getTime(), maxPayoutTime);
      const totalDays = 10;

      for (let i = totalDays - 1; i >= 0; i--) {
        const d = new Date(endTime - i * 86400000);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const fullLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

        const dayPayouts = cleanPayouts.filter((p) => p.dateKey === key);
        const value = dayPayouts.reduce((sum, p) => sum + p.amount, 0);
        buckets.push({ key, label, fullLabel, value, count: dayPayouts.length });
      }
      return buckets;
    }

    if (selectedTimeframe === "Weeks") {
      // 6 weekly buckets ending at current week
      const buckets: { key: string; label: string; fullLabel: string; value: number; count: number }[] = [];
      const endTime = now.getTime();
      const weekMs = 7 * 86400000;

      for (let i = 5; i >= 0; i--) {
        const wEnd = new Date(endTime - i * weekMs);
        const wStart = new Date(wEnd.getTime() - 6 * 86400000);
        const startLabel = wStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const endLabel = wEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const label = `${startLabel}`;
        const fullLabel = `${startLabel} – ${endLabel}`;

        const weekPayouts = cleanPayouts.filter(
          (p) => p.date.getTime() >= wStart.getTime() && p.date.getTime() <= wEnd.getTime() + 86400000
        );
        const value = weekPayouts.reduce((sum, p) => sum + p.amount, 0);
        buckets.push({ key: `w-${i}`, label, fullLabel, value, count: weekPayouts.length });
      }
      return buckets;
    }

    if (selectedTimeframe === "Months") {
      // Last 6 calendar months
      const buckets: { key: string; label: string; fullLabel: string; value: number; count: number }[] = [];
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-US", { month: "short" });
        const fullLabel = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

        const monthPayouts = cleanPayouts.filter((p) => {
          const pKey = `${p.date.getFullYear()}-${String(p.date.getMonth() + 1).padStart(2, "0")}`;
          return pKey === monthKey;
        });
        const value = monthPayouts.reduce((sum, p) => sum + p.amount, 0);
        buckets.push({ key: monthKey, label, fullLabel, value, count: monthPayouts.length });
      }
      return buckets;
    }

    // Year mode: Last 3 years
    const buckets: { key: string; label: string; fullLabel: string; value: number; count: number }[] = [];
    const currentYear = now.getFullYear();
    for (let yr = currentYear - 2; yr <= currentYear; yr++) {
      const yearPayouts = cleanPayouts.filter((p) => p.date.getFullYear() === yr);
      const value = yearPayouts.reduce((sum, p) => sum + p.amount, 0);
      buckets.push({
        key: String(yr),
        label: String(yr),
        fullLabel: `Year ${yr}`,
        value,
        count: yearPayouts.length,
      });
    }
    return buckets;
  }, [payouts, selectedTimeframe]);

  const totalPeriodValue = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.value, 0);
  }, [chartData]);

  const maxVal = useMemo(() => {
    return Math.max(...chartData.map((d) => d.value), 0);
  }, [chartData]);

  const scaleMax = useMemo(() => {
    if (maxVal <= 0) return 30;
    if (maxVal <= 30) return 30;
    if (maxVal <= 100) return 100;
    if (maxVal <= 200) return 200;
    if (maxVal <= 300) return 300;
    return Math.ceil(maxVal / 50) * 50;
  }, [maxVal]);

  const ticks = [scaleMax, Math.round(scaleMax * 0.75), Math.round(scaleMax * 0.5), Math.round(scaleMax * 0.25), 0];

  return (
    <div className="lg:col-span-7 bg-white rounded-2xl border border-[#eef2f6] p-4 sm:p-5 lg:p-6 shadow-xs flex flex-col justify-between">
      {/* Card Header: Title + Timeframe Pills + Total */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] lg:text-[17px] font-black text-[#0f172a] tracking-tight">
              Earnings Overview
            </h2>
            <span className="text-[11px] font-extrabold text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-md">
              +${totalPeriodValue.toFixed(2)} USD
            </span>
          </div>
          <p className="text-[12px] text-[#64748b] mt-0.5">Real-time dynamic yield distribution</p>
        </div>

        {/* Timeframe Pill Switcher (Days / Weeks / Months / Year) */}
        <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl self-start sm:self-auto">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setSelectedTimeframe(tf.id)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-[12px] font-bold transition-all cursor-pointer ${
                selectedTimeframe === tf.id
                  ? "bg-white text-[#2563eb] shadow-2xs"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Body with Y-Axis and Bars */}
      <div className="mt-6 pt-2">
        <div className="relative h-[190px] flex items-end">
          {/* Horizontal Grid lines & Y-axis labels */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {ticks.map((tick) => (
              <div key={tick} className="flex items-center w-full">
                <span className="text-[10.5px] text-[#94a3b8] font-medium w-6 text-left">${tick}</span>
                <div className="flex-1 border-b border-[#f1f5f9] ml-1.5" />
              </div>
            ))}
          </div>

          {/* Bars Container */}
          <div className="relative w-full h-[170px] pl-8 pr-1 flex items-end justify-between gap-1.5 sm:gap-3 z-10">
            {chartData.map((item, index) => {
              const isHovered = hoveredBarIndex === index;
              const heightPct = scaleMax > 0 ? (item.value / scaleMax) * 100 : 0;
              const displayHeight = item.value > 0 ? Math.max(8, heightPct) : 2;

              return (
                <div
                  key={item.key}
                  className="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredBarIndex(index)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && item.value > 0 && (
                    <div className="absolute -top-10 bg-[#0f172a] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-30 animate-in fade-in zoom-in-95 text-center">
                      <div className="font-extrabold text-emerald-400">+${item.value.toFixed(2)} USD</div>
                      <div className="text-[9.5px] text-slate-300">
                        {item.count} Payout{item.count === 1 ? "" : "s"} • {item.fullLabel}
                      </div>
                    </div>
                  )}

                  {/* The Bar with blue gradient */}
                  <div
                    style={{ height: `${displayHeight}%` }}
                    className={`w-full max-w-[20px] sm:max-w-[34px] rounded-t-md transition-all duration-300 ${
                      item.value > 0
                        ? isHovered
                          ? "bg-gradient-to-t from-[#1d4ed8] to-[#60a5fa] shadow-md shadow-blue-500/30 scale-y-[1.03]"
                          : "bg-gradient-to-t from-[#2563eb] to-[#38bdf8]"
                        : "bg-[#e2e8f0]/60 h-[2px] rounded-full"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="pl-8 pr-1 mt-3 flex justify-between gap-1.5 sm:gap-3 text-center">
          {chartData.map((item, index) => (
            <div
              key={item.key}
              className={`flex-1 text-[10px] sm:text-[11.5px] font-medium transition-colors truncate ${
                hoveredBarIndex === index && item.value > 0
                  ? "text-[#2563eb] font-bold"
                  : item.value > 0
                  ? "text-[#0f172a] font-bold"
                  : "text-[#94a3b8]"
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
