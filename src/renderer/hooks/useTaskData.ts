import { useEffect, useState } from 'react';
import { TaskType } from 'renderer/components/types';
import { FLOCK_TASK_ABI } from 'renderer/contracts/flockTask';
import { useContractRead } from 'wagmi';
import { readContract } from '@wagmi/core';
import { formatUnits } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';

const ipfsClient = ipfsHttpClient({ url: 'https://ipfs.flock.io/api/v0' });

export const useTaskData = ({
  task,
  participantAddress,
}: {
  task: TaskType;
  participantAddress?: `0x${string}`;
}) => {
  const [participantRewardedAmounts, setParticipantRewardedAmounts] = useState<
    bigint[]
  >([]);

  const [participantSlashedAmounts, setParticipantSlashedAmounts] = useState<
    bigint[]
  >([]);

  const [participantRoundBalance, setParticipantRoundBalance] = useState<
    bigint[]
  >([]);

  const [participantRoundRole, setParticipantRoundRole] = useState<bigint[]>(
    []
  );

  const [accuracies, setAccuracies] = useState<
    { round: number; accuracy: number }[]
  >([]);

  const [taskSchema, setTaskSchema] = useState<string>('');

  const { data: dataCurrentRound } = useContractRead({
    address: task.address as `0x${string}`,
    abi: FLOCK_TASK_ABI,
    functionName: 'currentRound',
    watch: true,
  }) as { data: number };

  const { data: dataHasRoundFinished } = useContractRead({
    address: task.address as `0x${string}`,
    abi: FLOCK_TASK_ABI,
    functionName: 'hasRoundFinished',
    args: [dataCurrentRound],
    watch: true,
  }) as { data: boolean };

  const { data: dataStakedBalance } = useContractRead({
    address: task.address as `0x${string}`,
    abi: FLOCK_TASK_ABI,
    functionName: 'stakedTokens',
    args: [participantAddress],
    watch: true,
  }) as { data: bigint };

  const { data: dataCurrentAccuracy } = useContractRead({
    address: task.address as `0x${string}`,
    abi: FLOCK_TASK_ABI,
    functionName: 'roundAccuracy',
    args: [dataCurrentRound],
    watch: true,
  }) as { data: number };

  const { data: currentNumberOfParticipants } = useContractRead({
    address: task.address as `0x${string}`,
    abi: FLOCK_TASK_ABI,
    functionName: 'getNumberOfParticipants',
    watch: true,
  }) as { data: number };

  const loadTaskSchema = async () => {
    const url = `https://flockio.mypinata.cloud/ipfs/${task.schema}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      const data = await response.json();
      const contentString = JSON.stringify(data, null, 2);
      setTaskSchema(contentString);
    } catch (error) {
      console.error('Error fetching data from Pinata:', error);
      setTaskSchema('Error fetching data from Pinata');
      throw error;
    }
  };

  const isTrainingCompleted =
    dataHasRoundFinished && Number(dataCurrentRound) === task.rounds - 1; // Training client starts from 0

  const loadRoundParticipantRewardedAmount = async () => {
    if (participantAddress === undefined) return;
    const result: Promise<bigint>[] = [];
    for (let i = 0; i <= dataCurrentRound; i += 1) {
      const data = readContract({
        address: task.address as `0x${string}`,
        abi: FLOCK_TASK_ABI,
        functionName: 'roundParticipantRewardedAmount',
        args: [i, participantAddress],
      }) as Promise<bigint>;
      result.push(data);
    }
    setParticipantRewardedAmounts(await Promise.all(result));
  };

  const loadRoundParticipantSlashedAmount = async () => {
    if (participantAddress === undefined) return;
    const result: Promise<bigint>[] = [];
    for (let i = 0; i <= dataCurrentRound; i += 1) {
      const data = readContract({
        address: task.address as `0x${string}`,
        abi: FLOCK_TASK_ABI,
        functionName: 'roundParticipantSlashedAmount',
        args: [i, participantAddress],
      }) as Promise<bigint>;
      result.push(data);
    }
    setParticipantSlashedAmounts(await Promise.all(result));
  };

  const totalRewardedAmount =
    Math.round(
      participantRewardedAmounts.reduce(
        (partialSum, a) => partialSum + Number(formatUnits(a, 18)),
        0
      ) * 100
    ) / 100;

  const totalSlashedAmount =
    Math.round(
      participantSlashedAmounts.reduce(
        (partialSum, a) => partialSum + Number(formatUnits(a, 18)),
        0
      ) * 100
    ) / 100;

  const loadRoundParticipantBalance = async () => {
    if (participantAddress === undefined) return;
    const result: Promise<bigint>[] = [];
    for (let i = 0; i <= dataCurrentRound; i += 1) {
      const data = readContract({
        address: task.address as `0x${string}`,
        abi: FLOCK_TASK_ABI,
        functionName: 'roundStakedTokens',
        args: [i, participantAddress],
      }) as Promise<bigint>;
      result.push(data);
    }
    setParticipantRoundBalance(await Promise.all(result));
  };

  const loadRoundParticipantRole = async () => {
    if (participantAddress === undefined) return;
    const result: Promise<bigint>[] = [];
    for (let i = 0; i <= dataCurrentRound; i += 1) {
      const data = readContract({
        address: task.address as `0x${string}`,
        abi: FLOCK_TASK_ABI,
        functionName: 'participantRoles',
        args: [i, participantAddress],
      }) as Promise<bigint>;
      result.push(data);
    }
    setParticipantRoundRole(await Promise.all(result));
  };

  const loadAccuracies = async () => {
    const result: { round: number; accuracy: number }[] = [];
    for (let i = 0; i <= dataCurrentRound; i += 1) {
      const data = readContract({
        address: task.address as `0x${string}`,
        abi: FLOCK_TASK_ABI,
        functionName: 'roundAccuracy',
        args: [i],
      }) as Promise<bigint>;
      // eslint-disable-next-line no-await-in-loop
      result.push({ round: i + 1, accuracy: Number(await data) / 10000 });
    }
    setAccuracies(result);
  };

  useEffect(() => {
    loadRoundParticipantRewardedAmount();
    loadRoundParticipantSlashedAmount();
    loadRoundParticipantBalance();
    loadRoundParticipantRole();
    loadAccuracies();
  }, [dataCurrentRound]);

  useEffect(() => {
    loadTaskSchema();
  }, [task.schema]);

  const finalDataForReport = [];

  for (let index = 0; index < participantRoundBalance.length; index++) {
    let tokenChangePercentage = '0%'; // Default value for the first element and when previous "token" is zero
    const currentToken = participantRoundBalance[index];
    let prevToken = 0n;
    index > 0
      ? (prevToken = participantRoundBalance[index - 1])
      : (prevToken = participantRoundBalance[index]);

    if (prevToken !== 0n) {
      const tokenChange = ((currentToken - prevToken) / prevToken) * 100n;
      tokenChangePercentage = tokenChange.toString() + '%';
    }

    finalDataForReport.push({
      round: index,
      role: participantRoundRole[index]
        ? participantRoundRole[index].toString()
        : '',
      token: tokenChangePercentage,
      balance: participantRoundBalance[index]
        ? Math.round(
            Number(formatUnits(participantRoundBalance[index], 18)) * 100
          ) / 100
        : '0',
    });
  }

  const { data: isEligibleForOAT } = useContractRead({
    address: task.address as `0x${string}`,
    abi: FLOCK_TASK_ABI,
    functionName: 'isEligibleForOAT',
    args: [participantAddress],
    watch: true,
  }) as { data: boolean };

  return {
    dataCurrentRound,
    dataStakedBalance,
    isTrainingCompleted,
    participantRewardedAmounts,
    totalRewardedAmount,
    totalSlashedAmount,
    participantRoundBalance,
    participantRoundRole,
    finalDataForReport,
    dataCurrentAccuracy,
    accuracies,
    isEligibleForOAT,
    currentNumberOfParticipants,
    taskSchema,
  };
};

export default useTaskData;
