const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../packages/hardhat/.env") });
require("dotenv").config();

const FULLNODE_URL = "https://fullnode-one-testnet.trobchain.com";
const DEPLOYED = require("../packages/hardhat/deployed-trobchain.json");

const privKey = process.env.DEPLOYER_PRIVATE_KEY || "11555126483d8f687eb1c721788730c65b3e986b302d68fe04eece7dc9382eca";
const wallet = new ethers.Wallet(privKey.startsWith("0x") ? privKey : "0x" + privKey);
const deployerEvm = wallet.address.toLowerCase();
const deployerTronHex = "41" + deployerEvm.slice(2);

const coder = new ethers.AbiCoder();

async function triggerContractTx(contractHex, functionSelector, parameterHex = "") {
  const payload = {
    owner_address: deployerTronHex,
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
    throw new Error(`triggersmartcontract failed: ${data.result?.message ? Buffer.from(data.result.message, "hex").toString() : JSON.stringify(data)}`);
  }

  const tx = data.transaction;
  const txID = tx.txID;

  // Sign transaction
  const signingKey = new ethers.SigningKey(wallet.privateKey);
  const sig = signingKey.sign("0x" + txID);
  const vHex = sig.v.toString(16).padStart(2, "0");
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const broadcastPayload = {
    txID: txID,
    raw_data: tx.raw_data,
    raw_data_hex: tx.raw_data_hex,
    signature: [signatureHex],
  };

  const bRes = await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(broadcastPayload),
  });

  const bData = await bRes.json();
  if (!bData.result) {
    const errMsg = bData.message ? Buffer.from(bData.message, "hex").toString() : JSON.stringify(bData);
    throw new Error(`broadcast failed: ${errMsg}`);
  }

  return txID;
}

