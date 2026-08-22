import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("📋 [00] Deploying BTitanRegistry...");

  // The root address is the deployer (platform owner wallet) on local/testnet.
  // On mainnet, change this to the client's actual root wallet address.
  const rootAddress = deployer;

  const registry = await deploy("BTitanRegistry", {
    from: deployer,
    args: [rootAddress],
    log: true,
    waitConfirmations: network.name === "hardhat" ? 1 : 3,
  });

  log(`✅ BTitanRegistry deployed at: ${registry.address}`);
  log(`   Root address: ${rootAddress}`);
};

func.tags = ["BTitanRegistry", "all"];
func.id = "BTitanRegistry";

export default func;
