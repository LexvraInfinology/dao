const crypto = require("crypto");
const { ethers } = require("ethers");

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
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
  const magicB58 = "TCyNumUHc7mrvZcULQzXVtMecm7UuX7Ni5";
  const regB58 = "TVV5TzCddJ2EwvpGUEnJzyvYe4QUkDq2m2";
  const matrixB58 = "TSVnyi3gM6QQrH4is8nNFJjJyQbjSrUohK";
  const abiCoder = new ethers.AbiCoder();

  console.log("=== CHECKING REGISTRY ===");
  const usersHex = await query(regB58, "totalUsers()");
  if (usersHex) {
    const totalUsers = abiCoder.decode(["uint256"], "0x" + usersHex)[0];
    console.log("Registry totalUsers:", totalUsers.toString());
  }

  console.log("\n=== CHECKING MATRIX ===");
  const membersHex = await query(matrixB58, "totalMembers()");
  if (membersHex) {
    const totalMembers = abiCoder.decode(["uint256"], "0x" + membersHex)[0];
    console.log("Matrix totalMembers:", totalMembers.toString());
  }

  console.log("\n=== CHECKING MAGIC BOX ===");
  const statsHex = await query(magicB58, "getGlobalStats()");
  if (statsHex) {
    const decoded = abiCoder.decode(["uint256","uint256","uint256","uint256","uint256"], "0x" + statsHex);
    console.log("Pool Balance (sun):", decoded[0].toString(), "(TROB:", ethers.formatUnits(decoded[0], 6), ")");
    console.log("Total Distributed (sun):", decoded[1].toString());
    console.log("Rounds:", decoded[2].toString());
    console.log("Eligible Users Count in MagicBox:", decoded[3].toString());
    console.log("Last Distribution Timestamp:", decoded[4].toString());
  }
}
main();
