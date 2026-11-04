const fs = require('fs');
const path = require('path');

['packages/hardhat/contracts/core/EquoraVault.sol', 'packages/hardhat/contracts-flattened/EquoraVault.sol'].forEach(relPath => {
  const filePath = path.resolve(relPath);
  let c = fs.readFileSync(filePath, 'utf8');

  // Add deployer state variable if not present
  if (!c.includes('address public deployer;')) {
    c = c.replace('address public matrixContract;', 'address public matrixContract;\n    address public deployer;');
  }

  // Set deployer in constructor
  if (!c.includes('deployer = msg.sender;')) {
    c = c.replace('registry     = IEquoraRegistry(_registry);', 'registry     = IEquoraRegistry(_registry);\n        deployer     = msg.sender;');
  }

  // Update setMatrixContract with deployer check
  const setMatrixRegex = /function\s+setMatrixContract\s*\(\s*address\s+_matrix\s*\)[\s\S]*?\{[\s\S]*?emit\s+MatrixContractSet\(_matrix\);\s*\}/;
  const newSetMatrix = `function setMatrixContract(address _matrix) external {
        if (deployer != address(0)) {
            require(msg.sender == deployer, "EquoraVault: Only deployer");
        }
        require(_matrix != address(0), "EquoraVault: Invalid matrix");
        matrixContract = _matrix;
        emit MatrixContractSet(_matrix);
    }`;

  c = c.replace(setMatrixRegex, newSetMatrix);
  fs.writeFileSync(filePath, c, 'utf8');
  console.log(`Updated EquoraVault in ${relPath}`);
});

