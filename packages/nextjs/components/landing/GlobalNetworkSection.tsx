"use client";

import React from "react";

export function GlobalNetworkSection() {
  const networkCards = [
    {
      title: "Global Community",
      description: "Borderless decentralized participation across 50+ nations.",
      icon: (
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      title: "Zero Friction",
      description: "Autonomous smart contracts without intermediaries or gatekeepers.",
      icon: (
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Continuous Liquidity",
      description: "Real-time automated distribution across all 4 dynamic pools.",
      icon: (
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      title: "Multi-Tier Yield",
      description: "12 progressive levels designed for steady and exponential yield.",
      icon: (
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "DAO Governance",
      description: "100 Genesis Council seats directing protocol parameters and treasury.",
      icon: (
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: "Institutional Security",
      description: "Non-custodial smart contracts verified with multi-sig emergency freeze.",
      icon: (
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="network" className="py-20 sm:py-24 lg:py-28 relative overflow-hidden bg-[#F0F4F8]">
      {/* Background: Exact Figma Snowy Mountains Panorama */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40">
        <img
          src="/assets/images/Desktop - 3.png"
          alt="Snowy mountain panorama background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4F8] via-transparent to-[#F0F4F8]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-[#2563EB] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3 block">
            THE EQUORA NETWORK
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-[#0A1628] tracking-tight leading-[1.12] mb-3 sm:mb-4">
            A Global Network <br />
            For <span className="text-[#2563EB]">Real Opportunities.</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#475569] leading-relaxed max-w-2xl mx-auto">
            Connecting everyday participants to institutional-grade DeFi tools through audited smart contracts, automated liquidity pools, and high-yield staking.
          </p>
        </div>

        {/* 6 Frosted Glass Cards matching Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {networkCards.map((card, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0A1628] mb-1 leading-tight">
                  {card.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#64748B] leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
