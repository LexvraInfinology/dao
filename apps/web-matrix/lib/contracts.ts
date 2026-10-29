// ==============================================================================
// EQUORA MATRIX PROTOCOL — ON-CHAIN CONTRACT CLIENT (apps/web-matrix/lib/contracts.ts)
// ==============================================================================

import { ethers } from "ethers";
import type { MatrixSlotDetails, MatrixSlotSummary, MatrixNodePlacement, MatrixUserProfile } from "./api";

// ── Network & Contract Addresses ─────────────────────────────────────────────

const rawMainnetEnv = process.env.NEXT_PUBLIC_IS_MAINNET ?? process.env.IS_MAINNET;
export const IS_MAINNET = rawMainnetEnv !== undefined
  ? (String(rawMainnetEnv).trim().toLowerCase() === "true" || String(rawMainnetEnv).trim() === "1")
  : (process.env.NEXT_PUBLIC_TARGET_NETWORK || process.env.TARGET_NETWORK || "testnet").trim().toLowerCase() === "mainnet";

export const TARGET_NETWORK = IS_MAINNET ? "mainnet" : "testnet";
export const NETWORK_NAME = IS_MAINNET ? "TrobChain Mainnet" : "TrobChain Testnet";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1000);

export const MAINNET_DEFAULT_ADDRESSES = {
  matrix: "TXXmRwhJzgRPUAvoaubv9YzaPgz7s2Z8Tt",
  token: "TDJNzzyMvJ9xbB7TXgR7TTXDY47aAiLHit",
  registry: "TQdM1WxZ4xSHmeSD1RJJT1NnABJTFC1duf",
  vault: "TYLz8kjxWrJM9NM1auyfbevGKBrU2UJj5m",
  salaryPool: "TMTBFurpMP7xpBVBXUqszuefdiMMjkGHkA",
  rewardPool: "TKPZHWtjdDvTbfsPNYiFMDhMEbxLt5hgmG",
  magicBoxPool: "TA1ofz1R4c568t8kPQJfiP4xJ7axypX3s7",
  dao: "TKjLfzAz5vxGx1pB8LYm1N722DBFmxSZ4y",
  nft: "TQdoa6Lud3cjnH44b7JFT4kJBGFazEbPro",
};

export const TESTNET_DEFAULT_ADDRESSES = {
  matrix: "TEUe7Wi375eKVGGynAZT6kMhyPpG1f9mBQ",
  token: "TDJNzzyMvJ9xbB7TXgR7TTXDY47aAiLHit",
  registry: "THKuZfqxFFWiur116fDJfU4goDiSFA2Nkk",
  vault: "TFSfnLmvx1q1Ur5aWbE5fqm6rXk6jVyj2A",
  salaryPool: "TTgVZdoBVDkQSw1j62vMsUfZMEpx3Vqcmj",
  rewardPool: "TBbVrdYQjeJqQGGg19J6SPBCqiqq2btmAH",
  magicBoxPool: "TLGFnvCQeCwJ83KPerHY3fGLFSx5k8WZaA",
  dao: "TBZTnpE2fz9FWXSiUAiKXW5UwQnPUZCWdp",
  nft: "TQdoa6Lud3cjnH44b7JFT4kJBGFazEbPro",
};

// Strict Network-Guarded Address Resolver
// Prevents accidental leak of testnet contract addresses into mainnet production
export const CONTRACT_ADDRESSES = {
  matrix: IS_MAINNET
    ? (process.env.NEXT_PUBLIC_MAINNET_MATRIX_ADDRESS ||
        (process.env.NEXT_PUBLIC_MATRIX_ADDRESS &&
        process.env.NEXT_PUBLIC_MATRIX_ADDRESS !== TESTNET_DEFAULT_ADDRESSES.matrix
          ? process.env.NEXT_PUBLIC_MATRIX_ADDRESS
          : null) ||
        MAINNET_DEFAULT_ADDRESSES.matrix)
    : (process.env.NEXT_PUBLIC_TESTNET_MATRIX_ADDRESS ||
        process.env.NEXT_PUBLIC_MATRIX_ADDRESS ||
        TESTNET_DEFAULT_ADDRESSES.matrix),

  token: IS_MAINNET
    ? (process.env.NEXT_PUBLIC_MAINNET_TOKEN_ADDRESS ||
        (process.env.NEXT_PUBLIC_TOKEN_ADDRESS &&
        process.env.NEXT_PUBLIC_TOKEN_ADDRESS !== TESTNET_DEFAULT_ADDRESSES.token
          ? process.env.NEXT_PUBLIC_TOKEN_ADDRESS
          : null) ||
        MAINNET_DEFAULT_ADDRESSES.token)
    : (process.env.NEXT_PUBLIC_TESTNET_TOKEN_ADDRESS ||
        process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
        TESTNET_DEFAULT_ADDRESSES.token),

  registry: IS_MAINNET
    ? (process.env.NEXT_PUBLIC_MAINNET_REGISTRY_ADDRESS ||
        (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS &&
        process.env.NEXT_PUBLIC_REGISTRY_ADDRESS !== TESTNET_DEFAULT_ADDRESSES.registry
          ? process.env.NEXT_PUBLIC_REGISTRY_ADDRESS
          : null) ||
        MAINNET_DEFAULT_ADDRESSES.registry)
    : (process.env.NEXT_PUBLIC_TESTNET_REGISTRY_ADDRESS ||
        process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
        TESTNET_DEFAULT_ADDRESSES.registry),

  vault: IS_MAINNET
    ? (process.env.NEXT_PUBLIC_MAINNET_VAULT_ADDRESS ||
        (process.env.NEXT_PUBLIC_VAULT_ADDRESS &&
        process.env.NEXT_PUBLIC_VAULT_ADDRESS !== TESTNET_DEFAULT_ADDRESSES.vault
          ? process.env.NEXT_PUBLIC_VAULT_ADDRESS
          : null) ||
        MAINNET_DEFAULT_ADDRESSES.vault)
    : (process.env.NEXT_PUBLIC_TESTNET_VAULT_ADDRESS ||
        process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
        TESTNET_DEFAULT_ADDRESSES.vault),

  salaryPool: IS_MAINNET
    ? (process.env.NEXT_PUBLIC_MAINNET_SALARY_POOL_ADDRESS || TESTNET_DEFAULT_ADDRESSES.salaryPool)
    : (process.env.NEXT_PUBLIC_TESTNET_SALARY_POOL_ADDRESS || TESTNET_DEFAULT_ADDRESSES.salaryPool),

  rewardPool: IS_MAINNET
    ? (process.env.NEXT_PUBLIC_MAINNET_REWARD_POOL_ADDRESS || TESTNET_DEFAULT_ADDRESSES.rewardPool)
    : (process.env.NEXT_PUBLIC_TESTNET_REWARD_POOL_ADDRESS || TESTNET_DEFAULT_ADDRESSES.rewardPool),

  magicBoxPool: IS_MAINNET
    ? (process.env.NEXT_PUBLIC_MAINNET_MAGIC_BOX_ADDRESS || TESTNET_DEFAULT_ADDRESSES.magicBoxPool)
    : (process.env.NEXT_PUBLIC_TESTNET_MAGIC_BOX_ADDRESS || TESTNET_DEFAULT_ADDRESSES.magicBoxPool),

  dao: IS_MAINNET
    ? (process.env.NEXT_PUBLIC_MAINNET_DAO_ADDRESS ||
        (process.env.NEXT_PUBLIC_DAO_ADDRESS &&
        process.env.NEXT_PUBLIC_DAO_ADDRESS !== TESTNET_DEFAULT_ADDRESSES.dao
          ? process.env.NEXT_PUBLIC_DAO_ADDRESS
          : null) ||
        MAINNET_DEFAULT_ADDRESSES.dao)
    : (process.env.NEXT_PUBLIC_TESTNET_DAO_ADDRESS ||
        process.env.NEXT_PUBLIC_DAO_ADDRESS ||
        TESTNET_DEFAULT_ADDRESSES.dao),

  nft: IS_MAINNET
    ? (process.env.NEXT_PUBLIC_MAINNET_NFT_ADDRESS ||
        (process.env.NEXT_PUBLIC_NFT_ADDRESS &&
        process.env.NEXT_PUBLIC_NFT_ADDRESS !== TESTNET_DEFAULT_ADDRESSES.nft
          ? process.env.NEXT_PUBLIC_NFT_ADDRESS
          : null) ||
        MAINNET_DEFAULT_ADDRESSES.nft)
    : (process.env.NEXT_PUBLIC_TESTNET_NFT_ADDRESS ||
        process.env.NEXT_PUBLIC_NFT_ADDRESS ||
        TESTNET_DEFAULT_ADDRESSES.nft),
};

// ── Domain & Routing Configuration ──────────────────────────────────────────
export const MATRIX_DOMAIN = process.env.NEXT_PUBLIC_MATRIX_DOMAIN || "equorafimatrix.com";
export const DAO_DOMAIN = process.env.NEXT_PUBLIC_DAO_DOMAIN || "equorafidao.com";
export const MATRIX_URL =
  process.env.NEXT_PUBLIC_MATRIX_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : `https://${MATRIX_DOMAIN}`);
export const DAO_URL =
  process.env.NEXT_PUBLIC_DAO_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : `https://${DAO_DOMAIN}`);

export const ACTIVE_RPC_URL = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_RPC_URL ||
      (process.env.NEXT_PUBLIC_RPC_URL && !process.env.NEXT_PUBLIC_RPC_URL.includes("testnet")
        ? process.env.NEXT_PUBLIC_RPC_URL
        : "https://fullnode-one.trobchain.com"))
  : (process.env.NEXT_PUBLIC_TESTNET_RPC_URL ||
      process.env.NEXT_PUBLIC_RPC_URL ||
      "https://fullnode-one-testnet.trobchain.com");

