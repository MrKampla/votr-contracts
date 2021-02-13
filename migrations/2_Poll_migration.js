const BasePoll = artifacts.require('./polls/BasePoll.sol');
const FPTPPoll = artifacts.require('./polls/FirstPastThePostPoll.sol');
const CumulativePoll = artifacts.require('./polls/CumulativePoll.sol');
const EvaluativePoll = artifacts.require('./polls/EvaluativePoll.sol');
const QuadraticPoll = artifacts.require('./polls/QuadraticPoll.sol');
const QuadraticVotingSeries = artifacts.require('./factories/QuadraticVotingSeries.sol');
const VotrPollFactory = artifacts.require('./factories/VotrPollFactory.sol');
const VotrSeriesFactory = artifacts.require('./factories/VotrSeriesFactory.sol');

const {
  prepeareParamsBasePoll,
  prepeareParamsFPTPPoll,
  prepeareParamsCumulativePoll,
  prepeareParamsEvaluativePoll,
  prepeareParamsQuadraticPoll,
  prepeareParamsQuadraticSeries,
} = require('../test/defaultPollparams');

module.exports = function (deployer) {
  deployer.deploy(BasePoll, ...prepeareParamsBasePoll());
  deployer.deploy(FPTPPoll, ...prepeareParamsFPTPPoll());
  deployer.deploy(CumulativePoll, ...prepeareParamsCumulativePoll());
  deployer.deploy(EvaluativePoll, ...prepeareParamsEvaluativePoll());
  deployer.deploy(QuadraticPoll, ...prepeareParamsQuadraticPoll());
  deployer.deploy(QuadraticVotingSeries, ...prepeareParamsQuadraticSeries());
  deployer.deploy(VotrPollFactory);
  deployer.deploy(VotrSeriesFactory);
};
