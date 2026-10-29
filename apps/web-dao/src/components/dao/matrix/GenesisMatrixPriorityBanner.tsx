'use client';

import React, { useState, useEffect } from 'react';
import {
  Network,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  GitBranch,
  Layers,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  getMatrixReferralUrl,
  resolveSponsorAddressForSeat,
  getMatrixBaseUrl,
} from '@/config/matrixTree';
import {
  resolveQuadrantParent,
  getGatewayForDaoPosition,
  PROTOCOL_VAULT_ADDRESS,
  type QuadrantParentResult,
} from '@/config/matrixGateways';
import { useDaoMembers } from '@/hooks/useApi';

interface GenesisMatrixPriorityBannerProps {
  position?: number | null;
  isMember?: boolean;
}

function shortAddr(addr: string): string {
  if (!addr || addr.length <= 12) return addr || '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export const GenesisMatrixPriorityBanner: React.FC<GenesisMatrixPriorityBannerProps> = ({
  position,
  isMember,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { data: membersData } = useDaoMembers();
  const allMembers = membersData?.members || [];

  // Non-member view: clean institutional status
  if (!isMember || !position || position < 1 || position > 100) {
    return (
      <div className="rounded-2xl bg-white border border-[#E2ECF9] p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#EEF5FF] text-[#155EEF] border border-[#BFDBFE]/60 flex items-center justify-center shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#155EEF] bg-[#EEF5FF] px-2 py-0.5 rounded-md border border-[#BFDBFE]/50">
                Matrix Topology
              </span>
              <span className="text-xs font-bold text-[#071A4A]">4-Quadrant 14-Node Recursive Architecture</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Genesis Council members receive sequential priority seating across 4 symmetrical power legs (Seats 1–25, 26–50, 51–75, 76–100).
            </p>
          </div>
        </div>

        <a
          href="/dao/matrix"
          className="px-4 py-2 rounded-xl bg-[#071A4A] text-white hover:bg-[#155EEF] transition-colors text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <span>Matrix Protocol Architecture</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  // Calculate quadrant and binary parent index
  const quadrantInfo = resolveQuadrantParent(position);
  const isDirectGateway = quadrantInfo.isGatewayDirect;
  const parentSeat = quadrantInfo.parentSeat;

  // Resolve parent member data
  const parentMember = parentSeat
    ? allMembers.find((m) => m.position === parentSeat)
    : null;

  // Cascading Lock State:
  // - Direct Gateway seats (Seats 1, 2, 26, 27, 51, 52, 76, 77) are unlocked immediately.
  // - Downline seats (k >= 3) unlock once parent member is recognized / active.
  const isParentActive = isDirectGateway || (parentMember && (parentMember.isActive !== false));

  // Resolve Sponsor Address & 5-digit code
  const sponsorAddress = isDirectGateway
    ? (quadrantInfo.gateway.gatewayAddress || PROTOCOL_VAULT_ADDRESS)
    : resolveSponsorAddressForSeat(position, allMembers);

  const sponsor5DigitCode = isDirectGateway
    ? (quadrantInfo.gateway.gatewayCode || "")
    : (parentMember?.referralCode ? String(parentMember.referralCode) : "");

  const activeReferralUrl = getMatrixReferralUrl(position, allMembers, sponsor5DigitCode || sponsorAddress);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activeReferralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handleCopyCode = async () => {
    const codeToCopy = sponsor5DigitCode || sponsorAddress;
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  // Locked State: Waiting for Parent Seat to Activate
  if (!isParentActive) {
    return (
      <div className="rounded-2xl bg-white border border-[#E2ECF9] p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 font-sans">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Council Seat #{position} • Quadrant {quadrantInfo.quadrant}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3" />
                <span>Parent Node Pending Activation</span>
              </span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed max-w-2xl">
              Under protocol rules, priority placement maintains a strict binary tree. Your allocation is anchored to <strong>Council Seat #{parentSeat}</strong> ({quadrantInfo.legPosition === 'left' ? 'Left Leg' : 'Right Leg'}). Your link and 5-digit code will unlock instantly when Council Seat #{parentSeat} activates their Slot 1 ID on-chain.
            </p>
          </div>
        </div>

        <button
          disabled
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center gap-2 shrink-0 self-end lg:self-center"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Awaiting Seat #{parentSeat}</span>
        </button>
      </div>
    );
  }

  // Active Unlocked State
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#071A4A] via-[#09225E] to-[#0A2A75] text-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(7,26,74,0.12)] border border-[#1E3A8A] font-sans">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Information */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 text-[#60A5FA] flex items-center justify-center shrink-0 mt-0.5">
            {isDirectGateway ? <ShieldCheck className="w-6 h-6 text-white" /> : <GitBranch className="w-6 h-6 text-[#93C5FD]" />}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#1D4ED8] text-white text-[10px] font-mono font-bold uppercase tracking-wider border border-blue-400/30">
                Council Seat #{position}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-blue-200 text-[10px] font-bold uppercase tracking-wider">
                Quadrant {quadrantInfo.quadrant} • {quadrantInfo.gateway.assignedSeatRange}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>Priority Allocation Verified</span>
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed max-w-2xl pt-0.5">
              {isDirectGateway ? (
                <>
                  Your wallet is designated as a <strong>Primary Quadrant Anchor (Seat #{position})</strong>. Enrolling in Slot 1 establishes your node directly under <strong>{quadrantInfo.gateway.label}</strong>, opening immediate earning placement for your subsequent downline seats.
                </>
              ) : (
                <>
                  Under Equora protocol rules, a verified sponsor referral is mandatory for matrix enrollment. Your node is pre-anchored to <strong>Council Seat #{parentSeat}</strong> ({quadrantInfo.legPosition === 'left' ? 'Left Leg' : 'Right Leg'}) to maintain symmetrical top-to-bottom, left-to-right tree placement.
                </>
              )}
            </p>

            {/* Sponsor and 5-Digit Code Specs */}
            <div className="flex items-center gap-4 pt-1 text-[11px] font-mono text-blue-200/80 flex-wrap">
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] mr-1.5">Sponsor:</span>
                <span className="text-white font-semibold">
                  {isDirectGateway ? quadrantInfo.gateway.label : `Council Seat #${parentSeat} (${shortAddr(sponsorAddress)})`}
                </span>
              </div>
              {sponsor5DigitCode && (
                <>
                  <div className="hidden sm:block text-slate-500">•</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Sponsor Code:</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-blue-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copy 5-digit Sponsor Code"
                    >
                      <span>{sponsor5DigitCode}</span>
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-blue-300" />}
                    </button>
                  </div>
                </>
              )}
              <div className="hidden sm:block text-slate-500">•</div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] mr-1.5">Branch:</span>
                <span className="text-white font-semibold">{quadrantInfo.legPosition === 'left' ? 'Left Branch' : 'Right Branch'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 justify-end pt-2 lg:pt-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Copy exact Matrix Gate referral URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            <span className="text-[11px]">{copiedLink ? 'Link Copied' : 'Copy Referral URL'}</span>
          </button>

          <a
            href={activeReferralUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <span>Enter Matrix Gate</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
          </a>
        </div>
      </div>
    </div>
  );
};
