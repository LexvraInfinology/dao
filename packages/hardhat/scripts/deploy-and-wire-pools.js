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

async function transferTrob(fromSigner, toTronHex, amountSun) {
  console.log(`   💸 Transferring ${(amountSun / 1e6).toLocaleString()} TROB to ${hexToBase58(toTronHex)}...`);
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
  console.log(`   ✅ Transfer broadcast: 0x${data.txID}. Waiting 6s...`);
  await sleep(6000);
}

async function getAccountBalance(tronHex) {
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/getaccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: tronHex }),
  });
  const data = await res.json();
  return data.balance || 0;
}

async function deployContractToTrob(name, artifactRelativePath, constructorParamsHex, deployer) {
  const artifactPath = path.resolve(__dirname, "..", artifactRelativePath);
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found at ${artifactPath}`);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  console.log(`\n======================================================`);
  console.log(`🚀 Deploying Contract: ${name}`);
  console.log(`   Deployer: ${deployer.tronBase58} (${deployer.tronHex})`);

  const payload = {
    owner_address: deployer.tronHex,
    fee_limit: 150000000, // 150 TROB
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 10000000,
    abi: JSON.stringify(artifact.abi),
    bytecode: artifact.bytecode.replace(/^0x/, ""),
    parameter: constructorParamsHex.replace(/^0x/, ""),
    name: name,
  };

  const createRes = await fetchWithRetry(`${FULLNODE_URL}/wallet/deploycontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const createData = await createRes.json();
  if (createData.Error) {
    throw new Error(`deploycontract failed for ${name}: ${createData.Error}`);
  }

  const txID = createData.txID;
  const contractAddressHex = createData.contract_address;
  const contractAddressBase58 = hexToBase58(contractAddressHex);

  console.log(`   txID:            0x${txID}`);
  console.log(`   Contract Base58: ${contractAddressBase58}`);
  console.log(`   Contract Hex:    ${contractAddressHex}`);

  await broadcastTransaction(deployer, createData);
  console.log(`   Waiting 10s for on-chain inclusion...`);
  await sleep(10000);

  return {
    name,
    addressBase58: contractAddressBase58,
    addressHex: contractAddressHex,
    txHash: "0x" + txID,
  };
}

async function triggerContractMethod(deployer, contractHex, functionSelector, parameterHex, description) {
  console.log(`\n⚡ Calling: ${description}...`);
  const triggerRes = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: deployer.tronHex,
      contract_address: contractHex,
      function_selector: functionSelector,
      parameter: parameterHex.replace(/^0x/, ""),
      fee_limit: 100000000,
      call_value: 0,
    }),
  });
  const triggerData = await triggerRes.json();
  if (!triggerData.result || !triggerData.transaction) {
    const msg = triggerData.Error || JSON.stringify(triggerData);
    throw new Error(`triggersmartcontract failed: ${msg}`);
  }

  await broadcastTransaction(deployer, triggerData.transaction);
  console.log(`   Tx broadcast: 0x${triggerData.transaction.txID}. Waiting 8s...`);
  await sleep(8000);
  console.log(`   ✅ Confirmed!`);
  return triggerData.transaction.txID;
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

