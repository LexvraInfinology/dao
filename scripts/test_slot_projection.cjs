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

async function testSlotDetails(userAddr) {
  const userHex = userAddr.startsWith('0x') ? userAddr : toEvmHex(userAddr);
  const param = coder.encode(['address', 'uint256'], [userHex, 1]).slice(2);
  const raw = await queryTrobConstant(matrixTron, 'getSlotData(address,uint256)', param);
  let isUnlocked = true;
  let currentCycle = 1;
  let filledNodes = 0;
  let nodes = Array(14).fill('0x0000000000000000000000000000000000000000');
  let slotEarned = BigInt(0);

  if (raw) {
    const decoded = coder.decode(['bool', 'uint256', 'uint256', 'address[14]', 'uint256'], '0x' + raw);
    isUnlocked = Boolean(decoded[0]);
    currentCycle = Number(decoded[1]) || 1;
    filledNodes = Number(decoded[2]) || 0;
    nodes = decoded[3] || nodes;
    slotEarned = decoded[4] || BigInt(0);
  }

  console.log(`On-chain raw for ${userAddr}:`);
  console.log('isUnlocked:', isUnlocked, 'filledNodes:', filledNodes);
  console.log('nodes:', nodes.filter(a => a !== '0x0000000000000000000000000000000000000000'));

  // Now let's see what the Subtree Projection does:
  let displayNodes = [...nodes];
  const uCanon = userHex.toLowerCase();
  const updatedNodes = [...displayNodes];
  const isNodeEmpty = (addr) => !addr || addr === '0x0000000000000000000000000000000000000000' || addr === '0x0';
  const hasEmpty = updatedNodes.some(isNodeEmpty);

  if (hasEmpty && isUnlocked) {
    const userDirects = await getDynamicDirects(uCanon);
    console.log('userDirects for', uCanon, userDirects);
    let pos1 = !isNodeEmpty(updatedNodes[0]) ? updatedNodes[0].toLowerCase() : (userDirects[0] || null);
    let pos2 = !isNodeEmpty(updatedNodes[1]) ? updatedNodes[1].toLowerCase() : (userDirects[1] || null);

    if (isNodeEmpty(updatedNodes[0]) && pos1) updatedNodes[0] = pos1;
    if (isNodeEmpty(updatedNodes[1]) && pos2) updatedNodes[1] = pos2;

    const pos1Directs = pos1 ? await getDynamicDirects(pos1) : [];
    let p1Idx = 0;
    if (isNodeEmpty(updatedNodes[2])) {
      if (pos1Directs[p1Idx]) updatedNodes[2] = pos1Directs[p1Idx++];
      else if (userDirects[2]) updatedNodes[2] = userDirects[2];
    }
    if (isNodeEmpty(updatedNodes[3])) {
      if (pos1Directs[p1Idx]) updatedNodes[3] = pos1Directs[p1Idx++];
      else if (userDirects[3]) updatedNodes[3] = userDirects[3];
    }

    displayNodes = updatedNodes;
  }

  console.log(`Projected nodes for ${userAddr}:`);
  displayNodes.forEach((n, idx) => {
    if (!isNodeEmpty(n)) {
      console.log(`  P${idx+1}: ${n}`);
    }
  });
}

async function main() {
  await testSlotDetails('TXd6qmpd497FUMTcJMife65vvfsZWPJza3');
}
main();

