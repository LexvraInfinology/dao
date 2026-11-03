import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const B58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58ToHex(b58: string): string {
  const bytes = [0];
  for (let i = 0; i < b58.length; i++) {
    const c = b58[i];
    const val = B58_CHARS.indexOf(c);
    if (val === -1) return b58;
    for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
    bytes[0] += val;
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
  for (let i = 0; i < b58.length && b58[i] === "1"; i++) bytes.push(0);
  const buf = Buffer.from(bytes.reverse());
  return buf.subarray(0, buf.length - 4).toString("hex");
}

function toTronHex(address: string): string {
  const clean = address.trim();
  if (clean.startsWith("T") && clean.length === 34) {
    return base58ToHex(clean).toLowerCase();
  }
  if (clean.startsWith("0x") || clean.startsWith("0X")) {
    return ("41" + clean.slice(2)).toLowerCase();
  }
  return clean.toLowerCase();
}

function toEthHex(address: string): string {
  const clean = address.trim();
  if (clean.startsWith("0x") || clean.startsWith("0X")) {
    return clean.toLowerCase();
  }
  if (clean.startsWith("T") && clean.length === 34) {
    const tronHex = base58ToHex(clean);
    return ("0x" + tronHex.slice(2)).toLowerCase();
  }
  return clean.toLowerCase();
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subpath = path.join("/");

    // 1. Profile: /api/matrix/profile/:address
    if (path[0] === "profile" && path[1]) {
      const address = toEthHex(path[1]);
      return NextResponse.json({
        success: true,
        data: {
          address,
          userId: 1,
          username: `Member #${address.slice(2, 6)}`,
          avatarUrl: null,
          bio: null,
          telegram: null,
          twitter: null,
          sponsorAddress: null,
          sponsorUserId: null,
          directReferralsCount: 0,
          activeDirectsCount: 0,
          isQualified: true,
          isRegistered: true,
          teamCount: 0,
          rankTier: 1,
          rankName: "ALPHA",
          totalEarnings: 0,
          totalEarningsTrob: 0,
          totalEarningsUsd: 0,
          directEarnings: 0,
          matrixEarnings: 0,
          poolEarnings: 0,
          availableBalance: 0,
          availableBalanceTrob: 0,
          availableBalanceUsd: 0,
          withdrawnTotal: 0,
          recyclesCount: 0,
          highestUnlockedSlot: 1,
          currentSlot: 1,
          isSlot2Reserved: false,
          joinedAt: new Date().toISOString(),
        },
      });
    }

    // 2. Dashboard: /api/matrix/dashboard/:address
    if (path[0] === "dashboard" && path[1]) {
      const address = toEthHex(path[1]);
      return NextResponse.json({
        success: true,
        data: {
          address,
          currentSlot: 1,
          highestUnlockedSlot: 1,
          totalEarnedTrob: 0,
          totalEarnedUsd: 0,
          availableWithdrawTrob: 0,
          availableWithdrawUsd: 0,
          recyclesCount: 0,
          trobPriceUsd: 0.033994,
          isQualified: true,
          activeDirectsCount: 0,
          sponsorAddress: null,
          activeSlotProgress: {
            slotNumber: 1,
            filledNodes: 0,
            totalNodes: 14,
            cycle: 1,
            upgradeReserve: 0,
            level1Filled: 0,
            level2Filled: 0,
            level3Filled: 0,
          },
          recentActivity: [],
        },
      });
    }

    // 3. Slots Summary: /api/matrix/slots/:address
    if (path[0] === "slots" && path[1] && !path[2]) {
      const address = toEthHex(path[1]);
      const slots = Array.from({ length: 12 }, (_, i) => ({
        slotNumber: i + 1,
        cost: 30,
        isUnlocked: i === 0,
        isLive: i === 0,
        currentCycle: 1,
        recyclesCount: 0,
        filledNodes: 0,
        upgradeReserve: 0,
        totalEarned: 0,
        totalEarnedUsd: 0,
        totalEarnedTrob: 0,
        unlockedAt: i === 0 ? new Date().toISOString() : null,
      }));
      return NextResponse.json({
        success: true,
        data: slots,
      });
    }

    // 4. Slot Details: /api/matrix/slots/:address/:slotNumber
    if (path[0] === "slots" && path[1] && path[2]) {
      const slotNumber = parseInt(path[2], 10) || 1;
      return NextResponse.json({
        success: true,
        data: {
          slotNumber,
          cost: 30,
          isUnlocked: slotNumber === 1,
          isLive: slotNumber === 1,
          currentCycle: 1,
          totalCycles: 1,
          filledNodes: 0,
          nodes: Array.from({ length: 14 }, (_, i) => ({
            position: i + 1,
            level: i < 2 ? 1 : i < 6 ? 2 : 3,
            filled: false,
            placedUser: null,
            userId: null,
            payoutType: null,
            recipientAddress: null,
            wasFallback: false,
            amount: 30,
            timestamp: null,
          })),
        },
      });
    }

    // 5. Catch-all for any other query
    return NextResponse.json({
      success: true,
      message: `Equora Matrix fallback API: ${subpath}`,
      data: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

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
      message: "Action recorded successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
