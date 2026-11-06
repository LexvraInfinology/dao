"use client";

import React, { useState, useEffect } from "react";
import { RankAchievedModal, RankTierName } from "@/components/modals/RankAchievedModal";
import Link from "next/link";
import { formatAddress, toTrobBase58 } from "@/lib/format";
import { MatrixDashboardOverview, MatrixUserProfile } from "@/lib/api";
import { Medal, Award, Trophy, Crown, Coins, Building2, Zap, ArrowUpRight, Layers } from "lucide-react";

interface OverviewTabProps {
  address?: string | null;
  profile?: MatrixUserProfile | null;
  dashboard?: MatrixDashboardOverview | null;
  onSwitchTab?: (tabId: "overview" | "matrix" | "pools") => void;
}

export function OverviewTab({
  address,
  profile,
  dashboard,
  onSwitchTab,
}: OverviewTabProps) {
  const currentSlot = dashboard?.currentSlot ?? profile?.currentSlot ?? 1;
  const activeBoardSlot = dashboard?.activeSlotProgress?.slotNumber ?? currentSlot;
  const activeBoardSlotStr = activeBoardSlot.toString().padStart(2, "0");
  const currentSlotStr = currentSlot.toString().padStart(2, "0");
  const isRegistered = Boolean(profile?.isRegistered);
  const highestUnlockedSlot = isRegistered
    ? Math.max(profile?.highestUnlockedSlot ?? 1, dashboard?.highestUnlockedSlot ?? 1)
    : 0;

  const totalEarnedUsd =
    dashboard?.totalEarnedUsd ??
    (profile?.totalEarningsUsd ??
      (profile?.totalEarnings ?? 0));
  const totalEarnedTrob = dashboard?.totalEarnedTrob ?? (profile?.totalEarningsTrob ?? (totalEarnedUsd / 0.056));

  const directsCount = Math.max(
    dashboard?.activeDirectsCount ?? 0,
    profile?.activeDirectsCount ?? 0,
    profile?.directReferralsCount ?? 0
  );
  const isCycledOrHigherSlot = Boolean(
    highestUnlockedSlot > 1 ||
    (dashboard?.recyclesCount && dashboard.recyclesCount > 0) ||
    (((dashboard?.activeSlotProgress as any)?.totalCycles || 0) > 1)
  );
  const isQualified = isCycledOrHigherSlot || directsCount >= 2;

  const filledNodes = dashboard?.activeSlotProgress?.filledNodes ?? 0;
  const currentRank = profile?.rankName || "NONE";

  // Rank Milestones & Smart Contract Verification
  const rankMilestones = (dashboard as any)?.rankMilestones;
  const milestones = rankMilestones?.milestones ?? 0;
  const isAlphaAchieved = rankMilestones?.isAlphaAchieved ?? (milestones >= 42);
  const isPrimeAchieved = rankMilestones?.isPrimeAchieved ?? (milestones >= 84);
  const isEliteAchieved = rankMilestones?.isEliteAchieved ?? (milestones >= 126);
  const isCrownAchieved = rankMilestones?.isCrownAchieved ?? (milestones >= 168);

  const [rankModalOpen, setRankModalOpen] = useState(false);
  const [activeRankModal, setActiveRankModal] = useState<RankTierName>("ALPHA");

  useEffect(() => {
    if (!address) return;
    const canon = address.toLowerCase();
    if (isCrownAchieved && !localStorage.getItem(`equora_rank_achieved_seen_CROWN_${canon}`)) {
      setActiveRankModal("CROWN");
      setRankModalOpen(true);
    } else if (isEliteAchieved && !localStorage.getItem(`equora_rank_achieved_seen_ELITE_${canon}`)) {
      setActiveRankModal("ELITE");
      setRankModalOpen(true);
    } else if (isPrimeAchieved && !localStorage.getItem(`equora_rank_achieved_seen_PRIME_${canon}`)) {
      setActiveRankModal("PRIME");
      setRankModalOpen(true);
    } else if (isAlphaAchieved && !localStorage.getItem(`equora_rank_achieved_seen_ALPHA_${canon}`)) {
      setActiveRankModal("ALPHA");
      setRankModalOpen(true);
    }
  }, [address, isAlphaAchieved, isPrimeAchieved, isEliteAchieved, isCrownAchieved]);

  const handleCloseRankModal = () => {
    if (address) {
      localStorage.setItem(`equora_rank_achieved_seen_${activeRankModal}_${address.toLowerCase()}`, "true");
    }
    setRankModalOpen(false);
  };

  const nextTarget = !isAlphaAchieved ? 42 : !isPrimeAchieved ? 84 : !isEliteAchieved ? 126 : 168;
  const nextRankName = !isAlphaAchieved ? "ALPHA" : !isPrimeAchieved ? "PRIME" : !isEliteAchieved ? "ELITE" : "CROWN";
  const currentProgressPct = isCrownAchieved ? 100 : Math.min(100, Math.round((milestones / nextTarget) * 100));
  const rankProgressLabel = isCrownAchieved
    ? "168 / 168 (CROWN APEX Qualified 👑)"
    : `${milestones} / ${nextTarget} to ${nextRankName} (${currentProgressPct}%)`;

  // Recent activity list
  const recentActivities = (dashboard?.recentActivity && dashboard.recentActivity.length > 0)
    ? dashboard.recentActivity
    : [];

  return (
    <div className="flex flex-col gap-4 sm:gap-5 animate-fade-in">
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. SECTION HEAD: Network Overview                                        */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 pt-0.5">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-black text-[#102341] tracking-tight">
            Network overview
          </h2>
          <p className="text-[12px] sm:text-[12.5px] text-[#657895] mt-0.5">
            Track your personal matrix progress, direct referrals, and protocol rewards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#e0eaf7] text-[#2868e8] text-[10.5px] font-extrabold shadow-2xs">
            $30 entry
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#e0eaf7] text-[#657895] text-[10.5px] font-extrabold shadow-2xs">
            14 seats / slot
          </span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 2. 4 HERO KPI CARDS (Grid of 4 Columns - Simple Terminology)             */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total Earnings */}
        <div
          onClick={() => onSwitchTab?.("overview")}
          className="bg-white border border-[#e0eaf7] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[0_4px_16px_rgba(35,82,140,0.035)] hover:border-[#2868e8]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-[11.5px] font-bold text-[#657895]">
              Total Matrix Yield
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#e9f2ff] text-[#2868e8] flex items-center justify-center text-[13px] group-hover:scale-105 transition-transform">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="text-[20px] sm:text-[24px] font-black text-[#102341] tracking-tight mt-2 leading-none">
            ${totalEarnedUsd % 1 === 0 ? totalEarnedUsd.toLocaleString() : totalEarnedUsd.toFixed(2)}
          </div>
          <div className="text-[10.5px] text-[#0e9f79] font-bold mt-1.5 truncate">
            All slots combined • P2P Settled on Blockchain
          </div>
        </div>

        {/* Card 2: Active Slot */}
        <div
          onClick={() => onSwitchTab?.("matrix")}
          className="bg-white border border-[#e0eaf7] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[0_4px_16px_rgba(35,82,140,0.035)] hover:border-[#2868e8]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-[11.5px] font-bold text-[#657895]">
              Active Slot
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#e9f2ff] text-[#2868e8] flex items-center justify-center text-[13px] group-hover:scale-105 transition-transform">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
          </div>
          <div className="text-[20px] sm:text-[24px] font-black text-[#102341] tracking-tight mt-2 leading-none">
            Slot #{activeBoardSlotStr}
          </div>
          <div className="text-[10.5px] text-[#8494a9] mt-1.5 truncate">
            {`${filledNodes} / 14 seats filled`}
          </div>
        </div>

        {/* Card 3: Direct Referrals (Shows all referrals without artificial capping) */}
        <div
          onClick={() => onSwitchTab?.("matrix")}
          className="bg-white border border-[#e0eaf7] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[0_4px_16px_rgba(35,82,140,0.035)] hover:border-[#2868e8]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-[11.5px] font-bold text-[#657895]">
              Direct Referrals
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#e9f2ff] text-[#2868e8] flex items-center justify-center text-[13px] group-hover:scale-105 transition-transform">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="text-[20px] sm:text-[24px] font-black text-[#102341] tracking-tight mt-2 leading-none">
            {directsCount} Directs
          </div>
          <div className={`text-[10.5px] font-bold mt-1.5 truncate flex items-center gap-1 ${
            isQualified ? "text-[#0e9f79]" : "text-amber-600"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isQualified ? "bg-[#0e9f79]" : "bg-amber-500 animate-pulse"}`} />
            {isQualified ? "Qualified • 100% P2P Yield" : `${Math.max(0, 2 - directsCount)} more to qualify (2 Required)`}
          </div>
        </div>

        {/* Card 4: Unlocked Progression (Replaced Available Balance) */}
        <div
          onClick={() => onSwitchTab?.("matrix")}
          className="bg-white border border-[#e0eaf7] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[0_4px_16px_rgba(35,82,140,0.035)] hover:border-[#2868e8]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-[11.5px] font-bold text-[#657895]">
              Unlocked Progression
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#e9f2ff] text-[#2868e8] flex items-center justify-center text-[13px] group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 text-[#2868e8]" />
            </div>
          </div>
          <div className="text-[20px] sm:text-[24px] font-black text-[#102341] tracking-tight mt-2 leading-none">
            {highestUnlockedSlot} / 12 Slots
          </div>
          <div className="text-[10.5px] text-[#0e9f79] font-bold mt-1.5 truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0e9f79]" />
            Levels 1-{highestUnlockedSlot} Active
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 3. 2-COLUMN SPLIT: Member progress (Left) + Latest activity (Right)       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-3.5 sm:gap-4">
        {/* LEFT: Member Progress Panel */}
        <div className="bg-white border border-[#e0eaf7] rounded-2xl p-4 sm:p-5 shadow-[0_5px_18px_rgba(30,77,137,0.035)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#edf2fa]">
              <div>
                <h3 className="text-[14px] sm:text-[15px] font-black text-[#102341]">
                  Member progress
                </h3>
                <p className="text-[11px] text-[#657895] mt-0.5">
                  Track your operative rank progression and qualification milestones.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#eaf2ff] text-[#2465dc] text-[10.5px] font-black uppercase tracking-wider shrink-0">
                {currentRank}
              </span>
            </div>

            {/* Focus Card Identity Row */}
            <div className="flex items-center gap-3 my-3.5 p-2.5 sm:p-3 rounded-xl bg-[#f8fbff] border border-[#e5edf7]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e5f2ff] to-[#cce3ff] text-[#1c5ed2] flex items-center justify-center font-black text-[14px] shrink-0 shadow-2xs">
                {profile?.username ? profile.username.slice(0, 2).toUpperCase() : "OP"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-[13.5px] text-[#102341] truncate">
                    {profile?.userId ? `#${profile.userId} • ` : profile?.referralCode ? `Member #${profile.referralCode} • ` : ""}{profile?.username || (address ? formatAddress(toTrobBase58(address)) : "EQUORA Operative")}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#e8fbf5] text-[#138261] text-[9.5px] font-extrabold uppercase">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-[#657895] mt-0.5 truncate">
                  {directsCount} direct referrals • {currentSlot} active slot{currentSlot > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Rank Progress Bar */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[11px] text-[#586f8d] font-bold mb-1.5">
                <span>Placements to Next Rank</span>
                <span className="font-mono text-[#1e3f6c]">{rankProgressLabel}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#edf3fb] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2670ee] to-[#64c4ff] transition-all duration-500"
                  style={{ width: `${Math.max(4, currentProgressPct)}%` }}
                />
              </div>
            </div>

            {/* 4 Rank Steps (Connected to Smart Contract Milestones: 42, 84, 126, 168) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5">
              <div className={`rounded-xl p-2 text-center flex flex-col items-center border transition-all ${
                isAlphaAchieved ? "border-blue-500 bg-blue-50/80 shadow-xs ring-1 ring-blue-400/30" : "border-[#e5edf7] bg-[#fafcff] opacity-80"
              }`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isAlphaAchieved ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}`}>
                  <Medal className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-black text-[#102341] mt-1">ALPHA</div>
                <div className="text-[9px] font-semibold text-[#7b8da7] mt-0.5">
                  {isAlphaAchieved ? "Qualified ✓" : `${milestones}/42 IDs`}
                </div>
              </div>

              <div className={`rounded-xl p-2 text-center flex flex-col items-center border transition-all ${
                isPrimeAchieved ? "border-emerald-500 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-400/30" : "border-[#e5edf7] bg-[#fafcff] opacity-80"
              }`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isPrimeAchieved ? "bg-emerald-600 text-white" : "bg-indigo-50 text-indigo-600"}`}>
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-black text-[#102341] mt-1">PRIME</div>
                <div className="text-[9px] font-semibold text-[#7b8da7] mt-0.5">
                  {isPrimeAchieved ? "Qualified ✓" : `${milestones}/84 IDs`}
                </div>
              </div>

              <div className={`rounded-xl p-2 text-center flex flex-col items-center border transition-all ${
                isEliteAchieved ? "border-amber-500 bg-amber-50/80 shadow-xs ring-1 ring-amber-400/30" : "border-[#e5edf7] bg-[#fafcff] opacity-80"
              }`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isEliteAchieved ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-600"}`}>
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-black text-[#102341] mt-1">ELITE</div>
                <div className="text-[9px] font-semibold text-[#7b8da7] mt-0.5">
                  {isEliteAchieved ? "Qualified ✓" : `${milestones}/126 IDs`}
                </div>
              </div>

              <div className={`rounded-xl p-2 text-center flex flex-col items-center border transition-all ${
                isCrownAchieved ? "border-purple-500 bg-purple-50/80 shadow-xs ring-1 ring-purple-400/30" : "border-[#e5edf7] bg-[#fafcff] opacity-80"
              }`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isCrownAchieved ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-600"}`}>
                  <Crown className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-black text-[#102341] mt-1">CROWN APEX</div>
                <div className="text-[9px] font-semibold text-[#7b8da7] mt-0.5">
                  {isCrownAchieved ? "Qualified ✓" : `${milestones}/168 IDs`}
                </div>
              </div>
            </div>
          </div>

          {/* Income Eligibility Footer */}
          <div className="pt-2.5 border-t border-[#edf2f8] mt-3.5 flex items-center justify-between text-[11px]">
            <span className="text-[#657895] font-medium">Income eligibility:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e8fbf5] text-[#138261] border border-[#bbf7d0] font-black text-[10.5px]">
              {isQualified ? "Active & Qualified (100% Payouts)" : "Needs 2 Direct Referrals (Unqualified)"}
            </span>
          </div>
        </div>

        {/* RIGHT: Latest Activity Panel */}
        <div className="bg-white border border-[#e0eaf7] rounded-2xl p-4 sm:p-5 shadow-[0_5px_18px_rgba(30,77,137,0.035)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#edf2fa]">
              <div>
                <h3 className="text-[14px] sm:text-[15px] font-black text-[#102341]">
                  Latest activity
                </h3>
                <p className="text-[11px] text-[#657895] mt-0.5">
                  Real-time blockchain matrix settlements.
                </p>
              </div>
              <Link
                href="/transactions"
                className="px-2 py-0.5 rounded-lg bg-[#f0f5fc] hover:bg-[#e7f1ff] text-[#2868e8] text-[10.5px] font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Activity List */}
            <div className="flex flex-col gap-2.5 mt-3.5">
              {recentActivities.length === 0 ? (
                <div className="py-6 text-center text-[#9aa8ba] text-[12px]">
                  No recent matrix activity yet. New cycle settlements will appear here live.
                </div>
              ) : (
                recentActivities.slice(0, 4).map((act, i) => {
                  const isIncome = act.action === "COMMISSION_RECEIVED" || act.action === "MEMBER_JOINED";
                  const isPool = act.action === "REWARD_RECEIVED";

                  return (
                    <div
                      key={act.id || i}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-[11px] transition-all ${
                        isIncome
                          ? "bg-gradient-to-r from-[#effcf7] to-white border-[#d9f5e9]"
                          : isPool
                          ? "bg-[#fffbef] border-[#f8ebc9]"
                          : "bg-white border-[#edf2f8]"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 ${
                          isIncome
                            ? "bg-[#d8f8eb] text-[#0b956d]"
                            : isPool
                            ? "bg-[#fff0c7] text-[#ac7212]"
                            : "bg-[#eaf2ff] text-[#2868e8]"
                        }`}
                      >
                        {isIncome ? (
                          <Coins className="w-3.5 h-3.5 text-[#0b956d]" />
                        ) : isPool ? (
                          <Building2 className="w-3.5 h-3.5 text-[#ac7212]" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-[#2868e8]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-[#102341] block truncate">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-[#657895] block truncate mt-0.5">
                          {act.description}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-[#0b956d] block text-[11.5px]">
                          +$30.00 USD
                        </span>
                        <span className="text-[9.5px] text-[#9aa8ba]">
                          Just now
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#edf2f8] mt-4 flex items-center justify-between text-[10.5px] text-[#8494a9]">
            <span>Every $30 flow has a single on-chain settlement ID.</span>
          </div>
        </div>
      </div>

      {/* Rank Milestone Celebration Modal */}
      <RankAchievedModal
        isOpen={rankModalOpen}
        onClose={handleCloseRankModal}
        rank={activeRankModal}
        milestones={milestones}
      />
    </div>
  );
}
