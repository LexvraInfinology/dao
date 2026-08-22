"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useSearchParams, useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
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
  const { openConnectModal } = useConnectModal();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tab, setTab] = useState<"register" | "login">(defaultTab);
  const [sponsorInput, setSponsorInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleRegister = async () => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return;
    }

    setIsSubmitting(true);
    const toastId = notification.loading("Validating sponsor & entering B-TITAN...");

    try {
      // Direct user to Dashboard or Matrix to activate Slot 1
      setTimeout(() => {
        notification.dismiss(toastId);
        notification.success("🚀 Welcome to B-TITAN! Directing to Dashboard...");
        onClose();
        router.push(`/dashboard${sponsorInput ? `?ref=${sponsorInput}` : ""}`);
        setIsSubmitting(false);
      }, 1000);
    } catch (err: any) {
      notification.dismiss(toastId);
      notification.error(err?.message || "Registration failed");
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return;
    }
    notification.success("✨ Wallet authenticated! Welcome back.");
    onClose();
    router.push("/dashboard");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header with Close */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(168, 85, 247, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #f59e0b, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#000",
                fontSize: "14px",
              }}
            >
              B
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }} className="gradient-text-gold">
              B-TITAN PORTAL
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "none",
              color: "#94a3b8",
              width: 32,
              height: 32,
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
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
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: tab === "register" ? "rgba(139, 92, 246, 0.25)" : "transparent",
              color: tab === "register" ? "#c084fc" : "#94a3b8",
              outline: tab === "register" ? "1px solid rgba(139, 92, 246, 0.5)" : "none",
            }}
          >
            ✨ Register New
          </button>

          <button
            onClick={() => setTab("login")}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "10px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.875rem",
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

        {/* Form Body */}
        <div style={{ padding: "1.25rem 1.5rem" }}>
          {tab === "register" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#94a3b8",
                    marginBottom: "0.4rem",
                  }}
                >
                  SPONSOR / REFERRAL ADDRESS
                </label>
                <input
                  type="text"
                  placeholder="0x... (or leave default for root)"
                  value={sponsorInput}
                  onChange={(e) => setSponsorInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(168, 85, 247, 0.25)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.3rem", display: "block" }}>
                  Auto-detected from your invitation link if available.
                </span>
              </div>

              {/* Wallet Status Card */}
              <div
                style={{
                  padding: "0.85rem",
                  borderRadius: "12px",
                  background: isConnected ? "rgba(34, 197, 94, 0.08)" : "rgba(245, 158, 11, 0.08)",
                  border: isConnected ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid rgba(245, 158, 11, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>CONNECTED WALLET</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
                    {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "No Wallet Connected"}
                  </div>
                </div>
                {!isConnected && (
                  <button onClick={openConnectModal} className="btn btn-primary btn-sm">
                    Connect
                  </button>
                )}
              </div>

              <button
                onClick={handleRegister}
                disabled={isSubmitting}
                className="btn btn-violet btn-lg"
                style={{ width: "100%", marginTop: "0.5rem" }}
              >
                {isConnected ? "🚀 Enter B-TITAN Platform" : "🔗 Connect Wallet to Register"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.5 }}>
                Already a registered B-TITAN member? Connect your authenticated Web3 wallet to access your Matrix, DAO,
                and Earnings dashboard instantly.
              </p>

              {/* Wallet Status Card */}
              <div
                style={{
                  padding: "0.85rem",
                  borderRadius: "12px",
                  background: isConnected ? "rgba(34, 197, 94, 0.08)" : "rgba(245, 158, 11, 0.08)",
                  border: isConnected ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid rgba(245, 158, 11, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>CURRENT WALLET</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
                    {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "No Wallet Connected"}
                  </div>
                </div>
                {!isConnected && (
                  <button onClick={openConnectModal} className="btn btn-primary btn-sm">
                    Connect
                  </button>
                )}
              </div>

              <button
                onClick={handleLogin}
                className="btn btn-primary btn-lg"
                style={{ width: "100%", marginTop: "0.5rem" }}
              >
                {isConnected ? "📊 Open Dashboard" : "🔑 Connect Wallet to Login"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
