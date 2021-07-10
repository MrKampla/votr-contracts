const VotrPollFactory = artifacts.require('VotrPollFactory');
const FirstPastThePostPollTypeContract = artifacts.require('FirstPastThePostPollType');

module.exports = function (deployer) {
  deployer.deploy(VotrPollFactory);
  deployer.deploy(FirstPastThePostPollTypeContract);
};
