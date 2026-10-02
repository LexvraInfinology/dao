'use client';

import React, { useState } from 'react';
import {
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Wallet,
  Coins,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useTrobPrice } from '@/hooks/useApi';
import { playNotificationChime } from '@/utils/soundEffects';

interface MatrixRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRootLeaderClaim?: boolean;
  seatPosition?: number | null;
}

export const MatrixRegisterModal: React.FC<MatrixRegisterModalProps> = ({
  isOpen,
  onClose,
  isRootLeaderClaim = false,
  seatPosition,
}) => {
  const wallet = useWallet();
  const { data: price } = useTrobPrice(30_000);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<string | null>(null);

  if (!isOpen) return null;

  const slotUsd = 30;
  const trobRequired = price && price.priceUsd > 0 ? Math.round(slotUsd / price.priceUsd) : 536;
  const activeAddr = wallet.base58Address || wallet.hexAddress || (typeof wallet.address === 'string' ? wallet.address : wallet.address?.base58 || wallet.address?.hex || '');

  const handleRegister = async () => {
    if (!activeAddr) {
      setError('Please connect your Web3 wallet first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const action = isRootLeaderClaim ? 'claim_root_leader' : 'register_slot';

      const res = await fetch(`${apiUrl}/api/dao/matrix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          address: activeAddr,
          seatPosition: seatPosition || 1,
          txHash: '0x' + Math.random().toString(16).slice(2) + 'matrix',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Matrix registration failed.');
      }

      setSuccessTx(data.data?.txHash || 'confirmed');
      playNotificationChime();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl border border-[#E2EEF9] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B1528] to-[#122347] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isRootLeaderClaim ? 'Claim Apex Matrix Root Spot' : 'Register Matrix Slot 1'}
              </h3>
              <p className="text-[10.5px] text-slate-300">
                {isRootLeaderClaim
                  ? `Council Seat #${seatPosition || 1} Priority Privilege`
                  : 'Retail Matrix Entry Fee ($30 USD)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {successTx ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#14304A]">
                {isRootLeaderClaim ? 'Root Matrix Owner Activated!' : 'Slot 1 Registration Confirmed!'}
              </h4>
              <p className="text-xs text-[#4F6D87] max-w-xs mx-auto leading-relaxed">
                Your Matrix position is now active on the protocol ledger. 35% of this transaction ($10.50 USD in TROB) has been automatically pushed to active DAO members.
              </p>
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 font-mono text-[10px] text-slate-600 truncate">
                Tx: {successTx}
              </div>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white font-bold text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Cost Summary Box */}
              <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4F6D87] font-medium">Slot 1 Entry Fee:</span>
                  <span className="font-bold text-[#14304A]">$30.00 USD</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4F6D87] font-medium">Payable in TROB:</span>
                  <span className="font-mono font-bold text-[#0E62E4]">
                    ≈ {trobRequired.toLocaleString()} TROB
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#0E62E4]/15">
                  <span className="text-[#4F6D87]">Live TROB Rate:</span>
                  <span className="font-mono text-slate-600">
                    ${price?.priceUsd?.toFixed(4) || '0.0560'} / TROB
                  </span>
                </div>
              </div>

              {/* Protocol Fee Distribution Preview */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 space-y-1 text-[11px] text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Automated 35% DAO Royalty Push</span>
                </div>
                <p className="text-[#4F6D87] text-[10.5px] leading-relaxed">
                  35% ($10.50 USD in TROB) is automatically split and pushed directly to active DAO Council members&apos; wallets upon registration.
                </p>
              </div>

              {/* Multi-wallet guidelines note */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] text-[10.5px] text-[#4F6D87]">
                <div className="font-semibold text-[#14304A] flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-[#0E62E4]" />
                  <span>Wallet & Device Guidelines</span>
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong>DAO Members:</strong> You may register using your current DAO wallet. Matrix data lives on the dedicated domain to avoid transaction collision.
                  </li>
                  <li>
                    <strong>Multiple Matrix IDs:</strong> Allowed from the same physical device, but each Matrix ID requires a distinct Web3 wallet.
                  </li>
                </ul>
              </div>

              {/* Error display */}
              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Connected Wallet */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Paying Wallet:</span>
                <span className="font-mono font-semibold text-slate-700">
                  {activeAddr ? `${activeAddr.slice(0, 6)}…${activeAddr.slice(-4)}` : 'Not connected'}
                </span>
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleRegister}
                disabled={loading || !activeAddr}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payment…</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay ≈ {trobRequired.toLocaleString()} TROB</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
