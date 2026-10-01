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

  // Pull last 5 real transactions for the activity log
  const { data: txData, loading } = useTransactions(activeAddress, 1, 5);
  const recentTxs = txData?.transactions ?? [];

  // Format a date to a human-friendly string
  const fmtDate = (ts: string) =>
    new Date(ts).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const fmtShort = (ts: string) =>
    new Date(ts).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  // Map tx type to an icon
  const getIcon = (type: string, size: 'sm' | 'md') => {
    const cls = size === 'md' ? 'w-5 h-5 text-[#155EEF]' : 'w-4 h-4 text-[#155EEF]';
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
        shortTime: fmtShort(tx.timestamp),
        badgeText: tx.status,
        badgeType: tx.isPositive ? 'success' : 'info',
        iconMd: getIcon(tx.type, 'md'),
        iconSm: getIcon(tx.type, 'sm'),
      }))
    : auth.isAuthenticated
    ? [
        {
          id: 'session-live',
          title: 'Active Wallet Session',
          subtitle: `Connected as ${activeAddress ? `${activeAddress.slice(0, 8)}…${activeAddress.slice(-6)}` : 'SIWE Authenticated'}`,
          time: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          shortTime: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          badgeText: 'Active',
          badgeType: 'success',
          iconMd: <Shield className="w-5 h-5 text-[#155EEF]" />,
          iconSm: <Shield className="w-4 h-4 text-[#155EEF]" />,
        },
      ]
    : [];

  const BadgeDesktop = ({ type, text }: { type: string; text: string }) =>
    type === 'success' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669] text-xs font-semibold">
        {text}
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] text-xs font-semibold">
        {text}
      </span>
    );

  const BadgeMobile = ({ type, text }: { type: string; text: string }) =>
    type === 'success' ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669] text-[10px] font-semibold">
        {text}
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] text-[10px] font-semibold">
        {text}
      </span>
    );

  return (
    <>
      {/* ================= DESKTOP VIEW (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#071A4A]">
              Security Activity
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Recent protocol activity on your account.
            </p>
          </div>
          {activeAddress && (
            <Link
              href="/dao/transactions"
              className="text-xs font-bold text-[#155EEF] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Event List */}
        <div className="space-y-3 pt-1">
          {loading ? (
            // Skeleton rows
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E2ECF9]" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 bg-[#E2ECF9] rounded" />
                    <div className="h-2.5 w-20 bg-[#F1F5F9] rounded" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-[#E2ECF9] rounded-lg" />
              </div>
            ))
          ) : displayEvents.length === 0 ? (
            <div className="text-center py-6 text-sm text-[#64748B]">No activity yet.</div>
          ) : (
            displayEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]"
              >
                {/* Left Info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                    {evt.iconMd}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
                      {evt.title}
                    </h4>
                    <div className="text-xs font-mono text-[#64748B] mt-0.5">
                      {evt.subtitle}
                    </div>
                  </div>
                </div>

                {/* Right Timestamp & Badge */}
                <div className="flex items-center gap-3">
                  {evt.time && (
                    <span className="text-xs text-[#64748B]">{evt.time}</span>
                  )}
                  <BadgeDesktop type={evt.badgeType} text={evt.badgeText} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-xs font-jakarta space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#071A4A]">
              Security Activity
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Recent protocol activity on your account.
            </p>
          </div>
          {activeAddress && (
            <Link
              href="/dao/transactions"
              className="text-xs font-bold text-[#155EEF] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Event List */}
        <div className="space-y-3 pt-1">
          {loading ? (
            [1, 2].map((i) => (
              <div key={i} className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3.5 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E2ECF9]" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-24 bg-[#E2ECF9] rounded" />
                    <div className="h-2 w-16 bg-[#F1F5F9] rounded" />
                  </div>
                </div>
                <div className="h-4 w-12 bg-[#E2ECF9] rounded-md" />
              </div>
            ))
          ) : displayEvents.length === 0 ? (
            <div className="text-center py-4 text-xs text-[#64748B]">No activity yet.</div>
          ) : (
            displayEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3.5 flex items-center justify-between"
              >
                {/* Left Info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                    {evt.iconSm}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#071A4A]">
                      {evt.title}
                    </h4>
                    <div className="text-[11px] font-mono text-[#64748B] mt-0.5">
                      {evt.subtitle}
                    </div>
                  </div>
                </div>

                {/* Right stacked */}
                <div className="flex flex-col items-end gap-1">
                  {evt.shortTime && (
                    <span className="text-[10px] text-[#64748B]">{evt.shortTime}</span>
                  )}
                  <BadgeMobile type={evt.badgeType} text={evt.badgeText} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
