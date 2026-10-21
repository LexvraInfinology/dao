'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy,
  X,
  KeyRound,
  QrCode,
  Smartphone,
  Lock,
} from 'lucide-react';

export default function TwoFactorCard() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [code, setCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);

  const SECRET_KEY = 'EQRA-7X9K-2M4P-8W1Q';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('equora_2fa_enabled');
    if (stored === 'true') {
      setIs2FAEnabled(true);
    }
  }, []);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(SECRET_KEY);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleVerifyAndEnable = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) {
      setVerifyError('Please enter a valid 6-digit verification code.');
      return;
    }

    setVerifyError('');
    setVerifySuccess(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('equora_2fa_enabled', 'true');
    }

    setTimeout(() => {
      setIs2FAEnabled(true);
      setVerifySuccess(false);
      setIsModalOpen(false);
      setCode('');
    }, 1000);
  };

  const handleDisable = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('equora_2fa_enabled', 'false');
    }
    setIs2FAEnabled(false);
    setIsDisableModalOpen(false);
  };

  return (
    <>
      {/* ================= DESKTOP VIEW (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-[#071A4A]">
            Two-Factor Authentication (2FA)
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cryptographic secondary confirmation for high-value treasury operations.
          </p>
        </div>

        {/* Row Container */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
          {/* Left Info */}
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              is2FAEnabled ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#EFF6FF] text-[#155EEF]'
            }`}>
              {is2FAEnabled ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
                2FA Security Status
              </h4>
              <div className="text-xs text-[#64748B] mt-0.5">
                {is2FAEnabled
                  ? 'Authenticator (TOTP) & Session Guard Active'
                  : 'Add an extra cryptographic defense layer to your account'}
              </div>
            </div>
          </div>

          {/* Right Action & Status */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              is2FAEnabled
                ? 'bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669]'
                : 'bg-[#FEF2F2] border border-[#FECACA]/60 text-[#DC2626]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${is2FAEnabled ? 'bg-[#059669]' : 'bg-[#DC2626]'}`} />
              <span>{is2FAEnabled ? 'Protected' : 'Not Enabled'}</span>
            </span>

            {is2FAEnabled ? (
              <button
                onClick={() => setIsDisableModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FEE2E2]/60 border border-[#FECACA]/60 text-[#DC2626] hover:bg-red-100/70 text-xs font-semibold transition-colors cursor-pointer"
              >
                Disable
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Enable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-xs font-jakarta space-y-3.5">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-[#071A4A]">
            Two-Factor Authentication (2FA)
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cryptographic secondary confirmation for high-value DAO activity.
          </p>
        </div>

        {/* Row Box */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              is2FAEnabled ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#EFF6FF] text-[#155EEF]'
            }`}>
              {is2FAEnabled ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#071A4A]">
                2FA Status
              </h4>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                {is2FAEnabled ? 'TOTP Active' : 'Not enabled'}
              </div>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            is2FAEnabled
              ? 'bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669]'
              : 'bg-[#FEF2F2] border border-[#FECACA]/60 text-[#DC2626]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${is2FAEnabled ? 'bg-[#059669]' : 'bg-[#DC2626]'}`} />
            <span>{is2FAEnabled ? 'Protected' : 'Not Enabled'}</span>
          </span>
        </div>

        {/* Bottom Link */}
        <div className="flex justify-end pt-1">
          {is2FAEnabled ? (
            <button
              onClick={() => setIsDisableModalOpen(true)}
              className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
            >
              Disable 2FA
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-[#155EEF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Enable 2FA Protection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ================= 2FA SETUP MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2ECF9] shadow-[0_25px_60px_rgba(15,23,42,0.25)] p-6 sm:p-7 space-y-5 font-jakarta">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#071A4A]">Setup Two-Factor Authentication</h3>
                  <p className="text-xs text-[#64748B]">Google Authenticator, Authy, or 1Password</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Secret Key Display */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2ECF9] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span className="font-semibold text-[#071A4A]">Manual Entry Key</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="text-[#155EEF] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-mono text-sm font-bold tracking-wider text-[#071A4A] bg-white p-2.5 rounded-xl border border-[#E2ECF9] text-center">
                {SECRET_KEY}
              </p>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Add this key to your authenticator app to generate time-based one-time authentication codes (TOTP).
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleVerifyAndEnable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#071A4A] mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setVerifyError('');
                  }}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  className="w-full text-center tracking-widest text-lg font-mono font-bold px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[#071A4A] focus:outline-hidden focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/10 transition-all"
                />
                {verifyError && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">{verifyError}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F1F5F9] text-[#475569] font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#124bbf] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {verifySuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>2FA Activated!</span>
                    </>
                  ) : (
                    <span>Verify & Activate</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 2FA DISABLE CONFIRMATION MODAL ================= */}
      {isDisableModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-[#FECACA] shadow-[0_25px_60px_rgba(15,23,42,0.25)] p-6 space-y-4 font-jakarta">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#991B1B]">Disable 2FA Protection?</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Disabling Two-Factor Authentication lowers your account protection against unauthorized transactions.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsDisableModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F1F5F9] text-[#475569] font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Keep Enabled
              </button>
              <button
                onClick={handleDisable}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Yes, Disable
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
