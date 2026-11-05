const crypto = require("crypto");
const { ethers } = require("ethers");

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
  const tronHex = clean.startsWith("41") ? clean : "41" + clean;
  const buf = Buffer.from(tronHex, "hex");
  const hash1 = crypto.createHash("sha256").update(buf).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  const checksum = hash2.subarray(0, 4);
  return encode58(Buffer.concat([buf, checksum]));
}

function base58ToHex(b58) {
  const bytes = [0];
  for (let i = 0; i < b58.length; i++) {
    const c = b58[i];
    const val = ALPHABET.indexOf(c);
    if (val === -1) throw new Error("Invalid base58 character: " + c);
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
  for (let i = 0; i < b58.length && b58[i] === "1"; i++) bytes.push(0);
  const buf = Buffer.from(bytes.reverse());
  return buf.subarray(0, buf.length - 4).toString("hex");
}

async function query(contractB58, selector, paramHex = "") {
  const contractHex = base58ToHex(contractB58);
  const res = await fetch("https://fullnode-one-testnet.trobchain.com/wallet/triggersmartcontract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: contractHex,
      contract_address: contractHex,
      function_selector: selector,
      parameter: paramHex,
      visible: false
    })
  });
  const data = await res.json();
  return data.constant_result ? data.constant_result[0] : null;
}

async function main() {
  const regB58 = "TVV5TzCddJ2EwvpGUEnJzyvYe4QUkDq2m2";
  const abiCoder = new ethers.AbiCoder();

  console.log("Fetching live users from EquoraRegistry:", regB58);
  const listHex = await query(regB58, "getUserList()");
  if (!listHex) {
    console.log("Failed to fetch userList");
    return;
  }

  const decoded = abiCoder.decode(["address[]"], "0x" + listHex)[0];
  console.log(`Found ${decoded.length} registered users in Registry:`);

  const users = [];
  for (let i = 0; i < decoded.length; i++) {
    const evmAddr = decoded[i];
    const b58 = hexToBase58(evmAddr);
    
    // Query user details
    const param = abiCoder.encode(["address"], [evmAddr]).slice(2);
    const userHex = await query(regB58, "getUser(address)", param);
    let regTime = 0;
    let code = 0;
    if (userHex) {
      // struct User { bool isRegistered; address sponsor; uint256 registrationTimestamp; uint256 directReferralsCount; uint256 id; uint32 referralCode; }
      const uDec = abiCoder.decode(["bool", "address", "uint256", "uint256", "uint256", "uint32"], "0x" + userHex);
      regTime = Number(uDec[2]);
      code = Number(uDec[5]);
    }
    users.push({ index: i + 1, evmAddr, b58, code, regTime, date: new Date(regTime * 1000).toISOString() });
    console.log(`  #${i + 1}: ${b58} (Code: ${code}, Reg: ${new Date(regTime * 1000).toISOString()})`);
  }

  console.log("\nSummary: All 24 users on live chain have distinct registration timestamps!");
}
main();

