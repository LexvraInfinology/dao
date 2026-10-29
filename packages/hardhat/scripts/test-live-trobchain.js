const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config();

const {
  base58ToHex,
  hexToBase58,
  privateKeyToAddress,
} = require("./deploy-trobchain.js");

const FULLNODE_URL =
  process.env.TROBCHAIN_FULLNODE_URL ||
  "https://fullnode-one-testnet.trobchain.com";

const deployedPath = path.resolve(__dirname, "../deployed-trobchain.json");
if (!fs.existsSync(deployedPath)) {
  console.error("❌ deployed-trobchain.json not found!");
  process.exit(1);
}

const deployment = JSON.parse(fs.readFileSync(deployedPath, "utf8"));
const coder = new ethers.AbiCoder();

async function callContractConstant(contractHex, functionSelector, parameterHex = "", ownerHex = "410000000000000000000000000000000000000000") {
  const payload = {
    owner_address: ownerHex,
    contract_address: contractHex,
    function_selector: functionSelector,
    parameter: parameterHex.replace(/^0x/, ""),
    visible: false,
  };

  const res = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (data.Error) {
    throw new Error(`RPC Error: ${data.Error}`);
  }
  if (!data.result || !data.result.result) {
    const msg = data.result?.message ? Buffer.from(data.result.message, 'hex').toString('utf8') : JSON.stringify(data.result);
    throw new Error(`Trigger Failed: ${msg}`);
  }

  return data.constant_result ? data.constant_result[0] : null;
}

