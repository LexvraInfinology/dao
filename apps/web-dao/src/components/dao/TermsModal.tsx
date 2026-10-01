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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white text-[#17334F] rounded-2xl sm:rounded-3xl border border-[#E2ECF9] shadow-[0_25px_60px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#E2ECF9] flex items-center justify-between bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFD] to-white">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0E62E4]/10 border border-[#0E62E4]/20 flex items-center justify-center text-[#0E62E4] shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#17334F] tracking-tight font-inter">Terms & Conditions</h2>
              <p className="text-[11px] sm:text-xs text-[#4F6D87] font-sans">EQUORA Genesis Council Seat Agreement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-[#17334F] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs text-[#334155] leading-relaxed font-sans select-text">
          <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#0E62E4]/20 text-[#0E62E4] space-y-1">
            <p className="font-bold text-[13px] text-[#0E62E4] font-inter">Genesis Sovereign Council Agreement</p>
            <p className="text-[11px] text-[#4F6D87]">
              By participating in EQUORA Genesis DAO, you agree to the decentralized protocol rules enforced autonomously by on-chain smart contracts.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <h3 className="font-bold text-[#17334F] text-xs flex items-center gap-1.5 font-inter">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E62E4] shrink-0" />
                1. Sovereign Seat & Fixed Cap
              </h3>
              <p className="text-[#4F6D87] pl-5">
                The Genesis Council is strictly limited to 100 immutable seats. Once all 100 seats are claimed, no additional Genesis seats can ever be created.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-[#17334F] text-xs flex items-center gap-1.5 font-inter">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E62E4] shrink-0" />
                2. Entry Fee & Real-Time Peg
              </h3>
              <p className="text-[#4F6D87] pl-5">
                Each seat requires a one-time entry payment pegged to $300.00 USD worth of TROB, calculated via real-time market rates at the moment of payment. Seat deposits are permanent and non-refundable.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-[#17334F] text-xs flex items-center gap-1.5 font-inter">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E62E4] shrink-0" />
                3. Mandatory Wallet Age Policy (1 October 2026)
              </h3>
              <p className="text-[#4F6D87] pl-5">
                In accordance with protocol security policy, participating wallets must be created on or after 1 October 2026 as verified by on-chain activation timestamps on the TrobChain network. Wallets created before 1 October 2026 are strictly ineligible.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-[#17334F] text-xs flex items-center gap-1.5 font-inter">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E62E4] shrink-0" />
                4. Resource Staking & Equora Super Representative (SR) Governance
              </h3>
              <p className="text-[#4F6D87] pl-5">
                Participating members must maintain eligible network resource staking (Energy and Bandwidth calculated dynamically to cover 50 daily free transactions) and actively vote for the official Equora_Fi SR: <code className="bg-[#EFF6FF] text-[#0E62E4] border border-[#0E62E4]/20 px-1.5 py-0.5 rounded text-[10px] font-mono">TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY</code>.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-[#17334F] text-xs flex items-center gap-1.5 font-inter">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E62E4] shrink-0" />
                5. 5X Earnings Cap & Dividend Distribution
              </h3>
              <p className="text-[#4F6D87] pl-5">
                Each Genesis Council seat is entitled to equal 300/N treasury dividend yield up to a 5X cap ($1,500.00 USD total earnings). Dividends are autonomously pushed on-chain or claimable from treasury reserves.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-[#17334F] text-xs flex items-center gap-1.5 font-inter">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E62E4] shrink-0" />
                6. Official Community Channel Membership
              </h3>
              <p className="text-[#4F6D87] pl-5">
                Members must remain connected to the official EQUORA DAO WhatsApp group for critical governance announcements, security updates, and protocol voting sync.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E2ECF9] bg-[#F8FAFD] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-[#17334F] hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer font-sans"
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
              className="px-6 py-2.5 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white text-xs font-bold transition-all shadow-sm cursor-pointer font-sans"
            >
              I Understand & Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
