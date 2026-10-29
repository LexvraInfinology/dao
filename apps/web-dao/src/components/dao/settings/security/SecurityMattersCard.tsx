'use client';

import React from 'react';
import { Shield, KeyRound, FileCheck2, Database } from 'lucide-react';

export default function SecurityMattersCard() {
  return (
    <div className="rounded-3xl bg-white border border-[#E2ECF9] p-5 sm:p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta flex flex-col justify-between space-y-4 h-full relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute -top-3 -right-3 w-28 h-28 pointer-events-none opacity-20 lg:opacity-30">
        <img
          src="/dao/equoranewlogo.png"
          alt="EQUORA Emblem"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] mb-3">
          <Shield className="w-5 h-5" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#071A4A]">
          Your Security Matters
        </h3>
        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
          Your wallet controls access to your Genesis DAO account. Equora operates with self-custody principles.
        </p>
      </div>

      {/* Security Principles List */}
      <div className="relative z-10 space-y-2.5 pt-1">
        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
          <KeyRound className="w-4 h-4 text-[#155EEF] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#071A4A]">Non-Custodial Protocol: </span>
            <span className="text-[#64748B]">Equora never stores your keys or credentials.</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
          <FileCheck2 className="w-4 h-4 text-[#155EEF] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#071A4A]">Cryptographic Signatures: </span>
            <span className="text-[#64748B]">All actions require on-chain wallet signing.</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
          <Database className="w-4 h-4 text-[#155EEF] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#071A4A]">Immutable Governance: </span>
            <span className="text-[#64748B]">Proposals and votes are verified on Trobium.</span>
          </div>
        </div>
      </div>

      {/* Alert Note */}
      <div className="relative z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF]">
        <Shield className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[11px] sm:text-xs font-semibold">
          Equora will never ask for your seed phrase.
        </span>
      </div>
    </div>
  );
}
