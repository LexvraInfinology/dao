"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract, useChainId } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/btitan/useUserProfile";
import deployedContracts from "../../contracts/deployedContracts";
import { notification } from "../../utils/scaffold-eth/notification";
import { useJoinMatrix } from "../../hooks/btitan/useJoinMatrix";

export default function RegisterPage() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const registryContract = contracts?.EquoraRegistry;

  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  const { isAuthenticated, isAuthenticating, loginWithSignature } = useAuth();
  const { profile } = useUserProfile(address);

  const [sponsorInput, setSponsorInput] = useState("");

  const isNumericCode = /^\d+$/.test(sponsorInput.trim());
  const sponsorCode = isNumericCode ? Number(sponsorInput.trim()) : 0;

  // Resolve 5-digit sponsor code if provided
  const { data: resolvedSponsorAddress } = useReadContract({
    address: registryContract?.address as `0x${string}`,
    abi: registryContract?.abi,
    functionName: "codeToUser",
    args: sponsorCode > 0 ? [sponsorCode] : undefined,
    query: { enabled: !!registryContract?.address && sponsorCode > 0 },
  });

  const { isApproving, isJoining, handleJoinSlot } = useJoinMatrix(1, undefined, () => {
    notification.success("🚀 Node activated & registered successfully on-chain!");
    router.push("/dashboard");
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get("ref");
      if (refParam) {
        setSponsorInput(refParam);
      }
    }
  }, []);

  useEffect(() => {
    if (profile?.isRegistered && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [profile?.isRegistered, isAuthenticated, router]);

  const handleOnChainRegistration = async () => {
    if (!isConnected || !address) {
      if (openConnectModal) openConnectModal();
      return;
    }

    if (!isAuthenticated) {
      const signed = await loginWithSignature();
      if (!signed) return;
    }

    let finalSponsor = "0x0000000000000000000000000000000000000000";
    if (isNumericCode && resolvedSponsorAddress && resolvedSponsorAddress !== "0x0000000000000000000000000000000000000000") {
      finalSponsor = resolvedSponsorAddress as string;
    } else if (/^0x[0-9a-fA-F]{40}$/.test(sponsorInput.trim())) {
      finalSponsor = sponsorInput.trim();
    }

    await handleJoinSlot(1, finalSponsor);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-surface-container/85 backdrop-blur-3xl border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <div className="flex items-center gap-3.5 mb-6 border-b border-outline-variant/15 pb-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-primary/30 shadow-md bg-surface-container shrink-0 p-1">
            <img
              src="/assets/branding/equorafilogo.jpeg"
              alt="EQUORA.FI Logo"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <h2 className="text-lg font-headline-md font-bold text-on-surface tracking-tight">EQUORA.FI REGISTRATION</h2>
            <p className="text-[10px] font-label-md text-primary tracking-widest uppercase font-bold">
              Autonomous Node Onboarding
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                Sponsor ID or Address (Optional)
              </label>
              {isNumericCode && (
                <span className="text-[10px] font-code text-tertiary font-bold">
                  {resolvedSponsorAddress && resolvedSponsorAddress !== "0x0000000000000000000000000000000000000000"
                    ? "✓ Verified ID"
                    : "Checking ID..."}
                </span>
              )}
            </div>
            <input
              type="text"
              value={sponsorInput}
              onChange={(e) => setSponsorInput(e.target.value)}
              placeholder="5-digit ID (e.g. 10000) or 0x address"
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-xs font-code text-on-surface placeholder:text-outline outline-none focus:border-primary transition-colors"
            />
            <p className="text-[11px] text-on-surface-variant/80">
              One-time entry: <strong>30 TROB</strong>. Automatically activates Matrix Slot 1 and grants perpetual referral earnings.
            </p>
          </div>

          {!isConnected ? (
            <button
              onClick={openConnectModal}
              className="w-full py-4 bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container rounded-xl font-label-md text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              <span>Connect Web3 Wallet</span>
            </button>
          ) : (
            <button
              onClick={handleOnChainRegistration}
              disabled={isApproving || isJoining || isAuthenticating}
              className="w-full py-4 bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container rounded-xl font-label-md text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>
                {isApproving
                  ? "Approving 30 TROB..."
                  : isJoining
                  ? "Registering On-Chain..."
                  : isAuthenticating
                  ? "Signing Challenge..."
                  : "Activate Node (30 TROB)"}
              </span>
            </button>
          )}

          <div className="text-center pt-2">
            <button
              onClick={() => router.push("/login")}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Already registered? Enter Terminal Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
