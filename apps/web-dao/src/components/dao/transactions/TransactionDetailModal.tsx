'use client';

import React, { useState } from 'react';
import {
  X, Check, Copy, ExternalLink, ShieldCheck, Zap, Armchair,
  ArrowDownLeft, ArrowUpRight, Clock, Box, Layers, Building2, Wallet, Info
} from 'lucide-react';
import type { TransactionItem } from '@/hooks/useApi';
import { getExplorerTxUrl, getExplorerAddressUrl, getExplorerBlockUrl } from '@/utils/explorer';
import { formatUsd, formatTrob } from '@/utils/formatAmount';
import { NETWORK_NAME } from '@/config/env';

interface TransactionDetailModalProps {
  tx: TransactionItem | null;
  onClose: () => void;
  activeAddress?: string | null;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  tx,
  onClose,
  activeAddress,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!tx) return null;

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const canonicalUser = activeAddress?.toLowerCase() || '';
  const isToMe = canonicalUser && tx.to.toLowerCase() === canonicalUser;
  const isFromMe = canonicalUser && tx.from.toLowerCase() === canonicalUser;

  const trobAmt = tx.amountTrob ?? tx.amountBtt ?? 0;
  const isPositive = tx.isPositive;
  const pos = tx.incomingPosition;

  // Human readable date format
  const dateObj = new Date(tx.timestamp);
  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toUTCString().replace('GMT', 'UTC')
    : tx.timestamp;

  const isDividend = tx.type === 'pushed' || (tx.typeLabel && tx.typeLabel.toLowerCase().includes('dividend'));
  const isCashback = tx.typeLabel && tx.typeLabel.toLowerCase().includes('cashback');
  const isSeatJoined = tx.type === 'joined' || (tx.typeLabel && tx.typeLabel.toLowerCase().includes('activated'));
  const isRetopup = tx.type === 'retopup' || (tx.categoryBadge && tx.categoryBadge.toLowerCase().includes('retopup'));

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E2ECF9] rounded-3xl w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(15,23,42,0.3)] overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E2ECF9] bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDividend || isCashback
                ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669]'
                : isSeatJoined
                ? 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#155EEF]'
                : 'bg-amber-50 border border-amber-300 text-amber-700'
            }`}>
              {isDividend || isCashback ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : isSeatJoined ? (
                <Armchair className="w-5 h-5" />
              ) : (
                <Zap className="w-5 h-5 fill-amber-500 text-amber-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-jakarta text-[#071A4A]">
                {isDividend ? 'Dividend Payout Details' : isSeatJoined ? 'Council Seat Activation' : 'Transaction Details'}
              </h3>
              <p className="text-[11px] text-[#60739A] font-jakarta">Live On-Chain Ledger • {NETWORK_NAME}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 text-[#94A3B8] hover:text-[#071A4A] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 font-jakarta text-xs">
          {/* Amount Hero Card */}
          <div className={`rounded-2xl p-4 sm:p-5 border text-center space-y-1.5 ${
            isPositive
              ? 'bg-gradient-to-b from-[#ECFDF5] to-emerald-50/30 border-[#A7F3D0]'
              : isPositive === false
              ? 'bg-gradient-to-b from-blue-50 to-slate-50 border-blue-200'
              : 'bg-gradient-to-b from-slate-50 to-white border-[#E2ECF9]'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isPositive
                  ? 'bg-emerald-100 text-[#059669] border border-emerald-300'
                  : 'bg-blue-100 text-[#155EEF] border border-blue-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-[#059669]' : 'bg-[#155EEF]'} animate-pulse`} />
                {isDividend ? 'Dividend Inflow Received' : isSeatJoined ? 'Capital Deposit Outflow' : tx.typeLabel}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#E2ECF9] text-[10px] font-bold text-[#64748B] shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-[#155EEF]" />
                On-Chain Confirmed
              </span>
            </div>

            <div className={`text-2xl sm:text-3xl font-black font-jakarta tracking-tight ${
              isPositive ? 'text-[#059669]' : isPositive === false ? 'text-[#071A4A]' : 'text-[#071A4A]'
            }`}>
              {isPositive ? '+' : isPositive === false ? '-' : ''}${formatUsd(tx.amountUsd)} USD
            </div>

            <div className="text-sm font-bold font-mono text-[#60739A]">
              {isPositive ? '+' : isPositive === false ? '-' : ''}{formatTrob(trobAmt)} TROB
            </div>

            {isToMe && (
              <div className="pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] font-bold text-[#059669]">
                  ✓ Deposited Directly Into Your Connected Wallet
                </span>
              </div>
            )}
          </div>

          {/* Educational Breakdown Card: Explaining the Dividend / Mechanics */}
          <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-[#071A4A] text-xs">
              <Info className="w-4 h-4 text-[#155EEF]" />
              <span>Smart Contract Distribution Mechanism</span>
            </div>

            {isCashback ? (
              <div className="space-y-1.5 text-[#4F6184] text-[11px] leading-relaxed">
                <p>
                  <strong className="text-[#071A4A]">Trigger Event:</strong> Council Seat #{pos || 'N'} joined the Equora DAO with a fixed $300 deposit.
                </p>
                <p>
                  <strong className="text-[#071A4A]">Instant Cashback Rule:</strong> Under the Equora DAO protocol rules, activating members receive an instant cashback portion of <strong>${formatUsd(tx.amountUsd)} USD ({formatTrob(trobAmt)} TROB)</strong> immediately credited back upon deposit confirmation.
                </p>
                <p>
                  <strong className="text-[#071A4A]">Verification:</strong> Dispatched autonomously by smart contract {tx.contractAddress ? tx.contractAddress.slice(0, 8) + '…' : 'EquoraDAO'} on {NETWORK_NAME}.
                </p>
              </div>
            ) : isDividend ? (
              <div className="space-y-1.5 text-[#4F6184] text-[11px] leading-relaxed">
                <p>
                  <strong className="text-[#071A4A]">Trigger Event:</strong> Council Seat #{pos || 'N'} joined the Equora DAO with a fixed $300 deposit.
                </p>
                <p>
                  <strong className="text-[#071A4A]">Automatic Distribution Rule:</strong> 35% of each incoming seat activation is mathematically allocated and pushed on-chain to earlier Council members (Seats 1 through {pos ? pos - 1 : 'N'}).
                </p>
                <p>
                  <strong className="text-[#071A4A]">Your Received Dividend:</strong> Because your council seat qualifies for this distribution, the EquoraDAO smart contract automatically credited <strong>+{formatTrob(trobAmt)} TROB (+${formatUsd(tx.amountUsd)} USD)</strong> directly to your wallet in the same transaction block.
                </p>
              </div>
            ) : isRetopup ? (
              <div className="space-y-1.5 text-[#4F6184] text-[11px] leading-relaxed">
                <p>
                  <strong className="text-[#071A4A]">Trigger Event:</strong> Council Seat #{pos || 'N'} reached the 5X earning cap ($1,500 USD) and executed a 5X retopup of $300.
                </p>
                <p>
                  <strong className="text-[#071A4A]">Retopup Distribution Rule:</strong> The retopup capital is pooled and redistributed on-chain across active council members according to automated DAO rules.
                </p>
                <p>
                  <strong className="text-[#071A4A]">Your Share:</strong> <strong>${formatUsd(tx.amountUsd)} USD ({formatTrob(trobAmt)} TROB)</strong> confirmed on TrobChain.
                </p>
              </div>
            ) : isSeatJoined ? (
              <div className="space-y-1.5 text-[#4F6184] text-[11px] leading-relaxed">
                <p>
                  <strong className="text-[#071A4A]">Seat Activation:</strong> Council Seat #{pos} was activated on {NETWORK_NAME} with the required $300.00 USD fixed deposit.
                </p>
                <p>
                  <strong className="text-[#071A4A]">Member Entitlements:</strong> Unlocks permanent Soulbound NFT ownership, DAO voting rights, and continuous automated dividend pushes from all subsequent seats joining the protocol.
                </p>
              </div>
            ) : (
              <p className="text-[#4F6184] text-[11px] leading-relaxed">
                {tx.note || tx.distributionFormula || 'This transaction was verified directly on the TrobChain blockchain smart contract ledger.'}
              </p>
            )}

            {tx.distributionFormula && (
              <div className="mt-2 p-2.5 rounded-xl bg-white border border-[#E2ECF9] font-mono text-[10.5px] text-[#155EEF] font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="break-all">{tx.distributionFormula}</span>
              </div>
            )}
          </div>

          {/* Cryptographic & On-Chain Audit Table */}
          <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 space-y-2.5">
            <div className="text-[11px] font-bold text-[#60739A] uppercase tracking-wider">
              On-Chain Cryptographic Proof
            </div>

            <div className="divide-y divide-[#F1F5F9] text-xs space-y-2">
              {/* Timestamp */}
              <div className="pt-2 flex justify-between items-center gap-2">
                <span className="text-[#60739A] shrink-0 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Time (UTC)
                </span>
                <span className="font-semibold text-[#071A4A] text-right">{formattedDate}</span>
              </div>

              {/* Seat Position */}
              {tx.incomingPosition && (
                <div className="pt-2 flex justify-between items-center gap-2">
                  <span className="text-[#60739A] shrink-0 flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5" />
                    Seat Position
                  </span>
                  <span className="font-bold text-[#155EEF] text-right font-jakarta bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                    Council Seat #{tx.incomingPosition}
                  </span>
                </div>
              )}

              {/* Block Number */}
              {tx.blockNumber && (
                <div className="pt-2 flex justify-between items-center gap-2">
                  <span className="text-[#60739A] shrink-0 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5" />
                    Block #
                  </span>
                  <a
                    href={getExplorerBlockUrl(tx.blockNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-[#155EEF] hover:underline flex items-center gap-1"
                  >
                    <span>#{tx.blockNumber}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Smart Contract */}
              <div className="pt-2 flex justify-between items-center gap-2">
                <span className="text-[#60739A] shrink-0 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Contract
                </span>
                <div className="flex items-center gap-1 font-mono text-right">
                  <a
                    href={getExplorerAddressUrl(tx.contractAddress || tx.from)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#155EEF] hover:underline truncate max-w-[180px] sm:max-w-[220px]"
                  >
                    {tx.contractAddress || 'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT'}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy('contract', tx.contractAddress || 'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT')}
                    className="p-1 rounded text-[#94A3B8] hover:text-[#155EEF]"
                    title="Copy Contract Address"
                  >
                    {copiedKey === 'contract' ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Recipient */}
              <div className="pt-2 flex justify-between items-center gap-2">
                <span className="text-[#60739A] shrink-0 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  Recipient (To)
                </span>
                <div className="flex items-center gap-1 font-mono text-right">
                  <a
                    href={getExplorerAddressUrl(tx.to)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-bold hover:underline truncate max-w-[180px] sm:max-w-[220px] ${
                      isToMe ? 'text-[#059669]' : 'text-[#071A4A]'
                    }`}
                  >
                    {tx.to}
                  </a>
                  {isToMe && (
                    <span className="px-1.5 py-0.2 rounded bg-[#ECFDF5] text-[#059669] font-bold text-[9px]">
                      You
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy('to', tx.to)}
                    className="p-1 rounded text-[#94A3B8] hover:text-[#155EEF]"
                    title="Copy Recipient Address"
                  >
                    {copiedKey === 'to' ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Transaction Hash */}
              <div className="pt-2 flex justify-between items-start gap-2">
                <span className="text-[#60739A] shrink-0 flex items-center gap-1.5 pt-0.5">
                  <Layers className="w-3.5 h-3.5" />
                  Tx Hash
                </span>
                <div className="flex items-center gap-1 font-mono text-right max-w-[220px] sm:max-w-[260px]">
                  <span className="text-[#071A4A] font-bold truncate">{tx.txHash}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('txHash', tx.txHash)}
                    className="p-1 rounded text-[#94A3B8] hover:text-[#155EEF] shrink-0"
                    title="Copy Transaction Hash"
                  >
                    {copiedKey === 'txHash' ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="p-4 sm:p-5 border-t border-[#E2ECF9] bg-[#F8FAFC] flex flex-col sm:flex-row items-center gap-2.5">
          <a
            href={getExplorerTxUrl(tx.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#155EEF] hover:bg-[#0052E6] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Verify on TrobScan Explorer</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-100 text-[#071A4A] font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
