const ethers = require('ethers');
const coder = new ethers.AbiCoder();
const matrixTron = '418919e11e219e81d9f510947f9d4f9e9ac04f4cc6';

function toTronHex(str) {
  const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const bytes = [0];
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    const value = B58.indexOf(c);
    if (value === -1) return null;
    for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
    bytes[0] += value;
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
  for (let i = 0; i < str.length && str[i] === '1'; i++) bytes.push(0);
  return Buffer.from(bytes.reverse()).slice(0, 21).toString('hex');
}

function toEvmHex(str) {
  return '0x' + toTronHex(str).slice(2);
}

function toB58(hex) {
  const bs58 = require('bs58');
  const crypto = require('crypto');
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const payload = Buffer.from('41' + clean, 'hex');
  const h1 = crypto.createHash('sha256').update(payload).digest();
  const h2 = crypto.createHash('sha256').update(h1).digest();
  return bs58.encode(Buffer.concat([payload, h2.subarray(0, 4)]));
}

async function queryTrobConstant(contractTron, func, param) {
  const res = await fetch('https://fullnode-one-testnet.trobchain.com/wallet/triggerconstantcontract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: '415fd6266a07fa4ba10dd34e9a315edd47904b8823',
      contract_address: contractTron,
      function_selector: func,
      parameter: param,
      visible: false
    })
  }).then(r => r.json());
  return res?.constant_result?.[0] || null;
}

async function getDynamicDirects(canon) {
  const p = coder.encode(['address'], [canon]).slice(2);
  const raw = await queryTrobConstant(matrixTron, 'getActiveDirectReferrals(address)', p);
  if (raw) {
    const dec = coder.decode(['address[]'], '0x' + raw);
    return (dec[0] || []).map(a => a.toLowerCase()).filter(a => a && a !== '0x0000000000000000000000000000000000000000');
  }
  return [];
}

async function buildOnChainTransactions(userAddr) {
  const userHex = userAddr.startsWith('0x') ? userAddr.toLowerCase() : toEvmHex(userAddr).toLowerCase();
  const uCanon = userHex;
  const param = coder.encode(['address', 'uint256'], [userHex, 1]).slice(2);
  const raw = await queryTrobConstant(matrixTron, 'getSlotData(address,uint256)', param);
  let isUnlocked = true;
  let nodes = Array(14).fill('0x0000000000000000000000000000000000000000');

  if (raw) {
    const decoded = coder.decode(['bool', 'uint256', 'uint256', 'address[14]', 'uint256'], '0x' + raw);
    isUnlocked = Boolean(decoded[0]);
    nodes = decoded[3] || nodes;
  }

  const userDirects = await getDynamicDirects(uCanon);
  const updatedNodes = [...nodes];
  const isNodeEmpty = (addr) => !addr || addr === '0x0000000000000000000000000000000000000000' || addr === '0x0';

  let pos1 = !isNodeEmpty(updatedNodes[0]) ? updatedNodes[0].toLowerCase() : (userDirects[0] || null);
  let pos2 = !isNodeEmpty(updatedNodes[1]) ? updatedNodes[1].toLowerCase() : (userDirects[1] || null);

  if (isNodeEmpty(updatedNodes[0]) && pos1) updatedNodes[0] = pos1;
  if (isNodeEmpty(updatedNodes[1]) && pos2) updatedNodes[1] = pos2;

  const placedSet = new Set();
  placedSet.add(uCanon);
  for (const n of updatedNodes) {
    if (!isNodeEmpty(n)) placedSet.add(n.toLowerCase());
  }

  const candidateQueue = [];
  for (let i = 2; i < userDirects.length; i++) {
    const d = userDirects[i].toLowerCase();
    if (!placedSet.has(d)) {
      candidateQueue.push(d);
      placedSet.add(d);
    }
  }

  const exploreQueue = [];
  for (const n of updatedNodes) {
    if (!isNodeEmpty(n)) exploreQueue.push(n.toLowerCase());
  }

  for (let posIdx = 2; posIdx < 14; posIdx++) {
    while (candidateQueue.length === 0 && exploreQueue.length > 0) {
      const parent = exploreQueue.shift();
      const children = await getDynamicDirects(parent);
      for (const ch of children) {
        const chl = ch.toLowerCase();
        if (!placedSet.has(chl)) {
          candidateQueue.push(chl);
          placedSet.add(chl);
        }
      }
    }

    if (isNodeEmpty(updatedNodes[posIdx]) && candidateQueue.length > 0) {
      const nextCand = candidateQueue.shift();
      updatedNodes[posIdx] = nextCand;
      placedSet.add(nextCand);
      exploreQueue.push(nextCand);
    } else if (!isNodeEmpty(updatedNodes[posIdx])) {
      const existing = updatedNodes[posIdx].toLowerCase();
      placedSet.add(existing);
      exploreQueue.push(existing);
    }
  }

  const items = [];
  let totalInflow = 0;
  let totalOutflow = 0;

  // 1. Direct Owner Payouts from positions 3, 6, 8, 9, 11, 12
  const payingPositions = [3, 6, 8, 9, 11, 12];
  for (const p of payingPositions) {
    const occupant = updatedNodes[p - 1];
    if (!isNodeEmpty(occupant)) {
      totalInflow += 30.0;
      items.push({
        id: `tx-reward-${uCanon.slice(2, 8)}-p${p}`,
        type: 'Partner Reward',
        slotNumber: 1,
        cycle: 1,
        position: p,
        amount: 30.0,
        amountUsd: 30.0,
        token: 'USD',
        fromAddress: toB58(occupant),
        toAddress: 'You',
        txHash: ethers.keccak256(ethers.toUtf8Bytes(uCanon + '-reward-p' + p)).slice(2, 66),
        status: 'Confirmed',
        description: `Position #${p} P2P Settlement (+ $30.00 USD)`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 2. Slot Purchase (Outflow)
  if (isUnlocked) {
    totalOutflow += 30.0;
    items.push({
      id: `tx-slot-1-${uCanon.slice(2, 8)}`,
      type: 'Send',
      slotNumber: 1,
      cycle: 1,
      position: null,
      amount: -30.0,
      amountUsd: -30.0,
      token: 'USD',
      fromAddress: 'You',
      toAddress: 'System',
      txHash: ethers.keccak256(ethers.toUtf8Bytes(uCanon + '-slot-1')).slice(2, 66),
      status: 'Confirmed',
      description: 'Unlocked Matrix Slot #01 for $30.00 USD',
      timestamp: new Date().toISOString()
    });
  }

  console.log(`\n=== Transactions for ${userAddr} ===`);
  console.log(`Total Received: $${totalInflow.toFixed(2)} USD`);
  console.log(`Total Outflow: $${totalOutflow.toFixed(2)} USD`);
  console.log(`Net Profit: $${(totalInflow - totalOutflow).toFixed(2)} USD`);
  console.log('Items count:', items.length);
  items.forEach((it, i) => {
    console.log(` #${i+1}: ${it.type} | From: ${it.fromAddress.slice(0, 10)}... | Amount: ${it.amount > 0 ? '+' : ''}$${it.amount.toFixed(2)} USD | ${it.status}`);
  });
}

async function main() {
  await buildOnChainTransactions('TU6tAKDHd6gSRQ9UycnWUFFT8iyUEMZECA');
  await buildOnChainTransactions('TJhwjgx3RkXjAXwRsnQQiDKnahoP4Uckjq');
}

main();
