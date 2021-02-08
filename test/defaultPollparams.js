const accounts = ['0xE422FdE596490a667739CFf3f5B6B3F88b958208', '0x44dC963B40E3B08Ec8381F10cD3Cd56da8E747aA'];

function prepeareParamsBasePoll(defaultAccounts = accounts) {
  return [
    '0xE422FdE596490a667739CFf3f5B6B3F88b958208',
    'Presidential elections',
    'This is a test poll',
    [
      '0x426964656e000000000000000000000000000000000000000000000000000000', //Biden
      '0x5472756d70000000000000000000000000000000000000000000000000000000', //Trump
    ],
    defaultAccounts,
    [1, 1],
    2,
    new Date().getTime() + 60 * 2 * 1000, // 2 minutes from now
    true,
  ];
}

function prepeareParamsFPTPPoll(defaultAccounts = accounts) {
  return [
    '0xE422FdE596490a667739CFf3f5B6B3F88b958208',
    'Presidential elections',
    'This is a test poll',
    [
      '0x426964656e000000000000000000000000000000000000000000000000000000', //Biden
      '0x5472756d70000000000000000000000000000000000000000000000000000000', //Trump
    ],
    defaultAccounts,
    2,
    new Date().getTime() + 60 * 2 * 1000, // 2 minutes from now
    true,
  ];
}

function prepeareParamsCumulativePoll(defaultAccounts = accounts) {
  return [
    '0xE422FdE596490a667739CFf3f5B6B3F88b958208',
    'Presidential elections',
    'This is a test poll',
    [
      '0x426964656e000000000000000000000000000000000000000000000000000000', //Biden
      '0x5472756d70000000000000000000000000000000000000000000000000000000', //Trump
    ],
    defaultAccounts,
    [3, 2],
    2,
    new Date().getTime() + 60 * 2 * 1000, // 2 minutes from now
    true,
  ];
}

function prepeareParamsEvaluativePoll(defaultAccounts = accounts) {
  return [
    '0xE422FdE596490a667739CFf3f5B6B3F88b958208',
    'Presidential elections',
    'This is a test poll',
    [
      '0x426964656e000000000000000000000000000000000000000000000000000000', //Biden
      '0x5472756d70000000000000000000000000000000000000000000000000000000', //Trump
    ],
    defaultAccounts,
    2,
    new Date().getTime() + 60 * 2 * 1000, // 2 minutes from now
  ];
}

function prepeareParamsQuadraticPoll(defaultAccounts = accounts) {
  return [
    '0xE422FdE596490a667739CFf3f5B6B3F88b958208',
    'Presidential elections',
    'This is a test poll',
    [
      '0x426964656e000000000000000000000000000000000000000000000000000000', //Biden
      '0x5472756d70000000000000000000000000000000000000000000000000000000', //Trump
    ],
    defaultAccounts,
    [100, 100],
    1,
    new Date().getTime() + 60 * 2 * 1000, // 2 minutes from now,
    true,
  ];
}

function prepeareParamsQuadraticSeries(defaultAccounts = accounts) {
  return ['0xE422FdE596490a667739CFf3f5B6B3F88b958208', defaultAccounts, [100, 100], true];
}

function prepeareParamsAddNewPollToQuadraticSeries() {
  return [
    'Title',
    'Description',
    [
      '0x426964656e000000000000000000000000000000000000000000000000000000', //Biden
      '0x5472756d70000000000000000000000000000000000000000000000000000000', //Trump
    ],
    1,
    new Date().getTime() + 60 * 2 * 1000, // 2 minutes from now,
  ];
}

module.exports = {
  prepeareParamsBasePoll,
  prepeareParamsFPTPPoll,
  prepeareParamsCumulativePoll,
  prepeareParamsEvaluativePoll,
  prepeareParamsQuadraticPoll,
  prepeareParamsQuadraticSeries,
  prepeareParamsAddNewPollToQuadraticSeries,
};
