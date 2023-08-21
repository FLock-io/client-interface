import { useAccount, useContractRead } from 'wagmi';
import { Box, Button, DataTable, Layer, Spinner, Text } from 'grommet';
import { useEffect, useState } from 'react';
import { readContract } from '@wagmi/core';
import {
  FLOCK_TASK_MANAGER_ABI,
  FLOCK_TASK_MANAGER_ADDRESS,
} from '../contracts/flockTaskManager';
import { FLOCK_TASK_ABI } from '../contracts/flockTask';
import { TaskType } from './types';
import Task from './Task';
import { CreateTask } from './CreateTask';

function Tasks() {
  const { address } = useAccount();
  const [tasks, setTasks] = useState<TaskType[]>([] as TaskType[]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const [taskToShow, setTaskToShow] = useState<TaskType>({} as TaskType);

  const { data, isFetching, refetch } = useContractRead({
    address: FLOCK_TASK_MANAGER_ADDRESS as `0x${string}`,
    abi: FLOCK_TASK_MANAGER_ABI,
    functionName: 'getTasks',
  });

  const loadTasks = async () => {
    if (data) {
      setIsLoadingTasks(true);
      const loadedTasks: TaskType[] = await Promise?.all(
        (data as Array<string>)?.map(async (item) => {
          const metadata = (await readContract({
            address: item as `0x${string}`,
            abi: FLOCK_TASK_ABI,
            functionName: 'metadata',
          })) as string;

          const numberOfParticipants = (await readContract({
            address: item as `0x${string}`,
            abi: FLOCK_TASK_ABI,
            functionName: 'getNumberOfParticipants',
          })) as number;

          const currentRound = (await readContract({
            address: item as `0x${string}`,
            abi: FLOCK_TASK_ABI,
            functionName: 'currentRound',
          })) as number;

          const hasRoundFinished = (await readContract({
            address: item as `0x${string}`,
            abi: FLOCK_TASK_ABI,
            functionName: 'hasRoundFinished',
            args: [currentRound],
          })) as number;

          const taskObject = JSON.parse(metadata);

          return {
            address: item,
            ...taskObject,
            numberOfParticipants: Number(numberOfParticipants),
            isTrainingCompleted:
              hasRoundFinished &&
              Number(currentRound) === taskObject.rounds - 1, // Training client starts from 0
          } as TaskType;
        })
      );

      setTasks(loadedTasks);
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (!showCreateTask) {
      refetch();
    }
  }, [showCreateTask]);

  const goBack = () => {
    setTaskToShow({} as TaskType);
  };

  if (taskToShow.address) {
    return <Task task={taskToShow} goBack={goBack} />;
  }

  return (
    <>
      {showCreateTask && (
        <Layer full>
          <CreateTask setShowCreateTask={setShowCreateTask} />
        </Layer>
      )}
      {isFetching || isLoadingTasks ? (
        <Box align="center" justify="center" fill>
          <Spinner size="medium" />
        </Box>
      ) : (
        <Box gap="large">
          <Box direction="row" align="center" justify="end">
            <Button
              disabled={!address}
              primary
              onClick={() => setShowCreateTask(true)}
              label="Create Task"
              margin={{ top: 'medium' }}
              size="medium"
              pad={{ vertical: 'xsmall', horizontal: 'medium' }}
            />
          </Box>
          <Box>
            <DataTable
              sortable
              columns={[
                {
                  property: 'name',
                  header: 'Name',
                  primary: true,
                },
                {
                  property: 'description',
                  header: 'Description',
                  render: (datum) => (
                    <Box width="300px">
                      <Text truncate={true}>{datum.description}</Text>
                    </Box>
                  ),
                },
                {
                  property: 'minParticipants',
                  header: 'Min Participants',
                },
                {
                  property: 'maxParticipants',
                  header: 'Max Participants',
                },
                {
                  property: 'rewardPool',
                  header: 'Rewards Return Rate',
                  render: (datum) => (
                    <Text>
                      {(
                        ((datum.rewardPool / datum.rounds) * 100) /
                        datum.rewardPool
                      ).toFixed(2)}
                      %
                    </Text>
                  ),
                },
                {
                  property: 'numberOfParticipants',
                  header: 'Number of Participants',
                },
                {
                  property: '',
                  header: 'Short of',
                  render: (datum) => (
                    <Text>
                      {datum.minParticipants -
                        Number(datum.numberOfParticipants)}
                    </Text>
                  ),
                },
                {
                  property: 'isTrainingCompleted',
                  header: 'Complete',
                  render: (datum) => (
                    <Text>{datum.isTrainingCompleted ? 'Yes' : 'No'}</Text>
                  ),
                },
                {
                  property: '',
                  header: 'Actions',
                  render: (datum) => (
                    <Button
                      disabled={!address}
                      primary
                      onClick={() => {
                        setTaskToShow(datum);
                      }}
                      label="Join"
                      margin={{ top: 'medium' }}
                      size="medium"
                      pad={{ vertical: 'xsmall', horizontal: 'medium' }}
                    />
                  ),
                },
              ]}
              data={tasks}
            />
          </Box>
        </Box>
      )}
    </>
  );
}

export default Tasks;
