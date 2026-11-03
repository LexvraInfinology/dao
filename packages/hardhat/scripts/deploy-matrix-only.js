/**
 * deploy-matrix-only.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Deploys only a fresh EquoraMatrix.sol (with updated on-chain dynamic slot
 * filling, P7/P10/P13 cascade rules, P4/P5 auto-upgrade, zero hardcoded rates)
 * and wires it with the EXISTING deployed ecosystem (Vault, Registry, DAO, NFT).
 *
 * Usage:
 *   node packages/hardhat/scripts/deploy-matrix-only.js
 *
 * Environment:
 *   DEPLOYER_PRIVATE_KEY in packages/hardhat/.env
 *   Existing contract addresses read from packages/hardhat/deployed-trobchain.json
 */

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
      console.warn(`[fetch] Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(2000 * attempt);
    }
  }
}

async function broadcastTransaction(deployer, createData) {
  const txID = createData.txID;
  const sig = deployer.signingKey.sign("0x" + txID);
  const vHex = sig.v.toString(16).padStart(2, "0");
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...createData, signature: [signatureHex] }),
  });
  const data = await res.json();
  if (!data.result) {
    const errMsg = data.message ? Buffer.from(data.message, "hex").toString("utf8") : JSON.stringify(data);
    throw new Error(`Broadcast failed: ${errMsg}`);
  }
  return data;
}

async function deployContractToTrob(name, artifactRelativePath, constructorParamsHex, deployer) {
  const artifactPath = path.resolve(__dirname, "..", artifactRelativePath);
  if (!fs.existsSync(artifactPath)) throw new Error(`Artifact not found: ${artifactPath}`);
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const bytecode = artifact.bytecode.replace(/^0x/, "") + constructorParamsHex;

  console.log(`\n⬆  Deploying ${name}...`);
  const createRes = await fetchWithRetry(`${FULLNODE_URL}/wallet/deploycontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: deployer.tronHex,
      abi: JSON.stringify(artifact.abi),
      bytecode: artifact.bytecode.replace(/^0x/, "") + constructorParamsHex,
      consume_user_resource_percent: 100,
      fee_limit: 1000000000,
      origin_energy_limit: 10000000,
      call_value: 0,
      name,
    }),
  });
  const data = await createRes.json();
  if (!data.txID) throw new Error(`Deploy ${name} failed: ${JSON.stringify(data)}`);

  await broadcastTransaction(deployer, data);
  const contractHex = data.contract_address; // already 41-prefixed tron hex
  const contractBase58 = hexToBase58(contractHex);
  await sleep(12000); // wait 12s for on-chain confirmation
  console.log(`   ✅ ${name}: ${contractBase58} (${contractHex})`);
  return { addressHex: contractHex, addressBase58: contractBase58 };
}

async function triggerContractMethod(deployer, contractAddressHex, selector, paramHex, label) {
  console.log(`   🔧 ${label}...`);
  // Normalize: ensure 41-prefixed tron hex (not 0x-prefixed evm hex)
  let cleanContract = contractAddressHex;
  if (cleanContract.startsWith("0x")) cleanContract = "41" + cleanContract.slice(2);
  if (!cleanContract.startsWith("41")) cleanContract = "41" + cleanContract;
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: deployer.tronHex,
      contract_address: cleanContract,
      function_selector: selector,
      parameter: paramHex,
      fee_limit: 200000000,
      call_value: 0,
    }),
  });
  const data = await res.json();
  if (!data.result?.result) throw new Error(`triggerSmartContract ${label} failed: ${JSON.stringify(data)}`);
  await broadcastTransaction(deployer, data.transaction);
  await sleep(3000);
  console.log(`   ✅ ${label}`);
}

async function callConstant(contractHex, selector, paramHex = "") {
  const cleanContract = contractHex.startsWith("0x") ? "41" + contractHex.slice(2) : contractHex;
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggerconstantcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: "41f3e68b5fb76382683baf1e8512c4c0ab39490717",
      contract_address: cleanContract,
      function_selector: selector,
      parameter: paramHex,
    }),
  });
  const data = await res.json();
  return data.constant_result?.[0] || "";
}

