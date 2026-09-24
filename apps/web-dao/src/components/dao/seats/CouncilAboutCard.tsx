'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const CouncilAboutCard: React.FC = () => {
  return (
    <div className="rounded-3xl bg-white border border-[#E2ECF9] p-5 sm:p-6 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-2.5">
      <h4 className="text-sm font-bold font-jakarta text-[#071A4A]">
        About Council Seats
      </h4>
      <p className="text-xs text-[#60739A] leading-relaxed font-jakarta">
        The Genesis DAO consists of 100 sovereign seats. Each seat is represented by a non-transferable Soulbound NFT, granting lifetime voting rights, matrix dividend distributions, and direct protocol governance.
      </p>
      <div className="pt-1">
        <Link
          href="#about-council"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#155EEF] hover:text-[#0052E6] transition-colors group"
        >
          <span>Learn More</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
