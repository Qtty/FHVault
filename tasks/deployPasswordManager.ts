import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:deployPasswordManager").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const passwordManager = await ethers.getContractFactory("PasswordManager");
  const PasswordManager = await passwordManager
    .connect(signers[0])
    .deploy("0x6cd71702c094b72Ff4411819eD5ece90e71f2C40"); // City of Zama's battle);
  await PasswordManager.waitForDeployment();
  console.log("PasswordManager deployed to: ", await PasswordManager.getAddress());
});
