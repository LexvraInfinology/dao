// Sources flattened with hardhat v2.29.1 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/interfaces/draft-IERC6093.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/draft-IERC6093.sol)
pragma solidity ^0.8.20;

/**
 * @dev Standard ERC20 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC20 tokens.
 */
interface IERC20Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC20InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC20InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `spender`’s `allowance`. Used in transfers.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     * @param allowance Amount of tokens a `spender` is allowed to operate with.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC20InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `spender` to be approved. Used in approvals.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC20InvalidSpender(address spender);
}

/**
 * @dev Standard ERC721 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC721 tokens.
 */
interface IERC721Errors {
    /**
     * @dev Indicates that an address can't be an owner. For example, `address(0)` is a forbidden owner in EIP-20.
     * Used in balance queries.
     * @param owner Address of the current owner of a token.
     */
    error ERC721InvalidOwner(address owner);

    /**
     * @dev Indicates a `tokenId` whose `owner` is the zero address.
     * @param tokenId Identifier number of a token.
     */
    error ERC721NonexistentToken(uint256 tokenId);

    /**
     * @dev Indicates an error related to the ownership over a particular token. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param tokenId Identifier number of a token.
     * @param owner Address of the current owner of a token.
     */
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC721InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC721InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param tokenId Identifier number of a token.
     */
    error ERC721InsufficientApproval(address operator, uint256 tokenId);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC721InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC721InvalidOperator(address operator);
}

/**
 * @dev Standard ERC1155 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC1155 tokens.
 */
interface IERC1155Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     * @param tokenId Identifier number of a token.
     */
    error ERC1155InsufficientBalance(address sender, uint256 balance, uint256 needed, uint256 tokenId);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC1155InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC1155InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param owner Address of the current owner of a token.
     */
    error ERC1155MissingApprovalForAll(address operator, address owner);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC1155InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC1155InvalidOperator(address operator);

    /**
     * @dev Indicates an array length mismatch between ids and values in a safeBatchTransferFrom operation.
     * Used in batch transfers.
     * @param idsLength Length of the array of token identifiers
     * @param valuesLength Length of the array of token amounts
     */
    error ERC1155InvalidArrayLength(uint256 idsLength, uint256 valuesLength);
}


// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/introspection/IERC165.sol)


/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File @openzeppelin/contracts/token/ERC721/IERC721.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/IERC721.sol)


/**
 * @dev Required interface of an ERC721 compliant contract.
 */
interface IERC721 is IERC165 {
    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
     *   a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must have been allowed to move this token by either {approve} or
     *   {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
     *   a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * WARNING: Note that the caller is responsible to confirm that the recipient is capable of receiving ERC721
     * or else they may be permanently lost. Usage of {safeTransferFrom} prevents loss, though the caller must
     * understand this adds an external call which potentially creates a reentrancy vulnerability.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address to, uint256 tokenId) external;

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the address zero.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool approved) external;

    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(uint256 tokenId) external view returns (address operator);

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}


// File @openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/extensions/IERC721Metadata.sol)


/**
 * @title ERC-721 Non-Fungible Token Standard, optional metadata extension
 * @dev See https://eips.ethereum.org/EIPS/eip-721
 */
