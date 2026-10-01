'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  Zap,
  Radio,
  Vote,
  Sparkles,
  Info,
  Check,
  AlertCircle,
  HelpCircle,
  Calendar,
  Crown,
  Copy,
  Lock,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useDaoMember, useTrobPrice } from '@/hooks/useApi';
import { WalletModal } from '@/components/ui/WalletModal';
import { TermsModal } from '@/components/dao/TermsModal';
import { triggerSmartConnectWallet, TROBSAFE_CHROME_STORE_URL } from '@/utils/walletConnect';

// ─── Constants & Addresses ───────────────────────────────────────────────────
const DAO_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DAO_ADDRESS ?? '';
const OFFICIAL_WHATSAPP_URL = 'https://chat.whatsapp.com/GR19373Pgq7LezBKtXC0ng';
export const OFFICIAL_EQUORA_SR = 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY';

// ─── Eligibility Types (matches PDF) ──────────────────────────────────────────

interface EligibilityData {
  address: string;
  canonicalAddress: string;
  condition1: {
    passed: boolean;
    creationTimestamp: number | null;
    creationDate: string | null;
    minRequiredDate: string;
    reason?: string;
  };
  condition2: {
    passed: boolean;
    energy: {
      stakedTrob: number;
      requiredTrob: number;
      passed: boolean;
    };
    bandwidth: {
      stakedTrob: number;
      requiredTrob: number;
      passed: boolean;
    };
    srVote: {
      voted: boolean;
      officialSrAddress: string;
      passed: boolean;
    };
    missingRequirements: string[];
  };
  whatsapp: {
    joined: boolean;
    verifiedAt: string | null;
  };
  eligibleToDeposit: boolean;
  status: string;
  formula?: any;
}

// ─────────────────────────────────────────────────────────────────────────────

interface DaoAccessGateProps {
  children: React.ReactNode;
}

