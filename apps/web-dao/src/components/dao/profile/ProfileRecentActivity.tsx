'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  History,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Vote,
  RefreshCw,
  ThumbsUp,
  Cpu,
} from 'lucide-react';

export const ProfileRecentActivity: React.FC = () => {
  return (
    <>
      {/* =========================================================================
          DESKTOP VIEW (Visible on lg and above - exactly matching Desktop Figma)
         ========================================================================= */}
      <div className="hidden lg:block bg-white border border-[#E2ECF9] rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF2FE] text-[#155EEF] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-jakarta text-[#071A4A]">
              Recent Activity
            </h3>
          </div>

          <Link
            href="/dao/transactions"
            className="text-xs font-bold font-jakarta text-[#155EEF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Activity Cards */}
        <div className="space-y-3">
          {/* Card 1: Seat Distribution */}
          <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-2xl p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-jakarta text-[#071A4A]">
                    Seat Distribution
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] text-[9px] font-bold uppercase font-mono">
                    ON-CHAIN
                  </span>
                </div>
                <div className="text-xs text-[#64748B] font-jakarta truncate">
                  From Seat #84 • Member #1172
                </div>
                <div className="text-[11px] text-[#94A3B8] font-jakarta">
                  2 mins ago
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-sm font-black font-jakarta text-[#059669]">
                +$48.20 USD
              </div>
              <div className="text-[11px] text-[#64748B] font-jakarta">
                ≈ +317.94 TROB
              </div>
            </div>
          </div>

          {/* Card 2: Vote Cast */}
          <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-2xl p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                <Vote className="w-4 h-4" />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-jakarta text-[#071A4A]">
                    Vote Cast
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#EDE9FE] text-[#7C3AED] text-[9px] font-bold uppercase font-mono">
                    GOVERNANCE
                  </span>
                </div>
                <div className="text-xs text-[#64748B] font-jakarta truncate">
                  Proposal #012: Treasury Allocation
                </div>
                <div className="text-[11px] text-[#94A3B8] font-jakarta">
                  1 day ago
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-sm font-bold font-jakarta text-[#155EEF]">
                Affirmative (1.0%)
              </div>
              <div className="text-[11px] font-semibold text-[#059669] font-jakarta">
                Consensus Recorded
              </div>
            </div>
          </div>

          {/* Card 3: Withdrawal */}
          <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-2xl p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-jakarta text-[#071A4A]">
                    Withdrawal
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] text-[9px] font-bold uppercase font-mono">
                    SETTLED
                  </span>
                </div>
                <div className="text-xs text-[#64748B] font-jakarta truncate">
                  To Connected Wallet (0x8A3F...91F2)
                </div>
                <div className="text-[11px] text-[#94A3B8] font-jakarta">
                  3 days ago
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-sm font-black font-jakarta text-[#DC2626]">
                -$420.50 USD
              </div>
              <div className="text-[11px] text-[#64748B] font-jakarta">
                ≈ -2,773.75 TROB
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Block Stream Sync Bar */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-[#64748B] font-jakarta">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Real-time block stream sync</span>
          </div>
          <div className="font-mono text-[#64748B]">
            Ref: Trobium Consensus Block #4,198,024
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (Visible below lg - exactly matching Mobile Figma)
         ========================================================================= */}
      <div className="lg:hidden bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#155EEF]" />
            <h3 className="text-sm font-bold font-jakarta text-[#071A4A]">
              Recent Activity
            </h3>
          </div>

          <Link
            href="/dao/transactions"
            className="text-xs font-bold font-jakarta text-[#155EEF] hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <span>&gt;</span>
          </Link>
        </div>

        {/* 3 Activity Cards */}
        <div className="space-y-2.5">
          {/* Card 1: Seat Distribution */}
          <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-bold font-jakarta text-[#071A4A] truncate">
                  Seat Distribution
                </div>
                <div className="text-[10px] text-[#64748B] font-jakarta truncate">
                  From Seat #84 • Member #1172
                </div>
                <div className="text-[10px] text-[#94A3B8] font-jakarta">
                  2 mins ago
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-black font-jakarta text-[#0284C7]">
                +$48.20 USD
              </div>
              <div className="text-[10px] text-[#64748B] font-jakarta">
                +317.94 TROB
              </div>
            </div>
          </div>

          {/* Card 2: Vote Cast: Approved */}
          <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FE] text-[#4F46E5] flex items-center justify-center shrink-0">
                <ThumbsUp className="w-4 h-4" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-bold font-jakarta text-[#071A4A] truncate">
                  Vote Cast: Approved
                </div>
                <div className="text-[10px] text-[#64748B] font-jakarta truncate">
                  Proposal #012 (Treasury Rebalance)
                </div>
                <div className="text-[10px] text-[#94A3B8] font-jakarta">
                  1 day ago
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] text-[10px] font-bold">
                1 VOTE
              </span>
            </div>
          </div>

          {/* Card 3: Withdrawal */}
          <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-bold font-jakarta text-[#071A4A] truncate">
                  Withdrawal
                </div>
                <div className="text-[10px] text-[#64748B] font-jakarta truncate">
                  To 0x8A3F...91F2
                </div>
                <div className="text-[10px] text-[#94A3B8] font-jakarta">
                  3 days ago
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-black font-jakarta text-[#071A4A]">
                -$420.50 USD
              </div>
              <div className="text-[10px] font-semibold text-[#0284C7] font-jakarta">
                Confirmed
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Subgraph Synchronized indicator */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#64748B] font-jakarta">
          <Cpu className="w-3 h-3 text-[#94A3B8]" />
          <span>Genesis Subgraph V3.2 • Synchronized</span>
        </div>
      </div>
    </>
  );
};
