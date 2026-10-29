"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MatrixDashboardOverview } from "@/lib/api";
import { useMatrixStore, useUserStore } from "@/lib/stores";

interface NextPositionPanelProps {
  data?: MatrixDashboardOverview | null;
}

export function NextPositionPanel({ data: propData }: NextPositionPanelProps) {
  const storeDashboard = useMatrixStore((s) => s.dashboard);
  const data = propData !== undefined ? propData : storeDashboard;
  const settings = useUserStore((s) => s.settings);
  const updateSettings = useUserStore((s) => s.updateSettings);
  const [localAutoProgression, setLocalAutoProgression] = useState<boolean | null>(null);

  const autoProgression = localAutoProgression !== null ? localAutoProgression : (settings?.autoUpgrade ?? true);

  const handleToggle = async () => {
    const newVal = !autoProgression;
    setLocalAutoProgression(newVal);
    try {
      await updateSettings({ autoUpgrade: newVal });
    } catch {
      setLocalAutoProgression(!newVal);
    }
  };

  const currentSlot = data?.currentSlot ?? 1;
  const nextSlot = Math.min(currentSlot + 1, 12);
  const nextSlotStr = nextSlot.toString().padStart(2, "0");
  const filledNodes = data?.activeSlotProgress?.filledNodes ?? 0;
  const percentFilled = Math.min(Math.round((filledNodes / 14) * 100), 100);
  const remainingNodes = Math.max(14 - filledNodes, 0);

  const totalEarnedUsd = data?.totalEarnedUsd ?? data?.totalEarnedTrob ?? 0;
  const availableUsd = data?.availableWithdrawUsd ?? data?.availableWithdrawTrob ?? 0;

  const nextPosTitle = data?.nextPosition?.title ?? "Position Progress";
  const nextPosDesc = data?.nextPosition?.description ?? `${remainingNodes} positions remaining to complete the cycle and unlock Slot ${nextSlotStr}.`;

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      {/* NEXT POSITION */}
      <div className="bg-white rounded-2xl border border-[#e8ecf1] p-3.5 sm:p-4 lg:p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wide">Next Position</span>
          <span className="text-[11px] font-semibold text-[#2563eb]">{nextPosTitle}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[24px] lg:text-[28px] font-extrabold text-[#0f172a]">Slot #{nextSlotStr}</h3>
          <span className="text-[12px] font-semibold text-[#64748b]">{filledNodes} / 14 Nodes</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-[6px] rounded-full bg-[#e2e8f0] mb-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#2563eb] transition-all duration-500"
            style={{ width: `${percentFilled}%` }}
          />
        </div>
        <p className="text-[11px] text-[#94a3b8] mb-4">
          {nextPosDesc}
        </p>
        {/* Smart Contract Automated Tier Escalation Status */}
        <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-[12px] font-bold text-[#0f172a] truncate">Auto-Tier Escalation</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[10.5px] font-extrabold uppercase tracking-wider shrink-0">
            Protocol Automated
          </span>
        </div>
      </div>

      {/* CURRENT EARNINGS */}
      <div className="bg-white rounded-2xl border border-[#e8ecf1] p-3.5 sm:p-4 lg:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-extrabold text-[#0f172a]">Current Earnings</h3>
          <Link
            href="/earnings"
            className="w-[28px] h-[28px] rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center hover:bg-[#f1f5f9]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="2" stroke="#94a3b8" strokeWidth="1.2" />
              <path d="M5 2v-1M9 2v-1M5 13v-1M9 13v-1" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
        <div className="mb-5">
          <div>
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Total Earned</span>
            <div className="text-[28px] sm:text-[32px] font-extrabold text-[#0f172a] leading-none mt-1">
              ${totalEarnedUsd.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[12px] font-bold text-[#2563eb]">
                {totalEarnedUsd > 0 ? `$${totalEarnedUsd.toFixed(2)} USD` : "Live P2P Yield"}
              </span>
              <span className="text-[#cbd5e1]">•</span>
              <span className="text-[11px] font-semibold text-[#64748b]">On-Chain Lifetime Total</span>
            </div>
          </div>
        </div>
        {/* View Earnings Button */}
        <Link
          href="/earnings"
          className="w-full h-[44px] rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-colors"
        >
          View On-Chain Earnings <span>→</span>
        </Link>
      </div>
    </div>
  );
}
