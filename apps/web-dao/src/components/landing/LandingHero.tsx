'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Users } from 'lucide-react';
import { VideoModal } from '@/components/ui/VideoModal';

export const LandingHero: React.FC = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section className="relative pt-20 sm:pt-28 lg:pt-36 pb-12 sm:pb-16 lg:pb-20 overflow-hidden min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] flex items-center bg-[#F0F6FD] border-b border-slate-200/80">
      {/* Full-Bleed Video Background across ALL Screen Sizes (Desktop + Tablet + Mobile) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden max-w-full">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/landing/hero-bg.webp"
          className="w-full h-full object-cover object-[85%_center] sm:object-[82%_center] lg:object-[80%_center] xl:object-right max-w-full"
        >
          <source
            src="/landing/Timeline_1_4K_kxuhex.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column — Compact, Left-Aligned on ALL Screens so Background Video/Artwork on Right is Clearly Seen */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-3 sm:space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/90 border border-blue-200/90 shadow-sm backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#155EEF] uppercase font-inter">
                Genesis DAO Phase 1
              </span>
            </div>

            {/* Headline — Scaled cleanly on left side without white shade overlay */}
            <h1 className="text-[22px] min-[360px]:text-[26px] sm:text-4xl lg:text-[54px] xl:text-[58px] font-extrabold uppercase text-[#0B132B] leading-[1.1] tracking-tight max-w-[220px] min-[360px]:max-w-[250px] sm:max-w-md lg:max-w-xl text-left drop-shadow-[0_1px_8px_rgba(255,255,255,0.75)]">
              100 Seats.<br />
              <span className="text-[#155EEF]">One Council.</span><br />
              A Shared Future.
            </h1>

            {/* Subtitle — Clean high-contrast text */}
            <p className="text-[11px] min-[360px]:text-xs sm:text-base text-[#1D2939] font-medium leading-relaxed max-w-[210px] min-[360px]:max-w-[240px] sm:max-w-[480px] text-left drop-shadow-[0_1px_6px_rgba(255,255,255,0.85)]">
              Fixed sovereign positions with direct dividend distribution and governance rights.
              Zero referrals, infinite protocol cash flow.
            </p>

            {/* CTAs — Left-aligned, sleek buttons */}
            <div className="flex flex-row items-center justify-start gap-2 min-[360px]:gap-2.5 sm:gap-3 md:gap-4 pt-1 sm:pt-2 w-full max-w-sm sm:max-w-md">
              <Link
                href="/dao"
                className="px-3.5 min-[360px]:px-5 sm:px-8 py-2 min-[360px]:py-2.5 sm:py-3.5 rounded-full font-semibold uppercase text-[10px] min-[360px]:text-[11px] sm:text-xs tracking-[0.04em] sm:tracking-[0.06em] text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_20px_rgba(21,94,239,0.35)] hover:shadow-[0_12px_24px_rgba(21,94,239,0.45)] transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 group cursor-pointer text-center whitespace-nowrap"
              >
                <span>Claim Seat</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>

              <button
                onClick={() => setVideoOpen(true)}
                className="px-3 min-[360px]:px-4 sm:px-6 py-2 min-[360px]:py-2.5 sm:py-3.5 rounded-full font-semibold uppercase text-[10px] min-[360px]:text-[11px] sm:text-xs tracking-[0.04em] sm:tracking-[0.06em] text-[#344054] hover:text-[#0B132B] bg-white/85 hover:bg-white border border-slate-200/90 shadow-xs transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2.5 backdrop-blur-md cursor-pointer whitespace-nowrap"
              >
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-50 flex items-center justify-center text-[#155EEF] shrink-0">
                  <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current ml-0.5" />
                </span>
                <span>Watch</span>
              </button>
            </div>
          </div>

          {/* Right column: Dynamic Floating Badges on Desktop */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 h-[480px] relative items-center justify-center">
            {/* Ambient Backlight Aura */}
            <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-[#155EEF]/20 via-[#0052FF]/15 to-transparent blur-3xl pointer-events-none" />

            {/* Floating Glass Badge 1 - Top Right */}
            <div className="absolute top-10 right-4 xl:right-10 p-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_rgba(21,94,239,0.12)] animate-float max-w-[240px]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EFF8FF] border border-[#D1E9FF] flex items-center justify-center text-[#155EEF] shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#155EEF] font-inter">
                    Council Matrix
                  </div>
                  <div className="text-sm font-bold font-sora text-[#0B132B]">
                    100 Sovereign Seats
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B] font-inter mt-1.5 leading-snug">
                Zero dilution. Lifetime voting rights and automatic dividend pool access.
              </p>
            </div>

            {/* Floating Glass Badge 2 - Bottom Left */}
            <div className="absolute bottom-10 left-0 xl:left-4 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_20px_40px_rgba(15,23,42,0.1)] animate-float max-w-[260px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#027A48] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  Algorithmic Cashback
                </span>
                <span className="text-xs font-mono font-bold text-[#155EEF]">$300 / N</span>
              </div>
              <div className="text-xs font-bold text-[#0B132B] font-inter">
                Instant Smart Contract Return
              </div>
              <p className="text-[10px] text-[#64748B] font-inter mt-1">
                Direct to connected wallet on block finality. No claim fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      <VideoModal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        videoSrc="/landing/Timeline_1_4K_kxuhex.mp4"
        title="EQUORA Protocol Genesis Overview"
      />
    </section>
  );
};
