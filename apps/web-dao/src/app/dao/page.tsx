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
                src="/dao/Diamond Crystal Graphic Graphic Accent.png"
                alt="Diamond Accent Top"
                className="absolute -top-1 left-6 w-5 h-5 object-contain opacity-80 animate-pulse pointer-events-none"
              />
              <img
                src="/dao/Diamond Crystal Graphic Graphic Accent.png"
                alt="Diamond Accent Bottom"
                className="absolute bottom-2 right-4 w-4 h-4 object-contain opacity-70 animate-pulse pointer-events-none"
              />
              <div className="absolute w-56 h-56 rounded-full border border-blue-200/50 -rotate-45 pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full border border-blue-300/40 rotate-12 pointer-events-none" />
              <div className="relative w-48 h-48 animate-float flex items-center justify-center">
                <img
                  src="/dao/Central 3D Vector Polygonal Floating Ethereum-Style Shape.png"
                  alt="Genesis DAO 3D Ethereum Jewel"
                  className="w-full h-full object-contain drop-shadow-[0_15px_35px_rgba(37,99,235,0.35)]"
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
              <div className="absolute w-36 h-36 rounded-full bg-blue-400/15 blur-2xl pointer-events-none" />
              <img
                src="/dao/Compact 3D Octahedron Visual.png"
                alt="Compact 3D Octahedron Visual"
                className="w-full h-full object-contain animate-float drop-shadow-[0_10px_25px_rgba(37,99,235,0.3)]"
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
          3. COUNCIL CAPITAL & POSITION LEDGER — Personal Data & Vacancy Knowledge
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
                  {isMember ? 'Your Council Position & Capital Ledger' : 'Council Capital & Seat Economics'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 font-jakarta">
                  {stats?.memberCount ?? 0} Claimed · {100 - (stats?.memberCount ?? 0)} Vacant
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-jakarta leading-relaxed max-w-2xl">
              {isMember && myPosition
                ? `You hold Council Seat #${myPosition}. Review your initial gross deposit, instant algorithmic cashback received, and net deployed capital.`
                : 'All 100 sovereign seats require a fixed $300 deposit. Every member receives instant on-chain cashback calculated via the 300 / N protocol rule upon entering the queue.'}
            </p>

            {/* Personal Data Grid for Council Members */}
            {isMember && myPosition ? (
              <div className="space-y-4 pt-1">
                {/* 4-Stat Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-[#0B1528] text-white border border-[#1E293B] shadow-sm">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Council Seat
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-jakarta text-white">
                      #{myPosition}
                    </div>
                    <div className="text-[10px] text-sky-400 font-mono">
                      {myNftId ? `SBT #${myNftId}` : 'Soulbound'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Gross Deposit
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-jakarta text-white">
                      $300.00
                    </div>
                    <div className="text-[10px] text-slate-400">Fixed Entry</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Instant Cashback
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-jakarta text-emerald-400">
                      +${(300 / myPosition).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-emerald-400/80 font-mono">
                      $300 / {myPosition}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Net Deployed
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-jakarta text-white">
                      ${(300 - 300 / myPosition).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">Effective Cost</div>
                  </div>
                </div>

                {/* Queue Vacancy & Rights Bar */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-jakarta">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-[#0B132B]">Genesis Council Status:</span>
                    <span className="text-slate-600">
                      {stats?.memberCount ?? 0} of 100 Seats Occupied • {100 - (stats?.memberCount ?? 0)} Vacant
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      1.0% Voting Weight
                    </span>
                    <Link
                      href="/dao/lounge"
                      className="font-bold text-[#155EEF] hover:underline flex items-center gap-1"
                    >
                      <span>Member Lounge</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Non-Member / Overview State */
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Seat Entry Deposit
                    </div>
                    <div className="text-2xl font-black font-jakarta text-[#0B132B]">$300.00</div>
                    <div className="text-xs text-slate-500">Uniform across all 100 seats</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Instant Return Rule
                    </div>
                    <div className="text-2xl font-black font-jakarta text-emerald-700">300 / N</div>
                    <div className="text-xs text-emerald-800">Direct on-chain instant cashback</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Governance Share
                    </div>
                    <div className="text-2xl font-black font-jakarta text-[#0B132B]">1.0% / Seat</div>
                    <div className="text-xs text-slate-500">1 Seat = 1 Sovereign Vote</div>
                  </div>
                </div>

                {/* Queue Vacancy Knowledge */}
                <div className="p-4 rounded-2xl bg-[#0B1528] text-white border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-jakarta">
                  <div className="space-y-0.5">
                    <div className="text-sky-400 font-bold uppercase tracking-wider text-[10px]">
                      GENESIS QUEUE CAPACITY
                    </div>
                    <div className="text-sm font-semibold text-slate-200">
                      {stats?.memberCount ?? 0} Seats Occupied · {100 - (stats?.memberCount ?? 0)} Vacant Positions Remaining
                    </div>
                  </div>

                  <Link
                    href="/dao/seats"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#0B1528] hover:bg-slate-100 font-bold text-xs transition-colors shrink-0"
                  >
                    <span>Inspect 100-Seat Grid</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
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
          4. RECENT ACTIVITY FEED — live events
         ======================================================================= */}
      {events && events.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <h3 className="text-sm font-bold font-jakarta text-[#071A4A]">Live Activity</h3>
            </div>
            <Link href="/dao/transactions" className="text-xs font-semibold text-[#155EEF] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EEF5FF] text-[#155EEF] flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#071A4A] font-jakarta">
                      {event.eventType === 'joined' ? 'New Member Joined' : event.eventType}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] font-jakarta">
                      {event.userAddress ? truncateAddress(event.userAddress) : 'Unknown'}
                      {event.incomingPosition ? ` · Seat #${event.incomingPosition}` : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#071A4A]">
                    {event.amountUsdEstimate > 0
                      ? `+$${event.amountUsdEstimate.toFixed(2)}`
                      : `+${event.amountBtt.toLocaleString()} TROB`}
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    {timeAgo(event.timestamp)}
                  </div>
                </div>
              </div>
            ))}
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
