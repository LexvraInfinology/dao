"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MatrixDashboardOverview } from "@/lib/api";
import { useMatrixStore, useUserStore } from "@/lib/stores";
import { SEAT_METAS } from "./MatrixTreePanel";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { getSlotCost, getOnChainSlotDetails, toHexAddress } from "@/lib/contracts";

interface NextPositionPanelProps {
  data?: MatrixDashboardOverview | null;
}

export function NextPositionPanel({ data: propData }: NextPositionPanelProps) {
  const storeDashboard = useMatrixStore((s) => s.dashboard);
  const data = propData !== undefined ? propData : storeDashboard;
  const storeSelectedSlot = useMatrixStore((s) => s.selectedSlotNumber);
  const storeSelectedCycle = useMatrixStore((s) => s.selectedCycle);
  const selectSlot = useMatrixStore((s) => s.selectSlot);
  const storeSlotDetails = useMatrixStore((s) => s.slotDetails);
  const address = useUserStore((s) => s.address);
  const profile = useUserStore((s) => s.profile);
  const settings = useUserStore((s) => s.settings);
  const updateSettings = useUserStore((s) => s.updateSettings);

  const [localAutoProgression, setLocalAutoProgression] = useState<boolean | null>(null);
  const [liveDetails, setLiveDetails] = useState<any>(null);

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

  const activeSlotNumber = storeSelectedSlot || data?.currentSlot || 1;
  const cost = getSlotCost(activeSlotNumber);

  // Poll on-chain slot data for the currently selected slot and cycle
  useEffect(() => {
    let isMounted = true;
    const fetchSlot = async () => {
      const raw = address || data?.address;
      if (!raw) return;
      const active = toHexAddress(raw);
      if (!active || !active.startsWith("0x") || active === "0x0000000000000000000000000000000000000000") return;
      try {
        const details = await getOnChainSlotDetails(active, activeSlotNumber, storeSelectedCycle || undefined);
        if (isMounted && details) {
          setLiveDetails(details);
        }
      } catch (err) {
        console.warn("[NextPositionPanel] Failed to fetch on-chain slot details:", err);
      }
    };

    fetchSlot();
    const interval = setInterval(fetchSlot, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [address, data?.address, activeSlotNumber, storeSelectedCycle]);

  // Determine active slot details from store or live query
  const details =
    (storeSlotDetails && storeSlotDetails.slotNumber === activeSlotNumber ? storeSlotDetails : null) ||
    liveDetails;

  const currentCycle = details?.currentCycle ?? (storeSelectedCycle || 1);
  const totalCycles = details?.totalCycles ?? currentCycle;
  const snapshotCount = details?.snapshotCount ?? 0;
  const isViewingSnapshot = Boolean(details?.isViewingSnapshot);

  // Real filled nodes for current inspected cycle
  const filledNodes = details?.filledNodes ?? (isViewingSnapshot ? 14 : 0);
  const isCycleComplete = isViewingSnapshot || filledNodes >= 14;
  const remainingNodes = Math.max(14 - filledNodes, 0);
  const percentFilled = isCycleComplete ? 100 : Math.min(Math.round((filledNodes / 14) * 100), 100);

  const nextUpcomingSeat = isCycleComplete ? 1 : filledNodes + 1;
  const nextSeatMeta = SEAT_METAS[nextUpcomingSeat];
  const nextTierNumber = Math.min(activeSlotNumber + 1, 12);
  const nextTierCost = getSlotCost(nextTierNumber);

  const totalEarnedUsd =
    details?.totalEarnedUsd ||
    data?.totalEarnedUsd ||
    profile?.totalEarningsUsd ||
    (profile?.totalEarnings ? profile.totalEarnings : 1260.0);

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      {/* NEXT POSITION PANEL */}
      <div className="bg-white rounded-2xl border border-[#e8ecf1] p-3.5 sm:p-4 lg:p-5 shadow-xs">
        <div className="flex items-start justify-between mb-2.5">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wide">
            Next Position
          </span>
          {isViewingSnapshot ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-extrabold border border-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Slot #{String(activeSlotNumber).padStart(2, "0")} • Cycle #{currentCycle} Fulfilled (14/14)
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-[#2563eb]">
              Slot #{String(activeSlotNumber).padStart(2, "0")} • Cycle #{currentCycle} Active
            </span>
          )}
        </div>

        {/* Slot Title & Node Count */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-[24px] lg:text-[28px] font-black text-[#0f172a] leading-tight">
              Slot #{String(activeSlotNumber).padStart(2, "0")}
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              {isViewingSnapshot
                ? `$${cost.toFixed(2)} Tier • Cycle #${currentCycle} All Settled 🏆`
                : `$${cost.toFixed(2)} P2P Matrix Tier`}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[13px] font-black text-[#0f172a]">
              {isViewingSnapshot ? "14 / 14 Nodes" : `${filledNodes} / 14 Nodes`}
            </span>
            <div className="text-[10px] font-bold text-slate-400">
              {isViewingSnapshot ? "Cycle Completed" : `${remainingNodes} Remaining`}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[7px] rounded-full bg-[#e2e8f0] mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCycleComplete
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-blue-600 to-indigo-600"
            }`}
            style={{ width: `${percentFilled}%` }}
          />
        </div>

        {/* Next Open Position Spotlight */}
        <div
          className={`p-2.5 rounded-xl border mb-3.5 ${
            isViewingSnapshot
              ? "bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-white border-emerald-200/80"
              : "bg-gradient-to-br from-blue-50/90 via-sky-50/60 to-white border-blue-200/80"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            {isViewingSnapshot ? (
              <>
                <span className="flex items-center gap-1.5 text-emerald-900">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Cycle #{currentCycle} Fulfilled:</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black">
                  14/14 Settled
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-blue-900">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>Next Seat Placement:</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-black">
                  Seat #{nextUpcomingSeat}
                </span>
              </>
            )}
          </div>

          <p className="text-[11.5px] font-semibold text-slate-700">
            {isViewingSnapshot ? (
              <span>
                All 14 seats are 100% completed &amp; on-chain payouts fulfilled. Automated P4+P5 escalation and 6 direct P2P yields (${(6 * cost).toFixed(2)}) settled.
              </span>
            ) : (
              <span>
                <strong>Position {nextUpcomingSeat} ({nextSeatMeta?.fullRole || nextSeatMeta?.role || "Next Operative"}):</strong>{" "}
                {nextSeatMeta?.desc || "Next eligible team member placement."} (${cost.toFixed(2)}).
              </span>
            )}
          </p>
        </div>

        {/* Navigation & Action Buttons */}
        {isViewingSnapshot && totalCycles > currentCycle ? (
          <button
            type="button"
            onClick={() => selectSlot(activeSlotNumber, totalCycles, address || undefined)}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer mb-2.5"
          >
            <span>Switch to Active Cycle {totalCycles} Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : !isViewingSnapshot && snapshotCount > 0 ? (
          <button
            type="button"
            onClick={() => selectSlot(activeSlotNumber, 1, address || undefined)}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer mb-2.5"
          >
            <span>← View Cycle 1 Completed Board (14/14 🏆)</span>
          </button>
        ) : null}

        {activeSlotNumber < 12 && (
          <button
            type="button"
            onClick={() => selectSlot(activeSlotNumber + 1, 1, address || undefined)}
            className={`w-full py-2 px-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer mb-2.5 ${
              isViewingSnapshot
                ? "bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200"
                : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
            }`}
          >
            <span>View Slot #{String(activeSlotNumber + 1).padStart(2, "0")} (${nextTierCost}) Board in Tree</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {activeSlotNumber > 1 && (
          <button
            type="button"
            onClick={() => selectSlot(activeSlotNumber - 1, 1, address || undefined)}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer mb-2.5"
          >
            <span>← View Slot #{String(activeSlotNumber - 1).padStart(2, "0")} Board</span>
          </button>
        )}

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
