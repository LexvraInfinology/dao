import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// Config — always read from process.env so Vercel/Render env vars take priority
// ─────────────────────────────────────────────────────────────────────────────
const FULLNODE_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://fullnode-one-testnet.trobchain.com";

const MATRIX_HEX =
  process.env.NEXT_PUBLIC_MATRIX_HEX ||
  "41afedb7886ddf932acb2c91f7ed080b493d5fb18f"; // TS1S2VRXYn8KzCQDYL6JweJVNczCSK3xro

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
  const c = address.trim();
  if (c.startsWith("T") && c.length === 34) return base58ToHex(c).toLowerCase();
  if (c.startsWith("0x") || c.startsWith("0X")) return ("41" + c.slice(2)).toLowerCase();
  if (c.startsWith("41") && c.length === 42) return c.toLowerCase();
  return c.toLowerCase();
}

/** Convert any address format → 0x-prefixed eth hex */
function toEthHex(address: string): string {
  const c = address.trim();
  if (c.startsWith("0x") || c.startsWith("0X")) return c.toLowerCase();
  if (c.startsWith("T") && c.length === 34) return ("0x" + base58ToHex(c).slice(2)).toLowerCase();
  if (c.startsWith("41") && c.length === 42) return ("0x" + c.slice(2)).toLowerCase();
  return c.toLowerCase();
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
  const params = encodeAddress(userEthHex);
  const chunks = await callContract(MATRIX_HEX, "isMatrixQualified(address)", params);
  return chunks[0] ? decodeBool(chunks[0]) : false;
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
  const chunks = await callContract(MATRIX_HEX, "userUpline(address)", encodeAddress(userEthHex));
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
// Build node list for a slot (filled / unfilled, payout metadata)
// ─────────────────────────────────────────────────────────────────────────────
function buildNodes(
  nodes: string[],
  filledNodes: number,
  slotCostUsd: number
) {
  const ZERO = "0x0000000000000000000000000000000000000000";
  const NODE_LEVELS = [1,1,2,2,2,2,3,3,3,3,3,3,3,3]; // 14 nodes
  const PAYOUT_TYPES = [
    "UPLINE_1","UPLINE_2",
    "DIRECT","DIRECT","POOL","POOL",
    "DOWNLINE_P7","DIRECT","DIRECT","DOWNLINE_P10","DIRECT","DIRECT",
    "DOWNLINE_P13","RECYCLE",
  ];

  return Array.from({ length: 14 }, (_, i) => {
    const addr = nodes[i] || ZERO;
    const filled = addr !== ZERO;
    return {
      position:        i + 1,
      level:           NODE_LEVELS[i] || 3,
      filled,
      placedUser:      filled ? addr : null,
      payoutType:      PAYOUT_TYPES[i] || "DIRECT",
      recipientAddress: filled ? addr : null,
      wasFallback:     false,
      amount:          slotCostUsd,
      timestamp:       null,
    };
  });
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

      const [directs, qualified, stats, sponsor, slot1] = await Promise.all([
        getActiveDirects(ethHex),
        isQualified(ethHex),
        getUserStats(ethHex),
        getSponsor(ethHex).catch(() => null),
        getUserSlot(ethHex, 1),
      ]);

      const trobPriceUsd6 = await getTrobPrice();
      const trobPriceUsd = trobPriceUsd6 / 1_000_000;
      const highestUnlocked = Math.max(stats.highestSlot, slot1?.isUnlocked ? 1 : 0);
      const totalEarnedTrob = Number(stats.totalEarned) / 1_000_000;
      const totalEarnedUsd  = totalEarnedTrob * trobPriceUsd;
      const balanceTrob     = Number(await getUserBalance(ethHex)) / 1_000_000;

      return NextResponse.json({
        success: true,
        data: {
          address: ethHex,
          canonicalAddress: tronHex,
          username: `Member #${ethHex.slice(2, 6).toUpperCase()}`,
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
          availableBalanceUsd: balanceTrob * trobPriceUsd,
          withdrawnTotal: Number(stats.totalWithdrawn),
          recyclesCount: 0,
          highestUnlockedSlot: highestUnlocked || 1,
          currentSlot: highestUnlocked || 1,
          isSlot2Reserved: highestUnlocked >= 2,
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
        getUserSlot(ethHex, 1),
        getTrobPrice(),
      ]);

      const trobPriceUsd = trobPriceUsd6 / 1_000_000;
      const highestUnlocked = Math.max(stats.highestSlot, slot1?.isUnlocked ? 1 : 0);
      const totalEarnedTrob = Number(stats.totalEarned) / 1_000_000;
      const totalEarnedUsd  = totalEarnedTrob * trobPriceUsd;
      const balanceTrob     = Number(await getUserBalance(ethHex)) / 1_000_000;
      const sponsor         = await getSponsor(ethHex).catch(() => null);

      return NextResponse.json({
        success: true,
        data: {
          address: ethHex,
          currentSlot: highestUnlocked || 1,
          highestUnlockedSlot: highestUnlocked || 1,
          totalEarnedTrob,
          totalEarnedUsd,
          availableWithdrawTrob: balanceTrob,
          availableWithdrawUsd: balanceTrob * trobPriceUsd,
          recyclesCount: 0,
          trobPriceUsd,
          isQualified: qualified,
          activeDirectsCount: directs,
          sponsorAddress: sponsor,
          activeSlotProgress: slot1 ? {
            slotNumber: 1,
            filledNodes: slot1.filledNodes,
            totalNodes: 14,
            cycle: slot1.currentCycle,
            upgradeReserve: 0,
            level1Filled: Math.min(slot1.filledNodes, 2),
            level2Filled: Math.max(0, Math.min(slot1.filledNodes - 2, 4)),
            level3Filled: Math.max(0, Math.min(slot1.filledNodes - 6, 8)),
          } : {
            slotNumber: 1, filledNodes: 0, totalNodes: 14, cycle: 1,
            upgradeReserve: 0, level1Filled: 0, level2Filled: 0, level3Filled: 0,
          },
          recentActivity: [],
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

      const slots = slotData.map((sd, i) => ({
        slotNumber: i + 1,
        cost: slotCostUsd,
        isUnlocked: sd?.isUnlocked || i === 0 ? (sd?.isUnlocked ?? false) : false,
        isLive: sd?.isLive || i === 0 ? (sd?.isLive ?? false) : false,
        currentCycle: sd?.currentCycle || 1,
        recyclesCount: 0,
        filledNodes: sd?.filledNodes || 0,
        upgradeReserve: 0,
        totalEarned: Number(sd?.totalEarned || 0n),
        totalEarnedUsd: (Number(sd?.totalEarned || 0n) / 1_000_000) * trobPriceUsd,
        totalEarnedTrob: Number(sd?.totalEarned || 0n) / 1_000_000,
        unlockedAt: sd?.isUnlocked ? new Date().toISOString() : null,
        _source: "onchain",
      }));

      return NextResponse.json({ success: true, data: slots });
    }

    // ── /api/matrix/slots/:address/:slotNumber (slot detail with nodes) ──────
    if (path[0] === "slots" && path[1] && path[2]) {
      const ethHex = toEthHex(path[1]);
      const slotNumber = Math.min(Math.max(parseInt(path[2], 10) || 1, 1), 12);
      const trobPriceUsd6 = await getTrobPrice();
      const trobPriceUsd = trobPriceUsd6 / 1_000_000;
      const slotCostUsd = 30;

      const sd = await getSlotDataV2(ethHex, slotNumber);

      if (!sd) {
        // fallback empty
        return NextResponse.json({
          success: true,
          data: {
            slotNumber, cost: slotCostUsd,
            isUnlocked: slotNumber === 1, isLive: slotNumber === 1,
            currentCycle: 1, totalCycles: 1, filledNodes: 0, snapshotCount: 0,
            nodes: buildNodes([], 0, slotCostUsd),
            totalEarned: 0, totalEarnedTrob: 0, totalEarnedUsd: 0,
            _source: "onchain_empty",
          },
        });
      }

      // Dynamic downline tree traversal for 14-seat visualization
      const resolvedNodes = [...sd.nodes];
      const ZERO = "0x0000000000000000000000000000000000000000";
      try {
        const fetchDownline = async (addr: string) => {
          if (!addr || addr === ZERO) return [];
          const res = await getSlotDataV2(addr, slotNumber);
          return res?.nodes || [];
        };

        const [s1Nodes, s2Nodes] = await Promise.all([
          fetchDownline(resolvedNodes[0]),
          fetchDownline(resolvedNodes[1]),
        ]);

        if ((!resolvedNodes[2] || resolvedNodes[2] === ZERO) && s1Nodes[0]) resolvedNodes[2] = s1Nodes[0];
        if ((!resolvedNodes[3] || resolvedNodes[3] === ZERO) && s1Nodes[1]) resolvedNodes[3] = s1Nodes[1];
        if ((!resolvedNodes[4] || resolvedNodes[4] === ZERO) && s2Nodes[0]) resolvedNodes[4] = s2Nodes[0];
        if ((!resolvedNodes[5] || resolvedNodes[5] === ZERO) && s2Nodes[1]) resolvedNodes[5] = s2Nodes[1];

        const l2Parents = [resolvedNodes[2], resolvedNodes[3], resolvedNodes[4], resolvedNodes[5]];
        const l2Downlines = await Promise.all(l2Parents.map(fetchDownline));
        for (let pIdx = 0; pIdx < 4; pIdx++) {
          const leftIdx = 6 + pIdx * 2;
          const rightIdx = leftIdx + 1;
          const pSub = l2Downlines[pIdx];
          if ((!resolvedNodes[leftIdx] || resolvedNodes[leftIdx] === ZERO) && pSub[0]) resolvedNodes[leftIdx] = pSub[0];
          if ((!resolvedNodes[rightIdx] || resolvedNodes[rightIdx] === ZERO) && pSub[1]) resolvedNodes[rightIdx] = pSub[1];
        }
      } catch (err) {
        console.warn("[API Matrix] Downline resolution notice:", err);
      }

      const activeFilledCount = resolvedNodes.filter(n => n && n !== ZERO).length;
      const nodes = buildNodes(resolvedNodes, Math.max(sd.filledNodes, activeFilledCount), slotCostUsd);
      const totalEarnedTrob = Number(sd.slotEarned) / 1_000_000;

      return NextResponse.json({
        success: true,
        data: {
          slotNumber,
          cost: slotCostUsd,
          isUnlocked: sd.isUnlocked,
          isLive: sd.isLive,
          currentCycle: sd.currentCycle,
          totalCycles: sd.currentCycle,
          snapshotCount: 0,
          filledNodes: sd.filledNodes,
          nodes,
          totalEarned: Number(sd.slotEarned),
          totalEarnedTrob,
          totalEarnedUsd: totalEarnedTrob * trobPriceUsd,
          _source: "onchain",
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
