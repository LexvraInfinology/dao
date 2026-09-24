'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (address: string) => void;
}

const WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    desc: 'Connect using browser extension or mobile app',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    desc: 'Connect with your Coinbase mobile or browser wallet',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    desc: 'Solana and multi-chain support',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    desc: 'Scan with Rainbow, Trust Wallet, or 300+ others',
  },
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  if (!isOpen) return null;

  const handleSelectWallet = (walletId: string) => {
    setConnecting(walletId);
    setTimeout(() => {
      setConnecting(null);
      setConnected(true);
      if (onConnect) {
        onConnect('0x8A3F...91F2');
      }
      setTimeout(() => {
        setConnected(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#0E1320] border border-cyan-500/30 p-6 shadow-2xl z-10 animate-scaleUp">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div>
            <h3 className="text-lg font-bold font-sora text-white">
              Connect Wallet
            </h3>
            <p className="text-xs text-gray-400">
              Access the EQUORA_Fi Genesis Protocol
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {connected ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-white font-bold font-sora">Wallet Connected!</h4>
            <p className="text-xs text-cyan-400 font-mono">0x8A3F...91F2</p>
            <p className="text-xs text-gray-400">Loading Genesis Council seat status...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {WALLETS.map((w) => (
              <button
                key={w.id}
                onClick={() => handleSelectWallet(w.id)}
                disabled={connecting !== null}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{w.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {w.name}
                    </div>
                    <div className="text-xs text-gray-400">{w.desc}</div>
                  </div>
                </div>
                {connecting === w.id ? (
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                )}
              </button>
            ))}

            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Only connect wallets you control. Genesis DAO seats require verification via Soulbound token signatures.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
