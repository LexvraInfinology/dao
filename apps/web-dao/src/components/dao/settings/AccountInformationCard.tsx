'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Users,
  Wallet,
  ShieldCheck,
  Box,
  Pen,
  Copy,
  Check,
  ExternalLink,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useDaoMember } from '@/hooks/useApi';

export default function AccountInformationCard() {
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [alias, setAlias] = useState('');
  const [bio, setBio] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const wallet = useWallet();
  const auth   = useAuthContext();
  const activeAddress = wallet.base58Address || wallet.hexAddress || '';
  const { data: memberData } = useDaoMember(activeAddress);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedAlias = localStorage.getItem('equora_profile_alias') || '';
    const storedBio   = localStorage.getItem('equora_profile_bio') || '';
    setAlias(storedAlias);
    setBio(storedBio);
  }, []);

  const displayAddr = activeAddress
    ? activeAddress.startsWith('T') && activeAddress.length > 10
      ? `${activeAddress.slice(0, 6)}…${activeAddress.slice(-4)}`
      : `${activeAddress.slice(0, 6)}…${activeAddress.slice(-4)}`
    : 'Not Connected';

  const memberId = auth.user?.userId
    ? `#${auth.user.userId}`
    : memberData?.nftTokenId
    ? `#${memberData.nftTokenId}`
    : '#Guest';

  const seatPosition = memberData?.position ? `#${memberData.position}` : 'None';
  const soulboundNft = memberData?.nftTokenId ? `#${String(memberData.nftTokenId).padStart(4, '0')}` : 'None';

  const memberSince = memberData?.joinedAt
    ? new Date(memberData.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Aug 12, 2026';

  const handleCopyWallet = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('equora_profile_alias', alias.trim());
      localStorage.setItem('equora_profile_bio', bio.trim());
      window.dispatchEvent(new CustomEvent('dao:profile-updated', { detail: { alias, bio } }));
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditModalOpen(false);
    }, 1200);
  };

  return (
    <>
      {/* ================= DESKTOP ACCOUNT INFORMATION (lg:block) ================= */}
      <div className="hidden lg:flex flex-col justify-between h-full rounded-3xl bg-white border border-[#E2ECF9] p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-[#071A4A]">
              Account Information
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Your Genesis DAO identity details {alias ? `• ${alias}` : ''}
            </p>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Pen className="w-3.5 h-3.5 text-[#155EEF]" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* 5 Rows */}
        <div className="space-y-3.5 flex-1 flex flex-col justify-between">
          {/* 1. Member ID / Moniker */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3">
              <User className="w-[18px] h-[18px] text-[#155EEF]" />
              <span className="text-sm font-medium text-[#475569]">Member ID</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[#071A4A]">{memberId}</span>
              {alias && (
                <span className="block text-[11px] font-medium text-[#155EEF]">{alias}</span>
              )}
            </div>
          </div>

          {/* 2. Council Seat */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3">
              <Users className="w-[18px] h-[18px] text-[#155EEF]" />
              <span className="text-sm font-medium text-[#475569]">Council Seat</span>
            </div>
            <span className="text-sm font-bold text-[#155EEF]">{seatPosition}</span>
          </div>

          {/* 3. Connected Wallet */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3">
              <Wallet className="w-[18px] h-[18px] text-[#155EEF]" />
              <span className="text-sm font-medium text-[#475569]">Connected Wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#071A4A]">
                {displayAddr}
              </span>
              {activeAddress && (
                <>
                  <button
                    onClick={handleCopyWallet}
                    className="text-[#64748B] hover:text-[#155EEF] transition-colors cursor-pointer"
                    title="Copy wallet address"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href="https://trobium.network"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#64748B] hover:text-[#155EEF] transition-colors"
                    title="View on explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* 4. Member Since */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-[18px] h-[18px] text-[#155EEF]" />
              <span className="text-sm font-medium text-[#475569]">Member Since</span>
            </div>
            <span className="text-xs font-medium text-[#071A4A]">{memberSince}</span>
          </div>

          {/* 5. Soulbound NFT */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3">
              <Box className="w-[18px] h-[18px] text-[#155EEF]" />
              <span className="text-sm font-medium text-[#475569]">Soulbound NFT</span>
            </div>
            <span className="text-xs font-bold text-[#071A4A]">{soulboundNft}</span>
          </div>
        </div>
      </div>

      {/* ================= MOBILE ACCOUNT INFORMATION (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-[0_2px_15px_rgba(21,94,239,0.02)] font-jakarta">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#071A4A]">
              Account Information
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Your Genesis DAO identity details {alias ? `• ${alias}` : ''}
            </p>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Pen className="w-3.5 h-3.5 text-[#155EEF]" />
            <span>Edit</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F1F5F9] my-4" />

        {/* 5 Rows with spacious layout matching mobile design */}
        <div className="space-y-4">
          {/* 1. Member ID / Moniker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-[#155EEF]" />
              <span className="text-xs font-medium text-[#475569]">Member ID</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[#071A4A]">{memberId}</span>
              {alias && (
                <span className="block text-[10.5px] font-medium text-[#155EEF]">{alias}</span>
              )}
            </div>
          </div>

          {/* 2. Council Seat */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-[#155EEF]" />
              <span className="text-xs font-medium text-[#475569]">Council Seat</span>
            </div>
            <span className="text-sm font-bold text-[#155EEF]">{seatPosition}</span>
          </div>

          {/* 3. Connected Wallet */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-4 h-4 text-[#155EEF]" />
              <span className="text-xs font-medium text-[#475569]">Connected Wallet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-[#071A4A]">
                {displayAddr}
              </span>
              {activeAddress && (
                <button
                  onClick={handleCopyWallet}
                  className="text-[#64748B] hover:text-[#155EEF] transition-colors cursor-pointer"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 4. Member Since */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-[#155EEF]" />
              <span className="text-xs font-medium text-[#475569]">Member Since</span>
            </div>
            <span className="text-xs font-medium text-[#071A4A]">{memberSince}</span>
          </div>

          {/* 5. Soulbound NFT */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Box className="w-4 h-4 text-[#155EEF]" />
              <span className="text-xs font-medium text-[#475569]">Soulbound NFT</span>
            </div>
            <span className="text-xs font-bold text-[#071A4A]">{soulboundNft}</span>
          </div>
        </div>
      </div>

      {/* ================= EDIT PROFILE & IDENTITY MODAL ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2ECF9] shadow-[0_25px_60px_rgba(15,23,42,0.25)] p-6 sm:p-7 space-y-5 font-jakarta">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center">
                  <Pen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#071A4A]">Edit Member Profile</h3>
                  <p className="text-xs text-[#64748B]">Personalize your DAO display details</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#071A4A] mb-1.5">
                  Display Alias / Moniker
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="e.g. Genesis Guardian"
                  maxLength={30}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-medium text-[#071A4A] focus:outline-hidden focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071A4A] mb-1.5">
                  Bio / Community Vision
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Committed to sovereign decentralized governance and long-term TrobChain matrix participation."
                  rows={3}
                  maxLength={160}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-medium text-[#071A4A] focus:outline-hidden focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/10 transition-all resize-none"
                />
              </div>

              {/* On-Chain Note */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] text-[11px] text-[#475569] space-y-1">
                <div className="font-bold text-[#071A4A] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#155EEF]" />
                  <span>On-Chain Cryptographic Binding</span>
                </div>
                <p className="leading-relaxed">
                  Your Council Seat ({seatPosition}) and Soulbound Token ({soulboundNft}) remain immutably anchored to your connected TrobSafe address.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#124bbf] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Preferences</span>
                  )}
                </button>

                <Link
                  href="/dao/profile"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100 font-bold text-xs transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>Full Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
