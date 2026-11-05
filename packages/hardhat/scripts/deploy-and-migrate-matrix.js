/**
 * deploy-and-migrate-matrix.js
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Deploys updated EquoraMatrix.sol (with seat 14 revert fix, getCycleSnapshotDetail, infinite multi-cycle escalation)
 * 2. Wires Matrix with existing Vault, Registry, DAO, and NFT contracts.
 * 3. Restores 100% of the authentic testnet state from matrix_dump.json:
 *    - All 32 active members
 *    - All slots, active boards, 14 node placements, and payout types
 *    - Cycle 1 snapshots (e.g. Genesis Root 14-seat fulfilled archive)
 *    - Direct referral counts and user balances
 * 4. Updates all frontend and indexer configs.
 */

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
  const contractHex = data.contract_address;
  const contractBase58 = hexToBase58(contractHex);
  await sleep(10000); // 10s confirmation
  console.log(`   ✅ ${name}: ${contractBase58} (${contractHex})`);
  return { addressHex: contractHex, addressBase58: contractBase58 };
}

async function triggerContractMethod(deployer, contractAddressHex, selector, paramHex, label) {
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
  await sleep(2500);
  console.log(`   ✅ ${label}`);
}

async function main() {
  const privKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privKey) throw new Error("DEPLOYER_PRIVATE_KEY not set in .env");
  const deployer = privateKeyToAddress(privKey);

  console.log(`\n======================================================`);
  console.log(`🌟 EQUORA MATRIX — DEPLOY & STATE MIGRATION`);
  console.log(`   Deployer: ${deployer.tronBase58}`);
  console.log(`======================================================`);

  const coder = new ethers.AbiCoder();
  const deployedSummaryPath = path.resolve(__dirname, "..", "deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedSummaryPath, "utf8"));

  const vaultHex    = deployed.contracts.EquoraVault?.addressHex;
  const registryHex = deployed.contracts.EquoraRegistry?.addressHex;
  const daoHex      = deployed.contracts.EquoraDAOv3?.addressHex || deployed.contracts.EquoraDAO?.addressHex;
  const nftHex      = deployed.contracts.EquoraNFT?.addressHex;

  // 1. Deploy Fresh Matrix
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const matrixParams = coder.encode(
    ["address", "address", "address"],
    [zeroAddress, "0x" + registryHex.slice(2), "0x" + nftHex.slice(2)]
  );

  const matrix = await deployContractToTrob(
    "EquoraMatrix",
    "artifacts/contracts/core/EquoraMatrix.sol/EquoraMatrix.json",
    matrixParams.slice(2),
    deployer
  );

  // 2. Wire contracts
  await triggerContractMethod(deployer, matrix.addressHex, "setVaultContract(address)", coder.encode(["address"], ["0x" + vaultHex.slice(2)]).slice(2), "setVaultContract");
  await triggerContractMethod(deployer, matrix.addressHex, "setDaoContract(address)", coder.encode(["address"], ["0x" + daoHex.slice(2)]).slice(2), "setDaoContract");
  await triggerContractMethod(deployer, nftHex, "setMinter(address,bool)", coder.encode(["address", "bool"], ["0x" + matrix.addressHex.slice(2), true]).slice(2), "EquoraNFT.setMinter");
  await triggerContractMethod(deployer, vaultHex, "setMatrixContract(address)", coder.encode(["address"], ["0x" + matrix.addressHex.slice(2)]).slice(2), "EquoraVault.setMatrixContract");
  await triggerContractMethod(deployer, registryHex, "setAuthorizedContracts(address,address,address)", coder.encode(["address", "address", "address"], ["0x" + vaultHex.slice(2), "0x" + daoHex.slice(2), "0x" + matrix.addressHex.slice(2)]).slice(2), "EquoraRegistry.setAuthorizedContracts");
  await triggerContractMethod(deployer, matrix.addressHex, "setTrobPrice(uint256)", coder.encode(["uint256"], [31740]).slice(2), "setTrobPrice(31740)");

  // 3. Set Genesis Root
  const genesisRootHex = "0x5fd6266A07FA4bA10Dd34E9A315EDD47904B8823"; // TJhwjg...
  await triggerContractMethod(deployer, matrix.addressHex, "setGenesisRoot(address)", coder.encode(["address"], [genesisRootHex]).slice(2), "setGenesisRoot");

  // 4. Import State from matrix_dump.json
  const dumpPath = "C:/Users/Dell/.gemini/antigravity/brain/8ad2b744-6cdd-4d76-b6ad-024604398918/scratch/matrix_dump.json";
  const dump = JSON.parse(fs.readFileSync(dumpPath, "utf8"));
  console.log(`\n📦 Importing state for ${dump.length} users...`);

  for (let i = 0; i < dump.length; i++) {
    const u = dump[i];
    console.log(`\nImporting [${i + 1}/${dump.length}] user ${u.user}...`);

    // Import stats
    const statsParam = coder.encode(
      ["address", "uint256", "uint256", "uint256"],
      [u.user, u.directs, BigInt(u.earned || 0), BigInt(u.balance || 0)]
    ).slice(2);
    await triggerContractMethod(deployer, matrix.addressHex, "importUserStats(address,uint256,uint256,uint256)", statsParam, `Stats for ${u.user.slice(0, 8)}`);

    // Import slots
    for (const s of u.slots) {
      const slotParam = coder.encode(
        ["address", "uint256", "bool", "bool", "uint256", "uint256", "address[14]", "address[14]", "uint8[14]"],
        [u.user, s.slot, s.isUnlocked, s.isLive, s.currentCycle, s.filledNodes, s.nodes, s.payoutRecipients, s.payoutTypes]
      ).slice(2);
      await triggerContractMethod(deployer, matrix.addressHex, "importUserSlotData(address,uint256,bool,bool,uint256,uint256,address[14],address[14],uint8[14])", slotParam, `Slot ${s.slot} for ${u.user.slice(0, 8)}`);

      // Import snapshots
      for (const snap of s.snapshots) {
        const snapParam = coder.encode(
          ["address", "uint256", "uint256", "address[14]", "address[14]", "uint8[14]", "uint256"],
          [u.user, s.slot, snap.cycleNumber, snap.nodes, snap.payoutRecipients, snap.payoutTypes, snap.completedAt]
        ).slice(2);
        await triggerContractMethod(deployer, matrix.addressHex, "importCycleSnapshot(address,uint256,uint256,address[14],address[14],uint8[14],uint256)", snapParam, `Snapshot C${snap.cycleNumber} S${s.slot}`);
      }
    }
  }

  // Set total members
  await triggerContractMethod(deployer, matrix.addressHex, "setTotalMembersCount(uint256)", coder.encode(["uint256"], [dump.length]).slice(2), `setTotalMembersCount(${dump.length})`);

  // 5. Update deployed-trobchain.json
  deployed.contracts.EquoraMatrix = matrix;
  deployed.updatedAt = new Date().toISOString();
  fs.writeFileSync(deployedSummaryPath, JSON.stringify(deployed, null, 2));

  // 6. Update env files
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

  // 7. Update contracts.ts
  const contractsTsPath = path.join(root, "apps/web-matrix/lib/contracts.ts");
  if (fs.existsSync(contractsTsPath)) {
    let ct = fs.readFileSync(contractsTsPath, "utf8");
    ct = ct.replace(/(MATRIX_ADDRESS\s*=\s*process\.env\.NEXT_PUBLIC_MATRIX_ADDRESS\s*\|\|\s*")[^"]+(")/, `$1${matrix.addressBase58}$2`);
    ct = ct.replace(/(MATRIX_HEX\s*=\s*process\.env\.NEXT_PUBLIC_MATRIX_HEX\s*\|\|\s*")[^"]+(")/, `$1${matrix.addressHex}$2`);
    ct = ct.replace(/(TESTNET_DEFAULT_ADDRESSES[\s\S]*?matrix:\s*")[^"]+(")/, `$1${matrix.addressBase58}$2`);
    fs.writeFileSync(contractsTsPath, ct, "utf8");
    console.log(`   💾 Updated lib/contracts.ts`);
  }

  // 8. Update indexer config
  const indexerConfigPath = path.join(root, "apps/indexer/src/config.ts");
  if (fs.existsSync(indexerConfigPath)) {
    let ic = fs.readFileSync(indexerConfigPath, "utf8");
    ic = ic.replace(/(TESTNET_DEFAULT_CONTRACTS[\s\S]*?matrix:\s*")[^"]+(")/, `$1${matrix.addressBase58}$2`);
    fs.writeFileSync(indexerConfigPath, ic, "utf8");
    console.log(`   💾 Updated apps/indexer/src/config.ts`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 DEPLOY & STATE MIGRATION COMPLETE!`);
  console.log(`   New Matrix: ${matrix.addressBase58} (${matrix.addressHex})`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
