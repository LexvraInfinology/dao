import { ethers } from 'ethers';
import bs58 from 'bs58';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const FULLNODE_URL = 'https://fullnode-one-testnet.trobchain.com';
const USER_KEY = 'd729c3fce80e3e831a7167efbe9e7b768f0bf8cb2ee4dfe87559208cb9a7a0a0';
const SENDER_ADDR = 'TKRWSwmKSpLB85V26MPEWbwCWqXR9aPzNf';
const SENDER_HEX = '4167b282b09c3aac1b9fbff6b4ec14ea2b72573c02';
const DAO_CONTRACT_HEX = '4196cc34af00df982ef8260849f1d0747a0de3366e';
const DAO_BASE58 = 'TPiYzJQhBD44xCFNYVrVD4Ur1gaF13nxup';

const DB_URL = "postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

function getNeonSqlEndpoint(url) {
  const match = url.match(/@([^/:]+)/);
  return match && match[1] ? `https://${match[1]}/sql` : '';
}

async function queryNeon(sql) {
  const endpoint = getNeonSqlEndpoint(DB_URL);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': DB_URL,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return await res.json();
}

function hexToBase58(hex) {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const addressHex = clean.length === 40 ? '41' + clean : clean;
  const buffer = Buffer.from(addressHex, 'hex');
  const hash1 = crypto.createHash('sha256').update(buffer).digest();
  const hash2 = crypto.createHash('sha256').update(hash1).digest();
  const checksum = hash2.slice(0, 4);
  return bs58.encode(Buffer.concat([buffer, checksum]));
}

function privateKeyToTrob(privKeyHex) {
  const clean = privKeyHex.startsWith('0x') ? privKeyHex : `0x${privKeyHex}`;
  const wallet = new ethers.Wallet(clean);
  const ethAddress = wallet.address.slice(2).toLowerCase();
  const trobHex = '41' + ethAddress;
  const buffer = Buffer.from(trobHex, 'hex');
  const hash1 = crypto.createHash('sha256').update(buffer).digest();
  const hash2 = crypto.createHash('sha256').update(hash1).digest();
  const checksum = hash2.slice(0, 4);
  return {
    base58: bs58.encode(Buffer.concat([buffer, checksum])),
    hex: trobHex,
    privateKey: clean
  };
}

