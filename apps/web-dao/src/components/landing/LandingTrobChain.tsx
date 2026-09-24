'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Zap, ShieldCheck, Eye, Layers } from 'lucide-react';

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
    <section id="trobchain" className="py-20 lg:py-28 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#EFF8FF] border border-[#D1E9FF]">
            <span className="text-[12px] font-semibold tracking-wider text-[#155EEF] font-inter uppercase">
              Built on TrobChain
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold font-inter text-[#0B132B] leading-[1.12] tracking-tight">
            Why We Choose<br />
            <span className="text-[#155EEF]">TrobChain.</span>
          </h2>

          <p className="text-[15px] sm:text-[16px] text-[#475467] leading-relaxed font-inter max-w-2xl mx-auto">
            Institutional-grade throughput, sub-second finality, and zero gas volatility. The ideal foundation for sovereign DAO governance.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: 3D Glowing Cube Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden flex items-center justify-center">
              <Image
                src="/landing/trobchain-cube.png"
                alt="TrobChain Blockchain Architecture"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Right Column: 4 Feature Cards & Banner */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {features.map((feat) => (
                <div
                  key={feat.title}
                  className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:bg-white hover:border-[#D1E9FF] hover:shadow-[0_8px_25px_rgba(21,94,239,0.06)] transition-all duration-200 space-y-2.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-xs">
                    {feat.icon}
                  </div>
                  <h3 className="text-base font-bold font-inter text-[#0B132B]">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#475467] leading-relaxed font-inter">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#EFF8FF] border border-[#D1E9FF] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <span className="text-xs font-bold text-[#155EEF] font-inter uppercase tracking-wide">
                  50,000+ TPS Capacity
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-xs text-[#475467] font-medium hidden sm:inline">
                  100% Uptime Since Genesis
                </span>
              </div>

              <a
                href="https://trobiumscan.io"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#155EEF] hover:text-[#004EEB] transition-colors"
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
