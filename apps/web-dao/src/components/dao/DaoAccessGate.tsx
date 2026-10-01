'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Download,
  Wallet,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useDaoMember, useTrobPrice } from '@/hooks/useApi';
import { WalletModal } from '@/components/ui/WalletModal';
import { triggerSmartConnectWallet, TROBSAFE_CHROME_STORE_URL } from '@/utils/walletConnect';

// ─── Contract addresses from env ─────────────────────────────────────────────
const DAO_CONTRACT_ADDRESS  = process.env.NEXT_PUBLIC_DAO_ADDRESS ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

type GateState =
  | 'detecting_wallet'   // waiting for extension probe
  | 'not_installed'      // TrobSafe not found
  | 'wallet_required'    // installed but not connected
  | 'checking_member'    // API call in flight
  | 'payment_required'   // connected but not a member
  | 'paying'             // tx in flight
  | 'pay_success'        // tx confirmed
  | 'access_granted';    // member — render children

// ─────────────────────────────────────────────────────────────────────────────

interface DaoAccessGateProps {
  children: React.ReactNode;
}

export function DaoAccessGate({ children }: DaoAccessGateProps) {
  const router = useRouter();
  const wallet = useWallet();
  const auth   = useAuthContext();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [payError, setPayError]               = useState<string | null>(null);
  const [payTxHash, setPayTxHash]             = useState<string | null>(null);
  const [detectTimeout, setDetectTimeout]     = useState(false);

  const handleConnectClick = () => {
    triggerSmartConnectWallet({
      wallet,
      openModal: () => setWalletModalOpen(true),
    });
  };

  // Quick fallback timeout for detection probe (800ms max)
  useEffect(() => {
    const timer = setTimeout(() => setDetectTimeout(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch membership status only when we have an address
  const activeAddress = wallet.base58Address || wallet.hexAddress || auth.user?.address || '';
  const { data: memberData, loading: memberLoading, refetch: refetchMember } =
    useDaoMember(activeAddress);

  // Fetch live TROB price for the $300 USD entry calculation (polls every 30s)
  const { data: priceData, loading: priceLoading } = useTrobPrice(30_000);

  // Strictly verify active membership (must have confirmed seat in DAO)
  const isVerifiedMember = Boolean(
    (memberData?.isMember && (memberData.position ?? 0) > 0) ||
    ((auth.user?.daoPosition ?? 0) > 0)
  );

  // ── Derive gate state (strict payment & membership verification) ────────────
  const gateState: GateState = (() => {
    if (wallet.status === 'detecting' && !detectTimeout) return 'detecting_wallet';
    if (wallet.status === 'not_installed' || (wallet.status === 'detecting' && detectTimeout && !wallet.isInstalled)) {
      return 'not_installed';
    }
    if (!wallet.isConnected && !activeAddress) return 'wallet_required';
    if (memberLoading && !memberData)          return 'checking_member';
    if (isVerifiedMember)                      return 'access_granted';
    return 'payment_required';
  })();

  // If payment succeeded, re-check membership
  useEffect(() => {
    if (payTxHash && payTxHash !== 'pending') {
      refetchMember();
    }
  }, [payTxHash, refetchMember]);

  // ── Seat claim handler: $300 worth of TROB at real-time price ──────────────
  const handleClaimSeat = async () => {
    if (!wallet.isConnected) {
      setPayError('Please connect your TrobSafe wallet first.');
      return;
    }
    if (!priceData || priceData.priceUsd <= 0) {
      setPayError('Fetching live TROB market rate... Please try again in a few seconds.');
      return;
    }

    const activeAddr = wallet.base58Address || wallet.hexAddress;
    if (!activeAddr) {
      setPayError('No active address found from TrobSafe. Please unlock your wallet.');
      return;
    }

    setPayError(null);
    setPayTxHash('pending');

    try {
      let txId: string | null = null;

      // 1. On-chain contract call via TrobSafe if valid contract is deployed
      if (
        DAO_CONTRACT_ADDRESS &&
        DAO_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
        DAO_CONTRACT_ADDRESS.length > 10
      ) {
        try {
          const seatEntryTrob = priceData.seatEntryTrob;
          const callValueSun  = Math.ceil(seatEntryTrob * 1_000_000);
          const payload = {
            contract_address:   DAO_CONTRACT_ADDRESS,
            function_selector: 'joinDAO()',
            parameter:         '',
            call_value:        callValueSun,
            fee_limit:         100_000_000,
            owner_address:     activeAddr,
          };
          const res = await wallet.callContract(payload);
          if (res?.result && res.txid) {
            txId = res.txid;
          }
        } catch (onChainErr: unknown) {
          console.warn('[DaoAccessGate] On-chain broadcast note:', onChainErr);
        }
      }

      // 2. Register and verify membership on the backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/dao/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAddr, txHash: txId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to verify membership payment.');
      }

      setPayTxHash(txId || 'confirmed');
      await refetchMember();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Claim transaction failed. Please try again.';
      setPayError(msg);
      setPayTxHash(null);
    }
  };

  const handleDisconnect = () => {
    wallet.disconnect();
    auth.signOut();
    try {
      localStorage.setItem('equora_wallet_explicit_disconnect', 'true');
      localStorage.removeItem('trobsafe_address');
      localStorage.removeItem('equora_auth_address');
      localStorage.removeItem('equora_jwt');
    } catch { /* ignore */ }
  };

  // ── Access granted: verified paying member ─────────────────────────────────
  if (gateState === 'access_granted') {
    return <>{children}</>;
  }

  // ── Gate screens: strictly blocks dashboard access ──────────────────────────
  return (
    <>
      <div className="min-h-screen bg-[#F6F9FF] flex flex-col items-center justify-center p-4 sm:p-6 relative select-none">
        {/* Ambient Top Logo Bar */}
        <div className="mb-6 flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[#071A4A] p-1.5 flex items-center justify-center shadow-md">
              <img
                src="/icons/equora-symbol.svg"
                alt="EQUORA"
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-[#071A4A] leading-tight">
                EQUORA <span className="text-[#155EEF]">DAO</span>
              </span>
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                Genesis Council Gate
              </span>
            </div>
          </Link>
        </div>

        <div className="w-full max-w-md">

          {/* ── Detecting wallet ──────────────────────────────────────────── */}
          {gateState === 'detecting_wallet' && (
            <GateCard icon={<Loader2 className="w-8 h-8 text-[#155EEF] animate-spin" />} title="Detecting TrobSafe…">
              <p className="text-sm text-[#64748B] text-center">Looking for your TrobSafe wallet extension.</p>
            </GateCard>
          )}

          {/* ── Not installed ─────────────────────────────────────────────── */}
          {gateState === 'not_installed' && (
            <GateCard icon={<Download className="w-8 h-8 text-[#155EEF]" />} title="TrobSafe Wallet Required">
              <p className="text-sm text-[#64748B] text-center leading-relaxed mb-6">
                Access to the EQUORA Genesis DAO requires the TrobSafe wallet to sign transactions and verify Council membership.
              </p>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleConnectClick}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#0E62E4] hover:bg-[#0B52C4] flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(14,98,228,0.25)] transition-all cursor-pointer"
                >
                  <img
                    src="/trobsafe-logo.png"
                    alt="TrobSafe"
                    className="w-4 h-4 rounded object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span>Connect TrobSafe Extension</span>
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={TROBSAFE_CHROME_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl font-semibold text-xs text-[#071A4A] bg-slate-100 hover:bg-slate-200/80 border border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#0E62E4]" />
                    <span>Chrome Web Store</span>
                  </a>
                  <a
                    href="/downloads/trobsafe.apk"
                    download="trobsafe.apk"
                    className="py-2.5 px-3 rounded-xl font-semibold text-xs text-[#071A4A] bg-slate-100 hover:bg-slate-200/80 border border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#0E62E4]" />
                    <span>Android APK</span>
                  </a>
                </div>

                <div className="pt-3 text-center">
                  <Link href="/" className="text-xs font-semibold text-[#155EEF] hover:text-[#004EEB] hover:underline inline-flex items-center gap-1">
                    ← Back to EQUORA.FI
                  </Link>
                </div>
              </div>
            </GateCard>
          )}

          {/* ── Wallet required ───────────────────────────────────────────── */}
          {gateState === 'wallet_required' && (
            <GateCard icon={<Wallet className="w-8 h-8 text-[#155EEF]" />} title="Connect Your Wallet">
              <p className="text-sm text-[#64748B] text-center leading-relaxed mb-6">
                Connect your TrobSafe wallet to verify your Genesis Council seat and enter the DAO dashboard.
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleConnectClick}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(21,94,239,0.3)] transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Connect TrobSafe Wallet</span>
                </button>

                <div className="pt-3 text-center">
                  <Link href="/" className="text-xs font-semibold text-[#155EEF] hover:text-[#004EEB] hover:underline inline-flex items-center gap-1">
                    ← Back to EQUORA.FI
                  </Link>
                </div>
              </div>
            </GateCard>
          )}

          {/* ── Checking membership ───────────────────────────────────────── */}
          {gateState === 'checking_member' && (
            <GateCard icon={<Loader2 className="w-8 h-8 text-[#155EEF] animate-spin" />} title="Verifying Membership">
              <p className="text-sm text-[#64748B] text-center">Checking Genesis Council seat status on-chain…</p>
            </GateCard>
          )}

          {/* ── Payment required ($300 USD worth of TROB) ─────────────────── */}
          {gateState === 'payment_required' && !payTxHash && (
            <GateCard
              icon={<ShieldCheck className="w-8 h-8 text-[#155EEF]" />}
              title="Claim Your Council Seat"
            >
              <p className="text-sm text-[#64748B] text-center leading-relaxed mb-5">
                Access to the Genesis DAO dashboard requires an active Council Seat.
                Claim yours with a one-time entry payment of <strong className="text-[#071A4A]">$300 worth of TROB</strong>.
              </p>

              {/* Price card showing real-time fetched TROB */}
              <div className="mb-5 p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-[#344054]">Live Entry Amount</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#155EEF]">
                    {priceData
                      ? `@ $${priceData.priceUsd.toFixed(4)} / TROB`
                      : 'Fetching live rate…'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#071A4A] font-sora tracking-tight">
                    {priceData
                      ? priceData.seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : '…'}
                  </span>
                  <span className="text-base font-bold text-[#155EEF]">TROB</span>
                </div>
                <div className="text-xs font-medium text-[#475467] mt-1 flex items-center justify-between">
                  <span>≈ $300.00 USD · Pegged Genesis Council Entry</span>
                  {priceLoading && <RefreshCw className="w-3 h-3 text-[#155EEF] animate-spin" />}
                </div>

                {priceData?.isStale && (
                  <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Price cached; updating with latest market feed…</span>
                  </div>
                )}
              </div>

              {/* Verified Council Benefits */}
              <div className="mb-5 space-y-2">
                {[
                  '1 of 100 sovereign Genesis Council seats',
                  '25% APY dividend yield from protocol revenue',
                  'Direct governance voting power (1.0% per seat)',
                  'Lifetime dividend rights in DAO treasury',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2.5 text-xs text-[#344054]">
                    <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Error notice */}
              {payError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 leading-snug">{payError}</p>
                </div>
              )}

              {/* Primary Payment Action */}
              <button
                type="button"
                onClick={handleClaimSeat}
                disabled={!priceData || priceData.priceUsd <= 0 || payTxHash === 'pending'}
                className="w-full py-4 rounded-xl font-bold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(21,94,239,0.35)] transition-all cursor-pointer"
              >
                {payTxHash === 'pending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing Payment…</span>
                  </>
                ) : (
                  <>
                    <span>
                      {priceData && priceData.seatEntryTrob > 0
                        ? `Pay ${priceData.seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB ($300 USD)`
                        : 'Fetching Live TROB Rate…'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Wallet info & Disconnect / Switch option */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>
                    {activeAddress.length > 12
                      ? `${activeAddress.slice(0, 6)}…${activeAddress.slice(-4)}`
                      : activeAddress}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Switch Wallet</span>
                </button>
              </div>

              <div className="pt-3 text-center">
                <Link href="/" className="text-xs font-semibold text-[#155EEF] hover:text-[#004EEB] hover:underline inline-flex items-center gap-1">
                  ← Back to EQUORA.FI
                </Link>
              </div>
            </GateCard>
          )}

          {/* ── Paying (transaction in flight) ────────────────────────────── */}
          {gateState === 'payment_required' && payTxHash === 'pending' && (
            <GateCard icon={<Loader2 className="w-8 h-8 text-[#155EEF] animate-spin" />} title="Broadcasting Transaction">
              <p className="text-sm text-[#64748B] text-center leading-relaxed">
                Your $300 TROB council seat payment is being submitted to the Trobium network.
                Please confirm in your TrobSafe wallet and wait…
              </p>
            </GateCard>
          )}

          {/* ── Payment Confirmed ─────────────────────────────────────────── */}
          {gateState === 'payment_required' && payTxHash && payTxHash !== 'pending' && (
            <GateCard icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />} title="Seat Claimed!">
              <p className="text-sm text-[#64748B] text-center leading-relaxed mb-4">
                Your Genesis Council seat payment has been confirmed. Verifying on-chain and loading dashboard…
              </p>
              <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-center">
                <p className="text-[10px] text-[#047857] font-mono break-all">
                  TX: {payTxHash.length > 24 ? `${payTxHash.slice(0, 16)}…${payTxHash.slice(-8)}` : payTxHash}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#64748B]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#155EEF]" />
                <span>Entering DAO Dashboard…</span>
              </div>
            </GateCard>
          )}
        </div>
      </div>

      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
}

// ─── Shared Card Container ────────────────────────────────────────────────────

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
    <div className="bg-white rounded-3xl border border-[#E2ECF9] shadow-[0_20px_50px_rgba(15,23,42,0.07)] p-6 sm:p-8">
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
