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

declare global {
  // eslint-disable-next-line no-var
  var __queryClient: QueryClient | undefined;
}

function getQueryClient() {
  if (typeof window === "undefined") {
    return new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          staleTime: 30_000,
        },
      },
    });
  }
  if (!globalThis.__queryClient) {
    globalThis.__queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          staleTime: 30_000,
        },
      },
    });
  }
  return globalThis.__queryClient;
}

const appInfo = {
  appName: "B-TITAN Protocol",
  learnMoreUrl: "https://btitan.net",
};

export function Web3Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider appInfo={appInfo}>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
