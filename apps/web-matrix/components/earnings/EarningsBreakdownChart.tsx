"use client";

import React, { useState } from "react";

import { useFinanceStore, useUserStore } from "@/lib/stores";

export function EarningsBreakdownChart() {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const earnings = useFinanceStore((s) => s.earnings);
  const profile = useUserStore((s) => s.profile);

  // Sanitize values to prevent raw SUN/Wei leaking into USD amounts
  const cleanVal = (val: number) => {
    let v = Number(val) || 0;
    while (v > 100000) {
      v = v / 1e6;
    }
    return Math.max(0, v);
  };
  const totalLifetime = cleanVal(
    Number(
      (earnings as any)?.totalEarningsUsd ??
      earnings?.totalEarnings ??
      (profile as any)?.totalEarningsUsd ??
      profile?.totalEarnings ??
      0
    )
  );

  const slotBreakdowns = (earnings as any)?.slotBreakdowns || [];
  const s1Breakdown = slotBreakdowns.find((s: any) => s.slotNumber === 1);
  const s2Breakdown = slotBreakdowns.find((s: any) => s.slotNumber === 2);

  const slot1Amount = s1Breakdown
    ? Number(s1Breakdown.earnedUsd || 0)
    : Math.min(totalLifetime, 180);
  const slot2Amount = s2Breakdown
    ? Number(s2Breakdown.earnedUsd || 0)
    : Math.max(0, totalLifetime - slot1Amount);
  const royaltyAmount = 0;

  const totalAmount = totalLifetime > 0 ? totalLifetime : slot1Amount + slot2Amount;

  const slot1Pct = totalAmount > 0 ? (slot1Amount / totalAmount) * 100 : 0;
  const slot2Pct = totalAmount > 0 ? (slot2Amount / totalAmount) * 100 : 0;
  const royaltyPct = totalAmount > 0 ? (royaltyAmount / totalAmount) * 100 : 0;

  const circumference = 364.42; // 2 * pi * 58
  const slot1Stroke = (slot1Pct / 100) * circumference;
  const slot2Stroke = (slot2Pct / 100) * circumference;
  const royaltyStroke = (royaltyPct / 100) * circumference;

  const breakdownData = [
    {
      id: "slot1",
      name: "Slot #01 Matrix Yield",
      subText: `${s1Breakdown?.paidSeats ?? Math.round(slot1Amount / 30)} Direct P2P Payouts`,
      amount: `$${slot1Amount.toFixed(2)} USD`,
      percent: `${slot1Pct.toFixed(1)}%`,
      color: "#0047cc", // Deep Royal Navy Blue
      dotClass: "bg-[#0047cc]",
    },
    {
      id: "slot2",
      name: "Slot #02 Matrix Yield",
      subText: `${s2Breakdown?.paidSeats ?? Math.round(slot2Amount / 30)} Direct P2P Payout`,
      amount: `$${slot2Amount.toFixed(2)} USD`,
      percent: `${slot2Pct.toFixed(1)}%`,
      color: "#0088ff", // Sky / Bright Blue
      dotClass: "bg-[#0088ff]",
    },
    {
      id: "royalty",
      name: "Leadership Royalty",
      subText: "Protocol Pool Distribution",
      amount: `$${royaltyAmount.toFixed(2)} USD`,
      percent: `${royaltyPct.toFixed(1)}%`,
      color: "#38bdf8", // Light Cyan
      dotClass: "bg-[#38bdf8]",
    },
  ];

  return (
    <div className="lg:col-span-5 bg-white rounded-2xl border border-[#eef2f6] p-4 sm:p-5 lg:p-6 shadow-xs flex flex-col justify-between min-w-0">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] lg:text-[17px] font-black text-[#0f172a] tracking-tight">
          Earnings Breakdown
        </h2>
      </div>

      {/* Main Content: Responsive layout */}
      {/* On Desktop xl: Side by side (Donut on left, Legend on right) */}
      {/* On Tablet lg & Mobile: Stacked (Donut on top, Legend below) */}
      <div className="mt-3 sm:mt-4 flex flex-col xl:flex-row items-center justify-between gap-5 xl:gap-3 flex-1 w-full min-w-0">
        {/* Donut Chart Container */}
        <div className="relative w-[180px] h-[180px] flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background ring track */}
            <circle
              cx="80"
              cy="80"
              r="58"
              stroke="#f1f5f9"
              strokeWidth="24"
              fill="none"
            />

                    {/* Segment 1: Slot #01 Matrix Yield */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      stroke="#0047cc"
                      strokeWidth="24"
                      strokeDasharray={`${slot1Stroke} ${circumference}`}
                      strokeDashoffset="0"
                      fill="none"
                      className="cursor-pointer transition-all duration-300 hover:opacity-90"
                      onMouseEnter={() => setHoveredSegment("slot1")}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />

                    {/* Segment 2: Slot #02 Matrix Yield */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      stroke="#0088ff"
                      strokeWidth="24"
                      strokeDasharray={`${slot2Stroke} ${circumference}`}
                      strokeDashoffset={`-${slot1Stroke}`}
                      fill="none"
                      className="cursor-pointer transition-all duration-300 hover:opacity-90"
                      onMouseEnter={() => setHoveredSegment("slot2")}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />

                    {/* Segment 3: Royalty */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      stroke="#38bdf8"
                      strokeWidth="24"
                      strokeDasharray={`${royaltyStroke} ${circumference}`}
                      strokeDashoffset={`-${slot1Stroke + slot2Stroke}`}
                      fill="none"
                      className="cursor-pointer transition-all duration-300 hover:opacity-90"
                      onMouseEnter={() => setHoveredSegment("royalty")}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  </svg>

          {/* Centered Donut Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[22px] sm:text-[23px] font-black text-[#0f172a] leading-none tracking-tight">
              ${totalAmount.toFixed(2)}
            </span>
            <span className="text-[11px] font-black text-[#2563eb] tracking-wider uppercase mt-1">
              USD
            </span>
            <span className="text-[10px] text-[#64748b] font-medium mt-0.5">
              Total Earnings
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full flex-1 space-y-3 xl:space-y-3.5 min-w-0">
          {breakdownData.map((item) => {
            const isHighlighted = hoveredSegment === item.id;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredSegment(item.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${isHighlighted ? "bg-[#f8fafc] ring-1 ring-[#e2e8f0]" : ""
                  }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${item.dotClass}`}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-[#0f172a] leading-snug truncate">
                      {item.name}
                    </div>
                    {/* Subtext shown on mobile, hidden on desktop to match Figma desktop screenshot */}
                    <div className="text-[11px] text-[#64748b] leading-tight xl:hidden truncate">
                      {item.subText}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 flex xl:flex-row flex-col xl:items-center gap-0 xl:gap-3">
                  <span className="text-[13px] font-black text-[#0f172a]">
                    {item.amount}
                  </span>
                  <span className="text-[11.5px] font-bold text-[#2563eb] xl:text-[#64748b]">
                    {item.percent}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
