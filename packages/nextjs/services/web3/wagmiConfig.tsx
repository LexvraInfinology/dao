import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, bscTestnet, bsc } from "wagmi/chains";
import scaffoldConfig from "../../scaffold.config";

const { walletConnectProjectId } = scaffoldConfig;

export const wagmiConfig = getDefaultConfig({
  appName: "B-TITAN",
  projectId: walletConnectProjectId || "3a8170812b534d0ff9d794f19a901d64",
  chains: [hardhat, bscTestnet, bsc],
  ssr: true,
});
