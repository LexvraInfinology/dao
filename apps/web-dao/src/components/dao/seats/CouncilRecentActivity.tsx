'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useDaoEvents } from '@/hooks/useApi';

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const CouncilRecentActivity: React.FC = () => {
  const { data: events, loading } = useDaoEvents(5, 15_000);

  return (
    <div className="rounded-3xl bg-white border border-[#E2ECF9] p-5 sm:p-6 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-black uppercase tracking-wider font-jakarta text-[#071A4A]">
            RECENT ACTIVITY
          </h4>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-[#155EEF]" />}
        </div>
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
        {!events || events.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#94A3B8] font-jakarta">
            {loading ? 'Loading recent activity…' : 'No recent council activity recorded yet.'}
          </div>
        ) : (
          events.map((item) => {
            const isDefault = item.eventType === 'defaulted';
            const isEarnings = item.eventType === 'earnings' || item.eventType === 'pushed';
            const isJoined = item.eventType === 'joined';

            const dotColor = isDefault
              ? 'bg-[#F04438]'
              : isEarnings
              ? 'bg-emerald-500'
              : isJoined
              ? 'bg-[#0B1528]'
              : 'bg-[#155EEF]';

            const badgeClasses = isDefault
              ? 'bg-rose-50 text-[#D92D20] border-rose-200'
              : isEarnings
              ? 'bg-emerald-50 text-[#047857] border-emerald-200'
              : isJoined
              ? 'bg-slate-100 text-slate-800 border-slate-300'
              : 'bg-[#EEF5FF] text-[#155EEF] border-[#BFDBFE]';

            const title =
              isJoined
                ? 'Seat Claimed'
                : isDefault
                ? 'Seat Defaulted'
                : item.eventType;

            return (
              <div
                key={item.id}
                className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 text-xs font-jakarta"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#60739A] w-14 shrink-0">
                    {timeAgo(item.timestamp)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <span className="font-semibold text-[#071A4A]">{title}</span>
                  </div>
                </div>

                {item.incomingPosition && (
                  <span
                    className={`px-2.5 py-0.5 rounded-lg border font-mono font-bold text-xs ${badgeClasses}`}
                  >
                    #{item.incomingPosition}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
