import { ethers } from 'ethers';

export const CONFIG = {
  AVALANCHE_FUJI_CHAIN_ID: '0xa869',
  AVALANCHE_FUJI_RPC: 'https://api.avax-test.network/ext/bc/C/rpc',
  CONTRACT_ADDRESS: ethers.getAddress("0x55905099566185EbF645E8aAcA1E130EB4C10702"),
  CONTRACT_ABI: [
    "function claim(uint256 stickerId, address giverAddress) public",
    "event StickerClaimed(address indexed recipient, uint256 indexed stickerId, uint256 amount, address indexed giver)",
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "giverLeaderboard",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    "function balanceOf(address account) view returns (uint256)"
  ]
}; 