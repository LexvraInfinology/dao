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

function generateWallet() {
  const randKey = "0x" + crypto.randomBytes(32).toString("hex");
  return { ...privateKeyToAddress(randKey), privateKey: randKey };
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
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/createtransaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_address: fromSigner.tronHex,
          to_address: toTronHex,
          amount: amountSun,
        }),
      });
      const createData = await res.json();
      if (createData.Error) throw new Error(createData.Error);
      await broadcastTransaction(fromSigner, createData);
      await sleep(4000);
      return createData.txID;
    } catch (err) {
      console.warn(`   ⚠️ Transfer attempt ${attempt} failed: ${err.message}`);
      if (attempt === 4) throw err;
      await sleep(3000);
    }
  }
}

async function triggerContractMethod(signer, contractHex, functionSelector, parameterHex, callValueSun = 0) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const triggerRes = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_address: signer.tronHex,
          contract_address: contractHex,
          function_selector: functionSelector,
          parameter: parameterHex ? parameterHex.replace(/^0x/, "") : "",
          fee_limit: 100000000,
          call_value: callValueSun,
        }),
      });
      const triggerData = await triggerRes.json();
      if (!triggerData.result || !triggerData.transaction) {
        const msg = triggerData.Error || JSON.stringify(triggerData);
        throw new Error(`triggersmartcontract failed: ${msg}`);
      }

      await broadcastTransaction(signer, triggerData.transaction);
      await sleep(7000);
      return triggerData.transaction.txID;
    } catch (err) {
      console.warn(`   ⚠️ Trigger attempt ${attempt} failed: ${err.message}`);
      if (attempt === 4) throw err;
      await sleep(3000);
    }
  }
}

async function callConstant(contractHex, functionSelector, parameterHex = "") {
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
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

async function getBalance(tronHex) {
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/getaccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: tronHex }),
  });
  const data = await res.json();
  return (data.balance || 0) / 1e6;
}

