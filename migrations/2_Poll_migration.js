var BasePoll = artifacts.require('./BasePoll.sol');
var StringHelper = artifacts.require('./StringHelper.sol');
var FPTPPoll = artifacts.require('./FirstPastThePostPoll.sol');
let { prepeareParamsBasePoll, prepeareParamsFPTPPoll } = require('../test/defaultPollparams');

module.exports = function (deployer) {
  deployer.deploy(StringHelper);
  deployer.link(StringHelper, BasePoll);
  deployer.link(StringHelper, FPTPPoll);
  const accounts = ['0x3DD5E8b93B7FEDD1d74ADa420FEF93c2dba7273D', '0x0048e4796eF7e81cCeAF090FE5CEBB684F305be9'];
  deployer.deploy(BasePoll, ...prepeareParamsBasePoll(accounts));
  deployer.deploy(FPTPPoll, ...prepeareParamsFPTPPoll(accounts));
};
