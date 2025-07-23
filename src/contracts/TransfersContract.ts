// Coinbase Transfers.sol contract source code for reCeption analysis
// Contract address: 0x96A08D8e8631b6dB52Ea0cbd7232d9A85d239147
// Source: https://github.com/coinbase/commerce-onchain-payment-protocol/blob/master/contracts/transfers/Transfers.sol

export const TRANSFERS_CONTRACT_SOURCE = `// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {Commands as UniswapCommands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import {Constants as UniswapConstants} from "@uniswap/universal-router/contracts/libraries/Constants.sol";
import "../interfaces/IWrappedNativeCurrency.sol";
import "../interfaces/ITransfers.sol";
import "../interfaces/IERC7597.sol";
import "../utils/Sweepable.sol";
import "../permit2/src/Permit2.sol";

// Uniswap error selectors, used to surface information when swaps fail
// Pulled from @uniswap/universal-router/out/V3SwapRouter.sol/V3SwapRouter.json after compiling with forge
bytes32 constant V3_INVALID_SWAP = keccak256(hex"316cf0eb");
bytes32 constant V3_TOO_LITTLE_RECEIVED = keccak256(hex"39d35496");
bytes32 constant V3_TOO_MUCH_REQUESTED = keccak256(hex"739dbe52");
bytes32 constant V3_INVALID_AMOUNT_OUT = keccak256(hex"d4e0248e");
bytes32 constant V3_INVALID_CALLER = keccak256(hex"32b13d91");

// @inheritdoc ITransfers
contract Transfers is Context, Ownable, Pausable, ReentrancyGuard, Sweepable, ITransfers {
    using SafeERC20 for IERC20;
    using SafeERC20 for IWrappedNativeCurrency;

    // @dev Map of operator addresses and fee destinations.
    mapping(address => address) private feeDestinations;

    // @dev Map of operator addresses to a map of transfer intent ids that have been processed
    mapping(address => mapping(bytes16 => bool)) private processedTransferIntents;

    // @dev Represents native token of a chain (e.g. ETH or MATIC)
    address private immutable NATIVE_CURRENCY = address(0);

    // @dev Uniswap on-chain contract
    IUniversalRouter private immutable uniswap;

    // @dev permit2 SignatureTransfer contract address. Used for tranferring tokens with a signature instead of a full transaction.
    // See: https://github.com/Uniswap/permit2
    Permit2 public immutable permit2;

    // @dev Canonical wrapped token for this chain. e.g. (wETH or wMATIC).
    IWrappedNativeCurrency private immutable wrappedNativeCurrency;

    // @param _uniswap The address of the Uniswap V3 swap router
    // @param _wrappedNativeCurrency The address of the wrapped token for this chain
    constructor(
        IUniversalRouter _uniswap,
        Permit2 _permit2,
        address _initialOperator,
        address _initialFeeDestination,
        IWrappedNativeCurrency _wrappedNativeCurrency
    ) {
        require(
            address(_uniswap) != address(0) &&
                address(_permit2) != address(0) &&
                address(_wrappedNativeCurrency) != address(0) &&
                _initialOperator != address(0) &&
                _initialFeeDestination != address(0),
            "invalid constructor parameters"
        );
        uniswap = _uniswap;
        permit2 = _permit2;
        wrappedNativeCurrency = _wrappedNativeCurrency;

        // Sets an initial operator to enable immediate payment processing
        feeDestinations[_initialOperator] = _initialFeeDestination;
    }

    // @dev Raises errors if the intent is invalid
    // @param _intent The intent to validate
    modifier validIntent(TransferIntent calldata _intent, address sender) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                _intent.recipientAmount,
                _intent.deadline,
                _intent.recipient,
                _intent.recipientCurrency,
                _intent.refundDestination,
                _intent.feeAmount,
                _intent.id,
                _intent.operator,
                block.chainid,
                sender,
                address(this)
            )
        );

        bytes32 signedMessageHash;
        if (_intent.prefix.length == 0) {
            // Use 'default' message prefix.
            signedMessageHash = ECDSA.toEthSignedMessageHash(hash);
        } else {
            // Use custom message prefix.
            signedMessageHash = keccak256(abi.encodePacked(_intent.prefix, hash));
        }

        address signer = ECDSA.recover(signedMessageHash, _intent.signature);

        if (signer != _intent.operator) {
            revert InvalidSignature();
        }

        if (_intent.deadline < block.timestamp) {
            revert ExpiredIntent();
        }

        if (_intent.recipient == address(0)) {
            revert NullRecipient();
        }

        if (processedTransferIntents[_intent.operator][_intent.id]) {
            revert AlreadyProcessed();
        }

        _;
    }

    // @dev Raises an error if the operator in the transfer intent is not registered.
    // @param _intent The intent to validate
    modifier operatorIsRegistered(TransferIntent calldata _intent) {
        if (feeDestinations[_intent.operator] == address(0)) revert OperatorNotRegistered();

        _;
    }

    modifier exactValueSent(TransferIntent calldata _intent) {
        // Make sure the correct value was sent
        uint256 neededAmount = _intent.recipientAmount + _intent.feeAmount;
        if (msg.value > neededAmount) {
            revert InvalidNativeAmount(int256(msg.value - neededAmount));
        } else if (msg.value < neededAmount) {
            revert InvalidNativeAmount(-int256(neededAmount - msg.value));
        }

        _;
    }

    // @inheritdoc ITransfers
    function transferNative(TransferIntent calldata _intent)
        external
        payable
        override
        nonReentrant
        whenNotPaused
        validIntent(_intent, _msgSender())
        operatorIsRegistered(_intent)
        exactValueSent(_intent)
    {
        // Make sure the recipient wants the native currency
        if (_intent.recipientCurrency != NATIVE_CURRENCY) revert IncorrectCurrency(NATIVE_CURRENCY);

        if (msg.value > 0) {
            // Complete the payment
            transferFundsToDestinations(_intent);
        }

        succeedPayment(_intent, msg.value, NATIVE_CURRENCY, _msgSender());
    }

    // @inheritdoc ITransfers
    function transferToken(
        TransferIntent calldata _intent,
        Permit2SignatureTransferData calldata _signatureTransferData
    ) external override nonReentrant whenNotPaused validIntent(_intent, _msgSender()) operatorIsRegistered(_intent) {
        // Make sure the recipient wants a token and the payer is sending it
        if (
            _intent.recipientCurrency == NATIVE_CURRENCY ||
            _signatureTransferData.permit.permitted.token != _intent.recipientCurrency
        ) {
            revert IncorrectCurrency(_signatureTransferData.permit.permitted.token);
        }

        // Make sure the payer has enough of the payment token
        IERC20 erc20 = IERC20(_intent.recipientCurrency);
        uint256 neededAmount = _intent.recipientAmount + _intent.feeAmount;
        uint256 payerBalance = erc20.balanceOf(_msgSender());
        if (payerBalance < neededAmount) {
            revert InsufficientBalance(neededAmount - payerBalance);
        }

        if (neededAmount > 0) {
            // Make sure the payer is transferring the right amount to this contract
            if (
                _signatureTransferData.transferDetails.to != address(this) ||
                _signatureTransferData.transferDetails.requestedAmount != neededAmount
            ) {
                revert InvalidTransferDetails();
            }

            // Record our balance before (most likely zero) to detect fee-on-transfer tokens
            uint256 balanceBefore = erc20.balanceOf(address(this));

            // Transfer the payment token to this contract
            permit2.permitTransferFrom(
                _signatureTransferData.permit,
                _signatureTransferData.transferDetails,
                _msgSender(),
                _signatureTransferData.signature
            );

            // Make sure this is not a fee-on-transfer token
            revertIfInexactTransfer(neededAmount, balanceBefore, erc20, address(this));

            // Complete the payment
            transferFundsToDestinations(_intent);
        }

        succeedPayment(_intent, neededAmount, _intent.recipientCurrency, _msgSender());
    }

    // Additional contract methods truncated for brevity...
    // Full implementation includes transferTokenPreApproved, wrapAndTransfer, 
    // unwrapAndTransfer, swapAndTransferUniswapV3Native, etc.
    
    function transferFundsToDestinations(TransferIntent calldata _intent) internal {
        // Implementation details...
    }
    
    function succeedPayment(TransferIntent calldata _intent, uint256 amount, address currency, address payer) internal {
        // Implementation details...
    }
    
    function revertIfInexactTransfer(uint256 expected, uint256 balanceBefore, IERC20 token, address account) internal view {
        // Implementation details...
    }
}`;

export const CONTRACT_ADDRESS = "0x96A08D8e8631b6dB52Ea0cbd7232d9A85d239147";
export const CONTRACT_NAME = "Coinbase Transfers Contract";