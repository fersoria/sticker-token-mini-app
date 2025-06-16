require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    fuji: {
      url: process.env.AVALANCHE_FUJI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 43113
    }
  },
  etherscan: {
    apiKey: {
      avalancheFuji: process.env.SNOWTRACE_API_KEY
    }
  },
};