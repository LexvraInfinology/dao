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
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VideoModal } from '@/components/ui/VideoModal';
import { DaoDashboardStats } from '@/components/dao/DaoDashboardStats';

export default function DaoDashboardPage() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [seatsN, setSeatsN] = useState<number>(87);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState(false);

  // Dynamic 300 / N Calculation for selected seat
  const seatPosition = Math.min(100, Math.max(1, seatsN));
  const instantCashback = (300 / seatPosition).toFixed(2);
  const netOutOfPocket = (300 - Number(instantCashback)).toFixed(2);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      {/* =========================================================================
          1. HERO SECTION (Dual responsive: Desktop Grid vs Mobile Centered Jewel)
         ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E2ECF9] p-5 sm:p-8 lg:p-10 shadow-[0_4px_25px_rgba(15,23,42,0.03)]">
        {/* Ambient subtle backdrop glows */}
        <div className="ambient-glow top-0 right-1/4 w-96 h-96 bg-blue-400/10 pointer-events-none" />

        {/* --- DESKTOP HERO (Visible on lg and above) --- */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Content */}
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

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
              <Link
                href="/dao/seats"
                className="px-6 py-3.5 rounded-full font-bold text-sm text-white bg-[#155EEF] hover:bg-[#0052E6] shadow-[0_4px_16px_rgba(21,94,239,0.35)] transition-all flex items-center gap-2"
              >
                <span>Claim Council Seat ($300 TROB)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dao/seats"
                className="px-5 py-3.5 rounded-full font-bold text-sm text-[#071A4A] bg-white hover:bg-slate-50 border border-[#E2ECF9] transition-all flex items-center gap-2 shadow-2xs"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#155EEF]">
              <ShieldCheck className="w-4 h-4 text-[#155EEF]" />
              <span>Zero Referrals Required</span>
            </div>
          </div>

          {/* Right 3D Visual Composition with Micro-Tags */}
          <div className="col-span-5 relative flex items-center justify-end min-h-[300px]">
            {/* Top Right Micro-Tags */}
            <div className="absolute top-0 right-0 text-[10px] font-bold tracking-widest text-[#64748B] uppercase font-jakarta text-right leading-relaxed select-none">
              <div>PEOPLE</div>
              <div>PROTOCOL</div>
              <div>PROGRESS</div>
              <div className="pb-1">TOGETHER</div>
              <div className="w-7 h-[2px] bg-[#155EEF] ml-auto rounded-full" />
            </div>

            {/* Central Floating 3D Vector Polygonal Ethereum Shape */}
            <div className="relative w-72 h-72 flex items-center justify-center mr-6">
              {/* Floating Diamond Accents */}
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

              {/* Orbital Rings */}
              <div className="absolute w-56 h-56 rounded-full border border-blue-200/50 -rotate-45 pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full border border-blue-300/40 rotate-12 pointer-events-none" />

              {/* Main 3D Jewel */}
              <div className="relative w-48 h-48 animate-float flex items-center justify-center">
                <img
                  src="/dao/Central 3D Vector Polygonal Floating Ethereum-Style Shape.png"
                  alt="Genesis DAO 3D Ethereum Jewel"
                  className="w-full h-full object-contain drop-shadow-[0_15px_35px_rgba(37,99,235,0.35)]"
                />
              </div>
            </div>

            {/* Bottom Right Micro-Tags */}
            <div className="absolute bottom-0 right-0 text-[9px] font-semibold tracking-wider text-[#94A3B8] uppercase font-jakarta text-right leading-relaxed select-none">
              <div>DECENTRALIZED</div>
              <div>TRANSPARENT</div>
              <div>COMMUNITY OWNED</div>
            </div>
          </div>
        </div>

        {/* --- MOBILE & TABLET HERO (Visible below lg) --- */}
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

          {/* Centered 3D Octahedron Visual matching Mobile Reference */}
          <div className="relative py-2 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 xs:w-48 xs:h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              <div className="absolute w-36 h-36 rounded-full bg-blue-400/15 blur-2xl pointer-events-none" />
              <img
                src="/dao/Compact 3D Octahedron Visual.png"
                alt="Compact 3D Octahedron Visual"
                className="w-full h-full object-contain animate-float drop-shadow-[0_10px_25px_rgba(37,99,235,0.3)]"
              />
            </div>

            {/* DECENTRALIZED â€¢ TRANSPARENT Pill */}
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-[#EEF5FF] border border-[#BFDBFE] text-[10px] font-bold text-[#155EEF] tracking-wide uppercase">
              DECENTRALIZED â€¢ TRANSPARENT
            </div>
          </div>

          <p className="text-xs text-[#4F6184] leading-relaxed font-jakarta max-w-md mx-auto">
            Be part of the founding 100 governing members. Secure your seat, earn from global matrix volume, and shape the protocol.
          </p>

          {/* Full-width CTA button */}
          <div className="pt-2">
            <Link
              href="/dao/seats"
              className="w-full py-3.5 px-4 rounded-full font-bold text-xs sm:text-sm text-white bg-[#155EEF] hover:bg-[#0052E6] shadow-[0_4px_16px_rgba(21,94,239,0.35)] transition-all flex items-center justify-center gap-2"
            >
              <span>Claim Council Seat ($300 TROB)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Sub-links row */}
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
        </div>
      </div>

      {/* =========================================================================
          2. STATS ROW: 3 WHITE CARDS â€” live data from API
         ========================================================================= */}
      <div>
        {/* Mobile Swipe Header */}
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

      {/* =========================================================================
          3. CALCULATOR & WHY JOIN SECTION
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 300 / N Calculator (lg:col-span-8) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Mobile ALGORITHM SIMULATOR Pill */}
            <div className="lg:hidden">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EEF5FF] border border-[#BFDBFE] text-[9px] font-extrabold font-jakarta text-[#155EEF] uppercase tracking-wider">
                ALGORITHM SIMULATOR
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black font-jakarta text-[#071A4A]">
                300 / N Calculator
              </h3>
              <p className="text-xs sm:text-sm text-[#60739A] font-jakarta mt-1">
                See your instant cashback and net cost based on your seat position.
              </p>
            </div>

            {/* Slider Container */}
            <div className="pt-2 space-y-3 bg-[#F8FAFC]/60 p-4 sm:p-5 rounded-2xl border border-[#E2ECF9]/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#071A4A] font-jakarta">
                  Selected Seat Position:
                </span>
                <span className="px-3 py-1 rounded-full bg-[#EEF5FF] text-[#155EEF] font-bold text-xs font-jakarta border border-[#BFDBFE]">
                  #{seatPosition}
                </span>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="1"
                max="100"
                value={seatPosition}
                onChange={(e) => setSeatsN(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#155EEF]"
              />

              <div className="flex justify-between text-[11px] font-semibold text-[#94A3B8] font-jakarta">
                <span>1</span>
                <span className="hidden sm:inline text-[#64748B]">Seat 50</span>
                <span>100</span>
              </div>
            </div>

            {/* Desktop Outputs vs Seat #1 Box */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Left: 3 Output Metrics */}
              <div className="flex flex-col justify-around space-y-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2ECF9]">
                <div>
                  <div className="text-2xl xl:text-3xl font-black font-jakarta text-[#071A4A]">
                    $300.00
                  </div>
                  <div className="text-xs text-[#60739A] font-medium mt-0.5">
                    Deposit Amount
                  </div>
                </div>

                <div>
                  <div className="text-2xl xl:text-3xl font-black font-jakarta text-[#10B981]">
                    ${instantCashback}
                  </div>
                  <div className="text-xs text-[#60739A] font-medium mt-0.5">
                    Instant Cashback ($300 / {seatPosition})
                  </div>
                </div>

                <div>
                  <div className="text-2xl xl:text-3xl font-black font-jakarta text-[#071A4A]">
                    ${netOutOfPocket}
                  </div>
                  <div className="text-xs text-[#60739A] font-medium mt-0.5">
                    Total In-Flow
                  </div>
                </div>
              </div>

              {/* Right: Seat #1 Example Box */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2ECF9] flex flex-col justify-between space-y-3">
                <div className="text-xs font-bold font-jakarta text-[#071A4A]">
                  Seat #1 Example
                </div>

                <div className="space-y-2 text-xs font-jakarta">
                  <div className="flex justify-between items-center">
                    <span className="text-[#60739A]">Deposit Amount</span>
                    <span className="font-bold text-[#071A4A] whitespace-nowrap">$300.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#60739A]">Instant Cashback</span>
                    <span className="font-bold text-[#10B981] whitespace-nowrap">$300.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#60739A]">Total In-Flow</span>
                    <span className="font-bold text-[#10B981] whitespace-nowrap">$0.00</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2ECF9] flex items-start gap-2 text-[11px] text-[#60739A] leading-tight">
                  <Star className="w-3.5 h-3.5 text-[#155EEF] shrink-0 mt-0.5 fill-current" />
                  <span>
                    The first member gets their full $300 back, making Seat #1 effectively FREE.
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Outputs (3 Pills + Collapsible Drawer) */}
            <div className="md:hidden space-y-3 pt-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2ECF9]">
                  <div className="text-[9px] font-bold uppercase text-[#94A3B8]">GROSS DEPOSIT</div>
                  <div className="text-sm font-black font-jakarta text-[#071A4A] mt-1">$300.00</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
                  <div className="text-[9px] font-bold uppercase text-[#047857]">INSTANT CASHBACK</div>
                  <div className="text-sm font-black font-jakarta text-[#047857] mt-1">${instantCashback}</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE]">
                  <div className="text-[9px] font-bold uppercase text-[#155EEF]">TOTAL IN-FLOW</div>
                  <div className="text-sm font-black font-jakarta text-[#155EEF] mt-1">${netOutOfPocket}</div>
                </div>
              </div>

              {/* Mobile Collapsible Seat #1 Insight */}
              <div className="rounded-2xl border border-[#E2ECF9] bg-[#F8FAFC] overflow-hidden">
                <button
                  onClick={() => setMobileAccordionOpen(!mobileAccordionOpen)}
                  className="w-full p-3 flex items-center justify-between text-xs font-bold text-[#071A4A] font-jakarta"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
                    <span>Why Seat #1 was effectively FREE</span>
                  </div>
                  {mobileAccordionOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#60739A]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#60739A]" />
                  )}
                </button>

                {mobileAccordionOpen && (
                  <div className="p-3 pt-0 text-xs text-[#4F6184] font-jakarta space-y-2 border-t border-[#E2ECF9]/60">
                    <div className="flex justify-between pt-2">
                      <span>Deposit Amount:</span>
                      <span className="font-bold text-[#071A4A]">$300.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Instant Cashback:</span>
                      <span className="font-bold text-[#10B981]">$300.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total In-Flow:</span>
                      <span className="font-bold text-[#10B981]">$0.00</span>
                    </div>
                    <p className="text-[11px] text-[#60739A] pt-1">
                      The first member gets their full $300 back, making Seat #1 completely zero net-cost.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Why Join the Genesis DAO? (lg:col-span-4) */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black font-jakarta text-[#071A4A]">
              Why Join the Genesis DAO?
            </h3>

            <div className="space-y-4 pt-5">
              {/* Item 1 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5FF] text-[#155EEF] flex items-center justify-center shrink-0 mt-0.5 border border-[#BFDBFE]/60">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold font-jakarta text-[#071A4A]">
                    Fixed 100-Seat Supply
                  </h4>
                  <p className="text-xs text-[#60739A] font-jakarta leading-relaxed mt-0.5">
                    No 101st seat can ever be created.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5FF] text-[#155EEF] flex items-center justify-center shrink-0 mt-0.5 border border-[#BFDBFE]/60">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold font-jakarta text-[#071A4A]">
                    Dual Cash Flow Streams
                  </h4>
                  <p className="text-xs text-[#60739A] font-jakarta leading-relaxed mt-0.5">
                    300/N queue + 35% global matrix.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5FF] text-[#155EEF] flex items-center justify-center shrink-0 mt-0.5 border border-[#BFDBFE]/60">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold font-jakarta text-[#071A4A]">
                    On-Chain Transparency
                  </h4>
                  <p className="text-xs text-[#60739A] font-jakarta leading-relaxed mt-0.5">
                    All data verifiable on blockchain.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5FF] text-[#155EEF] flex items-center justify-center shrink-0 mt-0.5 border border-[#BFDBFE]/60">
                  <Vote className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold font-jakarta text-[#071A4A]">
                    Governance & Voting Rights
                  </h4>
                  <p className="text-xs text-[#60739A] font-jakarta leading-relaxed mt-0.5">
                    1 Seat = 1 Vote (1.0% voting power).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. BOTTOM ROW: THE VISION & PHASE 2
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Card 1: The Vision */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          {/* Video Preview Thumbnail */}
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

        {/* Card 2: Phase 2: Retail Matrix Launch */}
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
            href="/dao/seats"
            className="w-9 h-9 rounded-full bg-[#EEF5FF] hover:bg-[#DBEAFE] text-[#155EEF] flex items-center justify-center shrink-0 transition-colors shadow-2xs"
            title="Go to Matrix Seats"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          5. MOBILE FOOTER (Visible only on mobile/tablet matching reference)
         ========================================================================= */}
      <div className="lg:hidden pt-8 pb-4 text-center space-y-2 text-[11px] text-[#94A3B8] font-jakarta select-none">
        <div className="flex items-center justify-center gap-3 font-semibold text-[#64748B]">
          <span className="hover:text-[#071A4A] cursor-pointer">Docs</span>
          <span>â€¢</span>
          <span className="hover:text-[#071A4A] cursor-pointer">Support</span>
          <span>â€¢</span>
          <span className="hover:text-[#071A4A] cursor-pointer">Terms</span>
        </div>
        <div>EQUORA_FI â€¢ 120,420 Network Members</div>
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
