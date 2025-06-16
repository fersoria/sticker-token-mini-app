import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/config';

// Función auxiliar para manejar CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.sherry.so',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 horas
};

// Manejador OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Manejador GET para la metadata
export async function GET(request: NextRequest) {
  try {
    const metadata = {
      url: request.nextUrl.origin + "/api/claim",
      icon: request.nextUrl.origin + "/icon.png",
      title: "STICKER Token Claim",
      description: "Claim your STICKER tokens and support the giver",
      baseUrl: request.nextUrl.origin,
      actions: [
        {
          type: "dynamic",
          label: "Claim STICKER Tokens",
          description: "Claim 100 STICKER tokens and give 50 to the giver",
          chain: "avalanche-fuji",
          path: "/api/claim",
          params: [
            {
              name: "giverAddress",
              type: "string",
              required: true,
              description: "Address of the giver"
            }
          ]
        }
      ]
    };

    return NextResponse.json(metadata, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error creating metadata:', error);
    return NextResponse.json(
      { error: 'Error creating metadata' }, 
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// Manejador POST para la transacción
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const giverAddress = searchParams.get('giverAddress');

    if (!giverAddress) {
      return NextResponse.json(
        { error: 'Giver address is required' }, 
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Crear la transacción para el claim
    const iface = new ethers.Interface(CONTRACT_ABI);
    const data = iface.encodeFunctionData('claim', [giverAddress]);

    const txAction = {
      to: CONTRACT_ADDRESS,
      data: data,
      value: '0x0',
      chainId: 43113 // Avalanche Fuji
    };

    return NextResponse.json({
      transaction: txAction,
      chainId: 'avalanche-fuji'
    }, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Error creating transaction' }, 
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
} 