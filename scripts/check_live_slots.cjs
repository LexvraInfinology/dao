const ethers = require('ethers');

function decode58(string) {
  const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const bytes = [0];
  for (let i = 0; i < string.length; i++) {
    const c = string[i];
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
  for (let i = 0; i < string.length && string[i] === '1'; i++) bytes.push(0);
  return Buffer.from(bytes.reverse());
}

function toTronHex(str) {
  const b = decode58(str);
  return b.slice(0, 21).toString('hex');
}

function toEvmHex(str) {
  return '0x' + toTronHex(str).slice(2);
}

const matrixAddress = 'TNU8aUC8H8osyfhr2TnNzNNEMZPtGV4D8o';
const matrixTronHex = toTronHex(matrixAddress);

const coder = new ethers.AbiCoder();

async function checkUser(label, b58) {
  const evm = toEvmHex(b58);
  const param = coder.encode(['address', 'uint256'], [evm, 1]).slice(2);
  const res = await fetch('https://fullnode-one-testnet.trobchain.com/wallet/triggerconstantcontract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: toTronHex(b58),
      contract_address: matrixTronHex,
      function_selector: 'getSlotData(address,uint256)',
      parameter: param,
      visible: false
    })
  }).then(r => r.json());
  
  console.log('===', label, b58, '===');
  if (res?.constant_result?.[0]) {
    const dec = coder.decode(['bool', 'uint256', 'uint256', 'address[14]', 'uint256'], '0x' + res.constant_result[0]);
    console.log('isUnlocked:', dec[0]);
    console.log('currentCycle:', dec[1].toString());
    console.log('filledNodes:', dec[2].toString());
    console.log('slotEarned (TROB):', ethers.formatUnits(dec[4], 6));
    console.log('nodes:');
    dec[3].forEach((n, idx) => {
      if (n !== '0x0000000000000000000000000000000000000000') {
        console.log(`  P${idx+1}: ${n}`);
      }
    });
  } else {
    console.log('No result or error:', res);
  }
}

async function run() {
  await checkUser('Root User', 'TJhwjgx3RkXjAXwRsnQQiDKnahoP4Uckjq');
  await checkUser('Wallet 2', 'TXd6qmpd497FUMTcJMife65vvfsZWPJza3');
}

run().catch(console.error);

