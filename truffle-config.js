require('ts-node').register({
  files: true,
});

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
    develop: {
      port: 8545,
    },
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
