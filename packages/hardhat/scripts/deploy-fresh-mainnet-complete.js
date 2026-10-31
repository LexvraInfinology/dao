/**
 * EQUORA PROTOCOL & MATRIX: COMPLETE FRESH MAINNET DEPLOYMENT & MIGRATION SCRIPT
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
  return buf.subarray(0, buf.length - 4).toString("hex");
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

async function deployContract(signer, contractName, artifactSubpath, encodedParams = "") {
  console.log(`\n🚀 Deploying ${contractName}...`);
  const artifactPath = path.resolve(__dirname, "..", artifactSubpath);
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found: ${artifactPath}`);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const payload = {
    owner_address: signer.tronHex,
    fee_limit: 30_000_000,
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 30_000_000,
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
    fee_limit: 30_000_000,
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
  await sleep(3000);
  return txHash;
}

async function main() {
  console.log("================================================================================");
  console.log("🚀 EQUORA PROTOCOL & MATRIX: COMPLETE FRESH MAINNET DEPLOYMENT & MIGRATION");
  console.log("================================================================================");

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || "0d8766970acea195fcd32f309258b1f2f8f5f81619e4ab72e7af0186deea5926";
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
  // constructor(address _root)
  const registryParams = coder.encode(["address"], [signer.evmAddress]);
  const registry = await deployContract(signer, "EquoraRegistry", "artifacts/contracts/core/EquoraRegistry.sol/EquoraRegistry.json", registryParams);

  // 3. Deploy EquoraDAOv2
  // constructor(address _paymentToken, address _registry)
  const daoParams = coder.encode(["address", "address"], [EQUORA_TOKEN.evm, registry.evm]);
  const dao = await deployContract(signer, "EquoraDAOv2", "artifacts/contracts/core/EquoraDAOv2.sol/EquoraDAOv2.json", daoParams);

  // 4. Deploy EquoraVault
  // constructor(address _paymentToken, address _registry)
  const vaultParams = coder.encode(["address", "address"], [EQUORA_TOKEN.evm, registry.evm]);
  const vault = await deployContract(signer, "EquoraVault", "artifacts/contracts/core/EquoraVault.sol/EquoraVault.json", vaultParams);

  // 5. Deploy EquoraSalaryPool
  // constructor(address _paymentToken, address _vault)
  const salaryParams = coder.encode(["address", "address"], [EQUORA_TOKEN.evm, vault.evm]);
  const salaryPool = await deployContract(signer, "EquoraSalaryPool", "artifacts/contracts/pools/EquoraSalaryPool.sol/EquoraSalaryPool.json", salaryParams);

  // 6. Deploy EquoraRewardPool
  // constructor(address _paymentToken, address _vault)
  const rewardParams = coder.encode(["address", "address"], [EQUORA_TOKEN.evm, vault.evm]);
  const rewardPool = await deployContract(signer, "EquoraRewardPool", "artifacts/contracts/pools/EquoraRewardPool.sol/EquoraRewardPool.json", rewardParams);

  // 7. Deploy EquoraMagicBox
  // constructor(address _paymentToken, address _vault)
  const magicBoxParams = coder.encode(["address", "address"], [EQUORA_TOKEN.evm, vault.evm]);
  const magicBox = await deployContract(signer, "EquoraMagicBox", "artifacts/contracts/pools/EquoraMagicBox.sol/EquoraMagicBox.json", magicBoxParams);

  // 8. Deploy EquoraMatrix
  // constructor(address _paymentToken, address _registry, address _nftContract)
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
  console.log("👥 ON-CHAIN MIGRATION OF 93 DAO MEMBERS INTO EQUORADAOV2");
  console.log("================================================================================");

  const manifestPath = path.resolve(__dirname, "../../scratch/migration_manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const genuine = manifest.genuineMembers || [];
  const underfunded = manifest.underfundedReservations || [];

  // Migrate genuine members in batches of 22
  const BATCH_SIZE = 22;
  for (let i = 0; i < genuine.length; i += BATCH_SIZE) {
    const chunk = genuine.slice(i, i + BATCH_SIZE);
    const chunkAddrs = chunk.map((m) => "0x" + base58ToHex(m.address).slice(2));
    const chunkPositions = chunk.map((m) => m.position);
    const chunkLifetime = chunk.map((m) => ethers.parseUnits(parseFloat(m.pushedAmountBtt || "0").toFixed(6), 6));

    console.log(`\nMigrating Genuine Batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} members, Seats ${chunk[0].position} - ${chunk[chunk.length - 1].position})...`);
    const migParams = coder.encode(
      ["address[]", "uint256[]", "uint256[]"],
      [chunkAddrs, chunkPositions, chunkLifetime]
    ).slice(2);
    await triggerContract(signer, dao.hex, "migrateGenuineMembers(address[],uint256[],uint256[])", migParams);
    await sleep(2000);
  }

  // Set Underfunded Reservations
  console.log(`\nSetting Underfunded Reservations (${underfunded.length} members)...`);
  const uAddrs = underfunded.map((u) => "0x" + base58ToHex(u.address).slice(2));
  const uSeats = underfunded.map((u) => u.position);
  const uPrevDeposits = underfunded.map((u) => ethers.parseUnits(parseFloat(u.entryAmountBtt || "1.5").toFixed(6), 6));
  const uDebts = underfunded.map((u) => ethers.parseUnits(parseFloat(u.unearnedDebtBtt || "0").toFixed(6), 6));

  const underfundedParams = coder.encode(
    ["address[]", "uint256[]", "uint256[]", "uint256[]"],
    [uAddrs, uSeats, uPrevDeposits, uDebts]
  ).slice(2);
  await triggerContract(signer, dao.hex, "setUnderfundedReservations(address[],uint256[],uint256[],uint256[])", underfundedParams);

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
        seatsMigrated: genuine.length + underfunded.length,
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

  const outputPath = path.resolve(__dirname, "../deployed-trobchain-mainnet.json");
  fs.writeFileSync(outputPath, JSON.stringify(finalDeployment, null, 2), "utf8");
  console.log(`\n🎉 All contracts deployed, wired, migrated, and saved to: ${outputPath}`);
}

main().catch(console.error);
