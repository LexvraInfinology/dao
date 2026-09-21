"use client";

import React from "react";

export function AboutMovementSection() {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 bg-[#F0F4F8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Narrative & Metrics */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Tagline matching Figma */}
            <span className="text-[#2563EB] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">
              ABOUT US
            </span>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-[#0A1628] tracking-tight leading-[1.12] mb-4 sm:mb-5">
              We&apos;re not just a platform. <br />
              <span className="text-[#2563EB]">
                We&apos;re a movement.
              </span>
            </h2>

            {/* Paragraphs matching Figma */}
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-[15px] text-[#475569] leading-relaxed mb-6 sm:mb-8">
              <p>
                At EQUORA_Fi, we believe financial sovereignty shouldn&apos;t belong to institutional elites alone. We&apos;ve built an autonomous, peer-to-peer economic engine powered by smart contracts, community governance, and transparent tokenomics.
              </p>
              <p>
                Our 24-hour cycle algorithm and automated referral matrices allow everyday participants to grow their digital assets alongside our 100-seat Genesis DAO Council.
              </p>
            </div>

            {/* Metrics Counter Row matching Figma */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full">
              <div className="p-3 sm:p-4 rounded-2xl bg-white/95 border border-[#E2E8F0] shadow-sm">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0A1628] tracking-tight">
                  120K+
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-[#64748B] mt-1">
                  Active Members
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-white/95 border border-[#E2E8F0] shadow-sm">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0A1628] tracking-tight">
                  63+
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-[#64748B] mt-1">
                  Countries Active
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-white/95 border border-[#E2E8F0] shadow-sm">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#2563EB] tracking-tight">
                  50,480+
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-[#64748B] mt-1">
                  Cycles Completed
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Exact Figma Image Asset with Floating Badges */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/90 shadow-xl shadow-black/5 group">
              <img
                src="/assets/images/Image (Community members collaborating).png"
                alt="EQUORA community collaborating hands with smiling boy"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />

              {/* Top Floating Badge matching Figma: #1 Decentralized */}
              <div className="absolute top-4 right-4 z-20 bg-[#2563EB] text-white text-xs font-bold rounded-xl px-3.5 py-1.5 shadow-lg flex items-center gap-1.5">
                <span>#1</span>
                <span>DECENTRALIZED</span>
              </div>

              {/* Bottom Floating Pill matching Figma: Retention rate */}
              <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 z-20 backdrop-blur-md bg-white/95 border border-white/80 rounded-2xl px-3.5 py-2 shadow-lg flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                <span className="text-xs font-bold text-[#0A1628]">✨ 92% Community Retention</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
