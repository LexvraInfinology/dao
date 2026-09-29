'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Shield,
  TrendingUp,
  Eye,
  Vote,
  Play,
  Calendar,
  CheckCircle2,
  Loader2,
  Wallet,
  Zap,
} from 'lucide-react';
import { VideoModal } from '@/components/ui/VideoModal';
import { DaoDashboardStats } from '@/components/dao/DaoDashboardStats';
import { useWallet } from '@/context/WalletContext';
import {
  useDaoMember,
  useDaoStats,
  useDaoEvents,
} from '@/hooks/useApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateAddress(addr: string, chars = 6): string {
  if (!addr || addr.length < chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-4)}`;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DaoDashboardPage() {
  const [videoOpen, setVideoOpen] = useState(false);

  // ── Live data hooks ─────────────────────────────────────────────────────────
  const wallet = useWallet();
  const activeAddress = wallet.base58Address || wallet.hexAddress;

  const { data: memberData, loading: memberLoading } = useDaoMember(activeAddress);
  const { data: stats } = useDaoStats(30_000);
  const { data: events } = useDaoEvents(5, 15_000);

  // ── Derived values ──────────────────────────────────────────────────────────
  const isMember = memberData?.isMember ?? false;
  const myPosition = memberData?.position ?? null;
  const myNftId = memberData?.nftTokenId ?? null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">

      {/* =======================================================================
          1. HERO SECTION — Member-Aware
         ======================================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E2ECF9] p-5 sm:p-8 lg:p-10 shadow-[0_4px_25px_rgba(15,23,42,0.03)]">
        <div className="ambient-glow top-0 right-1/4 w-96 h-96 bg-blue-400/10 pointer-events-none" />

        {/* --- DESKTOP HERO --- */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-center relative z-10">
          <div className="col-span-7 space-y-4">
            <div className="text-xs font-extrabold font-jakarta text-[#64748B] uppercase tracking-widest">
              WELCOME TO THE
            </div>

            <h1 className="text-4xl xl:text-[46px] font-black font-jakarta text-[#071A4A] tracking-tight leading-[1.12]">
              Genesis <span className="text-[#155EEF]">DAO</span> Council
            </h1>

            <h2 className="text-base xl:text-lg font-bold font-jakarta text-[#071A4A]">
              100 sovereign seats. One protocol. A stronger tomorrow.
            </h2>

            <p className="text-xs xl:text-sm text-[#4F6184] leading-relaxed font-jakarta max-w-lg">
              Be part of the founding 100 governing members of Equora. Secure your seat, earn from global matrix volume, and shape the future.
            </p>

            {/* ── CTA: Member vs Non-Member ── */}
            {memberLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <Loader2 className="w-4 h-4 animate-spin text-[#155EEF]" />
                <span>Checking membership…</span>
              </div>
            ) : isMember ? (
              /* Member CTA */
              <div className="space-y-3 pt-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>You Own Council Seat #{myPosition}</span>
                  {myNftId && <span className="text-emerald-700 text-xs font-normal">• SBT #{myNftId}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/dao/lounge"
                    className="px-6 py-3.5 rounded-full font-bold text-sm text-white bg-[#0B1528] hover:bg-[#132238] shadow-[0_4px_16px_rgba(11,21,40,0.25)] transition-all flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4 text-sky-400" />
                    <span>Open Member Lounge</span>
                  </Link>
                  <Link
                    href="/dao/seats"
                    className="px-5 py-3.5 rounded-full font-bold text-sm text-[#071A4A] bg-white hover:bg-slate-50 border border-slate-200/90 transition-all flex items-center gap-2 shadow-2xs"
                  >
                    <span>Explore Council Grid</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Non-member Overview CTA: Explore Grid & Learn More (No Claim Button on Dashboard) */
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
                <Link
                  href="/dao/seats"
                  className="px-6 py-3.5 rounded-full font-bold text-sm text-white bg-[#0B1528] hover:bg-[#132238] shadow-[0_4px_16px_rgba(11,21,40,0.25)] transition-all flex items-center gap-2"
                >
                  <span>Explore Council Grid</span>
                  <ArrowRight className="w-4 h-4 text-sky-400" />
                </Link>
                <Link
                  href="/dao/seats"
                  className="px-5 py-3.5 rounded-full font-bold text-sm text-[#071A4A] bg-white hover:bg-slate-50 border border-slate-200/90 transition-all flex items-center gap-2 shadow-2xs"
                >
                  <span>Council Protocol Details</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            )}

            {!isMember && !memberLoading && (
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Referrals Required • 100 Sovereign Seats</span>
              </div>
            )}
          </div>

          {/* Right 3D Visual */}
          <div className="col-span-5 relative flex items-center justify-end min-h-[300px]">
            <div className="absolute top-0 right-0 text-[10px] font-bold tracking-widest text-[#64748B] uppercase font-jakarta text-right leading-relaxed select-none">
              <div>PEOPLE</div>
              <div>PROTOCOL</div>
              <div>PROGRESS</div>
              <div className="pb-1">TOGETHER</div>
              <div className="w-7 h-[2px] bg-[#155EEF] ml-auto rounded-full" />
            </div>

            <div className="relative w-72 h-72 flex items-center justify-center mr-6">
              <img
                src="/dao/trobiumdashboard.png"
                alt="Trobium Accent Top"
                className="absolute -top-1 left-6 w-4 h-4 object-contain opacity-60 animate-pulse pointer-events-none"
              />
              <img
                src="/dao/trobiumdashboard.png"
                alt="Trobium Accent Bottom"
                className="absolute bottom-2 right-4 w-3.5 h-3.5 object-contain opacity-50 animate-pulse pointer-events-none"
              />
              <div className="absolute w-56 h-56 rounded-full border border-blue-200/40 -rotate-45 pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full border border-blue-200/30 rotate-12 pointer-events-none" />
              <div className="relative w-48 h-48 animate-float flex items-center justify-center">
                <img
                  src="/dao/trobiumdashboard.png"
                  alt="Genesis DAO 3D Trobium Emblem"
                  className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(37,99,235,0.20)]"
                />
              </div>
            </div>

            <div className="absolute bottom-0 right-0 text-[9px] font-semibold tracking-wider text-[#94A3B8] uppercase font-jakarta text-right leading-relaxed select-none">
              <div>DECENTRALIZED</div>
              <div>TRANSPARENT</div>
              <div>COMMUNITY OWNED</div>
            </div>
          </div>
        </div>

        {/* --- MOBILE HERO --- */}
        <div className="lg:hidden text-center space-y-4 relative z-10">
          <div className="text-[11px] font-extrabold font-jakarta text-[#64748B] uppercase tracking-wider">
            WELCOME TO THE
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black font-jakarta text-[#071A4A] tracking-tight">
            Genesis <span className="text-[#155EEF]">DAO</span> Council
          </h1>
          <p className="text-xs sm:text-sm font-bold font-jakarta text-[#071A4A] max-w-md mx-auto">
            100 sovereign seats. One protocol. A stronger tomorrow.
          </p>

          <div className="relative py-2 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 xs:w-48 xs:h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              <div className="absolute w-36 h-36 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
              <img
                src="/dao/trobiumdashboard.png"
                alt="Genesis DAO 3D Trobium Emblem"
                className="w-full h-full object-contain animate-float drop-shadow-[0_8px_20px_rgba(37,99,235,0.18)]"
              />
            </div>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 tracking-wide uppercase">
              DECENTRALIZED • TRANSPARENT
            </div>
          </div>

          <p className="text-xs text-[#4F6184] leading-relaxed font-jakarta max-w-md mx-auto">
            Be part of the founding 100 governing members. View council governance, live distributions, and treasury performance.
          </p>

          {/* Mobile CTA */}
          <div className="pt-2">
            {memberLoading ? (
              <div className="flex items-center justify-center gap-2 text-sm text-[#64748B] py-4">
                <Loader2 className="w-4 h-4 animate-spin text-[#155EEF]" />
                <span>Checking membership…</span>
              </div>
            ) : isMember ? (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Council Seat #{myPosition} — Active Member</span>
                </div>
                <Link
                  href="/dao/lounge"
                  className="w-full py-3.5 px-4 rounded-full font-bold text-xs sm:text-sm text-white bg-[#0B1528] hover:bg-[#132238] shadow-[0_4px_16px_rgba(11,21,40,0.25)] transition-all flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4 text-sky-400" />
                  <span>Open My Member Lounge</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/dao/seats"
                  className="w-full py-3.5 px-4 rounded-full font-bold text-xs sm:text-sm text-white bg-[#0B1528] hover:bg-[#132238] shadow-[0_4px_16px_rgba(11,21,40,0.25)] transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Council Grid</span>
                  <ArrowRight className="w-4 h-4 text-sky-400" />
                </Link>
                <Link
                  href="/dao/seats"
                  className="w-full py-3 px-4 rounded-full font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <span>Learn More</span>
                </Link>
              </div>
            )}
          </div>

          {!isMember && !memberLoading && (
            <div className="flex items-center justify-between text-xs font-semibold text-[#155EEF] pt-2 px-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#155EEF]" />
                <span>Zero Referrals Required</span>
              </div>
              <Link href="/dao/seats" className="hover:underline flex items-center gap-0.5">
                <span>Learn More</span>
                <span>&gt;</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================================
          2. STATS ROW — live data
         ======================================================================= */}
      <div>
        <div className="md:hidden flex items-center justify-between mb-3 px-1">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#60739A] font-jakarta">
            PROTOCOL METRICS
          </div>
          <div className="text-[11px] font-semibold text-[#155EEF] flex items-center gap-1">
            <span>Swipe cards</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
        <DaoDashboardStats />
      </div>

      {/* =======================================================================
          3. COUNCIL CAPITAL & POSITION LEDGER — 300/N Calculation Architecture
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Personal Position & Capital Breakdown */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.04)] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-jakarta">
                  FINANCIAL ARCHITECTURE
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-jakarta text-[#0B132B] mt-0.5">
                  {isMember ? 'Your Council Position & Capital Ledger' : 'Council Capital & 300 / N Economics'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full ${stats?.memberCount && stats.memberCount >= 100 ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-blue-50 border border-blue-200 text-[#155EEF]'} text-xs font-bold font-jakarta`}>
                  {stats?.memberCount && stats.memberCount >= 100 ? 'All Slots Filled' : 'DAO positions are vacant'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-jakarta leading-relaxed max-w-2xl">
              {isMember && myPosition
                ? `You hold Council Seat #${myPosition}. Review your initial gross deposit, instant algorithmic cashback received, and net deployed capital.`
                : 'All sovereign seats require a fixed deposit. Every member receives instant on-chain cashback calculated via the 300 / N protocol rule upon entering the queue.'}
            </p>

            {/* 300/N Calculation Architecture Grid — 4 items per Requirement 3 & 4 */}
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Deposit — In prominent Blue Box per Requirement 4 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#155EEF] to-[#004EEB] text-white border border-blue-400 shadow-md space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
                    <span>🔹</span>
                    <span>Deposit</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-sora text-white">
                    $300 TROB
                  </div>
                  <div className="text-[10px] text-blue-100/90 font-medium">
                    Fixed Protocol Entry
                  </div>
                </div>

                {/* 2. Instant Cashback */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#EFF8FF] border border-[#BFDBFE] text-[#071A4A] space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#155EEF] flex items-center gap-1.5">
                    <span>🔹</span>
                    <span>Instant cashback</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-jakarta text-emerald-600">
                    {isMember && myPosition ? `+$${(300 / myPosition).toFixed(2)}` : '300 / N'}
                  </div>
                  <div className="text-[10px] text-[#475467] font-medium font-mono">
                    {isMember && myPosition ? `$300 / Seat #${myPosition}` : 'Direct on-chain cashback'}
                  </div>
                </div>

                {/* 3. Total Inflow (Formula: Total Received Return) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#071A4A] space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#027A48] flex items-center gap-1.5">
                    <span>🔹</span>
                    <span>Total Inflow</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-jakarta text-[#027A48]">
                    {isMember && myPosition
                      ? `+$${((300 / myPosition) + (memberData?.pushedAmountUsdEstimate ?? 0)).toFixed(2)}`
                      : 'Total Return'}
                  </div>
                  <div className="text-[10px] text-[#475467] font-medium">
                    *Formula*: Total Received Return (Continuous Cash Flow)
                  </div>
                </div>

                {/* 4. Max Inflow — $1,500 Trob */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-[#071A4A] space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#475467] flex items-center gap-1.5">
                    <span>🔹</span>
                    <span>Max Inflow</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-jakarta text-[#0B132B]">
                    $1,500 Trob
                  </div>
                  <div className="text-[10px] text-[#64748B] font-medium">
                    500% Baseline Return Cap (5X)
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-jakarta">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-[#0B132B]">
                    {isMember && myPosition ? `Council Seat #${myPosition}:` : 'Council Membership Status:'}
                  </span>
                  <span className="text-slate-600">
                    {isMember && myPosition
                      ? `Active Member · Soulbound ${myNftId ? `SBT #${myNftId}` : 'Pass'}`
                      : (stats?.memberCount && stats.memberCount >= 100 ? 'All Slots Filled' : 'DAO positions are vacant')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    1.0% Voting Weight
                  </span>
                  {isMember ? (
                    <Link
                      href="/dao/lounge"
                      className="font-bold text-[#155EEF] hover:underline flex items-center gap-1"
                    >
                      <span>Member Lounge</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href="/dao/seats"
                      className="font-bold text-[#155EEF] hover:underline flex items-center gap-1"
                    >
                      <span>Inspect Grid</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Why Join */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-6 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-jakarta">
              GOVERNANCE PRINCIPLES
            </span>
            <h3 className="text-lg sm:text-xl font-black font-jakarta text-[#0B132B] mt-0.5">
              Why Join the Genesis DAO?
            </h3>

            <div className="space-y-4 pt-4">
              {[
                { icon: Shield, title: 'Fixed 100-Seat Supply', desc: 'No 101st seat can ever be created.' },
                { icon: TrendingUp, title: 'Dual Cash Flow Streams', desc: '300/N queue + 35% global matrix volume.' },
                { icon: Eye, title: 'On-Chain Transparency', desc: 'All data verifiable on blockchain.' },
                { icon: Vote, title: 'Governance & Voting Rights', desc: '1 Seat = 1 Vote (1.0% voting power).' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold font-jakarta text-[#0B132B]">{title}</h4>
                    <p className="text-xs text-slate-500 font-jakarta leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          4. RECENT ACTIVITY FEED — live real events
         ======================================================================= */}
      {events && events.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <h3 className="text-sm font-bold font-jakarta text-[#071A4A]">Live Council Activity</h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Real-Time
              </span>
            </div>
            <Link href="/dao/transactions" className="text-xs font-semibold text-[#155EEF] hover:underline flex items-center gap-1">
              <span>View all transactions</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {events.map((event) => {
              const isJoined = event.eventType === 'joined';
              const isCashback = event.eventType === 'pushed' || event.eventType === 'seat_distribution';
              const isClaimed = event.eventType === 'fallback_claimed';

              const title = event.reason || (
                isJoined
                  ? 'Council Seat Activated'
                  : isCashback
                  ? 'Instant 300/N Cashback'
                  : isClaimed
                  ? 'Dividend Reward Claimed'
                  : event.eventType
              );

              const iconBg = isJoined
                ? 'bg-[#EFF6FF] text-[#155EEF]'
                : isCashback
                ? 'bg-[#ECFDF5] text-[#059669]'
                : 'bg-[#EEF4FF] text-[#4F46E5]';

              return (
                <div key={event.id} className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 transition-colors px-1 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                      {isJoined ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : isCashback ? (
                        <Zap className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#071A4A] font-jakarta flex items-center gap-2">
                        <span>{title}</span>
                        {event.incomingPosition && (
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                            Seat #{event.incomingPosition}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#64748B] font-jakarta font-mono mt-0.5">
                        {event.userAddress ? truncateAddress(event.userAddress, 8) : 'Council Member'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-600 font-jakarta">
                      +{event.amountBtt ? Number(event.amountBtt).toLocaleString(undefined, { maximumFractionDigits: 1 }) : 0} TROB
                    </div>
                    <div className="text-[11px] text-[#64748B] font-medium font-jakarta flex items-center justify-end gap-1.5">
                      {event.amountUsdEstimate > 0 && (
                        <span className="text-slate-500">
                          (≈ ${Number(event.amountUsdEstimate).toFixed(2)})
                        </span>
                      )}
                      <span>•</span>
                      <span>{timeAgo(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =======================================================================
          5. BOTTOM ROW: THE VISION & PHASE 2
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Card 1: The Vision */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          <button
            onClick={() => setVideoOpen(true)}
            className="relative w-full sm:w-28 h-28 sm:h-20 rounded-2xl overflow-hidden bg-[#071A4A] shrink-0 flex items-center justify-center group shadow-xs border border-slate-200 cursor-pointer"
            aria-label="Play Vision Video"
          >
            <img
              src="/dao/SVG 10.png"
              alt="Mountain Peaks Artwork"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="relative w-9 h-9 rounded-full bg-white text-[#071A4A] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <Play className="w-3.5 h-3.5 fill-[#071A4A] text-[#071A4A] ml-0.5" />
            </div>
          </button>

          <div className="space-y-1">
            <div className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider font-jakarta">
              THE VISION
            </div>
            <h4 className="text-sm sm:text-base font-bold font-jakarta text-[#071A4A] leading-snug">
              A Decentralized Network for a Stronger Tomorrow.
            </h4>
            <button
              onClick={() => setVideoOpen(true)}
              className="text-xs font-bold text-[#155EEF] hover:underline inline-flex items-center gap-1 mt-1 transition-colors cursor-pointer"
            >
              <span>Watch the Protocol Video</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Phase 2 */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF5FF] text-[#155EEF] flex items-center justify-center shrink-0 border border-[#BFDBFE]/60 mt-0.5 sm:mt-0">
              <Calendar className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold font-jakarta text-[#071A4A] leading-snug">
                Phase 2: Retail Matrix Launch
              </h4>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#071A4A]">
                <Calendar className="w-3.5 h-3.5 text-[#155EEF]" />
                <span>Day 22</span>
              </div>
              <p className="text-xs text-[#60739A] font-jakarta leading-relaxed max-w-md">
                The global $30 matrix launches on{' '}
                <a
                  href="https://matrix.equora.fi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#155EEF] hover:underline font-semibold"
                >
                  matrix.equora.fi
                </a>{' '}
                and 35% of all transactions will flow to DAO members.
              </p>
            </div>
          </div>

          <Link
            href="/dao/matrix"
            className="w-9 h-9 rounded-full bg-[#EEF5FF] hover:bg-[#DBEAFE] text-[#155EEF] flex items-center justify-center shrink-0 transition-colors shadow-2xs"
            title="Go to Matrix"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        title="EQUORA Genesis DAO Protocol Vision"
      />
    </div>
  );
}
