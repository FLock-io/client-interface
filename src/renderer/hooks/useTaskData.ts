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
  }) as { data: number };

  const { data: currentNumberOfParticipants } = useContractRead({
    address: task.address as `0x${string}`,
    abi: FLOCK_TASK_ABI,
    functionName: 'getNumberOfParticipants',
    watch: true,
  }) as { data: number };

  const loadTaskSchema = async () => {
    try {
      const chunks = [];
      // eslint-disable-next-line no-restricted-syntax
      for await (const chunk of ipfsClient.cat(task.schema)) {
        chunks.push(chunk);
      }

      const content = Buffer.concat(chunks);
      const contentString = JSON.stringify(
        JSON.parse(JSON.parse(content.toString() as string)),
        null,
        2
      );
      setTaskSchema(contentString);
    } catch (error) {
      console.error('Error fetching data from IPFS:', error);
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

  const totalRewardedAmount = participantRewardedAmounts.reduce(
    (partialSum, a) => Number(partialSum) + Number(a),
    0
  );

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
      result.push({ round: i, accuracy: Number(await data) });
    }
    setAccuracies(result);
  };

  useEffect(() => {
    loadRoundParticipantRewardedAmount();
    loadRoundParticipantBalance();
    loadRoundParticipantRole();
    loadAccuracies();
  }, [dataCurrentRound]);

  useEffect(() => {
    loadTaskSchema();
  }, [task.schema]);

  const finalDataForReport = [];

  for (let index = 0; index < participantRewardedAmounts.length; index++) {
    const element = participantRewardedAmounts[index];
    let tokenChangePercentage = '0%'; // Default value for the first element and when previous "token" is zero
    const currentToken = element;
    let prevToken = 0n;
    index > 0
      ? (prevToken = participantRewardedAmounts[index - 1])
      : (prevToken = participantRewardedAmounts[index]);

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
        ? formatUnits(participantRoundBalance[index], 18)
        : '',
    });
  }

  return {
    dataCurrentRound,
    dataStakedBalance,
    isTrainingCompleted,
    participantRewardedAmounts,
    totalRewardedAmount,
    participantRoundBalance,
    participantRoundRole,
    finalDataForReport,
    dataCurrentAccuracy,
    accuracies,
    currentNumberOfParticipants,
    taskSchema,
  };
};

export default useTaskData;
