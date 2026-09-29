'use client';

import React, { useState } from 'react';
import { 
  User, 
  CheckCircle2, 
  Sparkles, 
  Coins, 
  Info, 
  ArrowRight,
  ChevronRight,
  X
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

// Income positions that pay 100% directly to YOU (the matrix owner)
const OWNER_INCOME_POSITIONS = new Set([3, 6, 8, 9, 11, 12]);

export interface MatrixNodeItem {
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

  // User state
  const userAddress = wallet?.address ? String(wallet.address) : '0x7A14b98F03dC48742b6a98f121d51c099307A119';
  const userMemberId = 10042;
  const userMemberCode = 10042;

  // 14-position node progression state matching Image 2:
  // Filled: 1, 2, 3, 4, 7, 8, 9, 10
  // Open: 5, 6, 11, 12, 13, 14
  const nodes: Record<number, MatrixNodeItem> = {
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

  // Calculate your generated income
  const filledIncomeCount = [3, 6, 8, 9, 11, 12].filter((p) => nodes[p]?.isFilled).length;
  const earnedIncome = filledIncomeCount * 30;
  const maxIncome = 6 * 30; // $180

  const activeNode = selectedPosition ? nodes[selectedPosition] : null;

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-[#E2ECF9] shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta overflow-hidden">
      
      {/* ─── CARD HEADER (Matching Image 2) ─── */}
      <div className="p-5 sm:p-7 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#071A4A] tracking-tight uppercase">
            YOUR MATRIX
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
            14-Node Progression • Slot 01 ($30 TROB)
          </p>
        </div>

        {/* Right side status / slot info */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]/70 text-[#155EEF] text-xs font-bold shadow-2xs">
            <Coins className="w-3.5 h-3.5" />
            <span>Your Generated Income: <strong className="font-black text-[#071A4A]">${earnedIncome}</strong> / ${maxIncome}</span>
          </div>
        </div>
      </div>

      {/* ─── TREE GRAPH CANVAS (Clean layout matching Image 2) ─── */}
      <div className="bg-[#F6F9FD] p-4 sm:p-8 overflow-x-auto select-none">
        {/* Fixed coordinate inner canvas (width: 820px) to guarantee exact geometric line alignment */}
        <div className="relative w-[820px] h-[370px] mx-auto">
          
          {/* ================= SVG CONNECTING LINES ================= */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 820 370">
            {/* 1. YOU -> Level 1 (Drop from 410, 44 to 410, 72; Bar from 205 to 615; Drops to 205, 96 and 615, 96) */}
            <path d="M 410 44 L 410 72" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 205 72 L 615 72" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 205 72 L 205 96" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 615 72 L 615 96" fill="none" stroke="#BFDBFE" strokeWidth="2" />

            {/* 2. Level 1 -> Level 2 */}
            {/* Left branch from Slot 1 (Drop from 205, 140 to 205, 168; Bar from 102.5 to 307.5; Drops to 102.5, 192 and 307.5, 192) */}
            <path d="M 205 140 L 205 168" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 102.5 168 L 307.5 168" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 102.5 168 L 102.5 192" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 307.5 168 L 307.5 192" fill="none" stroke="#BFDBFE" strokeWidth="2" />

            {/* Right branch from Slot 2 (Drop from 615, 140 to 615, 168; Bar from 512.5 to 717.5; Drops to 512.5, 192 and 717.5, 192) */}
            <path d="M 615 140 L 615 168" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 512.5 168 L 717.5 168" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 512.5 168 L 512.5 192" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 717.5 168 L 717.5 192" fill="none" stroke="#BFDBFE" strokeWidth="2" />

            {/* 3. Level 2 -> Level 3 */}
            {/* From Node 3 (Drop from 102.5, 234 to 102.5, 260; Bar from 51.25 to 153.75; Drops to 51.25, 282 and 153.75, 282) */}
            <path d="M 102.5 234 L 102.5 260" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 51.25 260 L 153.75 260" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 51.25 260 L 51.25 282" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 153.75 260 L 153.75 282" fill="none" stroke="#BFDBFE" strokeWidth="2" />

            {/* From Node 4 (Drop from 307.5, 234 to 307.5, 260; Bar from 256.25 to 358.75; Drops to 256.25, 282 and 358.75, 282) */}
            <path d="M 307.5 234 L 307.5 260" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 256.25 260 L 358.75 260" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 256.25 260 L 256.25 282" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 358.75 260 L 358.75 282" fill="none" stroke="#BFDBFE" strokeWidth="2" />

            {/* From Node 5 (Drop from 512.5, 234 to 512.5, 260; Bar from 461.25 to 563.75; Drops to 461.25, 282 and 563.75, 282) */}
            <path d="M 512.5 234 L 512.5 260" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 461.25 260 L 563.75 260" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 461.25 260 L 461.25 282" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 563.75 260 L 563.75 282" fill="none" stroke="#BFDBFE" strokeWidth="2" />

            {/* From Node 6 (Drop from 717.5, 234 to 717.5, 260; Bar from 666.25 to 768.75; Drops to 666.25, 282 and 768.75, 282) */}
            <path d="M 717.5 234 L 717.5 260" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 666.25 260 L 768.75 260" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 666.25 260 L 666.25 282" fill="none" stroke="#BFDBFE" strokeWidth="2" />
            <path d="M 768.75 260 L 768.75 282" fill="none" stroke="#BFDBFE" strokeWidth="2" />
          </svg>

          {/* ================= LEVEL 0: YOU (Matching Image 2) ================= */}
          <div 
            onClick={() => setSelectedPosition(null)}
            className="absolute top-0 left-1/2 -translate-x-1/2 cursor-pointer z-10"
          >
            <div className="w-36 h-11 rounded-xl bg-[#0052FF] hover:bg-[#0047e0] text-white font-bold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,82,255,0.35)] transition-transform hover:scale-105">
              <User className="w-4 h-4" />
              <span className="text-sm tracking-wide">YOU</span>
            </div>
          </div>

          {/* ================= LEVEL 1: SLOT 1 & SLOT 2 ================= */}
          {/* SLOT 1 (Center at X: 205, Y: 96) */}
          <div 
            onClick={() => setSelectedPosition(1)}
            className="absolute top-[96px] left-[205px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-105"
          >
            <div className="w-44 h-11 rounded-xl bg-[#0052FF] text-white font-bold px-4 flex items-center justify-between shadow-[0_4px_14px_rgba(0,82,255,0.25)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                <span className="text-xs tracking-wider">SLOT 1</span>
              </div>
              <span className="text-[11px] font-semibold text-white/90">FILLED</span>
            </div>
          </div>

          {/* SLOT 2 (Center at X: 615, Y: 96) */}
          <div 
            onClick={() => setSelectedPosition(2)}
            className="absolute top-[96px] left-[615px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-105"
          >
            <div className="w-44 h-11 rounded-xl bg-[#0052FF] text-white font-bold px-4 flex items-center justify-between shadow-[0_4px_14px_rgba(0,82,255,0.25)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                <span className="text-xs tracking-wider">SLOT 2</span>
              </div>
              <span className="text-[11px] font-semibold text-white/90">FILLED</span>
            </div>
          </div>

          {/* ================= LEVEL 2: 3, 4, 5, 6 ================= */}
          {/* Node 3 (Center X: 102.5, Y: 192) - FILLED & GENERATES YOUR INCOME */}
          <div 
            onClick={() => setSelectedPosition(3)}
            className="absolute top-[192px] left-[102.5px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-105"
          >
            <div className="relative w-32 h-10.5 rounded-xl bg-[#0052FF] text-white font-bold px-4 flex items-center justify-between shadow-xs">
              <span className="text-sm font-extrabold">3</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold text-[#00E5FF] bg-white/10 px-1 py-0.2 rounded">+$30</span>
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
              </div>
            </div>
          </div>

          {/* Node 4 (Center X: 307.5, Y: 192) - FILLED */}
          <div 
            onClick={() => setSelectedPosition(4)}
            className="absolute top-[192px] left-[307.5px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-105"
          >
            <div className="w-32 h-10.5 rounded-xl bg-[#0052FF] text-white font-bold px-4 flex items-center justify-between shadow-xs">
              <span className="text-sm font-extrabold">4</span>
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
            </div>
          </div>

          {/* Node 5 (Center X: 512.5, Y: 192) - OPEN */}
          <div 
            onClick={() => setSelectedPosition(5)}
            className="absolute top-[192px] left-[512.5px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-105"
          >
            <div className="w-32 h-10.5 rounded-xl bg-white border border-[#E2E8F0] text-[#071A4A] font-bold px-4 flex items-center justify-between shadow-2xs hover:border-[#CBD5E1]">
              <span className="text-sm font-extrabold text-[#64748B]">5</span>
              <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
            </div>
          </div>

          {/* Node 6 (Center X: 717.5, Y: 192) - OPEN & GENERATES YOUR INCOME */}
          <div 
            onClick={() => setSelectedPosition(6)}
            className="absolute top-[192px] left-[717.5px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-105"
          >
            <div className="w-32 h-10.5 rounded-xl bg-white border border-[#E2E8F0] text-[#071A4A] font-bold px-4 flex items-center justify-between shadow-2xs hover:border-[#CBD5E1]">
              <span className="text-sm font-extrabold text-[#64748B]">6</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">+$30</span>
                <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
              </div>
            </div>
          </div>

          {/* ================= LEVEL 3: 7..14 ================= */}
          {/* Node 7 (X: 51.25, Y: 282) - FILLED */}
          <div 
            onClick={() => setSelectedPosition(7)}
            className="absolute top-[282px] left-[51.25px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-110"
          >
            <div className="w-20 h-9 rounded-lg bg-[#0052FF] text-white font-bold flex items-center justify-center text-xs shadow-xs">
              7
            </div>
          </div>

          {/* Node 8 (X: 153.75, Y: 282) - FILLED & GENERATES YOUR INCOME */}
          <div 
            onClick={() => setSelectedPosition(8)}
            className="absolute top-[282px] left-[153.75px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-110"
          >
            <div className="relative w-20 h-9 rounded-lg bg-[#0052FF] text-white font-bold flex items-center justify-center gap-1 text-xs shadow-xs ring-1 ring-[#00E5FF]/40">
              <span>8</span>
              <span className="text-[8px] font-extrabold text-[#00E5FF]">+$30</span>
            </div>
          </div>

          {/* Node 9 (X: 256.25, Y: 282) - FILLED & GENERATES YOUR INCOME */}
          <div 
            onClick={() => setSelectedPosition(9)}
            className="absolute top-[282px] left-[256.25px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-110"
          >
            <div className="relative w-20 h-9 rounded-lg bg-[#0052FF] text-white font-bold flex items-center justify-center gap-1 text-xs shadow-xs ring-1 ring-[#00E5FF]/40">
              <span>9</span>
              <span className="text-[8px] font-extrabold text-[#00E5FF]">+$30</span>
            </div>
          </div>

          {/* Node 10 (X: 358.75, Y: 282) - FILLED */}
          <div 
            onClick={() => setSelectedPosition(10)}
            className="absolute top-[282px] left-[358.75px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-110"
          >
            <div className="w-20 h-9 rounded-lg bg-[#0052FF] text-white font-bold flex items-center justify-center text-xs shadow-xs">
              10
            </div>
          </div>

          {/* Node 11 (X: 461.25, Y: 282) - OPEN & GENERATES YOUR INCOME */}
          <div 
            onClick={() => setSelectedPosition(11)}
            className="absolute top-[282px] left-[461.25px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-110"
          >
            <div className="w-20 h-9 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] font-bold flex items-center justify-center gap-1 text-xs shadow-2xs hover:border-[#CBD5E1]">
              <span>11</span>
              <span className="text-[8px] font-bold text-emerald-600">+$30</span>
            </div>
          </div>

          {/* Node 12 (X: 563.75, Y: 282) - OPEN & GENERATES YOUR INCOME */}
          <div 
            onClick={() => setSelectedPosition(12)}
            className="absolute top-[282px] left-[563.75px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-110"
          >
            <div className="w-20 h-9 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] font-bold flex items-center justify-center gap-1 text-xs shadow-2xs hover:border-[#CBD5E1]">
              <span>12</span>
              <span className="text-[8px] font-bold text-emerald-600">+$30</span>
            </div>
          </div>

          {/* Node 13 (X: 666.25, Y: 282) - OPEN */}
          <div 
            onClick={() => setSelectedPosition(13)}
            className="absolute top-[282px] left-[666.25px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-110"
          >
            <div className="w-20 h-9 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] font-bold flex items-center justify-center text-xs shadow-2xs hover:border-[#CBD5E1]">
              13
            </div>
          </div>

          {/* Node 14 (X: 768.75, Y: 282) - OPEN */}
          <div 
            onClick={() => setSelectedPosition(14)}
            className="absolute top-[282px] left-[768.75px] -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-110"
          >
            <div className="w-20 h-9 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] font-bold flex items-center justify-center text-xs shadow-2xs hover:border-[#CBD5E1]">
              14
            </div>
          </div>

        </div>
      </div>

      {/* ─── YOUR INCOME GENERATION SUMMARY ─── */}
      <div className="p-5 sm:p-7 border-t border-[#F1F5F9] bg-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 font-black text-base shadow-xs">
              💰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#071A4A] text-sm sm:text-base">
                  Your Direct Income Generator (6 Positions)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  100% Payout Directly to You
                </span>
              </div>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed max-w-2xl">
                Positions <strong className="text-[#071A4A]">3, 6, 8, 9, 11, and 12</strong> generate your direct income. As members fill these positions, each pays <strong className="text-emerald-700">$30 worth of TROB</strong> instantly into your wallet ($180 total per cycle).
              </p>
            </div>
          </div>

          {/* Income tracker metric */}
          <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
            <div className="text-center px-2">
              <div className="text-[10px] text-[#64748B] uppercase font-bold">Earned Income</div>
              <div className="text-sm font-black text-emerald-600 mt-0.5">
                ${earnedIncome} TROB
              </div>
            </div>
            <div className="w-px h-7 bg-[#E2E8F0]" />
            <div className="text-center px-2">
              <div className="text-[10px] text-[#64748B] uppercase font-bold">Cycle Potential</div>
              <div className="text-sm font-black text-[#071A4A] mt-0.5">
                ${maxIncome} TROB
              </div>
            </div>
          </div>
        </div>

        {/* ─── NODE INSPECTOR (Reveals Member ID upon click) ─── */}
        {activeNode && (
          <div className="mt-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                activeNode.isFilled ? 'bg-[#0052FF] text-white' : 'bg-white border border-[#CBD5E1] text-[#64748B]'
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
                      $30 TROB Active
                    </span>
                  )}
                  {OWNER_INCOME_POSITIONS.has(activeNode.position) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      ✨ Direct Income for You
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#64748B] font-mono mt-0.5">
                  {activeNode.isFilled ? `${activeNode.address} (Code: ${activeNode.code})` : 'Waiting for next member placement ($30 deposit)'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPosition(null)}
              className="text-xs text-[#64748B] hover:text-[#071A4A] p-1.5 rounded-lg hover:bg-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
