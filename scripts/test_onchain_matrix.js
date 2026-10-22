const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const FULLNODE_URL = "https://fullnode-one-testnet.trobchain.com";
const DEPLOYED = require("../packages/hardhat/deployed-trobchain.json");

// Helper to call constant function on TrobChain
async function triggerConstantContract(contractHex, selectorHex, parameterHex = "") {
  const payload = {
    owner_address: DEPLOYED.contracts.EquoraMatrix.addressHex,
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

async function main() {
  console.log("========================================================");
  console.log("🔗 TESTING ON-CHAIN STATE OF EQUORA MATRIX ON TROBCHAIN");
  console.log("========================================================");

  const matrixHex = DEPLOYED.contracts.EquoraMatrix.addressHex;
  const tokenHex = DEPLOYED.contracts.EquoraToken.addressHex;
  const registryHex = DEPLOYED.contracts.EquoraRegistry.addressHex;
  const vaultHex = DEPLOYED.contracts.EquoraVault.addressHex;

  const coder = new ethers.AbiCoder();

  // 1. Check isMatrixOpen()
  try {
    const selector = "isMatrixOpen()";
    const res = await triggerConstantContract(matrixHex, selector);
    const isOpen = coder.decode(["bool"], "0x" + res)[0];
    console.log("1. isMatrixOpen():", isOpen);
  } catch (err) {
    console.error("1. isMatrixOpen() error:", err.message);
  }

  // 2. Check BASE_SLOT_COST()
  try {
    const selector = "BASE_SLOT_COST()";
    const res = await triggerConstantContract(matrixHex, selector);
    const cost = coder.decode(["uint256"], "0x" + res)[0];
    console.log("2. BASE_SLOT_COST():", ethers.formatUnits(cost, 18), "TROB");
  } catch (err) {
    console.error("2. BASE_SLOT_COST() error:", err.message);
  }

  // 3. Check slotCosts(1)
  try {
    const selector = "slotCosts(uint256)";
    const param = coder.encode(["uint256"], [1]).slice(2);
    const res = await triggerConstantContract(matrixHex, selector, param);
    const cost1 = coder.decode(["uint256"], "0x" + res)[0];
    console.log("3. slotCosts(1):", ethers.formatUnits(cost1, 18), "TROB");
  } catch (err) {
    console.error("3. slotCosts(1) error:", err.message);
  }

  // 4. Check paymentToken() in Matrix
  try {
    const selector = "paymentToken()";
    const res = await triggerConstantContract(matrixHex, selector);
    const pToken = coder.decode(["address"], "0x" + res)[0];
    console.log("4. paymentToken():", pToken, "(matches tokenHex:", pToken.toLowerCase() === ("0x" + tokenHex.slice(2)).toLowerCase() + ")");
  } catch (err) {
    console.error("4. paymentToken() error:", err.message);
  }

  // 5. Check vaultContract() in Matrix
  try {
    const selector = "vaultContract()";
    const res = await triggerConstantContract(matrixHex, selector);
    const vAddr = coder.decode(["address"], "0x" + res)[0];
    console.log("5. vaultContract():", vAddr, "(expected:", "0x" + vaultHex.slice(2) + ")");
  } catch (err) {
    console.error("5. vaultContract() error:", err.message);
  }

  // 6. Check deployer balance of EquoraToken
  const privKey = process.env.DEPLOYER_PRIVATE_KEY || "11555126483d8f687eb1c721788730c65b3e986b302d68fe04eece7dc9382eca";
  const wallet = new ethers.Wallet(privKey.startsWith("0x") ? privKey : "0x" + privKey);
  try {
    const selector = "balanceOf(address)";
    const param = coder.encode(["address"], [wallet.address]).slice(2);
    const res = await triggerConstantContract(tokenHex, selector, param);
    const bal = coder.decode(["uint256"], "0x" + res)[0];
    console.log("6. Deployer Token Balance:", ethers.formatUnits(bal, 18), "TROB");
  } catch (err) {
    console.error("6. Deployer balance error:", err.message);
  }
}

main().catch(console.error);
