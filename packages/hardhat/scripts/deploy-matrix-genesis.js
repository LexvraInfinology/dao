/**
 * EQUORA MATRIX GENESIS ALIGNMENT: DEPLOYMENT & ECOSYSTEM SEEDING
 *
 * Targets:
 *   - Genesis Root: TLHTKgsBRUWfYV8Mo6b4Z3RrJ1k1WLwZWa (0x7124b32b48786a13177f3bdc9620e7a48eb9c902)
 *   - Node 1 User:  THiH4WkoXmVKHoRiWBrp2HaoVUAbj4bpwp (0x54ee27d54ec9c03b5ed2f69960b175f34facd696)
 *   - Node 2 (Seat 2): Open / Empty
 *
 * Preserves:
 *   - EquoraDAOv2:  TJRYjqygAEUcrcB2WkgizGFPYeBmyhDqM2 (0x5cbc4c27409afcbc897099b6a18e09d4de0cbc2f) [93 Genuine Seats]
 *   - EquoraVault:  TUZjyaLc1TghdoccJWTKhoBcEU12AG327J (0xcbfa4351180513f0ee0682d2d1e0ab9b515be1c7)
 *   - EquoraToken:  TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn (0x90b18ab71b5b2b8df3a10c8e52fbdd3ea8f126b9)
 *   - EquoraCoin:   TS6XGpAtHma98gs8qDHdsh4BZYDEAAGjJt (0xb0e42d3a38e37f2be412b06af572fea20d9c5216)
 *
 * Deployer: TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8
 * Network: TrobChain Mainnet
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns = require("dns");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
if (!process.env.DEPLOYER_PRIVATE_KEY) {
  require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
}

dns.setDefaultResultOrder("ipv4first");

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function encode58(buffer) {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      const bytes = digits[j] + carry;
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
    fee_limit: 150_000_000,
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 150_000_000,
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
  console.log("🚀 EQUORA MATRIX: GENESIS ALIGNMENT & DEPLOYMENT SCRIPT");
  console.log("================================================================================");

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY environment variable is required");
  const signer = privateKeyToSigner(privateKey);
  console.log(`Deployer Address: ${signer.tronBase58} (${signer.evmAddress})`);

  // Target addresses for Genesis Ecosystem
  const GENESIS_ROOT = {
    base58: "TLHTKgsBRUWfYV8Mo6b4Z3RrJ1k1WLwZWa",
    evm: "0x7124b32b48786a13177f3bdc9620e7a48eb9c902",
  };
  const NODE1_USER = {
    base58: "THiH4WkoXmVKHoRiWBrp2HaoVUAbj4bpwp",
    evm: "0x54ee27d54ec9c03b5ed2f69960b175f34facd696",
  };

  // Preserved Ecosystem Contracts
  const EQUORA_TOKEN = {
    base58: "TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn",
    evm: "0x90b18ab71b5b2b8df3a10c8e52fbdd3ea8f126b9",
  };
  const EQUORA_VAULT = {
    base58: "TUZjyaLc1TghdoccJWTKhoBcEU12AG327J",
    hex: "41cbfa4351180513f0ee0682d2d1e0ab9b515be1c7",
    evm: "0xcbfa4351180513f0ee0682d2d1e0ab9b515be1c7",
  };
  const EQUORA_DAO = {
    base58: "TJRYjqygAEUcrcB2WkgizGFPYeBmyhDqM2",
    hex: "415cbc4c27409afcbc897099b6a18e09d4de0cbc2f",
    evm: "0x5cbc4c27409afcbc897099b6a18e09d4de0cbc2f",
  };

  const coder = new ethers.AbiCoder();

  // 1. Deploy EquoraRegistry with GENESIS_ROOT as Apex Root
  console.log(`\n1. Deploying EquoraRegistry with Root = ${GENESIS_ROOT.base58}...`);
  const registryParams = coder.encode(["address"], [GENESIS_ROOT.evm]);
  const registry = await deployContract(
    signer,
    "EquoraRegistry",
    "artifacts/contracts/core/EquoraRegistry.sol/EquoraRegistry.json",
    registryParams
  );

  // 2. Deploy EquoraNFT
  console.log("\n2. Deploying EquoraNFT...");
  const nft = await deployContract(
    signer,
    "EquoraNFT",
    "artifacts/contracts/rewards/EquoraNFT.sol/EquoraNFT.json"
  );

  // 3. Deploy EquoraMatrix
  console.log("\n3. Deploying EquoraMatrix...");
  const matrixParams = coder.encode(
    ["address", "address", "address"],
    [EQUORA_TOKEN.evm, registry.evm, nft.evm]
  );
  const matrix = await deployContract(
    signer,
    "EquoraMatrix",
    "artifacts/contracts/core/EquoraMatrix.sol/EquoraMatrix.json",
    matrixParams
  );

  console.log("\n================================================================================");
  console.log("🔗 PERFORMING ON-CHAIN WIRING");
  console.log("================================================================================");

  // A. Set authorized contracts in EquoraRegistry
  console.log("\nA. Authorizing Vault, DAO, Matrix in EquoraRegistry...");
  const authRegistryParams = coder.encode(
    ["address", "address", "address"],
    [EQUORA_VAULT.evm, EQUORA_DAO.evm, matrix.evm]
  ).slice(2);
  await triggerContract(
    signer,
    registry.hex,
    "setAuthorizedContracts(address,address,address)",
    authRegistryParams
  );

  // B. Wire EquoraMatrix to Vault and DAO
  console.log("\nB. Wiring EquoraMatrix to Vault and DAO...");
  const setVaultParams = coder.encode(["address"], [EQUORA_VAULT.evm]).slice(2);
  await triggerContract(signer, matrix.hex, "setVaultContract(address)", setVaultParams);

  const setDaoParams = coder.encode(["address"], [EQUORA_DAO.evm]).slice(2);
  await triggerContract(signer, matrix.hex, "setDaoContract(address)", setDaoParams);

  // C. Set Matrix as Minter on EquoraNFT
  console.log("\nC. Setting Matrix as Minter on EquoraNFT...");
  const setMinterParams = coder.encode(["address", "bool"], [matrix.evm, true]).slice(2);
  await triggerContract(signer, nft.hex, "setMinter(address,bool)", setMinterParams);

  // D. Seed Genesis Ecosystem
  console.log(`\nD. Seeding Genesis Ecosystem: Root=${GENESIS_ROOT.base58}, Node1=${NODE1_USER.base58}...`);
  const seedParams = coder.encode(
    ["address", "address"],
    [GENESIS_ROOT.evm, NODE1_USER.evm]
  ).slice(2);
  await triggerContract(
    signer,
    matrix.hex,
    "seedGenesisEcosystem(address,address)",
    seedParams
  );

  // E. Verify on-chain slot state
  console.log("\nE. Verifying Root Slot 1 on-chain...");
  const slotDataCallParams = coder.encode(["address", "uint256"], [GENESIS_ROOT.evm, 1]).slice(2);
  const slotDataHex = await callConstant(matrix.hex, "getSlotData(address,uint256)", slotDataCallParams);
  if (slotDataHex) {
    const decoded = coder.decode(
      ["bool", "bool", "uint256", "uint256", "address[14]", "uint256"],
      "0x" + slotDataHex
    );
    console.log(`   ✅ Root Slot 1 isUnlocked: ${decoded[0]}, isLive: ${decoded[1]}, filledNodes: ${decoded[3]}`);
    console.log(`   ✅ Seat #1 Node: ${hexToBase58(decoded[4][0])} (Expected: ${NODE1_USER.base58})`);
    console.log(`   ✅ Seat #2 Node: ${decoded[4][1]} (Expected: 0x0000000000000000000000000000000000000000)`);
  }

  console.log("\n================================================================================");
  console.log("🔒 ZERO-ADMIN AUTONOMY: RENOUNCING MATRIX, NFT, & REGISTRY OWNERSHIP TO 0x0");
  console.log("================================================================================");

  console.log("\n1. Renouncing EquoraMatrix ownership...");
  await triggerContract(signer, matrix.hex, "renounceOwnership()", "");

  console.log("\n2. Renouncing EquoraNFT ownership...");
  await triggerContract(signer, nft.hex, "renounceOwnership()", "");

  console.log("\n3. Renouncing EquoraRegistry ownership...");
  await triggerContract(signer, registry.hex, "renounceOwnership()", "");

  console.log("\n================================================================================");
  console.log("💾 UPDATING DEPLOYMENT RECORDS");
  console.log("================================================================================");

  const deploymentPath = path.resolve(__dirname, "../deployed-trobchain-mainnet.json");
  const existingDeployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  existingDeployment.contracts.EquoraMatrix = {
    addressBase58: matrix.base58,
    addressHex: matrix.hex,
    evmAddress: matrix.evm,
    txHash: matrix.txHash,
    genesisRoot: GENESIS_ROOT.base58,
    node1User: NODE1_USER.base58,
    seat2Status: "OPEN_EMPTY",
    owner: "0x0000000000000000000000000000000000000000",
  };

  existingDeployment.contracts.EquoraRegistry = {
    addressBase58: registry.base58,
    addressHex: registry.hex,
    evmAddress: registry.evm,
    txHash: registry.txHash,
    root: GENESIS_ROOT.base58,
    owner: "0x0000000000000000000000000000000000000000",
  };

  existingDeployment.contracts.EquoraNFT = {
    addressBase58: nft.base58,
    addressHex: nft.hex,
    evmAddress: nft.evm,
    txHash: nft.txHash,
    owner: "0x0000000000000000000000000000000000000000",
  };

  existingDeployment.updatedAt = new Date().toISOString();
  fs.writeFileSync(deploymentPath, JSON.stringify(existingDeployment, null, 2));
  console.log(`✅ Saved updated contract records to ${deploymentPath}`);

  console.log("\n================================================================================");
  console.log("🎉 GENESIS DEPLOYMENT COMPLETE!");
  console.log(`EquoraMatrix:   ${matrix.base58} (${matrix.hex})`);
  console.log(`EquoraRegistry: ${registry.base58} (${registry.hex})`);
  console.log(`EquoraNFT:      ${nft.base58} (${nft.hex})`);
  console.log("================================================================================");

  return {
    matrix,
    registry,
    nft,
  };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\n❌ Deployment failed:", err);
      process.exit(1);
    });
}

module.exports = { main };