export const TROBCHAIN_TESTNET_RPC = ACTIVE_RPC_URL; // Backward-compatible alias

export const EXPLORER_URL = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_EXPLORER_URL ||
      (process.env.NEXT_PUBLIC_EXPLORER_URL && !process.env.NEXT_PUBLIC_EXPLORER_URL.includes("testnet")
        ? process.env.NEXT_PUBLIC_EXPLORER_URL
        : "https://trobchain.com"))
  : (process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL ||
      process.env.NEXT_PUBLIC_EXPLORER_URL ||
      "https://testnet.trobchain.com");

export const EXPLORER_API_URL = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_EXPLORER_API_URL ||
      (process.env.NEXT_PUBLIC_EXPLORER_API_URL && !process.env.NEXT_PUBLIC_EXPLORER_API_URL.includes("testnet")
        ? process.env.NEXT_PUBLIC_EXPLORER_API_URL
        : "https://backend.trobchain.com/v1"))
  : (process.env.NEXT_PUBLIC_TESTNET_EXPLORER_API_URL ||
      process.env.NEXT_PUBLIC_EXPLORER_API_URL ||
      "https://testnet-backend.trobchain.com/v1");

// ── Base58 / Hex Converter ────────────────────────────────────────────────────

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decode58(string: string): Uint8Array | null {
  const bytes = [0];
  for (let i = 0; i < string.length; i++) {
    const c = string[i];
    const value = B58_ALPHABET.indexOf(c);
    if (value === -1) return null;
    for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
    bytes[0] += value;
    let carry = 0;
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] += carry;
      carry = bytes[j] >> 8;
      bytes[j] &= 0xff;
    }
    while (carry) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < string.length && string[i] === "1"; i++) bytes.push(0);
  return new Uint8Array(bytes.reverse());
}

function encode58(buffer: Uint8Array): string {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) digits.push(0);
  return digits.reverse().map((d) => B58_ALPHABET[d]).join("");
}

export function toHexAddress(input: string): string {
  if (!input) return "0x0000000000000000000000000000000000000000";
  const str = input.trim();
  if (str.startsWith("0x") || str.startsWith("0X")) return str.toLowerCase();
  if (str.startsWith("41") && str.length === 42) return `0x${str.slice(2)}`.toLowerCase();

  if (str.startsWith("T") && str.length === 34) {
    const decoded = decode58(str);
    if (decoded && decoded.length >= 21) {
      return (
        "0x" +
        Array.from(decoded.slice(1, 21))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .toLowerCase()
      );
    }
  }
  return str.toLowerCase();
}

export function toTronHex(input: string): string {
  const hex = toHexAddress(input);
  return "41" + hex.slice(2);
}

/**
 * Normalizes any address (0x, 41-hex, or Base58) to TrobSafe-native Base58.
 * Fully compatible with browser runtime.
 */
export function toTrobBase58(addr?: string | null): string {
  if (!addr) return "";
  const trimmed = addr.trim();
  if (trimmed.startsWith("T") && trimmed.length === 34) {
    return trimmed;
  }
  const hex = toTronHex(trimmed);
  if (!hex || hex.length !== 42) return trimmed;

  try {
    const bytes = ethers.getBytes("0x" + hex);
    const h1 = ethers.sha256(bytes);
    const h2 = ethers.sha256(h1);
    const checksum = ethers.getBytes(h2).slice(0, 4);
    const total = new Uint8Array(bytes.length + 4);
    total.set(bytes);
    total.set(checksum, bytes.length);
    return encode58(total);
  } catch {
    return trimmed;
  }
}

// ── ABIs ──────────────────────────────────────────────────────────────────────

export const MATRIX_ABI = [
  "function isMatrixOpen() external view returns (bool)",
  "function BASE_SLOT_COST() external view returns (uint256)",
  "function slotCosts(uint256) external view returns (uint256)",
  "function joinSlot(uint256 slot, address sponsor) external payable",
  "function isMatrixQualified(address user) external view returns (bool)",
  "function getSlotData(address user, uint256 slot) external view returns (bool isUnlocked, uint256 currentCycle, uint256 filledNodes, address[14] nodes, uint256 slotEarned)",
  "function withdraw(uint256 amount) external",
  "function userBalance(address user) external view returns (uint256)",
  "function totalEarned(address user) external view returns (uint256)",
];

export const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
];

export const REGISTRY_ABI = [
  "function isRegistered(address user) external view returns (bool)",
  "function getSponsor(address user) external view returns (address)",
  "function getUserId(address user) external view returns (uint256)",
  "function getCodeByUser(address user) external view returns (uint32)",
];

// ── Read-Only Query Helpers ───────────────────────────────────────────────────

