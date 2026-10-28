const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns = require("dns");
const { ethers } = require("ethers");

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

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      console.warn(`   ⚠️ [fetch] Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(2500 * attempt);
    }
  }
}

async function broadcastTransaction(signer, createData) {
  const txID = createData.txID;
  const sig = signer.signingKey.sign("0x" + txID);
  const vHex = sig.v.toString(16).padStart(2, "0");
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...createData,
      signature: [signatureHex],
    }),
  });
  const data = await res.json();
  if (!data.result) {
    const errMsg = data.message ? Buffer.from(data.message, "hex").toString("utf8") : JSON.stringify(data);
    throw new Error(`Broadcast failed: ${errMsg}`);
  }
  return data;
}

async function transferTrob(fromSigner, toTronHex, amountSun) {
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/createtransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: fromSigner.tronHex,
      to_address: toTronHex,
      amount: amountSun,
    }),
  });
  const data = await res.json();
  if (!data.txID) throw new Error(`Create transfer failed: ${JSON.stringify(data)}`);
  await broadcastTransaction(fromSigner, data);
  await sleep(6000);
}

async function getAccountBalance(tronHex) {
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/getaccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: tronHex }),
  });
  const data = await res.json();
  return (data.balance || 0) / 1e6;
}

async function main() {
  const seat1PrivKey = "d729c3fce80e3e831a7167efbe9e7b768f0bf8cb2ee4dfe87559208cb9a7a0a0";
  const seat1Signer = privateKeyToAddress(seat1PrivKey);

  console.log("================================================================");
  console.log("💰 ENSURING >= 900 TROB BALANCE IN ALL MEMBER WALLETS");
  console.log(`   Funding Source (Seat 1): ${seat1Signer.tronBase58}`);
  console.log("================================================================\n");

  const memberHistoryPath = path.resolve(__dirname, "../joined-members.json");
  const members = JSON.parse(fs.readFileSync(memberHistoryPath, "utf8"));

  const TARGET_BALANCE = 900.0;

  for (const m of members) {
    const tronHex = "41" + m.evm.slice(2);
    const currentBalance = await getAccountBalance(tronHex);
    console.log(`Member ${m.memberNumber} (${m.base58}) current balance: ${currentBalance.toFixed(2)} TROB`);

    if (currentBalance < TARGET_BALANCE) {
      const neededTrob = Math.ceil(TARGET_BALANCE - currentBalance) + 5; // add 5 TROB safety margin
      const neededSun = Math.round(neededTrob * 1e6);
      console.log(`   💸 Topping up ${neededTrob} TROB to reach >= 900 TROB target...`);
      await transferTrob(seat1Signer, tronHex, neededSun);
      const newBal = await getAccountBalance(tronHex);
      console.log(`      ✅ New balance: ${newBal.toFixed(2)} TROB\n`);
    } else {
      console.log(`   ✅ Already >= 900 TROB (${currentBalance.toFixed(2)} TROB). Skipping.\n`);
    }
  }

  // Audit Seat 1 balance
  const s1Bal = await getAccountBalance(seat1Signer.tronHex);
  console.log("================================================================");
  console.log(`👑 Seat 1 Final Balance: ${s1Bal.toFixed(2)} TROB`);
  console.log("🎉 ALL MEMBER WALLETS SUCCESSFULLY FUNDED WITH >= 900 TROB!");
  console.log("================================================================");
}

main().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
