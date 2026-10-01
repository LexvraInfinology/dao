'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Coins, Calculator, Wallet, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useDaoStats } from '@/hooks/useApi';

export const LandingQueueArena: React.FC = () => {
  const { data: stats } = useDaoStats(30_000);
  const seatsClaimed = stats?.memberCount ?? 0;
  const isFull = seatsClaimed >= 100;
  const seatStatus = isFull
    ? 'All 100 Seats Filled'
    : `${seatsClaimed}/100 Seats Claimed (${Math.max(0, 100 - seatsClaimed)} Available)`;

  const cards = [
    {
      icon: <Coins className="w-5 h-5 text-[#155EEF]" />,
      title: '$300 Entry',
      description: 'Fixed entry price for all 100 Genesis seats, payable in TROB equivalent.',
    },
    {
      icon: <Calculator className="w-5 h-5 text-[#155EEF]" />,
      title: '300 / N Formula',
      description: 'Equal split across all N members: instant cashback to you + dividend push to prior seats.',
    },
    {
      icon: <Wallet className="w-5 h-5 text-[#155EEF]" />,
      title: 'Direct to Wallet',
      description: 'Zero claims needed. Automatic payout directly via contract.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-[#155EEF]" />,
      title: '500% Baseline ROI',
      description: 'Council members receive ongoing dividend pool distributions up to $1,500 worth of TROB.',
    },
  ];

  return (
    <section id="queue" className="scroll-mt-20 relative pt-8 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20 overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#F0F6FD] to-[#F8FAFC] border-b border-slate-200/80">
      {/* Background Arena Image */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/landing/queue-arena.webp"
          alt="Genesis Queue Amphitheater"
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover object-bottom"
        />
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Top Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-4">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-blue-200/90 shadow-sm backdrop-blur-md">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#155EEF] uppercase font-inter">
              The Genesis Queue
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-3xl lg:text-[42px] font-extrabold uppercase text-[#0B132B] leading-tight tracking-tight drop-shadow-[0_1px_8px_rgba(255,255,255,0.75)]">
            100 Seats<br />
            <span className="text-[#155EEF]">One Genesis Queue.</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-[#1D2939] font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-[0_1px_6px_rgba(255,255,255,0.85)]">
            Every seat enters a transparent FIFO queue. Automated cashback distribution via smart contract. No intermediaries. Ever.
          </p>

          {/* Desktop Status Badges */}
          <div className="hidden md:flex flex-row items-center justify-center gap-3 pt-2">
            <div className="px-5 py-2.5 rounded-full bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-md flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full ${isFull ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-[#155EEF]'} flex items-center justify-center font-bold text-xs`}>
                <span className={`w-2 h-2 rounded-full ${isFull ? 'bg-amber-500' : 'bg-[#155EEF]'} animate-pulse`} />
              </div>
              <span className="text-sm font-semibold text-[#0B132B]">{seatStatus}</span>
              <span className="text-xs text-[#64748B] font-medium">Council Membership</span>
            </div>

            <div className="px-5 py-2.5 rounded-full bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-md flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
              <span className="text-sm font-semibold text-[#0B132B]">$300 Entry = 300 / N Equal Split</span>
              <span className="text-xs text-[#027A48] font-medium">Smart Contract Verified</span>
            </div>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block pt-3">
            <Link
              href="/dao"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold uppercase tracking-[0.06em] text-xs sm:text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_24px_rgba(21,94,239,0.4)] hover:shadow-[0_12px_28px_rgba(21,94,239,0.5)] transition-all duration-200 group"
            >
              <span>Enter the Genesis Queue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Mobile Dedicated Status Pill */}
        <div className="flex md:hidden justify-center mt-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200/90 shadow-2xs text-[11px] font-semibold">
            <span className={`w-2 h-2 rounded-full ${isFull ? 'bg-amber-500' : 'bg-[#155EEF]'} animate-pulse`} />
            <span className="text-[#0B132B]">Status:</span>
            <span className={isFull ? 'text-amber-600' : 'text-[#155EEF]'}>{seatStatus}</span>
          </div>
        </div>

        {/* 4 Floating Glass Cards: 2x2 grid on mobile, 4-col on desktop */}
        <div className="pt-5 sm:pt-8 md:pt-24 lg:pt-40 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {cards.map((c) => (
            <div
              key={c.title}
              className="p-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-200 space-y-1.5 sm:space-y-2.5"
            >
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#EFF8FF] border border-[#D1E9FF] flex items-center justify-center shrink-0">
                {c.icon}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0B132B]">
                {c.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-[#475467] leading-relaxed line-clamp-3 sm:line-clamp-none">
                {c.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Full Width CTA Button */}
        <div className="block md:hidden mt-4">
          <Link
            href="/dao"
            className="w-full py-2.5 rounded-full font-semibold uppercase tracking-[0.04em] text-xs text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Enter the Genesis Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
