'use client';

import React from 'react';

interface TransactionsHeroProps {
  totalTransactions?: number;
  bttPriceUsd?: number;
}

export const TransactionsHero: React.FC<TransactionsHeroProps> = ({
  totalTransactions,
  bttPriceUsd,
}) => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E2ECF9] shadow-[0_4px_25px_rgba(15,23,42,0.03)]">
      <div className="ambient-glow top-0 right-1/4 w-96 h-96 bg-blue-400/10 pointer-events-none" />

      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between p-8 lg:p-10 relative z-10 min-h-[220px]">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60">
            <span className="text-[11px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">TRANSACTIONS</span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-black font-jakarta tracking-tight pt-1 leading-tight">
            <span className="text-[#071A4A] block">Every Move.</span>
            <span className="text-[#155EEF] block">On-Chain</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#4F6184] leading-relaxed font-jakarta max-w-md pt-0.5">
            Track all DAO transactions in one place. Transparent, Verifiable, Always on-chain.
          </p>
          {totalTransactions !== undefined && (
            <div className="flex items-center gap-3 pt-1 text-xs font-jakarta">
              <span className="font-black text-[#071A4A] text-base">{totalTransactions.toLocaleString()}</span>
              <span className="text-[#60739A]">total transactions</span>
              {bttPriceUsd && (
                <>
                  <span className="text-[#CBD5E1]">·</span>
                  <span className="text-[#60739A]">TROB @ <span className="font-bold text-[#071A4A]">${bttPriceUsd.toFixed(4)}</span></span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 xl:gap-8 shrink-0">
          <div className="relative w-9 h-9 xl:w-10 xl:h-10 shrink-0 mb-8 animate-float">
            <img src="/dao/Compact 3D Octahedron Visual.png" alt="3D Cube"
              className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(21,94,239,0.35)]" />
          </div>
          <div className="relative w-48 h-36 xl:w-52 xl:h-40 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />
            <div className="relative w-full h-full flex items-center justify-center animate-float">
              <img src="/dao/Transactions_Ethereum_Jewel.png" alt="3D Ethereum Jewel"
                className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(21,94,239,0.3)]" />
            </div>
          </div>
          <div className="text-right space-y-3 select-none">
            <div className="space-y-0.5">
              {['PEOPLE', 'IDEAS', 'PROTOCOL', 'PROGRESS'].map((t) => (
                <div key={t} className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">{t}</div>
              ))}
            </div>
            <div className="space-y-0.5 pt-1">
              {['GOVERNANCE', 'FOR A BRIGHTER', 'TOMORROW'].map((t) => (
                <div key={t} className="text-[10px] font-black font-jakarta text-[#155EEF] uppercase tracking-wider">{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden flex items-center justify-between p-5 sm:p-6 gap-4 relative z-10">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60">
            <span className="text-[10px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">TRANSACTIONS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-jakarta tracking-tight leading-tight">
            <span className="text-[#071A4A] block">Every Move</span>
            <span className="text-[#155EEF] block">On-Chain</span>
          </h1>
          {totalTransactions !== undefined && (
            <p className="text-xs font-bold text-[#071A4A] font-jakarta">{totalTransactions.toLocaleString()} transactions</p>
          )}
          <p className="text-xs text-[#4F6184] leading-relaxed font-jakarta">Transparent, Verifiable, Always on-chain.</p>
        </div>
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <div className="absolute inset-1 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />
          <div className="relative w-24 h-24 animate-float">
            <img src="/dao/Transactions_Ethereum_Jewel.png" alt="3D Jewel"
              className="w-full h-full object-contain drop-shadow-[0_8px_18px_rgba(21,94,239,0.3)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
