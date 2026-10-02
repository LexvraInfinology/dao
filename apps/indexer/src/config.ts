import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

const B58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function to0xAddress(addr?: string): `0x${string}` {
  if (!addr) return "0x0000000000000000000000000000000000000000";
  const t = addr.trim();
  if (t.startsWith("0x")) return t as `0x${string}`;
  if (t.startsWith("41") && t.length === 42) return `0x${t.slice(2)}` as `0x${string}`;
  if (t.startsWith("T") && t.length === 34) {
    let num = 0n;
    for (const c of t) {
      const idx = B58_CHARS.indexOf(c);
      num = num * 58n + BigInt(idx);
    }
    let hex = num.toString(16);
    if (hex.length % 2 !== 0) hex = "0" + hex;
    hex = hex.padStart(50, "0");
    return `0x${hex.slice(2, 42)}` as `0x${string}`;
  }
  return t as `0x${string}`;
}

export const config = {
  chainId: parseInt(process.env.CHAIN_ID || "31337", 10),
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  pollIntervalMs: parseInt(process.env.INDEXER_POLL_INTERVAL_MS || "3000", 10),
  startBlock: BigInt(process.env.INDEXER_START_BLOCK || "0"),
  contracts: {
    registry: to0xAddress(process.env.NEXT_PUBLIC_REGISTRY_HEX || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS),
    token:    to0xAddress(process.env.NEXT_PUBLIC_TOKEN_HEX || process.env.NEXT_PUBLIC_TOKEN_ADDRESS),
    nft:      to0xAddress(process.env.NEXT_PUBLIC_NFT_HEX || process.env.NEXT_PUBLIC_NFT_ADDRESS),
    vesting:  to0xAddress(process.env.NEXT_PUBLIC_VESTING_HEX || process.env.NEXT_PUBLIC_VESTING_ADDRESS),
    dao:      to0xAddress(process.env.NEXT_PUBLIC_DAO_HEX || process.env.NEXT_PUBLIC_DAO_ADDRESS),
    matrix:   to0xAddress(process.env.NEXT_PUBLIC_MATRIX_HEX || process.env.NEXT_PUBLIC_MATRIX_ADDRESS),
    vault:    to0xAddress(process.env.NEXT_PUBLIC_VAULT_HEX || process.env.NEXT_PUBLIC_VAULT_ADDRESS),
  },
};
