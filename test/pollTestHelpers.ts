import { VotrPollFactoryInstance } from 'types/truffle-contracts/VotrPollFactory';
import { constants } from '@openzeppelin/test-helpers';
import { time } from '@openzeppelin/test-helpers';
const ZERO_ADDRESS = constants.ZERO_ADDRESS;

let pollFactory: VotrPollFactoryInstance;
type PollCreationParams = Promise<Parameters<typeof pollFactory.createPoll>>;
interface PollCreationConfig {
  pollTypeAddress?: string;
  allowVoteDelegation?: boolean;
  callbackContractAddress?: string;
  quorum?: number;
  token?: {
    basedOnToken?: string;
    name?: string;
    symbol?: string;
  };
  voters?: {
    addr: string;
    allowedVotes: number;
  }[];
}

export const getCurrentTimeInSeconds = async () => Math.floor(await time.latest());

export const prepearePollCreationParams: (
  config: PollCreationConfig,
  accounts: Truffle.Accounts
) => PollCreationParams = async (
  { pollTypeAddress, token, voters, allowVoteDelegation, callbackContractAddress, quorum },
  accounts
) => [
  pollTypeAddress ?? ZERO_ADDRESS,
  {
    basedOnToken: token?.basedOnToken ?? ZERO_ADDRESS,
    name: token?.name ?? 'vTest Token',
    symbol: token?.symbol ?? 'VTST',
  },
  {
    allowVoteDelegation: allowVoteDelegation ?? true,
    description: 'description',
    chairman: accounts[0],
    endDate: (await getCurrentTimeInSeconds()) + 60 * 30, // 30 minutes from now
    quorum: quorum ?? 2,
    title: 'title',
    callbackContractAddress: callbackContractAddress ?? ZERO_ADDRESS,
  },
  ['choice1', 'choice2'],
  voters ?? [
    { addr: accounts[1], allowedVotes: 1 },
    { addr: accounts[2], allowedVotes: 2 },
  ],
];
