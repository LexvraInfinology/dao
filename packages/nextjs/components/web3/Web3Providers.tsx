"use client";

import { ReactNode } from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "react-hot-toast";
import { wagmiConfig } from "../../services/web3/wagmiConfig";
import { AuthProvider } from "../../context/AuthContext";

import "@rainbow-me/rainbowkit/styles.css";

// Filter out noisy third-party extension stream & dev mode notices
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const origWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Lit is in dev mode") ||
        args[0].includes("ObjectMultiplex") ||
        args[0].includes("MaxListenersExceededWarning"))
    ) {
      return;
    }
    origWarn(...args);
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
