'use client';

import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';

export default function DataPrivacyCard() {
  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#E2ECF9] p-5 shadow-xs font-jakarta space-y-4">
      {/* Top Banner: On-Chain Data */}
      <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[#155EEF] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <circle cx="19" cy="5" r="2" />
            <circle cx="5" cy="5" r="2" />
            <circle cx="19" cy="19" r="2" />
            <circle cx="5" cy="19" r="2" />
            <line x1="7" y1="7" x2="10" y2="10" />
            <line x1="17" y1="7" x2="14" y2="10" />
            <line x1="7" y1="17" x2="10" y2="14" />
            <line x1="17" y1="17" x2="14" y2="14" />
          </svg>
          <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
            On-Chain Data
          </h4>
        </div>
        <p className="text-[11px] sm:text-xs text-[#64748B] leading-relaxed">
          Blockchain transactions and wallet activity may remain publicly visible on the network and cannot be masked or retroactively deleted.
        </p>
      </div>

      {/* Bottom Section: Data & Privacy */}
      <div className="pt-0.5">
        <h4 className="text-sm font-bold text-[#071A4A]">
          Data & Privacy
        </h4>
        <p className="text-xs text-[#64748B] mt-0.5">
          Immutable protocol transparency principles.
        </p>

        {/* Action Link Box */}
        <button
          type="button"
          onClick={() => alert('Viewing Privacy Information')}
          className="w-full bg-[#F8FAFC] border border-[#E2ECF9] rounded-xl px-4 py-3 flex items-center justify-between text-[#155EEF] hover:bg-[#F1F5F9] transition-colors cursor-pointer group mt-3"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-[#155EEF] shrink-0" />
            <span className="text-xs font-bold text-[#155EEF]">
              Privacy Information
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#155EEF] group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      </div>
    </div>
  );
}
