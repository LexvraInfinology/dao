const fs = require("fs");
const path = require("path");

const MAINNET_BACKEND_URL = process.env.TROB_MAINNET_BACKEND || "https://backend.trobchain.com";
const OPTIMIZER_RUNS = 200;

const deployedPath = path.resolve(__dirname, "../deployed-trobchain-mainnet.json");
const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf8"));

const contractsToVerify = [
  {
    name: "EquoraRegistry",
    address: deployed.contracts.EquoraRegistry.addressBase58,
  },
  {
    name: "EquoraNFT",
    address: deployed.contracts.EquoraNFT.addressBase58,
  },
  {
    name: "EquoraDAOv2",
    address: deployed.contracts.EquoraDAOv2.addressBase58,
  },
  {
    name: "EquoraVault",
    address: deployed.contracts.EquoraVault.addressBase58,
  },
  {
    name: "EquoraSalaryPool",
    address: deployed.contracts.EquoraSalaryPool.addressBase58,
  },
  {
    name: "EquoraRewardPool",
    address: deployed.contracts.EquoraRewardPool.addressBase58,
  },
  {
    name: "EquoraMagicBox",
    address: deployed.contracts.EquoraMagicBox.addressBase58,
  },
  {
    name: "EquoraMatrix",
    address: deployed.contracts.EquoraMatrix.addressBase58,
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
  console.log(`🔍 Verifying ${item.name} (${item.address}) on Mainnet...`);

  const flatPath = path.resolve(__dirname, "../contracts-flattened", `${item.name}.sol`);
  if (!fs.existsSync(flatPath)) {
    console.error(`❌ Flattened file not found: ${flatPath}`);
    return false;
  }
  const sourceCode = fs.readFileSync(flatPath, "utf8");

  for (const solcVer of SOLC_VERSIONS) {
    try {
      console.log(`   Submitting with compiler ${solcVer}...`);
      const res = await fetch(`${MAINNET_BACKEND_URL}/v1/contracts/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: item.address,
          sourceCode: sourceCode,
          contractName: item.name,
          compilerVersion: solcVer,
          optimizer: {
            enabled: true,
            runs: OPTIMIZER_RUNS,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && ((data.data && data.data.verified) || data.verified || data.code === 200)) {
        console.log(`   🎉 ✅ VERIFIED & PUBLISHED: https://trobchain.com/blockchain/contract/${item.address}`);
        return true;
      } else {
        console.log(`   Response status: ${res.status}`, JSON.stringify(data).slice(0, 150));
      }
    } catch (err) {
      console.warn(`   Request failed for ${solcVer}:`, err.message);
    }
  }
  return false;
}

async function main() {
  console.log("=== TROBCHAIN MAINNET CONTRACT VERIFICATION ===");
  console.log(`Deployer: ${deployed.deployer}`);
  console.log(`Target backend: ${MAINNET_BACKEND_URL}\n`);
  for (const item of contractsToVerify) {
    await verifyContract(item);
  }
}

main().catch(console.error);
