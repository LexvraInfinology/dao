const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns = require("dns");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

dns.setDefaultResultOrder("ipv4first");

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

function privateKeyToAddress(privKeyHex) {
  const clean = privKeyHex.startsWith("0x") ? privKeyHex : "0x" + privKeyHex;
  const wallet = new ethers.Wallet(clean);
  const evmAddress = wallet.address.toLowerCase();
  const tronHex = "41" + evmAddress.slice(2);
  const tronBase58 = hexToBase58(tronHex);
  return { evmAddress, tronHex, tronBase58, signingKey: new ethers.SigningKey(clean) };
}

const FULLNODE_URL = "https://fullnode-one-testnet.trobchain.com";

async function testPoolReceives() {
  const deployer = privateKeyToAddress(process.env.DEPLOYER_PRIVATE_KEY);
  console.log(`Deployer address: ${deployer.tronBase58}`);

  const targets = {
    SalaryPool: "TQG1KagMZRXYPbvgvpLVES68Ht4eazZKo7",
    RewardPool: "TBufkRiqngeRwJpWQkaySUm2dioqxLCuDf",
    MagicBox: "TPo6c2gjhX6DWPQcCf4TUF3NnzxAmCC8cb"
  };

  for (const [name, addr] of Object.entries(targets)) {
    console.log(`Testing 1 SUN transfer to ${name} (${addr})...`);
    // Convert to Tron Hex
    const coder = new ethers.AbiCoder();
    // Use triggersmartcontract with call_value 1 SUN to trigger receive/fallback
    // Wait, let's test if createtransaction (simple TRX/TROB transfer) works!
    const tronHex = "41" + (addr.startsWith("T") ? (() => {
      // Decode base58
      const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      const bytes = [0];
      for (let i = 0; i < addr.length; i++) {
        const c = addr[i];
        const val = B58.indexOf(c);
        for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
        bytes[0] += val;
        let carry = 0;
        for (let j = 0; j < bytes.length; j++) {
          bytes[j] += carry;
          carry = (bytes[j] >> 8);
          bytes[j] &= 0xff;
        }
        while (carry) {
          bytes.push(carry & 0xff);
          carry >>= 8;
        }
      }
      for (let i = 0; i < addr.length && addr[i] === "1"; i++) bytes.push(0);
      const b = new Uint8Array(bytes.reverse());
      return Array.from(b.slice(1, 21)).map(x => x.toString(16).padStart(2, "0")).join("");
    })() : addr.slice(2));

    const res = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_address: deployer.tronHex,
        contract_address: tronHex,
        function_selector: "",
        parameter: "",
        call_value: 1000000, // 1 TROB
        fee_limit: 10000000
      })
    });
    const data = await res.json();
    console.log(`Result for ${name}:`, data.result?.result ? "SUCCESS: Can receive native TROB!" : `FAILED: ${data.Error || JSON.stringify(data.result)}`);
  }
}

testPoolReceives();
