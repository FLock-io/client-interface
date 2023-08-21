export const FLOCK_TASK_MANAGER_ADDRESS =
  '0x2afFceA0b4489658dFAF8a6e53dE5F5108BFeD75';
  export const FLOCK_TASK_MANAGER_ABI = [
    {
      inputs: [],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint8',
          name: 'version',
          type: 'uint8',
        },
      ],
      name: 'Initialized',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      inputs: [],
      name: 'coordinatorAddress',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'string',
          name: '_metadata',
          type: 'string',
        },
        {
          internalType: 'uint256',
          name: '_secondsPerRound',
          type: 'uint256',
        },
        {
          internalType: 'string',
          name: '_modelDefinitionHash',
          type: 'string',
        },
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
        {
          internalType: 'uint256',
          name: '_minStakeThreshold',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: '_initialRewardPoolSize',
          type: 'uint256',
        },
      ],
      name: 'createTask',
      outputs: [
        {
          internalType: 'address',
          name: 'newContract',
          type: 'address',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'flockTokenAddress',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getTasks',
      outputs: [
        {
          internalType: 'address[]',
          name: '',
          type: 'address[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_flockTokenAddress',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '_coordinatorAddress',
          type: 'address',
        },
      ],
      name: 'initialize',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_task',
          type: 'address',
        },
      ],
      name: 'removeTask',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_coordinatorAddress',
          type: 'address',
        },
      ],
      name: 'setCoordinator',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_flockTokenAddress',
          type: 'address',
        },
      ],
      name: 'setFlockToken',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'subscriptionId',
      outputs: [
        {
          internalType: 'uint64',
          name: '',
          type: 'uint64',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      name: 'tasks',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];
  