async function main() {
  const privKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privKey) throw new Error("DEPLOYER_PRIVATE_KEY not set in .env");
  const deployer = privateKeyToAddress(privKey);

  console.log(`\n======================================================`);
  console.log(`🌟 EQUORA MATRIX — TARGETED REDEPLOY`);
  console.log(`   Deployer: ${deployer.tronBase58} (${deployer.tronHex})`);
  console.log(`   Fullnode: ${FULLNODE_URL}`);
  console.log(`======================================================`);

  const coder = new ethers.AbiCoder();

  // ── Read existing deployed addresses ──────────────────────────────────────
  const deployedSummaryPath = path.resolve(__dirname, "..", "deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedSummaryPath, "utf8"));

  const tokenHex    = deployed.contracts.EquoraToken?.addressHex     || "412488a09ab364a64fd31da9a3a979bee8cf85f5f6";
  const vaultHex    = deployed.contracts.EquoraVault?.addressHex     || "415a1e20075ad6574d540b5a04f3bdb3cbc47b73b2";
  const registryHex = deployed.contracts.EquoraRegistry?.addressHex  || "419f559d68ea7019f34bf1401e658fbb724d123845";
  const daoHex      = deployed.contracts.EquoraDAOv3?.addressHex     || deployed.contracts.EquoraDAO?.addressHex || "41a84cb945ad0431057656f3c5def53ab4f209ed3f";
  const nftHex      = deployed.contracts.EquoraNFT?.addressHex       || "4146d47f289988f31644eb5c7de1867c731e30b04b";

  console.log(`\n📋 Existing ecosystem:`);
  console.log(`   Token:    ${tokenHex}`);
  console.log(`   Vault:    ${vaultHex}`);
  console.log(`   Registry: ${registryHex}`);
  console.log(`   DAO:      ${daoHex}`);
  console.log(`   NFT:      ${nftHex}`);

  // ── 1. Deploy Fresh EquoraMatrix ──────────────────────────────────────────
  const matrixParams = coder.encode(
    ["address", "address", "address"],
    [
      "0x" + tokenHex.slice(2),
      "0x" + vaultHex.slice(2),
      "0x" + registryHex.slice(2),
    ]
  );
  const matrix = await deployContractToTrob(
    "EquoraMatrix",
    "artifacts/contracts/core/EquoraMatrix.sol/EquoraMatrix.json",
    matrixParams.slice(2),
    deployer
  );

  // ── 2. Wire Matrix → Vault ─────────────────────────────────────────────────
  await triggerContractMethod(
    deployer,
    matrix.addressHex,
    "setVaultContract(address)",
    coder.encode(["address"], ["0x" + vaultHex.slice(2)]).slice(2),
    "EquoraMatrix.setVaultContract(EquoraVault)"
  );

  // ── 3. Wire Matrix → DAO ───────────────────────────────────────────────────
  await triggerContractMethod(
    deployer,
    matrix.addressHex,
    "setDaoContract(address)",
    coder.encode(["address"], ["0x" + daoHex.slice(2)]).slice(2),
    "EquoraMatrix.setDaoContract(EquoraDAOv3)"
  );

  // ── 4. Wire Matrix → NFT minter ───────────────────────────────────────────
  await triggerContractMethod(
    deployer,
    nftHex,
    "setMinter(address,bool)",
    coder.encode(["address", "bool"], ["0x" + matrix.addressHex.slice(2), true]).slice(2),
    "EquoraNFT.setMinter(EquoraMatrix, true)"
  );

  // ── 5. Wire Vault → new Matrix ────────────────────────────────────────────
  await triggerContractMethod(
    deployer,
    vaultHex,
    "setMatrixContract(address)",
    coder.encode(["address"], ["0x" + matrix.addressHex.slice(2)]).slice(2),
    "EquoraVault.setMatrixContract(EquoraMatrix)"
  );

  // ── 6. Wire Registry → new Matrix ─────────────────────────────────────────
  // Get existing vault and dao from registry call, update matrix in authorized set
  await triggerContractMethod(
    deployer,
    registryHex,
    "setAuthorizedContracts(address,address,address)",
    coder.encode(
      ["address", "address", "address"],
      [
        "0x" + vaultHex.slice(2),
        "0x" + daoHex.slice(2),
        "0x" + matrix.addressHex.slice(2),
      ]
    ).slice(2),
    "EquoraRegistry.setAuthorizedContracts(Vault, DAO, Matrix)"
  );

  // ── 7. Set TROB Price on Matrix ────────────────────────────────────────────
  const setTrobPriceParam = coder.encode(["uint256"], [31740]).slice(2);
  await triggerContractMethod(
    deployer,
    matrix.addressHex,
    "setTrobPrice(uint256)",
    setTrobPriceParam,
    "EquoraMatrix.setTrobPrice(31740 → $0.03174 USD)"
  );

  // ── 8. Verify on-chain ─────────────────────────────────────────────────────
  console.log("\n🔍 Verifying on-chain wiring...");
  const vMatrixHex = await callConstant(vaultHex, "matrixContract()");
  const mVaultHex  = await callConstant(matrix.addressHex, "vaultContract()");
  const mDaoHex    = await callConstant(matrix.addressHex, "daoContract()");
  const mCostHex   = await callConstant(matrix.addressHex, "baseSlotCost()");

  const vaultPointsToMatrix = vMatrixHex.includes(matrix.addressHex.slice(2).toLowerCase());
  const matrixPointsToVault = mVaultHex.includes(vaultHex.slice(2).toLowerCase());
  const matrixPointsToDao   = mDaoHex.includes(daoHex.slice(2).toLowerCase());
  const baseCostSun = mCostHex ? Number(coder.decode(["uint256"], "0x" + mCostHex)[0]) : 0;

  console.log(`   Vault → Matrix wired: ${vaultPointsToMatrix ? "✅" : "❌"}`);
  console.log(`   Matrix → Vault wired: ${matrixPointsToVault ? "✅" : "❌"}`);
  console.log(`   Matrix → DAO wired:   ${matrixPointsToDao   ? "✅" : "❌"}`);
  console.log(`   Matrix baseSlotCost:  ${baseCostSun / 1e6} TROB (${baseCostSun} SUN)`);

  // ── 9. Update deployed-trobchain.json ──────────────────────────────────────
  deployed.contracts.EquoraMatrix = matrix;
  deployed.updatedAt = new Date().toISOString();
  fs.writeFileSync(deployedSummaryPath, JSON.stringify(deployed, null, 2));
  console.log(`\n💾 Updated deployed-trobchain.json`);

  // ── 10. Auto-sync all env files with new Matrix address ───────────────────
  function updateEnvFile(filePath, address58, addressHex) {
    if (!fs.existsSync(filePath)) return;
    let c = fs.readFileSync(filePath, "utf8");
    c = c.replace(/NEXT_PUBLIC_MATRIX_ADDRESS=["\']?[^"'\r\n]+["\']?/g, `NEXT_PUBLIC_MATRIX_ADDRESS="${address58}"`);
    c = c.replace(/NEXT_PUBLIC_MATRIX_HEX=["\']?[^"'\r\n]+["\']?/g,    `NEXT_PUBLIC_MATRIX_HEX="${addressHex}"`);
    fs.writeFileSync(filePath, c, "utf8");
    console.log(`   💾 Updated ${path.basename(filePath)}`);
  }

  const root = path.resolve(__dirname, "../../..");
  updateEnvFile(path.join(root, ".env"),                              matrix.addressBase58, matrix.addressHex);
  updateEnvFile(path.join(root, "apps/web-matrix/.env.local"),        matrix.addressBase58, matrix.addressHex);
  updateEnvFile(path.join(root, "apps/web-dao/.env.local"),           matrix.addressBase58, matrix.addressHex);

  // ── 11. Update contracts.ts fallback constants ─────────────────────────────
  const contractsTsPath = path.join(root, "apps/web-matrix/lib/contracts.ts");
  if (fs.existsSync(contractsTsPath)) {
    let ct = fs.readFileSync(contractsTsPath, "utf8");
    // Update MATRIX_ADDRESS and MATRIX_HEX fallback constants
    ct = ct.replace(/(MATRIX_ADDRESS\s*=\s*process\.env\.NEXT_PUBLIC_MATRIX_ADDRESS\s*\|\|\s*")[^"]+(")/,
      `$1${matrix.addressBase58}$2`);
    ct = ct.replace(/(MATRIX_HEX\s*=\s*process\.env\.NEXT_PUBLIC_MATRIX_HEX\s*\|\|\s*")[^"]+(")/,
      `$1${matrix.addressHex}$2`);
    // Also update TESTNET_DEFAULT_ADDRESSES if present
    ct = ct.replace(/(TESTNET_DEFAULT_ADDRESSES[\s\S]*?matrix:\s*")[^"]+(")/,
      `$1${matrix.addressBase58}$2`);
    fs.writeFileSync(contractsTsPath, ct, "utf8");
    console.log(`   💾 Updated lib/contracts.ts fallback matrix address`);
  }

  // ── 12. Update apps/indexer/src/config.ts ─────────────────────────────────
  const indexerConfigPath = path.join(root, "apps/indexer/src/config.ts");
  if (fs.existsSync(indexerConfigPath)) {
    let ic = fs.readFileSync(indexerConfigPath, "utf8");
    ic = ic.replace(/(TESTNET_DEFAULT_CONTRACTS[\s\S]*?matrix:\s*")[^"]+(")/,
      `$1${matrix.addressBase58}$2`);
    fs.writeFileSync(indexerConfigPath, ic, "utf8");
    console.log(`   💾 Updated apps/indexer/src/config.ts`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 MATRIX REDEPLOY COMPLETE!`);
  console.log(`   New EquoraMatrix: ${matrix.addressBase58}`);
  console.log(`                     ${matrix.addressHex}`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
