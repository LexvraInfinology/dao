"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles, X, CheckCircle2, Shield, Award, Trophy, Crown, ArrowRight } from "lucide-react";

export type RankTierName = "ALPHA" | "PRIME" | "ELITE" | "CROWN";

export interface RankAchievedModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank: RankTierName;
  milestones: number;
}

const RANK_CONFIG: Record<RankTierName, {
  title: string;
  level: string;
  milestonesNeeded: number;
  image: string;
  benefits: string;
  royaltyShare: string;
  gradient: string;
  glowColor: string;
  badgeBg: string;
  textColor: string;
}> = {
  ALPHA: {
    title: "ALPHA RANK ACHIEVED",
    level: "Level 3 Mastery • 42 Nodes Fulfilled",
    milestonesNeeded: 42,
    image: "/pools/alpha-card-clean.png",
    benefits: "10% Monthly Leadership Royalty on 11th + Instant Milestone Bounty",
    royaltyShare: "10% Equity Share",
    gradient: "from-blue-600 to-cyan-500",
    glowColor: "rgba(37, 99, 235, 0.4)",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    textColor: "text-blue-600",
  },
  PRIME: {
    title: "PRIME RANK ACHIEVED",
    level: "Level 6 Mastery • 84 Nodes Fulfilled",
    milestonesNeeded: 84,
    image: "/pools/prime-card-clean.png",
    benefits: "15% Monthly Regional Royalty on 11th + Instant Regional Bounty",
    royaltyShare: "15% Equity Share",
    gradient: "from-emerald-600 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.4)",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    textColor: "text-emerald-600",
  },
  ELITE: {
    title: "ELITE RANK ACHIEVED",
    level: "Level 9 Mastery • 126 Nodes Fulfilled",
    milestonesNeeded: 126,
    image: "/pools/elite-card-clean.png",
    benefits: "25% Monthly Executive Royalty on 11th + Instant Executive Bounty",
    royaltyShare: "25% Equity Share",
    gradient: "from-amber-600 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.4)",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    textColor: "text-amber-600",
  },
  CROWN: {
    title: "CROWN APEX ACHIEVED",
    level: "Level 12 Mastery • 168 Nodes Fulfilled",
    milestonesNeeded: 168,
    image: "/pools/crown-card-clean.png",
    benefits: "50% Dominant Monthly Apex Royalty on 11th + Apex Milestone Bounty",
    royaltyShare: "50% Equity Share",
    gradient: "from-purple-600 to-fuchsia-500",
    glowColor: "rgba(168, 85, 247, 0.4)",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    textColor: "text-purple-600",
  },
};

export function RankAchievedModal({ isOpen, onClose, rank, milestones }: RankAchievedModalProps) {
  const [animStage, setAnimStage] = useState<"idle" | "drop" | "settled">("idle");

  useEffect(() => {
    if (isOpen) {
      setAnimStage("idle");
      const t1 = setTimeout(() => setAnimStage("drop"), 50);
      const t2 = setTimeout(() => setAnimStage("settled"), 700);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setAnimStage("idle");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cfg = RANK_CONFIG[rank] || RANK_CONFIG.ALPHA;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Celebration Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Milestone Attainment Verified</span>
        </div>

        {/* Dropping Transparent Card Image */}
        <div className="relative w-48 h-60 mx-auto my-3 flex items-center justify-center">
          <div
            className={`transition-all duration-700 ease-out transform ${
              animStage === "idle"
                ? "-translate-y-96 scale-75 opacity-0"
                : animStage === "drop"
                ? "translate-y-2 scale-105 opacity-100"
                : "translate-y-0 scale-100 opacity-100"
            }`}
            style={{
              filter: `drop-shadow(0 20px 30px ${cfg.glowColor})`,
            }}
          >
            <Image
              src={cfg.image}
              alt={cfg.title}
              width={180}
              height={225}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Title & Level Details */}
        <h2 className="text-[20px] sm:text-[22px] font-black text-slate-900 tracking-tight mt-2">
          {cfg.title}
        </h2>
        <p className="text-[12px] sm:text-[13px] font-bold text-slate-500 mt-1">
          {cfg.level}
        </p>

        {/* Benefit Highlight Box */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Protocol Allocation Unlocked
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${cfg.badgeBg}`}>
              {cfg.royaltyShare}
            </span>
          </div>
          <p className="text-[12px] font-semibold text-slate-700 leading-snug">
            {cfg.benefits}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Verified Downline Milestones:</span>
            <span className="font-mono font-bold text-slate-900">{milestones} / {cfg.milestonesNeeded} IDs ✓</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full mt-5 py-3.5 px-4 rounded-xl text-white font-extrabold text-[13.5px] shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r ${cfg.gradient} hover:opacity-95`}
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

