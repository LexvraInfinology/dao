"use client";

import React, { useState } from "react";

export function FaqSection() {
  const [openFaqs, setOpenFaqs] = useState<number[]>([1, 2, 3, 4]);

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqItems = [
    {
      q: "What is Equimatrix (EQM)?",
      a: "Equimatrix is a next-generation decentralized matrix protocol engineered for automated yield generation, fair community spillovers, and transparent on-chain smart contract execution.",
    },
    {
      q: "How do spillovers and matrix cycles work?",
      a: "Equimatrix employs a decentralized binary matrix structure where active uplines and downlines automatically place partners into open slots in your matrix, accelerating cycle completion and generating passive returns.",
    },
    {
      q: "How do I participate and activate a tier?",
      a: "Simply connect your Web3 wallet (MetaMask, Trust Wallet, etc.), select the matrix tier you wish to join starting from Tier 1, and approve the activation transaction on-chain.",
    },
    {
      q: "Are the smart contracts audited and secure?",
      a: "Yes, all Equimatrix smart contracts are fully verified, immutable, and undergo comprehensive third-party security audits to ensure complete protocol safety.",
    },
    {
      q: "What currencies are supported for activation?",
      a: "Tiers are activated using USDT on supported networks, ensuring price stability while all cycle rewards and spillover bonuses are paid directly to your wallet in real time.",
    },
  ];

  return (
      <section
        id="faq"
        className="w-full pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-18 bg-[#f8fafc] relative z-10 scroll-mt-[70px]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-2 block">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-4">
              Got <span className="text-[#2563eb]">Questions?</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Find answers to common questions about Equimatrix, how the matrix
              system works, and how to start.
            </p>
          </div>

          {/* Accordion Container */}
          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqs.includes(idx);
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                    isOpen
                      ? "bg-white border-blue-200 ring-1 ring-blue-100"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 focus:outline-none"
                    suppressHydrationWarning
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                          isOpen
                            ? "bg-blue-100 text-blue-600"
                            : "bg-blue-50 text-blue-500"
                        }`}
                      >
                        ?
                      </div>
                      <span className="text-sm sm:text-base font-bold text-[#0f172a] leading-snug">
                        {item.q}
                      </span>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180 bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1 pt-3">
                      {item.a}
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
