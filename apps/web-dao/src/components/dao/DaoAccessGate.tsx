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
  TrendingUp,
  Layers,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useDaoMember, useTrobPrice } from '@/hooks/useApi';
import { WalletModal } from '@/components/ui/WalletModal';
import { TermsModal } from '@/components/dao/TermsModal';
import {
  triggerSmartConnectWallet,
  TROBSAFE_CHROME_STORE_URL,
  TROBSAFE_APP_STORE_URL,
  isMobileDevice,
  openInTrobSafeApp,
} from '@/utils/walletConnect';
import { EquoraLogo } from '@/components/ui/EquoraLogo';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { getActiveDaoAddress } from '@/utils/trobAddress';

// ─── Constants & Addresses ───────────────────────────────────────────────────
const DAO_CONTRACT_ADDRESS = getActiveDaoAddress();
const OFFICIAL_WHATSAPP_URL = 'https://chat.whatsapp.com/GR19373Pgq7LezBKtXC0ng';
export const OFFICIAL_EQUORA_SR = 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY';
export const OFFICIAL_EQUORA_TESTNET_SR = 'TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5';

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

  // WhatsApp community join state
  const [waJoining, setWaJoining]             = useState(false);
  const [isLocalMember, setIsLocalMember]     = useState(false);

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

  const [mounted, setMounted]                 = useState(false);

  // Quick fallback timeout for detection probe (800ms max) & client mount flag
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setDetectTimeout(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch DAO membership details (position > 0)
  const { data: memberData, loading: memberLoading, refetch: refetchMember } =
    useDaoMember(activeAddress);

  // Fetch live TROB price for the $300 USD calculation (polls every 30s)
  const { data: priceData, loading: priceLoading } = useTrobPrice(30_000);

  // Synchronize local membership cache and purge stale keys
  useEffect(() => {
    if (!activeAddress || typeof window === 'undefined') return;
    if (memberData?.isMember || Number(memberData?.position) > 0) {
      setIsLocalMember(true);
      try {
        localStorage.setItem(`equora_dao_member_${activeAddress.toLowerCase()}`, 'true');
      } catch {}
    } else if (!memberLoading && memberData && !memberData.isMember) {
      setIsLocalMember(false);
      try {
        localStorage.removeItem(`equora_dao_member_${activeAddress.toLowerCase()}`);
        localStorage.removeItem(`equora_wa_joined_${activeAddress}`);
        localStorage.removeItem(`equora_wa_joined_${activeAddress.toLowerCase()}`);
      } catch {}
    }
  }, [activeAddress, memberData, memberLoading]);

  // Strict verified membership: MUST have connected wallet AND verified active seat from live backend/contract
  const isVerifiedMember = Boolean(
    wallet.isConnected &&
    activeAddress &&
    (memberData?.isMember === true || Number(memberData?.position) > 0)
  );

  // Note: Do not kick disconnected mobile users back to landing page;
  // allow them to view registration criteria and connect wallet directly on mobile.

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

  // Check if WhatsApp was already joined for this address in localStorage
  useEffect(() => {
    if (!activeAddress || typeof window === 'undefined') return;
    const isWaJoined =
      localStorage.getItem(`equora_wa_joined_${activeAddress}`) ||
      localStorage.getItem(`equora_wa_joined_${activeAddress.toLowerCase()}`);
    if (isWaJoined === 'true') {
      setEligibility((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          whatsapp: { joined: true, verifiedAt: prev.whatsapp?.verifiedAt || new Date().toISOString() },
          eligibleToDeposit: Boolean(prev.condition1?.passed && prev.condition2?.passed),
        };
      });
    }
  }, [activeAddress]);

  // ── WhatsApp Community One-Click Join & Auto-Verification ───────────────────
  const handleJoinWhatsApp = async () => {
    setWaJoining(true);
    if (typeof window !== 'undefined') {
      window.open(OFFICIAL_WHATSAPP_URL, '_blank', 'noopener,noreferrer');
    }
    if (activeAddress) {
      try {
        localStorage.setItem(`equora_wa_joined_${activeAddress}`, 'true');
        localStorage.setItem(`equora_wa_joined_${activeAddress.toLowerCase()}`, 'true');
        await fetch('/api/dao/verify-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: activeAddress }),
        });
      } catch (err) {
        console.warn('[handleJoinWhatsApp] verification note:', err);
      }
      setEligibility((prev) =>
        prev
          ? {
              ...prev,
              whatsapp: { joined: true, verifiedAt: new Date().toISOString() },
              eligibleToDeposit: Boolean(prev.condition1?.passed && prev.condition2?.passed),
            }
          : prev
      );
    }
    setWaJoining(false);
  };

  // ── Live On-Chain Resource Staking & SR Voting via Injected Wallet ──────────
  const handleStakeAndVote = async () => {
    if (!activeAddress) return;
    setIsStakingHelper(true);
    setPayError(null);
    try {
      if (typeof window === 'undefined') return;
      const w = window as any;
      const tw = w?.trobWeb || w?.tronWeb || w?.trobSafe;
      if (!tw || !tw.transactionBuilder || !tw.trx?.sign) {
        throw new Error('TrobSafe wallet extension is not detected or locked. Please unlock your wallet.');
      }

      // 1. Prompt wallet to broadcast Freeze V2 for Energy if needed
      if (!eligibility?.condition2.energy.passed) {
        const targetEnergy = eligibility?.formula?.dao?.energyStakeTrob ?? 1070;
        const currentEnergy = eligibility?.condition2.energy.stakedTrob ?? 0;
        const missingEnergy = Math.max(0, targetEnergy - currentEnergy);
        if (missingEnergy > 0) {
          const energySun = Math.round(missingEnergy * 1e6);
          const txEnergy = await tw.transactionBuilder.freezeBalanceV2(energySun, 'ENERGY', activeAddress);
          if (txEnergy?.Error) throw new Error(txEnergy.Error);
          const signedEnergy = await tw.trx.sign(txEnergy);
          await tw.trx.sendRawTransaction(signedEnergy);
        }
      }

      // 2. Prompt wallet to broadcast Freeze V2 for Bandwidth if needed
      if (!eligibility?.condition2.bandwidth.passed) {
        const targetBandwidth = eligibility?.formula?.dao?.bandwidthStakeTrob ?? 237;
        const currentBandwidth = eligibility?.condition2.bandwidth.stakedTrob ?? 0;
        const missingBandwidth = Math.max(0, targetBandwidth - currentBandwidth);
        if (missingBandwidth > 0) {
          const bandwidthSun = Math.round(missingBandwidth * 1e6);
          const txBandwidth = await tw.transactionBuilder.freezeBalanceV2(bandwidthSun, 'BANDWIDTH', activeAddress);
          if (txBandwidth?.Error) throw new Error(txBandwidth.Error);
          const signedBandwidth = await tw.trx.sign(txBandwidth);
          await tw.trx.sendRawTransaction(signedBandwidth);
        }
      }

      // 3. Prompt wallet to cast SR governance vote if needed
      if (!eligibility?.condition2.srVote.passed) {
        const totalFrozen =
          (eligibility?.condition2.energy.stakedTrob ?? 1070) +
          (eligibility?.condition2.bandwidth.stakedTrob ?? 237);
        const votesToCast = Math.max(1, Math.min(1000, totalFrozen));

        let txVote: any = null;
        // Prioritize Testnet SR on testnet environments
        try {
          txVote = await tw.transactionBuilder.vote({ [OFFICIAL_EQUORA_TESTNET_SR]: votesToCast }, activeAddress);
        } catch { /* ignore */ }

        if (!txVote || txVote.Error) {
          try {
            txVote = await tw.transactionBuilder.vote({ [OFFICIAL_EQUORA_SR]: votesToCast }, activeAddress);
          } catch { /* ignore */ }
        }

        if (txVote && !txVote.Error) {
          const signedVote = await tw.trx.sign(txVote);
          await tw.trx.sendRawTransaction(signedVote);
        }
      }

      // Wait 3 seconds for on-chain block confirmation
      await new Promise(r => setTimeout(r, 3000));

      // Query live on-chain status from TrobChain node
      const res = await fetch('/api/dao/stake-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAddress }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to verify on-chain resource staking.');
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
      // 1. Mandatory on-chain execution of EquoraDAO.sol contract joinDAO()
      const targetContract =
        DAO_CONTRACT_ADDRESS &&
        DAO_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
        DAO_CONTRACT_ADDRESS.length > 10
          ? DAO_CONTRACT_ADDRESS
          : 'TJEnziFHUDhoeds5Yecv4a2XYRzbeJ8eid';

      const seatEntryTrob = priceData.seatEntryTrob;
      const callValueSun  = Math.ceil(seatEntryTrob * 1_000_000);

      const payload = {
        contract_address:   targetContract,
        function_selector: 'joinDAO()',
        parameter:         '',
        call_value:        callValueSun,
        fee_limit:         100_000_000,
        owner_address:     activeAddr,
      };

      let txId: string | null = null;

      try {
        const res = await wallet.callContract(payload);
        if (res?.txid) {
          txId = res.txid;
        } else if (res && (res as any).result === false) {
          const errorDetail = (res as any)?.Error || (res as any)?.message || 'Transaction rejected or failed in TrobSafe wallet.';
          throw new Error(errorDetail);
        }
      } catch (contractErr: unknown) {
        console.warn('[DaoAccessGate] Contract invocation notice:', contractErr);
        const errMsg = contractErr instanceof Error ? contractErr.message : String(contractErr);
        throw new Error(errMsg || 'Transaction was cancelled or rejected in TrobSafe.');
      }

      if (!txId) {
        throw new Error('On-chain deposit was not confirmed by TrobSafe. Please approve the payment in your wallet.');
      }

      // Wait 3.5s for TrobChain testnet to mine the block containing this payment
      await new Promise((r) => setTimeout(r, 3500));

      // 2. Register membership in database via backend API with verified on-chain tx & Anti-Sybil device fingerprint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const deviceFingerprint = await getDeviceFingerprint();
      const claimRes = await fetch(`${apiUrl}/api/dao/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-fingerprint': deviceFingerprint,
        },
        body: JSON.stringify({
          address: activeAddr,
          txHash: txId,
          deviceFingerprint,
          termsAccepted: true,
        }),
      });
      const data = await claimRes.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to verify membership payment on TrobChain.');
      }

      localStorage.setItem(`equora_dao_member_${activeAddr.toLowerCase()}`, 'true');
      setIsLocalMember(true);
      setPayTxHash(txId);
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

  // If verifying membership on first load, display clean loader instead of gate window
  if (wallet.isConnected && activeAddress && memberLoading && !memberData && !isLocalMember) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0E62E4] animate-spin" />
          <span className="text-xs font-semibold text-[#60739A] tracking-wider uppercase font-sans">
            Verifying Council Membership…
          </span>
        </div>
      </div>
    );
  }

  // Calculate blockers
  const isEligibleToPay = Boolean(
    wallet.isConnected &&
    termsAccepted &&
    eligibility?.condition1.passed &&
    eligibility?.condition2.passed &&
    (eligibility?.whatsapp.joined || (activeAddress && typeof window !== 'undefined' && (localStorage.getItem(`equora_wa_joined_${activeAddress}`) === 'true' || localStorage.getItem(`equora_wa_joined_${activeAddress.toLowerCase()}`) === 'true'))) &&
    priceData &&
    priceData.seatEntryTrob > 0
  );

  return (
    <>
      <div className="min-h-[100dvh] w-full bg-gradient-to-b from-[#F0F4F8] via-[#F6F9FF] to-[#EBF3FC] text-[#17334F] flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 lg:p-10 py-6 sm:py-10 relative select-none font-sans overflow-x-hidden overflow-y-auto">
        {/* Soft Ambient Background Glows matching project */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#0E62E4]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* ── Main Registration Card (Light Fintech Theme • Fully Responsive Desktop & Mobile) ────── */}
        <div className="w-full max-w-[480px] lg:max-w-5xl xl:max-w-6xl my-auto bg-white rounded-[24px] sm:rounded-[32px] border border-[#E2ECF9] shadow-[0_24px_70px_-15px_rgba(14,98,228,0.1)] p-4 sm:p-6 lg:p-8 xl:p-10 relative transition-all">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-start">

            {/* ── LEFT COLUMN: Brand Overview, Entry Fee & Protocol Privileges (Desktop) ────── */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-5 lg:sticky lg:top-6">

              {/* Top Brand Header: Official EQUORA Logo + EQUORA DAO */}
              <div className="text-center lg:text-left space-y-2.5 pt-0.5 sm:pt-1">
                <div className="flex justify-center lg:justify-start">
                  <div className="relative group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EFF6FF] border border-[#0E62E4]/20 p-2 sm:p-2.5 flex items-center justify-center shadow-[0_6px_20px_rgba(14,98,228,0.14)] transition-transform duration-200 group-hover:scale-105">
                      <EquoraLogo className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(14,98,228,0.25)]" />
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-md border-2 border-white">
                        <Crown className="w-2.5 h-2.5 text-amber-950" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider uppercase font-inter text-[#17334F]">
                    EQUORA <span className="text-[#0E62E4]">DAO</span>
                  </h1>
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#4F6D87] tracking-wider uppercase font-sans">
                    <span>Genesis Council</span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span className="text-[#0E62E4] font-semibold">100 Seats Cap</span>
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs text-[#60739A] leading-relaxed max-w-[340px] lg:max-w-none mx-auto lg:mx-0 font-sans">
                  {!wallet.isConnected
                    ? 'Connect your verified TrobSafe wallet to evaluate protocol criteria and claim your Genesis seat.'
                    : 'Wallet active. Verify mandatory protocol compliance and authorize real-time 300 USD entry payment.'}
                </p>
              </div>

              {/* ── Council Seat Entry Price Box ($300 Peg) ────────────────────── */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#EFF6FF] border border-[#0E62E4]/20 space-y-2 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-sans">
                  <span className="font-semibold text-[#17334F] text-[10px] sm:text-[11px]">Council Seat Entry Fee</span>
                  <span suppressHydrationWarning className="font-mono text-[#0E62E4] font-semibold text-[10px] sm:text-[11px]">
                    {mounted && priceData ? `@ $${priceData.priceUsd.toFixed(4)} / TROB` : 'Fetching live rate…'}
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <span suppressHydrationWarning className="text-xl sm:text-2xl lg:text-3xl font-black font-sora text-[#17334F] tracking-tight">
                      {mounted && priceData
                        ? priceData.seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : '…'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#0E62E4] font-sans">TROB</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-[#0E62E4]/10 text-[#0E62E4] border border-[#0E62E4]/25 font-sans">
                    Fixed $300.00 USD
                  </span>
                </div>
              </div>

              {/* ── Desktop Exclusive: Protocol Genesis Privileges Card ─────── */}
              <div className="hidden lg:block p-4 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF9] space-y-3 font-sans">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#17334F]">
                  <Sparkles className="w-3.5 h-3.5 text-[#0E62E4]" />
                  <span>Genesis Council Privileges</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#4F6D87]">
                  <li className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#0E62E4]/10 text-[#0E62E4] flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="leading-snug">
                      <span className="font-bold text-[#17334F]">100 Sovereign Seats:</span> Permanently capped supply. Zero additional Genesis seats can ever be created on-chain.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div className="leading-snug">
                      <span className="font-bold text-[#17334F]">Instant 300 / N Cashback:</span> Automated real-time P2P algorithmic disbursement upon seat activation.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div className="leading-snug">
                      <span className="font-bold text-[#17334F]">35% Matrix Volume Share:</span> Perpetual dividend distribution from global retail protocol volume.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Vote className="w-3.5 h-3.5" />
                    </div>
                    <div className="leading-snug">
                      <span className="font-bold text-[#17334F]">1.0% Governance Power:</span> Sovereign on-chain voting rights across all decentralized governance votes.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Desktop Consensus & Security Footnote */}
              <div className="hidden lg:flex items-center justify-between text-[11px] text-[#60739A] px-1 font-sans">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>TrobChain L1 Consensus Verified</span>
                </div>
                <span className="text-[10px] font-semibold text-[#0E62E4] bg-[#0E62E4]/10 px-2 py-0.5 rounded-full border border-[#0E62E4]/20">
                  Zero Referrals Required
                </span>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Wallet, Requirements, Verification, Action CTA ────── */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">

              {/* ── 1. YOUR WALLET ─────────────────────────────────────────────── */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#17334F] font-sans">
                    Your Wallet
                  </label>
                  {wallet.isConnected && (
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  )}
                </div>

                {wallet.isConnected && activeAddress ? (
                  <div className="relative">
                    <div className="w-full py-2.5 sm:py-3 px-3 sm:px-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2ECF9] text-xs font-mono font-medium text-[#17334F] flex items-center justify-between shadow-xs">
                      <span className="truncate pr-2 font-mono text-[11px] sm:text-xs font-semibold">{activeAddress}</span>
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleCopyAddress}
                          title="Copy Address"
                          className="p-1 rounded hover:bg-[#EFF6FF] text-[#60739A] hover:text-[#0E62E4] transition-colors cursor-pointer"
                        >
                          {copiedAddress ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#60739A] mt-1 pl-1 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span>Connected from TrobSafe (Active)</span>
                        {isMobileDevice() && (
                          <button
                            type="button"
                            onClick={() => openInTrobSafeApp()}
                            className="text-[#0E62E4] hover:underline font-bold inline-flex items-center gap-0.5 ml-1 cursor-pointer"
                          >
                            <span>Open in App</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                      {copiedAddress && <span className="text-emerald-600 font-semibold">Address copied</span>}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => triggerSmartConnectWallet({ wallet, openModal: () => setWalletModalOpen(true) })}
                      className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(14,98,228,0.25)] transition-all cursor-pointer font-sans"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Connect TrobSafe Wallet</span>
                    </button>
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-[#60739A] px-1 font-sans">
                      <a
                        href={TROBSAFE_CHROME_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0E62E4] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Chrome Extension</span>
                      </a>
                      <a
                        href="/downloads/trobsafe.apk"
                        download="trobsafe.apk"
                        className="text-[#0E62E4] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Android APK</span>
                      </a>
                      <a
                        href={TROBSAFE_APP_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0E62E4] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Download className="w-3 h-3" />
                        <span>iOS App</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* ── 2. Protocol Deposit Requirements Checklist (PDF Page 4) ─────── */}
              <div className="space-y-2 pt-0.5 sm:pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold uppercase tracking-wider text-[#17334F] text-[10px] sm:text-[11px] font-sans">
                    Protocol Deposit Requirements
                  </span>
                  {eligibilityLoading && <Loader2 className="w-3.5 h-3.5 text-[#0E62E4] animate-spin" />}
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF9] space-y-2.5 text-xs font-sans">
                  {/* Energy Requirement */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      </div>
                      <span className="text-[#334155] text-[11px] sm:text-xs font-medium truncate">
                        Energy Stake ({eligibility?.formula?.dao?.energyStakeTrob ?? 1070} TROB)
                      </span>
                    </div>
                    {eligibility?.condition2.energy.passed ? (
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> Staked
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md shrink-0">
                        {eligibility?.condition2.energy.stakedTrob ?? 0} / {eligibility?.formula?.dao?.energyStakeTrob ?? 1070}
                      </span>
                    )}
                  </div>

                  {/* Bandwidth Requirement */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-[#0E62E4] flex items-center justify-center shrink-0">
                        <Radio className="w-3.5 h-3.5 text-[#0E62E4] shrink-0" />
                      </div>
                      <span className="text-[#334155] text-[11px] sm:text-xs font-medium truncate">
                        Bandwidth Stake ({eligibility?.formula?.dao?.bandwidthStakeTrob ?? 237} TROB)
                      </span>
                    </div>
                    {eligibility?.condition2.bandwidth.passed ? (
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> Staked
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md shrink-0">
                        {eligibility?.condition2.bandwidth.stakedTrob ?? 0} / {eligibility?.formula?.dao?.bandwidthStakeTrob ?? 237}
                      </span>
                    )}
                  </div>

                  {/* Equora_Fi SR Vote */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                        <Vote className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      </div>
                      <span className="text-[#334155] text-[11px] sm:text-xs font-medium truncate">Equora_Fi SR Governance Vote</span>
                    </div>
                    {eligibility?.condition2.srVote.passed ? (
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> Confirmed
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                        Required
                      </span>
                    )}
                  </div>

                  {/* Condition 1: Wallet Creation Date */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E2ECF9]">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      </div>
                      <span className="text-[#334155] text-[11px] sm:text-xs font-medium truncate">Activation Date (≥ 1 Oct 2026)</span>
                    </div>
                    {eligibility?.condition1.passed ? (
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> Eligible
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md shrink-0">
                        Not Eligible
                      </span>
                    )}
                  </div>
                </div>

                {/* Helper Action: Auto-Stake & Vote for Testnet / Live */}
                {wallet.isConnected && (!eligibility?.condition2.passed) && (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={handleStakeAndVote}
                      disabled={isStakingHelper}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0E62E4] to-[#2575FC] hover:from-[#0B52C4] hover:to-[#1A62E8] border border-[#0E62E4]/20 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98] font-sans"
                    >
                      {isStakingHelper ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      <span>
                        {isStakingHelper
                          ? 'Broadcasting On-Chain Freeze & Vote…'
                          : !eligibility?.condition2.energy.passed && !eligibility?.condition2.bandwidth.passed
                          ? `Stake Resources (${(eligibility?.formula?.dao?.energyStakeTrob ?? 1070) - (eligibility?.condition2.energy.stakedTrob ?? 0)} Energy, ${(eligibility?.formula?.dao?.bandwidthStakeTrob ?? 237) - (eligibility?.condition2.bandwidth.stakedTrob ?? 0)} Bandwidth) & Vote`
                          : !eligibility?.condition2.energy.passed
                          ? `Stake Remaining Energy (${(eligibility?.formula?.dao?.energyStakeTrob ?? 1070) - (eligibility?.condition2.energy.stakedTrob ?? 0)} TROB) & Vote`
                          : !eligibility?.condition2.bandwidth.passed && !eligibility?.condition2.srVote.passed
                          ? `Stake Remaining Bandwidth (${Math.max(0, (eligibility?.formula?.dao?.bandwidthStakeTrob ?? 237) - (eligibility?.condition2.bandwidth.stakedTrob ?? 0))} TROB) & Cast SR Vote`
                          : !eligibility?.condition2.bandwidth.passed
                          ? `Stake Remaining Bandwidth (${Math.max(0, (eligibility?.formula?.dao?.bandwidthStakeTrob ?? 237) - (eligibility?.condition2.bandwidth.stakedTrob ?? 0))} TROB)`
                          : 'Cast Official Equora SR Governance Vote'}
                      </span>
                    </button>
                    <p className="text-[10px] text-[#60739A] text-center font-sans">
                      Automatically stakes exact missing TROB via Freeze V2 and casts official SR vote.
                    </p>
                  </div>
                )}
              </div>

              {/* ── 3. Official WhatsApp Channel ───────────────────────────────── */}
              <div className="space-y-1.5">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] p-3 sm:p-4 text-slate-950 shadow-xs border border-[#F59E0B]/30 flex items-center justify-between gap-2 sm:gap-3">
                  {/* WhatsApp Icon + Titles */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1FAF51] text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white/60">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#92400E] truncate">
                          Verified Community
                        </span>
                        <ShieldCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                      </div>
                      <div className="text-[11px] sm:text-xs font-black text-[#78350F] truncate tracking-tight uppercase font-inter">
                        EQUORA DAO Official Channel
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-semibold text-[#92400E]/90 truncate">
                        Mandatory Community Verification
                      </div>
                    </div>
                  </div>

                  {/* Single Clean WhatsApp Action Button */}
                  {eligibility?.whatsapp.joined ? (
                    <div className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Joined</span>
                    </div>
                  ) : (
                    <a
                      href={OFFICIAL_WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleJoinWhatsApp}
                      className="px-4 py-2 rounded-xl bg-[#1FAF51] hover:bg-[#178C40] active:scale-95 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-md shrink-0 transition-all cursor-pointer font-sans flex items-center gap-1.5"
                    >
                      {waJoining ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <>
                          <span>Join</span>
                          <ExternalLink className="w-3 h-3" />
                        </>
                      )}
                    </a>
                  )}
                </div>

                {/* WhatsApp Community Join & Verification Status Notice (No duplicate button) */}
                <div className="px-0.5 sm:px-1 pt-1 space-y-2">
                  {eligibility?.whatsapp.joined ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-sans">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px] sm:text-xs leading-snug">
                        Channel Membership Verified • Access Authorized
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center gap-2 text-xs font-sans">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span className="text-[#92400E] text-[10px] sm:text-[11px] font-semibold leading-snug">
                        Tap &quot;Join&quot; above to connect to the official WhatsApp community and authorize deposit.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── 4. Terms & Conditions Checkbox ────────────────────────────── */}
              <div className="pt-0.5 sm:pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#334155] font-sans">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[#CBD5E1] bg-white text-[#0E62E4] focus:ring-[#0E62E4] focus:ring-offset-0 cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] leading-tight select-none text-[#60739A]">
                    I accept the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setTermsModalOpen(true);
                      }}
                      className="font-bold text-[#0E62E4] hover:text-[#0B52C4] hover:underline cursor-pointer"
                    >
                      Genesis DAO Governance Terms & Conditions
                    </button>
                    .
                  </span>
                </label>
              </div>

              {/* ── Error notices if any ──────────────────────────────────────── */}
              {payError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-sans space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="leading-snug text-[11px] sm:text-xs font-medium">{payError}</p>
                  </div>
                  {isMobileDevice() && (
                    <div className="pt-0.5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openInTrobSafeApp()}
                        className="px-3 py-1.5 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in TrobSafe App</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── 5. Primary Action Button (Register & Pay) ──────────────────── */}
              <button
                type="button"
                onClick={handleClaimSeat}
                disabled={!isEligibleToPay || payTxHash === 'pending'}
                className={`w-full py-3.5 sm:py-4 px-3 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-center transition-all font-sans ${
                  isEligibleToPay
                    ? 'bg-gradient-to-r from-[#0E62E4] via-[#1A6EF8] to-[#0B52C4] hover:from-[#0B52C4] hover:to-[#083E96] text-white shadow-[0_8px_25px_rgba(14,98,228,0.3)] cursor-pointer ring-2 ring-blue-300/40 active:scale-[0.99]'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {payTxHash === 'pending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                    <span className="truncate">Broadcasting Transaction…</span>
                  </>
                ) : isEligibleToPay ? (
                  <>
                    <span className="leading-snug">
                      {priceData
                        ? `Submit Entry Deposit (${priceData.seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB)`
                        : 'Submit Entry Deposit (300 USD)'}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                ) : !wallet.isConnected ? (
                  <span>Connect TrobSafe Wallet to Register</span>
                ) : !eligibility?.condition1.passed ? (
                  <span className="leading-snug">Not Eligible: Wallet Must Be Activated On/After 1 Oct 2026</span>
                ) : !eligibility?.condition2.passed ? (
                  <span className="leading-snug">Fulfill Resource Stake & SR Vote Requirements</span>
                ) : !eligibility?.whatsapp.joined ? (
                  <span className="leading-snug">Complete WhatsApp Channel Verification</span>
                ) : !termsAccepted ? (
                  <span>Accept Terms & Conditions to Register</span>
                ) : (
                  <span className="leading-snug">Complete Protocol Verification Requirements</span>
                )}
              </button>
            </div>

            {/* ── Bottom Branding (Full Width Across Desktop Grid) ──────────── */}
            <div className="lg:col-span-12 pt-3 sm:pt-4 text-center border-t border-[#E2ECF9]">
              <p className="text-[10px] sm:text-[11px] text-[#60739A] flex flex-wrap items-center justify-center gap-1.5 font-sans font-medium">
                <span>Autonomous Consensus Protocol</span>
                <span>•</span>
                <span>TrobChain L1</span>
                <span>•</span>
                <Link href="/" className="text-[#0E62E4] hover:underline font-semibold">
                  EQUORA.FI
                </Link>
              </p>
            </div>
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
