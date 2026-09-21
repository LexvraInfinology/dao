"use client";

import React, { useState } from "react";

interface TierLevel {
  id: number;
  name: string;
  badge: string;
  multiplier: string;
  slots: string;
  accent: string;
  borderAccent: string;
  bgGradient: string;
  features: string[];
}

const TIERS: TierLevel[] = [
  {
    id: 1,
    name: "Starter",
    badge: "Level 1–3",
    multiplier: "1.0x Base",
    slots: "Slots 1 to 3",
    accent: "text-blue-600",
    borderAccent: "border-blue-500",
    bgGradient: "from-blue-500/10 via-indigo-500/5 to-white",
    features: [
      "One-time $30 entry activation in TROB",
      "700% perpetual cash profit per slot cycle",
      "Autonomous P4 + P5 auto-upgrade pooling",
      "Eligible for $1 to $100 random drops",
    ],
  },
  {
    id: 2,
    name: "Silver",
    badge: "Level 4–6",
    multiplier: "1.2x Boost",
    slots: "Slots 4 to 6",
    accent: "text-slate-700",
    borderAccent: "border-slate-400",
    bgGradient: "from-slate-400/10 via-blue-500/5 to-white",
    features: [
      "All Starter tier privileges",
      "1.2x boosted milestone reward share",
      "Priority matrix placement queue",
      "Access to community growth vault",
    ],
  },
  {
    id: 3,
    name: "Gold",
    badge: "Level 7–9",
    multiplier: "1.5x Multiplier",
    slots: "Slots 7 to 9",
    accent: "text-amber-600",
    borderAccent: "border-amber-500",
    bgGradient: "from-amber-500/10 via-yellow-500/5 to-white",
    features: [
      "All Silver tier privileges",
      "Alpha Monthly Salary Pool qualification (11th payout)",
      "1.5x protocol yield multiplier",
      "Accelerated 3-Month Magic Box unlocks",
    ],
  },
  {
    id: 4,
    name: "Platinum",
    badge: "Level 10–11",
    multiplier: "2.0x Multiplier",
    slots: "Slots 10 to 11",
    accent: "text-cyan-600",
    borderAccent: "border-cyan-500",
    bgGradient: "from-cyan-500/10 via-blue-500/5 to-white",
    features: [
      "All Gold tier privileges",
      "Prime & Elite Monthly Salary Pool qualification",
      "2.0x instant wallet push earnings",
      "Dedicated network routing nodes",
    ],
  },
  {
    id: 5,
    name: "VIP Crown",
    badge: "Level 12 (Apex)",
    multiplier: "2.5x Max Multiplier",
    slots: "Full Level 12 Access",
    accent: "text-purple-600",
    borderAccent: "border-purple-500",
    bgGradient: "from-purple-500/15 via-indigo-500/10 to-white",
    features: [
      "100-Seat Genesis DAO Council eligibility",
      "Crown Monthly Salary Pool (Top 25% allocation)",
      "Perpetual 15% share of all network matrix recycles",
      "2.5x maximum dynamic rate multiplier",
    ],
  },
];

export function TierLevelsSection() {
  const tiers = [
    {
      name: "Silver Titan",
      level: "Matrix Level 1–3",
      apy: "12% APY",
      entry: "$30 Entry",
      accent: "text-[#38BDF8]",
      borderAccent: "border-[#38BDF8]/30",
      bgBadge: "bg-sky-50 text-sky-700",
      icon: (
        <svg className="w-6 h-6 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      name: "Sapphire Titan",
      level: "Matrix Level 4–6",
      apy: "24% APY",
      entry: "$100 Entry",
      accent: "text-[#2563EB]",
      borderAccent: "border-[#2563EB]/30",
      bgBadge: "bg-blue-50 text-blue-700",
      icon: (
        <svg className="w-6 h-6 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      name: "Diamond Titan",
      level: "Matrix Level 7–9",
      apy: "48% APY",
      entry: "$500 Entry",
      accent: "text-[#A855F7]",
      borderAccent: "border-[#A855F7]/30",
      bgBadge: "bg-purple-50 text-purple-700",
      icon: (
        <svg className="w-6 h-6 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: "Golden Sovereign (DAO)",
      level: "Genesis DAO Seat",
      apy: "63% APY",
      entry: "$1,000 Entry",
      accent: "text-[#F59E0B]",
      borderAccent: "border-[#F59E0B]/30",
      bgBadge: "bg-amber-50 text-amber-700",
      icon: (
        <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="levels" className="py-20 sm:py-24 lg:py-28 bg-[#F0F4F8] relative overflow-hidden">
      {/* Background: Exact Figma Celestial Floating Crystals & Clouds */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40">
        <img
          src="/assets/images/image 27.png"
          alt="EQUORA celestial tier background with crystals"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4F8] via-transparent to-[#F0F4F8]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-[#2563EB] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3 block">
            TIER REWARDS &amp; MATRIX
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-[#0A1628] tracking-tight leading-[1.12] mb-3 sm:mb-4">
            Climb Higher <br />
            <span className="text-[#2563EB]">
              Earn More.
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#475569] leading-relaxed max-w-xl mx-auto">
            Unlock higher matrix tiers, boosted staking yields, and exclusive DAO voting rights as you advance through our decentralized membership levels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: 4 Glowing 3D Collectible NFT Cards matching Figma */}
          <div className="lg:col-span-6 relative flex items-center justify-center py-6">
            <div className="relative flex items-center justify-center w-full max-w-[540px]">
              {/* Card 1: Sapphire */}
              <div className="relative -mr-16 sm:-mr-20 transform -rotate-6 hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-300 w-36 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-blue-400/40 cursor-pointer">
                <img
                  src="/assets/images/image 23.png"
                  alt="EQUORA Sapphire NFT Tier Card"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Card 2: Amethyst */}
              <div className="relative -mr-16 sm:-mr-20 transform -rotate-3 hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-300 w-36 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-400/40 cursor-pointer z-10">
                <img
                  src="/assets/images/image 24.png"
                  alt="EQUORA Amethyst NFT Tier Card"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Card 3: Diamond */}
              <div className="relative -mr-16 sm:-mr-20 transform rotate-3 hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-300 w-36 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20 border border-cyan-400/40 cursor-pointer z-20">
                <img
                  src="/assets/images/image 25.png"
                  alt="EQUORA Diamond NFT Tier Card"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Card 4: Golden Sovereign */}
              <div className="relative transform rotate-6 hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-300 w-36 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/25 border border-amber-400/50 cursor-pointer z-30">
                <img
                  src="/assets/images/image 26.png"
                  alt="EQUORA Golden Sovereign NFT Tier Card"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* Right Column: 4 Tier Cards Stacked matching Figma */}
          <div className="lg:col-span-6 space-y-4">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-md shadow-black/5 hover:shadow-xl hover:border-blue-300 transition-all duration-200 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {tier.icon}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0A1628] leading-tight">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                      {tier.level}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-lg sm:text-xl font-black ${tier.accent} leading-tight`}>
                    {tier.apy}
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${tier.bgBadge}`}>
                    {tier.entry}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
