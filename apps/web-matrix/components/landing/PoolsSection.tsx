"use client";

import React, { useState } from "react";
import Image from "next/image";

interface CardSpec {
  id: string;
  name: string;
  src: string;
  rotation: number;
  offsetXPercent: number; // relative to card width
  offsetYPercent: number; // relative to card height
  zIndex: number;
  glowColor: string;
}

interface PoolTier {
  id: string;
  stepNumber: string;
  name: string;
  tagline: string;
  targetSlot: string;
  monthlyReward: string;
  titleColor: string;
  slotColor: string;
  badgeBorder: string;
  badgeBg: string;
  iconSrc: string;
  activeBorder: string;
  activeRing: string;
}

const CARDS_DECK: CardSpec[] = [
  {
    id: "alpha",
    name: "Alpha Pool",
    src: "/pools/alpha-card-clean.png",
    rotation: -16.5,
    offsetXPercent: -62,
    offsetYPercent: 7,
    zIndex: 10,
    glowColor: "rgba(56,189,248,0.55)",
  },
  {
    id: "prime",
    name: "Prime Pool",
    src: "/pools/prime-card-clean.png",
    rotation: -6.5,
    offsetXPercent: -20,
    offsetYPercent: -2,
    zIndex: 20,
    glowColor: "rgba(168,85,247,0.55)",
  },
  {
    id: "elite",
    name: "Elite Pool",
    src: "/pools/elite-card-clean.png",
    rotation: 3.5,
    offsetXPercent: 18,
    offsetYPercent: -2,
    zIndex: 30,
    glowColor: "rgba(59,130,246,0.55)",
  },
  {
    id: "crown",
    name: "Crown Pool",
    src: "/pools/crown-card-clean.png",
    rotation: 14.5,
    offsetXPercent: 58,
    offsetYPercent: 7,
    zIndex: 40,
    glowColor: "rgba(245,158,11,0.6)",
  },
];

const POOL_TIERS: PoolTier[] = [
  {
    id: "alpha",
    stepNumber: "01",
    name: "Alpha Pool",
    tagline: "Start your journey. Earn as you grow.",
    targetSlot: "Slot 3",
    monthlyReward: "10%",
    titleColor: "text-[#2563eb]",
    slotColor: "text-[#0284c7]",
    badgeBorder: "border-[#7dd3fc]/60",
    badgeBg: "bg-[#f0f9ff]",
    iconSrc: "/pools/alpha-icon.png",
    activeBorder: "border-[#0284c7]",
    activeRing: "ring-[#0284c7]/20",
  },
  {
    id: "prime",
    stepNumber: "02",
    name: "Prime Pool",
    tagline: "Do more. Get more.",
    targetSlot: "Slot 6",
    monthlyReward: "15%",
    titleColor: "text-[#2563eb]",
    slotColor: "text-[#9333ea]",
    badgeBorder: "border-[#d8b4fe]/60",
    badgeBg: "bg-[#faf5ff]",
    iconSrc: "/pools/prime-icon.png",
    activeBorder: "border-[#9333ea]",
    activeRing: "ring-[#9333ea]/20",
  },
  {
    id: "elite",
    stepNumber: "03",
    name: "Elite Pool",
    tagline: "Greater contribution. Greater rewards.",
    targetSlot: "Slot 9",
    monthlyReward: "25%",
    titleColor: "text-[#2563eb]",
    slotColor: "text-[#c026d3]",
    badgeBorder: "border-[#f0abfc]/60",
    badgeBg: "bg-[#fdf4ff]",
    iconSrc: "/pools/elite-icon.png",
    activeBorder: "border-[#c026d3]",
    activeRing: "ring-[#c026d3]/20",
  },
  {
    id: "crown",
    stepNumber: "04",
    name: "Crown Pool",
    tagline: "Lead the change. Lifetime rewards.",
    targetSlot: "Slot 12",
    monthlyReward: "50%",
    titleColor: "text-[#f59e0b]",
    slotColor: "text-[#f59e0b]",
    badgeBorder: "border-[#fde68a]/80",
    badgeBg: "bg-[#fffbeb]",
    iconSrc: "/pools/crown-icon.png",
    activeBorder: "border-[#f59e0b]",
    activeRing: "ring-[#f59e0b]/20",
  },
];

