const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../packages/hardhat/.env") });
require("dotenv").config();

const FULLNODE_URL = "https://fullnode-one-testnet.trobchain.com";
const DEPLOYED = require("../packages/hardhat/deployed-trobchain.json");

const privKey = process.env.DEPLOYER_PRIVATE_KEY || "11555126483d8f687eb1c721788730c65b3e986b302d68fe04eece7dc9382eca";
const rootWallet = new ethers.Wallet(privKey.startsWith("0x") ? privKey : "0x" + privKey);
const rootEvm = rootWallet.address.toLowerCase();
const rootTronHex = "41" + rootEvm.slice(2);

const matrixHex = DEPLOYED.contracts.EquoraMatrix.addressHex;
const tokenHex = DEPLOYED.contracts.EquoraToken.addressHex;
const coder = new ethers.AbiCoder();

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function triggerContractTx(signer, contractHex, functionSelector, parameterHex = "") {
  const signerEvm = signer.address.toLowerCase();
  const signerTronHex = "41" + signerEvm.slice(2);

  const payload = {
    owner_address: signerTronHex,
    contract_address: contractHex,
    function_selector: functionSelector,
    parameter: parameterHex,
    fee_limit: 50000000,
    call_value: 0,
    visible: false,
  };

  const res = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data.result || !data.result.result) {
    const errMsg = data.result?.message ? Buffer.from(data.result.message, "hex").toString() : JSON.stringify(data);
    throw new Error(`trigger failed: ${errMsg}`);
  }

  const tx = data.transaction;
  const txID = tx.txID;

  const signingKey = new ethers.SigningKey(signer.privateKey);
  const sig = signingKey.sign("0x" + txID);
  const vHex = sig.v.toString(16).padStart(2, "0");
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const bRes = await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      txID: txID,
      raw_data: tx.raw_data,
      raw_data_hex: tx.raw_data_hex,
      signature: [signatureHex],
    }),
  });

  const bData = await bRes.json();
  if (!bData.result) {
    throw new Error(`broadcast failed: ${JSON.stringify(bData)}`);
  }

  return txID;
}

async function fundUser(userWallet) {
  const userTronHex = "41" + userWallet.address.toLowerCase().slice(2);
  const userEvm = userWallet.address.toLowerCase();

  // Send 6 TROB for gas
  const gasRes = await fetch(`${FULLNODE_URL}/wallet/createtransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: rootTronHex,
      to_address: userTronHex,
      amount: 6 * 1e6, // 6 TROB
    }),
  });
  const gasData = await gasRes.json();
  const gasKey = new ethers.SigningKey(rootWallet.privateKey);
  const gasSig = gasKey.sign("0x" + gasData.txID);
  const gasV = gasSig.v.toString(16).padStart(2, "0");

  await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      txID: gasData.txID,
      raw_data: gasData.raw_data,
      raw_data_hex: gasData.raw_data_hex,
      signature: [gasSig.r.slice(2) + gasSig.s.slice(2) + gasV],
    }),
  });

  // Transfer 50 EquoraTokens
  const param = coder.encode(["address", "uint256"], [userEvm, ethers.parseUnits("50", 18)]).slice(2);
  await triggerContractTx(rootWallet, tokenHex, "transfer(address,uint256)", param);
}

async function joinFlow(userWallet, sponsorEvm, label) {
  const userEvm = userWallet.address.toLowerCase();
  console.log(`\n--- [${label}] User: ${userEvm} (Sponsor: ${sponsorEvm}) ---`);

  // 1. Fund
  console.log(`   Funding ${label} with 6 TROB gas & 50 EquoraTokens...`);
  await fundUser(userWallet);
  await sleep(4000);

  // 2. Approve 30 tokens
  console.log(`   ${label} approving EquoraMatrix (30 tokens)...`);
  const appParam = coder.encode(["address", "uint256"], ["0x" + matrixHex.slice(2), ethers.parseUnits("30", 18)]).slice(2);
  const appTx = await triggerContractTx(userWallet, tokenHex, "approve(address,uint256)", appParam);
  console.log(`   ✓ Approved: 0x${appTx}`);
  await sleep(4000);

  // 3. Join Slot 1
  console.log(`   ${label} calling joinSlot(1, sponsor)...`);
  const joinParam = coder.encode(["uint256", "address"], [1, sponsorEvm]).slice(2);
  const joinTx = await triggerContractTx(userWallet, matrixHex, "joinSlot(uint256,address)", joinParam);
  console.log(`   🎉 Joined Slot 1! Tx: 0x${joinTx}`);
  await sleep(4000);

  return joinTx;
}

async function readSlot(userAddress) {
  const param = coder.encode(["address", "uint256"], [userAddress, 1]).slice(2);
  const res = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: rootTronHex,
      contract_address: matrixHex,
      function_selector: "getSlotData(address,uint256)",
      parameter: param,
      visible: false,
    }),
  });
  const data = await res.json();
  if (data.constant_result?.length > 0) {
    const [isUnlocked, currentCycle, filledNodes, nodes, slotEarned] = coder.decode(
      ["bool", "uint256", "uint256", "address[14]", "uint256"],
      "0x" + data.constant_result[0]
    );
    return {
      isUnlocked,
      currentCycle: Number(currentCycle),
      filledNodes: Number(filledNodes),
      slotEarned: ethers.formatUnits(slotEarned, 18),
      nodes: nodes.filter((n) => n !== "0x0000000000000000000000000000000000000000"),
    };
  }
  return null;
}

async function main() {
  console.log("===================================================================");
  console.log("⚡ TESTING MULTI-USER SEQUENTIAL MATRIX JOIN & SPILLOVER ON-CHAIN");
  console.log(`👑 Root / Sponsor: ${rootEvm}`);
  console.log("===================================================================");

  const initialRoot = await readSlot(rootEvm);
  console.log(`Initial Root State: filledNodes=${initialRoot.filledNodes}, earned=${initialRoot.slotEarned} TROB`);

  // User 2 (Position 2 of root)
  const user2 = ethers.Wallet.createRandom();
  const tx2 = await joinFlow(user2, rootEvm, "User 2 (Direct of Root -> Pos 2)");

  // Check Root State
  let rootState = await readSlot(rootEvm);
  console.log(`\n📊 Root State after User 2: filledNodes=${rootState.filledNodes}, earned=${rootState.slotEarned} TROB`);
  console.log(`   Board Nodes:`, rootState.nodes);

  // User 3 (Position 3 of root -> P3 pays direct income to Root!)
  const user3 = ethers.Wallet.createRandom();
  const tx3 = await joinFlow(user3, rootEvm, "User 3 (Direct of Root -> Pos 3 - DIRECT PAYOUT)");

  // Check Root State again
  rootState = await readSlot(rootEvm);
  console.log(`\n🎉 Root State after User 3: filledNodes=${rootState.filledNodes}, earned=${rootState.slotEarned} TROB`);
  console.log(`   Board Nodes:`, rootState.nodes);

  console.log("\n===================================================================");
  console.log("🚀 MULTI-USER ON-CHAIN JOIN & DISTRIBUTION COMPLETED SUCCESSFULLY!");
  console.log("===================================================================");
}

main().catch(console.error);
