import { ethers } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/config';

export const createClaimTransaction = async (giverAddress: string) => {
  try {
    const iface = new ethers.Interface(CONTRACT_ABI);
    const data = iface.encodeFunctionData('claim', [giverAddress]);

    return {
      to: CONTRACT_ADDRESS,
      data: data,
      value: '0x0',
      chainId: 43113 // Avalanche Fuji
    };
  } catch (error) {
    console.error('Error creating claim transaction:', error);
    throw error;
  }
}; 