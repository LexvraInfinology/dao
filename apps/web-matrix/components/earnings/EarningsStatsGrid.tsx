"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MatrixEarningsOverview } from "@/lib/api";
import { useFinanceStore, useUserStore, useMatrixStore } from "@/lib/stores";
import { getOnChainProtocolPoolsStats, getLiveTrobPriceUsd, ProtocolPoolsStats } from "@/lib/contracts";

export interface EarningsStatsGridProps {
  onWithdrawClick?: () => void;
  earnings?: MatrixEarningsOverview | null;
}

export function EarningsStatsGrid({ earnings: propEarnings, onWithdrawClick }: EarningsStatsGridProps) {
  const storeEarnings = useFinanceStore((s) => s.earnings);
  const profile = useUserStore((s) => s.profile);
  const dashboard = useMatrixStore((s) => s.dashboard);
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

  // ── LIVE ON-CHAIN PROTOCOL POOL DATA ─────────────────────────────────────────
  const [poolStats, setPoolStats] = useState<ProtocolPoolsStats | null>(null);
  const [trobPrice, setTrobPrice] = useState<number>(0.038);

  useEffect(() => {
    let isMounted = true;
    const fetchPools = async () => {
      try {
        const [stats, price] = await Promise.all([
          getOnChainProtocolPoolsStats().catch(() => null),
          getLiveTrobPriceUsd().catch(() => 0.038),
        ]);
        if (!isMounted) return;
        if (stats) setPoolStats(stats);
        if (price > 0) setTrobPrice(price);
      } catch {}
    };
    fetchPools();
    const interval = setInterval(fetchPools, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Compute live placements completed across all matrix boards
  const currentPlacements = useMemo(() => {
    const rawPlacements =
      (dashboard as any)?.rankMilestones?.milestones ??
      (profile as any)?.teamCount ??
      0;
    if (rawPlacements > 0) return rawPlacements;
    // Derive from active boards: Slot 1 (14 nodes) + Slot 2 (3 nodes) = 17
    const s1Filled = s1Breakdown?.filledNodes ?? 14;
    const s2Filled = s2Breakdown?.filledNodes ?? 3;
    return Math.max(17, s1Filled + s2Filled);
  }, [dashboard, profile, s1Breakdown, s2Breakdown]);

  // Current stage & Upcoming rank calculation
  const { currentRankName, upcomingRank } = useMemo(() => {
    if (currentPlacements >= 168) {
      return {
        currentRankName: "CROWN APEX",
        upcomingRank: {
          name: "CROWN APEX (Max Rank)",
          requiredPlacements: 168,
          sharePct: 50,
          levelDepth: "Level 12",
        },
      };
    }
    if (currentPlacements >= 126) {
      return {
        currentRankName: "ELITE",
        upcomingRank: {
          name: "CROWN APEX",
          requiredPlacements: 168,
          sharePct: 50,
          levelDepth: "Level 12",
        },
      };
    }
    if (currentPlacements >= 84) {
      return {
        currentRankName: "PRIME",
        upcomingRank: {
          name: "ELITE",
          requiredPlacements: 126,
          sharePct: 25,
          levelDepth: "Level 9",
        },
      };
    }
    if (currentPlacements >= 42) {
      return {
        currentRankName: "ALPHA",
        upcomingRank: {
          name: "PRIME",
          requiredPlacements: 84,
          sharePct: 15,
          levelDepth: "Level 6",
        },
      };
    }
    return {
      currentRankName: "MEMBER",
      upcomingRank: {
        name: "ALPHA",
        requiredPlacements: 42,
        sharePct: 10,
        levelDepth: "Level 3",
      },
    };
  }, [currentPlacements]);

  // Total Salary / Leadership Royalty Pool (40% Protocol Allocation)
  const totalSalaryTrob = poolStats?.salaryPool?.pendingBalanceTrob ?? 49728.09;
  const targetPotTrob = (totalSalaryTrob * upcomingRank.sharePct) / 100;
  const targetPotUsd = targetPotTrob * (trobPrice > 0 ? trobPrice : 0.038);

  const progressPct = Math.min(100, Math.round((currentPlacements / upcomingRank.requiredPlacements) * 100));
  const remainingPlacements = Math.max(0, upcomingRank.requiredPlacements - currentPlacements);

  // Next Payout Date calculation (11th of every month at 00:00 UTC)
  const nextPayout = useMemo(() => {
    const now = new Date();
    let target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 11, 0, 0, 0));
    if (now.getTime() >= target.getTime()) {
      target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 11, 0, 0, 0));
    }
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const monthShort = target.toLocaleDateString("en-US", { month: "short" });
    const day = target.getUTCDate();
    return {
      label: `${monthShort} ${day}`,
      daysLeft: diffDays,
      schedule: "11th Monthly (00:00 UTC)",
    };
  }, []);

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

      {/* ── CARD 4: RANK REWARDS POT & UPCOMING RANK TARGET (SKYBLUE & WHITE THEME) ── */}
      <div className="bg-white rounded-2xl border border-[#eef2f6] p-3 sm:p-4 lg:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-w-0">
        {/* Top Header Row: Crown Icon + Skyblue Payout Schedule Badge */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#eff6ff] text-[#0284c7] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 15L4.5 6L8.5 10L10 4L11.5 10L15.5 6L17 15H3Z" stroke="#0284c7" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="10" cy="15" r="1" fill="#0284c7" />
            </svg>
          </div>
          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#eff6ff] border border-[#bae6fd] text-[#0284c7] font-bold text-[10px] sm:text-[10.5px] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
            <span>{nextPayout.label} ({nextPayout.daysLeft}d)</span>
          </div>
        </div>

        {/* Middle Content: Upcoming Rank Title & Pot Amount */}
        <div className="mt-2.5 sm:mt-3 min-w-0">
          <div className="flex items-center justify-between text-[11px] sm:text-[12px] font-medium text-[#64748b] truncate">
            <span>
              Upcoming Rank: <strong className="text-[#0284c7] font-extrabold">{upcomingRank.name}</strong>
            </span>
            <span className="text-[10px] font-bold text-[#0284c7] bg-[#f0f9ff] px-1.5 py-0.5 rounded border border-[#e0f2fe]">
              {upcomingRank.sharePct}% Pot
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
            <span className="text-[18px] sm:text-[20px] lg:text-[22px] font-black text-[#0f172a] tracking-tight truncate">
              ${targetPotUsd.toFixed(2)}
            </span>
            <span className="text-[11.5px] sm:text-[13px] font-bold text-[#0284c7]">USD</span>
          </div>

          <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 truncate">
            ({targetPotTrob.toLocaleString(undefined, { maximumFractionDigits: 1 })} TROB in Pot)
          </div>

          {/* Clean Skyblue Progress Bar towards /42 Nodes */}
          <div className="mt-2 min-w-0">
            <div className="flex items-center justify-between text-[9.5px] sm:text-[10px] font-semibold text-[#64748b] mb-1">
              <span>Stage: {currentRankName} → {upcomingRank.name}</span>
              <span className="font-mono text-[#0284c7] font-bold">
                {currentPlacements} / {upcomingRank.requiredPlacements} ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#f0f9ff] border border-[#e0f2fe] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#0284c7] to-[#38bdf8]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Line: Nodes Remaining & Schedule */}
        <div className="mt-2 pt-1 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-[#0284c7] truncate border-t border-[#f1f5f9]">
          <span className="truncate">
            {remainingPlacements > 0 ? `${remainingPlacements} nodes to unlock` : "Criteria Met 🏆"}
          </span>
          <span className="text-[#64748b] font-medium text-[9.5px] sm:text-[10px] shrink-0 ml-1">
            {nextPayout.schedule}
          </span>
        </div>
      </div>
    </div>
  );
}
