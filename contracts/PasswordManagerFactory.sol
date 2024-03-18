// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Assuming PasswordManager is defined elsewhere
import "./PasswordManager.sol";

contract PasswordManagerFactory {
    mapping(address => address) public userToPasswordManager;

    event PasswordManagerCreated(address indexed user, address passwordManagerAddress);

    // Function to create a PasswordManager instance for a user
    function createPasswordManager() external {
        require(userToPasswordManager[msg.sender] == address(0), "User already has a PasswordManager");

        PasswordManager passwordManager = new PasswordManager(msg.sender);
        userToPasswordManager[msg.sender] = address(passwordManager);

        emit PasswordManagerCreated(msg.sender, address(passwordManager));
    }

    // Updated function to check if the caller has a PasswordManager and return its address
    function hasPasswordManager() external view returns (address) {
        return userToPasswordManager[msg.sender];
    }
}