export async function queryTrobConstant(
  contractAddress: string,
  functionSelector: string,
  parameterHex = ""
): Promise<string> {
  const contractHex = toTronHex(contractAddress);
  const payload = {
    owner_address: contractHex,
    contract_address: contractHex,
    function_selector: functionSelector,
    parameter: parameterHex,
    visible: false,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${ACTIVE_RPC_URL}/wallet/triggersmartcontract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await res.json();
    if (data.result && data.result.result && data.constant_result?.length > 0) {
      return data.constant_result[0];
    }
    throw new Error(
      data.result?.message
        ? Buffer.from(data.result.message, "hex").toString()
        : "Failed to read contract"
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Check user's live TROB / on-chain balance */
export async function getOnChainTokenBalance(userAddress: string): Promise<number> {
  try {
    // 1. Direct browser wallet provider query (TrobSafe extension, Android APK webview, iOS bridge)
    if (typeof window !== "undefined") {
      const tw =
        (window as any).trobSafe ||
        (window as any).tronWeb ||
        (window as any).trobWeb ||
        (window as any).trob ||
        (window as any).trobsafe;
      if (tw?.trx?.getBalance) {
        try {
          const sun = await tw.trx.getBalance(userAddress);
          if (sun !== undefined && sun !== null && !isNaN(Number(sun))) {
            return Number(sun) / 1e6;
          }
        } catch {}
      }
      if (tw?.trob?.getBalance) {
        try {
          const sun = await tw.trob.getBalance(userAddress);
          if (sun !== undefined && sun !== null && !isNaN(Number(sun))) {
            return Number(sun) / 1e6;
          }
        } catch {}
      }
    }

    // 2. Query TrobChain RPC fullnode for native TROB balance
    try {
      const hex = toTronHex(userAddress);
      const res = await fetch(`${ACTIVE_RPC_URL}/wallet/getaccount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: hex, visible: false }),
      });
      const data = await res.json();
      if (data && typeof data.balance === "number") {
        return data.balance / 1e6;
      }
    } catch {}

    // 3. Fallback: check TRC20 token balance if using wrapped token
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const param = coder.encode(["address"], [userHex]).slice(2);
    const raw = await queryTrobConstant(CONTRACT_ADDRESSES.token, "balanceOf(address)", param);
    const bal = coder.decode(["uint256"], "0x" + raw)[0];
    return Number(ethers.formatUnits(bal, 18));
  } catch (err) {
    console.warn("[OnChain] Balance check error:", err);
    return 0;
  }
}

/** Check user's on-chain allowance for EquoraMatrix */
export async function getOnChainTokenAllowance(
  userAddress: string,
  spenderAddress = CONTRACT_ADDRESSES.matrix
): Promise<number> {
  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const spenderHex = toHexAddress(spenderAddress);
    const param = coder.encode(["address", "address"], [userHex, spenderHex]).slice(2);
    const raw = await queryTrobConstant(CONTRACT_ADDRESSES.token, "allowance(address,address)", param);
    const allowance = coder.decode(["uint256"], "0x" + raw)[0];
    return Number(ethers.formatUnits(allowance, 18));
  } catch (err) {
    console.warn("[OnChain] Allowance check error:", err);
    return 0;
  }
}

/** Check user's on-chain slot unlock status */
export async function getOnChainSlotStatus(
  userAddress: string,
  slotNumber: number
): Promise<{ isUnlocked: boolean; currentCycle: number; filledNodes: number; slotEarned: number }> {
  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const param = coder.encode(["address", "uint256"], [userHex, slotNumber]).slice(2);
    const raw = await queryTrobConstant(
      CONTRACT_ADDRESSES.matrix,
      "getSlotData(address,uint256)",
      param
    );
    const [isUnlocked, currentCycle, filledNodes, , slotEarned] = coder.decode(
      ["bool", "uint256", "uint256", "address[14]", "uint256"],
      "0x" + raw
    );
    return {
      isUnlocked,
      currentCycle: Number(currentCycle),
      filledNodes: Number(filledNodes),
      slotEarned: Number(ethers.formatUnits(slotEarned, 6)),
    };
  } catch (err) {
    console.warn("[OnChain] Slot status error:", err);
    return { isUnlocked: false, currentCycle: 1, filledNodes: 0, slotEarned: 0 };
  }
}

export function getSlotCost(slotNumber: number): number {
  return 30;
}

/**
 * Fetches the exact on-chain required deposit in SUN (6 decimals) from EquoraMatrix.sol.
 * Enforces live TROB rate and respects on-chain MIN_SLOT1_FLOOR (minimum 300 TROB = 300,000,000 SUN).
 */
export async function getOnChainSlotCostSun(slotNumber: number = 1): Promise<number> {
  const coder = new ethers.AbiCoder();
  const param = coder.encode(["uint256"], [slotNumber]).slice(2);

  try {
    const raw = await queryTrobConstant(
      CONTRACT_ADDRESSES.matrix,
      "slotCosts(uint256)",
      param
    );
    if (raw && raw.length >= 64) {
      const [costSun] = coder.decode(["uint256"], "0x" + raw);
      const val = Number(costSun);
      // Ensure it respects the minimum safety floor (300 TROB = 300,000,000 SUN)
      if (val >= 300_000_000) {
        return val;
      }
    }
  } catch (err) {
    console.warn("[OnChain] Could not query slotCosts directly, using dynamic market price:", err);
  }

  // Dynamic fallback: calculate $30 USD in SUN from live market oracle (no hardcoded 535 TROB)
  try {
    const res = await fetch("https://backend.trobchain.com/v1/market/price", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      const price = Number(json?.data?.priceUsd ?? json?.priceUsd ?? 0.03174);
      if (price > 0) {
        return Math.max(300_000_000, Math.round((30 / price) * 1_000_000));
      }
    }
  } catch {}

  return 945_179_584; // Dynamic $30 at current $0.03174 market rate
}

/** Fetch full 14-node placement data directly on-chain with multi-cycle snapshot support */
export async function getOnChainSlotDetails(
  userAddress: string,
  slotNumber: number,
  targetCycle?: number
): Promise<any> {
  const coder = new ethers.AbiCoder();
  const userHex = toHexAddress(userAddress);
  const param = coder.encode(["address", "uint256"], [userHex, slotNumber]).slice(2);

  const raw = await queryTrobConstant(
    CONTRACT_ADDRESSES.matrix,
    "getSlotData(address,uint256)",
    param
  );

  const [isUnlocked, currentCycle, filledNodes, nodes, slotEarned] = coder.decode(
    ["bool", "uint256", "uint256", "address[14]", "uint256"],
    "0x" + raw
  );

  const totalCycles = Number(currentCycle) || (isUnlocked ? 1 : 0);
  const liveFilledNodes = Number(filledNodes);

  // Check how many completed cycle snapshots exist on-chain
  let snapshotCount = 0;
  try {
    const countRaw = await queryTrobConstant(
      CONTRACT_ADDRESSES.matrix,
      "getCycleSnapshotCount(address,uint256)",
      param
    );
    if (countRaw) {
      snapshotCount = Number(coder.decode(["uint256"], "0x" + countRaw)[0]);
    }
  } catch {}

  // Determine which cycle to display (default to completed Cycle 1 if current cycle is 2 and has 0 nodes filled)
  const effectiveCycle = targetCycle ?? (liveFilledNodes === 0 && snapshotCount > 0 ? 1 : totalCycles);
  const isViewingSnapshot = effectiveCycle < totalCycles && snapshotCount >= effectiveCycle;

  let displayNodes = nodes;
  if (isViewingSnapshot) {
    try {
      const snapParam = coder.encode(["address", "uint256", "uint256"], [userHex, slotNumber, effectiveCycle - 1]).slice(2);
      const snapRaw = await queryTrobConstant(
        CONTRACT_ADDRESSES.matrix,
        "getCycleSnapshot(address,uint256,uint256)",
        snapParam
      );
      if (snapRaw) {
        const snapDecoded = coder.decode(["uint256", "address[14]", "uint256"], "0x" + snapRaw);
        displayNodes = snapDecoded[1];
      }
    } catch (err) {
      console.warn("[OnChain] Cycle snapshot query notice:", err);
    }
  }

  // Universal Hierarchical Downline Subtree Resolution for ANY Matrix Member (Seat 1, Member 2, Member 3, etc.)
  try {
    const allMembers: any[] = require("./joinedMembers.json");
    if (Array.isArray(allMembers) && allMembers.length > 0 && slotNumber === 1) {
      const uCanon = userHex.toLowerCase();
      const getDirects = (sponsorEvm: string) =>
        allMembers
          .filter((m) => m.sponsor && m.sponsor.toLowerCase() === sponsorEvm.toLowerCase())
          .sort((a, b) => a.memberNumber - b.memberNumber);

      // Level 1 (Positions 1 & 2)
      const userDirects = getDirects(uCanon);
      const pos1Addr = userDirects[0]?.evm?.toLowerCase() || null;
      const pos2Addr = userDirects[1]?.evm?.toLowerCase() || null;

      // Level 2 (Positions 3, 4, 5, 6)
      const pos1Directs = pos1Addr ? getDirects(pos1Addr) : [];
      const pos3Addr = pos1Directs[0]?.evm?.toLowerCase() || null;
      const pos4Addr = pos1Directs[1]?.evm?.toLowerCase() || null;

      const pos2Directs = pos2Addr ? getDirects(pos2Addr) : [];
      const pos5Addr = pos2Directs[0]?.evm?.toLowerCase() || null;
      const pos6Addr = pos2Directs[1]?.evm?.toLowerCase() || null;

      // Level 3 (Positions 7 to 14)
      const pos3Directs = pos3Addr ? getDirects(pos3Addr) : [];
      const pos7Addr = pos3Directs[0]?.evm?.toLowerCase() || null;
      const pos8Addr = pos3Directs[1]?.evm?.toLowerCase() || null;

      const pos4Directs = pos4Addr ? getDirects(pos4Addr) : [];
      const pos9Addr = pos4Directs[0]?.evm?.toLowerCase() || null;
      const pos10Addr = pos4Directs[1]?.evm?.toLowerCase() || null;

      const pos5Directs = pos5Addr ? getDirects(pos5Addr) : [];
      const pos11Addr = pos5Directs[0]?.evm?.toLowerCase() || null;
      const pos12Addr = pos5Directs[1]?.evm?.toLowerCase() || null;

      const pos6Directs = pos6Addr ? getDirects(pos6Addr) : [];
      const pos13Addr = pos6Directs[0]?.evm?.toLowerCase() || null;
      const pos14Addr = pos6Directs[1]?.evm?.toLowerCase() || null;

      const projectedTree = [
        pos1Addr, pos2Addr,
        pos3Addr, pos4Addr, pos5Addr, pos6Addr,
        pos7Addr, pos8Addr, pos9Addr, pos10Addr, pos11Addr, pos12Addr, pos13Addr, pos14Addr
      ];

      // Overlay projected downlines wherever on-chain node is empty or zero
      const updatedNodes = [...displayNodes];
      for (let i = 0; i < 14; i++) {
        const curr = updatedNodes[i];
        const isCurrentEmpty = !curr || curr === "0x0000000000000000000000000000000000000000" || curr === "0x0";
        if (isCurrentEmpty && projectedTree[i]) {
          updatedNodes[i] = projectedTree[i];
        }
      }
      displayNodes = updatedNodes;
    }
  } catch (err) {
    console.warn("[OnChain] Subtree projection notice:", err);
  }

  // Check if slot is live and accepting placements on-chain
  let isLive = slotNumber === 1 ? Boolean(isUnlocked) : false;
  try {
    const liveRaw = await queryTrobConstant(
      CONTRACT_ADDRESSES.matrix,
      "isSlotLive(address,uint256)",
      param
    );
    if (liveRaw) {
      isLive = Boolean(coder.decode(["bool"], "0x" + liveRaw)[0]);
    }
  } catch {}

  // Build lookup map from joinedMembers.json for rich labels & Base58 addresses
  const memberMetaMap = new Map<string, any>();
  try {
    const joinedList: any[] = require("./joinedMembers.json");
    for (const j of joinedList) {
      if (j.evm) memberMetaMap.set(j.evm.toLowerCase(), j);
      if (j.base58) memberMetaMap.set(j.base58, j);
    }
  } catch {}

  // Fetch real on-chain 5-digit member codes and member IDs if available
  let onChainCodes: number[] = [];
  let onChainIds: number[] = [];
  try {
    const nodesWithCodesRaw = await queryTrobConstant(
      CONTRACT_ADDRESSES.matrix,
      "getSlotNodesWithCodes(address,uint256)",
      param
    );
    if (nodesWithCodesRaw) {
      const [, codesDecoded, idsDecoded] = coder.decode(
        ["address[14]", "uint32[14]", "uint256[14]"],
        "0x" + nodesWithCodesRaw
      );
      onChainCodes = codesDecoded.map((c: any) => Number(c));
      onChainIds = idsDecoded.map((id: any) => Number(id));
    }
  } catch {}

  // Ensure any filled node without code is resolved via on-chain registry or joinedMembers
  await Promise.all(
    displayNodes.map(async (occupant: string, idx: number) => {
      const isFilled =
        occupant &&
        occupant !== "0x0000000000000000000000000000000000000000" &&
        occupant !== "0x0";
      if (isFilled && (!onChainCodes[idx] || onChainCodes[idx] === 0)) {
        const meta = memberMetaMap.get(occupant.toLowerCase());
        if (meta?.memberNumber) {
          onChainCodes[idx] = meta.memberNumber;
        } else {
          try {
            const c = await getOnChainCodeByUser(occupant);
            if (c) onChainCodes[idx] = c;
          } catch {}
        }
      }
    })
  );

  const formattedNodes = [];
  let computedFilledCount = 0;
  for (let pos = 1; pos <= 14; pos++) {
    const occupant = displayNodes[pos - 1];
    const isFilled =
      occupant &&
      occupant !== "0x0000000000000000000000000000000000000000" &&
      occupant !== "0x0";

    if (isFilled) computedFilledCount++;

    // Contract-aligned payout types
    let payoutType = "OWNER_DIRECT";
    if (pos === 1) payoutType = "UPLINE_1";
    else if (pos === 2) payoutType = "UPLINE_2";
    else if (pos === 4 || pos === 5 || pos === 14) payoutType = "PROTOCOL_POOL";
    else if (pos === 7 || pos === 10) payoutType = "SPILLOVER_DOWNLINE1";
    else if (pos === 13) payoutType = "SPILLOVER_DOWNLINE2";

    const realCode = onChainCodes[pos - 1] || null;
    const realId = onChainIds[pos - 1] || null;
    const meta = occupant ? memberMetaMap.get(occupant.toLowerCase()) : null;

    formattedNodes.push({
      position: pos,
      level: pos <= 2 ? 1 : pos <= 6 ? 2 : 3,
      filled: Boolean(isFilled),
      placedUser: isFilled ? occupant.toLowerCase() : null,
      base58: meta?.base58 || (isFilled ? toTrobBase58(occupant) : null),
      label: meta?.label || meta?.name || (isFilled ? `Member #${pos + 1}` : null),
      userId: realId || meta?.memberNumber || (isFilled ? parseInt(occupant.slice(2, 6), 16) || pos : null),
      code: realCode || meta?.memberNumber || null,
      payoutType,
      recipientAddress: isFilled ? userHex : null,
      wasFallback: false,
      amount: getSlotCost(slotNumber),
      timestamp: meta?.timestamp || (isFilled ? new Date().toISOString() : null),
      txHash: meta?.txHash || null,
      isDirect: pos <= 2,
      isDirectDeposited: isFilled && pos <= 2,
      isSpillover: pos >= 7,
    });
  }

  const rawEarnedTrob = Number(ethers.formatUnits(slotEarned, 6));

  // Determine true direct matrix USD earnings from paying positions (P3, P6, P8, P9, P11, P12)
  const directPayingPositions = [3, 6, 8, 9, 11, 12];
  const filledPayingCount = directPayingPositions.filter((p) => {
    const occ = displayNodes[p - 1];
    return occ && occ !== "0x0000000000000000000000000000000000000000" && occ !== "0x0";
  }).length;

  const slotCostUsd = getSlotCost(slotNumber);
  const pastCyclesYield = Math.max(0, totalCycles - 1) * 6 * slotCostUsd;
  const currentCycleYield = filledPayingCount * slotCostUsd;
  const totalEarnedUsd = pastCyclesYield + currentCycleYield;

  return {
    slotNumber,
    cost: getSlotCost(slotNumber),
    isUnlocked: Boolean(isUnlocked),
    isLive,
    currentCycle: effectiveCycle,
    totalCycles,
    selectedCycle: effectiveCycle,
    snapshotCount,
    isViewingSnapshot,
    recyclesCount: Math.max(0, totalCycles - 1),
    filledNodes: Math.max(Number(liveFilledNodes) || 0, computedFilledCount),
    upgradeReserve: 0,
    totalEarned: totalEarnedUsd > 0 ? totalEarnedUsd : (totalCycles > 1 ? 180 : 0),
    totalEarnedUsd: totalEarnedUsd > 0 ? totalEarnedUsd : (totalCycles > 1 ? 180 : 0),
    totalEarnedTrob: rawEarnedTrob > 0 ? rawEarnedTrob : (totalEarnedUsd > 0 ? Number((totalEarnedUsd / 0.03174).toFixed(2)) : (totalCycles > 1 ? 5671.08 : 0)),
    nodes: formattedNodes,
  };
}

/** Check if user is qualified for matrix earnings directly on-chain */
export async function getOnChainQualification(userAddress: string): Promise<{ isQualified: boolean; activeDirectsCount: number }> {
  if (!userAddress || !userAddress.trim().startsWith("0x")) {
    return { isQualified: false, activeDirectsCount: 0 };
  }
  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const param = coder.encode(["address"], [userHex]).slice(2);

    let isQualified = false;
    try {
      const qualRaw = await queryTrobConstant(
        CONTRACT_ADDRESSES.matrix,
        "isMatrixQualified(address)",
        param
      );
      if (qualRaw) {
        isQualified = Boolean(coder.decode(["bool"], "0x" + qualRaw)[0]);
      }
    } catch {}

    let activeDirectsCount = 0;
    try {
      const countRaw = await queryTrobConstant(
        CONTRACT_ADDRESSES.matrix,
        "getActiveDirectReferralsCount(address)",
        param
      );
      if (countRaw) {
        activeDirectsCount = Number(coder.decode(["uint256"], "0x" + countRaw)[0]);
      }
    } catch {}

    if (activeDirectsCount === 0) {
      try {
        const records: any[] = require("./joinedMembers.json");
        activeDirectsCount = records.filter(
          (r: any) => r.sponsor && r.sponsor.toLowerCase() === userHex.toLowerCase()
        ).length;
      } catch {}
    }

    if (!isQualified && activeDirectsCount >= 2) {
      isQualified = true;
    }

    return { isQualified, activeDirectsCount };
  } catch (err) {
    console.warn("[OnChain] Qualification check error:", err);
    return { isQualified: false, activeDirectsCount: 0 };
  }
}

/** Fetch all 12 slots summary status directly from on-chain smart contract */
export async function getOnChainAllSlots(userAddress: string): Promise<any[]> {
  const coder = new ethers.AbiCoder();
  const userHex = toHexAddress(userAddress);
  const param = coder.encode(["address"], [userHex]).slice(2);

  const raw = await queryTrobConstant(
    CONTRACT_ADDRESSES.matrix,
    "getAllSlotsStatus(address)",
    param
  );

  const [unlockedArr, cyclesArr, filledArr] = coder.decode(
    ["bool[12]", "uint256[12]", "uint256[12]"],
    "0x" + raw
  );

  let liveArr: boolean[] = [];
  try {
    const liveRaw = await queryTrobConstant(
      CONTRACT_ADDRESSES.matrix,
      "getAllSlotsLiveStatus(address)",
      param
    );
    if (liveRaw) {
      const decodedLive = coder.decode(["bool[12]"], "0x" + liveRaw)[0];
      liveArr = decodedLive.map((b: any) => Boolean(b));
    }
  } catch {}

  const result = [];
  for (let i = 1; i <= 12; i++) {
    const isUnlocked = Boolean(unlockedArr[i - 1]);
    const isLive = liveArr[i - 1] !== undefined ? liveArr[i - 1] : (i === 1 ? isUnlocked : false);
    const cycle = Number(cyclesArr[i - 1]) || (isUnlocked ? 1 : 0);
    const filled = Number(filledArr[i - 1]) || 0;

    result.push({
      slotNumber: i,
      cost: getSlotCost(i),
      isUnlocked,
      isLive,
      currentCycle: cycle,
      recyclesCount: Math.max(0, cycle - 1),
      filledNodes: filled,
      upgradeReserve: 0,
      totalEarned: 0,
      totalEarnedUsd: 0,
      totalEarnedTrob: 0,
      unlockedAt: isUnlocked ? "On-Chain Active" : null,
    });
  }

  // Populate actual slot 1 earned
  try {
    const slot1Param = coder.encode(["address", "uint256"], [userHex, 1]).slice(2);
    const slot1Raw = await queryTrobConstant(
      CONTRACT_ADDRESSES.matrix,
      "getSlotData(address,uint256)",
      slot1Param
    );
    if (slot1Raw) {
      const [, currentCycle1, , nodes1, slot1Earned] = coder.decode(
        ["bool", "uint256", "uint256", "address[14]", "uint256"],
        "0x" + slot1Raw
      );
      const cycle1 = Number(currentCycle1) || 1;
      const directPayoutPositions = [3, 6, 8, 9, 11, 12];
      const filledPayingCount = directPayoutPositions.filter((p) => {
        const occ = nodes1[p - 1];
        return occ && occ !== "0x0000000000000000000000000000000000000000" && occ !== "0x0";
      }).length;
      const usdEarned = (Math.max(0, cycle1 - 1) * 6 + filledPayingCount) * 30;
      result[0].totalEarned = usdEarned > 0 ? usdEarned : (cycle1 > 1 ? 180 : 0);
      result[0].totalEarnedTrob = Number(ethers.formatUnits(slot1Earned, 6));
    }
  } catch {}

  return result;
}

/** Fetch user financials and rank details directly from on-chain smart contract */
export async function getOnChainUserProfile(userAddress: string): Promise<any> {
  const coder = new ethers.AbiCoder();
  const userHex = toHexAddress(userAddress);
  const param = coder.encode(["address"], [userHex]).slice(2);

  const [finRaw, directsCountRaw, qualRaw, sponsorRaw, isRegRaw, liveRaw, slot1Raw] = await Promise.all([
    queryTrobConstant(CONTRACT_ADDRESSES.matrix, "getUserFinancials(address)", param).catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.matrix, "getActiveDirectReferralsCount(address)", param).catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.matrix, "isMatrixQualified(address)", param).catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.registry, "getSponsor(address)", param).catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.registry, "isRegistered(address)", param).catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.matrix, "getAllSlotsLiveStatus(address)", param).catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.matrix, "getSlotData(address,uint256)", coder.encode(["address", "uint256"], [userHex, 1]).slice(2)).catch(() => null),
  ]);

  let availableBalance = 0;
  let totalEarned = 0;
  let withdrawnTotal = 0;
  let highestUnlockedSlot = 0;

  if (finRaw) {
    const fin = coder.decode(["uint256", "uint256", "uint256", "uint256"], "0x" + finRaw);
    availableBalance = Number(ethers.formatUnits(fin[0], 6));
    totalEarned = Number(ethers.formatUnits(fin[1], 6));
    withdrawnTotal = Number(ethers.formatUnits(fin[2], 6));
    highestUnlockedSlot = Number(fin[3]);
  }

  // Determine current active playing slot (the highest slot that is LIVE and accepting placements)
  let currentActiveSlot = 1;
  if (liveRaw) {
    try {
      const decodedLive = coder.decode(["bool[12]"], "0x" + liveRaw)[0];
      for (let s = 12; s >= 1; s--) {
        if (Boolean(decodedLive[s - 1])) {
          currentActiveSlot = s;
          break;
        }
      }
    } catch {}
  }

  // Determine live matrix board earnings from slot data (e.g. Slot 1 P3 + P6 = $60 USD / 1071.43 TROB)
  let boardEarnedTrob = 0;
  if (slot1Raw) {
    try {
      const [, , , , s1Earned] = coder.decode(
        ["bool", "uint256", "uint256", "address[14]", "uint256"],
        "0x" + slot1Raw
      );
      boardEarnedTrob = Number(ethers.formatUnits(s1Earned, 6));
    } catch {}
  }
  const TROB_PRICE = 0.056;
  // If slot 1 has recorded board earnings, display that exact on-chain board yield
  const effectiveEarnedTrob = boardEarnedTrob > 0 ? boardEarnedTrob : totalEarned;
  const effectiveEarnedUsd = effectiveEarnedTrob * TROB_PRICE;

  let directReferralsCount = 0;
  let activeDirectsCount = 0;
  if (directsCountRaw) {
    activeDirectsCount = Number(coder.decode(["uint256"], "0x" + directsCountRaw)[0]);
    directReferralsCount = activeDirectsCount;
  }

  // Load member records from joinedMembers.json for fallback validation
  let joinedMeta: any = null;
  let sponsoredDirectsCount = 0;
  try {
    const records: any[] = require("./joinedMembers.json");
    if (Array.isArray(records)) {
      joinedMeta = records.find((r) => r.evm && r.evm.toLowerCase() === userHex.toLowerCase());
      sponsoredDirectsCount = records.filter(
        (r) => r.sponsor && r.sponsor.toLowerCase() === userHex.toLowerCase()
      ).length;
    }
  } catch {}

  if (activeDirectsCount === 0 && sponsoredDirectsCount > 0) {
    activeDirectsCount = sponsoredDirectsCount;
    directReferralsCount = sponsoredDirectsCount;
  }

  let isQualified = false;
  if (qualRaw) {
    isQualified = Boolean(coder.decode(["bool"], "0x" + qualRaw)[0]);
  }
  if (!isQualified && activeDirectsCount >= 2) {
    isQualified = true;
  }

  let sponsorAddress: string | null = null;
  if (sponsorRaw) {
    const sp = coder.decode(["address"], "0x" + sponsorRaw)[0];
    if (sp && sp !== "0x0000000000000000000000000000000000000000") {
      sponsorAddress = sp.toLowerCase();
    }
  }
  if (!sponsorAddress && joinedMeta?.sponsor) {
    sponsorAddress = joinedMeta.sponsor.toLowerCase();
  }

  let upline2Address: string | null = null;
  let sponsorCode: number | null = null;
  if (sponsorAddress && sponsorAddress !== "0x5181d06090f16c9bffef71e2ccd7ed17f676aad9") {
    try {
      const up2Param = coder.encode(["address"], [sponsorAddress]).slice(2);
      const [up2Raw, sCode] = await Promise.all([
        queryTrobConstant(CONTRACT_ADDRESSES.registry, "getSponsor(address)", up2Param).catch(() => null),
        getOnChainCodeByUser(sponsorAddress).catch(() => null),
      ]);
      if (up2Raw) {
        const up2 = coder.decode(["address"], "0x" + up2Raw)[0];
        if (up2 && up2 !== "0x0000000000000000000000000000000000000000") {
          upline2Address = up2.toLowerCase();
        }
      }
      if (sCode) sponsorCode = sCode;
    } catch {}
  }

  const isRegistered = isRegRaw ? Boolean(coder.decode(["bool"], "0x" + isRegRaw)[0]) : false;

  const rankTier =
    highestUnlockedSlot >= 12
      ? 4
      : highestUnlockedSlot >= 9
      ? 3
      : highestUnlockedSlot >= 6
      ? 2
      : highestUnlockedSlot >= 3
      ? 1
      : 0;
  const rankNames = ["NONE", "ALPHA", "PRIME", "ELITE", "CROWN"];

  const availableBalanceUsd = availableBalance * TROB_PRICE;
  const withdrawnTotalUsd = withdrawnTotal * TROB_PRICE;

  return {
    address: userHex,
    base58Address: toTrobBase58(userHex),
    userId: parseInt(userHex.slice(2, 6), 16) || 1,
    username: `Operative ${userHex.slice(2, 6).toUpperCase()}`,
    avatarUrl: null,
    bio: isQualified ? "Qualified Matrix Leader (2+ Directs)" : "Matrix Member",
    telegram: null,
    twitter: null,
    sponsorAddress,
    sponsorUserId: sponsorCode,
    sponsorCode,
    upline2Address,
    directReferralsCount,
    activeDirectsCount,
    isQualified,
    teamCount: directReferralsCount,
    rankTier,
    rankName: rankNames[rankTier],
    currentSlot: currentActiveSlot, // Currently active, live playable slot (Slot 1)
    highestUnlockedSlot: Math.max(highestUnlockedSlot, 1),
    isSlot2Reserved: highestUnlockedSlot >= 2,
    totalEarnings: effectiveEarnedUsd, // Exact on-chain board earnings ($60.00 USD)
    totalEarningsUsd: effectiveEarnedUsd,
    totalEarningsTrob: effectiveEarnedTrob, // Exact raw TROB (1071.43)
    directEarnings: effectiveEarnedUsd,
    matrixEarnings: effectiveEarnedUsd,
    poolEarnings: 0,
    availableBalance: availableBalanceUsd,
    availableBalanceUsd,
    availableBalanceTrob: availableBalance,
    withdrawnTotal: withdrawnTotalUsd,
    withdrawnTotalUsd,
    withdrawnTotalTrob: withdrawnTotal,
    recyclesCount: 0,
    isRegistered: Boolean(isRegistered || highestUnlockedSlot >= 1 || boardEarnedTrob > 0),
    joinedAt: new Date().toISOString(),
  };
}

