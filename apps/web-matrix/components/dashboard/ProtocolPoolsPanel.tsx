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
      {/* 1. 4 PROTOCOL POOLS OVERVIEW BANNER (Casino / High-Roller Style)         */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="w-full bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-950 rounded-3xl border border-slate-800 p-5 sm:p-6 lg:p-7 shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10.5px] font-black uppercase tracking-wider">
                Liquidity Vault
              </span>
              <span className="text-slate-400 text-[12px] font-mono">• Zero-Leakage Architecture</span>
            </div>
            <h2 className="text-[22px] sm:text-[26px] font-black text-white tracking-tight mt-1">
              The 4 Closed-Loop Protocol Pools
            </h2>
            <p className="text-[12px] sm:text-[13px] text-slate-400 mt-0.5 max-w-2xl">
              P4, P5 ($60) &amp; P14 ($30) deposits along with unqualified downline spillover stream automatically into 4 autonomous protocol streams.
            </p>
          </div>

          {/* 11th of Month Royalty Countdown Widget */}
          <div className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center sm:items-end flex-shrink-0 shadow-lg">
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase font-bold text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Next Royalty Payout (11th Monthly):</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="bg-purple-900/40 border border-purple-500/30 rounded-lg px-2 py-1 text-center min-w-[38px]">
                <span className="font-mono text-white text-[15px] font-black block leading-none">
                  {String(royaltyCountdown.days).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-purple-300 uppercase font-bold">Days</span>
              </div>
              <span className="text-purple-400 font-bold">:</span>
              <div className="bg-purple-900/40 border border-purple-500/30 rounded-lg px-2 py-1 text-center min-w-[38px]">
                <span className="font-mono text-white text-[15px] font-black block leading-none">
                  {String(royaltyCountdown.hours).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-purple-300 uppercase font-bold">Hrs</span>
              </div>
              <span className="text-purple-400 font-bold">:</span>
              <div className="bg-purple-900/40 border border-purple-500/30 rounded-lg px-2 py-1 text-center min-w-[38px]">
                <span className="font-mono text-white text-[15px] font-black block leading-none">
                  {String(royaltyCountdown.minutes).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-purple-300 uppercase font-bold">Min</span>
              </div>
              <span className="text-purple-400 font-bold">:</span>
              <div className="bg-purple-900/40 border border-purple-500/30 rounded-lg px-2 py-1 text-center min-w-[38px]">
                <span className="font-mono text-amber-300 text-[15px] font-black block leading-none">
                  {String(royaltyCountdown.seconds).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-amber-400 uppercase font-bold">Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 relative z-10">
          {/* Pool 1: DAO Instant Push (35%) */}
          <div className="bg-slate-950/60 border border-sky-500/30 rounded-2xl p-4 flex flex-col justify-between hover:border-sky-400 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-sky-400 uppercase tracking-wider">
                  Pool 01
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black">
                  35% Share
                </span>
              </div>
              <h3 className="text-[17px] font-black text-white leading-tight">
                DAO Instant Push
              </h3>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[18px] font-mono font-black text-sky-300">
                  {poolStats ? poolStats.vault.totalRoutedFromMatrix.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </span>
                <span className="text-[11px] text-sky-400/80 font-bold">TROB Streamed</span>
              </div>
              <p className="text-[11.5px] text-slate-400 mt-1 leading-relaxed">
                Streamed in real-time block execution directly to active Genesis DAO seat members upon every single matrix placement.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Stream Cadence:</span>
              <span className="font-bold text-sky-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Instant Block Stream
              </span>
            </div>
          </div>

          {/* Pool 2: Leadership Royalty (40%) */}
          <div className="bg-slate-950/60 border border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-400 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider">
                  Pool 02
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black">
                  40% Share
                </span>
              </div>
              <h3 className="text-[17px] font-black text-white leading-tight">
                Leadership Royalty
              </h3>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[18px] font-mono font-black text-indigo-300">
                  {poolStats ? poolStats.salaryPool.pendingBalanceTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </span>
                <span className="text-[11px] text-indigo-400/80 font-bold">TROB Pending</span>
              </div>
              <p className="text-[11.5px] text-slate-400 mt-1 leading-relaxed">
                Monthly equity dividend settled on the 11th across Alpha (10%), Prime (15%), Elite (25%), and Crown (50%) ranks.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Settlement:</span>
              <span className="font-bold text-amber-300">11th Monthly (Clean Rank)</span>
            </div>
          </div>

          {/* Pool 3: Quarterly Community Pool (10%) */}
          <div
            onClick={() => setShowBlindBoxModal(true)}
            className="bg-slate-950/60 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-400 transition-all cursor-pointer group hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-purple-400 uppercase tracking-wider">
                  Pool 03
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black">
                  10% Share
                </span>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-black text-white leading-tight group-hover:text-purple-300 transition-colors">
                  Quarterly Community Pool
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-500/30">
                  Locked
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[18px] font-mono font-black text-purple-300">
                  {poolStats ? poolStats.magicBoxPool.balanceTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </span>
                <span className="text-[11px] text-purple-400/80 font-bold">TROB Pooled</span>
              </div>
              <p className="text-[11.5px] text-slate-400 mt-1.5 leading-relaxed">
                Universal 10% protocol pool. Distributed autonomously once an operative completes the 3-month milestone.
              </p>
              <div className="mt-2.5 bg-purple-950/40 rounded-lg p-2 border border-purple-500/20 flex items-center justify-between text-[11px]">
                <span className="text-purple-300 font-medium">3-Mo Milestone:</span>
                <span className="font-mono font-bold text-amber-300">
                  {milestoneCountdown.days}d {milestoneCountdown.hours}h {milestoneCountdown.minutes}m
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Access Condition:</span>
              <span className="font-bold text-purple-300 underline underline-offset-2">
                View Milestone Rules
              </span>
            </div>
          </div>

          {/* Pool 4: Rank Milestone Bounties (15%) */}
          <div className="bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-400 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">
                  Pool 04
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                  15% Share
                </span>
              </div>
              <h3 className="text-[17px] font-black text-white leading-tight">
                Rank Milestones
              </h3>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[18px] font-mono font-black text-emerald-300">
                  {poolStats ? poolStats.rewardPool.balanceTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </span>
                <span className="text-[11px] text-emerald-400/80 font-bold">TROB Reserve</span>
              </div>
              <p className="text-[11.5px] text-slate-400 mt-1 leading-relaxed">
                Instant one-time bounties unlocked upon reaching Slots 3, 6, 9, and 12 at $0 out-of-pocket via the P4+P5 escalation engine.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Progression Bounty:</span>
              <span className="font-bold text-emerald-400">Instant Block Disbursed</span>
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
            <h3 className="text-[19px] sm:text-[22px] font-black text-[#0f172a] tracking-tight">
              Apex Rank Milestone Rewards
            </h3>
            <p className="text-[12px] text-[#64748b]">
              Achieve levels to unlock substantial rank cards, monthly royalties, and governance multipliers.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#2563eb] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mt-2 sm:mt-0 self-start sm:self-auto">
            Autonomous $0 Escalation
          </span>
        </div>

        {/* 4 Big Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {rankCards.map((card) => {
            const isAchieved = card.status === "ACHIEVED";
            return (
              <div
                key={card.level}
                className={`bg-white rounded-3xl border ${
                  isAchieved ? "border-emerald-300 ring-2 ring-emerald-400/30" : "border-[#e8ecf1]"
                } p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#64748b]">
                      Level {card.level.toString().padStart(2, "0")}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isAchieved
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {card.status}
                    </span>
                  </div>

                  {/* Big Card Image */}
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner mb-3.5 group-hover:scale-[1.02] transition-transform duration-300">
                    <Image
                      src={card.imgClean}
                      alt={`${card.rank} Card`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover"
                    />
                    {/* Share Pill on top of card */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white font-black text-[11px] shadow-md">
                      {card.share}
                    </div>
                  </div>

                  {/* Title & Rank */}
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[18px] font-black text-[#0f172a] tracking-tight">
                      {card.rank}
                    </h4>
                    <span className="text-[12px] font-extrabold text-[#2563eb]">
                      Slot {card.level}
                    </span>
                  </div>

                  {/* Requirement */}
                  <p className="text-[11px] text-[#64748b] leading-tight mb-2">
                    {card.requirement}
                  </p>
                </div>

                {/* Benefits Footer */}
                <div className="pt-3 border-t border-[#f1f5f9] mt-2">
                  <span className="text-[9.5px] uppercase font-bold text-[#94a3b8] block">
                    Leadership Benefit:
                  </span>
                  <p className="text-[11px] font-semibold text-[#0f172a] mt-0.5 leading-snug">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#180d2c] via-[#0f071d] to-[#0a0414] border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/80 text-white">
            {/* Close Button */}
            <button
              onClick={() => setShowBlindBoxModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header with Protocol Icon */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 mb-3 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 p-0.5 shadow-xl shadow-purple-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-[#180d2c] rounded-[14px] flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-black uppercase tracking-wider mb-2">
                Protocol Pool 03 • 10% Reserve
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                Quarterly Community Pool Milestone
              </h3>
              <p className="text-[13px] text-purple-200/80 mt-1.5 max-w-md">
                Accessible strictly upon achieving the <span className="text-amber-300 font-bold">3-Month Protocol Milestone</span>. 10% of all matrix protocol liquidity is continuously pooled into this autonomous reward vault.
              </p>
            </div>

            {/* 3-Month Countdown Card */}
            <div className="mt-5 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-purple-300 font-bold">
                  Time Remaining to 3-Month Milestone
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  LOCKED
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-black/40 border border-purple-500/20">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">{milestoneCountdown.days}</div>
                  <div className="text-[9px] text-purple-300/70 font-semibold uppercase">Days</div>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-purple-500/20">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">{milestoneCountdown.hours}</div>
                  <div className="text-[9px] text-purple-300/70 font-semibold uppercase">Hours</div>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-purple-500/20">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">{milestoneCountdown.minutes}</div>
                  <div className="text-[9px] text-purple-300/70 font-semibold uppercase">Mins</div>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-purple-500/20">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{milestoneCountdown.seconds}</div>
                  <div className="text-[9px] text-purple-300/70 font-semibold uppercase">Secs</div>
                </div>
              </div>
            </div>

            {/* Odds & Rewards Table */}
            <div className="mt-4 p-3.5 rounded-2xl bg-black/30 border border-purple-500/20 space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-purple-300 font-bold block mb-1">
                Provable Reward Distribution
              </span>
              <div className="flex items-center justify-between text-[12px] py-1 border-b border-purple-500/10">
                <span className="text-slate-300 font-medium">85% Common Tier</span>
                <span className="font-mono font-bold text-white">$0.50 USD</span>
              </div>
              <div className="flex items-center justify-between text-[12px] py-1 border-b border-purple-500/10">
                <span className="text-purple-300 font-medium">10% Active Boost (2+ Directs)</span>
                <span className="font-mono font-bold text-purple-200">$0.80 USD</span>
              </div>
              <div className="flex items-center justify-between text-[12px] py-1 border-b border-purple-500/10">
                <span className="text-sky-300 font-medium">3% Elite Milestone Tier</span>
                <span className="font-mono font-bold text-sky-200">$1.20 USD</span>
              </div>
              <div className="flex items-center justify-between text-[12px] py-1">
                <span className="text-amber-400 font-bold">2% Grand Apex Jackpot</span>
                <span className="font-mono font-black text-amber-300">$5.00 USD</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowBlindBoxModal(false)}
                className="w-full py-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-extrabold text-[13px] transition-all"
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
