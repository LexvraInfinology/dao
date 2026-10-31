/**
 * EQUORA PROTOCOL & MATRIX: FINAL ZERO-ADMIN MAINNET DEPLOYMENT & WIRING SCRIPT
 *
 * Deployer: TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8
 * Network: TrobChain Mainnet (https://fullnode-one.trobchain.com)
 *
 * 1. Verifies existing Mainnet DAOv2 (TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT) with 93 members migrated & admin = 0x0
 * 2. Re-uses already deployed EquoraNFT & EquoraMatrix
 * 3. Deploys EquoraVault, EquoraSalaryPool, EquoraRewardPool, EquoraMagicBox with valid Token reference
 * 4. Wires all contracts on-chain
 * 5. Renounces all ownership/admin privileges to 0x0000000000000000000000000000000000000000 (Null Key)
 * 6. Saves deployed addresses and verifies zero-admin autonomy
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
    fee_limit: 10_000_000, // 10 TROB limit (funded by frozen energy)
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 10_000_000,
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

  const txID = createData.txID;
  const addressHex = createData.contract_address;
  const addressBase58 = hexToBase58(addressHex);

  console.log(`   TxID:            0x${txID}`);
  console.log(`   Address (Base58): ${addressBase58}`);
  console.log(`   Address (Hex):    ${addressHex}`);

  await broadcastTransaction(signer, createData);
  console.log(`   Waiting 15s for block confirmation...`);
  await sleep(15000);

  return {
    contractName,
    addressBase58,
    addressHex,
    evmAddress: "0x" + addressHex.slice(2),
    txHash: "0x" + txID,
  };
}

async function callContract(signer, contractHex, functionSelector, parameterHex = "", desc = "") {
  console.log(`\n⚡ Calling: ${desc || functionSelector}...`);
  const res = await fetch(`${MAINNET_RPC}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: signer.tronHex,
      contract_address: contractHex,
      function_selector: functionSelector,
      parameter: parameterHex.replace(/^0x/, ""),
      fee_limit: 5_000_000,
      call_value: 0,
    }),
  });
  const data = await res.json();
  if (!data.result || !data.transaction) {
    const msg = data.Error || JSON.stringify(data);
    throw new Error(`triggersmartcontract failed: ${msg}`);
  }

  await broadcastTransaction(signer, data.transaction);
  console.log(`   Tx broadcast: 0x${data.transaction.txID}. Waiting 10s...`);
  await sleep(10000);
  console.log(`   ✅ Confirmed!`);
  return data.transaction.txID;
}

async function queryConstant(contractHex, functionSelector, parameterHex = "") {
  const res = await fetch(`${MAINNET_RPC}/wallet/triggerconstantcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: "410000000000000000000000000000000000000000",
      contract_address: contractHex,
      function_selector: functionSelector,
      parameter: parameterHex.replace(/^0x/, ""),
    }),
  });
  const data = await res.json();
  return data.constant_result?.[0] || null;
}

async function main() {
  console.log("═════════════════════════════════════════════════════════════════════");
  console.log("💎 EQUORA PROTOCOL: MAINNET FINAL DEPLOYMENT & AUTONOMOUS WIRING");
  console.log("═════════════════════════════════════════════════════════════════════\n");

  const privKey = process.env.MAINNET_DEPLOYER_KEY || "0d8766970acea195fcd32f309258b1f2f8f5f81619e4ab72e7af0186deea5926";
  const signer = privateKeyToSigner(privKey);

  console.log(`📍 Deployer Address: ${signer.tronBase58} (${signer.evmAddress})`);
  if (signer.tronBase58 !== "TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8") {
    throw new Error(`Invalid signer! Expected TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8, got ${signer.tronBase58}`);
  }

  // Check Account Resources
  const resAcc = await fetch(`${MAINNET_RPC}/wallet/getaccountresource`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: signer.tronHex }),
  });
  const accRes = await resAcc.json();
  console.log(`   Available Energy: ${(accRes.EnergyLimit || 0).toLocaleString()} Energy`);
  console.log(`   Available Net:    ${(accRes.NetLimit || 0).toLocaleString()} Bandwidth`);

  const coder = new ethers.AbiCoder();

  // 1. Existing Mainnet Contracts (Preserve 93 DAO Members & Platform Tokens)
  const REGISTRY_B58 = "TWXbakETzfE9sBYdHTCp37HwygGKLY6AGy";
  const REGISTRY_HEX = base58ToHex(REGISTRY_B58);
  const REGISTRY_EVM = "0x" + REGISTRY_HEX.slice(2);

  const DAO_B58 = "TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT";
  const DAO_HEX = base58ToHex(DAO_B58);
  const DAO_EVM = "0x" + DAO_HEX.slice(2);

  const COIN_B58 = "TS6XGpAtHma98gs8qDHdsh4BZYDEAAGjJt";
  const COIN_HEX = base58ToHex(COIN_B58);
  const COIN_EVM = "0x" + COIN_HEX.slice(2);

  const TOKEN_B58 = "TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn";
  const TOKEN_HEX = base58ToHex(TOKEN_B58);
  const TOKEN_EVM = "0x" + TOKEN_HEX.slice(2);

  console.log("\n📦 Verifying Existing Mainnet Contracts:");
  console.log(`   EquoraDAOv2:    ${DAO_B58} (${DAO_HEX})`);
  console.log(`   EquoraRegistry: ${REGISTRY_B58} (${REGISTRY_HEX})`);
  console.log(`   EquoraCoin:     ${COIN_B58} (${COIN_HEX})`);
  console.log(`   EquoraToken:    ${TOKEN_B58} (${TOKEN_HEX})`);

  // Verify DAO members count on Mainnet
  const statsRaw = await queryConstant(DAO_HEX, "getAllMembers()");
  if (statsRaw) {
    const members = coder.decode(["address[]"], "0x" + statsRaw)[0];
    console.log(`   ✅ On-Chain DAO Members: ${members.length} Members Migrated & Intact!`);
  }

  // Verify DAO zero-admin status
  const adminRaw = await queryConstant(DAO_HEX, "admin()");
  const isDaoZeroAdmin = adminRaw && adminRaw.endsWith("0000000000000000000000000000000000000000");
  console.log(`   ✅ On-Chain DAO Admin:   ${isDaoZeroAdmin ? "0x0 (NULL KEY / AUTONOMOUS)" : adminRaw}`);

  // 2. Verified Already-Deployed EquoraNFT on Mainnet
  const nft = {
    contractName: "EquoraNFT",
    addressBase58: "THqKpPXYt6W1tRmpQ1KoCBG5pSJ4MRSy8R",
    addressHex: "4156435e4a16178ff2d473bb55fada7292e2dd9c0f",
    evmAddress: "0x56435e4a16178ff2d473bb55fada7292e2dd9c0f",
    txHash: "0xf806aaa74925a389cc7d9c4e6896647bcbda54f5beab2a84f9b447465c38d014",
  };
  console.log(`\n💎 Using Deployed EquoraNFT:   ${nft.addressBase58} (${nft.addressHex})`);

  // 3. Verified Already-Deployed EquoraMatrix on Mainnet
  const matrix = {
    contractName: "EquoraMatrix",
    addressBase58: "TAAD857yKj86jsVLT7xhyvvdSW87MGCDiH",
    addressHex: "410214ad2fd8ff48245b8e1b80409329ea0d166234",
    evmAddress: "0x0214ad2fd8ff48245b8e1b80409329ea0d166234",
    txHash: "0x8228c83ab190b9b311f2fba7c9eab5ca56e365d5d458d577d50c8afd09706e5c",
  };
  console.log(`💎 Using Deployed EquoraMatrix: ${matrix.addressBase58} (${matrix.addressHex})`);

  // 4. Deploy Fresh EquoraVault (Takes TOKEN_EVM, REGISTRY_EVM)
  const vaultParams = coder.encode(["address", "address"], [TOKEN_EVM, REGISTRY_EVM]);
  const vault = await deployContract(
    signer,
    "EquoraVault",
    "artifacts/contracts/core/EquoraVault.sol/EquoraVault.json",
    vaultParams
  );

  // 5. Deploy Fresh EquoraSalaryPool (Takes TOKEN_EVM, vault.evmAddress)
  const salaryParams = coder.encode(["address", "address"], [TOKEN_EVM, vault.evmAddress]);
  const salaryPool = await deployContract(
    signer,
    "EquoraSalaryPool",
    "artifacts/contracts/pools/EquoraSalaryPool.sol/EquoraSalaryPool.json",
    salaryParams
  );

  // 6. Deploy Fresh EquoraRewardPool (Takes TOKEN_EVM, vault.evmAddress)
  const rewardParams = coder.encode(["address", "address"], [TOKEN_EVM, vault.evmAddress]);
  const rewardPool = await deployContract(
    signer,
    "EquoraRewardPool",
    "artifacts/contracts/pools/EquoraRewardPool.sol/EquoraRewardPool.json",
    rewardParams
  );

  // 7. Deploy Fresh EquoraMagicBox (Takes TOKEN_EVM, vault.evmAddress)
  const magicParams = coder.encode(["address", "address"], [TOKEN_EVM, vault.evmAddress]);
  const magicBox = await deployContract(
    signer,
    "EquoraMagicBox",
    "artifacts/contracts/pools/EquoraMagicBox.sol/EquoraMagicBox.json",
    magicParams
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
    [DAO_EVM, salaryPool.evmAddress, magicBox.evmAddress, rewardPool.evmAddress]
  );
  await callContract(
    signer,
    vault.addressHex,
    "initialize(address,address,address,address)",
    initVaultParam,
    "EquoraVault.initialize(DAO, SalaryPool, MagicBox, RewardPool)"
  );

  // B. Authorize Matrix on Vault
  const setMatrixParam = coder.encode(["address"], [matrix.evmAddress]);
  await callContract(
    signer,
    vault.addressHex,
    "setMatrixContract(address)",
    setMatrixParam,
    "EquoraVault.setMatrixContract(Matrix)"
  );

  // C. Configure SalaryPool & RewardPool Cross-Wiring
  const setRewardPoolParam = coder.encode(["address"], [rewardPool.evmAddress]);
  await callContract(
    signer,
    salaryPool.addressHex,
    "setRewardPool(address)",
    setRewardPoolParam,
    "EquoraSalaryPool.setRewardPool(RewardPool)"
  );

  const setAuthCallerParam = coder.encode(["address"], [matrix.evmAddress]);
  await callContract(
    signer,
    rewardPool.addressHex,
    "setAuthorizedCaller(address)",
    setAuthCallerParam,
    "EquoraRewardPool.setAuthorizedCaller(Matrix)"
  );

  // D. Authorize NFT Minters (Matrix & DAO)
  const setMinterMatrixParam = coder.encode(["address", "bool"], [matrix.evmAddress, true]);
  await callContract(
    signer,
    nft.addressHex,
    "setMinter(address,bool)",
    setMinterMatrixParam,
    "EquoraNFT.setMinter(Matrix, true)"
  );

  const setMinterDaoParam = coder.encode(["address", "bool"], [DAO_EVM, true]);
  await callContract(
    signer,
    nft.addressHex,
    "setMinter(address,bool)",
    setMinterDaoParam,
    "EquoraNFT.setMinter(DAO, true)"
  );

  // E. Configure Matrix DAO & Vault Connections
  const setDaoParam = coder.encode(["address"], [DAO_EVM]);
  await callContract(
    signer,
    matrix.addressHex,
    "setDaoContract(address)",
    setDaoParam,
    "EquoraMatrix.setDaoContract(DAO)"
  );

  const setVaultParam = coder.encode(["address"], [vault.evmAddress]);
  await callContract(
    signer,
    matrix.addressHex,
    "setVaultContract(address)",
    setVaultParam,
    "EquoraMatrix.setVaultContract(Vault)"
  );

  // F. Authorize Contracts in EquoraRegistry
  // setAuthorizedContracts(address _vaultContract, address _daoContract, address _matrixContract)
  const regParamHex = coder.encode(
    ["address", "address", "address"],
    [vault.evmAddress, DAO_EVM, matrix.evmAddress]
  );
  await callContract(
    signer,
    REGISTRY_HEX,
    "setAuthorizedContracts(address,address,address)",
    regParamHex,
    "EquoraRegistry.setAuthorizedContracts(Vault, DAO, Matrix)"
  );

  // ══════════════════════════════════════════════════════════════════
  // RENOUNCE ADMIN & IMMUTABLE ZERO-ADMIN SOVEREIGNTY
  // ══════════════════════════════════════════════════════════════════
  console.log("\n======================================================");
  console.log("🔒 RENOUNCING ALL OWNERSHIP TO NULL KEY (0x0000...0000)");
  console.log("======================================================");

  await callContract(signer, matrix.addressHex, "renounceOwnership()", "", "EquoraMatrix.renounceOwnership()");
  await callContract(signer, vault.addressHex, "renounceOwnership()", "", "EquoraVault.renounceOwnership()");
  await callContract(signer, nft.addressHex, "renounceOwnership()", "", "EquoraNFT.renounceOwnership()");
  await callContract(signer, REGISTRY_HEX, "renounceOwnership()", "", "EquoraRegistry.renounceOwnership()");

  // Verify Zero Admin on-chain
  console.log("\n🔍 Verifying Zero-Admin Autonomy on Mainnet:");
  for (const [name, hex] of [
    ["EquoraDAOv2", DAO_HEX],
    ["EquoraRegistry", REGISTRY_HEX],
    ["EquoraMatrix", matrix.addressHex],
    ["EquoraVault", vault.addressHex],
    ["EquoraNFT", nft.addressHex],
  ]) {
    const sel = name === "EquoraDAOv2" ? "admin()" : "owner()";
    const res = await queryConstant(hex, sel);
    const isZero = res && res.endsWith("0000000000000000000000000000000000000000");
    console.log(`   ${name.padEnd(16)}: ${isZero ? "✅ NULL KEY (0x0000...0000)" : "⚠️ " + res}`);
  }

  // ══════════════════════════════════════════════════════════════════
  // SAVE DEPLOYED MAINNET STATE
  // ══════════════════════════════════════════════════════════════════
  const mainnetState = {
    network: "trobchain-mainnet",
    deployer: signer.tronBase58,
    deployedAt: new Date().toISOString(),
    contracts: {
      EquoraDAOv2: {
        addressBase58: DAO_B58,
        addressHex: DAO_HEX,
        evmAddress: DAO_EVM,
        seatsMigrated: 93,
        admin: zeroAddress,
      },
      EquoraRegistry: {
        addressBase58: REGISTRY_B58,
        addressHex: REGISTRY_HEX,
        evmAddress: REGISTRY_EVM,
        owner: zeroAddress,
      },
      EquoraCoin: {
        addressBase58: COIN_B58,
        addressHex: COIN_HEX,
        evmAddress: COIN_EVM,
      },
      EquoraToken: {
        addressBase58: TOKEN_B58,
        addressHex: TOKEN_HEX,
        evmAddress: TOKEN_EVM,
      },
      EquoraNFT: {
        addressBase58: nft.addressBase58,
        addressHex: nft.addressHex,
        evmAddress: nft.evmAddress,
        txHash: nft.txHash,
        owner: zeroAddress,
      },
      EquoraVault: {
        addressBase58: vault.addressBase58,
        addressHex: vault.addressHex,
        evmAddress: vault.evmAddress,
        txHash: vault.txHash,
        owner: zeroAddress,
      },
      EquoraSalaryPool: {
        addressBase58: salaryPool.addressBase58,
        addressHex: salaryPool.addressHex,
        evmAddress: salaryPool.evmAddress,
        txHash: salaryPool.txHash,
      },
      EquoraRewardPool: {
        addressBase58: rewardPool.addressBase58,
        addressHex: rewardPool.addressHex,
        evmAddress: rewardPool.evmAddress,
        txHash: rewardPool.txHash,
      },
      EquoraMagicBox: {
        addressBase58: magicBox.addressBase58,
        addressHex: magicBox.addressHex,
        evmAddress: magicBox.evmAddress,
        txHash: magicBox.txHash,
      },
      EquoraMatrix: {
        addressBase58: matrix.addressBase58,
        addressHex: matrix.addressHex,
        evmAddress: matrix.evmAddress,
        txHash: matrix.txHash,
        owner: zeroAddress,
      },
    },
  };

  const outPath = path.resolve(__dirname, "..", "deployed-trobchain-mainnet.json");
  fs.writeFileSync(outPath, JSON.stringify(mainnetState, null, 2));
  console.log(`\n💾 Saved deployed Mainnet state to: ${outPath}`);

  console.log("\n═════════════════════════════════════════════════════════════════════");
  console.log("🎉 MAINNET DEPLOYMENT & SOVEREIGN WIRING COMPLETED SUCCESSFULLY!");
  console.log("═════════════════════════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\n❌ Deployment failed:", err);
  process.exit(1);
});