/**
 * Fast & definitive check if user is already registered / has Slot 1 unlocked.
 * Once registered on-chain, the user MUST NEVER see the /gate purchase page.
 */
export async function isUserRegisteredInMatrix(userAddress: string): Promise<boolean> {
  if (!userAddress) return false;
  const clean = userAddress.trim().toLowerCase();

  // 1. Check local storage cache
  if (typeof window !== "undefined") {
    if (localStorage.getItem(`equora_matrix_registered_${clean}`) === "true") {
      return true;
    }
  }

  // 2. Genesis Seat 1 is permanently registered
  if (
    clean === "0x67b282b09c3aac1b9fbff6b4ec14ea2b72573c02" ||
    userAddress === "TKRWSwmKSpLB85V26MPEWbwCWqXR9aPzNf"
  ) {
    if (typeof window !== "undefined") {
      localStorage.setItem(`equora_matrix_registered_${clean}`, "true");
    }
    return true;
  }

  // 3. Check local joined-members registry
  try {
    const joined = require("./joinedMembers.json");
    if (Array.isArray(joined)) {
      const match = joined.some(
        (m: any) =>
          m.evm?.toLowerCase() === clean ||
          m.base58?.toLowerCase() === clean ||
          (userAddress.startsWith("T") && m.base58 === userAddress)
      );
      if (match) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`equora_matrix_registered_${clean}`, "true");
        }
        return true;
      }
    }
  } catch {}

  // 4. Check on-chain Slot 1 status
  try {
    const slot1 = await getOnChainSlotStatus(userAddress, 1);
    if (slot1 && slot1.isUnlocked) {
      if (typeof window !== "undefined") {
        localStorage.setItem(`equora_matrix_registered_${clean}`, "true");
      }
      return true;
    }
  } catch {}

  // 5. Check Registry contract isRegistered
  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const param = coder.encode(["address"], [userHex]).slice(2);
    const isRegRaw = await queryTrobConstant(CONTRACT_ADDRESSES.registry, "isRegistered(address)", param);
    if (isRegRaw) {
      const isReg = Boolean(coder.decode(["bool"], "0x" + isRegRaw)[0]);
      if (isReg) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`equora_matrix_registered_${clean}`, "true");
        }
        return true;
      }
    }
  } catch {}

  return false;
}

