import { ethers } from 'ethers';
import { CONFIG } from '../config';

export const createClaimTransaction = async (giverAddress: string, stickerId: string) => {
  try {
    if (!ethers.isAddress(giverAddress)) {
      throw new Error('Dirección de giver inválida');
    }

    if (!stickerId || isNaN(Number(stickerId))) {
      throw new Error('ID de sticker inválido');
    }

    const iface = new ethers.Interface(CONFIG.CONTRACT_ABI);
    const data = iface.encodeFunctionData('claim', [stickerId, giverAddress]);

    if (!data) {
      throw new Error('Error al codificar los datos de la transacción');
    }

    return {
      to: CONFIG.CONTRACT_ADDRESS,
      data: data,
      value: '0x0',
      chainId: parseInt(CONFIG.AVALANCHE_FUJI_CHAIN_ID, 16) // Convertir de hex a decimal
    };
  } catch (error) {
    console.error('Error al crear la transacción:', error);
    throw error;
  }
}; 