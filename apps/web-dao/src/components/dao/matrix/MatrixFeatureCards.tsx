'use client';

import React from 'react';
import { Calendar, Crown, Layers, Sparkles, Users } from 'lucide-react';
import { useTrobPrice } from '@/hooks/useApi';

export default function MatrixFeatureCards() {
  const { data: price } = useTrobPrice(30_000);
  const trobForSlot1 = price && price.priceUsd > 0 ? Math.round(30 / price.priceUsd) : null;

  return (
    <>
      {/* ================= DESKTOP VIEW (hidden md:grid) ================= */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-2.5 max-w-5xl mx-auto font-sans">
        {/* Card 1: Launch */}
        <div className="bg-white rounded-xl border border-[#E2EEF9] p-3.5 shadow-[0_2px_12px_rgba(14,98,228,0.06)] flex items-start gap-2.5 hover:border-[#0E62E4]/40 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#0E62E4]/20 flex items-center justify-center text-[#0E62E4] shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#4F6D87] font-medium">
              Launch
            </div>
            <div className="text-base font-bold text-[#14304A] tracking-tight mt-0.5">
              Day 22
            </div>
            <p className="text-[11px] text-[#4F6D87] mt-0.5 leading-snug">
              The Retail Matrix goes live.
            </p>
          </div>
        </div>

        {/* Card 2: Matrix Entry */}
        <div className="bg-white rounded-xl border border-[#E2EEF9] p-3.5 shadow-[0_2px_12px_rgba(14,98,228,0.06)] flex items-start gap-2.5 hover:border-[#0E62E4]/40 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#0E62E4]/20 flex items-center justify-center text-[#0E62E4] shrink-0 mt-0.5">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#4F6D87] font-medium">
              Entry Cost
            </div>
            <div className="text-base font-bold text-[#14304A] tracking-tight mt-0.5">
              $30 Entry
            </div>
            <p className="text-[11px] text-[#4F6D87] mt-0.5 leading-snug">
              {trobForSlot1 ? `≈ ${trobForSlot1.toLocaleString()} TROB live rate.` : 'Slot 1 entry fee.'}
            </p>
          </div>
        </div>

        {/* Card 3: Tree Graph Eligibility */}
        <div className="bg-white rounded-xl border border-[#E2EEF9] p-3.5 shadow-[0_2px_12px_rgba(14,98,228,0.06)] flex items-start gap-2.5 hover:border-[#0E62E4]/40 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-700 font-medium">
              Tree Graph
            </div>
            <div className="text-base font-bold text-[#14304A] tracking-tight mt-0.5">
              2 Directs
            </div>
            <p className="text-[11px] text-[#4F6D87] mt-0.5 leading-snug">
              Required to start personal tree.
            </p>
          </div>
        </div>

        {/* Card 4: DAO Share */}
        <div className="bg-white rounded-xl border border-[#E2EEF9] p-3.5 shadow-[0_2px_12px_rgba(14,98,228,0.06)] flex items-start gap-2.5 hover:border-[#0E62E4]/40 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#0E62E4]/20 flex items-center justify-center text-[#0E62E4] shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#4F6D87] font-medium">
              DAO Share
            </div>
            <div className="text-base font-bold text-[#0E62E4] tracking-tight mt-0.5">
              35%
            </div>
            <p className="text-[11px] text-[#4F6D87] mt-0.5 leading-snug">
              Of global matrix volume.
            </p>
          </div>
        </div>

        {/* Card 5: Genesis Root */}
        <div className="bg-white rounded-xl border border-[#E2EEF9] p-3.5 shadow-[0_2px_12px_rgba(14,98,228,0.06)] flex items-start gap-2.5 hover:border-[#0E62E4]/40 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-amber-700 font-medium">
              Genesis Root
            </div>
            <div className="text-base font-bold text-[#14304A] tracking-tight mt-0.5">
              Last DAO Member
            </div>
            <p className="text-[11px] text-[#4F6D87] mt-0.5 leading-snug">
              Apex matrix root granted to member with least cashback.
            </p>
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW (md:hidden) ================= */}
      <div className="md:hidden space-y-2 max-w-xl mx-auto font-sans">
        {/* Mobile Card 1: Launch */}
        <div className="bg-white rounded-xl border border-[#E2EEF9] p-3 shadow-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#0E62E4]/20 flex items-center justify-center text-[#0E62E4] shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-[#4F6D87] font-medium">
                Launch
              </div>
              <div className="text-[11px] text-[#4F6D87] truncate">
                The Retail Matrix goes live.
              </div>
            </div>
          </div>
          <div className="text-sm font-bold text-[#14304A] tracking-tight shrink-0">
            Day 22
          </div>
        </div>

        {/* Mobile Card 2: Matrix Entry */}
        <div className="bg-white rounded-xl border border-[#E2EEF9] p-3 shadow-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#0E62E4]/20 flex items-center justify-center text-[#0E62E4] shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-[#4F6D87] font-medium">
                Entry Cost
              </div>
              <div className="text-[11px] text-[#4F6D87] truncate">
                {trobForSlot1 ? `≈ ${trobForSlot1.toLocaleString()} TROB live rate` : 'Slot 1 entry fee.'}
              </div>
            </div>
          </div>
          <div className="text-sm font-bold text-[#14304A] tracking-tight shrink-0">
            $30 Entry
          </div>
        </div>

        {/* Mobile Card 3: Tree Graph Eligibility */}
        <div className="bg-white rounded-xl border border-[#E2EEF9] p-3 shadow-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-emerald-700 font-medium">
                Tree Graph
              </div>
              <div className="text-[11px] text-[#4F6D87] truncate">
                2 direct referrals required to start tree.
              </div>
            </div>
          </div>
          <div className="text-sm font-bold text-[#14304A] tracking-tight shrink-0">
            2 Directs
          </div>
        </div>

        {/* Mobile Card 4: DAO Share */}
        <div className="bg-white rounded-xl border border-[#E2EEF9] p-3 shadow-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#0E62E4]/20 flex items-center justify-center text-[#0E62E4] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-[#4F6D87] font-medium">
                DAO Share
              </div>
              <div className="text-[11px] text-[#4F6D87] truncate">
                Of global matrix volume.
              </div>
            </div>
          </div>
          <div className="text-sm font-bold text-[#0E62E4] tracking-tight shrink-0">
            35%
          </div>
        </div>

        {/* Mobile Card 5: Genesis Root */}
        <div className="bg-white rounded-xl border border-[#E2EEF9] p-3 shadow-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-amber-700 font-medium">
                Genesis Root
              </div>
              <div className="text-[11px] text-[#4F6D87] truncate">
                Granted to member with least cashback.
              </div>
            </div>
          </div>
          <div className="text-sm font-bold text-[#14304A] tracking-tight shrink-0">
            Last DAO Member
          </div>
        </div>
      </div>
    </>
  );
}
