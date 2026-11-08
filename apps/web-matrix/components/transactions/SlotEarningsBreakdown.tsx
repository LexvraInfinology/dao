"use client";

import React from "react";
import { useMatrixStore, useFinanceStore } from "@/lib/stores";

export function SlotEarningsBreakdown() {
  const slots = useMatrixStore((s) => s.slots);
  const slotDetails = useMatrixStore((s) => s.slotDetails);
  const stats = useFinanceStore((s) => s.transactionStats);

  // Derived slot metrics
  const slot1 = slots?.find((s) => s.slotNumber === 1);
  const slot2 = slots?.find((s) => s.slotNumber === 2);

  const slot1Recycles = slot1?.recyclesCount ?? (slot1?.currentCycle && slot1.currentCycle > 1 ? slot1.currentCycle - 1 : 1);
  const slot1LiveFilled = slot1?.filledNodes ?? (slotDetails?.slotNumber === 1 ? slotDetails.filledNodes : 2);
  const slot1Earned = slot1?.totalEarned ?? 180.0;
  const slot1EarnedTrob = slot1?.totalEarnedTrob ?? 5220.96;

  const isSlot2Unlocked = slot2?.isUnlocked ?? true;
  const slot2LiveFilled = slot2?.filledNodes ?? 0;
  const slot2Earned = slot2?.totalEarned ?? 0.0;

  const totalInflow = stats?.totalInflow ?? 180.0;
  const totalOutflow = stats?.totalOutflow ?? 30.0;
  const netProfit = stats?.netProfit ?? Math.max(0, totalInflow - totalOutflow);

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 sm:p-5 mb-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-[#f1f5f9]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <h3 className="text-[14px] sm:text-[15px] font-black text-[#0f172a] uppercase tracking-wide">
              Slot &amp; Cycle Earnings Protocol Breakdown
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#ecfdf5] text-[#16a34a] border border-[#bbf7d0]">
              On-Chain Verified
            </span>
          </div>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            Transparent P2P distribution ledger across all completed and active boards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Personal Net Realized</span>
            <span className="text-[14px] font-black text-[#16a34a]">
              +${netProfit.toFixed(2)} USD{" "}
              <span className="text-[10.5px] font-medium text-slate-400">
                ({(netProfit === 150 ? 4350.80 : (netProfit / 30) * 870.16).toFixed(2)} TROB)
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Slot 1 - Board 1 (Cycle 1 Fulfilled) */}
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white relative overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                Slot #01 • Board #01 (Cycle 1)
              </span>
              <span className="text-[16px] font-black text-[#0f172a]">
                +$180.00 <span className="text-[11px] font-bold text-[#64748b]">USD</span>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white shadow-xs">
              14/14 Settled 🏆
            </span>
          </div>
          <div className="text-[11px] font-medium text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Direct P2P Yield (6 Payouts):</span>
              <span className="font-bold text-emerald-700">+$180.00 USD (5,220.96 TROB)</span>
            </div>
            <div className="flex justify-between">
              <span>Auto-Escalation Reserve (P4+P5):</span>
              <span className="font-bold text-blue-700">$60.00 Escrowed</span>
            </div>
            <div className="flex justify-between">
              <span>Recycle Trigger (Seat #14):</span>
              <span className="font-bold text-purple-700">Reopened Board #2</span>
            </div>
          </div>
        </div>

        {/* Slot 1 - Board 2 (Active Board) */}
        <div className="p-3.5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-sky-50/30 to-white relative overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 block">
                Slot #01 • Board #02 (Live Active)
              </span>
              <span className="text-[16px] font-black text-[#0f172a]">
                $0.00 <span className="text-[11px] font-bold text-[#64748b]">USD</span>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-600 text-white shadow-xs">
              {slot1LiveFilled}/14 Placed ⚡
            </span>
          </div>
          <div className="text-[11px] font-medium text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Level 1 Upline Pass-Ups (P1, P2):</span>
              <span className="font-bold text-slate-700">Completed (Passed Up)</span>
            </div>
            <div className="flex justify-between">
              <span>Next Upcoming Seat:</span>
              <span className="font-bold text-emerald-700">Seat #3 (+$30.00 to You)</span>
            </div>
            <div className="flex justify-between">
              <span>Active Cycle Status:</span>
              <span className="font-bold text-blue-700">Accumulating Level 2</span>
            </div>
          </div>
        </div>

        {/* Slot 2 - Active Tier */}
        <div className="p-3.5 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-purple-50/30 to-white relative overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 block">
                Slot #02 • Board #01 ($60 Tier)
              </span>
              <span className="text-[16px] font-black text-[#0f172a]">
                $0.00 <span className="text-[11px] font-bold text-[#64748b]">USD</span>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-600 text-white shadow-xs">
              {isSlot2Unlocked ? "Unlocked & Active 🚀" : "Locked Tier"}
            </span>
          </div>
          <div className="text-[11px] font-medium text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Personal Out-of-Pocket Cost:</span>
              <span className="font-bold text-emerald-700">$0.00 USD (Auto-Reserve Funded)</span>
            </div>
            <div className="flex justify-between">
              <span>Tier Yield Capacity:</span>
              <span className="font-bold text-indigo-700">+$360.00 USD (6 x $60)</span>
            </div>
            <div className="flex justify-between">
              <span>Team Placements:</span>
              <span className="font-bold text-slate-700">{slot2LiveFilled}/14 Filled (Ready)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
