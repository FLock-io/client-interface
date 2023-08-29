import { useEffect, useState } from 'react';
import { TaskType } from 'renderer/components/types';
import { FLOCK_TASK_ABI } from 'renderer/contracts/flockTask';
import { useContractRead } from 'wagmi';
import { readContract } from '@wagmi/core';
import { formatUnits } from 'ethers';

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
    (partialSum, a) =>
      Number(formatUnits(partialSum, 18)) + Number(formatUnits(a, 18)),
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
      result.push({ round: i + 1, accuracy: Number(await data) / 10000 });
    }
    setAccuracies(result);
  };

  useEffect(() => {
    loadRoundParticipantRewardedAmount();
    loadRoundParticipantBalance();
    loadRoundParticipantRole();
    loadAccuracies();
  }, [dataCurrentRound]);

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
        ? formatUnits(participantRoundBalance[index], 18)
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
    participantRoundBalance,
    participantRoundRole,
    finalDataForReport,
    dataCurrentAccuracy,
    accuracies,
    isEligibleForOAT
    currentNumberOfParticipants,
  };
};

export default useTaskData;
