'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const LandingFaq: React.FC = () => {
  // Default second item open matching Figma reference
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  const faqs = [
    {
      q: 'What is a Genesis Council Seat?',
      a: 'A Genesis Council Seat is one of exactly 100 sovereign founding positions in the EQUORA DAO. Seat holders receive lifetime governance rights, a proportional share of the global dividend pool, and instant cashback upon entering the queue.',
    },
    {
      q: 'How does the 300 / N cashback formula work?',
      a: 'When you deposit 300 TROB to claim Seat #N, the smart contract splits the entire 300 TROB equally among all N active members (including you). You receive 300 / N TROB instant cashback directly to your wallet in the same transaction block, and every prior member (Seat 1 to N-1) simultaneously receives 300 / N TROB pushed directly to their wallets. For example: Member 1 gets 300 / 1 = 300 TROB (100% instant cashback); Member 2 gets 300 / 2 = 150 TROB (and Member 1 gets 150 TROB); Member 100 gets 300 / 100 = 3 TROB (and all 100 members each receive 3 TROB).',
    },
    {
      q: 'When is Retail Matrix launching?',
      a: 'Retail Matrix will launch immediately after all 100 Genesis Council seats are claimed and finalized. Genesis members will hold primary matrix root nodes with exclusive spillover benefits.',
    },
    {
      q: 'Can I transfer or trade my Council Seat?',
      a: 'No. Each Genesis Council Seat is minted as a Soulbound (Non-Transferable) ERC-721 NFT permanently linked to your wallet address. It cannot be sold, traded, or transferred on secondary markets, guaranteeing that voting power (1 seat = 1 vote = 1.0%) and council membership remain Sybil-resistant and merit-based.',
    },
    {
      q: 'What happens after all 100 seats are filled?',
      a: 'Once all 100 seats are locked, the Genesis Queue closes permanently. The DAO transitions into full governance mode, activating the Retail Matrix and initiating regular treasury dividend distributions.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#FFFFFF] relative overflow-hidden border-b border-slate-200/80">
      <div className="max-w-[960px] mx-auto px-4 sm:px-8 relative z-10">
        {/* Top Header */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#EFF8FF] border border-[#D1E9FF]">
            <span className="text-[12px] font-semibold tracking-wider text-[#155EEF] font-inter uppercase">
              FAQ
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold font-inter text-[#0B132B] leading-[1.12] tracking-tight">
            Got<br />
            <span className="text-[#155EEF]">Questions?</span>
          </h2>

          <p className="text-[15px] sm:text-[16px] text-[#475467] leading-relaxed font-inter max-w-xl mx-auto">
            Everything you need to know about the Genesis Queue, Council Seats, and Protocol Governance.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.q}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#B2CCFF] shadow-[0_8px_25px_rgba(21,94,239,0.06)]'
                    : 'bg-[#F8FAFC] border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isOpen
                          ? 'bg-[#155EEF] text-white'
                          : 'bg-white border border-slate-200 text-[#155EEF]'
                      }`}
                    >
                      ?
                    </div>
                    <span className="text-base sm:text-lg font-bold font-inter text-[#0B132B]">
                      {faq.q}
                    </span>
                  </div>

                  <div className="shrink-0 text-[#155EEF]">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-[14px] sm:text-[15px] text-[#475467] leading-relaxed font-inter border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
