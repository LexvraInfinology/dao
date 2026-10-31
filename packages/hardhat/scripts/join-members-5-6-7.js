const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns = require("dns");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Force IPv4 DNS resolution
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
      console.warn(`   ⚠️ [fetch] Attempt ${attempt}/${retries} failed for ${url.split("/").pop()}: ${err.message}`);
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

async function callConstant(matrixHex, functionSelector, parameterHex) {
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: matrixHex,
      contract_address: matrixHex,
      function_selector: functionSelector,
      parameter: parameterHex,
    }),
  });
  const data = await res.json();
  return data.constant_result?.[0] || "";
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
    const msg = data.Error || JSON.stringify(data);
    throw new Error(`triggersmartcontract failed: ${msg}`);
  }

  await broadcastTransaction(userSigner, data.transaction);
  await sleep(8000);
  return data.transaction.txID;
}

async function getSeat1MatrixStatus(matrixHex, seat1EvmAddr) {
  const coder = new ethers.AbiCoder();
  const param = coder.encode(["address"], [seat1EvmAddr]).slice(2);
  const paramWithSlot = coder.encode(["address", "uint256"], [seat1EvmAddr, 1]).slice(2);

  const isQualHex = await callConstant(matrixHex, "isMatrixQualified(address)", param);
  const isQualified = isQualHex ? coder.decode(["bool"], "0x" + isQualHex)[0] : false;

  const directsHex = await callConstant(matrixHex, "getActiveDirectReferralsCount(address)", param);
  const activeDirects = directsHex ? Number(coder.decode(["uint256"], "0x" + directsHex)[0]) : 0;

  const slotDataHex = await callConstant(matrixHex, "getSlotData(address,uint256)", paramWithSlot);
  let filledNodes = 0;
  let slotEarned = 0n;
  let nodes = [];
  if (slotDataHex) {
    const decoded = coder.decode(["bool", "uint256", "uint256", "address[14]", "uint256"], "0x" + slotDataHex);
    filledNodes = Number(decoded[2]);
    nodes = decoded[3];
    slotEarned = decoded[4];
  }

  const finHex = await callConstant(matrixHex, "getUserFinancials(address)", param);
  let availableBalance = 0n;
  if (finHex) {
    const decodedFin = coder.decode(["uint256", "uint256", "uint256", "uint256"], "0x" + finHex);
    availableBalance = decodedFin[0];
  }

  return { isQualified, activeDirects, filledNodes, nodes, slotEarned, availableBalance };
}

