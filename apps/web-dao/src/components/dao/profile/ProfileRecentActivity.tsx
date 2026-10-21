'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, History, ArrowRight, ArrowDownLeft, ArrowUpRight,
  Vote, Layers, Cpu, Loader2, ChevronRight, ShieldCheck,
} from 'lucide-react';
import type { TransactionItem } from '@/hooks/useApi';
import { TransactionDetailModal } from '@/components/dao/transactions/TransactionDetailModal';

interface ProfileRecentActivityProps {
  transactions?: TransactionItem[];
  loading?: boolean;
  activeAddress?: string | null;
}

function parseUtcTimestamp(ts: string | number | Date | null | undefined): number {
  if (!ts) return Date.now();
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'number') return ts;
  const s = String(ts).trim();
  if (s.endsWith('Z') || s.includes('+') || (s.lastIndexOf('-') > 10)) {
    return new Date(s).getTime();
  }
  return new Date(s.replace(' ', 'T') + 'Z').getTime();
}

function timeAgoLabel(ts: string): string {
  const diff = Date.now() - parseUtcTimestamp(ts);
  const s = Math.max(0, Math.floor(diff / 1000));
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatEntity(addr: string | undefined, userAddr: string | null | undefined): string {
  if (!addr) return '—';
  const clean = addr.toLowerCase();
  const canonicalUser = (userAddr || '').toLowerCase();
  if (canonicalUser && clean === canonicalUser) return 'Your Wallet';
  if (addr === 'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT' || addr.startsWith('TP7e2u') || addr.toLowerCase().startsWith('419')) {
    return 'DAO Contract';
  }
  return addr.length > 14 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function getIcon(type: string, size: 'sm' | 'xs' = 'sm') {
  const w = size === 'sm' ? 'w-9 h-9' : 'w-8 h-8';
  const i = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';

  if (type === 'withdrawal')
    return <div className={`${w} rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 shadow-2xs`}><ArrowUpRight className={i} /></div>;
  if (type.startsWith('matrix_'))
    return <div className={`${w} rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-2xs`}><Layers className={i} /></div>;
  if (type.includes('vote') || type === 'governance')
    return <div className={`${w} rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-2xs`}><Vote className={i} /></div>;
  // default: inflow
  return <div className={`${w} rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 shadow-2xs`}><ArrowDownLeft className={i} /></div>;
}

export const ProfileRecentActivity: React.FC<ProfileRecentActivityProps> = ({
  transactions = [],
  loading = false,
  activeAddress = null,
}) => {
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const items = transactions.slice(0, 4);

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block bg-white border border-[#E2ECF9] rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF2FE] text-[#155EEF] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-jakarta text-[#071A4A]">Recent Activity</h3>
              <p className="text-[11px] text-[#64748B] font-jakarta">Tap any item to inspect on-chain cryptographic receipt</p>
            </div>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#155EEF] ml-1" />}
          </div>
          <Link href="/dao/transactions" className="text-xs font-bold font-jakarta text-[#155EEF] hover:underline flex items-center gap-1">
            <span>View All</span><ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {loading && items.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-2xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="w-24 h-3 bg-slate-200 rounded" />
                    <div className="w-36 h-2.5 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="w-16 h-3 bg-slate-200 rounded" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#94A3B8] font-jakarta bg-[#F8FAFC] rounded-2xl border border-dashed border-[#E2ECF9]">
              No recent on-chain activity recorded for this address yet.
            </div>
          ) : (
            items.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                role="button"
                tabIndex={0}
                className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between hover:border-[#0E62E4] hover:bg-white hover:shadow-xs transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {getIcon(tx.type)}
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-jakarta text-[#071A4A] group-hover:text-[#0E62E4] transition-colors">
                        {tx.typeLabel}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#059669] text-[9px] font-bold uppercase font-mono flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-[#059669]" />
                        ON-CHAIN
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B] font-jakarta truncate flex items-center gap-1.5">
                      <span>{formatEntity(tx.from, activeAddress)}</span>
                      <span className="text-[#94A3B8]">→</span>
                      <span>{formatEntity(tx.to, activeAddress)}</span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8] font-jakarta">{timeAgoLabel(tx.timestamp)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    {tx.amountUsd > 0 ? (
                      <>
                        <div className={`text-sm font-black font-jakarta ${tx.isPositive === false ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                          {tx.isPositive === false ? '-' : '+'} ${tx.amountUsd.toFixed(2)} USD
                        </div>
                        <div className="text-[11px] text-[#64748B] font-jakarta">
                          ≈ {tx.isPositive === false ? '-' : '+'}{tx.amountBtt.toFixed(2)} TROB
                        </div>
                      </>
                    ) : (
                      <div className="text-xs font-bold font-jakarta text-[#155EEF]">Confirmed</div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0E62E4] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] text-[#64748B] font-jakarta border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Real-time block stream sync</span>
          </div>
          <div className="font-mono text-[#64748B]">Trobium Consensus · Live Node</div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#155EEF]" />
            <div>
              <h3 className="text-sm font-bold font-jakarta text-[#071A4A]">Recent Activity</h3>
              <p className="text-[10px] text-[#64748B]">Tap row to inspect details</p>
            </div>
          </div>
          <Link href="/dao/transactions" className="text-xs font-bold font-jakarta text-[#155EEF] hover:underline flex items-center gap-0.5">
            <span>View All</span><span>&gt;</span>
          </Link>
        </div>

        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#94A3B8] font-jakarta bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2ECF9]">
              No recent activity recorded yet.
            </div>
          ) : (
            items.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                role="button"
                tabIndex={0}
                className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-xl p-3 flex items-center justify-between hover:border-[#0E62E4] hover:bg-white transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getIcon(tx.type, 'xs')}
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-xs font-bold font-jakarta text-[#071A4A] truncate">{tx.typeLabel}</div>
                    <div className="text-[10px] text-[#64748B] font-jakarta truncate flex items-center gap-1">
                      <span>{formatEntity(tx.from, activeAddress)}</span>
                      <span>→</span>
                      <span>{formatEntity(tx.to, activeAddress)}</span>
                    </div>
                    <div className="text-[9.5px] text-[#94A3B8] font-jakarta">{timeAgoLabel(tx.timestamp)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="text-right">
                    {tx.amountUsd > 0 ? (
                      <>
                        <div className={`text-xs font-black font-jakarta ${tx.isPositive === false ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                          {tx.isPositive === false ? '-' : '+'}${tx.amountUsd.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-[#64748B] font-jakarta">
                          {tx.amountBtt.toFixed(2)} TROB
                        </div>
                      </>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] text-[10px] font-bold">Confirmed</span>
                    )}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#64748B] font-jakarta border-t border-slate-100">
          <Cpu className="w-3 h-3 text-[#10B981]" />
          <span>Genesis Subgraph · Cryptographic Truth</span>
        </div>
      </div>

      {/* On-Chain Transaction Detail Modal (Opens upon tapping any activity item) */}
      <TransactionDetailModal
        tx={selectedTx}
        onClose={() => setSelectedTx(null)}
        activeAddress={activeAddress}
      />
    </>
  );
};
