import { useEffect, useState } from 'react';
import { TaskType } from 'renderer/components/types';
import { FLOCK_TASK_ABI } from 'renderer/contracts/flockTask';
import { useContractRead } from 'wagmi';
import { readContract } from '@wagmi/core';

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

  const isTrainingCompleted =
    dataHasRoundFinished && Number(dataCurrentRound) === task.rounds - 1; // Training client starts from 0

  const loadRoundParticipantRewardedAmount = async () => {
    if (participantAddress === undefined) return;
    const result: Promise<bigint>[] = [];
    for (let i = 0; i < dataCurrentRound; i += 1) {
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

  useEffect(() => {
    loadRoundParticipantRewardedAmount();
  }, [dataCurrentRound]);

  const totalRewardedAmount = participantRewardedAmounts.reduce(
    (partialSum, a) => Number(partialSum) + Number(a),
    0
  );

  return {
    dataCurrentRound,
    isTrainingCompleted,
    participantRewardedAmounts,
    totalRewardedAmount,
  };
};

export default useTaskData;
