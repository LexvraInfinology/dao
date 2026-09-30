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
    <div className="rounded-2xl bg-white border border-[#E2EEF9] p-4 sm:p-5 shadow-[0_2px_12px_rgba(14,98,228,0.06)] space-y-3 font-sans">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#14304A]">
            RECENT ACTIVITY
          </h4>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-[#0E62E4]" />}
        </div>
        <Link
          href="/dao/transactions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E62E4] hover:text-[#0B52C4] transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-[#E2EEF9]/60">
        {!events || events.length === 0 ? (
          <div className="py-4 text-center text-xs text-[#4F6D87]">
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
              ? 'bg-[#14304A]'
              : 'bg-[#0E62E4]';

            const badgeClasses = isDefault
              ? 'bg-rose-50 text-[#D92D20] border-rose-200'
              : isEarnings
              ? 'bg-emerald-50 text-[#047857] border-emerald-200'
              : isJoined
              ? 'bg-slate-100 text-slate-800 border-slate-300'
              : 'bg-[#EFF6FF] text-[#0E62E4] border-[#0E62E4]/30';

            const title =
              item.reason ||
              (isJoined
                ? 'Council Seat Activated'
                : isDefault
                ? 'Seat Defaulted'
                : isEarnings
                ? '300/N Instant Cashback'
                : item.eventType === 'fallback_claimed'
                ? 'Dividend Claimed'
                : item.eventType);

            return (
              <div
                key={item.id}
                className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[#4F6D87] text-[11px] w-12 shrink-0">
                    {timeAgo(item.timestamp)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    <span className="font-medium text-[#14304A]">{title}</span>
                  </div>
                </div>

                {item.incomingPosition && (
                  <span
                    className={`px-2 py-0.5 rounded-md border font-mono font-semibold text-[11px] ${badgeClasses}`}
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