export function PoolsSection() {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  return (
    <section
      id="pools"
      className="w-full relative z-10 scroll-mt-[80px] overflow-hidden pt-20 pb-18 sm:pt-24 sm:pb-22 lg:pt-28 lg:pb-26 bg-[#0d1527]"
    >
      {/* ────────────── FULL CINEMATIC FIGMA BACKGROUND ────────────── */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-[position:left_bottom] sm:bg-[position:center_bottom] lg:bg-center pointer-events-none select-none transition-opacity duration-700"
        style={{
          backgroundImage: "url('/pools/pools-background.jpg')",
        }}
      />

      {/* Subtle top edge blend into page background */}
      <div className="absolute top-0 left-0 right-0 h-10 sm:h-14 bg-gradient-to-b from-[#f1f5f9] via-[#f1f5f9]/60 to-transparent z-[1] pointer-events-none" />

      {/* ────────────── FOREGROUND CONTENT CONTAINER ────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="text-xs sm:text-[13px] font-bold tracking-[0.25em] text-[#0f172a] uppercase text-center mb-2.5 sm:mb-3">
          RANK & REWARDS
        </div>

        {/* Main Title: Climb Higher Earn More. */}
        <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.08] text-center mb-3 sm:mb-4">
          <span className="text-[#0b132b] block">Climb Higher</span>
          <span className="text-[#2563eb] block">Earn More.</span>
        </h2>

        {/* Subtitle - Exact copy and line wrap from Figma */}
        <p className="text-xs sm:text-[14px] text-slate-700 font-medium text-center max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-14 lg:mb-16 px-4 drop-shadow-xs">
          Ranks are not just titles, they are long-term income levels. By reaching
          higher slots,
          <br className="hidden sm:inline" />{" "}
          members unlock monthly passive rewards, global recognition.
        </p>

        {/* ────────────── 2-COLUMN PRESENTATION ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-10 items-center">
          {/* Left Column: Interactive 3D Fanned Cards Deck positioned atop Volcanic Cliff */}
          <div className="lg:col-span-7 flex justify-center lg:justify-start items-center relative select-none lg:-ml-4 xl:-ml-8">
            <div className="relative w-full max-w-[480px] sm:max-w-[540px] lg:max-w-[620px] h-[340px] sm:h-[420px] lg:h-[470px] flex items-center justify-center">
              {CARDS_DECK.map((card) => {
                const isActive = hoveredTier === card.id;

                // When active/hovered: rise up slightly, scale, and cast vivid pool-colored aura
                const xPercent = card.offsetXPercent;
                const yPercent = isActive
                  ? card.offsetYPercent - 8
                  : card.offsetYPercent;
                const scale = isActive ? 1.07 : 1;
                const zIndex = isActive ? 50 : card.zIndex;

                return (
                  <div
                    key={card.id}
                    onMouseEnter={() => setHoveredTier(card.id)}
                    onMouseLeave={() => setHoveredTier(null)}
                    onClick={() =>
                      setHoveredTier((prev) =>
                        prev === card.id ? null : card.id
                      )
                    }
                    className="absolute top-1/2 left-1/2 w-[44%] sm:w-[46%] lg:w-[45%] max-w-[270px] aspect-[1073/1466] cursor-pointer transition-all duration-300 ease-out will-change-transform"
                    style={{
                      transform: `translate(calc(-50% + ${xPercent}%), calc(-50% + ${yPercent}%)) rotate(${card.rotation}deg) scale(${scale})`,
                      zIndex,
                      filter: isActive
                        ? `drop-shadow(0 24px 34px ${card.glowColor}) brightness(1.06)`
                        : "drop-shadow(0 12px 24px rgba(15,23,42,0.22))",
                    }}
                  >
                    <Image
                      src={card.src}
                      alt={card.name}
                      width={1073}
                      height={1466}
                      className="w-full h-full object-contain pointer-events-none select-none"
                      priority
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: 4 Reward Pool Tier Cards */}
          <div className="lg:col-span-5 flex flex-col gap-3.5 sm:gap-4 w-full max-w-[500px] mx-auto lg:mx-0">
            {POOL_TIERS.map((tier) => {
              const isActive = hoveredTier === tier.id;

              return (
                <div
                  key={tier.id}
                  onMouseEnter={() => setHoveredTier(tier.id)}
                  onMouseLeave={() => setHoveredTier(null)}
                  onClick={() =>
                    setHoveredTier((prev) =>
                      prev === tier.id ? null : tier.id
                    )
                  }
                  className={`group bg-white/95 backdrop-blur-md rounded-[20px] p-4 sm:p-5 border transition-all duration-300 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer ${
                    isActive
                      ? `shadow-[0_16px_36px_rgba(37,99,235,0.16)] ${tier.activeBorder} -translate-y-1 ring-2 ${tier.activeRing}`
                      : "shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-white/80 hover:shadow-[0_12px_32px_rgba(37,99,235,0.12)] hover:border-blue-200/80 hover:-translate-y-0.5"
                  }`}
                >
                  {/* Left: Icon Badge + Step & Name */}
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    {/* Badge */}
                    <div
                      className={`w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-2xl border ${tier.badgeBorder} ${tier.badgeBg} flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                      } shadow-xs p-2.5 sm:p-3`}
                    >
                      <Image
                        src={tier.iconSrc}
                        alt={`${tier.name} icon`}
                        width={32}
                        height={32}
                        className="w-full h-full object-contain"
                        priority
                      />
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0">
                      <span className="block text-[11px] font-semibold text-slate-400 tracking-wider leading-none mb-1">
                        {tier.stepNumber}
                      </span>
                      <h3
                        className={`text-[16px] sm:text-[17px] font-extrabold tracking-tight leading-tight ${tier.titleColor}`}
                      >
                        {tier.name}
                      </h3>
                      <p className="text-[11px] sm:text-[12px] text-slate-500 font-normal leading-snug mt-1">
                        {tier.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Right: Slot Target & Monthly Reward */}
                  <div className="text-right shrink-0 flex flex-col items-end justify-center pl-3">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide block leading-none">
                      Target Slot
                    </span>
                    <span
                      className={`text-[13px] sm:text-[14px] font-extrabold leading-none mt-1 block ${tier.slotColor}`}
                    >
                      {tier.targetSlot}
                    </span>

                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide block leading-none mt-2 sm:mt-2.5">
                      Monthly Reward
                    </span>
                    <span className="text-[19px] sm:text-[22px] font-black text-[#2563eb] leading-none mt-1 block">
                      {tier.monthlyReward}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
