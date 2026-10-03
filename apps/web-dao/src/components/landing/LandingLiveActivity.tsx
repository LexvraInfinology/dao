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

function parseUtcTimestamp(ts: string | number | Date | null | undefined): number {
  if (!ts) return Date.now();
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'number') return ts;
  const s = String(ts).trim();
  if (s.endsWith('Z') || s.includes('+') || (s.lastIndexOf('-') > 10)) {
    return new Date(s).getTime();
  }
  return new Date(s.replace(' ', 'T') + 'Z').getTime();
}

function timeAgoLabel(ts: string): string {
  const diff = Date.now() - parseUtcTimestamp(ts);
  const s = Math.max(0, Math.floor(diff / 1000));
  if (s < 10)  return 'just now';
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
          className="object-cover object-[92%_top] sm:object-[90%_center] lg:object-[right_center] xl:object-right"
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Header Block — Clean, responsive, high contrast */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-blue-200/90 shadow-sm backdrop-blur-md mb-2 sm:mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#155EEF] uppercase font-inter">
              LIVE ACTIVITY
            </span>
          </div>
          <h2 className="text-xl min-[360px]:text-2xl sm:text-3xl lg:text-[42px] font-extrabold uppercase text-[#0B132B] leading-tight tracking-tight drop-shadow-[0_1px_8px_rgba(255,255,255,0.75)]">
            The Genesis Queue Is<br />
            <span className="text-[#155EEF]">Always Moving.</span>
          </h2>
          <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-base text-[#1D2939] font-medium leading-relaxed drop-shadow-[0_1px_6px_rgba(255,255,255,0.85)] max-w-xl mx-auto">
            Track seat deposits, queue distributions, and Genesis DAO activity in real time.
          </p>
        </div>

        {/* Responsive Grid: Wide, spacious card on laptops and fully fluid on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center max-w-[1400px] mx-auto">
          {/* Activity Card — Wide, luxurious layout on laptops, fully responsive on mobile */}
          <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-8 relative z-20 w-full max-w-2xl lg:max-w-none mx-auto lg:mx-0">
            <div className="bg-white/90 sm:bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.08)] rounded-2xl sm:rounded-[32px] p-4 sm:p-6 lg:p-8">
              {/* Card header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100/90">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#155EEF] animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-[#0B132B] uppercase">LIVE</span>
                  <span className="h-3.5 w-px bg-slate-300" />
                  <span className="text-[11px] sm:text-sm font-bold text-[#1E293B]">Genesis DAO Activity</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-[#475467]">
                  {loading
                    ? <Loader2 className="w-3 h-3 animate-spin text-[#155EEF]" />
                    : <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#12B76A]" />
                  }
                  <span className="hidden min-[360px]:inline">Updating in real-time</span>
                </div>
              </div>

              {/* Activity rows */}
              <div className="divide-y divide-slate-100/80">
                {loading && rows.length === 0 ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="py-2.5 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-3 animate-pulse px-1 sm:px-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 shrink-0" />
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="w-28 sm:w-48 h-3.5 bg-slate-200 rounded" />
                          <div className="w-20 sm:w-36 h-2.5 bg-slate-100 rounded" />
                        </div>
                      </div>
                      <div className="w-14 sm:w-24 h-4 bg-slate-100 rounded shrink-0" />
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
                  rows.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="py-2 min-[360px]:py-2.5 sm:py-3.5 flex items-center justify-between gap-2 min-[360px]:gap-3 sm:gap-5 hover:bg-white/60 px-0.5 sm:px-2 rounded-xl sm:rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-2 min-[360px]:gap-2.5 sm:gap-4 min-w-0 flex-1">
                        <div className={`w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
                          {item.iconEl}
                        </div>
                        <div className="min-w-0 space-y-0.5 flex-1">
                          <div className="text-xs sm:text-sm md:text-base font-bold text-[#0B132B] truncate tracking-tight">
                            {item.title}
                          </div>
                          <div className="text-[10px] sm:text-xs text-[#64748B] truncate font-mono sm:font-sans">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 min-w-[62px] min-[360px]:min-w-[72px] sm:min-w-[85px] pl-1.5 sm:pl-3">
                        {item.highlight ? (
                          <div className="flex flex-col items-end">
                            <span className={`text-xs sm:text-sm md:text-base font-black tabular-nums tracking-tight whitespace-nowrap ${item.highlightColor}`}>
                              {item.highlight}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-[#94A3B8] tabular-nums whitespace-nowrap">
                              {item.timeAgo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] sm:text-xs text-[#94A3B8] tabular-nums whitespace-nowrap">
                            {item.timeAgo}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Card footer */}
              <div className="pt-3 sm:pt-5 mt-1 border-t border-slate-100/90 text-center">
                <Link
                  href="/dao/transactions"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/90 hover:bg-white text-[11px] sm:text-sm font-semibold font-inter text-[#0B132B] border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200"
                >
                  <span>View More Activity</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#475467]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right column placeholder: Leaves character clearly visible on wide laptop screens */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-4 h-[440px] pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
