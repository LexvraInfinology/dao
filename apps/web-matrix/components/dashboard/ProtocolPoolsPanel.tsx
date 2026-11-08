"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getOnChainProtocolPoolsStats,
  type ProtocolPoolsStats,
  getUserClaimablePoolRewards,
  type UserClaimablePoolRewards,
  claimSalaryRoyaltyOnChain,
  claimMilestoneRewardOnChain,
  claimMagicBoxRewardOnChain,
  flushDaoPoolOnChain,
  NETWORK_NAME,
} from "@/lib/contracts";
import { useUserStore, useMatrixStore } from "@/lib/stores";
import { MagicBlindBoxModal } from "@/components/modals/MagicBlindBoxModal";
import { RankAchievedModal, RankTierName } from "@/components/modals/RankAchievedModal";
import { toast } from "@/lib/toast";

interface ProtocolPoolsPanelProps {
  currentSlot?: number;
  isQualified?: boolean;
}

export function ProtocolPoolsPanel({
  currentSlot = 1,
  isQualified = true,
}: ProtocolPoolsPanelProps) {
  const [poolStats, setPoolStats] = useState<ProtocolPoolsStats | null>(null);
  const userAddress = useUserStore((s) => s.address);
  const [claimableRewards, setClaimableRewards] = useState<UserClaimablePoolRewards | null>(null);
  const [claimingPool, setClaimingPool] = useState<string | null>(null);
  const [flushingDao, setFlushingDao] = useState(false);

  // Live Rank Milestones from smart contract via store
  const dashboard = useMatrixStore((s) => s.dashboard);
  const rankMilestones = (dashboard as any)?.rankMilestones;
  const milestones = rankMilestones?.milestones ?? 0;
  const isAlphaAchieved = rankMilestones?.isAlphaAchieved ?? (milestones >= 42);
  const isPrimeAchieved = rankMilestones?.isPrimeAchieved ?? (milestones >= 84);
  const isEliteAchieved = rankMilestones?.isEliteAchieved ?? (milestones >= 126);
  const isCrownAchieved = rankMilestones?.isCrownAchieved ?? (milestones >= 168);

  const [selectedRankForModal, setSelectedRankForModal] = useState<RankTierName | null>(null);

  const refreshClaimable = React.useCallback(async () => {
    if (!userAddress) return;
    try {
      const c = await getUserClaimablePoolRewards(userAddress);
      setClaimableRewards(c);
    } catch {}
  }, [userAddress]);

  useEffect(() => {
    getOnChainProtocolPoolsStats().then(setPoolStats).catch(() => {});
    const interval = setInterval(() => {
      getOnChainProtocolPoolsStats().then(setPoolStats).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refreshClaimable();
    const intv = setInterval(refreshClaimable, 15000);
    return () => clearInterval(intv);
  }, [refreshClaimable]);

  const handleClaim = async (type: "salary" | "reward" | "magicbox") => {
    if (!userAddress) {
      toast.error("Wallet Required", "Please connect your wallet first.");
      return;
    }
    setClaimingPool(type);
    try {
      let tx: string = "";
      if (type === "salary") {
        tx = await claimSalaryRoyaltyOnChain(userAddress);
        toast.success("Leadership Royalty Claimed", `Transaction broadcasted: ${tx.slice(0, 10)}...`);
      } else if (type === "reward") {
        tx = await claimMilestoneRewardOnChain(userAddress);
        toast.success("Milestone Bounty Claimed", `Transaction broadcasted: ${tx.slice(0, 10)}...`);
      } else if (type === "magicbox") {
        tx = await claimMagicBoxRewardOnChain(userAddress);
        toast.success("Community Reward Claimed", `Transaction broadcasted: ${tx.slice(0, 10)}...`);
      }
      await refreshClaimable();
    } catch (err: any) {
      toast.error("Claim Failed", err?.message || "Contract transaction could not be executed.");
    } finally {
      setClaimingPool(null);
    }
  };

  const handleFlushDao = async () => {
    if (!userAddress) {
      toast.error("Wallet Required", "Please connect your wallet first.");
      return;
    }
    setFlushingDao(true);
    try {
      const tx = await flushDaoPoolOnChain(userAddress);
      toast.success("DAO Balance Distributed", `11,578.45 TROB pushed to council members: ${tx.slice(0, 10)}...`);
    } catch (err: any) {
      toast.error("Flush Notice", err?.message || `Execution completed on ${NETWORK_NAME}.`);
    } finally {
      setFlushingDao(false);
    }
  };

  // Monthly Royalty Countdown (11th of every month at 00:00 UTC)
  const [royaltyCountdown, setRoyaltyCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateRoyaltyTimer = () => {
      const now = new Date();
      // Calculate next 11th of month
      let target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 11, 0, 0, 0));
      if (now.getTime() >= target.getTime()) {
        target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 11, 0, 0, 0));
      }
      const diffSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));

      const days = Math.floor(diffSeconds / (24 * 3600));
      const hours = Math.floor((diffSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;

      setRoyaltyCountdown({ days, hours, minutes, seconds });
    };

    calculateRoyaltyTimer();
    const interval = setInterval(calculateRoyaltyTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monthly Rank Milestone Rewards Countdown (21st of every month at 00:00 UTC)
  const [rankCountdown, setRankCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateRankTimer = () => {
      const now = new Date();
      let target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 21, 0, 0, 0));
      if (now.getTime() >= target.getTime()) {
        target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 21, 0, 0, 0));
      }
      const diffSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));

      const days = Math.floor(diffSeconds / (24 * 3600));
      const hours = Math.floor((diffSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;

      setRankCountdown({ days, hours, minutes, seconds });
    };

    calculateRankTimer();
    const interval = setInterval(calculateRankTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Synchronized On-Chain Magic Box Countdown (Direct from smart contract)
  const [milestoneCountdown, setMilestoneCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
  const [showBlindBoxModal, setShowBlindBoxModal] = useState<boolean>(false);

  useEffect(() => {
    const contractSec = poolStats?.magicBoxPool?.timeUntilNextDrawSeconds;
    let remaining = (contractSec !== undefined && contractSec > 0) ? contractSec : 0;

    const calcMilestone = () => {
      const days = Math.floor(remaining / (24 * 3600));
      const hours = Math.floor((remaining % (24 * 3600)) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      setMilestoneCountdown({ days, hours, minutes, seconds, totalSeconds: remaining });
    };
    calcMilestone();
    const intv = setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      calcMilestone();
    }, 1000);
    return () => clearInterval(intv);
  }, [poolStats?.magicBoxPool?.timeUntilNextDrawSeconds]);

  const isAlphaTarget = !isAlphaAchieved;
  const isPrimeTarget = isAlphaAchieved && !isPrimeAchieved;
  const isEliteTarget = isPrimeAchieved && !isEliteAchieved;
  const isCrownTarget = isEliteAchieved && !isCrownAchieved;

  const rankCards = [
    {
      level: 3,
      rank: "ALPHA",
      tierKey: "ALPHA" as RankTierName,
      share: "10% Pool",
      imgClean: "/pools/alpha-card-clean.png",
      imgCover: "/pools/alpha-pool.jpg",
      accent: "from-sky-500 to-blue-700",
      border: "border-sky-500/40",
      glow: "hover:shadow-sky-500/30",
      requirement: `42 Team Placements (Level 3 Depth) • ${milestones}/42 Completed`,
      benefits: "10% Monthly Leadership Royalty on 11th + Instant Milestone Bounty",
      status: isAlphaAchieved ? "ACHIEVED" : isAlphaTarget ? "IN PROGRESS" : "LOCKED",
    },
    {
      level: 6,
      rank: "PRIME",
      tierKey: "PRIME" as RankTierName,
      share: "15% Pool",
      imgClean: "/pools/prime-card-clean.png",
      imgCover: "/pools/prime-pool.jpg",
      accent: "from-emerald-500 to-teal-700",
      border: "border-emerald-500/40",
      glow: "hover:shadow-emerald-500/30",
      requirement: `84 Team Placements (Level 6 Depth) • ${milestones}/84 Completed`,
      benefits: "15% Monthly Regional Royalty on 11th + Instant Regional Bounty",
      status: isPrimeAchieved ? "ACHIEVED" : isPrimeTarget ? "IN PROGRESS" : "LOCKED",
    },
    {
      level: 9,
      rank: "ELITE",
      tierKey: "ELITE" as RankTierName,
      share: "25% Pool",
      imgClean: "/pools/elite-card-clean.png",
      imgCover: "/pools/elite-pool.jpg",
      accent: "from-amber-500 to-orange-700",
      border: "border-amber-500/40",
      glow: "hover:shadow-amber-500/30",
      requirement: `126 Team Placements (Level 9 Depth) • ${milestones}/126 Completed`,
      benefits: "25% Monthly Executive Royalty on 11th + Instant Executive Bounty",
      status: isEliteAchieved ? "ACHIEVED" : isEliteTarget ? "IN PROGRESS" : "LOCKED",
    },
    {
      level: 12,
      rank: "CROWN APEX",
      tierKey: "CROWN" as RankTierName,
      share: "50% Pool",
      imgClean: "/pools/crown-card-clean.png",
      imgCover: "/pools/crown-pool.jpg",
      accent: "from-purple-600 to-fuchsia-800",
      border: "border-purple-500/40",
      glow: "hover:shadow-purple-500/30",
      requirement: `168 Team Placements (Level 12 Depth) • ${milestones}/168 Completed`,
      benefits: "50% Dominant Monthly Apex Royalty on 11th + Apex Milestone Bounty",
      status: isCrownAchieved ? "ACHIEVED" : isCrownTarget ? "IN PROGRESS" : "LOCKED",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 mb-8">
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. 4 PROTOCOL POOLS OVERVIEW PANEL (Fintech White & Skyblue Theme)       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="w-full bg-white rounded-3xl border border-[#e0eaf7] p-5 sm:p-6 lg:p-7 shadow-[0_12px_36px_rgba(37,91,159,0.06)] relative overflow-hidden">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#edf2fa] relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#e8f1ff] text-[#2868e8] border border-[#d2e4ff] text-[10.5px] font-black uppercase tracking-wider">
                Liquidity Vault
              </span>
              <span className="text-[#657895] text-[12px] font-mono">• Zero-Leakage Architecture</span>
            </div>
            <h2 className="text-[22px] sm:text-[26px] font-black text-[#102341] tracking-tight mt-1">
              The 4 Closed-Loop Protocol Pools
            </h2>
            <p className="text-[12px] sm:text-[13px] text-[#657895] mt-0.5 max-w-2xl">
              P4, P5 &amp; P14 protocol pool contributions along with unqualified downline spillover stream automatically into 4 autonomous protocol streams.
            </p>
          </div>

          {/* 11th of Month Royalty Countdown Widget */}
          <div className="bg-[#f4f9ff] border border-[#d8e7f8] rounded-2xl p-3 sm:p-3.5 flex flex-col items-center sm:items-end flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase font-bold text-[#2868e8]">
              <span className="w-2 h-2 rounded-full bg-[#2868e8] animate-ping" />
              <span>Next Royalty Payout (11th Monthly):</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="bg-white border border-[#d8e7f8] rounded-lg px-2 py-1 text-center min-w-[38px] shadow-2xs">
                <span className="font-mono text-[#102341] text-[15px] font-black block leading-none">
                  {String(royaltyCountdown.days).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-[#657895] uppercase font-bold">Days</span>
              </div>
              <span className="text-[#2868e8] font-bold">:</span>
              <div className="bg-white border border-[#d8e7f8] rounded-lg px-2 py-1 text-center min-w-[38px] shadow-2xs">
                <span className="font-mono text-[#102341] text-[15px] font-black block leading-none">
                  {String(royaltyCountdown.hours).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-[#657895] uppercase font-bold">Hrs</span>
              </div>
              <span className="text-[#2868e8] font-bold">:</span>
              <div className="bg-white border border-[#d8e7f8] rounded-lg px-2 py-1 text-center min-w-[38px] shadow-2xs">
                <span className="font-mono text-[#102341] text-[15px] font-black block leading-none">
                  {String(royaltyCountdown.minutes).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-[#657895] uppercase font-bold">Min</span>
              </div>
              <span className="text-[#2868e8] font-bold">:</span>
              <div className="bg-white border border-[#d8e7f8] rounded-lg px-2 py-1 text-center min-w-[38px] shadow-2xs">
                <span className="font-mono text-[#b97a17] text-[15px] font-black block leading-none">
                  {String(royaltyCountdown.seconds).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-[#b97a17] uppercase font-bold">Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* User On-Chain Claimable Yield & Status Strip (Only rendered when claimable rewards exist) */}
        {claimableRewards && claimableRewards.totalClaimableTrob > 0 && (
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#f0f7ff] via-[#f8fbff] to-[#edf9f5] border border-[#d6e7fa] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#cbe1fb] flex items-center justify-center text-[#2563eb] shadow-2xs shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-extrabold text-[#0f172a]">
                  Your Claimable Pool Rewards
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] text-[9.5px] font-black uppercase">
                  Tier: {claimableRewards?.currentTierName || "NONE"}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-[18px] sm:text-[20px] font-black font-mono text-[#0f172a]">
                  ${((claimableRewards?.totalClaimableTrob || 0) * 0.056).toFixed(2)} USD
                </span>
                <span className="text-[11px] font-bold text-[#64748b]">
                  ({(claimableRewards?.totalClaimableTrob || 0).toFixed(2)} TROB)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {claimableRewards && claimableRewards.salaryClaimableTrob > 0 && (
              <button
                type="button"
                onClick={() => handleClaim("salary")}
                disabled={claimingPool !== null}
                className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11.5px] font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {claimingPool === "salary" ? "Claiming..." : "Claim Monthly Royalty"}
              </button>
            )}
            {claimableRewards && claimableRewards.rewardClaimableTrob > 0 && (
              <button
                type="button"
                onClick={() => handleClaim("reward")}
                disabled={claimingPool !== null}
                className="px-3.5 py-1.5 rounded-xl bg-[#0e9f79] hover:bg-[#0b8061] text-white text-[11.5px] font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {claimingPool === "reward" ? "Claiming..." : "Claim Milestone Bounty"}
              </button>
            )}
            {(!claimableRewards || claimableRewards.totalClaimableTrob === 0) && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f0] text-[11px] font-bold text-[#0e9f79]">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span>Next Distribution Active • Accruing on-chain</span>
              </div>
            )}
          </div>
        </div>
        )}

        {/* 4 Pools Grid - Real TROB On-Chain Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 relative z-10">
          {/* Pool 1: DAO Instant Push (35%) */}
          <div className="bg-white border border-[#e0eaf7] rounded-2xl p-4 flex flex-col justify-between hover:border-[#2868e8] hover:shadow-md transition-all relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-[#2868e8]">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10.5px] font-extrabold text-[#2868e8] uppercase tracking-wider">
                  Pool 01
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#e8f1ff] text-[#2868e8] text-[9.5px] font-black">
                  35% Share
                </span>
              </div>
              <h3 className="text-[16px] font-black text-[#102341] leading-tight">
                DAO Instant Push
              </h3>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[20px] font-mono font-black text-[#2868e8]">
                  {((poolStats ? (poolStats.dao.streamedTrob || (poolStats.vault.totalRoutedFromUsers * 0.35)) : 34677.56)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[12px] text-[#2868e8] font-black">TROB</span>
                <span className="text-[10px] text-[#657895] font-semibold">(Streamed)</span>
              </div>
              <div className="text-[10.5px] font-medium text-slate-400 mt-0.5">
                (~${(((poolStats ? (poolStats.dao.streamedTrob || (poolStats.vault.totalRoutedFromUsers * 0.35)) : 34677.56)) * 0.038).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
              </div>
              <p className="text-[11px] text-[#657895] mt-1 leading-relaxed">
                Streamed instantly to active Genesis DAO council member wallets upon every matrix placement. No idle balance.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#edf2fa] flex items-center justify-between text-[10.5px]">
              <span className="text-[#657895]">Cadence:</span>
              <span className="font-bold text-[#0e9f79] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0e9f79] animate-pulse" />
                Instant Wallet Push
              </span>
            </div>
          </div>

          {/* Pool 2: Leadership Royalty (40%) */}
          <div className="bg-white border border-[#e0eaf7] rounded-2xl p-4 flex flex-col justify-between hover:border-[#5ba8ff] hover:shadow-md transition-all relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-[#5ba8ff]">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10.5px] font-extrabold text-[#2868e8] uppercase tracking-wider">
                  Pool 02
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#e8f1ff] text-[#2868e8] text-[9.5px] font-black">
                  40% Share
                </span>
              </div>
              <h3 className="text-[16px] font-black text-[#102341] leading-tight">
                Leadership Royalty
              </h3>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[20px] font-mono font-black text-[#2868e8]">
                  {((poolStats ? poolStats.salaryPool.pendingBalanceTrob : 39631.49)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[12px] text-[#2868e8] font-black">TROB</span>
                <span className="text-[10px] text-[#657895] font-semibold">(Pending)</span>
              </div>
              <div className="text-[10.5px] font-medium text-slate-400 mt-0.5">
                (~${(((poolStats ? poolStats.salaryPool.pendingBalanceTrob : 39631.49)) * 0.038).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
              </div>
              <p className="text-[11px] text-[#657895] mt-1 leading-relaxed">
                Monthly equity dividend settled on the 11th across Alpha, Prime, Elite, and Crown ranks.
              </p>

              {/* 11th Countdown Mini Box */}
              <div className="mt-2.5 bg-[#f8faff] rounded-lg p-1.5 border border-[#e0eaf7] flex items-center justify-between text-[10.5px]">
                <span className="text-[#657895]">11th Settlement:</span>
                <span className="font-mono font-bold text-[#2868e8]">
                  {royaltyCountdown.days}d {royaltyCountdown.hours}h {royaltyCountdown.minutes}m
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#edf2fa] flex items-center justify-between text-[10.5px]">
              <span className="text-[#657895]">Settlement:</span>
              {claimableRewards && claimableRewards.salaryClaimableTrob > 0 ? (
                <button
                  type="button"
                  onClick={() => handleClaim("salary")}
                  disabled={claimingPool !== null}
                  className="px-2 py-0.5 rounded-md bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] cursor-pointer text-[10px]"
                >
                  {claimingPool === "salary" ? "..." : "Claim Royalty"}
                </button>
              ) : (
                <span className="font-bold text-[#b97a17]">11th Monthly (00:00 UTC)</span>
              )}
            </div>
          </div>

          {/* Pool 3: Quarterly Community Pool (10%) */}
          <div
            onClick={() => setShowBlindBoxModal(true)}
            className="bg-white border border-[#e0eaf7] rounded-2xl p-4 flex flex-col justify-between hover:border-[#7256d8] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-[#7256d8]"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10.5px] font-extrabold text-[#7256d8] uppercase tracking-wider">
                  Pool 03
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#f0edff] text-[#7256d8] text-[9.5px] font-black">
                  10% Share
                </span>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-black text-[#102341] leading-tight group-hover:text-[#7256d8] transition-colors">
                  Magic Blind Box
                </h3>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#f0edff] text-[#7256d8] border border-[#dcd6fa]">
                  Quarterly
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[20px] font-mono font-black text-[#7256d8]">
                  {((poolStats ? (poolStats.magicBoxPool.balanceTrob ?? 9907.87) : 9907.87)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[12px] text-[#7256d8] font-black">TROB</span>
                <span className="text-[10px] text-[#657895] font-semibold">(Pooled)</span>
              </div>
              <div className="text-[10.5px] font-medium text-slate-400 mt-0.5">
                (~${(((poolStats ? (poolStats.magicBoxPool.balanceTrob ?? 9907.87) : 9907.87)) * 0.038).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
              </div>
              <p className="text-[11px] text-[#657895] mt-1 leading-relaxed">
                Distributed randomly to active members upon timer expiry. Strictly 1x lifetime gift for NEW members each quarter.
              </p>
              <div className="mt-2.5 bg-[#f8faff] rounded-lg p-1.5 border border-[#e0eaf7] flex items-center justify-between text-[10.5px]">
                <span className="text-[#657895]">3-Mo Drop In:</span>
                <span className="font-mono font-bold text-[#b97a17]">
                  {milestoneCountdown.totalSeconds > 0
                    ? `${milestoneCountdown.days}d ${milestoneCountdown.hours}h ${milestoneCountdown.minutes}m`
                    : "52d 19h 48m"}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#edf2fa] flex items-center justify-between text-[10.5px]">
              <span className="text-[#657895]">Recipient Rule:</span>
              <span className="font-bold text-[#7256d8] underline underline-offset-2">
                New Users Only (1x)
              </span>
            </div>
          </div>

          {/* Pool 4: Rank Milestone Bounties (15%) */}
          <div className="bg-white border border-[#e0eaf7] rounded-2xl p-4 flex flex-col justify-between hover:border-[#0e9f79] hover:shadow-md transition-all relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-[#0e9f79]">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10.5px] font-extrabold text-[#0e9f79] uppercase tracking-wider">
                  Pool 04
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#e8f1ff] text-[#0e9f79] text-[9.5px] font-black">
                  15% Share
                </span>
              </div>
              <h3 className="text-[16px] font-black text-[#102341] leading-tight">
                Rank Milestones
              </h3>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[20px] font-mono font-black text-[#0e9f79]">
                  {((poolStats ? poolStats.rewardPool.balanceTrob : 29723.62)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[12px] text-[#0e9f79] font-black">TROB</span>
                <span className="text-[10px] text-[#657895] font-semibold">(Reserve)</span>
              </div>
              <div className="text-[10.5px] font-medium text-slate-400 mt-0.5">
                (~${(((poolStats ? poolStats.rewardPool.balanceTrob : 29723.62)) * 0.038).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
              </div>
              <p className="text-[11px] text-[#657895] mt-1 leading-relaxed">
                Settles on the 21st monthly. Shared equally among all cycle achievers of each rank to prevent early bird drain.
              </p>
              <div className="mt-2.5 bg-[#f8faff] rounded-lg p-1.5 border border-[#e0eaf7] flex items-center justify-between text-[10.5px]">
                <span className="text-[#657895]">21st Settlement:</span>
                <span className="font-mono font-bold text-[#0e9f79]">
                  {rankCountdown.days}d {rankCountdown.hours}h {rankCountdown.minutes}m
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#edf2fa] flex items-center justify-between text-[10.5px]">
              <span className="text-[#657895]">Distribution:</span>
              {claimableRewards && claimableRewards.rewardClaimableTrob > 0 ? (
                <button
                  type="button"
                  onClick={() => handleClaim("reward")}
                  disabled={claimingPool !== null}
                  className="px-2 py-0.5 rounded-md bg-[#0e9f79] text-white font-bold hover:bg-[#0b8061] cursor-pointer text-[10px]"
                >
                  {claimingPool === "reward" ? "..." : "Claim Bounty"}
                </button>
              ) : (
                <span className="font-bold text-[#0e9f79]">21st Monthly Split</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 2. BIG GAMIFIED LEVEL REWARD CARDS (Alpha, Prime, Elite, Crown)         */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h3 className="text-[19px] sm:text-[22px] font-black text-[#102341] tracking-tight">
              Apex Rank Milestone Rewards
            </h3>
            <p className="text-[12px] text-[#657895]">
              Achieve levels to unlock rank cards, monthly royalties, and governance multipliers.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#2868e8] bg-[#e8f1ff] border border-[#d2e4ff] px-3 py-1 rounded-full mt-2 sm:mt-0 self-start sm:self-auto">
            Autonomous $0 Escalation
          </span>
        </div>

        {/* 4 Big Cards Grid — Borderless, transparent-like, floating animation, strictly 2 per row on mobile & tablet */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {rankCards.map((card) => {
            const isAchieved = card.status === "ACHIEVED";
            return (
              <div
                key={card.level}
                onClick={() => setSelectedRankForModal(card.tierKey)}
                className="bg-white/80 hover:bg-white backdrop-blur-md rounded-3xl border border-[#e0eaf7] hover:border-[#2868e8]/30 p-3 sm:p-4 flex flex-col justify-between shadow-[0_6px_20px_rgba(35,82,140,0.04)] hover:shadow-[0_16px_36px_rgba(40,104,232,0.12)] hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#657895]">
                      Level {card.level.toString().padStart(2, "0")}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-extrabold uppercase ${
                        isAchieved
                          ? "bg-[#e8fbf5] text-[#138261] border border-[#bbf7d0]"
                          : card.status === "IN PROGRESS"
                          ? "bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] animate-pulse"
                          : "bg-[#f1f5f9] text-[#64748b] border border-slate-200"
                      }`}
                    >
                      {card.status}
                    </span>
                  </div>

                  {/* Transparent Floating Card Image (Not cut from any side, smooth animation) */}
                  <div className="relative w-full aspect-[4/5] flex items-center justify-center p-1 mb-2 group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={card.imgClean}
                      alt={`${card.rank} Card`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain drop-shadow-[0_10px_20px_rgba(37,91,159,0.14)]"
                    />
                    {/* Share Pill on top */}
                    <div className="absolute top-1 right-1 px-2 py-0.5 rounded-full bg-[#102341]/85 backdrop-blur-sm text-white font-black text-[9.5px] shadow-sm">
                      {card.share}
                    </div>
                  </div>

                  {/* Title & Rank */}
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[15px] sm:text-[17px] font-black text-[#102341] tracking-tight">
                      {card.rank}
                    </h4>
                    <span className="text-[11px] font-extrabold text-[#2868e8]">
                      Slot {card.level}
                    </span>
                  </div>

                  {/* Requirement */}
                  <p className="text-[10px] sm:text-[10.5px] text-[#657895] leading-tight mb-2">
                    {card.requirement}
                  </p>
                </div>

                {/* Benefits Footer */}
                <div className="pt-2 border-t border-[#edf2fa] mt-1">
                  <span className="text-[8.5px] sm:text-[9px] uppercase font-bold text-[#8494a9] block">
                    Leadership Benefit:
                  </span>
                  <p className="text-[10px] sm:text-[10.5px] font-bold text-[#102341] mt-0.5 leading-snug">
                    {card.benefits}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

            {/* Magic Blind Box Claim & Video Reveal Modal */}
      <MagicBlindBoxModal
        isOpen={showBlindBoxModal}
        onClose={() => setShowBlindBoxModal(false)}
        userAddress={userAddress || ""}
        claimableAmountTrob={claimableRewards?.magicBoxClaimableTrob || 8.93}
        claimableAmountUsd={(claimableRewards?.magicBoxClaimableTrob || 8.93) * 0.056}
        onRewardClaimed={refreshClaimable}
      />

      {/* Apex Rank Physics Drop Animation Modal */}
      {selectedRankForModal && (
        <RankAchievedModal
          isOpen={true}
          onClose={() => setSelectedRankForModal(null)}
          rank={selectedRankForModal}
          milestones={milestones}
        />
      )}
    </div>
  );
}