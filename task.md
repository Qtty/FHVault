# FhVault

## Goals

### Main Goals

Each contract will be exclusively to owned by one user, and after finishing these main goals, we'll create a proxy
contract that acts as a gateway for users to create and get the contract addresses of their password manager.

1. User authenticates with his wallet -> constructor()

2. When authenticated, the user will be presented with: the list of his vaults, a middle screen and buttons on top to
   create items and vaults -> getVaults()

3. when a vault is selected, the items are enumerated in the middle screen -> getItemsOfVault()

4. when an item is selected:

   1. it's info are presented -> getItem()
   2. a button to reveal the password -> getPlainPassword()
   3. a button to delete the item -> deleteItem()
   4. a button to edit the informations -> setItem()
   5. a button to generate a new random password -> generateNewPassword() + setItem()

5. there'll be a back button to get back to the enumerated

6. When creating a new item: -> createItem()

   1. add a title (mandatory)
   2. add a description (optional)
   3. add a vault from the list of existing vaults(optional)
   4. add a password, or generate a random one (mandatory) -> generateNewPassword()

7. When creating a new vault: -> createVault()

   1. add a vault name (mandatory)

8. delete the password manager. -> selfdestruct()

### Future Goals

1. Each time a user connects for the first time, a new contract is created only for him
2. add username and domain, the extension will list the items of that domain when visiting it

## Technical Structure

- constructor(address \_admin):

  1. set an admin which is the user address
  2. this admin will be used in onlyAdmin modifier to maintain the exclusivity of the contract to the user
  3. all the functions will use the modifier onlyAdmin

- getVaults():

  1. returns the list of vaults

- getItemsOfVault(uint \_vault_id):

  1. grabs the list of item IDs that are present in the desired vault
  2. returns a list of item IDs and item titles by getting the title of the item based on it's item ID

- getItem(uint \_item_id):

  1. gets the Item using it's item_id and returns it to the user

- getPlainPassword(uint \_item_id, bytes32 publicKey, bytes calldata signature):

  1. uses onlySignedPublicKey(publicKey, signature) to verify that the user is really him
  2. reencrypts the password with the user public key and returns it

- deleteItem(uint \_item_id, uint \_vault_id):

  1. removes the item from the it's vault
  2. removes the item from the Items

- setItem(uint \_item_id, string \_title, string \_description, string \_vault, List[euint32] \_new_password):

  1. checks which attributes to be set, the others will be null (one or many of them)
  2. makes the appropriate checks for the attribute to be set: length of the title or description, and the existance of
     the vault, correctness of the euint32s.
  3. stores the changes in the item using it's item ID

- modifier \_item_exists(uint \_item_id):

  1. checks whether an item really exists, to be used in the functions that manipulate existing items

- generateNewPassword():

  1. uses TFHE.randomEuint32() to generate PASSWORD_LENGTH random values that will be used as the new password.
  2. PASSWORD_LENGTH will be a static attribute in the contract.
  3. returns List[euint32].

- createItem(string \_title, string \_description, uint \_vault_id, List[euint32] \_password):

  1. checks whether title is of the right length(a limit will be set in the contract), the title is mandatory.
  2. checks, if not empty, that the description is of the right length(a different limit will be set in the contract),
     the description is optional.
  3. checks, if not empty, that the vault ID truly exists in the vault list.
  4. if password is null, calls generateNewPassword() to generate a random new password.
  5. creates an Item object with these info and attribute an item ID to it.
  6. adds the item ID to the vault if a vault was given.
  7. returns the item ID

- createVault(string \_name):

  1. checks the length if the name.
  2. creates a new ID for the vault.
  3. maps the id to the name in the vault mapping
  4. returns the ID

- selfdestruct():

  1. destroys the contract.
  2. in the future, calls the proxy contract to delete the address of this contract.

## Notes

Item { title<string> description<string> (optional) vault<string> (optional) value<List[euint32]> }

- Check the case where an attacker grabs an encrypted value from the public storage, puts in his own smart contract and
  then decrypts it. OK

- Instead of having the vaults inside the contract as a struct, we'll have them be in the item as a string and the
  frontend will do the filtering using the string. This way we'll avoid having more gas poured into transactions.

- Login will be made with the user' wallet, he'll agree to use his wallet and then he'll be presented the dashboard,
  it'll contain:

  1. a topbar, where there'll be a create a new item button
  2. a sidebar where there' gonna be the vaults and the default vault where all the items are
  3. the main section in the middle where he'll be shown the items inside the vault 4. when he clicks on an item, he'll
     be presented with the info of that item and a button to get the value 5. That button will trigger a reencryption in
     the smart contract, and the decryption will happen on the client side 6. there' also an edit button to change the
     value of the password, or any other value about the item(title, description, vault)
  4. Password generator?
  5. Browser extension with auto-fill

- They're basically protecting using the ZK thing, so an attacker has to go through asEuintX to use a ciphertext that he
  got from the storage, but this ciphertext won't pass the ZK test to prove that the user knows the plaintext but what
  if we grab the ciphertext from the storage(it's a uint256) and inject it in the storage of our controlled smart
  contract as a EuintX, so we'll already have a euint8 in the memory and we'll inject our value there thus bypassing the
  ZK verification of asEuintX. OK

- The previous suggestion won't work due to FhEVM structure, the euints are only handlers, hashes to the actual
  ciphertexts, and these hashes are used to map the handles to the actual ciphertext, and the ciphertext are stored in a
  priviliged storage that the contract cannot access, only the EVM does.
