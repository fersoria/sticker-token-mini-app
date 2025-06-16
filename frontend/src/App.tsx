import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONFIG } from './config';
import { createClaimTransaction } from './utils/transactionUtils';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
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
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONFIG.AVALANCHE_FUJI_CHAIN_ID }],
      });
      return await checkNetwork();
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
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
        setErrorMessage('MetaMask is not installed. Please install it to continue.');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const networkReady = await switchToFuji();
      if (!networkReady) {
        return;
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      const contractInstance = new ethers.Contract(
        CONFIG.CONTRACT_ADDRESS,
        CONFIG.CONTRACT_ABI,
        signer
      );
      
      setContract(contractInstance);
      setIsConnected(true);
      setAccount(address);
      setErrorMessage('');
      setSuccessMessage('');

    } catch (error) {
      console.error('Error connecting:', error);
      setErrorMessage('Error connecting to wallet');
    }
  };

  const handleClaim = async () => {
    if (!account || !giverAddress) return;
    
    try {
      setLoading(true);
      setErrorMessage('');
      setTxHash(null);

      // Crear la transacción
      const transaction = await createClaimTransaction(giverAddress);

      // Enviar la transacción usando ethers.js
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction(transaction);
      
      setTxHash(tx.hash);
      await tx.wait();
      setSuccessMessage('Tokens claimed successfully!');
      await fetchGiverStickerTokenBalance(giverAddress);
    } catch (err: any) {
      console.error('Error claiming tokens:', err);
      setErrorMessage(err.message || 'Error claiming tokens');
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimerStickerTokenBalance = async (address: string) => {
    if (!contract || !ethers.isAddress(address)) {
      setClaimerStickerTokenBalance(null);
      return;
    }
    try {
      const checksummedAddress = ethers.getAddress(address);
      const balance = await contract.balanceOf(checksummedAddress);
      setClaimerStickerTokenBalance(Number(ethers.formatUnits(balance, 18)));
    } catch (error) {
      console.error('Error fetching claimer token balance:', error);
      setClaimerStickerTokenBalance(null);
    }
  };

  const fetchGiverStickerTokenBalance = async (address: string) => {
    if (!contract || !ethers.isAddress(address)) {
      setGiverStickerTokenBalance(null);
      return;
    }
    try {
      const checksummedAddress = ethers.getAddress(address);
      const balance = await contract.balanceOf(checksummedAddress);
      setGiverStickerTokenBalance(Number(ethers.formatUnits(balance, 18)));
    } catch (error) {
      console.error('Error fetching giver token balance:', error);
      setGiverStickerTokenBalance(null);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('stickerId');
    const giver = urlParams.get('giverAddress');
    
    if (id) setStickerId(id);
    if (giver) setGiverAddress(giver);
  }, []);

  useEffect(() => {
    if (isConnected && contract && account) {
      fetchClaimerStickerTokenBalance(account);
      if (giverAddress && ethers.isAddress(giverAddress)) {
        fetchGiverStickerTokenBalance(giverAddress);
      }
    }
  }, [isConnected, contract, account, giverAddress]);

  useEffect(() => {
    if (!hasMetaMask || !window.ethereum) {
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAccount('');
        setClaimerStickerTokenBalance(null);
        setGiverStickerTokenBalance(null);
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = async () => {
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        setIsConnected(false);
        setContract(null);
        setClaimerStickerTokenBalance(null);
        setGiverStickerTokenBalance(null);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [hasMetaMask]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Claim Tokens</h1>
      
      {!isConnected ? (
        <button
          onClick={handleConnect}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!hasMetaMask}
        >
          {hasMetaMask ? 'Connect Wallet' : 'MetaMask Not Found'}
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Connected Account:</label>
            <div className="p-2 border rounded bg-gray-100">
              {account}
            </div>
          </div>
          
          {claimerStickerTokenBalance !== null && (
            <div>
              <label className="block text-sm font-medium mb-1">Your STICKER Token Balance:</label>
              <div className="p-2 border rounded bg-gray-100">
                {claimerStickerTokenBalance} STICKER
              </div>
            </div>
          )}

          {giverStickerTokenBalance !== null && (
            <div>
              <label className="block text-sm font-medium mb-1">Giver STICKER Token Balance:</label>
              <div className="p-2 border rounded bg-gray-100">
                {giverStickerTokenBalance} STICKER
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Sticker ID:</label>
            <input
              type="text"
              value={stickerId}
              onChange={(e) => setStickerId(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
              placeholder="Enter sticker ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Giver Address:</label>
            <input
              type="text"
              value={giverAddress}
              onChange={(e) => setGiverAddress(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
              placeholder="Enter giver's wallet address"
            />
          </div>
          
          <button
            onClick={handleClaim}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            disabled={loading || !isCorrectNetwork || !hasMetaMask}
          >
            {loading ? 'Claiming...' : 'Claim Tokens'}
          </button>

          {!isCorrectNetwork && hasMetaMask && (
            <div className="text-yellow-600 mt-2">
              Please switch to Avalanche Fuji Testnet to continue
            </div>
          )}
        </div>
      )}
      
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {txHash && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <p>Transaction Hash:</p>
          <a 
            href={`https://testnet.snowtrace.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {txHash}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
