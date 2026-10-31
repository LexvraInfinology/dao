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
    fee_limit: 1000000000, // 1,000 TROB
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 10000000,
    abi: JSON.stringify(artifact.abi),
    bytecode: artifact.bytecode.replace(/^0x/, ""),
    parameter: constructorParamsHex ? constructorParamsHex.replace(/^0x/, "") : "",
    name: name,
  };

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
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
    } catch (err) {
      console.warn(`   ⚠️ Deploy attempt ${attempt} for ${name} failed: ${err.message}`);
      if (attempt === 4) throw err;
      await sleep(3500);
    }
  }
}

async function triggerContractMethod(deployer, contractHex, functionSelector, parameterHex, description) {
  console.log(`\n⚡ Calling: ${description}...`);
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const triggerRes = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_address: deployer.tronHex,
          contract_address: contractHex,
          function_selector: functionSelector,
          parameter: parameterHex ? parameterHex.replace(/^0x/, "") : "",
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
    } catch (err) {
      console.warn(`   ⚠️ Method attempt ${attempt} for ${description} failed: ${err.message}`);
      if (attempt === 4) throw err;
      await sleep(3500);
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

async function main() {
  const privKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privKey) throw new Error("DEPLOYER_PRIVATE_KEY is missing in environment");
  const deployer = privateKeyToAddress(privKey);

  const SEAT1_KEY = "d729c3fce80e3e831a7167efbe9e7b768f0bf8cb2ee4dfe87559208cb9a7a0a0";
  const seat1 = privateKeyToAddress(SEAT1_KEY);

  console.log(`======================================================`);
  console.log(`🌟 EQUORA PROTOCOL — COMPLETE FRESH ECOSYSTEM DEPLOYMENT`);
  console.log(`   Deployer: ${deployer.tronBase58} (${deployer.tronHex})`);
  console.log(`   Root Seat 1: ${seat1.tronBase58} (${seat1.evmAddress})`);
  console.log(`   Fullnode: ${FULLNODE_URL}`);
  console.log(`======================================================`);

  const coder = new ethers.AbiCoder();
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  // Existing EquoraToken
  const deployedSummaryPath = path.resolve(__dirname, "..", "deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedSummaryPath, "utf8"));
  const tokenHex = deployed.contracts.EquoraToken.addressHex;

  // 1. Deploy Fresh EquoraRegistry (Root: Seat 1 Founder)
  const regParams = coder.encode(["address"], [seat1.evmAddress]);
  const registry = await deployContractToTrob(
    "EquoraRegistry",
    "artifacts/contracts/core/EquoraRegistry.sol/EquoraRegistry.json",
    regParams,
    deployer
  );

  // 2. Deploy Fresh EquoraNFT
  const nft = await deployContractToTrob(
    "EquoraNFT",
    "artifacts/contracts/rewards/EquoraNFT.sol/EquoraNFT.json",
    "",
    deployer
  );

  // 3. Deploy Fresh EquoraVault
  const vaultParams = coder.encode(
    ["address", "address"],
    ["0x" + tokenHex.slice(2), "0x" + registry.addressHex.slice(2)]
  );
  const vault = await deployContractToTrob(
    "EquoraVault",
    "artifacts/contracts/core/EquoraVault.sol/EquoraVault.json",
    vaultParams,
    deployer
  );

  // 4. Deploy Fresh EquoraSalaryPool (Royalty Pool)
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

  // 5. Deploy Fresh EquoraRewardPool (Level Rewards)
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

  // 6. Deploy Fresh EquoraMagicBox (Blind Box)
  const magicParams = coder.encode(
    ["address", "address"],
    ["0x" + tokenHex.slice(2), "0x" + vault.addressHex.slice(2)]
  );
  const magicBox = await deployContractToTrob(
    "EquoraMagicBox",
    "artifacts/contracts/pools/EquoraMagicBox.sol/EquoraMagicBox.json",
    magicParams,
    deployer
  );

  // 7. Deploy Fresh EquoraDAOv2
  const daoV2Params = coder.encode(
    ["address", "address"],
    [zeroAddress, "0x" + registry.addressHex.slice(2)]
  );
  const dao = await deployContractToTrob(
    "EquoraDAOv2",
    "artifacts/contracts/core/EquoraDAOv2.sol/EquoraDAOv2.json",
    daoV2Params,
    deployer
  );

  // 8. Deploy Fresh EquoraMatrix
  const matrixParams = coder.encode(
    ["address", "address", "address"],
    [zeroAddress, "0x" + registry.addressHex.slice(2), "0x" + nft.addressHex.slice(2)]
  );
  const matrix = await deployContractToTrob(
    "EquoraMatrix",
    "artifacts/contracts/core/EquoraMatrix.sol/EquoraMatrix.json",
    matrixParams,
    deployer
  );

  // ══════════════════════════════════════════════════════════════════
  // ON-CHAIN WIRING
  // ══════════════════════════════════════════════════════════════════
  console.log("\n======================================================");
  console.log("🔗 WIRING ALL CONTRACTS TOGETHER ON-CHAIN");
  console.log("======================================================");

  // A. Initialize Vault with 4 Pools
  const initVaultParam = coder.encode(
    ["address", "address", "address", "address"],
    [
      "0x" + dao.addressHex.slice(2),
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

  // B. Authorize EquoraMatrix on EquoraVault
  const setMatrixParam = coder.encode(["address"], ["0x" + matrix.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    vault.addressHex,
    "setMatrixContract(address)",
    setMatrixParam,
    "EquoraVault.setMatrixContract(EquoraMatrix)"
  );

  // C. salaryPool.setRewardPool(rewardPool)
  const setRewardParam = coder.encode(["address"], ["0x" + rewardPool.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    salaryPool.addressHex,
    "setRewardPool(address)",
    setRewardParam,
    "EquoraSalaryPool.setRewardPool(EquoraRewardPool)"
  );

  // D. rewardPool.setAuthorizedCaller(salaryPool)
  const setAuthCallerParam = coder.encode(["address"], ["0x" + salaryPool.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    rewardPool.addressHex,
    "setAuthorizedCaller(address)",
    setAuthCallerParam,
    "EquoraRewardPool.setAuthorizedCaller(EquoraSalaryPool)"
  );

  // E. matrix.setVaultContract(vault)
  const setVaultOnMatrixParam = coder.encode(["address"], ["0x" + vault.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    matrix.addressHex,
    "setVaultContract(address)",
    setVaultOnMatrixParam,
    "EquoraMatrix.setVaultContract(EquoraVault)"
  );

  // F. matrix.setDaoContract(dao)
  const setDaoOnMatrixParam = coder.encode(["address"], ["0x" + dao.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    matrix.addressHex,
    "setDaoContract(address)",
    setDaoOnMatrixParam,
    "EquoraMatrix.setDaoContract(EquoraDAOv2)"
  );

  // G. dao.setTreasuryVault(vault)
  const setVaultOnDaoParam = coder.encode(["address"], ["0x" + vault.addressHex.slice(2)]);
  await triggerContractMethod(
    deployer,
    dao.addressHex,
    "setTreasuryVault(address)",
    setVaultOnDaoParam,
    "EquoraDAOv2.setTreasuryVault(EquoraVault)"
  );

  // H. registry.setAuthorizedContracts(vault, dao, matrix)
  const setAuthRegistryParam = coder.encode(
    ["address", "address", "address"],
    ["0x" + vault.addressHex.slice(2), "0x" + dao.addressHex.slice(2), "0x" + matrix.addressHex.slice(2)]
  );
  await triggerContractMethod(
    deployer,
    registry.addressHex,
    "setAuthorizedContracts(address,address,address)",
    setAuthRegistryParam,
    "EquoraRegistry.setAuthorizedContracts(vault, dao, matrix)"
  );

  // I. nft.setMinter(matrix, true)
  const setMinterParam = coder.encode(["address", "bool"], ["0x" + matrix.addressHex.slice(2), true]);
  await triggerContractMethod(
    deployer,
    nft.addressHex,
    "setMinter(address,bool)",
    setMinterParam,
    "EquoraNFT.setMinter(EquoraMatrix, true)"
  );

  // J1. Set Dynamic Trob Price on Matrix: $0.03174/TROB (31740)
  const setTrobPriceParam = coder.encode(["uint256"], [31740]);
  await triggerContractMethod(
    deployer,
    matrix.addressHex,
    "setTrobPrice(uint256)",
    setTrobPriceParam,
    "EquoraMatrix.setTrobPrice(31740 -> $0.03174 USD)"
  );

  // J2. Set Dynamic Trob Price on DAOv2: $0.03174/TROB (31740)
  await triggerContractMethod(
    deployer,
    dao.addressHex,
    "setTrobPrice(uint256)",
    setTrobPriceParam,
    "EquoraDAOv2.setTrobPrice(31740 -> $0.03174 USD)"
  );

  // K. Register 2 DAO IDs on EquoraDAOv2 (Seat 1 Founder + Seat 2 Member)
  console.log("\n======================================================");
  console.log("🏛️ REGISTERING 2 DAO MEMBERS ON-CHAIN");
  console.log("======================================================");
  const dao1Evm = seat1.evmAddress;
  const dao2Hex = base58ToHex("THB9S4bRBzR6Zwt4fz3hAfi3TC3AC6pLhx");
  const dao2Evm = "0x" + dao2Hex.slice(2);

  const migrateParams = coder.encode(
    ["address[]", "uint256[]", "uint256[]"],
    [[dao1Evm, dao2Evm], [1, 2], [0, 0]]
  );
  await triggerContractMethod(
    deployer,
    dao.addressHex,
    "migrateGenuineMembers(address[],uint256[],uint256[])",
    migrateParams,
    "EquoraDAOv2.migrateGenuineMembers(Seat 1 & Seat 2)"
  );

  // ══════════════════════════════════════════════════════════════════
  // ON-CHAIN VERIFICATION
  // ══════════════════════════════════════════════════════════════════
  console.log("\n======================================================");
  console.log("🔍 ON-CHAIN VERIFICATION OF FRESH WIRING");
  console.log("======================================================");

  const vInitHex = await callConstant(vault.addressHex, "initialized()");
  const vDaoHex = await callConstant(vault.addressHex, "daoPool()");
  const vSalaryHex = await callConstant(vault.addressHex, "salaryPool()");
  const vMagicHex = await callConstant(vault.addressHex, "magicBoxPool()");
  const vRewardsHex = await callConstant(vault.addressHex, "rewardsPool()");
  const vMatrixHex = await callConstant(vault.addressHex, "matrixContract()");
  const mCostHex = await callConstant(matrix.addressHex, "slotCosts(uint256)", coder.encode(["uint256"], [1]).slice(2));

  console.log("Vault Initialized:          ", coder.decode(["bool"], "0x" + vInitHex)[0]);
  console.log("Vault -> DAO Pool:          ", coder.decode(["address"], "0x" + vDaoHex)[0]);
  console.log("Vault -> Salary Pool:       ", coder.decode(["address"], "0x" + vSalaryHex)[0]);
  console.log("Vault -> Magic Box Pool:    ", coder.decode(["address"], "0x" + vMagicHex)[0]);
  console.log("Vault -> Rewards Pool:      ", coder.decode(["address"], "0x" + vRewardsHex)[0]);
  console.log("Vault -> Matrix Contract:   ", coder.decode(["address"], "0x" + vMatrixHex)[0]);
  const costSun = Number(coder.decode(["uint256"], "0x" + mCostHex)[0]);
  console.log(`Matrix Slot 1 Dynamic Cost:  ${costSun / 1e6} TROB (${costSun} SUN)`);

  // ══════════════════════════════════════════════════════════════════
  // SAVE CONFIGURATIONS & ARTIFACTS
  // ══════════════════════════════════════════════════════════════════
  deployed.contracts.EquoraRegistry = registry;
  deployed.contracts.EquoraNFT = nft;
  deployed.contracts.EquoraVault = vault;
  deployed.contracts.EquoraSalaryPool = salaryPool;
  deployed.contracts.EquoraRewardPool = rewardPool;
  deployed.contracts.EquoraMagicBox = magicBox;
  deployed.contracts.EquoraDAO = dao;
  deployed.contracts.EquoraDAOv2 = dao;
  deployed.contracts.EquoraMatrix = matrix;
  deployed.updatedAt = new Date().toISOString();
  fs.writeFileSync(deployedSummaryPath, JSON.stringify(deployed, null, 2));

  // 1. Update Root .env
  const rootEnvPath = path.resolve(__dirname, "../../../.env");
  if (fs.existsSync(rootEnvPath)) {
    let c = fs.readFileSync(rootEnvPath, "utf8");
    c = c.replace(/NEXT_PUBLIC_REGISTRY_ADDRESS="[^"]*"/, `NEXT_PUBLIC_REGISTRY_ADDRESS="${registry.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_REGISTRY_HEX="[^"]*"/, `NEXT_PUBLIC_REGISTRY_HEX="${registry.addressHex}"`);
    c = c.replace(/NEXT_PUBLIC_NFT_ADDRESS="[^"]*"/, `NEXT_PUBLIC_NFT_ADDRESS="${nft.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_NFT_HEX="[^"]*"/, `NEXT_PUBLIC_NFT_HEX="${nft.addressHex}"`);
    c = c.replace(/NEXT_PUBLIC_DAO_MEMBERSHIP_ADDRESS="[^"]*"/, `NEXT_PUBLIC_DAO_MEMBERSHIP_ADDRESS="${nft.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_DAO_ADDRESS="[^"]*"/, `NEXT_PUBLIC_DAO_ADDRESS="${dao.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_DAO_HEX="[^"]*"/, `NEXT_PUBLIC_DAO_HEX="${dao.addressHex}"`);
    c = c.replace(/NEXT_PUBLIC_VAULT_ADDRESS="[^"]*"/, `NEXT_PUBLIC_VAULT_ADDRESS="${vault.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_VAULT_HEX="[^"]*"/, `NEXT_PUBLIC_VAULT_HEX="${vault.addressHex}"`);
    c = c.replace(/NEXT_PUBLIC_MATRIX_ADDRESS="[^"]*"/, `NEXT_PUBLIC_MATRIX_ADDRESS="${matrix.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_MATRIX_HEX="[^"]*"/, `NEXT_PUBLIC_MATRIX_HEX="${matrix.addressHex}"`);
    c = c.replace(/NEXT_PUBLIC_SALARY_POOL_ADDRESS="[^"]*"/, `NEXT_PUBLIC_SALARY_POOL_ADDRESS="${salaryPool.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_REWARD_POOL_ADDRESS="[^"]*"/, `NEXT_PUBLIC_REWARD_POOL_ADDRESS="${rewardPool.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_MAGIC_BOX_ADDRESS="[^"]*"/, `NEXT_PUBLIC_MAGIC_BOX_ADDRESS="${magicBox.addressBase58}"`);
    fs.writeFileSync(rootEnvPath, c, "utf8");
    console.log(`💾 Updated root .env`);
  }

  // 2. Update apps/web-matrix/.env.local
  const matrixEnvPath = path.resolve(__dirname, "../../../apps/web-matrix/.env.local");
  if (fs.existsSync(matrixEnvPath)) {
    let c = fs.readFileSync(matrixEnvPath, "utf8");
    c = c.replace(/NEXT_PUBLIC_MATRIX_ADDRESS=[^\r\n]*/, `NEXT_PUBLIC_MATRIX_ADDRESS=${matrix.addressBase58}`);
    c = c.replace(/NEXT_PUBLIC_DAO_ADDRESS=[^\r\n]*/, `NEXT_PUBLIC_DAO_ADDRESS=${dao.addressBase58}`);
    c = c.replace(/NEXT_PUBLIC_VAULT_ADDRESS=[^\r\n]*/, `NEXT_PUBLIC_VAULT_ADDRESS=${vault.addressBase58}`);
    c = c.replace(/NEXT_PUBLIC_REGISTRY_ADDRESS=[^\r\n]*/, `NEXT_PUBLIC_REGISTRY_ADDRESS=${registry.addressBase58}`);
    c = c.replace(/NEXT_PUBLIC_NFT_ADDRESS=[^\r\n]*/, `NEXT_PUBLIC_NFT_ADDRESS=${nft.addressBase58}`);
    fs.writeFileSync(matrixEnvPath, c, "utf8");
    console.log(`💾 Updated web-matrix/.env.local`);
  }

  // 3. Update apps/web-dao/.env.local
  const daoEnvPath = path.resolve(__dirname, "../../../apps/web-dao/.env.local");
  if (fs.existsSync(daoEnvPath)) {
    let c = fs.readFileSync(daoEnvPath, "utf8");
    c = c.replace(/NEXT_PUBLIC_MATRIX_ADDRESS="[^"]*"/, `NEXT_PUBLIC_MATRIX_ADDRESS="${matrix.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_MATRIX_HEX="[^"]*"/, `NEXT_PUBLIC_MATRIX_HEX="${matrix.addressHex}"`);
    c = c.replace(/NEXT_PUBLIC_DAO_ADDRESS="[^"]*"/, `NEXT_PUBLIC_DAO_ADDRESS="${dao.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_DAO_HEX="[^"]*"/, `NEXT_PUBLIC_DAO_HEX="${dao.addressHex}"`);
    c = c.replace(/NEXT_PUBLIC_VAULT_ADDRESS="[^"]*"/, `NEXT_PUBLIC_VAULT_ADDRESS="${vault.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_VAULT_HEX="[^"]*"/, `NEXT_PUBLIC_VAULT_HEX="${vault.addressHex}"`);
    c = c.replace(/NEXT_PUBLIC_REGISTRY_ADDRESS="[^"]*"/, `NEXT_PUBLIC_REGISTRY_ADDRESS="${registry.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_REGISTRY_HEX="[^"]*"/, `NEXT_PUBLIC_REGISTRY_HEX="${registry.addressHex}"`);
    c = c.replace(/NEXT_PUBLIC_NFT_ADDRESS="[^"]*"/, `NEXT_PUBLIC_NFT_ADDRESS="${nft.addressBase58}"`);
    c = c.replace(/NEXT_PUBLIC_DAO_MEMBERSHIP_ADDRESS="[^"]*"/, `NEXT_PUBLIC_DAO_MEMBERSHIP_ADDRESS="${nft.addressBase58}"`);
    fs.writeFileSync(daoEnvPath, c, "utf8");
    console.log(`💾 Updated web-dao/.env.local`);
  }

  // 4. Update apps/web-matrix/lib/contracts.ts
  const contractsTsPath = path.resolve(__dirname, "../../../apps/web-matrix/lib/contracts.ts");
  if (fs.existsSync(contractsTsPath)) {
    let c = fs.readFileSync(contractsTsPath, "utf8");
    c = c.replace(/matrix:\s*["'][^"']+["']/, `matrix: "${matrix.addressBase58}"`);
    c = c.replace(/dao:\s*["'][^"']+["']/, `dao: "${dao.addressBase58}"`);
    c = c.replace(/vault:\s*["'][^"']+["']/, `vault: "${vault.addressBase58}"`);
    c = c.replace(/registry:\s*["'][^"']+["']/, `registry: "${registry.addressBase58}"`);
    c = c.replace(/salaryPool:\s*["'][^"']+["']/, `salaryPool: "${salaryPool.addressBase58}"`);
    c = c.replace(/rewardPool:\s*["'][^"']+["']/, `rewardPool: "${rewardPool.addressBase58}"`);
    c = c.replace(/magicBoxPool:\s*["'][^"']+["']/, `magicBoxPool: "${magicBox.addressBase58}"`);
    c = c.replace(/nft:\s*["'][^"']+["']/, `nft: "${nft.addressBase58}"`);
    fs.writeFileSync(contractsTsPath, c, "utf8");
    console.log(`💾 Updated web-matrix/lib/contracts.ts`);
  }

  // 5. Update apps/web-dao/src/config/env.ts default testnet fallbacks
  const daoEnvTsPath = path.resolve(__dirname, "../../../apps/web-dao/src/config/env.ts");
  if (fs.existsSync(daoEnvTsPath)) {
    let c = fs.readFileSync(daoEnvTsPath, "utf8");
    c = c.replace(/'TPw1MNKr2QcU3CizievsskdSRtuY18Zvvr'/g, `'${dao.addressBase58}'`);
    c = c.replace(/'0x9927344a18809582c7a97fb18be456fdd73171aa'/g, `'0x${dao.addressHex.slice(2)}'`);
    c = c.replace(/'TEbnspqeni1LSvBcnk1XGj3p3DE8J65JV1'/g, `'${matrix.addressBase58}'`);
    fs.writeFileSync(daoEnvTsPath, c, "utf8");
    console.log(`💾 Updated web-dao/src/config/env.ts fallbacks`);
  }

  // 6. Update apps/indexer/src/config.ts default testnet fallbacks
  const indexerConfigPath = path.resolve(__dirname, "../../../apps/indexer/src/config.ts");
  if (fs.existsSync(indexerConfigPath)) {
    let c = fs.readFileSync(indexerConfigPath, "utf8");
    c = c.replace(/registry:\s*"[^"]*",\s*\/\/\s*testnet/, `registry: "${registry.addressBase58}",`);
    c = c.replace(/"TCcHDFibnBsSwZhCRyvevXQfoAQ6NMyYWN"/, `"${registry.addressBase58}"`);
    c = c.replace(/"TQDJwbuFQEXDsSaeGVcU1iRF3WPjRfeLdi"/g, `"${nft.addressBase58}"`);
    c = c.replace(/"TPw1MNKr2QcU3CizievsskdSRtuY18Zvvr"/, `"${dao.addressBase58}"`);
    c = c.replace(/"TWZZ1ZvU2WmiEYzoXkeKjeKY66nyww2GbY"/, `"${matrix.addressBase58}"`);
    c = c.replace(/"TPQyyruMPLn1S7szNTGWBtB1Yv1Noc1BRX"/, `"${vault.addressBase58}"`);
    c = c.replace(/"TLecfvBRdFetBn3c4uMguAKEmqdJdggqvx"/, `"${salaryPool.addressBase58}"`);
    c = c.replace(/"TUTGW96GTQN84LPaS8iki15B6R9LBqM1LE"/, `"${rewardPool.addressBase58}"`);
    c = c.replace(/"TMskpNoL2qUUArzo2ECHjCKVeYCnnU5W1C"/, `"${magicBox.addressBase58}"`);
    fs.writeFileSync(indexerConfigPath, c, "utf8");
    console.log(`💾 Updated indexer/src/config.ts fallbacks`);
  }

  // 7. Update apps/web-dao/src/utils/trobAddress.ts default testnet fallbacks
  const daoTrobAddrPath = path.resolve(__dirname, "../../../apps/web-dao/src/utils/trobAddress.ts");
  if (fs.existsSync(daoTrobAddrPath)) {
    let c = fs.readFileSync(daoTrobAddrPath, "utf8");
    c = c.replace(/base58:\s*process\.env\.NEXT_PUBLIC_REGISTRY_ADDRESS\s*\|\|\s*'[^']*'/, `base58: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || '${registry.addressBase58}'`);
    c = c.replace(/hex:\s*process\.env\.NEXT_PUBLIC_REGISTRY_HEX\s*\|\|\s*'[^']*'/, `hex: process.env.NEXT_PUBLIC_REGISTRY_HEX || '${registry.addressHex}'`);
    c = c.replace(/base58:\s*process\.env\.NEXT_PUBLIC_VAULT_ADDRESS\s*\|\|\s*'[^']*'/, `base58: process.env.NEXT_PUBLIC_VAULT_ADDRESS || '${vault.addressBase58}'`);
    c = c.replace(/hex:\s*process\.env\.NEXT_PUBLIC_VAULT_HEX\s*\|\|\s*'[^']*'/, `hex: process.env.NEXT_PUBLIC_VAULT_HEX || '${vault.addressHex}'`);
    c = c.replace(/base58:\s*process\.env\.NEXT_PUBLIC_MATRIX_ADDRESS\s*\|\|\s*'[^']*'/, `base58: process.env.NEXT_PUBLIC_MATRIX_ADDRESS || '${matrix.addressBase58}'`);
    c = c.replace(/hex:\s*process\.env\.NEXT_PUBLIC_MATRIX_HEX\s*\|\|\s*'[^']*'/, `hex: process.env.NEXT_PUBLIC_MATRIX_HEX || '${matrix.addressHex}'`);
    fs.writeFileSync(daoTrobAddrPath, c, "utf8");
    console.log(`💾 Updated web-dao/src/utils/trobAddress.ts fallbacks`);
  }

  // Reset joined-members.json for fresh start
  const membersPath = path.resolve(__dirname, "../joined-members.json");
  const webMembersPath = path.resolve(__dirname, "../../../apps/web-matrix/lib/joinedMembers.json");
  fs.writeFileSync(membersPath, JSON.stringify([], null, 2), "utf8");
  if (fs.existsSync(path.dirname(webMembersPath))) {
    fs.writeFileSync(webMembersPath, JSON.stringify([], null, 2), "utf8");
  }
  console.log(`💾 Reset joined-members.json and web-matrix/lib/joinedMembers.json for clean run.`);

  console.log("\n🎉 ENTIRE FRESH ECOSYSTEM DEPLOYED & WIRED ON TESTNET!");
  console.log(`   Registry:   ${registry.addressBase58}`);
  console.log(`   NFT:        ${nft.addressBase58}`);
  console.log(`   Vault:      ${vault.addressBase58}`);
  console.log(`   SalaryPool: ${salaryPool.addressBase58}`);
  console.log(`   RewardPool: ${rewardPool.addressBase58}`);
  console.log(`   MagicBox:   ${magicBox.addressBase58}`);
  console.log(`   DAO:        ${dao.addressBase58}`);
  console.log(`   Matrix:     ${matrix.addressBase58}`);
}

main().catch((err) => {
  console.error("❌ Fatal deployment error:", err);
  process.exit(1);
});