async function main() {
  const deployedPath = path.resolve(__dirname, "../deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf8"));
  const matrixHex = deployed.contracts.EquoraMatrix.addressHex;
  const vaultHex = deployed.contracts.EquoraVault.addressHex;
  const vaultBase58 = deployed.contracts.EquoraVault.addressBase58;

  const SEAT1_KEY = "d729c3fce80e3e831a7167efbe9e7b768f0bf8cb2ee4dfe87559208cb9a7a0a0";
  const seat1 = { ...privateKeyToAddress(SEAT1_KEY), privateKey: SEAT1_KEY };

  console.log(`======================================================`);
  console.log(`🌳 EQUORA MATRIX: HIERARCHICAL 14-NODE FILL (SLOT 1 ONLY)`);
  console.log(`   Root Seat 1: ${seat1.tronBase58} (${seat1.evmAddress})`);
  console.log(`   Matrix Contract: ${deployed.contracts.EquoraMatrix.addressBase58}`);
  console.log(`   Vault Contract:  ${vaultBase58}`);
  console.log(`======================================================`);

  const coder = new ethers.AbiCoder();
  const costRaw = await callConstant(matrixHex, "slotCosts(uint256)", coder.encode(["uint256"], [1]).slice(2));
  const slot1CostSun = Number(coder.decode(["uint256"], "0x" + costRaw)[0]);
  const slot1CostTrob = slot1CostSun / 1e6;
  console.log(`💰 Slot 1 Cost: ${slot1CostTrob} TROB (${slot1CostSun} SUN)`);

  const seat1Bal = await getBalance(seat1.tronHex);
  console.log(`💳 Seat 1 Balance: ${seat1Bal.toFixed(4)} TROB`);

  // Ensure Seat 1 has joined Slot 1
  const s1StatusRaw = await callConstant(
    matrixHex,
    "getUserSlot(address,uint256)",
    coder.encode(["address", "uint256"], [seat1.evmAddress, 1]).slice(2)
  );
  let seat1Unlocked = false;
  if (s1StatusRaw && s1StatusRaw.length >= 64) {
    const decoded = coder.decode(["bool", "bool", "uint256", "uint256", "uint256", "uint256", "uint256", "uint256"], "0x" + s1StatusRaw);
    seat1Unlocked = decoded[0];
  }

  const joinedMembers = [];

  let seat1Tx = "0x0000000000000000000000000000000000000000000000000000000000000000";
  if (!seat1Unlocked) {
    console.log(`\n🚀 Seat 1 Joining Slot 1 under Protocol Vault...`);
    const vaultEvm = "0x" + vaultHex.slice(2);
    const joinParam = coder.encode(["uint256", "address"], [1, vaultEvm]);
    seat1Tx = await triggerContractMethod(
      seat1,
      matrixHex,
      "joinSlot(uint256,address)",
      joinParam,
      slot1CostSun
    );
    console.log(`   ✅ Seat 1 Joined Slot 1! Tx: 0x${seat1Tx}`);
  } else {
    console.log(`   ✅ Seat 1 already active in Slot 1`);
  }

  joinedMembers.push({
    memberNumber: 1,
    name: "Seat 1 (Founder)",
    label: "Seat 1 (Founder)",
    slot: 1,
    base58: seat1.tronBase58,
    evm: seat1.evmAddress,
    privateKey: seat1.privateKey,
    sponsor: "0x" + vaultHex.slice(2),
    sponsorBase58: vaultBase58,
    txHash: seat1Tx.startsWith("0x") ? seat1Tx : "0x" + seat1Tx,
    timestamp: new Date().toISOString(),
  });

  // HIERARCHICAL DOWNLINE TREE DEFINITION:
  // Member 2 (P1) -> Sponsor: Seat 1
  // Member 3 (P2) -> Sponsor: Seat 1 (Seat 1 qualified!)
  // Member 4 (P3) -> Sponsor: Member 2
  // Member 5 (P4) -> Sponsor: Member 2 (Member 2 qualified!)
  // Member 6 (P5) -> Sponsor: Member 3
  // Member 7 (P6) -> Sponsor: Member 3 (Member 3 qualified!)
  // Member 8 (P7) -> Sponsor: Member 4
  // Member 9 (P8) -> Sponsor: Member 4 (Member 4 qualified!)
  // Member 10 (P9) -> Sponsor: Member 5
  // Member 11 (P10) -> Sponsor: Member 5 (Member 5 qualified!)
  // Member 12 (P11) -> Sponsor: Member 6
  // Member 13 (P12) -> Sponsor: Member 6 (Member 6 qualified!)
  // Member 14 (P13) -> Sponsor: Member 7
  // Member 15 (P14) -> Sponsor: Member 7 (Member 7 qualified!)

  const downlineConfig = [
    { num: 2,  pos: 1,  sponsorIdx: 0, label: "Member 2 (Direct 1)", classification: "Direct Referral #1" },
    { num: 3,  pos: 2,  sponsorIdx: 0, label: "Member 3 (Direct 2)", classification: "Direct Referral #2 (Founder Qualified)" },
    { num: 4,  pos: 3,  sponsorIdx: 1, label: "Member 4 (M2 Direct 1)", classification: "Member 2 Direct #1" },
    { num: 5,  pos: 4,  sponsorIdx: 1, label: "Member 5 (M2 Direct 2)", classification: "Member 2 Direct #2 (M2 Qualified)" },
    { num: 6,  pos: 5,  sponsorIdx: 2, label: "Member 6 (M3 Direct 1)", classification: "Member 3 Direct #1" },
    { num: 7,  pos: 6,  sponsorIdx: 2, label: "Member 7 (M3 Direct 2)", classification: "Member 3 Direct #2 (M3 Qualified)" },
    { num: 8,  pos: 7,  sponsorIdx: 3, label: "Member 8 (M4 Direct 1)", classification: "Member 4 Direct #1" },
    { num: 9,  pos: 8,  sponsorIdx: 3, label: "Member 9 (M4 Direct 2)", classification: "Member 4 Direct #2 (M4 Qualified)" },
    { num: 10, pos: 9,  sponsorIdx: 4, label: "Member 10 (M5 Direct 1)", classification: "Member 5 Direct #1" },
    { num: 11, pos: 10, sponsorIdx: 4, label: "Member 11 (M5 Direct 2)", classification: "Member 5 Direct #2 (M5 Qualified)" },
    { num: 12, pos: 11, sponsorIdx: 5, label: "Member 12 (M6 Direct 1)", classification: "Member 6 Direct #1" },
    { num: 13, pos: 12, sponsorIdx: 5, label: "Member 13 (M6 Direct 2)", classification: "Member 6 Direct #2 (M6 Qualified)" },
    { num: 14, pos: 13, sponsorIdx: 6, label: "Member 14 (M7 Direct 1)", classification: "Member 7 Direct #1" },
    { num: 15, pos: 14, sponsorIdx: 6, label: "Member 15 (M7 Direct 2)", classification: "Member 7 Direct #2 (M7 Qualified)" },
  ];

  console.log(`\n======================================================`);
  console.log(`👥 ADVANCING 14 NODES HIERARCHICALLY INTO SLOT 1`);
  console.log(`======================================================`);

  for (const cfg of downlineConfig) {
    const sponsorMember = joinedMembers[cfg.sponsorIdx];
    console.log(`\n------------------------------------------------------`);
    console.log(`▶ Node #${cfg.pos}: ${cfg.label}`);
    console.log(`   Sponsor: ${sponsorMember.name || sponsorMember.label} (${sponsorMember.base58})`);

    const wallet = generateWallet();
    console.log(`   New Wallet: ${wallet.tronBase58} (${wallet.evmAddress})`);

    // Fund new member from Seat 1 (Seat 1 gets direct P2P returns on P3, P6, P8, P9, P11, P12)
    const fundSun = slot1CostSun + 4_000_000; // deposit + buffer for transaction
    console.log(`   Funding ${fundSun / 1e6} TROB from Seat 1...`);
    await transferTrob(seat1, wallet.tronHex, fundSun);

    // Call joinSlot(1, sponsorEvmAddress)
    console.log(`   Calling joinSlot(1, ${sponsorMember.evm})...`);
    const joinParam = coder.encode(["uint256", "address"], [1, sponsorMember.evm]);
    const txID = await triggerContractMethod(
      wallet,
      matrixHex,
      "joinSlot(uint256,address)",
      joinParam,
      slot1CostSun
    );
    const txHash = "0x" + txID;
    console.log(`   ✅ Node #${cfg.pos} Confirmed! Tx: ${txHash}`);

    joinedMembers.push({
      memberNumber: cfg.num,
      name: cfg.label,
      label: cfg.label,
      classification: cfg.classification,
      slot: 1,
      position: cfg.pos,
      base58: wallet.tronBase58,
      evm: wallet.evmAddress,
      privateKey: wallet.privateKey,
      sponsor: sponsorMember.evm,
      sponsorBase58: sponsorMember.base58,
      txHash: txHash,
      timestamp: new Date().toISOString(),
    });

    // Save progressively to disk so no progress is ever lost
    const membersPath = path.resolve(__dirname, "../joined-members.json");
    const webMembersPath = path.resolve(__dirname, "../../../apps/web-matrix/lib/joinedMembers.json");
    fs.writeFileSync(membersPath, JSON.stringify(joinedMembers, null, 2), "utf8");
    if (fs.existsSync(path.dirname(webMembersPath))) {
      fs.writeFileSync(webMembersPath, JSON.stringify(joinedMembers, null, 2), "utf8");
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 HIERARCHICAL SLOT 1 COMPLETE! ALL 14 NODES FILLED`);
  console.log(`======================================================`);

  // Verify on-chain slot details for Seat 1
  const s1DetailsRaw = await callConstant(
    matrixHex,
    "getUserSlot(address,uint256)",
    coder.encode(["address", "uint256"], [seat1.evmAddress, 1]).slice(2)
  );
  if (s1DetailsRaw && s1DetailsRaw.length >= 64) {
    const d = coder.decode(["bool", "bool", "uint256", "uint256", "uint256", "uint256", "uint256", "uint256"], "0x" + s1DetailsRaw);
    console.log(`Seat 1 Unlocked:      ${d[0]}`);
    console.log(`Seat 1 Current Cycle: ${d[2].toString()}`);
    console.log(`Seat 1 Filled Nodes:  ${d[3].toString()} / 14`);
    console.log(`Seat 1 Recycles:      ${d[4].toString()}`);
  }

  // Verify on-chain qualification of Member 2 & Member 3
  const m2DirectsRaw = await callConstant(
    matrixHex,
    "getActiveDirectReferrals(address)",
    coder.encode(["address"], [joinedMembers[1].evm]).slice(2)
  );
  if (m2DirectsRaw) {
    const directs = coder.decode(["address[]"], "0x" + m2DirectsRaw)[0];
    console.log(`Member 2 On-Chain Directs: ${directs.length} (Expected 2 -> Qualified!)`);
  }

  const m3DirectsRaw = await callConstant(
    matrixHex,
    "getActiveDirectReferrals(address)",
    coder.encode(["address"], [joinedMembers[2].evm]).slice(2)
  );
  if (m3DirectsRaw) {
    const directs = coder.decode(["address[]"], "0x" + m3DirectsRaw)[0];
    console.log(`Member 3 On-Chain Directs: ${directs.length} (Expected 2 -> Qualified!)`);
  }

  // Verify Vault balance
  const vaultBal = await getBalance(vaultHex);
  console.log(`Vault Balance: ${vaultBal.toFixed(4)} TROB (Zero Trap Invariant)`);

  const matrixBal = await getBalance(matrixHex);
  console.log(`Matrix Balance: ${matrixBal.toFixed(4)} TROB (Instant Settlement Invariant)`);
}

main().catch((err) => {
  console.error("❌ Fatal error in hierarchical fill:", err);
  process.exit(1);
});
