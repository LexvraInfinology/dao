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
  await sleep(7000);
}

async function triggerJoinSlot(userSigner, matrixHex, sponsorEvmAddr, slotCostSun) {
  const coder = new ethers.AbiCoder();
  const parameterHex = coder.encode(["uint256", "address"], [1, sponsorEvmAddr]).slice(2);

  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: userSigner.tronHex,
      contract_address: matrixHex,
      function_selector: "joinSlot(uint256,address)",
      parameter: parameterHex,
      fee_limit: 100000000,
      call_value: slotCostSun,
    }),
  });
  const data = await res.json();
  if (!data.result || !data.transaction) {
    throw new Error(`triggersmartcontract failed: ${JSON.stringify(data)}`);
  }

  await broadcastTransaction(userSigner, data.transaction);
  await sleep(8000);
  return data.transaction.txID;
}

async function main() {
  const privKey = process.env.DEPLOYER_PRIVATE_KEY;
  const deployer = privateKeyToAddress(privKey);

  const deployedSummaryPath = path.resolve(__dirname, "..", "deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedSummaryPath, "utf8"));
  const matrixHex = deployed.contracts.EquoraMatrix.addressHex;

  const seat1EvmAddr = "0x67b282b09c3aac1b9fbff6b4ec14ea2b72573c02";
  const slotCostSun = 535714285;

  console.log(`🚀 Joining Member 7 under Seat 1 (${seat1EvmAddr})...`);
  const m7Wallet = ethers.Wallet.createRandom();
  const m7Signer = privateKeyToAddress(m7Wallet.privateKey);

  console.log(`   Funding 537 TROB to Member 7 (${m7Signer.tronBase58})...`);
  await transferTrob(deployer, m7Signer.tronHex, 537_000_000);

  console.log(`   Executing joinSlot(1, ${seat1EvmAddr})...`);
  const tx7 = await triggerJoinSlot(m7Signer, matrixHex, seat1EvmAddr, slotCostSun);
  console.log(`   ✅ Confirmed on-chain! Tx: 0x${tx7}`);

  const memberHistoryPath = path.resolve(__dirname, "../joined-members.json");
  let joinedMembers = JSON.parse(fs.readFileSync(memberHistoryPath, "utf8"));
  joinedMembers.push({
    memberNumber: 7,
    base58: m7Signer.tronBase58,
    evm: m7Signer.evmAddress,
    privateKey: m7Wallet.privateKey,
    sponsor: seat1EvmAddr,
    txHash: "0x" + tx7,
    positionFilled: 4,
    timestamp: new Date().toISOString()
  });
  fs.writeFileSync(memberHistoryPath, JSON.stringify(joinedMembers, null, 2));
  console.log(`🎉 Member 7 successfully joined and placed in Seat 1 board!`);
}

main().catch(console.error);
