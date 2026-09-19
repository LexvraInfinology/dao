"use client";

import React, { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: "What is EQUORA_Fi?",
    answer:
      "EQUORA_Fi is a fully autonomous, decentralized financial protocol. Engineered without administrative backdoors or centralized custodians, every matrix slot cycle, staking yield, and DAO governance vote executes directly onchain via audited smart contracts.",
  },
  {
    question: "How do the matrix referral cycles work?",
    answer:
      "Each matrix slot operates on an automated peer-to-peer distribution algorithm. As members join and slots fill, positions automatically pool together to fund subsequent level upgrades while returning perpetual 700% cash yield directly to your wallet.",
  },
  {
    question: "What are the requirements to join the Genesis DAO?",
    answer:
      "The Genesis DAO Council is strictly limited to 100 sovereign seats. To qualify, members must hold 2 direct active referrals and complete the qualifying deposit tier before the 15-day seat window closes.",
  },
  {
    question: "Is my deposit locked or flexible?",
    answer:
      "Our protocol offers both flexible staking pools with instant withdrawals and locked milestone vaults (such as the 3-Month Magic Box) that grant multiplied staking rewards and monthly salary allocations.",
  },
  {
    question: "How do I claim my staking rewards?",
    answer:
      "Rewards and recycle payouts are dispatched instantaneously to your connected Web3 wallet (MetaMask, Trust Wallet, etc.) upon execution. There are zero manual withdrawal approvals or delays.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24 bg-[#F0F4F8] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="text-[#2563EB] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3 block">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-[#0A1628] tracking-tight leading-[1.12] mb-3 sm:mb-4">
            Got <span className="text-[#2563EB]">Questions?</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#475569] max-w-lg mx-auto leading-relaxed">
            Everything you need to know about the EQUORA protocol, matrix cycles, and DAO governance.
          </p>
        </div>

        {/* Accordion List matching Figma */}
        <div className="space-y-3.5">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[#2563EB] bg-white shadow-md shadow-blue-500/5 ring-1 ring-[#2563EB]/20"
                    : "border-[#E2E8F0] bg-white/90 hover:border-slate-300 shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleIndex(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-[#0A1628] hover:text-[#2563EB] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold">{item.question}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 shrink-0 ${
                      isOpen ? "bg-[#2563EB] text-white rotate-180" : "bg-[#EFF6FF] text-[#2563EB]"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-[#64748B] text-xs sm:text-sm leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-200">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