export function DaoAccessGate({ children }: DaoAccessGateProps) {
  const wallet = useWallet();
  const auth   = useAuthContext();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen]   = useState(false);
  const [termsAccepted, setTermsAccepted]     = useState(false);

  const [eligibility, setEligibility]         = useState<EligibilityData | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError]     = useState<string | null>(null);

  // WhatsApp cross-check state (Telegram bot style)
  const [waJoining, setWaJoining]             = useState(false);
  const [waVerifying, setWaVerifying]         = useState(false);
  const [waError, setWaError]                 = useState<string | null>(null);

  // Resource staking & SR voting helper state
  const [isStakingHelper, setIsStakingHelper] = useState(false);

  // Payment states
  const [payError, setPayError]               = useState<string | null>(null);
  const [payTxHash, setPayTxHash]             = useState<string | null>(null);
  const [detectTimeout, setDetectTimeout]     = useState(false);

  // Wallet address resolution
  const activeAddress = wallet.base58Address || wallet.hexAddress || auth.user?.address || '';
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    if (!activeAddress) return;
    try {
      navigator.clipboard.writeText(activeAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch { /* ignore */ }
  };

  // Quick fallback timeout for detection probe (800ms max)
  useEffect(() => {
    const timer = setTimeout(() => setDetectTimeout(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch DAO membership details (position > 0)
  const { data: memberData, loading: memberLoading, refetch: refetchMember } =
    useDaoMember(activeAddress);

  // Fetch live TROB price for the $300 USD calculation (polls every 30s)
  const { data: priceData, loading: priceLoading } = useTrobPrice(30_000);

  // Strict verified membership: MUST have connected wallet AND verified active seat (position > 0)
  const isVerifiedMember = Boolean(
    wallet.isConnected &&
    activeAddress &&
    memberData?.isMember &&
    (memberData.position ?? 0) > 0
  );

  // If user is disconnected, redirect to landing page
  useEffect(() => {
    if (detectTimeout && !wallet.isConnected && !wallet.isConnecting) {
      window.location.href = '/';
    }
  }, [detectTimeout, wallet.isConnected, wallet.isConnecting]);

  // ── Fetch protocol eligibility conditions from API ──────────────────────────
  const fetchEligibility = useCallback(async () => {
    if (!activeAddress) return;
    setEligibilityLoading(true);
    try {
      const res = await fetch(`/api/dao/eligibility/${encodeURIComponent(activeAddress)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setEligibility(json.data);
      } else {
        setEligibilityError(json.error || 'Failed to check protocol eligibility');
      }
    } catch (err: unknown) {
      setEligibilityError((err as Error).message);
    } finally {
      setEligibilityLoading(false);
    }
  }, [activeAddress]);

  useEffect(() => {
    if (activeAddress && wallet.isConnected) {
      fetchEligibility();
    }
  }, [activeAddress, wallet.isConnected, fetchEligibility]);

  // ── WhatsApp Cross-Check Verification (Telegram-Style Bot Check) ───────────
  const handleJoinWhatsApp = () => {
    setWaJoining(true);
    window.open(OFFICIAL_WHATSAPP_URL, '_blank', 'noopener,noreferrer');
  };

  const handleVerifyWhatsApp = async () => {
    if (!activeAddress) {
      setWaError('Please connect your TrobSafe wallet first.');
      return;
    }
    setWaVerifying(true);
    setWaError(null);
    try {
      const res = await fetch('/api/dao/verify-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAddress }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to verify WhatsApp group membership.');
      }
      await fetchEligibility();
    } catch (err: unknown) {
      setWaError((err as Error).message);
    } finally {
      setWaVerifying(false);
    }
  };

  // ── 1-Click Resource Staking & SR Voting Assistant ─────────────────────────
  const handleStakeAndVote = async () => {
    if (!activeAddress) return;
    setIsStakingHelper(true);
    setPayError(null);
    try {
      const res = await fetch('/api/dao/stake-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: activeAddress,
          energyStakeTrob: eligibility?.formula?.dao?.energyStakeTrob ?? 1070,
          bandwidthStakeTrob: eligibility?.formula?.dao?.bandwidthStakeTrob ?? 237,
          srVoted: true,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to verify resource staking.');
      }
      await fetchEligibility();
    } catch (err: unknown) {
      setPayError((err as Error).message);
    } finally {
      setIsStakingHelper(false);
    }
  };

  // ── Seat Payment Handler: $300 worth of TROB at live rate ──────────────────
  const handleClaimSeat = async () => {
    if (!wallet.isConnected) {
      setPayError('Please connect your TrobSafe wallet first.');
      return;
    }
    if (!termsAccepted) {
      setPayError('You must accept the Terms & Conditions before registering.');
      return;
    }
    if (!eligibility?.condition1.passed) {
      setPayError(eligibility?.condition1.reason || 'Eligible wallet must be created on or after 1 October 2026.');
      return;
    }
    if (!eligibility?.condition2.passed) {
      setPayError(`Condition 2 Required: ${eligibility?.condition2.missingRequirements.join('; ')}`);
      return;
    }
    if (!eligibility?.whatsapp.joined) {
      setPayError('You must join and verify the official WhatsApp channel before registering.');
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

      // 1. Trigger smart contract on TrobChain if deployed
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

      // 2. Register membership in database via backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/dao/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: activeAddr,
          txHash: txId,
          termsAccepted: true,
        }),
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
      sessionStorage.clear();
    } catch { /* ignore */ }
    window.location.href = '/';
  };

  // ── Access Granted: Render DAO Dashboard Layout ────────────────────────────
  if (isVerifiedMember) {
    return <>{children}</>;
  }

  // Calculate blockers
  const isEligibleToPay = Boolean(
    wallet.isConnected &&
    termsAccepted &&
    eligibility?.condition1.passed &&
    eligibility?.condition2.passed &&
    eligibility?.whatsapp.joined &&
    priceData &&
    priceData.seatEntryTrob > 0
  );

  return (
    <>
      <div className="min-h-screen bg-[#060D1E] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 relative select-none font-sans overflow-x-hidden">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* ── Main Mobile-Style Registration Card (matches screenshot) ────── */}
        <div className="w-full max-w-[440px] bg-gradient-to-b from-[#0D1A35] via-[#091326] to-[#060D1E] rounded-[28px] border border-slate-700/60 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-5 sm:p-7 space-y-5 relative backdrop-blur-2xl">

          {/* Top Brand Header: Emblem + EQUORA DAO */}
          <div className="text-center space-y-2 pt-1">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E3A8A]/40 via-[#0D1E47] to-[#081226] border border-blue-400/25 p-3 flex items-center justify-center shadow-[0_8px_24px_rgba(21,94,239,0.25)]">
                  <img
                    src="/icons/equora-symbol.svg"
                    alt="EQUORA"
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md border border-amber-200/60">
                    <Crown className="w-2.5 h-2.5 text-slate-950" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-wider uppercase font-sora text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400">
                EQUORA DAO
              </h1>
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
                <span>Genesis Council</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400/90 font-mono">100 Seats Cap</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-[340px] mx-auto">
              {!wallet.isConnected
                ? 'Connect your verified TrobSafe wallet to evaluate protocol criteria and claim your Genesis seat.'
                : 'Wallet active. Verify mandatory protocol compliance and authorize real-time 300 USD entry payment.'}
            </p>
          </div>

          {/* ── 1. YOUR WALLET (Screenshot input style) ────────────────────── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                Your Wallet
              </label>
              {wallet.isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>

            {wallet.isConnected && activeAddress ? (
              <div className="relative">
                <div className="w-full py-3 px-3.5 rounded-xl bg-[#040814] border border-slate-700/80 text-xs font-mono font-medium text-slate-200 flex items-center justify-between shadow-inner">
                  <span className="truncate pr-2 font-mono text-[11px]">{activeAddress}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      title="Copy Address"
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {copiedAddress ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-400/20" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pl-1">
                  <span>Connected from TrobSafe (Read-Only)</span>
                  {copiedAddress && <span className="text-emerald-400 font-semibold">Address copied</span>}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => triggerSmartConnectWallet({ wallet, openModal: () => setWalletModalOpen(true) })}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#155EEF] hover:bg-[#004EEB] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(21,94,239,0.35)] transition-all cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect TrobSafe Wallet</span>
                </button>
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <a
                    href={TROBSAFE_CHROME_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Get Chrome Extension</span>
                  </a>
                  <a
                    href="/downloads/trobsafe.apk"
                    download="trobsafe.apk"
                    className="hover:text-blue-400 underline flex items-center gap-1"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Download Android APK</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ── 2. Real-Time Entry Price Box ($300 Peg) ────────────────────── */}
          <div className="p-3.5 rounded-2xl bg-[#09152B] border border-blue-500/30 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-300">Council Seat Entry Fee</span>
              <span className="font-mono text-blue-400">
                {priceData ? `@ $${priceData.priceUsd.toFixed(4)} / TROB` : 'Fetching live rate…'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-sora text-white tracking-tight">
                  {priceData
                    ? priceData.seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : '…'}
                </span>
                <span className="text-xs font-bold text-blue-400">TROB</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Fixed $300.00 USD
              </span>
            </div>
          </div>

          {/* ── 3. Protocol Deposit Requirements Checklist (PDF Page 4) ─────── */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase tracking-wider text-slate-300 text-[11px]">
                Protocol Deposit Requirements
              </span>
              {eligibilityLoading && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#060E1D] border border-slate-800 space-y-2.5 text-xs">
              {/* Energy Requirement */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-300">
                    Energy Stake ({eligibility?.formula?.dao?.energyStakeTrob ?? 1070} TROB)
                  </span>
                </div>
                {eligibility?.condition2.energy.passed ? (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Staked
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-400">
                    {eligibility?.condition2.energy.stakedTrob ?? 0} / {eligibility?.formula?.dao?.energyStakeTrob ?? 1070}
                  </span>
                )}
              </div>

              {/* Bandwidth Requirement */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-slate-300">
                    Bandwidth Stake ({eligibility?.formula?.dao?.bandwidthStakeTrob ?? 237} TROB)
                  </span>
                </div>
                {eligibility?.condition2.bandwidth.passed ? (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Staked
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-400">
                    {eligibility?.condition2.bandwidth.stakedTrob ?? 0} / {eligibility?.formula?.dao?.bandwidthStakeTrob ?? 237}
                  </span>
                )}
              </div>

              {/* Equora_Fi SR Vote */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vote className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-slate-300">Equora_Fi SR Governance Vote</span>
                </div>
                {eligibility?.condition2.srVote.passed ? (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Confirmed
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400">Required</span>
                )}
              </div>

              {/* Condition 1: Wallet Creation Date */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-300">Activation Date (≥ 1 Oct 2026)</span>
                </div>
                {eligibility?.condition1.passed ? (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Eligible
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-400">
                    Ineligible
                  </span>
                )}
              </div>
            </div>

            {/* Helper Action: Auto-Stake & Vote for Testnet / Live */}
            {wallet.isConnected && (!eligibility?.condition2.passed) && (
              <button
                type="button"
                onClick={handleStakeAndVote}
                disabled={isStakingHelper}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600/50 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                {isStakingHelper ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Synchronize Resource Allocation & SR Vote</span>
              </button>
            )}
          </div>

          {/* ── 4. Official WhatsApp Channel (Refined Metallic Gold finish) ─── */}
          <div className="space-y-1.5">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#DFB76C] via-[#F4D388] to-[#C99C44] p-3.5 sm:p-4 text-slate-950 shadow-[0_8px_24px_rgba(212,175,55,0.2)] border border-amber-200/60 flex items-center justify-between gap-3">
              {/* WhatsApp Icon + Titles */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#1FAF51] text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-950/80">
                      Verified Community
                    </span>
                    <ShieldCheck className="w-3 h-3 text-emerald-800 shrink-0" />
                  </div>
                  <div className="text-xs font-black text-slate-950 truncate tracking-tight uppercase font-sora">
                    EQUORA DAO Official Channel
                  </div>
                  <div className="text-[10px] font-semibold text-slate-900/80">
                    Mandatory Community Verification
                  </div>
                </div>
              </div>

              {/* JOIN Button */}
              <button
                type="button"
                onClick={handleJoinWhatsApp}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-md shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                Join
              </button>
            </div>

            {/* Telegram-style Cross-Check Membership Verification */}
            <div className="px-1 pt-1">
              {eligibility?.whatsapp.joined ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Channel Membership Verified • Access Authorized</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300/90 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>Channel membership required prior to seat entry</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyWhatsApp}
                    disabled={waVerifying || !wallet.isConnected}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shrink-0 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {waVerifying ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Verify Membership'}
                  </button>
                </div>
              )}
              {waError && <p className="text-[10px] text-rose-400 mt-1 pl-1">{waError}</p>}
            </div>
          </div>

          {/* ── 5. Terms & Conditions Checkbox ────────────────────────────── */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-[11px] leading-tight select-none text-slate-400">
                I accept the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setTermsModalOpen(true);
                  }}
                  className="font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  Genesis DAO Governance Terms & Conditions
                </button>
                .
              </span>
            </label>
          </div>

          {/* ── Error notices if any ──────────────────────────────────────── */}
          {payError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 flex items-start gap-2 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-snug">{payError}</p>
            </div>
          )}

          {/* ── 6. Primary Action Button (Register & Pay) ──────────────────── */}
          <button
            type="button"
            onClick={handleClaimSeat}
            disabled={!isEligibleToPay || payTxHash === 'pending'}
            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isEligibleToPay
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_6px_25px_rgba(21,94,239,0.4)] cursor-pointer ring-2 ring-blue-400/30'
                : 'bg-slate-800/70 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }`}
          >
            {payTxHash === 'pending' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Broadcasting Transaction…</span>
              </>
            ) : isEligibleToPay ? (
              <>
                <span>
                  {priceData
                    ? `Submit Entry Deposit (${priceData.seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB)`
                    : 'Submit Entry Deposit (300 USD)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : !wallet.isConnected ? (
              <span>Connect TrobSafe Wallet to Register</span>
            ) : !eligibility?.condition1.passed ? (
              <span>Ineligible: Wallet Must Be Created On/After 1 Oct 2026</span>
            ) : !eligibility?.condition2.passed ? (
              <span>Fulfill Resource Stake & SR Vote Requirements</span>
            ) : !eligibility?.whatsapp.joined ? (
              <span>Complete WhatsApp Channel Verification</span>
            ) : !termsAccepted ? (
              <span>Accept Terms & Conditions to Register</span>
            ) : (
              <span>Complete Protocol Verification Requirements</span>
            )}
          </button>

          {/* Bottom Branding */}
          <div className="pt-2 text-center border-t border-slate-800/80">
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
              <span>Autonomous Consensus Protocol</span>
              <span>•</span>
              <span>TrobChain L1</span>
              <span>•</span>
              <Link href="/" className="hover:text-blue-400 underline">
                EQUORA.FI
              </Link>
            </p>
          </div>
        </div>
      </div>

      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAccept={() => setTermsAccepted(true)}
      />
    </>
  );
}
