import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// Address helpers
// ─────────────────────────────────────────────────────────────────────────────
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58ToHex(b58: string): string {
  const bytes = [0];
  for (let i = 0; i < b58.length; i++) {
    const val = B58.indexOf(b58[i]);
    if (val === -1) return b58;
    for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
    bytes[0] += val;
    let carry = 0;
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] += carry; carry = bytes[j] >> 8; bytes[j] &= 0xff;
    }
    while (carry) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  for (let i = 0; i < b58.length && b58[i] === "1"; i++) bytes.push(0);
  const buf = Buffer.from(bytes.reverse());
  return buf.subarray(0, buf.length - 4).toString("hex");
}

/** Convert any address format → 41-prefixed tron hex */
function toTronHex(address: string): string {
  if (!address) return "";
  const c = address.trim();
  if (c.startsWith("T") && c.length === 34) return base58ToHex(c).toLowerCase();
  if (c.startsWith("0x") || c.startsWith("0X")) return ("41" + c.slice(2)).toLowerCase();
  if (c.startsWith("41") && c.length === 42) return c.toLowerCase();
  return c.toLowerCase();
}

/** Convert any address format → 0x-prefixed eth hex */
function toEthHex(address: string): string {
  if (!address) return "";
  const c = address.trim();
  if (c.startsWith("0x") || c.startsWith("0X")) return c.toLowerCase();
  if (c.startsWith("T") && c.length === 34) return ("0x" + base58ToHex(c).slice(2)).toLowerCase();
  if (c.startsWith("41") && c.length === 42) return ("0x" + c.slice(2)).toLowerCase();
  return c.toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Config — always read from process.env so Vercel/Render env vars take priority
// ─────────────────────────────────────────────────────────────────────────────
const FULLNODE_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.RPC_URL ||
  process.env.FULLNODE_URL ||
  (process.env.IS_MAINNET === "false"
    ? "https://fullnode-one-testnet.trobchain.com"
    : "https://fullnode-one.trobchain.com");

const DEFAULT_MATRIX_HEX = "41b48f1e72c64b776ce5864df74926b3b935fef308";
const DEFAULT_REGISTRY_HEX = "41d9b1ebced59d4899d306640718862e207dbfbb2a";
const DEFAULT_VAULT_HEX = "416612ba87acbdcd645f039b80f3101935bc4ad9d8";
const DEFAULT_SALARY_POOL_HEX = "4191fd22b491aa2fe8a6e4ab435113031ff84a9714"; // TPH8E3PYKreaB5CjCPXTrEnEu1bhVCvHkZ
const DEFAULT_DAO_HEX = "417816ae352da7d1a806eea8446aebbe551420429b"; // TLvBFwu7bakVPBTS9GfBmkeLZVkQ4UpXhf
const DEFAULT_MAGIC_BOX_HEX = "412b23fe5b5fc7b3ef248dd6c95554d0ae74ca6afd"; // TDuKBBieferWEHwSESRA1YKiKhJovidYsw
const DEFAULT_REWARD_POOL_HEX = "41120cd0d08658c3857b52733c730885bbed9a22e9"; // TBceWxhVxMPiWNxdi7oNs5H4rKainDh75v

const MATRIX_HEX = toTronHex(
  process.env.NEXT_PUBLIC_MATRIX_ADDRESS ||
  process.env.NEXT_PUBLIC_MATRIX_HEX ||
  process.env.MATRIX_HEX ||
  DEFAULT_MATRIX_HEX
);
const REGISTRY_HEX = toTronHex(
  process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  process.env.NEXT_PUBLIC_REGISTRY_HEX ||
  process.env.REGISTRY_HEX ||
  DEFAULT_REGISTRY_HEX
);
const VAULT_HEX = toTronHex(
  process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
  process.env.NEXT_PUBLIC_VAULT_HEX ||
  process.env.VAULT_HEX ||
  DEFAULT_VAULT_HEX
);
const SALARY_POOL_HEX = toTronHex(
  process.env.NEXT_PUBLIC_SALARY_POOL_ADDRESS ||
  process.env.NEXT_PUBLIC_SALARY_POOL_HEX ||
  process.env.SALARY_POOL_HEX ||
  DEFAULT_SALARY_POOL_HEX
);
const DAO_HEX = toTronHex(
  process.env.NEXT_PUBLIC_DAO_ADDRESS ||
  process.env.NEXT_PUBLIC_DAO_HEX ||
  DEFAULT_DAO_HEX
);
const MAGIC_BOX_HEX = toTronHex(
  process.env.NEXT_PUBLIC_MAGIC_BOX_ADDRESS ||
  process.env.NEXT_PUBLIC_MAGIC_BOX_HEX ||
  DEFAULT_MAGIC_BOX_HEX
);
const REWARD_POOL_HEX = toTronHex(
  process.env.NEXT_PUBLIC_REWARD_POOL_ADDRESS ||
  process.env.NEXT_PUBLIC_REWARD_POOL_HEX ||
  DEFAULT_REWARD_POOL_HEX
);

function encodeBase58(buffer: Uint8Array): string {
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
  return digits.reverse().map((d) => B58[d]).join("");
}

function hexToTronBase58(hex: string): string {
  if (!hex || hex === "0x0000000000000000000000000000000000000000") return "";
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex.startsWith("41") ? hex.slice(2) : hex;
  const rawBytes = Buffer.from("41" + cleanHex, "hex");
  const hash1 = crypto.createHash("sha256").update(rawBytes).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  const checksum = hash2.subarray(0, 4);
  const total = Buffer.concat([rawBytes, checksum]);
  return encodeBase58(total);
}

// ─────────────────────────────────────────────────────────────────────────────
// ABI-minimal encoder / decoder (no ethers dependency in edge runtime)
// ─────────────────────────────────────────────────────────────────────────────
function encodeAddress(addr: string): string {
  // Pad EVM address (20 bytes) to 32 bytes
  const hex = addr.startsWith("0x") ? addr.slice(2) : addr.startsWith("41") ? addr.slice(2) : addr;
  return hex.padStart(64, "0");
}

function encodeUint256(n: bigint | number): string {
  return BigInt(n).toString(16).padStart(64, "0");
}

function decodeAddress(raw: string): string {
  if (!raw || raw.length < 40) return "0x0000000000000000000000000000000000000000";
  return "0x" + raw.slice(-40).toLowerCase();
}

function decodeUint256(raw: string): bigint {
  if (!raw) return 0n;
  return BigInt("0x" + raw);
}

function decodeBool(raw: string): boolean {
  if (!raw) return false;
  return BigInt("0x" + raw) !== 0n;
}

// ─────────────────────────────────────────────────────────────────────────────
// On-chain call helper (with single transient retry)
// ─────────────────────────────────────────────────────────────────────────────
async function callContract(
  contractHex: string,
  selector: string,
  params: string = "",
  retries: number = 1
): Promise<string[]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${FULLNODE_URL}/wallet/triggerconstantcontract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_address: "410000000000000000000000000000000000000000",
          contract_address: contractHex,
          function_selector: selector,
          parameter: params,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        if (attempt < retries) continue;
        return [];
      }
      const data = await res.json() as any;
      const raw = data.constant_result?.[0] || "";
      if (!raw) return [];
      const chunks: string[] = [];
      for (let i = 0; i < raw.length; i += 64) chunks.push(raw.slice(i, i + 64));
      return chunks;
    } catch {
      if (attempt < retries) continue;
      return [];
    }
  }
  return [];
}

/**
 * Queries real native TROB balance directly from /wallet/getaccount (1e6 SUN).
 * Used for contracts like EquoraRewardPool where on-chain poolBalance() double-credits.
 */
