import { VotrPollFactoryInstance } from 'types/truffle-contracts/VotrPollFactory';
import { constants } from '@openzeppelin/test-helpers';

const ZERO_ADDRESS = constants.ZERO_ADDRESS;

let pollFactory: VotrPollFactoryInstance;
type PollCreationParams = Parameters<typeof pollFactory.createPoll>;
interface PollCreationConfig {
  pollTypeAddress?: string;
  allowVoteDelegation?: boolean;
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

export const prepearePollCreationParams: (
  config: PollCreationConfig,
  accounts: Truffle.Accounts
) => PollCreationParams = ({ pollTypeAddress, token, voters, allowVoteDelegation }, accounts) => [
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
    endDate: Math.floor(new Date().getTime() / 1000) + 60 * 2,
    quorum: 2,
    title: 'title',
  },
  ['choice1', 'choice2'],
  voters ?? [
    { addr: accounts[1], allowedVotes: 1 },
    { addr: accounts[2], allowedVotes: 2 },
  ],
];
