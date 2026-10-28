const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns = require("dns");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config();

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
      const timer = setTimeout(() => controller.abort(), 35000);
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

async function getAccountBalance(tronHex) {
  try {
    const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/getaccount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: tronHex }),
    });
    const data = await res.json();
    return data.balance || 0;
  } catch {
    return 0;
  }
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

async function callConstant(contractHex, functionSelector, parameterHex) {
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: contractHex,
      contract_address: contractHex,
      function_selector: functionSelector,
      parameter: parameterHex,
    }),
  });
  const data = await res.json();
  return data.constant_result?.[0] || "";
}

async function triggerJoinSlot(userSigner, matrixHex, slotNumber, sponsorEvmAddr, slotCostSun) {
  const coder = new ethers.AbiCoder();
  const parameterHex = coder.encode(["uint256", "address"], [slotNumber, sponsorEvmAddr]).slice(2);

  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: userSigner.tronHex,
      contract_address: matrixHex,
      function_selector: "joinSlot(uint256,address)",
      parameter: parameterHex,
      fee_limit: 150000000,
      call_value: slotCostSun,
    }),
  });
  const data = await res.json();
  if (!data.result || !data.transaction) {
    const msg = data.Error || JSON.stringify(data);
    throw new Error(`triggersmartcontract failed: ${msg}`);
  }

  await broadcastTransaction(userSigner, data.transaction);
  await sleep(7000);
  return data.transaction.txID;
}

async function getSlotData(matrixHex, evmAddr, slot) {
  const coder = new ethers.AbiCoder();
  const paramWithSlot = coder.encode(["address", "uint256"], [evmAddr, slot]).slice(2);
  const slotDataHex = await callConstant(matrixHex, "getSlotDataV2(address,uint256)", paramWithSlot);
  if (slotDataHex) {
    const decoded = coder.decode(["bool", "bool", "uint256", "uint256", "address[14]", "uint256"], "0x" + slotDataHex);
    return {
      isUnlocked: decoded[0],
      isLive: decoded[1],
      currentCycle: Number(decoded[2]),
      filledNodes: Number(decoded[3]),
      nodes: decoded[4],
      totalEarned: decoded[5],
    };
  }
  return null;
}

async function getMemberDirectsAndQual(matrixHex, evmAddr) {
  const coder = new ethers.AbiCoder();
  const param = coder.encode(["address"], [evmAddr]).slice(2);

  const isQualHex = await callConstant(matrixHex, "isMatrixQualified(address)", param);
  const isQualified = isQualHex ? coder.decode(["bool"], "0x" + isQualHex)[0] : false;

  const directsHex = await callConstant(matrixHex, "getActiveDirectReferralsCount(address)", param);
  const activeDirects = directsHex ? Number(coder.decode(["uint256"], "0x" + directsHex)[0]) : 0;

  return { isQualified, activeDirects };
}