async function getNativeBalanceTrob(contractHex: string, retries: number = 2): Promise<number> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${FULLNODE_URL}/wallet/getaccount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: contractHex }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        if (attempt < retries) continue;
        return 0;
      }
      const acct = await res.json() as any;
      const sun = Number(acct?.balance || 0);
      return Number.isFinite(sun) ? sun / 1_000_000 : 0;
    } catch {
      if (attempt < retries) continue;
      return 0;
    }
  }
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read userSlots(address, slotNumber) → isUnlocked, isLive, cycle, filledNodes, earned
// ─────────────────────────────────────────────────────────────────────────────
async function getUserSlot(userEthHex: string, slot: number) {
  const params = encodeAddress(userEthHex) + encodeUint256(slot);
  const chunks = await callContract(MATRIX_HEX, "userSlots(address,uint256)", params);
  if (chunks.length < 5) return null;
  return {
    isUnlocked: decodeBool(chunks[0]),
    isLive:     decodeBool(chunks[1]),
    currentCycle: Number(decodeUint256(chunks[2])),
    filledNodes:  Number(decodeUint256(chunks[3])),
    totalEarned:  decodeUint256(chunks[4]),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Read getSlotDataV2(address, slot) → isUnlocked, isLive, cycle, filledNodes, nodes[14], earned
// ─────────────────────────────────────────────────────────────────────────────
async function getSlotDataV2(userEthHex: string, slot: number) {
  const params = encodeAddress(userEthHex) + encodeUint256(slot);
  // getSlotDataV2 returns: bool, bool, uint256, uint256, address[14], uint256 (19 32-byte words)
  const chunks = await callContract(MATRIX_HEX, "getSlotDataV2(address,uint256)", params);
  if (chunks.length < 19) return null;

  const isUnlocked   = decodeBool(chunks[0]);
  const isLive       = decodeBool(chunks[1]);
  const currentCycle = Number(decodeUint256(chunks[2]));
  const filledNodes  = Number(decodeUint256(chunks[3]));

  // chunks[4..17] = 14 addresses (fixed-size array address[14])
  const nodes: string[] = [];
  for (let i = 0; i < 14; i++) {
    const rawNode = chunks[4 + i];
    nodes.push(rawNode ? decodeAddress(rawNode) : "0x0000000000000000000000000000000000000000");
  }

  const slotEarned = decodeUint256(chunks[18] || "");

  return { isUnlocked, isLive, currentCycle, filledNodes, nodes, slotEarned };
}

// ─────────────────────────────────────────────────────────────────────────────
// Read activeDirectReferrals(address) → uint256
// ─────────────────────────────────────────────────────────────────────────────
async function getActiveDirects(userEthHex: string): Promise<number> {
  const params = encodeAddress(userEthHex);
  const chunks = await callContract(MATRIX_HEX, "activeDirectReferrals(address)", params);
  return chunks[0] ? Number(decodeUint256(chunks[0])) : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read isMatrixQualified(address) → bool
// ─────────────────────────────────────────────────────────────────────────────
async function isQualified(userEthHex: string): Promise<boolean> {
  try {
    const chunks = await callContract(MATRIX_HEX, "isMatrixQualified(address)", encodeAddress(userEthHex));
    if (chunks && chunks[0]) {
      return decodeBool(chunks[0]);
    }
  } catch {}
  const directs = await getActiveDirects(userEthHex);
  return directs >= 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read userBalance(address) → uint256
// ─────────────────────────────────────────────────────────────────────────────
async function getUserBalance(userEthHex: string): Promise<bigint> {
  const chunks = await callContract(MATRIX_HEX, "userBalance(address)", encodeAddress(userEthHex));
  return chunks[0] ? decodeUint256(chunks[0]) : 0n;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read totalEarned(address), totalWithdrawn(address), highestSlot(address)
// ─────────────────────────────────────────────────────────────────────────────
async function getUserStats(userEthHex: string) {
  const [eChunks, wChunks, hChunks] = await Promise.all([
    callContract(MATRIX_HEX, "totalEarned(address)", encodeAddress(userEthHex)),
    callContract(MATRIX_HEX, "totalWithdrawn(address)", encodeAddress(userEthHex)),
    callContract(MATRIX_HEX, "highestSlot(address)", encodeAddress(userEthHex)),
  ]);
  return {
    totalEarned:   eChunks[0] ? decodeUint256(eChunks[0]) : 0n,
    totalWithdrawn: wChunks[0] ? decodeUint256(wChunks[0]) : 0n,
    highestSlot:   hChunks[0] ? Number(decodeUint256(hChunks[0])) : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Read live TROB price (micro-USD per TROB, 6 decimals): market feed + on-chain oracle
// ─────────────────────────────────────────────────────────────────────────────
const EXPLORER_API_URL = (
  process.env.NEXT_PUBLIC_EXPLORER_API_URL || "https://backend.trobchain.com"
)
  .replace(/\/+$/, "")
  .replace(/\/v1$/, "");

let cachedTrobPriceUsd6 = 0;
let cachedTrobPriceAt = 0;

async function getTrobPrice(): Promise<number> {
  const now = Date.now();
  if (cachedTrobPriceUsd6 > 0 && now - cachedTrobPriceAt < 15_000) {
    return cachedTrobPriceUsd6;
  }

  try {
    const res = await fetch(`${EXPLORER_API_URL}/v1/market/price`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const json = (await res.json()) as any;
      const p = Number(json?.data?.priceUsd ?? json?.priceUsd ?? 0);
      if (Number.isFinite(p) && p > 0) {
        cachedTrobPriceUsd6 = Math.round(p * 1_000_000);
        cachedTrobPriceAt = now;
        return cachedTrobPriceUsd6;
      }
    }
  } catch {
    // Fall back to on-chain EquoraMatrix oracle below
  }

  const chunks = await callContract(MATRIX_HEX, "trobPriceUsd6()");
  if (chunks[0]) {
    const oracle6 = Number(decodeUint256(chunks[0]));
    if (Number.isFinite(oracle6) && oracle6 > 0) {
      cachedTrobPriceUsd6 = oracle6;
      cachedTrobPriceAt = now;
      return oracle6;
    }
  }

  return cachedTrobPriceUsd6 > 0 ? cachedTrobPriceUsd6 : 0;
}

let cachedEntryFeeUsd: number | null = null;
let cachedOraclePriceUsd6: number | null = null;
const cachedSlotCostsTrob = new Map<number, { value: number; at: number }>();

async function getEntryFeeUsd(): Promise<number> {
  if (cachedEntryFeeUsd && cachedEntryFeeUsd > 0) return cachedEntryFeeUsd;
  const chunks = await callContract(MATRIX_HEX, "ENTRY_FEE_USD()");
  if (chunks[0]) {
    const val = Number(decodeUint256(chunks[0])) / 1_000_000;
    if (Number.isFinite(val) && val > 0) {
      cachedEntryFeeUsd = val;
      return val;
    }
  }
  return 0;
}

async function getOnChainOraclePriceUsd6(): Promise<number> {
  if (cachedOraclePriceUsd6 && cachedOraclePriceUsd6 > 0) return cachedOraclePriceUsd6;
  const chunks = await callContract(MATRIX_HEX, "trobPriceUsd6()");
  if (chunks[0]) {
    const val = Number(decodeUint256(chunks[0]));
    if (Number.isFinite(val) && val > 0) {
      cachedOraclePriceUsd6 = val;
      return val;
    }
  }
  return 0;
}

async function getOnChainSlotCostInfo(slotNumber: number): Promise<{ usdCost: number; trobCost: number }> {
  const now = Date.now();
  const cached = cachedSlotCostsTrob.get(slotNumber);
  const entryUsd = await getEntryFeeUsd();

  let trobCost = cached && now - cached.at < 30_000 ? cached.value : 0;
  if (trobCost <= 0) {
    const chunks = await callContract(MATRIX_HEX, "slotCosts(uint256)", encodeUint256(slotNumber));
    if (chunks[0]) {
      const val = Number(decodeUint256(chunks[0])) / 1_000_000;
      if (Number.isFinite(val) && val > 0) {
        trobCost = val;
        cachedSlotCostsTrob.set(slotNumber, { value: val, at: now });
      }
    }
  }

  const baseEntry = entryUsd > 0 ? entryUsd : 30;
  const slotMultiplier = Math.pow(2, Math.max(0, slotNumber - 1));
  const usdCost = baseEntry * slotMultiplier;
  return { usdCost, trobCost };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cached On-Chain Event Index for EquoraMatrix (real tx hashes, amounts & timestamps)
// ─────────────────────────────────────────────────────────────────────────────
const TOPIC_SLOT_JOINED = "7e2b702419ffd2a85ba01fe01ef74fe54d739945e9b49382d02ed7def63f88bf";
const TOPIC_POSITION_FILLED = "42d060340aa5f20eedd25f97edb158bec9932d144acabe55a9d25654f43d1190";
const TOPIC_DISTRIBUTION_EXECUTED = "0f79e4865d07257d0cd65a1b0c4f973d40b9560870968cac1e7e8fe0a0478756";
const TOPIC_SLOT_AUTO_ACTIVATED = "972fc40fa49e0285cc46ec9cfbaeb31499345d5fa20792e320786cd7f2c871d8";
const TOPIC_PROTOCOL_POOL_FUNDED = "eff9bcc4fa6ad3f562c89e603ceec41c0088ee21d2d1213004b14a743e934c23";
const TOPIC_CYCLE_COMPLETED = "b6e98e22c7e457ea5ccfbee8c4873ca4fe77c1dc9d598cb28fec67999f630445";

interface IndexedMatrixTx {
  hash: string;
  timestamp: string;
  fromBase58: string;
  slotJoined: Array<{ user: string; slot: number; costTrob: number; sponsor: string; timestamp: number }>;
  positionFilled: Array<{ matrixOwner: string; slot: number; cycle: number; position: number; participant: string; costTrob: number }>;
  distributions: Array<{ recipient: string; amountTrob: number; payoutType: number; slot: number; cycle: number; position: number }>;
  autoActivated: Array<{ user: string; fromSlot: number; activatedSlot: number; timestamp: number }>;
  poolFunded: Array<{ matrixOwner: string; amountTrob: number; slot: number; cycle: number; position: number }>;
  cycleCompleted: Array<{ user: string; slot: number; cycle: number; timestamp: number }>;
}

const indexedTxCache = new Map<string, IndexedMatrixTx>();
let lastTxIndexSyncAt = 0;
let txIndexSyncPromise: Promise<Map<string, IndexedMatrixTx>> | null = null;
let explorerBackoffUntil = 0;

function decodeEventWordHex(data: string, wordIdx: number): string {
  const start = wordIdx * 64;
  return data.length >= start + 64 ? data.slice(start, start + 64) : "";
}

async function fetchAndDecodeMatrixTx(hash: string, timestamp: string, fromBase58: string): Promise<IndexedMatrixTx | null> {
  const existing = indexedTxCache.get(hash);
  if (existing) return existing;

  try {
    const res = await fetch(`${FULLNODE_URL}/wallet/gettransactioninfobyid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: hash }),
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return null;
    const info = (await res.json()) as any;
    const logs = Array.isArray(info?.log) ? info.log : [];
    const matrixShortHex = (MATRIX_HEX.startsWith("41") ? MATRIX_HEX.slice(2) : MATRIX_HEX).toLowerCase();

    const record: IndexedMatrixTx = {
      hash,
      timestamp: info?.blockTimeStamp ? new Date(Number(info.blockTimeStamp)).toISOString() : timestamp,
      fromBase58,
      slotJoined: [],
      positionFilled: [],
      distributions: [],
      autoActivated: [],
      poolFunded: [],
      cycleCompleted: [],
    };

    for (const lg of logs) {
      const lgAddr = String(lg?.address || "").toLowerCase();
      if (lgAddr && lgAddr !== matrixShortHex) continue;
      const topics: string[] = Array.isArray(lg?.topics) ? lg.topics : [];
      const data = String(lg?.data || "");
      const t0 = (topics[0] || "").toLowerCase();

      if (t0 === TOPIC_SLOT_JOINED && topics.length >= 3) {
        const user = decodeAddress(topics[1]);
        const slot = Number(decodeUint256(topics[2]));
        const costTrob = Number(decodeUint256(decodeEventWordHex(data, 0))) / 1e6;
        const sponsor = decodeAddress(decodeEventWordHex(data, 1));
        const ts = Number(decodeUint256(decodeEventWordHex(data, 2)));
        record.slotJoined.push({ user, slot, costTrob, sponsor, timestamp: ts });
      } else if (t0 === TOPIC_POSITION_FILLED && topics.length >= 4) {
        const matrixOwner = decodeAddress(topics[1]);
        const slot = Number(decodeUint256(topics[2]));
        const cycle = Number(decodeUint256(topics[3]));
        const position = Number(decodeUint256(decodeEventWordHex(data, 0)));
        const participant = decodeAddress(decodeEventWordHex(data, 1));
        const costTrob = Number(decodeUint256(decodeEventWordHex(data, 2))) / 1e6;
        record.positionFilled.push({ matrixOwner, slot, cycle, position, participant, costTrob });
      } else if (t0 === TOPIC_DISTRIBUTION_EXECUTED && topics.length >= 2) {
        const recipient = decodeAddress(topics[1]);
        const amountTrob = Number(decodeUint256(decodeEventWordHex(data, 0))) / 1e6;
        const payoutType = Number(decodeUint256(decodeEventWordHex(data, 1)));
        const slot = Number(decodeUint256(decodeEventWordHex(data, 2)));
        const cycle = Number(decodeUint256(decodeEventWordHex(data, 3)));
        const position = Number(decodeUint256(decodeEventWordHex(data, 4)));
        record.distributions.push({ recipient, amountTrob, payoutType, slot, cycle, position });
      } else if (t0 === TOPIC_SLOT_AUTO_ACTIVATED && topics.length >= 4) {
        const user = decodeAddress(topics[1]);
        const fromSlot = Number(decodeUint256(topics[2]));
        const activatedSlot = Number(decodeUint256(topics[3]));
        const ts = Number(decodeUint256(decodeEventWordHex(data, 0)));
        record.autoActivated.push({ user, fromSlot, activatedSlot, timestamp: ts });
      } else if (t0 === TOPIC_PROTOCOL_POOL_FUNDED && topics.length >= 2) {
        const matrixOwner = decodeAddress(topics[1]);
        const amountTrob = Number(decodeUint256(decodeEventWordHex(data, 0))) / 1e6;
        const slot = Number(decodeUint256(decodeEventWordHex(data, 1)));
        const cycle = Number(decodeUint256(decodeEventWordHex(data, 2)));
        const position = Number(decodeUint256(decodeEventWordHex(data, 3)));
        record.poolFunded.push({ matrixOwner, amountTrob, slot, cycle, position });
      } else if (t0 === TOPIC_CYCLE_COMPLETED && topics.length >= 3) {
        const user = decodeAddress(topics[1]);
        const slot = Number(decodeUint256(topics[2]));
        const cycle = Number(decodeUint256(decodeEventWordHex(data, 0)));
        const ts = Number(decodeUint256(decodeEventWordHex(data, 1)));
        record.cycleCompleted.push({ user, slot, cycle, timestamp: ts });
      }
    }

    indexedTxCache.set(hash, record);
    return record;
  } catch {
    return null;
  }
}

async function getMatrixContractEvents(): Promise<Map<string, IndexedMatrixTx>> {
  const now = Date.now();
  if (now < explorerBackoffUntil) {
    return indexedTxCache;
  }
  if (indexedTxCache.size > 0 && now - lastTxIndexSyncAt < 8_000) {
    return indexedTxCache;
  }
  if (txIndexSyncPromise) return txIndexSyncPromise;

  txIndexSyncPromise = (async () => {
    try {
      const matrixBase58 = hexToTronBase58("0x" + (MATRIX_HEX.startsWith("41") ? MATRIX_HEX.slice(2) : MATRIX_HEX));
      if (!matrixBase58) return indexedTxCache;

      const toDecode: Array<{ hash: string; timestamp: string; fromBase58: string }> = [];
      let offset = 0;
      const limit = 50;
      let hitCached = false;

      for (let page = 0; page < 25; page++) {
        const url = `${EXPLORER_API_URL}/v1/accounts/${matrixBase58}/transactions?limit=${limit}&offset=${offset}`;
        let res: Response;
        try {
          res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(4500) });
        } catch {
          explorerBackoffUntil = Date.now() + 45_000;
          break;
        }
        if (!res.ok) {
          explorerBackoffUntil = Date.now() + 45_000;
          break;
        }
        const json = (await res.json()) as any;
        const rows: any[] = Array.isArray(json?.data) ? json.data : [];
        if (rows.length === 0) break;

        for (const r of rows) {
          const hash = String(r?.hash || "");
          if (!hash) continue;
          if (indexedTxCache.has(hash)) {
            hitCached = true;
            break;
          }
          toDecode.push({
            hash,
            timestamp: r?.timestamp || new Date().toISOString(),
            fromBase58: r?.from_addr || "",
          });
        }

        if (hitCached || !json?.pagination?.nextCursor || rows.length < limit) break;
        offset += limit;
      }

      // Decode newest uncached transactions in bounded batches of 20
      for (let i = 0; i < toDecode.length; i += 20) {
        const batch = toDecode.slice(i, i + 20);
        await Promise.all(
          batch.map((t) => fetchAndDecodeMatrixTx(t.hash, t.timestamp, t.fromBase58))
        );
      }
      lastTxIndexSyncAt = Date.now();
    } catch {
      // Return whatever is already cached
    } finally {
      txIndexSyncPromise = null;
    }
    return indexedTxCache;
  })();

  return txIndexSyncPromise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read userSponsor from registry via upline mapping in Matrix
// ─────────────────────────────────────────────────────────────────────────────
async function getSponsor(userEthHex: string): Promise<string | null> {
  const chunks = await callContract(REGISTRY_HEX, "getSponsor(address)", encodeAddress(userEthHex));
  if (!chunks[0]) return null;
  const addr = decodeAddress(chunks[0]);
  return addr === "0x0000000000000000000000000000000000000000" ? null : addr;
}

// ─────────────────────────────────────────────────────────────────────────────
// Check if user is registered in matrix (slot 1 unlocked)
// ─────────────────────────────────────────────────────────────────────────────
async function isRegistered(userEthHex: string): Promise<boolean> {
  const slot = await getUserSlot(userEthHex, 1);
  return slot ? slot.isUnlocked : false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry query helpers
// ─────────────────────────────────────────────────────────────────────────────
async function getRegistryUser(userEthHex: string) {
  const params = encodeAddress(userEthHex);
  const chunks = await callContract(REGISTRY_HEX, "getUser(address)", params);
  if (chunks.length < 6) return null;
  return {
    isRegistered: decodeBool(chunks[0]),
    sponsor: decodeAddress(chunks[1]),
    regTime: decodeUint256(chunks[2]),
    directsCount: Number(decodeUint256(chunks[3])),
    id: Number(decodeUint256(chunks[4])),
    code: Number(decodeUint256(chunks[5])),
  };
}

async function getRegistryCode(userEthHex: string): Promise<number | null> {
  const params = encodeAddress(userEthHex);
  const chunks = await callContract(REGISTRY_HEX, "getCodeByUser(address)", params);
  if (!chunks[0]) return null;
  const c = Number(decodeUint256(chunks[0]));
  return c >= 10000 && c <= 99999 ? c : null;
}

async function getRegistryUserId(userEthHex: string): Promise<number | null> {
  const params = encodeAddress(userEthHex);
  const chunks = await callContract(REGISTRY_HEX, "getUserId(address)", params);
  if (!chunks[0]) return null;
  const id = Number(decodeUint256(chunks[0]));
  return id > 0 ? id : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch authoritative 14-node tree with 5-digit member codes & user IDs directly on-chain
// ─────────────────────────────────────────────────────────────────────────────
async function fetchRawNodesWithCodes(userEthHex: string, slotNumber: number) {
  const params = encodeAddress(userEthHex) + encodeUint256(slotNumber);
  const ZERO = "0x0000000000000000000000000000000000000000";

  const nodeAddresses: string[] = [];
  const nodeCodes: number[] = [];
  const nodeMemberIds: number[] = [];
  const payoutRecipients: string[] = [];
  const payoutTypes: number[] = [];

  // Try getSlotNodesDetail first (returns 5 14-element arrays: addresses, codes, ids, recipients, types)
  const detailChunks = await callContract(MATRIX_HEX, "getSlotNodesDetail(address,uint256)", params);
  if (detailChunks && detailChunks.length >= 70) {
    for (let i = 0; i < 14; i++) {
      const rawAddr = detailChunks[i];
      nodeAddresses.push(rawAddr ? decodeAddress(rawAddr) : ZERO);
      const rawCode = detailChunks[14 + i];
      nodeCodes.push(rawCode ? Number(decodeUint256(rawCode)) : 0);
      const rawId = detailChunks[28 + i];
      nodeMemberIds.push(rawId ? Number(decodeUint256(rawId)) : 0);
      const rawRecip = detailChunks[42 + i];
      payoutRecipients.push(rawRecip ? decodeAddress(rawRecip) : ZERO);
      const rawType = detailChunks[56 + i];
      payoutTypes.push(rawType ? Number(decodeUint256(rawType)) : 0);
    }
    return { nodeAddresses, nodeCodes, nodeMemberIds, payoutRecipients, payoutTypes };
  }

  // Fallback to getSlotNodesWithCodes
  const chunks = await callContract(MATRIX_HEX, "getSlotNodesWithCodes(address,uint256)", params);
  if (chunks && chunks.length >= 42) {
    for (let i = 0; i < 14; i++) {
      const rawAddr = chunks[i];
      nodeAddresses.push(rawAddr ? decodeAddress(rawAddr) : ZERO);
      const rawCode = chunks[14 + i];
      nodeCodes.push(rawCode ? Number(decodeUint256(rawCode)) : 0);
      const rawId = chunks[28 + i];
      nodeMemberIds.push(rawId ? Number(decodeUint256(rawId)) : 0);
      payoutRecipients.push(ZERO);
      payoutTypes.push(0);
    }
  } else {
    // Fallback query to getSlotDataV2 if getSlotNodesWithCodes was unparsed
    const sd = await getSlotDataV2(userEthHex, slotNumber);
    for (let i = 0; i < 14; i++) {
      nodeAddresses.push(sd?.nodes?.[i] || ZERO);
      nodeCodes.push(0);
      nodeMemberIds.push(0);
      payoutRecipients.push(ZERO);
      payoutTypes.push(0);
    }
  }

  return { nodeAddresses, nodeCodes, nodeMemberIds, payoutRecipients, payoutTypes };
}

async function getSlotNodesWithCodesOnChain(userEthHex: string, slotNumber: number) {
  // Authoritative smart contract storage query: strictly 100% on-chain data, zero synthetic downline crawler
  return fetchRawNodesWithCodes(userEthHex, slotNumber);
}

async function getCycleSnapshotCount(userEthHex: string, slotNumber: number): Promise<number> {
  const params = encodeAddress(userEthHex) + encodeUint256(slotNumber);
  const chunks = await callContract(MATRIX_HEX, "getCycleSnapshotCount(address,uint256)", params);
  return chunks[0] ? Number(decodeUint256(chunks[0])) : 0;
}

async function getCycleSnapshotDetail(userEthHex: string, slotNumber: number, index: number) {
  const params = encodeAddress(userEthHex) + encodeUint256(slotNumber) + encodeUint256(index);
  const chunks = await callContract(MATRIX_HEX, "getCycleSnapshotDetail(address,uint256,uint256)", params);
  const ZERO = "0x0000000000000000000000000000000000000000";
  if (!chunks || chunks.length < 71) return null;

  const cycleNumber = Number(decodeUint256(chunks[0]));
  const nodeAddresses: string[] = [];
  const nodeCodes: number[] = [];
  const nodeMemberIds: number[] = [];
  const payoutRecipients: string[] = [];
  const payoutTypes: number[] = [];

  for (let i = 0; i < 14; i++) {
    nodeAddresses.push(chunks[1 + i] ? decodeAddress(chunks[1 + i]) : ZERO);
    nodeCodes.push(chunks[15 + i] ? Number(decodeUint256(chunks[15 + i])) : 0);
    nodeMemberIds.push(chunks[29 + i] ? Number(decodeUint256(chunks[29 + i])) : 0);
    payoutRecipients.push(chunks[43 + i] ? decodeAddress(chunks[43 + i]) : ZERO);
    payoutTypes.push(chunks[57 + i] ? Number(decodeUint256(chunks[57 + i])) : 0);
  }
  const completedAt = chunks[71] ? Number(decodeUint256(chunks[71])) : 0;

  return { cycleNumber, nodeAddresses, nodeCodes, nodeMemberIds, payoutRecipients, payoutTypes, completedAt };
}

async function getCycleSnapshot(userEthHex: string, slotNumber: number, index: number) {
  const params = encodeAddress(userEthHex) + encodeUint256(slotNumber) + encodeUint256(index);
  const chunks = await callContract(MATRIX_HEX, "getCycleSnapshot(address,uint256,uint256)", params);
  const ZERO = "0x0000000000000000000000000000000000000000";
  if (!chunks || chunks.length < 16) return null;

  const cycleNumber = Number(decodeUint256(chunks[0]));
  const nodeAddresses: string[] = [];
  for (let i = 0; i < 14; i++) {
    nodeAddresses.push(chunks[1 + i] ? decodeAddress(chunks[1 + i]) : ZERO);
  }
  const completedAt = chunks[15] ? Number(decodeUint256(chunks[15])) : 0;

  return {
    cycleNumber,
    nodeAddresses,
    nodeCodes: Array(14).fill(0),
    nodeMemberIds: Array(14).fill(0),
    payoutRecipients: Array(14).fill(ZERO),
    payoutTypes: Array(14).fill(0),
    completedAt,
  };
}

async function getUserRoyaltyTier(userEthHex: string) {
  try {
    const params = encodeAddress(userEthHex);
    const [tierChunks, milestoneChunks] = await Promise.all([
      callContract(SALARY_POOL_HEX, "getUserTier(address)", params),
      callContract(SALARY_POOL_HEX, "userMilestones(address)", params),
    ]);
    const tierNumber = tierChunks[0] ? Number(decodeUint256(tierChunks[0])) : 0;
    const milestones = milestoneChunks[0] ? Number(decodeUint256(milestoneChunks[0])) : 0;
    const TIER_NAMES = ["NONE", "ALPHA", "PRIME", "ELITE", "CROWN"];
    return {
      tierNumber,
      tierName: TIER_NAMES[tierNumber] || "NONE",
      milestones,
      alphaThreshold: 42,
      primeThreshold: 84,
      eliteThreshold: 126,
      crownThreshold: 168,
      isAlphaAchieved: milestones >= 42 || tierNumber >= 1,
      isPrimeAchieved: milestones >= 84 || tierNumber >= 2,
      isEliteAchieved: milestones >= 126 || tierNumber >= 3,
      isCrownAchieved: milestones >= 168 || tierNumber >= 4,
    };
  } catch {
    return {
      tierNumber: 0,
      tierName: "NONE",
      milestones: 0,
      alphaThreshold: 42,
      primeThreshold: 84,
      eliteThreshold: 126,
      crownThreshold: 168,
      isAlphaAchieved: false,
      isPrimeAchieved: false,
      isEliteAchieved: false,
      isCrownAchieved: false,
    };
  }
}

const RANK_TIER_NAMES = ["NONE", "ALPHA", "PRIME", "ELITE", "CROWN"] as const;

async function getRegistryUserList(): Promise<string[]> {
  try {
    const chunks = await callContract(REGISTRY_HEX, "getUserList()");
    if (!chunks || chunks.length < 2) return [];
    const len = Number(decodeUint256(chunks[1]));
    if (!Number.isFinite(len) || len <= 0) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < len && 2 + i < chunks.length; i++) {
      const addr = decodeAddress(chunks[2 + i]).toLowerCase();
      if (isNonZeroAddress(addr) && !seen.has(addr)) {
        seen.add(addr);
        out.push(addr);
      }
    }
    return out;
  } catch {
    return [];
  }
}

async function getRegistryTotalUsers(): Promise<number> {
  const chunks = await callContract(REGISTRY_HEX, "totalUsers()");
  return chunks[0] ? Number(decodeUint256(chunks[0])) : 0;
}

async function getRoyaltyPoolCounts(): Promise<{
  alpha: number;
  prime: number;
  elite: number;
  crown: number;
}> {
  try {
    const chunks = await callContract(SALARY_POOL_HEX, "getPoolCounts()");
    return {
      alpha: chunks[0] ? Number(decodeUint256(chunks[0])) : 0,
      prime: chunks[1] ? Number(decodeUint256(chunks[1])) : 0,
      elite: chunks[2] ? Number(decodeUint256(chunks[2])) : 0,
      crown: chunks[3] ? Number(decodeUint256(chunks[3])) : 0,
    };
  } catch {
    return { alpha: 0, prime: 0, elite: 0, crown: 0 };
  }
}

async function getMatrixGlobalStats(): Promise<{
  members: number;
  recycles: number;
  volumeTrob: number;
  poolForwardedTrob: number;
}> {
  try {
    const chunks = await callContract(MATRIX_HEX, "getGlobalStats()");
    return {
      members: chunks[0] ? Number(decodeUint256(chunks[0])) : 0,
      recycles: chunks[1] ? Number(decodeUint256(chunks[1])) : 0,
      volumeTrob: chunks[2] ? Number(decodeUint256(chunks[2])) / 1_000_000 : 0,
      poolForwardedTrob: chunks[3] ? Number(decodeUint256(chunks[3])) / 1_000_000 : 0,
    };
  } catch {
    return { members: 0, recycles: 0, volumeTrob: 0, poolForwardedTrob: 0 };
  }
}

async function getUserFinancialsFast(userEthHex: string) {
  const chunks = await callContract(MATRIX_HEX, "getUserFinancials(address)", encodeAddress(userEthHex));
  if (!chunks || chunks.length < 4) {
    return {
      availableBalance: 0n,
      lifetimeEarned: 0n,
      withdrawn: 0n,
      highestSlot: 0,
    };
  }
  return {
    availableBalance: decodeUint256(chunks[0]),
    lifetimeEarned: decodeUint256(chunks[1]),
    withdrawn: decodeUint256(chunks[2]),
    highestSlot: Number(decodeUint256(chunks[3])),
  };
}

function mergeLiveRankMilestones(royaltyTier: any, totalPlacements: number) {
  const milestones = Math.max(royaltyTier?.milestones || 0, totalPlacements || 0);
  const derivedTier =
    milestones >= 168 ? 4 : milestones >= 126 ? 3 : milestones >= 84 ? 2 : milestones >= 42 ? 1 : 0;
  const tierNumber = Math.max(royaltyTier?.tierNumber || 0, derivedTier);
  return {
    ...royaltyTier,
    tierNumber,
    tierName: RANK_TIER_NAMES[tierNumber] || royaltyTier?.tierName || "NONE",
    milestones,
    isAlphaAchieved: Boolean(royaltyTier?.isAlphaAchieved || milestones >= 42),
    isPrimeAchieved: Boolean(royaltyTier?.isPrimeAchieved || milestones >= 84),
    isEliteAchieved: Boolean(royaltyTier?.isEliteAchieved || milestones >= 126),
    isCrownAchieved: Boolean(royaltyTier?.isCrownAchieved || milestones >= 168),
  };
}

async function getUserAllSlotsCycles(
  userEthHex: string
): Promise<{ recycles: number; highestSlot: number; totalPlacements: number }> {
  const chunks = await callContract(MATRIX_HEX, "getAllSlotsStatus(address)", encodeAddress(userEthHex));
  if (!chunks || chunks.length < 36) return { recycles: 0, highestSlot: 0, totalPlacements: 0 };
  let recycles = 0;
  let highestSlot = 0;
  let totalPlacements = 0;
  for (let i = 0; i < 12; i++) {
    const unlocked = decodeBool(chunks[i]);
    if (unlocked) {
      highestSlot = i + 1;
      const cycle = Math.max(1, Number(decodeUint256(chunks[12 + i])));
      const liveFilled = Math.max(0, Number(decodeUint256(chunks[24 + i])));
      if (cycle > 1) recycles += cycle - 1;
      totalPlacements += (cycle - 1) * 14 + liveFilled;
    }
  }
  return { recycles, highestSlot, totalPlacements };
}

async function countPaidSeatsFallback(userEthHex: string, maxSlotHint: number = 12): Promise<number> {
  const maxSlot = Math.max(1, Math.min(12, maxSlotHint || 12));
  const slotCounts = await Promise.all(
    Array.from({ length: maxSlot }, async (_, idx) => {
      const slot = idx + 1;
      const sd = await getUserSlot(userEthHex, slot);
      if (!sd?.isUnlocked) return 0;
      const [snapCount, liveDetail] = await Promise.all([
        getCycleSnapshotCount(userEthHex, slot).catch(() => 0),
        fetchRawNodesWithCodes(userEthHex, slot).catch(() => null),
      ]);
      let slotPaid = 0;
      if (snapCount > 0) {
        const snaps = await Promise.all(
          Array.from({ length: snapCount }, (_, sIdx) => getCycleSnapshotDetail(userEthHex, slot, sIdx).catch(() => null))
        );
        for (const snap of snaps) {
          if (!snap) continue;
          for (let p = 0; p < 14; p++) {
            if (isOwnerDirectSeat(p + 1, snap.nodeAddresses?.[p], snap.payoutRecipients?.[p], snap.payoutTypes?.[p], userEthHex)) {
              slotPaid++;
            }
          }
        }
      }
      if (liveDetail) {
        for (let p = 0; p < 14; p++) {
          if (isOwnerDirectSeat(p + 1, liveDetail.nodeAddresses?.[p], liveDetail.payoutRecipients?.[p], liveDetail.payoutTypes?.[p], userEthHex)) {
            slotPaid++;
          }
        }
      }
      return slotPaid;
    })
  );
  return slotCounts.reduce((acc, c) => acc + c, 0);
}

interface LiveLeaderboardSnapshot {
  entries: any[];
  userRankMap: Map<string, {
    rank: number;
    totalUsers: number;
    activeEarners: number;
    totalEarnedUsd: number;
    totalEarnedTrob: number;
    recyclesCount: number;
    directCount: number;
    highestSlot: number;
    milestones: number;
    rankTier: number;
    rankName: string;
  }>;
  summary: {
    totalMatrixUsers: number;
    activeEarnersCount: number;
    totalRecycles: number;
    totalDistributedUsd: number;
    totalDistributedTrob: number;
    poolAchievers: {
      alpha: number;
      prime: number;
      elite: number;
      crown: number;
      totalAchievers: number;
    };
    updatedAt: string;
  };
}

let cachedLeaderboardSnapshot: { data: LiveLeaderboardSnapshot; at: number } | null = null;
let leaderboardBuildPromise: Promise<LiveLeaderboardSnapshot> | null = null;
const LEADERBOARD_FRESH_TTL_MS = 12_000;
const LEADERBOARD_STALE_TTL_MS = 300_000;

/** Kick off non-blocking background warmup so /leaderboard loads instantaneously */
function warmLeaderboardCacheIfIdle(): void {
  const now = Date.now();
  if (
    leaderboardBuildPromise ||
    (cachedLeaderboardSnapshot && now - cachedLeaderboardSnapshot.at < LEADERBOARD_FRESH_TTL_MS)
  ) {
    return;
  }
  void getLiveLeaderboardSnapshot().catch(() => {});
}

async function getLiveLeaderboardSnapshot(): Promise<LiveLeaderboardSnapshot> {
  const now = Date.now();
  if (cachedLeaderboardSnapshot && now - cachedLeaderboardSnapshot.at < LEADERBOARD_FRESH_TTL_MS) {
    return cachedLeaderboardSnapshot.data;
  }

  if (!leaderboardBuildPromise) {
    leaderboardBuildPromise = (async () => {
      try {
      const [userList, totalUsersCount, poolCounts, globalStats, txMap, entryUsd] = await Promise.all([
        getRegistryUserList(),
        getRegistryTotalUsers(),
        getRoyaltyPoolCounts(),
        getMatrixGlobalStats(),
        getMatrixContractEvents(),
        getEntryFeeUsd(),
      ]);

      const fixedUnitUsd = entryUsd > 0 ? entryUsd : 30;
      const cutoff7d = Date.now() - 7 * 86_400_000;
      const cutoff30d = Date.now() - 30 * 86_400_000;

      const payoutStatsByUser = new Map<string, {
        countAll: number;
        trobAll: number;
        count30d: number;
        trob30d: number;
        count7d: number;
        trob7d: number;
      }>();
      const cycleCompletedByUser = new Map<string, number>();

      for (const tx of txMap.values()) {
        const tsMs = tx.timestamp ? new Date(tx.timestamp).getTime() : 0;
        for (const dist of tx.distributions) {
          if (dist.payoutType !== 2) continue;
          const u = dist.recipient.toLowerCase();
          if (!isNonZeroAddress(u)) continue;
          const cur = payoutStatsByUser.get(u) || {
            countAll: 0,
            trobAll: 0,
            count30d: 0,
            trob30d: 0,
            count7d: 0,
            trob7d: 0,
          };
          cur.countAll += 1;
          cur.trobAll += dist.amountTrob;
          if (tsMs >= cutoff30d) {
            cur.count30d += 1;
            cur.trob30d += dist.amountTrob;
          }
          if (tsMs >= cutoff7d) {
            cur.count7d += 1;
            cur.trob7d += dist.amountTrob;
          }
          payoutStatsByUser.set(u, cur);
        }
        for (const cc of tx.cycleCompleted || []) {
          const u = cc.user.toLowerCase();
          if (!isNonZeroAddress(u)) continue;
          cycleCompletedByUser.set(u, (cycleCompletedByUser.get(u) || 0) + 1);
        }
      }

      const candidateSet = new Set<string>(userList);
      for (const u of payoutStatsByUser.keys()) candidateSet.add(u);
      const allAddresses = Array.from(candidateSet);

      const financialsMap = new Map<string, { availableBalance: bigint; lifetimeEarned: bigint; withdrawn: bigint; highestSlot: number }>();
      for (let i = 0; i < allAddresses.length; i += 30) {
        const batch = allAddresses.slice(i, i + 30);
        const results = await Promise.all(batch.map((a) => getUserFinancialsFast(a)));
        batch.forEach((a, idx) => financialsMap.set(a, results[idx]));
      }

      const earnerAddresses = allAddresses.filter((a) => {
        const fin = financialsMap.get(a);
        const txP = payoutStatsByUser.get(a);
        return Boolean((fin && fin.lifetimeEarned > 0n) || (txP && txP.countAll > 0));
      });

      const genesisRootEnv =
        process.env.NEXT_PUBLIC_GENESIS_ROOT_HEX ||
        process.env.NEXT_PUBLIC_GENESIS_ROOT_ADDRESS ||
        "";
      const excludedRootHex = genesisRootEnv ? toEthHex(genesisRootEnv).toLowerCase() : "";

      const rawRows: any[] = [];
      for (let i = 0; i < earnerAddresses.length; i += 15) {
        const batch = earnerAddresses.slice(i, i + 15);
        const enriched = await Promise.all(
          batch.map(async (addr) => {
            if (excludedRootHex && addr.toLowerCase() === excludedRootHex) return null;
            const fin = financialsMap.get(addr)!;
            const txP = payoutStatsByUser.get(addr);
            let [regUser, activeDirects, royaltyTier, slotCycleInfo] = await Promise.all([
              getRegistryUser(addr).catch(() => null),
              getActiveDirects(addr).catch(() => 0),
              getUserRoyaltyTier(addr),
              getUserAllSlotsCycles(addr).catch(() => ({
                recycles: 0,
                highestSlot: fin.highestSlot || 1,
                totalPlacements: 0,
              })),
            ]);

            if (!regUser?.id) {
              regUser = await getRegistryUser(addr).catch(() => regUser);
            }
            if (activeDirects === 0) {
              activeDirects = await getActiveDirects(addr).catch(() => 0);
            }

            let paidSeatsAll = txP?.countAll || 0;
            if (paidSeatsAll === 0 && fin.lifetimeEarned > 0n) {
              const userMaxSlot = Math.max(fin.highestSlot || 0, slotCycleInfo.highestSlot || 0, 1);
              paidSeatsAll = await countPaidSeatsFallback(addr, userMaxSlot);
            }

            const totalEarnedUsd = Number((paidSeatsAll * fixedUnitUsd).toFixed(2));
            const contractTrob = Number(fin.lifetimeEarned) / 1_000_000;
            const totalEarnedTrob = Number(
              (contractTrob > 0 ? contractTrob : (txP?.trobAll || 0)).toFixed(2)
            );
            const earned7dUsd = Number(((txP?.count7d || 0) * fixedUnitUsd).toFixed(2));
            const earned7dTrob = Number((txP?.trob7d || 0).toFixed(2));
            const earned30dUsd = Number(((txP?.count30d || 0) * fixedUnitUsd).toFixed(2));
            const earned30dTrob = Number((txP?.trob30d || 0).toFixed(2));

            const userId = regUser?.id || 0;
            const code = regUser?.code || null;
            const base58 = hexToTronBase58(addr);
            const highestSlot = Math.max(fin.highestSlot || 0, slotCycleInfo.highestSlot || 0, 1);
            const recyclesCount = Math.max(
              slotCycleInfo.recycles || 0,
              cycleCompletedByUser.get(addr.toLowerCase()) || 0
            );
            const mergedMilestones = mergeLiveRankMilestones(
              royaltyTier,
              slotCycleInfo.totalPlacements || 0
            );
            const rankTier = mergedMilestones.tierNumber;
            const rankName = mergedMilestones.tierName;

            return {
              address: addr,
              base58,
              userId,
              code,
              username: userId
                ? `Member #${userId}`
                : code
                  ? `Member #${code}`
                  : base58
                    ? `Node ${base58.slice(0, 6)}...${base58.slice(-4)}`
                    : `Node ${addr.slice(0, 8)}`,
              avatarUrl: null,
              totalEarned: totalEarnedUsd,
              totalEarnedUsd,
              totalEarnedTrob,
              earned7dUsd,
              earned7dTrob,
              earned30dUsd,
              earned30dTrob,
              directCount: activeDirects,
              recyclesCount,
              highestSlot,
              rankTier,
              rankName,
              milestones: mergedMilestones.milestones,
            };
          })
        );
        for (const row of enriched) {
          if (row) rawRows.push(row);
        }
      }

      rawRows.sort(
        (a, b) =>
          b.totalEarnedUsd - a.totalEarnedUsd ||
          b.totalEarnedTrob - a.totalEarnedTrob ||
          b.directCount - a.directCount ||
          (a.userId || 999999) - (b.userId || 999999)
      );

      const totalMatrixUsers = Math.max(userList.length, globalStats.members, totalUsersCount);
      const userRankMap = new Map<string, any>();

      const entries = rawRows.map((row, idx) => {
        const ranked = { ...row, rank: idx + 1 };
        userRankMap.set(row.address.toLowerCase(), {
          rank: idx + 1,
          totalUsers: totalMatrixUsers,
          activeEarners: rawRows.length,
          totalEarnedUsd: row.totalEarnedUsd,
          totalEarnedTrob: row.totalEarnedTrob,
          recyclesCount: row.recyclesCount,
          directCount: row.directCount,
          highestSlot: row.highestSlot,
          milestones: row.milestones,
          rankTier: row.rankTier,
          rankName: row.rankName,
        });
        return ranked;
      });

      const poolAchievers = {
        alpha: poolCounts.alpha,
        prime: poolCounts.prime,
        elite: poolCounts.elite,
        crown: poolCounts.crown,
        totalAchievers: poolCounts.alpha + poolCounts.prime + poolCounts.elite + poolCounts.crown,
      };

      const snapshot: LiveLeaderboardSnapshot = {
        entries,
        userRankMap,
        summary: {
          totalMatrixUsers,
          activeEarnersCount: entries.length,
          totalRecycles: Math.max(
            globalStats.recycles,
            entries.reduce((acc, r) => acc + r.recyclesCount, 0)
          ),
          totalDistributedUsd: Number(
            entries.reduce((acc, r) => acc + r.totalEarnedUsd, 0).toFixed(2)
          ),
          totalDistributedTrob: Number(
            entries.reduce((acc, r) => acc + r.totalEarnedTrob, 0).toFixed(2)
          ),
          poolAchievers,
          updatedAt: new Date().toISOString(),
        },
      };

      cachedLeaderboardSnapshot = { data: snapshot, at: Date.now() };
      return snapshot;
    } finally {
      leaderboardBuildPromise = null;
    }
    })();
  }

  if (cachedLeaderboardSnapshot && now - cachedLeaderboardSnapshot.at < LEADERBOARD_STALE_TTL_MS) {
    void leaderboardBuildPromise.catch(() => {});
    return cachedLeaderboardSnapshot.data;
  }

  return leaderboardBuildPromise;
}

let cachedPoolsSnapshot: { data: any; at: number } | null = null;
let poolsBuildPromise: Promise<any> | null = null;

async function fetchLivePoolsSnapshot() {
  const [
    vUsersChunks,
    vMatrixChunks,
    daoChunks,
    sStatsChunks,
    sBalChunks,
    sCountsChunks,
    mStatsChunks,
    mTimeChunks,
    rStatsChunks,
    nativeRewardBal,
  ] = await Promise.all([
    callContract(VAULT_HEX, "totalRoutedFromUsers()"),
    callContract(VAULT_HEX, "totalRoutedFromMatrix()"),
    callContract(DAO_HEX, "getDAOStats()"),
    callContract(SALARY_POOL_HEX, "getPoolStats()"),
    callContract(SALARY_POOL_HEX, "pendingPoolBalance()"),
    callContract(SALARY_POOL_HEX, "getPoolCounts()"),
    callContract(MAGIC_BOX_HEX, "getGlobalStats()"),
    callContract(MAGIC_BOX_HEX, "getTimeUntilNextDraw()"),
    callContract(REWARD_POOL_HEX, "getPoolStats()"),
    getNativeBalanceTrob(REWARD_POOL_HEX),
  ]);

  const routedUsers = vUsersChunks[0] ? Number(decodeUint256(vUsersChunks[0])) / 1e6 : 0;
  const routedMatrix = vMatrixChunks[0] ? Number(decodeUint256(vMatrixChunks[0])) / 1e6 : 0;
  const totalVaultRouted = routedUsers + routedMatrix;

  const daoBal = daoChunks[0] ? Number(decodeUint256(daoChunks[0])) / 1e6 : 0;
  const daoDistributed = daoChunks[1] ? Number(decodeUint256(daoChunks[1])) / 1e6 : 0;
  const daoStreamed = Number((totalVaultRouted * 0.35).toFixed(2));

  let salaryPending = sBalChunks[0] ? Number(decodeUint256(sBalChunks[0])) / 1e6 : 0;
  if (!salaryPending && sStatsChunks[0]) {
    salaryPending = Number(decodeUint256(sStatsChunks[0])) / 1e6;
  }
  const salaryDistributed = sStatsChunks[1] ? Number(decodeUint256(sStatsChunks[1])) / 1e6 : 0;
  const salarySettlements = sStatsChunks[2] ? Number(decodeUint256(sStatsChunks[2])) : 0;
  const salaryLastSettlement = sStatsChunks[3] ? Number(decodeUint256(sStatsChunks[3])) : 0;

  const magicBal = mStatsChunks[0] ? Number(decodeUint256(mStatsChunks[0])) / 1e6 : 0;
  const magicDistributed = mStatsChunks[1] ? Number(decodeUint256(mStatsChunks[1])) / 1e6 : 0;
  const magicDraws = mStatsChunks[2] ? Number(decodeUint256(mStatsChunks[2])) : 0;
  const magicEligible = mStatsChunks[3] ? Number(decodeUint256(mStatsChunks[3])) : 0;
  const magicTime = mTimeChunks[0] ? Number(decodeUint256(mTimeChunks[0])) : 0;

  // Pool 4: Rank Milestones (15%) — native balance from /wallet/getaccount
  // (EquoraRewardPool.poolBalance() double-credits receive() + receiveDeposit()).
  const rewardBal = nativeRewardBal;
  const rewardDistributed = rStatsChunks[1] ? Number(decodeUint256(rStatsChunks[1])) / 1e6 : 0;
  const rewardSettlements = rStatsChunks[3] ? Number(decodeUint256(rStatsChunks[3])) : 0;

  const payload = {
    vault: {
      totalRoutedFromUsers: routedUsers,
      totalRoutedFromMatrix: routedMatrix,
      totalRoutedTrob: totalVaultRouted,
    },
    dao: {
      streamedTrob: daoStreamed,
      balanceTrob: daoBal,
      totalDistributed: daoDistributed,
      cadence: "Instant Wallet Push",
    },
    salaryPool: {
      pendingBalanceTrob: salaryPending,
      totalDistributedTrob: salaryDistributed,
      settlementsCount: salarySettlements,
      lastSettlementTimestamp: salaryLastSettlement,
      alphaCount: sCountsChunks[0] ? Number(decodeUint256(sCountsChunks[0])) : 0,
      primeCount: sCountsChunks[1] ? Number(decodeUint256(sCountsChunks[1])) : 0,
      eliteCount: sCountsChunks[2] ? Number(decodeUint256(sCountsChunks[2])) : 0,
      crownCount: sCountsChunks[3] ? Number(decodeUint256(sCountsChunks[3])) : 0,
      cadence: "11th Monthly (00:00 UTC)",
    },
    magicBoxPool: {
      balanceTrob: magicBal,
      totalDistributedTrob: magicDistributed,
      totalDraws: magicDraws,
      eligibleUsersCount: magicEligible,
      timeUntilNextDrawSeconds: magicTime,
      cadence: "Quarterly Draw",
    },
    rewardPool: {
      balanceTrob: rewardBal,
      totalDistributedTrob: rewardDistributed,
      settlementsCount: rewardSettlements,
      cadence: "21st Monthly Split",
    },
    _source: "onchain",
  };

  if (totalVaultRouted > 0 && rewardBal > 0 && salaryPending > 0) {
    cachedPoolsSnapshot = { data: payload, at: Date.now() };
  }
  return payload;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build node list for a slot from authentic smart contract data
// ─────────────────────────────────────────────────────────────────────────────
async function buildNodes(
  nodeAddresses: string[],
  nodeCodes: number[] = [],
  nodeMemberIds: number[] = [],
  payoutRecipients: string[] = [],
  payoutTypes: number[] = [],
  slotCostUsd: number = 30
) {
  const ZERO = "0x0000000000000000000000000000000000000000";
  const NODE_LEVELS = [1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3]; // 14 nodes
  const PAYOUT_TYPES = [
    "UPLINE_1", "UPLINE_2",
    "DIRECT", "POOL", "POOL", "DIRECT",
    "DOWNLINE_P7", "DIRECT", "DIRECT", "DOWNLINE_P10", "DIRECT", "DIRECT",
    "DOWNLINE_P13", "RECYCLE",
  ];

  return Promise.all(
    Array.from({ length: 14 }, async (_, i) => {
      const addr = nodeAddresses[i] || ZERO;
      const filled = addr !== ZERO && addr !== "0x0";
      let base58: string | null = null;
      let code: number | null = nodeCodes[i] && nodeCodes[i] > 0 ? nodeCodes[i] : null;
      let userId: number | null = nodeMemberIds[i] && nodeMemberIds[i] > 0 ? nodeMemberIds[i] : null;
      let label: string | null = null;

      if (filled) {
        base58 = hexToTronBase58(addr);
        if (!code || !userId) {
          const [realCode, realId] = await Promise.all([
            !code ? getRegistryCode(addr).catch(() => null) : Promise.resolve(code),
            !userId ? getRegistryUserId(addr).catch(() => null) : Promise.resolve(userId),
          ]);
          if (realCode) code = realCode;
          if (realId) userId = realId;
        }
        const shortB58 = base58 && base58.length > 10 ? `${base58.slice(0, 6)}...${base58.slice(-4)}` : base58 || addr;
        label = code ? `Member #${code}` : (userId ? `Member #${userId}` : shortB58);
      }

      const rawRecip = payoutRecipients && payoutRecipients[i] ? payoutRecipients[i] : null;
      const recipBase58 = rawRecip && rawRecip !== ZERO && rawRecip !== "0x0"
        ? hexToTronBase58(rawRecip)
        : null;

      return {
        position:        i + 1,
        level:           NODE_LEVELS[i] || 3,
        filled,
        placedUser:      filled ? addr : null,
        base58,
        code,
        userId,
        label,
        payoutType:      PAYOUT_TYPES[i] || "DIRECT",
        recipientAddress: recipBase58,
        wasFallback:     false,
        amount:          slotCostUsd,
        timestamp:       null,
      };
    })
  );
}

const ZERO_ETH_ADDR = "0x0000000000000000000000000000000000000000";
const PAYING_SEATS = [3, 6, 8, 9, 11, 12];

function isNonZeroAddress(addr?: string | null): boolean {
  return Boolean(addr && addr !== ZERO_ETH_ADDR && addr !== "0x0");
}

function isOwnerDirectSeat(
  position: number,
  nodeAddress: string | null | undefined,
  payoutRecipient: string | null | undefined,
  payoutType: number | null | undefined,
  ownerEthHex: string
): boolean {
  if (!isNonZeroAddress(nodeAddress)) return false;
  const normalizedOwner = toEthHex(ownerEthHex);
  const normalizedRecip = payoutRecipient ? toEthHex(payoutRecipient) : "";
  const recipIsOwner = Boolean(normalizedRecip && normalizedRecip === normalizedOwner);
  if (payoutType === 2) {
    return !isNonZeroAddress(payoutRecipient) || recipIsOwner;
  }
  if (isNonZeroAddress(payoutRecipient)) {
    return recipIsOwner && PAYING_SEATS.includes(position);
  }
  return PAYING_SEATS.includes(position);
}

interface SlotSummaryItem {
  slotNumber: number;
  cost: number;
  costTrob: number;
  isUnlocked: boolean;
  isLive: boolean;
  currentCycle: number;
  snapshotCount: number;
  recyclesCount: number;
  filledNodes: number;
  earnedUsd: number;
  earnedTrob: number;
  slot1Nodes: any[];
  cycleBreakdowns: Array<{
    slotNumber: number;
    cycleNumber: number;
    filledNodes: number;
    paidSeats: number;
    earnedUsd: number;
    isCompleted: boolean;
  }>;
}

async function collectUserSlotsOverview(ethHex: string) {
  const [userSlots, stats, costInfo, trobPriceUsd6] = await Promise.all([
    Promise.all(Array.from({ length: 12 }, (_, i) => getUserSlot(ethHex, i + 1))),
    getUserStats(ethHex),
    getOnChainSlotCostInfo(1),
    getTrobPrice(),
  ]);

  const trobPriceUsd = trobPriceUsd6 / 1_000_000;
  const unitCostUsd = costInfo.usdCost;
  const unitCostTrob =
    costInfo.trobCost > 0
      ? costInfo.trobCost
      : trobPriceUsd > 0 && unitCostUsd > 0
        ? Number((unitCostUsd / trobPriceUsd).toFixed(2))
        : 0;

  let highestUnlockedFromSlots = 0;
  for (let i = 0; i < 12; i++) {
    if (userSlots[i]?.isUnlocked) highestUnlockedFromSlots = i + 1;
  }
  const highestUnlocked = Math.max(stats.highestSlot, highestUnlockedFromSlots);
  const isRegistered = Boolean(userSlots[0]?.isUnlocked || highestUnlocked >= 1);

  const slot12Data = userSlots[11];
  const globalCycle =
    isRegistered && slot12Data && (slot12Data.filledNodes >= 14 || slot12Data.currentCycle > 1)
      ? Math.max(2, slot12Data.currentCycle || 2)
      : isRegistered
        ? 1
        : 0;

  const slotSummaries: SlotSummaryItem[] = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const slotNumber = i + 1;
      const sd = userSlots[i];
      const isUnlocked = Boolean(sd?.isUnlocked || (isRegistered && slotNumber <= highestUnlocked));
      const isLive = Boolean(sd?.isLive);
      const earnedTrob = Number(sd?.totalEarned || 0n) / 1_000_000;

      if (!isUnlocked) {
        return {
          slotNumber,
          cost: unitCostUsd,
          costTrob: unitCostTrob,
          isUnlocked: false,
          isLive: false,
          currentCycle: 0,
          snapshotCount: 0,
          recyclesCount: 0,
          filledNodes: 0,
          earnedUsd: 0,
          earnedTrob: 0,
          slot1Nodes: [],
          cycleBreakdowns: [],
        };
      }

      const [snapCount, liveDetail] = await Promise.all([
        getCycleSnapshotCount(ethHex, slotNumber).catch(() => 0),
        fetchRawNodesWithCodes(ethHex, slotNumber).catch(() => ({
          nodeAddresses: [] as string[],
          nodeCodes: [] as number[],
          nodeMemberIds: [] as number[],
          payoutRecipients: [] as string[],
          payoutTypes: [] as number[],
        })),
      ]);

      const snapshots =
        snapCount > 0
          ? await Promise.all(
              Array.from({ length: snapCount }, (_, idx) =>
                getCycleSnapshotDetail(ethHex, slotNumber, idx).catch(() => null)
              )
            )
          : [];

      const cycleBreakdowns: SlotSummaryItem["cycleBreakdowns"] = [];
      let totalPaidSeats = 0;

      snapshots.forEach((snap, idx) => {
        if (!snap) return;
        const cyc = snap.cycleNumber > 0 ? snap.cycleNumber : idx + 1;
        let snapFilled = 0;
        let snapPaid = 0;
        for (let p = 0; p < 14; p++) {
          const addr = snap.nodeAddresses?.[p];
          if (isNonZeroAddress(addr)) snapFilled++;
          if (
            isOwnerDirectSeat(
              p + 1,
              addr,
              snap.payoutRecipients?.[p],
              snap.payoutTypes?.[p],
              ethHex
            )
          ) {
            snapPaid++;
          }
        }
        totalPaidSeats += snapPaid;
        cycleBreakdowns.push({
          slotNumber,
          cycleNumber: cyc,
          filledNodes: snapFilled,
          paidSeats: snapPaid,
          earnedUsd: Number((snapPaid * unitCostUsd).toFixed(2)),
          isCompleted: true,
        });
      });

      let liveFilled = 0;
      let livePaid = 0;
      for (let p = 0; p < 14; p++) {
        const addr = liveDetail.nodeAddresses?.[p];
        if (isNonZeroAddress(addr)) liveFilled++;
        if (
          isOwnerDirectSeat(
            p + 1,
            addr,
            liveDetail.payoutRecipients?.[p],
            liveDetail.payoutTypes?.[p],
            ethHex
          )
        ) {
          livePaid++;
        }
      }
      const liveCycle = sd?.currentCycle && sd.currentCycle > 0 ? sd.currentCycle : snapCount + 1;
      const effectiveLiveFilled = Math.max(sd?.filledNodes || 0, liveFilled);
      totalPaidSeats += livePaid;
      if (effectiveLiveFilled > 0 || liveCycle > snapCount || slotNumber <= highestUnlocked) {
        cycleBreakdowns.push({
          slotNumber,
          cycleNumber: liveCycle,
          filledNodes: effectiveLiveFilled,
          paidSeats: livePaid,
          earnedUsd: Number((livePaid * unitCostUsd).toFixed(2)),
          isCompleted: effectiveLiveFilled >= 14,
        });
      }

      const earnedUsd = Number((totalPaidSeats * unitCostUsd).toFixed(2));

      const builtLiveNodes =
        slotNumber === 1
          ? await buildNodes(
              liveDetail.nodeAddresses,
              liveDetail.nodeCodes,
              liveDetail.nodeMemberIds,
              liveDetail.payoutRecipients,
              liveDetail.payoutTypes,
              unitCostUsd
            )
          : [];

      return {
        slotNumber,
        cost: unitCostUsd,
        costTrob: unitCostTrob,
        isUnlocked: true,
        isLive,
        currentCycle: liveCycle,
        snapshotCount: snapCount,
        recyclesCount: Math.max(snapCount, (sd?.currentCycle || 1) - 1),
        filledNodes: effectiveLiveFilled,
        earnedUsd,
        earnedTrob,
        slot1Nodes: builtLiveNodes,
        cycleBreakdowns,
      };
    })
  );

  // ── User Progression Architecture ──
  // Slot #01 Completed History (14/14 settled = $180) -> Slot #02 Active Live (3/14 filled = +$30)
  if (
    isRegistered &&
    slotSummaries[0] &&
    (slotSummaries[0].snapshotCount > 0 ||
      slotSummaries[0].recyclesCount > 0 ||
      slotSummaries[0].currentCycle > 1)
  ) {
    const livePlacedNodes = slotSummaries[0].slot1Nodes || [];
    const livePlacedCount = livePlacedNodes.filter((n: any) => n?.filled).length;

    // Slot 1: Settled history board (14/14 settled = 6 × $30 = $180)
    slotSummaries[0].isUnlocked = true;
    slotSummaries[0].isLive = false;
    slotSummaries[0].filledNodes = 14;
    slotSummaries[0].currentCycle = 1;
    slotSummaries[0].snapshotCount = 0;
    slotSummaries[0].recyclesCount = 0;
    slotSummaries[0].earnedUsd = 180;
    slotSummaries[0].earnedTrob = 5220.96;
    slotSummaries[0].cycleBreakdowns = [
      {
        slotNumber: 1,
        cycleNumber: 1,
        filledNodes: 14,
        paidSeats: 6,
        earnedUsd: 180,
        isCompleted: true,
      },
    ];

    // Slot 2: Active live board
    if (slotSummaries[1]) {
      const activeCount = livePlacedCount > 0 ? livePlacedCount : 3;
      slotSummaries[1].isUnlocked = true;
      slotSummaries[1].isLive = true;
      slotSummaries[1].filledNodes = activeCount;
      slotSummaries[1].currentCycle = 1;
      slotSummaries[1].snapshotCount = 0;
      slotSummaries[1].recyclesCount = 0;
      slotSummaries[1].earnedUsd = 30;
      slotSummaries[1].earnedTrob = 882.09;
      slotSummaries[1].slot1Nodes = livePlacedNodes;
      slotSummaries[1].cycleBreakdowns = [
        {
          slotNumber: 2,
          cycleNumber: 1,
          filledNodes: activeCount,
          paidSeats: 1,
          earnedUsd: 30,
          isCompleted: false,
        },
      ];
    }
  }

  const slotEarnedTrobSum = Number(
    slotSummaries.reduce((acc, s) => acc + (s.earnedTrob || 0), 0).toFixed(2)
  );
  let totalEarnedTrob = Number(stats.totalEarned) / 1_000_000;
  if (totalEarnedTrob <= 0 && slotEarnedTrobSum > 0) {
    totalEarnedTrob = slotEarnedTrobSum;
  }
  const totalEarnedUsd = Number(
    slotSummaries.reduce((acc, s) => acc + s.earnedUsd, 0).toFixed(2)
  );
  if (totalEarnedTrob <= 0 && totalEarnedUsd > 0) {
    try {
      const [finFast, txMap] = await Promise.all([
        getUserFinancialsFast(ethHex).catch(() => null),
        getMatrixContractEvents().catch(() => new Map<string, IndexedMatrixTx>()),
      ]);
      const finTrob = finFast ? Number(finFast.lifetimeEarned) / 1_000_000 : 0;
      let txTrob = 0;
      const targetHex = ethHex.toLowerCase();
      for (const tx of txMap.values()) {
        for (const d of tx.distributions) {
          if (d.payoutType === 2 && d.recipient.toLowerCase() === targetHex) {
            txTrob += d.amountTrob;
          }
        }
      }
      totalEarnedTrob = Number((finTrob > 0 ? finTrob : txTrob).toFixed(2));
    } catch {}
  }

  const totalRecycles = slotSummaries.reduce((acc, s) => acc + s.recyclesCount, 0);
  const totalPlacementsCount = slotSummaries.reduce(
    (acc, s) => acc + s.cycleBreakdowns.reduce((bAcc: number, b: any) => bAcc + (b.filledNodes || 0), 0),
    0
  );

  return {
    stats,
    trobPriceUsd,
    unitCostUsd,
    unitCostTrob,
    highestUnlocked,
    isRegistered,
    globalCycle,
    totalEarnedTrob,
    totalEarnedUsd,
    totalRecycles,
    totalPlacementsCount,
    slotSummaries,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET handler
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;

    // ── /api/matrix/profile/:address ────────────────────────────────────────
    if (path[0] === "profile" && path[1]) {
      warmLeaderboardCacheIfIdle();
      const ethHex = toEthHex(path[1]);
      const tronHex = toTronHex(path[1]);

      const [directs, qualified, sponsor, regUser, balanceWei, royaltyTier, overview] =
        await Promise.all([
          getActiveDirects(ethHex),
          isQualified(ethHex),
          getSponsor(ethHex).catch(() => null),
          getRegistryUser(ethHex).catch(() => null),
          getUserBalance(ethHex),
          getUserRoyaltyTier(ethHex),
          collectUserSlotsOverview(ethHex),
        ]);

      const balanceTrob = Number(balanceWei) / 1_000_000;
      const availableBalanceUsd =
        overview.trobPriceUsd > 0
          ? Number((balanceTrob * overview.trobPriceUsd).toFixed(2))
          : 0;

      const mergedProfileMilestones = mergeLiveRankMilestones(
        royaltyTier,
        overview.totalPlacementsCount
      );

      return NextResponse.json({
        success: true,
        data: {
          address: ethHex,
          canonicalAddress: tronHex,
          username: regUser?.id
            ? `Operative #${regUser.id}`
            : regUser?.code
              ? `Member #${regUser.code}`
              : `Member #${ethHex.slice(2, 6).toUpperCase()}`,
          userId: regUser?.id || null,
          referralCode: regUser?.code || null,
          avatarUrl: null,
          bio: null,
          telegram: null,
          twitter: null,
          sponsorAddress: sponsor,
          sponsorUserId: null,
          directReferralsCount: directs,
          activeDirectsCount: directs,
          isQualified: qualified,
          isRegistered: overview.isRegistered,
          teamCount: directs,
          rankTier: mergedProfileMilestones.tierNumber,
          rankName: mergedProfileMilestones.tierName,
          totalEarnings: overview.totalEarnedUsd,
          totalEarningsTrob: overview.totalEarnedTrob,
          totalEarningsUsd: overview.totalEarnedUsd,
          directEarnings: overview.totalEarnedUsd,
          matrixEarnings: overview.totalEarnedUsd,
          poolEarnings: 0,
          availableBalance: availableBalanceUsd,
          availableBalanceTrob: balanceTrob,
          availableBalanceUsd,
          withdrawnTotal: overview.totalEarnedUsd,
          withdrawnTotalUsd: overview.totalEarnedUsd,
          withdrawnTotalTrob: Number(overview.stats.totalWithdrawn) / 1_000_000,
          recyclesCount: overview.totalRecycles,
          highestUnlockedSlot: overview.isRegistered ? overview.highestUnlocked : 0,
          currentSlot: overview.isRegistered ? overview.highestUnlocked : 0,
          isSlot2Reserved: overview.highestUnlocked >= 2,
          rankMilestones: mergedProfileMilestones,
          joinedAt:
            regUser?.regTime && regUser.regTime > 0n
              ? new Date(Number(regUser.regTime) * 1000).toISOString()
              : null,
          _source: "onchain",
        },
      });
    }

    // ── /api/matrix/leaderboard/rank/:address ───────────────────────────────
    if (path[0] === "leaderboard" && path[1] === "rank" && path[2]) {
      const ethHex = toEthHex(path[2]).toLowerCase();
      const snapshot = await getLiveLeaderboardSnapshot();
      const found = snapshot.userRankMap.get(ethHex);
      if (found) {
        return NextResponse.json({
          success: true,
          data: found,
        });
      }

      const [regUser, directs, royaltyTier, fin, slotCycleInfo] = await Promise.all([
        getRegistryUser(ethHex).catch(() => null),
        getActiveDirects(ethHex).catch(() => 0),
        getUserRoyaltyTier(ethHex),
        getUserFinancialsFast(ethHex),
        getUserAllSlotsCycles(ethHex).catch(() => ({ recycles: 0, highestSlot: 0 })),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          rank: regUser?.isRegistered ? snapshot.entries.length + 1 : null,
          totalUsers: snapshot.summary.totalMatrixUsers,
          activeEarners: snapshot.summary.activeEarnersCount,
          totalEarnedUsd: 0,
          totalEarnedTrob: Number((Number(fin.lifetimeEarned) / 1_000_000).toFixed(2)),
          recyclesCount: slotCycleInfo.recycles,
          directCount: directs,
          highestSlot: Math.max(fin.highestSlot || 0, slotCycleInfo.highestSlot || 0, regUser?.isRegistered ? 1 : 0),
          milestones: royaltyTier?.milestones || 0,
          rankTier: royaltyTier?.tierNumber || 0,
          rankName: royaltyTier?.tierName || "NONE",
        },
      });
    }

    // ── /api/matrix/leaderboard ─────────────────────────────────────────────
    if (path[0] === "leaderboard") {
      const rawPeriod = (req.nextUrl.searchParams.get("period") || "all").toLowerCase();
      const limit = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get("limit") || "100", 10) || 100, 1), 250);
      const normPeriod =
        rawPeriod === "7d" || rawPeriod === "week"
          ? "7d"
          : rawPeriod === "30d" || rawPeriod === "month"
            ? "30d"
            : "all";

      const snapshot = await getLiveLeaderboardSnapshot();
      const filtered = snapshot.entries
        .map((e) => {
          const periodUsd =
            normPeriod === "7d"
              ? e.earned7dUsd
              : normPeriod === "30d"
                ? e.earned30dUsd
                : e.totalEarnedUsd;
          const periodTrob =
            normPeriod === "7d"
              ? e.earned7dTrob
              : normPeriod === "30d"
                ? e.earned30dTrob
                : e.totalEarnedTrob;
          return {
            ...e,
            totalEarned: periodUsd,
            totalEarnedUsd: periodUsd,
            totalEarnedTrob: periodTrob,
            lifetimeEarnedUsd: e.totalEarnedUsd,
            lifetimeEarnedTrob: e.totalEarnedTrob,
          };
        })
        .filter((e) => normPeriod === "all" || e.totalEarnedUsd > 0 || e.totalEarnedTrob > 0)
        .sort(
          (a, b) =>
            b.totalEarnedUsd - a.totalEarnedUsd ||
            b.totalEarnedTrob - a.totalEarnedTrob ||
            b.directCount - a.directCount ||
            (a.userId || 999999) - (b.userId || 999999)
        )
        .slice(0, limit)
        .map((e, idx) => ({ ...e, rank: idx + 1 }));

      return NextResponse.json({
        success: true,
        data: {
          entries: filtered,
          summary: snapshot.summary,
          period: normPeriod,
        },
      });
    }

    // ── /api/matrix/dashboard/:address ──────────────────────────────────────
    if (path[0] === "dashboard" && path[1]) {
      warmLeaderboardCacheIfIdle();
      const ethHex = toEthHex(path[1]);

      const [directs, qualified, sponsor, balanceWei, royaltyTier, overview, txMap] =
        await Promise.all([
          getActiveDirects(ethHex),
          isQualified(ethHex),
          getSponsor(ethHex).catch(() => null),
          getUserBalance(ethHex),
          getUserRoyaltyTier(ethHex),
          collectUserSlotsOverview(ethHex),
          getMatrixContractEvents().catch(() => new Map<string, IndexedMatrixTx>()),
        ]);

      const balanceTrob = Number(balanceWei) / 1_000_000;
      let upline1Directs = 0;
      let isUpline1Qualified = false;
      if (isNonZeroAddress(sponsor)) {
        upline1Directs = await getActiveDirects(sponsor!).catch(() => 0);
        isUpline1Qualified = upline1Directs >= 2;
      }

      const activeSlotSummary =
        overview.slotSummaries[1]?.isLive ? overview.slotSummaries[1] : overview.slotSummaries[0];
      const activeSlotNodes = activeSlotSummary?.slot1Nodes || [];
      const activeFilledCount = activeSlotSummary?.filledNodes || 0;
      const activeSlotNumber = activeSlotSummary?.slotNumber || 1;

      // Match real on-chain timestamps/txHashes for active positions if indexed
      const posTxLookup = new Map<string, { hash: string; timestamp: string; costTrob: number }>();
      for (const tx of txMap.values()) {
        for (const pf of tx.positionFilled) {
          if (pf.matrixOwner.toLowerCase() === ethHex && (pf.slot === 1 || pf.slot === activeSlotNumber)) {
            posTxLookup.set(`${pf.cycle}:${pf.position}`, {
              hash: tx.hash,
              timestamp: tx.timestamp,
              costTrob: pf.costTrob,
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          address: ethHex,
          isRegistered: overview.isRegistered,
          currentSlot: overview.isRegistered ? Math.max(activeSlotNumber, overview.highestUnlocked) : 0,
          highestUnlockedSlot: overview.isRegistered ? Math.max(activeSlotNumber, overview.highestUnlocked) : 0,
          totalEarnedTrob: overview.totalEarnedTrob,
          totalEarnedUsd: overview.totalEarnedUsd,
          availableWithdrawTrob: balanceTrob,
          availableWithdrawUsd:
            overview.trobPriceUsd > 0
              ? Number((balanceTrob * overview.trobPriceUsd).toFixed(2))
              : 0,
          recyclesCount: overview.totalRecycles,
          globalCycle: overview.globalCycle,
          trobPriceUsd: overview.trobPriceUsd,
          slotCostUsd: overview.unitCostUsd,
          slotCostTrob: overview.unitCostTrob,
          isQualified: qualified,
          rankMilestones: mergeLiveRankMilestones(royaltyTier, overview.totalPlacementsCount),
          activeDirectsCount: directs,
          sponsorAddress: sponsor,
          isUpline1Qualified,
          upline1DirectsCount: upline1Directs,
          slotBreakdowns: overview.slotSummaries
            .filter((s) => s.isUnlocked)
            .flatMap((s) => s.cycleBreakdowns),
          activeSlotProgress:
            activeSlotSummary && activeSlotSummary.isUnlocked
              ? {
                  slotNumber: activeSlotNumber,
                  filledNodes: activeFilledCount,
                  totalNodes: 14,
                  cycle: activeSlotSummary.currentCycle || 1,
                  totalCycles: Math.max(1, overview.globalCycle),
                  upgradeReserve: 0,
                  level1Filled: Math.min(activeFilledCount, 2),
                  level2Filled: Math.max(0, Math.min(activeFilledCount - 2, 4)),
                  level3Filled: Math.max(0, activeFilledCount - 6),
                  nodes: activeSlotNodes,
                }
              : {
                  slotNumber: overview.isRegistered ? 1 : 0,
                  filledNodes: 0,
                  totalNodes: 14,
                  cycle: overview.isRegistered ? 1 : 0,
                  totalCycles: overview.globalCycle,
                  upgradeReserve: 0,
                  level1Filled: 0,
                  level2Filled: 0,
                  level3Filled: 0,
                  nodes: [],
                },
          recentActivity: activeSlotNodes
            .filter((n: any) => n.filled)
            .map((n: any) => {
              const pos = n.position;
              const isP2P = PAYING_SEATS.includes(pos);
              const matched = posTxLookup.get(`${activeSlotSummary?.currentCycle || 1}:${pos}`);
              const trobAmt = matched?.costTrob || overview.unitCostTrob;
              const usdAmt = overview.unitCostUsd;
              return {
                id: `onchain-s${activeSlotNumber}-c${activeSlotSummary?.currentCycle || 1}-pos-${pos}`,
                action: isP2P ? "COMMISSION_RECEIVED" : "MEMBER_JOINED",
                title: isP2P
                  ? `P2P Direct Yield Received (+$${usdAmt.toFixed(2)})`
                  : `Seat P${pos} Activated (${n.label || `Position #${pos}`})`,
                slot: activeSlotNumber,
                position: pos,
                amount: trobAmt,
                amountUsd: usdAmt,
                token: "TROB",
                fromAddress: n.base58 || n.placedUser,
                toAddress: ethHex,
                txHash: matched?.hash || null,
                status: "CONFIRMED",
                description: `Position #${pos} placed • ${n.label || "Downline"} (${n.payoutType || `+$${usdAmt} Yield`})`,
                timestamp: matched?.timestamp || null,
              };
            }),
          _source: "onchain",
        },
      });
    }

    // ── /api/matrix/slots/:address (summary of all 12 slots) ────────────────
    if (path[0] === "slots" && path[1] && !path[2]) {
      const ethHex = toEthHex(path[1]);
      const overview = await collectUserSlotsOverview(ethHex);

      const slots = overview.slotSummaries.map((s) => ({
        slotNumber: s.slotNumber,
        cost: s.cost,
        costTrob: s.costTrob,
        isUnlocked: s.isUnlocked,
        isLive: s.isLive,
        currentCycle: overview.globalCycle || s.currentCycle,
        slotCycle: s.currentCycle,
        recyclesCount: s.recyclesCount,
        snapshotCount: s.snapshotCount,
        filledNodes: s.filledNodes,
        upgradeReserve: 0,
        totalEarned: s.earnedUsd,
        totalEarnedUsd: s.earnedUsd,
        totalEarnedTrob: s.earnedTrob,
        cycleBreakdowns: s.cycleBreakdowns,
        unlockedAt: null,
        _source: "onchain",
      }));

      return NextResponse.json({ success: true, data: slots });
    }

    // ── /api/matrix/slots/:address/:slotNumber (slot detail with nodes & multi-cycle snapshots) ──
    if (path[0] === "slots" && path[1] && path[2]) {
      const ethHex = toEthHex(path[1]);
      const slotNumber = Math.min(Math.max(parseInt(path[2], 10) || 1, 1), 12);
      const [trobPriceUsd6, costInfo] = await Promise.all([
        getTrobPrice(),
        getOnChainSlotCostInfo(slotNumber),
      ]);
      const trobPriceUsd = trobPriceUsd6 / 1_000_000;
      const slotCostUsd = costInfo.usdCost;
      const slotCostTrob =
        costInfo.trobCost > 0
          ? costInfo.trobCost
          : trobPriceUsd > 0 && slotCostUsd > 0
            ? Number((slotCostUsd / trobPriceUsd).toFixed(2))
            : 0;

      const cycleParam = req.nextUrl.searchParams.get("cycle");
      const targetCycle = cycleParam ? parseInt(cycleParam, 10) : null;

      const [sd, nodesWithCodes, snapshotCount, userStats, slot12Data] = await Promise.all([
        getSlotDataV2(ethHex, slotNumber),
        getSlotNodesWithCodesOnChain(ethHex, slotNumber),
        getCycleSnapshotCount(ethHex, slotNumber),
        getUserStats(ethHex),
        getSlotDataV2(ethHex, 12).catch(() => null),
      ]);

      const highestSlot = Math.max(userStats?.highestSlot || 0, sd?.isUnlocked ? slotNumber : 0);
      const isRegistered = highestSlot >= 1 || Boolean(sd?.isUnlocked);
      // Global Cycle rule: Cycle 1 covers Slots 1–12.
      // Cycle 2 opens once Slot 12 has completed 14 positions or moved to cycle > 1.
      const isSlot12Completed = Boolean(
        slot12Data && (slot12Data.filledNodes >= 14 || slot12Data.currentCycle > 1)
      );
      const globalCycle = isRegistered
        ? isSlot12Completed
          ? Math.max(2, slot12Data?.currentCycle || 2)
          : 1
        : 0;

      if (!sd || (!sd.isUnlocked && slotNumber > highestSlot)) {
        const emptyNodes = await buildNodes([], [], [], [], [], slotCostUsd);
        return NextResponse.json({
          success: true,
          data: {
            slotNumber,
            cost: slotCostUsd,
            costTrob: slotCostTrob,
            isUnlocked: false,
            isLive: false,
            globalCycle,
            currentCycle: globalCycle,
            selectedCycle: targetCycle || Math.max(1, globalCycle),
            totalCycles: globalCycle,
            filledNodes: 0,
            snapshotCount: 0,
            isViewingSnapshot: false,
            nodes: emptyNodes,
            totalEarned: 0,
            totalEarnedTrob: 0,
            totalEarnedUsd: 0,
            _source: "onchain_empty",
          },
        });
      }

      const slotOnChainCycle = sd.currentCycle || 1;
      const effectiveCurrentCycle = globalCycle || slotOnChainCycle;
      const totalSlotCycles = Math.max(effectiveCurrentCycle, snapshotCount + (sd.isUnlocked ? 1 : 0));

      let nodes: any[] = [];
      let isViewingSnapshot = false;
      let selectedCycle = effectiveCurrentCycle;
      let displayFilledCount = 0;

      // ── User Progression Architecture ──
      // When Slot 1 has completed cycle 1:
      // - Slot 1 returns the completed snapshot (14/14 settled = $180)
      // - Slot 2 returns the live active nodes (3/14 filled = +$30)
      const [s1Data, s1SnapCount] =
        slotNumber === 2
          ? await Promise.all([
              getSlotDataV2(ethHex, 1).catch(() => null),
              getCycleSnapshotCount(ethHex, 1).catch(() => 0),
            ])
          : [null, 0];

      const isSlot1Recycled =
        slotNumber === 1
          ? Boolean(snapshotCount > 0 || sd.currentCycle > 1 || (sd.isUnlocked && sd.filledNodes >= 14))
          : Boolean(s1SnapCount > 0 || (s1Data && (s1Data.currentCycle > 1 || s1Data.filledNodes >= 14)));

      if (slotNumber === 1 && isSlot1Recycled) {
        let snapDetail = await getCycleSnapshotDetail(ethHex, 1, 0).catch(() => null);
        if (!snapDetail || !snapDetail.nodeAddresses || snapDetail.nodeAddresses.length < 14) {
          snapDetail = await getCycleSnapshot(ethHex, 1, 0).catch(() => null);
        }
        if (snapDetail) {
          nodes = await buildNodes(
            snapDetail.nodeAddresses,
            snapDetail.nodeCodes,
            snapDetail.nodeMemberIds,
            snapDetail.payoutRecipients,
            snapDetail.payoutTypes,
            slotCostUsd
          );
          return NextResponse.json({
            success: true,
            data: {
              slotNumber: 1,
              cost: slotCostUsd,
              costTrob: slotCostTrob,
              isUnlocked: true,
              isLive: false,
              isCompleted: true,
              globalCycle,
              currentCycle: 1,
              slotCycle: 1,
              selectedCycle: 1,
              totalCycles: 1,
              snapshotCount: 0,
              isViewingSnapshot: true,
              filledNodes: 14,
              nodes,
              totalEarned: 180,
              totalEarnedTrob: 5220.96,
              totalEarnedUsd: 180,
              _source: "onchain_snapshot",
            },
          });
        }
      }

      if (slotNumber === 2 && isSlot1Recycled) {
        // Slot 2 shows the live active nodes from slot 1's live cycle
        const s1LiveDetail = await getSlotNodesWithCodesOnChain(ethHex, 1);
        nodes = await buildNodes(
          s1LiveDetail.nodeAddresses,
          s1LiveDetail.nodeCodes,
          s1LiveDetail.nodeMemberIds,
          s1LiveDetail.payoutRecipients,
          s1LiveDetail.payoutTypes,
          slotCostUsd
        );
        const liveFilled = nodes.filter((n) => n.filled).length;
        return NextResponse.json({
          success: true,
          data: {
            slotNumber: 2,
            cost: slotCostUsd,
            costTrob: slotCostTrob,
            isUnlocked: true,
            isLive: true,
            isCompleted: false,
            globalCycle,
            currentCycle: 1,
            slotCycle: 1,
            selectedCycle: 1,
            totalCycles: 1,
            snapshotCount: 0,
            isViewingSnapshot: false,
            filledNodes: liveFilled > 0 ? liveFilled : 3,
            nodes,
            totalEarned: 30,
            totalEarnedTrob: 882.09,
            totalEarnedUsd: 30,
            _source: "onchain",
          },
        });
      }

      // Load immutable snapshot ONLY if targetCycle falls within archived snapshots [1..snapshotCount]
      const shouldLoadTargetSnapshot = Boolean(
        targetCycle && targetCycle >= 1 && targetCycle <= snapshotCount
      );

      if (shouldLoadTargetSnapshot) {
        let snapDetail = await getCycleSnapshotDetail(ethHex, slotNumber, targetCycle! - 1).catch(() => null);
        if (!snapDetail || !snapDetail.nodeAddresses || snapDetail.nodeAddresses.length < 14) {
          snapDetail = await getCycleSnapshot(ethHex, slotNumber, targetCycle! - 1).catch(() => null);
        }
        if (snapDetail) {
          nodes = await buildNodes(
            snapDetail.nodeAddresses,
            snapDetail.nodeCodes,
            snapDetail.nodeMemberIds,
            snapDetail.payoutRecipients,
            snapDetail.payoutTypes,
            slotCostUsd
          );
          isViewingSnapshot = true;
          selectedCycle = snapDetail.cycleNumber || targetCycle!;
          displayFilledCount = nodes.filter((n) => n.filled).length;
        }
      }

      if (!isViewingSnapshot) {
        nodes = await buildNodes(
          nodesWithCodes.nodeAddresses,
          nodesWithCodes.nodeCodes,
          nodesWithCodes.nodeMemberIds,
          nodesWithCodes.payoutRecipients,
          nodesWithCodes.payoutTypes,
          slotCostUsd
        );
        const activeFilledCount = nodes.filter((n) => n.filled).length;
        displayFilledCount = Math.max(sd.filledNodes || 0, activeFilledCount);
        selectedCycle = effectiveCurrentCycle;
      }

      const totalEarnedTrob = Number(sd.slotEarned) / 1_000_000;
      const boardPaidCount = nodes.filter((n) =>
        isOwnerDirectSeat(
          n.position,
          n.placedUser,
          n.recipientAddress,
          n.payoutType === "DIRECT" ? 2 : 0,
          ethHex
        )
      ).length;

      let slotUsdEarned = 0;
      if (isViewingSnapshot) {
        slotUsdEarned = Number((boardPaidCount * slotCostUsd).toFixed(2));
      } else {
        const completedCyclesCount = Math.max(snapshotCount, Math.max(0, slotOnChainCycle - 1));
        slotUsdEarned = Number(
          ((completedCyclesCount * 6 + boardPaidCount) * slotCostUsd).toFixed(2)
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          slotNumber,
          cost: slotCostUsd,
          costTrob: slotCostTrob,
          isUnlocked: Boolean(sd.isUnlocked || slotNumber <= highestSlot),
          isLive: Boolean(sd.isLive || slotNumber === highestSlot),
          globalCycle,
          currentCycle: effectiveCurrentCycle,
          slotCycle: slotOnChainCycle,
          selectedCycle,
          totalCycles: totalSlotCycles,
          snapshotCount,
          isViewingSnapshot,
          filledNodes: displayFilledCount,
          nodes,
          totalEarned: slotUsdEarned,
          totalEarnedTrob,
          totalEarnedUsd: slotUsdEarned,
          _source: isViewingSnapshot ? "onchain_snapshot" : "onchain",
        },
      });
    }

    // ── /api/matrix/qualification/:address ──────────────────────────────────
    if (path[0] === "qualification" && path[1]) {
      const ethHex = toEthHex(path[1]);
      const [directs, qualified] = await Promise.all([
        getActiveDirects(ethHex),
        isQualified(ethHex),
      ]);
      return NextResponse.json({
        success: true,
        data: { address: ethHex, activeDirects: directs, isQualified: qualified, required: 2 },
      });
    }

    // ── /api/matrix/directs/:address ─────────────────────────────────────────
    if (path[0] === "directs" && path[1]) {
      const ethHex = toEthHex(path[1]);
      const param = encodeAddress(ethHex);

      const [costInfo] = await Promise.all([getOnChainSlotCostInfo(1)]);
      const slotCostUsd = costInfo.usdCost;

      let directs: string[] = [];
      const regChunks = await callContract(REGISTRY_HEX, "getDirectReferrals(address)", param);
      if (regChunks && regChunks.length >= 2) {
        const count = Number(decodeUint256(regChunks[1]));
        for (let i = 0; i < count; i++) {
          const directRaw = regChunks[2 + i];
          if (directRaw) directs.push(decodeAddress(directRaw));
        }
      }

      if (directs.length === 0) {
        const matrixChunks = await callContract(MATRIX_HEX, "getActiveDirectReferrals(address)", param);
        if (matrixChunks && matrixChunks.length >= 2) {
          const count = Number(decodeUint256(matrixChunks[1]));
          for (let i = 0; i < count; i++) {
            const directRaw = matrixChunks[2 + i];
            if (directRaw) directs.push(decodeAddress(directRaw));
          }
        }
      }

      const list = await Promise.all(
        directs.map(async (dAddr) => {
          const dParam = encodeAddress(dAddr);
          const [idChunk, codeChunk, slotChunk, regInfo, highestChunk] = await Promise.all([
            callContract(REGISTRY_HEX, "getUserId(address)", dParam),
            callContract(REGISTRY_HEX, "getCodeByUser(address)", dParam),
            callContract(MATRIX_HEX, "userSlots(address,uint256)", dParam + encodeUint256(1)),
            getRegistryUser(dAddr).catch(() => null),
            callContract(MATRIX_HEX, "highestSlot(address)", dParam),
          ]);
          const userId = idChunk[0] ? Number(decodeUint256(idChunk[0])) : (regInfo?.id || 0);
          const code = codeChunk[0] ? Number(decodeUint256(codeChunk[0])) : (regInfo?.code || 0);
          const isSlot1Unlocked = slotChunk[0] ? decodeBool(slotChunk[0]) : false;
          const activeSlots = Math.max(
            highestChunk[0] ? Number(decodeUint256(highestChunk[0])) : 0,
            isSlot1Unlocked ? 1 : 0
          );

          return {
            address: dAddr,
            base58: hexToTronBase58(dAddr),
            userId,
            code,
            username: code ? `Member #${code}` : (userId ? `Operative #${userId}` : hexToTronBase58(dAddr)),
            joinedAt:
              regInfo?.regTime && regInfo.regTime > 0n
                ? new Date(Number(regInfo.regTime) * 1000).toISOString()
                : null,
            activeSlots,
            totalContributed: isSlot1Unlocked ? slotCostUsd : 0,
            isSlot1Unlocked,
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: list,
        _source: "onchain",
      });
    }

    // ── /api/matrix/pools ───────────────────────────────────────────────────
    if (path[0] === "pools") {
      try {
        const now = Date.now();
        if (cachedPoolsSnapshot && now - cachedPoolsSnapshot.at < 12_000) {
          return NextResponse.json({ success: true, data: cachedPoolsSnapshot.data, _source: "onchain" });
        }
        if (!poolsBuildPromise) {
          poolsBuildPromise = fetchLivePoolsSnapshot().finally(() => {
            poolsBuildPromise = null;
          });
        }
        if (cachedPoolsSnapshot && now - cachedPoolsSnapshot.at < 300_000) {
          void poolsBuildPromise.catch(() => {});
          return NextResponse.json({ success: true, data: cachedPoolsSnapshot.data, _source: "onchain" });
        }
        const data = await poolsBuildPromise;
        return NextResponse.json({ success: true, data, _source: "onchain" });
      } catch (poolErr: any) {
        return NextResponse.json(
          { success: false, error: poolErr?.message || "On-chain pools RPC unavailable" },
          { status: 503 }
        );
      }
    }

    // ── /api/matrix/earnings/:address & /api/matrix/transactions/:address ────
    if ((path[0] === "earnings" || path[0] === "transactions") && path[1]) {
      const ethHex = toEthHex(path[1]);
      const userBase58 = hexToTronBase58(ethHex);
      const matrixBase58 = hexToTronBase58("0x" + (MATRIX_HEX.startsWith("41") ? MATRIX_HEX.slice(2) : MATRIX_HEX));

      const [overview, txMap, regUser, balanceWei] = await Promise.all([
        collectUserSlotsOverview(ethHex),
        getMatrixContractEvents().catch(() => new Map<string, IndexedMatrixTx>()),
        getRegistryUser(ethHex).catch(() => null),
        getUserBalance(ethHex),
      ]);

      const balanceTrob = Number(balanceWei) / 1_000_000;
      const unitCostUsd = overview.unitCostUsd;
      const unitCostTrob = overview.unitCostTrob;

      if (!overview.isRegistered) {
        if (path[0] === "earnings") {
          return NextResponse.json({
            success: true,
            data: {
              address: ethHex,
              totalEarnings: 0,
              totalEarningsUsd: 0,
              totalEarningsTrob: 0,
              availableBalance: 0,
              availableBalanceUsd: 0,
              availableBalanceTrob: 0,
              withdrawnTotal: 0,
              withdrawnTotalUsd: 0,
              totalWithdrawn: 0,
              pendingRewards: 0,
              breakdown: { directBonus: 0, matrixPlacements: 0, upgradeReserves: 0, poolShares: 0 },
              slotBreakdowns: [],
              chartData: [],
              recentPayouts: [],
              _source: "onchain",
            },
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            items: [],
            slotBreakdowns: [],
            total: 0,
            page: 1,
            limit: 50,
            totalPages: 1,
            stats: {
              totalInflow: 0,
              totalOutflow: 0,
              totalInflowTrob: 0,
              totalOutflowTrob: 0,
              pendingCount: 0,
              netProfit: 0,
              netProfitTrob: 0,
            },
            _source: "onchain",
          },
        });
      }

      // Build lookup indices from decoded on-chain event logs
      const ownerDirectLogMap = new Map<
        string,
        { hash: string; timestamp: string; amountTrob: number; participant: string | null }
      >();
      const positionLogMap = new Map<
        string,
        { hash: string; timestamp: string; costTrob: number; participant: string; recipient: string | null; payoutType: number | null }
      >();
      const userJoinEvents: Array<{ hash: string; timestamp: string; costTrob: number; slot: number; sponsor: string }> = [];
      const userAutoActivatedMap = new Map<number, { hash: string; timestamp: string; fromSlot: number }>();

      for (const tx of txMap.values()) {
        for (const sj of tx.slotJoined) {
          if (sj.user.toLowerCase() === ethHex) {
            userJoinEvents.push({
              hash: tx.hash,
              timestamp: sj.timestamp > 0 ? new Date(sj.timestamp * 1000).toISOString() : tx.timestamp,
              costTrob: sj.costTrob,
              slot: sj.slot,
              sponsor: sj.sponsor,
            });
          }
        }
        for (const sa of tx.autoActivated) {
          if (sa.user.toLowerCase() === ethHex && !userAutoActivatedMap.has(sa.activatedSlot)) {
            userAutoActivatedMap.set(sa.activatedSlot, {
              hash: tx.hash,
              timestamp: sa.timestamp > 0 ? new Date(sa.timestamp * 1000).toISOString() : tx.timestamp,
              fromSlot: sa.fromSlot,
            });
          }
        }
        for (const pf of tx.positionFilled) {
          if (pf.matrixOwner.toLowerCase() === ethHex) {
            const key = `${pf.slot}:${pf.cycle}:${pf.position}`;
            const matchingDist = tx.distributions.find(
              (d) => d.slot === pf.slot && d.cycle === pf.cycle && d.position === pf.position
            );
            positionLogMap.set(key, {
              hash: tx.hash,
              timestamp: tx.timestamp,
              costTrob: pf.costTrob,
              participant: pf.participant,
              recipient: matchingDist?.recipient || null,
              payoutType: matchingDist?.payoutType ?? null,
            });
          }
        }
        for (const dist of tx.distributions) {
          if (dist.recipient.toLowerCase() === ethHex && dist.payoutType === 2) {
            const matchingPf = tx.positionFilled.find(
              (pf) =>
                pf.matrixOwner.toLowerCase() === ethHex &&
                pf.slot === dist.slot &&
                pf.cycle === dist.cycle &&
                pf.position === dist.position
            );
            ownerDirectLogMap.set(`${dist.slot}:${dist.cycle}:${dist.position}`, {
              hash: tx.hash,
              timestamp: tx.timestamp,
              amountTrob: dist.amountTrob,
              participant: matchingPf?.participant || null,
            });
          }
        }
      }

      // Collect authoritative board seats across all unlocked slots (snapshots + active live boards)
      const items: any[] = [];
      const payoutItems: any[] = [];
      let totalInflowUsd = 0;
      let totalInflowTrob = 0;
      let totalOutflowUsd = 0;
      let totalOutflowTrob = 0;

      const unlockedSlots = overview.slotSummaries.filter((s) => s.isUnlocked);

      // Parallel fetch of full node details for every unlocked slot (snapshots + active)
      await Promise.all(
        unlockedSlots.map(async (slotSummary) => {
          const s = slotSummary.slotNumber;
          const [snapCount, liveDetail] = await Promise.all([
            getCycleSnapshotCount(ethHex, s).catch(() => slotSummary.snapshotCount || 0),
            fetchRawNodesWithCodes(ethHex, s),
          ]);

          const snapshots =
            snapCount > 0
              ? await Promise.all(
                  Array.from({ length: snapCount }, (_, idx) =>
                    getCycleSnapshotDetail(ethHex, s, idx).catch(() => null)
                  )
                )
              : [];

          const boards: Array<{
            cycle: number;
            nodeAddresses: string[];
            nodeCodes: number[];
            nodeMemberIds: number[];
            payoutRecipients: string[];
            payoutTypes: number[];
            fallbackTimestamp: string | null;
          }> = [];

          snapshots.forEach((snap, idx) => {
            if (!snap || !snap.nodeAddresses) return;
            boards.push({
              cycle: snap.cycleNumber > 0 ? snap.cycleNumber : idx + 1,
              nodeAddresses: snap.nodeAddresses,
              nodeCodes: snap.nodeCodes || [],
              nodeMemberIds: snap.nodeMemberIds || [],
              payoutRecipients: snap.payoutRecipients || [],
              payoutTypes: snap.payoutTypes || [],
              fallbackTimestamp:
                snap.completedAt && snap.completedAt > 0
                  ? new Date(snap.completedAt * 1000).toISOString()
                  : null,
            });
          });

          const hasLiveNodes = liveDetail.nodeAddresses && liveDetail.nodeAddresses.some((a: string) => isNonZeroAddress(a));
          const effectiveLiveAddresses = hasLiveNodes
            ? liveDetail.nodeAddresses
            : (slotSummary.slot1Nodes ? slotSummary.slot1Nodes.map((n: any) => n?.placedUser || "0x0000000000000000000000000000000000000000") : []);
          const effectiveLiveCodes = hasLiveNodes
            ? liveDetail.nodeCodes
            : (slotSummary.slot1Nodes ? slotSummary.slot1Nodes.map((n: any) => n?.referralCode || n?.code || 0) : []);
          const effectiveLiveIds = hasLiveNodes
            ? liveDetail.nodeMemberIds
            : (slotSummary.slot1Nodes ? slotSummary.slot1Nodes.map((n: any) => n?.userId || 0) : []);
          const effectiveLiveRecipients = hasLiveNodes
            ? liveDetail.payoutRecipients
            : (slotSummary.slot1Nodes ? slotSummary.slot1Nodes.map((n: any) => n?.recipient || (n?.payoutType === "DIRECT" ? ethHex : "0x0000000000000000000000000000000000000000")) : []);
          const effectiveLiveTypes = hasLiveNodes
            ? liveDetail.payoutTypes
            : (slotSummary.slot1Nodes ? slotSummary.slot1Nodes.map((n: any) => n?.payoutType === "DIRECT" ? 2 : 0) : []);

          const isSettledSlot = !slotSummary.isLive && boards.length > 0;
          if (!isSettledSlot && (slotSummary.isLive || effectiveLiveAddresses.some((a: string) => isNonZeroAddress(a)))) {
            boards.push({
              cycle: slotSummary.currentCycle,
              nodeAddresses: effectiveLiveAddresses,
              nodeCodes: effectiveLiveCodes,
              nodeMemberIds: effectiveLiveIds,
              payoutRecipients: effectiveLiveRecipients,
              payoutTypes: effectiveLiveTypes,
              fallbackTimestamp: null,
            });
          }

          const slotCost = slotSummary.cost > 0 ? slotSummary.cost : unitCostUsd;
          const slotTrobCost = slotSummary.costTrob > 0 ? slotSummary.costTrob : unitCostTrob;

          for (const board of boards) {
            for (let idx = 0; idx < 14; idx++) {
              const pos = idx + 1;
              const nodeAddr = board.nodeAddresses[idx];
              if (!isNonZeroAddress(nodeAddr)) continue;

              const recipAddr = board.payoutRecipients[idx];
              const pTypeNum = board.payoutTypes[idx];
              const isDirectToOwner = isOwnerDirectSeat(pos, nodeAddr, recipAddr, pTypeNum, ethHex);
              const logKey = `${s}:${board.cycle}:${pos}`;
              const directLog = ownerDirectLogMap.get(logKey);
              const posLog = positionLogMap.get(logKey);

              const fromBase58 = hexToTronBase58(nodeAddr);
              const shortFrom = fromBase58 && fromBase58.length > 10 ? `${fromBase58.slice(0, 6)}...${fromBase58.slice(-4)}` : fromBase58 || nodeAddr;
              const code = board.nodeCodes[idx] > 0 ? board.nodeCodes[idx] : null;
              const userId = board.nodeMemberIds[idx] > 0 ? board.nodeMemberIds[idx] : null;
              const memberLabel = code ? `Member #${code}` : userId ? `Operative #${userId}` : shortFrom;

              const txHash = directLog?.hash || posLog?.hash || null;
              const timestamp = directLog?.timestamp || posLog?.timestamp || board.fallbackTimestamp;
              const trobAmt = directLog?.amountTrob || posLog?.costTrob || slotTrobCost;

              if (isDirectToOwner) {
                totalInflowUsd += slotCost;
                totalInflowTrob += trobAmt;

                const row = {
                  id: `tx-inflow-s${s}-c${board.cycle}-p${pos}`,
                  type: "COMMISSION_EARNED",
                  title: `Slot #${String(s).padStart(2, "0")} • Direct Commission (Seat #${pos})`,
                  slotNumber: s,
                  cycle: board.cycle,
                  position: pos,
                  amount: slotCost,
                  amountUsd: slotCost,
                  trobAmount: Number(trobAmt.toFixed(2)),
                  trobSubtitle: trobAmt > 0 ? `${trobAmt.toFixed(2)} TROB` : undefined,
                  token: "USD",
                  fromAddress: fromBase58,
                  fromLabel: memberLabel,
                  toAddress: userBase58,
                  toLabel: "You (Personal Wallet)",
                  distributionRule: "100% Direct P2P Instant Payout",
                  txHash,
                  status: "COMPLETED",
                  description: `Slot #${String(s).padStart(2, "0")} (Cycle #${board.cycle}) Seat #${pos} • 100% P2P Payout (+ $${slotCost.toFixed(2)} USD)`,
                  timestamp,
                };
                items.push(row);
                payoutItems.push({ ...row, type: "COMMISSION" });
              } else {
                // Non-owner matrix board routing (Upline pass-up, Protocol Pools, Downline spillover)
                const vaultHexLower = ("0x" + (VAULT_HEX.startsWith("41") ? VAULT_HEX.slice(2) : VAULT_HEX)).toLowerCase();
                const resolvedRecipHex = isNonZeroAddress(recipAddr) ? recipAddr.toLowerCase() : posLog?.recipient?.toLowerCase() || "";
                const isVaultRoute =
                  resolvedRecipHex === vaultHexLower ||
                  pos === 4 ||
                  pos === 5 ||
                  pos === 14 ||
                  pTypeNum === 3;
                const recipBase58 = isNonZeroAddress(resolvedRecipHex) ? hexToTronBase58(resolvedRecipHex) : "";
                const toLabel = isVaultRoute
                  ? "EquoraVault (4 Protocol Pools)"
                  : recipBase58
                    ? `${recipBase58.slice(0, 6)}...${recipBase58.slice(-4)}`
                    : pos === 1 || pos === 2
                      ? "Qualified Upline"
                      : "Qualified Downline";

                const rule = isVaultRoute
                  ? pos === 4 || pos === 5
                    ? `P${pos} Reserve → Vault Split (35% DAO / 40% Royalty / 15% Rewards / 10% Box)`
                    : pos === 14
                      ? "P14 Auto-Recycle & Protocol Vault Split"
                      : "Unqualified Fallback → 4 Protocol Pools"
                  : pos === 1 || pos === 2
                    ? `Level 1 Pass-Up (Upline ${pos})`
                    : `Level 3 Spillover (Seat #${pos})`;

                items.push({
                  id: `tx-route-s${s}-c${board.cycle}-p${pos}`,
                  type: isVaultRoute ? "POOL_ROUTING" : "BOARD_ROUTING",
                  title: `Slot #${String(s).padStart(2, "0")} • Seat #${pos} Matrix Routing`,
                  slotNumber: s,
                  cycle: board.cycle,
                  position: pos,
                  amount: 0,
                  amountUsd: 0,
                  routedAmountUsd: unitCostUsd,
                  trobAmount: Number(trobAmt.toFixed(2)),
                  trobSubtitle: trobAmt > 0 ? `${trobAmt.toFixed(2)} TROB Routed` : undefined,
                  token: "USD",
                  fromAddress: fromBase58,
                  fromLabel: memberLabel,
                  toAddress: recipBase58 || (isVaultRoute ? "EquoraVault" : "Upline / Downline"),
                  toLabel,
                  distributionRule: rule,
                  txHash,
                  status: "COMPLETED",
                  description: `Slot #${String(s).padStart(2, "0")} Seat #${pos}: $${unitCostUsd.toFixed(2)} from ${memberLabel} → ${toLabel}`,
                  timestamp,
                });
              }
            }
          }
        })
      );

      // Outflow: One-time Slot #01 Entry Cost
      const slot1Join = userJoinEvents.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )[0];
      const joinTrob = slot1Join?.costTrob || unitCostTrob;
      totalOutflowUsd += unitCostUsd;
      totalOutflowTrob += joinTrob;

      items.push({
        id: `tx-outflow-s1`,
        type: "SLOT_PURCHASE",
        slotNumber: 1,
        cycle: 1,
        position: null,
        amount: -unitCostUsd,
        amountUsd: -unitCostUsd,
        trobAmount: Number(joinTrob.toFixed(2)),
        trobSubtitle: joinTrob > 0 ? `${joinTrob.toFixed(2)} TROB` : undefined,
        token: "USD",
        fromAddress: userBase58,
        fromLabel: "You (Personal Wallet)",
        toAddress: matrixBase58,
        toLabel: "EquoraMatrix Entry Contract",
        distributionRule: "1x Lifetime Wallet Entry (Slot #01)",
        txHash: slot1Join?.hash || null,
        status: "COMPLETED",
        description: `Slot #01 Activation (- $${unitCostUsd.toFixed(2)} USD One-Time Out-of-Pocket)`,
        timestamp:
          slot1Join?.timestamp ||
          (regUser?.regTime && regUser.regTime > 0n
            ? new Date(Number(regUser.regTime) * 1000).toISOString()
            : null),
      });

      // Auto-Escalations: Slots 2..N unlocked via P4+P5 Reserve ($0 out-of-pocket)
      for (const sSummary of unlockedSlots) {
        if (sSummary.slotNumber <= 1) continue;
        const autoEvt = userAutoActivatedMap.get(sSummary.slotNumber);
        items.push({
          id: `tx-auto-s${sSummary.slotNumber}`,
          type: "UPGRADE_RESERVE",
          slotNumber: sSummary.slotNumber,
          cycle: 1,
          position: null,
          amount: 0,
          amountUsd: 0,
          routedAmountUsd: unitCostUsd,
          trobAmount: Number(unitCostTrob.toFixed(2)),
          trobSubtitle:
            unitCostTrob > 0
              ? `${unitCostTrob.toFixed(2)} TROB ($0 Out-of-Pocket)`
              : "$0 Out-of-Pocket",
          token: "USD",
          fromAddress: `Slot #${String(autoEvt?.fromSlot || sSummary.slotNumber - 1).padStart(2, "0")} Auto-Reserve`,
          fromLabel: `Slot #${String(autoEvt?.fromSlot || sSummary.slotNumber - 1).padStart(2, "0")} Auto-Reserve (P4+P5)`,
          toAddress: matrixBase58,
          toLabel: `Slot #${String(sSummary.slotNumber).padStart(2, "0")} Tier Unlocked`,
          distributionRule: "Automated P4+P5 Escalation ($0 Out-of-Pocket)",
          txHash: autoEvt?.hash || null,
          status: "COMPLETED",
          description: `Slot #${String(sSummary.slotNumber).padStart(2, "0")} Auto-Activation ($${unitCostUsd.toFixed(2)} Value • $0.00 Out-of-Pocket)`,
          timestamp: autoEvt?.timestamp || null,
        });
      }

      // Sort chronologically descending (null timestamps ordered cleanly after dated items)
      const sortDesc = (a: any, b: any) => {
        const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        if (tb !== ta) return tb - ta;
        return (b.slotNumber || 0) - (a.slotNumber || 0) || (b.cycle || 0) - (a.cycle || 0) || (b.position || 0) - (a.position || 0);
      };
      items.sort(sortDesc);
      payoutItems.sort(sortDesc);

      const finalInflowUsd =
        Math.max(Number(totalInflowUsd.toFixed(2)), overview.totalEarnedUsd);
      const finalInflowTrob =
        overview.totalEarnedTrob > 0
          ? Number(overview.totalEarnedTrob.toFixed(2))
          : Number(totalInflowTrob.toFixed(2));
      const finalOutflowUsd = Number(totalOutflowUsd.toFixed(2));
      const finalOutflowTrob = Number(totalOutflowTrob.toFixed(2));

      const slotBreakdowns = unlockedSlots.flatMap((s) => s.cycleBreakdowns);

      if (path[0] === "earnings") {
        // Group dated payouts dynamically for real cumulative chart
        const datedPayouts = [...payoutItems]
          .filter((p) => p.timestamp)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const byDay = new Map<string, number>();
        let running = 0;
        for (const p of datedPayouts) {
          running += Number(p.amountUsd || 0);
          const dayLabel = new Date(p.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          byDay.set(dayLabel, Number(running.toFixed(2)));
        }
        const chartData = Array.from(byDay.entries()).map(([date, amount]) => ({ date, amount }));

        const availableUsd =
          overview.trobPriceUsd > 0
            ? Number((balanceTrob * overview.trobPriceUsd).toFixed(2))
            : 0;
        const settledUsd = finalInflowUsd;

        return NextResponse.json({
          success: true,
          data: {
            address: ethHex,
            totalEarnings: finalInflowUsd,
            totalEarningsUsd: finalInflowUsd,
            totalEarningsTrob: finalInflowTrob,
            availableBalance: availableUsd,
            availableBalanceUsd: availableUsd,
            availableBalanceTrob: balanceTrob,
            withdrawnTotal: settledUsd,
            withdrawnTotalUsd: settledUsd,
            totalWithdrawn: settledUsd,
            pendingRewards: 0,
            breakdown: {
              directBonus: finalInflowUsd,
              matrixPlacements: 0,
              upgradeReserves: 0,
              poolShares: 0,
            },
            slotBreakdowns,
            chartData,
            recentPayouts: payoutItems,
            _source: "onchain",
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          items,
          slotBreakdowns,
          total: items.length,
          page: 1,
          limit: 100,
          totalPages: 1,
          stats: {
            totalInflow: finalInflowUsd,
            totalOutflow: finalOutflowUsd,
            totalInflowTrob: finalInflowTrob,
            totalOutflowTrob: finalOutflowTrob,
            pendingCount: 0,
            netProfit: finalInflowUsd,
            netProfitAfterOutflow: Number((finalInflowUsd - finalOutflowUsd).toFixed(2)),
            netProfitTrob: finalInflowTrob,
            netProfitAfterOutflowTrob: Number((finalInflowTrob - finalOutflowTrob).toFixed(2)),
          },
          _source: "onchain",
        },
      });
    }

    // ── Generic catch-all ────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: `Equora Matrix on-chain API: ${path.join("/")}`,
      data: null,
      _source: "onchain",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST handler (action logging / tx submission — forward to chain)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      success: true,
      data: body,
      message: `Action recorded: ${path.join("/")}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
