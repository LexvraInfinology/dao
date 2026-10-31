/**
 * COMPLETE ON-CHAIN MIGRATION AND ZERO-ADMIN RENOUNCE
 *
 * For the fresh deployed contracts:
 * - EquoraDAOv2: THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V (0x51114b92df6041f5a0e7ebc13e6ed68298fd28b0)
 * - EquoraMatrix: TNjaJr6pHV2uBkBG9sDGtuxo4AAzqHBCJi (0x8c05990021d332e01a68c42ce6a7e783a1752d06)
 * - EquoraRegistry: TUxT2CjgiSUaiTfwaA3nZ8ZnBcugnspZRB (0xd045ad50706313f76b4acbaa370258f6a0da1697)
 * - EquoraNFT: TSANycxN3mgwxAXLNj7XdhvMvWaXT3WxL9 (0xb19eea3d6882c5f078b6b4ea54c8286dcd8a1a8d)
 * - EquoraVault: THoeHcGMEzNDsE8xPZuorTYgV9hje1RkGw (0x55f1f42bc35374f5eefda01a4cfa083c21f34f12)
 * - EquoraSalaryPool: TEC2wDpRSbPutaP3URY8m3UieE74Muo5T9 (0x2e4d82014f04221a30ebabbd40afb0ea00083216)
 * - EquoraRewardPool: TF6dsLSRY1G9idqpTEM9Xowvdyp7EgFJWh (0x38404c670f1d63a059277c71d51781c8e95aa25a)
 * - EquoraMagicBox: TStE36Pqa72f8hUdemSjtoi1SxpWmrjaYg (0xb988ec2cd42c59af8bf358bee611f432e354513d)
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

async function isMemberOnChain(daoHex, userHex) {
  const coder = new ethers.AbiCoder();
  const param = coder.encode(["address"], [userHex]).slice(2);
  const res = await fetch(`${MAINNET_RPC}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: daoHex,
      contract_address: daoHex,
      function_selector: "isDaoMember(address)",
      parameter: param,
      visible: false,
    }),
  });
  const d = await res.json();
  if (d.constant_result?.length > 0) {
    return Boolean(coder.decode(["bool"], "0x" + d.constant_result[0])[0]);
  }
  return false;
}

async function main() {
  console.log("================================================================================");
  console.log("👥 ON-CHAIN MIGRATION OF REMAINING DAO MEMBERS & ZERO-ADMIN RENOUNCE");
  console.log("================================================================================");

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || "0d8766970acea195fcd32f309258b1f2f8f5f81619e4ab72e7af0186deea5926";
  const signer = privateKeyToSigner(privateKey);
  console.log(`Deployer: ${signer.tronBase58} (${signer.evmAddress})`);

  const DEPLOYED = {
    nft: {
      base58: "TSANycxN3mgwxAXLNj7XdhvMvWaXT3WxL9",
      hex: "41b19eea3d6882c5f078b6b4ea54c8286dcd8a1a8d",
      evm: "0xb19eea3d6882c5f078b6b4ea54c8286dcd8a1a8d",
      txHash: "a041cda62a9bbe342706a5a0b4ada7017a1efe0475c82c8df17866a47e074321",
    },
    registry: {
      base58: "TUxT2CjgiSUaiTfwaA3nZ8ZnBcugnspZRB",
      hex: "41d045ad50706313f76b4acbaa370258f6a0da1697",
      evm: "0xd045ad50706313f76b4acbaa370258f6a0da1697",
      txHash: "e38cec9b3008fec09079d2e672f25fb65d632b385340527e2cfca563a3906614",
    },
    dao: {
      base58: "THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V",
      hex: "4151114b92df6041f5a0e7ebc13e6ed68298fd28b0",
      evm: "0x51114b92df6041f5a0e7ebc13e6ed68298fd28b0",
      txHash: "a63769660b7e5c5309e2024601e9749b6235dbc8766e20b1a45e77735bfb81df",
    },
    vault: {
      base58: "THoeHcGMEzNDsE8xPZuorTYgV9hje1RkGw",
      hex: "4155f1f42bc35374f5eefda01a4cfa083c21f34f12",
      evm: "0x55f1f42bc35374f5eefda01a4cfa083c21f34f12",
      txHash: "d4c66bf2c59d27ef94fcafdd73d3054cd9fedf91530728bd0cd1199b90a4d512",
    },
    salaryPool: {
      base58: "TEC2wDpRSbPutaP3URY8m3UieE74Muo5T9",
      hex: "412e4d82014f04221a30ebabbd40afb0ea00083216",
      evm: "0x2e4d82014f04221a30ebabbd40afb0ea00083216",
      txHash: "ec26b44e5917d3d401703cbc4858710ff29a22858333e72ae0f61cdf5b699c85",
    },
    rewardPool: {
      base58: "TF6dsLSRY1G9idqpTEM9Xowvdyp7EgFJWh",
      hex: "4138404c670f1d63a059277c71d51781c8e95aa25a",
      evm: "0x38404c670f1d63a059277c71d51781c8e95aa25a",
      txHash: "7378ca4d7bc396dc7d6213b3cb8aee3711e42183b438137a30507d4332bf9ddb",
    },
    magicBox: {
      base58: "TStE36Pqa72f8hUdemSjtoi1SxpWmrjaYg",
      hex: "41b988ec2cd42c59af8bf358bee611f432e354513d",
      evm: "0xb988ec2cd42c59af8bf358bee611f432e354513d",
      txHash: "ad27ff5f424500cd47a3bb0f52dd6182ede87b94346cafe87eed81da64092589",
    },
    matrix: {
      base58: "TNjaJr6pHV2uBkBG9sDGtuxo4AAzqHBCJi",
      hex: "418c05990021d332e01a68c42ce6a7e783a1752d06",
      evm: "0x8c05990021d332e01a68c42ce6a7e783a1752d06",
      txHash: "a78f8b18d30005b8d3b5c7da85ad69c3d908c5b8ed589a2ea1b8704a7b46ea39",
    },
    coin: {
      base58: "TS6XGpAtHma98gs8qDHdsh4BZYDEAAGjJt",
      hex: "41b0e42d3a38e37f2be412b06af572fea20d9c5216",
      evm: "0xb0e42d3a38e37f2be412b06af572fea20d9c5216",
    },
    token: {
      base58: "TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn",
      hex: "4190b18ab71b5b2b8df3a10c8e52fbdd3ea8f126b9",
      evm: "0x90b18ab71b5b2b8df3a10c8e52fbdd3ea8f126b9",
    },
  };

  const coder = new ethers.AbiCoder();
  const manifestPath = path.resolve(__dirname, "../../../scratch/migration_manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const genuine = manifest.genuineMembers || [];
  const underfunded = manifest.underfundedReservations || [];

  // Filter out genuine members already on-chain
  console.log("Checking which members are already on-chain in EquoraDAOv2...");
  const pendingGenuine = [];
  for (const m of genuine) {
    const userHex = "0x" + base58ToHex(m.address).slice(2);
    const onChain = await isMemberOnChain(DEPLOYED.dao.hex, userHex);
    if (!onChain) {
      pendingGenuine.push(m);
    }
  }
  console.log(`Pending genuine members to migrate: ${pendingGenuine.length} / ${genuine.length}`);

  // Migrate pending genuine members in small batches of 6 (light on energy)
  const BATCH_SIZE = 6;
  for (let i = 0; i < pendingGenuine.length; i += BATCH_SIZE) {
    const chunk = pendingGenuine.slice(i, i + BATCH_SIZE);
    const chunkAddrs = chunk.map((m) => "0x" + base58ToHex(m.address).slice(2));
    const chunkPositions = chunk.map((m) => m.position);
    const chunkLifetime = chunk.map((m) => ethers.parseUnits(parseFloat(m.pushedAmountBtt || "0").toFixed(6), 6));

    console.log(`\nMigrating Genuine Batch (${chunk.length} members, Seats ${chunk[0].position} - ${chunk[chunk.length - 1].position})...`);
    const migParams = coder.encode(
      ["address[]", "uint256[]", "uint256[]"],
      [chunkAddrs, chunkPositions, chunkLifetime]
    ).slice(2);
    await triggerContract(signer, DEPLOYED.dao.hex, "migrateGenuineMembers(address[],uint256[],uint256[])", migParams);
    await sleep(2500);
  }

  // Set Underfunded Reservations (8 members)
  console.log(`\nSetting Underfunded Reservations (${underfunded.length} members)...`);
  const uAddrs = underfunded.map((u) => "0x" + base58ToHex(u.address).slice(2));
  const uSeats = underfunded.map((u) => u.position);
  const uPrevDeposits = underfunded.map((u) => ethers.parseUnits(parseFloat(u.entryAmountBtt || "1.5").toFixed(6), 6));
  const uDebts = underfunded.map((u) => ethers.parseUnits(parseFloat(u.unearnedDebtBtt || "0").toFixed(6), 6));

  const underfundedParams = coder.encode(
    ["address[]", "uint256[]", "uint256[]", "uint256[]"],
    [uAddrs, uSeats, uPrevDeposits, uDebts]
  ).slice(2);
  await triggerContract(signer, DEPLOYED.dao.hex, "setUnderfundedReservations(address[],uint256[],uint256[],uint256[])", underfundedParams);

  // Finalize Migration
  console.log("\nLocking DAO Migration...");
  await triggerContract(signer, DEPLOYED.dao.hex, "finalizeMigration()", "");

  console.log("\n================================================================================");
  console.log("🔒 ZERO-ADMIN AUTONOMY: RENOUNCING ALL OWNERSHIP & ADMIN PRIVILEGES TO 0x0");
  console.log("================================================================================");

  console.log("\n1. Renouncing EquoraMatrix ownership...");
  await triggerContract(signer, DEPLOYED.matrix.hex, "renounceOwnership()", "");

  console.log("\n2. Renouncing EquoraNFT ownership...");
  await triggerContract(signer, DEPLOYED.nft.hex, "renounceOwnership()", "");

  console.log("\n3. Renouncing EquoraRegistry ownership...");
  await triggerContract(signer, DEPLOYED.registry.hex, "renounceOwnership()", "");

  console.log("\n4. Renouncing EquoraDAOv2 admin...");
  await triggerContract(signer, DEPLOYED.dao.hex, "renounceAdmin()", "");

  console.log("\n================================================================================");
  console.log("🎉 ALL MIGRATIONS COMPLETE & CONTRACTS LOCKED TO NULL ADDRESS (0x0)!");
  console.log("================================================================================");
}

main().catch(console.error);
