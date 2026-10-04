'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, ExternalLink, ArrowRight, Landmark, Loader2 } from 'lucide-react';
import type { ProfileData } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getExplorerAddressUrl } from '@/utils/explorer';

interface ProfileMemberCardProps {
  profile?: ProfileData | null;
  loading?: boolean;
}

export const ProfileMemberCard: React.FC<ProfileMemberCardProps> = ({ profile, loading }) => {
  const wallet   = useWallet();
  const [copied, setCopied] = useState(false);

  const displayAddr = wallet.base58Address ?? wallet.hexAddress ?? profile?.address ?? '—';
  const shortAddr   = displayAddr.length > 14
    ? `${displayAddr.slice(0, 8)}…${displayAddr.slice(-4)}`
    : displayAddr;

  const memberId  = profile?.userId  ? `#${profile.userId}`  : '—';
  const seatNum   = profile?.position ? `#${profile.position}` : '—';
  const isUnderfunded = Boolean(profile?.status === 'underfunded' || profile?.underfunded);
  const isActive  = profile?.status === 'active' && !isUnderfunded;
  const joinedAt  = profile?.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const nftId     = profile?.nftTokenId
    ? `#${String(profile.nftTokenId).padStart(4, '0')}`
    : '—';

  const accountKey = displayAddr !== '—'
    ? displayAddr
    : (profile?.userId ? `user_${profile.userId}` : 'genesis_guest');

  const handleCopy = () => {
    navigator.clipboard.writeText(displayAddr).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRetopupClick = () => {
    window.dispatchEvent(
      new CustomEvent('dao:open-retopup', {
        detail: { seatPosition: profile?.position },
      })
    );
  };

  if (loading && !profile) {
    return (
      <div className="rounded-3xl bg-white border border-[#E2ECF9] p-8 flex items-center justify-center gap-2 text-sm text-[#4F6D87] font-sans">
        <Loader2 className="w-4 h-4 animate-spin text-[#0E62E4]" />Loading profile…
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between gap-4 xl:gap-6 p-6 xl:p-8 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_25px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-5 min-w-0">
          <UserAvatar
            address={accountKey}
            userId={profile?.userId}
            size={84}
            showStatus={true}
            isActive={isActive}
            allowRandomize={true}
            roundedClassName="rounded-2xl"
          />
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black font-sans text-[#14304A] tracking-tight">
                Member {memberId}
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isUnderfunded
                  ? 'bg-red-50 border border-red-200 text-red-600'
                  : isActive
                  ? 'bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#047857]'
                  : 'bg-slate-100 border border-slate-200 text-slate-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isUnderfunded ? 'bg-red-500' : isActive ? 'bg-[#10B981]' : 'bg-slate-400'}`} />
                {isUnderfunded ? 'Underfunded (Locked)' : isActive ? 'Active Member' : (profile?.status ?? 'Unknown')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold font-sans text-[#0E62E4] uppercase tracking-wider">SOVEREIGN ID:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#14304A] font-mono font-bold text-xs">{nftId}</span>
            </div>
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7FBFF] border border-[#DCE7F6] text-xs font-mono font-semibold text-[#14304A]">
                <div className="w-3.5 h-3.5 rounded-xs bg-[#0E62E4] flex items-center justify-center text-white text-[8px]">⬡</div>
                <span>{shortAddr}</span>
                <button onClick={handleCopy} className="text-[#4F6D87] hover:text-[#0E62E4] transition-colors ml-0.5" title="Copy address">
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <a href={getExplorerAddressUrl(displayAddr)} target="_blank" rel="noopener noreferrer"
                className="text-xs font-bold font-sans text-[#0E62E4] hover:underline flex items-center gap-1"
                title="View on Trobium Explorer">
                <span>Explorer</span><ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Council seat card */}
        <div className="bg-[#F7FBFF] border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 w-72 xl:w-80 space-y-3 shrink-0 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-sans text-[#4F6D87] uppercase tracking-wider">COUNCIL SEAT</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${isUnderfunded ? 'text-red-600' : 'text-[#059669]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isUnderfunded ? 'bg-red-500' : 'bg-[#10B981]'}`} />
              {isUnderfunded ? 'Deposit Incomplete' : 'Good Standing'}
            </span>
          </div>
          <div>
            <div className="text-xl font-black font-sans text-[#14304A] tracking-tight">Seat {seatNum}</div>
            <div className="text-[10px] font-bold font-sans text-[#4F6D87] uppercase tracking-wider pt-0.5">
              {joinedAt !== '—' ? `CLAIMED: ${joinedAt}` : 'GENESIS COUNCIL'}
            </div>
          </div>
          {isUnderfunded ? (
            <button
              onClick={handleRetopupClick}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Complete Re-topup ($300)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link href="/dao/seats"
              className="w-full py-2.5 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs">
              <span>View Seat</span><ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)] space-y-4">
        <div className="flex flex-col items-center text-center space-y-2.5">
          <UserAvatar
            address={accountKey}
            userId={profile?.userId}
            size={72}
            showStatus={true}
            isActive={isActive}
            allowRandomize={true}
            roundedClassName="rounded-2xl"
          />
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-black font-sans text-[#14304A] tracking-tight">Member {memberId}</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isUnderfunded
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : isActive
                  ? 'bg-[#EFF6FF] text-[#0E62E4]'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isUnderfunded ? 'bg-red-500' : isActive ? 'bg-[#0E62E4]' : 'bg-slate-400'}`} />
                {isUnderfunded ? 'Underfunded (Locked)' : isActive ? 'Active' : (profile?.status ?? 'Unknown')}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] text-xs font-mono font-semibold text-[#14304A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E62E4]" />
              <span>{shortAddr}</span>
              <button onClick={handleCopy} className="text-[#4F6D87] hover:text-[#0E62E4] transition-colors ml-0.5">
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#F7FBFF] border border-[#E2ECF9] rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold font-sans text-[#4F6D87] uppercase tracking-wider">ASSIGNED POSITION</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isUnderfunded ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[#EFF6FF] text-[#0E62E4]'}`}>
              {isUnderfunded ? 'Incomplete Deposit' : 'Tier 1 Genesis'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E2ECF9] text-[#0E62E4] flex items-center justify-center shrink-0 shadow-2xs">
              <Landmark className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold font-sans text-[#14304A] truncate">Genesis Council Seat {seatNum}</div>
              <div className="text-[10px] text-[#4F6D87] font-sans truncate">
                {isUnderfunded ? 'Seat Locked • Re-topup $300 Required' : 'Immutable Voting Key · Valid Epoch 2026–2028'}
              </div>
            </div>
          </div>
          {isUnderfunded ? (
            <button
              onClick={handleRetopupClick}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Complete Re-topup ($300)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link href="/dao/seats"
              className="w-full py-2.5 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs">
              <span>View Seat</span><ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
};
