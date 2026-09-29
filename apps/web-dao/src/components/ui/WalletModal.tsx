'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Download,
  ExternalLink,
  Wallet,
  Smartphone,
  LogOut,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { AndroidIcon } from '@/components/ui/AndroidIcon';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (address: string) => void;
}

// ─── TrobSafe extension download link ─────────────────────────────────────────
const TROBSAFE_DOWNLOAD_URL = 'https://trobium.com/download/';
const TROBSAFE_APK_URL      = '/downloads/trobsafe.apk';

type ModalStep = 'detect' | 'connect' | 'signing' | 'success' | 'connected_account' | 'error';

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  const wallet = useWallet();
  const auth   = useAuthContext();
  const [step, setStep]       = useState<ModalStep>('detect');
  const [localErr, setLocalErr] = useState<string | null>(null);

  const [customAddress, setCustomAddress] = useState('');
  const [showDirectInput, setShowDirectInput] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Sync modal step with wallet + auth state ───────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (wallet.isConnected) {
      setStep('connected_account');
    } else if (wallet.status === 'detecting') {
      setStep('detect');
    } else if (wallet.status === 'not_installed') {
      setStep('detect');
    } else if (wallet.status === 'connecting') {
      setStep('connect');
    } else if (wallet.status === 'error') {
      setStep('error');
      setLocalErr(wallet.error);
    } else {
      // disconnected
      setStep(wallet.isInstalled ? 'connect' : 'detect');
    }
  }, [isOpen, wallet.isConnected, wallet.status, wallet.isInstalled, wallet.error]);

  // Auto-close on new connect success after short delay
  useEffect(() => {
    if (step === 'success') {
      const addrStr = wallet.hexAddress || wallet.base58Address || wallet.address?.hex || wallet.address?.base58 || '';
      if (addrStr) onConnect?.(addrStr);
      const t = setTimeout(onClose, 1200);
      return () => clearTimeout(t);
    }
  }, [step, onClose, onConnect, wallet.hexAddress, wallet.base58Address, wallet.address]);

  if (!isOpen) return null;

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
    } catch {
      /* ignore */
    }
  };

  const handleDisconnect = () => {
    wallet.disconnect();
    auth.signOut();
    try {
      localStorage.removeItem('trobsafe_address');
      localStorage.removeItem('equora_auth_address');
      localStorage.removeItem('equora_jwt');
      localStorage.removeItem('equora_dao_preview');
      localStorage.removeItem('equora_dev_mode');
    } catch {
      /* ignore */
    }
    setStep(wallet.isInstalled ? 'connect' : 'detect');
    onClose();
  };

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleConnect = async () => {
    setLocalErr(null);
    setStep('connect');
    const addr = await wallet.connect();
    if (!addr) {
      setStep('error');
      setLocalErr(wallet.error ?? 'Failed to connect. Please try again.');
      return;
    }
    // Connected successfully via TrobSafe
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

  const handleRetry = () => {
    setLocalErr(null);
    setStep(wallet.isInstalled ? 'connect' : 'detect');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#0B1220] border border-[#1E3A5F] p-5 sm:p-6 shadow-2xl z-10 animate-fadeIn">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            {/* TrobSafe logo-ish icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#155EEF] to-[#0A3DC4] flex items-center justify-center shadow-[0_4px_12px_rgba(21,94,239,0.4)]">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-inter">TrobSafe Wallet</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 'detect'   && 'Connect to access EQUORA Genesis DAO'}
                {step === 'connect'  && 'Connecting to your wallet…'}
                {step === 'signing'  && 'Waiting for signature…'}
                {step === 'success'  && 'Wallet connected successfully!'}
                {step === 'error'    && 'Connection options'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Step: detecting ──────────────────────────────────────────── */}
        {step === 'detect' && wallet.status === 'detecting' && (
          <div className="py-8 flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-10 h-10 text-[#155EEF] animate-spin" />
            <p className="text-sm text-slate-300">Detecting TrobSafe extension…</p>
          </div>
        )}

        {/* ── Step: connected_account ───────────────────────────────────── */}
        {step === 'connected_account' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#0F1F40] to-[#0B1830] border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Connected Wallet
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Trobium L1</span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400">Active Address</div>
                  <div className="text-xs font-mono font-bold text-white truncate max-w-[240px]">
                    {activeAddr}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
                  title="Copy address"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Connected via TrobSafe extension & registered in Equora Genesis DAO.
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.href = '/dao';
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] transition-all shadow-[0_4px_14px_rgba(21,94,239,0.3)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter DAO Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDisconnect}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out & Disconnect Wallet</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step: not installed / detect fallback ────────────────────── */}
        {step === 'detect' && wallet.status !== 'detecting' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#0F1F40] to-[#0B1830] border border-[#1E3A5F] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#155EEF]/20 border border-[#155EEF]/40 flex items-center justify-center mx-auto text-[#38BDF8]">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white font-inter">TrobSafe Wallet Required</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  TrobSafe extension or Android APK is required to sign transactions and verify Genesis Council membership.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="/downloads/trobsafe.apk"
                  download="trobsafe.apk"
                  className="py-2.5 px-2.5 rounded-xl bg-[#155EEF] hover:bg-[#004EEB] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(21,94,239,0.3)] cursor-pointer"
                >
                  <AndroidIcon className="w-4 h-4 fill-white" />
                  <span>Download APK</span>
                </a>
                <a
                  href="https://trobium.com/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-2.5 rounded-xl bg-[#1E293B] hover:bg-[#2A3B54] border border-[#334155] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Get Extension</span>
                </a>
              </div>

              {/* Dev Mode direct bypass */}
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.setItem('equora_dao_preview', 'true');
                    localStorage.setItem('equora_dev_mode', 'true');
                  } catch { /* ignore */ }
                  onClose();
                  window.location.href = '/dao?dev=1';
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>⚡ Dev Mode: Enter DAO without Wallet</span>
              </button>
            </div>

            {/* Custom address input toggle */}
            {!showDirectInput ? (
              <button
                onClick={() => setShowDirectInput(true)}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors text-center border-t border-white/10 pt-3 cursor-pointer"
              >
                Or enter Trobium address manually ↓
              </button>
            ) : (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Enter Trobium (T...) or 0x address"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1E3A5F] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#155EEF] font-mono"
                />
                <button
                  onClick={() => handleConnectCustom()}
                  disabled={!customAddress.trim()}
                  className="w-full py-2 rounded-xl bg-[#155EEF] hover:bg-[#004EEB] disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                >
                  Connect with Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step: connect (installed, not connected yet) ─────────────── */}
        {step === 'connect' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#0F1F40] to-[#0B1830] border border-[#1E3A5F] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#155EEF] to-[#0A3DC4] flex items-center justify-center shadow-[0_4px_16px_rgba(21,94,239,0.4)] shrink-0">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">TrobSafe Wallet</p>
                <p className="text-xs text-slate-400 mt-0.5">Secure · Trobium Native · EIP-4361</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-400">Ready</span>
              </div>
            </div>

            <button
              onClick={handleConnect}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_20px_rgba(21,94,239,0.4)] flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Connect TrobSafe Extension</span>
            </button>
          </div>
        )}

        {/* ── Step: waiting for signature ──────────────────────────────── */}
        {step === 'signing' && (
          <div className="py-8 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-[#155EEF]/10 border border-[#155EEF]/30 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#155EEF] animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Waiting for your signature</p>
              <p className="text-xs text-slate-400 mt-1.5 max-w-[280px] leading-relaxed">
                Check your TrobSafe extension and approve the sign-in request.
              </p>
            </div>
            {auth.status === 'verifying' && (
              <p className="text-xs text-[#155EEF] font-medium animate-pulse">Verifying signature…</p>
            )}
          </div>
        )}

        {/* ── Step: success ─────────────────────────────────────────────── */}
        {step === 'success' && (
          <div className="py-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Connected Successfully!</p>
              {(wallet.base58Address || wallet.hexAddress) && (
                <p className="text-xs text-emerald-400 font-mono mt-1">
                  {wallet.base58Address
                    ? `${wallet.base58Address.slice(0, 6)}…${wallet.base58Address.slice(-4)}`
                    : `${wallet.hexAddress?.slice(0, 8)}…`}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-2">Updating DAO Dashboard state…</p>
            </div>
          </div>
        )}

        {/* ── Step: error ───────────────────────────────────────────────── */}
        {step === 'error' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-300">Extension Request Notice</p>
                <p className="text-xs text-red-200/70 mt-1 leading-relaxed">
                  {localErr ?? 'Please unlock your TrobSafe extension or choose a direct connection option below.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleRetry}
                className="py-2.5 rounded-xl font-semibold text-xs text-white bg-[#155EEF] hover:bg-[#004EEB] flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Retry Extension</span>
              </button>
              <a
                href="/downloads/trobsafe.apk"
                download="trobsafe.apk"
                className="py-2.5 rounded-xl font-semibold text-xs text-sky-300 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-700/50 flex items-center justify-center gap-1.5 transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Get Android APK</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
