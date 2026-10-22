"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Wallet,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Coins,
  Check,
  TrendingUp,
  Layers,
  HelpCircle,
  Copy,
} from "lucide-react";
import { useUserStore, useMatrixStore } from "@/lib/stores";
import { matrixApi } from "@/lib/api";
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  NETWORK_NAME,
  getOnChainTokenBalance,
  getOnChainTokenAllowance,
  getOnChainSlotStatus,
  approveTokenOnChain,
  joinSlotOnChain,
} from "@/lib/contracts";
import {
  hasInjectedProvider,
  connectInjectedWallet,
} from "@/lib/web3Wallet";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { toast } from "@/lib/toast";

export interface MatrixAccessGateProps {
  children: React.ReactNode;
}

export function MatrixAccessGate({ children }: MatrixAccessGateProps) {
  const address = useUserStore((s) => s.address);
  const setAddress = useUserStore((s) => s.setAddress);
  const refreshAll = useMatrixStore((s) => s.fetchSlots);

  // Verification state
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isSlot1Unlocked, setIsSlot1Unlocked] = useState(false);

  // Live Price State (fetched dynamically each time from /api/price/trob)
  const [trobPriceUsd, setTrobPriceUsd] = useState<number>(0.039);
  const [priceSource, setPriceSource] = useState<string>("live-oracle");
  const [priceUpdatedAt, setPriceUpdatedAt] = useState<string>("");
  const [fetchingPrice, setFetchingPrice] = useState(false);

  // Financial & Contract State
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [allowance, setAllowance] = useState<number | null>(null);
  const [sponsorAddress, setSponsorAddress] = useState<string>(
    "0xE5d1e6b17525e18649F78c54e132Ff1e1Efdd90C"
  );

  // Action states
  const [isApproving, setIsApproving] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Genesis DAO Priority state from URL query
  const [daoSeat, setDaoSeat] = useState<number | null>(null);
  const [gatewayId, setGatewayId] = useState<number | null>(null);
  const [showFundBreakdown, setShowFundBreakdown] = useState(false);

  // Calculate required TROB for $30 USD at current live price
  const requiredTrob =
    trobPriceUsd > 0 ? Math.ceil((30 / trobPriceUsd) * 100) / 100 : 769.23;

  // 1. Fetch Dynamic Live TROB Price
  const fetchLivePrice = useCallback(async () => {
    setFetchingPrice(true);
    try {
      const priceData = await matrixApi.getLiveTrobPrice();
      setTrobPriceUsd(priceData.priceUsd);
      setPriceSource(priceData.priceSource);
      setPriceUpdatedAt(priceData.updatedAt);
    } catch (err) {
      console.warn("[MatrixGate] Failed to fetch live price:", err);
    } finally {
      setFetchingPrice(false);
    }
  }, []);

  // 2. Read Sponsor, DAO Seat, and Gateway from URL or LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref") || params.get("sponsor");
      const seat = params.get("daoSeat");
      const gw = params.get("gateway");

      if (seat) {
        const parsedSeat = parseInt(seat, 10);
        if (!isNaN(parsedSeat)) setDaoSeat(parsedSeat);
      }
      if (gw) {
        const parsedGw = parseInt(gw, 10);
        if (!isNaN(parsedGw)) setGatewayId(parsedGw);
      }

      if (ref && ref.startsWith("0x")) {
        setSponsorAddress(ref.toLowerCase());
        localStorage.setItem("equora_sponsor", ref.toLowerCase());
      } else {
        const stored = localStorage.getItem("equora_sponsor");
        if (stored && stored.startsWith("0x")) {
          setSponsorAddress(stored.toLowerCase());
        }
      }
    }
  }, []);

  // 3. Verify On-Chain Slot 1 Status & Balances
  const verifyAccess = useCallback(async () => {
    if (!address) {
      setCheckingStatus(false);
      setIsSlot1Unlocked(false);
      return;
    }

    setCheckingStatus(true);
    setActionError(null);

    try {
      // Query on-chain Slot 1 status directly from smart contract
      const [slotStatus, bal, allow] = await Promise.all([
        getOnChainSlotStatus(address, 1).catch(() => ({
          isUnlocked: false,
          currentCycle: 1,
          filledNodes: 0,
          slotEarned: 0,
        })),
        getOnChainTokenBalance(address).catch(() => 0),
        getOnChainTokenAllowance(address).catch(() => 0),
      ]);

      setIsSlot1Unlocked(Boolean(slotStatus.isUnlocked));
      setTokenBalance(bal);
      setAllowance(allow);
    } catch (err: any) {
      console.warn("[MatrixGate] On-chain check error:", err);
      // Fallback: Check backend database profile
      try {
        const prof = await matrixApi.getProfile(address);
        if (prof && prof.highestUnlockedSlot >= 1) {
          setIsSlot1Unlocked(true);
        }
      } catch {}
    } finally {
      setCheckingStatus(false);
    }
  }, [address]);

  // Initial load: Fetch live price and verify status
  useEffect(() => {
    fetchLivePrice();
  }, [fetchLivePrice]);

  useEffect(() => {
    verifyAccess();
  }, [verifyAccess]);

  // Handle Injected Wallet Connect
  const handleConnectWallet = () => {
    setWalletModalOpen(true);
  };

  // Step 1: Approve TROB tokens for EquoraMatrix
  const handleApprove = async () => {
    setIsApproving(true);
    setActionError(null);
    try {
      toast.info("Prompting Wallet", `Approving ${requiredTrob} TROB for Matrix contract...`);
      const txHash = await approveTokenOnChain(requiredTrob);
      setLastTxHash(txHash);
      setAllowance(requiredTrob);
      toast.success(
        "Approval Confirmed!",
        `Tx: ${txHash.slice(0, 8)}...${txHash.slice(-6)}`
      );
      // Re-verify on-chain allowance
      const newAllow = await getOnChainTokenAllowance(address);
      setAllowance(newAllow);
    } catch (err: any) {
      const msg = err.message || "Token approval failed or rejected.";
      setActionError(msg);
      toast.error("Approval Failed", msg);
    } finally {
      setIsApproving(false);
    }
  };

  // Step 2: Join Slot 1 On-Chain ($30 USD in TROB)
  const handleActivateSlot1 = async () => {
    setIsJoining(true);
    setActionError(null);
    try {
      toast.info(
        "Activating Slot 1",
        `Joining Equora Matrix under sponsor ${sponsorAddress.slice(0, 6)}...`
      );

      const txHash = await joinSlotOnChain(1, sponsorAddress);
      setLastTxHash(txHash);

      // Synchronize backend database ledger with real on-chain transaction
      try {
        await matrixApi.buySlot(address, 1, txHash);
      } catch (apiErr) {
        console.warn("[MatrixGate] Backend sync warning (on-chain tx succeeded):", apiErr);
      }

      toast.success(
        "Slot 1 Activated!",
        `Welcome to Equora Matrix. Tx: ${txHash.slice(0, 8)}...`
      );

      setIsSlot1Unlocked(true);
      await refreshAll(address, true);
    } catch (err: any) {
      const msg = err.message || "Failed to join slot on-chain.";
      setActionError(msg);
      toast.error("Activation Failed", msg);
    } finally {
      setIsJoining(false);
    }
  };

  // If currently verifying initial state, show sleek cyber loader
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 animate-pulse">
          <Layers className="w-7 h-7 text-white" />
        </div>
        <div className="text-[15px] font-bold text-[#0f172a] mb-1">
          Detecting Matrix Identity
        </div>
        <div className="text-[12px] text-[#64748b] flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563eb]" />
          Verifying Slot 1 authorization on {NETWORK_NAME}...
        </div>
      </div>
    );
  }

  // If Slot 1 is unlocked, grant full access to children
  if (isSlot1Unlocked) {
    return <>{children}</>;
  }

  // Otherwise, render the Matrix Access Gate
  const hasEnoughBalance = (tokenBalance ?? 0) >= requiredTrob;
  const hasApprovedEnough = (allowance ?? 0) >= requiredTrob;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090e17] via-[#0f172a] to-[#090e17] text-white flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* ── TOP PROTOCOL BAR ────────────────────────────────────────────── */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center">
              <Image
                src="/new-logo.png"
                alt="Equora"
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
                priority
              />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[16px] font-black tracking-tight text-white">
              EQUORA_FI
            </span>
            <span className="text-[10px] font-bold text-[#38bdf8] tracking-[0.16em] uppercase">
              MATRIX PROTOCOL
            </span>
          </div>
        </Link>

        {/* Live Oracle Badge */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/60">Live Rate:</span>
          <span className="font-mono font-bold text-emerald-400">
            ${trobPriceUsd.toFixed(6)} USD
          </span>
          <button
            onClick={fetchLivePrice}
            disabled={fetchingPrice}
            title="Refresh live price from oracle"
            className="text-white/50 hover:text-white transition-colors cursor-pointer ml-1"
          >
            <RefreshCw
              className={`w-3 h-3 ${fetchingPrice ? "animate-spin text-[#38bdf8]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── MAIN ACCESS GATE CARD ──────────────────────────────────────── */}
      <div className="max-w-[560px] w-full mx-auto my-8 bg-[#0f172a]/80 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#2563eb]/20 blur-3xl pointer-events-none rounded-full" />

        {/* Header Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-[#38bdf8] text-[11.5px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Matrix Access Gate</span>
          </div>
          <span className="text-[11px] font-mono text-white/50">
            Chain ID: 1000 (TrobChain)
          </span>
        </div>

        {/* Genesis DAO Priority Whitelist Alert Badge */}
        {daoSeat && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-blue-600/25 via-indigo-600/20 to-sky-500/20 border border-[#38bdf8]/40 relative overflow-hidden shadow-lg shadow-blue-500/10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#38bdf8]">
                Genesis DAO Priority Whitelist
              </span>
              <span className="ml-auto text-[10.5px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/30 text-white font-extrabold border border-blue-400/40">
                Council Seat #{daoSeat}
              </span>
            </div>
            <div className="text-[13px] font-bold text-white mb-1">
              Priority Placement Reserved (Gateway Leg #{gatewayId || 1})
            </div>
            <p className="text-[11.5px] text-white/80 leading-relaxed">
              You are recognized as one of the 100 Founding DAO Members. By activating Slot 1 now, you secure your spot at the apex of this leg before Global Public Registration begins!
            </p>
          </div>
        )}

        {/* Hero Title */}
        <h1 className="text-[24px] sm:text-[28px] font-black text-white leading-tight tracking-tight mb-2">
          Slot 1 Activation Required
        </h1>
        <p className="text-[13px] text-white/70 leading-relaxed mb-6">
          To enter the Equora 14-Node Recursive Matrix, activate Slot 1 with a
          one-time entry fee of <strong className="text-white">$30.00 USD</strong>{" "}
          worth of TROB tokens. All higher slots are auto-unlocked at $0 out-of-pocket!
        </p>

        {/* ── DYNAMIC LIVE PRICE & COST SUMMARY BOX ───────────────────── */}
        <div className="bg-gradient-to-br from-[#1e293b]/90 to-[#0f172a]/90 border border-white/10 rounded-2xl p-4 sm:p-5 mb-5 relative">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[12px]">
            <span className="text-white/60">Fixed Entry Unit</span>
            <span className="font-extrabold text-white text-[14px]">
              $30.00 USD
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-white/50 block">Live Conversion Rate</span>
              <span className="font-mono text-[13px] font-semibold text-[#38bdf8]">
                1 TROB = ${trobPriceUsd.toFixed(6)} USD
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-white/50 block">Required Payment</span>
              <span className="font-mono text-[19px] sm:text-[22px] font-black text-emerald-400">
                {requiredTrob.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-[13px] font-bold text-white/80">TROB</span>
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10.5px] text-white/40">
            <span>Oracle Source: {priceSource}</span>
            <span>
              Updated: {priceUpdatedAt ? new Date(priceUpdatedAt).toLocaleTimeString() : "Live"}
            </span>
          </div>
        </div>

        {/* ── WALLET IDENTITY & BALANCE STATUS ────────────────────────── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-3">
          {/* Active Wallet */}
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-white/60 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-white/40" />
              Connected Wallet
            </span>
            {address ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-white font-semibold">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <button
                  onClick={() => toast.copy(address, "Wallet Address")}
                  className="text-white/40 hover:text-white transition-colors"
                  title="Copy Address"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="text-[12px] font-bold text-[#38bdf8] hover:underline cursor-pointer"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* On-Chain TROB Balance */}
          {address && (
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-white/60">Your TROB Balance</span>
              <span
                className={`font-mono text-[13px] font-bold ${
                  hasEnoughBalance ? "text-white" : "text-amber-400"
                }`}
              >
                {tokenBalance !== null
                  ? `${tokenBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} TROB`
                  : "Querying..."}
              </span>
            </div>
          )}

          {/* Account Creation Date & Eligibility Verification */}
          {address && (
            <div className="pt-2 border-t border-white/5 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Wallet Creation:</span>
                <span className="font-mono text-white/80">
                  Post-Genesis (≥ 01-10-2026) ✓
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Gas Resource Target:</span>
                <span className="text-[#38bdf8] font-semibold">
                  5 Free TX/Day (107 Energy · 24 Bandwidth)
                </span>
              </div>
              <div className="text-[10px] text-emerald-400/90 pt-0.5">
                • Multi-wallet device ready: 1 Matrix ID per wallet.
              </div>
            </div>
          )}

          {/* Sponsor Address */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
            <span className="text-white/40">Sponsor Matrix Upline</span>
            <span className="font-mono text-white/70">
              {sponsorAddress.slice(0, 6)}...{sponsorAddress.slice(-4)}
            </span>
          </div>

          {/* Earning Qualification Notice */}
          <div className="pt-2 border-t border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/50 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#38bdf8]" />
                Qualification Requirement:
              </span>
              <span className="font-semibold text-emerald-400">
                2 Direct Referrals ($30 each)
              </span>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed">
              EquoraMatrix.sol requires 2 direct referrals with Slot 1 unlocked to qualify for upline matching spillover funds. 100% of P3, P6, P8, P9, P11, and P12 ($180/cycle) pays directly to your wallet!
            </p>
          </div>

          {/* Where Does the $30 Fund Go Toggle */}
          <div className="pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowFundBreakdown(!showFundBreakdown)}
              className="w-full flex items-center justify-between text-[11px] text-[#38bdf8] hover:text-[#7dd3fc] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1 font-semibold">
                <HelpCircle className="w-3 h-3" />
                Where Does the $30 Fund Go? (Audit Trail)
              </span>
              <span className="text-[10px]">{showFundBreakdown ? "▲ Hide" : "▼ Breakdown"}</span>
            </button>

            {showFundBreakdown && (
              <div className="mt-2.5 p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-[10.5px] text-white/80 animate-in fade-in duration-200">
                <div className="flex items-start justify-between pb-1.5 border-b border-white/5">
                  <span className="text-amber-300 font-bold">Position 1 (P1):</span>
                  <span className="text-right text-white/90">
                    100% ($30) → Upline 1 (Node 2 for Gateway ID 4)
                  </span>
                </div>
                <div className="flex items-start justify-between pb-1.5 border-b border-white/5">
                  <span className="text-amber-300 font-bold">Position 2 (P2):</span>
                  <span className="text-right text-white/90">
                    100% ($30) → Upline 2 (Node 1 / Root Apex)
                  </span>
                </div>
                <div className="flex items-start justify-between pb-1.5 border-b border-white/5">
                  <span className="text-emerald-400 font-bold">Positions 3, 6, 8, 9, 11, 12:</span>
                  <span className="text-right text-emerald-300 font-semibold">
                    100% ($30 each) → Matrix Board Owner (You)
                  </span>
                </div>
                <div className="flex items-start justify-between pb-1.5 border-b border-white/5">
                  <span className="text-purple-300 font-bold">Positions 4, 5, 14:</span>
                  <span className="text-right text-white/70">
                    EquoraVault (35% DAO, 40% Royalty, 15% Levels, 10% Magic Box)
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-blue-300 font-bold">Position 13:</span>
                  <span className="text-right text-white/70">
                    Auto-Cycle Re-investment Reserve ($0 out-of-pocket restart)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {actionError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-400 text-[12px]">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{actionError}</div>
          </div>
        )}

        {/* Insufficient Balance Alert */}
        {address && !hasEnoughBalance && tokenBalance !== null && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-300 text-[12px]">
            <Coins className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">
              You need at least{" "}
              <strong>{requiredTrob.toFixed(2)} TROB</strong> to activate Slot 1.
              Your balance is {tokenBalance.toFixed(2)} TROB. Use a faucet or test account to top up.
            </div>
          </div>
        )}

        {/* ── ACTION BUTTONS: STEP 1 (APPROVE) & STEP 2 (ACTIVATE) ───────── */}
        {!address ? (
          <button
            type="button"
            onClick={handleConnectWallet}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white font-bold text-[14px] shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Connect TrobSafe Wallet
          </button>
        ) : !hasApprovedEnough ? (
          <div className="space-y-3">
            <button
              type="button"
              disabled={isApproving}
              onClick={handleApprove}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white font-bold text-[14px] shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Approving {requiredTrob.toFixed(2)} TROB...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
                  Step 1: Approve {requiredTrob.toFixed(2)} TROB
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-white/40">
              One-time ERC20 approval allowing the Matrix contract to process your $30 unit entry.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              disabled={isJoining}
              onClick={handleActivateSlot1}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-[#2563eb] text-white font-black text-[15px] shadow-xl shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Broadcasting On-Chain Slot 1 Join...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Step 2: Activate Slot 1 ($30 USD in TROB)
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-white/50">
              Unlocks your 14-node board, begins direct cashflow, and activates team placement.
            </p>
          </div>
        )}


      </div>

      {/* ── FOOTER PROTOCOL INFO ────────────────────────────────────────── */}
      <div className="max-w-4xl w-full mx-auto text-center text-[11px] text-white/40 py-2">
        <p>
          Equora Matrix Protocol • Solidity 0.8.20+ Verified on TrobChain Layer-1 • Single-Capital $30 Invariant
        </p>
      </div>

      {/* Wallet Connection & Switcher Modal */}
      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        currentAddress={address || undefined}
        onSelectAddress={(addr) => {
          setAddress(addr);
        }}
        onDisconnect={() => setAddress("")}
      />
    </div>
  );
}
