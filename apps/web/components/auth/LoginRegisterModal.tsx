"use client";

import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/equora/useUserProfile";
import deployedContracts from "../../contracts/deployedContracts";
import { notification } from "../../utils/scaffold-eth/notification";

interface LoginRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "register" | "login";
}

export function LoginRegisterModal({
  isOpen,
  onClose,
  defaultTab = "register",
}: LoginRegisterModalProps) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  const { isAuthenticated, isAuthenticating, loginWithSignature } = useAuth();
  const { profile } = useUserProfile(address);

  const [tab, setTab] = useState<"register" | "login">(defaultTab);
  const [sponsorInput, setSponsorInput] = useState("");
  const [isRegisteringOnChain, setIsRegisteringOnChain] = useState(false);

  // Contract write for on-chain registration
  const { writeContractAsync, data: txHash } = useWriteContract();
  const { isLoading: isTxPending } = useWaitForTransactionReceipt({ hash: txHash });

  const contracts = (deployedContracts as any)[chainId];
  const vaultContract = contracts?.EquoraVault;
  const registryContract = contracts?.EquoraRegistry;

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
    setTab(defaultTab);
  }, [defaultTab]);

  if (!isOpen) return null;

  // Step 1: Handle Cryptographic Signature Handshake
  const handleSignatureAuth = async () => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return;
    }
    const success = await loginWithSignature();
    if (success && tab === "login") {
      onClose();
      router.push("/dashboard");
    }
  };

  // Step 2: Handle On-Chain User Registration
  const handleOnChainRegistration = async () => {
    if (!isConnected || !address) {
      if (openConnectModal) openConnectModal();
      return;
    }

    if (!isAuthenticated) {
      const signed = await loginWithSignature();
      if (!signed) return;
    }

    if (profile?.isRegistered) {
      notification.info("You are already registered! Navigating to dashboard...");
      onClose();
      router.push("/dashboard");
      return;
    }

    // Default root sponsor code (10000) if empty or invalid
    const isFiveDigits = /^\d{5}$/.test(sponsorInput.trim());
    const sponsorCodeToUse = isFiveDigits ? parseInt(sponsorInput.trim(), 10) : 10000;

    if (!vaultContract?.address) {
      notification.success("🚀 Authenticated! Welcome to Equora Terminal.");
      onClose();
      router.push("/dashboard");
      return;
    }

    setIsRegisteringOnChain(true);
    const toastId = notification.loading("Broadcasting registration via EquoraVault...");

    try {
      await writeContractAsync({
        address: vaultContract.address as `0x${string}`,
        abi: vaultContract.abi,
        functionName: "register",
        args: [sponsorCodeToUse, parseEther("30")],
      });

      notification.dismiss(toastId);
      notification.success("🚀 Registered successfully on-chain! Welcome to Equora Terminal.");
      setIsRegisteringOnChain(false);
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      notification.dismiss(toastId);
      const msg = err?.shortMessage || err?.message || "Registration transaction failed.";
      notification.error(msg);
      setIsRegisteringOnChain(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150" onClick={onClose}>
      <div
        className="bg-surface-container-high border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/30 shadow-md bg-surface-container shrink-0 p-0.5">
              <img
                src="/assets/branding/equorafilogo.jpeg"
                alt="EQUORA.FI"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-base font-headline-md font-bold text-on-surface">EQUORA.FI PORTAL</h3>
              <p className="text-[10px] font-label-md text-primary tracking-widest uppercase font-bold">
                Cryptographic Authentication
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-highest text-outline hover:text-on-surface flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-surface-container rounded-xl border border-outline-variant/20 mb-6">
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold font-label-md uppercase tracking-wider transition-all ${
              tab === "register"
                ? "bg-secondary-container text-on-secondary-container shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Register
          </button>
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold font-label-md uppercase tracking-wider transition-all ${
              tab === "login"
                ? "bg-primary/20 text-primary border border-primary/30 shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Member Login
          </button>
        </div>

        {/* Security Checklist Status */}
        <div className="bg-surface-container-lowest/80 rounded-2xl p-4 border border-outline-variant/15 space-y-2 mb-6 text-xs font-code">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">1. Wallet Connection</span>
            <span className={isConnected ? "text-green-400 font-bold" : "text-amber-400 font-bold"}>
              {isConnected ? "CONNECTED" : "PENDING"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">2. Cryptographic Handshake</span>
            <span className={isAuthenticated ? "text-green-400 font-bold" : "text-amber-400 font-bold"}>
              {isAuthenticated ? "VERIFIED" : "REQUIRED"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">3. On-Chain Registration</span>
            <span className={profile?.isRegistered ? "text-green-400 font-bold" : "text-outline"}>
              {profile?.isRegistered ? "REGISTERED" : "NEW NODE"}
            </span>
          </div>
        </div>

        {/* Form Body */}
        {tab === "register" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                Sponsor 5-Digit Referral Code (Optional)
              </label>
              <input
                type="text"
                value={sponsorInput}
                onChange={(e) => setSponsorInput(e.target.value)}
                placeholder="e.g. 10000 (Defaults to Genesis Root)"
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-xs font-code text-on-surface placeholder:text-outline outline-none focus:border-primary transition-colors"
              />
            </div>

            <button
              onClick={handleOnChainRegistration}
              disabled={isRegisteringOnChain || isTxPending || isAuthenticating}
              className="w-full py-4 bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container rounded-xl font-label-md text-xs font-bold uppercase tracking-wider shadow-lg shadow-secondary-container/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>
                {isRegisteringOnChain || isTxPending
                  ? "Broadcasting Registration..."
                  : isAuthenticating
                  ? "Signing Challenge..."
                  : "Complete Registration"}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Verify your Web3 signature to decrypt your terminal session and view real-time matrix earnings.
            </p>

            <button
              onClick={handleSignatureAuth}
              disabled={isAuthenticating}
              className="w-full py-4 bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container rounded-xl font-label-md text-xs font-bold uppercase tracking-wider shadow-lg shadow-secondary-container/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <span>{isAuthenticating ? "Verifying Signature..." : "Sign Challenge & Enter"}</span>
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-outline-variant/15 text-center text-[10px] font-code text-outline">
          Non-Custodial Cryptographic Authentication • Canadian Institutional Standard
        </div>
      </div>
    </div>
  );
}
