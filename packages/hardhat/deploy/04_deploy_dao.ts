import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("🏛️ [04] Deploying BTitanDAO...");

  const isLocal = network.name === "hardhat" || network.name === "localhost";
  const tokenName = isLocal ? "MockToken" : "BTitanToken";

  const tokenDeployment = await deployments.get(tokenName);
  const registryDeployment = await deployments.get("BTitanRegistry");
  const nftDeployment = await deployments.get("BTitanNFT");

  const dao = await deploy("BTitanDAO", {
    from: deployer,
    args: [
      tokenDeployment.address,
      registryDeployment.address,
      nftDeployment.address,
    ],
    log: true,
    waitConfirmations: isLocal ? 1 : 3,
  });

  log(`✅ BTitanDAO deployed at: ${dao.address}`);

  // Authorize DAO contract in Registry
  log("🔗 Authorizing DAO in Registry...");
  const registrySigner = await ethers.getContractAt("BTitanRegistry", registryDeployment.address);
  const matrixDeployment = await deployments.getOrNull("BTitanMatrix");
  await registrySigner.setAuthorizedContracts(
    matrixDeployment?.address || ethers.ZeroAddress,
    dao.address
  );

  // Authorize DAO in NFT contract
  log("🔗 Authorizing DAO as NFT minter...");
  const nftSigner = await ethers.getContractAt("BTitanNFT", nftDeployment.address);
  await nftSigner.setMinter(dao.address, true);

  log("✅ BTitanDAO fully configured.");
};

func.tags = ["BTitanDAO", "all"];
func.id = "BTitanDAO";
func.dependencies = ["BTitanRegistry", "BTitanToken", "BTitanNFT", "BTitanVestingVault"];

export default func;