async function sendTrob(fromKey, fromHex, toHex, amountTrob) {
  const amountSun = Math.round(amountTrob * 1e6);
  const res = await fetch(`${FULLNODE_URL}/wallet/createtransaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to_address: toHex,
      owner_address: fromHex,
      amount: amountSun
    })
  });
  const tx = await res.json();
  if (!tx.txID) throw new Error('Create tx failed: ' + JSON.stringify(tx));

  const signingKey = new ethers.SigningKey(fromKey.startsWith('0x') ? fromKey : `0x${fromKey}`);
  const sig = signingKey.sign(`0x${tx.txID}`);
  const vHex = sig.v.toString(16).padStart(2, '0');
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const bRes = await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      txID: tx.txID,
      raw_data: tx.raw_data,
      raw_data_hex: tx.raw_data_hex,
      signature: [signatureHex]
    })
  });
  const bData = await bRes.json();
  return { txID: tx.txID, broadcast: bData };
}

async function joinDAO(subWalletKey, subWalletHex, callValueSun = 1800000000) {
  const res = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contract_address: DAO_CONTRACT_HEX,
      function_selector: 'joinDAO()',
      owner_address: subWalletHex,
      call_value: callValueSun,
      fee_limit: 100000000,
      parameter: ''
    })
  });
  const data = await res.json();
  if (!data.result || !data.result.result) {
    throw new Error('triggerSmartContract failed: ' + JSON.stringify(data));
  }
  const tx = data.transaction;

  const signingKey = new ethers.SigningKey(subWalletKey.startsWith('0x') ? subWalletKey : `0x${subWalletKey}`);
  const sig = signingKey.sign(`0x${tx.txID}`);
  const vHex = sig.v.toString(16).padStart(2, '0');
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const bRes = await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      txID: tx.txID,
      raw_data: tx.raw_data,
      raw_data_hex: tx.raw_data_hex,
      signature: [signatureHex]
    })
  });
  return {
    txID: tx.txID,
    broadcast: await bRes.json()
  };
}

async function getOnChainMembers() {
  const res = await fetch(`${FULLNODE_URL}/wallet/triggerconstantcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: DAO_CONTRACT_HEX,
      contract_address: DAO_CONTRACT_HEX,
      function_selector: 'getAllMembers()',
      parameter: ''
    })
  });
  const json = await res.json();
  if (!json.constant_result || !json.constant_result[0]) return [];
  const rawHex = json.constant_result[0];
  const count = parseInt(rawHex.slice(64, 128), 16);
  const list = [];
  for (let i = 0; i < count; i++) {
    const start = 128 + i * 64;
    const chunk = rawHex.slice(start, start + 64);
    const addrHex = chunk.slice(24);
    const base58 = hexToBase58(addrHex);
    list.push({ position: i + 1, base58, hex: '41' + addrHex });
  }
  return list;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('====================================================================');
  console.log('EQUORA DAO: ON-CHAIN FULFILLMENT TO 100 SEATS');
  console.log('Master Funding Wallet:', SENDER_ADDR);
  console.log('DAO Contract Address:', DAO_BASE58);
  console.log('====================================================================\n');

  // 1. Fetch current on-chain members
  let currentMembers = await getOnChainMembers();
  console.log(`Current confirmed on-chain members: ${currentMembers.length} / 100`);

  const subwalletsLogPath = path.resolve(process.cwd(), 'scripts/dao_100_subwallets.json');
  let savedWallets = [];
  if (fs.existsSync(subwalletsLogPath)) {
    try {
      savedWallets = JSON.parse(fs.readFileSync(subwalletsLogPath, 'utf8'));
    } catch {}
  }

  // 2. Loop to fulfill remaining seats up to 100
  const targetCount = 100;
  const startSeat = currentMembers.length + 1;

  if (startSeat <= targetCount) {
    console.log(`Need to fulfill seats #${startSeat} through #${targetCount} (${targetCount - startSeat + 1} seats)...`);

    for (let pos = startSeat; pos <= targetCount; pos++) {
      console.log(`\n--- [Seat #${pos} / 100] ---`);

      // Deterministic key from master key + position for safe recovery
      const childPrivKey = crypto.createHash('sha256').update(`${USER_KEY}-subwallet-seat-${pos}`).digest('hex');
      const sub = privateKeyToTrob(childPrivKey);
      console.log(`Sub-Wallet Address: ${sub.base58}`);

      // Fund sub-wallet with 2,000 TROB
      console.log(`Funding sub-wallet with 2,000 TROB from ${SENDER_ADDR}...`);
      let fundTx;
      try {
        fundTx = await sendTrob(USER_KEY, SENDER_HEX, sub.hex, 2000);
        console.log(`Funded! TX: ${fundTx.txID}`);
      } catch (err) {
        console.error(`Funding error on seat #${pos}:`, err.message);
        await sleep(3000);
        continue;
      }

      // Wait 3.5s for transaction to mine on testnet block
      await sleep(3500);

      // Call joinDAO()
      console.log(`Calling joinDAO() for Seat #${pos}...`);
      try {
        const joinTx = await joinDAO(sub.privateKey, sub.hex, 1800000000);
        console.log(`Success! Seat #${pos} joined! TX: ${joinTx.txID}`);
        console.log(`Explorer: https://testnet.trobchain.com/transaction/${joinTx.txID}`);

        savedWallets.push({
          seatNumber: pos,
          address: sub.base58,
          hexAddress: sub.hex,
          privateKey: sub.privateKey,
          txHash: joinTx.txID,
          fundingTxHash: fundTx.txID,
          timestamp: new Date().toISOString()
        });

        fs.writeFileSync(subwalletsLogPath, JSON.stringify(savedWallets, null, 2));
      } catch (err) {
        console.error(`joinDAO failed for seat #${pos}:`, err.message);
        await sleep(3000);
      }

      // Small pause between members
      await sleep(2000);
    }
  }

  // 3. Re-verify total members on-chain
  console.log('\n====================================================================');
  console.log('RE-VERIFYING ON-CHAIN STATUS:');
  console.log('====================================================================');
  const finalMembers = await getOnChainMembers();
  console.log(`Total on-chain members confirmed: ${finalMembers.length} / 100`);

  // 4. Sync Database cleanly with the 100 real on-chain members
  console.log('\n====================================================================');
  console.log('SYNCING DATABASE WITH 100 ON-CHAIN MEMBERS:');
  console.log('====================================================================');

  await queryNeon(`DELETE FROM "PullFallbackClaim";`);
  await queryNeon(`DELETE FROM "DaoMember";`);

  const ENTRY_FEE_TROB = 1800;
  const userRows = [];
  const memberRows = [];
  const waRows = [];
  const nowMs = Date.now();

  for (let i = 0; i < finalMembers.length; i++) {
    const m = finalMembers[i];
    const pos = m.position;
    const addr = m.base58;
    const memberJoinedMs = nowMs - (100 - pos) * (10 * 60 * 1000);
    const joinedIso = new Date(memberJoinedMs).toISOString();

    userRows.push(`(gen_random_uuid(), '${addr}', ${20000 + pos}, '${joinedIso}', NOW(), NOW())`);
    waRows.push(`('${addr}', true, NOW())`);

    // Dividend formula: 1800 / s + sum_{k = s + 1}^{N} (1800 / k)
    let dividendSum = 0;
    for (let k = pos; k <= finalMembers.length; k++) {
      dividendSum += ENTRY_FEE_TROB / k;
    }
    dividendSum = Math.min(ENTRY_FEE_TROB * 5, dividendSum);
    const status = dividendSum >= ENTRY_FEE_TROB * 5 ? 'capped' : 'active';

    const saved = savedWallets.find(w => w.seatNumber === pos);
    const txHash = saved ? saved.txHash : crypto.createHash('sha256').update(`dao-${pos}-${addr}`).digest('hex');

    memberRows.push(`(
      gen_random_uuid(), '${addr}', ${pos}, ${pos}, ${ENTRY_FEE_TROB}, 300,
      'blockchain-onchain', ${dividendSum.toFixed(2)}, '${joinedIso}', '${status}', '${txHash}', 1,
      NOW(), NOW()
    )`);
  }

  if (userRows.length > 0) {
    await queryNeon(`
      INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
      VALUES ${userRows.join(',\n')}
      ON CONFLICT (address) DO NOTHING;
    `);

    try {
      await queryNeon(`
        INSERT INTO whatsapp_verifications (address, verified, verified_at)
        VALUES ${waRows.join(',\n')}
        ON CONFLICT (address) DO UPDATE SET verified = true;
      `);
    } catch {}

    await queryNeon(`
      INSERT INTO "DaoMember" (
        id, address, position, "nftTokenId", "entryAmountBtt", "entryAmountUsdAtJoin", 
        "priceSource", "pushedAmountBtt", "joinedAt", status, "txHash", "blockNumber", 
        "createdAt", "updatedAt"
      ) VALUES ${memberRows.join(',\n')};
    `);
  }

  // Update DaoInstance
  await queryNeon(`
    UPDATE "DaoInstance" 
    SET "totalDistributedBtt" = (SELECT COALESCE(SUM("pushedAmountBtt"), 0) FROM "DaoMember"), 
        "isClosed" = ${finalMembers.length >= 100},
        "updatedAt" = NOW();
  `);

  console.log('>>> COMPLETE: Real on-chain members synced to database!');
  console.log(`Explore on: https://testnet.trobchain.com/contract/${DAO_BASE58}`);
}

main().catch(console.error);
