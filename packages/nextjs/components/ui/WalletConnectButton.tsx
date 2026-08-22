"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * WalletConnectButton — custom styled version of RainbowKit ConnectButton.
 * Shows wallet address + disconnect when connected.
 * Shows Connect prompt when not.
 */
export function WalletConnectButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) return null;

        if (!connected) {
          return (
            <button
              id="connect-wallet-btn"
              className={`btn btn-primary btn-${size}`}
              onClick={openConnectModal}
            >
              🔗 Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              id="wrong-network-btn"
              className="btn btn-danger"
              onClick={openChainModal}
            >
              ⚠️ Wrong Network
            </button>
          );
        }

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* Network pill */}
            <button
              id="chain-switcher-btn"
              className="btn btn-secondary btn-sm"
              onClick={openChainModal}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              {chain.hasIcon && chain.iconUrl && (
                <img src={chain.iconUrl} alt={chain.name} width={14} height={14} style={{ borderRadius: "50%" }} />
              )}
              {chain.name}
            </button>

            {/* Address button */}
            <button
              id="account-modal-btn"
              className="btn btn-secondary btn-sm"
              onClick={openAccountModal}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              {account.displayName}
              {account.displayBalance ? ` (${account.displayBalance})` : ""}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
