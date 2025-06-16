const hre = require("hardhat");
require('dotenv').config();

async function main() {
    // Obtener la dirección del signer (el deployer)
    const [deployer] = await hre.ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("Deploying contracts with the account:", deployerAddress);

    // Crear el contrato
    const StickerManager = await hre.ethers.getContractFactory("StickerManager");
    const stickerManager = await StickerManager.deploy(deployerAddress);
    
    // Esperar a que se despliegue
    await stickerManager.waitForDeployment();
    
    // Mostrar la dirección del contrato
    console.log("StickerManager deployed to:", await stickerManager.getAddress());
}

// Ejecutar el main y manejar errores
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});