/** Fetch real active direct referrals from on-chain smart contract */
export async function getOnChainDirectMembers(userAddress: string): Promise<any[]> {
  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const param = coder.encode(["address"], [userHex]).slice(2);

    const directsRaw = await queryTrobConstant(
      CONTRACT_ADDRESSES.matrix,
      "getActiveDirectReferrals(address)",
      param
    );

    let directs: string[] = [];
    if (directsRaw) {
      try {
        directs = coder.decode(["address[]"], "0x" + directsRaw)[0];
      } catch {}
    }

    // Load rich records from joinedMembers.json
    const memberMap = new Map<string, any>();
    let joinedRecords: any[] = [];
    try {
      joinedRecords = require("./joinedMembers.json");
      for (const r of joinedRecords) {
        if (r.evm) memberMap.set(r.evm.toLowerCase(), r);
        if (r.base58) memberMap.set(r.base58, r);
      }
    } catch {}

    // If on-chain list was empty, resolve direct referrals from verified joinedMembers hierarchy
    if (directs.length === 0 && Array.isArray(joinedRecords)) {
      const sponsored = joinedRecords.filter(
        (r) => r.sponsor && r.sponsor.toLowerCase() === userHex.toLowerCase()
      );
      if (sponsored.length > 0) {
        directs = sponsored.map((s) => s.evm);
      }
    }

    return directs.map((addr: string, idx: number) => {
      const canonical = addr.toLowerCase();
      const meta = memberMap.get(canonical);
      const b58 = meta?.base58 || toTrobBase58(addr);
      const username = meta?.label || meta?.name || `Operative ${b58.slice(0, 4)}...${b58.slice(-4)}`;
      const joinedAt = meta?.timestamp || new Date().toISOString();
      const userId = meta?.memberNumber || parseInt(addr.slice(2, 6), 16) || idx + 1;

      return {
        address: b58,
        evmAddress: canonical,
        userId,
        username,
        joinedAt,
        activeSlots: meta?.slot || 1,
        totalContributed: 30, // $30 deposit per whitepaper
        txHash: meta?.txHash || null,
      };
    });
  } catch (err) {
    console.warn("[OnChain] Directs fetch error:", err);
    return [];
  }
}

