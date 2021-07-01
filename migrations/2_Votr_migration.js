const VotrPollFactory = artifacts.require('VotrPollFactory');

module.exports = function (deployer) {
  deployer.deploy(VotrPollFactory);
};
