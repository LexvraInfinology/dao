'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, AlertTriangle, ArrowRight, Download, Wallet, CheckCircle2, ExternalLink } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useDaoMember, useTrobPrice } from '@/hooks/useApi';
import { WalletModal } from '@/components/ui/WalletModal';

// ─── Contract addresses from env ─────────────────────────────────────────────
const DAO_CONTRACT_ADDRESS  = process.env.NEXT_PUBLIC_DAO_ADDRESS ?? '';
const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

type GateState =
  | 'detecting_wallet'   // waiting for extension probe
  | 'not_installed'      // TrobSafe not found
  | 'wallet_required'    // installed but not connected
  | 'checking_member'    // API call in flight
  | 'payment_required'   // connected but not a member
  | 'paying'             // tx in flight
  | 'pay_success'        // tx confirmed
  | 'pay_error'          // tx failed
  | 'access_granted';    // member — render children

// ─────────────────────────────────────────────────────────────────────────────

interface DaoAccessGateProps {
  children: React.ReactNode;
}

export function DaoAccessGate({ children }: DaoAccessGateProps) {
  const wallet = useWallet();
  const auth   = useAuthContext();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [payError, setPayError]               = useState<string | null>(null);
  const [payTxHash, setPayTxHash]             = useState<string | null>(null);

  // Fetch membership status only when we have an address
  const { data: memberData, loading: memberLoading, refetch: refetchMember } =
    useDaoMember(wallet.hexAddress);

  // Fetch live TROB price for the $300 calculation
  const { data: priceData } = useTrobPrice(30_000);

  // ── Derive gate state ──────────────────────────────────────────────────────
  const gateState: GateState = (() => {
    if (wallet.status === 'detecting')      return 'detecting_wallet';
    if (wallet.status === 'not_installed')  return 'not_installed';
    if (!wallet.isConnected)                return 'wallet_required';
    if (memberLoading && !memberData)       return 'checking_member';
    if (memberData?.isMember)               return 'access_granted';
    return 'payment_required';
  })();

  // If payment succeeded re-check membership
  useEffect(() => {
    if (payTxHash) refetchMember();
  }, [payTxHash, refetchMember]);

  // ── seat mint handler ──────────────────────────────────────────────────────
  const handleClaimSeat = async () => {
    if (!wallet.isConnected || !priceData) return;
    setPayError(null);

    // seatEntryTrob is already in TROB (e.g. 300 TROB at $1)
    // Convert to SUN: 1 TROB = 1_000_000 SUN on Trobium
    const seatEntryTrob = priceData.seatEntryTrob;
    const callValueSun  = Math.ceil(seatEntryTrob * 1_000_000);

    // Build the contract payload — joinDAO() function selector
    const payload = {
      contract_address:   DAO_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
      function_selector: 'joinDAO()',
      parameter:         '',
      call_value:        callValueSun,
      fee_limit:         100_000_000, // 100 TROB max fee
      owner_address:     wallet.base58Address ?? wallet.hexAddress ?? '',
    };

    try {
      // Update state to show spinner
      setPayTxHash('pending');
      const result = await wallet.callContract(payload);
      if (!result.result) throw new Error('Transaction rejected by contract.');
      setPayTxHash(result.txid);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed. Please try again.';
      setPayError(msg);
      setPayTxHash(null);
    }
  };

  // ── Access granted — render children ──────────────────────────────────────
  if (gateState === 'access_granted') return <>{children}</>;

  // ── Gate screens ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-[#F6F9FF] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">

          {/* ── Detecting wallet ──────────────────────────────────────────── */}
          {gateState === 'detecting_wallet' && (
            <GateCard icon={<Loader2 className="w-8 h-8 text-[#155EEF] animate-spin" />} title="Detecting TrobSafe…">
              <p className="text-sm text-[#64748B] text-center">Looking for your wallet extension.</p>
            </GateCard>
          )}

          {/* ── Not installed ─────────────────────────────────────────────── */}
          {gateState === 'not_installed' && (
            <GateCard icon={<Download className="w-8 h-8 text-[#155EEF]" />} title="TrobSafe Required">
              <p className="text-sm text-[#64748B] text-center leading-relaxed mb-6">
                The EQUORA Genesis DAO requires the TrobSafe wallet browser extension.
                Install it to continue.
              </p>
              <a
                href="/trobsafe/install"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(21,94,239,0.3)] transition-all"
              >
                <Download className="w-4 h-4" />
                Install TrobSafe Wallet
              </a>
              <a
                href="https://trobsafe.io"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 w-full py-2.5 rounded-xl text-xs text-[#64748B] hover:text-[#071A4A] border border-[#E2ECF9] flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Learn about TrobSafe
              </a>
            </GateCard>
          )}

          {/* ── Wallet required ───────────────────────────────────────────── */}
          {gateState === 'wallet_required' && (
            <GateCard icon={<Wallet className="w-8 h-8 text-[#155EEF]" />} title="Connect Your Wallet">
              <p className="text-sm text-[#64748B] text-center leading-relaxed mb-6">
                Connect your TrobSafe wallet to access the EQUORA Genesis DAO dashboard.
              </p>
              <button
                onClick={() => setWalletModalOpen(true)}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(21,94,239,0.3)] transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Connect TrobSafe Wallet
              </button>
            </GateCard>
          )}

          {/* ── Checking membership ───────────────────────────────────────── */}
          {gateState === 'checking_member' && (
            <GateCard icon={<Loader2 className="w-8 h-8 text-[#155EEF] animate-spin" />} title="Verifying Membership">
              <p className="text-sm text-[#64748B] text-center">Checking Genesis Council seat status…</p>
            </GateCard>
          )}

          {/* ── Payment required ─────────────────────────────────────────── */}
          {gateState === 'payment_required' && !payTxHash && (
            <GateCard
              icon={<ShieldCheck className="w-8 h-8 text-[#155EEF]" />}
              title="Claim Your Council Seat"
            >
              <p className="text-sm text-[#64748B] text-center leading-relaxed mb-5">
                Access to the Genesis DAO dashboard requires holding a Council Seat.
                Claim yours with a one-time payment of <strong className="text-[#071A4A]">$300 worth of TROB</strong>.
              </p>

              {/* Price card */}
              <div className="mb-5 p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#344054]">Entry Amount</span>
                  <span className="text-xs text-[#64748B]">
                    {priceData
                      ? `@ $${priceData.priceUsd.toFixed(4)}/TROB`
                      : 'Loading price…'
                    }
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#071A4A] font-sora">
                    {priceData ? priceData.seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
                  </span>
                  <span className="text-sm font-semibold text-[#155EEF]">TROB</span>
                </div>
                <div className="text-xs text-[#64748B] mt-1">≈ $300.00 USD · Fixed Seat Entry</div>
                {priceData?.isStale && (
                  <div className="mt-2 text-[10px] text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Price may be slightly stale
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div className="mb-5 space-y-2">
                {[
                  '1 of 100 sovereign Genesis Council seats',
                  '25% APY dividend yield from protocol revenue',
                  'Direct governance voting power (1.0% per seat)',
                  'Lifetime dividend rights in DAO treasury',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2.5 text-xs text-[#344054]">
                    <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>

              {payError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{payError}</p>
                </div>
              )}

              <button
                onClick={handleClaimSeat}
                disabled={!priceData || !DAO_CONTRACT_ADDRESS}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(21,94,239,0.3)] transition-all"
              >
                <span>
                  Claim Seat for {priceData
                    ? `${priceData.seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB`
                    : '…'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="mt-3 text-center text-[11px] text-[#94A3B8]">
                Transaction broadcast via TrobSafe · Gas fees may apply
              </p>
            </GateCard>
          )}

          {/* ── Paying (tx in flight) ─────────────────────────────────────── */}
          {gateState === 'payment_required' && payTxHash === 'pending' && (
            <GateCard icon={<Loader2 className="w-8 h-8 text-[#155EEF] animate-spin" />} title="Broadcasting Transaction">
              <p className="text-sm text-[#64748B] text-center leading-relaxed">
                Your seat claim is being submitted to the Trobium network.
                Please wait…
              </p>
            </GateCard>
          )}

          {/* ── Pay success ───────────────────────────────────────────────── */}
          {gateState === 'payment_required' && payTxHash && payTxHash !== 'pending' && (
            <GateCard icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />} title="Seat Claimed!">
              <p className="text-sm text-[#64748B] text-center leading-relaxed mb-4">
                Your Genesis Council seat has been claimed. Loading your dashboard…
              </p>
              <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-center">
                <p className="text-[10px] text-[#047857] font-mono break-all">
                  TX: {payTxHash.slice(0, 18)}…{payTxHash.slice(-8)}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#64748B]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Verifying on-chain…
              </div>
            </GateCard>
          )}
        </div>
      </div>

      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
}

// ─── Shared card shell ────────────────────────────────────────────────────────

function GateCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border border-[#E2ECF9] shadow-[0_20px_50px_rgba(15,23,42,0.07)] p-8">
      {/* Top icon + title */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-[#071A4A] font-inter text-center">{title}</h2>
      </div>
      {children}
    </div>
  );
}