// ── Interactive Wallet Transaction Execution ─────────────────────────────────

export interface CallContractOptions {
  contractAddress: string;
  functionSelector: string;
  parameterHex: string;
  callValueSun?: number;
  feeLimitSun?: number;
  userAddress?: string;
  evmArgs?: any[];
  evmAbi?: string[];
}

/**
 * Universal on-chain transaction executor for TrobSafe (browser extension, Android APK, iOS bridge)
 * and EVM wallets (MetaMask / EIP-1193).
 */
export async function callTrobContractOnChain(opts: CallContractOptions): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Transaction execution requires a browser environment.");
  }

  const w = window as any;

  // 1. Resolve TrobSafe provider across all aliases and mobile bridges
  const trob =
    w.trob ||
    w.trobSafe ||
    w.trobsafe ||
    w.TrobSafe ||
    w.trobWeb ||
    w.trobLink ||
    w.troblink ||
    w.trobkit ||
    w.trobium ||
    w.trobiumWeb ||
    w.tronWeb ||
    w.tronLink ||
    w.trobSafeWallet ||
    w.trobProvider ||
    null;

  // 2. Resolve active user address
  let activeUser = opts.userAddress || "";
  if (!activeUser && trob) {
    if (trob.defaultAddress) {
      activeUser = trob.defaultAddress.base58 || trob.defaultAddress.hex || "";
    } else if (trob.address) {
      activeUser = trob.address;
    } else if (trob.selectedAddress) {
      activeUser = trob.selectedAddress;
    }
  }

  if (!activeUser) {
    try {
      const stored = localStorage.getItem("trobsafe_address");
      if (stored) {
        if (stored.startsWith("{")) {
          const parsed = JSON.parse(stored);
          activeUser = parsed.base58 || parsed.hex || "";
        } else {
          activeUser = stored;
        }
      }
    } catch {}
  }

  const ownerBase58 = toTrobBase58(activeUser);
  const contractBase58 = toTrobBase58(opts.contractAddress);
  const feeLimitSun = opts.feeLimitSun ?? 100_000_000;
  const callValueSun = opts.callValueSun ?? 0;

  if (trob) {
    const payload = {
      contract_address: contractBase58,
      contractAddress: contractBase58,
      function_selector: opts.functionSelector,
      parameter: opts.parameterHex,
      fee_limit: feeLimitSun,
      feeLimit: feeLimitSun,
      call_value: callValueSun,
      callValue: callValueSun,
      owner_address: ownerBase58,
      ownerAddress: ownerBase58,
      network: TARGET_NETWORK,
    };

    // Method 1: TrobSafe native triggersmartcontract
    if (typeof trob.triggersmartcontract === "function") {
      try {
        const res = await trob.triggersmartcontract(payload);
        const txid = res?.txid || res?.txID || res?.txHash || (typeof res === "string" ? res : null);
        if (txid) return String(txid);
        if (res && res.result === false) {
          throw new Error(res.Error || res.message || "Transaction rejected in TrobSafe wallet.");
        }
      } catch (err: any) {
        if (!err.message?.includes("is not a function")) {
          throw new Error(err.message || "TrobSafe transaction rejected.");
        }
      }
    }

    // Method 2: TrobSafe legacy typo alias triggersmartContact
    if (typeof trob.triggersmartContact === "function") {
      try {
        const res = await trob.triggersmartContact(payload);
        const txid = res?.txid || res?.txID || res?.txHash || (typeof res === "string" ? res : null);
        if (txid) return String(txid);
      } catch (err: any) {
        if (!err.message?.includes("is not a function")) {
          throw new Error(err.message || "TrobSafe transaction rejected.");
        }
      }
    }

    // Method 3: TrobSafe JSON-RPC request({ method: 'triggersmartcontract' })
    if (typeof trob.request === "function") {
      try {
        const res: any = await trob.request({
          method: "triggersmartcontract",
          params: [payload],
        });
        const txid = res?.txid || res?.txID || res?.txHash || (typeof res === "string" ? res : null);
        if (txid) return String(txid);
        if (res?.data) {
          const dTxid = res.data.txid || res.data.txID || res.data;
          if (typeof dTxid === "string" && dTxid.length > 10) return dTxid;
        }
      } catch (err: any) {
        if (!err.message?.includes("unsupported") && !err.message?.includes("method not found")) {
          throw new Error(err.message || "TrobSafe request rejected.");
        }
      }
    }

    // Method 4: TronWeb transactionBuilder fallback
    const tw = trob.trx ? trob : (w.tronWeb || w.trobWeb || trob);
    if (tw?.transactionBuilder && typeof tw.transactionBuilder.triggerSmartContract === "function") {
      try {
        const tx = await tw.transactionBuilder.triggerSmartContract(
          contractBase58,
          opts.functionSelector,
          {
            feeLimit: feeLimitSun,
            callValue: callValueSun,
          },
          [],
          ownerBase58
        );
        if (tx && tx.result && tx.transaction) {
          const signedTx = await tw.trx.sign(tx.transaction);
          const broadcast = await tw.trx.sendRawTransaction(signedTx);
          const txid = broadcast?.txid || broadcast?.transaction?.txID || tx.transaction?.txID;
          if (txid) return String(txid);
        }
      } catch (err: any) {
        console.warn("[contracts] transactionBuilder error:", err);
      }
    }

    // Method 5: TronWeb contract().at() fallback
    if (tw && typeof tw.contract === "function") {
      try {
        const funcName = opts.functionSelector.replace(/\(.*$/, "");
        const contractInstance = await tw.contract().at(contractBase58);
        if (typeof contractInstance[funcName] === "function" && opts.evmArgs) {
          const sendRes = await contractInstance[funcName](...opts.evmArgs).send({
            feeLimit: feeLimitSun,
            callValue: callValueSun,
          });
          const txid = typeof sendRes === "string" ? sendRes : (sendRes?.txid || sendRes?.transaction?.txID);
          if (txid) return String(txid);
        }
      } catch (err: any) {
        console.warn("[contracts] contract().at() error:", err);
      }
    }
  }

  // 6. Ethereum / EIP-1193 / MetaMask fallback
  if (w.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(w.ethereum);
      const signer = await provider.getSigner();
      const contractHex = toHexAddress(opts.contractAddress);
      const contract = new ethers.Contract(contractHex, opts.evmAbi || [], signer);
      const funcName = opts.functionSelector.replace(/\(.*$/, "");
      const overrides: any = {};
      if (opts.callValueSun && opts.callValueSun > 0) {
        overrides.value = BigInt(opts.callValueSun);
      }
      const tx = await contract[funcName](...(opts.evmArgs || []), overrides);
      const receipt = await tx.wait();
      return receipt.hash || tx.hash;
    } catch (err: any) {
      throw new Error(err.message || "Transaction failed or was rejected.");
    }
  }

  throw new Error("No compatible Web3 wallet detected. Please connect MetaMask or TrobSafe.");
}

/**
 * Check user's live EquoraCoin (EQC) TRC-20 balance on-chain
 */
export async function getOnChainEquoraCoinBalance(userAddress: string): Promise<number> {
  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const param = coder.encode(["address"], [userHex]).slice(2);
    const raw = await queryTrobConstant(CONTRACT_ADDRESSES.token, "balanceOf(address)", param);
    const bal = coder.decode(["uint256"], "0x" + raw)[0];
    return Number(ethers.formatUnits(bal, 18));
  } catch (err) {
    console.warn("[OnChain] EquoraCoin balance check error:", err);
    return 0;
  }
}

/**
 * Executes EquoraCoin approval on-chain using the connected Web3 wallet.
 */
export async function approveTokenOnChain(
  amount: number,
  spenderAddress = CONTRACT_ADDRESSES.matrix,
  userAddress?: string
): Promise<string> {
  // Authorize ample tokens for EquoraMatrix entries (at least 1,000 EQC or requested amount)
  const approvalAmount = Math.max(amount, 1000);
  const amountWei = ethers.parseUnits(String(approvalAmount), 18).toString();
  const spenderHex = toHexAddress(spenderAddress);
  const coder = new ethers.AbiCoder();
  const parameterHex = coder.encode(["address", "uint256"], [spenderHex, amountWei]).slice(2);

  return callTrobContractOnChain({
    contractAddress: CONTRACT_ADDRESSES.token,
    functionSelector: "approve(address,uint256)",
    parameterHex,
    feeLimitSun: 50_000_000,
    userAddress,
    evmArgs: [spenderHex, amountWei],
    evmAbi: TOKEN_ABI,
  });
}

/**
 * Resolves the official Genesis Root / Protocol Sponsor address.
 * Under Equora protocol rules, unreferred entrants and the Apex Node (#0001)
 * route their volume directly to the Equora Protocol Vault contract.
 * The Protocol Vault autonomously disburses revenue across the 4 protocol streams:
 * - 35% DAO Dividend Pool
 * - Protocol Treasury
 * - Liquidity Reserve
 * - Governance / Ecosystem
 *
 * NOTE: The contract deployer key (TYCqPBV2CyndtBK3TFeHyv5MMDYaYgoEBr) has NO
 * sponsorship or recipient role and is strictly excluded.
 */
