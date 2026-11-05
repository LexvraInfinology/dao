const fs = require("fs");
const path = "packages/hardhat/contracts/core/EquoraMatrix.sol";
let code = fs.readFileSync(path, "utf8");

// 1. Update IEquoraVault interface
const targetInterface = `interface IEquoraVault {
    /// @dev Called by EquoraMatrix to route P4/P5/P14 funds into the 4 protocol pools.
    ///      Vault splits: 35% Ecosystem & DAO Pool | 40% Royalty Pool | 15% Level Rewards | 10% Magic Blind Box.
    function routePoolDeposit(uint256 amount) external payable;
}`;

const replacementInterface = `interface IEquoraVault {
    /// @dev Called by EquoraMatrix to route P4/P5/P14 funds into the 4 protocol pools.
    ///      Vault splits: 35% Ecosystem & DAO Pool | 40% Royalty Pool | 15% Level Rewards | 10% Magic Blind Box.
    function routePoolDeposit(uint256 amount) external payable;
    function addMagicBoxEligible(address user) external;
}`;

// 2. Add notification on slot 1
const targetJoin = `        // Welcome pass NFT on slot 1
        if (slot == 1 && address(nftContract) != address(0) && !nftContract.hasWelcomePass(msg.sender)) {
            try nftContract.mintWelcomePass(msg.sender) {} catch {}
        }`;

const replacementJoin = `        // Welcome pass NFT on slot 1
        if (slot == 1 && address(nftContract) != address(0) && !nftContract.hasWelcomePass(msg.sender)) {
            try nftContract.mintWelcomePass(msg.sender) {} catch {}
        }

        // Enroll new operative into Magic Blind Box on first slot activation
        if (slot == 1 && vaultContract != address(0)) {
            try IEquoraVault(vaultContract).addMagicBoxEligible(msg.sender) {} catch {}
        }`;

if (code.includes(targetInterface)) {
  code = code.replace(targetInterface, replacementInterface);
}
if (code.includes(targetJoin)) {
  code = code.replace(targetJoin, replacementJoin);
}

fs.writeFileSync(path, code, "utf8");
console.log("Successfully updated EquoraMatrix.sol with MagicBox registration hook!");

