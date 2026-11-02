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

async function testUser(userAddr) {
  const userHex = userAddr.startsWith('0x') ? userAddr : toEvmHex(userAddr);
  const uCanon = userHex.toLowerCase();
  const param = coder.encode(['address', 'uint256'], [userHex, 1]).slice(2);
  const raw = await queryTrobConstant(matrixTron, 'getSlotData(address,uint256)', param);
  let isUnlocked = true;
  let currentCycle = 1;
  let filledNodes = 0;
  let nodes = Array(14).fill('0x0000000000000000000000000000000000000000');

  if (raw) {
    const decoded = coder.decode(['bool', 'uint256', 'uint256', 'address[14]', 'uint256'], '0x' + raw);
    isUnlocked = Boolean(decoded[0]);
    currentCycle = Number(decoded[1]) || 1;
    filledNodes = Number(decoded[2]) || 0;
    nodes = decoded[3] || nodes;
  }

  const userDirects = await getDynamicDirects(uCanon);
  console.log(`User ${userAddr} (${uCanon}):`);
  console.log('userDirects count:', userDirects.length, userDirects);

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

  const filledCount = updatedNodes.filter(n => !isNodeEmpty(n)).length;
  console.log(`Total filled nodes for ${userAddr}: ${filledCount}/14`);
  updatedNodes.forEach((n, idx) => {
    if (!isNodeEmpty(n)) {
      console.log(`  Pos #${idx+1}: ${n}`);
    }
  });
}

async function main() {
  await testUser('TU6tAKDHd6gSRQ9UycnWUFFT8iyUEMZECA');
}
main();