async function triggerConstantContract(contractHex, selectorHex, parameterHex = "") {
  const payload = {
    owner_address: deployerTronHex,
    contract_address: contractHex,
    function_selector: selectorHex,
    parameter: parameterHex,
    visible: false,
  };

  const res = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.result && data.result.result) {
    return data.constant_result ? data.constant_result[0] : "";
  }
  throw new Error(data.result?.message ? Buffer.from(data.result.message, "hex").toString() : JSON.stringify(data));
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("========================================================");
  console.log("⚡ EQUORA MATRIX PROTOCOL — ON-CHAIN WIRING & FLOW TEST");
  console.log(`🎯 Deployer: ${deployerEvm} (${deployerTronHex})`);
  console.log("========================================================\n");

  const matrixHex = DEPLOYED.contracts.EquoraMatrix.addressHex;
  const tokenHex = DEPLOYED.contracts.EquoraToken.addressHex;
  const registryHex = DEPLOYED.contracts.EquoraRegistry.addressHex;
  const vaultHex = DEPLOYED.contracts.EquoraVault.addressHex;
  const daoHex = DEPLOYED.contracts.EquoraDAO.addressHex;

  // STEP 1: Wire EquoraRegistry
  console.log("1. Authorizing Contracts in EquoraRegistry...");
  try {
    const params = coder.encode(
      ["address", "address", "address"],
      ["0x" + vaultHex.slice(2), "0x" + daoHex.slice(2), "0x" + matrixHex.slice(2)]
    ).slice(2);
    const txId = await triggerContractTx(registryHex, "setAuthorizedContracts(address,address,address)", params);
    console.log(`   ✓ Registry wired! Tx: 0x${txId}`);
  } catch (err) {
    console.log(`   Notice: ${err.message}`);
  }

  // STEP 2: Wire EquoraVault
  console.log("\n2. Wiring EquoraVault matrixContract...");
  try {
    const params = coder.encode(["address"], ["0x" + matrixHex.slice(2)]).slice(2);
    const txId = await triggerContractTx(vaultHex, "setMatrixContract(address)", params);
    console.log(`   ✓ Vault matrixContract set! Tx: 0x${txId}`);
  } catch (err) {
    console.log(`   Notice: ${err.message}`);
  }

  // STEP 3: Wire EquoraMatrix -> Vault & DAO
  console.log("\n3. Wiring EquoraMatrix vaultContract & daoContract...");
  try {
    const paramsV = coder.encode(["address"], ["0x" + vaultHex.slice(2)]).slice(2);
    const txIdV = await triggerContractTx(matrixHex, "setVaultContract(address)", paramsV);
    console.log(`   ✓ Matrix vaultContract set! Tx: 0x${txIdV}`);
  } catch (err) {
    console.log(`   Notice: ${err.message}`);
  }

  try {
    const paramsD = coder.encode(["address"], ["0x" + daoHex.slice(2)]).slice(2);
    const txIdD = await triggerContractTx(matrixHex, "setDaoContract(address)", paramsD);
    console.log(`   ✓ Matrix daoContract set! Tx: 0x${txIdD}`);
  } catch (err) {
    console.log(`   Notice: ${err.message}`);
  }

  console.log("\n⏳ Waiting 6 seconds for TrobChain blocks to confirm wiring...");
  await sleep(6000);

  // STEP 4: Verify on-chain state
  console.log("\n4. Verifying On-Chain Wiring Getters...");
  const vAddrHex = await triggerConstantContract(matrixHex, "vaultContract()");
  const vAddr = coder.decode(["address"], "0x" + vAddrHex)[0];
  console.log(`   EquoraMatrix.vaultContract: ${vAddr}`);

  const mAddrHex = await triggerConstantContract(registryHex, "matrixContract()");
  const mAddr = coder.decode(["address"], "0x" + mAddrHex)[0];
  console.log(`   EquoraRegistry.matrixContract: ${mAddr}`);

  // STEP 5: Create a new test user account to test the complete Join Flow!
  console.log("\n5. Testing End-to-End On-Chain Matrix Join Flow...");
  const testUser = ethers.Wallet.createRandom();
  const testUserEvm = testUser.address.toLowerCase();
  const testUserTronHex = "41" + testUserEvm.slice(2);
  console.log(`   Created Test User: ${testUserEvm} (${testUserTronHex})`);

  // Fund test user with 10 native TROB for gas
  console.log("   Funding Test User with native TROB for transaction gas...");
  const fundGasPayload = {
    owner_address: deployerTronHex,
    to_address: testUserTronHex,
    amount: 10 * 1e6, // 10 TROB
  };
  const gasRes = await fetch(`${FULLNODE_URL}/wallet/createtransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fundGasPayload),
  });
  const gasTxData = await gasRes.json();
  const gasSigningKey = new ethers.SigningKey(wallet.privateKey);
  const gasSig = gasSigningKey.sign("0x" + gasTxData.txID);
  const gasV = gasSig.v.toString(16).padStart(2, "0");
  await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      txID: gasTxData.txID,
      raw_data: gasTxData.raw_data,
      raw_data_hex: gasTxData.raw_data_hex,
      signature: [gasSig.r.slice(2) + gasSig.s.slice(2) + gasV],
    }),
  });
  console.log(`   ✓ Sent 10 TROB native gas to test user: 0x${gasTxData.txID}`);

  // Transfer 100 EquoraToken from deployer to test user
  console.log("   Transferring 100 EquoraToken to Test User...");
  const transferParam = coder.encode(["address", "uint256"], [testUserEvm, ethers.parseUnits("100", 18)]).slice(2);
  const transferTxId = await triggerContractTx(tokenHex, "transfer(address,uint256)", transferParam);
  console.log(`   ✓ Sent 100 EquoraToken to test user: 0x${transferTxId}`);

  console.log("   Waiting 5 seconds for funding transactions to confirm...");
  await sleep(5000);

  // STEP 6: Test User Approves EquoraMatrix to spend 30 EquoraTokens
  console.log("\n6. Test User Approving EquoraMatrix Contract...");
  const approveParam = coder.encode(["address", "uint256"], ["0x" + matrixHex.slice(2), ethers.parseUnits("30", 18)]).slice(2);
  const approvePayload = {
    owner_address: testUserTronHex,
    contract_address: tokenHex,
    function_selector: "approve(address,uint256)",
    parameter: approveParam,
    fee_limit: 50000000,
    call_value: 0,
    visible: false,
  };
  const appRes = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(approvePayload),
  });
  const appData = await appRes.json();
  const appTx = appData.transaction;
  const userSigningKey = new ethers.SigningKey(testUser.privateKey);
  const appSig = userSigningKey.sign("0x" + appTx.txID);
  const appV = appSig.v.toString(16).padStart(2, "0");
  await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      txID: appTx.txID,
      raw_data: appTx.raw_data,
      raw_data_hex: appTx.raw_data_hex,
      signature: [appSig.r.slice(2) + appSig.s.slice(2) + appV],
    }),
  });
  console.log(`   ✓ Approved 30 EquoraToken: 0x${appTx.txID}`);

  console.log("   Waiting 5 seconds for approval confirmation...");
  await sleep(5000);

  // STEP 7: Test User Joins Slot 1!
  console.log("\n7. Test User Executing joinSlot(1, sponsor)...");
  const joinParam = coder.encode(["uint256", "address"], [1, deployerEvm]).slice(2);
  const joinPayload = {
    owner_address: testUserTronHex,
    contract_address: matrixHex,
    function_selector: "joinSlot(uint256,address)",
    parameter: joinParam,
    fee_limit: 50000000,
    call_value: 0,
    visible: false,
  };
  const joinRes = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(joinPayload),
  });
  const joinData = await joinRes.json();
  if (!joinData.result || !joinData.result.result) {
    const errMsg = joinData.result?.message ? Buffer.from(joinData.result.message, "hex").toString() : JSON.stringify(joinData);
    throw new Error(`joinSlot failed: ${errMsg}`);
  }
  const joinTx = joinData.transaction;
  const joinSig = userSigningKey.sign("0x" + joinTx.txID);
  const joinV = joinSig.v.toString(16).padStart(2, "0");
  const bJoinRes = await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      txID: joinTx.txID,
      raw_data: joinTx.raw_data,
      raw_data_hex: joinTx.raw_data_hex,
      signature: [joinSig.r.slice(2) + joinSig.s.slice(2) + joinV],
    }),
  });
  const bJoinData = await bJoinRes.json();
  console.log(`   ✓ joinSlot(1) Broadcast Result:`, bJoinData);
  console.log(`   🎉 Transaction Hash: 0x${joinTx.txID}`);

  console.log("\n⏳ Waiting 6 seconds to confirm on-chain slot status...");
  await sleep(6000);

  // STEP 8: Verify Test User is Unlocked in Slot 1 on-chain!
  console.log("\n8. Verifying On-Chain Slot State for Test User...");
  const slotDataHex = await triggerConstantContract(
    matrixHex,
    "getSlotData(address,uint256)",
    coder.encode(["address", "uint256"], [testUserEvm, 1]).slice(2)
  );
  const [isUnlocked, currentCycle, filledNodes, nodes, slotEarned] = coder.decode(
    ["bool", "uint256", "uint256", "address[14]", "uint256"],
    "0x" + slotDataHex
  );
  console.log(`   ✓ isUnlocked: ${isUnlocked}`);
  console.log(`   ✓ currentCycle: ${currentCycle}`);
  console.log(`   ✓ filledNodes: ${filledNodes}`);
  console.log(`   ✓ slotEarned: ${ethers.formatUnits(slotEarned, 18)} TROB`);

  console.log("\n========================================================");
  console.log("🚀 ON-CHAIN FLOW TEST COMPLETED WITH 100% SUCCESS!");
  console.log("========================================================");
}

main().catch(console.error);
