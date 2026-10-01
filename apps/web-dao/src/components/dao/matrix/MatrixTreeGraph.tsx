'use client';

import React, { useState } from 'react';
import { 
  Coins, 
  ArrowUpRight, 
  Layers, 
  X,
  SlidersHorizontal,
  Info
} from 'lucide-react';

// Positions in the 14-node matrix that generate 100% direct payouts to the owner ($30 USD in TROB each)
const DIRECT_INCOME_POSITIONS = new Set([3, 6, 8, 9, 11, 12]);

export interface NodeDetail {
  position: number;
  memberId: number | null;
  code: number | null;
  address: string | null;
  isFilled: boolean;
  depositUsd: number;
}

export default function MatrixTreeGraph() {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [highlightIncome, setHighlightIncome] = useState<boolean>(true);

  // 14-position node progression for Slot 01 ($30 USD in TROB)
  // Static illustrative architectural example showing how downlines and payouts work.
  const nodes: Record<number, NodeDetail> = Array.from({ length: 14 }, (_, i) => i + 1).reduce(
    (acc, pos) => {
      acc[pos] = {
        position: pos,
        memberId: null,
        code: null,
        address: null,
        isFilled: false,
        depositUsd: 30,
      };
      return acc;
    },
    {} as Record<number, NodeDetail>
  );

  // Income metrics
  const cyclePotentialUsd = 6 * 30; // 6 direct positions * $30 = $180 per cycle

  const activeNode = selectedPosition ? nodes[selectedPosition] : null;

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-[#E2ECF9] shadow-[0_2px_20px_rgba(21,94,239,0.03)] font-jakarta overflow-hidden">
      
      {/* ─── CARD HEADER ─── */}
      <div className="p-5 sm:p-7 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#071A4A] tracking-tight uppercase">
              MATRIX ARCHITECTURE
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0E62E4] border border-[#0E62E4]/20 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Static Example
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
            14-Node Progression Model • Illustrative Example of How Spillover & $30 Returns Work
          </p>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHighlightIncome(!highlightIncome)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              highlightIncome
                ? 'bg-[#EFF6FF] text-[#155EEF] border-[#BFDBFE]'
                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#071A4A]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Direct Income Positions (3, 6, 8, 9, 11, 12)</span>
          </button>
        </div>
      </div>

      {/* ─── RESPONSIVE VECTOR TREE CANVAS ─── */}
      <div className="bg-[#F8FAFD] p-3 sm:p-6 lg:p-8 flex justify-center items-center">
        <div className="w-full max-w-[840px]">
          <svg
            viewBox="0 0 840 345"
            className="w-full h-auto select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* ── CONNECTING BRANCH LINES (Polished Architecture) ── */}
            {/* Level 0 (Apex) -> Level 1 (Slots 1 & 2) */}
            <path d="M 420 54 L 420 80" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 210 80 L 630 80" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 210 80 L 210 104" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 630 80 L 630 104" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />

            {/* Level 1 -> Level 2 (Left Branch from Slot 1) */}
            <path d="M 210 148 L 210 174" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 105 174 L 315 174" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 105 174 L 105 198" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 315 174 L 315 198" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />

            {/* Level 1 -> Level 2 (Right Branch from Slot 2) */}
            <path d="M 630 148 L 630 174" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 525 174 L 735 174" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 525 174 L 525 198" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 735 174 L 735 198" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />

            {/* Level 2 -> Level 3 (From Node 3) */}
            <path d="M 105 236 L 105 260" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 52.5 260 L 157.5 260" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 52.5 260 L 52.5 282" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 157.5 260 L 157.5 282" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />

            {/* Level 2 -> Level 3 (From Node 4) */}
            <path d="M 315 236 L 315 260" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 262.5 260 L 367.5 260" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 262.5 260 L 262.5 282" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 367.5 260 L 367.5 282" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />

            {/* Level 2 -> Level 3 (From Node 5) */}
            <path d="M 525 236 L 525 260" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 472.5 260 L 577.5 260" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 472.5 260 L 472.5 282" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 577.5 260 L 577.5 282" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />

            {/* Level 2 -> Level 3 (From Node 6) */}
            <path d="M 735 236 L 735 260" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 682.5 260 L 787.5 260" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 682.5 260 L 682.5 282" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
            <path d="M 787.5 260 L 787.5 282" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />

            {/* ================= LEVEL 0: APEX OWNER (Static Model) ================= */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(null)}
            >
              <rect
                x="330"
                y="12"
                width="180"
                height="42"
                rx="10"
                fill="#0052FF"
                className="filter drop-shadow-[0_4px_10px_rgba(0,82,255,0.28)]"
              />
              <circle cx="355" cy="33" r="4.5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
              <path d="M 347 43 C 347 38.5 350.5 37 355 37 C 359.5 37 363 38.5 363 43" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              <text
                x="428"
                y="37"
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="800"
                letterSpacing="0.04em"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                YOU (APEX OWNER)
              </text>
            </g>

            {/* ================= LEVEL 1: SLOT 1 & SLOT 2 ================= */}
            {/* SLOT 1 (Center: 210, Y: 104) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(1)}
            >
              <rect
                x="120"
                y="104"
                width="180"
                height="44"
                rx="11"
                fill="#FFFFFF"
                stroke="#BFDBFE"
                strokeWidth="1.5"
                className="filter drop-shadow-[0_2px_8px_rgba(21,94,239,0.06)]"
              />
              <circle cx="144" cy="126" r="4.5" fill="#3B82F6" />
              <text
                x="159"
                y="130"
                fill="#071A4A"
                fontSize="12"
                fontWeight="800"
                letterSpacing="0.04em"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                SLOT 1
              </text>
              <text
                x="280"
                y="130"
                fill="#155EEF"
                fontSize="10"
                fontWeight="700"
                textAnchor="end"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                DAY 22
              </text>
            </g>

            {/* SLOT 2 (Center: 630, Y: 104) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(2)}
            >
              <rect
                x="540"
                y="104"
                width="180"
                height="44"
                rx="11"
                fill="#FFFFFF"
                stroke="#BFDBFE"
                strokeWidth="1.5"
                className="filter drop-shadow-[0_2px_8px_rgba(21,94,239,0.06)]"
              />
              <circle cx="564" cy="126" r="4.5" fill="#3B82F6" />
              <text
                x="579"
                y="130"
                fill="#071A4A"
                fontSize="12"
                fontWeight="800"
                letterSpacing="0.04em"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                SLOT 2
              </text>
              <text
                x="700"
                y="130"
                fill="#155EEF"
                fontSize="10"
                fontWeight="700"
                textAnchor="end"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                DAY 22
              </text>
            </g>

            {/* ================= LEVEL 2: 3, 4, 5, 6 ================= */}
            {/* Node 3 (Income Position) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(3)}
            >
              <rect
                x="42"
                y="198"
                width="126"
                height="38"
                rx="10"
                fill="#FFFFFF"
                stroke={highlightIncome ? '#10B981' : '#E2E8F0'}
                strokeWidth={highlightIncome ? '2' : '1.5'}
              />
              <text
                x="68"
                y="222"
                fill="#071A4A"
                fontSize="14"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
              >
                3
              </text>
              <circle cx="146" cy="217" r="4" fill={highlightIncome ? '#10B981' : '#94A3B8'} />
            </g>

            {/* Node 4 */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(4)}
            >
              <rect
                x="252"
                y="198"
                width="126"
                height="38"
                rx="10"
                fill="#FFFFFF"
                stroke="#E2E8F0"
                strokeWidth="1.5"
              />
              <text
                x="278"
                y="222"
                fill="#64748B"
                fontSize="14"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
              >
                4
              </text>
              <circle cx="356" cy="217" r="4" fill="#E2E8F0" />
            </g>

            {/* Node 5 */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(5)}
            >
              <rect
                x="462"
                y="198"
                width="126"
                height="38"
                rx="10"
                fill="#FFFFFF"
                stroke="#E2E8F0"
                strokeWidth="1.5"
              />
              <text
                x="488"
                y="222"
                fill="#64748B"
                fontSize="14"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
              >
                5
              </text>
              <circle cx="566" cy="217" r="4" fill="#E2E8F0" />
            </g>

            {/* Node 6 (Income Position) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(6)}
            >
              <rect
                x="672"
                y="198"
                width="126"
                height="38"
                rx="10"
                fill="#FFFFFF"
                stroke={highlightIncome ? '#10B981' : '#E2E8F0'}
                strokeWidth={highlightIncome ? '2' : '1.5'}
              />
              <text
                x="698"
                y="222"
                fill="#071A4A"
                fontSize="14"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
              >
                6
              </text>
              <circle cx="776" cy="217" r="4" fill={highlightIncome ? '#10B981' : '#94A3B8'} />
            </g>

            {/* ================= LEVEL 3: 7..14 ================= */}
            {/* Node 7 */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(7)}
            >
              <rect x="14" y="282" width="77" height="34" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
              <text x="52.5" y="303" fill="#64748B" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
                7
              </text>
            </g>

            {/* Node 8 (Income Position) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(8)}
            >
              <rect
                x="119"
                y="282"
                width="77"
                height="34"
                rx="8"
                fill="#FFFFFF"
                stroke={highlightIncome ? '#10B981' : '#E2E8F0'}
                strokeWidth={highlightIncome ? '1.8' : '1.2'}
              />
              <text x="157.5" y="303" fill="#071A4A" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
                8
              </text>
            </g>

            {/* Node 9 (Income Position) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(9)}
            >
              <rect
                x="224"
                y="282"
                width="77"
                height="34"
                rx="8"
                fill="#FFFFFF"
                stroke={highlightIncome ? '#10B981' : '#E2E8F0'}
                strokeWidth={highlightIncome ? '1.8' : '1.2'}
              />
              <text x="262.5" y="303" fill="#071A4A" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
                9
              </text>
            </g>

            {/* Node 10 */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(10)}
            >
              <rect x="329" y="282" width="77" height="34" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
              <text x="367.5" y="303" fill="#64748B" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
                10
              </text>
            </g>

            {/* Node 11 (Income Position) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(11)}
            >
              <rect
                x="434"
                y="282"
                width="77"
                height="34"
                rx="8"
                fill="#FFFFFF"
                stroke={highlightIncome ? '#10B981' : '#E2E8F0'}
                strokeWidth={highlightIncome ? '1.8' : '1.2'}
              />
              <text x="472.5" y="303" fill="#071A4A" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
                11
              </text>
            </g>

            {/* Node 12 (Income Position) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(12)}
            >
              <rect
                x="539"
                y="282"
                width="77"
                height="34"
                rx="8"
                fill="#FFFFFF"
                stroke={highlightIncome ? '#10B981' : '#E2E8F0'}
                strokeWidth={highlightIncome ? '1.8' : '1.2'}
              />
              <text x="577.5" y="303" fill="#071A4A" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
                12
              </text>
            </g>

            {/* Node 13 */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(13)}
            >
              <rect x="644" y="282" width="77" height="34" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
              <text x="682.5" y="303" fill="#64748B" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
                13
              </text>
            </g>

            {/* Node 14 */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(14)}
            >
              <rect x="749" y="282" width="77" height="34" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
              <text x="787.5" y="303" fill="#64748B" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
                14
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* ─── DIRECT INCOME BREAKDOWN ─── */}
      <div className="p-5 sm:p-7 border-t border-[#F1F5F9] bg-white space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#155EEF] flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#071A4A] text-sm sm:text-base">
                  Direct Income Generation Model
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Direct Return Positions: 3, 6, 8, 9, 11, 12
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed max-w-2xl">
                In this 14-position single-leg progression model, exactly 6 positions generate 100% direct payouts ($30 USD in TROB each) to the apex owner&apos;s wallet. The remaining positions power cycle advancement and protocol dividend reserves.
              </p>
            </div>
          </div>

          {/* Metric display */}
          <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <div className="text-center px-3">
              <div className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Status</div>
              <div className="text-base font-black text-[#155EEF] mt-0.5">
                Day 22 Launch
              </div>
            </div>
            <div className="w-px h-8 bg-[#E2E8F0]" />
            <div className="text-center px-3">
              <div className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Cycle Capacity</div>
              <div className="text-base font-black text-[#071A4A] mt-0.5">
                ${cyclePotentialUsd} USD
              </div>
            </div>
          </div>
        </div>

        {/* ─── NODE DETAILS INSPECTOR ─── */}
        {activeNode && (
          <div className="p-4 rounded-xl bg-white border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm bg-[#EFF6FF] text-[#155EEF] border border-[#BFDBFE]">
                #{activeNode.position}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#071A4A] text-sm">
                    Position #{activeNode.position} (Slot 01 Node)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    $30 USD in TROB
                  </span>
                  {DIRECT_INCOME_POSITIONS.has(activeNode.position) ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      100% Direct Payout to Apex Owner ($30 USD)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Cycle Advancement Position
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#64748B] mt-0.5">
                  Available for downline placement upon Day 22 Retail Matrix activation.
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPosition(null)}
              className="text-xs text-[#64748B] hover:text-[#071A4A] p-1.5 rounded-lg hover:bg-[#F1F5F9] self-end sm:self-auto cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
