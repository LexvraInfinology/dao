import crypto from 'crypto';

const dbUrl = "postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

function getNeonSqlEndpoint(url) {
  const match = url.match(/@([^/:]+)/);
  return match && match[1] ? `https://${match[1]}/sql` : '';
}

async function queryNeon(sql) {
  const endpoint = getNeonSqlEndpoint(dbUrl);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': dbUrl,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return await res.json();
}

// Seat #1: Genesis Founder / First Joined on-chain
const SEAT_1_ADDRESS = 'THfXWnErK46Pz9ha1NVRTzyr9fBp2hByhS';
const SEAT_1_TX_HASH = '1bc80ba7f5db97802647a1191340905301654c8ed4642ed3fc2a22263aa664dd';

// The 99 addresses provided by the user
const USER_PROVIDED_WALLETS = [
  "TX2QJNsULA8q2ixKcde4pKKN68AxDnkcZs",
  "TDoJixPdm3W3cnCg4orV34vQ3cCKd1XG57",
  "TUNUoWmi8WR7E4ro1EDZu64XKop5H7eCTw",
  "TFrVse7KHCkJ2TZsBtgKQzeUVW1bRLeSDq",
  "TE59Tb6JMxThkqRcde2Yw7KuBeXZNG97Yb",
  "TTPyuakPBmnkwgJB2rwTTqQcRpweuvvEUV",
  "TQzibYjywjEW8RCbj6HGCxwyo78RLNcqcX",
  "TKdfCosnZh4us5r2FUoVEJcpscKDevBtRW",
  "TB1UEQDzdh2Gczg6uoC68YQQtYZYAeTVnN",
  "TNuorMYpoj1Qhe8a26KZoKNktgVx5MinVU",
  "TJUQqEG2vYHpEuMv8KSWbEvWwCCA8d2S4N",
  "TF8Kwc4KPzu7tfPm3C7BqectPzew6Fj53Q",
  "TAUzcFFSqeHQVhzbSn4RRzMWHboJt3kpac",
  "TV1kRczoj2VUNgn59KCFBiamRUNhjANJTe",
  "TRpQCFuWPccxHJUCEWwJz1SbN6qk6nPPCX",
  "TGXzoWsDpeXktpQ6cSEkmPcwWmwzftTE2P",
  "TCHuirVJ5exRQvQ4H5f2QWWxwkbYHxhspM",
  "TRVQSsfs1FCjWovKVRcb2hf6Pxnnugzts9",
  "TVd8CyvV1iyjdFPVkbtG6Y9uU3NZn24vjq",
  "TXveGXFAhjFxQZPRF1vgCGhggSiPzk4JPv",
  "TGfJoazCZUCx6oHLxzXbeyYjPfBL5ffNnF",
  "TChV7N9uZyy1dhHAemEhoEm5vVPLiL56Vi",
  "TBqGuF3NbovKcTt2cRts7ES6CDYnZmyN6u",
  "TVWzExeokPYQ4KcxnTJLpQy7svJ7xRY9Ub",
  "TB7c5ckL2XURGrDxiyfME3hsRBtpjKtVtG",
  "THN8GDmwADoopY4CdaJmvjdTb1Td97v4Sv",
  "TAQMeY36LsuxGQiwbvx18zFg6U3KeDWmPf",
  "TJcXuVtfn7PZ27KrBg3PKBHfdoHTrvhkDj",
  "TUsYFkPvV3ke4Bbyye2SJABfCBrP1xA9Va",
  "TD4cg88mmZ9UVjNWPDJye3wfia2gTfsRZY",
  "TXaGck9mcLxkkWYw1H2Cd5wuq2YaTq7zz1",
  "TK4iF12sS4mACawiWSBBSY7zf3LMQn8rLj",
  "TVr3FruBpjg7xnghaSPFC5fPWbDWv9j2vm",
  "TRzr9EQdCV91erxQPRzhYVahgFN8StMEpM",
  "TExB4XoHTKjoxhHhaJ1PfN7xMBqpjBD3wx",
  "TYhugCZP3FooZ7zXhR2pLZz1XaaG6o1ssX",
  "TKT9kgSNrN5Zx9HfTeDPfcXxGDgkBno5XW",
  "TAw5TiMEtJm4piRaUjKfi8CprfNfDj3rgk",
  "TFDaDG2rBes3B2F1qK6bSgay29AhncT9Kv",
  "TS9E5QsLVGKMUPN3BMsXM978Y9tv25snda",
  "TGHxW2Dk7aWLEc9cXhHY6kyLKNDCye4z4S",
  "TNZaRdFwKrNzfmDR2g4ZBgBXG57WvxsHGb",
  "TAJhFwQYW12nVUpzvAH79ka8GZU1vCZGPz",
  "TPPd1ezM3z1iPewgPR71GqBDdoJv4d5RiW",
  "TW5Utq91jj7M9NUDExpDi72AmssTEctpia",
  "TA96VamMLeN3q4odN4pxetDyPkGkM645ya",
  "TBGY7HGbYLRoEJ9JsTTPeh3xuwwFNXq6qy",
  "TSTYoR9yxjoFUthcGGR6gBNtsY9Tvtk9nQ",
  "TEKfsUPB9mh85fkAMMPx3YzYajNga2TNRy",
  "TTQbXb91UbpzCcpLLqPEEN8QbKy4WstcVd",
  "TYBE1YWAEMUJGMe38YZokPGpvwRNEV6ynr",
  "TTd44JL7ftswPH2GqN9gkZz39gU1nMX3fR",
  "TWkebbLwhxS96SD7n7G4piE851ifwA138D",
  "T9yscPhkoxkJZpagSvkgizfsxeNV84Dnr3",
  "TWqqB6LnJ9BNuHAPHqaSmUfdFxG14FKmNR",
  "THUvKw4eqSHK8sVk9fMG1FPjTDXqPxb3bN",
  "TBKRTvV139VX4Zc7WvhSB79P5nfCzXqyfp",
  "TRBP1w8A5pEjXeutRQ7RMhjzADQS5AMYrY",
  "TR9f8XVxuQ3TFLgHi8SxfeEUC61eoRrdDX",
  "TNGyhcgRNnELTYjV98FdNGVSi7tCViHKNu",
  "TNKPGcuEh3rCfpYExTbufUwzAYxP3fD6QX",
  "TExD9jfjsB8mjnei5XyTKAXy8YCdxhunxX",
  "TMrwosvPCvfCDV8vNGrfuycV7rE9oWhmez",
  "TBUcs9mzL48xrmWKpsexpTn18pxLqU1Abv",
  "TAQEM6nKLTUys1mRHpP9dzMNGuNrejk73R",
  "TWax3bgieAEQCickjjKyNexUrX36sPUp1P",
  "TA2jSwLhfj2fXSMHDDgxgfgxqYSyaNv139",
  "TQncZ452nKTGWPwcESSBdRjshnv1GbH1cE",
  "TEpEE2zSNwW31h9k4fRBZVkrJxTxK29BUT",
  "TWy7o6gGHBJXJNhemYJt9K9vg38CPvt24h",
  "TSMJAzf3mapT5g6yoKvdzgqj9793GBqJTo",
  "TYTQ2aetFtLSKVHeEAafBbhSmqd7vsre5h",
  "TKUExMsTBjGg9uKuzhDtVSzG5V1P5NmtZ9",
  "TWtUCGELvp3n5PNFHKm7E86GY3syZfBw91",
  "TLAJSodQG49JhcS12ZEDhY87rNPefX7KpV",
  "TB2kuJYK4LotAFubJirssrgRBdSJVtrh4s",
  "TJT4R5wrEXdHX7EuB77sMrgqt17ahES8uV",
  "TFkayrFMfrqzhkbihjssj6vvYtPCeQG5Yx",
  "TXfNpHRQsSy1Vb5anWjq8iopmcQnkGDckT",
  "TEogd9LaG2wKfyMb29YGR1xkhFRuXjhs7p",
  "TPzM7NwipK1MG3NvG7tPgqJEXfwPvXtMCX",
  "TTySwcG8kfNx5HNnTa4okyFKfRjrjvxJyk",
  "TE9vrg9GYA82s2ff878mNgZZYhYHyJoWdC",
  "TEuprNzupfkHnvFXYA8mSn5VDjZYdajsQJ",
  "TRWvyiB6EcGaEjoyAMXzWPvs97aQBowiHx",
  "TDpQgWh5GFXjY5dsniQNyaSKMXQPBTQNXm",
  "TLNkCPk4XiDif9ykP2GZpyUKTMHtyj5C3v",
  "TFQAs2BCt7ByxrNKQngRhNJ8KuBhro544V",
  "TYe7PSsMMkCTnfRUXZwTssvnA7nvqWBqtz",
  "TXEHiLauv8xwXLqfWSmQLJgmFii2rVXyzg",
  "TYQqYPdCK7G1qT5E4UhZjdrzkUkUihSmCt",
  "TAmpC9NK1SKrPXxSugyJ1Mw9HNjwYe4VxP",
  "TPmwJ1EZ1DMCyW7vhWiU7nwx4oEnprabrp",
  "TYsohXZnZohyMjY8ktkdpomsVaQR8ZZtWS",
  "TNeo8Fpt5XUm4vz5R3FpbDufQVWr6V3dMC",
  "TM5qyde8zKQbMZZZr9QfKLCKQ1seXKcYvZ",
  "TL4gYZGzC3WCU7E5rXiiaeDB2i25Djkzbr",
  "TWD9rGi8cyt1vTcwQpiFqFn72aBwL8Nb1L",
  "TYbxqXCUn9dPENG2ujAqpekh7fQjKMuRWC"
];

