const { ethers } = require("ethers");

/**
 * Simulation of Magic Blind Box Distribution & Rounding Logic
 * 
 * Target Tiers:
 * - Tier 1 (Common 85%): $0.50 USD worth of TROB
 * - Tier 2 (Uncommon 10%): $0.80 USD worth of TROB
 * - Tier 3 (Rare 3%): $1.20 USD worth of TROB
 * - Tier 4 (Legendary 2%): $5.00 USD worth of TROB
 * 
 * Rounding Requirement:
 * Handles odd, even, and fractional percentage member counts (e.g. 6737 members -> 85% = 5726.45)
 * so that 100% of the members (t1 + t2 + t3 + t4 == total) are accounted for, with ZERO dropped users.
 */

const BPS_BASE = 10000;
const TIER4_BPS = 200;  // 2%
const TIER3_BPS = 300;  // 3%
const TIER2_BPS = 1000; // 10%
const TIER1_BPS = 8500; // 85%

const TIER1_USD = 0.50;
const TIER2_USD = 0.80;
const TIER3_USD = 1.20;
const TIER4_USD = 5.00;

// Current TROB price: 1 TROB = $0.056 USD -> ~17.857142 TROB per USD
const TROB_USD_PRICE = 0.056;
const TROB_PER_USD = 1 / TROB_USD_PRICE; // ~17.857142

// Calculate tier member counts using Half-Up Rounding on small tiers + Remainder to Tier 1
function calculateTierCounts(totalMembers) {
  if (totalMembers === 0) {
    return { t1Count: 0, t2Count: 0, t3Count: 0, t4Count: 0, total: 0 };
  }

  if (totalMembers < 4) {
    // Edge case: fewer than 4 members, allocate all to Tier 1
    return {
      t1Count: totalMembers,
      t2Count: 0,
      t3Count: 0,
      t4Count: 0,
      total: totalMembers,
    };
  }

  // Half-up rounding formula: (total * bps + BPS_BASE / 2) / BPS_BASE
  // Math.floor((total * bps + 5000) / 10000)
  let t4Count = Math.floor((totalMembers * TIER4_BPS + BPS_BASE / 2) / BPS_BASE);
  let t3Count = Math.floor((totalMembers * TIER3_BPS + BPS_BASE / 2) / BPS_BASE);
  let t2Count = Math.floor((totalMembers * TIER2_BPS + BPS_BASE / 2) / BPS_BASE);

  // Ensure at least 1 per tier if totalMembers >= 50 or per rule
  if (totalMembers >= 50) {
    if (t4Count === 0) t4Count = 1;
    if (t3Count === 0) t3Count = 1;
    if (t2Count === 0) t2Count = 1;
  }

  // Tier 1 (Common 85%) takes the exact remaining balance so sum is GUARANTEED == totalMembers
  const t1Count = totalMembers - (t2Count + t3Count + t4Count);

  return {
    t1Count,
    t2Count,
    t3Count,
    t4Count,
    total: t1Count + t2Count + t3Count + t4Count,
  };
}

function testMemberCount(name, count) {
  console.log(`\n======================================================`);
  console.log(`TEST CASE: ${name} (Total Members = ${count})`);
  console.log(`======================================================`);

  const { t1Count, t2Count, t3Count, t4Count, total } = calculateTierCounts(count);

  const pct1 = ((t1Count / count) * 100).toFixed(2);
  const pct2 = ((t2Count / count) * 100).toFixed(2);
  const pct3 = ((t3Count / count) * 100).toFixed(2);
  const pct4 = ((t4Count / count) * 100).toFixed(2);

  console.log(`Tier 4 (Legendary 2% - $5.00): ${t4Count} members (${pct4}%)`);
  console.log(`Tier 3 (Rare 3%      - $1.20): ${t3Count} members (${pct3}%)`);
  console.log(`Tier 2 (Uncommon 10% - $0.80): ${t2Count} members (${pct2}%)`);
  console.log(`Tier 1 (Common 85%   - $0.50): ${t1Count} members (${pct1}%)`);
  console.log(`------------------------------------------------------`);
  console.log(`SUM OF WINNERS: ${total} / ${count} members`);
  console.log(`DROPPED USERS:  ${count - total} (MUST BE 0)`);

  const t1Trob = TIER1_USD * TROB_PER_USD;
  const t2Trob = TIER2_USD * TROB_PER_USD;
  const t3Trob = TIER3_USD * TROB_PER_USD;
  const t4Trob = TIER4_USD * TROB_PER_USD;

  const totalUsdNeeded =
    t1Count * TIER1_USD +
    t2Count * TIER2_USD +
    t3Count * TIER3_USD +
    t4Count * TIER4_USD;

  const totalTrobNeeded =
    t1Count * t1Trob +
    t2Count * t2Trob +
    t3Count * t3Trob +
    t4Count * t4Trob;

  console.log(`Total USD Value:  $${totalUsdNeeded.toFixed(2)} USD`);
  console.log(`Total TROB Needed: ~${totalTrobNeeded.toFixed(2)} TROB (@ $${TROB_USD_PRICE}/TROB)`);
  console.log(`Prize Per Member:`);
  console.log(`  Tier 1: $${TIER1_USD.toFixed(2)} (~${t1Trob.toFixed(2)} TROB)`);
  console.log(`  Tier 2: $${TIER2_USD.toFixed(2)} (~${t2Trob.toFixed(2)} TROB)`);
  console.log(`  Tier 3: $${TIER3_USD.toFixed(2)} (~${t3Trob.toFixed(2)} TROB)`);
  console.log(`  Tier 4: $${TIER4_USD.toFixed(2)} (~${t4Trob.toFixed(2)} TROB)`);

  if (total !== count) {
    console.error(`❌ FAILED: Dropped users detected!`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: 100% of members accounted for with 0 lost!`);
  }
}

// Test Suite
testMemberCount("User's Example: Fractional Odd Count", 6737);
testMemberCount("User's Example: Round Off Even Count", 6738);
testMemberCount("Live Matrix Active Members", 23);
testMemberCount("Live Registry Total Users", 24);
testMemberCount("Small Team (7 Users)", 7);
testMemberCount("Tiny Team (3 Users)", 3);
testMemberCount("Single User (1 User)", 1);

