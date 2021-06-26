const SeriesFactory = artifacts.require('./VotrSeriesFactory.sol');
const QuadraticVotingSeries = artifacts.require('./QuadraticVotingSeries.sol');
const { prepeareParamsQuadraticSeries } = require('./defaultPollparams');
const { expectEvent } = require('@openzeppelin/test-helpers');

contract('VotrSeriesFactory', async (accounts) => {
  let seriesContract;
  beforeEach(async () => {
    seriesContract = await SeriesFactory.new();
  });

  it('Successfully creates new series', async () => {
    const params = prepeareParamsQuadraticSeries(accounts.slice(0, 2));
    params.shift();
    const res = await seriesContract.createSeries(...params);
    const createdSeries = await QuadraticVotingSeries.at(res.logs[0].args.series);
    assert.isOk(createdSeries);
    assert.equal(await seriesContract.numberOfSeries(), 1);
  });

  it('Emits event on new series creation', async () => {
    const params = prepeareParamsQuadraticSeries(accounts.slice(0, 2));
    params.shift();
    await expectEvent(await seriesContract.createSeries(...params), 'SeriesCreated');
  });
});

export { };