'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { ArrowRight, User, Coins, TrendingUp, RotateCcw, Loader2 } from 'lucide-react';
import { useDaoStats, useDaoEvents, type DaoEventData } from '@/hooks/useApi';

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

function shortAddress(addr: string | null): string {
  if (!addr) return 'Protocol';
  if (addr.startsWith('T') && addr.length > 10) return addr.slice(0, 6) + '…' + addr.slice(-4);
  if (addr.startsWith('0x') && addr.length > 10) return addr.slice(0, 6) + '…' + addr.slice(-4);
  return addr;
}

function mapEventToRow(evt: DaoEventData): ActivityRow {
  const short = shortAddress(evt.userAddress);
  const timeAgo = timeAgoLabel(evt.timestamp);

  switch (evt.eventType) {
    case 'joined':
      return {
        id: evt.id,
        title: 'Seat Claimed',
        subtitle: `Genesis Seat #${evt.incomingPosition ?? '?'} claimed • ${short}`,
        highlight: null,
        highlightColor: '',
        timeAgo,
        iconEl:       <User className="w-4 h-4 text-[#155EEF]" />,
        iconBg:       'bg-[#EFF6FF] border border-[#BFDBFE]/50',
        iconBgMobile: 'bg-[#EFF6FF] border border-[#BFDBFE]/60',
        iconElMobile: <User className="w-4 h-4 text-[#155EEF]" />,
      };
    case 'pushed':
      return {
        id: evt.id,
        title: 'Queue Distribution',
        subtitle: `Distributed to queue • Seat #${evt.incomingPosition ?? '?'}`,
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
        subtitle: `Fallback dividend claimed by ${short}`,
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
        title: 'Queue Closed',
        subtitle: 'Genesis DAO Council is now complete',
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
        title: evt.eventType.replace(/_/g, ' '),
        subtitle: short,
        highlight: evt.amountBtt > 0 ? formatAmount(evt.amountBtt, evt.amountUsdEstimate) : null,
        highlightColor: 'text-[#155EEF]',
        timeAgo,
        iconEl:       <Coins className="w-4 h-4 text-[#155EEF]" />,
        iconBg:       'bg-[#EFF6FF] border border-[#BFDBFE]/50',
        iconBgMobile: 'bg-[#EFF6FF] border border-[#BFDBFE]/60',
        iconElMobile: <Coins className="w-4 h-4 text-[#155EEF]" />,
      };
  }
}

