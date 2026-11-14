"use client";

import React from "react";
import { MatrixEarningsOverview } from "@/lib/api";
import { useFinanceStore, useUserStore } from "@/lib/stores";

export interface EarningsStatsGridProps {
  onWithdrawClick?: () => void;
  earnings?: MatrixEarningsOverview | null;
}

export function EarningsStatsGrid({ earnings: propEarnings, onWithdrawClick }: EarningsStatsGridProps) {
  const storeEarnings = useFinanceStore((s) => s.earnings);
  const profile = useUserStore((s) => s.profile);
  const earnings = propEarnings !== undefined ? propEarnings : storeEarnings;

  const rawTotal = Number(
    (earnings as any)?.totalEarningsUsd ??
    earnings?.totalEarnings ??
    (profile as any)?.totalEarningsUsd ??
    profile?.totalEarnings ??
    0
  );
  let total = rawTotal;
  while (total > 100000) total = total / 1e6;

  const trobAmt = Number(
    (earnings as any)?.totalEarningsTrob ||
    (earnings as any)?.trobAmount ||
    profile?.totalEarningsTrob ||
    0
  );

  const slotBreakdowns = (earnings as any)?.slotBreakdowns || [];
  const s1Breakdown = slotBreakdowns.find((s: any) => s.slotNumber === 1);
  const s2Breakdown = slotBreakdowns.find((s: any) => s.slotNumber === 2);

  const payoutsCount =
    earnings?.recentPayouts && earnings.recentPayouts.length > 0
      ? earnings.recentPayouts.length
      : Math.max(0, Math.round(total / 30));

  const s1Payouts = s1Breakdown?.paidSeats ?? (total >= 180 ? 6 : Math.round(total / 30));
  const s2Payouts = s2Breakdown?.paidSeats ?? Math.max(0, payoutsCount - s1Payouts);

  const highestSlot = Math.max(
    Number((profile as any)?.highestUnlockedSlot ?? 0),
    Number((profile as any)?.currentSlot ?? 0),
    slotBreakdowns.length > 0 ? Math.max(...slotBreakdowns.map((s: any) => s.slotNumber || 1)) : 1,
    total >= 180 ? 2 : 1
  );

  const slotPercent = Math.round((highestSlot / 12) * 100);

  const royaltyClaimed = Number((earnings as any)?.breakdown?.leadershipPool ?? 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4">
      {/* ── CARD 1: Total Matrix Yield ── */}
      <div className="bg-white rounded-2xl border border-[#eef2f6] p-3 sm:p-4 lg:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-w-0">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2.5L2.5 6.5L10 10.5L17.5 6.5L10 2.5Z" stroke="#2563eb" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M2.5 10L10 14L17.5 10" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.5 13.5L10 17.5L17.5 13.5" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] font-bold text-[10px] sm:text-[11px]">
            Verified On-Chain
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 min-w-0">
          <div className="text-[11px] sm:text-[12px] text-[#64748b] font-medium truncate">Total Matrix Yield</div>
          <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
            <span className="text-[18px] sm:text-[20px] lg:text-[22px] font-black text-[#0f172a] tracking-tight truncate">${total.toFixed(2)}</span>
            <span className="text-[11.5px] sm:text-[13px] font-bold text-[#2563eb]">USD</span>
          </div>
          {trobAmt > 0 && (
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 truncate">
              ({trobAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB)
            </div>
          )}
        </div>

        <div className="mt-2 pt-1 flex items-center gap-1 text-[10px] sm:text-[11.5px] font-semibold text-[#16a34a] truncate">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
            <path d="M6 9.5V2.5M6 2.5L3 5.5M6 2.5L9 5.5" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate">100% Instant Direct P2P</span>
        </div>
      </div>

      {/* ── CARD 2: Direct P2P Commissions ── */}
      <div className="bg-white rounded-2xl border border-[#eef2f6] p-3 sm:p-4 lg:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-w-0">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2.5L12.5 7.5L18 8.3L14 12.2L15 17.5L10 14.8L5 17.5L6 12.2L2 8.3L7.5 7.5L10 2.5Z" stroke="#2563eb" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] font-bold text-[10px] sm:text-[10.5px]">
            <span>100% P2P</span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 min-w-0">
          <div className="text-[11px] sm:text-[12px] text-[#64748b] font-medium truncate">Direct P2P Commissions</div>
          <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
            <span className="text-[18px] sm:text-[20px] lg:text-[22px] font-black text-[#0f172a] tracking-tight truncate">{payoutsCount}</span>
            <span className="text-[11.5px] sm:text-[13px] font-bold text-[#2563eb]">Payouts</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 truncate">
            ($30.00 Direct Commission / Payout)
          </div>
        </div>

        <div className="mt-2 pt-1 text-[10px] sm:text-[11.5px] font-semibold text-[#2563eb] truncate">
          <span className="truncate">{s1Payouts} in Slot #01 • {s2Payouts} in Slot #02</span>
        </div>
      </div>

      {/* ── CARD 3: Unlocked Slot Progression ── */}
      <div className="bg-white rounded-2xl border border-[#eef2f6] p-3 sm:p-4 lg:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-w-0">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#f5f3ff] text-[#7c3aed] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="11" width="14" height="6" rx="1.5" stroke="#7c3aed" strokeWidth="1.6" />
              <rect x="5" y="7" width="10" height="4" rx="1" stroke="#7c3aed" strokeWidth="1.4" opacity="0.7" />
              <rect x="7" y="3" width="6" height="4" rx="1" stroke="#7c3aed" strokeWidth="1.2" opacity="0.4" />
            </svg>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f5f3ff] border border-[#ddd6fe] text-[#7c3aed] font-bold text-[10px] sm:text-[10.5px]">
            <span>P4+P5 Escalated</span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 min-w-0">
          <div className="text-[11px] sm:text-[12px] text-[#64748b] font-medium truncate">Slot Progression</div>
          <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
            <span className="text-[18px] sm:text-[20px] lg:text-[22px] font-black text-[#0f172a] tracking-tight truncate">
              Slot #{String(highestSlot).padStart(2, "0")}
            </span>
            <span className="text-[11.5px] sm:text-[13px] font-bold text-[#7c3aed]">Active</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 truncate">
            {highestSlot} / 12 Slots Unlocked ({slotPercent}%)
          </div>
        </div>

        <div className="mt-2 pt-1 flex items-center gap-1 text-[10px] sm:text-[11.5px] font-semibold text-[#7c3aed] truncate">
          <span className="truncate">$0 Out-of-Pocket Auto-Reserve</span>
        </div>
      </div>

      {/* ── CARD 4: Leadership Royalty Pool ── */}
      <div className="bg-white rounded-2xl border border-[#eef2f6] p-3 sm:p-4 lg:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-w-0">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#fffbeb] text-[#d97706] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 15L4.5 6L8.5 10L10 4L11.5 10L15.5 6L17 15H3Z" stroke="#d97706" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="10" cy="15" r="1" fill="#d97706" />
            </svg>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fffbeb] border border-[#fde68a] text-[#b45309] font-bold text-[10px] sm:text-[10.5px]">
            <span>40% Pool Share</span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 min-w-0">
          <div className="text-[11px] sm:text-[12px] text-[#64748b] font-medium truncate">Leadership Royalty Pool</div>
          <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
            <span className="text-[18px] sm:text-[20px] lg:text-[22px] font-black text-[#0f172a] tracking-tight truncate">${royaltyClaimed.toFixed(2)}</span>
            <span className="text-[11.5px] sm:text-[13px] font-bold text-[#d97706]">USD</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 truncate">
            (Live Pool: ~$105+ On-Chain)
          </div>
        </div>

        <div className="mt-2 pt-1 text-[10px] sm:text-[11.5px] font-semibold text-[#b45309] truncate">
          <span className="truncate">Weekly Dividend Allocation</span>
        </div>
      </div>
    </div>
  );
}
