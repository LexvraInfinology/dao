"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { LoginRegisterModal } from "./LoginRegisterModal";
import { IconLock, IconShield, IconZap, LogoTitan } from "../ui/Icons";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthenticating, isCheckingSession, loginWithSignature } = useAuth();
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"register" | "login">("login");

  const openModal = (tab: "register" | "login") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  // If already authenticated, immediately render children with 0 delay
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If still reading initial session or reconnecting wallet, show smooth subtle pulse rather than "Access Restricted"
  if (isCheckingSession || isConnecting || isReconnecting) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "3px solid rgba(245, 158, 11, 0.15)",
              borderTopColor: "#f59e0b",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ fontSize: "0.875rem", color: "#94a3b8", fontWeight: 600 }}>
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div
        className="glass-card glass-card-gold"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "2.5rem 2rem",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(245, 158, 11, 0.15)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "18px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}
        >
          <IconLock size={32} color="#f59e0b" />
        </div>

        <div style={{ display: "inline-flex", marginBottom: "0.75rem" }}>
          <span className="badge-glow badge-gold">
            <IconShield size={12} /> RESTRICTED PROTOCOL ACCESS
          </span>
        </div>

        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 900,
            fontFamily: "var(--font-heading)",
            marginBottom: "0.75rem",
          }}
        >
          Authentication <span className="gradient-text-gold">Required</span>
        </h2>

        <p
          style={{
            fontSize: "0.875rem",
            color: "#94a3b8",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          To protect account security and prevent unauthorized viewing, please authenticate your Web3 wallet with cryptographic verification.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {!isConnected ? (
            <button onClick={openConnectModal} className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
              <IconZap size={18} /> Connect Web3 Wallet
            </button>
          ) : (
            <button
              onClick={() => loginWithSignature()}
              disabled={isAuthenticating}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <IconLock size={18} /> {isAuthenticating ? "Verifying Signature..." : "Sign Cryptographic Challenge"}
            </button>
          )}

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => openModal("login")}
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem" }}
            >
              Member Login
            </button>
            <button
              onClick={() => openModal("register")}
              className="btn btn-violet"
              style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem" }}
            >
              New Register
            </button>
          </div>
        </div>

        <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.75rem", color: "#64748b" }}>
          Non-custodial cryptographic authentication • 100% on BNB Smart Chain
        </div>
      </div>

      <LoginRegisterModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
}
