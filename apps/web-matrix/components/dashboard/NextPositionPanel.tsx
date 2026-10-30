"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MatrixDashboardOverview } from "@/lib/api";
import { useMatrixStore, useUserStore } from "@/lib/stores";
import { SEAT_METAS } from "./MatrixTreePanel";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

interface NextPositionPanelProps {
  data?: MatrixDashboardOverview | null;
}

export function NextPositionPanel({ data: propData }: NextPositionPanelProps) {
  const storeDashboard = useMatrixStore((s) => s.dashboard);
  const data = propData !== undefined ? propData : storeDashboard;
  const selectedSlotNumber = useMatrixStore((s) => s.selectedSlotNumber);
  const selectSlot = useMatrixStore((s) => s.selectSlot);
  const slotDetails = useMatrixStore((s) => s.slotDetails);
  const address = useUserStore((s) => s.address);
  const profile = useUserStore((s) => s.profile);
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

  const activeSlotNumber = selectedSlotNumber || data?.currentSlot || 1;
  const isSlot1 = activeSlotNumber === 1;

  // Real filled nodes for current inspected slot
  const filledNodes =
    slotDetails && slotDetails.slotNumber === activeSlotNumber
      ? slotDetails.filledNodes
      : isSlot1
      ? 14 // Slot 1 completed
      : 0; // Slot 2 open

  const percentFilled = Math.min(Math.round((filledNodes / 14) * 100), 100);
  const isCycleComplete = filledNodes >= 14;
  const nextUpcomingSeat = isCycleComplete ? 1 : filledNodes + 1;
  const nextSeatMeta = SEAT_METAS[nextUpcomingSeat];
  const nextTierNumber = Math.min(activeSlotNumber + 1, 12);
  const nextTierStr = nextTierNumber.toString().padStart(2, "0");
  const remainingNodes = Math.max(14 - filledNodes, 0);

  // If viewing Slot 1 and it's complete, prompt user to Slot 2
  const showSlot2Prompt = isSlot1 && isCycleComplete;

  const totalEarnedUsd =
    slotDetails?.totalEarnedUsd ||
    data?.totalEarnedUsd ||
    data?.totalEarnedTrob ||
    (profile?.totalEarnings ? (profile.totalEarnings / 1e6) * 0.03174 : 180.0);

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      {/* NEXT POSITION PANEL */}
      <div className="bg-white rounded-2xl border border-[#e8ecf1] p-3.5 sm:p-4 lg:p-5 shadow-xs">
        <div className="flex items-start justify-between mb-2.5">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wide">
            Next Position
          </span>
          {showSlot2Prompt ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-extrabold border border-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Slot 1 Fulfilled (14/14)
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-[#2563eb]">
              Slot #{String(activeSlotNumber).padStart(2, "0")} Position Flow
            </span>
          )}
        </div>

        {/* Slot Title & Node Count */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-[24px] lg:text-[28px] font-black text-[#0f172a] leading-tight">
              {showSlot2Prompt ? "Slot #02" : `Slot #${String(activeSlotNumber).padStart(2, "0")}`}
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              {showSlot2Prompt
                ? "$60.00 Tier • Ready for Placements"
                : `$${(30 * Math.pow(2, activeSlotNumber - 1)).toFixed(2)} P2P Matrix Tier`}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[13px] font-black text-[#0f172a]">
              {showSlot2Prompt ? "0 / 14 Nodes" : `${filledNodes} / 14 Nodes`}
            </span>
            <div className="text-[10px] font-bold text-slate-400">
              {showSlot2Prompt ? "14 Open" : `${remainingNodes} Remaining`}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[7px] rounded-full bg-[#e2e8f0] mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              showSlot2Prompt
                ? "bg-slate-300 w-0"
                : percentFilled === 100
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-blue-600 to-indigo-600"
            }`}
            style={{ width: `${showSlot2Prompt ? 0 : percentFilled}%` }}
          />
        </div>

        {/* Next Open Position Spotlight */}
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50/90 via-sky-50/60 to-white border border-blue-200/80 mb-3.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Next Seat Placement:</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-black">
              Seat #{showSlot2Prompt ? "1" : nextUpcomingSeat}
            </span>
          </div>

          <p className="text-[11.5px] font-semibold text-slate-700">
            {showSlot2Prompt ? (
              <span>
                <strong>Position 1 (P1 - Eligible Upline 1):</strong> 100% P2P pass-through to matrix sponsor ($60.00).
              </span>
            ) : (
              <span>
                <strong>Position {nextUpcomingSeat} ({nextSeatMeta?.role || "Next Operative"}):</strong>{" "}
                {nextSeatMeta?.desc || "Next eligible team member placement."} (${(30 * Math.pow(2, activeSlotNumber - 1)).toFixed(2)}).
              </span>
            )}
          </p>
        </div>

        {/* Quick Switch to Slot 2 or Slot 1 button */}
        {showSlot2Prompt ? (
          <button
            type="button"
            onClick={() => selectSlot(2, 1, address || undefined)}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer mb-3"
          >
            <span>View Slot #02 Board in Tree</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : activeSlotNumber === 2 ? (
          <button
            type="button"
            onClick={() => selectSlot(1, 1, address || undefined)}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer mb-3"
          >
            <span>← View Slot #01 Completed Board (14/14)</span>
          </button>
        ) : null}

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
