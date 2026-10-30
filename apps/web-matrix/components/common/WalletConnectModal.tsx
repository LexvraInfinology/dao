"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  LogOut,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Download,
  Zap,
  Flame,
  Activity,
  Award,
} from "lucide-react";
import {
  hasTrobSafeProvider,
  getIncompatibleForeignWallet,
  connectTrobSafe,
  normalizeTo0x,
  DUMMY_TEST_ACCOUNTS,
} from "@/lib/web3Wallet";
import {
  TROBSAFE_CHROME_STORE_URL,
  TROBSAFE_APK_URL,
  TROBSAFE_APP_STORE_URL,
  TROBSAFE_TESTFLIGHT_URL,
  isMobileDevice,
  isAndroidDevice,
  isIOSDevice,
  openInTrobSafeApp,
  triggerApkDownload,
  wakeUpExtension,
} from "@/lib/walletConnect";
import { EXPLORER_URL } from "@/lib/contracts";
import { matrixApi, WalletEligibility } from "@/lib/api";
import { useUserStore } from "@/lib/stores/useUserStore";
import { AndroidIcon } from "./AndroidIcon";
import { toast } from "@/lib/toast";
import { formatAddress, toTrobBase58, formatDateSafe } from "@/lib/format";
import joinedMembers from "@/lib/joinedMembers.json";

export interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress?: string;
  onSelectAddress: (address: string) => void;
  onDisconnect?: () => void;
}

type ModalStep = "detect" | "connect" | "connected_account" | "error";

