"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { formatBTT } from "../../utils/btitan/matrixHelpers";
import { formatAddress } from "../../utils/btitan/formatters";
import { useMatrixData } from "../../hooks/btitan/useMatrixData";
import { useDAOData } from "../../hooks/btitan/useDAOData";
import { useWithdraw } from "../../hooks/btitan/useWithdraw";
import { useClaimFallback } from "../../hooks/btitan/useClaimFallback";
import { useClaimPoolShare } from "../../hooks/btitan/useClaimPoolShare";
import { AuthGuard } from "../../components/auth/AuthGuard";

export default function WalletPage() {
  return (
    <AuthGuard>
      <WalletContent />
    </AuthGuard>
  );
}

function WalletContent() {
  const { address } = useAccount();
  const { financials, refetch: refetchMatrix } = useMatrixData(address);
  const { memberInfo, refetch: refetchDAO } = useDAOData(address);
  const { withdrawFromMatrix, withdrawing } = useWithdraw();
  const { claim: claimFallback, isClaiming: isClaimingFallback } = useClaimFallback();
  const { claim: claimPoolShare, isClaiming: isClaimingPoolShare } = useClaimPoolShare(() => refetchDAO());

  const matrixAvailable = financials?.availableBalance ?? 0n;
  const daoFallbackClaimable = memberInfo?.totalClaimable ?? 0n;
  const poolShareClaimable = memberInfo?.poolShareClaimable ?? 0n;
  const totalDaoAvailable = daoFallbackClaimable + poolShareClaimable;

  const handleAddTokenToMetaMask = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const tokenAddress = process.env.NEXT_PUBLIC_BTT_ADDRESS || "0x34B40BA116d5Dec75548a9e9A8f15411461E8c70";
        await (window as any).ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: tokenAddress,
              symbol: "TROB",
              decimals: 18,
            },
          },
        });
        toast.success("TROB Token imported to wallet!");
      } else {
        toast.error("Web3 wallet extension not detected");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to add token");
    }
  };

  const handleWithdrawMatrix = async () => {
    if (matrixAvailable <= 0n) {
      toast.error("No Matrix balance available to withdraw");
      return;
    }
    await withdrawFromMatrix(matrixAvailable);
    refetchMatrix();
  };

  const handleClaimDAOEarnings = async () => {
    try {
      if (poolShareClaimable > 0n) {
        await claimPoolShare();
        toast.success("🎉 Matrix DAO Yield successfully claimed!");
        refetchDAO();
      }
      if (daoFallbackClaimable > 0n) {
        await claimFallback();
        toast.success("🎉 DAO Fallback successfully claimed!");
        refetchDAO();
      }
      if (poolShareClaimable === 0n && daoFallbackClaimable === 0n) {
        toast("Genesis DAO payouts are pushed automatically into your wallet upon each join!");
      }
    } catch (err: any) {
      toast.error(err?.shortMessage || err?.message || "Claim failed");
    }
  };

  return (
    <div className="flex flex-col w-full p-4 sm:p-8 md:p-12 font-body-md text-on-surface">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 w-full max-w-container-max mx-auto">
        {/* ─── Left Main Column ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-8 lg:gap-12">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-headline-xl font-headline-xl font-black text-on-surface">
              Treasury Wallet
            </h1>
            <p className="text-sm sm:text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Manage your Matrix and Genesis DAO earnings. Execute withdrawals seamlessly to your connected Web3 wallet.
            </p>
          </div>

          {/* Dual Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Matrix Earnings Card */}
            <div className="relative bg-surface-container rounded-2xl p-6 sm:p-8 overflow-hidden shadow-xl border border-primary/20 backdrop-blur-xl">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                    Matrix Earnings
                  </span>
                  <span className="material-symbols-outlined text-primary">grid_view</span>
                </div>
                <div className="text-2xl sm:text-headline-xl font-headline-xl font-black text-on-surface">
                  {formatBTT(matrixAvailable)} <span className="text-lg sm:text-headline-md font-bold text-primary">TROB</span>
                </div>
                <div className="text-xs text-on-surface-variant">Available for immediate push settlement</div>
                <button
                  onClick={handleWithdrawMatrix}
                  disabled={withdrawing === "matrix" || matrixAvailable === 0n}
                  className="mt-4 sm:mt-6 w-full py-4 bg-secondary-container text-on-secondary-container rounded-lg font-label-md text-xs font-bold uppercase tracking-wider shadow-md hover:bg-secondary-container/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span>{withdrawing === "matrix" ? "WITHDRAWING..." : "WITHDRAW MATRIX EARNINGS"}</span>
                </button>
              </div>
            </div>

            {/* Genesis DAO Yield Card */}
            <div className="relative bg-surface-container rounded-2xl p-6 sm:p-8 overflow-hidden shadow-xl border border-tertiary/20 backdrop-blur-xl">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                    Genesis DAO Yield
                  </span>
                  <span className="material-symbols-outlined text-tertiary">account_balance</span>
                </div>
                <div className="text-2xl sm:text-headline-xl font-headline-xl font-black text-on-surface">
                  {formatBTT(totalDaoAvailable)} <span className="text-lg sm:text-headline-md font-bold text-tertiary">TROB</span>
                </div>
                <div className="text-xs text-on-surface-variant">Claimable council & recycle distributions</div>
                <button
                  onClick={handleClaimDAOEarnings}
                  disabled={isClaimingFallback || isClaimingPoolShare || totalDaoAvailable === 0n}
                  className="mt-4 sm:mt-6 w-full py-4 bg-surface-bright border border-outline-variant text-on-surface rounded-lg font-label-md text-xs font-bold uppercase tracking-wider shadow-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-tertiary text-[18px]">account_balance_wallet</span>
                  <span>{isClaimingFallback || isClaimingPoolShare ? "CLAIMING..." : "CLAIM DAO YIELD"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Wallet Tools */}
          <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-headline-md text-on-surface font-bold">Wallet Tools</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <button
                onClick={handleAddTokenToMetaMask}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-variant hover:bg-surface-bright transition-colors text-left group border border-outline-variant/20"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-on-surface">Add TROB to MetaMask</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">Import token contract</div>
                </div>
              </button>

              <a
                href={`https://etherscan.io/address/${address || ""}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-variant hover:bg-surface-bright transition-colors text-left group border border-outline-variant/20"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-primary">link</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-on-surface">Contract Details</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">View on Block Explorer</div>
                </div>
              </a>
            </div>
          </div>

          {/* Recent Settlements Activity */}
          <div className="flex flex-col gap-4 mt-2">
            <h3 className="text-lg font-headline-md text-on-surface font-bold">Recent Settlements</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-on-surface">Instant Push Settlement</div>
                    <div className="text-[11px] text-on-surface-variant">Cycle 1 // Matrix P1</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-bold text-green-400">+ 30.00 TROB</div>
                  <div className="text-[11px] text-primary font-code">{address ? formatAddress(address) : "0x000...000"}</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-on-surface">Instant Push Settlement</div>
                    <div className="text-[11px] text-on-surface-variant">Cycle 1 // Matrix P2</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-bold text-green-400">+ 30.00 TROB</div>
                  <div className="text-[11px] text-primary font-code">{address ? formatAddress(address) : "0x000...000"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Sidebar (320px width) ─────────────────────────────────── */}
        <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-surface-container rounded-2xl p-6 border border-primary/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-surface-bright border border-primary/30 flex items-center justify-center p-2 mb-1 overflow-hidden shadow-inner">
                <img
                  alt="EQUORA Secure Sentinel"
                  className="w-full h-full object-cover rounded-xl"
                  src="/assets/branding/equorafilogo.jpeg"
                />
              </div>
              <h4 className="text-base font-headline-md font-bold text-on-surface">EQUORA Sentinel</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your transactions execute autonomously via immutable, non-custodial smart contracts.
              </p>
              <div className="w-full bg-surface-container-lowest rounded-lg p-3 mt-1 border border-outline-variant/30 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-on-surface font-code font-bold">NETWORK STABLE</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
            <h4 className="text-sm font-bold text-on-surface mb-3">Security Notice</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Always verify your connected wallet address. EQUORA_Fi executes direct non-custodial transactions on-chain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
