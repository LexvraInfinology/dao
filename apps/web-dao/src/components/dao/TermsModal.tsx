'use client';

import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0B1528] text-white rounded-3xl border border-slate-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#0F1E38] to-[#0B1528]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Terms & Conditions</h2>
              <p className="text-xs text-slate-400">EQUORA Genesis Council Seat Agreement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-300 leading-relaxed font-sans select-text">
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-blue-200 space-y-1">
            <p className="font-semibold text-[13px] text-blue-300">Genesis Sovereign Council Agreement</p>
            <p className="text-[11px] text-blue-300/80">
              By participating in EQUORA Genesis DAO, you agree to the decentralized protocol rules enforced autonomously by on-chain smart contracts.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                1. Sovereign Seat & Fixed Cap
              </h3>
              <p className="text-slate-400 pl-5">
                The Genesis Council is strictly limited to 100 immutable seats. Once all 100 seats are claimed, no additional Genesis seats can ever be created.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                2. Entry Fee & Real-Time Peg
              </h3>
              <p className="text-slate-400 pl-5">
                Each seat requires a one-time entry payment pegged to $300.00 USD worth of TROB, calculated via real-time market rates at the moment of payment. Seat deposits are permanent and non-refundable.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                3. Mandatory Wallet Age Policy (1 October 2026)
              </h3>
              <p className="text-slate-400 pl-5">
                In accordance with protocol security policy, participating wallets must be created on or after 1 October 2026 as verified by on-chain activation timestamps on the TrobChain network. Wallets created before 1 October 2026 are strictly ineligible.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                4. Resource Staking & Equora Super Representative (SR) Governance
              </h3>
              <p className="text-slate-400 pl-5">
                Participating members must maintain eligible network resource staking (Energy and Bandwidth calculated dynamically to cover 50 daily free transactions) and actively vote for the official Equora_Fi SR: <code className="bg-slate-800 text-blue-300 px-1 py-0.5 rounded text-[10px]">TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY</code>.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                5. 5X Earnings Cap & Dividend Distribution
              </h3>
              <p className="text-slate-400 pl-5">
                Each Genesis Council seat is entitled to equal 300/N treasury dividend yield up to a 5X cap ($1,500.00 USD total earnings). Dividends are autonomously pushed on-chain or claimable from treasury reserves.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                6. Official Community Channel Membership
              </h3>
              <p className="text-slate-400 pl-5">
                Members must remain connected to the official EQUORA DAO WhatsApp group for critical governance announcements, security updates, and protocol voting sync.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-[#071120] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
          {onAccept && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              I Understand & Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
