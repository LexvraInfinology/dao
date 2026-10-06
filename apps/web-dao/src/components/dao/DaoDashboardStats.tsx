'use client';

/**
 * DaoDashboardStats — live stat cards for the DAO Dashboard page.
 * Responsive, tightly packed layout styled with the Trobium design system.
 */

import React, { useEffect, useState, useRef } from 'react';
import { Users, Clock, ShieldCheck, Wallet, Shield } from 'lucide-react';
import { useDaoStats, useTrobPrice, useDaoMember } from '@/hooks/useApi';
import { useAuthContext } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';

// Persistent countdown timer matching 21 days founding window
function useCountdown() {
  const INITIAL_SECONDS = 21 * 86400 + 14 * 3600 + 22 * 60 + 10;
  const [remaining, setRemaining] = useState(INITIAL_SECONDS);

  useEffect(() => {
    const STORAGE_KEY = 'equora_matrix_target_timestamp';
    let target = 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        target = parseInt(stored, 10);
      }
    } catch {}

    if (!target || isNaN(target) || target <= Date.now()) {
      target = Date.now() + INITIAL_SECONDS * 1000;
      try {
        localStorage.setItem(STORAGE_KEY, String(target));
      } catch {}
    }

    const tick = () => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setRemaining(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [INITIAL_SECONDS]);

  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return { d, h, m, s };
}

