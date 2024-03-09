import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = await deploy("PasswordManager", {
    from: deployer,
    args: ["0x6cd71702c094b72Ff4411819eD5ece90e71f2C40"],
    log: true,
  });

  console.log(`PasswordManager contract: `, deployed.address);
};
export default func;
func.id = "deploy_PasswordManager"; // id required to prevent reexecution
func.tags = ["PasswordManager"];
