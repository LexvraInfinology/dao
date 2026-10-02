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
  Clock,
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
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 animate-fadeIn w-full max-w-full overflow-x-hidden font-sans">

      {/* =======================================================================
          1. HERO SECTION — Member-Aware, Trobium Styled & Tightly Packed
         ======================================================================= */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-[#0E62E4]/18 p-4 sm:p-6 lg:p-7 shadow-[0_4px_20px_rgba(14,98,228,0.06)]">
        <div className="ambient-glow top-0 right-1/4 w-80 h-80 bg-[#0E62E4]/10 pointer-events-none" />

        {/* --- DESKTOP HERO --- */}
        <div className="hidden lg:grid grid-cols-12 gap-6 items-center relative z-10">
          <div className="col-span-7 space-y-3">
            <span className="chip text-[10px] tracking-[0.08em] font-semibold text-[#0E62E4] bg-[#0E62E4]/10 border border-[#0E62E4]/20 px-2.5 py-0.5 rounded-lg">
              Genesis DAO Phase 1
            </span>

            <h1 className="text-2xl xl:text-3xl font-bold text-[#17334F] tracking-tight leading-tight uppercase">
              Genesis <span className="text-[#0E62E4]">DAO</span> Council
            </h1>

            <h2 className="text-xs xl:text-sm font-semibold text-[#3E6180] leading-snug">
              100 sovereign seats. One protocol. A stronger tomorrow.
            </h2>

            <p className="text-[11px] xl:text-xs text-[#4F6D87] leading-relaxed max-w-lg">
              Be part of the founding 100 governing members of Equora. Secure your seat, earn from global matrix volume, and shape the future.
            </p>

            {/* ── CTA: Member vs Non-Member ── */}
            {memberLoading ? (
              <div className="flex items-center gap-2 text-xs text-[#4F6D87] pt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E62E4]" />
                <span>Checking membership…</span>
              </div>
            ) : isMember ? (
              /* Member CTA */
              <div className="space-y-2.5 pt-1">
                {memberData?.isCapped ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-300 p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span>5X Cap Reached — 48H Re-topup Window Open (Seat #{myPosition})</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      Your seat has earned 5X ($1,500 USD). Re-topup $300 USD within 48 hours to preserve your active council seat.
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent('dao:open-retopup', {
                              detail: { seatPosition: myPosition, deadline: memberData?.retopupDeadline },
                            })
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Quick Re-topup ($300)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href="/dao/lounge"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition-all"
                      >
                        <span>Open Lounge</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1F8A5B]/10 border border-[#1F8A5B]/25 text-[#1F8A5B] text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1F8A5B]" />
                      <span>You Own Council Seat #{myPosition}</span>
                      {myNftId && <span className="text-[#1F8A5B] font-normal text-[11px]">• SBT #{myNftId}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href="/dao/lounge"
                        className="btn-primary px-4 py-2 text-xs font-semibold rounded-xl uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Open Member Lounge</span>
                      </Link>
                      <Link
                        href="/dao/seats"
                        className="btn-ghost px-4 py-2 text-xs font-semibold rounded-xl uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <span>Explore Council Grid</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Non-member Overview CTA */
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link
                  href="/dao/seats"
                  className="btn-primary px-4 py-2 text-xs font-semibold rounded-xl uppercase tracking-wider flex items-center gap-1.5"
                >
                  <span>Explore Council Grid</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/dao/seats"
                  className="btn-ghost px-4 py-2 text-xs font-semibold rounded-xl uppercase tracking-wider flex items-center gap-1.5"
                >
                  <span>Protocol Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {!isMember && !memberLoading && (
              <div className="pt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#4F6D87]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F8A5B]" />
                <span>Zero Referrals Required &bull; 100 Sovereign Seats</span>
              </div>
            )}
          </div>

          {/* Right 3D Visual */}
          <div className="col-span-5 relative flex items-center justify-end min-h-[200px]">
            <div className="absolute top-0 right-0 text-[9px] font-semibold tracking-widest text-[#4F6D87] uppercase text-right leading-tight select-none">
              <div>PEOPLE</div>
              <div>PROTOCOL</div>
              <div>PROGRESS</div>
              <div className="w-6 h-[2px] bg-[#0E62E4] ml-auto rounded-full mt-1" />
            </div>

            <div className="relative w-48 h-48 flex items-center justify-center mr-2">
              <div className="absolute w-40 h-40 rounded-full bg-[#0E62E4]/10 blur-xl pointer-events-none" />
              <div className="relative w-36 h-36 animate-float flex items-center justify-center">
                <img
                  src="/dao/trobiumdashboard.png"
                  alt="Genesis DAO 3D Emblem"
                  className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(14,98,228,0.22)]"
                />
              </div>
            </div>

            <div className="absolute bottom-0 right-0 text-[8px] font-medium tracking-wider text-[#5E7B94] uppercase text-right leading-tight select-none">
              <div>DECENTRALIZED</div>
              <div>TRANSPARENT</div>
              <div>SOVEREIGN</div>
            </div>
          </div>
        </div>

        {/* --- MOBILE HERO --- */}
        <div className="lg:hidden text-center space-y-3 relative z-10">
          <span className="chip text-[9px] tracking-[0.08em] font-semibold text-[#0E62E4] bg-[#0E62E4]/10 border border-[#0E62E4]/20 px-2.5 py-0.5 rounded-lg inline-flex">
            Genesis DAO Phase 1
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17334F] tracking-tight uppercase">
            Genesis <span className="text-[#0E62E4]">DAO</span> Council
          </h1>
          <p className="text-xs font-medium text-[#3E6180] max-w-xs mx-auto leading-snug">
            100 sovereign seats. One protocol. A stronger tomorrow.
          </p>

          <div className="relative py-1 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
              <div className="absolute w-28 h-28 rounded-full bg-[#0E62E4]/10 blur-lg pointer-events-none" />
              <img
                src="/dao/trobiumdashboard.png"
                alt="Genesis DAO 3D Emblem"
                className="w-full h-full object-contain animate-float drop-shadow-[0_6px_16px_rgba(14,98,228,0.2)]"
              />
            </div>
            <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#0E62E4]/10 border border-[#0E62E4]/20 text-[9px] font-semibold text-[#0E62E4] tracking-wide uppercase">
              DECENTRALIZED &bull; TRANSPARENT
            </div>
          </div>

          <p className="text-[11px] text-[#4F6D87] leading-relaxed max-w-sm mx-auto">
            Be part of the founding 100 governing members. View council governance, live distributions, and treasury performance.
          </p>

          {/* Mobile CTA */}
          <div className="pt-1">
            {memberLoading ? (
              <div className="flex items-center justify-center gap-2 text-xs text-[#4F6D87] py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E62E4]" />
                <span>Checking membership…</span>
              </div>
            ) : isMember ? (
              <div className="space-y-2">
                {memberData?.isCapped ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 space-y-2 text-left">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      <span>5X Cap Reached (Seat #{myPosition})</span>
                    </div>
                    <p className="text-[10.5px] text-amber-800 leading-snug">
                      48h retopup window open. Re-topup $300 to claim instant cashback loop.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent('dao:open-retopup', {
                            detail: { seatPosition: myPosition, deadline: memberData?.retopupDeadline },
                          })
                        )
                      }
                      className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Quick Re-topup ($300)</span>
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1F8A5B]/10 border border-[#1F8A5B]/25 text-[#1F8A5B] text-xs font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-[#1F8A5B]" />
                    <span>Seat #{myPosition} &bull; Active Member</span>
                  </div>
                )}
                <Link
                  href="/dao/lounge"
                  className="btn-primary w-full py-2.5 px-4 text-xs font-semibold rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Open Member Lounge</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/dao/seats"
                  className="btn-primary w-full py-2 px-3 text-[11px] font-semibold rounded-xl uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  <span>Explore Grid</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href="/dao/seats"
                  className="btn-ghost w-full py-2 px-3 text-[11px] font-semibold rounded-xl uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  <span>Details</span>
                </Link>
              </div>
            )}
          </div>

          {!isMember && !memberLoading && (
            <div className="flex items-center justify-between text-[10px] font-medium text-[#4F6D87] pt-1 px-1">
              <div className="flex items-center gap-1 text-[#1F8A5B]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Referrals Required</span>
              </div>
              <Link href="/dao/seats" className="text-[#0E62E4] hover:underline flex items-center gap-0.5 font-semibold">
                <span>Seats &rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================================
          2. PROTOCOL METRICS / STATS CARDS
         ======================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#4F6D87]">
            PROTOCOL METRICS
          </div>
          <div className="text-[10px] font-semibold text-[#0E62E4] flex items-center gap-1">
            <span>Founding 100 Seats</span>
          </div>
        </div>
        <DaoDashboardStats />
      </div>

      {/* =======================================================================
          3. FINANCIAL ARCHITECTURE & 300 / N ECONOMICS
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* Left: Financial Architecture & 4-Item Calculation Grid */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-white border border-[#0E62E4]/18 shadow-[0_4px_16px_rgba(14,98,228,0.06)] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#4F6D87]">
                  FINANCIAL ARCHITECTURE
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#17334F] uppercase tracking-tight mt-0.5">
                  {isMember ? 'Your Council Position & Capital Ledger' : 'Council Capital & 300 / N Economics'}
                </h3>
              </div>

              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                stats?.memberCount && stats.memberCount >= 100
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-[#0E62E4]/10 border-[#0E62E4]/20 text-[#0E62E4]'
              }`}>
                {stats?.memberCount && stats.memberCount >= 100 ? 'Queue Complete' : 'Genesis Queue Open'}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-[#3E6180] leading-relaxed max-w-2xl">
              {isMember && myPosition
                ? `You hold Council Seat #${myPosition}. Review your initial gross deposit, instant algorithmic cashback received, and net deployed capital.`
                : 'All sovereign seats require a fixed deposit. Every member receives instant on-chain cashback calculated via the 300 / N protocol rule upon entering the queue.'}
            </p>

            {/* 300/N Calculation Architecture Grid — 2x2 on mobile, 4 columns on desktop */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {/* 1. Deposit — Solid Sky Blue box matching Trobium */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-[#0E62E4] to-[#0A3F9A] text-white shadow-xs space-y-1">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-white/80">
                    DEPOSIT
                  </div>
                  <div className="text-base sm:text-xl font-bold tabular-nums text-white">
                    $300 USD
                  </div>
                  <div className="text-[9px] text-white/75 font-medium leading-tight">
                    Fixed Entry (in TROB)
                  </div>
                </div>

                {/* 2. Instant Cashback */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/16 text-[#17334F] space-y-1">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[#0E62E4]">
                    CASHBACK
                  </div>
                  <div className="text-base sm:text-xl font-bold tabular-nums text-[#1F8A5B]">
                    {isMember && myPosition ? `+$${(300 / myPosition).toFixed(2)}` : '300 / N'}
                  </div>
                  <div className="text-[9px] text-[#4F6D87] font-medium leading-tight">
                    {isMember && myPosition ? `Seat #${myPosition} Payout` : 'Instant P2P Refund'}
                  </div>
                </div>

                {/* 3. Total Inflow */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/16 text-[#17334F] space-y-1">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[#1F8A5B]">
                    TOTAL INFLOW
                  </div>
                  <div className="text-base sm:text-xl font-bold tabular-nums text-[#1F8A5B]">
                    {isMember && myPosition
                      ? `+$${Math.max(300 / myPosition, memberData?.pushedAmountUsdEstimate && memberData.pushedAmountUsdEstimate > 0 ? memberData.pushedAmountUsdEstimate : (300 / myPosition)).toFixed(2)}`
                      : 'Total Return'}
                  </div>
                  <div className="text-[9px] text-[#4F6D87] font-medium leading-tight truncate">
                    Cashback + Pool Dividends
                  </div>
                </div>

                {/* 4. Max Return Cap */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/16 text-[#17334F] space-y-1">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[#4F6D87]">
                    MAX INFLOW
                  </div>
                  <div className="text-base sm:text-xl font-bold tabular-nums text-[#17334F]">
                    $1,500 USD
                  </div>
                  <div className="text-[9px] text-[#4F6D87] font-medium leading-tight">
                    500% Cap ($1,500 in TROB)
                  </div>
                </div>
              </div>

              {/* Status bar — 100% contained, no text clipping or overflow */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/16 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#1F8A5B] animate-pulse shrink-0" />
                  <span className="font-semibold text-[#17334F] text-[11px] truncate">
                    {isMember && myPosition ? `Council Seat #${myPosition}:` : 'Council Status:'}
                  </span>
                  <span className="text-[11px] text-[#4F6D87] truncate">
                    {isMember && myPosition
                      ? `Active Member • ${myNftId ? `SBT #${myNftId}` : 'Pass'}`
                      : (stats?.memberCount && stats.memberCount >= 100 ? 'Queue Complete' : 'Seats Available')}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#0E62E4]/10">
                  <span className="text-[10px] font-semibold text-[#1F8A5B] bg-[#1F8A5B]/10 px-2 py-0.5 rounded border border-[#1F8A5B]/20">
                    1.0% Vote Weight
                  </span>
                  {isMember ? (
                    <Link
                      href="/dao/lounge"
                      className="text-[11px] font-semibold text-[#0E62E4] hover:underline flex items-center gap-1"
                    >
                      <span>Member Lounge</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      href="/dao/seats"
                      className="text-[11px] font-semibold text-[#0E62E4] hover:underline flex items-center gap-1"
                    >
                      <span>Inspect Grid</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Governance Principles */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#0E62E4]/18 shadow-[0_4px_16px_rgba(14,98,228,0.06)] space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#4F6D87]">
              GOVERNANCE PRINCIPLES
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#17334F] uppercase tracking-tight mt-0.5">
              Why Join the Genesis DAO?
            </h3>

            <div className="space-y-2.5 pt-3">
              {[
                { icon: Shield, title: 'Fixed 100-Seat Supply', desc: 'No 101st seat can ever be created on-chain.' },
                { icon: TrendingUp, title: 'Dual Cash Flow Streams', desc: 'Instant 300/N cashback + 35% global matrix share.' },
                { icon: Eye, title: 'On-Chain Transparency', desc: 'All ledger states verifiable on blockchain.' },
                { icon: Vote, title: '1.0% Governance Power', desc: '1 Seat = 1 Vote across all protocol upgrades.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#EFF6FF] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-[#0E62E4]/10 text-[#0E62E4] flex items-center justify-center shrink-0 mt-0.5 border border-[#0E62E4]/15">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-[#17334F]">{title}</h4>
                    <p className="text-[11px] text-[#4F6D87] leading-snug mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          4. RECENT ACTIVITY FEED — Live Real Events
         ======================================================================= */}
      {events && events.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#0E62E4]/18 shadow-[0_4px_16px_rgba(14,98,228,0.06)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F8A5B] animate-pulse" />
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-tight text-[#17334F]">
                Live Council Activity
              </h3>
              <span className="text-[9px] font-semibold text-[#1F8A5B] bg-[#1F8A5B]/10 border border-[#1F8A5B]/25 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Real-Time
              </span>
            </div>
            <Link href="/dao/transactions" className="text-[11px] font-semibold text-[#0E62E4] hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#0E62E4]/10">
            {events.map((event) => {
              const isJoined = event.eventType === 'joined';
              const isCashback = event.eventType === 'pushed' || event.eventType === 'seat_distribution';

              const title = event.reason || (
                isJoined
                  ? 'Council Seat Activated'
                  : isCashback
                  ? 'Instant 300/N Cashback'
                  : 'Dividend Reward Claimed'
              );

              return (
                <div key={event.id} className="flex items-center justify-between py-2.5 hover:bg-[#EFF6FF]/60 transition-colors px-1 rounded-lg">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${
                      isJoined ? 'bg-[#0E62E4]/10 text-[#0E62E4]' : 'bg-[#1F8A5B]/10 text-[#1F8A5B]'
                    } flex items-center justify-center shrink-0 border border-[#0E62E4]/15`}>
                      {isJoined ? <ShieldCheck className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#17334F] flex items-center gap-1.5 truncate">
                        <span className="truncate">{title}</span>
                        {event.incomingPosition && (
                          <span className="text-[9px] font-semibold text-[#0E62E4] bg-[#0E62E4]/10 border border-[#0E62E4]/20 px-1.5 py-0.2 rounded shrink-0">
                            Seat #{event.incomingPosition}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#5E7B94] font-mono mt-0.5">
                        {event.userAddress ? truncateAddress(event.userAddress, 8) : 'Council Member'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="text-xs font-bold text-[#1F8A5B] tabular-nums">
                      +{event.amountBtt ? Number(event.amountBtt).toLocaleString(undefined, { maximumFractionDigits: 1 }) : 0} TROB
                    </div>
                    <div className="text-[10px] text-[#5E7B94] font-medium flex items-center justify-end gap-1">
                      {event.amountUsdEstimate > 0 && (
                        <span>(≈ ${Number(event.amountUsdEstimate).toFixed(2)})</span>
                      )}
                      <span>&bull;</span>
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
          5. BOTTOM ROW: THE VISION & RETAIL MATRIX LAUNCH
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: The Vision */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#0E62E4]/18 shadow-[0_4px_16px_rgba(14,98,228,0.06)] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <button
            onClick={() => setVideoOpen(true)}
            className="relative w-full sm:w-24 h-24 sm:h-20 rounded-xl overflow-hidden bg-[#17334F] shrink-0 flex items-center justify-center group shadow-xs border border-[#0E62E4]/20 cursor-pointer"
            aria-label="Play Vision Video"
          >
            <img
              src="/dao/SVG 10.png"
              alt="Protocol Artwork"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="relative w-8 h-8 rounded-full bg-white text-[#17334F] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Play className="w-3 h-3 fill-[#17334F] text-[#17334F] ml-0.5" />
            </div>
          </button>

          <div className="space-y-1 min-w-0">
            <span className="text-[9px] font-semibold text-[#4F6D87] uppercase tracking-[0.1em]">
              THE VISION
            </span>
            <h4 className="text-xs sm:text-sm font-semibold text-[#17334F] leading-snug">
              A Decentralized Network for a Stronger Tomorrow.
            </h4>
            <button
              onClick={() => setVideoOpen(true)}
              className="text-[11px] font-semibold text-[#0E62E4] hover:underline inline-flex items-center gap-1 mt-0.5 transition-colors cursor-pointer"
            >
              <span>Watch Protocol Video</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Retail Matrix Launch */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#0E62E4]/18 shadow-[0_4px_16px_rgba(14,98,228,0.06)] flex items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#0E62E4]/10 text-[#0E62E4] flex items-center justify-center shrink-0 border border-[#0E62E4]/20 mt-0.5 sm:mt-0">
              <Calendar className="w-5 h-5" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-semibold text-[#17334F] leading-snug truncate">
                  Phase 2: Retail Matrix Launch
                </h4>
                <span className="text-[9px] font-semibold text-[#0E62E4] bg-[#0E62E4]/10 px-1.5 py-0.5 rounded border border-[#0E62E4]/20 shrink-0">
                  Day 22
                </span>
              </div>
              <p className="text-[11px] text-[#4F6D87] leading-relaxed max-w-md line-clamp-2">
                Global $30 matrix launches on{' '}
                <a
                  href="https://equorafi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0E62E4] hover:underline font-semibold"
                >
                  equorafi.com
                </a>{' '}
                with 35% of all matrix volume distributed to DAO members.
              </p>
            </div>
          </div>

          <Link
            href="/dao/matrix-bridge"
            className="w-8 h-8 rounded-lg bg-[#0E62E4]/10 hover:bg-[#0E62E4]/20 text-[#0E62E4] flex items-center justify-center shrink-0 transition-colors shadow-2xs border border-[#0E62E4]/20"
            title="Go to Matrix Bridge"
          >
            <ArrowRight className="w-3.5 h-3.5" />
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
