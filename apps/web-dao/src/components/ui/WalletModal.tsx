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
  Zap,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { AndroidIcon } from '@/components/ui/AndroidIcon';
import {
  TROBSAFE_CHROME_STORE_URL,
  TROBSAFE_APK_URL,
  wakeUpExtension,
} from '@/utils/walletConnect';

export interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (address: string) => void;
}

type ModalStep = 'detect' | 'connect' | 'signing' | 'success' | 'connected_account' | 'error';

/**
 * WalletSidebar (formerly WalletModal)
 * Renders as a sleek, non-intrusive right-hand slide-out sidebar drawer.
 */
export const WalletSidebar: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  const wallet = useWallet();
  const auth   = useAuthContext();
  const [step, setStep]       = useState<ModalStep>('detect');
  const [localErr, setLocalErr] = useState<string | null>(null);

  const [customAddress, setCustomAddress] = useState('');
  const [showDirectInput, setShowDirectInput] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Sync step with wallet + auth state ──────────────────────────────────
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
      // disconnected or ready
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

  const handleRetry = () => {
    setLocalErr(null);
    handleConnect();
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden pointer-events-none ${isOpen ? '' : 'invisible'}`}>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide-out Wallet Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-[380px] max-w-[92vw] bg-[#0A1124] border-l border-[#1E3A5F] shadow-[-12px_0_40px_rgba(0,0,0,0.65)] flex flex-col justify-between p-5 sm:p-6 z-50 transform transition-transform duration-300 ease-out pointer-events-auto overflow-y-auto select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0E62E4] flex items-center justify-center shadow-[0_2px_12px_rgba(14,98,228,0.4)]">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-sans tracking-tight">TrobSafe Wallet</h3>
                <p className="text-[11px] text-[#60A5FA] font-medium">Trobium L1 · Genesis DAO</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Status: Connected ────────────────────────────────────── */}
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
                    <div className="text-xs font-mono font-bold text-white truncate max-w-[210px]">
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
                  Connected via TrobSafe extension & verified on Equora Genesis DAO.
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.href = '/dao';
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0E62E4] hover:bg-[#0B52C4] transition-all shadow-[0_4px_14px_rgba(14,98,228,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Enter DAO Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full py-2 px-4 rounded-xl font-medium text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out & Disconnect</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Status: Waiting / Connecting ─────────────────────────── */}
          {step === 'connect' && (
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-10 h-10 text-[#0E62E4] animate-spin" />
              <div>
                <p className="text-sm font-bold text-white">Opening TrobSafe Extension…</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[260px] leading-relaxed">
                  Please approve the connection prompt in your TrobSafe extension popup or sidebar window.
                </p>
              </div>
            </div>
          )}

          {/* ── Status: Error / Notice / Lock Notice ───────────────────── */}
          {step === 'error' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-300">TrobSafe Wallet Notice</p>
                  <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                    {localErr || 'Please unlock your TrobSafe extension from the browser toolbar, then click Connect.'}
                  </p>
                </div>
              </div>

              {/* Retry button */}
              <button
                type="button"
                onClick={handleRetry}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0E62E4] hover:bg-[#0B52C4] shadow-[0_4px_16px_rgba(14,98,228,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Wake Up / Re-Connect</span>
              </button>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1">
                <div className="font-semibold text-slate-200">💡 Quick Guide:</div>
                <div>1. Click the 🧩 Extensions icon in your browser toolbar.</div>
                <div>2. Pin and unlock <b>TrobSafe Wallet</b> with your passcode.</div>
                <div>3. Click <b>Wake Up / Re-Connect</b> above.</div>
              </div>
            </div>
          )}

          {/* ── Status: Detect / Ready to Connect ────────────────────── */}
          {step === 'detect' && (
            <div className="space-y-4">
              {wallet.isInstalled ? (
                /* Extension is installed and ready */
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300">TrobSafe Extension Ready</div>
                      <div className="text-[10px] text-slate-400">Detected in your browser</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConnect}
                    className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0E62E4] hover:bg-[#0B52C4] shadow-[0_4px_16px_rgba(14,98,228,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Connect TrobSafe Extension</span>
                  </button>
                </div>
              ) : (
                /* Extension probe */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0F1F40] to-[#0B1830] border border-[#1E3A5F] space-y-2">
                    <p className="text-xs font-bold text-white">TrobSafe Extension</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Connect your installed TrobSafe extension to access Council voting, seat claim, and payouts.
                    </p>

                    <button
                      type="button"
                      onClick={handleConnect}
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-[#0E62E4] hover:bg-[#0B52C4] shadow-[0_2px_10px_rgba(14,98,228,0.3)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>⚡ Open / Wake Up Extension</span>
                    </button>
                  </div>

                  {/* Install Links */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={TROBSAFE_CHROME_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-[#60A5FA]" />
                      <span>Chrome Store</span>
                    </a>
                    <a
                      href={TROBSAFE_APK_URL}
                      download="trobsafe.apk"
                      className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <AndroidIcon className="w-3.5 h-3.5 fill-slate-300" />
                      <span>Get APK</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Direct Address Input Toggle ──────────────────────────── */}
          {step !== 'connected_account' && (
            <div className="mt-4 pt-3 border-t border-white/10">
              {!showDirectInput ? (
                <button
                  type="button"
                  onClick={() => setShowDirectInput(true)}
                  className="w-full py-1 text-[11px] text-slate-400 hover:text-white transition-colors text-center cursor-pointer"
                >
                  Enter Trobium address manually ↓
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter Trobium (T...) or 0x address"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1E3A5F] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0E62E4] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleConnectCustom()}
                    disabled={!customAddress.trim()}
                    className="w-full py-2 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Connect with Address
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Dev Mode bypass */}
        <div className="pt-4 border-t border-white/10">
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
            className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>⚡ Enter DAO Dashboard (Dev Mode)</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

// Backwards-compatible alias for existing imports
export const WalletModal = WalletSidebar;