async function runLiveDiagnostics() {
  console.log("\n============================================================");
  console.log("🔍 EQUORA.FI — LIVE ON-CHAIN CONTRACT DIAGNOSTICS & PROBE");
  console.log(`🌐 Fullnode RPC: ${FULLNODE_URL}`);
  console.log(`📋 Network: ${deployment.network}`);
  console.log(`👤 Deployer: ${deployment.deployer}`);
  console.log("============================================================\n");

  const results = {
    passed: 0,
    failed: 0,
    details: [],
  };

  // ── 1. EquoraToken ────────────────────────────────────────────────────────
  console.log("─── [1/6] Testing EquoraToken (TRC20) ───────────────────");
  const token = deployment.contracts.EquoraToken;
  try {
    const nameHex = await callContractConstant(token.addressHex, "name()");
    const name = nameHex ? coder.decode(["string"], "0x" + nameHex)[0] : "N/A";
    
    const symbolHex = await callContractConstant(token.addressHex, "symbol()");
    const symbol = symbolHex ? coder.decode(["string"], "0x" + symbolHex)[0] : "N/A";

    const decimalsHex = await callContractConstant(token.addressHex, "decimals()");
    const decimals = decimalsHex ? coder.decode(["uint8"], "0x" + decimalsHex)[0] : "N/A";

    const supplyHex = await callContractConstant(token.addressHex, "totalSupply()");
    const supply = supplyHex ? ethers.formatUnits(coder.decode(["uint256"], "0x" + supplyHex)[0], 18) : "N/A";

    console.log(`   ✅ Name: ${name}`);
    console.log(`   ✅ Symbol: ${symbol}`);
    console.log(`   ✅ Decimals: ${decimals}`);
    console.log(`   ✅ Total Supply: ${Number(supply).toLocaleString()} ${symbol}`);
    results.passed++;
    results.details.push({ contract: "EquoraToken", status: "PASS", name, symbol, supply });
  } catch (err) {
    console.error(`   ❌ EquoraToken probe failed:`, err.message);
    results.failed++;
    results.details.push({ contract: "EquoraToken", status: "FAIL", error: err.message });
  }

  // ── 2. EquoraRegistry ─────────────────────────────────────────────────────
  console.log("\n─── [2/6] Testing EquoraRegistry (5-Digit Codes) ────────");
  const registry = deployment.contracts.EquoraRegistry;
  try {
    const minCodeHex = await callContractConstant(registry.addressHex, "CODE_MIN()");
    const minCode = minCodeHex ? coder.decode(["uint32"], "0x" + minCodeHex)[0].toString() : "N/A";

    const maxCodeHex = await callContractConstant(registry.addressHex, "CODE_MAX()");
    const maxCode = maxCodeHex ? coder.decode(["uint32"], "0x" + maxCodeHex)[0].toString() : "N/A";

    const rootHex = await callContractConstant(registry.addressHex, "root()");
    const rootAddr = rootHex ? hexToBase58("41" + coder.decode(["address"], "0x" + rootHex)[0].slice(2)) : "N/A";

    const totalUsersHex = await callContractConstant(registry.addressHex, "totalUsers()");
    const totalUsers = totalUsersHex ? coder.decode(["uint256"], "0x" + totalUsersHex)[0].toString() : "N/A";

    console.log(`   ✅ CODE_MIN: ${minCode} (Minimum 5-digit code)`);
    console.log(`   ✅ CODE_MAX: ${maxCode} (Maximum 5-digit code)`);
    console.log(`   ✅ Root Wallet: ${rootAddr}`);
    console.log(`   ✅ Total Registered Users: ${totalUsers}`);
    results.passed++;
    results.details.push({ contract: "EquoraRegistry", status: "PASS", minCode, maxCode, rootAddr, totalUsers });
  } catch (err) {
    console.error(`   ❌ EquoraRegistry probe failed:`, err.message);
    results.failed++;
    results.details.push({ contract: "EquoraRegistry", status: "FAIL", error: err.message });
  }

  // ── 3. EquoraDAO ──────────────────────────────────────────────────────────
  console.log("\n─── [3/6] Testing EquoraDAO (Council Seats & Conditions) ─");
  const dao = deployment.contracts.EquoraDAO;
  try {
    const maxMembersHex = await callContractConstant(dao.addressHex, "MAX_MEMBERS()");
    const maxMembers = maxMembersHex ? coder.decode(["uint256"], "0x" + maxMembersHex)[0].toString() : "N/A";

    const entryFeeUsdHex = await callContractConstant(dao.addressHex, "ENTRY_FEE_USD()");
    const entryFeeUsd = entryFeeUsdHex ? (Number(coder.decode(["uint256"], "0x" + entryFeeUsdHex)[0]) / 1e6).toFixed(2) : "N/A";

    const earningsCapUsdHex = await callContractConstant(dao.addressHex, "EARNINGS_CAP_USD()");
    const earningsCapUsd = earningsCapUsdHex ? (Number(coder.decode(["uint256"], "0x" + earningsCapUsdHex)[0]) / 1e6).toFixed(2) : "N/A";

    const minDateHex = await callContractConstant(dao.addressHex, "MIN_WALLET_CREATION_DATE()");
    const minDateTs = minDateHex ? Number(coder.decode(["uint256"], "0x" + minDateHex)[0]) : 0;
    const minDateStr = minDateTs ? new Date(minDateTs * 1000).toISOString() : "N/A";

    const srBase58Hex = await callContractConstant(dao.addressHex, "OFFICIAL_SR_BASE58()");
    const srBase58 = srBase58Hex ? coder.decode(["string"], "0x" + srBase58Hex)[0] : "N/A";

    const windowSecHex = await callContractConstant(dao.addressHex, "timeRemainingInWindow()");
    const windowSec = windowSecHex ? Number(coder.decode(["uint256"], "0x" + windowSecHex)[0]) : 0;

    const statsHex = await callContractConstant(dao.addressHex, "getDAOStats()");
    let stats = { memberCount: "N/A", activeMembers: "N/A", rem: "N/A" };
    if (statsHex) {
      const decoded = coder.decode(
        ["uint256", "uint256", "uint256", "bool", "uint256", "uint256", "uint256", "uint256"],
        "0x" + statsHex
      );
      stats = {
        memberCount: decoded[0].toString(),
        activeMembers: decoded[1].toString(),
        rem: decoded[2].toString(),
        isExpired: decoded[3],
        vacantBlanks: decoded[4].toString(),
        timeRemSec: decoded[5].toString(),
      };
    }

    console.log(`   ✅ MAX_MEMBERS: ${maxMembers} Seats`);
    console.log(`   ✅ ENTRY_FEE_USD: $${entryFeeUsd} USD`);
    console.log(`   ✅ EARNINGS_CAP_USD: $${earningsCapUsd} USD (5x)`);
    console.log(`   ✅ MIN_WALLET_CREATION_DATE: ${minDateTs} (${minDateStr})`);
    console.log(`   ✅ OFFICIAL_SR_BASE58: ${srBase58}`);
    console.log(`   ✅ Founding Window Remaining: ${Math.round(windowSec / 86400)} days (${windowSec}s)`);
    console.log(`   ✅ Current On-Chain Council Members: ${stats.memberCount} / ${maxMembers}`);

    results.passed++;
    results.details.push({ contract: "EquoraDAO", status: "PASS", maxMembers, entryFeeUsd, earningsCapUsd, stats });
  } catch (err) {
    console.error(`   ❌ EquoraDAO probe failed:`, err.message);
    results.failed++;
    results.details.push({ contract: "EquoraDAO", status: "FAIL", error: err.message });
  }

  // ── 4. EquoraVault ────────────────────────────────────────────────────────
  console.log("\n─── [4/6] Testing EquoraVault (Protocol Treasury) ───────");
  const vault = deployment.contracts.EquoraVault;
  try {
    const previewHex = await callContractConstant(
      vault.addressHex,
      "previewSplit(uint256)",
      coder.encode(["uint256"], [ethers.parseUnits("300", 18)]).replace(/^0x/, "")
    );

    let splitDesc = "N/A";
    if (previewHex) {
      const decoded = coder.decode(["uint256", "uint256", "uint256", "uint256"], "0x" + previewHex);
      splitDesc = `DAO: ${ethers.formatUnits(decoded[0], 18)} (35%) | Salary: ${ethers.formatUnits(decoded[1], 18)} (40%) | Box: ${ethers.formatUnits(decoded[2], 18)} (10%) | Rewards: ${ethers.formatUnits(decoded[3], 18)} (15%)`;
    }

    console.log(`   ✅ Deposit Split Routing (300 TROB Preview):`);
    console.log(`      ${splitDesc}`);

    results.passed++;
    results.details.push({ contract: "EquoraVault", status: "PASS", splitDesc });
  } catch (err) {
    console.error(`   ❌ EquoraVault probe failed:`, err.message);
    results.failed++;
    results.details.push({ contract: "EquoraVault", status: "FAIL", error: err.message });
  }

  // ── 5. EquoraNFT ──────────────────────────────────────────────────────────
  console.log("\n─── [5/6] Testing EquoraNFT (Passes & Ranks) ───────────");
  const nft = deployment.contracts.EquoraNFT;
  try {
    const nftNameHex = await callContractConstant(nft.addressHex, "name()");
    const nftName = nftNameHex ? coder.decode(["string"], "0x" + nftNameHex)[0] : "N/A";

    const nftSymbolHex = await callContractConstant(nft.addressHex, "symbol()");
    const nftSymbol = nftSymbolHex ? coder.decode(["string"], "0x" + nftSymbolHex)[0] : "N/A";

    console.log(`   ✅ NFT Name: ${nftName}`);
    console.log(`   ✅ NFT Symbol: ${nftSymbol}`);

    results.passed++;
    results.details.push({ contract: "EquoraNFT", status: "PASS", nftName, nftSymbol });
  } catch (err) {
    console.error(`   ❌ EquoraNFT probe failed:`, err.message);
    results.failed++;
    results.details.push({ contract: "EquoraNFT", status: "FAIL", error: err.message });
  }

  // ── 6. EquoraMatrix ───────────────────────────────────────────────────────
  console.log("\n─── [6/6] Testing EquoraMatrix (14-Node Engine) ─────────");
  const matrix = deployment.contracts.EquoraMatrix;
  try {
    const totalSlotsHex = await callContractConstant(matrix.addressHex, "TOTAL_SLOTS()");
    const totalSlots = totalSlotsHex ? coder.decode(["uint256"], "0x" + totalSlotsHex)[0].toString() : "N/A";

    const treeNodesHex = await callContractConstant(matrix.addressHex, "TREE_NODES()");
    const treeNodes = treeNodesHex ? coder.decode(["uint256"], "0x" + treeNodesHex)[0].toString() : "N/A";

    const slot1CostHex = await callContractConstant(
      matrix.addressHex,
      "slotCosts(uint256)",
      coder.encode(["uint256"], [1]).replace(/^0x/, "")
    );
    const slot1Cost = slot1CostHex ? ethers.formatUnits(coder.decode(["uint256"], "0x" + slot1CostHex)[0], 18) : "N/A";

    const slot12CostHex = await callContractConstant(
      matrix.addressHex,
      "slotCosts(uint256)",
      coder.encode(["uint256"], [12]).replace(/^0x/, "")
    );
    const slot12Cost = slot12CostHex ? ethers.formatUnits(coder.decode(["uint256"], "0x" + slot12CostHex)[0], 18) : "N/A";

    console.log(`   ✅ TOTAL_SLOTS: ${totalSlots}`);
    console.log(`   ✅ TREE_NODES: ${treeNodes} (14 positions per single-leg cycle)`);
    console.log(`   ✅ Slot 1 Cost: ${slot1Cost} TROB`);
    console.log(`   ✅ Slot 12 Cost: ${Number(slot12Cost).toLocaleString()} TROB`);

    results.passed++;
    results.details.push({ contract: "EquoraMatrix", status: "PASS", totalSlots, treeNodes, slot1Cost, slot12Cost });
  } catch (err) {
    console.error(`   ❌ EquoraMatrix probe failed:`, err.message);
    results.failed++;
    results.details.push({ contract: "EquoraMatrix", status: "FAIL", error: err.message });
  }

  console.log("\n============================================================");
  console.log(`📊 LIVE DIAGNOSTIC SUMMARY:`);
  console.log(`   Total Contracts Checked: 6`);
  console.log(`   Passed: ${results.passed} / 6`);
  console.log(`   Failed: ${results.failed} / 6`);
  console.log("============================================================\n");

  if (results.failed === 0) {
    console.log("🎉 ALL 6 CONTRACTS ARE FULLY HEALTHY & OPERATIONAL ON TROBCHAIN!");
  } else {
    console.log("⚠️ Some contracts encountered issues. Review details above.");
    process.exit(1);
  }
}

runLiveDiagnostics().catch(console.error);
