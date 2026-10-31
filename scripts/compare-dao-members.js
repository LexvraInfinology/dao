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

async function getContractMembers(contractAddr) {
  const memRaw = await queryConstant(contractAddr, 'getAllMembers()');
  if (!memRaw) return [];
  const decoded = coder.decode(['address[]'], '0x' + memRaw)[0];
  return decoded.map((h, idx) => ({
    index: idx,
    hex: h.toLowerCase(),
    base58: hexToBase58(h)
  }));
}

async function main() {
  const v1Addr = 'TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto';
  const v2InterimAddr = 'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT';
  const v2CurrentAddr = 'THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V';

  console.log('Fetching members from v1...');
  const v1Members = await getContractMembers(v1Addr);
  console.log(`v1 members count: ${v1Members.length}`);

  console.log('Fetching members from v2 interim...');
  const v2InterimMembers = await getContractMembers(v2InterimAddr);
  console.log(`v2 interim members count: ${v2InterimMembers.length}`);

  console.log('Fetching members from v2 current...');
  const v2CurrentMembers = await getContractMembers(v2CurrentAddr);
  console.log(`v2 current members count: ${v2CurrentMembers.length}`);

  // Also query member details for each from v1 and v2Current
  const report = [];
  for (let i = 0; i < Math.max(v1Members.length, v2CurrentMembers.length); i++) {
    const v1M = v1Members[i] || {};
    const v2CurrM = v2CurrentMembers[i] || {};
    const v2IntM = v2InterimMembers[i] || {};

    const addr = v1M.base58 || v2CurrM.base58;
    const addrHex = v1M.hex || v2CurrM.hex;

    // Query v1 getMemberDetails
    let v1Details = null;
    if (v1M.hex) {
      try {
        const param = coder.encode(['address'], [v1M.hex]).slice(2);
        const raw = await queryConstant(v1Addr, 'getMemberDetails(address)', param);
        if (raw) {
          const dec = coder.decode(['uint256', 'uint256', 'uint256', 'bool', 'bool'], '0x' + raw);
          v1Details = {
            position: Number(dec[0]),
            entryFeeTrob: Number(ethers.formatUnits(dec[1], 6)),
            lifetimeEarnings: Number(ethers.formatUnits(dec[2], 6)),
            isActive: dec[3],
            isCapReached: dec[4]
          };
        }
      } catch (e) {}
    }

    // Query v2Current getMemberDetails
    let v2Details = null;
    let underfundedInfo = null;
    if (v2CurrM.hex) {
      try {
        const param = coder.encode(['address'], [v2CurrM.hex]).slice(2);
        const raw = await queryConstant(v2CurrentAddr, 'getMemberDetails(address)', param);
        if (raw) {
          const dec = coder.decode(['uint256', 'uint256', 'uint256', 'bool', 'bool'], '0x' + raw);
          v2Details = {
            position: Number(dec[0]),
            entryFeeTrob: Number(ethers.formatUnits(dec[1], 6)),
            lifetimeEarnings: Number(ethers.formatUnits(dec[2], 6)),
            isActive: dec[3],
            isCapReached: dec[4]
          };
        }

        // Query underfundedReservations(address)
        const unRaw = await queryConstant(v2CurrentAddr, 'underfundedReservations(address)', param);
        if (unRaw) {
          const decUn = coder.decode(['uint256', 'uint256', 'uint256', 'bool'], '0x' + unRaw);
          underfundedInfo = {
            seat: Number(decUn[0]),
            previousDeposit: Number(ethers.formatUnits(decUn[1], 6)),
            unearnedDebt: Number(ethers.formatUnits(decUn[2], 6)),
            isUnderfunded: decUn[3]
          };
        }
      } catch (e) {}
    }

    report.push({
      seat: i + 1,
      v1_base58: v1M.base58,
      v2_current_base58: v2CurrM.base58,
      isAddressMatch: v1M.base58 === v2CurrM.base58,
      v1Details,
      v2Details,
      underfundedInfo
    });
  }

  fs.writeFileSync('scratch/dao_contract_members_comparison.json', JSON.stringify(report, null, 2));
  console.log(`Saved comparison of ${report.length} seats to scratch/dao_contract_members_comparison.json`);

  // Summarize discrepancies
  let addressMismatches = 0;
  let underfundedCount = 0;
  let lowEntryCount = 0;

  for (const r of report) {
    if (!r.isAddressMatch) addressMismatches++;
    if (r.underfundedInfo?.isUnderfunded) underfundedCount++;
    if (r.v1Details?.entryFeeTrob < 100) lowEntryCount++;
  }

  console.log(`Summary:`);
  console.log(` - Address mismatches between v1 and v2Current: ${addressMismatches}`);
  console.log(` - v2Current underfunded flagged: ${underfundedCount}`);
  console.log(` - v1 low entry fee (< 100 TROB): ${lowEntryCount}`);
}

main().catch(console.error);

