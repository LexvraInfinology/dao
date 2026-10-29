'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Smartphone,
  LogOut,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Download,
  Zap,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { AndroidIcon } from '@/components/ui/AndroidIcon';
import {
  TROBSAFE_CHROME_STORE_URL,
  TROBSAFE_APK_URL,
  TROBSAFE_APP_STORE_URL,
  TROBSAFE_TESTFLIGHT_URL,
  triggerApkDownload,
  wakeUpExtension,
  isMobileDevice,
  openInTrobSafeApp,
} from '@/utils/walletConnect';

export interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (address: string) => void;
}

type ModalStep = 'detect' | 'connect' | 'signing' | 'success' | 'connected_account' | 'error';

/**
 * Professional WalletSidebar
 * Sleek, modern slide-out drawer matching Trobium & Equora design systems.
 */
export const WalletSidebar: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [mounted, setMounted] = useState(false);
  const wallet = useWallet();
  const auth   = useAuthContext();
  const [step, setStep]         = useState<ModalStep>('detect');
  const [localErr, setLocalErr]   = useState<string | null>(null);

  const [customAddress, setCustomAddress] = useState('');
  const [showDirectInput, setShowDirectInput] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync step with wallet state
  useEffect(() => {
    if (!isOpen) return;

    if (wallet.isConnected) {
      setStep('connected_account');
    } else if (wallet.status === 'detecting') {
      setStep('detect');
    } else if (wallet.status === 'connecting') {
      setStep('connect');
    } else if (wallet.status === 'error') {
      setStep('error');
      setLocalErr(wallet.error);
    } else {
      setStep(wallet.isInstalled ? 'connect' : 'detect');
    }
  }, [isOpen, wallet.isConnected, wallet.status, wallet.isInstalled, wallet.error]);

  // Auto-close on connect success
  useEffect(() => {
    if (step === 'success') {
      const addrStr = wallet.hexAddress || wallet.base58Address || wallet.address?.hex || wallet.address?.base58 || '';
      if (addrStr) onConnect?.(addrStr);
      const t = setTimeout(onClose, 1200);
      return () => clearTimeout(t);
    }
  }, [step, onClose, onConnect, wallet.hexAddress, wallet.base58Address, wallet.address]);

  const activeAddr =
    wallet.base58Address ||
    wallet.hexAddress ||
    wallet.address?.base58 ||
    wallet.address?.hex ||
    auth.user?.address ||
    '';

  const shortAddr = activeAddr.length > 10
    ? `${activeAddr.slice(0, 6)}…${activeAddr.slice(-4)}`
    : activeAddr;

  const handleCopy = async () => {
    if (!activeAddr) return;
    try {
      await navigator.clipboard.writeText(activeAddr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDisconnect = () => {
    wallet.disconnect();
    auth.signOut();
    try {
      localStorage.setItem('equora_wallet_explicit_disconnect', 'true');
      localStorage.removeItem('trobsafe_address');
      localStorage.removeItem('equora_auth_address');
      localStorage.removeItem('equora_jwt');
    } catch {}
    setStep(wallet.isInstalled ? 'connect' : 'detect');
    onClose();
  };

  const handleConnect = async () => {
    setLocalErr(null);
    setStep('connect');
    wakeUpExtension();
    const addr = await wallet.connect();
    if (!addr) {
      setStep('error');
      setLocalErr(wallet.error ?? 'Please unlock your TrobSafe extension from the browser toolbar.');
      return;
    }
    setStep('success');
    const addrStr = addr.base58 || addr.hex || '';
    onConnect?.(addrStr);
  };

  const handleConnectCustom = (addrToUse?: string) => {
    const raw = (addrToUse || customAddress).trim();
    if (!raw) return;
    setLocalErr(null);
    const addr = wallet.connectWithAddress(raw);
    setStep('success');
    const addrStr = addr.base58 || addr.hex || raw;
    onConnect?.(addrStr);
  };

  const handleDownloadApkClick = () => {
    triggerApkDownload();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden pointer-events-none ${isOpen ? '' : 'invisible'}`}>
      {/* Background Dim Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/35 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-[410px] max-w-[94vw] bg-white text-slate-800 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] flex flex-col justify-between p-6 z-50 transform transition-transform duration-300 ease-out pointer-events-auto overflow-y-auto select-none border-l border-slate-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="space-y-6">
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
                    // Fallback to shield icon if image fails to render
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight leading-tight">
                  TrobSafe Wallet
                </h3>
                <p className="text-[11px] font-semibold text-[#0E62E4] tracking-wide">
                  Trobium L1 · Official Genesis Wallet
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

          {/* ── View: Connected Account ──────────────────────────────────── */}
          {step === 'connected_account' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Connected to Trobium
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2 shadow-xs">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Address</div>
                    <div className="text-xs font-mono font-bold text-slate-900 truncate max-w-[240px]" title={activeAddr}>
                      {activeAddr}
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

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.href = '/dao';
                  }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0E62E4] hover:bg-[#0B52C4] shadow-[0_4px_14px_rgba(14,98,228,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Enter Genesis DAO</span>
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
          {step === 'connect' && (
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

          {/* ── View: Notice / Unlock prompt ────────────────────────────── */}
          {step === 'error' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <div className="font-bold text-amber-950 mb-0.5">Authorization Notice</div>
                  {localErr || 'Please unlock your TrobSafe extension from the browser toolbar, then click Connect.'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleConnect}
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

          {/* ── View: Professional Connection Options ───────────────────── */}
          {step === 'detect' && (
            <div className="space-y-4">
              {/* ── Mobile Quick Launch Banner ────────────────────────────── */}
              {isMobileDevice() && (
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
                    onClick={() => openInTrobSafeApp()}
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

                  {wallet.isInstalled ? (
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
                  onClick={handleConnect}
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
                    onClick={handleDownloadApkClick}
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

              {/* Option 4: Manual address entry */}
              <div className="pt-2">
                {!showDirectInput ? (
                  <button
                    type="button"
                    onClick={() => setShowDirectInput(true)}
                    className="w-full text-center text-xs font-semibold text-slate-500 hover:text-[#0E62E4] transition-colors cursor-pointer py-1"
                  >
                    Enter Trobium address manually ↓
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-[11px] font-bold text-slate-700">Manual Address</div>
                    <input
                      type="text"
                      placeholder="Enter Trobium (TX...) or 0x address"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0E62E4] font-mono shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleConnectCustom()}
                      disabled={!customAddress.trim()}
                      className="w-full py-2 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Connect with Address
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </aside>
    </div>
  );
};

// Backwards-compatible alias for existing imports
export const WalletModal = WalletSidebar;
