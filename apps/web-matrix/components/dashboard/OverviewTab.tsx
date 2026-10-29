"use client";

import React from "react";
import Link from "next/link";
import { formatAddress, toTrobBase58 } from "@/lib/format";
import { MatrixDashboardOverview, MatrixUserProfile } from "@/lib/api";
import { ReferralLinkCard } from "./ReferralLinkCard";
import { Medal, Award, Trophy, Crown, Coins, Building2, Zap, ArrowUpRight } from "lucide-react";

interface OverviewTabProps {
  address?: string | null;
  profile?: MatrixUserProfile | null;
  dashboard?: MatrixDashboardOverview | null;
  onSwitchTab: (tabId: "overview" | "matrix" | "team" | "activity" | "pools" | "links") => void;
}

export function OverviewTab({
  address,
  profile,
  dashboard,
  onSwitchTab,
}: OverviewTabProps) {
  const currentSlot = dashboard?.currentSlot ?? profile?.currentSlot ?? 1;
  const currentSlotStr = currentSlot.toString().padStart(2, "0");

  const totalEarnedUsd = dashboard?.totalEarnedUsd ?? (profile?.totalEarningsUsd ?? 180.0);
  const totalEarnedTrob = dashboard?.totalEarnedTrob ?? (profile?.totalEarningsTrob ?? 5671.08);

  const directsCount = profile?.directReferralsCount ?? 14;
  const isQualified = profile?.isQualified ?? directsCount >= 2;

  const filledNodes = dashboard?.activeSlotProgress?.filledNodes ?? 0;
  const currentRank = profile?.rankName || "ALPHA";

  // Recent activity list
  const recentActivities = dashboard?.recentActivity || [
    {
      id: "act-1",
      action: "COMMISSION_RECEIVED",
      title: "Direct Matrix Yield",
      description: "P3 direct placement completed on Slot 01",
      timestamp: new Date().toISOString(),
      status: "COMPLETED",
      amountTrob: 945.18,
    },
    {
      id: "act-2",
      action: "REWARD_RECEIVED",
      title: "DAO Instant Push (35%)",
      description: "Streamed directly to Genesis DAO Vault",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: "COMPLETED",
      amountTrob: 330.81,
    },
    {
      id: "act-3",
      action: "MEMBER_JOINED",
      title: "Direct Operative Joined",
      description: "Operative registered via referral link into Slot 01",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: "CONFIRMED",
      amountTrob: 945.18,
    },
    {
      id: "act-4",
      action: "REWARD_RECEIVED",
      title: "Leadership Royalty Allocated",
      description: "40% allocated to 11th monthly royalty pool",
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      status: "POOLED",
      amountTrob: 378.07,
    },
  ];

  return (
    <div className="flex flex-col gap-5 sm:gap-6 animate-fade-in">
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. SECTION HEAD: Network Overview (Exact Simulator Styling)               */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
        <div>
          <h2 className="text-[20px] sm:text-[22px] font-black text-[#102341] tracking-tight">
            Network overview
          </h2>
          <p className="text-[12px] sm:text-[13px] text-[#657895] mt-0.5">
            Track your personal matrix progress, direct referrals, and protocol rewards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="px-3 py-1 rounded-full bg-white border border-[#e0eaf7] text-[#2868e8] text-[11px] font-extrabold shadow-2xs">
            $30 entry
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-[#e0eaf7] text-[#657895] text-[11px] font-extrabold shadow-2xs">
            14 seats / slot
          </span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 2. 4 HERO KPI CARDS (Grid of 4 Columns)                                  */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Focus member income */}
        <div
          onClick={() => onSwitchTab("activity")}
          className="bg-white border border-[#e0eaf7] rounded-2xl p-4 sm:p-5 shadow-[0_4px_16px_rgba(35,82,140,0.035)] hover:border-[#2868e8]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-[11.5px] font-bold text-[#657895]">
              Focus member income
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#e9f2ff] text-[#2868e8] flex items-center justify-center text-[13px] group-hover:scale-105 transition-transform">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="text-[22px] sm:text-[26px] font-black text-[#102341] tracking-tight mt-2.5 sm:mt-3 leading-none">
            ${totalEarnedUsd.toFixed(2)}
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-[#8494a9] mt-1.5 truncate">
            {totalEarnedTrob.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TROB direct matrix yield
          </div>
        </div>

        {/* Card 2: Completed slots */}
        <div
          onClick={() => onSwitchTab("matrix")}
          className="bg-white border border-[#e0eaf7] rounded-2xl p-4 sm:p-5 shadow-[0_4px_16px_rgba(35,82,140,0.035)] hover:border-[#2868e8]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-[11.5px] font-bold text-[#657895]">
              Completed slots
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#e9f2ff] text-[#2868e8] flex items-center justify-center text-[13px] group-hover:scale-105 transition-transform">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
          </div>
          <div className="text-[22px] sm:text-[26px] font-black text-[#102341] tracking-tight mt-2.5 sm:mt-3 leading-none">
            Slot #{currentSlotStr}
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-[#8494a9] mt-1.5 truncate">
            {filledNodes} / 14 seats in active slot
          </div>
        </div>

        {/* Card 3: Direct referrals */}
        <div
          onClick={() => onSwitchTab("team")}
          className="bg-white border border-[#e0eaf7] rounded-2xl p-4 sm:p-5 shadow-[0_4px_16px_rgba(35,82,140,0.035)] hover:border-[#2868e8]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-[11.5px] font-bold text-[#657895]">
              Direct referrals
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#e9f2ff] text-[#2868e8] flex items-center justify-center text-[13px] group-hover:scale-105 transition-transform">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="text-[22px] sm:text-[26px] font-black text-[#102341] tracking-tight mt-2.5 sm:mt-3 leading-none">
            {directsCount} / 2
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-[#0e9f79] font-bold mt-1.5 truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0e9f79]" />
            {isQualified ? "Qualified • Active" : "2 direct referrals needed"}
          </div>
        </div>

        {/* Card 4: All pools combined */}
        <div
          onClick={() => onSwitchTab("pools")}
          className="bg-white border border-[#e0eaf7] rounded-2xl p-4 sm:p-5 shadow-[0_4px_16px_rgba(35,82,140,0.035)] hover:border-[#2868e8]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-[11.5px] font-bold text-[#657895]">
              All pools combined
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#e9f2ff] text-[#2868e8] flex items-center justify-center text-[13px] group-hover:scale-105 transition-transform">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
          </div>
          <div className="text-[22px] sm:text-[26px] font-black text-[#102341] tracking-tight mt-2.5 sm:mt-3 leading-none">
            8,601 TROB
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-[#8494a9] mt-1.5 truncate">
            35% Streamed to DAO & pools
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 3. 2-COLUMN SPLIT: Member progress (Left) + Latest activity (Right)       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-4 sm:gap-5">
        {/* LEFT: Member Progress Panel */}
        <div className="bg-white border border-[#e0eaf7] rounded-3xl p-5 sm:p-6 shadow-[0_5px_18px_rgba(30,77,137,0.035)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#edf2fa]">
              <div>
                <h3 className="text-[15px] sm:text-[16px] font-black text-[#102341]">
                  Member progress
                </h3>
                <p className="text-[11px] text-[#657895] mt-0.5">
                  Rank belongs to each account — not the total IDs placed in the whole network.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#eaf2ff] text-[#2465dc] text-[10.5px] font-black uppercase tracking-wider shrink-0">
                {currentRank}
              </span>
            </div>

            {/* Focus Card Identity Row */}
            <div className="flex items-center gap-3.5 my-4 p-3 rounded-2xl bg-[#f8fbff] border border-[#e5edf7]">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#e5f2ff] to-[#cce3ff] text-[#1c5ed2] flex items-center justify-center font-black text-[15px] shrink-0 shadow-2xs">
                {profile?.username ? profile.username.slice(0, 2).toUpperCase() : "OP"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-[14px] text-[#102341] truncate">
                    #{profile?.userId || "25948"} • {profile?.username || (address ? formatAddress(toTrobBase58(address)) : "EQUORA_Fi Operative")}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#e8fbf5] text-[#138261] text-[9.5px] font-extrabold uppercase">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-[#657895] mt-0.5 truncate">
                  {directsCount} direct referrals • {currentSlot} active slots • {directsCount * 3} placements recorded
                </p>
              </div>
            </div>

            {/* Rank Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-[#586f8d] font-bold mb-1.5">
                <span>Placements to Next Rank</span>
                <span className="font-mono text-[#1e3f6c]">{isQualified ? "100% (Qualified)" : "0 / 42 to ALPHA"}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#edf3fb] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2670ee] to-[#64c4ff] transition-all duration-500"
                  style={{ width: isQualified ? "100%" : "33%" }}
                />
              </div>
            </div>

            {/* 4 Rank Steps (Exact simulator HTML styling with Lucide React icons) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              <div className="border border-[#8db5ff] bg-[#f0f6ff] rounded-xl p-2.5 text-center flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Medal className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-[10px] font-black text-[#102341] mt-1.5">ALPHA</div>
                <div className="text-[9px] text-[#7b8da7] mt-0.5">3 slots • 42 IDs</div>
              </div>
              <div className="border border-[#e5edf7] bg-[#fafcff] rounded-xl p-2.5 text-center flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Award className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-[10px] font-black text-[#102341] mt-1.5">PRIME</div>
                <div className="text-[9px] text-[#7b8da7] mt-0.5">6 slots • 84 IDs</div>
              </div>
              <div className="border border-[#e5edf7] bg-[#fafcff] rounded-xl p-2.5 text-center flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-[10px] font-black text-[#102341] mt-1.5">ELITE</div>
                <div className="text-[9px] text-[#7b8da7] mt-0.5">9 slots • 126 IDs</div>
              </div>
              <div className="border border-purple-200 bg-purple-50/50 rounded-xl p-2.5 text-center flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shadow-xs">
                  <Crown className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-[10px] font-black text-[#102341] mt-1.5">CROWN APEX</div>
                <div className="text-[9px] text-[#7b8da7] mt-0.5">12 slots • 168 IDs</div>
              </div>
            </div>
          </div>

          {/* Income Eligibility Footer */}
          <div className="pt-3 border-t border-[#edf2f8] mt-4 flex items-center justify-between text-[11px]">
            <span className="text-[#657895] font-medium">Income eligibility:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e8fbf5] text-[#138261] border border-[#bbf7d0] font-black text-[10.5px]">
              {isQualified ? "Active & Qualified (100% Payouts)" : "Needs 2 Direct Referrals"}
            </span>
          </div>
        </div>

        {/* RIGHT: Latest Activity Panel */}
        <div className="bg-white border border-[#e0eaf7] rounded-3xl p-5 sm:p-6 shadow-[0_5px_18px_rgba(30,77,137,0.035)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 pb-4 border-b border-[#edf2fa]">
              <div>
                <h3 className="text-[15px] sm:text-[16px] font-black text-[#102341]">
                  Latest activity
                </h3>
                <p className="text-[11px] text-[#657895] mt-0.5">
                  Real-time blockchain matrix settlements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSwitchTab("activity")}
                className="px-2.5 py-1 rounded-lg bg-[#f0f5fc] hover:bg-[#e7f1ff] text-[#2868e8] text-[11px] font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* Activity List */}
            <div className="flex flex-col gap-2.5 mt-3.5">
              {recentActivities.slice(0, 4).map((act, i) => {
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
                        +{((act as any).amountTrob || (act as any).amount || 945).toLocaleString(undefined, { maximumFractionDigits: 0 })} TROB
                      </span>
                      <span className="text-[9.5px] text-[#9aa8ba]">
                        Just now
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#edf2f8] mt-4 flex items-center justify-between text-[10.5px] text-[#8494a9]">
            <span>Every $30 flow has a single on-chain settlement ID.</span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 4. LIGHT THEME QUICK AFFILIATE BAR (Replaces dark box completely)        */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <ReferralLinkCard
        address={address}
        directsCount={directsCount}
        sponsorAddress={profile?.sponsorAddress}
        upline2Address={profile?.upline2Address}
      />
    </div>
  );
}
