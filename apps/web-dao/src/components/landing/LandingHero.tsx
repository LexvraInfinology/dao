'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, Users, Clock } from 'lucide-react';
import { VideoModal } from '@/components/ui/VideoModal';

export const LandingHero: React.FC = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="relative pt-24 sm:pt-32 lg:pt-36 pb-16 lg:pb-24 overflow-hidden min-h-[750px] lg:min-h-[880px] flex items-center bg-[#F0F6FD]">
      {/* Desktop Full-Bleed Panoramic Artwork Background */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/landing/hero-bg.png"
          alt="EQUORA Genesis Council Platform"
          fill
          priority
          className="object-cover object-[80%_center] xl:object-right"
        />
        {/* Soft atmospheric gradient on left to guarantee text readability without hiding the artwork */}
        <div className="absolute inset-y-0 left-0 w-[55%] xl:w-[50%] bg-gradient-to-r from-[#F0F6FD] via-[#F0F6FD]/85 via-40% to-transparent z-0" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/60 to-transparent z-0" />
      </div>

      <div className="max-w-[1360px] mx-auto px-3.5 sm:px-8 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Content */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#D0E2FF] shadow-[0_2px_8px_rgba(21,94,239,0.08)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#155EEF] animate-pulse" />
              <span className="text-[11px] sm:text-[12px] font-semibold tracking-wider text-[#155EEF] font-inter uppercase">
                Genesis DAO Phase 1
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-bold font-inter text-[#0B132B] leading-[1.06] tracking-tight">
              100 Seats.<br />
              <span className="text-[#155EEF]">One Council</span><br />
              A Shared Future.
            </h1>

            {/* Subtitle */}
            <p className="text-[15px] sm:text-[16px] text-[#475467] leading-relaxed font-inter max-w-[500px] mx-auto lg:mx-0">
              Fixed sovereign positions with direct dividend distribution and governance rights. Zero referrals, infinite protocol cash flow.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/dao"
                className="w-full md:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_20px_rgba(21,94,239,0.35)] hover:shadow-[0_12px_24px_rgba(21,94,239,0.45)] transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Claim Council Seat</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => setVideoOpen(true)}
                className="w-full md:w-auto px-6 py-3.5 rounded-full font-medium text-sm text-[#344054] hover:text-[#0B132B] bg-white/80 hover:bg-white border border-slate-200/90 shadow-sm transition-all duration-200 flex items-center justify-center gap-2.5 backdrop-blur-md"
              >
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[#155EEF]">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
                <span>Watch Protocol Video</span>
              </button>
            </div>

            {/* Mobile Visual Card */}
            <div className="block lg:hidden pt-4 pb-2">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-xl border border-white/80">
                <Image
                  src="/landing/hero-bg.png"
                  alt="EQUORA Genesis Council Platform"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Bottom Consolidated Capsule Stats Card */}
            <div className="pt-4 lg:pt-8 flex justify-center lg:justify-start">
              <div className="p-2.5 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] flex items-center divide-x divide-slate-200/80 w-full sm:w-auto max-w-[340px] sm:max-w-none">
                {/* Stat 1 */}
                <div className="flex items-center gap-2 sm:gap-3 pr-2.5 sm:pr-6 flex-1 sm:flex-initial min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EFF6FF] border border-[#D1E9FF] flex items-center justify-center text-[#155EEF] shrink-0">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-sm sm:text-lg font-bold font-sora text-[#0B132B] tracking-tight whitespace-nowrap">
                      14 <span className="text-[10px] sm:text-xs font-normal text-slate-400">/ 100</span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#64748B] font-medium whitespace-nowrap">
                      Seats Remaining
                    </div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-2 sm:gap-3 pl-2.5 sm:pl-6 flex-1 sm:flex-initial min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#ECFDF3] border border-[#D1FADF] flex items-center justify-center text-[#027A48] shrink-0">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs sm:text-base font-bold font-sora text-[#0B132B] tracking-tight leading-snug whitespace-nowrap">
                      Genesis Phase 1
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#027A48] font-medium whitespace-nowrap flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse shrink-0" />
                      <span>Live Countdown</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Spacer for Desktop Background Graphic */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6" />
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
