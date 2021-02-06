const StringHelper = artifacts.require('./StringHelper.sol');
const BasePoll = artifacts.require('./BasePoll.sol');
const FPTPPoll = artifacts.require('./FirstPastThePostPoll.sol');
const CumulativePoll = artifacts.require('./CumulativePoll.sol');
const EvaluativePoll = artifacts.require('./EvaluativePoll.sol');

const {
  prepeareParamsBasePoll,
  prepeareParamsFPTPPoll,
  prepeareParamsCumulativePoll,
  prepeareParamsEvaluativePoll,
} = require('../test/defaultPollparams');

module.exports = function (deployer) {
  deployer.deploy(StringHelper);
  deployer.link(StringHelper, BasePoll);
  deployer.link(StringHelper, FPTPPoll);
  deployer.link(StringHelper, CumulativePoll);
  deployer.link(StringHelper, EvaluativePoll);
  const accounts = ['0x3DD5E8b93B7FEDD1d74ADa420FEF93c2dba7273D', '0x0048e4796eF7e81cCeAF090FE5CEBB684F305be9'];
  deployer.deploy(BasePoll, ...prepeareParamsBasePoll(accounts));
  deployer.deploy(FPTPPoll, ...prepeareParamsFPTPPoll(accounts));
  deployer.deploy(CumulativePoll, ...prepeareParamsCumulativePoll(accounts));
  deployer.deploy(EvaluativePoll, ...prepeareParamsEvaluativePoll(accounts));
};
