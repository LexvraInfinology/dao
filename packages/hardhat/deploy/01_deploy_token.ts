import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("🪙 [01] Deploying BTitanToken...");

  // Treasury receives initial 10M BTT supply
  const treasury = deployer;

  // On localhost, deploy MockToken for easy testing
  if (network.name === "hardhat" || network.name === "localhost") {
    const mockToken = await deploy("MockToken", {
      from: deployer,
      args: [],
      log: true,
    });
    log(`✅ MockToken (local testing) deployed at: ${mockToken.address}`);
    return; // skip BTitanToken on local
  }

  const token = await deploy("BTitanToken", {
    from: deployer,
    args: [treasury],
    log: true,
    waitConfirmations: 3,
  });

  log(`✅ BTitanToken deployed at: ${token.address}`);
  log(`   Treasury: ${treasury}`);
  log(`   Initial supply: 10,000,000 BTT`);
};

func.tags = ["BTitanToken", "all"];
func.id = "BTitanToken";

export default func;
