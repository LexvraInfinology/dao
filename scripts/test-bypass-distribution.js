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

async function dryRun(contractB58, selector, paramHex = "") {
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
  return data;
}

async function main() {
  const magicB58 = "TCyNumUHc7mrvZcULQzXVtMecm7UuX7Ni5";
  console.log("Triggering dry run of distributeQuarterly(0) on deployed contract...");
  const abiCoder = new ethers.AbiCoder();
  const param = abiCoder.encode(["uint256"], [0]).slice(2);
  const res = await dryRun(magicB58, "distributeQuarterly(uint256)", param);
  console.log("Result:", JSON.stringify(res, null, 2));
}
main();

