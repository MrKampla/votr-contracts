require('ts-node').register({
  files: true,
});

const HDWalletProvider = require('@truffle/hdwallet-provider');

const privateKey = require('./secrets.json').privateKey;
const nodeProviderURL = require('./secrets.json').nodeProviderURL;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      // host: "172.21.80.1",
      // host: "172.23.192.1",
      host: '127.0.0.1',
      port: 8545,
      network_id: '*', // Match any network id
      gas: 6721975,
    },
    ropsten: {
      provider: () => new HDWalletProvider(privateKey, nodeProviderURL),
      network_id: 3,
      gas: 5500000,
      confirmations: 1,
      timeoutBlocks: 2000,
      skipDryRun: true,
      networkCheckTimeout: 1000000,
    },
  },
  mocha: {
    // reporter: 'eth-gas-reporter',
  },
  compilers: {
    solc: {
      version: '0.8.6',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
