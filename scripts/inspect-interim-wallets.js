const { ethers } = require('ethers');
const fs = require('fs');

const RPC = 'https://fullnode-one.trobchain.com';
const coder = new ethers.AbiCoder();
const V2_INTERIM = 'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT';

const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function toHexAddress(input) {
  if (!input) return '0x0000000000000000000000000000000000000000';
  const str = input.trim();
  if (str.startsWith('0x')) return str.toLowerCase();
  if (str.startsWith('41') && str.length === 42) return ('0x' + str.slice(2)).toLowerCase();
  const bytes = [0];
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    const value = B58_ALPHABET.indexOf(c);
    if (value === -1) return '0x0000000000000000000000000000000000000000';
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
  const decoded = new Uint8Array(bytes.reverse());
  if (decoded.length >= 21) {
    return '0x' + Array.from(decoded.slice(1, 21)).map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
  }
  return str.toLowerCase();
}

function toTronHex(input) {
  const hex = toHexAddress(input);
  return '41' + hex.slice(2);
}

async function queryConstant(contractAddr, selector, param = '') {
  const hexAddr = toTronHex(contractAddr);
  const res = await fetch(`${RPC}/wallet/triggerconstantcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: hexAddr,
      contract_address: hexAddr,
      function_selector: selector,
      parameter: param
    })
  });
  const data = await res.json();
  return data.constant_result?.[0] || '';
}

async function inspectWallets() {
  const wallets = [
    { label: 'Seat 12 completion', addr: 'TBbJ9ZHgiYmKDZ3FrcG4GW5UTLLiDMyJYi' },
    { label: 'New joiner 1 (Oct 8)', addr: 'TWEumcsumh8fviTTGouKYjLW7YinFy6pgH' },
    { label: 'New joiner 2 (Oct 20)', addr: 'TYxsuv74iHTobfqEEoFLSz1v7zrzMAyDVR' },
    { label: 'New joiner 3 (Oct 20)', addr: 'TA1aEsNfQjNFaXg6hJ3XDpKTm5DxkXjDes' },
    { label: 'New joiner 4 (Oct 20)', addr: 'TKr2pGFM3bftzL1dbqMkJaZABnVucoJBH2' },
    { label: 'New joiner 5 (Oct 21)', addr: 'TZ5j8QKSD4pkWYwkg5pqT2vnmJJL4xQ92b' },
    { label: 'New joiner 6 (Oct 21)', addr: 'TLtfyquzWuvLvGeiDjPydyQsGfVsCTQQAy' },
    { label: 'New joiner 7 (Oct 29)', addr: 'TRySstMfGQyFTEhzpkegbEoHFwuzytvvUu' },
  ];

  console.log('Querying member details from EquoraDAO_v2_interim for all 8 wallets:\n');
  for (const w of wallets) {
    const userHex = toHexAddress(w.addr);
    const param = coder.encode(['address'], [userHex]).slice(2);

    // memberPosition
    const posRaw = await queryConstant(V2_INTERIM, 'memberPosition(address)', param);
    const pos = posRaw ? Number(coder.decode(['uint256'], '0x' + posRaw)[0]) : 0;

    // isDaoMember
    const isMemRaw = await queryConstant(V2_INTERIM, 'isDaoMember(address)', param);
    const isMem = isMemRaw ? coder.decode(['bool'], '0x' + isMemRaw)[0] : false;

    // getMemberDetails
    const detRaw = await queryConstant(V2_INTERIM, 'getMemberDetails(address)', param);
    let details = null;
    if (detRaw) {
      const dec = coder.decode(['uint256', 'uint256', 'uint256', 'bool', 'bool'], '0x' + detRaw);
      details = {
        position: Number(dec[0]),
        entryFeeTrob: Number(ethers.formatUnits(dec[1], 6)),
        lifetimeEarnings: Number(ethers.formatUnits(dec[2], 6)),
        isActive: dec[3],
        isCapReached: dec[4]
      };
    }

    console.log(`Wallet: ${w.addr} (${w.label})`);
    console.log(`   isDaoMember: ${isMem}, memberPosition: ${pos}`);
    console.log(`   getMemberDetails:`, details);
    console.log('');
  }
}

inspectWallets().catch(console.error);

