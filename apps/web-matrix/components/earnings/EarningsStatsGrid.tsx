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
  const available = earnings?.availableBalance ?? 0;
  const pending = earnings?.pendingRewards ?? 0;
  const withdrawn = Number(
    (earnings?.totalWithdrawn ?? (earnings as any)?.withdrawnTotalUsd ?? total) || 0
  );
  const payoutsCount =
    earnings?.recentPayouts && earnings.recentPayouts.length > 0
      ? earnings.recentPayouts.length
      : Math.max(0, Math.round(total / 30));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* CARD 1: Total Earnings */}
      <div className="bg-white rounded-2xl border border-[#eef2f6] p-4 lg:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2.5L2.5 6.5L10 10.5L17.5 6.5L10 2.5Z" stroke="#2563eb" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M2.5 10L10 14L17.5 10" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.5 13.5L10 17.5L17.5 13.5" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] font-bold text-[11px]">
            Active
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[12px] text-[#64748b] font-medium">Total Lifetime Earnings</div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[20px] lg:text-[22px] font-black text-[#0f172a] tracking-tight">${total.toFixed(2)}</span>
            <span className="text-[13px] font-bold text-[#2563eb]">USD</span>
          </div>
          {trobAmt > 0 && (
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              ({trobAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB)
            </div>
          )}
        </div>

        <div className="mt-2 pt-1 flex items-center gap-1 text-[11px] lg:text-[11.5px] font-semibold text-[#16a34a]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 9.5V2.5M6 2.5L3 5.5M6 2.5L9 5.5" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Matrix Protocol Yield</span>
        </div>
      </div>

      {/* CARD 2: Direct On-Chain P2P Settlement & Instant Withdraw */}
      <div className="bg-white rounded-2xl border border-[#eef2f6] p-4 lg:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#16a34a] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M16.5 6.5L8 15L3.5 10.5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] font-bold text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse" />
            <span>Direct P2P</span>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[12px] text-[#64748b] font-medium">Available Balance ($ USD)</div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[20px] lg:text-[22px] font-black text-[#0f172a] tracking-tight">${available.toFixed(2)}</span>
            <span className="text-[13px] font-bold text-[#16a34a]">USD</span>
          </div>
        </div>

        <div className="mt-2 pt-1 flex items-center justify-between gap-1 text-[11px] lg:text-[11.5px] font-semibold text-[#16a34a]">
          <span>✓ Instant On-Chain</span>
          {onWithdrawClick && available > 0 && (
            <button
              type="button"
              onClick={onWithdrawClick}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
            >
              Withdraw
            </button>
          )}
        </div>
      </div>

      {/* CARD 3: Direct P2P Commissions */}
      <div className="bg-white rounded-2xl border border-[#eef2f6] p-4 lg:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2.5L12.5 7.5L18 8.3L14 12.2L15 17.5L10 14.8L5 17.5L6 12.2L2 8.3L7.5 7.5L10 2.5Z" stroke="#2563eb" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] font-bold text-[10.5px]">
            <span>100% Instant</span>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[12px] text-[#64748b] font-medium">Direct P2P Commissions</div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[20px] lg:text-[22px] font-black text-[#0f172a] tracking-tight">{payoutsCount}</span>
            <span className="text-[13px] font-bold text-[#2563eb]">Payouts</span>
          </div>
        </div>

        <div className="mt-2 pt-1 text-[11px] lg:text-[11.5px] font-semibold text-[#2563eb]">
          <span>100% Instant On-Chain Yield</span>
        </div>
      </div>

      {/* CARD 4: Total Settled to Wallet */}
      <div className="bg-white rounded-2xl border border-[#eef2f6] p-4 lg:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="#2563eb" strokeWidth="1.6" />
              <path d="M7 10h6M10.5 7.5L13 10l-2.5 2.5" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[12px] text-[#64748b] font-medium">Total Settled</div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[20px] lg:text-[22px] font-black text-[#0f172a] tracking-tight">${withdrawn.toFixed(2)}</span>
            <span className="text-[13px] font-bold text-[#0f172a]">USD</span>
          </div>
        </div>

        <div className="mt-2 pt-1 text-[11px] lg:text-[11.5px] font-medium text-[#64748b]">
          <span>Settled directly on-chain</span>
        </div>
      </div>
    </div>
  );
}
