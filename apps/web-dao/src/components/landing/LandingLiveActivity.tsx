'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, User, Coins, TrendingUp, RotateCcw } from 'lucide-react';

export const LandingLiveActivity: React.FC = () => {
  const activityItems = [
    {
      id: '85755',
      title: 'Seat Claimed',
      titleMobile: 'Seat Claimed',
      subtitleDesktop: 'Genesis Seat #86 claimed • Member #1042',
      subtitleMobile: 'Genesis Seat #86 claimed • Member #1042',
      timeDesktop: 'just now',
      timeMobile: 'Just now',
      highlightMobile: null,
      iconDesktop: <User className="w-4 h-4 text-[#155EEF]" />,
      iconMobile: <User className="w-4 h-4 text-[#155EEF]" />,
      iconBgDesktop: 'bg-[#EFF6FF] border border-[#BFDBFE]/50',
      iconBgMobile: 'bg-[#EFF6FF] border border-[#BFDBFE]/60',
    },
    {
      id: '85755',
      title: 'Queue Distribution',
      titleMobile: 'Queue Distribution',
      subtitleDesktop: (
        <>
          From Seat #85 → Distributed to next in queue <span className="mx-1 text-slate-300">•</span>{' '}
          <strong className="text-[#0B132B] font-bold">+164.91 TROB</strong>
        </>
      ),
      subtitleMobile: 'From Seat #85 → Distributed to queue',
      timeDesktop: 'just now',
      timeMobile: null,
      highlightMobile: '+164.91 TROB',
      highlightMobileColor: 'text-[#12B76A]',
      iconDesktop: <Coins className="w-4 h-4 text-[#155EEF]" />,
      iconMobile: <Coins className="w-4 h-4 text-[#12B76A]" />,
      iconBgDesktop: 'bg-[#EFF6FF] border border-[#BFDBFE]/50',
      iconBgMobile: 'bg-[#ECFDF5] border border-[#A7F3D0]/60',
    },
    {
      id: '85755',
      title: 'Seat Claimed',
      titleMobile: 'Seat Claimed',
      subtitleDesktop: 'Genesis Seat #85 claimed • Member #0987',
      subtitleMobile: 'Genesis Seat #85 claimed • Member #0987',
      timeDesktop: 'just now',
      timeMobile: '1h ago',
      highlightMobile: null,
      iconDesktop: <User className="w-4 h-4 text-[#155EEF]" />,
      iconMobile: <User className="w-4 h-4 text-[#155EEF]" />,
      iconBgDesktop: 'bg-[#EFF6FF] border border-[#BFDBFE]/50',
      iconBgMobile: 'bg-[#EFF6FF] border border-[#BFDBFE]/60',
    },
    {
      id: '85755',
      title: 'Cap Reached',
      titleMobile: 'Cap Reached',
      subtitleDesktop: (
        <>
          Member #1038 reached 5X earnings cap <span className="mx-1 text-slate-300">•</span>{' '}
          1,500 TROB total earnings
        </>
      ),
      subtitleMobile: 'Member #1038 reached 5X earnings cap',
      timeDesktop: 'just now',
      timeMobile: null,
      highlightMobile: '1,500 TROB',
      highlightMobileColor: 'text-[#6172F3]',
      iconDesktop: <TrendingUp className="w-4 h-4 text-[#155EEF]" />,
      iconMobile: <TrendingUp className="w-4 h-4 text-[#4F46E5]" />,
      iconBgDesktop: 'bg-[#EFF6FF] border border-[#BFDBFE]/50',
      iconBgMobile: 'bg-[#EEF4FF] border border-[#C7D7FE]/60',
    },
    {
      id: '85755',
      title: 'Re-Top Up',
      titleMobile: 'Re-Top-Up',
      subtitleDesktop: (
        <>
          Seat #82 re-top-up completed <span className="mx-1 text-slate-300">•</span> 300 TROB
        </>
      ),
      subtitleMobile: 'Seat #82 re-top-up completed • 300 TROB',
      timeDesktop: 'just now',
      timeMobile: '5h ago',
      highlightMobile: null,
      iconDesktop: <RotateCcw className="w-4 h-4 text-[#155EEF]" />,
      iconMobile: <RotateCcw className="w-4 h-4 text-[#F79009]" />,
      iconBgDesktop: 'bg-[#EFF6FF] border border-[#BFDBFE]/50',
      iconBgMobile: 'bg-[#FEF6EE] border border-[#FDE68A]/60',
    },
  ];

  return (
    <section id="activity" className="relative pt-24 pb-20 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-36 overflow-hidden">
      {/* =========================================================================
          FULL SECTION PANORAMIC BACKGROUND
          Snowy mountains, blue sky, and 3D boy seamlessly spanning across
         ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/landing/activity-boy.png"
          alt="Genesis Live Activity Scenic Panorama"
          fill
          priority
          className="object-cover object-[80%_0%] sm:object-[78%_center] lg:object-center"
        />
        {/* Soft top gradient to blend from previous section */}
        <div className="absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-white via-white/80 to-transparent" />
        {/* Soft bottom gradient to blend into next section */}
        <div className="absolute inset-x-0 bottom-0 h-32 sm:h-44 bg-gradient-to-t from-white via-white/60 to-transparent" />
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="text-[12px] sm:text-[13px] font-bold font-inter text-[#155EEF] uppercase tracking-widest mb-2.5">
            LIVE ACTIVITY
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[50px] font-bold font-inter text-[#0B132B] leading-[1.12] tracking-tight">
            The Genesis Queue Is<br />
            <span className="text-[#155EEF]">Always Moving.</span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#475467] font-inter max-w-xl mx-auto leading-relaxed">
            <span className="hidden md:inline">
              Track seat claims, queue distributions, and Genesis DAO activity in real time.
            </span>
            <span className="md:hidden">
              Track seat claims, distributions, and DAO activity in real time.
            </span>
          </p>
        </div>

        {/* Content Layout: 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Column: Glassmorphic Activity Card (7 cols on lg) */}
          <div className="lg:col-span-7 xl:col-span-7 relative z-20">
            {/* Main Glass Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 lg:p-8">
              {/* Desktop Card Header (Hidden on Mobile) */}
              <div className="hidden md:flex items-center justify-between pb-4 sm:pb-5 border-b border-slate-100/90">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#155EEF] animate-pulse" />
                  <span className="text-xs sm:text-sm font-black font-inter tracking-wider text-[#0B132B] uppercase">
                    LIVE
                  </span>
                  <span className="h-3.5 w-px bg-slate-300" />
                  <span className="text-xs sm:text-sm font-semibold font-inter text-[#475467]">
                    Genesis Dao Activity
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium font-inter text-[#475467]">
                  <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
                  <span>Updating in real-time</span>
                </div>
              </div>

              {/* Mobile Card Header (Visible only on Mobile) */}
              <div className="md:hidden flex items-center justify-between pb-3.5 border-b border-slate-100/90">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
                  <span className="text-sm font-bold font-inter text-[#0B132B]">
                    Genesis DAO Activity
                  </span>
                </div>
                <span className="text-xs font-medium font-inter text-[#94A3B8]">
                  Live Sync
                </span>
              </div>

              {/* Activity Rows */}
              <div className="divide-y divide-slate-100/80">
                {activityItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-white/40 px-1 sm:px-2 rounded-2xl transition-colors"
                  >
                    {/* Left: Icon & Description */}
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      {/* Desktop Icon (Uniform Blue) */}
                      <div className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center shrink-0 ${item.iconBgDesktop}`}>
                        {item.iconDesktop}
                      </div>

                      {/* Mobile Icon (Color coded as in Reference) */}
                      <div className={`md:hidden w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.iconBgMobile}`}>
                        {item.iconMobile}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        {/* Title */}
                        <div className="text-xs sm:text-[14px] font-bold text-[#0B132B] font-inter">
                          <span className="hidden md:inline">{item.title}</span>
                          <span className="md:hidden">{item.titleMobile}</span>
                        </div>

                        {/* Desktop Subtitle */}
                        <div className="hidden md:block text-[11px] sm:text-xs text-[#64748B] font-inter">
                          {item.subtitleDesktop}
                        </div>

                        {/* Mobile Subtitle + ID */}
                        <div className="md:hidden space-y-0.5">
                          <div className="text-[11px] text-[#64748B] font-inter truncate">
                            {item.subtitleMobile}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] font-inter">
                            ID: {item.id}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Desktop Metadata (ID, Time, Dot) */}
                    <div className="hidden md:flex items-center gap-3 shrink-0 text-right">
                      <span className="text-xs font-semibold text-[#475467] font-inter">
                        ID {item.id}
                      </span>
                      <span className="text-xs text-[#94A3B8] font-inter">
                        {item.timeDesktop}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
                    </div>

                    {/* Right: Mobile Metadata (Highlight or Time) */}
                    <div className="md:hidden text-right shrink-0">
                      {item.highlightMobile ? (
                        <span className={`text-xs font-bold font-inter ${item.highlightMobileColor}`}>
                          {item.highlightMobile}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8] font-inter">
                          {item.timeMobile}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer: View More Activity */}
              <div className="pt-4 sm:pt-6 mt-1 border-t border-slate-100/90 text-center">
                {/* Desktop Pill Button matching Reference Image 2 */}
                <div className="hidden md:block">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/70 hover:bg-white text-xs sm:text-sm font-semibold font-inter text-[#0B132B] border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200"
                  >
                    <span>View More Activity</span>
                    <ArrowRight className="w-4 h-4 text-[#475467]" />
                  </button>
                </div>

                {/* Mobile Text Button matching Reference Image 3 */}
                <div className="md:hidden">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold font-inter text-[#155EEF] hover:text-[#004EEB] transition-colors py-1"
                  >
                    <span>View More Activity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Open space on Desktop where background boy is framing the card */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 h-[520px] pointer-events-none" />
        </div>

        {/* =========================================================================
            MOBILE BOTTOM 3-SEGMENT STATS CAPSULE (From Mobile Reference Image 3)
            [ 86 Filled Seats | 14 Remaining | 100 Total Seats ]
           ========================================================================= */}
        <div className="block lg:hidden mt-6 sm:mt-8 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md max-w-sm sm:max-w-md mx-auto grid grid-cols-3 divide-x divide-slate-100 text-center">
          <div className="px-2">
            <div className="text-xl sm:text-2xl font-black font-sora text-[#0B132B]">
              86
            </div>
            <div className="text-[10px] sm:text-xs text-[#64748B] font-medium font-inter mt-0.5">
              Filled Seats
            </div>
          </div>
          <div className="px-2">
            <div className="text-xl sm:text-2xl font-black font-sora text-[#12B76A]">
              14
            </div>
            <div className="text-[10px] sm:text-xs text-[#64748B] font-medium font-inter mt-0.5">
              Remaining
            </div>
          </div>
          <div className="px-2">
            <div className="text-xl sm:text-2xl font-black font-sora text-[#0B132B]">
              100
            </div>
            <div className="text-[10px] sm:text-xs text-[#64748B] font-medium font-inter mt-0.5">
              Total Seats
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
