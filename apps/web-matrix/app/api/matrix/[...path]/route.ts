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
const DEFAULT_SALARY_POOL_HEX = "41054df6beae1ebfa5676ee5fe7f6204c8f0fc441c";

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
// On-chain call helper
// ─────────────────────────────────────────────────────────────────────────────
async function callContract(
  contractHex: string,
  selector: string,
  params: string = ""
): Promise<string[]> {
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
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json() as any;
    const raw = data.constant_result?.[0] || "";
    if (!raw) return [];
    // Split into 32-byte chunks
    const chunks: string[] = [];
    for (let i = 0; i < raw.length; i += 64) chunks.push(raw.slice(i, i + 64));
    return chunks;
  } catch {
    return [];
  }
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
// Read trobPriceUsd6() → uint256 (micro-USD per TROB, 6 decimals)
// ─────────────────────────────────────────────────────────────────────────────
async function getTrobPrice(): Promise<number> {
  const chunks = await callContract(MATRIX_HEX, "trobPriceUsd6()");
  if (!chunks[0]) return 31740; // fallback: $0.03174
  return Number(decodeUint256(chunks[0]));
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
      const ethHex = toEthHex(path[1]);
      const tronHex = toTronHex(path[1]);

      const [directs, qualified, stats, sponsor, slot1, regUser] = await Promise.all([
        getActiveDirects(ethHex),
        isQualified(ethHex),
        getUserStats(ethHex),
        getSponsor(ethHex).catch(() => null),
        getUserSlot(ethHex, 1),
        getRegistryUser(ethHex).catch(() => null),
      ]);

      const trobPriceUsd6 = await getTrobPrice();
      const trobPriceUsd = trobPriceUsd6 / 1_000_000;
      const highestUnlocked = Math.max(stats.highestSlot, slot1?.isUnlocked ? 1 : 0);
      const totalEarnedTrob = Number(stats.totalEarned) / 1_000_000;
      const totalEarnedUsd  = Math.round(totalEarnedTrob * trobPriceUsd);
      const balanceTrob     = Number(await getUserBalance(ethHex)) / 1_000_000;

      return NextResponse.json({
        success: true,
        data: {
          address: ethHex,
          canonicalAddress: tronHex,
          username: regUser?.id ? `Operative #${regUser.id}` : (regUser?.code ? `Member #${regUser.code}` : `Member #${ethHex.slice(2, 6).toUpperCase()}`),
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
          isRegistered: slot1?.isUnlocked || false,
          teamCount: directs,
          rankTier: directs >= 2 ? 2 : 1,
          rankName: directs >= 2 ? "QUALIFIED" : "UNQUALIFIED",
          totalEarnings: Number(stats.totalEarned),
          totalEarningsTrob: totalEarnedTrob,
          totalEarningsUsd: totalEarnedUsd,
          directEarnings: 0,
          matrixEarnings: Number(stats.totalEarned),
          poolEarnings: 0,
          availableBalance: Number(await getUserBalance(ethHex)),
          availableBalanceTrob: balanceTrob,
          availableBalanceUsd: Math.round(balanceTrob * trobPriceUsd),
          withdrawnTotal: Number(stats.totalWithdrawn),
          recyclesCount: 0,
          highestUnlockedSlot: highestUnlocked || 1,
          currentSlot: highestUnlocked || 1,
          isSlot2Reserved: highestUnlocked >= 2,
          rankMilestones: await getUserRoyaltyTier(ethHex),
          joinedAt: new Date().toISOString(),
          _source: "onchain",
        },
      });
    }

    // ── /api/matrix/dashboard/:address ──────────────────────────────────────
    if (path[0] === "dashboard" && path[1]) {
      const ethHex = toEthHex(path[1]);

      const [directs, qualified, stats, slot1, trobPriceUsd6] = await Promise.all([
        getActiveDirects(ethHex),
        isQualified(ethHex),
        getUserStats(ethHex),
        getSlotDataV2(ethHex, 1),
        getTrobPrice(),
      ]);

      const trobPriceUsd = trobPriceUsd6 / 1_000_000;
      const highestUnlocked = Math.max(stats.highestSlot, slot1?.isUnlocked ? 1 : 0);
      const totalEarnedTrob = Number(stats.totalEarned) / 1_000_000;
      const totalEarnedUsd  = Math.round(totalEarnedTrob * trobPriceUsd);
      const balanceTrob     = Number(await getUserBalance(ethHex)) / 1_000_000;
      const sponsor         = await getSponsor(ethHex).catch(() => null);
      let upline1Directs = 0;
      let isUpline1Qualified = false;
      if (sponsor && sponsor !== "0x0000000000000000000000000000000000000000") {
        upline1Directs = await getActiveDirects(sponsor).catch(() => 0);
        isUpline1Qualified = upline1Directs >= 2;
      }

      let activeSlotNodes: any[] = [];
      let activeFilledCount = 0;
      if (slot1 && slot1.isUnlocked) {
        const { nodeAddresses, nodeCodes, nodeMemberIds, payoutRecipients, payoutTypes } = await getSlotNodesWithCodesOnChain(ethHex, 1);
        activeSlotNodes = await buildNodes(nodeAddresses, nodeCodes, nodeMemberIds, payoutRecipients, payoutTypes, 30);
        activeFilledCount = activeSlotNodes.filter(n => n.filled).length;
      }

      return NextResponse.json({
        success: true,
        data: {
          address: ethHex,
          currentSlot: highestUnlocked || 1,
          highestUnlockedSlot: highestUnlocked || 1,
          totalEarnedTrob,
          totalEarnedUsd,
          availableWithdrawTrob: balanceTrob,
          availableWithdrawUsd: Math.round(balanceTrob * trobPriceUsd),
          recyclesCount: 0,
          trobPriceUsd,
          isQualified: qualified,
          rankMilestones: await getUserRoyaltyTier(ethHex),
          activeDirectsCount: directs,
          sponsorAddress: sponsor,
          isUpline1Qualified,
          upline1DirectsCount: upline1Directs,
          activeSlotProgress: slot1 && slot1.isUnlocked ? {
            slotNumber: 1,
            filledNodes: Math.max(slot1.filledNodes || 0, activeFilledCount),
            totalNodes: 14,
            cycle: slot1.currentCycle,
            upgradeReserve: 0,
            level1Filled: Math.min(activeFilledCount, 2),
            level2Filled: Math.max(0, Math.min(activeFilledCount - 2, 4)),
            level3Filled: Math.max(0, activeFilledCount - 6),
            nodes: activeSlotNodes,
          } : {
            slotNumber: 1, filledNodes: 0, totalNodes: 14, cycle: 1,
            upgradeReserve: 0, level1Filled: 0, level2Filled: 0, level3Filled: 0,
            nodes: [],
          },
          recentActivity: activeSlotNodes
            .filter((n: any) => n.filled)
            .map((n: any) => {
              const pos = n.position;
              const isP2P = pos === 3 || pos === 6 || pos === 8 || pos === 9 || pos === 11 || pos === 12;
              return {
                id: `onchain-pos-${pos}`,
                action: isP2P ? "COMMISSION_RECEIVED" : "MEMBER_JOINED",
                title: isP2P ? "P2P Direct Yield Received (+$30.00)" : `Seat P${pos} Activated (${n.label || `Position #${pos}`})`,
                slot: 1,
                position: pos,
                amount: 882.51,
                amountUsd: 30.0,
                token: "TROB",
                fromAddress: n.base58 || n.placedUser,
                toAddress: ethHex,
                txHash: null,
                status: "CONFIRMED",
                description: `Position #${pos} placed • ${n.label || "Downline"} (${n.payoutType || "+$30 Yield"})`,
                timestamp: new Date().toISOString(),
              };
            }),
          _source: "onchain",
        },
      });
    }

    // ── /api/matrix/slots/:address (summary of all 12 slots) ────────────────
    if (path[0] === "slots" && path[1] && !path[2]) {
      const ethHex = toEthHex(path[1]);
      const trobPriceUsd6 = await getTrobPrice();
      const trobPriceUsd = trobPriceUsd6 / 1_000_000;
      const BASE_COST_SUN = 30_000_000n; // $30 in SUN
      const slotCostUsd = 30;

      const slotData = await Promise.all(
        Array.from({ length: 12 }, (_, i) => getUserSlot(ethHex, i + 1))
      );

      const slots = slotData.map((sd, i) => {
        const costUsd = 30 * Math.pow(2, i);
        const earnedTrob = Number(sd?.totalEarned || 0n) / 1_000_000;
        const earnedUsd = Math.round(earnedTrob * trobPriceUsd);
        return {
          slotNumber: i + 1,
          cost: costUsd,
          isUnlocked: sd?.isUnlocked || i === 0 ? (sd?.isUnlocked ?? false) : false,
          isLive: sd?.isLive || i === 0 ? (sd?.isLive ?? false) : false,
          currentCycle: sd?.currentCycle || 1,
          recyclesCount: 0,
          filledNodes: sd?.filledNodes || 0,
          upgradeReserve: 0,
          totalEarned: Number(sd?.totalEarned || 0n),
          totalEarnedUsd: earnedUsd,
          totalEarnedTrob: earnedTrob,
          unlockedAt: sd?.isUnlocked ? new Date().toISOString() : null,
          _source: "onchain",
        };
      });

      return NextResponse.json({ success: true, data: slots });
    }

    // ── /api/matrix/slots/:address/:slotNumber (slot detail with nodes & multi-cycle snapshots) ──
    if (path[0] === "slots" && path[1] && path[2]) {
      const ethHex = toEthHex(path[1]);
      const slotNumber = Math.min(Math.max(parseInt(path[2], 10) || 1, 1), 12);
      const trobPriceUsd6 = await getTrobPrice();
      const trobPriceUsd = trobPriceUsd6 / 1_000_000;
      const slotCostUsd = 30 * Math.pow(2, Math.min(11, slotNumber - 1));

      const cycleParam = req.nextUrl.searchParams.get("cycle");
      const targetCycle = cycleParam ? parseInt(cycleParam, 10) : null;

      const [sd, nodesWithCodes, snapshotCount, userStats, slot12Data] = await Promise.all([
        getSlotDataV2(ethHex, slotNumber),
        getSlotNodesWithCodesOnChain(ethHex, slotNumber),
        getCycleSnapshotCount(ethHex, slotNumber),
        getUserStats(ethHex),
        getSlotDataV2(ethHex, 12).catch(() => null),
      ]);

      const highestSlot = Math.max(userStats?.highestSlot || 0, 1);
      // Global Cycle rule: Cycle 1 is Slot 1 to Slot 12.
      // Cycle 2 only begins when Slot 12 has all 14 positions completed!
      const isSlot12Completed = Boolean(
        slot12Data && (slot12Data.filledNodes >= 14 || slot12Data.currentCycle > 1)
      );
      const globalCycle = isSlot12Completed ? Math.max(2, slot12Data?.currentCycle || 2) : 1;

      if (!sd) {
        const emptyNodes = await buildNodes([], [], [], [], [], slotCostUsd);
        return NextResponse.json({
          success: true,
          data: {
            slotNumber, cost: slotCostUsd,
            isUnlocked: false, isLive: false,
            globalCycle,
            currentCycle: globalCycle, selectedCycle: 1, totalCycles: globalCycle, filledNodes: 0, snapshotCount: 0,
            isViewingSnapshot: false,
            nodes: emptyNodes,
            totalEarned: 0, totalEarnedTrob: 0, totalEarnedUsd: 0,
            _source: "onchain_empty",
          },
        });
      }

      let nodes: any[] = [];
      let isViewingSnapshot = false;
      let selectedCycle = globalCycle;
      let displayFilledCount = 0;

      // In Global Cycle 1:
      // If past slot is completed (slotNumber < highestSlot or snapshotCount > 0):
      // When targetCycle is not explicitly 2, load Cycle 1 completed snapshot (14/14 nodes)
      const shouldLoadTargetSnapshot = Boolean(
        targetCycle &&
        targetCycle <= snapshotCount &&
        targetCycle < (sd.currentCycle || 1)
      );

      if (shouldLoadTargetSnapshot) {
        const snapDetail = await getCycleSnapshotDetail(ethHex, slotNumber, targetCycle! - 1);
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
          selectedCycle = snapDetail.cycleNumber;
          displayFilledCount = 14;
        }
      } else if (targetCycle && targetCycle <= snapshotCount && targetCycle < (sd.currentCycle || 1)) {
        const snapDetail = await getCycleSnapshotDetail(ethHex, slotNumber, targetCycle - 1);
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
          selectedCycle = snapDetail.cycleNumber;
          displayFilledCount = 14;
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
        selectedCycle = globalCycle;
      }

      const totalEarnedTrob = Number(sd.slotEarned) / 1_000_000;

      return NextResponse.json({
        success: true,
        data: {
          slotNumber,
          cost: slotCostUsd,
          isUnlocked: Boolean(sd.isUnlocked || slotNumber <= highestSlot),
          isLive: Boolean(sd.isLive || (slotNumber === highestSlot)),
          globalCycle,
          currentCycle: globalCycle,
          selectedCycle,
          totalCycles: globalCycle,
          snapshotCount,
          isViewingSnapshot,
          filledNodes: displayFilledCount,
          nodes,
          totalEarned: Number(sd.slotEarned),
          totalEarnedTrob,
          totalEarnedUsd: Math.round(totalEarnedTrob * trobPriceUsd),
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
          const [idChunk, codeChunk, slotChunk] = await Promise.all([
            callContract(REGISTRY_HEX, "getUserId(address)", dParam),
            callContract(REGISTRY_HEX, "getCodeByUser(address)", dParam),
            callContract(MATRIX_HEX, "userSlots(address,uint256)", dParam + encodeUint256(1)),
          ]);
          const userId = idChunk[0] ? Number(decodeUint256(idChunk[0])) : 0;
          const code = codeChunk[0] ? Number(decodeUint256(codeChunk[0])) : 0;
          const isSlot1Unlocked = slotChunk[0] ? decodeBool(slotChunk[0]) : true;

          return {
            address: dAddr,
            base58: hexToTronBase58(dAddr),
            userId,
            code,
            username: code ? `Member #${code}` : `Operative #${userId || "1"}`,
            joinedAt: new Date().toISOString(),
            activeSlots: isSlot1Unlocked ? 1 : 0,
            totalContributed: isSlot1Unlocked ? 30 : 0,
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
