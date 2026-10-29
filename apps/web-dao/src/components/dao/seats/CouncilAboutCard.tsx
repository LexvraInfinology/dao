'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const CouncilAboutCard: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white border border-[#E2EEF9] p-4 sm:p-5 shadow-[0_2px_12px_rgba(14,98,228,0.06)] space-y-2 font-sans">
      <h4 className="text-sm font-bold text-[#14304A]">
        About Council Seats
      </h4>
      <p className="text-xs text-[#4F6D87] leading-relaxed">
        The Genesis DAO consists of 100 sovereign seats. Each seat is represented by a non-transferable Soulbound NFT, granting lifetime voting rights, matrix dividend distributions, and direct protocol governance.
      </p>
      <div className="pt-0.5">
        <Link
          href="#about-council"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E62E4] hover:text-[#0B52C4] transition-colors group"
        >
          <span>Learn More</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
