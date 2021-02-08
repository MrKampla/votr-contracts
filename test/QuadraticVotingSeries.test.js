let QuadraticVotingSeries = artifacts.require('./QuadraticVotingSeries.sol');
let QuadraticPoll = artifacts.require('./QuadraticPoll.sol');
let { prepeareParamsQuadraticSeries, prepeareParamsAddNewPollToQuadraticSeries } = require('./defaultPollparams');
const { expectRevert } = require('@openzeppelin/test-helpers');

contract('QuadraticVotingSeries', async (accounts) => {
  let seriesContract;
  beforeEach(async () => {
    seriesContract = await QuadraticVotingSeries.new(...prepeareParamsQuadraticSeries(accounts.slice(0, 2)));
  });

  it('new poll in series successfuly', async () => {
    await seriesContract.addPoll(...prepeareParamsAddNewPollToQuadraticSeries());
    assert.equal((await seriesContract.getNumberOfPollsInTheSeries()).toNumber(), 1);

    const pollContractAddresss = await seriesContract.polls(0);
    const pollInstance = await QuadraticPoll.at(pollContractAddresss);

    assert.isOk(pollInstance);
  });

  it(`Fails to add new poll to series if previous one hasn't finished`, async () => {
    await seriesContract.addPoll(...prepeareParamsAddNewPollToQuadraticSeries());
    assert.equal((await seriesContract.getNumberOfPollsInTheSeries()).toNumber(), 1);

    expectRevert(
      seriesContract.addPoll(...prepeareParamsAddNewPollToQuadraticSeries()),
      'Last poll in the series has not yet ended, cannot add new one.'
    );
  });
  it(`Successfully closes`, async () => {
    await seriesContract.addPoll(...prepeareParamsAddNewPollToQuadraticSeries());
    // await seriesContract.closeSeries();
    // console.log((await seriesContract.getNumberOfPollsInTheSeries()).toNumber());
    expectRevert(seriesContract.addPoll(...prepeareParamsAddNewPollToQuadraticSeries()), 'The series has been ended.');
  });
});
