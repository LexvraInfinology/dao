'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Users, Clock } from 'lucide-react';
import { VideoModal } from '@/components/ui/VideoModal';
import { useDaoStats } from '@/hooks/useApi';

export const LandingHero: React.FC = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const { data: stats } = useDaoStats(30_000); // refresh every 30s

  const seatsClaimed = stats?.memberCount ?? 0;
  const isFull = seatsClaimed >= 100;
  const seatStatus = isFull ? 'All Slots Filled' : 'DAO positions are vacant';

  return (
    <section className="relative pt-24 sm:pt-32 lg:pt-36 pb-10 sm:pb-12 lg:pb-16 overflow-hidden min-h-[700px] lg:min-h-[800px] flex items-center bg-[#F0F6FD] border-b border-slate-200/80">
      {/* Desktop Full-Bleed Video Background */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none select-none overflow-hidden max-w-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/landing/hero-bg.png"
          className="w-full h-full object-cover object-[80%_center] xl:object-right max-w-full"
        >
          <source
            src="https://res.cloudinary.com/da9c3vejh/video/upload/v1790674302/Equora_video_no_Gemini_logo_aw95jx.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-y-0 left-0 w-[55%] xl:w-[50%] bg-gradient-to-r from-[#F0F6FD] via-[#F0F6FD]/85 via-40% to-transparent z-0" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/60 to-transparent z-0" />
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-6 text-center lg:text-left">
            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-bold font-inter text-[#0B132B] leading-[1.08] tracking-tight">
              100 Seats.<br />
              <span className="text-[#155EEF]">One Council</span><br />
              A Shared Future.
            </h1>

            <p className="text-[15px] sm:text-[16px] text-[#475467] leading-relaxed font-inter max-w-[500px] mx-auto lg:mx-0">
              Fixed sovereign positions with direct dividend distribution and governance rights.
              Zero referrals, infinite protocol cash flow.
            </p>

            {/* CTAs */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center lg:justify-start gap-3 md:gap-4 pt-2 w-full max-w-sm sm:max-w-md mx-auto lg:mx-0">
              <Link
                href="/dao"
                className="w-full md:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_20px_rgba(21,94,239,0.35)] hover:shadow-[0_12px_24px_rgba(21,94,239,0.45)] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer text-center whitespace-nowrap"
              >
                <span>Claim Council Seat</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => setVideoOpen(true)}
                className="w-full md:w-auto px-6 py-3.5 rounded-full font-medium text-sm text-[#344054] hover:text-[#0B132B] bg-white/80 hover:bg-white border border-slate-200/90 shadow-sm transition-all duration-200 flex items-center justify-center gap-2.5 backdrop-blur-md cursor-pointer whitespace-nowrap"
              >
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[#155EEF]">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
                <span>Watch Protocol Video</span>
              </button>
            </div>

            {/* Mobile visual card with video */}
            <div className="block lg:hidden pt-4 pb-2">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-xl border border-white/80 pointer-events-none select-none">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  poster="/landing/hero-bg.png"
                  className="w-full h-full object-cover"
                >
                  <source
                    src="https://res.cloudinary.com/da9c3vejh/video/upload/v1790674302/Equora_video_no_Gemini_logo_aw95jx.mp4"
                    type="video/mp4"
                  />
                </video>
              </div>
            </div>

            {/* Live stats card with Scarcity Tracker */}
            <div className="pt-3 lg:pt-6 flex justify-center lg:justify-start w-full">
              <div className="p-3.5 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/90 shadow-[0_12px_36px_rgba(15,23,42,0.07)] w-full max-w-[480px] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#155EEF] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0B132B] font-inter">
                      Genesis Seat Scarcity
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-[#EFF8FF] text-[#155EEF] border border-[#D1E9FF]">
                    {seatsClaimed} / 100 Claimed
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className="h-full bg-gradient-to-r from-[#155EEF] via-[#0052FF] to-[#12B76A] rounded-full transition-all duration-1000 ease-out shadow-xs animate-shimmer"
                      style={{ width: `${Math.max(8, Math.min(100, (seatsClaimed / 100) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] font-medium font-inter">
                    <span>{100 - seatsClaimed} Sovereign Seats Remaining</span>
                    <span className="text-[#027A48] font-semibold">Strict 100 Cap</span>
                  </div>
                </div>

                {/* Status Badges Row */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-100/90 text-xs">
                  <div className="flex items-center gap-2 text-[#475467]">
                    <Users className="w-3.5 h-3.5 text-[#155EEF]" />
                    <span className="font-medium">Direct FIFO Allocation</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#027A48] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Instant Rebate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Dynamic Floating Badges over the Hero Artwork */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 h-[540px] relative items-center justify-center">
            {/* Ambient Backlight Aura */}
            <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-[#155EEF]/20 via-[#0052FF]/15 to-transparent blur-3xl pointer-events-none" />

            {/* Floating Glass Badge 1 - Top Right */}
            <div className="absolute top-12 right-4 xl:right-10 p-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_rgba(21,94,239,0.12)] animate-float max-w-[240px]">
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
            <div className="absolute bottom-16 left-0 xl:left-4 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_20px_40px_rgba(15,23,42,0.1)] animate-float max-w-[260px]">
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
        title="EQUORA Protocol Genesis Overview"
      />
    </section>
  );
};
