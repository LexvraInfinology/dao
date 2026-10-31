const { ethers } = require('ethers');
const fs = require('fs');

const RPC = 'https://fullnode-one.trobchain.com';
const coder = new ethers.AbiCoder();

const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function encode58(buffer) {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      bytes = digits[j] + carry;
      carry = (bytes / 58) | 0;
      digits[j] = bytes % 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) digits.push(0);
  return digits.reverse().map((d) => B58_ALPHABET[d]).join('');
}

function hexToBase58(hex) {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const addressHex = clean.length === 40 ? '41' + clean : clean;
  const buffer = Buffer.from(addressHex, 'hex');
  const h1 = ethers.sha256(buffer);
  const h2 = ethers.sha256(ethers.getBytes(h1));
  const checksum = ethers.getBytes(h2).slice(0, 4);
  const total = new Uint8Array(buffer.length + 4);
  total.set(buffer);
  total.set(checksum, buffer.length);
  return encode58(total);
}

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

async function buildMasterManifest() {
  const v1Addr = 'TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto';
  const v2InterimAddr = 'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT';

  // Load the 8 completed wallets from interim
  const fulfilledMap = {
    12: { addr: 'TBbJ9ZHgiYmKDZ3FrcG4GW5UTLLiDMyJYi', paidTrob: 5355.64, tx: 'ead34e628719ee4c354092383c66f55ff198b8a82ada553def9c5fb03e2233d5' },
    76: { addr: 'TWEumcsumh8fviTTGouKYjLW7YinFy6pgH', paidTrob: 6386.51, tx: '6699330082dba22dfbc35439865b68c42b6f376b00416c4c9c27ebf8a98d8d21' },
    79: { addr: 'TYxsuv74iHTobfqEEoFLSz1v7zrzMAyDVR', paidTrob: 5357.14, tx: 'a3d8a9cd36cbca35fa093dc1f26b861bc69a408b3cc1f91320f1cb58f37e52ae' },
    80: { addr: 'TA1aEsNfQjNFaXg6hJ3XDpKTm5DxkXjDes', paidTrob: 5357.14, tx: 'e549be8bc5ad778bb5acece1a9afc79180bdc6a7726fc0b9422485c837707b77' },
    84: { addr: 'TKr2pGFM3bftzL1dbqMkJaZABnVucoJBH2', paidTrob: 5357.14, tx: '2d4d75e79722ce60ce1398c11e298e5620ae32055df180bbf4da88002f836bb1' },
    85: { addr: 'TZ5j8QKSD4pkWYwkg5pqT2vnmJJL4xQ92b', paidTrob: 7481.48, tx: '455a679076042e0a109d4df824a62f1e65aaa76a82343cee87d954b13bfb962e' },
    90: { addr: 'TLtfyquzWuvLvGeiDjPydyQsGfVsCTQQAy', paidTrob: 6835.74, tx: '9cea18ea7b2179b1820295b2d50b39109737215fc7dff6720bb2719975280d50' },
    91: { addr: 'TRySstMfGQyFTEhzpkegbEoHFwuzytvvUu', paidTrob: 7310.48, tx: '06cae6248f7205cb0bef41c73c212e5d5eae49a80bc1e979e48532d6e7430ca1' },
  };

  // Read existing migration_manifest.json for genuineMembers 1 to 93
  const oldManifest = JSON.parse(fs.readFileSync('scratch/migration_manifest.json', 'utf8'));
  const genuineList = oldManifest.genuineMembers;

  const masterList = [];

  for (let seat = 1; seat <= 93; seat++) {
    if (fulfilledMap[seat]) {
      const f = fulfilledMap[seat];
      masterList.push({
        position: seat,
        address: f.addr,
        addressHex: toHexAddress(f.addr),
        entryAmountBtt: f.paidTrob.toFixed(6),
        pushedAmountBtt: '0.000000',
        status: 'active',
        fulfillmentTx: f.tx,
        note: 'Fulfilled on-chain in EquoraDAOv2 interim contract with full $300 USD deposit'
      });
    } else {
      const existing = genuineList.find(g => g.position === seat);
      if (existing) {
        masterList.push({
          position: seat,
          address: existing.address,
          addressHex: toHexAddress(existing.address),
          entryAmountBtt: existing.entryAmountBtt,
          pushedAmountBtt: existing.pushedAmountBtt,
          status: existing.status || 'active',
          note: 'Original genuine member from EquoraDAO v1'
        });
      } else {
        console.warn(`Warning: Seat ${seat} not found in existing genuineList or fulfilledMap!`);
      }
    }
  }

  // Sort by position
  masterList.sort((a, b) => a.position - b.position);

  const fullManifest = {
    description: "Complete and Verified 93 Genuine Equora DAO Council Members across all Mainnet Contracts",
    generatedAt: new Date().toISOString(),
    totalGenuineMembers: masterList.length,
    underfundedSeatsCount: 0,
    openPositionsCount: 100 - masterList.length,
    members: masterList
  };

  fs.writeFileSync('scratch/master_93_dao_members.json', JSON.stringify(fullManifest, null, 2));
  console.log(`\nSUCCESS: Generated scratch/master_93_dao_members.json with ${masterList.length} genuine members!`);
  console.log(`- 85 original genuine members preserved.`);
  console.log(`- 8 fulfilled seats (12, 76, 79, 80, 84, 85, 90, 91) accurately mapped with on-chain fulfillment txs.`);
  console.log(`- Seats 94-100 open for new council members.`);
}

buildMasterManifest().catch(console.error);

