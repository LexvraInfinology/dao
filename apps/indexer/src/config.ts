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

const TARGET_NETWORK = (
  process.env.TARGET_NETWORK ||
  process.env.NEXT_PUBLIC_TARGET_NETWORK ||
  "testnet"
).toLowerCase();

const IS_MAINNET = TARGET_NETWORK === "mainnet";

const MAINNET_DEFAULT_CONTRACTS = {
  registry: "TWXbakETzfE9sBYdHTCp37HwygGKLY6AGy",
  token:    "TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn",
  nft:      "TRhqfaRNRPeNTNoewLdamZ9W9Rz5erdHjz",
  vesting:  "TRhqfaRNRPeNTNoewLdamZ9W9Rz5erdHjz",
  dao:      "TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto",
  matrix:   "TWrMSgbvPoaxmHCJcWVSJng1X9V7MGrteE",
  vault:    "TV6NRDubL8w749VAhsx8H8GZs8CrEcSDZB",
};

const TESTNET_DEFAULT_CONTRACTS = {
  registry: "TCcHDFibnBsSwZhCRyvevXQfoAQ6NMyYWN",
  token:    "TDJNzzyMvJ9xbB7TXgR7TTXDY47aAiLHit",
  nft:      "TQDJwbuFQEXDsSaeGVcU1iRF3WPjRfeLdi",
  vesting:  "TQDJwbuFQEXDsSaeGVcU1iRF3WPjRfeLdi",
  dao:      "TLXYmgeyBpUQJaSh5LuumrufaQs6GmrGqz",
  matrix:   "TXdUXMtLawCBdkhDCAVCAaLEimzaiGkjz2",
  vault:    "TDMZ2y9xpqtuZRm4QbEDctuaWQR4KY4Gnq",
};

const DEFAULT_CONTRACTS = IS_MAINNET ? MAINNET_DEFAULT_CONTRACTS : TESTNET_DEFAULT_CONTRACTS;

export const config = {
  chainId: parseInt(process.env.CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID || "1000", 10),
  rpcUrl:
    process.env.RPC_URL ||
    process.env.FULLNODE_URL ||
    process.env.NEXT_PUBLIC_RPC_URL ||
    (IS_MAINNET
      ? "https://fullnode-one.trobchain.com"
      : "https://fullnode-one-testnet.trobchain.com"),
  pollIntervalMs: parseInt(process.env.INDEXER_POLL_INTERVAL_MS || "5000", 10),
  startBlock: BigInt(process.env.INDEXER_START_BLOCK || "0"),
  contracts: {
    registry: to0xAddress(process.env.NEXT_PUBLIC_REGISTRY_HEX || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || DEFAULT_CONTRACTS.registry),
    token:    to0xAddress(process.env.NEXT_PUBLIC_TOKEN_HEX || process.env.NEXT_PUBLIC_TOKEN_ADDRESS || DEFAULT_CONTRACTS.token),
    nft:      to0xAddress(process.env.NEXT_PUBLIC_NFT_HEX || process.env.NEXT_PUBLIC_NFT_ADDRESS || DEFAULT_CONTRACTS.nft),
    vesting:  to0xAddress(process.env.NEXT_PUBLIC_VESTING_HEX || process.env.NEXT_PUBLIC_VESTING_ADDRESS || DEFAULT_CONTRACTS.vesting),
    dao:      to0xAddress(process.env.NEXT_PUBLIC_DAO_HEX || process.env.NEXT_PUBLIC_DAO_ADDRESS || DEFAULT_CONTRACTS.dao),
    matrix:   to0xAddress(process.env.NEXT_PUBLIC_MATRIX_HEX || process.env.NEXT_PUBLIC_MATRIX_ADDRESS || DEFAULT_CONTRACTS.matrix),
    vault:    to0xAddress(process.env.NEXT_PUBLIC_VAULT_HEX || process.env.NEXT_PUBLIC_VAULT_ADDRESS || DEFAULT_CONTRACTS.vault),
  },
};
