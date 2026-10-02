import { queryNeon } from './neonDb';

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

const OFFICIAL_SR_MAINNET_HEX = '411779966a94d43d2c03ee4b15c4a86b599491f052'; // TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY
const OFFICIAL_SR_TESTNET_HEX = '415cc58ba778a87ac1ea060d4aa116509691fb0ae0'; // TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5
const OFFICIAL_SR_MAINNET_B58 = 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY';
const OFFICIAL_SR_TESTNET_B58 = 'TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5';
const MIN_WALLET_CREATION_TIMESTAMP = 1790812800000; // 01-10-2026

export async function checkServerlessEligibility(address: string) {
  const rawAddress = address.trim();
  const canonical = rawAddress.toLowerCase();

  let creationTimestamp: number | null = null;
  let condition1Passed = true;
  let condition1Reason: string | undefined;

  let currentEnergyStakeTrob = 0;
  let currentBandwidthStakeTrob = 0;
  let currentSrVoted = false;

  try {
    const hexAddress = toTronHex(rawAddress);
    const acctRes = await fetch('https://fullnode-one-testnet.trobchain.com/wallet/getaccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: hexAddress }),
      cache: 'no-store',
    });

    if (acctRes.ok) {
      const acctData = (await acctRes.json()) as any;
      if (acctData && acctData.create_time) {
        let ct = Number(acctData.create_time);
        if (ct < 10000000000) ct *= 1000; // convert seconds to ms if needed
        creationTimestamp = ct;
        if (creationTimestamp < MIN_WALLET_CREATION_TIMESTAMP) {
          condition1Passed = false;
          condition1Reason = 'Wallet was activated before 1 October 2026. Only wallets created on or after 1 October 2026 are eligible.';
        } else {
          condition1Passed = true;
        }
      }

      // Fallback: check earliest on-chain transaction timestamp if create_time not returned
      if (!creationTimestamp) {
        try {
          const txRes = await fetch(`https://testnet-backend.trobchain.com/v1/accounts/${rawAddress}/transactions?limit=100`, {
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
                if (creationTimestamp < MIN_WALLET_CREATION_TIMESTAMP) {
                  condition1Passed = false;
                  condition1Reason = 'Wallet was activated before 1 October 2026. Only wallets created on or after 1 October 2026 are eligible.';
                } else {
                  condition1Passed = true;
                }
              }
            }
          }
        } catch {}
      }

      // Live On-Chain Freeze V2 (Stake 2.0)
      if (Array.isArray(acctData.frozenV2)) {
        for (const f of acctData.frozenV2) {
          const amountSun = Number(f.amount || 0);
          const trobAmount = Math.floor(amountSun / 1_000_000);
          if (f.type === 'ENERGY') {
            currentEnergyStakeTrob += trobAmount;
          } else if (!f.type || f.type === 'BANDWIDTH') {
            currentBandwidthStakeTrob += trobAmount;
          }
        }
      }
      // Legacy Freeze 1.0
      if (Array.isArray(acctData.frozen)) {
        const sumFrozen = acctData.frozen.reduce(
          (acc: number, f: any) => acc + Number(f.frozen_balance || 0),
          0
        );
        currentBandwidthStakeTrob += Math.floor(sumFrozen / 1_000_000);
      }
      if (acctData.account_resource?.frozen_balance_for_energy?.frozen_balance) {
        currentEnergyStakeTrob += Math.floor(
          Number(acctData.account_resource.frozen_balance_for_energy.frozen_balance) / 1_000_000
        );
      }

      // Live On-Chain SR Votes
      if (Array.isArray(acctData.votes)) {
        currentSrVoted = acctData.votes.some((v: any) => {
          const vAddr = (v.vote_address || '').toLowerCase();
          return (
            vAddr === OFFICIAL_SR_MAINNET_HEX ||
            vAddr === OFFICIAL_SR_TESTNET_HEX ||
            vAddr === OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
            vAddr === OFFICIAL_SR_TESTNET_B58.toLowerCase()
          );
        });
      }
    }
  } catch (err) {
    console.warn('[Eligibility] Error querying on-chain trobchain node:', err);
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
  if (!srVotePassed) {
    missingReqs.push(`Cast vote for Official Equora_Fi SR: ${OFFICIAL_SR_TESTNET_B58}`);
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

  // If already in DaoMember table in Neon DB, bypass verification
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

  const eligibleToDeposit = condition1Passed && condition2Passed && waVerified;

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
        officialSrAddress: OFFICIAL_SR_TESTNET_B58,
        passed: srVotePassed,
      },
      missingRequirements: missingReqs,
    },
    whatsapp: {
      joined: waVerified,
      verifiedAt: waVerifiedAt,
    },
    eligibleToDeposit,
    status: eligibleToDeposit
      ? 'Eligible to Deposit'
      : !condition1Passed
      ? `Deposit Blocked: ${condition1Reason}`
      : !condition2Passed
      ? `Deposit Blocked: Condition 2 (${missingReqs.join('; ')})`
      : !waVerified
      ? 'Deposit Blocked: Official WhatsApp channel must be joined and verified.'
      : 'Deposit Criteria Met',
  };
}
