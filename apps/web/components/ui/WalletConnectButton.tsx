"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTokenBalance } from "../../hooks/equora/useTokenBalance";

export function WalletConnectButton() {
  const { formattedRounded: tokenBalanceFormatted, symbol } = useTokenBalance();

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
              onClick={openConnectModal}
              className="bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-label-md text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-secondary-container/20 flex items-center gap-1 sm:gap-1.5 shrink-0"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[18px]">account_balance_wallet</span>
              <span className="hidden xs:inline">Connect</span>
              <span className="xs:hidden">Join</span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              id="wrong-network-btn"
              onClick={openChainModal}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">warning</span>
              <span>Wrong Net</span>
            </button>
          );
        }

        return (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Live Token Balance Display */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-[11px] font-code">
              {account.displayBalance && (
                <span className="text-on-surface-variant font-medium flex items-center gap-1" title="Native Gas (ETH)">
                  <span>⛽</span> {account.displayBalance}
                </span>
              )}
              <span className="w-px h-3 bg-outline-variant/30" />
              <span className="text-primary font-bold flex items-center gap-1" title="Protocol Payment Token">
                <span>🪙</span> {tokenBalanceFormatted} {symbol}
              </span>
            </div>

            {/* Chain Switcher Button */}
            <button
              id="chain-switcher-btn"
              onClick={openChainModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high/60 hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-semibold transition-all shadow-sm"
            >
              {chain.hasIcon && chain.iconUrl && (
                <img src={chain.iconUrl} alt={chain.name} width={14} height={14} className="rounded-full" />
              )}
              <span>{chain.name}</span>
            </button>

            {/* Account Modal Button */}
            <button
              id="account-modal-btn"
              onClick={openAccountModal}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-primary/30 text-primary text-[11px] sm:text-xs font-code font-bold transition-all shadow-sm shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span className="max-w-[75px] xs:max-w-[95px] sm:max-w-none truncate">{account.displayName}</span>
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
