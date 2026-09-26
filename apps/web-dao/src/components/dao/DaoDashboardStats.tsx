'use client';

/**
 * DaoDashboardStats — live stat cards for the DAO Dashboard page.
 * Displays Genesis Queue vacancy, Phase 1 countdown, and the user's personal seat capital data.
 */

import React, { useEffect, useState } from 'react';
import { Users, Clock, ShieldCheck, Wallet } from 'lucide-react';
import { useDaoStats, useTrobPrice, useDaoMember } from '@/hooks/useApi';
import { useAuthContext } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';

// Simple countdown hook that ticks every second
function useCountdown(targetSeconds: number) {
  const [remaining, setRemaining] = useState(targetSeconds);
  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return { d, h, m, s };
}

export function DaoDashboardStats() {
  const { data: stats } = useDaoStats(30_000);
  const { data: price } = useTrobPrice(30_000);
  const auth = useAuthContext();
  const wallet = useWallet();
  const activeAddress = wallet.base58Address || wallet.hexAddress;
  const { data: memberData } = useDaoMember(activeAddress);

  // Phase 1 ends in ~18 days from now
  const PHASE1_DURATION_S = parseInt(
    process.env.NEXT_PUBLIC_PHASE1_SECONDS ?? String(18 * 86400 + 14 * 3600 + 22 * 60 + 10),
    10
  );
  const cd = useCountdown(PHASE1_DURATION_S);

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
    <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 snap-x snap-mandatory scroll-smooth no-scrollbar">

      {/* ── Card 1: Seats Vacant & Queue Progress ────────────────────── */}
      <div className="min-w-[280px] xs:min-w-[300px] md:min-w-0 flex-1 snap-start p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.07)] transition-all flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B1528] text-white flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-xs font-bold text-slate-600 font-jakarta">
              Genesis Queue Status
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#155EEF] bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
            {seatsFilled} Claimed
          </span>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-black font-jakarta text-[#0B132B] tracking-tight">
            {seatsRemaining}{' '}
            <span className="text-base sm:text-lg text-slate-500 font-semibold">Vacant / 100</span>
          </div>
          <p className="text-xs text-slate-500 font-jakarta mt-1">
            Fixed 100 sovereign seat governance supply
          </p>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-gradient-to-r from-[#155EEF] to-[#2563EB] rounded-full transition-all duration-700 shadow-xs"
              style={{ width: `${Math.max(2, filledPct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>{filledPct}% filled</span>
            <span className="text-emerald-700 font-bold">{seatsRemaining} seats remaining</span>
          </div>
        </div>
      </div>

      {/* ── Card 2: Countdown Timer ──────────────────────────────────── */}
      <div className="min-w-[280px] xs:min-w-[300px] md:min-w-0 flex-1 snap-start p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.07)] transition-all flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 font-jakarta">Genesis Phase 1 Window</span>
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
            Active
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          {[
            { val: cd.d, label: 'DAYS' },
            { val: cd.h, label: 'HOURS' },
            { val: cd.m, label: 'MINS' },
            { val: cd.s, label: 'SECS' },
          ].map((seg, i, arr) => (
            <React.Fragment key={seg.label}>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-black font-jakarta text-[#0B132B] tabular-nums">
                  {String(seg.val).padStart(2, '0')}
                </div>
                <div className="text-[9px] lg:text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                  {seg.label}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className="text-base lg:text-lg font-bold text-slate-300 -mt-3">:</div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-jakarta border-t border-slate-100 pt-2 flex items-center justify-between">
          <span>Target Distribution</span>
          <span className="font-bold text-[#0B132B]">Autonomous P2P</span>
        </div>
      </div>

      {/* ── Card 3: User's Council Position & Personal Data ───────────── */}
      <div className="min-w-[300px] xs:min-w-[320px] md:min-w-0 flex-1 snap-start p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.07)] transition-all flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
              isMember
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {isMember ? <ShieldCheck className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
            </div>
            <span className="text-xs font-bold text-slate-600 font-jakarta">
              {isMember ? 'Your Council Position' : 'Your Membership Status'}
            </span>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            isMember
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {isMember ? `Seat #${myPosition}` : 'Unclaimed'}
          </span>
        </div>

        {isMember ? (
          /* Real Data for Council Member */
          <div className="grid grid-cols-3 gap-2 pt-1 text-left">
            <div>
              <div className="text-sm sm:text-base font-black font-jakarta text-[#0B132B] truncate">
                $300.00
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                Initial Deposit
              </div>
            </div>
            <div>
              <div className="text-sm sm:text-base font-black font-jakarta text-emerald-600 truncate">
                +${myCashback}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                Instant Cashback
              </div>
            </div>
            <div>
              <div className="text-sm sm:text-base font-black font-jakarta text-[#0B132B] truncate">
                ${myNetCost}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                Net Deployed
              </div>
            </div>
          </div>
        ) : (
          /* Clean Non-Member Overview */
          <div className="grid grid-cols-3 gap-2 pt-1 text-left">
            <div>
              <div className="text-sm sm:text-base font-black font-jakarta text-[#0B132B]">
                $300.00
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                Seat Entry
              </div>
            </div>
            <div>
              <div className="text-sm sm:text-base font-black font-jakarta text-emerald-600">
                300 / N
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                Instant Cashback
              </div>
            </div>
            <div>
              <div className="text-sm sm:text-base font-black font-jakarta text-[#0B132B]">
                1.0%
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                Voting Power
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-jakarta">
          <span className="text-slate-500">
            {isMember
              ? (myNftId ? `Soulbound NFT #${myNftId}` : 'Active Council Member')
              : 'Council Seats Available'}
          </span>
          <span className="text-[#155EEF] font-bold">
            {isMember ? '25% APY + Matrix' : `${seatsRemaining} open to claim`}
          </span>
        </div>
      </div>
    </div>
  );
}
