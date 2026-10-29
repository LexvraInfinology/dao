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
  await sleep(6000);
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
  await sleep(7000);
  return data.transaction.txID;
}

async function getMemberStatus(matrixHex, evmAddr) {
  const coder = new ethers.AbiCoder();
  const param = coder.encode(["address"], [evmAddr]).slice(2);
  const paramWithSlot = coder.encode(["address", "uint256"], [evmAddr, 1]).slice(2);

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

  return { isQualified, activeDirects, filledNodes, nodes, slotEarned };
}

async function main() {
  // Seat 1 credentials
  const seat1PrivKey = "d729c3fce80e3e831a7167efbe9e7b768f0bf8cb2ee4dfe87559208cb9a7a0a0";
  const seat1Signer = privateKeyToAddress(seat1PrivKey);

  const deployedSummaryPath = path.resolve(__dirname, "..", "deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedSummaryPath, "utf8"));
  const matrixHex = deployed.contracts.EquoraMatrix.addressHex;

  const slotCostSun = 535714285; // $30 USD pegged cost (535.714285 SUN)
  const fundAmountSun = 900_000_000; // 900 TROB as instructed by user!

  console.log(`================================================================`);
  console.log(`🚀 EXPANDING MATRIX ON-CHAIN WITH 900 TROB PER WALLET FUNDING`);
  console.log(`   Funding Wallet (Seat 1): ${seat1Signer.tronBase58}`);
  console.log(`   Matrix Contract:         ${deployed.contracts.EquoraMatrix.addressBase58}`);
  console.log(`   Per-Wallet Fund Amount:  900 TROB`);
  console.log(`================================================================\n`);

  // Load existing joined members
  const memberHistoryPath = path.resolve(__dirname, "../joined-members.json");
  let joinedMembers = [];
  if (fs.existsSync(memberHistoryPath)) {
    joinedMembers = JSON.parse(fs.readFileSync(memberHistoryPath, "utf8"));
  }

  const member2 = joinedMembers.find((m) => m.memberNumber === 2);
  const member3 = joinedMembers.find((m) => m.memberNumber === 3);

  if (!member2 || !member3) {
    throw new Error("Member 2 and Member 3 must exist in joined-members.json");
  }

  // Define new members to register & join:
  // 1. Member 5 under Seat 1 (fills Node 5 on Seat 1 -> Stage 1 Slot 2 auto-unlock reserve)
  // 2. Member 6 under Seat 1 (fills Node 6 on Seat 1 -> 100% DIRECT OWNER PAYOUT of $30 to Seat 1!)
  // 3. Member 8 under Member 2 (fills Node 1 of Member 2)
  // 4. Member 9 under Member 2 (fills Node 2 of Member 2 -> Member 2 QUALIFIED!)
  // 5. Member 10 under Member 3 (fills Node 1 of Member 3)
  // 6. Member 11 under Member 3 (fills Node 2 of Member 3 -> Member 3 QUALIFIED!)

  const joinQueue = [
    {
      memberNumber: 5,
      label: "Member 5",
      sponsorEvm: seat1Signer.evmAddress,
      sponsorName: "Seat 1 (Fills Node 5 on Seat 1 -> Stage 1 Slot 2 Auto-Reserve)",
    },
    {
      memberNumber: 6,
      label: "Member 6",
      sponsorEvm: seat1Signer.evmAddress,
      sponsorName: "Seat 1 (Fills Node 6 on Seat 1 -> 100% DIRECT OWNER PAYOUT to Seat 1!)",
    },
    {
      memberNumber: 8,
      label: "Member 8",
      sponsorEvm: member2.evm,
      sponsorName: "Member 2 (Fills Node 1 on Member 2 Board)",
    },
    {
      memberNumber: 9,
      label: "Member 9",
      sponsorEvm: member2.evm,
      sponsorName: "Member 2 (Fills Node 2 on Member 2 Board -> Member 2 QUALIFIED!)",
    },
    {
      memberNumber: 10,
      label: "Member 10",
      sponsorEvm: member3.evm,
      sponsorName: "Member 3 (Fills Node 1 on Member 3 Board)",
    },
    {
      memberNumber: 11,
      label: "Member 11",
      sponsorEvm: member3.evm,
      sponsorName: "Member 3 (Fills Node 2 on Member 3 Board -> Member 3 QUALIFIED!)",
    },
  ];

  for (const item of joinQueue) {
    // Check if already joined
    const existing = joinedMembers.find((m) => m.memberNumber === item.memberNumber);
    if (existing) {
      console.log(`⏩ ${item.label} already joined on-chain (tx: ${existing.txHash}). Skipping.`);
      continue;
    }

    console.log(`----------------------------------------------------------------`);
    console.log(`👉 Joining ${item.label}`);
    console.log(`   Sponsor: ${item.sponsorName}`);

    // Create a fresh random wallet for this member
    const newWallet = ethers.Wallet.createRandom();
    const newSigner = privateKeyToAddress(newWallet.privateKey);
    console.log(`   Address: ${newSigner.tronBase58} (${newSigner.evmAddress})`);

    // Step A: Fund 900 TROB from Seat 1
    console.log(`   💸 Funding 900 TROB from Seat 1...`);
    await transferTrob(seat1Signer, newSigner.tronHex, fundAmountSun);
    console.log(`      ✅ 900 TROB funded!`);

    // Step B: Call joinSlot(1, sponsor)
    console.log(`   🚀 Calling joinSlot(1, ${item.sponsorEvm})...`);
    const txId = await triggerJoinSlot(newSigner, matrixHex, item.sponsorEvm, slotCostSun);
    console.log(`      ✅ Joined on-chain! Tx: 0x${txId}`);

    joinedMembers.push({
      memberNumber: item.memberNumber,
      base58: newSigner.tronBase58,
      evm: newSigner.evmAddress,
      privateKey: newWallet.privateKey,
      sponsor: item.sponsorEvm,
      txHash: "0x" + txId,
      timestamp: new Date().toISOString(),
    });

    // Save history progressively
    fs.writeFileSync(memberHistoryPath, JSON.stringify(joinedMembers, null, 2));
    await sleep(2000);
  }

  // --- FINAL ON-CHAIN AUDIT ---
  console.log(`\n================================================================`);
  console.log(`📊 FINAL ON-CHAIN MATRIX TREE AUDIT`);
  console.log(`================================================================`);

  // Seat 1
  const s1 = await getMemberStatus(matrixHex, seat1Signer.evmAddress);
  const s1EarnedTrob = Number(ethers.formatUnits(s1.slotEarned, 6));
  const s1EarnedUsd = s1EarnedTrob * 0.056;
  console.log(`👑 SEAT 1 (${seat1Signer.tronBase58}):`);
  console.log(`   - Qualified:      ${s1.isQualified} (Active Directs: ${s1.activeDirects})`);
  console.log(`   - Filled Nodes:   ${s1.filledNodes} / 14`);
  console.log(`   - Total Earned:   $${s1EarnedUsd.toFixed(2)} USD (${s1EarnedTrob.toFixed(2)} TROB)`);
  for (let i = 0; i < s1.filledNodes; i++) {
    console.log(`     Node ${i + 1} (P${i + 1}): ${s1.nodes[i]}`);
  }

  // Member 2
  const s2 = await getMemberStatus(matrixHex, member2.evm);
  const s2EarnedTrob = Number(ethers.formatUnits(s2.slotEarned, 6));
  console.log(`\n🥈 MEMBER 2 (${member2.base58}):`);
  console.log(`   - Qualified:      ${s2.isQualified} (Active Directs: ${s2.activeDirects})`);
  console.log(`   - Filled Nodes:   ${s2.filledNodes} / 14`);
  console.log(`   - Total Earned:   ${s2EarnedTrob.toFixed(2)} TROB`);

  // Member 3
  const s3 = await getMemberStatus(matrixHex, member3.evm);
  const s3EarnedTrob = Number(ethers.formatUnits(s3.slotEarned, 6));
  console.log(`\n🥉 MEMBER 3 (${member3.base58}):`);
  console.log(`   - Qualified:      ${s3.isQualified} (Active Directs: ${s3.activeDirects})`);
  console.log(`   - Filled Nodes:   ${s3.filledNodes} / 14`);
  console.log(`   - Total Earned:   ${s3EarnedTrob.toFixed(2)} TROB`);

  console.log(`================================================================`);
  console.log(`🎉 STEP 1 COMPLETED: ALL WALLETS FUNDED WITH 900 TROB & JOINED ON-CHAIN!`);
}

main().catch((err) => {
  console.error("FATAL ERROR in execution:", err);
  process.exit(1);
});
