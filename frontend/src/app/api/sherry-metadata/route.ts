import { createMetadata } from '@sherrylinks/sdk';
import { CONFIG } from '../../../config';
import { Abi } from 'viem';

export async function GET() {
  try {
    if (!CONFIG.CONTRACT_ADDRESS || !CONFIG.CONTRACT_ABI) {
      return new Response(JSON.stringify({ error: 'Contract configuration is incomplete' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const metadata = createMetadata({
      url: process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000',
      icon: process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/icon.png` : 'http://localhost:3000/icon.png',
      title: 'Claim STICKER Tokens',
      description: 'Claim your STICKER tokens and support the giver',
      actions: [
        {
          type: 'blockchain',
          label: 'Claim STICKER Tokens',
          address: CONFIG.CONTRACT_ADDRESS as `0x${string}`,
          abi: CONFIG.CONTRACT_ABI as Abi,
          functionName: 'claim',
          chains: { source: 'avalanche' },
          params: [
            {
              name: 'stickerId',
              label: 'Sticker ID',
              type: 'number',
              required: true,
            },
            {
              name: 'giverAddress',
              label: 'Giver Address',
              type: 'address',
              required: true,
            },
          ],
        },
      ],
    });

    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error generating Sherry metadata:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate metadata';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 