export function DaoDashboardStats() {
  const { data: stats, loading: statsLoading } = useDaoStats(30_000);
  const { data: price } = useTrobPrice(30_000);
  const auth = useAuthContext();
  const wallet = useWallet();
  const activeAddress = wallet.base58Address || wallet.hexAddress;
  const { data: memberData } = useDaoMember(activeAddress);

  const cd = useCountdown();

  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveSlide(Math.min(2, Math.max(0, idx)));
  };

  const scrollToSlide = (idx: number) => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
    setActiveSlide(idx);
  };

  const isStatsLoaded = stats !== null && stats !== undefined && (!statsLoading || (stats.memberCount || 0) > 0);
  const seatsFilled = stats?.memberCount ?? 0;
  const seatsRemaining = stats?.remainingPositions ?? Math.max(0, 100 - seatsFilled);
  const filledPct = Math.min(100, Math.round((seatsFilled / 100) * 100));

  // User's own seat details
  const myPosition = memberData?.position ?? auth.user?.daoPosition ?? null;
  const isMember = memberData?.isMember ?? !!myPosition;
  const myNftId = memberData?.nftTokenId ?? null;

  // Member's exact economics if they own a seat
  const myCashback = myPosition ? (300 / myPosition).toFixed(2) : null;
  const myNetCost = myPosition ? (300 - 300 / myPosition).toFixed(2) : null;

  return (
    <div className="w-full space-y-2.5">
      {/* Mobile Tab Selector (Visible on small screens, hidden on sm+) */}
      <div className="flex sm:hidden p-1 bg-[#EFF6FF] border border-[#0E62E4]/15 rounded-xl text-xs font-semibold font-jakarta shadow-2xs">
        <button
          type="button"
          onClick={() => scrollToSlide(0)}
          className={`flex-1 py-1.5 px-1.5 rounded-lg text-center transition-all truncate text-[11px] min-[360px]:text-xs ${
            activeSlide === 0
              ? 'bg-[#0E62E4] text-white font-bold shadow-xs'
              : 'text-[#4F6D87] hover:text-[#0E62E4]'
          }`}
        >
          Genesis Council
        </button>
        <button
          type="button"
          onClick={() => scrollToSlide(1)}
          className={`flex-1 py-1.5 px-1.5 rounded-lg text-center transition-all truncate text-[11px] min-[360px]:text-xs ${
            activeSlide === 1
              ? 'bg-[#0E62E4] text-white font-bold shadow-xs'
              : 'text-[#4F6D87] hover:text-[#0E62E4]'
          }`}
        >
          Genesis Window
        </button>
        <button
          type="button"
          onClick={() => scrollToSlide(2)}
          className={`flex-1 py-1.5 px-1.5 rounded-lg text-center transition-all truncate text-[11px] min-[360px]:text-xs ${
            activeSlide === 2
              ? 'bg-[#0E62E4] text-white font-bold shadow-xs'
              : 'text-[#4F6D87] hover:text-[#0E62E4]'
          }`}
        >
          {isMember ? 'Council Seat' : 'Membership'}
        </button>
      </div>

      <div
        ref={sliderRef}
        onScroll={handleScroll}
        className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0 snap-x snap-mandatory scroll-smooth no-scrollbar w-full"
      >
        {/* ── Card 1: Seats Vacant & Queue Status ────────────────────── */}
        <div className="w-full sm:w-auto shrink-0 snap-center p-3.5 sm:p-5 rounded-2xl bg-white border border-[#0E62E4]/18 shadow-[0_4px_16px_rgba(14,98,228,0.06)] flex flex-col justify-between space-y-2.5 sm:space-y-3.5 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#0E62E4]/10 text-[#0E62E4] shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#17334F]">
                Genesis Council
              </span>
            </div>
            <span className={`text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
              seatsFilled >= 100
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-[#0E62E4]/10 text-[#0E62E4] border-[#0E62E4]/20'
            }`}>
              {!isStatsLoaded ? 'Syncing...' : seatsFilled >= 100 ? 'Queue Filled' : 'Queue Active'}
            </span>
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#17334F] tabular-nums tracking-tight">
              {!isStatsLoaded ? (
                <span className="inline-block w-36 h-7 bg-[#EFF6FF] rounded animate-pulse" />
              ) : seatsFilled >= 100 ? (
                '100 / 100 Filled'
              ) : (
                `${seatsRemaining} Seats Open`
              )}
            </div>
            <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] text-[#4F6D87] mt-1 font-medium">
              {!isStatsLoaded ? (
                <>
                  <span className="inline-block w-20 h-3.5 bg-[#EFF6FF] rounded animate-pulse" />
                  <span className="inline-block w-12 h-3.5 bg-[#EFF6FF] rounded animate-pulse" />
                </>
              ) : (
                <>
                  <span>{seatsFilled} / 100 Claimed</span>
                  <span>{filledPct}% Filled</span>
                </>
              )}
            </div>
            {/* Subtle Progress Bar */}
            <div className="w-full h-1.5 bg-[#EFF6FF] rounded-full overflow-hidden mt-1.5 sm:mt-2 border border-[#0E62E4]/10">
              <div
                className={`h-full bg-gradient-to-r from-[#0E62E4] to-[#0B52C4] rounded-full transition-all duration-500 ${!isStatsLoaded ? 'animate-pulse' : ''}`}
                style={{ width: `${!isStatsLoaded ? 15 : Math.max(5, filledPct)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#0E62E4]/10 flex items-center justify-between text-[9.5px] sm:text-[10px] text-[#4F6D87]">
            <span className="truncate">Autonomous FIFO Queue</span>
            <span className="text-[#1F8A5B] font-semibold flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F8A5B] animate-pulse" />
              Live &bull; Instant P2P
            </span>
          </div>
        </div>

        {/* ── Card 2: Countdown Timer ──────────────────────────────────── */}
        <div className="w-full sm:w-auto shrink-0 snap-center p-3.5 sm:p-5 rounded-2xl bg-white border border-[#0E62E4]/18 shadow-[0_4px_16px_rgba(14,98,228,0.06)] flex flex-col justify-between space-y-2.5 sm:space-y-3.5 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#0E62E4]/10 text-[#0E62E4] shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#17334F]">
                Genesis Window
              </span>
            </div>
            <span className="text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#0E62E4] bg-[#0E62E4]/10 border border-[#0E62E4]/20 px-2 py-0.5 rounded-md shrink-0">
              21-Day Window
            </span>
          </div>

          <div className="flex items-center justify-between px-1">
            {[
              { val: cd.d, label: 'DAYS' },
              { val: cd.h, label: 'HOURS' },
              { val: cd.m, label: 'MINS' },
              { val: cd.s, label: 'SECS' },
            ].map((seg, i, arr) => (
              <React.Fragment key={seg.label}>
                <div className="text-center flex-1">
                  <div className="text-lg min-[360px]:text-xl sm:text-2xl font-bold text-[#17334F] tabular-nums">
                    {String(seg.val).padStart(2, '0')}
                  </div>
                  <div className="text-[8.5px] sm:text-[9px] font-semibold text-[#5E7B94] tracking-wider uppercase mt-0.5">
                    {seg.label}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className="text-sm font-bold text-[#A9D1F1] -mt-3 sm:-mt-3.5 px-0.5 select-none">:</div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="pt-2 border-t border-[#0E62E4]/10 flex items-center justify-between text-[9.5px] sm:text-[10px] text-[#4F6D87]">
            <span>Retail Matrix</span>
            <span className="font-semibold text-[#0E62E4] truncate">Day 22 &bull; Launch</span>
          </div>
        </div>

        {/* ── Card 3: User's Council Position & Personal Data ───────────── */}
        <div className="w-full sm:w-auto shrink-0 snap-center p-3.5 sm:p-5 rounded-2xl bg-white border border-[#0E62E4]/18 shadow-[0_4px_16px_rgba(14,98,228,0.06)] flex flex-col justify-between space-y-2.5 sm:space-y-3.5 transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg shrink-0 ${
                isMember ? 'bg-[#1F8A5B]/10 text-[#1F8A5B]' : 'bg-[#0E62E4]/10 text-[#0E62E4]'
              }`}>
                {isMember ? <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#17334F] truncate">
                {isMember ? 'Council Position' : 'Membership Status'}
              </span>
            </div>

            <span className={`text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
              isMember
                ? 'bg-[#1F8A5B]/10 text-[#1F8A5B] border-[#1F8A5B]/25'
                : 'bg-[#0E62E4]/10 text-[#0E62E4] border-[#0E62E4]/20'
            }`}>
              {isMember ? `Seat #${myPosition}` : 'Open Entry'}
            </span>
          </div>

          {isMember ? (
            /* Member Live Economics */
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-0.5 text-left">
              <div className="p-1.5 min-[360px]:p-2 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/12">
                <div className="text-xs sm:text-sm font-bold text-[#17334F] truncate tabular-nums">
                  $300.00
                </div>
                <div className="text-[8.5px] sm:text-[9px] text-[#5E7B94] font-medium mt-0.5 uppercase tracking-wide">
                  Deposit
                </div>
              </div>
              <div className="p-1.5 min-[360px]:p-2 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/12">
                <div className="text-xs sm:text-sm font-bold text-[#1F8A5B] truncate tabular-nums">
                  +${myCashback}
                </div>
                <div className="text-[8.5px] sm:text-[9px] text-[#5E7B94] font-medium mt-0.5 uppercase tracking-wide">
                  Cashback
                </div>
              </div>
              <div className="p-1.5 min-[360px]:p-2 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/12">
                <div className="text-xs sm:text-sm font-bold text-[#17334F] truncate tabular-nums">
                  ${myNetCost}
                </div>
                <div className="text-[8.5px] sm:text-[9px] text-[#5E7B94] font-medium mt-0.5 uppercase tracking-wide">
                  Net Cost
                </div>
              </div>
            </div>
          ) : (
            /* Clean Non-Member Overview */
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-0.5 text-left">
              <div className="p-1.5 min-[360px]:p-2 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/12">
                <div className="text-xs sm:text-sm font-bold text-[#17334F] truncate tabular-nums">
                  $300
                </div>
                <div className="text-[8.5px] sm:text-[9px] text-[#5E7B94] font-medium mt-0.5 uppercase tracking-wide">
                  Entry Fee
                </div>
              </div>
              <div className="p-1.5 min-[360px]:p-2 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/12">
                <div className="text-xs sm:text-sm font-bold text-[#1F8A5B] truncate tabular-nums">
                  300 / N
                </div>
                <div className="text-[8.5px] sm:text-[9px] text-[#5E7B94] font-medium mt-0.5 uppercase tracking-wide">
                  Cashback
                </div>
              </div>
              <div className="p-1.5 min-[360px]:p-2 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/12">
                <div className="text-xs sm:text-sm font-bold text-[#17334F] truncate tabular-nums">
                  1.0%
                </div>
                <div className="text-[8.5px] sm:text-[9px] text-[#5E7B94] font-medium mt-0.5 uppercase tracking-wide">
                  Vote Power
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[#0E62E4]/10 flex items-center justify-between text-[9.5px] sm:text-[10px] text-[#4F6D87]">
            <span className="truncate">
              {isMember
                ? (myNftId ? `Soulbound SBT #${myNftId}` : 'Active Member')
                : 'Permanent Seat'}
            </span>
            <span className="font-semibold text-[#0E62E4] truncate">
              {isMember ? '35% Matrix Share' : 'Zero Referrals'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Slider Indicator Dots */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 pt-1 select-none">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            onClick={() => scrollToSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeSlide === idx ? 'w-5 bg-[#0E62E4]' : 'w-1.5 bg-[#CBD5E1]'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
