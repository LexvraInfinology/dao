import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, bscTestnet, bsc } from "wagmi/chains";
import scaffoldConfig from "../../scaffold.config";

const { walletConnectProjectId } = scaffoldConfig;

declare global {
  // eslint-disable-next-line no-var
  var __wagmiConfig: ReturnType<typeof getDefaultConfig> | undefined;
}

export const wagmiConfig =
  globalThis.__wagmiConfig ??
  getDefaultConfig({
    appName: "B-TITAN",
    projectId: walletConnectProjectId || "7663d51173c43f7ad40158edb7e88859",
    chains: [hardhat, bscTestnet, bsc],
    ssr: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__wagmiConfig = wagmiConfig;
}
