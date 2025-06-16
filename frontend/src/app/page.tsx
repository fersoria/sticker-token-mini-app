"use client"; // Este directive es crucial para que los hooks de React funcionen en Next.js App Router

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONFIG } from '../config'; // Ruta ajustada
import { createClaimTransaction } from '../utils/transactionUtils'; // Ruta ajustada
import '../index.css'; // Importar globalmente (esto lo manejará layout.tsx en el futuro, pero por ahora déjalo aquí)

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export default function Home() { // Componente de página de Next.js
  const [stickerId, setStickerId] = useState('');
  const [giverAddress, setGiverAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [claimerStickerTokenBalance, setClaimerStickerTokenBalance] = useState<number | null>(null);
  const [giverStickerTokenBalance, setGiverStickerTokenBalance] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      setHasMetaMask(true);
    } else {
      setErrorMessage('Please install MetaMask to use this application');
      setHasMetaMask(false);
    }
  }, []);

  const checkNetwork = async () => {
    if (!window.ethereum) {
      return false;
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isFuji = chainId === CONFIG.AVALANCHE_FUJI_CHAIN_ID;
      setIsCorrectNetwork(isFuji);
      return isFuji;
    } catch (error) {
      console.error('Error checking network:', error);
      setErrorMessage('Error checking network');
      return false;
    }
  };

  const switchToFuji = async (): Promise<boolean> => {
    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONFIG.AVALANCHE_FUJI_CHAIN_ID }],
      });
      return await checkNetwork();
    } catch (switchError: unknown) {
      const error = switchError as { code?: number };
      if (error.code === 4902) {
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: CONFIG.AVALANCHE_FUJI_CHAIN_ID,
              chainName: 'Avalanche Fuji Testnet',
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18
              },
              rpcUrls: [CONFIG.AVALANCHE_FUJI_RPC],
              blockExplorerUrls: ['https://testnet.snowtrace.io/']
            }]
          });
          return await checkNetwork();
        } catch (addError) {
          console.error('Error adding Avalanche Fuji network:', addError);
          setErrorMessage('Error adding Avalanche Fuji network');
          return false;
        }
      } else {
        console.error('Error switching to Avalanche Fuji network:', switchError);
        setErrorMessage('Error switching to Avalanche Fuji network');
        return false;
      }
    }
  };

  const handleConnect = async () => {
    try {
      if (!hasMetaMask) {
        setErrorMessage('MetaMask no está instalado. Por favor, instálalo para continuar.');
        return;
      }

      if (!window.ethereum) {
        setErrorMessage('No se pudo detectar MetaMask. Por favor, asegúrate de que esté instalado y activo.');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const networkReady = await switchToFuji();
      if (!networkReady) {
        setErrorMessage('Por favor, cambia a la red Avalanche Fuji para continuar.');
        return;
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      if (!CONFIG.CONTRACT_ADDRESS || !CONFIG.CONTRACT_ABI) {
        setErrorMessage('Error: La configuración del contrato no está completa.');
        return;
      }

      const contractInstance = new ethers.Contract(
        CONFIG.CONTRACT_ADDRESS,
        CONFIG.CONTRACT_ABI,
        signer
      );
      
      setContract(contractInstance);
      setIsConnected(true);
      setAccount(address);
      setErrorMessage('');
      setSuccessMessage('Conectado exitosamente');

    } catch (error: unknown) {
      console.error('Error al conectar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al conectar con la wallet';
      setErrorMessage(errorMessage);
    }
  };

  const handleClaim = async () => {
    if (!account || !giverAddress) {
      setErrorMessage('Por favor, conecta tu wallet y proporciona una dirección de giver válida.');
      return;
    }

    if (!stickerId || isNaN(Number(stickerId))) {
      setErrorMessage('Por favor, proporciona un ID de sticker válido.');
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage('');
      setTxHash(null);

      if (!CONFIG.CONTRACT_ADDRESS || !CONFIG.CONTRACT_ABI) {
        throw new Error('La configuración del contrato no está completa.');
      }

      // Fetch Sherry metadata from the API Route
      const metadataResponse = await fetch('/api/sherry-metadata');
      if (!metadataResponse.ok) {
        throw new Error('Failed to fetch Sherry metadata from API');
      }
      const metadata = await metadataResponse.json();

      if (!metadata) {
        throw new Error('Error al obtener la metadata de Sherry de la API.');
      }

      // Create and send the transaction
      const txData = await createClaimTransaction(giverAddress, stickerId);
      if (!txData) {
        throw new Error('Error al crear la transacción');
      }

      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction(txData);
      
      setTxHash(tx.hash);
      setSuccessMessage('Transacción enviada exitosamente');
    } catch (error: unknown) {
      console.error('Error al reclamar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al reclamar tokens';
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimerStickerTokenBalance = useCallback(async (address: string) => {
    try {
      if (!contract) return;
      const balance = await contract.balanceOf(address);
      setClaimerStickerTokenBalance(Number(balance));
    } catch (error) {
      console.error('Error fetching claimer balance:', error);
    }
  }, [contract]);

  const fetchGiverStickerTokenBalance = useCallback(async (address: string) => {
    try {
      if (!contract) return;
      const balance = await contract.balanceOf(address);
      setGiverStickerTokenBalance(Number(balance));
    } catch (error) {
      console.error('Error fetching giver balance:', error);
    }
  }, [contract]);

  useEffect(() => {
    if (account) {
      fetchClaimerStickerTokenBalance(account);
    }
  }, [account, contract, fetchClaimerStickerTokenBalance]);

  useEffect(() => {
    if (giverAddress) {
      fetchGiverStickerTokenBalance(giverAddress);
    }
  }, [giverAddress, contract, fetchGiverStickerTokenBalance]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount('');
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = async () => {
        await checkNetwork();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">NFC Web3 App</h1>

        {!hasMetaMask && (
          <div className="text-red-500 mb-4 text-center">
            Por favor, instala MetaMask para usar esta aplicación.
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Éxito:</strong>
            <span className="block sm:inline"> {successMessage}</span>
          </div>
        )}

        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading || !hasMetaMask}
          >
            {loading ? 'Conectando...' : 'Conectar Wallet'}
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 break-words">
              <span className="font-semibold">Cuenta Conectada:</span> {account}
            </p>
            {!isCorrectNetwork && (
              <div className="text-red-500 text-center">
                Por favor, cambia a la red Avalanche Fuji.
              </div>
            )}
            {claimerStickerTokenBalance !== null && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Balance (Tu):</span> {claimerStickerTokenBalance} STICKER
              </p>
            )}
            {giverStickerTokenBalance !== null && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Balance (Giver):</span> {giverStickerTokenBalance} STICKER
              </p>
            )}

            <div className="space-y-2">
              <label htmlFor="stickerId" className="block text-sm font-medium text-gray-700">ID del Sticker</label>
              <input
                type="text"
                id="stickerId"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={stickerId}
                onChange={(e) => setStickerId(e.target.value)}
                placeholder="Ingrese el ID del Sticker"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="giverAddress" className="block text-sm font-medium text-gray-700">Dirección del Giver</label>
              <input
                type="text"
                id="giverAddress"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={giverAddress}
                onChange={(e) => setGiverAddress(e.target.value)}
                placeholder="Ingrese la dirección del Giver"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleClaim}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              disabled={loading || !isConnected || !isCorrectNetwork}
            >
              {loading ? 'Reclamando...' : 'Reclamar Tokens'}
            </button>

            {txHash && (
              <p className="text-sm text-gray-600 break-words mt-4 text-center">
                Transacción Hash: <a href={`https://testnet.snowtrace.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{txHash}</a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}