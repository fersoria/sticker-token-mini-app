import { createMetadata, Metadata, ActionFlow } from '@sherrylinks/sdk';
import { Abi } from 'viem';

// Import the ABI from App.tsx or define it here for this example
const STICKER_MANAGER_ABI: Abi = [
  {
    type: 'function',
    name: 'claim',
    inputs: [
      { name: 'stickerId', type: 'uint256' },
      { name: 'giverAddress', type: 'address' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'event',
    name: 'StickerClaimed',
    inputs: [
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'stickerId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'giver', type: 'address', indexed: true }
    ]
  }
];

const STICKER_MANAGER_CONTRACT_ADDRESS = '0x4606f77C54Fb4FD9Dc22138A024f7613DAa98038';

/**
 * Ejemplo de metadata para reclamar tokens STICKER a través de un SherryLink.
 * Esta metadata definiría la acción que ocurre cuando un usuario escanea un NFC
 * y es dirigido a esta mini-app.
 */
const claimStickerMetadata: Metadata = {
  url: 'http://localhost:5175/', // URL donde tu mini-app está hosted
  icon: 'https://example.com/sticker-icon.png', // Reemplaza con un ícono relevante
  title: 'Reclama tus Tokens STICKER',
  description: 'Escanea tu sticker NFC para reclamar tokens STICKER y recompensar al dador.',
  actions: [
    {
      type: 'blockchain',
      label: 'Reclamar Tokens',
      address: STICKER_MANAGER_CONTRACT_ADDRESS,
      abi: STICKER_MANAGER_ABI,
      functionName: 'claim',
      chains: { source: 'avalanche' }, // Asumiendo Avalanche Fuji es la red objetivo
      amount: 0, // No se envía AVAX con la función claim en sí, el gas lo paga el usuario
      params: [
        {
          name: 'stickerId',
          label: 'ID del Sticker',
          type: 'text', // El SDK de SherryLinks podría interpretarlo como texto o número
          required: true,
        },
        {
          name: 'giverAddress',
          label: 'Dirección del Dador',
          type: 'address',
          required: true,
          value: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', // Dirección aleatoria para la prueba
          fixed: true
        },
      ],
    },
  ],
};

// Valida y usa tu trigger
try {
  const validatedClaimMetadata = createMetadata(claimStickerMetadata);
  console.log('✅ Metadata para Reclamar Stickers lista para ser usada/desplegada:', validatedClaimMetadata);
} catch (error) {
  console.error('❌ Error al crear la metadata de SherryLinks:', error);
}

/**
 * Ejemplo de metadata para una transferencia simple de tokens (AVAX).
 * Este es un ejemplo directo del uso del tipo de acción 'transfer'.
 */
const sendAvaxMetadata: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'Send AVAX',
  description: 'Quick AVAX transfer',
  actions: [
    {
      type: 'transfer',
      label: 'Send 0.1 AVAX',
      to: '0x1234567890123456789012345678901234567890', // Dirección de ejemplo
      amount: 0.1,
      chains: { source: 'avalanche' },
    },
  ],
};

try {
  const validatedSendAvaxMetadata = createMetadata(sendAvaxMetadata);
  console.log('✅ Metadata para Enviar AVAX lista para ser usada/desplegada:', validatedSendAvaxMetadata);
} catch (error) {
  console.error('❌ Error al crear la metadata de SherryLinks para Send AVAX:', error);
}

/**
 * Ejemplo de un flujo de acciones complejo (ActionFlow).
 * Demuestra cómo encadenar múltiples pasos y puntos de decisión.
 */
const swapFlow: ActionFlow = {
  type: 'flow',
  label: 'Token Swap',
  initialActionId: 'select-tokens',
  actions: [
    {
      id: 'select-tokens',
      type: 'http',
      label: 'Select Tokens',
      path: 'https://api.example.com/quote',
      params: [
        // Parámetros de selección de tokens...
      ],
      nextActions: [{ actionId: 'review-quote' }],
    },
    {
      id: 'review-quote',
      type: 'decision',
      label: 'Review Quote',
      title: 'Review Your Swap',
      options: [
        { label: 'Confirm', value: 'confirm', nextActionId: 'execute-swap' },
        { label: 'Cancel', value: 'cancel', nextActionId: 'cancelled' },
      ],
    },
    {
      id: 'execute-swap',
      type: 'blockchain',
      label: 'Swap Tokens',
      address: '0xRouterAddress', // Dirección de contrato de router (placeholder)
      abi: [], // ABI del contrato de router (placeholder)
      functionName: 'swap', // Nombre de la función de swap (placeholder)
      chains: { source: 'avalanche' }, // Cadena de ejemplo
      // ... otras propiedades de la acción blockchain
      nextActions: [
        {
          actionId: 'success',
          conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'success' }],
        },
        {
          actionId: 'failed',
          conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'error' }],
        },
      ],
    },
    {
      id: 'success',
      type: 'completion',
      label: 'Swap Complete',
      message: 'Your swap was successful!',
      status: 'success',
    },
    {
      id: 'failed',
      type: 'completion',
      label: 'Swap Failed',
      message: 'Your swap failed. Please try again.',
      status: 'error',
    },
    {
      id: 'cancelled',
      type: 'completion',
      label: 'Swap Cancelled',
      message: 'You cancelled the swap.',
      status: 'info',
    },
  ],
};

const flowMetadata: Metadata = {
  url: 'https://swap.example',
  icon: 'https://example.com/swap-icon.png',
  title: 'Advanced Token Swap',
  description: 'Swap tokens with our guided flow',
  actions: [swapFlow],
};

try {
  const validatedFlowMetadata = createMetadata(flowMetadata);
  console.log('✅ Metadata para Flujo de Acción lista para ser usada/desplegada:', validatedFlowMetadata);
} catch (error) {
  console.error('❌ Error al crear la metadata de SherryLinks para Flujo de Acción:', error);
} 