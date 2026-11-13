"use client";

import React from "react";
import { useMatrixStore, useFinanceStore, useUserStore } from "@/lib/stores";
import { getSlotCost } from "@/lib/contracts";

interface CycleCard {
  key: string;
  slotNumber: number;
  cycleNumber: number;
  isCompleted: boolean;
  isLive: boolean;
  filledNodes: number;
  paidSeats: number;
  earnedUsd: number;
  costUsd: number;
  fundingLabel: string;
}

export function SlotEarningsBreakdown() {
  const slots = useMatrixStore((s) => s.slots);
  const slotDetails = useMatrixStore((s) => s.slotDetails);
  const profile = useUserStore((s) => s.profile);
  const stats = useFinanceStore((s) => s.transactionStats);

  const unitCostUsd = getSlotCost(1) || 30;
  const totalInflow = Number(stats?.totalInflow ?? profile?.totalEarningsUsd ?? profile?.totalEarnings ?? 0);
  const totalOutflow = Number(stats?.totalOutflow ?? 0);
  const netProfit = Number(stats?.netProfit ?? Math.max(0, totalInflow - totalOutflow));
  const netProfitTrob = Number(
    (stats as any)?.netProfitTrob ??
      Math.max(
        0,
        Number((stats as any)?.totalInflowTrob ?? profile?.totalEarningsTrob ?? 0) -
          Number((stats as any)?.totalOutflowTrob ?? 0)
      )
  );

  // Build per-(slot, cycle) ledger cards exclusively from live on-chain slot data
  const cards: CycleCard[] = [];
  const unlockedSlots = (slots || []).filter((s) => s.isUnlocked);

  for (const s of unlockedSlots) {
    const slotCost = getSlotCost(s.slotNumber) || unitCostUsd;
    const rawBreakdowns: any[] | undefined = (s as any).cycleBreakdowns;

    if (Array.isArray(rawBreakdowns) && rawBreakdowns.length > 0) {
      for (const b of rawBreakdowns) {
        cards.push({
          key: `s${s.slotNumber}-c${b.cycleNumber}`,
          slotNumber: s.slotNumber,
          cycleNumber: b.cycleNumber,
          isCompleted: Boolean(b.isCompleted),
          isLive: Boolean(s.isLive && !b.isCompleted),
          filledNodes: Number(b.filledNodes || 0),
          paidSeats: Number(b.paidSeats || 0),
          earnedUsd: Number(b.earnedUsd || 0),
          costUsd: slotCost,
          fundingLabel:
            s.slotNumber === 1 && b.cycleNumber === 1
              ? `1x Wallet Entry ($${slotCost.toFixed(2)})`
              : s.slotNumber === 1
              ? "Auto-Recycle via Seat #14 ($0 Out-of-Pocket)"
              : "P4+P5 Auto-Reserve ($0 Out-of-Pocket)",
        });
      }
    } else {
      const completedCycles = Math.max(
        s.recyclesCount ?? 0,
        (s.slotCycle ?? s.currentCycle ?? 1) > 1 ? (s.slotCycle ?? s.currentCycle ?? 1) - 1 : 0
      );
      for (let c = 1; c <= completedCycles; c++) {
        cards.push({
          key: `s${s.slotNumber}-c${c}`,
          slotNumber: s.slotNumber,
          cycleNumber: c,
          isCompleted: true,
          isLive: false,
          filledNodes: 14,
          paidSeats: 6,
          earnedUsd: 6 * slotCost,
          costUsd: slotCost,
          fundingLabel:
            s.slotNumber === 1 && c === 1
              ? `1x Wallet Entry ($${slotCost.toFixed(2)})`
              : s.slotNumber === 1
              ? "Auto-Recycle via Seat #14 ($0 Out-of-Pocket)"
              : "P4+P5 Auto-Reserve ($0 Out-of-Pocket)",
        });
      }

      const activeCycleNum = completedCycles + 1;
      const totalSlotUsd = Number(s.totalEarnedUsd ?? s.totalEarned ?? 0);
      const completedUsd = completedCycles * 6 * slotCost;
      let activeEarnedUsd = Math.max(0, Number((totalSlotUsd - completedUsd).toFixed(2)));
      if (
        slotDetails &&
        slotDetails.slotNumber === s.slotNumber &&
        !slotDetails.isViewingSnapshot &&
        Array.isArray(slotDetails.nodes)
      ) {
        const directCount = slotDetails.nodes.filter(
          (n) => n.filled && n.payoutType === "DIRECT"
        ).length;
        if (directCount > 0) activeEarnedUsd = directCount * slotCost;
      }
      const activePaidSeats = slotCost > 0 ? Math.round(activeEarnedUsd / slotCost) : 0;

      cards.push({
        key: `s${s.slotNumber}-c${activeCycleNum}`,
        slotNumber: s.slotNumber,
        cycleNumber: activeCycleNum,
        isCompleted: (s.filledNodes || 0) >= 14,
        isLive: Boolean(s.isLive || (s.filledNodes || 0) < 14),
        filledNodes: Number(s.filledNodes || 0),
        paidSeats: activePaidSeats,
        earnedUsd: activeEarnedUsd,
        costUsd: slotCost,
        fundingLabel:
          s.slotNumber === 1 && activeCycleNum === 1
            ? `1x Wallet Entry ($${slotCost.toFixed(2)})`
            : s.slotNumber === 1
            ? "Auto-Recycle via Seat #14 ($0 Out-of-Pocket)"
            : "P4+P5 Auto-Reserve ($0 Out-of-Pocket)",
      });
    }
  }

  const earningTerms = cards
    .filter((c) => c.earnedUsd > 0)
    .map((c) => `$${c.earnedUsd.toFixed(0)} (Slot #${String(c.slotNumber).padStart(2, "0")})`);

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 sm:p-5 mb-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-[#f1f5f9]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <h3 className="text-[14px] sm:text-[15px] font-black text-[#0f172a] uppercase tracking-wide">
              Slot &amp; Cycle Earnings Breakdown
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#ecfdf5] text-[#16a34a] border border-[#bbf7d0]">
              Live On-Chain
            </span>
          </div>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            {earningTerms.length > 0
              ? `Earnings Formula: ${earningTerms.join(" + ")} = $${totalInflow.toFixed(2)} USD`
              : "Live per-slot & per-cycle P2P payout tracking directly from TrobChain"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Total Realized Income
            </span>
            <span className="text-[14px] font-black text-[#16a34a]">
              +${totalInflow.toFixed(2)} USD
              {netProfitTrob !== 0 && (
                <span className="text-[10.5px] font-medium text-slate-400 ml-1">
                  ({Math.abs(Number((stats as any)?.totalInflowTrob ?? profile?.totalEarningsTrob ?? netProfitTrob)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB)
                </span>
              )}
            </span>
            <div className="text-[9.5px] text-emerald-700 font-semibold mt-0.5">
              +${(totalInflow - totalOutflow).toFixed(0)} Net after $30 Entry
            </div>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
          <p className="text-[13px] font-bold text-slate-700">No Active Matrix Slots Found On-Chain</p>
          <p className="text-[11.5px] text-slate-500 mt-1">
            Activate Slot #01 (${unitCostUsd.toFixed(2)} one-time entry) to unlock your live matrix cycles and P2P distribution ledger.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card) => {
            const tone = card.isCompleted
              ? "border-emerald-200 from-emerald-50/70 via-teal-50/30 to-white"
              : card.slotNumber > 1
              ? "border-indigo-200 from-indigo-50/70 via-purple-50/30 to-white"
              : "border-blue-200 from-blue-50/70 via-sky-50/30 to-white";

            return (
              <div
                key={card.key}
                className={`p-3.5 rounded-xl border bg-gradient-to-br ${tone} relative overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                        card.isCompleted
                          ? "text-emerald-800"
                          : card.slotNumber > 1
                          ? "text-indigo-800"
                          : "text-blue-800"
                      }`}
                    >
                      Slot #{String(card.slotNumber).padStart(2, "0")} • Cycle #{card.cycleNumber}
                    </span>
                    <span className="text-[16px] font-black text-[#0f172a]">
                      {card.earnedUsd > 0 ? `+$${card.earnedUsd.toFixed(2)}` : "$0.00"}{" "}
                      <span className="text-[11px] font-bold text-[#64748b]">USD</span>
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white shadow-xs shrink-0 ${
                      card.isCompleted
                        ? "bg-emerald-600"
                        : card.slotNumber > 1
                        ? "bg-indigo-600"
                        : "bg-blue-600"
                    }`}
                  >
                    {card.isCompleted ? "14/14 Settled" : `${card.filledNodes}/14 Placed`}
                  </span>
                </div>

                <div className="text-[11px] font-medium text-slate-600 space-y-1">
                  <div className="flex justify-between gap-2">
                    <span>Direct Payouts ({card.paidSeats} × ${card.costUsd.toFixed(0)}):</span>
                    <span className={`font-bold ${card.earnedUsd > 0 ? "text-emerald-700" : "text-slate-600"}`}>
                      +${card.earnedUsd.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Slot Yield Capacity:</span>
                    <span className="font-bold text-slate-700">+${(6 * card.costUsd).toFixed(2)} USD (6 × ${card.costUsd.toFixed(0)})</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Activation Cost:</span>
                    <span className="font-bold text-blue-700 truncate">{card.fundingLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

