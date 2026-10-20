'use client';

import React from 'react';
import { Wallet, Monitor, Shield, Activity, ArrowRight } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useApi';
import Link from 'next/link';

export default function SecurityActivityCard() {
  const wallet = useWallet();
  const auth   = useAuthContext();
  const activeAddress = wallet.base58Address ?? wallet.hexAddress ?? null;
  const isSessionActive = Boolean(wallet.isConnected || auth.isAuthenticated || activeAddress);

  const shortAddress = activeAddress && activeAddress.length > 14
    ? `${activeAddress.slice(0, 8)}…${activeAddress.slice(-6)}`
    : activeAddress ?? '—';

  // Pull last 4 real transactions for the activity log
  const { data: txData, loading } = useTransactions(activeAddress, 1, 4);
  const recentTxs = txData?.transactions ?? [];

  // Format a date to a human-friendly string
  const fmtDate = (ts: string) =>
    new Date(ts).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  // Map tx type to an icon
  const getIcon = (type: string) => {
    const cls = 'w-4 h-4 text-[#155EEF]';
    if (type.startsWith('matrix')) return <Activity className={cls} />;
    if (type === 'withdrawal') return <Wallet className={cls} />;
    if (type === 'joined') return <Shield className={cls} />;
    return <Monitor className={cls} />;
  };

  // Build display events: real txs when available, live authenticated session if active, otherwise empty
  const displayEvents = loading
    ? []
    : recentTxs.length > 0
    ? recentTxs.map((tx) => ({
        id: tx.id,
        title: tx.typeLabel,
        subtitle: `${Number((tx as any).amountTrob ?? tx.amountBtt).toFixed(2)} TROB`,
        time: fmtDate(tx.timestamp),
        badgeText: tx.status,
        badgeType: tx.isPositive ? 'success' : 'info',
        icon: getIcon(tx.type),
      }))
    : isSessionActive
    ? [
        {
          id: 'session-live',
          title: 'Active Wallet Session',
          subtitle: `Connected: ${shortAddress}`,
          time: 'Active now',
          badgeText: 'Active',
          badgeType: 'success',
          icon: <Shield className="w-4 h-4 text-[#155EEF]" />,
        },
      ]
    : [];

  return (
    <div className="rounded-3xl bg-white border border-[#E2ECF9] p-5 sm:p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta flex flex-col justify-between space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#071A4A]">
            Security Activity
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Recent protocol activity on your account.
          </p>
        </div>
        {activeAddress && (
          <Link
            href="/dao/transactions"
            className="text-xs font-bold text-[#155EEF] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Event List */}
      <div className="space-y-2.5 pt-1 flex-1">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E2ECF9]" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 bg-[#E2ECF9] rounded" />
                  <div className="h-2.5 w-20 bg-[#F1F5F9] rounded" />
                </div>
              </div>
              <div className="h-5 w-16 bg-[#E2ECF9] rounded-lg" />
            </div>
          ))
        ) : displayEvents.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
            No recent protocol activity.
          </div>
        ) : (
          displayEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2.5 transition-colors hover:border-[#E2ECF9]"
            >
              {/* Left Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  {evt.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#071A4A] truncate">
                    {evt.title}
                  </h4>
                  <div className="text-[11px] sm:text-xs font-mono text-[#64748B] mt-0.5 truncate">
                    {evt.subtitle}
                  </div>
                </div>
              </div>

              {/* Right Timestamp & Badge */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {evt.time && (
                  <span className="text-[11px] sm:text-xs text-[#64748B] whitespace-nowrap">
                    {evt.time}
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold shrink-0 ${
                    evt.badgeType === 'success'
                      ? 'bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669]'
                      : 'bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF]'
                  }`}
                >
                  {evt.badgeText}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
