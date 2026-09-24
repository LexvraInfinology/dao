'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

export default function MatrixFeatureCards() {
  return (
    <>
      {/* ================= DESKTOP VIEW (hidden md:grid) ================= */}
      <div className="hidden md:grid md:grid-cols-3 gap-5 max-w-4xl mx-auto font-jakarta">
        {/* Card 1: Launch */}
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-[#E2ECF9] p-5 lg:p-6 shadow-[0_2px_15px_rgba(21,94,239,0.02)] flex items-start gap-4 hover:border-[#BFDBFE] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0 mt-0.5">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748B] font-medium">
              Launch
            </div>
            <div className="text-lg font-bold text-[#071A4A] tracking-tight mt-0.5">
              Day 22
            </div>
            <p className="text-xs text-[#64748B] mt-1 leading-snug">
              The Retail Matrix goes live.
            </p>
          </div>
        </div>

        {/* Card 2: Matrix */}
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-[#E2ECF9] p-5 lg:p-6 shadow-[0_2px_15px_rgba(21,94,239,0.02)] flex items-start gap-4 hover:border-[#BFDBFE] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0 mt-0.5">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 8V6a2 2 0 0 1 2-2h2" />
              <path d="M4 16v2a2 2 0 0 0 2 2h2" />
              <path d="M16 4h2a2 2 0 0 1 2 2v2" />
              <path d="M16 20h2a2 2 0 0 0 2-2v-2" />
              <rect x="8" y="8" width="8" height="8" rx="1.5" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-[#64748B] font-medium">
              Matrix
            </div>
            <div className="text-lg font-bold text-[#071A4A] tracking-tight mt-0.5">
              $30 Entry
            </div>
            <p className="text-xs text-[#64748B] mt-1 leading-snug">
              Accessible to the global community.
            </p>
          </div>
        </div>

        {/* Card 3: DAO Share */}
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-[#E2ECF9] p-5 lg:p-6 shadow-[0_2px_15px_rgba(21,94,239,0.02)] flex items-start gap-4 hover:border-[#BFDBFE] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0 mt-0.5">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="3" y1="12" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-[#64748B] font-medium">
              DAO Share
            </div>
            <div className="text-lg font-bold text-[#155EEF] tracking-tight mt-0.5">
              35%
            </div>
            <p className="text-xs text-[#64748B] mt-1 leading-snug">
              Of global matrix volume.
            </p>
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW (md:hidden) ================= */}
      <div className="md:hidden space-y-3.5 max-w-xl mx-auto font-jakarta">
        {/* Mobile Card 1: Launch */}
        <div className="bg-white rounded-2xl border border-[#E2ECF9] p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#64748B] font-medium">
                Launch
              </div>
              <div className="text-xs text-[#64748B] mt-0.5 truncate">
                The Retail Matrix goes live.
              </div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#071A4A] tracking-tight shrink-0 whitespace-nowrap">
            Day 22
          </div>
        </div>

        {/* Mobile Card 2: Matrix */}
        <div className="bg-white rounded-2xl border border-[#E2ECF9] p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8V6a2 2 0 0 1 2-2h2" />
                <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                <path d="M16 20h2a2 2 0 0 0 2-2v-2" />
                <rect x="8" y="8" width="8" height="8" rx="1.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#64748B] font-medium">
                Matrix
              </div>
              <div className="text-xs text-[#64748B] mt-0.5 truncate">
                Accessible to the global community.
              </div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#071A4A] tracking-tight shrink-0 whitespace-nowrap">
            $30 Entry
          </div>
        </div>

        {/* Mobile Card 3: DAO Share */}
        <div className="bg-white rounded-2xl border border-[#E2ECF9] p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="3" x2="12" y2="21" />
                <line x1="3" y1="12" x2="12" y2="12" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#64748B] font-medium">
                DAO Share
              </div>
              <div className="text-xs text-[#64748B] mt-0.5 truncate">
                Of global matrix volume.
              </div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#155EEF] tracking-tight shrink-0 whitespace-nowrap">
            35%
          </div>
        </div>
      </div>
    </>
  );
}
