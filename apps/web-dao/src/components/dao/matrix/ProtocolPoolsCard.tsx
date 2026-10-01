'use client';

import React from 'react';
import { ShieldCheck, Sparkles, Trophy, Gift, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

export const ProtocolPoolsCard: React.FC = () => {
  const { data: matrixData } = useApi<{
    protocolPools: {
      daoTreasuryPct: number;
      monthlySalaryPct: number;
      magicBlindBoxPct: number;
      luckyDropsPct: number;
      activeDaoMemberCount: number;
      isFull100: boolean;
      perSeatSharePct: number;
      distributionModel: string;
    };
  }>('/api/dao/matrix', { refreshInterval: 15_000 });

  const pools = matrixData?.protocolPools;
  const activeCount = pools?.activeDaoMemberCount ?? 2;
  const perSeatPct = pools?.perSeatSharePct ?? (35 / activeCount);

  return (
    <div className="bg-white border border-[#E2EEF9] rounded-2xl p-4 sm:p-6 shadow-[0_2px_15px_rgba(14,98,228,0.06)] space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#E7EEF8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-[#14304A]">
              4 Automated Protocol Pools
            </h3>
          </div>
          <p className="text-xs text-[#4F6D87] mt-0.5 leading-relaxed">
            Every Retail Matrix entry ($30 USD) programmatically routes into 4 autonomous on-chain value pools.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold self-start sm:self-auto">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>35% Instant Push to DAO</span>
        </div>
      </div>

      {/* 4 Pools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Pool 1: Genesis DAO Treasury (35%) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#EFF6FF] to-white border-2 border-[#0E62E4]/30 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-[#0E62E4] text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-[#0E62E4]">35%</span>
          </div>
          <div>
            <div className="text-xs font-bold text-[#14304A]">Genesis DAO Treasury</div>
            <p className="text-[10.5px] text-[#4F6D87] mt-0.5 leading-relaxed">
              Instant P2P push to active DAO member wallets on every matrix node.
            </p>
          </div>
          <div className="pt-1 border-t border-[#0E62E4]/15 text-[10px] font-semibold text-[#0E62E4]">
            {activeCount < 100
              ? `${perSeatPct.toFixed(2)}% per seat (${activeCount} active seats)`
              : '0.35% per seat (100 seats filled)'}
          </div>
        </div>

        {/* Pool 2: Monthly Salary (40%) */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2EEF9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-indigo-600">40%</span>
          </div>
          <div>
            <div className="text-xs font-bold text-[#14304A]">Monthly Leader Salary</div>
            <p className="text-[10.5px] text-[#4F6D87] mt-0.5 leading-relaxed">
              Automated monthly payout stream for top matrix builders and distributors.
            </p>
          </div>
          <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
            30-Day Automated Epoch
          </div>
        </div>

        {/* Pool 3: Magic Blind Box (10%) */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2EEF9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-amber-600">10%</span>
          </div>
          <div>
            <div className="text-xs font-bold text-[#14304A]">Magic Blind Box</div>
            <p className="text-[10.5px] text-[#4F6D87] mt-0.5 leading-relaxed">
              Algorithmic surprise bonus triggers awarded on matrix cycle completions.
            </p>
          </div>
          <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
            Smart Cycle Distribution
          </div>
        </div>

        {/* Pool 4: Lucky Drops (15%) */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2EEF9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-emerald-600">15%</span>
          </div>
          <div>
            <div className="text-xs font-bold text-[#14304A]">Lucky Drops Pool</div>
            <p className="text-[10.5px] text-[#4F6D87] mt-0.5 leading-relaxed">
              High-impact randomized reward drops to active ecosystem participants.
            </p>
          </div>
          <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
            Community Randomized Push
          </div>
        </div>
      </div>

      {/* Proportional Payout Rule Banner */}
      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Autonomous Proportional Allocation Guarantee:</strong>{' '}
          {activeCount < 100 ? (
            <span>
              Because only <strong className="font-bold">{activeCount} of 100</strong> seats are currently claimed, 100% of the 35% Genesis DAO Treasury stream is divided equally among the active seats ({perSeatPct.toFixed(2)}% per active member), pushing funds directly into your connected wallet without waiting for all 100 seats to fill!
            </span>
          ) : (
            <span>
              All 100 Council seats are fully sealed. Each seat permanently receives an equal 0.35% instantaneous royalty push from every matrix transaction worldwide.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
