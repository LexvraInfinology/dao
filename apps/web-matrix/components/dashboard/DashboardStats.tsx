"use client";

import React from "react";
import Link from "next/link";
import { useMatrixStore, useUserStore } from "@/lib/stores";
import { MatrixDashboardOverview } from "@/lib/api";

interface DashboardStatsProps {
  data?: MatrixDashboardOverview | null;
}

export function DashboardStats({ data: propData }: DashboardStatsProps) {
  const storeDashboard = useMatrixStore((s) => s.dashboard);
  const profile = useUserStore((s) => s.profile);
  const data = propData !== undefined ? propData : storeDashboard;
  const currentSlot = data?.currentSlot ?? profile?.currentSlot ?? 1;
  const isSlotActive = true;
  const currentSlotStr = currentSlot.toString().padStart(2, "0");

  // Dynamic Market Oracle Peg: 1 Matrix Slot Payout = $30.00 USD
  const [trobPrice, setTrobPrice] = React.useState<number>(0.03174);

  React.useEffect(() => {
    fetch("https://backend.trobchain.com/v1/market/price")
      .then((r) => r.json())
      .then((j) => {
        const p = Number(j?.data?.priceUsd ?? j?.priceUsd);
        if (p > 0) setTrobPrice(p);
      })
      .catch(() => {});
  }, []);

  const totalEarnedTrob = data?.totalEarnedTrob ?? (profile?.totalEarningsTrob ?? (profile?.totalEarnings ? profile.totalEarnings / trobPrice : 0));
  const totalEarnedUsd = data?.totalEarnedUsd ?? (profile?.totalEarningsUsd ?? (totalEarnedTrob * trobPrice));

  const availableWithdrawTrob = data?.availableWithdrawTrob ?? (profile?.availableBalanceTrob ?? (profile?.availableBalance ? profile.availableBalance / trobPrice : 0));
  const availableWithdrawUsd = data?.availableWithdrawUsd ?? (profile?.availableBalanceUsd ?? (availableWithdrawTrob * trobPrice));

  const nextSlot = Math.min(currentSlot + 1, 12);
  const nextSlotStr = nextSlot.toString().padStart(2, "0");
  const filledNodes = data?.activeSlotProgress?.filledNodes ?? 0;
  const percentFilled = Math.round((filledNodes / 14) * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4 mb-5 sm:mb-6">
      {/* Current Slot */}
      <Link
        href="/matrix"
        title="View Matrix Progression"
        className="bg-white rounded-2xl border border-[#e8ecf1] p-3 sm:p-4 xl:p-5 flex items-start gap-2.5 sm:gap-3 min-w-0 shadow-xs hover:border-[#2563eb]/60 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-xl bg-[#f1f5f9] group-hover:bg-[#eff6ff] flex items-center justify-center flex-shrink-0 transition-colors">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="sm:w-5 sm:h-5">
            <rect x="3" y="3" width="14" height="14" rx="3" stroke="#64748b" strokeWidth="1.5" />
            <path d="M7 10h6M10 7v6" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] sm:text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide leading-tight truncate">
            Current Slot
          </span>
          <span className="text-[20px] sm:text-[24px] xl:text-[30px] font-extrabold text-[#0f172a] leading-none mt-1 sm:mt-1.5 tracking-tight truncate">
            {currentSlotStr}
          </span>
          <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${isSlotActive ? "bg-[#ecfdf5] border border-[#bbf7d0]" : "bg-[#fef3c7] border border-[#fde68a]"}`}>
              <span className={`w-[4.5px] h-[4.5px] rounded-full ${isSlotActive ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`} />
              <span className={`text-[9.5px] sm:text-[10px] font-semibold ${isSlotActive ? "text-[#22c55e]" : "text-[#d97706]"}`}>
                {isSlotActive ? "Active" : "Ready to Activate"}
              </span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#94a3b8] hidden xs:inline truncate">
              {currentSlot === 1 ? "Floor Tier" : `Slot #${currentSlot}`}
            </span>
          </div>
        </div>
      </Link>

      {/* Total Earned */}
      <Link
        href="/earnings"
        title="View Earnings Overview"
        className="bg-white rounded-2xl border border-[#e8ecf1] p-3 sm:p-4 xl:p-5 flex items-start gap-2.5 sm:gap-3 min-w-0 shadow-xs hover:border-[#2563eb]/60 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-xl bg-[#f1f5f9] group-hover:bg-[#eff6ff] flex items-center justify-center flex-shrink-0 transition-colors">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="sm:w-5 sm:h-5">
            <path d="M3 14l4-4 3 3 7-7" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 6h4v4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] sm:text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide leading-tight truncate">
            Total Earned
          </span>
          <div className="flex items-baseline gap-1 mt-1 sm:mt-1.5 min-w-0">
            <span className="text-[20px] sm:text-[24px] xl:text-[30px] font-extrabold text-[#0f172a] leading-none tracking-tight truncate">
              ${totalEarnedUsd.toFixed(2)}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#94a3b8]">USD</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#64748b] mt-1 sm:mt-1.5 truncate">
            {totalEarnedTrob > 0 ? `${totalEarnedTrob.toFixed(0)} TROB • Matrix Yield` : "Lifetime matrix yield"}
          </span>
        </div>
      </Link>

      {/* Direct Settled Earnings */}
      <Link
        href="/earnings"
        title="View On-Chain Earnings"
        className="bg-white rounded-2xl border border-[#e8ecf1] p-3 sm:p-4 xl:p-5 flex items-start gap-2.5 sm:gap-3 min-w-0 shadow-xs hover:border-[#2563eb]/60 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-xl bg-[#ecfdf5] group-hover:bg-[#dcfce7] flex items-center justify-center flex-shrink-0 transition-colors">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="sm:w-5 sm:h-5">
            <path d="M16.5 6.5L8 15L3.5 10.5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] sm:text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide leading-tight truncate">
            Direct Settled
          </span>
          <div className="flex items-baseline gap-1 mt-1 sm:mt-1.5 min-w-0">
            <span className="text-[20px] sm:text-[24px] xl:text-[30px] font-extrabold text-[#16a34a] leading-none tracking-tight truncate">
              ${(totalEarnedUsd > 0 ? totalEarnedUsd : availableWithdrawUsd).toFixed(2)}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#16a34a]">USD</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#16a34a] mt-1 sm:mt-1.5 truncate font-semibold">
            {totalEarnedTrob > 0 ? `${totalEarnedTrob.toFixed(0)} TROB • P2P Direct` : "Instant on-chain P2P"}
          </span>
        </div>
      </Link>

      {/* Next Slot */}
      <Link
        href="/matrix"
        title="View Progression Slot"
        className="bg-white rounded-2xl border border-[#e8ecf1] p-3 sm:p-4 xl:p-5 flex items-start gap-2.5 sm:gap-3 min-w-0 shadow-xs hover:border-[#2563eb]/60 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-xl bg-[#f1f5f9] group-hover:bg-[#eff6ff] flex items-center justify-center flex-shrink-0 transition-colors">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="sm:w-5 sm:h-5">
            <path d="M4 10l6-6 6 6M4 14l6-6 6 6" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] sm:text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide leading-tight truncate">
            Next Slot
          </span>
          <span className="text-[20px] sm:text-[24px] xl:text-[30px] font-extrabold text-[#0f172a] leading-none mt-1 sm:mt-1.5 tracking-tight truncate">
            {nextSlotStr}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#64748b] mt-1 sm:mt-1.5 truncate">
            {filledNodes} / 14 nodes ({percentFilled}%)
          </span>
        </div>
      </Link>
    </div>
  );
}
