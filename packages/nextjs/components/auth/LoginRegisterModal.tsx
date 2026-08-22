"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { useSearchParams, useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/btitan/useUserProfile";
import deployedContracts from "../../contracts/deployedContracts";
import { notification } from "../../utils/scaffold-eth/notification";
import { IconLock, IconShield, IconZap, IconCheck, IconClose, LogoTitan } from "../ui/Icons";

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
  const searchParams = useSearchParams();
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
  const registryContract = contracts?.BTitanRegistry;

  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      setSponsorInput(refParam);
    }
  }, [searchParams]);

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

    // Default root sponsor if empty
    const sponsorToUse = sponsorInput.trim() || "0x0000000000000000000000000000000000000000";

    if (!registryContract?.address) {
      notification.error("Registry smart contract address not found for current network.");
      return;
    }

    setIsRegisteringOnChain(true);
    const toastId = notification.loading("Broadcasting on-chain registration to BSC...");

    try {
      const hash = await writeContractAsync({
        address: registryContract.address as `0x${string}`,
        abi: registryContract.abi,
        functionName: "registerUser",
        args: [sponsorToUse as `0x${string}`],
      });

      notification.dismiss(toastId);
      notification.success("🚀 Registered successfully on-chain! Welcome to B-TITAN.");
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
        {/* Header with Brand Logo & Close */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(168, 85, 247, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <LogoTitan size={30} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 900, fontSize: "1.05rem", fontFamily: "var(--font-heading)" }} className="gradient-text-gold">
                B-TITAN PORTAL
              </span>
              <span style={{ fontSize: "0.62rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.08em" }}>
                CRYPTOGRAPHIC AUTHENTICATION
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8",
              width: 32,
              height: 32,
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconClose size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", padding: "0.75rem 1.5rem", gap: "0.5rem" }}>
          <button
            onClick={() => setTab("register")}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "10px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: tab === "register" ? "rgba(139, 92, 246, 0.25)" : "transparent",
              color: tab === "register" ? "#c084fc" : "#94a3b8",
              outline: tab === "register" ? "1px solid rgba(139, 92, 246, 0.5)" : "none",
            }}
          >
            ✨ Register Account
          </button>

          <button
            onClick={() => setTab("login")}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "10px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: tab === "login" ? "rgba(245, 158, 11, 0.25)" : "transparent",
              color: tab === "login" ? "#fcd34d" : "#94a3b8",
              outline: tab === "login" ? "1px solid rgba(245, 158, 11, 0.5)" : "none",
            }}
          >
            🔑 Member Login
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "1.25rem 1.5rem" }}>
          {/* Security Status Stepper */}
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "12px",
              padding: "0.85rem 1rem",
              marginBottom: "1.25rem",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.78rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>1. Web3 Wallet Connection</span>
              <span style={{ fontWeight: 700, color: isConnected ? "#22c55e" : "#f59e0b" }}>
                {isConnected ? "✓ Connected" : "Pending"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>2. Cryptographic Signature</span>
              <span style={{ fontWeight: 700, color: isAuthenticated ? "#22c55e" : "#94a3b8" }}>
                {isAuthenticated ? "✓ Verified" : "Required"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>3. On-Chain Registry</span>
              <span style={{ fontWeight: 700, color: profile.isRegistered ? "#22c55e" : "#94a3b8" }}>
                {profile.isRegistered ? `✓ Member #${profile.userId}` : "Unregistered"}
              </span>
            </div>
          </div>

          {tab === "register" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#94a3b8",
                    marginBottom: "0.35rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Sponsor / Inviter Address
                </label>
                <input
                  type="text"
                  placeholder="0x... (leave empty for root sponsor)"
                  value={sponsorInput}
                  onChange={(e) => setSponsorInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(168, 85, 247, 0.25)",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
                  Auto-populated from your referral link if opened via invitation.
                </span>
              </div>

              {!isConnected ? (
                <button onClick={openConnectModal} className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
                  <IconZap size={18} /> Connect Wallet to Continue
                </button>
              ) : !isAuthenticated ? (
                <button
                  onClick={handleSignatureAuth}
                  disabled={isAuthenticating}
                  className="btn btn-violet btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <IconLock size={18} /> {isAuthenticating ? "Awaiting Signature..." : "Sign Security Challenge"}
                </button>
              ) : (
                <button
                  onClick={handleOnChainRegistration}
                  disabled={isRegisteringOnChain || isTxPending}
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <IconShield size={18} /> {isRegisteringOnChain || isTxPending ? "Registering on BSC..." : "Complete On-Chain Registration"}
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.5 }}>
                Connect your authenticated wallet to decrypt your private protocol dashboard, matrix cycles, and claimable reward balances.
              </p>

              {!isConnected ? (
                <button onClick={openConnectModal} className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
                  <IconZap size={18} /> Connect Web3 Wallet
                </button>
              ) : !isAuthenticated ? (
                <button
                  onClick={handleSignatureAuth}
                  disabled={isAuthenticating}
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <IconLock size={18} /> {isAuthenticating ? "Awaiting Signature..." : "Sign In with Cryptographic Verification"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    router.push("/dashboard");
                  }}
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <IconCheck size={18} /> Enter Dashboard
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "0.75rem 1.5rem 1.25rem", textAlign: "center", fontSize: "0.72rem", color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          Gas-free cryptographic challenge • Non-custodial session security
        </div>
      </div>
    </div>
  );
}
