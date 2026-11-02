const ethers = require('ethers');
const coder = new ethers.AbiCoder();

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

async function checkSponsor(b58) {
  const evm = toEvmHex(b58);
  const p = coder.encode(['address'], [evm]).slice(2);
  const registryTron = toTronHex('TDeTkVTHDv8i9aHi1eZBMUPSvuReypxAw1');
  const res = await fetch('https://fullnode-one-testnet.trobchain.com/wallet/triggerconstantcontract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: toTronHex(b58),
      contract_address: registryTron,
      function_selector: 'getSponsor(address)',
      parameter: p,
      visible: false
    })
  }).then(r => r.json());
  if (res?.constant_result?.[0]) {
    const sp = coder.decode(['address'], '0x' + res.constant_result[0])[0];
    console.log(b58, 'EVM:', evm, 'Sponsor:', sp);
  } else {
    console.log('Error:', res);
  }
}

async function main() {
  await checkSponsor('TXd6qmpd497FUMTcJMife65vvfsZWPJza3');
  await checkSponsor('TJhwjgx3RkXjAXwRsnQQiDKnahoP4Uckjq');
}
main();

