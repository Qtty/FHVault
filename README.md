# FHVault

<p align="center">
  <img src="./md_wallpaper.png" alt="Logo of FHVault"/>
</p>

## Introduction to the Project

FHVault is an innovative blockchain-based password manager designed for Ethereum, leveraging the security and
transparency of smart contracts to manage sensitive information. Our project aims to address the critical need for
privacy and security in the digital age, allowing users to securely store and manage their passwords and other sensitive
data on the Ethereum blockchain. By combining advanced encryption technologies with the immutable nature of blockchain,
FHVault offers a secure and private solution for digital asset management.

## Challenges in Implementing a Password Manager On-Chain

The primary challenge in developing an on-chain password manager like FHVault lies in ensuring the utmost security and
privacy for users' passwords and sensitive information. Traditional password managers rely on centralized databases,
posing risks of data breaches and unauthorized access. Moreover, directly storing sensitive data on the blockchain
raises concerns about privacy and data exposure, given the public nature of blockchain transactions. The key challenges
include:

- **Keeping the Password Safe**: Ensuring that passwords and sensitive data are securely encrypted and inaccessible to
  unauthorized parties.
- **Maintaining Privacy**: Protecting users' privacy by preventing the exposure of sensitive information on a public
  ledger.

## Leveraging Zama fhEVM to Solve These Challenges

To overcome these challenges, FHVault utilizes Zama's Fully Homomorphic Encryption Virtual Machine (fhEVM), Zama's fhEVM
represents a breakthrough for blockchain applications like FHVault, addressing the critical need for privacy and
security in handling sensitive data. fhEVM enables computations on encrypted data without decryption, ensuring data
privacy and security throughout the process. This innovative approach allows FHVault to offer unparalleled protection
for users' passwords and sensitive information on the Ethereum blockchain. Key benefits include:

- **Secure Data Operations**: Imagine a user updating their password within FHVault. Traditionally, this operation might
  require decrypting the stored password, updating it, and re-encrypting it, which could expose sensitive information at
  certain points. With fhEVM, the update operation can be performed on the encrypted password directly. The process
  ensures that the password, in its encrypted form, is never made vulnerable, even during updates, effectively closing a
  critical window for potential cyber attacks.

- **Scenario of Privacy Preservation**: Consider a situation where a user wants to verify their password against the
  stored one in FHVault to log into an application. Using fhEVM, this verification process occurs without ever
  decrypting the password. The comparison between the user's input and the stored password is conducted entirely on
  encrypted data, ensuring that the actual password contents remain hidden throughout, thereby preserving the user's
  privacy against both external threats and potential internal vulnerabilities.

- **Enhanced Security**: In the context of blockchain, where transaction details are transparent, a user's interaction
  with FHVault (e.g., retrieving a password for a site) could potentially reveal usage patterns or sensitive
  information. fhEVM counters this by enabling these interactions to happen in an encrypted manner. For instance, even
  if a hacker were monitoring transactions, they would only see encrypted data being processed, with no way to discern
  the nature of the user's action or the information being retrieved, significantly enhancing security against both
  direct and analytical attacks on user data.

## Key Features of FHVault

FHVault stands out as a revolutionary solution for secure and private data management on the Ethereum blockchain,
powered by Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM). Here are its key features:

- **End-to-End Encryption**: Utilizes advanced encryption to ensure that data is always secure, from the moment it's
  stored to every interaction it undergoes.

- **Privacy-Preserving Operations**: Offers the capability to perform operations on encrypted data, maintaining the
  confidentiality of user information even during computational processes.

- **Blockchain-Based Security**: Leverages the immutable and transparent nature of blockchain technology, enhancing the
  integrity and trustworthiness of data storage and management.

- **User-Centric Control**: Empowers users with full control over their data, enabling secure access and management of
  their passwords and sensitive information without relying on third-party services.

- **Interoperability**: FHVault's architecture is built to seamlessly integrate with existing Ethereum applications and
  services, fostering a more secure ecosystem across the decentralized web.

These features position FHVault not just as a password manager, but as a comprehensive platform for users and
organizations looking for a secure, private, and efficient way to manage sensitive data on the Ethereum blockchain.

## Quick Start and Installation

To begin using FHVault, follow these installation steps:

### Prerequisites

- Ensure you have Node.js installed on your system.
- An Ethereum wallet with some Ether for deploying contracts, if you plan to deploy to a live network.

## Installation

### Steps

1. **Clone the Repository**: Start by cloning the repository to your local machine.
   ```bash
   git clone https://github.com/Qtty/FHVault.git
   ```
2. **Install Dependencies**: Navigate to the cloned directory and install the required dependencies.
   ```bash
   pnpm install
   ```

For instructions on setting up the frontend, which includes details on how to interact with the game through a user
interface, please refer to the following link: [Frontend Documentation](https://github.com/Qtty/FHVault-frontend.git)

## Tests

To ensure the integrity of our game logic, comprehensive tests have been written. Follow these steps to run the tests:

1. Start a local Fhevm docker container:
   ```bash
   pnpm fhevm:start
   ```
2. Get some coins for the accounts:
   ```bash
   pnpm fhevm:faucet
   ```
3. Run the test suite:
   ```bash
   pnpm test
   ```

If you want to run the test on Zama devnet, run: npx hardhat test --network zama If you want to see the gas consumption,
add `REPORT_GAS=true`:

```bash
REPORT_GAS=true pnpm test
```

## Deploying the Smart Contract

### Deployment Instructions

Deploying the smart contract is a crucial step in setting up the backend for FHVault. We provide a streamlined process
to deploy the contract to both a local test network and the Zama network.

#### Local Network Deployment

1. **Deploy to Local Network**:
   - Use the command `pnpm deploy:PasswordManagerFactory` in your terminal.
   - This will deploy the smart contract to your local Ethereum network, suitable for development and testing purposes.

#### Deployment to Zama Network

1. **Deploy to Zama Network**:
   - To deploy the smart contract to the Zama network, append `--network zama` to the deployment command.
   - Run `pnpm deploy:PasswordManagerFactory --network zama` in your terminal.
   - This targets the Zama network for deployment, allowing the smart contract to interact with the Zama environment.

#### Note:

- Ensure you have the necessary configurations and network details set up for deploying to the Zama network.

_Following these steps will deploy your smart contract to the desired network, establishing the foundation for FHVault'
backend functionalities._
