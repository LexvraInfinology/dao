'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { COUNCIL_ACTIVITIES } from '@/data/councilSeatsData';

export const CouncilRecentActivity: React.FC = () => {
  return (
    <div className="rounded-3xl bg-white border border-[#E2ECF9] p-5 sm:p-6 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider font-jakarta text-[#071A4A]">
          RECENT ACTIVITY
        </h4>
        <Link
          href="/dao/transactions"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#155EEF] hover:text-[#0052E6] transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-slate-100">
        {COUNCIL_ACTIVITIES.map((item) => {
          let dotColor = 'bg-emerald-500';
          let badgeClasses = 'bg-slate-100 text-[#071A4A] border-slate-200';

          if (item.type === 'defaulted') {
            dotColor = 'bg-[#F04438]';
            badgeClasses = 'bg-rose-50 text-[#D92D20] border-rose-200';
          } else if (item.type === 'earnings') {
            dotColor = 'bg-[#155EEF]';
            badgeClasses = 'bg-[#EEF5FF] text-[#155EEF] border-[#BFDBFE]';
          }

          return (
            <div
              key={item.id}
              className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 text-xs font-jakarta"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#60739A] w-14 shrink-0">{item.timeAgo}</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  <span className="font-semibold text-[#071A4A]">{item.title}</span>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-lg border font-mono font-bold text-xs ${badgeClasses}`}
              >
                #{item.seatNumber}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
