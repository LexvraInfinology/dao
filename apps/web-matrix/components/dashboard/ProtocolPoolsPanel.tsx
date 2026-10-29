"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getOnChainProtocolPoolsStats, type ProtocolPoolsStats } from "@/lib/contracts";

interface ProtocolPoolsPanelProps {
  currentSlot?: number;
  isQualified?: boolean;
}

export function ProtocolPoolsPanel({
  currentSlot = 1,
  isQualified = true,
}: ProtocolPoolsPanelProps) {
  const [poolStats, setPoolStats] = useState<ProtocolPoolsStats | null>(null);

  useEffect(() => {
    getOnChainProtocolPoolsStats().then(setPoolStats).catch(() => {});
    const interval = setInterval(() => {
      getOnChainProtocolPoolsStats().then(setPoolStats).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // 3-Month Universal Milestone Countdown (90-day lockup)
  const CYCLE_SECONDS = 90 * 24 * 60 * 60;
  const BASE_CYCLE_START = 1790812800; // Oct 1, 2026
  const [milestoneCountdown, setMilestoneCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
  const [showBlindBoxModal, setShowBlindBoxModal] = useState<boolean>(false);

  useEffect(() => {
    const calcMilestone = () => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = Math.max(0, now - BASE_CYCLE_START);
      const remaining = CYCLE_SECONDS - (elapsed % CYCLE_SECONDS);
      const days = Math.floor(remaining / (24 * 3600));
      const hours = Math.floor((remaining % (24 * 3600)) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      setMilestoneCountdown({ days, hours, minutes, seconds, totalSeconds: remaining });
    };
    calcMilestone();
    const intv = setInterval(calcMilestone, 1000);
    return () => clearInterval(intv);
  }, []);

  const rankCards = [
    {
      level: 3,
      rank: "ALPHA",
      share: "10% Pool",
      imgClean: "/pools/alpha-card-clean.png",
      imgCover: "/pools/alpha-pool.jpg",
      accent: "from-sky-500 to-blue-700",
      border: "border-sky-500/40",
      glow: "hover:shadow-sky-500/30",
      requirement: "Slot 3 Auto-Unlocked via P4+P5 on Slot 2 ($0 Cost)",
      benefits: "10% Monthly Leadership Royalty on 11th + Instant Milestone Bounty",
      status: currentSlot >= 3 ? "ACHIEVED" : "IN PROGRESS",
    },
    {
      level: 6,
      rank: "PRIME",
      share: "15% Pool",
      imgClean: "/pools/prime-card-clean.png",
      imgCover: "/pools/prime-pool.jpg",
      accent: "from-emerald-500 to-teal-700",
      border: "border-emerald-500/40",
      glow: "hover:shadow-emerald-500/30",
      requirement: "Slot 6 Auto-Unlocked via P4+P5 on Slot 5 ($0 Cost)",
      benefits: "15% Monthly Regional Royalty on 11th + Instant Regional Bounty",
      status: currentSlot >= 6 ? "ACHIEVED" : "IN PROGRESS",
    },
    {
      level: 9,
      rank: "ELITE",
      share: "25% Pool",
      imgClean: "/pools/elite-card-clean.png",
      imgCover: "/pools/elite-pool.jpg",
      accent: "from-amber-500 to-orange-700",
      border: "border-amber-500/40",
      glow: "hover:shadow-amber-500/30",
      requirement: "Slot 9 Auto-Unlocked via P4+P5 on Slot 8 ($0 Cost)",
      benefits: "25% Monthly Executive Royalty on 11th + Instant Executive Bounty",
      status: currentSlot >= 9 ? "ACHIEVED" : "IN PROGRESS",
    },
    {
      level: 12,
      rank: "CROWN APEX",
      share: "50% Pool",
      imgClean: "/pools/crown-card-clean.png",
      imgCover: "/pools/crown-pool.jpg",
      accent: "from-purple-600 to-fuchsia-800",
      border: "border-purple-500/40",
      glow: "hover:shadow-purple-500/30",
      requirement: "Slot 12 Auto-Unlocked via P4+P5 on Slot 11 ($0 Cost)",
      benefits: "50% Dominant Monthly Apex Royalty on 11th + Apex Milestone Bounty",
      status: currentSlot >= 12 ? "ACHIEVED" : "IN PROGRESS",
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
              P4, P5 ($60) &amp; P14 ($30) deposits along with unqualified downline spillover stream automatically into 4 autonomous protocol streams.
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

        {/* 4 Pools Grid - Compact, Light-Themed, Sky Blue Accents */}
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
                  {poolStats ? (poolStats.dao.streamedTrob || poolStats.dao.balanceTrob || (poolStats.vault.totalRoutedFromMatrix * 0.35)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "8,601.13"}
                </span>
                <span className="text-[10.5px] text-[#657895] font-bold">TROB Streamed</span>
              </div>
              <p className="text-[11px] text-[#657895] mt-1 leading-relaxed">
                Streamed in real-time to active Genesis DAO seat members upon every matrix placement.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#edf2fa] flex items-center justify-between text-[10.5px]">
              <span className="text-[#657895]">Stream Cadence:</span>
              <span className="font-bold text-[#0e9f79] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0e9f79] animate-pulse" />
                Instant Block Stream
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
                  {poolStats ? poolStats.salaryPool.pendingBalanceTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </span>
                <span className="text-[10.5px] text-[#657895] font-bold">TROB Pending</span>
              </div>
              <p className="text-[11px] text-[#657895] mt-1 leading-relaxed">
                Monthly equity dividend settled on the 11th across Alpha, Prime, Elite, and Crown ranks.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#edf2fa] flex items-center justify-between text-[10.5px]">
              <span className="text-[#657895]">Settlement:</span>
              <span className="font-bold text-[#b97a17]">11th Monthly (Clean Rank)</span>
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
                  Community Pool
                </h3>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#f0edff] text-[#7256d8] border border-[#dcd6fa]">
                  Quarterly
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[20px] font-mono font-black text-[#7256d8]">
                  {poolStats ? poolStats.magicBoxPool.balanceTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </span>
                <span className="text-[10.5px] text-[#657895] font-bold">TROB Pooled</span>
              </div>
              <p className="text-[11px] text-[#657895] mt-1 leading-relaxed">
                Universal protocol pool distributed autonomously upon completing the 3-month milestone.
              </p>
              <div className="mt-2 bg-[#f8faff] rounded-lg p-1.5 border border-[#e0eaf7] flex items-center justify-between text-[10.5px]">
                <span className="text-[#657895]">3-Mo Milestone:</span>
                <span className="font-mono font-bold text-[#b97a17]">
                  {milestoneCountdown.days}d {milestoneCountdown.hours}h {milestoneCountdown.minutes}m
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#edf2fa] flex items-center justify-between text-[10.5px]">
              <span className="text-[#657895]">Condition:</span>
              <span className="font-bold text-[#7256d8] underline underline-offset-2">
                Milestone Rules
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
                  {poolStats ? poolStats.rewardPool.balanceTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </span>
                <span className="text-[10.5px] text-[#657895] font-bold">TROB Reserve</span>
              </div>
              <p className="text-[11px] text-[#657895] mt-1 leading-relaxed">
                One-time bounties unlocked upon reaching Slots 3, 6, 9, 12 at $0 out-of-pocket via P4+P5.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#edf2fa] flex items-center justify-between text-[10.5px]">
              <span className="text-[#657895]">Progression Bounty:</span>
              <span className="font-bold text-[#0e9f79]">Instant Disbursed</span>
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
                className="bg-white/80 hover:bg-white backdrop-blur-md rounded-3xl border border-[#e0eaf7] hover:border-[#2868e8]/30 p-3 sm:p-4 flex flex-col justify-between shadow-[0_6px_20px_rgba(35,82,140,0.04)] hover:shadow-[0_16px_36px_rgba(40,104,232,0.12)] hover:-translate-y-2 transition-all duration-300 group"
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
                          : "bg-[#f0f4f8] text-[#637890]"
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

      {/* 3-Month Magic Blind Box Milestone Modal */}
      {showBlindBoxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1d39]/45 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-[#e0eaf7] rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(5,26,64,0.2)] text-[#102341]">
            {/* Close Button */}
            <button
              onClick={() => setShowBlindBoxModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f4f8fe] hover:bg-[#e8f1ff] flex items-center justify-center text-[#657895] hover:text-[#102341] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header with Protocol Icon */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-3 rounded-2xl bg-[#f0edff] border border-[#dcd6fa] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#7256d8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0edff] border border-[#dcd6fa] text-[#7256d8] text-[11px] font-black uppercase tracking-wider mb-2">
                Protocol Pool 03 • 10% Reserve
              </div>
              <h3 className="text-2xl font-black tracking-tight text-[#102341]">
                Quarterly Community Pool Milestone
              </h3>
              <p className="text-[13px] text-[#657895] mt-1.5 max-w-md">
                Accessible strictly upon achieving the <span className="text-[#2868e8] font-bold">3-Month Protocol Milestone</span>. 10% of all matrix protocol liquidity is continuously pooled into this autonomous reward vault.
              </p>
            </div>

            {/* 3-Month Countdown Card */}
            <div className="mt-5 p-4 rounded-2xl bg-[#f8faff] border border-[#e0eaf7]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-[#657895] font-bold">
                  Time Remaining to 3-Month Milestone
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#fff6df] text-[#b97a17] border border-[#f3dba7]">
                  LOCKED
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white border border-[#e0eaf7] shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-[#102341] font-mono">{milestoneCountdown.days}</div>
                  <div className="text-[9px] text-[#657895] font-semibold uppercase">Days</div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#e0eaf7] shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-[#102341] font-mono">{milestoneCountdown.hours}</div>
                  <div className="text-[9px] text-[#657895] font-semibold uppercase">Hours</div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#e0eaf7] shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-[#102341] font-mono">{milestoneCountdown.minutes}</div>
                  <div className="text-[9px] text-[#657895] font-semibold uppercase">Mins</div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#e0eaf7] shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-[#2868e8] font-mono">{milestoneCountdown.seconds}</div>
                  <div className="text-[9px] text-[#657895] font-semibold uppercase">Secs</div>
                </div>
              </div>
            </div>

            {/* Odds & Rewards Table */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#f8faff] border border-[#e0eaf7] space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-[#657895] font-bold block mb-1">
                Provable Reward Distribution
              </span>
              <div className="flex items-center justify-between text-[12px] py-1 border-b border-[#edf2f8]">
                <span className="text-[#657895] font-medium">85% Common Tier</span>
                <span className="font-mono font-bold text-[#102341]">$0.50 USD</span>
              </div>
              <div className="flex items-center justify-between text-[12px] py-1 border-b border-[#edf2f8]">
                <span className="text-[#7256d8] font-medium">10% Active Boost (2+ Directs)</span>
                <span className="font-mono font-bold text-[#7256d8]">$0.80 USD</span>
              </div>
              <div className="flex items-center justify-between text-[12px] py-1 border-b border-[#edf2f8]">
                <span className="text-[#2868e8] font-medium">3% Elite Milestone Tier</span>
                <span className="font-mono font-bold text-[#2868e8]">$1.20 USD</span>
              </div>
              <div className="flex items-center justify-between text-[12px] py-1">
                <span className="text-[#b97a17] font-bold">2% Grand Apex Jackpot</span>
                <span className="font-mono font-black text-[#b97a17]">$5.00 USD</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowBlindBoxModal(false)}
                className="w-full py-3 rounded-xl bg-[#2868e8] hover:bg-[#1d55c7] text-white font-extrabold text-[13px] shadow-sm transition-all"
              >
                Acknowledge Milestone Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
