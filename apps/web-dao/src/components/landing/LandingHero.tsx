'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { VideoModal } from '@/components/ui/VideoModal';

export const LandingHero: React.FC = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleVideoReady = () => {
    setVideoLoaded(true);
    videoRef.current?.play().catch(() => {});
  };

  React.useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setVideoLoaded(true);
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative pt-18 min-[360px]:pt-20 sm:pt-28 lg:pt-36 pb-10 sm:pb-16 lg:pb-20 overflow-hidden min-h-[480px] min-[360px]:min-h-[520px] sm:min-h-[620px] lg:min-h-[720px] flex items-center bg-[#EBF3FC] border-b border-slate-200/80">
      {/* Background Media Container — Preserves scene composition without aggressive cropping or zooming */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden max-w-full">
        {/* Instant Fallback WebP Image (87 KB) — Instant display, zero blank state */}
        <Image
          src="/landing/hero-bg.webp"
          alt="EQUORA Genesis Council Overview"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_center] sm:object-[70%_center] lg:object-[78%_center] xl:object-right transition-opacity duration-700"
        />

        {/* Web-Optimized 1080p Video (1.91 MB) — Smooth fade-in ONLY once buffered and ready to play */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={handleVideoReady}
          onLoadedData={handleVideoReady}
          className={`w-full h-full object-cover object-[64%_center] sm:object-[70%_center] lg:object-[78%_center] xl:object-right max-w-full transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source
            src="/landing/hero-video-optimized.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="max-w-[1360px] mx-auto px-3.5 sm:px-8 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column — Frosted glass panel on mobile so text is 100% visible, dissolving into natural sky on desktop */}
          <div className="lg:col-span-7 xl:col-span-6 text-left">
            <div className="max-w-[340px] min-[380px]:max-w-[380px] sm:max-w-lg lg:max-w-xl p-3.5 min-[360px]:p-4 sm:p-6 lg:p-0 rounded-2xl sm:rounded-3xl lg:rounded-none bg-white/80 sm:bg-white/70 lg:bg-transparent backdrop-blur-md sm:backdrop-blur-sm lg:backdrop-blur-none border border-white/90 sm:border-white/70 lg:border-none shadow-[0_8px_30px_rgba(15,23,42,0.06)] lg:shadow-none space-y-3 sm:space-y-5">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/95 border border-blue-200/90 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#155EEF] uppercase font-inter">
                  Genesis DAO Phase 1
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[21px] min-[360px]:text-[24px] sm:text-4xl lg:text-[54px] xl:text-[58px] font-extrabold uppercase text-[#0B132B] leading-[1.12] tracking-tight text-left">
                100 Seats.<br />
                <span className="text-[#155EEF]">One Council.</span><br />
                A Shared Future.
              </h1>

              {/* Subtitle */}
              <p className="text-[11.5px] min-[360px]:text-xs sm:text-base text-[#334155] font-medium leading-relaxed text-left">
                Fixed sovereign positions with direct dividend distribution and governance rights.
                Zero referrals, infinite protocol cash flow.
              </p>

              {/* CTAs */}
              <div className="flex flex-row items-center justify-start gap-2 min-[360px]:gap-2.5 sm:gap-3 md:gap-4 pt-1 sm:pt-2 w-full max-w-sm sm:max-w-md">
                <Link
                  href="/dao"
                  className="px-4 min-[360px]:px-5 sm:px-8 py-2 min-[360px]:py-2.5 sm:py-3.5 rounded-full font-bold uppercase text-[10px] min-[360px]:text-[11px] sm:text-xs tracking-[0.05em] text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_4px_14px_rgba(21,94,239,0.35)] hover:shadow-[0_8px_20px_rgba(21,94,239,0.45)] transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 group cursor-pointer text-center whitespace-nowrap active:scale-[0.98]"
                >
                  <span>Claim Seat</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>

                <button
                  onClick={() => setVideoOpen(true)}
                  className="px-3 min-[360px]:px-4 sm:px-6 py-2 min-[360px]:py-2.5 sm:py-3.5 rounded-full font-semibold uppercase text-[10px] min-[360px]:text-[11px] sm:text-xs tracking-[0.05em] text-[#334155] hover:text-[#0B132B] bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-50 flex items-center justify-center text-[#155EEF] shrink-0">
                    <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current ml-0.5" />
                  </span>
                  <span>Watch</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right column: Clean unobstructed view of background video/artwork */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6 h-[480px] pointer-events-none" />
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
