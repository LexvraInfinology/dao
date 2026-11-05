const fs = require("fs");
const path = "packages/hardhat/contracts/core/EquoraVault.sol";
let code = fs.readFileSync(path, "utf8");

const target = `    function setMatrixContract(address _matrix) external {`;

const addition = `    /**
     * @dev Allows deployer to update pool contract addresses if needed.
     */
    function setPoolContracts(
        address _daoPool,
        address _salaryPool,
        address _magicBoxPool,
        address _rewardsPool
    ) external {
        if (deployer != address(0)) {
            require(msg.sender == deployer, "EquoraVault: Only deployer");
        }
        if (_daoPool != address(0)) daoPool = _daoPool;
        if (_salaryPool != address(0)) salaryPool = _salaryPool;
        if (_magicBoxPool != address(0)) magicBoxPool = _magicBoxPool;
        if (_rewardsPool != address(0)) rewardsPool = _rewardsPool;
        emit Initialized(daoPool, salaryPool, magicBoxPool, rewardsPool);
    }

    /**
     * @dev Called by EquoraMatrix upon Slot 1 join to register member in MagicBox.
     */
    function addMagicBoxEligible(address user) external {
        if (msg.sender == matrixContract || msg.sender == deployer) {
            try IEquoraMagicBox(magicBoxPool).addEligibleUser(user) {} catch {}
        }
    }

`;

if (!code.includes("setPoolContracts")) {
  code = code.replace(target, addition + target);
  fs.writeFileSync(path, code, "utf8");
  console.log("Successfully added setPoolContracts and addMagicBoxEligible to EquoraVault.sol");
} else {
  console.log("Already present");
}