// ─── Fallback static rows (used while API loads) ──────────────────────────────
const STATIC_ROWS: ActivityRow[] = [
  {
    id: 's1', title: 'Seat Claimed', subtitle: 'Genesis Seat #86 claimed • Member #1042',
    highlight: null, highlightColor: '', timeAgo: 'just now',
    iconEl: <User className="w-4 h-4 text-[#155EEF]" />, iconBg: 'bg-[#EFF6FF] border border-[#BFDBFE]/50',
    iconBgMobile: 'bg-[#EFF6FF] border border-[#BFDBFE]/60', iconElMobile: <User className="w-4 h-4 text-[#155EEF]" />,
  },
  {
    id: 's2', title: 'Queue Distribution', subtitle: 'From Seat #85 → Distributed to queue',
    highlight: '+164.91 TROB', highlightColor: 'text-[#12B76A]', timeAgo: '18s ago',
    iconEl: <Coins className="w-4 h-4 text-[#155EEF]" />, iconBg: 'bg-[#EFF6FF] border border-[#BFDBFE]/50',
    iconBgMobile: 'bg-[#ECFDF5] border border-[#A7F3D0]/60', iconElMobile: <Coins className="w-4 h-4 text-[#12B76A]" />,
  },
  {
    id: 's3', title: 'Seat Claimed', subtitle: 'Genesis Seat #85 claimed • Member #0987',
    highlight: null, highlightColor: '', timeAgo: '1m ago',
    iconEl: <User className="w-4 h-4 text-[#155EEF]" />, iconBg: 'bg-[#EFF6FF] border border-[#BFDBFE]/50',
    iconBgMobile: 'bg-[#EFF6FF] border border-[#BFDBFE]/60', iconElMobile: <User className="w-4 h-4 text-[#155EEF]" />,
  },
  {
    id: 's4', title: 'Cap Reached', subtitle: 'Member #1038 reached 5X earnings cap',
    highlight: '1,500 TROB', highlightColor: 'text-[#6172F3]', timeAgo: '2m ago',
    iconEl: <TrendingUp className="w-4 h-4 text-[#155EEF]" />, iconBg: 'bg-[#EFF6FF] border border-[#BFDBFE]/50',
    iconBgMobile: 'bg-[#EEF4FF] border border-[#C7D7FE]/60', iconElMobile: <TrendingUp className="w-4 h-4 text-[#4F46E5]" />,
  },
  {
    id: 's5', title: 'Re-Top Up', subtitle: 'Seat #82 re-top-up completed • $300 TROB',
    highlight: null, highlightColor: '', timeAgo: '5m ago',
    iconEl: <RotateCcw className="w-4 h-4 text-[#155EEF]" />, iconBg: 'bg-[#EFF6FF] border border-[#BFDBFE]/50',
    iconBgMobile: 'bg-[#FEF6EE] border border-[#FDE68A]/60', iconElMobile: <RotateCcw className="w-4 h-4 text-[#F79009]" />,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export const LandingLiveActivity: React.FC = () => {
  // Poll every 10 seconds for live events
  const { data: rawEvents, loading } = useDaoEvents(10, 10_000);
  const { data: stats }              = useDaoStats();

  const rows: ActivityRow[] = useMemo(() => {
    if (!rawEvents || rawEvents.length === 0) return STATIC_ROWS;
    return rawEvents.slice(0, 5).map(mapEventToRow);
  }, [rawEvents]);

  const filledSeats    = stats?.memberCount ?? 86;
  const remainingSeats = stats?.remainingPositions ?? 14;

  return (
    <section id="activity" className="relative pt-24 pb-20 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-36 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image src="/landing/activity-boy.png" alt="Genesis Live Activity" fill priority
          className="object-cover object-[80%_0%] sm:object-[78%_center] lg:object-center" />
        <div className="absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-white via-white/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 sm:h-44 bg-gradient-to-t from-white via-white/60 to-transparent" />
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="text-[12px] sm:text-[13px] font-bold font-inter text-[#155EEF] uppercase tracking-widest mb-2.5">
            LIVE ACTIVITY
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[50px] font-bold font-inter text-[#0B132B] leading-[1.12] tracking-tight">
            The Genesis Queue Is<br />
            <span className="text-[#155EEF]">Always Moving.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#475467] font-inter max-w-xl mx-auto leading-relaxed">
            Track seat claims, queue distributions, and Genesis DAO activity in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          {/* Activity Card */}
          <div className="lg:col-span-7 xl:col-span-7 relative z-20">
            <div className="bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 lg:p-8">
              {/* Card header */}
              <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-slate-100/90">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#155EEF] animate-pulse" />
                  <span className="text-xs sm:text-sm font-black font-inter tracking-wider text-[#0B132B] uppercase">LIVE</span>
                  <span className="h-3.5 w-px bg-slate-300" />
                  <span className="text-xs sm:text-sm font-semibold font-inter text-[#475467]">Genesis DAO Activity</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium font-inter text-[#475467]">
                  {loading
                    ? <Loader2 className="w-3 h-3 animate-spin text-[#155EEF]" />
                    : <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
                  }
                  <span>{loading ? 'Syncing…' : 'Updating in real-time'}</span>
                </div>
              </div>

              {/* Activity rows */}
              <div className="divide-y divide-slate-100/80">
                {rows.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-white/40 px-1 sm:px-2 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      <div className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center shrink-0 ${item.iconBg}`}>
                        {item.iconEl}
                      </div>
                      <div className={`md:hidden w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.iconBgMobile}`}>
                        {item.iconElMobile}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-xs sm:text-[14px] font-bold text-[#0B132B] font-inter">{item.title}</div>
                        <div className="text-[11px] sm:text-xs text-[#64748B] font-inter truncate">{item.subtitle}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {item.highlight
                        ? <span className={`text-xs font-bold font-inter ${item.highlightColor}`}>{item.highlight}</span>
                        : <span className="text-[11px] text-[#94A3B8] font-inter">{item.timeAgo}</span>
                      }
                    </div>
                  </div>
                ))}
              </div>

              {/* Card footer */}
              <div className="pt-4 sm:pt-6 mt-1 border-t border-slate-100/90 text-center">
                <button type="button"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/70 hover:bg-white text-xs sm:text-sm font-semibold font-inter text-[#0B132B] border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200">
                  <span>View More Activity</span>
                  <ArrowRight className="w-4 h-4 text-[#475467]" />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 h-[520px] pointer-events-none" />
        </div>

        {/* Mobile stats capsule */}
        <div className="block lg:hidden mt-6 sm:mt-8 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md max-w-sm sm:max-w-md mx-auto grid grid-cols-3 divide-x divide-slate-100 text-center">
          <div className="px-2">
            <div className="text-xl sm:text-2xl font-black font-sora text-[#0B132B]">{filledSeats}</div>
            <div className="text-[10px] sm:text-xs text-[#64748B] font-medium font-inter mt-0.5">Filled Seats</div>
          </div>
          <div className="px-2">
            <div className="text-xl sm:text-2xl font-black font-sora text-[#12B76A]">{remainingSeats}</div>
            <div className="text-[10px] sm:text-xs text-[#64748B] font-medium font-inter mt-0.5">Remaining</div>
          </div>
          <div className="px-2">
            <div className="text-xl sm:text-2xl font-black font-sora text-[#0B132B]">100</div>
            <div className="text-[10px] sm:text-xs text-[#64748B] font-medium font-inter mt-0.5">Total Seats</div>
          </div>
        </div>
      </div>
    </section>
  );
};
