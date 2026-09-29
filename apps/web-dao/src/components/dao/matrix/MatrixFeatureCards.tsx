'use client';

import React from 'react';
import { Calendar, Crown, Layers, Sparkles } from 'lucide-react';
import { useTrobPrice } from '@/hooks/useApi';

export default function MatrixFeatureCards() {
  const { data: price } = useTrobPrice(30_000);
  const trobForSlot1 = price && price.priceUsd > 0 ? Math.round(30 / price.priceUsd) : null;

  return (
    <>
      {/* ================= DESKTOP VIEW (hidden md:grid) ================= */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 max-w-5xl mx-auto font-jakarta">
        {/* Card 1: Launch */}
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-[#E2ECF9] p-5 shadow-[0_2px_15px_rgba(21,94,239,0.02)] flex items-start gap-3.5 hover:border-[#BFDBFE] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0 mt-0.5">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748B] font-medium">
              Launch
            </div>
            <div className="text-lg font-bold text-[#071A4A] tracking-tight mt-0.5">
              Day 22
            </div>
            <p className="text-xs text-[#64748B] mt-1 leading-snug">
              The Retail Matrix goes live.
            </p>
          </div>
        </div>

        {/* Card 2: Matrix */}
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-[#E2ECF9] p-5 shadow-[0_2px_15px_rgba(21,94,239,0.02)] flex items-start gap-3.5 hover:border-[#BFDBFE] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748B] font-medium">
              Matrix
            </div>
            <div className="text-lg font-bold text-[#071A4A] tracking-tight mt-0.5">
              $30 Entry
            </div>
            <p className="text-xs text-[#64748B] mt-1 leading-snug">
              {trobForSlot1 ? `≈ ${trobForSlot1.toLocaleString()} TROB live rate.` : 'Accessible to all members.'}
            </p>
          </div>
        </div>

        {/* Card 3: DAO Share */}
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-[#E2ECF9] p-5 shadow-[0_2px_15px_rgba(21,94,239,0.02)] flex items-start gap-3.5 hover:border-[#BFDBFE] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748B] font-medium">
              DAO Share
            </div>
            <div className="text-lg font-bold text-[#155EEF] tracking-tight mt-0.5">
              35%
            </div>
            <p className="text-xs text-[#64748B] mt-1 leading-snug">
              Of global matrix volume.
            </p>
          </div>
        </div>

        {/* Card 4: Genesis Root */}
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-[#E2ECF9] p-5 shadow-[0_2px_15px_rgba(21,94,239,0.02)] flex items-start gap-3.5 hover:border-[#BFDBFE] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-700 font-medium">
              Genesis Root
            </div>
            <div className="text-lg font-bold text-[#071A4A] tracking-tight mt-0.5">
              Last DAO Member
            </div>
            <p className="text-xs text-[#64748B] mt-1 leading-snug">
              Top of the entire matrix tree.
            </p>
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW (md:hidden) ================= */}
      <div className="md:hidden space-y-3 max-w-xl mx-auto font-jakarta">
        {/* Mobile Card 1: Launch */}
        <div className="bg-white rounded-2xl border border-[#E2ECF9] p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#64748B] font-medium">
                Launch
              </div>
              <div className="text-xs text-[#64748B] mt-0.5 truncate">
                The Retail Matrix goes live.
              </div>
            </div>
          </div>
          <div className="text-base font-bold text-[#071A4A] tracking-tight shrink-0">
            Day 22
          </div>
        </div>

        {/* Mobile Card 2: Matrix */}
        <div className="bg-white rounded-2xl border border-[#E2ECF9] p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#64748B] font-medium">
                Matrix
              </div>
              <div className="text-xs text-[#64748B] mt-0.5 truncate">
                {trobForSlot1 ? `≈ ${trobForSlot1.toLocaleString()} TROB live rate` : 'Accessible to all members.'}
              </div>
            </div>
          </div>
          <div className="text-base font-bold text-[#071A4A] tracking-tight shrink-0">
            $30 Entry
          </div>
        </div>

        {/* Mobile Card 3: DAO Share */}
        <div className="bg-white rounded-2xl border border-[#E2ECF9] p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE]/60 flex items-center justify-center text-[#155EEF] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#64748B] font-medium">
                DAO Share
              </div>
              <div className="text-xs text-[#64748B] mt-0.5 truncate">
                Of global matrix volume.
              </div>
            </div>
          </div>
          <div className="text-base font-bold text-[#155EEF] tracking-tight shrink-0">
            35%
          </div>
        </div>

        {/* Mobile Card 4: Genesis Root */}
        <div className="bg-white rounded-2xl border border-[#E2ECF9] p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-amber-700 font-medium">
                Genesis Root
              </div>
              <div className="text-xs text-[#64748B] mt-0.5 truncate">
                Top of the entire matrix tree.
              </div>
            </div>
          </div>
          <div className="text-base font-bold text-[#071A4A] tracking-tight shrink-0">
            Last DAO Member
          </div>
        </div>
      </div>
    </>
  );
}
