// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.20;

import "fhevm/abstracts/Reencrypt.sol";
import "fhevm/lib/TFHE.sol";

contract PasswordManager is Reencrypt {
    address public admin;
    uint256 public constant PASSWORD_LENGTH = 4; // Example length, adjust as needed
    uint256 public constant TITLE_LENGTH_LIMIT = 15;
    uint256 public constant DESCRIPTION_LENGTH_LIMIT = 25;

    struct Item {
        uint256 id;
        string title;
        string description;
        uint256 vault;
        // Assuming 'password' is a simplified representation
        euint32[] password;
    }

    // List of vault IDs
    uint256[] private vaultIds;

    // Mapping from vault ID to vault name
    mapping(uint256 => string) private vaultNames;

    // Mapping from vault ID to list of Item IDs
    mapping(uint256 => uint256[]) private vaults;

    // Mapping from item ID to Item
    mapping(uint256 => Item) private items;

    // Unique identifier for items
    uint256 private itemIdCounter = 1;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    modifier itemExists(uint256 _itemId) {
        // TODO: change from 0 to null and change itemIdCounter
        require(items[_itemId].id != 0, "Item does not exist");
        _;
    }

    constructor(address _admin) {
        admin = _admin;
        createVault("All");
    }

    // Add onlyAdmin again
    function createVault(string memory _name) public returns (uint256) {
        require(bytes(_name).length > 0, "Vault name cannot be empty");
        // Assuming vaultIdCounter is a contract-wide unique identifier for vaults
        uint256 newVaultId = vaultIds.length;
        vaultNames[newVaultId] = _name;
        vaultIds.push(newVaultId);
        return newVaultId;
    }

    function createItem(
        string memory _title,
        string memory _description,
        uint256 _vaultId,
        bytes[] calldata _password
    ) public onlyAdmin returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_title).length <= TITLE_LENGTH_LIMIT, "Title cannot exceed 15 characters");
        if (bytes(_description).length > 0) {
            require(bytes(_description).length <= DESCRIPTION_LENGTH_LIMIT, "Description cannot exceed 25 characters");
        }
        if (_vaultId != 0) {
            // Assuming 0 is not a valid vault ID and is used to indicate no vault
            require(vaultExists(_vaultId), "Vault ID is not valid");
        }

        euint32[] memory temp_passwd;
        if (_password.length == 0) {
            temp_passwd = generateNewPassword();
        } else {
            temp_passwd = new euint32[](_password.length);
            for (uint8 i = 0; i < _password.length; i++) {
                temp_passwd[i] = TFHE.asEuint32(_password[i]);
            }
        }

        // Create the item
        Item memory newItem = Item({
            id: itemIdCounter,
            title: _title,
            description: _description,
            vault: _vaultId, // Ensure your Item struct has a vault_id attribute
            password: temp_passwd
        });

        items[itemIdCounter] = newItem;
        if (_vaultId != 0) {
            vaults[_vaultId].push(itemIdCounter);
        }
        itemIdCounter++;
        return itemIdCounter - 1;
    }

    // Utility function to check if a vault exists
    function vaultExists(uint256 _vaultId) private view returns (bool) {
        for (uint256 i = 0; i < vaultIds.length; i++) {
            if (vaultIds[i] == _vaultId) {
                return true;
            }
        }
        return false;
    }

    function getVaults() public view onlyAdmin returns (uint256[] memory, string[] memory) {
        string[] memory names = new string[](vaultIds.length);
        for (uint i = 0; i < vaultIds.length; i++) {
            names[i] = vaultNames[vaultIds[i]];
        }
        return (vaultIds, names);
    }

    function getItemsOfVault(uint256 _vaultId) public view onlyAdmin returns (uint256[] memory, string[] memory) {
        if (_vaultId == 0) {
            // Handle the default vault case
            uint256 itemCount = itemIdCounter - 1; // Assuming itemIdCounter is incremented for each new item
            uint256[] memory ids = new uint256[](itemCount);
            string[] memory titles = new string[](itemCount);
            for (uint256 i = 1; i <= itemCount; i++) {
                if (items[i].id != 0) {
                    // Check if item exists
                    ids[i - 1] = items[i].id;
                    titles[i - 1] = items[i].title;
                }
            }
            return (ids, titles);
        } else {
            // Original logic for specific vaults
            uint256[] memory ids = vaults[_vaultId];
            string[] memory titles = new string[](ids.length);
            for (uint i = 0; i < ids.length; i++) {
                titles[i] = items[ids[i]].title;
            }
            return (ids, titles);
        }
    }

    function getItem(uint256 _itemId) public view onlyAdmin itemExists(_itemId) returns (Item memory) {
        return items[_itemId];
    }

    // Simplified version without encryption details
    function getPlainPassword(
        uint256 _itemId,
        bytes32 publicKey,
        bytes calldata signature
    ) public view onlyAdmin itemExists(_itemId) onlySignedPublicKey(publicKey, signature) returns (bytes[] memory) {
        Item storage item = items[_itemId];
        bytes[] memory reencryptedPassword = new bytes[](item.password.length);

        for (uint i = 0; i < item.password.length; i++) {
            // Re-encrypt each part of the password and store it in the array
            reencryptedPassword[i] = TFHE.reencrypt(item.password[i], publicKey);
        }

        return reencryptedPassword;
    }

    function deleteItem(uint256 _itemId) public onlyAdmin itemExists(_itemId) {
        // Retrieve the vault ID associated with this item
        uint256 vaultId = items[_itemId].vault;

        // Remove the item from its vault
        // Assuming vaults mapping is from vault ID to an array of item IDs
        uint256[] storage itemIds = vaults[vaultId];
        for (uint256 i = 0; i < itemIds.length; i++) {
            if (itemIds[i] == _itemId) {
                // Remove the item ID from the array by swapping it with the last element and then popping the array
                itemIds[i] = itemIds[itemIds.length - 1];
                itemIds.pop();
                break;
            }
        }

        // Remove the item from the items mapping
        delete items[_itemId];
    }

    function setItem(
        uint256 _itemId,
        string memory _title,
        string memory _description,
        uint256 _vaultId,
        bytes[] calldata _newPassword
    ) public onlyAdmin itemExists(_itemId) {
        Item storage item = items[_itemId];

        // Check and update the title if not empty and within length limit
        if (bytes(_title).length > 0 && bytes(_title).length <= TITLE_LENGTH_LIMIT) {
            item.title = _title;
        }

        // Check and update the description if not empty and within length limit
        if (bytes(_description).length > 0 && bytes(_description).length <= DESCRIPTION_LENGTH_LIMIT) {
            item.description = _description;
        }

        // Check and update the password if not empty
        if (_newPassword.length > 0) {
            euint32[] memory temp_passwd;
            temp_passwd = new euint32[](_newPassword.length);
            for (uint8 i = 0; i < _newPassword.length; i++) {
                temp_passwd[i] = TFHE.asEuint32(_newPassword[i]);
            }
            item.password = temp_passwd;
        }

        // Check and update the vault, ensuring to remove the item from the old vault if necessary
        if (_vaultId != 0 && vaultExists(_vaultId)) {
            // Remove item from the old vault if it's different
            if (item.vault != _vaultId) {
                removeItemFromVault(_itemId, item.vault);
                item.vault = _vaultId;
                vaults[_vaultId].push(_itemId);
            }
        }
    }

    // Utility function to remove an item from a specific vault
    function removeItemFromVault(uint256 _itemId, uint256 _vaultId) private {
        uint256[] storage itemsInVault = vaults[_vaultId];
        for (uint256 i = 0; i < itemsInVault.length; i++) {
            if (itemsInVault[i] == _itemId) {
                itemsInVault[i] = itemsInVault[itemsInVault.length - 1];
                itemsInVault.pop();
                break;
            }
        }
    }

    function generateNewPassword() public view onlyAdmin returns (euint32[] memory) {
        euint32[] memory newPassword = new euint32[](PASSWORD_LENGTH);
        for (uint i = 0; i < PASSWORD_LENGTH; i++) {
            newPassword[i] = TFHE.randEuint32();
        }
        return newPassword;
    }

    function destroy() public onlyAdmin {
        selfdestruct(payable(admin));
    }
}
