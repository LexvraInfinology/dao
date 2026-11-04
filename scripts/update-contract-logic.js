const fs = require('fs');
const path = require('path');

// 1. Update EquoraVault.sol & flattened
['packages/hardhat/contracts/core/EquoraVault.sol', 'packages/hardhat/contracts-flattened/EquoraVault.sol'].forEach(relPath => {
  const filePath = path.resolve(relPath);
  let c = fs.readFileSync(filePath, 'utf8');

  const oldSetMatrixRegex = /function\s+setMatrixContract\s*\(\s*address\s+_matrix\s*\)\s*external\s*\{[\s\S]*?emit\s+MatrixContractSet\(_matrix\);\s*\}/;
  const newSetMatrix = `function setMatrixContract(address _matrix) external onlyOwner {
        require(_matrix != address(0), "EquoraVault: Invalid matrix");
        matrixContract = _matrix;
        emit MatrixContractSet(_matrix);
    }`;

  if (oldSetMatrixRegex.test(c)) {
    c = c.replace(oldSetMatrixRegex, newSetMatrix);
    console.log(`Updated setMatrixContract in ${relPath}`);
  }
  fs.writeFileSync(filePath, c, 'utf8');
});

// 2. Update EquoraMatrix.sol & flattened
['packages/hardhat/contracts/core/EquoraMatrix.sol', 'packages/hardhat/contracts-flattened/EquoraMatrix.sol'].forEach(relPath => {
  const filePath = path.resolve(relPath);
  let c = fs.readFileSync(filePath, 'utf8');

  // A. Seats 3, 6, 8, 9, 11, 12
  const oldSeatsRegex = /\/\/\s*Direct\s*Owner\s*Income\s*seats:[\s\S]*?if\s*\(\s*isMatrixQualified\s*\(\s*boardOwner\s*\)\s*\)\s*\{[\s\S]*?_creditOwner\s*\(\s*boardOwner\s*,\s*slot\s*,\s*cost\s*\);[\s\S]*?mSlot\.payoutTypes\[p\s*-\s*1\]\s*=\s*uint8\(PayoutType\.OWNER_DIRECT\);[\s\S]*?emit\s*DistributionExecuted\s*\(\s*boardOwner\s*,\s*cost\s*,\s*PayoutType\.OWNER_DIRECT\s*,\s*s\s*,\s*curCycle\s*,\s*p\s*\);\s*\}/;

  const newSeats = `// Direct Owner Income seats:
            // If boardOwner is the Root Address / Genesis Apex / Protocol Vault / Owner:
            // 100% routes directly to EquoraVault for the 4 Protocol Pools!
            if (
                boardOwner == rootOwner ||
                boardOwner == genesisRoot ||
                boardOwner == vaultContract ||
                boardOwner == owner() ||
                boardOwner == address(this)
            ) {
                _forwardToVault(boardOwner, cost);
                recipient = vaultContract;
                mSlot.payoutRecipients[p - 1] = vaultContract;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.PROTOCOL_POOL);
                emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, curCycle, p);
                emit ProtocolPoolFunded(boardOwner, cost, s, curCycle, p, block.timestamp);
            } else if (isMatrixQualified(boardOwner)) {
                _creditOwner(boardOwner, slot, cost);
                recipient = boardOwner;
                mSlot.payoutRecipients[p - 1] = boardOwner;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.OWNER_DIRECT);
                emit DistributionExecuted(boardOwner, cost, PayoutType.OWNER_DIRECT, s, curCycle, p);
            }`;

  if (oldSeatsRegex.test(c)) {
    c = c.replace(oldSeatsRegex, newSeats);
    console.log(`Updated seats 3..12 in ${relPath}`);
  }

  // B. _pushMatrixPayment
  const oldPushRegex = /\/\/\s*The\s*deployer\/owner\s*key\s*must\s*NEVER\s*act\s*as\s*a\s*payout\s*sink[\s\S]*?if\s*\(\s*recipient\s*==\s*owner\(\)\s*&&\s*vaultContract\s*!=\s*address\(0\)\s*\)\s*\{[\s\S]*?_forwardToVault\s*\(\s*recipient\s*,\s*amount\s*\);[\s\S]*?return;\s*\}/;

  const newPush = `address rootOwner = _getRootMatrixOwner();
        // The root address, genesis root, deployer/owner, or vault must NEVER hold payout in Matrix.
        // Forward 100% to EquoraVault for the 4 Protocol Pools!
        if (
            recipient == owner() ||
            recipient == genesisRoot ||
            recipient == rootOwner ||
            recipient == vaultContract ||
            recipient == address(this)
        ) {
            if (vaultContract != address(0)) {
                _forwardToVault(recipient, amount);
                return;
            }
        }`;

  if (oldPushRegex.test(c)) {
    c = c.replace(oldPushRegex, newPush);
    console.log(`Updated _pushMatrixPayment in ${relPath}`);
  }

  // C. _creditOwner
  const oldCreditRegex = /function\s+_creditOwner\s*\(\s*address\s+matrixOwner\s*,\s*uint256\s+slot\s*,\s*uint256\s+amount\s*\)\s*internal\s*\{[\s\S]*?userSlots\[matrixOwner\]\[slot\]\.totalEarned\s*\+=\s*amount;[\s\S]*?if\s*\(\s*matrixOwner\s*==\s*vaultContract\s*\|\|\s*matrixOwner\s*==\s*owner\(\)\s*\)\s*\{[\s\S]*?_forwardToVault\s*\(\s*matrixOwner\s*,\s*amount\s*\);[\s\S]*?\}\s*else\s*\{[\s\S]*?_pushMatrixPayment\s*\(\s*matrixOwner\s*,\s*amount\s*\);[\s\S]*?\}\s*\}/;

  const newCredit = `function _creditOwner(address matrixOwner, uint256 slot, uint256 amount) internal {
        userSlots[matrixOwner][slot].totalEarned += amount;
        address rootOwner = _getRootMatrixOwner();
        if (
            matrixOwner == vaultContract ||
            matrixOwner == owner() ||
            matrixOwner == genesisRoot ||
            matrixOwner == rootOwner ||
            matrixOwner == address(this)
        ) {
            _forwardToVault(matrixOwner, amount);
        } else {
            _pushMatrixPayment(matrixOwner, amount);
        }
    }`;

  if (oldCreditRegex.test(c)) {
    c = c.replace(oldCreditRegex, newCredit);
    console.log(`Updated _creditOwner in ${relPath}`);
  }

  // D. _forwardToVault
  const oldFwdRegex = /function\s+_forwardToVault\s*\(\s*address\s+matrixOwner\s*,\s*uint256\s+amount\s*\)\s*internal\s*\{[\s\S]*?if\s*\(\s*!ok\s*\)\s*\{[\s\S]*?_pushMatrixPayment\s*\(\s*matrixOwner\s*,\s*amount\s*\);[\s\S]*?\}\s*\}/;

  const newFwd = `function _forwardToVault(address matrixOwner, uint256 amount) internal {
        totalPoolForwarded += amount;

        if (vaultContract == address(0)) {
            _pushMatrixPayment(matrixOwner, amount);
            return;
        }

        bool ok = false;
        if (address(this).balance >= amount) {
            try IEquoraVault(vaultContract).routePoolDeposit{value: amount, gas: 3000000}(amount) {
                ok = true;
            } catch {
                (bool sent, ) = payable(vaultContract).call{value: amount, gas: 3000000}("");
                ok = sent;
            }
        }
        if (!ok && address(paymentToken) != address(0)) {
            try paymentToken.transfer(vaultContract, amount) returns (bool res) {
                ok = res;
                if (ok) {
                    try IEquoraVault(vaultContract).routePoolDeposit(amount) {} catch {}
                }
            } catch {}
        }

        require(ok, "EquoraMatrix: Vault deposit failed");
    }`;

  if (oldFwdRegex.test(c)) {
    c = c.replace(oldFwdRegex, newFwd);
    console.log(`Updated _forwardToVault in ${relPath}`);
  }

  fs.writeFileSync(filePath, c, 'utf8');
});

console.log('Contract updates complete!');
