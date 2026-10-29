import { queryNeon } from './neonDb';
import {
  FULLNODE_RPC_URL,
  EXPLORER_API_URL,
  OFFICIAL_SR_TESTNET,
  OFFICIAL_SR_MAINNET,
  IS_MAINNET,
} from '@/config/env';

const B58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function base58ToHex(b58: string): string {
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
  for (let i = 0; i < b58.length && b58[i] === '1'; i++) bytes.push(0);
  const buf = Buffer.from(bytes.reverse());
  return buf.subarray(0, buf.length - 4).toString('hex');
}

export function toTronHex(address: string): string {
  const clean = address.trim();
  if (clean.startsWith('T') && clean.length === 34) {
    return base58ToHex(clean).toLowerCase();
  }
  if (clean.startsWith('0x')) {
    return ('41' + clean.slice(2)).toLowerCase();
  }
  return clean.toLowerCase();
}

const OFFICIAL_SR_MAINNET_B58 = OFFICIAL_SR_MAINNET;
const OFFICIAL_SR_TESTNET_B58 = OFFICIAL_SR_TESTNET;
const OFFICIAL_SR_MAINNET_HEX = toTronHex(OFFICIAL_SR_MAINNET_B58);
const OFFICIAL_SR_TESTNET_HEX = toTronHex(OFFICIAL_SR_TESTNET_B58);
const MIN_WALLET_CREATION_TIMESTAMP = 1790812800000; // 01-10-2026

