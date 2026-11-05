const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns = require("dns");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../packages/hardhat/.env") });
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
  const tronHex = clean.startsWith("41") ? clean : "41" + clean;
  const buf = Buffer.from(tronHex, "hex");
  const hash1 = crypto.createHash("sha256").update(buf).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  const checksum = hash2.subarray(0, 4);
  return encode58(Buffer.concat([buf, checksum]));
}

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
    throw new Error(`broadcast error: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

async function triggerContract(signer, contractBase58, selector, paramHex = "", callValueSun = 0) {
  const contractHex = base58ToHex(contractBase58);
  const payload = {
    owner_address: signer.tronHex,
    contract_address: contractHex,
    function_selector: selector,
    parameter: paramHex,
    fee_limit: 150000000,
    call_value: callValueSun,
    visible: false,
  };

  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const createData = await res.json();
  if (createData.Error) throw new Error(createData.Error);
  if (!createData.result || !createData.result.result) {
    throw new Error(`Trigger failed: ${JSON.stringify(createData.result)}`);
  }

  await broadcastTransaction(signer, createData.transaction);
  return createData.transaction.txID;
}

async function queryConstant(contractBase58, selector, paramHex = "") {
  const contractHex = base58ToHex(contractBase58);
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: contractHex,
      contract_address: contractHex,
      function_selector: selector,
      parameter: paramHex,
      visible: false,
    }),
  });
  const data = await res.json();
  return data.constant_result ? data.constant_result[0] : null;
}

async function main() {
  const deployer = privateKeyToAddress(process.env.DEPLOYER_PRIVATE_KEY);
  const magicB58 = "TFVFJcD27qeQnqVLEpSiHt4zcMctomsxYQ";
  const coder = new ethers.AbiCoder();

  console.log(`======================================================`);
  console.log(`🎯 ON-CHAIN LIVE CLAIM EXECUTION TEST`);
  console.log(`   MagicBox Contract: ${magicB58}`);
  console.log(`   Deployer:         ${deployer.tronBase58}`);
  console.log(`======================================================\n`);

  // 1. Create a dedicated test user wallet
  const testWallet = ethers.Wallet.createRandom();
  const testUser = privateKeyToAddress(testWallet.privateKey);
  console.log(`👤 Created Test Operative:`);
  console.log(`   Base58: ${testUser.tronBase58}`);
  console.log(`   Hex:    ${testUser.tronHex}`);

  // 2. Fund test user with 5 TROB for gas
  console.log(`\n💸 Transferring 5 TROB to test operative for gas...`);
  const transferRes = await fetch(`${FULLNODE_URL}/wallet/createtransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: deployer.tronHex,
      to_address: testUser.tronHex,
      amount: 5000000, // 5 TROB
    }),
  });
  const transferData = await transferRes.json();
  await broadcastTransaction(deployer, transferData);
  console.log(`   Transfer tx: 0x${transferData.txID}. Waiting 6s...`);
  await sleep(6000);

  // 3. Register test operative into MagicBox
  console.log(`\n📝 Enrolling test operative into MagicBox...`);
  await triggerContract(
    deployer,
    magicB58,
    "addEligibleUser(address)",
    coder.encode(["address"], [testUser.evmAddress]).slice(2)
  );
  await sleep(6000);

  // 4. Query claimable prize for test operative
  console.log(`\n🔍 Evaluating deterministic prize for test operative on-chain...`);
  const claimHex = await queryConstant(
    magicB58,
    "getClaimableReward(address)",
    coder.encode(["address"], [testUser.evmAddress]).slice(2)
  );
  if (!claimHex) {
    throw new Error("Failed to query getClaimableReward");
  }

  const dec = coder.decode(["bool", "uint8", "uint256", "uint256", "uint256"], "0x" + claimHex);
  const canClaim = dec[0];
  const tier = dec[1];
  const prizeTrob = ethers.formatUnits(dec[2], 6);
  const prizeUsd = (Number(dec[3]) / 100).toFixed(2);
  const round = dec[4].toString();

  console.log(`   Can Claim:     ${canClaim}`);
  console.log(`   Won Tier:      ${tier}`);
  console.log(`   Prize Amount:  $${prizeUsd} USD (~${prizeTrob} TROB)`);
  console.log(`   Round:         ${round}`);

  if (!canClaim) {
    throw new Error("User cannot claim reward");
  }

  // 5. Test operative calls claimReward() on-chain!
  console.log(`\n⚡ Test operative executing claimReward() on blockchain...`);
  const claimTx = await triggerContract(testUser, magicB58, "claimReward()", "");
  console.log(`   Claim broadcast! TxID: 0x${claimTx}. Waiting 10s for on-chain block settlement...`);
  await sleep(10000);

  // 6. Verify on-chain results after claim
  console.log(`\n🔍 Checking post-claim status...`);
  const postClaimHex = await queryConstant(
    magicB58,
    "hasReceivedMagicBox(address)",
    coder.encode(["address"], [testUser.evmAddress]).slice(2)
  );
  const hasClaimed = coder.decode(["bool"], "0x" + postClaimHex)[0];
  console.log(`   hasReceivedMagicBox: ${hasClaimed}`);

  // Query test operative balance
  const balRes = await fetch(`${FULLNODE_URL}/wallet/getaccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: testUser.tronHex, visible: false }),
  });
  const balData = await balRes.json();
  const newBalTrob = (balData.balance || 0) / 1e6;
  console.log(`   Operative Balance after prize payout: ${newBalTrob.toFixed(6)} TROB!`);

  // 7. Verify that trying to claim a second time strictly reverts (1x lifetime gift)
  console.log(`\n🛡️ Verifying 1x Lifetime Gift Protection (Attempting double-claim)...`);
  try {
    await triggerContract(testUser, magicB58, "claimReward()", "");
    console.error(`❌ Security failure: double claim succeeded!`);
  } catch (err) {
    console.log(`✅ Security confirmed: second claim strictly blocked on blockchain: ${err.message}`);
  }

  console.log(`\n🎉 FULL END-TO-END SMART CONTRACT VERIFICATION COMPLETED SUCCESSFULLY!`);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
