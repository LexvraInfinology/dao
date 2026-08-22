import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("🔢 [05] Deploying BTitanMatrix...");

  const isLocal = network.name === "hardhat" || network.name === "localhost";
  const tokenName = isLocal ? "MockToken" : "BTitanToken";

  const tokenDeployment = await deployments.get(tokenName);
  const registryDeployment = await deployments.get("BTitanRegistry");
  const nftDeployment = await deployments.get("BTitanNFT");
  const vestingDeployment = await deployments.get("BTitanVestingVault");

  const matrix = await deploy("BTitanMatrix", {
    from: deployer,
    args: [
      tokenDeployment.address,
      registryDeployment.address,
      nftDeployment.address,
      vestingDeployment.address,
    ],
    log: true,
    waitConfirmations: isLocal ? 1 : 3,
  });

  log(`✅ BTitanMatrix deployed at: ${matrix.address}`);

  // Authorize Matrix in Registry
  log("🔗 Authorizing Matrix in Registry...");
  const registry = await ethers.getContractAt("BTitanRegistry", registryDeployment.address);
  const daoDeployment = await deployments.get("BTitanDAO");
  await registry.setAuthorizedContracts(matrix.address, daoDeployment.address);

  // Authorize Matrix as NFT minter
  log("🔗 Authorizing Matrix as NFT minter...");
  const nft = await ethers.getContractAt("BTitanNFT", nftDeployment.address);
  await nft.setMinter(matrix.address, true);

  // Authorize Matrix in VestingVault
  log("🔗 Authorizing Matrix in VestingVault...");
  const vault = await ethers.getContractAt("BTitanVestingVault", vestingDeployment.address);
  await vault.setAuthorizedContracts(matrix.address, daoDeployment.address);

  // Print full deployment summary
  log("\n");
  log("════════════════════════════════════════════");
  log("   B-TITAN DEPLOYMENT COMPLETE ✅");
  log("════════════════════════════════════════════");
  log(`   Token:    ${tokenDeployment.address}`);
  log(`   Registry: ${registryDeployment.address}`);
  log(`   NFT:      ${nftDeployment.address}`);
  log(`   Vault:    ${vestingDeployment.address}`);
  log(`   DAO:      ${daoDeployment.address}`);
  log(`   Matrix:   ${matrix.address}`);
  log("════════════════════════════════════════════");
};

func.tags = ["BTitanMatrix", "all"];
func.id = "BTitanMatrix";
func.dependencies = ["BTitanDAO", "BTitanVestingVault", "BTitanNFT"];

export default func;
