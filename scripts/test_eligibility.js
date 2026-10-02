const dbUrl = "postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

const B58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58ToHex(b58) {
  const bytes = [0];
  for (let i = 0; i < b58.length; i++) {
    const c = b58[i];
    const val = B58_CHARS.indexOf(c);
    if (val === -1) return b58;
    for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
    bytes[0] += val;
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
  for (let i = 0; i < b58.length && b58[i] === '1'; i++) bytes.push(0);
  const buf = Buffer.from(bytes.reverse());
  return buf.subarray(0, buf.length - 4).toString('hex');
}

function toTronHex(address) {
  const clean = address.trim();
  if (clean.startsWith('T') && clean.length === 34) {
    return base58ToHex(clean).toLowerCase();
  }
  if (clean.startsWith('0x')) {
    return ('41' + clean.slice(2)).toLowerCase();
  }
  return clean.toLowerCase();
}

async function testEligibility(addr) {
  const hex = toTronHex(addr);
  const acctRes = await fetch('https://fullnode-one-testnet.trobchain.com/wallet/getaccount', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: hex })
  });
  const acctData = await acctRes.json();
  console.log('Account found. create_time:', acctData.create_time, 'votes:', acctData.votes?.length, 'frozenV2:', acctData.frozenV2?.length);

  // Check Neon DB
  const dbRes = await fetch('https://ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/sql', {
    method: 'POST',
    headers: { 'Neon-Connection-String': dbUrl, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `SELECT verified, verified_at FROM whatsapp_verifications WHERE LOWER(address) = LOWER('${addr}')`
    })
  });
  const dbData = await dbRes.json();
  console.log('WhatsApp in DB:', dbData.rows);
}

testEligibility('TFciprfGxcZ9W7gzwu1Nvc9cEoqnv8mdCp');