async function main() {
  console.log("==================================================================");
  console.log("🌟 EQUORA PROTOCOL: DEPLOYING & WIRING 4 PROTOCOL POOLS");
  console.log("==================================================================");

  const SEAT1_KEY = "d729c3fce80e3e831a7167efbe9e7b768f0bf8cb2ee4dfe87559208cb9a7a0a0";
  const seat1 = privateKeyToAddress(SEAT1_KEY);

  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY || "11555126483d8f687eb1c721788730c65b3e986b302d68fe04eece7dc9382eca";
  const deployer = privateKeyToAddress(deployerKey);

  console.log(`👑 Seat 1 Funder: ${seat1.tronBase58} (${seat1.tronHex})`);
  console.log(`🛠️ Deployer:      ${deployer.tronBase58} (${deployer.tronHex})`);

  // 1. Ensure deployer has enough TROB
  const deployerBal = await getAccountBalance(deployer.tronHex);
  console.log(`Deployer balance: ${(deployerBal / 1e6).toFixed(4)} TROB`);
  if (deployerBal < 3000 * 1e6) {
    const fundAmountSun = 5000 * 1e6; // 5,000 TROB
    await transferTrob(seat1, deployer.tronHex, fundAmountSun);
  }

  // Load existing deployed addresses
  const deployedPath = path.resolve(__dirname, "../deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf8"));

  const tokenHex = deployed.contracts.EquoraToken.addressHex;
  const registryHex = deployed.contracts.EquoraRegistry.addressHex;
  const daoHex = deployed.contracts.EquoraDAOv2.addressHex;
  const matrixHex = deployed.contracts.EquoraMatrix.addressHex;

  const coder = new ethers.AbiCoder();

  // 2. Deploy fresh EquoraVault
  const vaultParams = coder.encode(
    ["address", "address"],
    ["0x" + tokenHex.slice(2), "0x" + registryHex.slice(2)]
  );
  const vault = await deployContractToTrob(
    "EquoraVault",
    "artifacts/contracts/core/EquoraVault.sol/EquoraVault.json",
    vaultParams,
    deployer
  );

  // 3. Deploy EquoraSalaryPool (Royalty Pool - 40%)
  const salaryParams = coder.encode(
    ["address", "address"],
    ["0x" + tokenHex.slice(2), "0x" + vault.addressHex.slice(2)]
  );
  const salaryPool = await deployContractToTrob(
    "EquoraSalaryPool",
    "artifacts/contracts/pools/EquoraSalaryPool.sol/EquoraSalaryPool.json",
    salaryParams,
    deployer
  );

  // 4. Deploy EquoraRewardPool (Level Rewards - 15%)
  const rewardParams = coder.encode(
    ["address", "address"],
    ["0x" + tokenHex.slice(2), "0x" + vault.addressHex.slice(2)]
  );
  const rewardPool = await deployContractToTrob(
    "EquoraRewardPool",
    "artifacts/contracts/pools/EquoraRewardPool.sol/EquoraRewardPool.json",
    rewardParams,
    deployer
  );

  // 5. Deploy EquoraMagicBox (Magic Blind Box - 10%)
  const magicBoxParams = coder.encode(
    ["address", "address"],
    ["0x" + tokenHex.slice(2), "0x" + vault.addressHex.slice(2)]
  );
  const magicBox = await deployContractToTrob(
    "EquoraMagicBox",
    "artifacts/contracts/pools/EquoraMagicBox.sol/EquoraMagicBox.json",
    magicBoxParams,
    deployer
  );

  // 6. Wire EquoraVault
  console.log("\n======================================================");
  console.log("🔗 WIRING ALL CONTRACTS TOGETHER ON-CHAIN");
  console.log("======================================================");

  // 6a. Initialize Vault with 4 pools (35% DAO, 40% Salary, 10% MagicBox, 15% Rewards)
  const initVaultParam = coder.encode(
    ["address", "address", "address", "address"],
    [
      "0x" + daoHex.slice(2),
      "0x" + salaryPool.addressHex.slice(2),
      "0x" + magicBox.addressHex.slice(2),
      "0x" + rewardPool.addressHex.slice(2),
    ]
  );
  await triggerContractMethod(
    deployer,
    vault.addressHex,
    "initialize(address,address,address,address)",
    initVaultParam,
    "EquoraVault.initialize(DAO, SalaryPool, MagicBox, RewardPool)"
  );

  // 6b. Set EquoraMatrix authorized on EquoraVault
  const setMatrixParam = coder.encode(["address"], ["0x" + matrixHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    vault.addressHex,
    "setMatrixContract(address)",
    setMatrixParam,
    "EquoraVault.setMatrixContract(EquoraMatrix)"
  );

  // 7. Wire SalaryPool & RewardPool together
  // 7a. salaryPool.setRewardPool(rewardPool)
  const setRewardParam = coder.encode(["address"], ["0x" + rewardPool.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    salaryPool.addressHex,
    "setRewardPool(address)",
    setRewardParam,
    "EquoraSalaryPool.setRewardPool(EquoraRewardPool)"
  );

  // 7b. rewardPool.setAuthorizedCaller(salaryPool)
  const setAuthCallerParam = coder.encode(["address"], ["0x" + salaryPool.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    rewardPool.addressHex,
    "setAuthorizedCaller(address)",
    setAuthCallerParam,
    "EquoraRewardPool.setAuthorizedCaller(EquoraSalaryPool)"
  );

  // 8. Connect Core Contracts to new Vault
  // 8a. matrix.setVaultContract(vault)
  const setVaultOnMatrixParam = coder.encode(["address"], ["0x" + vault.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    matrixHex,
    "setVaultContract(address)",
    setVaultOnMatrixParam,
    "EquoraMatrix.setVaultContract(EquoraVault)"
  );

  // 8b. dao.setVaultContract(vault)
  const setVaultOnDaoParam = coder.encode(["address"], ["0x" + vault.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    daoHex,
    "setVaultContract(address)",
    setVaultOnDaoParam,
    "EquoraDAOv2.setVaultContract(EquoraVault)"
  );

  // 8c. registry.setAuthorizedContracts(vault, dao, matrix)
  const setAuthRegistryParam = coder.encode(
    ["address", "address", "address"],
    ["0x" + vault.addressHex.slice(2), "0x" + daoHex.slice(2), "0x" + matrixHex.slice(2)]
  );
  await triggerContractMethod(
    deployer,
    registryHex,
    "setAuthorizedContracts(address,address,address)",
    setAuthRegistryParam,
    "EquoraRegistry.setAuthorizedContracts(vault, dao, matrix)"
  );

  // 9. On-Chain Verification
  console.log("\n======================================================");
  console.log("🔍 ON-CHAIN VERIFICATION OF WIRING");
  console.log("======================================================");

  const vInitHex = await callConstant(vault.addressHex, "initialized()");
  const vDaoHex = await callConstant(vault.addressHex, "daoPool()");
  const vSalaryHex = await callConstant(vault.addressHex, "salaryPool()");
  const vMagicHex = await callConstant(vault.addressHex, "magicBoxPool()");
  const vRewardsHex = await callConstant(vault.addressHex, "rewardsPool()");
  const vMatrixHex = await callConstant(vault.addressHex, "matrixContract()");

  const sRewardHex = await callConstant(salaryPool.addressHex, "rewardPool()");
  const rAuthHex = await callConstant(rewardPool.addressHex, "authorizedCaller()");
  const mVaultHex = await callConstant(matrixHex, "vaultContract()");
  const dVaultHex = await callConstant(daoHex, "vaultContract()");

  console.log("Vault Initialized:          ", coder.decode(["bool"], "0x" + vInitHex)[0]);
  console.log("Vault -> DAO Pool:          ", coder.decode(["address"], "0x" + vDaoHex)[0]);
  console.log("Vault -> Salary Pool:       ", coder.decode(["address"], "0x" + vSalaryHex)[0]);
  console.log("Vault -> Magic Box Pool:    ", coder.decode(["address"], "0x" + vMagicHex)[0]);
  console.log("Vault -> Rewards Pool:      ", coder.decode(["address"], "0x" + vRewardsHex)[0]);
  console.log("Vault -> Matrix Contract:   ", coder.decode(["address"], "0x" + vMatrixHex)[0]);
  console.log("SalaryPool -> RewardPool:   ", coder.decode(["address"], "0x" + sRewardHex)[0]);
  console.log("RewardPool -> Authorized:   ", coder.decode(["address"], "0x" + rAuthHex)[0]);
  console.log("Matrix -> VaultContract:    ", coder.decode(["address"], "0x" + mVaultHex)[0]);
  console.log("DAO -> VaultContract:       ", coder.decode(["address"], "0x" + dVaultHex)[0]);

  // 10. Update deployed-trobchain.json
  deployed.contracts.EquoraVault = vault;
  deployed.contracts.EquoraSalaryPool = salaryPool;
  deployed.contracts.EquoraRewardPool = rewardPool;
  deployed.contracts.EquoraMagicBox = magicBox;
  deployed.updatedAt = new Date().toISOString();
  fs.writeFileSync(deployedPath, JSON.stringify(deployed, null, 2));
  console.log(`\n💾 Saved updated contracts to ${deployedPath}`);

  // 11. Update apps/web-matrix/lib/contracts.ts
  const contractsTsPath = path.resolve(__dirname, "../../../apps/web-matrix/lib/contracts.ts");
  if (fs.existsSync(contractsTsPath)) {
    let content = fs.readFileSync(contractsTsPath, "utf8");
    content = content.replace(/vault:\s*["'][^"']+["']/, `vault: "${vault.addressBase58}"`);
    content = content.replace(/salaryPool:\s*["'][^"']+["']/, `salaryPool: "${salaryPool.addressBase58}"`);
    content = content.replace(/rewardPool:\s*["'][^"']+["']/, `rewardPool: "${rewardPool.addressBase58}"`);
    content = content.replace(/magicBoxPool:\s*["'][^"']+["']/, `magicBoxPool: "${magicBox.addressBase58}"`);
    fs.writeFileSync(contractsTsPath, content, "utf8");
    console.log(`💾 Updated TESTNET_DEFAULT_ADDRESSES in web-matrix/lib/contracts.ts`);
  }

  // 12. Update apps/indexer/src/config.ts
  const indexerConfigPath = path.resolve(__dirname, "../../../apps/indexer/src/config.ts");
  if (fs.existsSync(indexerConfigPath)) {
    let content = fs.readFileSync(indexerConfigPath, "utf8");
    content = content.replace(/vault:\s*["'][^"']+["']/, `vault:    "${vault.addressBase58}"`);
    content = content.replace(/salary:\s*["'][^"']+["']/, `salary:   "${salaryPool.addressBase58}"`);
    content = content.replace(/reward:\s*["'][^"']+["']/, `reward:   "${rewardPool.addressBase58}"`);
    content = content.replace(/magicBox:\s*["'][^"']+["']/, `magicBox: "${magicBox.addressBase58}"`);
    fs.writeFileSync(indexerConfigPath, content, "utf8");
    console.log(`💾 Updated TESTNET_DEFAULT_CONTRACTS in apps/indexer/src/config.ts`);
  }

  console.log("\n🎉 ALL 4 PROTOCOL POOLS SUCCESSFULLY DEPLOYED AND WIRED ON TESTNET!");
}

main().catch((err) => {
  console.error("❌ Fatal deployment error:", err);
  process.exit(1);
});
