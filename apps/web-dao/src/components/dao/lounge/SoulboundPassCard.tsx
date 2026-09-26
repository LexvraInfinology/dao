'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import type { LoungeData } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';

interface SoulboundPassCardProps {
  loungeData?: LoungeData | null;
}

export const SoulboundPassCard: React.FC<SoulboundPassCardProps> = ({ loungeData }) => {
  const wallet = useWallet();

  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);
  const [shared, setShared]           = useState(false);
  const [activeModal, setActiveModal] = useState<'explorer' | 'details' | null>(null);

  const seatNumber = loungeData?.soulboundPass?.seatNumber ?? loungeData?.position ?? 12;
  const tokenId    = loungeData?.soulboundPass?.tokenId    ?? loungeData?.nftTokenId ?? seatNumber;
  const sbtId      = `#${String(tokenId).padStart(4, '0')}`;
  const memberId   = loungeData?.soulboundPass?.memberId   ?? sbtId;
  const joinedAt   = loungeData?.soulboundPass?.joinedAt
    ? new Date(loungeData.soulboundPass.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Jan 12, 2025';
  const status     = loungeData?.status ?? 'active';
  const ownerAddr  = wallet.base58Address ?? wallet.hexAddress ?? '0x—';
  const shortOwner = ownerAddr.length > 12 ? `${ownerAddr.slice(0, 6)}…${ownerAddr.slice(-4)}` : ownerAddr;
  const nftContractAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS ?? '0x—';

  const copyToClipboard = (text: string, type: 'token' | 'owner') => {
    navigator.clipboard?.writeText(text).catch(() => {});
    if (type === 'token') { setCopiedToken(true); setTimeout(() => setCopiedToken(false), 2000); }
    else                  { setCopiedOwner(true); setTimeout(() => setCopiedOwner(false), 2000); }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(typeof window !== 'undefined' ? window.location.href : '').catch(() => {});
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-jakarta text-[#071A4A]">Soulbound Pass</h2>
        <button onClick={handleShare}
          className="px-3.5 py-1.5 rounded-full border border-[#E2ECF9] bg-[#F8FAFC] hover:bg-blue-50 text-xs font-semibold text-[#155EEF] flex items-center gap-1.5 transition-colors shadow-2xs">
          {shared
            ? <><Check className="w-3.5 h-3.5 text-emerald-600" /><span className="text-emerald-600">Copied!</span></>
            : <><Share2 className="w-3.5 h-3.5 text-[#155EEF]" /><span>Share</span></>
          }
        </button>
      </div>

      {/* Virtual card */}
      <div className="w-full h-56 sm:h-64 rounded-2xl relative overflow-hidden bg-gradient-to-br from-[#061432] via-[#0A1E4A] to-[#0E2768] border border-blue-400/25 p-5 sm:p-6 flex flex-col justify-between shadow-[0_12px_32px_rgba(7,26,74,0.32)] select-none">
        <div className="w-48 h-48 bg-blue-500/20 rounded-full blur-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="w-36 h-36 rounded-full border border-blue-400/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="text-xs font-black tracking-wider text-white font-inter">EQUORA_FI</div>
            <div className="text-[9px] font-semibold text-blue-300/80 tracking-widest font-inter">GENESIS DAO</div>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-[10px] font-mono font-bold text-white/90 backdrop-blur-xs">
            SBT {sbtId}
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-center my-auto">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center animate-float">
            <img src="/dao/Central 3D Vector Polygonal Floating Ethereum-Style Shape.png" alt="Soulbound Jewel"
              className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(59,130,246,0.6)]" />
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <span className="text-sm sm:text-base font-bold text-white font-jakarta">Council Seat #{seatNumber}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#032E1D]/90 border border-[#059669]/60 text-[10px] font-semibold text-[#34D399] capitalize">
            {status}
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="divide-y divide-[#F1F5F9] pt-1">
        <div className="py-2.5 flex items-center justify-between text-xs">
          <span className="text-[#60739A] font-medium font-jakarta">Token ID</span>
          <div className="flex items-center gap-1.5 font-bold font-jakarta text-[#071A4A]">
            <span>{sbtId}</span>
            <button onClick={() => copyToClipboard(sbtId, 'token')} className="text-[#94A3B8] hover:text-[#155EEF] transition-colors p-0.5">
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <div className="py-2.5 flex items-center justify-between text-xs">
          <span className="text-[#60739A] font-medium font-jakarta">Owner Address</span>
          <div className="flex items-center gap-1.5 font-mono font-bold text-[#071A4A]">
            <span>{shortOwner}</span>
            <button onClick={() => copyToClipboard(ownerAddr, 'owner')} className="text-[#94A3B8] hover:text-[#155EEF] transition-colors p-0.5">
              {copiedOwner ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <div className="py-2.5 flex items-center justify-between text-xs">
          <span className="text-[#60739A] font-medium font-jakarta">Voting Power</span>
          <span className="font-bold font-jakarta text-[#071A4A]">1.0% <span className="font-normal text-[#60739A]">(1 Seat = 1 Vote)</span></span>
        </div>
        <div className="py-2.5 flex items-center justify-between text-xs">
          <span className="text-[#60739A] font-medium font-jakarta">Joined</span>
          <span className="font-bold font-jakarta text-[#071A4A]">{joinedAt}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
        <button onClick={() => setActiveModal('explorer')} className="w-full py-2.5 px-3 rounded-xl border border-[#E2ECF9] bg-white hover:bg-slate-50 text-[#071A4A] font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all">
          <span>View on Explorer</span><ExternalLink className="w-3.5 h-3.5 text-[#60739A]" />
        </button>
        <button onClick={() => setActiveModal('details')} className="w-full py-2.5 px-3 rounded-xl border border-[#E2ECF9] bg-white hover:bg-slate-50 text-[#071A4A] font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all">
          <span>View NFT Details</span>
        </button>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2ECF9] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2ECF9] pb-3">
              <h3 className="text-base font-bold text-[#071A4A] font-jakarta">
                {activeModal === 'explorer' ? 'Explorer Verification' : 'On-Chain SBT Specification'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-[#94A3B8] hover:text-[#071A4A] text-sm font-bold">✕</button>
            </div>
            <div className="space-y-3 text-xs text-[#4F6184] font-jakarta">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] space-y-1.5">
                <div className="flex justify-between"><span className="text-[#60739A]">Contract Standard:</span><span className="font-mono font-bold text-[#071A4A]">ERC-5192 (Soulbound Token)</span></div>
                <div className="flex justify-between"><span className="text-[#60739A]">Contract Address:</span><span className="font-mono font-bold text-[#155EEF]">{nftContractAddress.slice(0, 10)}…</span></div>
                <div className="flex justify-between"><span className="text-[#60739A]">Token ID:</span><span className="font-bold text-[#071A4A]">{sbtId}</span></div>
                <div className="flex justify-between"><span className="text-[#60739A]">Owner:</span><span className="font-mono text-[#071A4A]">{shortOwner}</span></div>
              </div>
              <p className="text-[11px] text-[#60739A] italic">This Soulbound Pass is non-transferable and represents sovereign governance rights in Genesis DAO.</p>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-2.5 rounded-xl bg-[#155EEF] text-white font-bold text-xs hover:bg-[#0052E6] transition-all">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
