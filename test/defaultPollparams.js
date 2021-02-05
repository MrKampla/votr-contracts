function prepeareParamsBasePoll(accounts) {
  return [
    '0x3DD5E8b93B7FEDD1d74ADa420FEF93c2dba7273D',
    'Presidential elections',
    'This is a test poll',
    [
      '0x426964656e000000000000000000000000000000000000000000000000000000', //Biden
      '0x5472756d70000000000000000000000000000000000000000000000000000000', //Trump
    ],
    accounts,
    [1, 1],
    2,
    new Date().getTime() + 60 * 2 * 1000, // 2 minutes from now
    true,
  ];
}

function prepeareParamsFPTPPoll(accounts) {
  return [
    '0x3DD5E8b93B7FEDD1d74ADa420FEF93c2dba7273D',
    'Presidential elections',
    'This is a test poll',
    [
      '0x426964656e000000000000000000000000000000000000000000000000000000', //Biden
      '0x5472756d70000000000000000000000000000000000000000000000000000000', //Trump
    ],
    accounts,
    2,
    new Date().getTime() + 60 * 2 * 1000, // 2 minutes from now
    true,
  ];
}

module.exports = { prepeareParamsBasePoll, prepeareParamsFPTPPoll };
