import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("🖼️ [02] Deploying BTitanNFT...");

  const nft = await deploy("BTitanNFT", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.name === "hardhat" ? 1 : 3,
  });

  log(`✅ BTitanNFT deployed at: ${nft.address}`);
};

func.tags = ["BTitanNFT", "all"];
func.id = "BTitanNFT";
func.dependencies = ["BTitanRegistry"];

export default func;
