const StringHelper = artifacts.require('./StringHelper.sol');
const BasePoll = artifacts.require('./BasePoll.sol');
const FPTPPoll = artifacts.require('./FirstPastThePostPoll.sol');
const CumulativePoll = artifacts.require('./CumulativePoll.sol');
const EvaluativePoll = artifacts.require('./EvaluativePoll.sol');
const QuadraticPoll = artifacts.require('./QuadraticPoll.sol');
const QuadraticVotingSeries = artifacts.require('./QuadraticVotingSeries.sol');
const VotrPollFactory = artifacts.require('./VotrPollFactory.sol');

const {
  prepeareParamsBasePoll,
  prepeareParamsFPTPPoll,
  prepeareParamsCumulativePoll,
  prepeareParamsEvaluativePoll,
  prepeareParamsQuadraticPoll,
  prepeareParamsQuadraticSeries,
} = require('../test/defaultPollparams');

module.exports = function (deployer) {
  deployer.deploy(StringHelper);
  deployer.link(StringHelper, [
    BasePoll,
    FPTPPoll,
    CumulativePoll,
    EvaluativePoll,
    QuadraticPoll,
    QuadraticVotingSeries,
    // VotrPollFactory,
  ]);

  deployer.deploy(BasePoll, ...prepeareParamsBasePoll());
  deployer.deploy(FPTPPoll, ...prepeareParamsFPTPPoll());
  deployer.deploy(CumulativePoll, ...prepeareParamsCumulativePoll());
  deployer.deploy(EvaluativePoll, ...prepeareParamsEvaluativePoll());
  deployer.deploy(QuadraticPoll, ...prepeareParamsQuadraticPoll());
  deployer.deploy(QuadraticVotingSeries, ...prepeareParamsQuadraticSeries());
  // deployer.deploy(VotrPollFactory);
};
