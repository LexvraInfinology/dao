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

const rawMainnetEnv = process.env.NEXT_PUBLIC_IS_MAINNET ?? process.env.IS_MAINNET;
const IS_MAINNET = rawMainnetEnv !== undefined
  ? (String(rawMainnetEnv).trim().toLowerCase() === "true" || String(rawMainnetEnv).trim() === "1")
  : (process.env.TARGET_NETWORK || process.env.NEXT_PUBLIC_TARGET_NETWORK || "mainnet").trim().toLowerCase() === "mainnet";

const TARGET_NETWORK = IS_MAINNET ? "mainnet" : "testnet";

const MAINNET_DEFAULT_CONTRACTS = {
  registry: "TNxk5Uguc16mxReUjXHDctKj12Y3MUSQZj",
  token:    "TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn",
  nft:      "TP8MDQFdoTMtZZjpRThExdniz2VQ1pTSPC",
  vesting:  "TP8MDQFdoTMtZZjpRThExdniz2VQ1pTSPC",
  dao:      "TJRYjqygAEUcrcB2WkgizGFPYeBmyhDqM2",
  matrix:   "TQuf5qo6EdRYDdEihbfbj51yo6rtzQCkCV",
  vault:    "TUZjyaLc1TghdoccJWTKhoBcEU12AG327J",
  salary:   "TQMDkXunFuXDiTqL1HCRgdx47i3AsincjS",
  reward:   "TDq8iJSeomNxEJyUAVxvf4iGH2q5f67kJq",
  magicBox: "TCDL237GcsDQ3eP4phaG1iXzc2SMPcXaPG",
};

const TESTNET_DEFAULT_CONTRACTS = {
  registry: "TGqsxzj8QCLT5SMHy48kGvjSDVo58Dahmq",
  token: "TR94a7NtVh2wrTvUVojd8g4MBWnUsrW4p8",
  nft: "TZ5daz2Msu8qN2L5sdPfTnc8XrH5bGMBkh",
  vesting: "TZ5daz2Msu8qN2L5sdPfTnc8XrH5bGMBkh",
  dao: "TP8PVXguepBjLwvuS6TmCC1nuXbjM6UEau",
  matrix: "TXiYqDTWp3m7EFtAA7f5CBUaPEZNdU36GJ",
  vault: "TESBwN1LgNQobMML7PkQhYS6P9M5UV5qvs",
  salary: "TLBqC9pBw6H1jfGhDBx1MNkus9eNkarEG1",
  reward: "TPPhASzevqRF69FZ7aPGwVemxUakocPuY5",
  magicBox: "TB4NJMkQ6pUhWicpDUCgre1UHJmzLKnpGB",
};

const DEFAULT_CONTRACTS = IS_MAINNET ? MAINNET_DEFAULT_CONTRACTS : TESTNET_DEFAULT_CONTRACTS;

export const config = {
  chainId: parseInt(process.env.CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID || (IS_MAINNET ? "1000" : "1001"), 10),
  rpcUrl: IS_MAINNET
    ? (process.env.MAINNET_RPC_URL || (process.env.RPC_URL && !process.env.RPC_URL.includes("testnet") ? process.env.RPC_URL : "https://fullnode-one.trobchain.com"))
    : (process.env.TESTNET_RPC_URL || process.env.RPC_URL || "https://fullnode-one-testnet.trobchain.com"),
  pollIntervalMs: parseInt(process.env.INDEXER_POLL_INTERVAL_MS || "5000", 10),
  startBlock: BigInt(process.env.INDEXER_START_BLOCK || "0"),
  contracts: {
    registry: to0xAddress(IS_MAINNET ? (process.env.NEXT_PUBLIC_MAINNET_REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || DEFAULT_CONTRACTS.registry) : (process.env.NEXT_PUBLIC_TESTNET_REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || DEFAULT_CONTRACTS.registry)),
    token:    to0xAddress(IS_MAINNET ? (process.env.NEXT_PUBLIC_MAINNET_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_TOKEN_ADDRESS || DEFAULT_CONTRACTS.token) : (process.env.NEXT_PUBLIC_TESTNET_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_TOKEN_ADDRESS || DEFAULT_CONTRACTS.token)),
    nft:      to0xAddress(IS_MAINNET ? (process.env.NEXT_PUBLIC_MAINNET_NFT_ADDRESS || process.env.NEXT_PUBLIC_NFT_ADDRESS || DEFAULT_CONTRACTS.nft) : (process.env.NEXT_PUBLIC_TESTNET_NFT_ADDRESS || process.env.NEXT_PUBLIC_NFT_ADDRESS || DEFAULT_CONTRACTS.nft)),
    vesting:  to0xAddress(IS_MAINNET ? (process.env.NEXT_PUBLIC_MAINNET_VESTING_ADDRESS || process.env.NEXT_PUBLIC_VESTING_ADDRESS || DEFAULT_CONTRACTS.vesting) : (process.env.NEXT_PUBLIC_TESTNET_VESTING_ADDRESS || process.env.NEXT_PUBLIC_VESTING_ADDRESS || DEFAULT_CONTRACTS.vesting)),
    dao:      to0xAddress(IS_MAINNET ? (process.env.NEXT_PUBLIC_MAINNET_DAO_ADDRESS || process.env.NEXT_PUBLIC_DAO_ADDRESS || DEFAULT_CONTRACTS.dao) : (process.env.NEXT_PUBLIC_TESTNET_DAO_ADDRESS || process.env.NEXT_PUBLIC_DAO_ADDRESS || DEFAULT_CONTRACTS.dao)),
    matrix:   to0xAddress(IS_MAINNET ? (process.env.NEXT_PUBLIC_MAINNET_MATRIX_ADDRESS || process.env.NEXT_PUBLIC_MATRIX_ADDRESS || DEFAULT_CONTRACTS.matrix) : (process.env.NEXT_PUBLIC_TESTNET_MATRIX_ADDRESS || process.env.NEXT_PUBLIC_MATRIX_ADDRESS || DEFAULT_CONTRACTS.matrix)),
    vault:    to0xAddress(IS_MAINNET ? (process.env.NEXT_PUBLIC_MAINNET_VAULT_ADDRESS || process.env.NEXT_PUBLIC_VAULT_ADDRESS || DEFAULT_CONTRACTS.vault) : (process.env.NEXT_PUBLIC_TESTNET_VAULT_ADDRESS || process.env.NEXT_PUBLIC_VAULT_ADDRESS || DEFAULT_CONTRACTS.vault)),
  },
};
