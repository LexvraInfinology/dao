import { ethers, network, artifacts } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * deploy.ts — B-TITAN Full Deployment Script
 * Run with: npx hardhat run scripts/deploy.ts --network localhost
 *
 * Deployment Order:
 * 1. MockToken / BTitanToken
 * 2. BTitanRegistry
 * 3. BTitanNFT
 * 4. BTitanVestingVault
 * 5. BTitanDAO
 * 6. BTitanMatrix
 * 7. Wire all authorizations
 * 8. Generate deployedContracts.ts for frontend
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = network.name;
  const chainId = (await ethers.provider.getNetwork()).chainId;

  console.log("\n════════════════════════════════════════════");
  console.log("   B-TITAN DEPLOYMENT STARTING");
  console.log(`   Network: ${networkName} (chainId: ${chainId})`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log("════════════════════════════════════════════\n");

  const isLocal = networkName === "hardhat" || networkName === "localhost";

  // ─── 1. Deploy Token ──────────────────────────────────────────────────────

  let tokenAddress: string;

  if (isLocal) {
    console.log("🪙 Deploying MockToken (local testing)...");
    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy();
    await mockToken.waitForDeployment();
    tokenAddress = await mockToken.getAddress();
    console.log(`   ✅ MockToken: ${tokenAddress}`);
  } else {
    console.log("🪙 Deploying BTitanToken...");
    const BTitanToken = await ethers.getContractFactory("BTitanToken");
    const token = await BTitanToken.deploy(deployer.address);
    await token.waitForDeployment();
    tokenAddress = await token.getAddress();
    console.log(`   ✅ BTitanToken: ${tokenAddress}`);
  }

  // ─── 2. Deploy Registry ───────────────────────────────────────────────────

  console.log("📋 Deploying BTitanRegistry...");
  const BTitanRegistry = await ethers.getContractFactory("BTitanRegistry");
  const registry = await BTitanRegistry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`   ✅ BTitanRegistry: ${registryAddress}`);

  // ─── 3. Deploy NFT ────────────────────────────────────────────────────────

  console.log("🖼️ Deploying BTitanNFT...");
  const BTitanNFT = await ethers.getContractFactory("BTitanNFT");
  const nft = await BTitanNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log(`   ✅ BTitanNFT: ${nftAddress}`);

  // ─── 4. Deploy VestingVault ───────────────────────────────────────────────

  console.log("🔒 Deploying BTitanVestingVault...");
  const BTitanVestingVault = await ethers.getContractFactory("BTitanVestingVault");
  const vault = await BTitanVestingVault.deploy(tokenAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`   ✅ BTitanVestingVault: ${vaultAddress}`);

  // ─── 5. Deploy DAO ────────────────────────────────────────────────────────

  console.log("🏛️ Deploying BTitanDAO...");
  const BTitanDAO = await ethers.getContractFactory("BTitanDAO");
  const dao = await BTitanDAO.deploy(tokenAddress, registryAddress, nftAddress);
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  console.log(`   ✅ BTitanDAO: ${daoAddress}`);

  // ─── 6. Deploy Matrix ─────────────────────────────────────────────────────

  console.log("🔢 Deploying BTitanMatrix...");
  const BTitanMatrix = await ethers.getContractFactory("BTitanMatrix");
  const matrix = await BTitanMatrix.deploy(tokenAddress, registryAddress, nftAddress, vaultAddress);
  await matrix.waitForDeployment();
  const matrixAddress = await matrix.getAddress();
  console.log(`   ✅ BTitanMatrix: ${matrixAddress}`);

  // ─── 7. Wire Authorizations ───────────────────────────────────────────────

  console.log("\n🔗 Wiring contract authorizations...");

  await (await registry.setAuthorizedContracts(matrixAddress, daoAddress)).wait();
  console.log("   ✅ Registry: Matrix + DAO authorized");

  await (await nft.setMinter(daoAddress, true)).wait();
  await (await nft.setMinter(matrixAddress, true)).wait();
  console.log("   ✅ NFT: DAO + Matrix as minters");

  await (await vault.setAuthorizedContracts(matrixAddress, daoAddress)).wait();
  console.log("   ✅ VestingVault: Matrix + DAO authorized");

  // ─── 8. Generate deployedContracts.ts ────────────────────────────────────

  const contractName = isLocal ? "MockToken" : "BTitanToken";

  const deployedData = {
    [Number(chainId)]: {
      BTitanToken: {
        address: tokenAddress,
        abi: (await artifacts.readArtifact(isLocal ? "MockToken" : "BTitanToken")).abi,
      },
      BTitanRegistry: {
        address: registryAddress,
        abi: (await artifacts.readArtifact("BTitanRegistry")).abi,
      },
      BTitanNFT: {
        address: nftAddress,
        abi: (await artifacts.readArtifact("BTitanNFT")).abi,
      },
      BTitanVestingVault: {
        address: vaultAddress,
        abi: (await artifacts.readArtifact("BTitanVestingVault")).abi,
      },
      BTitanDAO: {
        address: daoAddress,
        abi: (await artifacts.readArtifact("BTitanDAO")).abi,
      },
      BTitanMatrix: {
        address: matrixAddress,
        abi: (await artifacts.readArtifact("BTitanMatrix")).abi,
      },
    },
  };

  const outputPath = path.resolve(
    __dirname,
    "../../nextjs/contracts/deployedContracts.ts"
  );

  const fileContent = `/**
 * This file is auto-generated by packages/hardhat/scripts/deploy.ts
 * Do NOT edit manually — re-run yarn deploy to regenerate.
 * Last generated: ${new Date().toISOString()}
 * Network: ${networkName} (chainId: ${chainId})
 */
import type { GenericContractsDeclaration } from "../utils/scaffold-eth/contract";

const deployedContracts = ${JSON.stringify(deployedData, null, 2)} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, fileContent, "utf-8");

  console.log(`\n📄 deployedContracts.ts written to nextjs/contracts/`);

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log("\n════════════════════════════════════════════");
  console.log("   B-TITAN DEPLOYMENT COMPLETE ✅");
  console.log("════════════════════════════════════════════");
  console.log(`   Token:    ${tokenAddress}`);
  console.log(`   Registry: ${registryAddress}`);
  console.log(`   NFT:      ${nftAddress}`);
  console.log(`   Vault:    ${vaultAddress}`);
  console.log(`   DAO:      ${daoAddress}`);
  console.log(`   Matrix:   ${matrixAddress}`);
  console.log("════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
