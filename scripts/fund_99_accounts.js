/**
 * Equora Protocol — Batch Funding Script
 * 
 * Funds 99 accounts with 7,000 TROB each from:
 * Sender: TKRWSwmKSpLB85V26MPEWbwCWqXR9aPzNf (4167b282b09c3aac1b9fbff6b4ec14ea2b72573c02)
 *
 * Usage:
 *   node scripts/fund_99_accounts.js <SENDER_PRIVATE_KEY>
 * Or:
 *   $env:SENDER_PRIVATE_KEY="<PRIVATE_KEY>"; node scripts/fund_99_accounts.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// Import ethers from apps/web-dao dependencies
let ethers;
try {
  ethers = require('../apps/web-dao/node_modules/ethers').ethers;
} catch {
  try {
    ethers = require('ethers').ethers || require('ethers');
  } catch {
    console.error('Error: ethers package required. Please run from repository root.');
    process.exit(1);
  }
}

const FULLNODE_URL = process.env.RPC_URL || 'https://fullnode-one-testnet.trobchain.com';
const EXPECTED_SENDER_BASE58 = 'TKRWSwmKSpLB85V26MPEWbwCWqXR9aPzNf';
const EXPECTED_SENDER_HEX = '4167b282b09c3aac1b9fbff6b4ec14ea2b72573c02';
const AMOUNT_PER_ACCOUNT_TROB = 7000;
const AMOUNT_PER_ACCOUNT_SUN = AMOUNT_PER_ACCOUNT_TROB * 1_000_000; // 7,000,000,000 SUN

// The 99 Target Recipient Accounts
const RECIPIENT_ACCOUNTS = [
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

// Base58 / Tron Hex conversion utilities
const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58ToHex(b58) {
  let num = 0n;
  for (const char of b58.trim()) {
    const idx = B58_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error(`Invalid Base58 char: ${char}`);
    num = num * 58n + BigInt(idx);
  }
  let hex = num.toString(16);
  if (hex.length % 2 !== 0) hex = '0' + hex;
  const buffer = Buffer.from(hex, 'hex');
  return buffer.slice(0, 21).toString('hex').toLowerCase();
}

function hexToBase58(hex) {
  const bytes = Buffer.from(hex, 'hex');
  const hash = crypto.createHash('sha256').update(crypto.createHash('sha256').update(bytes).digest()).digest();
  const check = hash.slice(0, 4);
  const total = Buffer.concat([bytes, check]);
  let num = BigInt('0x' + total.toString('hex'));
  let s = '';
  while (num > 0n) {
    const rem = num % 58n;
    num = num / 58n;
    s = B58_ALPHABET[Number(rem)] + s;
  }
  return s;
}

// Prompt helper for interactive key entry
function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(query, (ans) => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
  console.log('================================================================');
  console.log('  EQUORA PROTOCOL — BATCH ACCOUNT FUNDING (99 ACCOUNTS)        ');
  console.log('================================================================\n');

  // 1. Get private key from args, env, or .env files
  let privateKey = process.argv[2] || process.env.SENDER_PRIVATE_KEY;
  if (!privateKey) {
    const envPaths = ['.env', 'apps/web-dao/.env.local', 'packages/hardhat/.env'];
    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const lines = fs.readFileSync(p, 'utf8').split('\n');
        for (const line of lines) {
          const match = line.match(/^\s*SENDER_PRIVATE_KEY\s*=\s*["']?([a-fA-F0-9]{64})["']?/);
          if (match) {
            privateKey = match[1];
            break;
          }
        }
      }
      if (privateKey) break;
    }
  }

  if (!privateKey) {
    privateKey = await askQuestion('Please enter the private key for TKRWSwmKSpLB85V26MPEWbwCWqXR9aPzNf:\n> ');
  }

  if (!privateKey) {
    console.error('Error: Private key is required to sign transactions.');
    process.exit(1);
  }

  // Clean private key prefix
  if (privateKey.startsWith('0x')) privateKey = privateKey.slice(2);
  const formattedKey = '0x' + privateKey;

  // 2. Validate derived address
  const signingKey = new ethers.SigningKey(formattedKey);
  const ethAddress = ethers.computeAddress(formattedKey);
  const derivedHex = '41' + ethAddress.slice(2).toLowerCase();
  const derivedBase58 = hexToBase58(derivedHex);

  console.log(`- Connected Sender: ${derivedBase58} (${derivedHex})`);
  if (derivedBase58 !== EXPECTED_SENDER_BASE58) {
    console.warn(`[!] Warning: Derived address ${derivedBase58} differs from target sender ${EXPECTED_SENDER_BASE58}`);
  }

  // 3. Query current balance
  console.log(`- Querying real-time balance on Trobchain Testnet...`);
  const accRes = await (await fetch(`${FULLNODE_URL}/wallet/getaccount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: derivedHex }),
  })).json();

  const balanceSun = accRes.balance || 0;
  const balanceTrob = balanceSun / 1_000_000;
  const totalRequiredTrob = RECIPIENT_ACCOUNTS.length * AMOUNT_PER_ACCOUNT_TROB; // 693,000 TROB

  console.log(`- Current Sender Balance: ${balanceTrob.toLocaleString()} TROB`);
  console.log(`- Total Required for 99 Accounts: ${totalRequiredTrob.toLocaleString()} TROB (${AMOUNT_PER_ACCOUNT_TROB} TROB each)`);

  if (balanceTrob < totalRequiredTrob) {
    console.error(`\nError: Insufficient balance! Required: ${totalRequiredTrob} TROB, Available: ${balanceTrob} TROB`);
    process.exit(1);
  }

  console.log('\n- Verification Successful. Starting Batch Transfers...\n');

  const results = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < RECIPIENT_ACCOUNTS.length; i++) {
    const recipientB58 = RECIPIENT_ACCOUNTS[i];
    const indexStr = `[${i + 1}/${RECIPIENT_ACCOUNTS.length}]`;

    let attempt = 0;
    let sent = false;

    while (attempt < 3 && !sent) {
      attempt++;
      try {
        const recipientHex = base58ToHex(recipientB58);

        // Create transaction via Fullnode
        const createRes = await (await fetch(`${FULLNODE_URL}/wallet/createtransaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_address: recipientHex,
            owner_address: derivedHex,
            amount: AMOUNT_PER_ACCOUNT_SUN,
          }),
        })).json();

        if (!createRes || !createRes.txID) {
          throw new Error(createRes?.Error || 'Failed to create transfer transaction');
        }

        // Sign transaction (secp256k1 with v = 27/28)
        const sig = signingKey.sign('0x' + createRes.txID);
        const vHex = sig.v.toString(16).padStart(2, '0');
        const sigHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

        const broadcastPayload = {
          txID: createRes.txID,
          raw_data: createRes.raw_data,
          raw_data_hex: createRes.raw_data_hex,
          signature: [sigHex],
        };

        // Broadcast transaction
        const broadcastRes = await (await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(broadcastPayload),
        })).json();

        if (broadcastRes?.result) {
          successful++;
          sent = true;
          console.log(`${indexStr} Funded 7,000 TROB -> ${recipientB58} | TXID: ${createRes.txID}`);
          results.push({
            index: i + 1,
            address: recipientB58,
            amountTrob: AMOUNT_PER_ACCOUNT_TROB,
            txId: createRes.txID,
            status: 'SUCCESS',
            timestamp: new Date().toISOString(),
          });
        } else {
          const decodedMsg = broadcastRes?.message
            ? (Buffer.from(broadcastRes.message, 'hex').toString('utf8') || broadcastRes.message)
            : JSON.stringify(broadcastRes);
          throw new Error(decodedMsg);
        }

      } catch (err) {
        if (attempt >= 3) {
          failed++;
          console.error(`${indexStr} FAILED -> ${recipientB58} | Error: ${err.message}`);
          results.push({
            index: i + 1,
            address: recipientB58,
            amountTrob: AMOUNT_PER_ACCOUNT_TROB,
            error: err.message,
            status: 'FAILED',
            timestamp: new Date().toISOString(),
          });
        } else {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    // Small throttle to avoid node rate limiting
    await new Promise((r) => setTimeout(r, 120));
  }

  // Save detailed audit report
  const reportPath = path.join(__dirname, 'funding_results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    sender: derivedBase58,
    amountPerAccount: AMOUNT_PER_ACCOUNT_TROB,
    totalAccounts: RECIPIENT_ACCOUNTS.length,
    successful,
    failed,
    completedAt: new Date().toISOString(),
    transactions: results,
  }, null, 2));

  console.log('\n================================================================');
  console.log(`  BATCH COMPLETE: ${successful} Success, ${failed} Failed`);
  console.log(`  Report saved to: ${reportPath}`);
  console.log('================================================================\n');
}

main().catch((e) => {
  console.error('Fatal execution error:', e);
  process.exit(1);
});
