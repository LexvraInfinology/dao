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
    <section className="relative pt-14 min-[360px]:pt-16 sm:pt-28 lg:pt-36 pb-6 min-[360px]:pb-8 sm:pb-16 lg:pb-20 overflow-hidden min-h-[640px] min-[360px]:min-h-[680px] min-[400px]:min-h-[720px] sm:min-h-[640px] lg:min-h-[720px] flex flex-col justify-start lg:justify-center bg-[#EBF3FC] border-b border-slate-200/80">
      {/* Background Media Container — Preserves scene composition without aggressive cropping or zooming */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden max-w-full">
        {/* Instant Fallback WebP Image (87 KB) — Instant display, zero blank state */}
        <Image
          src="/landing/hero-bg.webp"
          alt="EQUORA Genesis Council Overview"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[84%_bottom] sm:object-[76%_center] lg:object-[78%_center] xl:object-right transition-opacity duration-700"
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
          className={`w-full h-full object-cover object-[84%_bottom] sm:object-[76%_center] lg:object-[78%_center] xl:object-right max-w-full transition-opacity duration-700 ${
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start lg:items-center">
          {/* Left Column — Top-aligned on mobile so background artwork (council, boy, dog) is 100% visible and unblocked */}
          <div className="lg:col-span-7 xl:col-span-6 text-left">
            <div className="max-w-[340px] min-[360px]:max-w-[380px] min-[400px]:max-w-[430px] sm:max-w-xl lg:max-w-2xl p-0 sm:p-6 lg:p-7 bg-transparent sm:bg-white/10 backdrop-blur-none sm:backdrop-blur-[2px] border-none shadow-none space-y-3.5 min-[360px]:space-y-4 sm:space-y-6 lg:space-y-7">
              {/* Pill Badge — Crisp without blur */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 border border-blue-200/50 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#155EEF] uppercase font-inter">
                  Genesis DAO Council
                </span>
              </div>

              {/* Headline — High Contrast Razor Sharp with Elegant Line Separation, Zero Background Blur */}
              <h1 className="text-[23px] min-[360px]:text-[26px] sm:text-4xl lg:text-[50px] xl:text-[54px] font-black uppercase text-[#071437] text-left drop-shadow-[0_2px_8px_rgba(255,255,255,0.95)] sm:drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] flex flex-col gap-1.5 sm:gap-2.5 lg:gap-3 leading-[1.14] sm:leading-[1.12]">
                <span className="block">100 Seats.</span>
                <span className="block text-[#155EEF]">One Council.</span>
                <span className="block">A Shared Future.</span>
              </h1>

              {/* Subtitle — Strong High-Contrast Typography with Generous Line Breathing Room */}
              <p className="text-[12px] min-[360px]:text-[13px] sm:text-base lg:text-[17px] text-[#0F172A] font-semibold sm:font-medium leading-relaxed sm:leading-[1.65] text-left drop-shadow-[0_2px_6px_rgba(255,255,255,0.95)] max-w-xl">
                Fixed sovereign positions with direct dividend distribution and governance rights.
                Zero referrals, infinite protocol cash flow.
              </p>

              {/* CTAs */}
              <div className="flex flex-row items-center justify-start gap-2.5 min-[360px]:gap-3 sm:gap-4 pt-1.5 min-[360px]:pt-2 sm:pt-3 lg:pt-4 w-full max-w-sm sm:max-w-md">
                <Link
                  href="/dao"
                  className="px-4 min-[360px]:px-5 sm:px-8 py-2.5 min-[360px]:py-3 sm:py-3.5 rounded-full font-bold uppercase text-[10px] min-[360px]:text-[11px] sm:text-xs tracking-[0.05em] text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_4px_14px_rgba(21,94,239,0.35)] hover:shadow-[0_8px_20px_rgba(21,94,239,0.45)] transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 group cursor-pointer text-center whitespace-nowrap active:scale-[0.98]"
                >
                  <span>Claim Seat</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>

                <button
                  onClick={() => setVideoOpen(true)}
                  className="px-3.5 min-[360px]:px-4.5 sm:px-6 py-2.5 min-[360px]:py-3 sm:py-3.5 rounded-full font-semibold uppercase text-[10px] min-[360px]:text-[11px] sm:text-xs tracking-[0.05em] text-[#071437] hover:text-[#0B132B] bg-white/85 hover:bg-white shadow-xs border border-slate-200/60 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-50/80 flex items-center justify-center text-[#155EEF] shrink-0">
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
