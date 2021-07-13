const VotrPollFactory = artifacts.require('VotrPollFactory');
const FirstPastThePostPollTypeContract = artifacts.require('FirstPastThePostPollType');
const CumulativePollTypeContract = artifacts.require('CumulativePollType');
const EvaluativePollTypeContract = artifacts.require('EvaluativePollType');
const QuadraticPollTypeContract = artifacts.require('QuadraticPollType');

module.exports = function (deployer) {
  deployer.deploy(VotrPollFactory);
  deployer.deploy(FirstPastThePostPollTypeContract);
  deployer.deploy(CumulativePollTypeContract);
  deployer.deploy(EvaluativePollTypeContract);
  deployer.deploy(QuadraticPollTypeContract);
};
