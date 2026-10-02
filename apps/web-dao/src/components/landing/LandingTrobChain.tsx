'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Zap, ShieldCheck, Eye, Layers } from 'lucide-react';
import { EXPLORER_BASE_URL } from '@/config/env';

export const LandingTrobChain: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-[#155EEF]" />,
      title: 'Zero Gas Fees',
      description: 'Sub-penny transactions ensure micro-distributions never eat into member cashback.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#155EEF]" />,
      title: 'Instant Finality',
      description: 'Sub-second block confirmation means your queue position is locked immediately.',
    },
    {
      icon: <Eye className="w-5 h-5 text-[#155EEF]" />,
      title: 'On-Chain Transparency',
      description: 'Every cashback payout, treasury transfer, and vote is publicly verifiable on TrobiumScan.',
    },
    {
      icon: <Layers className="w-5 h-5 text-[#155EEF]" />,
      title: 'Sovereign Governance',
      description: 'Direct contract integration empowers the 100 Council members with unalterable execution power.',
    },
  ];

  return (
    <section id="trobchain" className="scroll-mt-24 pt-6 sm:pt-12 lg:pt-14 pb-8 sm:pb-14 lg:pb-16 bg-[#FFFFFF] relative overflow-hidden border-b border-slate-200/80">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-4 mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF8FF] border border-[#D1E9FF]">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#155EEF] uppercase font-inter">
              Built on TrobChain
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-[42px] font-bold uppercase text-[#0B132B] leading-tight tracking-tight">
            Why We Choose<br />
            <span className="text-[#155EEF]">TrobChain.</span>
          </h2>

          <p className="text-xs sm:text-base text-[#475467] leading-relaxed max-w-2xl mx-auto">
            Institutional-grade throughput, sub-second finality, and zero gas volatility. The ideal foundation for sovereign DAO governance.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Left Column: 3D Glowing Cube Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[200px] sm:max-w-[320px] lg:max-w-[420px] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center">
              <Image
                src="/landing/trobchain-cube.webp"
                alt="TrobChain Blockchain Architecture"
                fill
                sizes="(max-width: 768px) 240px, 420px"
                loading="lazy"
                className="object-contain"
              />
            </div>
          </div>

          {/* Right Column: 4 Feature Cards & Banner */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5">
              {features.map((feat) => (
                <div
                  key={feat.title}
                  className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#FAFCFF] border border-slate-200/70 hover:bg-white hover:border-[#D1E9FF] hover:shadow-[0_8px_25px_rgba(21,94,239,0.06)] transition-all duration-200 space-y-1.5 sm:space-y-2"
                >
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-xs">
                    {feat.icon}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0B132B] truncate">
                    {feat.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#475467] leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Banner */}
            <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#EFF8FF] border border-[#D1E9FF] flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 text-center sm:text-left">
                <span className="text-[11px] sm:text-xs font-bold text-[#155EEF] uppercase tracking-wider">
                  50,000+ TPS Capacity
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-xs text-[#475467] font-medium hidden sm:inline">
                  100% Uptime Since Genesis
                </span>
              </div>

              <a
                href={EXPLORER_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.06em] text-[#155EEF] hover:text-[#004EEB] transition-colors"
              >
                <span>Explore on TrobiumScan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
