'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Check } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { useUserSettings, saveUserSettings } from '@/hooks/useApi';

export default function ProfileVisibilityCard() {
  const auth = useAuthContext();
  const { data: settings, loading } = useUserSettings(auth.token);

  const [daoProfileVisible, setDaoProfileVisible]       = useState(true);
  const [walletAddressVisible, setWalletAddressVisible] = useState(true);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from backend
  useEffect(() => {
    if (!settings) return;
    setDaoProfileVisible(settings.privDaoProfileVisible);
    setWalletAddressVisible(settings.privWalletVisible);
  }, [settings]);

  const persist = (field: 'privDaoProfileVisible' | 'privWalletVisible', value: boolean) => {
    if (!auth.token) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveUserSettings({ [field]: value }, auth.token!);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        // revert on error
        if (field === 'privDaoProfileVisible') setDaoProfileVisible(!value);
        if (field === 'privWalletVisible') setWalletAddressVisible(!value);
      }
    }, 600);
  };

  const Toggle = ({
    checked,
    onToggle,
    label,
  }: {
    checked: boolean;
    onToggle: () => void;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className={`w-11 h-6 rounded-full relative p-0.5 transition-colors shrink-0 cursor-pointer disabled:opacity-60 ${
        checked ? 'bg-[#155EEF]' : 'bg-[#CBD5E1]'
      }`}
      aria-label={label}
    >
      <span
        className={`block w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <>
      {/* ================= DESKTOP VIEW (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#071A4A]">
              Profile Visibility
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Control what other DAO members can see about your profile.
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0]/60 px-2.5 py-1 rounded-full">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>

        {/* Rows Container */}
        <div className="space-y-3 pt-1">
          {/* Row 1: DAO Member Profile */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3.5 min-w-0 pr-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 2v2" /><path d="M8 2v2" />
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <circle cx="12" cy="11" r="3" />
                  <path d="M6 19a6 6 0 0 1 12 0" />
                </svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#071A4A]">DAO Member Profile</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Allow your basic DAO profile to be visible to other members.
                </p>
              </div>
            </div>
            <Toggle
              checked={daoProfileVisible}
              onToggle={() => {
                const val = !daoProfileVisible;
                setDaoProfileVisible(val);
                persist('privDaoProfileVisible', val);
              }}
              label="Toggle DAO Member Profile Visibility"
            />
          </div>

          {/* Row 2: Wallet Address */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3.5 min-w-0 pr-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#071A4A]">Wallet Address</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Show your connected wallet address on your public DAO profile.
                </p>
              </div>
            </div>
            <Toggle
              checked={walletAddressVisible}
              onToggle={() => {
                const val = !walletAddressVisible;
                setWalletAddressVisible(val);
                persist('privWalletVisible', val);
              }}
              label="Toggle Wallet Address Visibility"
            />
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-xs font-jakarta space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#071A4A]">Profile Visibility</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Control what other DAO members can see.
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669]">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>

        {/* Rows Container */}
        <div className="space-y-2.5 pt-1">
          {/* Row 1: DAO Member Profile */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 2v2" /><path d="M8 2v2" />
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <circle cx="12" cy="11" r="3" />
                  <path d="M6 19a6 6 0 0 1 12 0" />
                </svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#071A4A]">DAO Member Profile</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                  Allow basic DAO profile to be visible
                </p>
              </div>
            </div>
            <Toggle
              checked={daoProfileVisible}
              onToggle={() => {
                const val = !daoProfileVisible;
                setDaoProfileVisible(val);
                persist('privDaoProfileVisible', val);
              }}
              label="Toggle DAO Member Profile Visibility"
            />
          </div>

          {/* Row 2: Wallet Address */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#071A4A]">Wallet Address</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                  Show connected wallet on public profile
                </p>
              </div>
            </div>
            <Toggle
              checked={walletAddressVisible}
              onToggle={() => {
                const val = !walletAddressVisible;
                setWalletAddressVisible(val);
                persist('privWalletVisible', val);
              }}
              label="Toggle Wallet Address Visibility"
            />
          </div>
        </div>
      </div>
    </>
  );
}