interface IERC721Metadata is IERC721 {
    /**
     * @dev Returns the token collection name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the token collection symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);
}


// File @openzeppelin/contracts/token/ERC721/IERC721Receiver.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/IERC721Receiver.sol)


/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
interface IERC721Receiver {
    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be
     * reverted.
     *
     * The selector can be obtained in Solidity with `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}


// File @openzeppelin/contracts/utils/Context.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)


/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/utils/introspection/ERC165.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/introspection/ERC165.sol)


/**
 * @dev Implementation of the {IERC165} interface.
 *
 * Contracts that want to implement ERC165 should inherit from this contract and override {supportsInterface} to check
 * for the additional interface id that will be supported. For example:
 *
 * ```solidity
 * function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
 *     return interfaceId == type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
 * }
 * ```
 */
abstract contract ERC165 is IERC165 {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}


// File @openzeppelin/contracts/utils/math/Math.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/math/Math.sol)


/**
 * @dev Standard math utilities missing in the Solidity language.
 */
library Math {
    /**
     * @dev Muldiv operation overflow.
     */
    error MathOverflowedMulDiv();

    enum Rounding {
        Floor, // Toward negative infinity
        Ceil, // Toward positive infinity
        Trunc, // Toward zero
        Expand // Away from zero
    }

    /**
     * @dev Returns the addition of two unsigned integers, with an overflow flag.
     */
    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            uint256 c = a + b;
            if (c < a) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, with an overflow flag.
     */
    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b > a) return (false, 0);
            return (true, a - b);
        }
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, with an overflow flag.
     */
    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
            // benefit is lost if 'b' is also tested.
            // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
            if (a == 0) return (true, 0);
            uint256 c = a * b;
            if (c / a != b) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the division of two unsigned integers, with a division by zero flag.
     */
    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a / b);
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers, with a division by zero flag.
     */
    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a % b);
        }
    }

    /**
     * @dev Returns the largest of two numbers.
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two numbers.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two numbers. The result is rounded towards
     * zero.
     */
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b) / 2 can overflow.
        return (a & b) + (a ^ b) / 2;
    }

    /**
     * @dev Returns the ceiling of the division of two numbers.
     *
     * This differs from standard division with `/` in that it rounds towards infinity instead
     * of rounding towards zero.
     */
    function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        if (b == 0) {
            // Guarantee the same behavior as in a regular Solidity division.
            return a / b;
        }

        // (a + b - 1) / b can overflow on addition, so we distribute.
        return a == 0 ? 0 : (a - 1) / b + 1;
    }

    /**
     * @notice Calculates floor(x * y / denominator) with full precision. Throws if result overflows a uint256 or
     * denominator == 0.
     * @dev Original credit to Remco Bloemen under MIT license (https://xn--2-umb.com/21/muldiv) with further edits by
     * Uniswap Labs also under MIT license.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256 result) {
        unchecked {
            // 512-bit multiply [prod1 prod0] = x * y. Compute the product mod 2^256 and mod 2^256 - 1, then use
            // use the Chinese Remainder Theorem to reconstruct the 512 bit result. The result is stored in two 256
            // variables such that product = prod1 * 2^256 + prod0.
            uint256 prod0 = x * y; // Least significant 256 bits of the product
            uint256 prod1; // Most significant 256 bits of the product
            assembly {
                let mm := mulmod(x, y, not(0))
                prod1 := sub(sub(mm, prod0), lt(mm, prod0))
            }

            // Handle non-overflow cases, 256 by 256 division.
            if (prod1 == 0) {
                // Solidity will revert if denominator == 0, unlike the div opcode on its own.
                // The surrounding unchecked block does not change this fact.
                // See https://docs.soliditylang.org/en/latest/control-structures.html#checked-or-unchecked-arithmetic.
                return prod0 / denominator;
            }

            // Make sure the result is less than 2^256. Also prevents denominator == 0.
            if (denominator <= prod1) {
                revert MathOverflowedMulDiv();
            }

            ///////////////////////////////////////////////
            // 512 by 256 division.
            ///////////////////////////////////////////////

            // Make division exact by subtracting the remainder from [prod1 prod0].
            uint256 remainder;
            assembly {
                // Compute remainder using mulmod.
                remainder := mulmod(x, y, denominator)

                // Subtract 256 bit number from 512 bit number.
                prod1 := sub(prod1, gt(remainder, prod0))
                prod0 := sub(prod0, remainder)
            }

            // Factor powers of two out of denominator and compute largest power of two divisor of denominator.
            // Always >= 1. See https://cs.stackexchange.com/q/138556/92363.

            uint256 twos = denominator & (0 - denominator);
            assembly {
                // Divide denominator by twos.
                denominator := div(denominator, twos)

                // Divide [prod1 prod0] by twos.
                prod0 := div(prod0, twos)

                // Flip twos such that it is 2^256 / twos. If twos is zero, then it becomes one.
                twos := add(div(sub(0, twos), twos), 1)
            }

            // Shift in bits from prod1 into prod0.
            prod0 |= prod1 * twos;

            // Invert denominator mod 2^256. Now that denominator is an odd number, it has an inverse modulo 2^256 such
            // that denominator * inv = 1 mod 2^256. Compute the inverse by starting with a seed that is correct for
            // four bits. That is, denominator * inv = 1 mod 2^4.
            uint256 inverse = (3 * denominator) ^ 2;

            // Use the Newton-Raphson iteration to improve the precision. Thanks to Hensel's lifting lemma, this also
            // works in modular arithmetic, doubling the correct bits in each step.
            inverse *= 2 - denominator * inverse; // inverse mod 2^8
            inverse *= 2 - denominator * inverse; // inverse mod 2^16
            inverse *= 2 - denominator * inverse; // inverse mod 2^32
            inverse *= 2 - denominator * inverse; // inverse mod 2^64
            inverse *= 2 - denominator * inverse; // inverse mod 2^128
            inverse *= 2 - denominator * inverse; // inverse mod 2^256

            // Because the division is now exact we can divide by multiplying with the modular inverse of denominator.
            // This will give us the correct result modulo 2^256. Since the preconditions guarantee that the outcome is
            // less than 2^256, this is the final result. We don't need to compute the high bits of the result and prod1
            // is no longer required.
            result = prod0 * inverse;
            return result;
        }
    }

    /**
     * @notice Calculates x * y / denominator with full precision, following the selected rounding direction.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator, Rounding rounding) internal pure returns (uint256) {
        uint256 result = mulDiv(x, y, denominator);
        if (unsignedRoundsUp(rounding) && mulmod(x, y, denominator) > 0) {
            result += 1;
        }
        return result;
    }

    /**
     * @dev Returns the square root of a number. If the number is not a perfect square, the value is rounded
     * towards zero.
     *
     * Inspired by Henry S. Warren, Jr.'s "Hacker's Delight" (Chapter 11).
     */
    function sqrt(uint256 a) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        // For our first guess, we get the biggest power of 2 which is smaller than the square root of the target.
        //
        // We know that the "msb" (most significant bit) of our target number `a` is a power of 2 such that we have
        // `msb(a) <= a < 2*msb(a)`. This value can be written `msb(a)=2**k` with `k=log2(a)`.
        //
        // This can be rewritten `2**log2(a) <= a < 2**(log2(a) + 1)`
        // → `sqrt(2**k) <= sqrt(a) < sqrt(2**(k+1))`
        // → `2**(k/2) <= sqrt(a) < 2**((k+1)/2) <= 2**(k/2 + 1)`
        //
        // Consequently, `2**(log2(a) / 2)` is a good first approximation of `sqrt(a)` with at least 1 correct bit.
        uint256 result = 1 << (log2(a) >> 1);

        // At this point `result` is an estimation with one bit of precision. We know the true value is a uint128,
        // since it is the square root of a uint256. Newton's method converges quadratically (precision doubles at
        // every iteration). We thus need at most 7 iteration to turn our partial result with one bit of precision
        // into the expected uint128 result.
        unchecked {
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            return min(result, a / result);
        }
    }

    /**
     * @notice Calculates sqrt(a), following the selected rounding direction.
     */
    function sqrt(uint256 a, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = sqrt(a);
            return result + (unsignedRoundsUp(rounding) && result * result < a ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 2 of a positive value rounded towards zero.
     * Returns 0 if given 0.
     */
    function log2(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 128;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 64;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 32;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 16;
            }
            if (value >> 8 > 0) {
                value >>= 8;
                result += 8;
            }
            if (value >> 4 > 0) {
                value >>= 4;
                result += 4;
            }
            if (value >> 2 > 0) {
                value >>= 2;
                result += 2;
            }
            if (value >> 1 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 2, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log2(value);
            return result + (unsignedRoundsUp(rounding) && 1 << result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 10 of a positive value rounded towards zero.
     * Returns 0 if given 0.
     */
    function log10(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >= 10 ** 64) {
                value /= 10 ** 64;
                result += 64;
            }
            if (value >= 10 ** 32) {
                value /= 10 ** 32;
                result += 32;
            }
            if (value >= 10 ** 16) {
                value /= 10 ** 16;
                result += 16;
            }
            if (value >= 10 ** 8) {
                value /= 10 ** 8;
                result += 8;
            }
            if (value >= 10 ** 4) {
                value /= 10 ** 4;
                result += 4;
            }
            if (value >= 10 ** 2) {
                value /= 10 ** 2;
                result += 2;
            }
            if (value >= 10 ** 1) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 10, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log10(value);
            return result + (unsignedRoundsUp(rounding) && 10 ** result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 256 of a positive value rounded towards zero.
     * Returns 0 if given 0.
     *
     * Adding one to the result gives the number of pairs of hex symbols needed to represent `value` as a hex string.
     */
    function log256(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 16;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 8;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 4;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 2;
            }
            if (value >> 8 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 256, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log256(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log256(value);
            return result + (unsignedRoundsUp(rounding) && 1 << (result << 3) < value ? 1 : 0);
        }
    }

    /**
     * @dev Returns whether a provided rounding mode is considered rounding up for unsigned integers.
     */
    function unsignedRoundsUp(Rounding rounding) internal pure returns (bool) {
        return uint8(rounding) % 2 == 1;
    }
}


// File @openzeppelin/contracts/utils/math/SignedMath.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/math/SignedMath.sol)


/**
 * @dev Standard signed math utilities missing in the Solidity language.
 */
library SignedMath {
    /**
     * @dev Returns the largest of two signed numbers.
     */
    function max(int256 a, int256 b) internal pure returns (int256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two signed numbers.
     */
    function min(int256 a, int256 b) internal pure returns (int256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two signed numbers without overflow.
     * The result is rounded towards zero.
     */
    function average(int256 a, int256 b) internal pure returns (int256) {
        // Formula from the book "Hacker's Delight"
        int256 x = (a & b) + ((a ^ b) >> 1);
        return x + (int256(uint256(x) >> 255) & (a ^ b));
    }

    /**
     * @dev Returns the absolute unsigned value of a signed value.
     */
    function abs(int256 n) internal pure returns (uint256) {
        unchecked {
            // must be unchecked in order to support `n = type(int256).min`
            return uint256(n >= 0 ? n : -n);
        }
    }
}


// File @openzeppelin/contracts/utils/Strings.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/Strings.sol)



/**
 * @dev String operations.
 */
library Strings {
    bytes16 private constant HEX_DIGITS = "0123456789abcdef";
    uint8 private constant ADDRESS_LENGTH = 20;

    /**
     * @dev The `value` string doesn't fit in the specified `length`.
     */
    error StringsInsufficientHexLength(uint256 value, uint256 length);

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        unchecked {
            uint256 length = Math.log10(value) + 1;
            string memory buffer = new string(length);
            uint256 ptr;
            /// @solidity memory-safe-assembly
            assembly {
                ptr := add(buffer, add(32, length))
            }
            while (true) {
                ptr--;
                /// @solidity memory-safe-assembly
                assembly {
                    mstore8(ptr, byte(mod(value, 10), HEX_DIGITS))
                }
                value /= 10;
                if (value == 0) break;
            }
            return buffer;
        }
    }

    /**
     * @dev Converts a `int256` to its ASCII `string` decimal representation.
     */
    function toStringSigned(int256 value) internal pure returns (string memory) {
        return string.concat(value < 0 ? "-" : "", toString(SignedMath.abs(value)));
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        unchecked {
            return toHexString(value, Math.log256(value) + 1);
        }
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        uint256 localValue = value;
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = HEX_DIGITS[localValue & 0xf];
            localValue >>= 4;
        }
        if (localValue != 0) {
            revert StringsInsufficientHexLength(value, length);
        }
        return string(buffer);
    }

    /**
     * @dev Converts an `address` with fixed length of 20 bytes to its not checksummed ASCII `string` hexadecimal
     * representation.
     */
    function toHexString(address addr) internal pure returns (string memory) {
        return toHexString(uint256(uint160(addr)), ADDRESS_LENGTH);
    }

    /**
     * @dev Returns true if the two strings are equal.
     */
    function equal(string memory a, string memory b) internal pure returns (bool) {
        return bytes(a).length == bytes(b).length && keccak256(bytes(a)) == keccak256(bytes(b));
    }
}


// File @openzeppelin/contracts/token/ERC721/ERC721.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/ERC721.sol)








/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
 * the Metadata extension, but not including the Enumerable extension, which is available separately as
 * {ERC721Enumerable}.
 */
abstract contract ERC721 is Context, ERC165, IERC721, IERC721Metadata, IERC721Errors {
    using Strings for uint256;

    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    mapping(uint256 tokenId => address) private _owners;

    mapping(address owner => uint256) private _balances;

    mapping(uint256 tokenId => address) private _tokenApprovals;

    mapping(address owner => mapping(address operator => bool)) private _operatorApprovals;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner) public view virtual returns (uint256) {
        if (owner == address(0)) {
            revert ERC721InvalidOwner(address(0));
        }
        return _balances[owner];
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual returns (address) {
        return _requireOwned(tokenId);
    }

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        _requireOwned(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string.concat(baseURI, tokenId.toString()) : "";
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return "";
    }

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual {
        _approve(to, tokenId, _msgSender());
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view virtual returns (address) {
        _requireOwned(tokenId);

        return _getApproved(tokenId);
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator) public view virtual returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        // Setting an "auth" arguments enables the `_isAuthorized` check which verifies that the token exists
        // (from != 0). Therefore, it is not needed to verify that the return value is not 0 here.
        address previousOwner = _update(to, tokenId, _msgSender());
        if (previousOwner != from) {
            revert ERC721IncorrectOwner(from, tokenId, previousOwner);
        }
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual {
        transferFrom(from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, data);
    }

    /**
     * @dev Returns the owner of the `tokenId`. Does NOT revert if token doesn't exist
     *
     * IMPORTANT: Any overrides to this function that add ownership of tokens not tracked by the
     * core ERC721 logic MUST be matched with the use of {_increaseBalance} to keep balances
     * consistent with ownership. The invariant to preserve is that for any address `a` the value returned by
     * `balanceOf(a)` must be equal to the number of tokens such that `_ownerOf(tokenId)` is `a`.
     */
    function _ownerOf(uint256 tokenId) internal view virtual returns (address) {
        return _owners[tokenId];
    }

    /**
     * @dev Returns the approved address for `tokenId`. Returns 0 if `tokenId` is not minted.
     */
    function _getApproved(uint256 tokenId) internal view virtual returns (address) {
        return _tokenApprovals[tokenId];
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `owner`'s tokens, or `tokenId` in
     * particular (ignoring whether it is owned by `owner`).
     *
     * WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
     * assumption.
     */
    function _isAuthorized(address owner, address spender, uint256 tokenId) internal view virtual returns (bool) {
        return
            spender != address(0) &&
            (owner == spender || isApprovedForAll(owner, spender) || _getApproved(tokenId) == spender);
    }

    /**
     * @dev Checks if `spender` can operate on `tokenId`, assuming the provided `owner` is the actual owner.
     * Reverts if `spender` does not have approval from the provided `owner` for the given token or for all its assets
     * the `spender` for the specific `tokenId`.
     *
     * WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
     * assumption.
     */
    function _checkAuthorized(address owner, address spender, uint256 tokenId) internal view virtual {
        if (!_isAuthorized(owner, spender, tokenId)) {
            if (owner == address(0)) {
                revert ERC721NonexistentToken(tokenId);
            } else {
                revert ERC721InsufficientApproval(spender, tokenId);
            }
        }
    }

    /**
     * @dev Unsafe write access to the balances, used by extensions that "mint" tokens using an {ownerOf} override.
     *
     * NOTE: the value is limited to type(uint128).max. This protect against _balance overflow. It is unrealistic that
     * a uint256 would ever overflow from increments when these increments are bounded to uint128 values.
     *
     * WARNING: Increasing an account's balance using this function tends to be paired with an override of the
     * {_ownerOf} function to resolve the ownership of the corresponding tokens so that balances and ownership
     * remain consistent with one another.
     */
    function _increaseBalance(address account, uint128 value) internal virtual {
        unchecked {
            _balances[account] += value;
        }
    }

    /**
     * @dev Transfers `tokenId` from its current owner to `to`, or alternatively mints (or burns) if the current owner
     * (or `to`) is the zero address. Returns the owner of the `tokenId` before the update.
     *
     * The `auth` argument is optional. If the value passed is non 0, then this function will check that
     * `auth` is either the owner of the token, or approved to operate on the token (by the owner).
     *
     * Emits a {Transfer} event.
     *
     * NOTE: If overriding this function in a way that tracks balances, see also {_increaseBalance}.
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual returns (address) {
        address from = _ownerOf(tokenId);

        // Perform (optional) operator check
        if (auth != address(0)) {
            _checkAuthorized(from, auth, tokenId);
        }

        // Execute the update
        if (from != address(0)) {
            // Clear approval. No need to re-authorize or emit the Approval event
            _approve(address(0), tokenId, address(0), false);

            unchecked {
                _balances[from] -= 1;
            }
        }

        if (to != address(0)) {
            unchecked {
                _balances[to] += 1;
            }
        }

        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);

        return from;
    }

    /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner != address(0)) {
            revert ERC721InvalidSender(address(0));
        }
    }

    /**
     * @dev Mints `tokenId`, transfers it to `to` and checks for `to` acceptance.
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeMint(address to, uint256 tokenId) internal {
        _safeMint(to, tokenId, "");
    }

    /**
     * @dev Same as {xref-ERC721-_safeMint-address-uint256-}[`_safeMint`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeMint(address to, uint256 tokenId, bytes memory data) internal virtual {
        _mint(to, tokenId);
        _checkOnERC721Received(address(0), to, tokenId, data);
    }

    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     * This is an internal function that does not check if the sender is authorized to operate on the token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function _burn(uint256 tokenId) internal {
        address previousOwner = _update(address(0), tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(address from, address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        } else if (previousOwner != from) {
            revert ERC721IncorrectOwner(from, tokenId, previousOwner);
        }
    }

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking that contract recipients
     * are aware of the ERC721 standard to prevent tokens from being forever locked.
     *
     * `data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is like {safeTransferFrom} in the sense that it invokes
     * {IERC721Receiver-onERC721Received} on the receiver, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `tokenId` token must exist and be owned by `from`.
     * - `to` cannot be the zero address.
     * - `from` cannot be the zero address.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeTransfer(address from, address to, uint256 tokenId) internal {
        _safeTransfer(from, to, tokenId, "");
    }

    /**
     * @dev Same as {xref-ERC721-_safeTransfer-address-address-uint256-}[`_safeTransfer`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal virtual {
        _transfer(from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, data);
    }

    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * The `auth` argument is optional. If the value passed is non 0, then this function will check that `auth` is
     * either the owner of the token, or approved to operate on all tokens held by this owner.
     *
     * Emits an {Approval} event.
     *
     * Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument.
     */
    function _approve(address to, uint256 tokenId, address auth) internal {
        _approve(to, tokenId, auth, true);
    }

    /**
     * @dev Variant of `_approve` with an optional flag to enable or disable the {Approval} event. The event is not
     * emitted in the context of transfers.
     */
    function _approve(address to, uint256 tokenId, address auth, bool emitEvent) internal virtual {
        // Avoid reading the owner unless necessary
        if (emitEvent || auth != address(0)) {
            address owner = _requireOwned(tokenId);

            // We do not use _isAuthorized because single-token approvals should not be able to call approve
            if (auth != address(0) && owner != auth && !isApprovedForAll(owner, auth)) {
                revert ERC721InvalidApprover(auth);
            }

            if (emitEvent) {
                emit Approval(owner, to, tokenId);
            }
        }

        _tokenApprovals[tokenId] = to;
    }

    /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Requirements:
     * - operator can't be the address zero.
     *
     * Emits an {ApprovalForAll} event.
     */
    function _setApprovalForAll(address owner, address operator, bool approved) internal virtual {
        if (operator == address(0)) {
            revert ERC721InvalidOperator(operator);
        }
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    /**
     * @dev Reverts if the `tokenId` doesn't have a current owner (it hasn't been minted, or it has been burned).
     * Returns the owner.
     *
     * Overrides to ownership logic should be done to {_ownerOf}.
     */
    function _requireOwned(uint256 tokenId) internal view returns (address) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
        return owner;
    }

    /**
     * @dev Private function to invoke {IERC721Receiver-onERC721Received} on a target address. This will revert if the
     * recipient doesn't accept the token transfer. The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param data bytes optional data to send along with the call
     */
    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) private {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, data) returns (bytes4 retval) {
                if (retval != IERC721Receiver.onERC721Received.selector) {
                    revert ERC721InvalidReceiver(to);
                }
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert ERC721InvalidReceiver(to);
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        }
    }
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)


/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/ReentrancyGuard.sol)


/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/core/EquoraDAOMembership.sol

// Original license: SPDX_License_Identifier: MIT

/**
 * @title EquoraDAOMembership
 * @dev Soulbound (Non-Transferable) ERC-721 representing Genesis DAO Membership.
 *
 * Requirements:
 *   - Exactly 100 tokens can ever exist (Token IDs 1 to 100).
 *   - Only the immutable EquoraDAO contract can mint tokens.
 *   - Tokens are soulbound: transfers between wallets revert automatically.
 *   - Each token ID directly corresponds to the member's queue position (1 to 100).
 */
contract EquoraDAOMembership is ERC721 {
    address public immutable daoContract;
    uint256 public constant MAX_SUPPLY = 100;
    uint256 public totalSupply;

    // Token ID => Queue Position (1 to 100)
    mapping(uint256 => uint256) public tokenPosition;
    // Wallet => Owned Token ID (0 if none)
    mapping(address => uint256) public memberTokenId;

    event MembershipMinted(address indexed member, uint256 indexed tokenId, uint256 position);

    error OnlyDAO();
    error SoulboundTransferBlocked();
    error MaxSupplyExceeded();
    error AlreadyMember();
    error NotMember();

    bool private _reassigning;

    modifier onlyDAO() {
        if (msg.sender != daoContract) revert OnlyDAO();
        _;
    }

    constructor(address _daoContract) ERC721("Equora Genesis DAO Membership", "EQR-DAO") {
        require(_daoContract != address(0), "Invalid DAO address");
        daoContract = _daoContract;
    }

    /**
     * @dev Mint a soulbound membership token to a new DAO member.
     * @param to Wallet address of the member
     * @param position 1-indexed queue position (1 to 100)
     * @return tokenId The minted token ID (same as position)
     */
    function mint(address to, uint256 position) external onlyDAO returns (uint256 tokenId) {
        if (position < 1 || position > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (memberTokenId[to] != 0) revert AlreadyMember();

        tokenId = position;
        tokenPosition[tokenId] = position;
        memberTokenId[to] = tokenId;
        totalSupply += 1;

        _safeMint(to, tokenId);
        emit MembershipMinted(to, tokenId, position);
    }

    /**
     * @dev Reassign an existing seat NFT when an expired member forfeits their seat after missing the 48h retopup window.
     *      Can ONLY be called by the immutable EquoraDAO contract during vacant seat takeover.
     * @param from Previous defaulted member address
     * @param to New incoming member address
     * @param position Seat number being taken over (1 to 100)
     * @return tokenId The reassigned token ID
     */
    function reassignSeat(address from, address to, uint256 position) external onlyDAO returns (uint256 tokenId) {
        if (position < 1 || position > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (memberTokenId[to] != 0) revert AlreadyMember();
        if (memberTokenId[from] != position) revert NotMember();

        tokenId = position;
        tokenPosition[tokenId] = position;
        memberTokenId[from] = 0;
        memberTokenId[to] = tokenId;

        _reassigning = true;
        _transfer(from, to, tokenId);
        _reassigning = false;

        emit MembershipMinted(to, tokenId, position);
    }

    /**
     * @dev Enforce soulbound property in OpenZeppelin ERC721 v5.
     *      Allows minting (from == address(0)) and DAO reassignments, but blocks peer-to-peer transfers.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // If from is not address(0), block transfers unless it is an authorized DAO seat reassignment
        if (from != address(0) && !_reassigning) {
            revert SoulboundTransferBlocked();
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Check if an address holds a DAO membership.
     */
    function isMember(address wallet) external view returns (bool) {
        return memberTokenId[wallet] != 0;
    }

    /**
     * @dev Get the seat position for a wallet.
     */
    function getPosition(address wallet) external view returns (uint256) {
        return tokenPosition[memberTokenId[wallet]];
    }
}


// File contracts/interfaces/IEquoraRegistry.sol

// Original license: SPDX_License_Identifier: MIT

/**
 * @title IEquoraRegistry
 * @dev Interface for the Equora.Fi user registry, referral tracking, and 5-digit referral code system
 */
interface IEquoraRegistry {
    function registerUser(address user, uint32 sponsorCode) external returns (bool);
    function registerUser(address user, address sponsor) external returns (bool);
    function isRegistered(address user) external view returns (bool);
    function getSponsor(address user) external view returns (address);
    function getDirectReferrals(address user) external view returns (address[] memory);
    function getDirectReferralsCount(address user) external view returns (uint256);
    function isQualified(address user) external view returns (bool);
    function getRoot() external view returns (address);

    // 5-digit referral code system
    function getUserByCode(uint32 code) external view returns (address);
    function getCodeByUser(address user) external view returns (uint32);
    function getUserId(address user) external view returns (uint256);
}


// File contracts/core/EquoraDAO.sol

// Original license: SPDX_License_Identifier: MIT




/**
 * @title EquoraDAO
 * @dev Genesis DAO — 100-seat founding council on the Equora.Fi platform.
 *
 * === ECONOMIC MODEL (USD-PEGGED) =============================================
 *   Entry Fee: $300 USD worth of TROB tokens per seat.
 *   Max Members: 100 (hard cap, immutable)
 *
 *   The `entryFee` state variable is set in TROB token units (18 decimals)
 *   equivalent to $300 USD at the current live TROB market price.
 *   Admin can call `setEntryFee()` to sync with the live price oracle.
 *
 *   When member N joins (Position 1 to 100):
 *     Their entry fee (in TROB) is split equally among all N active members:
 *       Share per member = entryFee / N
 *     - Member 1 receives entryFee / 1 instant cashback (100% refund).
 *     - Member 2 receives entryFee / 2 instant cashback, and Member 1 receives the same.
 *     - Member 100 receives entryFee / 100, and all 100 members each receive the same.
 *     Total Payout = entryFee (100% peer distribution, zero platform fees).
 *
 * === 5X EARNINGS CAP + 48-HOUR RE-TOPUP =====================================
 *   - Each member can earn a maximum of 5× their deposit = $1,500 USD in TROB.
 *   - earningsCap = entryFee × 5. Updated automatically when setEntryFee() is called.
 *   - When a member's lifetime earnings (in TROB) hit earningsCap, their slot is capped.
 *   - They have 48 hours to call retopup() and pay entryFee TROB again.
 *   - If they miss the window, their slot is BLANKED (permanently skipped in
 *     future distributions) until they retopup.
 *   - Retopup resets their lifetime earnings counter.
 *
 * === SEAT EXPIRY WINDOW ======================================================
 *   - Each seat must be filled within 21 days of the previous seat being filled.
 *   - If 21 days pass with no new join, the DAO queue expires permanently.
 *
 * === ELIGIBILITY =============================================================
 *   - Open to any participant (0 referrals required, no sponsor/referral ID needed)
 *
 * === PRESERVED ===============================================================
 *   - Soulbound ERC-721 per seat (EquoraDAOMembership NFT)
 *   - Instant push distribution to all prior members
 *   - Anti-griefing: failed push → pullFallbackBalance for manual claim
 *   - Zero platform fees: 100% of entry flows to members
 *
 * === PRICE ORACLE NOTE =======================================================
 *   The `entryFeeUsd` is stored as the fixed USD peg ($300 with 6 decimals = 300_000_000).
 *   The `entryFee` (in TROB 18-decimal tokens) must be updated via `setEntryFee()`
 *   whenever the live TROB/USD price changes significantly. The deployer (admin)
 *   address is stored for this purpose.
 *
 * === NULL KEY =================================================================
 *   Beyond setEntryFee(), this contract has no privileged admin functions.
 *   setEntryFee can be called by the deployer or a future price-keeper bot.
 */
contract EquoraDAO is ReentrancyGuard {

    // ─── Constants ─────────────────────────────────────────────────────────────

    /// @dev USD peg for entry fee: $300.00 (6 decimal places, i.e. 300_000_000 = $300)
    uint256 public constant ENTRY_FEE_USD          = 300_000_000; // $300 USD (6 decimals)
    /// @dev USD peg for earnings cap: $1,500.00 (6 decimal places)
    uint256 public constant EARNINGS_CAP_USD       = 1_500_000_000; // $1,500 USD (6 decimals)

    uint256 public constant MAX_MEMBERS            = 100;
    uint256 public constant SEAT_WINDOW            = 21 days;
    uint256 public constant RETOPUP_WINDOW         = 48 hours;

    /// @dev Official Super Representative (SR) address for Equora_Fi protocol governance
    string public constant OFFICIAL_SR_BASE58      = "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
    /// @dev Minimum creation timestamp for eligible deposit wallets: 1 October 2026 00:00:00 UTC
    uint256 public constant MIN_WALLET_CREATION_DATE = 1790812800;
    /// @dev Target daily free transactions for DAO members (Formula: 50 TX/day)
    uint256 public constant DAO_TARGET_FREE_TX_PER_DAY = 50;
    /// @dev Target daily free transactions for Matrix members (Formula: 5 TX/day)
    uint256 public constant MATRIX_TARGET_FREE_TX_PER_DAY = 5;

    // ─── Admin ─────────────────────────────────────────────────────────────────

    /// @dev Deployer address — can update entryFee to match live USD peg
    address public immutable admin;

    // ─── Immutable Dependencies ────────────────────────────────────────────────

    IERC20              public immutable paymentToken;
    EquoraDAOMembership public immutable membershipNFT;
    IEquoraRegistry     public immutable registry;

    // ─── Dynamic Price State ───────────────────────────────────────────────────

    /// @dev Current entry fee in TROB tokens (6 decimals for native TROB sun). Equivalent to $300 USD.
    ///      Default: 5460 * 10**6 (at $0.054945/TROB; update via setEntryFee)
    uint256 public entryFee    = 5460 * 10 ** 6;

    /// @dev Current earnings cap in TROB tokens (6 decimals). Always = entryFee × 5 = $1,500 USD (27,300 TROB).
    uint256 public earningsCap = 27300 * 10 ** 6;

    /// @dev Last TROB price used (in USD with 6 decimals, e.g. 0.055 TROB/USD = 55_000)
    uint256 public lastTrobPriceUsd6;

    /// @dev Timestamp when entryFee was last updated
    uint256 public lastPriceUpdateTimestamp;

    // ─── Configured Contracts ──────────────────────────────────────────────────

    address public vaultContract;

    // ─── State Variables ───────────────────────────────────────────────────────

    address[] public daoMembers;
    mapping(address => bool)    public isDaoMember;
    mapping(address => uint256) public memberPosition;
    mapping(address => uint256) public pullFallbackBalance;

    // DAO Plan Share Benefit (35% Matrix Volume Pool)
    uint256 public accPoolSharePerMember; // scaled by 1e18
    uint256 public totalPoolReceived;      // total 35% matrix volume received
    uint256 public totalPoolDistributed;   // total pool share claimed by members
    mapping(address => uint256) public memberRewardDebt;
    mapping(address => uint256) public pendingPoolShare;

    // Earnings tracking
    mapping(address => uint256) public lifetimeEarnings;  // total TROB received from DAO distributions
    mapping(address => uint256) public capHitTimestamp;   // when 5X cap was reached (0 = not capped)
    mapping(address => bool)    public slotBlank;         // true = slot expired, skip in distributions

    // Deposit eligibility attestation (Condition 1 + Condition 2 + Community Verification)
    mapping(address => bool)    public isEligibilityAttested;
    bool                        public eligibilityEnforced;

    bool    public daoCompleted;
    bool    public daoExpired;
    uint256 public totalCollected;
    uint256 public totalDistributed;
    uint256 public lastJoinTimestamp;
    uint256 public daoLaunchTimestamp;

    // ─── Custom Errors ─────────────────────────────────────────────────────────

    error QueueFull();
    error QueueExpired();
    error AlreadyMember();
    error NotQualified();
    error PaymentFailed();
    error NotMember();
    error NothingToClaim();
    error TransferFailed();
    error NotCapped();
    error RetopupWindowExpired();
    error SlotNotBlank();
    error Unauthorized();

    // ─── Events ────────────────────────────────────────────────────────────────

    event VaultContractSet(address indexed vault);
    event DAOPositionJoined(
        address indexed user,
        uint256 indexed position,
        uint256 tokenId,
        uint256 timestamp
    );
    event DAOPayoutPushed(
        address indexed recipient,
        uint256 amount,
        uint256 fromPosition,
        uint256 timestamp
    );
    event DAOPayoutFallback(
        address indexed recipient,
        uint256 amount,
        uint256 fromPosition,
        string  reason,
        uint256 timestamp
    );
    event FallbackClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event QueueClosed(uint256 totalMembers, uint256 timestamp);
    event QueueExpiredEvent(uint256 seatsFilledSoFar, uint256 timestamp);
    event EarningsCapHit(address indexed member, uint256 lifetimeEarnings, uint256 retopupDeadline);
    event SlotBlanked(address indexed member, uint256 timestamp);
    event SlotReactivated(address indexed member, uint256 timestamp);
    event Retopup(address indexed member, uint256 position, uint256 timestamp);
    event PoolDepositReceived(uint256 amount, uint256 accPerMember, uint256 timestamp);
    event PoolShareClaimed(address indexed member, uint256 amount, uint256 timestamp);
    /// @dev Emitted when admin updates entry fee to reflect current USD–TROB rate
    event EntryFeeUpdated(uint256 newEntryFee, uint256 newEarningsCap, uint256 trobPriceUsd6, uint256 timestamp);
    /// @dev Emitted when wallet deposit eligibility is attested
    event EligibilityAttested(address indexed account, bool eligible, uint256 timestamp);
    /// @dev Emitted when eligibility enforcement is toggled
    event EligibilityEnforcementUpdated(bool enforced, uint256 timestamp);

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor(
        address _paymentToken,
        address _registry
    ) {
        require(_paymentToken != address(0), "EquoraDAO: Invalid token");
        require(_registry     != address(0), "EquoraDAO: Invalid registry");

        admin        = msg.sender;
        paymentToken = IERC20(_paymentToken);
        registry     = IEquoraRegistry(_registry);

        // Initialize DAO launch timestamp for 21-day founding window
        daoLaunchTimestamp = block.timestamp;
        lastJoinTimestamp  = block.timestamp;

        // Deploy Soulbound Membership NFT — this contract is sole minter
        membershipNFT = new EquoraDAOMembership(address(this));
    }

    // ─── Vault Configuration (One-Time Deployment Wiring) ──────────────────────

    /**
     * @dev Set the EquoraVault contract address (authorized to call receivePoolDeposit).
     *      Can only be set once during deployment wiring.
     */
    function setVaultContract(address _vault) external {
        require(vaultContract == address(0), "EquoraDAO: vault already set");
        require(_vault != address(0), "EquoraDAO: invalid vault");
        vaultContract = _vault;
        emit VaultContractSet(_vault);
    }

    // ─── Entry Fee Management (Price Oracle Sync) ──────────────────────────────

    /**
     * @dev Update the TROB entry fee to reflect the current live USD market price.
     *      Only callable by admin (the deployer or a price-keeper bot).
     *
     * @param _newEntryFee   TROB amount (18-decimal) equivalent to $300 USD.
     *                       Example: TROB = $0.056 => $300 / 0.056 ≈ 5357.14 TROB
     *                                => _newEntryFee = 5357142857142857142857 (5357.14 * 1e18)
     * @param _trobPriceUsd6 The TROB/USD price used, with 6 decimals. E.g. $0.056 => 56000
     *                       Stored for on-chain auditing only.
     */
    function setEntryFee(uint256 _newEntryFee, uint256 _trobPriceUsd6) external {
        require(msg.sender == admin, "EquoraDAO: not admin");
        require(_newEntryFee > 0, "EquoraDAO: entry fee must be > 0");
        require(_trobPriceUsd6 > 0, "EquoraDAO: price must be > 0");

        // Sanity: entry fee must represent $150 to $600 USD (allowing for 2x price swings)
        uint256 expectedMin = (150_000_000 * 1e6) / _trobPriceUsd6; // $150 floor (6 decimals)
        uint256 expectedMax = (600_000_000 * 1e6) / _trobPriceUsd6; // $600 ceiling (6 decimals)
        require(
            _newEntryFee >= expectedMin && _newEntryFee <= expectedMax,
            "EquoraDAO: fee deviates too far from $300 peg"
        );

        entryFee    = _newEntryFee;
        earningsCap = _newEntryFee * 5;  // 5x fee = $1,500 USD in TROB
        lastTrobPriceUsd6        = _trobPriceUsd6;
        lastPriceUpdateTimestamp = block.timestamp;

        emit EntryFeeUpdated(_newEntryFee, earningsCap, _trobPriceUsd6, block.timestamp);
    }

    /**
     * @dev Attest or update an account's deposit eligibility against protocol conditions:
     *      - Condition 1: Wallet created on or after 1 October 2026
     *      - Condition 2: Resource Stake (Energy + Bandwidth) + Equora SR Vote
     *      - Official Community Channel Verified
     *      Callable by admin or authorized verifier relayer.
     */
    function setEligibilityAttestation(address account, bool eligible) external {
        require(msg.sender == admin, "EquoraDAO: not admin");
        require(account != address(0), "EquoraDAO: invalid address");
        isEligibilityAttested[account] = eligible;
        emit EligibilityAttested(account, eligible, block.timestamp);
    }

    /**
     * @dev Toggle on-chain enforcement of eligibility condition attestation prior to joinDAO.
     */
    function setEligibilityEnforced(bool _enforced) external {
        require(msg.sender == admin, "EquoraDAO: not admin");
        eligibilityEnforced = _enforced;
        emit EligibilityEnforcementUpdated(_enforced, block.timestamp);
    }

    receive() external payable {}

    // ─── Core Join Function ────────────────────────────────────────────────────

    /**
     * @dev Join the Genesis DAO as one of 100 founding members.
     *      Requirements:
     *        - Queue not full (< 100 seats, or a vacant seat exists from an expired 48h retopup)
     *        - Caller not already a member
     *        - Open to any participant (0 referrals required)
     *        - Entry fee is $300 USD worth of TROB (payable via native TROB or paymentToken)
     *
     *      If an existing seat is vacant (due to missed 48h retopup), the lowest-numbered
     *      blank seat (scanned from Seat 1 to 100) is filled first!
     *
     * @return position The 1-indexed seat number assigned (1 to 100)
     */
    function joinDAO() external payable nonReentrant returns (uint256 position) {
        if (isDaoMember[msg.sender]) revert AlreadyMember();
        if (eligibilityEnforced && !isEligibilityAttested[msg.sender]) revert NotQualified();

        // 1. Scan from Seat 1 to 100 for any blank/vacant slot (missed 48-hour retopup)
        uint256 vacantIndex = type(uint256).max;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (slotBlank[m] || (capHitTimestamp[m] > 0 && block.timestamp > capHitTimestamp[m] + RETOPUP_WINDOW)) {
                vacantIndex = i;
                break;
            }
        }

        // 2. Collect entry fee payment ($300 USD worth of TROB)
        // Accepts native TROB from TrobSafe wallet (msg.value) or paymentToken transferFrom
        uint256 paidAmount = entryFee;
        if (msg.value > 0) {
            paidAmount = msg.value;
            totalCollected += paidAmount;
        } else {
            bool ok = paymentToken.transferFrom(msg.sender, address(this), entryFee);
            if (!ok) revert PaymentFailed();
            totalCollected += entryFee;
        }

        uint256 tokenId;
        // 3. If a vacant seat exists, replace the expired member
        if (vacantIndex != type(uint256).max) {
            address oldMember = daoMembers[vacantIndex];
            isDaoMember[oldMember]      = false;
            slotBlank[oldMember]        = false;
            capHitTimestamp[oldMember]  = 0;
            memberPosition[oldMember]   = 0;
            lifetimeEarnings[oldMember] = 0;
            memberRewardDebt[oldMember] = 0;

            daoMembers[vacantIndex]     = msg.sender;
            isDaoMember[msg.sender]     = true;
            position                    = vacantIndex + 1;
            memberPosition[msg.sender]  = position;
            memberRewardDebt[msg.sender] = accPoolSharePerMember;
            lastJoinTimestamp           = block.timestamp;

            // Auto-register new joiner in EquoraRegistry if not yet registered
            _registerUserInRegistry(msg.sender);

            tokenId = membershipNFT.reassignSeat(oldMember, msg.sender, position);
            emit DAOPositionJoined(msg.sender, position, tokenId, block.timestamp);

            // Distribute entry fee to all active members except new joiner
            _distributeRetopup(msg.sender, paidAmount);
            return position;
        }

        // 4. No vacant seat — standard new join up to 100 seats
        if (daoMembers.length >= MAX_MEMBERS) revert QueueFull();

        position = daoMembers.length + 1;
        daoMembers.push(msg.sender);
        isDaoMember[msg.sender]    = true;
        memberPosition[msg.sender] = position;

        if (position == 1) daoLaunchTimestamp = block.timestamp;
        lastJoinTimestamp = block.timestamp;

        // Auto-register new joiner in EquoraRegistry if not yet registered
        _registerUserInRegistry(msg.sender);

        tokenId = membershipNFT.mint(msg.sender, position);
        emit DAOPositionJoined(msg.sender, position, tokenId, block.timestamp);

        memberRewardDebt[msg.sender] = accPoolSharePerMember;
        _distributeEntryFee(position, paidAmount);

        if (daoMembers.length == MAX_MEMBERS) {
            daoCompleted = true;
            emit QueueClosed(MAX_MEMBERS, block.timestamp);
        }

        return position;
    }

    /**
     * @dev Internal helper to register a DAO joiner in EquoraRegistry.
     *      Ensures all 100 DAO members have 5-digit referral codes from Day 1.
     */
    function _registerUserInRegistry(address user) internal {
        if (address(registry) != address(0)) {
            try registry.isRegistered(user) returns (bool reg) {
                if (!reg) {
                    try registry.registerUser(user, address(0)) {} catch {}
                }
            } catch {}
        }
    }

    // ─── Re-topup (5X Cap Reset) ───────────────────────────────────────────────

    /**
     * @dev Called by a member who has hit their 5X earnings cap to re-activate
     *      their slot. Must be called within 48 hours of the cap being hit.
     *      Pays entry fee ($300 USD worth of TROB) again and resets lifetime earnings.
     */
    function retopup() external payable nonReentrant {
        if (!isDaoMember[msg.sender]) revert NotMember();
        if (capHitTimestamp[msg.sender] == 0) revert NotCapped();

        // 48-hour window check
        if (block.timestamp > capHitTimestamp[msg.sender] + RETOPUP_WINDOW) {
            // Window expired — slot should already be blank (or we blank it now)
            if (!slotBlank[msg.sender]) {
                _updateMemberPoolReward(msg.sender);
                slotBlank[msg.sender] = true;
                emit SlotBlanked(msg.sender, block.timestamp);
            }
            revert RetopupWindowExpired();
        }

        // Collect re-topup fee ($300 USD worth of TROB at current rate)
        uint256 paidAmount = entryFee;
        if (msg.value > 0) {
            paidAmount = msg.value;
            totalCollected += paidAmount;
        } else {
            bool ok = paymentToken.transferFrom(msg.sender, address(this), entryFee);
            if (!ok) revert PaymentFailed();
            totalCollected += entryFee;
        }

        // Reset cap state
        lifetimeEarnings[msg.sender] = 0;
        capHitTimestamp[msg.sender]  = 0;

        // Reactivate if blanked (shouldn't be blanked if within window, but safety)
        if (slotBlank[msg.sender]) {
            slotBlank[msg.sender] = false;
            memberRewardDebt[msg.sender] = accPoolSharePerMember;
            emit SlotReactivated(msg.sender, block.timestamp);
        }

        // Distribute the re-topup fee to all active members
        _distributeRetopup(msg.sender, paidAmount);

        emit Retopup(msg.sender, memberPosition[msg.sender], block.timestamp);
    }

    /**
     * @dev Public function to blank expired cap slots.
     *      Callable by anyone to enforce the 48-hour re-topup deadline.
     *      Loops over all members and blanks those whose window has expired.
     */
    function enforceCapExpirations() external {
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address member = daoMembers[i];
            if (
                capHitTimestamp[member] > 0 &&
                !slotBlank[member] &&
                block.timestamp > capHitTimestamp[member] + RETOPUP_WINDOW
            ) {
                _updateMemberPoolReward(member);
                slotBlank[member] = true;
                emit SlotBlanked(member, block.timestamp);
            }
        }
    }

    // ─── DAO Plan Share Benefit (35% Matrix Volume Pool) ───────────────────────

    /**
     * @dev Receive 35% matrix volume pool deposit from EquoraVault.
     *      Dividends are accrued to active (non-blank) DAO members via O(1) accumulator.
     */
    function receivePoolDeposit(uint256 amount) external {
        if (msg.sender != vaultContract) revert Unauthorized();
        if (amount == 0 || daoMembers.length == 0) return;

        uint256 activeCount = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            if (!slotBlank[daoMembers[i]]) {
                activeCount++;
            }
        }
        if (activeCount == 0) return;

        accPoolSharePerMember += (amount * 1e18) / activeCount;
        totalPoolReceived += amount;

        emit PoolDepositReceived(amount, accPoolSharePerMember, block.timestamp);
    }

    /**
     * @dev Internal helper to settle member's pending pool share up to current accumulator.
     */
    function _updateMemberPoolReward(address member) internal {
        if (!isDaoMember[member] || slotBlank[member]) return;

        uint256 accumulated = accPoolSharePerMember - memberRewardDebt[member];
        if (accumulated > 0) {
            pendingPoolShare[member] += accumulated / 1e18;
        }
        memberRewardDebt[member] = accPoolSharePerMember;
    }

    /**
     * @dev View function to get current claimable 35% matrix pool dividend.
     */
    function getPendingPoolShare(address member) public view returns (uint256) {
        if (!isDaoMember[member] || slotBlank[member]) return pendingPoolShare[member];
        uint256 accumulated = accPoolSharePerMember - memberRewardDebt[member];
        return pendingPoolShare[member] + (accumulated / 1e18);
    }

    /**
     * @dev Claim accrued 35% matrix volume pool share (DAO Plan Share Benefit).
     */
    function claimPoolShare() external nonReentrant {
        if (!isDaoMember[msg.sender]) revert NotMember();
        _updateMemberPoolReward(msg.sender);

        uint256 claimable = pendingPoolShare[msg.sender];
        if (claimable == 0) revert NothingToClaim();

        pendingPoolShare[msg.sender] = 0;
        totalPoolDistributed += claimable;

        bool ok = paymentToken.transfer(msg.sender, claimable);
        if (!ok) revert TransferFailed();

        emit PoolShareClaimed(msg.sender, claimable, block.timestamp);
    }

    function getPoolShareStats() external view returns (
        uint256 totalReceived,
        uint256 totalDistributed_,
        uint256 accPerMember
    ) {
        return (totalPoolReceived, totalPoolDistributed, accPoolSharePerMember);
    }

    // ─── Expiry Check ──────────────────────────────────────────────────────────

    /**
     * @dev Check and mark expiry. Called at the top of joinDAO().
     *      Expiry: founding window is 21 days from launch.
     */
    function _checkExpiry() internal {
        if (daoCompleted || daoExpired) return;
        if (daoMembers.length == 0) return;

        if (block.timestamp > lastJoinTimestamp + SEAT_WINDOW) {
            daoExpired = true;
            emit QueueExpiredEvent(daoMembers.length, block.timestamp);
        }
    }

    // ─── Internal Distribution Logic ──────────────────────────────────────────

    /**
     * @dev Distribute $300 entry fee (in TROB) instantly following 300 / N formula:
     *      - Incoming member N is INCLUDED in the distribution.
     *      - Position 1 (N = 1): entryFee / 1 returned to Member 1 immediately.
     *      - Position 2 (N = 2): entryFee / 2 to Member 2 (immediate return) & entryFee / 2 to Member 1.
     *      - Position 3 (N = 3): entryFee / 3 to Member 3 (immediate return) & entryFee / 3 each to Members 1 & 2.
     *      - Position N: entryFee / activeCount to all active members from 1 to N (including new joiner).
     *      - Blanked slots are SKIPPED in distribution.
     *      - After crediting, checks if recipient has hit 5X cap ($1,500 worth of TROB).
     */
    function _distributeEntryFee(uint256 incomingPosition, uint256 amountToDistribute) internal {
        // Count active (non-blank) recipients among all members up to incomingPosition (inclusive)
        uint256 activeCount = 0;
        for (uint256 i = 0; i < incomingPosition; i++) {
            if (!slotBlank[daoMembers[i]]) {
                activeCount++;
            }
        }

        if (activeCount == 0) return;

        uint256 amountPerRecipient = amountToDistribute / activeCount;
        if (amountPerRecipient == 0) return;

        for (uint256 i = 0; i < incomingPosition; i++) {
            address recipient = daoMembers[i];
            if (!slotBlank[recipient]) {
                _pushTransfer(recipient, amountPerRecipient, incomingPosition);
            }
        }
    }

    /**
     * @dev Distribute re-topup fee to all active members EXCEPT the retopup caller.
     */
    function _distributeRetopup(address caller, uint256 amount) internal {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            if (daoMembers[i] != caller && !slotBlank[daoMembers[i]]) {
                activeCount++;
            }
        }

        if (activeCount == 0) {
            // No active members to distribute to — credit caller back (safety)
            _pushTransfer(caller, amount, memberPosition[caller]);
            return;
        }

        uint256 amountPerRecipient = amount / activeCount;
        if (amountPerRecipient == 0) return;

        for (uint256 i = 0; i < daoMembers.length; i++) {
            address recipient = daoMembers[i];
            if (recipient != caller && !slotBlank[recipient]) {
                _pushTransfer(recipient, amountPerRecipient, memberPosition[caller]);
            }
        }
    }

    /**
     * @dev Push transfer helper with:
     *      1. Anti-griefing fallback (failed push → pullFallbackBalance)
     *      2. 5X cap enforcement (track lifetimeEarnings, set capHitTimestamp)
     */
    function _pushTransfer(address recipient, uint256 amount, uint256 fromPosition) internal {
        bool ok = false;
        if (address(this).balance >= amount && amount > 0) {
            // Direct native TROB transfer to council member wallet on-chain
            (bool sent, ) = payable(recipient).call{value: amount}("");
            ok = sent;
        }
        if (!ok && address(paymentToken) != address(0)) {
            try paymentToken.transfer(recipient, amount) returns (bool res) {
                ok = res;
            } catch {}
        }

        if (ok) {
            lifetimeEarnings[recipient] += amount;
            totalDistributed            += amount;
            emit DAOPayoutPushed(recipient, amount, fromPosition, block.timestamp);
        } else {
            pullFallbackBalance[recipient] += amount;
            lifetimeEarnings[recipient]    += amount;
            totalDistributed               += amount;
            emit DAOPayoutFallback(recipient, amount, fromPosition, "Transfer failed", block.timestamp);
        }

        // Check 5X cap after crediting
        _checkCap(recipient);
    }

    /**
     * @dev Check if a member has hit their 5X earnings cap.
     *      If so, record the timestamp — they have 48 hours to retopup.
     */
    function _checkCap(address member) internal {
        if (capHitTimestamp[member] > 0) return; // Already capped
        if (slotBlank[member]) return;

        if (lifetimeEarnings[member] >= earningsCap) {
            capHitTimestamp[member] = block.timestamp;
            uint256 deadline = block.timestamp + RETOPUP_WINDOW;
            emit EarningsCapHit(member, lifetimeEarnings[member], deadline);
        }
    }

    // ─── Fallback Claim ────────────────────────────────────────────────────────

    /**
     * @dev Claim accumulated fallback balance (from failed push transfers).
     */
    function claimFallback() external nonReentrant {
        if (!isDaoMember[msg.sender]) revert NotMember();
        uint256 amount = pullFallbackBalance[msg.sender];
        if (amount == 0) revert NothingToClaim();

        pullFallbackBalance[msg.sender] = 0;

        bool ok = false;
        if (address(this).balance >= amount && amount > 0) {
            (bool sent, ) = payable(msg.sender).call{value: amount}("");
            ok = sent;
        }
        if (!ok && address(paymentToken) != address(0)) {
            ok = paymentToken.transfer(msg.sender, amount);
        }
        if (!ok) revert TransferFailed();

        emit FallbackClaimed(msg.sender, amount, block.timestamp);
    }

    // ─── View Functions ────────────────────────────────────────────────────────

    /**
     * @dev Full member state for UI display.
     */
    function getMemberDetails(address user)
        external view
        returns (
            bool    isMember,
            uint256 position,
            uint256 nftTokenId,
            uint256 fallbackClaimable,
            uint256 totalEarned,
            bool    isCapped,
            uint256 retopupDeadline,
            bool    isBlank,
            uint256 poolClaimable
        )
    {
        isMember          = isDaoMember[user];
        position          = memberPosition[user];
        nftTokenId        = isMember ? position : 0;
        fallbackClaimable = pullFallbackBalance[user];
        totalEarned       = lifetimeEarnings[user];
        isCapped          = capHitTimestamp[user] > 0;
        retopupDeadline   = capHitTimestamp[user] > 0 ? capHitTimestamp[user] + RETOPUP_WINDOW : 0;
        isBlank           = slotBlank[user];
        poolClaimable     = getPendingPoolShare(user);
    }

    /**
     * @dev Explicit getter for Genesis DAO launch timestamp.
     *      Used by EquoraMatrix to synchronize the 21-day founding window.
     */
    function getLaunchTimestamp() external view returns (uint256) {
        return daoLaunchTimestamp;
    }

    function getDAOStats()
        external view
        returns (
            uint256 memberCount,
            uint256 totalCollectedAmount,
            uint256 totalDistributedAmount,
            bool    isCompleted,
            bool    isExpiredStatus,
            uint256 secondsRemaining,
            uint256 activeMembers,
            uint256 blankSlots,
            uint256 totalPoolReceivedAmount,
            uint256 totalPoolDistributedAmount
        )
    {
        bool exp = false; // Permanent queue — no 21-day inactivity timeout
        uint256 rem = 0;
        if (!daoCompleted && !exp) {
            uint256 startTs = daoLaunchTimestamp > 0 ? daoLaunchTimestamp : lastJoinTimestamp;
            if (startTs > 0) {
                uint256 deadline = startTs + SEAT_WINDOW;
                if (deadline > block.timestamp) {
                    rem = deadline - block.timestamp;
                }
            } else {
                rem = SEAT_WINDOW;
            }
        }

        uint256 blanks = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            if (slotBlank[daoMembers[i]]) blanks++;
        }

        return (
            daoMembers.length,
            totalCollected,
            totalDistributed,
            daoCompleted,
            exp,
            rem,
            daoMembers.length - blanks,
            blanks,
            totalPoolReceived,
            totalPoolDistributed
        );
    }

    function getRemainingPositions() external view returns (uint256) {
        if (daoMembers.length >= MAX_MEMBERS) {
            // Check for blank/vacant slots that can be taken
            uint256 blanks = 0;
            for (uint256 i = 0; i < daoMembers.length; i++) {
                address m = daoMembers[i];
                if (slotBlank[m] || (capHitTimestamp[m] > 0 && block.timestamp > capHitTimestamp[m] + RETOPUP_WINDOW)) {
                    blanks++;
                }
            }
            return blanks;
        }
        return MAX_MEMBERS - daoMembers.length;
    }

    function getAllMembers() external view returns (address[] memory) {
        return daoMembers;
    }

    /**
     * @dev Returns the last member who joined the Genesis DAO.
     *      On Day 22, this member becomes the Root Matrix Owner of the Retail Matrix.
     */
    function getLastMember() external view returns (address) {
        if (daoMembers.length == 0) return address(0);
        return daoMembers[daoMembers.length - 1];
    }

    function isClosed() external view returns (bool) {
        return daoCompleted;
    }

    function isExpired() external pure returns (bool) {
        return false;
    }

    /**
     * @dev Returns remaining seconds in the 21-day founding window.
     *      Exact match with the 21-day countdown on the Matrix Bridge page.
     */
    function timeRemainingInWindow() external view returns (uint256) {
        if (daoCompleted || daoExpired) return 0;
        uint256 startTs = daoLaunchTimestamp > 0 ? daoLaunchTimestamp : lastJoinTimestamp;
        if (startTs == 0) return SEAT_WINDOW; // 21 days
        uint256 deadline = startTs + SEAT_WINDOW;
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }

    /**
     * @dev Returns the time remaining for a member to retopup before their slot is blanked.
     *      Returns 0 if not capped or window already expired.
     */
    function retopupTimeRemaining(address member) external view returns (uint256) {
        if (capHitTimestamp[member] == 0) return 0;
        uint256 deadline = capHitTimestamp[member] + RETOPUP_WINDOW;
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }

    /**
     * @dev Returns cap progress for a member (earnings / cap, both in TROB).
     */
    function getCapProgress(address member) external view returns (
        uint256 earned,
        uint256 cap,
        uint256 remaining
    ) {
        earned = lifetimeEarnings[member];
        cap    = earningsCap;
        remaining = earned >= cap ? 0 : cap - earned;
    }
}
