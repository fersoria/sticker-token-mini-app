const { createMetadata } = require('@sherrylinks/sdk');

// Configuración del contrato
const contractAddress = '0x4606f77C54Fb4FD9Dc22138A024f7613DAa98038';
const abi = require('../artifacts/contracts/StickerManager.sol/StickerManager.json').abi;

// Función para crear el metadata para una etiqueta NFC
function createNfcMetadata(stickerId, giverAddress) {
    return createMetadata({
        url: 'http://localhost:5173', // URL de tu miniapp local
        icon: 'https://nfc2web3-app.vercel.app/icon.png',
        title: 'Claim STICKER Tokens',
        description: 'Claim your STICKER tokens by scanning this NFC sticker',
        actions: [
            {
                type: 'blockchain',
                label: 'Claim STICKER Tokens',
                address: contractAddress,
                abi,
                functionName: 'claim',
                chains: { source: 'avalanche' },
                params: [
                    {
                        name: 'stickerId',
                        label: 'Sticker ID',
                        type: 'uint256',
                        value: stickerId,
                        fixed: true,
                    },
                    {
                        name: 'giverAddress',
                        label: 'Giver Address',
                        type: 'address',
                        value: giverAddress,
                        fixed: true,
                    },
                ],
            },
        ],
    });
}

// Ejemplo: crear metadata para un sticker con ID 1 y giver 0x947aA4B871Fa7CCaD78Be43B493197d98398f712
const metadata = createNfcMetadata(1, '0x947aA4B871Fa7CCaD78Be43B493197d98398f712');
console.log('Metadata:', metadata);