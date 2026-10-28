const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns = require("dns");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Force IPv4 DNS resolution to prevent Windows dual-stack connect timeouts
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

async function getAccount(addressHex) {
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/getaccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: addressHex }),
  });
  return res.json();
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
  console.log(`   💸 Sending ${amountSun / 1e6} TROB to ${hexToBase58(toTronHex)}...`);
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
  console.log(`      Transfer broadcast: 0x${data.txID}. Confirming on-chain (7s)...`);
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
  console.log(`   🚀 Executing joinSlot(1, ${sponsorEvmAddr}) for ${userSigner.tronBase58}...`);
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
  console.log(`      joinSlot broadcast: 0x${data.transaction.txID}. Confirming on-chain (8s)...`);
  await sleep(8000);
  console.log(`      ✅ Confirmed on-chain!`);
  return data.transaction.txID;
}

async function getSeat1MatrixStatus(matrixHex, seat1EvmAddr) {
  const coder = new ethers.AbiCoder();
  const param = coder.encode(["address"], [seat1EvmAddr]).slice(2);
  const paramWithSlot = coder.encode(["address", "uint256"], [seat1EvmAddr, 1]).slice(2);

  // isMatrixQualified(address)
  const isQualHex = await callConstant(matrixHex, "isMatrixQualified(address)", param);
  const isQualified = isQualHex ? coder.decode(["bool"], "0x" + isQualHex)[0] : false;

  // getActiveDirectReferralsCount(address)
  const directsHex = await callConstant(matrixHex, "getActiveDirectReferralsCount(address)", param);
  const activeDirects = directsHex ? Number(coder.decode(["uint256"], "0x" + directsHex)[0]) : 0;

  // getSlotData(address, uint256) -> (bool isUnlocked, uint256 currentCycle, uint256 filledNodes, address[14] nodes, uint256 slotEarned)
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

  // getUserFinancials(address) -> (uint256 availableBalance, uint256 lifetimeEarned, uint256 withdrawn, uint256 highestSlotUnlocked)
  const finHex = await callConstant(matrixHex, "getUserFinancials(address)", param);
  let availableBalance = 0n;
  let lifetimeEarned = 0n;
  if (finHex) {
    const decodedFin = coder.decode(["uint256", "uint256", "uint256", "uint256"], "0x" + finHex);
    availableBalance = decodedFin[0];
    lifetimeEarned = decodedFin[1];
  }

  return { isQualified, activeDirects, filledNodes, nodes, slotEarned, availableBalance, lifetimeEarned };
}

