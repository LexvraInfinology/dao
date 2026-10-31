const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

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

async function broadcastTransaction(signer, createData) {
  const txID = createData.txID;
  const sig = signer.signingKey.sign("0x" + txID);
  const vHex = sig.v.toString(16).padStart(2, "0");
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const res = await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
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
  console.log(`💸 Funding ${amountSun / 1e6} TROB to ${hexToBase58(toTronHex)}...`);
  const res = await fetch(`${FULLNODE_URL}/wallet/createtransaction`, {
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
  console.log(`   Transfer broadcast: 0x${data.txID}. Waiting 6s...`);
  await sleep(6000);
}

async function triggerJoinSlot(userSigner, matrixHex, sponsorEvmAddr, slotCostSun) {
  console.log(`🚀 Joining Slot 1 for ${userSigner.tronBase58} under sponsor ${sponsorEvmAddr}...`);
  const coder = new ethers.AbiCoder();
  const parameterHex = coder.encode(["uint256", "address"], [1, sponsorEvmAddr]).slice(2);

  const res = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
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
  console.log(`   joinSlot broadcast: 0x${data.transaction.txID}. Waiting 8s...`);
  await sleep(8000);
  console.log(`   ✅ Confirmed on-chain!`);
  return data.transaction.txID;
}

async function callConstant(contractHex, functionSelector, parameterHex = "") {
  const res = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: contractHex,
      contract_address: contractHex,
      function_selector: functionSelector,
      parameter: parameterHex.replace(/^0x/, ""),
    }),
  });
  const data = await res.json();
  return data.constant_result?.[0] || "";
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

  console.log(`======================================================`);
  console.log(`👥 JOINING MEMBER 2 UNDER SEAT 1`);
  console.log(`   Deployer: ${deployer.tronBase58}`);
  console.log(`   Matrix Contract: ${deployed.contracts.EquoraMatrix.addressBase58}`);
  console.log(`   Seat 1 Sponsor:  ${seat1EvmAddr}`);
  console.log(`   Slot 1 Dynamic Cost: ${slotCostSun / 1e6} TROB (${slotCostSun} SUN)`);
  console.log(`======================================================\n`);

  // Create Member 2 wallet
  const m2Wallet = ethers.Wallet.createRandom();
  const m2Signer = privateKeyToAddress(m2Wallet.privateKey);
  console.log(`👤 Member 2 Generated:`);
  console.log(`   Base58: ${m2Signer.tronBase58}`);
  console.log(`   Hex:    ${m2Signer.tronHex}`);

  // Fund Member 2 with exact slot cost + 30 TROB for gas
  const fundSun = slotCostSun + 30_000_000;
  await transferTrob(deployer, m2Signer.tronHex, fundSun);

  // Call joinSlot(1, seat1EvmAddr)
  const txHash = await triggerJoinSlot(m2Signer, matrixHex, seat1EvmAddr, slotCostSun);
  console.log(`\n🎉 Member 2 Successfully Joined! Tx: 0x${txHash}`);

  // Save member 2 details for reference
  const memberLog = {
    seatNumber: 2,
    base58: m2Signer.tronBase58,
    privateKey: m2Wallet.privateKey,
    txHash: "0x" + txHash,
    joinedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.resolve(__dirname, "../joined-members.json"), JSON.stringify([memberLog], null, 2));
}

main().catch(console.error);