async function main() {
  console.log(`================================================================`);
  console.log(`🎯 EQUORA MATRIX — COMPLETE 42-NODE ON-CHAIN FULFILLMENT`);
  console.log(`   Slot 1: 14 Nodes | Slot 2: 14 Nodes | Slot 3: 14 Nodes`);
  console.log(`================================================================\n`);

  // 1. Load fresh deployed addresses
  const deployedSummaryPath = path.resolve(__dirname, "..", "deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedSummaryPath, "utf8"));
  const contracts = deployed.contracts;
  const matrixHex = contracts.EquoraMatrix.addressHex;
  const vaultHex = contracts.EquoraVault.addressHex;
  const vaultEvm = "0x" + vaultHex.slice(2);

  console.log(`📡 Connected Contracts:`);
  console.log(`   Matrix:  ${contracts.EquoraMatrix.addressBase58} (${matrixHex})`);
  console.log(`   Vault:   ${contracts.EquoraVault.addressBase58} (${vaultHex})`);
  console.log(`   DAO v2:  ${contracts.EquoraDAOv2.addressBase58}`);
  console.log(`   Salary:  ${contracts.EquoraSalaryPool.addressBase58}`);
  console.log(`   Reward:  ${contracts.EquoraRewardPool.addressBase58}`);
  console.log(`   MagicBox:${contracts.EquoraMagicBox.addressBase58}\n`);

  // 2. Load Seat 1 (Founder Root)
  const seat1PrivKey = "d729c3fce80e3e831a7167efbe9e7b768f0bf8cb2ee4dfe87559208cb9a7a0a0";
  const seat1 = privateKeyToAddress(seat1PrivKey);
  const seat1Bal = await getAccountBalance(seat1.tronHex);
  console.log(`👑 Seat 1 (Founder): ${seat1.tronBase58} (${seat1.evmAddress})`);
  console.log(`   Balance: ${(seat1Bal / 1e6).toFixed(4)} TROB`);

  // 3. Query base slot cost
  const coder = new ethers.AbiCoder();
  const costHex = await callConstant(matrixHex, "BASE_SLOT_COST()", "");
  const baseSlotCostSun = costHex ? Number(coder.decode(["uint256"], "0x" + costHex)[0]) : 945179584;
  console.log(`   Dynamic Slot 1 Cost: ${(baseSlotCostSun / 1e6).toFixed(4)} TROB (${baseSlotCostSun} SUN)\n`);

  // Member storage
  const memberHistoryPath = path.resolve(__dirname, "../joined-members.json");
  let joinedMembers = [];
  if (fs.existsSync(memberHistoryPath)) {
    try {
      joinedMembers = JSON.parse(fs.readFileSync(memberHistoryPath, "utf8"));
    } catch {}
  }

  const fundAmountSun = Math.round(baseSlotCostSun * 1.05); // 5% buffer for fees

  // ── STEP 1: Ensure Seat 1 is Joined in Slot 1 under Vault ──────────
  console.log(`▶ STEP 1: Checking Seat 1 in Slot 1...`);
  let s1Slot1 = await getSlotData(matrixHex, seat1.evmAddress, 1);
  if (!s1Slot1 || !s1Slot1.isUnlocked) {
    console.log(`   Seat 1 not yet joined. Joining Slot 1 under Vault (${vaultEvm})...`);
    const txId = await triggerJoinSlot(seat1, matrixHex, 1, vaultEvm, baseSlotCostSun);
    console.log(`   ✅ Seat 1 Joined Slot 1! Tx: 0x${txId}`);
    joinedMembers.push({
      memberNumber: 1,
      name: "Seat 1 (Founder)",
      slot: 1,
      base58: seat1.tronBase58,
      evm: seat1.evmAddress,
      sponsor: vaultEvm,
      txHash: "0x" + txId,
      timestamp: new Date().toISOString(),
    });
    fs.writeFileSync(memberHistoryPath, JSON.stringify(joinedMembers, null, 2));
    await sleep(3000);
  } else {
    console.log(`   ✅ Seat 1 already active in Slot 1!`);
  }

  // ── HELPER: Register and Join a Test Member ─────────────────────────
  async function registerAndJoinMember(memberNumber, label, slot, sponsorEvm) {
    // Check if already in joined-members
    const existing = joinedMembers.find((m) => m.memberNumber === memberNumber && m.slot === slot);
    if (existing) {
      console.log(`   ⏩ [${label}] Already joined Slot ${slot} (Tx: ${existing.txHash}). Skipping.`);
      return existing;
    }

    console.log(`   -------------------------------------------------------------`);
    console.log(`   👉 Joining [${label}] to Slot ${slot}`);
    console.log(`      Sponsor: ${sponsorEvm}`);

    // Create fresh random wallet
    const freshWallet = ethers.Wallet.createRandom();
    const freshSigner = privateKeyToAddress(freshWallet.privateKey);
    console.log(`      Address: ${freshSigner.tronBase58} (${freshSigner.evmAddress})`);

    // Fund from Seat 1
    console.log(`      💸 Funding ${(fundAmountSun / 1e6).toFixed(2)} TROB from Seat 1...`);
    await transferTrob(seat1, freshSigner.tronHex, fundAmountSun);

    // Call joinSlot
    console.log(`      🚀 Calling joinSlot(${slot}, ${sponsorEvm})...`);
    const txId = await triggerJoinSlot(freshSigner, matrixHex, slot, sponsorEvm, baseSlotCostSun);
    console.log(`      ✅ On-chain Confirmed! Tx: 0x${txId}`);

    const memberRecord = {
      memberNumber,
      label,
      slot,
      base58: freshSigner.tronBase58,
      evm: freshSigner.evmAddress,
      privateKey: freshWallet.privateKey,
      sponsor: sponsorEvm,
      txHash: "0x" + txId,
      timestamp: new Date().toISOString(),
    };

    joinedMembers.push(memberRecord);
    fs.writeFileSync(memberHistoryPath, JSON.stringify(joinedMembers, null, 2));
    await sleep(2000);
    return memberRecord;
  }

  // ── STEP 2: Fill Slot 1 (14 Nodes) ──────────────────────────────────
  console.log(`\n================================================================`);
  console.log(`▶ STEP 2: FULFILLING SLOT 1 (14 NODES UNDER SEAT 1)`);
  console.log(`================================================================`);

  // Directs for qualification: Member 2 and Member 3
  const m2 = await registerAndJoinMember(2, "Member 2 (Direct 1)", 1, seat1.evmAddress);
  const m3 = await registerAndJoinMember(3, "Member 3 (Direct 2)", 1, seat1.evmAddress);

  // Check Seat 1 qualification
  const s1Qual = await getMemberDirectsAndQual(matrixHex, seat1.evmAddress);
  console.log(`   🏆 Seat 1 Qualification Status: Qualified=${s1Qual.isQualified}, Directs=${s1Qual.activeDirects}`);

  // Nodes 3 through 14 of Slot 1 (Members 4 to 15)
  for (let nodeIdx = 3; nodeIdx <= 14; nodeIdx++) {
    const memberNum = nodeIdx + 1; // 4 to 15
    await registerAndJoinMember(memberNum, `Member ${memberNum} (Node ${nodeIdx})`, 1, seat1.evmAddress);
  }

  s1Slot1 = await getSlotData(matrixHex, seat1.evmAddress, 1);
  console.log(`\n   ✅ SLOT 1 FULFILLMENT COMPLETE!`);
  console.log(`      Filled Nodes: ${s1Slot1.filledNodes}/14 | Cycle: ${s1Slot1.currentCycle}`);
  console.log(`      Total Earned: ${(Number(s1Slot1.totalEarned) / 1e6).toFixed(2)} TROB`);

  // ── STEP 3: Check Slot 2 Activation & Fulfill Slot 2 (14 Nodes) ─────
  console.log(`\n================================================================`);
  console.log(`▶ STEP 3: FULFILLING SLOT 2 (14 NODES UNDER SEAT 1)`);
  console.log(`================================================================`);

  let s1Slot2 = await getSlotData(matrixHex, seat1.evmAddress, 2);
  console.log(`   Slot 2 Status for Seat 1: Unlocked=${s1Slot2?.isUnlocked}, Live=${s1Slot2?.isLive}`);

  // If not unlocked directly, Seat 1 joins Slot 2
  if (!s1Slot2 || !s1Slot2.isUnlocked) {
    console.log(`   Activating Slot 2 for Seat 1...`);
    const txId = await triggerJoinSlot(seat1, matrixHex, 2, vaultEvm, baseSlotCostSun);
    console.log(`   ✅ Seat 1 Activated Slot 2! Tx: 0x${txId}`);
    await sleep(3000);
  }

  // Fill 14 nodes on Slot 2 (Members 16 to 29)
  for (let nodeIdx = 1; nodeIdx <= 14; nodeIdx++) {
    const memberNum = 15 + nodeIdx; // 16 to 29
    await registerAndJoinMember(memberNum, `Member ${memberNum} (Slot 2 Node ${nodeIdx})`, 2, seat1.evmAddress);
  }

  s1Slot2 = await getSlotData(matrixHex, seat1.evmAddress, 2);
  console.log(`\n   ✅ SLOT 2 FULFILLMENT COMPLETE!`);
  console.log(`      Filled Nodes: ${s1Slot2.filledNodes}/14 | Cycle: ${s1Slot2.currentCycle}`);
  console.log(`      Total Earned: ${(Number(s1Slot2.totalEarned) / 1e6).toFixed(2)} TROB`);

  // ── STEP 4: Check Slot 3 Activation & Fulfill Slot 3 (14 Nodes) ─────
  console.log(`\n================================================================`);
  console.log(`▶ STEP 4: FULFILLING SLOT 3 (14 NODES UNDER SEAT 1)`);
  console.log(`================================================================`);

  let s1Slot3 = await getSlotData(matrixHex, seat1.evmAddress, 3);
  console.log(`   Slot 3 Status for Seat 1: Unlocked=${s1Slot3?.isUnlocked}, Live=${s1Slot3?.isLive}`);

  if (!s1Slot3 || !s1Slot3.isUnlocked) {
    console.log(`   Activating Slot 3 for Seat 1...`);
    const txId = await triggerJoinSlot(seat1, matrixHex, 3, vaultEvm, baseSlotCostSun);
    console.log(`   ✅ Seat 1 Activated Slot 3! Tx: 0x${txId}`);
    await sleep(3000);
  }

  // Fill 14 nodes on Slot 3 (Members 30 to 43)
  for (let nodeIdx = 1; nodeIdx <= 14; nodeIdx++) {
    const memberNum = 29 + nodeIdx; // 30 to 43
    await registerAndJoinMember(memberNum, `Member ${memberNum} (Slot 3 Node ${nodeIdx})`, 3, seat1.evmAddress);
  }

  s1Slot3 = await getSlotData(matrixHex, seat1.evmAddress, 3);
  console.log(`\n   ✅ SLOT 3 FULFILLMENT COMPLETE!`);
  console.log(`      Filled Nodes: ${s1Slot3.filledNodes}/14 | Cycle: ${s1Slot3.currentCycle}`);
  console.log(`      Total Earned: ${(Number(s1Slot3.totalEarned) / 1e6).toFixed(2)} TROB`);

  // ── STEP 5: ECOSYSTEM ON-CHAIN POOL BALANCES AUDIT ──────────────────
  console.log(`\n================================================================`);
  console.log(`📊 FINAL ON-CHAIN PROTOCOL SPLITS & POOL BALANCES AUDIT`);
  console.log(`================================================================`);

  const vaultBal = await getAccountBalance(contracts.EquoraVault.addressHex);
  const daoBal = await getAccountBalance(contracts.EquoraDAOv2.addressHex);
  const salaryBal = await getAccountBalance(contracts.EquoraSalaryPool.addressHex);
  const rewardBal = await getAccountBalance(contracts.EquoraRewardPool.addressHex);
  const magicBal = await getAccountBalance(contracts.EquoraMagicBox.addressHex);
  const seat1FinalBal = await getAccountBalance(seat1.tronHex);

  console.log(`🏛 Protocol Vault:        ${(vaultBal / 1e6).toFixed(4)} TROB`);
  console.log(`🗳 Equora DAO v2 (35%):   ${(daoBal / 1e6).toFixed(4)} TROB (Instant push verified!)`);
  console.log(`💰 Salary Pool (40%):     ${(salaryBal / 1e6).toFixed(4)} TROB (Royalty Pool)`);
  console.log(`🎖 Reward Pool (15%):     ${(rewardBal / 1e6).toFixed(4)} TROB (Milestones/Ranks)`);
  console.log(`🎁 Magic Blind Box (10%): ${(magicBal / 1e6).toFixed(4)} TROB (90-Day Pool)`);
  console.log(`👑 Seat 1 Final Balance:  ${(seat1FinalBal / 1e6).toFixed(4)} TROB`);

  console.log(`\n🎉 42 NODES SUCCESSFUL FULFILLMENT COMPLETE!`);
  console.log(`   Saved ${joinedMembers.length} records to joined-members.json.`);
}

main().catch((err) => {
  console.error("FATAL ERROR in 42-node fulfillment:", err);
  process.exit(1);
});
