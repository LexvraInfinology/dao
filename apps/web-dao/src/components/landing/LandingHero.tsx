'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { VideoModal } from '@/components/ui/VideoModal';
import { useWallet } from '@/context/WalletContext';
import { useDaoMember } from '@/hooks/useApi';

export const LandingHero: React.FC = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const wallet = useWallet();
  const activeAddress = wallet.base58Address || wallet.hexAddress;
  const { data: memberData, loading: memberLoading } = useDaoMember(activeAddress);

  const isMemberLoading = Boolean(wallet.isConnected && activeAddress && (memberLoading || memberData === null));
  const isUnderfunded = Boolean(memberData?.status === 'underfunded' || memberData?.underfunded);
  const isMember = Boolean(memberData?.isMember && Number(memberData?.position) > 0 && !isUnderfunded);
  const seatPos = memberData?.position ?? null;

  const handleVideoReady = () => {
    setVideoLoaded(true);
    videoRef.current?.play().catch(() => {});
  };

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative pt-[72px] sm:pt-[84px] lg:pt-[92px] pb-6 sm:pb-10 lg:pb-16 overflow-hidden min-h-[480px] min-[360px]:min-h-[520px] sm:min-h-[560px] lg:min-h-[620px] flex flex-col justify-between bg-[#EBF3FC] border-b border-slate-200/80">
      {/* Background Media Container — Preserves scene composition without aggressive cropping or zooming */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden max-w-full">
        {/* Instant Fallback WebP Image (87 KB) — Commented out as requested, video plays in continuous loop */}
        {/*
        <Image
          src="/landing/hero-bg.webp"
          alt="EQUORA Genesis Council Overview"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[84%_bottom] sm:object-[76%_center] lg:object-[78%_center] xl:object-right transition-opacity duration-700"
        />
        */}

        {/* Web-Optimized 1080p Video — Continuous loop playback, anchored from most right side */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onEnded={() => videoRef.current?.play().catch(() => {})}
          className="w-full h-full object-cover object-right sm:object-right lg:object-right xl:object-right max-w-full opacity-100"
        >
          <source
            src="/landing/hero-video-optimized.mp4"
            type="video/mp4"
          />
          <source
            src="/landing/Timeline_1_4K_kxuhex.mp4"
            type="video/mp4"
          />
        </video>

      </div>

      <div className="max-w-[1360px] mx-auto px-3.5 sm:px-8 lg:px-12 relative z-10 w-full flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start lg:items-center flex-1">
          {/* Left Column — Top-aligned text, with CTAs pushed to the very bottom */}
          <div className="lg:col-span-7 xl:col-span-6 text-left flex flex-col justify-between h-full min-h-[380px] min-[360px]:min-h-[420px] sm:min-h-[460px] lg:min-h-[500px]">
            <div className="max-w-full sm:max-w-xl lg:max-w-2xl p-0 space-y-2.5 sm:space-y-4">
              {/* Headline — Strong High-Contrast Razor Sharp Typography, Zero Background Blur */}
              <h1 className="text-[24px] min-[360px]:text-[28px] sm:text-4xl lg:text-[50px] xl:text-[54px] font-black uppercase text-[#071437] text-left [text-shadow:0_1px_2px_rgba(255,255,255,0.9),0_0_1px_rgba(255,255,255,1)] flex flex-col gap-1 sm:gap-2 lg:gap-2.5 leading-[1.12] sm:leading-[1.1]">
                <span className="block">100 Seats.</span>
                <span className="block text-[#155EEF]">One Council.</span>
                <span className="block">A Shared Future.</span>
              </h1>

              {/* Subtitle — Strong High-Contrast Bold Typography */}
              <p className="text-[12.5px] min-[360px]:text-[13.5px] sm:text-base lg:text-[17px] text-[#0A1A2F] font-bold sm:font-semibold leading-relaxed sm:leading-[1.6] text-left [text-shadow:0_1px_1px_rgba(255,255,255,0.85)] max-w-xl">
                Fixed sovereign positions with direct dividend distribution and governance rights.
                Zero referrals, infinite protocol cash flow.
              </p>
            </div>

            {/* CTAs — Positioned at the very bottom of the hero section so the character and artwork are completely unobstructed */}
            <div className="flex items-center gap-2 sm:gap-3 mt-auto pt-16 min-[360px]:pt-20 sm:pt-24 lg:pt-8 w-auto">
              {isMemberLoading ? (
                <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full font-semibold uppercase text-[10.5px] sm:text-xs tracking-wider text-[#0E62E4] bg-white/95 border border-blue-200 shadow-xs flex items-center justify-center gap-1.5 select-none">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E62E4]" />
                  <span>Syncing</span>
                </div>
              ) : isUnderfunded ? (
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent('dao:open-retopup', {
                        detail: { seatPosition: seatPos },
                      })
                    )
                  }
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold uppercase text-[10.5px] sm:text-xs tracking-wider text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Re-topup</span>
                </button>
              ) : isMember ? (
                <Link
                  href="/dao"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold uppercase text-[10.5px] sm:text-xs tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all flex items-center gap-1.5 group cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enter Council</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              ) : (
                <Link
                  href="/dao/seats"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold uppercase text-[10.5px] sm:text-xs tracking-wider text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-xs transition-all flex items-center gap-1.5 group cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <span>Claim Seat</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              )}

              <button
                onClick={() => setVideoOpen(true)}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full font-semibold uppercase text-[10.5px] sm:text-xs tracking-wider text-[#071437] hover:text-[#0B132B] bg-white/95 hover:bg-white shadow-xs border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                <span className="w-4 h-4 rounded-full bg-blue-50/90 flex items-center justify-center text-[#155EEF] shrink-0">
                  <Play className="w-2 h-2 fill-current ml-0.25" />
                </span>
                <span>Watch</span>
              </button>
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