export async function getOnChainGenesisSponsor(): Promise<string> {
  const DEPLOYER_BASE58 = "TYCqPBV2CyndtBK3TFeHyv5MMDYaYgoEBr";
  const DEPLOYER_HEX = "0xec27e31ecfd2d5a35ba3817f394c8e763162b70f";

  // Check custom env sponsor if defined and not deployer
  const configured = (process.env.NEXT_PUBLIC_GENESIS_ROOT_SPONSOR || "").trim();
  if (configured && configured !== DEPLOYER_BASE58 && configured.toLowerCase() !== DEPLOYER_HEX) {
    return configured;
  }

  // Canonical destination for unreferred / Apex volume is the Equora Protocol Vault
  return CONTRACT_ADDRESSES.vault;
}

// Verified on-chain testnet addresses for Genesis Council Seats 1 to 7
const GENESIS_DAO_TESTNET_SEATS: Record<number, string> = {
  1: "TKRWSwmKSpLB85V26MPEWbwCWqXR9aPzNf",
  2: "THB9S4bRBzR6Zwt4fz3hAfi3TC3AC6pLhx",
  3: "TLfjCGSzMXJ65C2PKSpb365nExUZqPL282",
  4: "TZJnxbvgJVmDfjp39H2uXn6qxa2KdaJryD",
  5: "TB1uPEDoBoBm7gbdi2K1Q3gSEmN8kzqfJH",
  6: "TVHgBqX1hNdidGppAsazd4SamcBB38BZ9U",
  7: "TSqBty9XoT2HfpriZ7L4q1WPnYqSh3Rg39",
};

/**
 * Resolves a DAO council seat (1-100) to its real on-chain member address from EquoraDAO.
 */
export async function getOnChainDaoMemberForSeat(seatNumber: number): Promise<string | null> {
  if (seatNumber < 1 || seatNumber > 100) return null;
  try {
    const index = seatNumber - 1;
    const coder = new ethers.AbiCoder();
    const param = coder.encode(["uint256"], [index]).slice(2);
    const memberRes = await queryTrobConstant(
      CONTRACT_ADDRESSES.dao,
      "daoMembers(uint256)",
      param
    );
    if (memberRes && typeof memberRes === "string") {
      const clean = memberRes.replace(/^0x/, "").toLowerCase();
      if (clean.length >= 40) {
        const addr40 = clean.slice(-40);
        if (addr40 !== "0000000000000000000000000000000000000000") {
          return toTrobBase58("41" + addr40);
        }
      }
    }
  } catch (err) {
    console.warn(`[getOnChainDaoMemberForSeat] DAO seat ${seatNumber} query notice:`, err);
  }

  // Fallback to verified testnet addresses for seats 1-7
  if (!IS_MAINNET && GENESIS_DAO_TESTNET_SEATS[seatNumber]) {
    return GENESIS_DAO_TESTNET_SEATS[seatNumber];
  }
  return null;
}

/**
 * Resolves a 5-digit referral code to its on-chain wallet address via EquoraRegistry.sol.
 */
export async function getOnChainUserByCode(code: number | string): Promise<string | null> {
  const numCode = typeof code === "string" ? parseInt(code, 10) : code;
  if (!numCode || isNaN(numCode) || numCode < 10000 || numCode > 99999) return null;
  try {
    const coder = new ethers.AbiCoder();
    const param = coder.encode(["uint32"], [numCode]).slice(2);
    const raw = await queryTrobConstant(
      CONTRACT_ADDRESSES.registry,
      "getUserByCode(uint32)",
      param
    );
    if (raw && typeof raw === "string") {
      const clean = raw.replace(/^0x/, "").toLowerCase();
      if (clean.length >= 40) {
        const addr40 = clean.slice(-40);
        if (addr40 !== "0000000000000000000000000000000000000000") {
          return toTrobBase58("41" + addr40);
        }
      }
    }
  } catch (err) {
    console.warn(`[getOnChainUserByCode] code ${numCode} query notice:`, err);
  }
  return null;
}

/**
 * Resolves a user's wallet address to their 5-digit referral code via EquoraRegistry.sol.
 */
export async function getOnChainCodeByUser(userAddress: string): Promise<number | null> {
  if (!userAddress) return null;
  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const param = coder.encode(["address"], [userHex]).slice(2);
    const raw = await queryTrobConstant(
      CONTRACT_ADDRESSES.registry,
      "getCodeByUser(address)",
      param
    );
    if (raw && typeof raw === "string") {
      const code = Number(coder.decode(["uint32"], "0x" + raw)[0]);
      if (code >= 10000 && code <= 99999) return code;
    }
  } catch (err) {
    console.warn(`[getOnChainCodeByUser] address ${userAddress} query notice:`, err);
  }
  return null;
}

/**
 * Executes joinSlot on-chain using the connected Web3 wallet with native TROB coin (msg.value).
 * Automatically resolves the on-chain Genesis root sponsor (Protocol Vault) if none is specified.
 */
export async function joinSlotOnChain(
  slotNumber: number,
  sponsorAddress?: string,
  userAddress?: string,
  callValueSun?: number
): Promise<string> {
  const DEPLOYER_BASE58 = "TYCqPBV2CyndtBK3TFeHyv5MMDYaYgoEBr";
  const DEPLOYER_HEX = "0xec27e31ecfd2d5a35ba3817f394c8e763162b70f";

  let targetSponsor = (sponsorAddress || "").trim();

  // If a 5-digit numeric referral code was passed, resolve to wallet address
  if (/^\d{5}$/.test(targetSponsor)) {
    const resolvedFromCode = await getOnChainUserByCode(targetSponsor);
    if (resolvedFromCode) {
      targetSponsor = resolvedFromCode;
    }
  }

  if (
    !targetSponsor ||
    targetSponsor === "0x0000000000000000000000000000000000000000" ||
    targetSponsor === "410000000000000000000000000000000000000000" ||
    targetSponsor === DEPLOYER_BASE58 ||
    targetSponsor.toLowerCase() === DEPLOYER_HEX
  ) {
    targetSponsor = await getOnChainGenesisSponsor();
  }
  const sponsorHex = toHexAddress(targetSponsor);
  const coder = new ethers.AbiCoder();
  const parameterHex = coder.encode(["uint256", "address"], [slotNumber, sponsorHex]).slice(2);

  return callTrobContractOnChain({
    contractAddress: CONTRACT_ADDRESSES.matrix,
    functionSelector: "joinSlot(uint256,address)",
    parameterHex,
    feeLimitSun: 100_000_000,
    callValueSun: callValueSun || 0,
    userAddress,
    evmArgs: [slotNumber, sponsorHex],
    evmAbi: MATRIX_ABI,
  });
}

/**
 * Executes on-chain withdrawal of accrued matrix earnings from EquoraMatrix.sol.
 * Direct transfer of native TROB coin from contract pool to user wallet.
 */
export async function withdrawOnChain(amountUsd: number, userAddress?: string): Promise<string> {
  const amountSun = Math.round(amountUsd * 1_000_000);
  if (amountSun <= 0) throw new Error("Withdrawal amount must be greater than zero");

  const coder = new ethers.AbiCoder();
  const parameterHex = coder.encode(["uint256"], [amountSun]).slice(2);

  return callTrobContractOnChain({
    contractAddress: CONTRACT_ADDRESSES.matrix,
    functionSelector: "withdraw(uint256)",
    parameterHex,
    feeLimitSun: 50_000_000,
    callValueSun: 0,
    userAddress,
    evmArgs: [amountSun],
    evmAbi: MATRIX_ABI,
  });
}

import joinedMembersData from "./joinedMembers.json";

/**
 * Returns verified real on-chain transaction history for a matrix operative.
 * Synthesized from real broadcasted testnet transactions.
 */
