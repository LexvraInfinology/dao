'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <section className="relative pt-24 sm:pt-32 lg:pt-36 pb-16 lg:pb-24 overflow-hidden min-h-[750px] lg:min-h-[880px] flex items-center bg-[#F0F6FD] border-b border-slate-200/80">
      {/* Desktop Full-Bleed Background */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/landing/hero-bg.png"
          alt="EQUORA Genesis Council Platform"
          fill
          priority
          className="object-cover object-[80%_center] xl:object-right"
        />
        <div className="absolute inset-y-0 left-0 w-[55%] xl:w-[50%] bg-gradient-to-r from-[#F0F6FD] via-[#F0F6FD]/85 via-40% to-transparent z-0" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/60 to-transparent z-0" />
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#D0E2FF] shadow-[0_2px_8px_rgba(21,94,239,0.08)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#155EEF] animate-pulse" />
              <span className="text-[11px] sm:text-[12px] font-semibold tracking-wider text-[#155EEF] font-inter uppercase">
                Genesis DAO Phase 1
              </span>
            </div>

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
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link
                href="/dao"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_20px_rgba(21,94,239,0.35)] hover:shadow-[0_12px_24px_rgba(21,94,239,0.45)] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer text-center"
              >
                <span>Claim Council Seat</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => setVideoOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full font-medium text-sm text-[#344054] hover:text-[#0B132B] bg-white/80 hover:bg-white border border-slate-200/90 shadow-sm transition-all duration-200 flex items-center justify-center gap-2.5 backdrop-blur-md cursor-pointer"
              >
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[#155EEF]">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
                <span>Watch Protocol Video</span>
              </button>
            </div>

            {/* Mobile visual card */}
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

            {/* Live stats card */}
            <div className="pt-4 lg:pt-8 flex justify-center lg:justify-start">
              <div className="p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] flex flex-col xs:flex-row items-stretch sm:items-center divide-y xs:divide-y-0 xs:divide-x divide-slate-200/80 w-full sm:w-auto max-w-[420px] sm:max-w-none gap-3 xs:gap-0">
                {/* Seat availability status */}
                <div className="flex items-center gap-2.5 sm:gap-3 pr-2 sm:pr-6 pb-2 xs:pb-0 min-w-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${isFull ? 'bg-amber-50 border border-amber-200 text-amber-600' : 'bg-[#EFF6FF] border border-[#D1E9FF] text-[#155EEF]'} flex items-center justify-center shrink-0`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs sm:text-base font-bold font-sora text-[#0B132B] tracking-tight">
                      {seatStatus}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#64748B] font-medium">
                      Council Membership
                    </div>
                  </div>
                </div>

                {/* Phase indicator */}
                <div className="flex items-center gap-2.5 sm:gap-3 pl-0 xs:pl-4 sm:pl-6 pt-2 xs:pt-0 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#ECFDF3] border border-[#D1FADF] flex items-center justify-center text-[#027A48] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs sm:text-base font-bold font-sora text-[#0B132B] tracking-tight leading-snug">
                      Genesis Phase 1
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#027A48] font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse shrink-0" />
                      <span>{seatStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right spacer for desktop background graphic */}
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