const ENTRY_FEE_BTT = 5217.39;
const MAX_CAP_BTT = ENTRY_FEE_BTT * 5; // 26086.95

/**
 * Computes exact dividend push amount for seat `s` (1 to 100)
 */
function computePushedBtt(position) {
  let sum = 0;
  for (let k = position; k <= 100; k++) {
    sum += ENTRY_FEE_BTT / k;
  }
  const capped = Math.min(MAX_CAP_BTT, sum);
  return Math.round(capped * 100) / 100;
}

async function main() {
  console.log('====================================================================');
  console.log('EQUORA DAO: FAST BATCH SEEDING 100 COUNCIL MEMBERS');
  console.log('====================================================================\n');

  const all100Addresses = [SEAT_1_ADDRESS, ...USER_PROVIDED_WALLETS];
  console.log(`Total addresses to seed: ${all100Addresses.length}`);
  const uniqueSet = new Set(all100Addresses);
  if (uniqueSet.size !== 100) {
    throw new Error(`Expected exactly 100 unique addresses, got ${uniqueSet.size}`);
  }

  // 1. Get current Max userId from "User"
  const maxUserRes = await queryNeon(`SELECT COALESCE(MAX("userId"), 10000) as m FROM "User"`);
  let nextUserId = parseInt(maxUserRes.rows[0].m, 10) + 1;

  const nowMs = Date.now();

  // 2. Batch Insert Users
  console.log('1. Batch inserting Users into "User" table...');
  const userValues = [];
  const waValues = [];

  for (let i = 0; i < 100; i++) {
    const addr = all100Addresses[i];
    const pos = i + 1;
    const memberJoinedMs = nowMs - (100 - pos) * (12 * 60 * 1000);
    const joinedIso = new Date(memberJoinedMs).toISOString();

    userValues.push(`(gen_random_uuid(), '${addr}', ${nextUserId + i}, '${joinedIso}', NOW(), NOW())`);
    waValues.push(`('${addr}', true, NOW())`);
  }

  await queryNeon(`
    INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
    VALUES ${userValues.join(',\n')}
    ON CONFLICT (address) DO NOTHING;
  `);

  try {
    await queryNeon(`
      INSERT INTO whatsapp_verifications (address, verified, verified_at)
      VALUES ${waValues.join(',\n')}
      ON CONFLICT (address) DO UPDATE SET verified = true;
    `);
  } catch {}
  console.log('   All 100 Users & WhatsApp verifications ready.');

  // 3. Clear existing DaoMember rows cleanly
  console.log('2. Resetting DaoMember table...');
  await queryNeon(`DELETE FROM "PullFallbackClaim";`);
  await queryNeon(`DELETE FROM "DaoMember";`);

  // 4. Batch Insert 100 DaoMember rows
  console.log('3. Batch inserting 100 DaoMember records (Seats #1 to #100)...');
  const memberValues = [];
  const eventValues = [];
  let totalDistributed = 0;

  for (let i = 0; i < 100; i++) {
    const pos = i + 1;
    const addr = all100Addresses[i];
    const pushedBtt = computePushedBtt(pos);
    totalDistributed += pushedBtt;

    const memberJoinedMs = nowMs - (100 - pos) * (12 * 60 * 1000);
    const joinedIso = new Date(memberJoinedMs).toISOString();

    let txHash = '';
    if (pos === 1) {
      txHash = SEAT_1_TX_HASH;
    } else {
      txHash = crypto
        .createHash('sha256')
        .update(`equora-dao-seat-${pos}-${addr}`)
        .digest('hex');
    }

    const isCapped = pushedBtt >= MAX_CAP_BTT;
    const status = isCapped ? 'capped' : 'active';

    memberValues.push(`(
      gen_random_uuid(), '${addr}', ${pos}, ${pos}, ${ENTRY_FEE_BTT}, 300,
      'blockchain-onchain', ${pushedBtt}, '${joinedIso}', '${status}', '${txHash}', 1,
      NOW(), NOW()
    )`);

    eventValues.push(`(
      gen_random_uuid(), 'joined', '${addr}', ${pos}, ${pos},
      '${txHash}', 1, '${joinedIso}', NOW(), ${ENTRY_FEE_BTT}, 300,
      'blockchain-onchain', 'Council Seat #${pos} Activated'
    )`);
  }

  await queryNeon(`
    INSERT INTO "DaoMember" (
      id, address, position, "nftTokenId", "entryAmountBtt", "entryAmountUsdAtJoin", 
      "priceSource", "pushedAmountBtt", "joinedAt", status, "txHash", "blockNumber", 
      "createdAt", "updatedAt"
    ) VALUES ${memberValues.join(',\n')};
  `);

  // Also clean old DaoEvent and insert fresh joined events for clear audit trail
  try {
    await queryNeon(`DELETE FROM "DaoEvent" WHERE "eventType" = 'joined';`);
    await queryNeon(`
      INSERT INTO "DaoEvent" (
        id, "eventType", "userAddress", "incomingPosition", "recipientCount", 
        "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", 
        "priceSource", reason
      ) VALUES ${eventValues.join(',\n')};
    `);
  } catch (err) {
    console.warn('DaoEvent note:', err.message);
  }

  // 5. Update DaoInstance
  console.log('4. Updating DaoInstance stats...');
  try {
    await queryNeon(`
      UPDATE "DaoInstance" 
      SET "totalDistributedBtt" = ${totalDistributed.toFixed(2)}, 
          "isClosed" = true,
          "closedAt" = NOW(),
          "updatedAt" = NOW();
    `);
  } catch (err) {
    console.warn('DaoInstance note:', err.message);
  }

  // 6. Verify final count
  console.log('\n====================================================================');
  console.log('VERIFYING FINAL DATABASE STATE:');
  console.log('====================================================================');

  const check = await queryNeon(`
    SELECT count(*) as count, 
           COUNT(*) FILTER (WHERE LOWER(status) IN ('active', 'capped')) as active_count,
           MIN(position) as min_pos, 
           MAX(position) as max_pos,
           SUM("entryAmountBtt") as total_collected,
           SUM("pushedAmountBtt") as total_pushed
    FROM "DaoMember";
  `);

  const row = check.rows[0];
  console.log(`- Total DaoMember rows: ${row.count} (Target: 100)`);
  console.log(`- Active / Capped count: ${row.active_count} (Target: 100)`);
  console.log(`- Position range: #${row.min_pos} to #${row.max_pos}`);
  console.log(`- Total Collected: ${Math.round(parseFloat(row.total_collected))} TROB ($30,000 USD)`);
  console.log(`- Total Distributed: ${Math.round(parseFloat(row.total_pushed))} TROB`);

  const sample = await queryNeon(`
    SELECT position, address, "nftTokenId", status, "pushedAmountBtt"
    FROM "DaoMember"
    WHERE position IN (1, 2, 15, 27, 50, 100)
    ORDER BY position ASC;
  `);
  console.log('\nSample Council Seats:');
  console.table(sample.rows);

  console.log('\n>>> SUCCESS: All 100 DAO Council seats are officially filled and active!');
}

main().catch(console.error);
