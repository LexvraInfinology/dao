"use client";

import React, { useState } from "react";
import Image from "next/image";

export function ExplainerVideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F0F4F8] relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-[#2563EB] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3 block">
            EXPLORE THE ECOSYSTEM
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-[#0A1628] tracking-tight leading-[1.12] mb-3 sm:mb-4">
            A Clearer Look at <br />
            <span className="text-[#2563EB]">
              EQUORA Network.
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#475569] leading-relaxed max-w-xl mx-auto">
            A complete visual walkthrough of how our smart contracts distribute wealth fairly, transparently, and securely.
          </p>
        </div>

        {/* Video Player Card Container with Floating Badges */}
        <div className="relative max-w-4xl mx-auto">
          {/* Floating Badge 1 (Left Top) */}
          <div className="hidden sm:flex absolute -top-4 -left-4 z-20 backdrop-blur-md bg-white/95 border border-white/80 rounded-2xl px-3.5 py-2 shadow-lg items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-[#0F172A]">✨ 24h Auto Cycle</span>
          </div>

          {/* Floating Badge 2 (Left Bottom) */}
          <div className="hidden sm:flex absolute -bottom-3 -left-4 z-20 backdrop-blur-md bg-white/95 border border-white/80 rounded-2xl px-3.5 py-2 shadow-lg items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-xs font-bold text-[#0F172A]">🛡️ 100% Non-Custodial</span>
          </div>

          {/* Floating Badge 3 (Right Middle) */}
          <div className="hidden sm:flex absolute top-1/3 -right-4 z-20 backdrop-blur-md bg-white/95 border border-white/80 rounded-2xl px-3.5 py-2 shadow-lg items-center gap-2.5">
            <span className="text-sm">📈</span>
            <span className="text-xs font-bold text-[#0F172A]">Real-Time APY Updates</span>
          </div>

          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-xl shadow-black/5 bg-slate-900 group">
            {/* Exact Figma Container.png Thumbnail */}
            <img
              src="/assets/images/Container.png"
              alt="EQUORA explainer video lake and sunrise mountains"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
            />

            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

            {/* Center Glowing Play Button matching Figma */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-[#2563EB] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group/btn cursor-pointer border border-white/80"
                aria-label="Play explainer video"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563EB] translate-x-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom CTA Button matching Figma */}
          <div className="mt-8 sm:mt-10 flex justify-center">
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs sm:text-sm tracking-wide shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Join the Movement</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Video Lightbox Modal */}
      {isPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors"
              aria-label="Close video"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-[16/9] w-full flex items-center justify-center bg-slate-900 text-white p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4 text-2xl font-bold">
                  ▶
                </div>
                <h3 className="text-xl font-bold mb-2">EQUORA Protocol Overview</h3>
                <p className="text-slate-400 text-sm max-w-md">
                  Video stream initialized. In production, your hosted MP4 or YouTube embed renders here seamlessly.
                </p>
                <button
                  onClick={() => setIsPlaying(false)}
                  className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
