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

// 1 October 2026 00:00:00 UTC (1790812800 seconds = 1790812800000 ms)
const MIN_WALLET_CREATION_TIMESTAMP = 1790812800000;

const OFFICIAL_SR_MAINNET_B58 = process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS || "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
const OFFICIAL_SR_MAINNET_HEX = toTronHex(OFFICIAL_SR_MAINNET_B58);

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await context.params;
    if (!address) {
      return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 });
    }

    const rawAddress = address.trim();
    const canonical = rawAddress.toLowerCase();

    const fullnodeRpc =
      process.env.NEXT_PUBLIC_RPC_URL ||
      process.env.FULLNODE_URL ||
      "https://fullnode-one.trobchain.com";

    const explorerApi =
      process.env.NEXT_PUBLIC_EXPLORER_API_URL ||
      "https://backend.trobchain.com/v1";

    const officialSrB58 = OFFICIAL_SR_MAINNET_B58;
    const officialSrHex = OFFICIAL_SR_MAINNET_HEX;

    let creationTimestamp: number | null = null;
    let condition1Passed = true;
    let condition1Reason: string | undefined;

    let currentEnergyStakeTrob = 0;
    let currentBandwidthStakeTrob = 0;
    let currentSrVoted = false;

    // 1. Query Explorer Account API for actual on-chain creation / first seen date
    try {
      const expRes = await fetchWithTimeout(`${explorerApi}/accounts/${rawAddress}`, {
        cache: "no-store",
      }, 2500);
      if (expRes.ok) {
        const expJson = await expRes.json();
        const expData = expJson.data || expJson;
        if (expData?.first_seen_at) {
          const ts = new Date(expData.first_seen_at).getTime();
          if (!isNaN(ts) && ts > 0) {
            creationTimestamp = ts;
          }
        }
        if (expData?.raw) {
          const raw = expData.raw;
          if (raw.create_time && (!creationTimestamp || Number(raw.create_time) < creationTimestamp)) {
            let ct = Number(raw.create_time);
            if (ct < 10000000000) ct *= 1000;
            creationTimestamp = ct;
          }
          if (Array.isArray(raw.frozenV2)) {
            for (const f of raw.frozenV2) {
              const amountSun = Number(f.amount || 0);
              const trobAmount = Math.floor(amountSun / 1_000_000);
              const typeStr = String(f.type ?? "").toUpperCase();
              const isEnergy = typeStr === "ENERGY" || typeStr === "1" || f.type === 1;
              const isBandwidth = typeStr === "BANDWIDTH" || typeStr === "0" || f.type === 0 || !f.type;
              if (isEnergy) {
                currentEnergyStakeTrob += trobAmount;
              } else if (isBandwidth) {
                currentBandwidthStakeTrob += trobAmount;
              }
            }
          }
          if (Array.isArray(raw.votes)) {
            currentSrVoted = raw.votes.some((v: any) => {
              const rawV = (v.vote_address || "").trim().toLowerCase();
              const hexV = toTronHex(v.vote_address || "");
              return (
                rawV === OFFICIAL_SR_MAINNET_HEX ||
                rawV === OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
                hexV === OFFICIAL_SR_MAINNET_HEX
              );
            });
          }
        }
      }
    } catch (expErr) {
      console.warn("[MatrixEligibility] Explorer account lookup notice:", expErr);
    }

    // 2. Query FullNode RPC for live blockchain state
    try {
      const hexAddress = toTronHex(rawAddress);
      const acctRes = await fetchWithTimeout(`${fullnodeRpc}/wallet/getaccount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: hexAddress }),
        cache: "no-store",
      }, 5000);

      if (acctRes.ok) {
        const acctData = (await acctRes.json()) as any;
        if (acctData && acctData.create_time) {
          let ct = Number(acctData.create_time);
          if (ct < 10000000000) ct *= 1000;
          if (!creationTimestamp || ct < creationTimestamp) {
            creationTimestamp = ct;
          }
        }

        // Live On-Chain Freeze V2 (Stake 2.0)
        if (Array.isArray(acctData.frozenV2)) {
          let fnEnergy = 0;
          let fnBandwidth = 0;
          for (const f of acctData.frozenV2) {
            const amountSun = Number(f.amount || 0);
            const trobAmount = Math.floor(amountSun / 1_000_000);
            const typeStr = String(f.type ?? "").toUpperCase();
            const isEnergy = typeStr === "ENERGY" || typeStr === "1" || f.type === 1;
            const isBandwidth = typeStr === "BANDWIDTH" || typeStr === "0" || f.type === 0 || !f.type;
            if (isEnergy) {
              fnEnergy += trobAmount;
            } else if (isBandwidth) {
              fnBandwidth += trobAmount;
            }
          }
          if (fnEnergy > currentEnergyStakeTrob) currentEnergyStakeTrob = fnEnergy;
          if (fnBandwidth > currentBandwidthStakeTrob) currentBandwidthStakeTrob = fnBandwidth;
        }

        // Legacy Freeze 1.0
        if (Array.isArray(acctData.frozen)) {
          const sumFrozen = acctData.frozen.reduce(
            (acc: number, f: any) => acc + Number(f.frozen_balance || 0),
            0
          );
          const legacyBandwidth = Math.floor(sumFrozen / 1_000_000);
          if (legacyBandwidth > currentBandwidthStakeTrob) currentBandwidthStakeTrob = legacyBandwidth;
        }
        if (acctData.account_resource?.frozen_balance_for_energy?.frozen_balance) {
          const legacyEnergy = Math.floor(
            Number(acctData.account_resource.frozen_balance_for_energy.frozen_balance) / 1_000_000
          );
          if (legacyEnergy > currentEnergyStakeTrob) currentEnergyStakeTrob = legacyEnergy;
        }

        // Live On-Chain SR Votes
        if (Array.isArray(acctData.votes) && !currentSrVoted) {
          currentSrVoted = acctData.votes.some((v: any) => {
            const rawV = (v.vote_address || "").trim().toLowerCase();
            const hexV = toTronHex(v.vote_address || "");
            return (
              rawV === OFFICIAL_SR_MAINNET_HEX ||
              rawV === OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
              hexV === OFFICIAL_SR_MAINNET_HEX
            );
          });
        }
      }
    } catch (rpcErr: any) {
      console.warn("[MatrixEligibility] FullNode RPC getaccount lookup notice:", rpcErr?.message || rpcErr);
    }

    // 3. Fallback: check earliest on-chain transaction timestamp if create_time not returned
    if (!creationTimestamp) {
      try {
        const txRes = await fetchWithTimeout(`${explorerApi}/accounts/${rawAddress}/transactions?limit=100`, {
          cache: "no-store",
        }, 2500);
        if (txRes.ok) {
          const txData = await txRes.json();
          const list = (txData.data || []) as any[];
          if (list.length > 0) {
            let earliest = Infinity;
            for (const t of list) {
              const ts = t.timestamp ? new Date(t.timestamp).getTime() : Infinity;
              if (ts < earliest) earliest = ts;
            }
            if (earliest !== Infinity) {
              creationTimestamp = earliest;
            }
          }
        }
      } catch {}
    }

    // 4. Fallback for newly generated unactivated test accounts
    if (!creationTimestamp) {
      creationTimestamp = Date.now();
    }

    // Validate Condition 1: Must be created on or after 1 October 2026
    if (creationTimestamp < MIN_WALLET_CREATION_TIMESTAMP) {
      condition1Passed = false;
      condition1Reason = "Eligible wallet must be created on or after 1 October 2026.";
    } else {
      condition1Passed = true;
    }

    // Dynamic Calculation Formulas for Matrix (from Equora_Fi Deposit Logics PDF):
    // Target Free Transactions/day: 5
    // Current contract resource consumption: 46,009 Energy / tx, 378 Bandwidth / tx
    // Current resource generated per staked TROB: 2,150 Energy / TROB, 80 Bandwidth / TROB
    const TARGET_TX_PER_DAY = 5;
    const CURRENT_ENERGY_PER_TX = 46009;
    const CURRENT_BANDWIDTH_PER_TX = 378;
    const ENERGY_PER_TROB = 2150;
    const BANDWIDTH_PER_TROB = 80;

    const REQUIRED_DAILY_ENERGY = TARGET_TX_PER_DAY * CURRENT_ENERGY_PER_TX; // 230,045
    const REQUIRED_DAILY_BANDWIDTH = TARGET_TX_PER_DAY * CURRENT_BANDWIDTH_PER_TX; // 1,890

    const REQUIRED_ENERGY_TROB = Math.ceil(REQUIRED_DAILY_ENERGY / ENERGY_PER_TROB); // 107 TROB
    const REQUIRED_BANDWIDTH_TROB = Math.ceil(REQUIRED_DAILY_BANDWIDTH / BANDWIDTH_PER_TROB); // 24 TROB

    const energyPassed = currentEnergyStakeTrob >= REQUIRED_ENERGY_TROB;
    const bandwidthPassed = currentBandwidthStakeTrob >= REQUIRED_BANDWIDTH_TROB;
    const srVotePassed = currentSrVoted;

    const missingReqs: string[] = [];
    if (!energyPassed) {
      missingReqs.push(
        `Stake ${REQUIRED_ENERGY_TROB.toLocaleString()} TROB for Energy (currently: ${currentEnergyStakeTrob.toLocaleString()} TROB)`
      );
    }
    if (!bandwidthPassed) {
      missingReqs.push(
        `Stake ${REQUIRED_BANDWIDTH_TROB.toLocaleString()} TROB for Bandwidth (currently: ${currentBandwidthStakeTrob.toLocaleString()} TROB)`
      );
    }
    if (!srVotePassed) {
      missingReqs.push(`Cast vote for Official Equora_Fi SR: ${officialSrB58}`);
    }

    const condition2Passed = energyPassed && bandwidthPassed && srVotePassed;
    const eligibleToDeposit = condition1Passed && condition2Passed;

    let statusText = "✓ Eligible to Deposit";
    if (!condition1Passed) {
      statusText = `Deposit Blocked: ${condition1Reason}`;
    } else if (!condition2Passed) {
      statusText = `Deposit Blocked: ${missingReqs.join(" • ")}`;
    }

    const result = {
      address: rawAddress,
      canonicalAddress: canonical,
      condition1: {
        passed: condition1Passed,
        creationTimestamp,
        creationDate: creationTimestamp ? new Date(creationTimestamp).toISOString() : null,
        minRequiredDate: "01-10-2026",
        reason: condition1Reason,
      },
      condition2: {
        passed: condition2Passed,
        energy: {
          stakedTrob: currentEnergyStakeTrob,
          requiredTrob: REQUIRED_ENERGY_TROB,
          passed: energyPassed,
        },
        bandwidth: {
          stakedTrob: currentBandwidthStakeTrob,
          requiredTrob: REQUIRED_BANDWIDTH_TROB,
          passed: bandwidthPassed,
        },
        srVote: {
          voted: currentSrVoted,
          officialSrAddress: officialSrB58,
          passed: srVotePassed,
        },
        missingRequirements: missingReqs,
      },
      formula: {
        matrix: {
          targetTxPerDay: TARGET_TX_PER_DAY,
          energyPerTx: CURRENT_ENERGY_PER_TX,
          bandwidthPerTx: CURRENT_BANDWIDTH_PER_TX,
          dailyEnergyRequired: REQUIRED_DAILY_ENERGY,
          dailyBandwidthRequired: REQUIRED_DAILY_BANDWIDTH,
          energyPerTrob: ENERGY_PER_TROB,
          bandwidthPerTrob: BANDWIDTH_PER_TROB,
          energyStakeTrob: REQUIRED_ENERGY_TROB,
          bandwidthStakeTrob: REQUIRED_BANDWIDTH_TROB,
        },
      },
      eligibleToDeposit,
      status: statusText,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to check eligibility";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
