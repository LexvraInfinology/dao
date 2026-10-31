const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function encode58(buffer) {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) digits.push(0);
  return digits.reverse().map((d) => ALPHABET[d]).join("");
}

function hexToBase58(hexStr) {
  const clean = hexStr.startsWith("0x") ? hexStr.slice(2) : hexStr;
  const buf = Buffer.from(clean, "hex");
  const hash1 = crypto.createHash("sha256").update(buf).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  const checksum = hash2.subarray(0, 4);
  return encode58(Buffer.concat([buf, checksum]));
}

async function getAccountWithRetry(tronHex, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://fullnode-one-testnet.trobchain.com/wallet/getaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: tronHex })
      });
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

async function check() {
  const members = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../joined-members.json"), "utf8"));
  console.log(`Checking balances for ${members.length} members:\n`);
  for (const m of members) {
    const tronHex = "41" + m.evm.slice(2);
    const b58 = hexToBase58(tronHex);
    try {
      const data = await getAccountWithRetry(tronHex);
      const balanceSun = data.balance || 0;
      const balanceTrob = balanceSun / 1e6;
      console.log(`Member ${m.memberNumber.toString().padStart(2, " ")} (${b58}): ${balanceTrob.toFixed(4)} TROB (${balanceSun} SUN)`);
    } catch (err) {
      console.error(`Member ${m.memberNumber} check failed: ${err.message}`);
    }
  }

  // Seat 1
  const s1Res = await fetch("https://fullnode-one-testnet.trobchain.com/wallet/getaccount", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: "4167b282b09c3aac1b9fbff6b4ec14ea2b72573c02" })
  });
  const s1Data = await s1Res.json();
  console.log(`\nSeat 1 (TKRWSwmKSpLB85V26MPEWbwCWqXR9aPzNf): ${((s1Data.balance || 0) / 1e6).toFixed(4)} TROB`);
}

check();
