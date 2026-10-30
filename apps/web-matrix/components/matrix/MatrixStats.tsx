"use client";

import React from "react";
import { Lock } from "lucide-react";
import { MatrixSlotSummary, MatrixUserProfile } from "@/lib/api";
import { useMatrixStore, useUserStore } from "@/lib/stores";

export interface MatrixStatsProps {
  slots?: MatrixSlotSummary[];
  selectedSlotNumber?: number;
  onSelectSlot?: (slotNum: number) => void;
  onBuySlot?: (slotNum: number) => void;
  profile?: MatrixUserProfile | null;
  buyingSlot?: boolean;
}

export function MatrixStats(props: MatrixStatsProps = {}) {
  const storeSlots = useMatrixStore((s) => s.slots);
  const storeSelectedSlot = useMatrixStore((s) => s.selectedSlotNumber);
  const storeSelectSlot = useMatrixStore((s) => s.selectSlot);
  const storeBuySlot = useMatrixStore((s) => s.buySlot);
  const storeBuyingSlot = useMatrixStore((s) => s.buyingSlot);
  const storeProfile = useUserStore((s) => s.profile);

  const slots = props.slots ?? storeSlots;
  const selectedSlotNumber = props.selectedSlotNumber ?? storeSelectedSlot;
  const onSelectSlot = props.onSelectSlot ?? storeSelectSlot;
  const onBuySlot = props.onBuySlot ?? storeBuySlot;
  const profile = props.profile ?? storeProfile;
  const buyingSlot = props.buyingSlot ?? storeBuyingSlot;
  const currentSlotSummary = slots?.find((s) => s.slotNumber === selectedSlotNumber);
  const filledNodes = currentSlotSummary?.filledNodes ?? 0;
  const currentCycle = currentSlotSummary?.currentCycle ?? (currentSlotSummary?.isUnlocked ? 1 : 0);
  const isUnlocked = currentSlotSummary?.isUnlocked ?? (selectedSlotNumber <= 4);
  const slotCost = currentSlotSummary?.cost ?? (30 * Math.pow(2, selectedSlotNumber - 1));
  const totalEarned = profile?.matrixEarnings ?? profile?.totalEarnings ?? slots?.reduce((sum, s) => sum + (s.totalEarned || 0), 0) ?? 1260;

  return (
    <>
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-5">
        {/* Title & Description */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
            <span className="text-[11px] font-extrabold text-[#2563eb] tracking-[0.1em] uppercase">
              MATRIX ENGINE
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[30px] lg:text-[32px] font-black text-[#0f172a] tracking-tight leading-tight">
            My Matrix
          </h1>
          <p className="text-[13px] sm:text-[13.5px] text-[#64748b] leading-relaxed max-w-[480px] mt-1">
            Interactive 14–node progression tree across all 12 slots. Track cycles and spillovers.
          </p>
        </div>

        {/* ──────── TOP KPI CARDS ──────── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Card 1: Current Slot */}
          <div className="bg-white border border-[#e8ecf1] rounded-2xl px-5 py-3.5 flex items-center gap-3.5 shadow-xs min-w-[160px]">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 16h14a1 1 0 0 0 1-1l1-8-4.5 4L12 4 7.5 11 3 7l1 8a1 1 0 0 0 1 1z" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#64748b] block">Selected Slot</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-[16px] font-extrabold text-[#0f172a]">Slot #{selectedSlotNumber}</span>
                <span className="text-[11px] font-semibold text-[#94a3b8]">Cycle {currentCycle}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Nodes Filled */}
          <div className="bg-white border border-[#e8ecf1] rounded-2xl px-5 py-3.5 flex items-center gap-3.5 shadow-xs min-w-[160px]">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-[#64748b] block">Nodes Filled</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-[16px] font-extrabold text-[#0f172a]">{filledNodes} / 14</span>
                <span className="text-[11px] font-bold text-[#2563eb]">
                  {Math.round((filledNodes / 14) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Volume */}
          <div className="bg-white border border-[#e8ecf1] rounded-2xl px-5 py-3.5 flex items-center gap-3.5 shadow-xs min-w-[160px]">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#64748b] block">Total Volume</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[16px] font-extrabold text-[#0f172a]">${totalEarned.toFixed(2)}</span>
                <span className="text-[11px] font-bold text-[#2563eb]">USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────── 12-SLOT SELECTION BAR ──────── */}
      <div className="bg-white border border-[#e8ecf1] rounded-2xl p-3 mb-5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-2 min-w-[700px]">
          <span className="text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider pl-2 pr-1 flex-shrink-0">
            Slots:
          </span>
          {Array.from({ length: 12 }, (_, i) => {
            const slotNum = i + 1;
            const item = slots?.find((s) => s.slotNumber === slotNum);
            const cost = item?.cost ?? (30 * Math.pow(2, slotNum - 1));
            const unlocked = item?.isUnlocked ?? (slotNum <= 4);
            const isSelected = selectedSlotNumber === slotNum;

            return (
              <button
                key={slotNum}
                onClick={() => onSelectSlot && onSelectSlot(slotNum)}
                className={`flex-1 py-2 px-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/20"
                    : unlocked
                    ? "bg-[#f8fafc] text-[#0f172a] hover:bg-[#eff6ff] border border-[#e2e8f0]"
                    : "bg-[#f1f5f9] text-[#94a3b8] border border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-black">
                    #{slotNum.toString().padStart(2, "0")}
                  </span>
                  {!unlocked && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                </div>
                <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? "text-white/80" : "text-[#64748b]"}`}>
                  ${cost}
                </span>
              </button>
            );
          })}

          {/* On-Chain Progression Status Badge (Automated via Node 4 & 5) */}
          <div className="flex-shrink-0">
            {isUnlocked && currentSlotSummary?.isLive !== false ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[11.5px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                <span>Slot #{selectedSlotNumber} Active</span>
              </div>
            ) : isUnlocked && currentSlotSummary?.isLive === false ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[11.5px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Standby Reserved ($0 Out-of-Pocket)</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-[#f1f5f9] border border-slate-200 text-slate-500 text-[11px] font-semibold flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Auto-Unlocks via Node 4 & 5 in Slot #{Math.max(1, selectedSlotNumber - 1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
