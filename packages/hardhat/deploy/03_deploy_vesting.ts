import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("🔒 [03] Deploying BTitanVestingVault...");

  // Get the token address (MockToken on local, BTitanToken on testnet/mainnet)
  const isLocal = network.name === "hardhat" || network.name === "localhost";
  const tokenDeployment = await deployments.get(isLocal ? "MockToken" : "BTitanToken");

  const vault = await deploy("BTitanVestingVault", {
    from: deployer,
    args: [tokenDeployment.address],
    log: true,
    waitConfirmations: isLocal ? 1 : 3,
  });

  log(`✅ BTitanVestingVault deployed at: ${vault.address}`);
  log(`   Reward token: ${tokenDeployment.address}`);
};

func.tags = ["BTitanVestingVault", "all"];
func.id = "BTitanVestingVault";
func.dependencies = ["BTitanToken"];

export default func;
