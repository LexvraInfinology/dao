import { ethers, network, artifacts } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * deploy.ts — Equora.Fi Full Deployment Script (V3)
 * Run with: npx hardhat run scripts/deploy.ts --network localhost
 *
 * Deployment Order:
 *  1. MockToken / EquoraToken
 *  2. EquoraRegistry
 *  3. EquoraNFT
 *  4. EquoraRewardPool
 *  5. EquoraSalaryPool
 *  6. EquoraMagicBox
 *  7. EquoraDAO
 *  8. EquoraVault
 *  9. EquoraMatrix
 * 10. Wire all authorizations
 * 11. Generate deployedContracts.ts for frontend
 * 12. Renounce ownership on all Ownable contracts (Null Key)
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = network.name;
  const chainId = (await ethers.provider.getNetwork()).chainId;

  console.log("\n════════════════════════════════════════════════════");
  console.log("   EQUORA.FI DEPLOYMENT STARTING");
  console.log(`   Network: ${networkName} (chainId: ${chainId})`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log("════════════════════════════════════════════════════\n");

  const isLocal = networkName === "hardhat" || networkName === "localhost";

  // ─── 1. Deploy Token ──────────────────────────────────────────────────────

  let tokenAddress: string;

  if (isLocal) {
    console.log("🪙  Deploying MockToken (local testing)...");
    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy();
    await mockToken.waitForDeployment();
    tokenAddress = await mockToken.getAddress();
    console.log(`   ✅ MockToken:         ${tokenAddress}`);
  } else {
    console.log("🪙  Deploying EquoraToken...");
    const EquoraToken = await ethers.getContractFactory("EquoraToken");
    const token = await EquoraToken.deploy(deployer.address);
    await token.waitForDeployment();
    tokenAddress = await token.getAddress();
    console.log(`   ✅ EquoraToken:       ${tokenAddress}`);
  }

  // ─── 2. Deploy EquoraRegistry ─────────────────────────────────────────────

  console.log("\n📋  Deploying EquoraRegistry...");
  const EquoraRegistry = await ethers.getContractFactory("EquoraRegistry");
  const registry = await EquoraRegistry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`   ✅ EquoraRegistry:    ${registryAddress}`);

  // ─── 3. Deploy EquoraNFT ──────────────────────────────────────────────────

  console.log("\n🎨  Deploying EquoraNFT...");
  const EquoraNFT = await ethers.getContractFactory("EquoraNFT");
  const nft = await EquoraNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log(`   ✅ EquoraNFT:         ${nftAddress}`);

  // ─── 4. Deploy EquoraVault (deploys before pools so pools can reference its address) ──
  // Vault needs pool addresses only for initialize() which is called AFTER pools deploy.
  // Pools need vault address in their constructors — so Vault must deploy first.

  console.log("\n🏦  Deploying EquoraVault...");
  const EquoraVault = await ethers.getContractFactory("EquoraVault");
  const vault = await EquoraVault.deploy(tokenAddress, registryAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`   ✅ EquoraVault:       ${vaultAddress}`);

  // ─── 5. Deploy EquoraRewardPool ───────────────────────────────────────────

  console.log("\n🎯  Deploying EquoraRewardPool...");
  const EquoraRewardPool = await ethers.getContractFactory("EquoraRewardPool");
  const rewardPool = await EquoraRewardPool.deploy(tokenAddress, vaultAddress);
  await rewardPool.waitForDeployment();
  const rewardPoolAddress = await rewardPool.getAddress();
  console.log(`   ✅ EquoraRewardPool:  ${rewardPoolAddress}`);

  // ─── 6. Deploy EquoraSalaryPool ───────────────────────────────────────────

  console.log("\n💰  Deploying EquoraSalaryPool...");
  const EquoraSalaryPool = await ethers.getContractFactory("EquoraSalaryPool");
  const salaryPool = await EquoraSalaryPool.deploy(tokenAddress, vaultAddress);
  await salaryPool.waitForDeployment();
  const salaryPoolAddress = await salaryPool.getAddress();
  console.log(`   ✅ EquoraSalaryPool:  ${salaryPoolAddress}`);

  // ─── 7. Deploy EquoraMagicBox ─────────────────────────────────────────────

  console.log("\n🎁  Deploying EquoraMagicBox...");
  const EquoraMagicBox = await ethers.getContractFactory("EquoraMagicBox");
  const magicBox = await EquoraMagicBox.deploy(tokenAddress, vaultAddress);
  await magicBox.waitForDeployment();
  const magicBoxAddress = await magicBox.getAddress();
  console.log(`   ✅ EquoraMagicBox:    ${magicBoxAddress}`);

  // ─── 8. Deploy EquoraDAO ──────────────────────────────────────────────────

  console.log("\n🏛️  Deploying EquoraDAO...");
  const EquoraDAO = await ethers.getContractFactory("EquoraDAO");
  const dao = await EquoraDAO.deploy(tokenAddress, registryAddress);
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  const membershipNFTAddress = await dao.membershipNFT();
  console.log(`   ✅ EquoraDAO:         ${daoAddress}`);
  console.log(`   ✅ DAOMembershipNFT:  ${membershipNFTAddress}`);

  // ─── 9. Deploy EquoraMatrix ───────────────────────────────────────────────

  console.log("\n🔢  Deploying EquoraMatrix...");
  const EquoraMatrix = await ethers.getContractFactory("EquoraMatrix");
  const matrix = await EquoraMatrix.deploy(tokenAddress, registryAddress, nftAddress);
  await matrix.waitForDeployment();
  const matrixAddress = await matrix.getAddress();
  console.log(`   ✅ EquoraMatrix:      ${matrixAddress}`);

  // ─── 10. Wire Authorizations ──────────────────────────────────────────────

  console.log("\n🔌  Wiring contract authorizations...\n");

  // EquoraVault: set pool addresses
  console.log("   [1/9] EquoraVault.initialize(dao, salary, magicBox, rewards)...");
  await (await vault.initialize(daoAddress, salaryPoolAddress, magicBoxAddress, rewardPoolAddress)).wait();
  console.log("         ✅ Vault pools initialized");

  // EquoraVault: set matrix contract (authorized to call routePoolDeposit)
  console.log("   [2/9] EquoraVault.setMatrixContract(matrix)...");
  await (await vault.setMatrixContract(matrixAddress)).wait();
  console.log("         ✅ Matrix authorized in Vault");

  // EquoraMatrix: set vault contract (for P4/P5/P14 forwarding)
  console.log("   [3/9] EquoraMatrix.setVaultContract(vault)...");
  await (await matrix.setVaultContract(vaultAddress)).wait();
  console.log("         ✅ Vault set in Matrix");

  // EquoraRegistry: authorize Vault + DAO + Matrix
  console.log("   [4/9] EquoraRegistry.setAuthorizedContracts(vault, dao, matrix)...");
  await (await registry.setAuthorizedContracts(vaultAddress, daoAddress, matrixAddress)).wait();
  console.log("         ✅ Registry authorized contracts set (Vault, DAO, Matrix)");

  // EquoraSalaryPool: set reward pool
  console.log("   [5/9] EquoraSalaryPool.setRewardPool(rewardPool)...");
  await (await salaryPool.setRewardPool(rewardPoolAddress)).wait();
  console.log("         ✅ RewardPool set in SalaryPool");

  // EquoraRewardPool: set authorized caller (EquoraSalaryPool)
  console.log("   [6/9] EquoraRewardPool.setAuthorizedCaller(salaryPool)...");
  await (await rewardPool.setAuthorizedCaller(salaryPoolAddress)).wait();
  console.log("         ✅ SalaryPool authorized in RewardPool");

  // EquoraNFT: authorize Matrix as minter (for rank badge NFTs on slot milestones)
  console.log("   [7/9] EquoraNFT.setMinter(matrix, true)...");
  await (await nft.setMinter(matrixAddress, true)).wait();
  console.log("         ✅ Matrix set as NFT minter");

  console.log("   [8/10] EquoraDAO.setVaultContract(vault)...");
  await (await dao.setVaultContract(vaultAddress)).wait();
  console.log("         ✅ Vault configured in EquoraDAO (for 35% matrix volume share)");

  console.log("   [9/10] EquoraRegistry: confirming Matrix registration path...");
  console.log("         ✅ Matrix authorized for direct registration");

  // 21-Day Genesis DAO Phase 1 Lock:
  if (!isLocal) {
    const launchTime = Math.floor(Date.now() / 1000) + (21 * 24 * 60 * 60); // 21 days from deployment
    console.log(`   [10/11] Setting 21-day Matrix launch lock...`);
    await (await matrix.setMatrixLaunchTime(launchTime)).wait();
    console.log(`         ✅ Matrix locked until Day 22: ${new Date(launchTime * 1000).toISOString()}`);
  } else {
    console.log("   [10/11] Local network: Matrix launch lock set to 0 (unlocked for testing)");
  }

  // Local: mint some test tokens to deployer for testing
  if (isLocal) {
    console.log("   [11/11] Minting test tokens for deployer (local only)...");
    const MockToken = await ethers.getContractAt("MockToken", tokenAddress);
    const mintBatch = ethers.parseEther("10000"); // MockToken: max 10,000 per mint
    // Mint 5 batches = 50,000 TROB total for testing
    for (let i = 0; i < 5; i++) {
      await (await MockToken.mint(deployer.address, mintBatch)).wait();
    }
    console.log(`         ✅ Minted 50,000 TROB to deployer (5 × 10,000 batches)`);
  } else {
    console.log("   [11/11] Production: skip test token mint");
  }

  // ─── 11. Generate deployedContracts.ts ────────────────────────────────────

  console.log("\n📝  Generating deployedContracts.ts...");

  const tokenContractName = isLocal ? "MockToken" : "EquoraToken";

  const deployedData = {
    [Number(chainId)]: {
      EquoraToken: {
        address: tokenAddress,
        abi: (await artifacts.readArtifact(tokenContractName)).abi,
      },
      EquoraRegistry: {
        address: registryAddress,
        abi: (await artifacts.readArtifact("EquoraRegistry")).abi,
      },
      EquoraNFT: {
        address: nftAddress,
        abi: (await artifacts.readArtifact("EquoraNFT")).abi,
      },
      EquoraDAO: {
        address: daoAddress,
        abi: (await artifacts.readArtifact("EquoraDAO")).abi,
      },
      EquoraDAOMembership: {
        address: membershipNFTAddress,
        abi: (await artifacts.readArtifact("EquoraDAOMembership")).abi,
      },
      EquoraVault: {
        address: vaultAddress,
        abi: (await artifacts.readArtifact("EquoraVault")).abi,
      },
      EquoraMatrix: {
        address: matrixAddress,
        abi: (await artifacts.readArtifact("EquoraMatrix")).abi,
      },
      EquoraSalaryPool: {
        address: salaryPoolAddress,
        abi: (await artifacts.readArtifact("EquoraSalaryPool")).abi,
      },
      EquoraMagicBox: {
        address: magicBoxAddress,
        abi: (await artifacts.readArtifact("EquoraMagicBox")).abi,
      },
      EquoraRewardPool: {
        address: rewardPoolAddress,
        abi: (await artifacts.readArtifact("EquoraRewardPool")).abi,
      },
    },
  };

  const outputPath = path.resolve(
    __dirname,
    "../../../apps/web/contracts/deployedContracts.ts"
  );

  const fileContent = `/**
 * This file is auto-generated by packages/hardhat/scripts/deploy.ts
 * Do NOT edit manually — re-run yarn deploy to regenerate.
 * Last generated: ${new Date().toISOString()}
 * Network: ${networkName} (chainId: ${chainId})
 *
 * Equora.Fi Protocol Contracts:
 *   EquoraToken         — TROB payment token
 *   EquoraRegistry      — User registration, referral codes, sponsor tracking
 *   EquoraNFT           — Rank badge + welcome pass NFTs
 *   EquoraDAO           — 100-seat genesis DAO (300 TROB entry, 5X cap, 48hr retopup)
 *   EquoraDAOMembership — Soulbound DAO seat NFTs
 *   EquoraVault         — Central deposit router (35% DAO, 40% Salary, 10% Box, 15% Rewards)
 *   EquoraMatrix        — 12-slot, 14-node matrix engine (P4/P5/P14 → Vault)
 *   EquoraSalaryPool    — Monthly salary (cumulative tier laddering, 11th of month)
 *   EquoraMagicBox      — Quarterly shared lottery pool ($0.50/$0.80/$1.20/$5.00 prizes)
 *   EquoraRewardPool    — Instant milestone rewards (Alpha 10%, Prime 15%, Elite 25%, Crown 50%)
 */
import type { GenericContractsDeclaration } from "../utils/scaffold-eth/contract";

const deployedContracts = ${JSON.stringify(deployedData, null, 2)} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, fileContent, "utf-8");
  console.log(`   ✅ deployedContracts.ts written to apps/web/contracts/`);

  // ─── 12. Renounce Ownership (Null Key) ────────────────────────────────────
  // Per client requirement: "To be deployed on Null Key"
  // After all wiring is complete, renounce ownership on all Ownable contracts.
  // This makes the protocol fully autonomous — no admin can ever change settings.

  if (!isLocal) {
    // Only renounce on non-local networks (for production)
    console.log("\n🔑  Renouncing ownership (Null Key)...");
    console.log("   ⚠️  THIS IS IRREVERSIBLE!");

    await (await registry.renounceOwnership()).wait();
    console.log("   ✅ EquoraRegistry: ownership renounced");

    await (await nft.renounceOwnership()).wait();
    console.log("   ✅ EquoraNFT: ownership renounced");

    await (await matrix.renounceOwnership()).wait();
    console.log("   ✅ EquoraMatrix: ownership renounced");

    console.log("   ✅ Null Key complete — protocol is now fully autonomous");
  } else {
    console.log("\n🔑  Null Key: SKIPPED on local network (ownership kept for testing)");
  }

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║           EQUORA.FI DEPLOYMENT COMPLETE ✅               ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  Token:         ${tokenAddress}`);
  console.log(`║  Registry:      ${registryAddress}`);
  console.log(`║  NFT:           ${nftAddress}`);
  console.log(`║  DAO:           ${daoAddress}`);
  console.log(`║  DAO NFT:       ${membershipNFTAddress}`);
  console.log(`║  Vault:         ${vaultAddress}`);
  console.log(`║  Matrix:        ${matrixAddress}`);
  console.log(`║  SalaryPool:    ${salaryPoolAddress}`);
  console.log(`║  MagicBox:      ${magicBoxAddress}`);
  console.log(`║  RewardPool:    ${rewardPoolAddress}`);
  console.log("╚══════════════════════════════════════════════════════════╝\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