export async function checkServerlessEligibility(address: string, deviceFingerprint?: string | null) {
  const rawAddress = address.trim();
  const canonical = rawAddress.toLowerCase();

  let creationTimestamp: number | null = null;
  let condition1Passed = true;
  let condition1Reason: string | undefined;

  let currentEnergyStakeTrob = 0;
  let currentBandwidthStakeTrob = 0;
  let currentSrVoted = false;

  try {
    // 1. Query Explorer Account API for true activation date and on-chain raw state
    try {
      const expRes = await fetch(`${EXPLORER_API_URL}/accounts/${rawAddress}`, {
        cache: 'no-store',
      });
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
              const typeStr = String(f.type ?? '').toUpperCase();
              const isEnergy = typeStr === 'ENERGY' || typeStr === '1' || f.type === 1;
              const isBandwidth = typeStr === 'BANDWIDTH' || typeStr === '0' || f.type === 0 || !f.type;
              if (isEnergy) {
                currentEnergyStakeTrob += trobAmount;
              } else if (isBandwidth) {
                currentBandwidthStakeTrob += trobAmount;
              }
            }
          }
          if (Array.isArray(raw.votes)) {
            currentSrVoted = raw.votes.some((v: any) => {
              const rawV = (v.vote_address || '').trim().toLowerCase();
              const hexV = toTronHex(v.vote_address || '');
              return (
                rawV === OFFICIAL_SR_MAINNET_HEX ||
                rawV === OFFICIAL_SR_TESTNET_HEX ||
                rawV === OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
                rawV === OFFICIAL_SR_TESTNET_B58.toLowerCase() ||
                hexV === OFFICIAL_SR_MAINNET_HEX ||
                hexV === OFFICIAL_SR_TESTNET_HEX
              );
            });
          }
        }
      }
    } catch (expErr) {
      console.warn('[Eligibility] Explorer account lookup notice:', expErr);
    }

    // 2. Query FullNode RPC for live blockchain state
    const hexAddress = toTronHex(rawAddress);
    const acctRes = await fetch(`${FULLNODE_RPC_URL}/wallet/getaccount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: hexAddress }),
      cache: 'no-store',
    });

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
          const typeStr = String(f.type ?? '').toUpperCase();
          const isEnergy = typeStr === 'ENERGY' || typeStr === '1' || f.type === 1;
          const isBandwidth = typeStr === 'BANDWIDTH' || typeStr === '0' || f.type === 0 || !f.type;
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
          const rawV = (v.vote_address || '').trim().toLowerCase();
          const hexV = toTronHex(v.vote_address || '');
          return (
            rawV === OFFICIAL_SR_MAINNET_HEX ||
            rawV === OFFICIAL_SR_TESTNET_HEX ||
            rawV === OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
            rawV === OFFICIAL_SR_TESTNET_B58.toLowerCase() ||
            hexV === OFFICIAL_SR_MAINNET_HEX ||
            hexV === OFFICIAL_SR_TESTNET_HEX
          );
        });
      }
    }

    // 3. Fallback: check earliest on-chain transaction timestamp if create_time not returned
    if (!creationTimestamp) {
      try {
        const txRes = await fetch(`${EXPLORER_API_URL}/accounts/${rawAddress}/transactions?limit=100`, {
          cache: 'no-store',
        });
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

    // 4. Fallback for newly generated wallets: default to current activation timestamp
    if (!creationTimestamp) {
      creationTimestamp = Date.now();
    }

    if (creationTimestamp < MIN_WALLET_CREATION_TIMESTAMP) {
      condition1Passed = false;
      condition1Reason = 'Wallet was activated before 1 October 2026. Only wallets created on or after 1 October 2026 are eligible.';
    } else {
      condition1Passed = true;
    }
  } catch (err) {
    console.warn('[Eligibility] Error querying on-chain trobchain node:', err);
    if (!creationTimestamp) creationTimestamp = Date.now();
    condition1Passed = true;
  }

  const REQUIRED_ENERGY_TROB = 1070;
  const REQUIRED_BANDWIDTH_TROB = 237;

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
  const activeSrB58 = FULLNODE_RPC_URL.includes('fullnode-one.trobchain.com') ? OFFICIAL_SR_MAINNET_B58 : OFFICIAL_SR_TESTNET_B58;
  if (!srVotePassed) {
    missingReqs.push(`Cast vote for Official Equora_Fi SR: ${activeSrB58}`);
  }

  const condition2Passed = energyPassed && bandwidthPassed && srVotePassed;

  // Check WhatsApp Verification from Neon DB
  let waVerified = false;
  let waVerifiedAt: string | null = null;
  try {
    const waRes = await queryNeon(
      `SELECT verified, verified_at FROM whatsapp_verifications WHERE LOWER(address) = LOWER($1)`,
      [canonical]
    );
    if (waRes.rows.length > 0 && waRes.rows[0].verified) {
      waVerified = true;
      waVerifiedAt = waRes.rows[0].verified_at;
    }
  } catch {}

  // Member verification check
  if (IS_MAINNET) {
    try {
      const memberRes = await queryNeon(
        `SELECT "address", "status" FROM "DaoMember" WHERE LOWER("address") = LOWER($1)`,
        [canonical]
      );
      if (memberRes.rows.length > 0) {
        waVerified = true;
        if (!waVerifiedAt) waVerifiedAt = new Date().toISOString();
      }
    } catch {}
  } else {
    try {
      const { getAndSyncMemberState } = await import('./onChainMemberSync');
      const synced = await getAndSyncMemberState(canonical);
      if (synced.isMember) {
        waVerified = true;
        if (!waVerifiedAt) waVerifiedAt = new Date().toISOString();
      }
    } catch {}
  }

  // Anti-Sybil: Strictly 1 DAO Seat per Physical Device & 1 DAO Seat per Wallet
  const deviceRestriction: {
    hasClaimed: boolean;
    claimedSeat?: number;
    claimedAddress?: string;
    reason?: string;
  } = { hasClaimed: false };

  // 1. Device Hardware Fingerprint validation (Mainnet only)
  if (IS_MAINNET && deviceFingerprint && deviceFingerprint.trim().length > 3) {
    try {
      const devRes = await queryNeon<any>(
        `SELECT position, address FROM "DaoMember"
         WHERE "deviceFingerprint" = $1 AND LOWER(status) IN ('active', 'capped')
         LIMIT 1`,
        [deviceFingerprint.trim()]
      );
      if (devRes.rows.length > 0) {
        const row = devRes.rows[0];
        deviceRestriction.hasClaimed = true;
        deviceRestriction.claimedSeat = row.position;
        deviceRestriction.claimedAddress = row.address;
        deviceRestriction.reason = `This physical device has already claimed Council Seat #${row.position} (${row.address}). Strictly 1 seat per physical device is permitted.`;
      }
    } catch (err) {
      console.warn('[Eligibility] Device fingerprint check error:', err);
    }
  }

  // 2. Wallet Address validation: Check if wallet already has an active or capped seat
  let walletAlreadyHasSeat = false;
  let ownedSeatNumber: number | null = null;
  if (IS_MAINNET) {
    try {
      const walletRes = await queryNeon<any>(
        `SELECT position, address FROM "DaoMember"
         WHERE LOWER(address) = LOWER($1) AND LOWER(status) IN ('active', 'capped')
         LIMIT 1`,
        [canonical]
      );
      if (walletRes.rows.length > 0) {
        walletAlreadyHasSeat = true;
        ownedSeatNumber = walletRes.rows[0].position;
      }
    } catch (err) {
      console.warn('[Eligibility] Wallet seat check error:', err);
    }
  } else {
    try {
      const { getOnChainMemberPosition } = await import('./txVerifier');
      const { getActiveDaoAddress } = await import('@/utils/trobAddress');
      const onChainPos = await getOnChainMemberPosition(canonical, getActiveDaoAddress());
      if (onChainPos > 0) {
        walletAlreadyHasSeat = true;
        ownedSeatNumber = onChainPos;
      }
    } catch {}
  }

  // Protocol condition gating bypassed as requested: allow any wallet without an active seat to deposit
  const eligibleToDeposit = !walletAlreadyHasSeat;

  return {
    address: rawAddress,
    canonicalAddress: canonical,
    condition1: {
      passed: condition1Passed,
      creationTimestamp,
      creationDate: creationTimestamp ? new Date(creationTimestamp).toISOString() : null,
      minRequiredDate: '01-10-2026',
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
        officialSrAddress: FULLNODE_RPC_URL.includes('fullnode-one.trobchain.com') ? OFFICIAL_SR_MAINNET_B58 : OFFICIAL_SR_TESTNET_B58,
        passed: srVotePassed,
      },
      missingRequirements: missingReqs,
    },
    whatsapp: {
      joined: waVerified,
      verifiedAt: waVerifiedAt,
    },
    deviceRestriction,
    walletAlreadyHasSeat,
    ownedSeatNumber,
    eligibleToDeposit,
    status: eligibleToDeposit
      ? 'Eligible to Deposit'
      : walletAlreadyHasSeat
      ? `Deposit Blocked: This wallet already owns Council Seat #${ownedSeatNumber}. Strictly 1 seat per wallet is permitted.`
      : 'Deposit Criteria Met',
  };
}
