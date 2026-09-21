"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";

interface HeroSectionProps {
  onJoinMovement: () => void;
  onWatchStory: () => void;
}

export function HeroSection({ onJoinMovement, onWatchStory }: HeroSectionProps) {
  const { isConnected } = useAccount();

  const features = [
    {
      title: "People First",
      description: "A community built on trust and collaboration.",
      icon: (
        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: "Transparent by Design",
      description: "Every step is clear and verifiable on-chain.",
      icon: (
        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
    },
    {
      title: "Real Opportunities",
      description: "A structured path to grow and achieve more.",
      icon: (
        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      ),
    },
    {
      title: "A Better Tomorrow",
      description: "Empowering individuals to create a more inclusive world.",
      icon: (
        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative w-full min-h-screen lg:h-screen lg:max-h-[840px] xl:max-h-[960px] 2xl:max-h-[1024px] bg-[#F0F4F8] overflow-hidden pt-14 sm:pt-16 lg:pt-18 xl:pt-20 pb-3 sm:pb-4 lg:pb-5 flex flex-col justify-between">
      {/* ========== EXACT FIGMA HERO BACKGROUND (BOY + PUPPY OVER CANADIAN HORIZON) ========== */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <img
          src="/assets/images/ChatGPT Image Sep 12, 2026, 12_23_00 PM 1.png"
          alt="EQUORA Boy with backpack and dog overlooking city horizon"
          className="w-full h-full object-cover object-[72%_center] lg:object-center"
        />

        {/* Soft left gradient matching Figma light mode readability */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(240,244,248,0.96) 0%, rgba(240,244,248,0.88) 32%, rgba(240,244,248,0.5) 52%, rgba(240,244,248,0.12) 70%, rgba(240,244,248,0) 85%)",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#F0F4F8]/40 to-transparent z-10" />
      </div>

      {/* ========== FLOATING BADGES MATCHING FIGMA ========== */}
      {/* Badge 1: Different people. Same vision. */}
      <div className="hidden md:flex absolute top-[16%] lg:top-[17%] left-[48%] lg:left-[51%] xl:left-[52%] z-20 backdrop-blur-md bg-white/95 border border-white/80 rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-lg shadow-black/5 items-center gap-2 hover:-translate-y-0.5 transition-all duration-300">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-xs font-bold text-[#0F172A]">Different people.</p>
          <p className="text-[11px] sm:text-xs font-medium text-slate-600">Same vision.</p>
        </div>
      </div>

      {/* Badge 2: A stronger tomorrow, together. */}
      <div className="hidden lg:flex absolute top-[28%] lg:top-[30%] right-[3%] xl:right-[5%] z-20 backdrop-blur-md bg-white/95 border border-white/80 rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-lg shadow-black/5 items-center gap-2 hover:-translate-y-0.5 transition-all duration-300">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-xs font-bold text-[#0F172A]">A stronger</p>
          <p className="text-[11px] sm:text-xs font-medium text-slate-600">tomorrow, together.</p>
        </div>
      </div>

      {/* ========== MAIN HERO CONTENT ========== */}
      <div className="relative z-20 max-w-[1440px] mx-auto w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-1 sm:pt-2">
        <div className="max-w-full sm:max-w-[480px] lg:max-w-[520px] flex flex-col items-start text-left">
          {/* Tagline */}
          <div className="text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] text-[#475569] uppercase mb-1.5 sm:mb-2 leading-tight">
            PEOPLE • PROGRESS • A BRIGHTER TOMORROW
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[48px] 2xl:text-[58px] font-extrabold text-[#0A1628] tracking-[-0.03em] leading-[1.08] mb-2 sm:mb-2.5">
            Same People. <br />
            <span className="text-[#2563EB]">Bigger</span> <br />
            Opportunities.
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-[13px] lg:text-sm text-[#475569] leading-snug max-w-full sm:max-w-[400px] mb-3 sm:mb-4 lg:mb-5">
            EQUORA_Fi is a global community built on trust, transparency and shared growth.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mb-3 sm:mb-4 lg:mb-5 w-full sm:w-auto">
            {isConnected ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
              >
                <span>Launch App</span>
                <span className="text-sm">→</span>
              </Link>
            ) : (
              <button
                onClick={onJoinMovement}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Join the Movement</span>
                <span className="text-sm">→</span>
              </button>
            )}

            <button
              onClick={onWatchStory}
              className="inline-flex items-center justify-center gap-2 px-2.5 py-1.5 text-slate-700 font-medium text-xs sm:text-sm hover:text-slate-900 transition-colors cursor-pointer"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-blue-600 text-[10px]">
                ▶
              </span>
              <span>Watch Our Story</span>
            </button>
          </div>

          {/* Stats Row with Vertical Dividers matching Figma */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-7">
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0A1628] tracking-tight leading-none">
                12
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.14em] mt-0.5 sm:mt-1">
                LEVELS
              </div>
            </div>

            <div className="w-px h-6 sm:h-7 bg-[#CBD5E1]/80" />

            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0A1628] tracking-tight leading-none">
                4
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.14em] mt-0.5 sm:mt-1">
                POOLS
              </div>
            </div>

            <div className="w-px h-6 sm:h-7 bg-[#CBD5E1]/80" />

            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0A1628] tracking-tight leading-none">
                1
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.14em] mt-0.5 sm:mt-1">
                GLOBAL COMMUNITY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 4-FEATURE CARDS DOCK MATCHING FIGMA ========== */}
      <div id="features" className="relative z-20 max-w-[1440px] mx-auto w-full px-4 sm:px-8 lg:px-12 xl:px-16 mt-3 sm:mt-4">
        <div className="w-full rounded-2xl lg:rounded-3xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md p-2.5 sm:p-3 lg:p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2 sm:px-3 lg:px-3.5 transition-all duration-200 hover:bg-blue-50/30 rounded-xl"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xs sm:text-[13px] font-bold text-[#0F172A] leading-tight">
                  {item.title}
                </h3>
                <p className="text-[10.5px] sm:text-[11.5px] text-[#64748B] leading-tight mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
