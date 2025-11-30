require('dotenv').config()
require('@nomicfoundation/hardhat-toolbox')

module.exports = {
  solidity: {
    version: '0.8.20',
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    espace: {
      url: process.env.ESPACE_RPC_URL || 'https://evm.confluxrpc.com',
      accounts: process.env.RELAYER_PRIVATE_KEY && process.env.RELAYER_PRIVATE_KEY !== '0xYOUR_RELAYER_PRIVATE_KEY'
        ? [process.env.RELAYER_PRIVATE_KEY]
        : []
    }
  }
}