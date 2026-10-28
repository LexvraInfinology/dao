const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const TESTNET_BACKEND_URL = process.env.TROB_TESTNET_BACKEND || "https://testnet-backend.trobchain.com";
const OPTIMIZER_RUNS = 200;

function cleanFlattenedCode(raw) {
  // Normalize line breaks
  let code = raw.replace(/\r\n/g, "\n");
  // Remove BOM if any
  if (code.charCodeAt(0) === 0xFEFF) {
    code = code.slice(1);
  }
  // Keep only the first SPDX license identifier
  let spdxFound = false;
  code = code.replace(/\/\/ SPDX-License-Identifier:[^\n]+/g, (match) => {
    if (!spdxFound) {
      spdxFound = true;
      return match;
    }
    return "";
  });
  return code;
}

const contractsToVerify = [
  {
    name: "EquoraMatrix",
    address: "TWZZ1ZvU2WmiEYzoXkeKjeKY66nyww2GbY",
    relPath: "contracts/core/EquoraMatrix.sol",
  },
  {
    name: "EquoraDAOv2",
    address: "TPw1MNKr2QcU3CizievsskdSRtuY18Zvvr",
    relPath: "contracts/core/EquoraDAOv2.sol",
  },
  {
    name: "EquoraVault",
    address: "THQBFEJsH2dBAuXQQT8LErqsjsD7hCPLfa",
    relPath: "contracts/core/EquoraVault.sol",
  },
  {
    name: "EquoraRegistry",
    address: "TCcHDFibnBsSwZhCRyvevXQfoAQ6NMyYWN",
    relPath: "contracts/core/EquoraRegistry.sol",
  },
];

const SOLC_VERSIONS = [
  "v0.8.25+commit.b61c2a91",
  "v0.8.26+commit.8a97fa7a",
  "v0.8.20+commit.a1b79de6",
  "v0.8.24+commit.e11b9ed9",
  "v0.8.28+commit.7893614a",
];

async function verifyContract(item) {
  console.log(`\n======================================================`);
  console.log(`🔍 Flattening & Verifying ${item.name} (${item.address})...`);

  let flattenedCode;
  try {
    const raw = execSync(`npx hardhat flatten ${item.relPath}`, {
      cwd: path.resolve(__dirname, ".."),
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
    });
    flattenedCode = cleanFlattenedCode(raw);
    const savePath = path.resolve(__dirname, "../contracts-flattened", `${item.name}.sol`);
    fs.writeFileSync(savePath, flattenedCode, "utf8");
    console.log(`   Saved clean UTF-8 flattened file to ${savePath} (${flattenedCode.length} chars)`);
  } catch (err) {
    console.error(`❌ Flattening failed for ${item.name}:`, err.message);
    return false;
  }

  for (const solcVer of SOLC_VERSIONS) {
    try {
      console.log(`   Submitting with compiler ${solcVer}...`);
      const res = await fetch(`${TESTNET_BACKEND_URL}/v1/contracts/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: item.address,
          sourceCode: flattenedCode,
          contractName: item.name,
          compilerVersion: solcVer,
          optimizer: {
            enabled: true,
            runs: OPTIMIZER_RUNS,
          },
        }),
      });

      const data = await res.json();
      console.log(`   Response status: ${res.status}`, JSON.stringify(data).slice(0, 300));
      if (res.ok && ((data.data && data.data.verified) || data.verified || data.code === 200)) {
        console.log(`   🎉 ✅ VERIFIED & PUBLISHED: https://testnet.trobchain.com/blockchain/contract/${item.address}`);
        return true;
      }
    } catch (err) {
      console.warn(`   Request failed for ${solcVer}:`, err.message);
    }
  }
  return false;
}

async function main() {
  console.log("=== TROBCHAIN TESTNET CONTRACT VERIFICATION ===");
  for (const item of contractsToVerify) {
    await verifyContract(item);
  }
}

main().catch(console.error);
