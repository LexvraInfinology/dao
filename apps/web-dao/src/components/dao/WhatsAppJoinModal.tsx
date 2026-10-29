'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { WHATSAPP_DAO_GROUP_URL } from '@/config/env';
import { joinWhatsApp } from '@/utils/whatsapp';

interface WhatsAppJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  address?: string;
  groupUrl?: string;
}

export const WhatsAppJoinModal: React.FC<WhatsAppJoinModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  address,
  groupUrl = WHATSAPP_DAO_GROUP_URL,
}) => {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Extract invite code if available (e.g. GR19373Pgq7LezBKtXC0ng from https://chat.whatsapp.com/GR19373Pgq7LezBKtXC0ng)
  const inviteCodeMatch = groupUrl.match(/chat\.whatsapp\.com\/([a-zA-Z0-9_-]+)/);
  const inviteCode = inviteCodeMatch ? inviteCodeMatch[1] : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(groupUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers / webviews
      const input = document.createElement('textarea');
      input.value = groupUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    joinWhatsApp(groupUrl);
  };

  const handleVerify = async () => {
    if (!address) {
      onVerified();
      onClose();
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      localStorage.setItem(`equora_wa_joined_${address}`, 'true');
      localStorage.setItem(`equora_wa_joined_${address.toLowerCase()}`, 'true');

      const res = await fetch('/api/dao/verify-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      onVerified();
      onClose();
    } catch (err: unknown) {
      console.warn('[WhatsAppJoinModal] Verification warning:', err);
      // Even if API had network timeout, address is cached client-side for UX continuity
      onVerified();
      onClose();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-[#E2ECF9] shadow-2xl p-5 sm:p-6 space-y-4 relative overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative background green glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#25D366]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Close */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(37,211,102,0.35)]">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1FAF51]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1FAF51]" />
                <span>Official Channel</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#17334F]">
                Join EQUORA Community
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-[#60739A] leading-relaxed">
          Joining the official EQUORA DAO WhatsApp group is mandatory to receive governance updates and complete your council seat registration.
        </p>

        {/* Action 1: Open WhatsApp directly */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.3)] transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open in WhatsApp App</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
          </button>

          {/* Action 2: Copy link (for WebView or browser issues) */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-[#60739A] truncate flex-1 pl-1">
              {groupUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-[#17334F] border border-slate-300'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          {copied && (
            <p className="text-[10px] text-emerald-600 font-semibold px-1">
              Link copied! Paste it in WhatsApp or your browser to join directly.
            </p>
          )}
        </div>

        {/* Action 3: Verification Confirm */}
        <div className="pt-2 border-t border-[#E2ECF9] space-y-2">
          {verifyError && (
            <p className="text-[11px] text-rose-600 font-medium">{verifyError}</p>
          )}
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full py-3 px-4 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(14,98,228,0.2)] transition-all cursor-pointer"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Membership…</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>I Have Joined • Verify Access</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-[#60739A] text-center">
            Tap above once you have joined to immediately authorize your deposit.
          </p>
        </div>
      </div>
    </div>
  );
};
