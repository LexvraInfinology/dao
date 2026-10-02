'use client';
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Coins,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  LogOut,
  X,
  Check,
  Download,
  Smartphone,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useDaoMember, useTrobPrice } from '@/hooks/useApi';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { getActiveDaoAddress } from '@/utils/trobAddress';

import { WHATSAPP_DAO_GROUP_URL } from '@/config/env';

const DAO_CONTRACT_ADDRESS = getActiveDaoAddress();
export { WHATSAPP_DAO_GROUP_URL };

export const DaoOnboardingModal: React.FC = () => {
  const wallet = useWallet();
  const auth = useAuthContext();
  const activeAddress = wallet.base58Address || wallet.hexAddress || auth.user?.address || '';

  const { data: memberData, loading: memberLoading, refetch: refetchMember } =
    useDaoMember(activeAddress);
  const { data: priceData } = useTrobPrice(30_000);

  const [hasDeposited, setHasDeposited] = useState<boolean>(false);
  const [hasJoinedWhatsApp, setHasJoinedWhatsApp] = useState<boolean>(false);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Check stored onboarding state for this address
  useEffect(() => {
    if (!activeAddress || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(`equora_onboarded_${activeAddress}`);
      const waJoined =
        localStorage.getItem(`equora_wa_joined_${activeAddress}`) ||
        localStorage.getItem(`equora_wa_joined_${activeAddress.toLowerCase()}`);
      if (waJoined === 'true') {
        setHasJoinedWhatsApp(true);
      }
      if (stored === 'true' && waJoined === 'true') {
        setCompleted(true);
      }
    } catch {
      /* ignore */
    }
  }, [activeAddress]);

  // Sync if memberData confirms membership or clear stale keys if not
  useEffect(() => {
    if (!activeAddress || typeof window === 'undefined') return;
    if (memberData?.isMember || Number(memberData?.position) > 0) {
      setHasDeposited(true);
      try {
        localStorage.setItem(`equora_dao_member_${activeAddress.toLowerCase()}`, 'true');
      } catch {}
    } else if (!memberLoading && memberData && !memberData.isMember) {
      setHasDeposited(false);
      setCompleted(false);
      try {
        localStorage.removeItem(`equora_dao_member_${activeAddress.toLowerCase()}`);
        localStorage.removeItem(`equora_onboarded_${activeAddress}`);
        localStorage.removeItem(`equora_wa_joined_${activeAddress}`);
        localStorage.removeItem(`equora_wa_joined_${activeAddress.toLowerCase()}`);
      } catch {}
    }
  }, [memberData, memberLoading, activeAddress]);

  // If already dismissed, do not show
  if (isDismissed) {
    return null;
  }

  // If already completed onboarding and verified as member, do not show
  if (completed && (memberData?.isMember || Number(memberData?.position) > 0)) {
    return null;
  }

  // If user is already verified on-chain and registered as member, grant full access immediately
  const isAlreadyMember = Boolean(
    memberData?.isMember === true || Number(memberData?.position) > 0
  );
  if (isAlreadyMember) {
    return null;
  }

  // If memberData is still loading initial state, do not flicker modal
  if (memberLoading && !memberData) {
    return null;
  }

  const handleSignOut = () => {
    setIsDismissed(true);
    auth.signOut();
    wallet.disconnect();
    try {
      localStorage.setItem('equora_wallet_explicit_disconnect', 'true');
      localStorage.removeItem('trobsafe_address');
      localStorage.removeItem('equora_auth_address');
      localStorage.removeItem('equora_jwt');
    } catch {
      /* ignore */
    }
  };

  const handleDeposit = async () => {
    if (!wallet.isConnected) {
      setDepositError('Please connect your TrobSafe wallet first.');
      return;
    }
    if (!priceData || priceData.priceUsd <= 0) {
      setDepositError('Waiting for live TROB market rate…');
      return;
    }

    setIsDepositing(true);
    setDepositError(null);

    try {
      let broadcastTxId: string | null = null;

      // 1. Attempt on-chain contract call if TrobSafe is active and DAO address is set
      if (
        wallet.isInstalled &&
        DAO_CONTRACT_ADDRESS &&
        DAO_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
        DAO_CONTRACT_ADDRESS.length > 10
      ) {
        try {
          const seatEntryTrob = priceData.seatEntryTrob;
          const callValueSun = Math.ceil(seatEntryTrob * 1_000_000);
          const payload = {
            contract_address: DAO_CONTRACT_ADDRESS,
            function_selector: 'joinDAO()',
            parameter: '',
            call_value: callValueSun,
            fee_limit: 100_000_000,
            owner_address: activeAddress,
          };
          const res = await wallet.callContract(payload);
          if (res?.result && res.txid) {
            broadcastTxId = res.txid;
          } else if (res?.txid) {
            broadcastTxId = res.txid;
          }
        } catch (onChainErr: unknown) {
          console.warn('[DaoOnboardingModal] On-chain call note:', onChainErr);
          const msg = onChainErr instanceof Error ? onChainErr.message : String(onChainErr);
          throw new Error(msg || 'Transaction failed in TrobSafe.');
        }

        if (!broadcastTxId) {
          throw new Error('On-chain deposit transaction was not confirmed. Please approve the transaction in TrobSafe.');
        }
      }

      // 2. Register membership in database via backend API & Anti-Sybil device fingerprint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const deviceFingerprint = await getDeviceFingerprint();
      const res = await fetch(`${apiUrl}/api/dao/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-fingerprint': deviceFingerprint,
        },
        body: JSON.stringify({
          address: activeAddress,
          txHash: broadcastTxId,
          deviceFingerprint,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to complete deposit registration.');
      }

      setTxHash(broadcastTxId || 'confirmed');
      setHasDeposited(true);
      await refetchMember();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deposit failed. Please try again.';
      setDepositError(msg);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleJoinWhatsApp = async () => {
    window.open(WHATSAPP_DAO_GROUP_URL, '_blank', 'noopener,noreferrer');
    setHasJoinedWhatsApp(true);
    if (activeAddress && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`equora_wa_joined_${activeAddress}`, 'true');
        localStorage.setItem(`equora_wa_joined_${activeAddress.toLowerCase()}`, 'true');
        await fetch('/api/dao/verify-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: activeAddress }),
        });
      } catch {
        /* ignore */
      }
    }
  };

  const handleFinishOnboarding = () => {
    if (!isAllDone) return;
    if (typeof window !== 'undefined' && activeAddress) {
      try {
        localStorage.setItem(`equora_onboarded_${activeAddress}`, 'true');
        localStorage.setItem(`equora_wa_joined_${activeAddress}`, 'true');
      } catch {
        /* ignore */
      }
    }
    setCompleted(true);
    setIsDismissed(true);
  };


  const isAllDone = (hasDeposited || memberData?.isMember) && hasJoinedWhatsApp;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-[0_25px_60px_rgba(15,23,42,0.35)] overflow-hidden p-6 sm:p-8 space-y-5">
        {/* Soft Ambient Header Background */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#EFF6FF] via-[#EFF6FF]/60 to-transparent pointer-events-none" />

        {/* Top Status & Controls: Connected Address, Sign Out & Close */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              {activeAddress.length > 10 ? `${activeAddress.slice(0, 6)}…${activeAddress.slice(-4)}` : activeAddress}
            </span>
            {wallet.isInstalled ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md hidden xs:inline-flex">
                TrobSafe Ready
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md hidden xs:inline-flex">
                Extension Absent
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out & Disconnect Wallet"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              title="Close modal"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Header Title */}
        <div className="relative z-10 text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D0E2FF] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#155EEF]" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#155EEF] font-inter">
              Genesis DAO Activation
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-jakarta text-[#071A4A] tracking-tight">
            Welcome to Equora DAO
          </h2>

          <p className="text-xs sm:text-sm text-[#475467] font-jakarta leading-relaxed max-w-sm mx-auto">
            Complete the 2 required onboarding steps to activate your Genesis seat and access all council dashboard details.
          </p>
        </div>

        {/* Steps List */}
        <div className="relative z-10 space-y-3.5">
          {/* ── Step 1: Deposit $300 USD (in TROB) ── */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              hasDeposited || memberData?.isMember
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-white border-blue-200 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    hasDeposited || memberData?.isMember
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-50 text-[#155EEF] border border-blue-200'
                  }`}
                >
                  {hasDeposited || memberData?.isMember ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Coins className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-jakarta text-[#071A4A]">
                      Step 1: Deposit $300 USD (in TROB)
                    </span>
                    {(hasDeposited || memberData?.isMember) && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] font-jakarta leading-relaxed">
                    Fixed $300 USD council seat contribution with instant 300/N cashback rule.
                  </p>
                  {priceData && (
                    <div className="text-[11px] font-semibold text-[#155EEF] pt-0.5">
                      ≈ {priceData.seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 0 })} TROB (@ ${priceData.priceUsd.toFixed(4)}/TROB)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deposit Action Button (if not yet deposited) */}
            {!hasDeposited && !memberData?.isMember && (
              <div className="pt-3 space-y-2">
                {depositError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{depositError}</span>
                  </div>
                )}

                {wallet.isInstalled ? (
                  <button
                    type="button"
                    onClick={handleDeposit}
                    disabled={isDepositing}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] disabled:opacity-50 transition-all shadow-[0_4px_14px_rgba(21,94,239,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isDepositing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Broadcasting On-Chain Deposit…</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Deposit $300 USD in TROB (TrobSafe)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>TrobSafe Extension / APK Recommended</span>
                      </div>
                      <p className="text-amber-700 leading-relaxed">
                        For direct on-chain signatures, install TrobSafe. You can also complete protocol registration directly below.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="https://trobium.com/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-2 rounded-xl text-center font-bold text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center gap-1 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Get Wallet</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleDeposit}
                        disabled={isDepositing}
                        className="py-2.5 px-2 rounded-xl text-center font-bold text-xs text-white bg-[#155EEF] hover:bg-[#004EEB] disabled:opacity-50 flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                      >
                        {isDepositing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing…</span>
                          </>
                        ) : (
                          <>
                            <span>Register Deposit</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Step 2: Join WhatsApp DAO Group ── */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              hasJoinedWhatsApp
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    hasJoinedWhatsApp
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#25D366]/15 text-[#128C7E] border border-[#25D366]/30'
                  }`}
                >
                  {hasJoinedWhatsApp ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-jakarta text-[#071A4A]">
                      Step 2: Join WhatsApp DAO Group
                    </span>
                    {hasJoinedWhatsApp ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                        <span>Joined</span>
                        <Check className="w-3 h-3 text-emerald-700" />
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                        Compulsory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] font-jakarta leading-relaxed">
                    Mandatory official council group for real-time governance, seat alerts, and peer voting.
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Action Button */}
            {!hasJoinedWhatsApp ? (
              <div className="pt-3 space-y-1.5">
                <button
                  type="button"
                  onClick={handleJoinWhatsApp}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#25D366] hover:bg-[#1EBE5D] transition-all shadow-[0_4px_14px_rgba(37,211,102,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Join Official DAO WhatsApp Group</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <div className="text-[11px] text-amber-700/90 font-medium text-center">
                  * Must join to unlock full DAO Dashboard access
                </div>
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-between text-xs text-emerald-700 font-semibold bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Official WhatsApp Joined
                </span>
                <a
                  href={WHATSAPP_DAO_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#155EEF] hover:underline flex items-center gap-1"
                >
                  Open Chat <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Unlock Action Button */}
        <div className="relative z-10 pt-2 space-y-3">
          <button
            type="button"
            onClick={handleFinishOnboarding}
            disabled={!isAllDone}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              isAllDone
                ? 'bg-[#155EEF] hover:bg-[#004EEB] text-white shadow-[0_6px_20px_rgba(21,94,239,0.35)] cursor-pointer ring-4 ring-blue-500/20'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <span>Continue to DAO Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Bottom Actions: Sign out / switch wallet */}
          <div className="flex items-center justify-center text-xs text-[#64748B] pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-rose-600 hover:text-rose-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Disconnect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
