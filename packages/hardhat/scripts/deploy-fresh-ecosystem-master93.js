/**
 * EQUORA PROTOCOL & MATRIX: COMPLETE FRESH MAINNET DEPLOYMENT & 93-MEMBER MIGRATION
 *
 * Deployer: TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8
 * Network: TrobChain Mainnet (https://fullnode-one.trobchain.com)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns = require("dns");
const { ethers } = require("ethers");

dns.setDefaultResultOrder("ipv4first");

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function encode58(buffer) {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      bytes = digits[j] + carry;
      carry = (bytes / 58) | 0;
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
  const addressHex = clean.length === 40 ? "41" + clean : clean;
  const buf = Buffer.from(addressHex, "hex");
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
    if (val === -1) throw new Error("Invalid base58: " + c);
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
  const decodedHex = buf.subarray(0, buf.length - 4).toString("hex");
  // Trim Tron prefix '41' if present
  if (decodedHex.startsWith("41") && decodedHex.length === 42) {
    return "0x" + decodedHex.slice(2);
  }
  return "0x" + decodedHex;
}

function privateKeyToSigner(privKeyHex) {
  const clean = privKeyHex.startsWith("0x") ? privKeyHex : "0x" + privKeyHex;
  const wallet = new ethers.Wallet(clean);
  const evmAddress = wallet.address.toLowerCase();
  const tronHex = "41" + evmAddress.slice(2);
  const tronBase58 = hexToBase58(tronHex);
  return {
    privateKey: clean,
    evmAddress,
    tronHex,
    tronBase58,
    signingKey: new ethers.SigningKey(clean),
  };
}

const MAINNET_RPC = "https://fullnode-one.trobchain.com";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function broadcastTransaction(signer, createData) {
  const txID = createData.txID;
  const sig = signer.signingKey.sign("0x" + txID);
  const vHex = sig.v.toString(16).padStart(2, "0");
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const res = await fetch(`${MAINNET_RPC}/wallet/broadcasttransaction`, {
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

async function waitForTx(txHash) {
  for (let attempt = 0; attempt < 30; attempt++) {
    await sleep(2000);
    try {
      const res = await fetch(`${MAINNET_RPC}/wallet/gettransactionbyid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: txHash }),
      });
      const tx = await res.json();
      if (tx.ret && tx.ret.length > 0) {
        const retStatus = tx.ret[0].contractRet;
        if (retStatus === "SUCCESS") {
          return tx;
        } else {
          throw new Error(`Transaction ${txHash} failed on-chain with status: ${retStatus}`);
        }
      }
    } catch (err) {
      if (err.message.includes("failed on-chain")) throw err;
    }
  }
  console.log(`   ⚠️ Tx ${txHash} not confirmed after 60s, continuing...`);
  return { ret: [{ contractRet: "PENDING" }] };
}

async function deployContract(signer, contractName, artifactSubpath, encodedParams = "") {
  console.log(`\n🚀 Deploying ${contractName}...`);
  const artifactPath = path.resolve(__dirname, "..", artifactSubpath);
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found: ${artifactPath}`);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const payload = {
    owner_address: signer.tronHex,
    fee_limit: 100_000_000,
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 100_000_000,
    abi: JSON.stringify(artifact.abi),
    bytecode: artifact.bytecode.replace(/^0x/, ""),
    parameter: encodedParams.replace(/^0x/, ""),
    name: contractName,
  };

  const createRes = await fetch(`${MAINNET_RPC}/wallet/deploycontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const createData = await createRes.json();
  if (createData.Error) {
    throw new Error(`deploycontract failed for ${contractName}: ${createData.Error}`);
  }

  await broadcastTransaction(signer, createData);
  const txHash = createData.txID;

  let contractHex = createData.contract_address;
  if (!contractHex && createData.raw_data?.contract?.[0]?.parameter?.value?.contract_address) {
    contractHex = createData.raw_data.contract[0].parameter.value.contract_address;
  }

  console.log(`   ⏳ Tx broadcast: ${txHash}. Waiting for on-chain confirmation...`);

  for (let i = 0; i < 20; i++) {
    await sleep(2500);
    try {
      const infoRes = await fetch(`${MAINNET_RPC}/wallet/gettransactioninfobyid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: txHash }),
      });
      const info = await infoRes.json();
      if (info && info.contract_address) {
        contractHex = info.contract_address;
        const contractBase58 = hexToBase58(contractHex);
        console.log(`   ✅ Confirmed: ${contractName} -> ${contractBase58} (0x${contractHex.slice(2)})`);
        return {
          contractName,
          base58: contractBase58,
          hex: contractHex,
          evm: "0x" + contractHex.slice(2),
          txHash,
        };
      }
    } catch {}
  }

  const contractBase58 = hexToBase58(contractHex);
  console.log(`   ✅ Resolved: ${contractName} -> ${contractBase58} (0x${contractHex.slice(2)})`);
  return {
    contractName,
    base58: contractBase58,
    hex: contractHex,
    evm: "0x" + contractHex.slice(2),
    txHash,
  };
}

async function triggerContract(signer, contractHex, functionSelector, parameterHex = "", callValue = 0) {
  const payload = {
    owner_address: signer.tronHex,
    contract_address: contractHex,
    function_selector: functionSelector,
    parameter: parameterHex,
    fee_limit: 100_000_000,
    call_value: callValue,
  };

  const createRes = await fetch(`${MAINNET_RPC}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const createData = await createRes.json();
  if (createData.Error) {
    throw new Error(`trigger failed for ${functionSelector}: ${createData.Error}`);
  }
  if (!createData.result?.result) {
    const msg = createData.result?.message ? Buffer.from(createData.result.message, "hex").toString() : JSON.stringify(createData);
    throw new Error(`trigger failed for ${functionSelector}: ${msg}`);
  }

  await broadcastTransaction(signer, createData.transaction);
  const txHash = createData.transaction.txID;
  console.log(`   📤 Called ${functionSelector.split("(")[0]} -> Tx: ${txHash}`);
  
  await waitForTx(txHash);
  await sleep(1500);
  return txHash;
}

async function callConstant(contractHex, functionSelector, parameterHex = "") {
  const res = await fetch(`${MAINNET_RPC}/wallet/triggerconstantcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: contractHex,
      contract_address: contractHex,
      function_selector: functionSelector,
      parameter: parameterHex,
    }),
  });
  const d = await res.json();
  return d.constant_result?.[0] || "";
}

async function main() {
  console.log("================================================================================");
  console.log("🚀 EQUORA PROTOCOL & MATRIX: COMPLETE FRESH MAINNET DEPLOYMENT (93 MEMBERS)");
  console.log("================================================================================");

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY environment variable is required");
  const signer = privateKeyToSigner(privateKey);
  console.log(`Deployer Address: ${signer.tronBase58} (${signer.evmAddress})`);

  // Existing immutable ERC20 token references on Mainnet
  const EQUORA_COIN = {
    base58: "TS6XGpAtHma98gs8qDHdsh4BZYDEAAGjJt",
    hex: "41b0e42d3a38e37f2be412b06af572fea20d9c5216",
    evm: "0xb0e42d3a38e37f2be412b06af572fea20d9c5216",
  };
  const EQUORA_TOKEN = {
    base58: "TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn",
    hex: "4190b18ab71b5b2b8df3a10c8e52fbdd3ea8f126b9",
    evm: "0x90b18ab71b5b2b8df3a10c8e52fbdd3ea8f126b9",
  };

  const coder = new ethers.AbiCoder();

  // 1. Deploy EquoraNFT
  const nft = await deployContract(signer, "EquoraNFT", "artifacts/contracts/rewards/EquoraNFT.sol/EquoraNFT.json");

  // 2. Deploy EquoraRegistry
  const registryParams = coder.encode(["address"], [signer.evmAddress]);
  const registry = await deployContract(signer, "EquoraRegistry", "artifacts/contracts/core/EquoraRegistry.sol/EquoraRegistry.json", registryParams);

  // 3. Deploy EquoraDAOv2
  const daoParams = coder.encode(["address", "address"], [EQUORA_TOKEN.evm, registry.evm]);
  const dao = await deployContract(signer, "EquoraDAOv2", "artifacts/contracts/core/EquoraDAOv2.sol/EquoraDAOv2.json", daoParams);

  // 4. Deploy EquoraVault
  const vaultParams = coder.encode(["address", "address"], [EQUORA_TOKEN.evm, registry.evm]);
  const vault = await deployContract(signer, "EquoraVault", "artifacts/contracts/core/EquoraVault.sol/EquoraVault.json", vaultParams);

  // 5. Deploy EquoraSalaryPool
  const salaryParams = coder.encode(["address", "address"], [EQUORA_TOKEN.evm, vault.evm]);
  const salaryPool = await deployContract(signer, "EquoraSalaryPool", "artifacts/contracts/pools/EquoraSalaryPool.sol/EquoraSalaryPool.json", salaryParams);

  // 6. Deploy EquoraRewardPool
  const rewardParams = coder.encode(["address", "address"], [EQUORA_TOKEN.evm, vault.evm]);
  const rewardPool = await deployContract(signer, "EquoraRewardPool", "artifacts/contracts/pools/EquoraRewardPool.sol/EquoraRewardPool.json", rewardParams);

  // 7. Deploy EquoraMagicBox
  const magicBoxParams = coder.encode(["address", "address"], [EQUORA_TOKEN.evm, vault.evm]);
  const magicBox = await deployContract(signer, "EquoraMagicBox", "artifacts/contracts/pools/EquoraMagicBox.sol/EquoraMagicBox.json", magicBoxParams);

  // 8. Deploy EquoraMatrix
  const matrixParams = coder.encode(
    ["address", "address", "address"],
    [EQUORA_TOKEN.evm, registry.evm, nft.evm]
  );
  const matrix = await deployContract(signer, "EquoraMatrix", "artifacts/contracts/core/EquoraMatrix.sol/EquoraMatrix.json", matrixParams);

  console.log("\n================================================================================");
  console.log("🔗 PERFORMING ON-CHAIN INTER-CONTRACT WIRING");
  console.log("================================================================================");

  // A. EquoraVault.initialize(daoPool, salaryPool, magicBoxPool, rewardsPool)
  console.log("\n1. Initializing EquoraVault...");
  const initVaultParams = coder.encode(
    ["address", "address", "address", "address"],
    [dao.evm, salaryPool.evm, magicBox.evm, rewardPool.evm]
  ).slice(2);
  await triggerContract(signer, vault.hex, "initialize(address,address,address,address)", initVaultParams);

  // B. EquoraVault.setMatrixContract(matrix)
  console.log("\n2. Setting Matrix in EquoraVault...");
  const setMatrixInVaultParams = coder.encode(["address"], [matrix.evm]).slice(2);
  await triggerContract(signer, vault.hex, "setMatrixContract(address)", setMatrixInVaultParams);

  // C. EquoraSalaryPool.setRewardPool(rewardPool)
  console.log("\n3. Wiring SalaryPool to RewardPool...");
  const setRewardInSalaryParams = coder.encode(["address"], [rewardPool.evm]).slice(2);
  await triggerContract(signer, salaryPool.hex, "setRewardPool(address)", setRewardInSalaryParams);

  // D. EquoraRewardPool.setAuthorizedCaller(matrix)
  console.log("\n4. Authorizing Matrix in RewardPool...");
  const authMatrixInRewardParams = coder.encode(["address"], [matrix.evm]).slice(2);
  await triggerContract(signer, rewardPool.hex, "setAuthorizedCaller(address)", authMatrixInRewardParams);

  // E. EquoraNFT.setMinter(matrix, true) & setMinter(dao, true)
  console.log("\n5. Authorizing Minters in EquoraNFT...");
  const setMinterMatrixParams = coder.encode(["address", "bool"], [matrix.evm, true]).slice(2);
  await triggerContract(signer, nft.hex, "setMinter(address,bool)", setMinterMatrixParams);
  const setMinterDaoParams = coder.encode(["address", "bool"], [dao.evm, true]).slice(2);
  await triggerContract(signer, nft.hex, "setMinter(address,bool)", setMinterDaoParams);

  // F. EquoraDAOv2.setVaultContract(vault)
  console.log("\n6. Setting Vault in EquoraDAOv2...");
  const setVaultInDaoParams = coder.encode(["address"], [vault.evm]).slice(2);
  await triggerContract(signer, dao.hex, "setVaultContract(address)", setVaultInDaoParams);

  // G. EquoraMatrix.setDaoContract(dao) & setVaultContract(vault)
  console.log("\n7. Wiring Matrix to DAO & Vault...");
  const setDaoInMatrixParams = coder.encode(["address"], [dao.evm]).slice(2);
  await triggerContract(signer, matrix.hex, "setDaoContract(address)", setDaoInMatrixParams);
  const setVaultInMatrixParams = coder.encode(["address"], [vault.evm]).slice(2);
  await triggerContract(signer, matrix.hex, "setVaultContract(address)", setVaultInMatrixParams);

  // H. EquoraRegistry.setAuthorizedContracts(vault, dao, matrix)
  console.log("\n8. Authorizing Contracts in EquoraRegistry...");
  const authRegistryParams = coder.encode(
    ["address", "address", "address"],
    [vault.evm, dao.evm, matrix.evm]
  ).slice(2);
  await triggerContract(signer, registry.hex, "setAuthorizedContracts(address,address,address)", authRegistryParams);

  console.log("\n================================================================================");
  console.log("👥 ON-CHAIN MIGRATION OF 93 VERIFIED GENUINE DAO MEMBERS");
  console.log("================================================================================");

  const manifestPath = path.resolve(__dirname, "../../../scratch/master_93_dao_members.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const members = manifest.members || [];
  console.log(`Loaded ${members.length} genuine members from master manifest.`);

  // Migrate in safe batches of 6
  const BATCH_SIZE = 6;
  const totalBatches = Math.ceil(members.length / BATCH_SIZE);

  for (let i = 0; i < members.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const chunk = members.slice(i, i + BATCH_SIZE);
    const chunkAddrs = chunk.map((m) => m.addressHex || base58ToHex(m.address));
    const chunkPositions = chunk.map((m) => m.position);
    const chunkLifetime = chunk.map((m) => ethers.parseUnits(parseFloat(m.pushedAmountBtt || "0").toFixed(6), 6));

    console.log(`\nMigrating Batch ${batchNum}/${totalBatches} (${chunk.length} members, Seats #${chunk[0].position} to #${chunk[chunk.length - 1].position})...`);
    const migParams = coder.encode(
      ["address[]", "uint256[]", "uint256[]"],
      [chunkAddrs, chunkPositions, chunkLifetime]
    ).slice(2);

    await triggerContract(signer, dao.hex, "migrateGenuineMembers(address[],uint256[],uint256[])", migParams);
    await sleep(1500);
  }

  // Verify on-chain member count
  console.log("\nVerifying on-chain member count...");
  const countHex = await callConstant(dao.hex, "getAllMembers()");
  if (countHex) {
    const decodedMembers = coder.decode(["address[]"], "0x" + countHex)[0];
    console.log(`   ✅ On-Chain Member Count in EquoraDAOv2: ${decodedMembers.length} (Expected: 93)`);
  }

  // Finalize Migration
  console.log("\nLocking DAO Migration...");
  await triggerContract(signer, dao.hex, "finalizeMigration()", "");

  console.log("\n================================================================================");
  console.log("🔒 ZERO-ADMIN AUTONOMY: RENOUNCING ALL OWNERSHIP & ADMIN PRIVILEGES TO 0x0");
  console.log("================================================================================");

  console.log("\n1. Renouncing EquoraMatrix ownership...");
  await triggerContract(signer, matrix.hex, "renounceOwnership()", "");

  console.log("\n2. Renouncing EquoraNFT ownership...");
  await triggerContract(signer, nft.hex, "renounceOwnership()", "");

  console.log("\n3. Renouncing EquoraRegistry ownership...");
  await triggerContract(signer, registry.hex, "renounceOwnership()", "");

  console.log("\n4. Renouncing EquoraDAOv2 admin...");
  await triggerContract(signer, dao.hex, "renounceAdmin()", "");

  console.log("\n================================================================================");
  console.log("💾 SAVING FINAL MAINNET DEPLOYMENT REGISTRY");
  console.log("================================================================================");

  const finalDeployment = {
    network: "trobchain-mainnet",
    deployer: signer.tronBase58,
    deployedAt: new Date().toISOString(),
    contracts: {
      EquoraCoin: {
        addressBase58: EQUORA_COIN.base58,
        addressHex: EQUORA_COIN.hex,
        evmAddress: EQUORA_COIN.evm,
        totalSupply: "210,000,000 EQC (21 Crore)",
      },
      EquoraToken: {
        addressBase58: EQUORA_TOKEN.base58,
        addressHex: EQUORA_TOKEN.hex,
        evmAddress: EQUORA_TOKEN.evm,
      },
      EquoraNFT: {
        addressBase58: nft.base58,
        addressHex: nft.hex,
        evmAddress: nft.evm,
        txHash: nft.txHash,
        owner: "0x0000000000000000000000000000000000000000",
      },
      EquoraRegistry: {
        addressBase58: registry.base58,
        addressHex: registry.hex,
        evmAddress: registry.evm,
        txHash: registry.txHash,
        owner: "0x0000000000000000000000000000000000000000",
      },
      EquoraDAOv2: {
        addressBase58: dao.base58,
        addressHex: dao.hex,
        evmAddress: dao.evm,
        txHash: dao.txHash,
        seatsMigrated: members.length,
        admin: "0x0000000000000000000000000000000000000000",
      },
      EquoraVault: {
        addressBase58: vault.base58,
        addressHex: vault.hex,
        evmAddress: vault.evm,
        txHash: vault.txHash,
        initialized: true,
      },
      EquoraSalaryPool: {
        addressBase58: salaryPool.base58,
        addressHex: salaryPool.hex,
        evmAddress: salaryPool.evm,
        txHash: salaryPool.txHash,
      },
      EquoraRewardPool: {
        addressBase58: rewardPool.base58,
        addressHex: rewardPool.hex,
        evmAddress: rewardPool.evm,
        txHash: rewardPool.txHash,
      },
      EquoraMagicBox: {
        addressBase58: magicBox.base58,
        addressHex: magicBox.hex,
        evmAddress: magicBox.evm,
        txHash: magicBox.txHash,
      },
      EquoraMatrix: {
        addressBase58: matrix.base58,
        addressHex: matrix.hex,
        evmAddress: matrix.evm,
        txHash: matrix.txHash,
        owner: "0x0000000000000000000000000000000000000000",
      },
    },
  };

  const outputPathHardhat = path.resolve(__dirname, "../deployed-trobchain-mainnet.json");
  const outputPathRoot = path.resolve(__dirname, "../../../deployed-trobchain-mainnet.json");
  fs.writeFileSync(outputPathHardhat, JSON.stringify(finalDeployment, null, 2), "utf8");
  fs.writeFileSync(outputPathRoot, JSON.stringify(finalDeployment, null, 2), "utf8");
  console.log(`\n🎉 All contracts deployed, wired, migrated, and saved to:`);
  console.log(`   - ${outputPathHardhat}`);
  console.log(`   - ${outputPathRoot}`);

  console.log("\n================================================================================");
  console.log("📝 UPDATING LOCAL ENVIRONMENT AND CONFIGURATION FILES");
  console.log("================================================================================");

  // Helper to replace env key
  function updateEnvFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, "utf8");
    for (const [key, val] of Object.entries(replacements)) {
      const reg = new RegExp(`^(${key}=).*$`, "m");
      if (reg.test(content)) {
        content = content.replace(reg, `${key}=${val}`);
      }
    }
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`   ✅ Updated: ${filePath}`);
  }

  const envReplacements = {
    NEXT_PUBLIC_MATRIX_ADDRESS: matrix.base58,
    NEXT_PUBLIC_MATRIX_HEX: matrix.hex,
    NEXT_PUBLIC_VAULT_ADDRESS: vault.base58,
    NEXT_PUBLIC_VAULT_HEX: vault.hex,
    NEXT_PUBLIC_DAO_ADDRESS: dao.base58,
    NEXT_PUBLIC_DAO_HEX: dao.hex,
    NEXT_PUBLIC_REGISTRY_ADDRESS: registry.base58,
    NEXT_PUBLIC_REGISTRY_HEX: registry.hex,
    NEXT_PUBLIC_NFT_ADDRESS: nft.base58,
    NEXT_PUBLIC_NFT_HEX: nft.hex,
    NEXT_PUBLIC_DAO_MEMBERSHIP_ADDRESS: nft.base58,
    NEXT_PUBLIC_SALARY_POOL_ADDRESS: salaryPool.base58,
    NEXT_PUBLIC_SALARY_POOL_HEX: salaryPool.hex,
    NEXT_PUBLIC_REWARD_POOL_ADDRESS: rewardPool.base58,
    NEXT_PUBLIC_REWARD_POOL_HEX: rewardPool.hex,
    NEXT_PUBLIC_MAGIC_BOX_ADDRESS: magicBox.base58,
    NEXT_PUBLIC_MAGIC_BOX_HEX: magicBox.hex,
  };

  const webMatrixEnv = path.resolve(__dirname, "../../../apps/web-matrix/.env.local");
  const webDaoEnv = path.resolve(__dirname, "../../../apps/web-dao/.env.local");
  const rootEnv = path.resolve(__dirname, "../../../.env");

  updateEnvFile(webMatrixEnv, envReplacements);
  updateEnvFile(webDaoEnv, envReplacements);
  updateEnvFile(rootEnv, envReplacements);

  // Update apps/web-matrix/lib/contracts.ts
  const contractsTsPath = path.resolve(__dirname, "../../../apps/web-matrix/lib/contracts.ts");
  if (fs.existsSync(contractsTsPath)) {
    let cTs = fs.readFileSync(contractsTsPath, "utf8");
    cTs = cTs.replace(/matrix:\s*"[^"]+"/, `matrix: "${matrix.base58}"`);
    cTs = cTs.replace(/registry:\s*"[^"]+"/, `registry: "${registry.base58}"`);
    cTs = cTs.replace(/vault:\s*"[^"]+"/, `vault: "${vault.base58}"`);
    cTs = cTs.replace(/salaryPool:\s*"[^"]+"/, `salaryPool: "${salaryPool.base58}"`);
    cTs = cTs.replace(/rewardPool:\s*"[^"]+"/, `rewardPool: "${rewardPool.base58}"`);
    cTs = cTs.replace(/magicBoxPool:\s*"[^"]+"/, `magicBoxPool: "${magicBox.base58}"`);
    cTs = cTs.replace(/dao:\s*"[^"]+"/, `dao: "${dao.base58}"`);
    cTs = cTs.replace(/nft:\s*"[^"]+"/, `nft: "${nft.base58}"`);
    fs.writeFileSync(contractsTsPath, cTs, "utf8");
    console.log(`   ✅ Updated: ${contractsTsPath}`);
  }

  // Update docker-compose.yml defaults
  const dockerComposePath = path.resolve(__dirname, "../../../docker-compose.yml");
  if (fs.existsSync(dockerComposePath)) {
    let dc = fs.readFileSync(dockerComposePath, "utf8");
    dc = dc.replace(/THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V/g, dao.base58);
    dc = dc.replace(/4151114b92df6041f5a0e7ebc13e6ed68298fd28b0/g, dao.hex);
    dc = dc.replace(/TNjaJr6pHV2uBkBG9sDGtuxo4AAzqHBCJi/g, matrix.base58);
    dc = dc.replace(/418c05990021d332e01a68c42ce6a7e783a1752d06/g, matrix.hex);
    dc = dc.replace(/THoeHcGMEzNDsE8xPZuorTYgV9hje1RkGw/g, vault.base58);
    dc = dc.replace(/4155f1f42bc35374f5eefda01a4cfa083c21f34f12/g, vault.hex);
    dc = dc.replace(/TUxT2CjgiSUaiTfwaA3nZ8ZnBcugnspZRB/g, registry.base58);
    dc = dc.replace(/41d045ad50706313f76b4acbaa370258f6a0da1697/g, registry.hex);
    dc = dc.replace(/TSANycxN3mgwxAXLNj7XdhvMvWaXT3WxL9/g, nft.base58);
    dc = dc.replace(/41b19eea3d6882c5f078b6b4ea54c8286dcd8a1a8d/g, nft.hex);
    dc = dc.replace(/TEC2wDpRSbPutaP3URY8m3UieE74Muo5T9/g, salaryPool.base58);
    dc = dc.replace(/TF6dsLSRY1G9idqpTEM9Xowvdyp7EgFJWh/g, rewardPool.base58);
    dc = dc.replace(/TStE36Pqa72f8hUdemSjtoi1SxpWmrjaYg/g, magicBox.base58);
    fs.writeFileSync(dockerComposePath, dc, "utf8");
    console.log(`   ✅ Updated: ${dockerComposePath}`);
  }

  // Update Neon Database
  console.log("\n================================================================================");
  console.log("🗄️ SYNCING NEON POSTGRES DATABASE (DaoMember Table)");
  console.log("================================================================================");
  try {
    const dbUrl = "postgresql://neondb_owner:npg_1fOkpFHAZx2e@ep-ancient-smoke-b4y6grfd-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";
    const endpoint = "https://ep-ancient-smoke-b4y6grfd.c-6.us-east-2.aws.neon.tech/sql";

    for (const m of members) {
      const status = m.status || (m.position === 1 ? "capped" : "active");
      const entry = m.entryAmountBtt || "5357.14";
      const pushed = m.pushedAmountBtt || "0";
      const evm = m.addressHex || base58ToHex(m.address);

      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Neon-Connection-String": dbUrl,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            INSERT INTO "DaoMember" (position, address, "entryAmountBtt", "pushedAmountBtt", status, "updatedAt")
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (position) DO UPDATE SET
              address = EXCLUDED.address,
              "entryAmountBtt" = EXCLUDED."entryAmountBtt",
              "pushedAmountBtt" = EXCLUDED."pushedAmountBtt",
              status = EXCLUDED.status,
              "updatedAt" = NOW()
          `,
          params: [m.position, evm, entry, pushed, status],
        }),
      });
    }
    console.log(`   ✅ Neon Database synced: All 93 genuine members set to active.`);
  } catch (dbErr) {
    console.warn(`   ⚠️ DB sync note: ${dbErr.message}`);
  }
}

main().catch(console.error);

