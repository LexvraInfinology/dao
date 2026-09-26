'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Loader2, ShieldCheck, Download, ExternalLink, Wallet, Smartphone } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (address: string) => void;
}

// ─── TrobSafe extension download link (points to the dist bundle in /public) ─
const TROBSAFE_DOWNLOAD_URL = '/trobsafe/install';
const TROBSAFE_LEARN_URL    = 'https://trobsafe.io';

type ModalStep = 'detect' | 'connect' | 'signing' | 'success' | 'error';

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  const wallet = useWallet();
  const auth   = useAuthContext();
  const [step, setStep]       = useState<ModalStep>('detect');
  const [localErr, setLocalErr] = useState<string | null>(null);

  // ── Sync modal step with wallet + auth state ───────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (wallet.status === 'detecting') {
      setStep('detect');
    } else if (wallet.status === 'not_installed') {
      setStep('detect');
    } else if (wallet.status === 'connected' && auth.isAuthenticated) {
      setStep('success');
    } else if (wallet.status === 'connected' && !auth.isAuthenticated) {
      setStep('signing');
    } else if (wallet.status === 'connecting') {
      setStep('connect');
    } else if (wallet.status === 'error') {
      setStep('error');
      setLocalErr(wallet.error);
    } else {
      // disconnected
      setStep(wallet.isInstalled ? 'connect' : 'detect');
    }
  }, [isOpen, wallet.status, auth.isAuthenticated, wallet.isInstalled, wallet.error]);

  // Auto-close on success after short delay
  useEffect(() => {
    if (step === 'success') {
      const addrStr = wallet.hexAddress || wallet.base58Address || wallet.address?.hex || wallet.address?.base58 || '';
      if (addrStr) onConnect?.(addrStr);
      const t = setTimeout(onClose, 1600);
      return () => clearTimeout(t);
    }
  }, [step, onClose, onConnect, wallet.hexAddress, wallet.base58Address, wallet.address]);

  if (!isOpen) return null;

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
    // Connected — now trigger SIWE sign-in
    setStep('signing');
    const ok = await auth.signIn();
    if (ok) {
      onConnect?.(addr.hex || addr.base58);
    } else {
      setStep('error');
      setLocalErr(auth.error ?? 'Signature rejected or failed.');
    }
  };

  const handleRetry = () => {
    setLocalErr(null);
    setStep(wallet.isInstalled ? 'connect' : 'detect');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#0B1220] border border-[#1E3A5F] p-6 shadow-2xl z-10">

        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            {/* TrobSafe logo-ish icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#155EEF] to-[#0A3DC4] flex items-center justify-center shadow-[0_4px_12px_rgba(21,94,239,0.4)]">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-inter">TrobSafe Wallet</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 'detect'   && 'Install to access EQUORA DAO'}
                {step === 'connect'  && 'Connecting…'}
                {step === 'signing'  && 'Waiting for signature…'}
                {step === 'success'  && 'Signed in successfully!'}
                {step === 'error'    && 'Something went wrong'}
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
          <div className="py-10 flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-10 h-10 text-[#155EEF] animate-spin" />
            <p className="text-sm text-slate-300">Detecting TrobSafe extension…</p>
          </div>
        )}

        {/* ── Step: not installed ───────────────────────────────────────── */}
        {step === 'detect' && wallet.status === 'not_installed' && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-300">TrobSafe not detected</p>
                <p className="text-xs text-amber-200/70 mt-1 leading-relaxed">
                  You need TrobSafe Wallet to access the EQUORA Genesis DAO. Download the browser extension or the Android APK below.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href={TROBSAFE_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_6px_16px_rgba(21,94,239,0.35)] flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install Browser Extension</span>
              </a>

              <a
                href="/downloads/trobsafe.apk"
                download="trobsafe.apk"
                className="w-full py-2.5 rounded-xl font-semibold text-xs text-[#93C5FD] hover:text-white bg-[#1E3A5F]/60 hover:bg-[#1E3A5F] border border-[#2E5A88] flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-[#38BDF8]" />
                <span>Download Android App (.APK)</span>
              </a>

              <a
                href={TROBSAFE_LEARN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Learn about TrobSafe</span>
              </a>
            </div>

            <p className="text-center text-[11px] text-slate-500">
              After installing, refresh this page and click &quot;Connect Wallet&quot; again.
            </p>
          </div>
        )}

        {/* ── Step: connect (installed, not connected yet) ─────────────── */}
        {step === 'connect' && (
          <div className="space-y-5">
            {/* Visual wallet card */}
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
                <span className="text-[10px] font-semibold text-emerald-400">Detected</span>
              </div>
            </div>

            <button
              onClick={handleConnect}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_20px_rgba(21,94,239,0.4)] flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Connect TrobSafe Wallet</span>
            </button>

            <div className="p-3 rounded-xl bg-[#155EEF]/10 border border-[#155EEF]/20 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#155EEF] shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                You&apos;ll be asked to sign a message to prove wallet ownership.
                No funds will be transferred during sign-in.
              </p>
            </div>
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
              <p className="text-sm font-bold text-white">Signed in!</p>
              {wallet.base58Address && (
                <p className="text-xs text-emerald-400 font-mono mt-1">
                  {wallet.base58Address.slice(0, 6)}…{wallet.base58Address.slice(-4)}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-2">Loading your Genesis Council seat…</p>
            </div>
          </div>
        )}

        {/* ── Step: error ───────────────────────────────────────────────── */}
        {step === 'error' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-300">Connection failed</p>
                <p className="text-xs text-red-200/70 mt-1 leading-relaxed">
                  {localErr ?? 'An unexpected error occurred. Please try again.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] flex items-center justify-center gap-2 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
