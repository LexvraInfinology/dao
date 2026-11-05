const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns = require("dns");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../packages/hardhat/.env") });
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
  const tronHex = clean.startsWith("41") ? clean : "41" + clean;
  const buf = Buffer.from(tronHex, "hex");
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
    throw new Error(`broadcast error: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

async function triggerContract(signer, contractBase58, selector, paramHex = "", callValueSun = 0) {
  const contractHex = base58ToHex(contractBase58);
  const payload = {
    owner_address: signer.tronHex,
    contract_address: contractHex,
    function_selector: selector,
    parameter: paramHex,
    fee_limit: 150000000,
    call_value: callValueSun,
    visible: false,
  };

  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const createData = await res.json();
  if (createData.Error) throw new Error(createData.Error);
  if (!createData.result || !createData.result.result) {
    throw new Error(`Trigger failed: ${JSON.stringify(createData.result)}`);
  }

  await broadcastTransaction(signer, createData.transaction);
  return createData.transaction.txID;
}

async function queryConstant(contractBase58, selector, paramHex = "") {
  const contractHex = base58ToHex(contractBase58);
  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: contractHex,
      contract_address: contractHex,
      function_selector: selector,
      parameter: paramHex,
      visible: false,
    }),
  });
  const data = await res.json();
  return data.constant_result ? data.constant_result[0] : null;
}

async function deployContract(name, artifactRelPath, constructorParamsHex, signer) {
  const artPath = path.resolve(__dirname, "..", artifactRelPath);
  const art = JSON.parse(fs.readFileSync(artPath, "utf8"));

  console.log(`\n🚀 Deploying ${name}...`);
  const payload = {
    owner_address: signer.tronHex,
    name: name,
    abi: JSON.stringify(art.abi),
    bytecode: art.bytecode.replace(/^0x/, ""),
    parameter: constructorParamsHex ? constructorParamsHex.replace(/^0x/, "") : "",
    fee_limit: 1000000000,
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 10000000,
    visible: false,
  };

  const createRes = await fetchWithRetry(`${FULLNODE_URL}/wallet/deploycontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const createData = await createRes.json();
  if (createData.Error) throw new Error(createData.Error);

  const txID = createData.txID;
  const contractAddressHex = createData.contract_address;
  const contractAddressBase58 = hexToBase58(contractAddressHex);

  console.log(`   txID: ${txID}`);
  console.log(`   Base58: ${contractAddressBase58}`);
  console.log(`   Hex:    ${contractAddressHex}`);

  await broadcastTransaction(signer, createData);
  console.log(`   Waiting 12s for block confirmation...`);
  await sleep(12000);

  return {
    addressBase58: contractAddressBase58,
    addressHex: contractAddressHex,
    txID,
  };
}

