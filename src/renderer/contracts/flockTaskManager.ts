export const FLOCK_TASK_MANAGER_ADDRESS =
  '0xEF84e714Beb5c10e469EEE341281C449BEE2341E';
export const FLOCK_TASK_MANAGER_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_flockTokenAddress', type: 'address' },
      { internalType: 'address', name: '_coordinatorAddress', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'coordinatorAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: '_metadata', type: 'string' },
      { internalType: 'uint256', name: '_secondsPerRound', type: 'uint256' },
      { internalType: 'string', name: '_modelDefinitionHash', type: 'string' },
      {
        internalType: 'uint256',
        name: '_totalNumberOfRounds',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_minNumberOfParticipants',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_maxNumberOfParticipants',
        type: 'uint256',
      },
      { internalType: 'uint256', name: '_minStakeThreshold', type: 'uint256' },
      {
        internalType: 'uint256',
        name: '_initialRewardPoolSize',
        type: 'uint256',
      },
    ],
    name: 'createTask',
    outputs: [
      { internalType: 'address', name: 'newContract', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'flockToken',
    outputs: [
      { internalType: 'contract FlockToken', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'flockTokenAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTasks',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'subscriptionId',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'tasks',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];