export function WalletConnectModal({
  isOpen,
  onClose,
  currentAddress,
  onSelectAddress,
  onDisconnect,
}: WalletConnectModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<ModalStep>("detect");
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const [showDirectInput, setShowDirectInput] = useState(false);

  // Live on-chain eligibility details
  const [eligibilityData, setEligibilityData] = useState<WalletEligibility | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);

  const storeAddress = useUserStore((s) => s.address);
  const activeAddress = (currentAddress || storeAddress || "").toLowerCase();

  const hasTrobSafe = hasTrobSafeProvider();
  const foreignWallet = mounted && typeof window !== "undefined" ? getIncompatibleForeignWallet() : null;
  const isAndroid = mounted && typeof window !== "undefined" ? isAndroidDevice() : false;
  const isIOS = mounted && typeof window !== "undefined" ? isIOSDevice() : false;
  const isMobile = mounted && typeof window !== "undefined" ? isMobileDevice() : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update step based on current address
  useEffect(() => {
    if (!isOpen) return;
    if (activeAddress && activeAddress.startsWith("0x")) {
      setStep("connected_account");
      // Auto-fetch eligibility and account creation details
      setLoadingEligibility(true);
      matrixApi
        .getWalletEligibility(activeAddress)
        .then((data) => setEligibilityData(data))
        .catch(() => {})
        .finally(() => setLoadingEligibility(false));
    } else {
      setStep("detect");
      setEligibilityData(null);
    }
  }, [isOpen, activeAddress]);

  if (!isOpen || !mounted) return null;

  const handleCopy = async () => {
    if (!activeAddress) return;
    try {
      const b58 = toTrobBase58(activeAddress);
      await navigator.clipboard.writeText(b58);
      setCopied(true);
      toast.copy(b58, "Wallet Address");
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleConnectExtension = async () => {
    setLocalErr(null);
    setStep("connect");
    wakeUpExtension();
    try {
      const address = await connectTrobSafe();
      onSelectAddress(address);
      setStep("connected_account");
      toast.success(
        "TrobSafe Connected",
        `Active: ${formatAddress(address)}`
      );
      onClose();
    } catch (err: any) {
      setStep("error");
      setLocalErr(err.message || "Failed to connect TrobSafe wallet.");
      toast.error("TrobSafe Connection", err.message);
    }
  };

  const handleDisconnect = () => {
    onDisconnect?.();
    setStep("detect");
    setEligibilityData(null);
    toast.info("Wallet Disconnected", "You have disconnected from the Matrix.");
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customAddress.trim();
    if (!clean) return;
    const normalized = normalizeTo0x(clean);
    if (!normalized.startsWith("0x") || normalized.length !== 42) {
      toast.error("Invalid Address", "Must be a valid 42-character 0x hex address or Tron Base58 address.");
      return;
    }
    onSelectAddress(normalized);
    toast.success("Account Loaded", `Active: ${formatAddress(normalized)}`);
    setCustomAddress("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Background Dim Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 pointer-events-auto"
        onClick={onClose}
      />

      {/* Slide-out Sidebar Drawer */}
      <aside className="fixed top-0 right-0 h-full w-[430px] max-w-[94vw] bg-white text-slate-800 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.35)] flex flex-col justify-between p-5 sm:p-6 z-50 pointer-events-auto overflow-y-auto border-l border-slate-200 animate-in slide-in-from-right duration-300">
        <div className="space-y-5">
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0E62E4] to-[#3B82F6] p-0.5 shadow-sm flex items-center justify-center shrink-0">
                <img
                  src="/trobsafe-logo.webp"
                  alt="TrobSafe Wallet"
                  width={40}
                  height={40}
                  className="w-full h-full rounded-[14px] object-cover bg-white"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  TrobSafe Wallet
                </h3>
                <p className="text-[11px] font-semibold text-[#0E62E4] tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  TrobChain Layer-1 · Genesis Matrix
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── View: Connected Account with Auto-Fetched Eligibility ───── */}
          {step === "connected_account" && activeAddress && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-slate-50 border border-emerald-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Connected to Matrix
                    </span>
                  </div>
                  <a
                    href={`${EXPLORER_URL}/address/${toTrobBase58(activeAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-[#0E62E4] hover:underline flex items-center gap-1"
                  >
                    Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2 shadow-xs">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Address</div>
                    <div className="text-xs font-mono font-bold text-slate-900 truncate max-w-[250px]" title={toTrobBase58(activeAddress)}>
                      {toTrobBase58(activeAddress)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
                    title="Copy address"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Auto-Fetched Account Details & Eligibility Card */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0E62E4]" />
                    Account On-Chain Details
                  </span>
                  {loadingEligibility ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E62E4]" />
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                {/* Account Created Date */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-500">Creation Date:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatDateSafe(eligibilityData?.condition1?.creationDate, "Post-Genesis (Oct 2026)")}
                  </span>
                </div>

                {/* Eligibility Status */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-500">Matrix Eligibility:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Eligible (≥ 01-10-2026)
                  </span>
                </div>

                {/* Staked Resources (Gas Optimization for 5 tx/day) */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                    On-Chain Resource Stake (5 Free TX/Day)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 text-left">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" />
                        Energy Stake
                      </div>
                      <div className="text-[12px] font-bold font-mono text-slate-800 mt-0.5">
                        {eligibilityData?.condition2?.energy?.stakedTrob ?? 0} / 107 TROB
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200 text-left">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Activity className="w-3 h-3 text-blue-500" />
                        Bandwidth
                      </div>
                      <div className="text-[12px] font-bold font-mono text-slate-800 mt-0.5">
                        {eligibilityData?.condition2?.bandwidth?.stakedTrob ?? 0} / 24 TROB
                      </div>
                    </div>
                  </div>

                  {/* SR Vote */}
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      Official SR Vote:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {eligibilityData?.condition2?.srVote?.voted ? (
                        <span className="text-emerald-600 font-bold">Voted ✓</span>
                      ) : (
                        <span className="text-slate-400">Optional Gas Perk</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Device Multi-Wallet Notice */}
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                  <strong>Multi-Wallet Device Ready:</strong> One device can access multiple wallets. Each wallet registers its own unique Matrix ID.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.href = "/matrix";
                  }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0E62E4] hover:bg-[#0B52C4] shadow-[0_4px_14px_rgba(14,98,228,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Enter 14-Node Matrix</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect Wallet</span>
                </button>
              </div>
            </div>
          )}

          {/* ── View: Connecting in Progress ────────────────────────────── */}
          {step === "connect" && (
            <div className="py-12 flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-10 h-10 text-[#0E62E4] animate-spin" />
              <div>
                <p className="text-sm font-bold text-slate-900">Connecting TrobSafe Extension…</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[260px] leading-relaxed">
                  Please approve the authorization prompt in your TrobSafe extension window.
                </p>
              </div>
            </div>
          )}

          {/* ── View: Error / Notice ────────────────────────────────────── */}
          {step === "error" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <div className="font-bold text-amber-950 mb-0.5">Authorization Notice</div>
                  {localErr || "Please unlock your TrobSafe extension from the browser toolbar, then click Connect."}
                </div>
              </div>

              <button
                type="button"
                onClick={handleConnectExtension}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0E62E4] hover:bg-[#0B52C4] shadow-[0_4px_14px_rgba(14,98,228,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Retry Connection</span>
              </button>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-800">Quick Guide:</div>
                <div>1. Click the Extensions icon in your browser toolbar (top right).</div>
                <div>2. Open <b>TrobSafe Wallet</b> and enter your passcode.</div>
                <div>3. Click <b>Retry Connection</b> above.</div>
              </div>
            </div>
          )}

          {/* ── View: Primary Connection Options (Same as DAO) ─────────── */}
          {step === "detect" && (
            <div className="space-y-4">
              {/* Device Auto-Detection Badge */}
              <div className="flex items-center justify-between text-[11px] px-3.5 py-2 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0E62E4] animate-pulse" />
                  <span>Your Device / Platform:</span>
                </span>
                <span className="font-bold text-[#0E62E4] bg-white px-2 py-0.5 rounded-md border border-blue-100 shadow-2xs">
                  {isAndroid ? "Android (APK / In-App)" : isIOS ? "iOS (App Store / TestFlight)" : "Desktop (Chrome / Edge / Brave)"}
                </span>
              </div>

              {/* Incompatible Foreign Wallet Alert (MetaMask, Phantom, etc.) */}
              {foreignWallet && !hasTrobSafe && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{foreignWallet} Detected (Incompatible)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Equora Protocol operates exclusively on TrobChain Layer-1. {foreignWallet} cannot execute TrobChain transactions. Only the official <strong>TrobSafe Wallet</strong> is supported.
                  </p>
                </div>
              )}

              {/* Mobile Quick Launch Banner */}
              {isMobile && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0E62E4] via-[#1A6EF8] to-[#0B52C4] text-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span className="text-xs font-bold">TrobSafe App Installed?</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Auto-Connect
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 leading-snug">
                    Launch directly inside TrobSafe App DApp Browser for automatic wallet detection and native signature authorization.
                  </p>
                  <button
                    type="button"
                    onClick={() => openInTrobSafeApp("/matrix")}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-blue-50 text-[#0E62E4] font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in TrobSafe App</span>
                  </button>
                </div>
              )}

              {/* Option 1: Browser Extension (Recommended for PC/Laptop) */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-[#0E62E4]/40 transition-colors shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/20 flex items-center justify-center text-[#0E62E4] shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Browser Extension</div>
                      <div className="text-[11px] text-slate-500">Chrome, Edge & Brave</div>
                    </div>
                  </div>

                  {hasTrobSafe ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">Desktop</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConnectExtension}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0E62E4] hover:bg-[#0B52C4] shadow-[0_2px_10px_rgba(14,98,228,0.2)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Connect Extension</span>
                </button>

                <div className="text-center pt-0.5">
                  <a
                    href={TROBSAFE_CHROME_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-[#0E62E4] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Install or view in Chrome Web Store</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Option 2: Android Application (.APK & App Launch) */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-slate-300 transition-colors shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0">
                      <AndroidIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Android Application</div>
                      <div className="text-[11px] text-slate-500">Official .APK Package</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                    Android
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openInTrobSafeApp()}
                    className="w-full py-2 px-3 rounded-xl font-bold text-xs text-white bg-[#0E62E4] hover:bg-[#0B52C4] shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerApkDownload()}
                    className="w-full py-2 px-3 rounded-xl font-bold text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .APK</span>
                  </button>
                </div>
              </div>

              {/* Option 3: iOS Application (Apple App Store & TestFlight) */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-slate-300 transition-colors shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 p-1.5">
                      <img src="/icons/apple.svg" alt="Apple" className="w-4 h-4 object-contain fill-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">iOS Application</div>
                      <div className="text-[11px] text-slate-500">App Store & TestFlight</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-full">
                    iOS / iPadOS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openInTrobSafeApp()}
                    className="w-full py-2 px-3 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in App</span>
                  </button>

                  <a
                    href={TROBSAFE_APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl font-bold text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>App Store</span>
                  </a>
                </div>

                <div className="text-center pt-0.5">
                  <a
                    href={TROBSAFE_TESTFLIGHT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-slate-500 hover:text-[#0E62E4] hover:underline inline-flex items-center gap-1"
                  >
                    <span>TestFlight Beta Access</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>



              {/* Quick Select Operative Account (Real On-Chain Network) */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0E62E4]" />
                    Operative Accounts (14-Node Tree)
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    1-Click Load
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {joinedMembers.slice(0, 8).map((m) => (
                    <button
                      key={m.memberNumber}
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("equora_wallet_explicit_disconnect");
                        }
                        onSelectAddress(m.evm);
                        toast.success("Account Loaded", `Connected as #${m.memberNumber} ${m.name}`);
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 group-hover:text-[#0E62E4] truncate">
                          #{m.memberNumber} {m.memberNumber === 1 ? "Founder" : `Member ${m.memberNumber}`}
                        </span>
                        <span className={`text-[9px] px-1 rounded font-bold ${
                          m.memberNumber === 1 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {m.memberNumber === 1 ? "Root" : "Qual"}
                        </span>
                      </div>
                      <div className="text-[9.5px] font-mono text-slate-400 mt-0.5 truncate">
                        {m.base58.slice(0, 5)}...{m.base58.slice(-4)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 4: Manual address entry */}
              <div className="pt-1">
                {!showDirectInput ? (
                  <button
                    type="button"
                    onClick={() => setShowDirectInput(true)}
                    className="w-full text-center text-xs font-semibold text-slate-500 hover:text-[#0E62E4] transition-colors cursor-pointer py-1"
                  >
                    Enter custom TrobSafe address manually ↓
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <form onSubmit={handleCustomSubmit} className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-700">Manual Address</div>
                      <input
                        type="text"
                        placeholder="Enter Trobium (TX...) or 0x address"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0E62E4] font-mono shadow-xs"
                      />
                      <button
                        type="submit"
                        disabled={!customAddress.trim()}
                        className="w-full py-2 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Connect with Address
                      </button>
                    </form>

                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Sandbox Test Accounts
                      </div>
                      <div className="space-y-1">
                        {DUMMY_TEST_ACCOUNTS.map((acc) => (
                          <button
                            key={acc.address}
                            type="button"
                            onClick={() => {
                              onSelectAddress(acc.address);
                              toast.success("Sandbox Connected", `Active as ${acc.name}`);
                              onClose();
                            }}
                            className="w-full text-left p-2 rounded-lg bg-white border border-slate-200/80 hover:border-[#0E62E4]/40 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-800">{acc.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {acc.address.slice(0, 8)}...{acc.address.slice(-6)}
                              </div>
                            </div>
                            <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {acc.tier}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
