import { ethers } from 'ethers';

// Validar que la dirección del contrato sea válida
const CONTRACT_ADDRESS = "0xE7230739B7A9941aeA0D2Ea81D69702472908827";
if (!ethers.isAddress(CONTRACT_ADDRESS)) {
  throw new Error('Dirección de contrato inválida');
}

export const CONFIG = {
  AVALANCHE_FUJI_CHAIN_ID: '0xa869',
  AVALANCHE_FUJI_RPC: 'https://api.avax-test.network/ext/bc/C/rpc',
  CONTRACT_ADDRESS: ethers.getAddress(CONTRACT_ADDRESS),
  CONTRACT_ABI: [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "stickerId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "giverAddress",
          "type": "address"
        }
      ],
      "name": "claim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "stickerId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "giver",
          "type": "address"
        }
      ],
      "name": "StickerClaimed",
      "type": "event"
    },
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
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
} as const; 