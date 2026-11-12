import React from "react";
import { useUserStore } from "@/lib/stores";
import { MatrixLeaderboardSummary } from "@/lib/api";
import { LeaderboardUserRank } from "@/lib/stores/useLeaderboardStore";
import { formatAddress } from "@/lib/format";

export interface LeaderboardHeaderProps {
  timeframe: "All Time" | "30 Days" | "7 Days";
  setTimeframe: (t: "All Time" | "30 Days" | "7 Days") => void;
  handleCopy: (text: string) => void;
  summary?: MatrixLeaderboardSummary | null;
  userRank?: LeaderboardUserRank | null;
  loading?: boolean;
}

const ROYALTY_MILESTONES = [
  { name: "Alpha", target: 42 },
  { name: "Prime", target: 84 },
  { name: "Elite", target: 126 },
  { name: "Crown", target: 168 },
] as const;

export function LeaderboardHeader({
  timeframe,
  setTimeframe,
  handleCopy,
  summary,
  userRank,
  loading = false,
}: LeaderboardHeaderProps) {
  const address = useUserStore((s) => s.address);
  const profile = useUserStore((s) => s.profile);

  const displayAddress = formatAddress(address, "short", "Connect Wallet");
  const partnersCount = userRank?.directCount ?? profile?.directReferralsCount ?? 0;
  const lifetimeUsd = Number(
    userRank?.totalEarnedUsd ?? profile?.totalEarningsUsd ?? profile?.totalEarnings ?? 0
  );
  const lifetimeTrob = Number(
    userRank?.totalEarnedTrob ?? profile?.totalEarningsTrob ?? 0
  );
  const cyclesCount = userRank?.recyclesCount ?? profile?.recyclesCount ?? 0;

  const rankDisplay = userRank?.rank ? `#${userRank.rank}` : profile?.isRegistered ? "Active" : "Guest";
  const rankOutOf = userRank?.totalUsers || summary?.totalMatrixUsers || 0;
  const userTierName =
    userRank?.rankName && userRank.rankName !== "NONE"
      ? userRank.rankName
      : profile?.rankName && profile.rankName !== "NONE"
        ? profile.rankName
        : null;

  const milestonesCount =
    userRank?.milestones ?? (profile as any)?.rankMilestones?.milestones ?? 0;
  const nextMilestone =
    ROYALTY_MILESTONES.find((m) => milestonesCount < m.target) ||
    ROYALTY_MILESTONES[ROYALTY_MILESTONES.length - 1];
  const milestoneRemaining = Math.max(0, nextMilestone.target - milestonesCount);
  const progressPercent = Math.min(
    100,
    Math.round((milestonesCount / nextMilestone.target) * 100)
  );

  const totalMatrixUsers = summary?.totalMatrixUsers ?? 0;
  const activeEarners = summary?.activeEarnersCount ?? 0;
  const achievers = summary?.poolAchievers ?? {
    alpha: 0,
    prime: 0,
    elite: 0,
    crown: 0,
    totalAchievers: 0,
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-4">
        <div>
          {/* Eyebrow: Protocol Leaderboard + Badge */}
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-[11px] lg:text-[11.5px] font-extrabold text-[#2563eb] tracking-wider uppercase">
              PROTOCOL LEADERBOARD
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
              <span>Live On-Chain</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#0f172a] tracking-tight leading-tight">
            Matrix Leaders
          </h1>
          <p className="text-[12px] sm:text-[12.5px] lg:text-[13.5px] text-[#64748b] mt-1 font-normal max-w-2xl leading-relaxed">
            Real-time blockchain rankings: fixed $30/payout USD value paired with exact historical TROB received.
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center bg-[#f1f5f9] p-0.5 sm:p-1 rounded-xl border border-[#e2e8f0] self-start sm:self-auto">
          {(["All Time", "30 Days", "7 Days"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-[11.5px] sm:text-[12.5px] font-semibold transition-all cursor-pointer ${
                timeframe === t
                  ? "bg-[#2563eb] text-white shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ PROTOCOL STATS & RANK ACHIEVERS SUMMARY STRIP ═══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] px-3.5 py-3 shadow-xs">
          <div className="text-[10.5px] font-bold text-[#64748b] uppercase tracking-wider">
            Total Matrix Users
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0f172a] mt-1 leading-none">
            {loading && totalMatrixUsers === 0 ? "…" : totalMatrixUsers.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-[#94a3b8] mt-1 font-medium">Registered wallets</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] px-3.5 py-3 shadow-xs">
          <div className="text-[10.5px] font-bold text-[#64748b] uppercase tracking-wider">
            Active Earners
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#2563eb] mt-1 leading-none">
            {loading && activeEarners === 0 ? "…" : activeEarners.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-[#94a3b8] mt-1 font-medium">On-chain payouts</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dbeafe] bg-gradient-to-br from-white to-[#eff6ff]/60 px-3.5 py-3 shadow-xs">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10.5px] font-bold text-[#1d4ed8] uppercase tracking-wider">
              Alpha Pool
            </span>
            <span className="text-[9.5px] font-bold text-[#2563eb] bg-[#dbeafe]/70 px-1.5 py-0.5 rounded-full">
              42+
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0f172a] mt-1 leading-none">
            {loading && !summary ? "…" : achievers.alpha.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-[#64748b] mt-1 font-medium">Rank achievers</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e0e7ff] bg-gradient-to-br from-white to-[#eef2ff]/60 px-3.5 py-3 shadow-xs">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10.5px] font-bold text-[#4338ca] uppercase tracking-wider">
              Prime Pool
            </span>
            <span className="text-[9.5px] font-bold text-[#4f46e5] bg-[#e0e7ff]/70 px-1.5 py-0.5 rounded-full">
              84+
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0f172a] mt-1 leading-none">
            {loading && !summary ? "…" : achievers.prime.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-[#64748b] mt-1 font-medium">Rank achievers</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#d1fae5] bg-gradient-to-br from-white to-[#ecfdf5]/60 px-3.5 py-3 shadow-xs">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10.5px] font-bold text-[#047857] uppercase tracking-wider">
              Elite Pool
            </span>
            <span className="text-[9.5px] font-bold text-[#059669] bg-[#d1fae5]/70 px-1.5 py-0.5 rounded-full">
              126+
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0f172a] mt-1 leading-none">
            {loading && !summary ? "…" : achievers.elite.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-[#64748b] mt-1 font-medium">Rank achievers</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#fef08a] bg-gradient-to-br from-white to-[#fefce8]/70 px-3.5 py-3 shadow-xs">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10.5px] font-bold text-[#b45309] uppercase tracking-wider">
              Crown Pool
            </span>
            <span className="text-[9.5px] font-bold text-[#d97706] bg-[#fef3c7] px-1.5 py-0.5 rounded-full">
              168+
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0f172a] mt-1 leading-none">
            {loading && !summary ? "…" : achievers.crown.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-[#64748b] mt-1 font-medium">Rank achievers</div>
        </div>
      </div>

      {/* ═══════════ USER CURRENT STATUS CARD ═══════════ */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 lg:p-5 shadow-xs transition-shadow hover:shadow-sm">
        {/* Desktop Layout: Horizontal Row (>= xl) */}
        <div className="hidden xl:flex items-center justify-between gap-5 xl:gap-6">
          {/* User Identity Column */}
          <div className="flex items-center gap-3.5 pr-2">
            <div
              className="w-12 h-12 rounded-full shadow-md flex-shrink-0 relative overflow-hidden"
              style={{
                background: "radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 35%, #1d4ed8 75%, #0f172a 100%)",
                boxShadow: "0 4px 10px -2px rgba(29, 78, 216, 0.5), inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -3px 4px rgba(0,0,0,0.4)",
              }}
            >
              <div className="absolute top-1.5 left-2.5 w-3 h-2 rounded-full bg-white/45 blur-[0.6px] transform -rotate-12" />
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[#64748b] leading-tight">Your On-Chain Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[15px] font-extrabold text-[#0f172a]">
                  {profile?.userId ? `Member #${profile.userId}` : "Active Node"}
                </span>
                {userTierName && (
                  <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] border border-[#dbeafe] text-[#2563eb] text-[10px] font-extrabold uppercase">
                    {userTierName}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => address && handleCopy(address)}
                className="flex items-center gap-1 mt-0.5 text-[11.5px] font-mono text-[#64748b] hover:text-[#2563eb] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="font-semibold">{displayAddress}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-[#e2e8f0]" />

          {/* Rank Column */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">CURRENT RANK</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-[#2563eb] leading-none">{rankDisplay}</span>
              {rankOutOf > 0 && (
                <span className="text-[11px] font-semibold text-[#64748b]">of {rankOutOf}</span>
              )}
            </div>
          </div>

          {/* Metric 1: Direct Partners */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black text-[#0f172a] leading-tight">{partnersCount}</div>
              <div className="text-[12px] font-bold text-[#0f172a] leading-tight mt-0.5">Direct Partners</div>
              <div className="text-[10.5px] text-[#94a3b8]">Verified on-chain</div>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-[#e2e8f0]" />

          {/* Metric 2: Matrix Cycles */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black text-[#0f172a] leading-tight">{cyclesCount}</div>
              <div className="text-[12px] font-bold text-[#0f172a] leading-tight mt-0.5">Matrix Cycles</div>
              <div className="text-[10.5px] text-[#94a3b8]">14-node resets</div>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-[#e2e8f0]" />

          {/* Metric 3: Total Earned USD + Exact TROB */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="22.08" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black text-[#0f172a] leading-tight">${Math.round(lifetimeUsd).toLocaleString("en-US")}</div>
              <div className="text-[11px] font-mono font-semibold text-[#2563eb] leading-tight mt-0.5">
                {lifetimeTrob.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB
              </div>
              <div className="text-[10px] text-[#94a3b8]">Fixed $30/seat • On-chain TROB</div>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-[#e2e8f0]" />

          {/* Royalty Pool Milestone Progress */}
          <div className="flex flex-col min-w-[205px] xl:min-w-[225px]">
            <div className="flex items-center justify-between text-[11px] mb-2 gap-2">
              <span className="font-bold text-[#0f172a]">
                {milestoneRemaining > 0
                  ? `${milestoneRemaining} to ${nextMilestone.name} Pool`
                  : `${nextMilestone.name} Pool Unlocked`}
              </span>
              <span className="font-extrabold text-[#0f172a]">
                {milestonesCount} / {nextMilestone.target}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2563eb] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Layout (< xl) */}
        <div className="xl:hidden flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-extrabold text-[13px] shadow-sm">
                  {profile?.userId ? `#${profile.userId}` : "ME"}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#16a34a] border-2 border-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-bold text-[#0f172a] truncate">
                    {profile?.userId ? `Member #${profile.userId}` : "Your On-Chain Status"}
                  </span>
                  {userTierName && (
                    <span className="px-1.5 py-0.5 rounded bg-[#eff6ff] text-[#2563eb] text-[9px] font-extrabold uppercase">
                      {userTierName}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => address && handleCopy(address)}
                  className="flex items-center gap-1 mt-0.5 text-[11px] font-mono text-[#64748b] hover:text-[#2563eb] cursor-pointer"
                >
                  <span className="truncate">{displayAddress}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                    <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-[8.5px] font-bold text-[#94a3b8] uppercase tracking-wider">CURRENT RANK</div>
              <div className="flex items-baseline gap-1 justify-end mt-0.5">
                <span className="text-xl font-black text-[#2563eb] leading-none">{rankDisplay}</span>
                {rankOutOf > 0 && (
                  <span className="text-[10px] font-semibold text-[#64748b]">/ {rankOutOf}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#f1f5f9]">
            <div className="min-w-0">
              <div className="text-[10px] text-[#94a3b8] font-medium truncate">Direct Partners</div>
              <div className="text-lg font-black text-[#0f172a] mt-0.5">{partnersCount}</div>
              <div className="text-[9.5px] text-[#94a3b8] truncate">Verified</div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[#94a3b8] font-medium truncate">Matrix Cycles</div>
              <div className="text-lg font-black text-[#0f172a] mt-0.5">{cyclesCount}</div>
              <div className="text-[9.5px] text-[#94a3b8] truncate">Completed</div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[#94a3b8] font-medium truncate">Total Earned</div>
              <div className="text-lg font-black text-[#2563eb] mt-0.5 leading-none">
                ${Math.round(lifetimeUsd).toLocaleString("en-US")}
              </div>
              <div className="text-[9.5px] font-mono font-semibold text-[#64748b] mt-0.5 truncate">
                {lifetimeTrob.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#f1f5f9]">
            <div className="flex items-center justify-between text-[11px] mb-1.5 gap-2">
              <span className="font-bold text-[#0f172a] truncate text-[10px] sm:text-[11px]">
                {milestoneRemaining > 0
                  ? `${milestoneRemaining} to ${nextMilestone.name} Pool`
                  : `${nextMilestone.name} Pool Unlocked`}
              </span>
              <span className="font-extrabold text-[#2563eb] text-[10px] sm:text-[11px] flex-shrink-0">
                {milestonesCount} / {nextMilestone.target}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2563eb] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
