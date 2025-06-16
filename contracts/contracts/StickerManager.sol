// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StickerManager
 * @dev This contract manages the claiming of STICKER tokens via physical NFC stickers.
 * It allows a user to claim a set amount of tokens for scanning a unique sticker.
 * It also rewards the person who gave the sticker (the "giver") with points on a leaderboard.
 */
contract StickerManager is ERC20, Ownable {
    // --- State Variables ---

    // Amount of tokens a user receives for claiming a sticker
    uint256 public claimAmount = 100 * (10**decimals());

    // Amount of tokens a giver receives when their sticker is claimed
    uint256 public giverReward = 50 * (10**decimals());

    // Mapping to track which sticker IDs have already been claimed to prevent double claims.
    // stickerId => boolean
    mapping(uint256 => bool) public claimedStickers;

    // Mapping to store the leaderboard scores for givers.
    // giverAddress => score (This mapping will still track points, not tokens, unless giverReward is interpreted differently in the frontend)
    mapping(address => uint256) public giverLeaderboard;

    // --- Events ---

    event StickerClaimed(
        address indexed claimer,
        uint256 indexed stickerId,
        address indexed giver,
        uint256 claimAmount,
        uint256 giverRewardAmount
    );

    // --- Constructor ---

    /**
     * @dev Sets the initial owner and mints the initial supply of tokens to the contract itself.
     * The contract will hold all tokens and distribute them as they are claimed.
     */
    constructor(address initialOwner) ERC20("Sticker", "STICKER") Ownable(initialOwner) {
        // No initial minting to the contract; tokens will be minted on demand.
    }

    // --- Functions ---

    /**
     * @notice Allows a user to claim tokens by providing a unique sticker ID and the giver's address.
     * @param stickerId The unique identifier of the NFC sticker being scanned.
     * @param giverAddress The address of the person who distributed the sticker.
     */
    function claim(uint256 stickerId, address giverAddress) external {
        // 1. Check if the sticker has already been claimed
        require(!claimedStickers[stickerId], "StickerManager: Sticker already claimed.");

        // 2. Validate giver address
        require(giverAddress != address(0), "StickerManager: Invalid giver address");
        require(giverAddress != msg.sender, "StickerManager: Cannot be your own giver");

        // 3. Mark the sticker as claimed
        claimedStickers[stickerId] = true;

        // 4. Mint tokens to the claimer (msg.sender)
        _mint(msg.sender, claimAmount);

        // 5. Mint tokens to the giver, if giverAddress is valid and not zero address
        if (giverAddress != address(0)) {
            _mint(giverAddress, giverReward);
            giverLeaderboard[giverAddress] += 1; // Still track claims as points for leaderboard, if desired
        }

        // 6. Emit the event
        emit StickerClaimed(msg.sender, stickerId, giverAddress, claimAmount, giverReward);
    }

    /**
     * @notice Allows the owner to update the amount of tokens per claim.
     * @param newAmount The new amount of tokens (in token units, not wei).
     */
    function setClaimAmount(uint256 newAmount) external onlyOwner {
        require(newAmount > 0, "StickerManager: Amount must be greater than 0");
        claimAmount = newAmount * (10**decimals());
    }

    /**
     * @notice Allows the owner to update the amount of points per claim for the giver.
     * @param newReward The new reward points (now actual token amount).
     */
    function setGiverReward(uint256 newReward) external onlyOwner {
        require(newReward > 0, "StickerManager: Giver reward must be greater than 0");
        giverReward = newReward * (10**decimals());
    }
}