async function main() {
  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!deployerKey) throw new Error("DEPLOYER_PRIVATE_KEY missing in .env");
  const deployer = privateKeyToAddress(deployerKey);
  console.log(`Signer: ${deployer.tronBase58} (${deployer.tronHex})`);

  const vaultBase58 = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "TL6jaVYwfstQeeyHEyweJwUrr5dVn15TB9";
  const matrixBase58 = process.env.NEXT_PUBLIC_MATRIX_ADDRESS || "TSVnyi3gM6QQrH4is8nNFJjJyQbjSrUohK";
  const regBase58 = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "TVV5TzCddJ2EwvpGUEnJzyvYe4QUkDq2m2";

  console.log(`Vault:    ${vaultBase58}`);
  console.log(`Matrix:   ${matrixBase58}`);
  console.log(`Registry: ${regBase58}`);

  const coder = new ethers.AbiCoder();
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const vaultEvm = "0x" + base58ToHex(vaultBase58).slice(2);

  // 1. Deploy upgraded EquoraMagicBox
  const magicConstructorHex = coder.encode(["address", "address"], [zeroAddress, vaultEvm]).slice(2);
  const deployedMagic = await deployContract(
    "EquoraMagicBox",
    "packages/hardhat/artifacts/contracts/pools/EquoraMagicBox.sol/EquoraMagicBox.json",
    magicConstructorHex,
    deployer
  );

  const newMagicBoxB58 = deployedMagic.addressBase58;
  const newMagicBoxHex = deployedMagic.addressHex;
  console.log(`\n✅ EquoraMagicBox successfully deployed to: ${newMagicBoxB58} (${newMagicBoxHex})`);

  // 2. Wire contracts to new MagicBox
  console.log(`\nWiring matrix and registry in EquoraMagicBox...`);
  const matrixEvm = "0x" + base58ToHex(matrixBase58).slice(2);
  const regEvm = "0x" + base58ToHex(regBase58).slice(2);

  await triggerContract(deployer, newMagicBoxB58, "setMatrixContract(address)", coder.encode(["address"], [matrixEvm]).slice(2));
  await triggerContract(deployer, newMagicBoxB58, "setRegistryContract(address)", coder.encode(["address"], [regEvm]).slice(2));
  console.log(`Wiring completed!`);

  // 3. Batch-enroll the 24 active matrix members from Registry
  console.log(`\nFetching 24 members from EquoraRegistry...`);
  const listHex = await queryConstant(regBase58, "getUserList()");
  if (listHex) {
    const userList = coder.decode(["address[]"], "0x" + listHex)[0];
    console.log(`Enrolling ${userList.length} members into EquoraMagicBox...`);
    const batchParam = coder.encode(["address[]"], [userList]).slice(2);
    await triggerContract(deployer, newMagicBoxB58, "batchAddEligibleUsers(address[])", batchParam);
    console.log(`Waiting 6s...`);
    await sleep(6000);

    const eligibleCountHex = await queryConstant(newMagicBoxB58, "getEligibleCount()");
    const eligibleCount = coder.decode(["uint256"], "0x" + eligibleCountHex)[0];
    console.log(`✅ Eligible Users Count in MagicBox: ${eligibleCount.toString()} / ${userList.length}`);
  }

  // 4. Fund MagicBox pool with 500 TROB for testing
  console.log(`\nFunding MagicBox pool with 500 TROB...`);
  const fundSun = 500 * 1000000;
  await triggerContract(deployer, newMagicBoxB58, "addToPool(uint256)", coder.encode(["uint256"], [fundSun]).slice(2), fundSun);
  console.log(`Waiting 6s...`);
  await sleep(6000);

  // 5. Enable bypass mode & trigger quarterly draw
  console.log(`\nEnabling bypass timer mode for testing...`);
  await triggerContract(deployer, newMagicBoxB58, "setBypassTimer(bool)", coder.encode(["bool"], [true]).slice(2));
  await sleep(4000);

  console.log(`Triggering quarterly distribution with bypass...`);
  const drawSeed = ethers.keccak256(ethers.toUtf8Bytes("QUARTER_Q4_LIVE_TEST_BYPASS_" + Date.now()));
  await triggerContract(deployer, newMagicBoxB58, "distributeQuarterlyBypass(uint256)", coder.encode(["uint256"], [drawSeed]).slice(2));
  console.log(`Waiting 8s for block settlement...`);
  await sleep(8000);

  // 6. Check global stats on-chain
  const statsHex = await queryConstant(newMagicBoxB58, "getGlobalStats()");
  if (statsHex) {
    const decoded = coder.decode(["uint256","uint256","uint256","uint256","uint256"], "0x" + statsHex);
    console.log(`\n=== MAGIC BOX ON-CHAIN STATS ===`);
    console.log(`Pool Balance:        ${ethers.formatUnits(decoded[0], 6)} TROB`);
    console.log(`Total Distributed:   ${ethers.formatUnits(decoded[1], 6)} TROB`);
    console.log(`Distribution Rounds: ${decoded[2].toString()}`);
    console.log(`Eligible Users:      ${decoded[3].toString()}`);
    console.log(`Last Distribution:   ${new Date(Number(decoded[4]) * 1000).toISOString()}`);
  }

  // 7. Test sample claimable evaluation for deployer
  console.log(`\nChecking claimable reward for Deployer: ${deployer.tronBase58}`);
  const claimHex = await queryConstant(newMagicBoxB58, "getClaimableReward(address)", coder.encode(["address"], [deployer.evmAddress]).slice(2));
  if (claimHex) {
    const claimDec = coder.decode(["bool","uint8","uint256","uint256","uint256"], "0x" + claimHex);
    console.log(`Can Claim:    ${claimDec[0]}`);
    console.log(`Tier:         ${claimDec[1]}`);
    console.log(`Prize (TROB): ${ethers.formatUnits(claimDec[2], 6)} TROB`);
    console.log(`Prize (USD):  $${(Number(claimDec[3]) / 100).toFixed(2)}`);
    console.log(`Round:        ${claimDec[4].toString()}`);

    if (claimDec[0]) {
      console.log(`\nTesting claimReward() transaction on blockchain...`);
      const claimTx = await triggerContract(deployer, newMagicBoxB58, "claimReward()", "");
      console.log(`✅ Claim Transaction Confirmed! TxID: ${claimTx}`);
    }
  }

  // 8. Update address in .env & config
  console.log(`\nUpdating address across project configurations...`);
  let envContent = fs.readFileSync(".env", "utf8");
  envContent = envContent.replace(
    /NEXT_PUBLIC_MAGIC_BOX_ADDRESS="[^"]*"/,
    `NEXT_PUBLIC_MAGIC_BOX_ADDRESS="${newMagicBoxB58}"`
  );
  envContent = envContent.replace(
    /NEXT_PUBLIC_MAGIC_BOX_HEX="[^"]*"/,
    `NEXT_PUBLIC_MAGIC_BOX_HEX="${newMagicBoxHex}"`
  );
  fs.writeFileSync(".env", envContent, "utf8");

  // Also update apps/web-matrix/lib/contracts.ts DEFAULT_ADDRESSES
  const contractsTsPath = "apps/web-matrix/lib/contracts.ts";
  let contractsTs = fs.readFileSync(contractsTsPath, "utf8");
  contractsTs = contractsTs.replace(
    /magicBoxPool:\s*"[^"]*"/,
    `magicBoxPool: "${newMagicBoxB58}"`
  );
  fs.writeFileSync(contractsTsPath, contractsTs, "utf8");

  console.log(`✅ Contract addresses updated in .env and contracts.ts!`);
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
