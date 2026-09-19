import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();



export const config = {
  chainId: parseInt(process.env.CHAIN_ID || "31337", 10),
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  pollIntervalMs: parseInt(process.env.INDEXER_POLL_INTERVAL_MS || "3000", 10),
  startBlock: BigInt(process.env.INDEXER_START_BLOCK || "0"),
  contracts: {
    registry: (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    token: (process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    nft: (process.env.NEXT_PUBLIC_NFT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    vesting: (process.env.NEXT_PUBLIC_VESTING_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    dao: (process.env.NEXT_PUBLIC_DAO_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    matrix: (process.env.NEXT_PUBLIC_MATRIX_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    vault: (process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  },
};
