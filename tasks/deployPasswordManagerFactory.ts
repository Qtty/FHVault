import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:deployPasswordManagerFactory").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const passwordManager = await ethers.getContractFactory("PasswordManagerFactory");
  const PasswordManager = await passwordManager.connect(signers[0]).deploy(); // City of Zama's battle);
  await PasswordManager.waitForDeployment();
  console.log("PasswordManager deployed to: ", await PasswordManager.getAddress());
});
