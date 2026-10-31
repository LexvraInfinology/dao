const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config();

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
      console.warn(`[fetch] Attempt ${attempt}/${retries} failed for ${url}: ${err.message}`);
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
    fee_limit: 1000000000, // 1000 TROB
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
    throw new Error(`deploycontract failed: ${createData.Error}`);
  }

  const txID = createData.txID;
  const contractAddressHex = createData.contract_address;
  const contractAddressBase58 = hexToBase58(contractAddressHex);

  console.log(`   txID: ${txID}`);
  console.log(`   Contract Base58: ${contractAddressBase58}`);
  console.log(`   Contract Hex:    ${contractAddressHex}`);

  await broadcastTransaction(deployer, createData);
  console.log(`   Waiting 12s for on-chain block confirmation...`);
  await sleep(12000);

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

async function main() {
  const privKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privKey) throw new Error("DEPLOYER_PRIVATE_KEY is missing in environment");

  const deployer = privateKeyToAddress(privKey);
  console.log(`======================================================`);
  console.log(`🌟 EQUORA PROTOCOL — FRESH TESTNET DEPLOYMENT`);
  console.log(`   Deployer: ${deployer.tronBase58}`);
  console.log(`   Fullnode: ${FULLNODE_URL}`);
  console.log(`======================================================`);

  const deployedSummaryPath = path.resolve(__dirname, "..", "deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedSummaryPath, "utf8"));

  const registryHex = deployed.contracts.EquoraRegistry.addressHex;
  const nftHex = deployed.contracts.EquoraNFT.addressHex;
  const vaultHex = deployed.contracts.EquoraVault.addressHex;

  const coder = new ethers.AbiCoder();
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  // 1. Deploy Fresh EquoraDAOv2 (Native TROB, $300 floor, 100 seats)
  const daoV2Params = coder.encode(
    ["address", "address"],
    [zeroAddress, "0x" + registryHex.slice(2)]
  );
  const daoV2 = await deployContractToTrob(
    "EquoraDAOv2",
    "artifacts/contracts/core/EquoraDAOv2.sol/EquoraDAOv2.json",
    daoV2Params,
    deployer
  );

  // 2. Deploy Fresh EquoraMatrix (Native TROB, $30 fixed board, 300 TROB floor)
  const matrixParams = coder.encode(
    ["address", "address", "address"],
    [
      zeroAddress,
      "0x" + registryHex.slice(2),
      "0x" + nftHex.slice(2),
    ]
  );
  const matrix = await deployContractToTrob(
    "EquoraMatrix",
    "artifacts/contracts/core/EquoraMatrix.sol/EquoraMatrix.json",
    matrixParams,
    deployer
  );

  // 3. WIRING CONTRACTS
  // 3a. EquoraVault.setMatrixContract(matrix)
  const setMatrixParam = coder.encode(["address"], ["0x" + matrix.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    vaultHex,
    "setMatrixContract(address)",
    setMatrixParam,
    "EquoraVault.setMatrixContract"
  );

  // 3b. EquoraDAOv2.setTreasuryVault(vault)
  const setTreasuryParam = coder.encode(["address"], ["0x" + vaultHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    daoV2.addressHex,
    "setTreasuryVault(address)",
    setTreasuryParam,
    "EquoraDAOv2.setTreasuryVault"
  );

  // 3c. EquoraMatrix.setVaultContract(vault)
  const setVaultParam = coder.encode(["address"], ["0x" + vaultHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    matrix.addressHex,
    "setVaultContract(address)",
    setVaultParam,
    "EquoraMatrix.setVaultContract"
  );

  // 3d. EquoraMatrix.setDaoContract(daoV2)
  const setDaoParam = coder.encode(["address"], ["0x" + daoV2.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    matrix.addressHex,
    "setDaoContract(address)",
    setDaoParam,
    "EquoraMatrix.setDaoContract"
  );

  // 3e. EquoraRegistry.setAuthorizedContracts(vault, daoV2, matrix)
  const setAuthParam = coder.encode(
    ["address", "address", "address"],
    [
      "0x" + vaultHex.slice(2),
      "0x" + daoV2.addressHex.slice(2),
      "0x" + matrix.addressHex.slice(2),
    ]
  );
  await triggerContractMethod(
    deployer,
    registryHex,
    "setAuthorizedContracts(address,address,address)",
    setAuthParam,
    "EquoraRegistry.setAuthorizedContracts"
  );

  // 4. Update deployed-trobchain.json
  deployed.contracts.EquoraDAO = daoV2;
  deployed.contracts.EquoraDAOv2 = daoV2;
  deployed.contracts.EquoraMatrix = matrix;
  deployed.updatedAt = new Date().toISOString();
  fs.writeFileSync(deployedSummaryPath, JSON.stringify(deployed, null, 2));

  // 5. Update .env.local files
  const matrixEnvPath = path.resolve(__dirname, "../../../apps/web-matrix/.env.local");
  if (fs.existsSync(matrixEnvPath)) {
    let content = fs.readFileSync(matrixEnvPath, "utf8");
    content = content.replace(/NEXT_PUBLIC_MATRIX_ADDRESS=[^\r\n]*/, `NEXT_PUBLIC_MATRIX_ADDRESS=${matrix.addressBase58}`);
    content = content.replace(/NEXT_PUBLIC_DAO_ADDRESS=[^\r\n]*/, `NEXT_PUBLIC_DAO_ADDRESS=${daoV2.addressBase58}`);
    fs.writeFileSync(matrixEnvPath, content);
    console.log(`   Updated ${matrixEnvPath}`);
  }

  const daoEnvPath = path.resolve(__dirname, "../../../apps/web-dao/.env.local");
  if (fs.existsSync(daoEnvPath)) {
    let content = fs.readFileSync(daoEnvPath, "utf8");
    content = content.replace(/NEXT_PUBLIC_MATRIX_ADDRESS="[^"]*"/, `NEXT_PUBLIC_MATRIX_ADDRESS="${matrix.addressBase58}"`);
    content = content.replace(/NEXT_PUBLIC_DAO_ADDRESS="[^"]*"/, `NEXT_PUBLIC_DAO_ADDRESS="${daoV2.addressBase58}"`);
    fs.writeFileSync(daoEnvPath, content);
    console.log(`   Updated ${daoEnvPath}`);
  }

  console.log("\n======================================================");
  console.log("🎉 FRESH TESTNET DEPLOYMENT & ON-CHAIN WIRING COMPLETE!");
  console.log(`   EquoraDAOv2:  ${daoV2.addressBase58} (${daoV2.addressHex})`);
  console.log(`   EquoraMatrix: ${matrix.addressBase58} (${matrix.addressHex})`);
  console.log(`   EquoraVault:  ${deployed.contracts.EquoraVault.addressBase58}`);
  console.log(`   Registry:     ${deployed.contracts.EquoraRegistry.addressBase58}`);
  console.log("======================================================\n");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
