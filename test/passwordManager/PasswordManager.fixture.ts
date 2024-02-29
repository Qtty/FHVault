import { ethers } from "hardhat";

import type { PasswordManager } from "../../types";
import { getSigners } from "../signers";

export async function deployManagerFixture(): Promise<PasswordManager> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("PasswordManager");
  const contract = await contractFactory.connect(signers.alice).deploy(signers.alice.address); // City of Zama's battle
  await contract.waitForDeployment();

  return contract;
}
