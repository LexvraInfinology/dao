"use client";

import React from "react";
import Image from "next/image";

export function HowItWorksSection() {
  return (
    <section
      id="about"
      className="w-full pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-18 bg-[#f1f5f9] relative z-10 scroll-mt-[70px]"
    >
      <span id="how-it-works" className="sr-only" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#2563eb] mb-3 block">
            ABOUT EQUORA
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-[#0b132b] tracking-tight leading-[1.1] mb-4">
            A Simple <br />
            <span className="text-[#2563eb]">3–Step Journey.</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            From wallet to rewards designed for everyone. Join, get placed in the
            matrix, and watch your network grow while the protocol works for you.
          </p>
        </div>

        {/* 3 Cards Container with horizontal connectors */}
        <div className="relative">
          {/* Desktop Connecting horizontal dotted lines positioned precisely in the gaps */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
            {/* Connector between Card 1 and Card 2 */}
            <div
              className="absolute top-[44%] w-8 -translate-y-1/2 flex items-center justify-center"
              style={{ left: "calc((100% - 4rem) / 3)" }}
            >
              <svg className="w-8 h-4 overflow-visible" viewBox="0 0 32 16" fill="none">
                <path
                  d="M0 8 C 8 4, 18 4, 25 8"
                  stroke="#93c5fd"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <circle cx="26" cy="8" r="3" fill="#2563eb" />
              </svg>
            </div>

            {/* Connector between Card 2 and Card 3 */}
            <div
              className="absolute top-[44%] w-8 -translate-y-1/2 flex items-center justify-center"
              style={{ left: "calc(((100% - 4rem) / 3) * 2 + 2rem)" }}
            >
              <svg className="w-8 h-4 overflow-visible" viewBox="0 0 32 16" fill="none">
                <path
                  d="M0 8 C 8 4, 18 4, 25 8"
                  stroke="#93c5fd"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <circle cx="26" cy="8" r="3" fill="#2563eb" />
              </svg>
            </div>
          </div>

          {/* 3 Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
            {/* ── Card 01: Connect Wallet ── */}
            <div className="bg-white rounded-[32px] p-7 sm:p-9 border border-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative group">
              <span className="absolute top-7 left-8 text-base font-semibold text-slate-400">
                01
              </span>

              {/* 3D Illustration */}
              <div className="w-44 h-36 flex items-center justify-center relative my-2">
                <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-xl group-hover:bg-blue-400/20 transition-all" />
                <Image
                  src="/Container (2).png"
                  alt="Connect Wallet Illustration"
                  width={192}
                  height={169}
                  className="w-32 sm:w-36 h-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <h3 className="text-xl font-bold text-[#0b132b] mb-2 mt-2">
                Connect Wallet
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mb-7 flex-1 max-w-[270px]">
                Link your Web3 wallet (MetaMask, Rabby, Trust, WalletConnect) and
                get started in seconds.
              </p>

              {/* Bottom Pill */}
              <div className="w-full py-2.5 px-4 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-700 text-xs font-semibold inline-flex items-center justify-between transition-colors">
                <div className="inline-flex items-center gap-2 text-slate-700">
                  <svg
                    className="w-3.5 h-3.5 text-[#2563eb]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Secure & Non–Custodial</span>
                </div>
                <span className="text-[#2563eb] text-sm font-bold">→</span>
              </div>
            </div>

            {/* ── Card 02: Activate Slot 1 ── */}
            <div className="bg-white rounded-[32px] p-7 sm:p-9 border border-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative group">
              <span className="absolute top-7 left-8 text-base font-semibold text-slate-400">
                02
              </span>

              {/* 3D Illustration */}
              <div className="w-44 h-36 flex items-center justify-center relative my-2">
                <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-xl group-hover:bg-blue-400/20 transition-all" />
                <Image
                  src="/Container (1).png"
                  alt="Activate Slot 1 Illustration"
                  width={192}
                  height={169}
                  className="w-32 sm:w-36 h-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <h3 className="text-xl font-bold text-[#0b132b] mb-2 mt-2">
                Activate Slot 1
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mb-7 flex-1 max-w-[270px]">
                Make a one-time payment of $30 USDT to join the Matrix. Get your
                unique 5-digit ID.
              </p>

              {/* Bottom Pill */}
              <div className="w-full py-2.5 px-4 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-700 text-xs font-semibold inline-flex items-center justify-between transition-colors">
                <div className="inline-flex items-center gap-2 text-slate-700">
                  <svg
                    className="w-3.5 h-3.5 text-[#2563eb]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Only $30 to Begin</span>
                </div>
                <span className="text-[#2563eb] text-sm font-bold">→</span>
              </div>
            </div>

            {/* ── Card 03: Build & Progress ── */}
            <div className="bg-white rounded-[32px] p-7 sm:p-9 border border-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative group">
              <span className="absolute top-7 left-8 text-base font-semibold text-slate-400">
                03
              </span>

              {/* 3D Illustration */}
              <div className="w-44 h-36 flex items-center justify-center relative my-2">
                <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-xl group-hover:bg-blue-400/20 transition-all" />
                <Image
                  src="/Container.png"
                  alt="Build & Progress Illustration"
                  width={192}
                  height={169}
                  className="w-32 sm:w-36 h-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <h3 className="text-xl font-bold text-[#0b132b] mb-2 mt-2">
                Build & Progress
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mb-7 flex-1 max-w-[270px]">
                Get placed in a 14-node matrix, earn rewards, and unlock higher
                slots automatically.
              </p>

              {/* Bottom Pill */}
              <div className="w-full py-2.5 px-4 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-700 text-xs font-semibold inline-flex items-center justify-between transition-colors">
                <div className="inline-flex items-center gap-2 text-slate-700">
                  <svg
                    className="w-3.5 h-3.5 text-[#2563eb]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                    />
                  </svg>
                  <span>Grow Your Network</span>
                </div>
                <span className="text-[#2563eb] text-sm font-bold">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 Feature Highlights Horizontal Bar (Matching Figma exactly) ── */}
        <div className="mt-10 sm:mt-12 bg-white rounded-2xl lg:rounded-full border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] py-4 px-6 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-0 lg:divide-x lg:divide-slate-200/70">
          {/* Feature 1: Global Community */}
          <div className="flex items-center gap-3.5 lg:px-3.5 xl:px-6">
            <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#2563eb] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-[#0b132b] leading-tight">
                Global Community
              </div>
              <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                People grow together
              </div>
            </div>
          </div>

          {/* Feature 2: Automated System */}
          <div className="flex items-center gap-3.5 lg:px-3.5 xl:px-6">
            <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#2563eb] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-[#0b132b] leading-tight">
                Automated System
              </div>
              <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                Powered by smart contracts
              </div>
            </div>
          </div>

          {/* Feature 3: Transparent & Secure */}
          <div className="flex items-center gap-3.5 lg:px-3.5 xl:px-6">
            <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#2563eb] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-[#0b132b] leading-tight">
                Transparent & Secure
              </div>
              <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                On–chain, always verifiable
              </div>
            </div>
          </div>

          {/* Feature 4: Real Opportunities */}
          <div className="flex items-center gap-3.5 lg:px-3.5 xl:px-6">
            <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#2563eb] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 20V10" />
                <path d="M12 20V4" />
                <path d="M6 20v-6" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-[#0b132b] leading-tight">
                Real Opportunities
              </div>
              <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                Turn connections into rewards
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
