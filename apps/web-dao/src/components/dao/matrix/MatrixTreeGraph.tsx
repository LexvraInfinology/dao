'use client';

import React, { useState } from 'react';
import { 
  Coins, 
  ArrowUpRight, 
  CheckCircle2, 
  Layers, 
  X,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

// Positions in the 14-node matrix that generate 100% direct payouts to the owner
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
  const wallet = useWallet();
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [highlightIncome, setHighlightIncome] = useState<boolean>(true);

  // User state
  const userAddress = wallet?.address ? String(wallet.address) : '0x7A14b98F03dC48742b6a98f121d51c099307A119';
  const userMemberId = 10042;
  const userMemberCode = 10042;

  // 14-position node progression matching Image 2 state:
  // Filled: 1, 2, 3, 4, 7, 8, 9, 10
  // Open: 5, 6, 11, 12, 13, 14
  const nodes: Record<number, NodeDetail> = {
    1: { position: 1, memberId: 10088, code: 10088, address: '0x8b32...F192', isFilled: true, depositUsd: 30 },
    2: { position: 2, memberId: 10089, code: 10089, address: '0x9c41...83A1', isFilled: true, depositUsd: 30 },
    3: { position: 3, memberId: 10095, code: 10095, address: '0x2d18...91B4', isFilled: true, depositUsd: 30 },
    4: { position: 4, memberId: 10102, code: 10102, address: '0x4f89...72E0', isFilled: true, depositUsd: 30 },
    5: { position: 5, memberId: null, code: null, address: null, isFilled: false, depositUsd: 30 },
    6: { position: 6, memberId: null, code: null, address: null, isFilled: false, depositUsd: 30 },
    7: { position: 7, memberId: 10120, code: 10120, address: '0x7e11...33A9', isFilled: true, depositUsd: 30 },
    8: { position: 8, memberId: 10125, code: 10125, address: '0x1a82...99B0', isFilled: true, depositUsd: 30 },
    9: { position: 9, memberId: 10131, code: 10131, address: '0x3c99...45D1', isFilled: true, depositUsd: 30 },
    10: { position: 10, memberId: 10138, code: 10138, address: '0x8f44...12C8', isFilled: true, depositUsd: 30 },
    11: { position: 11, memberId: null, code: null, address: null, isFilled: false, depositUsd: 30 },
    12: { position: 12, memberId: null, code: null, address: null, isFilled: false, depositUsd: 30 },
    13: { position: 13, memberId: null, code: null, address: null, isFilled: false, depositUsd: 30 },
    14: { position: 14, memberId: null, code: null, address: null, isFilled: false, depositUsd: 30 },
  };

  // Income metrics
  const filledIncomePositions = [3, 6, 8, 9, 11, 12].filter((pos) => nodes[pos]?.isFilled);
  const earnedIncomeUsd = filledIncomePositions.length * 30;
  const cyclePotentialUsd = 6 * 30;

  const activeNode = selectedPosition ? nodes[selectedPosition] : null;

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-[#E2ECF9] shadow-[0_2px_20px_rgba(21,94,239,0.03)] font-jakarta overflow-hidden">
      
      {/* ─── CARD HEADER (Matching Image 2) ─── */}
      <div className="p-5 sm:p-7 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#071A4A] tracking-tight uppercase">
            YOUR MATRIX
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
            14-Node Progression • Slot 01
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
            <span>Income Positions (3, 6, 8, 9, 11, 12)</span>
          </button>
        </div>
      </div>

      {/* ─── RESPONSIVE VECTOR TREE CANVAS (Strictly Matching Image 2) ─── */}
      <div className="bg-[#F8FAFD] p-3 sm:p-6 lg:p-8 flex justify-center items-center">
        <div className="w-full max-w-[840px]">
          <svg
            viewBox="0 0 840 345"
            className="w-full h-auto select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* ================= CONNECTING BRANCH LINES ================= */}
            {/* Level 0 -> Level 1 */}
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

            {/* ================= LEVEL 0: YOU (Center: 420) ================= */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(null)}
            >
              <rect
                x="355"
                y="12"
                width="130"
                height="42"
                rx="10"
                fill="#0052FF"
                className="filter drop-shadow-[0_4px_10px_rgba(0,82,255,0.28)]"
              />
              {/* User vector icon */}
              <circle cx="388" cy="30" r="4.5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
              <path d="M 380 40 C 380 35.5 383.5 34 388 34 C 392.5 34 396 35.5 396 40" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              <text
                x="416"
                y="34"
                fill="#FFFFFF"
                fontSize="13"
                fontWeight="800"
                letterSpacing="0.05em"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                YOU
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
                fill="#0052FF"
                className="filter drop-shadow-[0_4px_10px_rgba(0,82,255,0.22)]"
              />
              {/* Cyan indicator dot */}
              <circle cx="144" cy="126" r="4.5" fill="#00E5FF" />
              <text
                x="159"
                y="130"
                fill="#FFFFFF"
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
                fill="#FFFFFF"
                fillOpacity="0.9"
                fontSize="11"
                fontWeight="700"
                textAnchor="end"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                FILLED
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
                fill="#0052FF"
                className="filter drop-shadow-[0_4px_10px_rgba(0,82,255,0.22)]"
              />
              {/* Cyan indicator dot */}
              <circle cx="564" cy="126" r="4.5" fill="#00E5FF" />
              <text
                x="579"
                y="130"
                fill="#FFFFFF"
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
                fill="#FFFFFF"
                fillOpacity="0.9"
                fontSize="11"
                fontWeight="700"
                textAnchor="end"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                FILLED
              </text>
            </g>

            {/* ================= LEVEL 2: 3, 4, 5, 6 ================= */}
            {/* Node 3 (Filled - Income Position) */}
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
                fill="#0052FF"
                stroke={highlightIncome ? '#00E5FF' : 'none'}
                strokeWidth={highlightIncome ? '2' : '0'}
              />
              <text
                x="68"
                y="222"
                fill="#FFFFFF"
                fontSize="14"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                3
              </text>
              <circle cx="146" cy="217" r="4" fill="#00E5FF" />
            </g>

            {/* Node 4 (Filled) */}
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
                fill="#0052FF"
              />
              <text
                x="278"
                y="222"
                fill="#FFFFFF"
                fontSize="14"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                4
              </text>
              <circle cx="356" cy="217" r="4" fill="#00E5FF" />
            </g>

            {/* Node 5 (Open) */}
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
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                5
              </text>
              <circle cx="566" cy="217" r="4" fill="#E2E8F0" />
            </g>

            {/* Node 6 (Open - Income Position) */}
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
                stroke={highlightIncome ? '#38BDF8' : '#E2E8F0'}
                strokeWidth={highlightIncome ? '2' : '1.5'}
              />
              <text
                x="698"
                y="222"
                fill="#64748B"
                fontSize="14"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              >
                6
              </text>
              <circle cx="776" cy="217" r="4" fill="#E2E8F0" />
            </g>

            {/* ================= LEVEL 3: 7..14 ================= */}
            {/* Node 7 (Filled) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(7)}
            >
              <rect x="14" y="282" width="77" height="34" rx="8" fill="#0052FF" />
              <text x="52.5" y="303" fill="#FFFFFF" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
                7
              </text>
            </g>

            {/* Node 8 (Filled - Income Position) */}
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
                fill="#0052FF"
                stroke={highlightIncome ? '#00E5FF' : 'none'}
                strokeWidth={highlightIncome ? '2' : '0'}
              />
              <text x="157.5" y="303" fill="#FFFFFF" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
                8
              </text>
            </g>

            {/* Node 9 (Filled - Income Position) */}
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
                fill="#0052FF"
                stroke={highlightIncome ? '#00E5FF' : 'none'}
                strokeWidth={highlightIncome ? '2' : '0'}
              />
              <text x="262.5" y="303" fill="#FFFFFF" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
                9
              </text>
            </g>

            {/* Node 10 (Filled) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(10)}
            >
              <rect x="329" y="282" width="77" height="34" rx="8" fill="#0052FF" />
              <text x="367.5" y="303" fill="#FFFFFF" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
                10
              </text>
            </g>

            {/* Node 11 (Open - Income Position) */}
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
                stroke={highlightIncome ? '#38BDF8' : '#E2E8F0'}
                strokeWidth={highlightIncome ? '1.8' : '1.2'}
              />
              <text x="472.5" y="303" fill="#64748B" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
                11
              </text>
            </g>

            {/* Node 12 (Open - Income Position) */}
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
                stroke={highlightIncome ? '#38BDF8' : '#E2E8F0'}
                strokeWidth={highlightIncome ? '1.8' : '1.2'}
              />
              <text x="577.5" y="303" fill="#64748B" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
                12
              </text>
            </g>

            {/* Node 13 (Open) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPosition(13)}
            >
              <rect x="644" y="282" width="77" height="34" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
              <text x="682.5" y="303" fill="#64748B" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
                13
              </text>
            </g>

            {/* Node 14 (Open) */}
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

      {/* ─── DIRECT INCOME BREAKDOWN (Zero Emojis, Institutional Fintech Design) ─── */}
      <div className="p-5 sm:p-7 border-t border-[#F1F5F9] bg-white space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#155EEF] flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#071A4A] text-sm sm:text-base">
                  Direct Income Generation Breakdown
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Positions: 3, 6, 8, 9, 11, 12
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed max-w-2xl">
                In this 14-position single-leg progression, exactly 6 positions generate 100% direct payouts ($30 each) to your connected wallet. The remaining positions power slot advancement and protocol pools.
              </p>
            </div>
          </div>

          {/* Metric display */}
          <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <div className="text-center px-3">
              <div className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Earned Income</div>
              <div className="text-base font-black text-emerald-600 mt-0.5">
                ${earnedIncomeUsd} USD
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

        {/* ─── NODE DETAILS INSPECTOR (Reveals Member ID upon click) ─── */}
        {activeNode && (
          <div className="p-4 rounded-xl bg-white border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                activeNode.isFilled ? 'bg-[#0052FF] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                #{activeNode.position}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#071A4A] text-sm">
                    {activeNode.isFilled ? `Member #${activeNode.memberId}` : `Position #${activeNode.position} (Open Slot)`}
                  </span>
                  {activeNode.isFilled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      $30 USD in TROB Deposited
                    </span>
                  )}
                  {DIRECT_INCOME_POSITIONS.has(activeNode.position) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Direct Income Position
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#64748B] font-mono mt-0.5">
                  {activeNode.isFilled 
                    ? `${activeNode.address} • Referral Code: ${activeNode.code}` 
                    : 'Awaiting next member deposit of $30 worth of TROB'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPosition(null)}
              className="text-xs text-[#64748B] hover:text-[#071A4A] p-1.5 rounded-lg hover:bg-[#F1F5F9] self-end sm:self-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