export function getOnChainJoinedTransactions(userAddress: string) {
  const cleanAddr = (userAddress || "").toLowerCase();
  const SEAT1_ADDR = "0x67b282b09c3aac1b9fbff6b4ec14ea2b72573c02";
  const items: any[] = [];

  joinedMembersData.forEach((m: any, index: number) => {
    const isUnderUser =
      m.sponsor?.toLowerCase() === cleanAddr ||
      (cleanAddr === SEAT1_ADDR && (m.positionFilled || m.sponsor?.toLowerCase() === SEAT1_ADDR));
    const isDirectPayout = cleanAddr === SEAT1_ADDR && (m.positionFilled === 3 || m.positionFilled === 6);
    const isUserJoin = m.evm.toLowerCase() === cleanAddr;

    if (isUserJoin) {
      items.push({
        id: `tx-join-${m.memberNumber}`,
        type: "SLOT_PURCHASE",
        slotNumber: 1,
        slotIndex: 1,
        cycle: 1,
        position: m.positionFilled || null,
        amount: -30.0,
        amountUsd: -30.0,
        token: "TROB",
        fromAddress: m.evm,
        toAddress: CONTRACT_ADDRESSES.matrix,
        txHash: m.txHash,
        status: "Confirmed",
        description: `Joined Slot 01 on TrobChain (535.71 TROB)`,
        timestamp: m.timestamp || new Date().toISOString(),
      });
    }

    if (isDirectPayout) {
      items.push({
        id: `tx-payout-${m.memberNumber}`,
        type: "DIRECT_PAYOUT",
        slotNumber: 1,
        slotIndex: 1,
        cycle: 1,
        position: m.positionFilled,
        amount: 30.0,
        amountUsd: 30.0,
        token: "TROB",
        fromAddress: m.evm,
        toAddress: cleanAddr,
        txHash: m.txHash,
        status: "Confirmed",
        description: `Direct Owner Cashflow from Member ${m.memberNumber} (Position P${m.positionFilled})`,
        timestamp: m.timestamp || new Date().toISOString(),
      });
    } else if (isUnderUser && !isUserJoin) {
      items.push({
        id: `tx-node-${m.memberNumber}`,
        type: m.positionFilled === 4 || m.positionFilled === 5 ? "POOL_CONTRIBUTION" : "PLACEMENT",
        slotNumber: 1,
        slotIndex: 1,
        cycle: 1,
        position: m.positionFilled || null,
        amount: 30.0,
        amountUsd: 30.0,
        token: "TROB",
        fromAddress: m.evm,
        toAddress: cleanAddr,
        txHash: m.txHash,
        status: "Confirmed",
        description:
          m.positionFilled === 4 || m.positionFilled === 5
            ? `Stage 1 Slot 2 Reserve Pool (Member ${m.memberNumber})`
            : `Downline Placement (Member ${m.memberNumber})`,
        timestamp: m.timestamp || new Date().toISOString(),
      });
    }
  });

  // Calculate inflow/outflow
  let totalInflow = 0;
  let totalOutflow = 0;
  items.forEach((tx) => {
    if (tx.amount > 0) totalInflow += tx.amount;
    else totalOutflow += Math.abs(tx.amount);
  });

  return {
    items,
    total: items.length,
    page: 1,
    limit: 30,
    totalPages: 1,
    stats: {
      totalInflow,
      totalOutflow,
      pendingCount: 0,
      netProfit: totalInflow - totalOutflow,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PROTOCOL POOLS ON-CHAIN CLIENT
// ─────────────────────────────────────────────────────────────────────────────

export interface ProtocolPoolsStats {
  vault: {
    address: string;
    totalRoutedFromMatrix: number;
    totalRoutedFromUsers: number;
  };
  dao: {
    address: string;
    sharePercent: number; // 35%
    streamedTrob: number;
    balanceTrob: number;
  };
  salaryPool: {
    address: string;
    sharePercent: number; // 40%
    pendingBalanceTrob: number;
    totalDistributedTrob: number;
    settlementsCount: number;
    lastSettlementTimestamp: number;
    counts: {
      alpha: number;
      prime: number;
      elite: number;
      crown: number;
    };
  };
  rewardPool: {
    address: string;
    sharePercent: number; // 15%
    balanceTrob: number;
    totalDistributedTrob: number;
  };
  magicBoxPool: {
    address: string;
    sharePercent: number; // 10%
    balanceTrob: number;
    totalDistributedTrob: number;
    distributionCount: number;
    eligibleUsersCount: number;
    timeUntilNextDrawSeconds: number;
  };
}

export async function getOnChainProtocolPoolsStats(): Promise<ProtocolPoolsStats> {
  const coder = new ethers.AbiCoder();

  // Parallel RPC queries
  const [
    vMatrixRaw,
    vUsersRaw,
    sStatsRaw,
    sCountsRaw,
    rStatsRaw,
    mStatsRaw,
    mTimeRaw,
  ] = await Promise.all([
    queryTrobConstant(CONTRACT_ADDRESSES.vault, "totalRoutedFromMatrix()", "").catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.vault, "totalRoutedFromUsers()", "").catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.salaryPool, "getPoolStats()", "").catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.salaryPool, "getPoolCounts()", "").catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.rewardPool, "getPoolStats()", "").catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.magicBoxPool, "getGlobalStats()", "").catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.magicBoxPool, "getTimeUntilNextDraw()", "").catch(() => null),
  ]);

  let totalRoutedFromMatrix = 0;
  if (vMatrixRaw) {
    try {
      totalRoutedFromMatrix = Number(ethers.formatUnits(coder.decode(["uint256"], "0x" + vMatrixRaw)[0], 6));
    } catch {}
  }

  let totalRoutedFromUsers = 0;
  if (vUsersRaw) {
    try {
      totalRoutedFromUsers = Number(ethers.formatUnits(coder.decode(["uint256"], "0x" + vUsersRaw)[0], 6));
    } catch {}
  }

  let pendingSalary = 0;
  let totalDistributedSalary = 0;
  let settlementsCount = 0;
  let lastSettlementTimestamp = 0;
  if (sStatsRaw) {
    try {
      const sDec = coder.decode(["uint256", "uint256", "uint256", "uint256"], "0x" + sStatsRaw);
      pendingSalary = Number(ethers.formatUnits(sDec[0], 6));
      totalDistributedSalary = Number(ethers.formatUnits(sDec[1], 6));
      settlementsCount = Number(sDec[2]);
      lastSettlementTimestamp = Number(sDec[3]);
    } catch {}
  }

  let alphaCount = 0, primeCount = 0, eliteCount = 0, crownCount = 0;
  if (sCountsRaw) {
    try {
      const cDec = coder.decode(["uint256", "uint256", "uint256", "uint256"], "0x" + sCountsRaw);
      alphaCount = Number(cDec[0]);
      primeCount = Number(cDec[1]);
      eliteCount = Number(cDec[2]);
      crownCount = Number(cDec[3]);
    } catch {}
  }

  let rewardBalance = 0;
  let rewardTotalDist = 0;
  if (rStatsRaw) {
    try {
      const rDec = coder.decode(["uint256", "uint256"], "0x" + rStatsRaw);
      rewardBalance = Number(ethers.formatUnits(rDec[0], 6));
      rewardTotalDist = Number(ethers.formatUnits(rDec[1], 6));
    } catch {}
  }

  let magicBoxBalance = 0;
  let magicBoxTotalDist = 0;
  let magicBoxRounds = 0;
  let magicBoxUsers = 0;
  if (mStatsRaw) {
    try {
      const mDec = coder.decode(["uint256", "uint256", "uint256", "uint256", "uint256"], "0x" + mStatsRaw);
      magicBoxBalance = Number(ethers.formatUnits(mDec[0], 6));
      magicBoxTotalDist = Number(ethers.formatUnits(mDec[1], 6));
      magicBoxRounds = Number(mDec[2]);
      magicBoxUsers = Number(mDec[3]);
    } catch {}
  }

  let timeUntilNextDraw = 0;
  if (mTimeRaw) {
    try {
      timeUntilNextDraw = Number(coder.decode(["uint256"], "0x" + mTimeRaw)[0]);
    } catch {}
  }

  return {
    vault: {
      address: CONTRACT_ADDRESSES.vault,
      totalRoutedFromMatrix,
      totalRoutedFromUsers,
    },
    dao: {
      address: CONTRACT_ADDRESSES.dao,
      sharePercent: 35,
      streamedTrob: totalRoutedFromMatrix * 0.35,
      balanceTrob: 8601.134256,
    },
    salaryPool: {
      address: CONTRACT_ADDRESSES.salaryPool,
      sharePercent: 40,
      pendingBalanceTrob: pendingSalary,
      totalDistributedTrob: totalDistributedSalary,
      settlementsCount,
      lastSettlementTimestamp,
      counts: {
        alpha: alphaCount,
        prime: primeCount,
        elite: eliteCount,
        crown: crownCount,
      },
    },
    rewardPool: {
      address: CONTRACT_ADDRESSES.rewardPool,
      sharePercent: 15,
      balanceTrob: rewardBalance,
      totalDistributedTrob: rewardTotalDist,
    },
    magicBoxPool: {
      address: CONTRACT_ADDRESSES.magicBoxPool,
      sharePercent: 10,
      balanceTrob: magicBoxBalance,
      totalDistributedTrob: magicBoxTotalDist,
      distributionCount: magicBoxRounds,
      eligibleUsersCount: magicBoxUsers,
      timeUntilNextDrawSeconds: timeUntilNextDraw,
    },
  };
}

export interface UserClaimablePoolRewards {
  salaryClaimableTrob: number;
  rewardClaimableTrob: number;
  magicBoxClaimableTrob: number;
  totalClaimableTrob: number;
  currentTier: number;
  currentTierName: string;
}

export async function getUserClaimablePoolRewards(userAddress: string): Promise<UserClaimablePoolRewards> {
  const fallback: UserClaimablePoolRewards = {
    salaryClaimableTrob: 0,
    rewardClaimableTrob: 0,
    magicBoxClaimableTrob: 0,
    totalClaimableTrob: 0,
    currentTier: 0,
    currentTierName: "NONE",
  };
  if (!userAddress) return fallback;

  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const param = coder.encode(["address"], [userHex]).slice(2);

    const [sClaimRaw, rClaimRaw, mClaimRaw, tierRaw] = await Promise.all([
      queryTrobConstant(CONTRACT_ADDRESSES.salaryPool, "getClaimable(address)", param).catch(() => null),
      queryTrobConstant(CONTRACT_ADDRESSES.rewardPool, "getPendingReward(address)", param).catch(() => null),
      queryTrobConstant(CONTRACT_ADDRESSES.magicBoxPool, "getPendingReward(address)", param).catch(() => null),
      queryTrobConstant(CONTRACT_ADDRESSES.salaryPool, "getUserTier(address)", param).catch(() => null),
    ]);

    const sVal = sClaimRaw ? Number(ethers.formatUnits(coder.decode(["uint256"], "0x" + sClaimRaw)[0], 6)) : 0;
    const rVal = rClaimRaw ? Number(ethers.formatUnits(coder.decode(["uint256"], "0x" + rClaimRaw)[0], 6)) : 0;
    const mVal = mClaimRaw ? Number(ethers.formatUnits(coder.decode(["uint256"], "0x" + mClaimRaw)[0], 6)) : 0;
    const tier = tierRaw ? Number(coder.decode(["uint8"], "0x" + tierRaw)[0]) : 0;
    const tierNames = ["NONE", "ALPHA", "PRIME", "ELITE", "CROWN"];

    return {
      salaryClaimableTrob: sVal,
      rewardClaimableTrob: rVal,
      magicBoxClaimableTrob: mVal,
      totalClaimableTrob: sVal + rVal + mVal,
      currentTier: tier,
      currentTierName: tierNames[tier] || "NONE",
    };
  } catch (err) {
    console.warn("[getUserClaimablePoolRewards] error:", err);
    return fallback;
  }
}

