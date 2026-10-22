"use client";

import React from "react";
import Image from "next/image";

export function BlindBoxSection() {
  return (
    <section
      id="blind-box-section"
      className="relative w-full py-16 sm:py-20 lg:py-24 bg-[#f8fafc] overflow-hidden select-none"
    >
      {/* Soft Ambient Background Glow behind 3D Mystery Box */}
      <div
        className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[750px] h-[480px] sm:h-[540px] pointer-events-none rounded-full blur-[85px] opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(191,219,254,0.65) 0%, rgba(219,234,254,0.28) 45%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===================== 1. HEADER ===================== */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <p className="text-[11px] sm:text-[12px] font-extrabold tracking-[0.24em] text-[#2563eb] uppercase mb-2 sm:mb-2.5">
            COMMUNITY REWARDS
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-[#0b132b] tracking-tight leading-[1.12] mb-3 sm:mb-3.5 whitespace-normal sm:whitespace-nowrap">
            Magic Blind Box. <span className="text-[#2563eb]">Every Quarter.</span>
          </h2>
          <p className="text-slate-500 font-normal text-sm sm:text-[14.5px] leading-relaxed max-w-xl mx-auto">
            An automated community reward pool built into the protocol. 100% of eligible
            members receive a mystery reward via an on-chain draw.
          </p>
        </div>

        {/* ===================== 2. HERO ROW (Current Pool Card & 3D Magic Blind Box) ===================== */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-16 max-w-[920px] mx-auto">
          {/* Left Card: CURRENT POOL */}
          <div className="w-full max-w-[340px] sm:max-w-[360px] lg:w-[340px] xl:w-[360px] bg-white rounded-[24px] p-6 sm:p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] border border-slate-100 z-10 shrink-0 order-2 lg:order-1">
            {/* Top row badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-[6px] bg-blue-50 text-[#2563eb] flex items-center justify-center border border-blue-100/80">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M18 12h.01" />
                  <path d="M6 12h.01" />
                </svg>
              </div>
              <span className="text-[11px] font-extrabold text-slate-400 tracking-[0.08em] uppercase">
                CURRENT POOL
              </span>
            </div>

            {/* Big Value */}
            <div className="flex items-baseline">
              <span className="text-[32px] sm:text-[36px] font-black text-[#0b132b] tracking-tight leading-none">
                125,420
              </span>
              <span className="text-[14px] font-bold text-slate-400 ml-1.5 uppercase">
                TROB
              </span>
            </div>

            {/* Subtext */}
            <p className="text-[12.5px] font-bold text-[#2563eb] mt-1.5 leading-snug">
              10% of all platform deposits
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-4">
              <div className="bg-[#2563eb] h-full rounded-full w-[72%]" />
            </div>

            {/* Progress Status Row */}
            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-slate-400 font-medium">
                  Updates in real-time
                </span>
              </div>
              <span className="text-[11px] font-black text-[#0b132b]">
                72% Full
              </span>
            </div>

            {/* Bottom: Avatars & Eligible Count */}
            <div className="flex items-center mt-6 pt-1">
              <div className="flex items-center -space-x-2 shrink-0">
                <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                  <Image
                    src="/blindbox/avatar-redhead.jpg"
                    alt="Eligible member"
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
                <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                  <Image
                    src="/blindbox/avatar-striped.jpg"
                    alt="Eligible member"
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
                <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                  <Image
                    src="/blindbox/avatar-glasses.jpg"
                    alt="Eligible member"
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="text-[12.5px] font-bold text-slate-600 ml-2.5">
                12,400+ Eligible members
              </span>
            </div>
          </div>

          {/* Right: 3D Magic Blind Box Artwork */}
          <div className="relative flex items-center justify-center w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[480px] xl:max-w-[500px] shrink-0 order-1 lg:order-2">
            <div className="relative w-full aspect-[597/472] transition-transform duration-500 hover:scale-[1.02]">
              <Image
                src="/blindbox/blind-box-3d.png"
                alt="Magic Blind Box"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-contain drop-shadow-[0_20px_38px_rgba(37,99,235,0.18)]"
              />
            </div>
          </div>
        </div>

        {/* ===================== 3. BOTTOM PROCESS BAR (4 Steps) ===================== */}
        <div className="bg-white rounded-[22px] p-4 sm:p-5 lg:px-6 shadow-[0_6px_28px_rgba(15,23,42,0.04)] border border-slate-100 max-w-[1040px] mx-auto mt-12 sm:mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center lg:justify-between gap-4 lg:gap-2">
            {/* Step 1: Pool Funding */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0 border border-blue-100/60">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <ellipse cx="12" cy="6" rx="8" ry="3" />
                  <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
                  <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
                </svg>
              </div>
              <div>
                <h4 className="text-[13.5px] font-black text-[#0b132b] leading-tight">
                  Pool Funding
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  10% of fees redirected
                </p>
              </div>
            </div>

            {/* Divider 1 */}
            <div className="hidden lg:flex items-center justify-center text-slate-300">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            {/* Step 2: Auto-Eligibility */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0 border border-blue-100/60">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h4 className="text-[13.5px] font-black text-[#0b132b] leading-tight">
                  Auto-Eligibility
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Active account status
                </p>
              </div>
            </div>

            {/* Divider 2 */}
            <div className="hidden lg:flex items-center justify-center text-slate-300">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            {/* Step 3: Quarterly Draw */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0 border border-blue-100/60">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
              </div>
              <div>
                <h4 className="text-[13.5px] font-black text-[#0b132b] leading-tight">
                  Quarterly Draw
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  On-chain randomness
                </p>
              </div>
            </div>

            {/* Divider 3 */}
            <div className="hidden lg:flex items-center justify-center text-slate-300">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            {/* Step 4: Mystery Reward (Distinct Highlight Solid Blue Card) */}
            <div className="bg-[#2563eb] text-white rounded-xl px-3.5 py-2.5 flex items-center gap-3 shadow-[0_4px_14px_rgba(37,99,235,0.25)] shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-700/70 text-white flex items-center justify-center shrink-0 border border-blue-400/30">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" />
                  <path d="M19 17v4" />
                  <path d="M3 5h4" />
                  <path d="M17 19h4" />
                </svg>
              </div>
              <div>
                <h4 className="text-[13.5px] font-black text-white leading-tight">
                  Mystery Reward
                </h4>
                <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                  Instant TROB airdrop
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
