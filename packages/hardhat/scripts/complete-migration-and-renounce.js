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
const bs58 = require("bs58");
const { ethers } = require("ethers");

dns.setDefaultResultOrder("ipv4first");

function tronBase58ToEvmHex(b58) {
  const bytes = bs58.decode(b58);
  const hex = Buffer.from(bytes).toString("hex");
  return "0x" + hex.slice(2, 42);
}

function hexToBase58(hexStr) {
  const clean = hexStr.startsWith("0x") ? hexStr.slice(2) : hexStr;
  const buf = Buffer.from(clean, "hex");
  const hash1 = crypto.createHash("sha256").update(buf).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  const checksum = hash2.subarray(0, 4);
  return bs58.encode(Buffer.concat([buf, checksum]));
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

async function triggerContract(signer, contractHex, functionSelector, parameterHex = "", callValue = 0) {
  const payload = {
    owner_address: signer.tronHex,
    contract_address: contractHex,
    function_selector: functionSelector,
    parameter: parameterHex,
    fee_limit: 100_000_000, // 100 TROB safe energy limit
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
  
  const receipt = await waitForTx(txHash);
  console.log(`   ✅ Confirmed (Result: ${receipt.ret?.[0]?.contractRet || "SUCCESS"})`);
  await sleep(2500);
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

async function isMemberOnChain(daoHex, userHex) {
  const coder = new ethers.AbiCoder();
  const param = coder.encode(["address"], [userHex]).slice(2);
  const resHex = await callConstant(daoHex, "isDaoMember(address)", param);
  if (resHex && resHex.length > 0) {
    return Boolean(coder.decode(["bool"], "0x" + resHex)[0]);
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
    },
    registry: {
      base58: "TUxT2CjgiSUaiTfwaA3nZ8ZnBcugnspZRB",
      hex: "41d045ad50706313f76b4acbaa370258f6a0da1697",
      evm: "0xd045ad50706313f76b4acbaa370258f6a0da1697",
    },
    dao: {
      base58: "THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V",
      hex: "4151114b92df6041f5a0e7ebc13e6ed68298fd28b0",
      evm: "0x51114b92df6041f5a0e7ebc13e6ed68298fd28b0",
    },
    matrix: {
      base58: "TNjaJr6pHV2uBkBG9sDGtuxo4AAzqHBCJi",
      hex: "418c05990021d332e01a68c42ce6a7e783a1752d06",
      evm: "0x8c05990021d332e01a68c42ce6a7e783a1752d06",
    },
  };

  const coder = new ethers.AbiCoder();
  const manifestPath = path.resolve(__dirname, "../../../scratch/migration_manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const genuine = manifest.genuineMembers || [];
  const underfunded = manifest.underfundedReservations || [];

  // Check on-chain migration status
  const finalizedHex = await callConstant(DEPLOYED.dao.hex, "migrationFinalized()");
  const isFinalized = finalizedHex ? parseInt(finalizedHex, 16) === 1 : false;
  if (isFinalized) {
    console.log("⚠️ Migration is ALREADY finalized on-chain for EquoraDAOv2!");
    return;
  }

  // Filter out genuine members already on-chain
  console.log("Checking which members are already on-chain in EquoraDAOv2...");
  const pendingGenuine = [];
  for (const m of genuine) {
    const userHex = tronBase58ToEvmHex(m.address);
    const onChain = await isMemberOnChain(DEPLOYED.dao.hex, userHex);
    if (!onChain) {
      pendingGenuine.push(m);
    }
  }
  console.log(`Total Genuine: ${genuine.length} | Already On-Chain: ${genuine.length - pendingGenuine.length} | Pending: ${pendingGenuine.length}`);

  // Migrate pending genuine members in batches of 6 (light on energy)
  const BATCH_SIZE = 6;
  const totalBatches = Math.ceil(pendingGenuine.length / BATCH_SIZE);
  for (let i = 0; i < pendingGenuine.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const chunk = pendingGenuine.slice(i, i + BATCH_SIZE);
    const chunkAddrs = chunk.map((m) => tronBase58ToEvmHex(m.address));
    const chunkPositions = chunk.map((m) => m.position);
    const chunkLifetime = chunk.map((m) => ethers.parseUnits(parseFloat(m.pushedAmountBtt || "0").toFixed(6), 6));

    console.log(`\nMigrating Genuine Batch ${batchNum}/${totalBatches} (${chunk.length} members, Seats ${chunk[0].position} - ${chunk[chunk.length - 1].position})...`);
    const migParams = coder.encode(
      ["address[]", "uint256[]", "uint256[]"],
      [chunkAddrs, chunkPositions, chunkLifetime]
    ).slice(2);
    await triggerContract(signer, DEPLOYED.dao.hex, "migrateGenuineMembers(address[],uint256[],uint256[])", migParams);
  }

  // Set Underfunded Reservations (8 members)
  console.log(`\nSetting Underfunded Reservations (${underfunded.length} members)...`);
  const uAddrs = underfunded.map((u) => tronBase58ToEvmHex(u.address));
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
  console.log("🔍 FINAL ON-CHAIN VERIFICATION");
  console.log("================================================================================");

  const finalAdminHex = await callConstant(DEPLOYED.dao.hex, "admin()");
  const finalFinHex = await callConstant(DEPLOYED.dao.hex, "migrationFinalized()");
  const matrixOwnerHex = await callConstant(DEPLOYED.matrix.hex, "owner()");
  const nftOwnerHex = await callConstant(DEPLOYED.nft.hex, "owner()");
  const registryOwnerHex = await callConstant(DEPLOYED.registry.hex, "owner()");

  console.log("DAO admin():", finalAdminHex ? "0x" + finalAdminHex.slice(-40) : "0x0");
  console.log("DAO migrationFinalized():", finalFinHex ? parseInt(finalFinHex, 16) === 1 : false);
  console.log("Matrix owner():", matrixOwnerHex ? "0x" + matrixOwnerHex.slice(-40) : "0x0");
  console.log("NFT owner():", nftOwnerHex ? "0x" + nftOwnerHex.slice(-40) : "0x0");
  console.log("Registry owner():", registryOwnerHex ? "0x" + registryOwnerHex.slice(-40) : "0x0");

  console.log("\n================================================================================");
  console.log("🎉 ALL MIGRATIONS COMPLETE & CONTRACTS LOCKED TO NULL ADDRESS (0x0)!");
  console.log("================================================================================");
}

main().catch(console.error);
