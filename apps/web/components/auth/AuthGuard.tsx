"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { LoginRegisterModal } from "./LoginRegisterModal";

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

  const isPreview =
    typeof window !== "undefined" &&
    (window.location.search.includes("preview=true") || window.localStorage.getItem("preview_mode") === "true");

  if (isAuthenticated || isPreview) {
    return <>{children}</>;
  }

  if (isCheckingSession || isConnecting || isReconnecting) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto" />
          <p className="text-xs font-label-md text-on-surface-variant uppercase tracking-wider font-bold">
            Verifying Cryptographic Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-8">
      <div className="bg-surface-container/80 backdrop-blur-3xl border border-outline-variant/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center text-secondary mx-auto mb-4 shadow-lg">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield_lock
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary mb-3 uppercase tracking-widest font-code">
          Canadian Sovereign Web3
        </div>

        <h2 className="text-2xl font-headline-md font-bold text-on-surface mb-2">
          Authentication <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Required</span>
        </h2>

        <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
          To protect non-custodial earnings and protocol routing, please authenticate your Web3 wallet with cryptographic verification.
        </p>

        <div className="flex flex-col gap-3">
          {!isConnected ? (
            <button
              onClick={openConnectModal}
              className="w-full py-4 bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container rounded-xl font-label-md text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-secondary-container/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              <span>Connect Web3 Wallet</span>
            </button>
          ) : (
            <button
              onClick={() => loginWithSignature()}
              disabled={isAuthenticating}
              className="w-full py-4 bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container rounded-xl font-label-md text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-secondary-container/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <span>{isAuthenticating ? "Verifying Signature..." : "Sign Cryptographic Challenge"}</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => openModal("login")}
              className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-xl text-xs font-bold text-on-surface uppercase transition-colors"
            >
              Member Login
            </button>
            <button
              onClick={() => openModal("register")}
              className="flex-1 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-xs font-bold text-primary uppercase transition-colors"
            >
              New Register
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-outline-variant/15 text-[10px] text-outline font-code">
          100% Non-Custodial Architecture • Multi-Sig Governance
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
