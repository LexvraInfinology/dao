const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ethers } = require("ethers");
require("dotenv").config();

// ─── Base58Check Helpers ───────────────────────────────────────────────────────
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
  return { evmAddress, tronHex, tronBase58 };
}

// ─── Trobchain Fullnode RPC ───────────────────────────────────────────────────
const FULLNODE_URL = "https://fullnode-one-testnet.trobchain.com";

async function deployContractToTrob(name, artifactRelativePath, constructorParamsHex, deployerPrivKey) {
  const artifactPath = path.resolve(__dirname, "..", artifactRelativePath);
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found at ${artifactPath}`);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const { evmAddress, tronHex, tronBase58 } = privateKeyToAddress(deployerPrivKey);

  console.log(`\n======================================================`);
  console.log(`🚀 Preparing Deployment for: ${name}`);
  console.log(`   Deployer: ${tronBase58} (${tronHex})`);

  const payload = {
    owner_address: tronHex,
    fee_limit: 1000000000, // 1000 TROB
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 10000000,
    abi: JSON.stringify(artifact.abi),
    bytecode: artifact.bytecode.replace(/^0x/, ""),
    parameter: constructorParamsHex.replace(/^0x/, ""),
    name: name,
  };

  const createRes = await fetch(`${FULLNODE_URL}/wallet/deploycontract`, {
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

  console.log(`   Unsigned txID: ${txID}`);
  console.log(`   Generated Contract Address (Hex): ${contractAddressHex}`);
  console.log(`   Generated Contract Address (Base58): ${contractAddressBase58}`);

  // Sign transaction with ECDSA
  const signingKey = new ethers.SigningKey(
    deployerPrivKey.startsWith("0x") ? deployerPrivKey : "0x" + deployerPrivKey
  );
  const sig = signingKey.sign("0x" + txID);
  const vHex = sig.v.toString(16).padStart(2, "0");
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const broadcastPayload = {
    txID: txID,
    raw_data: createData.raw_data,
    raw_data_hex: createData.raw_data_hex,
    signature: [signatureHex],
  };

  console.log(`   Broadcasting signed transaction to Trobchain...`);
  const broadcastRes = await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(broadcastPayload),
  });

  const broadcastData = await broadcastRes.json();
  console.log(`   Broadcast Result:`, broadcastData);

  if (!broadcastData.result) {
    const errMsg = broadcastData.message ? Buffer.from(broadcastData.message, 'hex').toString('utf8') : JSON.stringify(broadcastData);
    throw new Error(`Broadcast failed: ${errMsg}`);
  }

  console.log(`✅ SUCCESS! ${name} is DEPLOYED on Trobchain!`);
  console.log(`   Contract Base58: ${contractAddressBase58}`);
  console.log(`   Tx Hash: 0x${txID}`);
  console.log(`   Verify on Explorer: https://testnet.trobchain.com/contracts/verify?address=${contractAddressBase58}`);
  console.log(`======================================================\n`);

  return {
    name,
    addressBase58: contractAddressBase58,
    addressHex: contractAddressHex,
    txHash: "0x" + txID,
  };
}

async function main() {
  const privKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privKey || privKey.includes("ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")) {
    console.error("\n❌ ERROR: Please set your real TrobSafe DEPLOYER_PRIVATE_KEY in packages/hardhat/.env");
    console.error("   1. Open TrobSafe Wallet Extension");
    console.error("   2. Go to Settings / Account Details -> Export Private Key");
    console.error("   3. Add to packages/hardhat/.env: DEPLOYER_PRIVATE_KEY=your_private_key_here\n");
    process.exit(1);
  }

  const { tronBase58, evmAddress } = privateKeyToAddress(privKey);
  console.log(`Starting deployment with account: ${tronBase58}`);

  const coder = new ethers.AbiCoder();

  // 1. Deploy EquoraToken
  const treasuryParam = coder.encode(["address"], [evmAddress]);
  const token = await deployContractToTrob(
    "EquoraToken",
    "artifacts/contracts/token/EquoraToken.sol/EquoraToken.json",
    treasuryParam,
    privKey
  );

  // 2. Deploy EquoraRegistry
  const rootParam = coder.encode(["address"], [evmAddress]);
  const registry = await deployContractToTrob(
    "EquoraRegistry",
    "artifacts/contracts/core/EquoraRegistry.sol/EquoraRegistry.json",
    rootParam,
    privKey
  );

  // 3. Deploy EquoraDAO
  const daoParams = coder.encode(
    ["address", "address"],
    ["0x" + token.addressHex.slice(2), "0x" + registry.addressHex.slice(2)]
  );
  const dao = await deployContractToTrob(
    "EquoraDAO",
    "artifacts/contracts/core/EquoraDAO.sol/EquoraDAO.json",
    daoParams,
    privKey
  );

  // 4. Deploy EquoraVault
  const vaultParams = coder.encode(
    ["address", "address"],
    ["0x" + token.addressHex.slice(2), "0x" + registry.addressHex.slice(2)]
  );
  const vault = await deployContractToTrob(
    "EquoraVault",
    "artifacts/contracts/core/EquoraVault.sol/EquoraVault.json",
    vaultParams,
    privKey
  );

  const deploymentSummary = {
    network: "trobchain-testnet",
    deployer: tronBase58,
    deployedAt: new Date().toISOString(),
    contracts: {
      EquoraToken: token,
      EquoraRegistry: registry,
      EquoraDAO: dao,
      EquoraVault: vault,
    },
  };

  fs.writeFileSync(
    path.resolve(__dirname, "..", "deployed-trobchain.json"),
    JSON.stringify(deploymentSummary, null, 2)
  );
  console.log("\n🎉 ALL 4 CONTRACTS DEPLOYED SUCCESSFULLY!");
  console.log("Summary saved to packages/hardhat/deployed-trobchain.json\n");
}

module.exports = {
  hexToBase58,
  base58ToHex,
  privateKeyToAddress,
  deployContractToTrob,
};

if (require.main === module) {
  main().catch((err) => {
    console.error("Deployment failed:", err);
    process.exit(1);
  });
}
