'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, User, Coins, TrendingUp, RotateCcw, Loader2 } from 'lucide-react';
import { useDaoEvents, type DaoEventData } from '@/hooks/useApi';

// ─── Event → display shape ────────────────────────────────────────────────────

interface ActivityRow {
  id: string;
  title: string;
  subtitle: string;
  highlight: string | null;
  highlightColor: string;
  timeAgo: string;
  iconEl: React.ReactNode;
  iconBg: string;
  iconBgMobile: string;
  iconElMobile: React.ReactNode;
}

function formatAmount(btt: number, usd: number): string {
  if (!btt && !usd) return '';
  return usd > 0 ? `+$${usd.toFixed(2)}` : `+${btt.toFixed(2)} TROB`;
}

function timeAgoLabel(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function shortAddress(addr: string | null | undefined): string {
  if (!addr) return 'Council Member';
  if (addr.length > 12) return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  return addr;
}

function mapEventToRow(evt: DaoEventData): ActivityRow {
  const displayAddr = shortAddress(evt.userAddress);
  const timeAgo = timeAgoLabel(evt.timestamp);

  switch (evt.eventType) {
    case 'retopup':
      return {
        id: evt.id,
        title: '5X Cap Reset',
        subtitle: `48h Retopup completed • ${displayAddr}`,
        highlight: '+$300 USD',
        highlightColor: 'text-[#155EEF]',
        timeAgo,
        iconEl:       <RotateCcw className="w-4 h-4 text-[#155EEF]" />,
        iconBg:       'bg-[#EFF6FF] border border-[#BFDBFE]/50',
        iconBgMobile: 'bg-[#EFF6FF] border border-[#BFDBFE]/60',
        iconElMobile: <RotateCcw className="w-4 h-4 text-[#155EEF]" />,
      };
    case 'joined':
      return {
        id: evt.id,
        title: evt.incomingPosition ? `Council Seat #${evt.incomingPosition} Activated` : 'Council Seat Activated',
        subtitle: `${displayAddr} entered Genesis Council`,
        highlight: '+$300 USD',
        highlightColor: 'text-[#12B76A]',
        timeAgo,
        iconEl:       <User className="w-4 h-4 text-[#155EEF]" />,
        iconBg:       'bg-[#EFF6FF] border border-[#BFDBFE]/50',
        iconBgMobile: 'bg-[#EFF6FF] border border-[#BFDBFE]/60',
        iconElMobile: <User className="w-4 h-4 text-[#155EEF]" />,
      };
    case 'pushed':
      return {
        id: evt.id,
        title: evt.incomingPosition ? `Instant Cashback (Seat #${evt.incomingPosition})` : 'Instant Cashback',
        subtitle: `${displayAddr} received distribution`,
        highlight: formatAmount(evt.amountBtt, evt.amountUsdEstimate),
        highlightColor: 'text-[#12B76A]',
        timeAgo,
        iconEl:       <Coins className="w-4 h-4 text-[#155EEF]" />,
        iconBg:       'bg-[#EFF6FF] border border-[#BFDBFE]/50',
        iconBgMobile: 'bg-[#ECFDF5] border border-[#A7F3D0]/60',
        iconElMobile: <Coins className="w-4 h-4 text-[#12B76A]" />,
      };
    case 'fallback_claimed':
      return {
        id: evt.id,
        title: 'Dividend Claimed',
        subtitle: `${displayAddr} claimed protocol dividend`,
        highlight: formatAmount(evt.amountBtt, evt.amountUsdEstimate),
        highlightColor: 'text-[#6172F3]',
        timeAgo,
        iconEl:       <TrendingUp className="w-4 h-4 text-[#155EEF]" />,
        iconBg:       'bg-[#EFF6FF] border border-[#BFDBFE]/50',
        iconBgMobile: 'bg-[#EEF4FF] border border-[#C7D7FE]/60',
        iconElMobile: <TrendingUp className="w-4 h-4 text-[#4F46E5]" />,
      };
    case 'queue_closed':
      return {
        id: evt.id,
        title: 'Queue Complete',
        subtitle: `Genesis DAO Council is now complete`,
        highlight: null,
        highlightColor: '',
        timeAgo,
        iconEl:       <RotateCcw className="w-4 h-4 text-[#155EEF]" />,
        iconBg:       'bg-[#EFF6FF] border border-[#BFDBFE]/50',
        iconBgMobile: 'bg-[#FEF6EE] border border-[#FDE68A]/60',
        iconElMobile: <RotateCcw className="w-4 h-4 text-[#F79009]" />,
      };
    default:
      return {
        id: evt.id,
        title: evt.reason && evt.reason.length < 32 ? evt.reason : 'Protocol Activity',
        subtitle: `${displayAddr} performed action`,
        highlight: evt.amountBtt > 0 ? formatAmount(evt.amountBtt, evt.amountUsdEstimate) : '+$300 USD',
        highlightColor: 'text-[#155EEF]',
        timeAgo,
        iconEl:       <Coins className="w-4 h-4 text-[#155EEF]" />,
        iconBg:       'bg-[#EFF6FF] border border-[#BFDBFE]/50',
        iconBgMobile: 'bg-[#EFF6FF] border border-[#BFDBFE]/60',
        iconElMobile: <Coins className="w-4 h-4 text-[#155EEF]" />,
      };
  }
}

export const LandingLiveActivity: React.FC = () => {
  // Poll every 10 seconds for live events
  const { data: rawEvents, loading } = useDaoEvents(10, 10_000);

  const rows: ActivityRow[] = useMemo(() => {
    if (!rawEvents || rawEvents.length === 0) return [];
    return rawEvents.slice(0, 5).map(mapEventToRow);
  }, [rawEvents]);

  return (
    <section id="activity" className="scroll-mt-20 relative pt-10 sm:pt-14 lg:pt-16 pb-10 sm:pb-14 lg:pb-16 overflow-hidden bg-[#F0F6FD] border-b border-slate-200/80">
      {/* Background Artwork: Properly fitted without clipping the character */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/landing/activity-boy.webp"
          alt="Genesis Live Activity"
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover object-[98%_top] sm:object-[90%_center] lg:object-center"
        />
        {/* Soft linear gradient from left: keeps card and text readable while preserving character visibility */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-[65%] lg:w-[48%] bg-gradient-to-r from-[#F0F6FD] via-[#F0F6FD]/90 sm:via-[#F0F6FD]/75 to-transparent z-0" />
        <div className="absolute inset-x-0 top-0 h-16 sm:h-28 bg-gradient-to-b from-white via-white/80 to-transparent z-0" />
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-32 bg-gradient-to-t from-white via-white/60 to-transparent z-0" />
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Header Block — Clean, compact typography, aligned left on mobile so the boy on right is clearly visible */}
        <div className="text-left sm:text-center max-w-[240px] min-[360px]:max-w-[260px] sm:max-w-2xl sm:mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/85 border border-blue-200/80 shadow-xs backdrop-blur-md mb-2 sm:mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#155EEF] uppercase font-inter">
              LIVE ACTIVITY
            </span>
          </div>
          <h2 className="text-xl min-[360px]:text-2xl sm:text-3xl lg:text-[42px] font-bold uppercase text-[#0B132B] leading-tight tracking-tight">
            The Genesis Queue Is<br />
            <span className="text-[#155EEF]">Always Moving.</span>
          </h2>
          <p className="mt-1.5 sm:mt-2.5 text-[11px] min-[360px]:text-xs sm:text-base text-[#475467] leading-relaxed">
            Track seat deposits, queue distributions, and Genesis DAO activity in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          {/* Activity Card — Compact and left-aligned on small screens to let the background artwork shine */}
          <div className="lg:col-span-7 xl:col-span-7 relative z-20 w-full max-w-[280px] min-[360px]:max-w-[300px] min-[400px]:max-w-[325px] sm:max-w-none mr-auto">
            <div className="bg-white/85 sm:bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_16px_40px_rgba(15,23,42,0.08)] rounded-2xl sm:rounded-[32px] p-3.5 sm:p-6 lg:p-8">
              {/* Card header */}
              <div className="flex items-center justify-between pb-3 sm:pb-5 border-b border-slate-100/90">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#155EEF] animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-[#0B132B] uppercase">LIVE</span>
                  <span className="h-3.5 w-px bg-slate-300" />
                  <span className="text-[11px] sm:text-sm font-semibold text-[#475467]">Genesis DAO Activity</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-[#475467]">
                  {loading
                    ? <Loader2 className="w-3 h-3 animate-spin text-[#155EEF]" />
                    : <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#12B76A]" />
                  }
                  <span className="hidden min-[380px]:inline">Updating in real-time</span>
                </div>
              </div>

              {/* Activity rows */}
              <div className="divide-y divide-slate-100/80">
                {loading && rows.length === 0 ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="py-2.5 sm:py-3.5 flex items-center justify-between gap-2.5 animate-pulse px-1 sm:px-2">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-200" />
                        <div className="space-y-1">
                          <div className="w-20 sm:w-28 h-3 sm:h-3.5 bg-slate-200 rounded" />
                          <div className="w-28 sm:w-40 h-2 sm:h-2.5 bg-slate-100 rounded" />
                        </div>
                      </div>
                      <div className="w-12 sm:w-16 h-3 bg-slate-100 rounded" />
                    </div>
                  ))
                ) : rows.length === 0 ? (
                  <div className="py-8 sm:py-10 text-center space-y-1.5 sm:space-y-2">
                    <div className="text-xs sm:text-sm font-semibold text-[#0B132B]">No Live Activity Yet</div>
                    <div className="text-[10px] sm:text-xs text-slate-500 max-w-xs mx-auto">
                      Transactions and seat allocations will stream here in real-time as they are broadcast.
                    </div>
                  </div>
                ) : (
                  rows.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="py-2 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 hover:bg-white/50 px-1 sm:px-2 rounded-xl sm:rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1 pr-1.5 sm:pr-2">
                        <div className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center shrink-0 ${item.iconBg}`}>
                          {item.iconEl}
                        </div>
                        <div className={`md:hidden w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${item.iconBgMobile}`}>
                          {item.iconElMobile}
                        </div>
                        <div className="min-w-0 space-y-0.5 flex-1">
                          <div className="text-[11px] sm:text-sm font-semibold text-[#0B132B] truncate">{item.title}</div>
                          <div className="text-[9px] sm:text-xs text-[#64748B] truncate">{item.subtitle}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {item.highlight
                          ? <span className={`text-[11px] sm:text-sm font-bold tabular-nums whitespace-nowrap ${item.highlightColor}`}>{item.highlight}</span>
                          : <span className="text-[9px] sm:text-[11px] text-[#94A3B8] tabular-nums whitespace-nowrap">{item.timeAgo}</span>
                        }
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Card footer */}
              <div className="pt-3 sm:pt-6 mt-1 border-t border-slate-100/90 text-center">
                <Link
                  href="/dao/transactions"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full bg-white/80 hover:bg-white text-[11px] sm:text-sm font-semibold font-inter text-[#0B132B] border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200"
                >
                  <span>View More Activity</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#475467]" />
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 h-[520px] pointer-events-none" />
        </div>

      </div>
    </section>
  );
};
