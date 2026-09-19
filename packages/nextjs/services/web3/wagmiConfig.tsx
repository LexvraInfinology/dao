import { createConfig, http } from "wagmi";
import { hardhat, bscTestnet, bsc } from "wagmi/chains";
import { wagmiConnectors } from "./wagmiConnectors";

/**
 * wagmiConfig
 * Uses the pre-cleaned wagmiConnectors (no coinbaseWallet / safeWallet).
 * coinbaseWallet was removed because it transitively bundles:
 *   - @coinbase/wallet-sdk  (~3.5 MB)
 *   - @base-org/account     (~8.2 MB)
 *   - @reown/appkit         (~8.9 MB)
 * Together these inflate layout.js to ~8.5 MB which causes a ChunkLoadError timeout.
 */
declare global {
  // eslint-disable-next-line no-var
  var __wagmiConfig: ReturnType<typeof createConfig> | undefined;
}

export const wagmiConfig =
  globalThis.__wagmiConfig ??
  createConfig({
    connectors: wagmiConnectors,
    chains: [hardhat, bscTestnet, bsc],
    transports: {
      [hardhat.id]: http("http://127.0.0.1:8545"),
      [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545"),
      [bsc.id]: http("https://bsc-dataseed.binance.org"),
    },
    ssr: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__wagmiConfig = wagmiConfig;
}

