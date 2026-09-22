"use client";

import "../../services/web3/idbPatch";
import { ReactNode, useState, useEffect } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "react-hot-toast";
import { wagmiConfig } from "../../services/web3/wagmiConfig";
import { AuthProvider } from "../../context/AuthContext";
import { ThemeProvider } from "../../services/theme/ThemeContext";
import { I18nProvider } from "../../services/i18n/I18nContext";

import "@rainbow-me/rainbowkit/styles.css";

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
  appName: "EQUORA_Fi Protocol",
  learnMoreUrl: "https://equora.fi",
};

export function Web3Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const queryClient = getQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-code text-on-surface-variant uppercase tracking-widest">
            Loading Equora.Fi...
          </span>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider appInfo={appInfo} theme={darkTheme()}>
          <ThemeProvider>
            <I18nProvider>
              <AuthProvider>
                {children}
                <Toaster position="top-right" />
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Web3Providers;
