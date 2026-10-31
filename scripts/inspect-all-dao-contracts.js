const { ethers } = require('ethers');

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

async function inspect(name, addr) {
  console.log(`\n=================== Inspecting ${name} (${addr}) ===================`);
  try {
    const totalRaw = await queryConstant(addr, 'totalCollected()');
    if (totalRaw) {
      const total = coder.decode(['uint256'], '0x' + totalRaw)[0];
      console.log('totalCollected (members count):', Number(total));
    } else {
      console.log('totalCollected: empty');
    }
  } catch (e) {
    console.log('totalCollected error:', e.message);
  }

  try {
    const memRaw = await queryConstant(addr, 'getAllMembers()');
    if (memRaw) {
      const decoded = coder.decode(['address[]'], '0x' + memRaw)[0];
      console.log('getAllMembers() length:', decoded.length);
      console.log('Members count:', decoded.length);
      return decoded.map(hexToBase58);
    } else {
      console.log('getAllMembers() returned empty');
    }
  } catch (e) {
    console.log('getAllMembers() error:', e.message);
  }
  return [];
}

async function main() {
  const v1Members = await inspect('EquoraDAO v1', 'TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto');
  const v2InterimMembers = await inspect('EquoraDAO v2 interim', 'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT');
  const v2CurrentMembers = await inspect('EquoraDAO v2 current', 'THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V');
}

main().catch(console.error);

