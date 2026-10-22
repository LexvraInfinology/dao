'use client';

import React, { useState } from 'react';
import {
  Crown,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  getGatewayForDaoPosition,
  getMatrixClaimUrl,
} from '@/config/matrixGateways';

interface GenesisMatrixPriorityBannerProps {
  position?: number | null;
  isMember?: boolean;
}

export const GenesisMatrixPriorityBanner: React.FC<GenesisMatrixPriorityBannerProps> = ({
  position,
  isMember,
}) => {
  const [copied, setCopied] = useState(false);

  // If not a DAO member, show general upcoming matrix alert
  if (!isMember || !position) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-blue-900/90 via-[#0E62E4] to-blue-800 text-white p-4 sm:p-5 shadow-sm border border-blue-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Genesis Matrix
              </span>
              <span className="text-xs font-bold text-blue-100">Day 22 Global Launch</span>
            </div>
            <p className="text-xs text-blue-50 mt-0.5 leading-snug">
              The 14-Node Recursive Matrix is launching! DAO Council members receive first priority seating.
            </p>
          </div>
        </div>

        <a
          href="/dao/matrix"
          className="px-4 py-2 rounded-xl bg-white text-[#0E62E4] font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <span>View Matrix Architecture</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  // Active DAO Member: Show their exact quadrant gateway link
  const gateway = getGatewayForDaoPosition(position);
  const claimUrl = getMatrixClaimUrl(position);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-400/60 p-4 sm:p-5 shadow-xs font-sans">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Side: Seat Badge & Priority Heading */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 mt-0.5">
            <Crown className="w-5 h-5 fill-white" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                Council Seat #{position}
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1">
                <span>Genesis Matrix Priority Gateway</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              You are assigned to <strong>Gateway Link #{gateway.linkNumber}</strong> ({gateway.assignedSeatRange}).
              Claim your Slot 1 position now to anchor the apex of your quadrant before public retail enrollment begins!
            </p>

            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 pt-0.5">
              <span>Sponsor Gateway ID {gateway.gatewayNodeId}:</span>
              <span className="font-bold text-slate-700">
                {gateway.gatewayAddress.slice(0, 6)}...{gateway.gatewayAddress.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 pt-1 lg:pt-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs flex items-center justify-center"
            title="Copy Matrix Priority Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <a
            href={claimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 lg:flex-initial px-5 py-2.5 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-center cursor-pointer"
          >
            <span>Claim Matrix Slot 1</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