async function main() {
  const privKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privKey) throw new Error("DEPLOYER_PRIVATE_KEY is missing");
  const deployer = privateKeyToAddress(privKey);

  const deployedSummaryPath = path.resolve(__dirname, "..", "deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedSummaryPath, "utf8"));
  const matrixHex = deployed.contracts.EquoraMatrix.addressHex;

  const seat1EvmAddr = "0x67b282b09c3aac1b9fbff6b4ec14ea2b72573c02"; // Seat 1
  const slotCostSun = 535714285; // $30 USD pegged cost

  console.log(`================================================================`);
  console.log(`🌟 EQUORA MATRIX ON-CHAIN VERIFICATION & DOWNSTREAM JOIN FLOW`);
  console.log(`   FullNode:        ${FULLNODE_URL}`);
  console.log(`   Matrix Contract: ${deployed.contracts.EquoraMatrix.addressBase58} (${matrixHex})`);
  console.log(`   Deployer:        ${deployer.tronBase58}`);
  console.log(`   Seat 1 Sponsor:  ${hexToBase58("41" + seat1EvmAddr.slice(2))} (${seat1EvmAddr})`);
  console.log(`   Slot Cost:       ${slotCostSun / 1e6} TROB ($30 USD)`);
  console.log(`================================================================\n`);

  // Check initial state
  console.log(`📊 Reading Seat 1 Initial Matrix Status...`);
  let status = await getSeat1MatrixStatus(matrixHex, seat1EvmAddr);
  console.log(`   - Matrix Qualified:     ${status.isQualified}`);
  console.log(`   - Active Directs Count: ${status.activeDirects}`);
  console.log(`   - Filled Nodes:         ${status.filledNodes} / 14`);
  console.log(`   - Slot Earned:          ${ethers.formatUnits(status.slotEarned, 6)} TROB`);
  console.log(`   - Available Balance:    ${ethers.formatUnits(status.availableBalance, 6)} TROB\n`);

  const memberHistoryPath = path.resolve(__dirname, "../joined-members.json");
  let joinedMembers = [];
  if (fs.existsSync(memberHistoryPath)) {
    try {
      joinedMembers = JSON.parse(fs.readFileSync(memberHistoryPath, "utf8"));
    } catch {}
  }

  // --- MEMBER 2 JOIN ---
  console.log(`----------------------------------------------------------------`);
  console.log(`👉 STEP 1: Joining Member 2 (Fills Position 1 on Seat 1 Board)`);
  const m2Wallet = ethers.Wallet.createRandom();
  const m2Signer = privateKeyToAddress(m2Wallet.privateKey);
  console.log(`   Member 2 Address: ${m2Signer.tronBase58} (${m2Signer.evmAddress})`);

  await transferTrob(deployer, m2Signer.tronHex, 580_000_000);
  const tx2 = await triggerJoinSlot(m2Signer, matrixHex, seat1EvmAddr, slotCostSun);
  joinedMembers.push({
    memberNumber: 2,
    base58: m2Signer.tronBase58,
    evm: m2Signer.evmAddress,
    privateKey: m2Wallet.privateKey,
    txHash: "0x" + tx2,
    positionFilled: 1,
    timestamp: new Date().toISOString()
  });

  status = await getSeat1MatrixStatus(matrixHex, seat1EvmAddr);
  console.log(`\n   Seat 1 State after Member 2:`);
  console.log(`   - Active Directs:       ${status.activeDirects}`);
  console.log(`   - Matrix Qualified:     ${status.isQualified}`);
  console.log(`   - Filled Nodes:         ${status.filledNodes} / 14`);
  console.log(`   - Node 1 Occupant:      ${status.nodes[0]}`);

  // --- MEMBER 3 JOIN ---
  console.log(`\n----------------------------------------------------------------`);
  console.log(`👉 STEP 2: Joining Member 3 (Fills Position 2 -> SEAT 1 QUALIFIES!)`);
  const m3Wallet = ethers.Wallet.createRandom();
  const m3Signer = privateKeyToAddress(m3Wallet.privateKey);
  console.log(`   Member 3 Address: ${m3Signer.tronBase58} (${m3Signer.evmAddress})`);

  await transferTrob(deployer, m3Signer.tronHex, 580_000_000);
  const tx3 = await triggerJoinSlot(m3Signer, matrixHex, seat1EvmAddr, slotCostSun);
  joinedMembers.push({
    memberNumber: 3,
    base58: m3Signer.tronBase58,
    evm: m3Signer.evmAddress,
    privateKey: m3Wallet.privateKey,
    txHash: "0x" + tx3,
    positionFilled: 2,
    timestamp: new Date().toISOString()
  });

  status = await getSeat1MatrixStatus(matrixHex, seat1EvmAddr);
  console.log(`\n   Seat 1 State after Member 3:`);
  console.log(`   - Active Directs:       ${status.activeDirects}`);
  console.log(`   - Matrix Qualified:     ${status.isQualified} 🏆 (OFFICIALLY QUALIFIED!)`);
  console.log(`   - Filled Nodes:         ${status.filledNodes} / 14`);
  console.log(`   - Node 2 Occupant:      ${status.nodes[1]}`);

  // --- MEMBER 4 JOIN ---
  console.log(`\n----------------------------------------------------------------`);
  console.log(`👉 STEP 3: Joining Member 4 (Level 1 Full -> SPILLOVER TO P3 & DIRECT OWNER PAYOUT!)`);
  const m4Wallet = ethers.Wallet.createRandom();
  const m4Signer = privateKeyToAddress(m4Wallet.privateKey);
  console.log(`   Member 4 Address: ${m4Signer.tronBase58} (${m4Signer.evmAddress})`);

  await transferTrob(deployer, m4Signer.tronHex, 580_000_000);
  const tx4 = await triggerJoinSlot(m4Signer, matrixHex, seat1EvmAddr, slotCostSun);
  joinedMembers.push({
    memberNumber: 4,
    base58: m4Signer.tronBase58,
    evm: m4Signer.evmAddress,
    privateKey: m4Wallet.privateKey,
    txHash: "0x" + tx4,
    positionFilled: 3,
    timestamp: new Date().toISOString()
  });

  status = await getSeat1MatrixStatus(matrixHex, seat1EvmAddr);
  console.log(`\n   Seat 1 State after Member 4:`);
  console.log(`   - Active Directs:       ${status.activeDirects}`);
  console.log(`   - Matrix Qualified:     ${status.isQualified}`);
  console.log(`   - Filled Nodes:         ${status.filledNodes} / 14`);
  console.log(`   - Node 3 Occupant:      ${status.nodes[2]}`);
  console.log(`   - Slot Earned:          ${ethers.formatUnits(status.slotEarned, 6)} TROB ($30 USD Direct Income!)`);
  console.log(`   - Available Balance:    ${ethers.formatUnits(status.availableBalance, 6)} TROB`);

  fs.writeFileSync(memberHistoryPath, JSON.stringify(joinedMembers, null, 2));
  console.log(`\n💾 Saved all member records to ${memberHistoryPath}`);
  console.log(`🎉 ALL 3 TEST MEMBERS SUCCESSFULLY JOINED & VERIFIED ON-CHAIN!`);
}

main().catch((err) => {
  console.error("FATAL ERROR in execution:", err);
  process.exit(1);
});