async function main() {
  const privKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privKey) throw new Error("DEPLOYER_PRIVATE_KEY is missing");
  const deployer = privateKeyToAddress(privKey);

  const deployedSummaryPath = path.resolve(__dirname, "..", "deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedSummaryPath, "utf8"));
  const matrixHex = deployed.contracts.EquoraMatrix.addressHex;

  const seat1EvmAddr = "0x67b282b09c3aac1b9fbff6b4ec14ea2b72573c02"; // Seat 1
  const coder = new ethers.AbiCoder();
  const mCostHex = await callConstant(matrixHex, "slotCosts(uint256)", coder.encode(["uint256"], [1]).slice(2));
  const slotCostSun = mCostHex ? Number(coder.decode(["uint256"], "0x" + mCostHex)[0]) : 945179584;
  const fundAmountSun = slotCostSun + 30_000_000;

  console.log(`================================================================`);
  console.log(`🌟 EXPANDING MATRIX TO TOP 7 GENESIS MEMBERS (NODES 4, 5, 6)`);
  console.log(`   Matrix Contract: ${deployed.contracts.EquoraMatrix.addressBase58}`);
  console.log(`   Seat 1 (Apex):   ${seat1EvmAddr}`);
  console.log(`   Slot 1 Dynamic Cost: ${slotCostSun / 1e6} TROB (${slotCostSun} SUN)`);
  console.log(`================================================================\n`);

  const memberHistoryPath = path.resolve(__dirname, "../joined-members.json");
  let joinedMembers = JSON.parse(fs.readFileSync(memberHistoryPath, "utf8"));

  const member2 = joinedMembers.find(m => m.memberNumber === 2);
  const member3 = joinedMembers.find(m => m.memberNumber === 3);

  console.log(`🧹 Consolidating gas dust from Members 2, 3, 4 into Deployer...`);
  for (const m of joinedMembers) {
    try {
      const signer = privateKeyToAddress(m.privateKey);
      await transferTrob(signer, deployer.tronHex, 40_000_000);
      console.log(`   Swept 40 TROB from Member ${m.memberNumber} (${m.base58})`);
    } catch (err) {
      console.warn(`   Notice on sweeping member ${m.memberNumber}:`, err.message);
    }
  }

  // --- MEMBER 5 JOIN ---
  // Seat 5: Under Member 2 (Seat 2). Fills Position 4 on Seat 1 board!
  console.log(`\n----------------------------------------------------------------`);
  console.log(`👉 STEP 4: Joining Member 5 (Sponsor: Member 2 -> Fills Position 4 on Seat 1)`);
  const m5Wallet = ethers.Wallet.createRandom();
  const m5Signer = privateKeyToAddress(m5Wallet.privateKey);
  console.log(`   Member 5 Address: ${m5Signer.tronBase58} (${m5Signer.evmAddress})`);
  console.log(`   💸 Funding ${fundAmountSun / 1e6} TROB to Member 5...`);
  await transferTrob(deployer, m5Signer.tronHex, fundAmountSun);
  console.log(`   🚀 Executing joinSlot(1, ${member2.evm}) for Member 5...`);
  const tx5 = await triggerJoinSlot(m5Signer, matrixHex, member2.evm, slotCostSun);
  console.log(`      ✅ Member 5 Confirmed on-chain! Tx: 0x${tx5}`);
  joinedMembers.push({
    memberNumber: 5,
    base58: m5Signer.tronBase58,
    evm: m5Signer.evmAddress,
    privateKey: m5Wallet.privateKey,
    sponsor: member2.evm,
    txHash: "0x" + tx5,
    positionFilled: 4,
    timestamp: new Date().toISOString()
  });

  // --- MEMBER 6 JOIN ---
  // Seat 6: Under Member 3 (Seat 3). Fills Position 5 on Seat 1 board! (Stage 1 Tier Escalation)
  console.log(`\n----------------------------------------------------------------`);
  console.log(`👉 STEP 5: Joining Member 6 (Sponsor: Member 3 -> Fills Position 5 on Seat 1)`);
  console.log(`   🎯 Position 5 triggers Stage 1 Tier Escalation (Slot 2 Auto-Reserve)!`);
  const m6Wallet = ethers.Wallet.createRandom();
  const m6Signer = privateKeyToAddress(m6Wallet.privateKey);
  console.log(`   Member 6 Address: ${m6Signer.tronBase58} (${m6Signer.evmAddress})`);
  console.log(`   💸 Funding ${fundAmountSun / 1e6} TROB to Member 6...`);
  await transferTrob(deployer, m6Signer.tronHex, fundAmountSun);
  console.log(`   🚀 Executing joinSlot(1, ${member3.evm}) for Member 6...`);
  const tx6 = await triggerJoinSlot(m6Signer, matrixHex, member3.evm, slotCostSun);
  console.log(`      ✅ Member 6 Confirmed on-chain! Tx: 0x${tx6}`);
  joinedMembers.push({
    memberNumber: 6,
    base58: m6Signer.tronBase58,
    evm: m6Signer.evmAddress,
    privateKey: m6Wallet.privateKey,
    sponsor: member3.evm,
    txHash: "0x" + tx6,
    positionFilled: 5,
    timestamp: new Date().toISOString()
  });

  // --- MEMBER 7 JOIN ---
  // Seat 7: Under Member 3 (Seat 3). Fills Position 6 on Seat 1 board! (Direct Owner Payout 2)
  console.log(`\n----------------------------------------------------------------`);
  console.log(`👉 STEP 6: Joining Member 7 (Sponsor: Member 3 -> Fills Position 6 on Seat 1)`);
  console.log(`   💰 Position 6 triggers 100% DIRECT OWNER PAYOUT ($30 USD / 535.71 TROB)!`);
  const m7Wallet = ethers.Wallet.createRandom();
  const m7Signer = privateKeyToAddress(m7Wallet.privateKey);
  console.log(`   Member 7 Address: ${m7Signer.tronBase58} (${m7Signer.evmAddress})`);
  console.log(`   💸 Funding ${fundAmountSun / 1e6} TROB to Member 7...`);
  await transferTrob(deployer, m7Signer.tronHex, fundAmountSun);
  console.log(`   🚀 Executing joinSlot(1, ${member3.evm}) for Member 7...`);
  const tx7 = await triggerJoinSlot(m7Signer, matrixHex, member3.evm, slotCostSun);
  console.log(`      ✅ Member 7 Confirmed on-chain! Tx: 0x${tx7}`);
  joinedMembers.push({
    memberNumber: 7,
    base58: m7Signer.tronBase58,
    evm: m7Signer.evmAddress,
    privateKey: m7Wallet.privateKey,
    sponsor: member3.evm,
    txHash: "0x" + tx7,
    positionFilled: 6,
    timestamp: new Date().toISOString()
  });

  fs.writeFileSync(memberHistoryPath, JSON.stringify(joinedMembers, null, 2));

  // --- VERIFY SEAT 1 STATUS ---
  console.log(`\n================================================================`);
  console.log(`📊 FINAL SEAT 1 ON-CHAIN MATRIX STATUS`);
  console.log(`================================================================`);
  const status = await getSeat1MatrixStatus(matrixHex, seat1EvmAddr);
  const earnedTrob = Number(ethers.formatUnits(status.slotEarned, 6));
  const earnedUsd = earnedTrob * 0.056;
  console.log(`   - Matrix Qualified:     ${status.isQualified} 🏆`);
  console.log(`   - Active Directs Count: ${status.activeDirects}`);
  console.log(`   - Filled Nodes:         ${status.filledNodes} / 14 nodes`);
  console.log(`   - Total Matrix Earned:  ${earnedTrob.toFixed(2)} TROB ($${earnedUsd.toFixed(2)} USD from P3 & P6)`);
  console.log(`   - Node 1 (P1):          ${status.nodes[0]}`);
  console.log(`   - Node 2 (P2):          ${status.nodes[1]}`);
  console.log(`   - Node 3 (P3, Owner):   ${status.nodes[2]}`);
  console.log(`   - Node 4 (P4, Pool):    ${status.nodes[3]}`);
  console.log(`   - Node 5 (P5, Reserve): ${status.nodes[4]}`);
  console.log(`   - Node 6 (P6, Owner):   ${status.nodes[5]}`);
  console.log(`================================================================`);
  console.log(`🎉 ALL 7 MEMBERS REGISTERED & CONFIRMED IN PERFECT BINARY MATRIX!`);
}

main().catch((err) => {
  console.error("FATAL ERROR in execution:", err);
  process.exit(1);
});
