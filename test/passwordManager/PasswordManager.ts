import { expect } from "chai";
import { ethers } from "hardhat";

import { createInstances } from "../instance";
import { getSigners, initSigners } from "../signers";
import { createTransaction } from "../utils";
import { deployManagerFixture } from "./PasswordManager.fixture";

function str_to_int(str: String) {
  const hex = Buffer.from(str, "utf8").toString("hex");

  // Convert hex to BigInt
  const bigInt = BigInt("0x" + hex);

  return Number(bigInt);
}

function int_to_str(intValue: number) {
  // Convert the integer to a hex string
  let hex = intValue.toString(16);
  // Ensure hex string length is even for proper parsing
  if (hex.length % 2 !== 0) hex = "0" + hex;

  // Convert the hex string back to the original string
  return Buffer.from(hex, "hex").toString("utf8");
}

describe("PasswordManager", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();

    const contract = await deployManagerFixture();
    this.contractAddress = await contract.getAddress();
    this.manager = contract;
    this.instances = await createInstances(this.contractAddress, ethers, this.signers);
    this.manager.connect(this.signers.alice);
  });

  it("should create an item and verify its ID is 0", async function () {
    // Setup: Define item details
    const title = "First Item";
    const description = "This is a test item";
    const vaultId = 0; // Assuming 0 indicates no specific vault

    // Generate a password and split into four parts
    this.generatedPassword = "yellow submarine"; // Example generated password
    let password = [];
    for (let i = 0; i < this.generatedPassword.length; i += 4) {
      // Split the password into parts of four characters
      let part = this.generatedPassword.substring(i, i + 4);
      // Convert each part to an integer and apply encrypt32
      let encryptedPart = this.instances.alice.encrypt32(str_to_int(part)); // Assuming encrypt32 is an async function
      password.push(encryptedPart);
    }

    // Action: Create an item and capture the returned item ID

    const createTx = await createTransaction(this.manager.createItem, title, description, vaultId, password);
    const receipt = await createTx.wait();

    // Call getItemsOfVault to retrieve items for vaultId 0
    const [itemIds, titles] = await this.manager.getItemsOfVault(vaultId);

    // Verification: Check if the first item in the list has the correct title
    expect(itemIds.length).to.be.greaterThan(0, "No items found in the vault");
    expect(titles[0]).to.equal(title, "The first item's title does not match the created item");
  });

  it("should retrieve, decrypt, and convert a password into a string", async function () {
    // Assuming you have a function to add an item and it's been done
    // Also assuming publicKey and signature have been set up appropriately

    // Call getPlainPassword with a valid item ID, publicKey, and signature
    const itemId = 1; // Use the actual item ID you're testing with
    const tokenAlice = this.instances.alice.getPublicKey(this.contractAddress);
    const encryptedParts = await this.manager.getPlainPassword(itemId, tokenAlice.publicKey, tokenAlice.signature);

    // Decrypt and convert each part into a string
    let decryptedPassword = "";
    for (const part of encryptedParts) {
      // Mock decryption and conversion logic - replace with your actual functions
      const decryptedPart = this.instances.alice.decrypt(this.contractAddress, part); // Assuming mockDecrypt is your decryption function

      decryptedPassword += int_to_str(decryptedPart);
    }

    // Verification
    expect(decryptedPassword).to.equal(this.generatedPassword);
  });

  it("should create a vault and verify its presence by name", async function () {
    // Setup: Define vault details
    const vaultName = "My New Vault";

    // Action: Create a vault
    const tx = await createTransaction(this.manager.createVault, vaultName);
    await tx.wait();

    // Retrieve vaults to verify creation
    const [vaultIds, vaultNames] = await this.manager.getVaults();

    // Verification: Check if the newly created vault name is in the list of vault names
    expect(vaultNames).to.include(vaultName, "The newly created vault's name was not found in the list of vaults");
  });

  it("should correctly retrieve items from specific and default vaults", async function () {
    let password = [];
    for (let i = 0; i < this.generatedPassword.length; i += 4) {
      // Split the password into parts of four characters
      let part = this.generatedPassword.substring(i, i + 4);
      // Convert each part to an integer and apply encrypt32
      let encryptedPart = this.instances.alice.encrypt32(str_to_int(part)); // Assuming encrypt32 is an async function
      password.push(encryptedPart);
    }

    // Action: Create an item and capture the returned item ID

    const items = [
      { title: "Item 1", description: "Desc 1", vaultId: 0 },
      { title: "Item 2", description: "Desc 2", vaultId: 0 },
      { title: "Item 3", description: "Desc 3", vaultId: 1 },
      { title: "Item 4", description: "Desc 4", vaultId: 1 },
    ];

    // Create four random items, two of which will be in vault 1
    for (const { title, description, vaultId } of items) {
      const createTx = await createTransaction(this.manager.createItem, title, description, vaultId, password);
      await createTx.wait();
    }

    // Retrieve items from the default vault (All - vault_id 0)
    const [allIds, allTitles] = await this.manager.getItemsOfVault(0);
    // Check that all items are returned for the default vault
    expect(allIds.length).to.equal(5, "The default vault should contain all items");
    expect(allTitles).to.include("Item 1", "The default vault should contain Item 1");
    expect(allTitles).to.include("Item 2", "The default vault should contain Item 2");
    expect(allTitles).to.include("Item 3", "The default vault should contain Item 3");
    expect(allTitles).to.include("Item 4", "The default vault should contain Item 4");

    // Retrieve items from vault 1
    const [vault1Ids, vault1Titles] = await this.manager.getItemsOfVault(1);
    // Check that only the specified items are returned for vault 1
    expect(vault1Ids.length).to.equal(2, "Vault 1 should contain only two items");
    expect(vault1Titles).to.include("Item 3", "Vault 1 should contain Item 3");
    expect(vault1Titles).to.include("Item 4", "Vault 1 should contain Item 4");
  });

  it("should remove an item from its vault and verify non-existence with getItem", async function () {
    // "Item 4" has an itemId of 5 and is in vaultId 1
    const itemIdToDelete = 5n;
    const vaultId = 1;

    // Step 2: Delete the item
    const createTx = await createTransaction(this.manager.deleteItem, itemIdToDelete);
    await createTx.wait();

    // Step 3: Verify the item has been removed from its vault
    const [vaultItemIds, vaultItemTitles] = await this.manager.getItemsOfVault(vaultId);

    // Check that the itemIdToDelete is no longer present in the vault
    expect(vaultItemIds).to.not.include(itemIdToDelete, "The item was not properly removed from the vault");

    // Step 4: Attempt to retrieve the deleted item with getItem, expecting a revert
    try {
      await this.manager.getItem(itemIdToDelete);
      // If getItem does not revert, fail the test explicitly
      expect.fail("getItem should have reverted due to the item not existing, but it did not.");
    } catch (error) {
      // Check error message if specific revert message is known
      expect(error.message).to.include(
        "revert",
        "Expected getItem to revert due to non-existing item, but it did not.",
      );
    }
  });

  it("should reassign an item to a new vault and verify its presence", async function () {
    // Step 1: Create a new vault "My Second Vault" with ID expected to be 2
    var createTx = await createTransaction(this.manager.createVault, "My Second Vault");
    await createTx.wait();
    const newVaultId = 2; // Assuming vault IDs are assigned sequentially and this is the third vault created

    // Item details to be updated, assuming item ID 4 exists and is initially in vault 1
    const itemId = 4n;
    const newDescription = "new description"; // Assuming descriptions and passwords can be empty for this operation

    // Step 2: Change the vault of item ID 4 to the new vault (ID 2)
    createTx = await createTransaction(this.manager.setItem, itemId, "", newDescription, newVaultId, []);
    await createTx.wait();

    // Step 3: Verify the item is not present in the old vault (ID 1) anymore
    const [oldVaultItemIds] = await this.manager.getItemsOfVault(1);
    expect(oldVaultItemIds).to.not.include(itemId, "The item was still found in the old vault");

    // Step 4: Verify the item is now present in the new vault (ID 2)
    const [newVaultItemIds, newVaultItemTitles] = await this.manager.getItemsOfVault(newVaultId);
    expect(newVaultItemIds).to.include(itemId, "The item was not found in the new vault");

    // Step 5: Verify the item's description has been updated
    const itemDetails = await this.manager.getItem(itemId);
    expect(itemDetails.description).to.equal(newDescription, "The item's description was not updated correctly");
  });

  it("should change the password of an item", async function () {
    const itemId = 4n;
    const newPassword = "whitey submarine";
    let password = [];
    for (let i = 0; i < newPassword.length; i += 4) {
      // Split the password into parts of four characters
      let part = newPassword.substring(i, i + 4);
      // Convert each part to an integer and apply encrypt32
      let encryptedPart = this.instances.alice.encrypt32(str_to_int(part)); // Assuming encrypt32 is an async function
      password.push(encryptedPart);
    }

    const createTx = await createTransaction(this.manager.setItem, itemId, "", "", 0, password);
    await createTx.wait();

    // Call getPlainPassword with a valid item ID, publicKey, and signature
    const tokenAlice = this.instances.alice.getPublicKey(this.contractAddress);
    const encryptedParts = await this.manager.getPlainPassword(itemId, tokenAlice.publicKey, tokenAlice.signature);

    // Decrypt and convert each part into a string
    let decryptedPassword = "";
    for (const part of encryptedParts) {
      // Mock decryption and conversion logic - replace with your actual functions
      const decryptedPart = this.instances.alice.decrypt(this.contractAddress, part); // Assuming mockDecrypt is your decryption function

      decryptedPassword += int_to_str(decryptedPart);
    }

    // Verification
    expect(decryptedPassword).to.equal(newPassword);
  });
});
