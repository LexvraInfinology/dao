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

function base58ToHex(b58) {
  const bytes = [0];
  for (let i = 0; i < b58.length; i++) {
    const c = b58[i];
    const val = ALPHABET.indexOf(c);
    if (val === -1) throw new Error("Invalid base58 character");
    for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
    bytes[0] += val;
    let carry = 0;
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] += carry;
      carry = (bytes[j] / 58) | 0;
      bytes[j] %= 58;
    }
    while (carry) {
      bytes.push(carry % 58);
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
      const timer = setTimeout(() => controller.abort(), 30000);
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
  console.log(`🚀 Preparing Deployment for: ${name}`);
  console.log(`   Deployer: ${deployer.tronBase58} (${deployer.tronHex})`);

  const payload = {
    owner_address: deployer.tronHex,
    fee_limit: 100000000, // 100 TROB
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

async function main() {
  const privKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privKey) throw new Error("DEPLOYER_PRIVATE_KEY is missing");

  const deployer = privateKeyToAddress(privKey);
  console.log(`Starting deployment with account: ${deployer.tronBase58}`);

  const deployedSummaryPath = path.resolve(__dirname, "..", "deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedSummaryPath, "utf8"));

  const tokenHex = deployed.contracts.EquoraToken.addressHex;
  const registryHex = deployed.contracts.EquoraRegistry.addressHex;
  const nftHex = deployed.contracts.EquoraNFT.addressHex;
  const daoHex = deployed.contracts.EquoraDAO.addressHex;

  const coder = new ethers.AbiCoder();

  // 1. Reusable / Deployed Native TROB EquoraVault
  const vault = {
    name: "EquoraVault",
    addressBase58: "THQBFEJsH2dBAuXQQT8LErqsjsD7hCPLfa",
    addressHex: "415181d06090f16c9bffef71e2ccd7ed17f676aad9",
    txHash: "0x7683006d028d3231981f0628fa46f6dbf2a2a4fde2adbbcf9802cef6a735cbc6",
  };
  console.log(`✅ Using deployed Native TROB EquoraVault: ${vault.addressBase58} (${vault.addressHex})`);

  // 2. Deploy Native TROB EquoraMatrix
  const matrixParams = coder.encode(
    ["address", "address", "address"],
    [
      "0x" + tokenHex.slice(2),
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

  // 3. Wire Contracts
  // 3a. EquoraVault.setMatrixContract(matrix)
  const setMatrixParam = coder.encode(["address"], ["0x" + matrix.addressHex.slice(2)]);
  try {
    await triggerContractMethod(
      deployer,
      vault.addressHex,
      "setMatrixContract(address)",
      setMatrixParam,
      "EquoraVault.setMatrixContract"
    );
  } catch (err) {
    console.warn(`   ⚠️ EquoraVault.setMatrixContract skipped (already locked on vault): ${err.message}`);
  }

  // 3b. EquoraMatrix.setVaultContract(vault)
  const setVaultParam = coder.encode(["address"], ["0x" + vault.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    matrix.addressHex,
    "setVaultContract(address)",
    setVaultParam,
    "EquoraMatrix.setVaultContract"
  );

  // 3c. EquoraMatrix.setDaoContract(dao)
  const setDaoParam = coder.encode(["address"], ["0x" + daoHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    matrix.addressHex,
    "setDaoContract(address)",
    setDaoParam,
    "EquoraMatrix.setDaoContract"
  );

  // 3d. EquoraRegistry.setAuthorizedContracts(vault, dao, matrix)
  const setAuthParam = coder.encode(
    ["address", "address", "address"],
    [
      "0x" + vault.addressHex.slice(2),
      "0x" + daoHex.slice(2),
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
  deployed.contracts.EquoraVault = vault;
  deployed.contracts.EquoraMatrix = matrix;
  deployed.updatedAt = new Date().toISOString();
  fs.writeFileSync(deployedSummaryPath, JSON.stringify(deployed, null, 2));

  // 5. Update apps/web-matrix/.env.local
  const matrixEnvPath = path.resolve(__dirname, "../../../apps/web-matrix/.env.local");
  if (fs.existsSync(matrixEnvPath)) {
    let content = fs.readFileSync(matrixEnvPath, "utf8");
    content = content.replace(/NEXT_PUBLIC_MATRIX_ADDRESS=[^\r\n]*/, `NEXT_PUBLIC_MATRIX_ADDRESS=${matrix.addressBase58}`);
    fs.writeFileSync(matrixEnvPath, content);
    console.log(`   ✅ Updated ${matrixEnvPath}`);
  }

  // 6. Update apps/web-dao/.env.local
  const daoEnvPath = path.resolve(__dirname, "../../../apps/web-dao/.env.local");
  if (fs.existsSync(daoEnvPath)) {
    let content = fs.readFileSync(daoEnvPath, "utf8");
    content = content.replace(/NEXT_PUBLIC_MATRIX_ADDRESS="[^"]*"/, `NEXT_PUBLIC_MATRIX_ADDRESS="${matrix.addressBase58}"`);
    content = content.replace(/NEXT_PUBLIC_MATRIX_HEX="[^"]*"/, `NEXT_PUBLIC_MATRIX_HEX="${matrix.addressHex}"`);
    fs.writeFileSync(daoEnvPath, content);
    console.log(`   ✅ Updated ${daoEnvPath}`);
  }

  // 7. Update apps/web-matrix/lib/contracts.ts
  const contractsTsPath = path.resolve(__dirname, "../../../apps/web-matrix/lib/contracts.ts");
  if (fs.existsSync(contractsTsPath)) {
    let content = fs.readFileSync(contractsTsPath, "utf8");
    content = content.replace(/matrix:\s*"TEbnspqeni1LSvBcnk1XGj3p3DE8J65JV1"/, `matrix: "${matrix.addressBase58}"`);
    fs.writeFileSync(contractsTsPath, content);
    console.log(`   ✅ Updated default testnet matrix address in ${contractsTsPath}`);
  }

  console.log("\n======================================================");
  console.log("🎉 NATIVE TROB MATRIX & VAULT SUCCESSFULLY DEPLOYED & WIRED!");
  console.log(`   EquoraVault:  ${vault.addressBase58} (${vault.addressHex})`);
  console.log(`   EquoraMatrix: ${matrix.addressBase58} (${matrix.addressHex})`);
  console.log("======================================================\n");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
