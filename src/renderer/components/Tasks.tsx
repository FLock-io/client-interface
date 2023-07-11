import { useContractRead } from 'wagmi';
import { Avatar, Box, Button, Heading, Spinner, Stack, Text } from 'grommet';
import { useContext, useEffect, useState } from 'react';
import { readContract } from '@wagmi/core';
import { UserFemale } from 'grommet-icons';
import { WalletContext } from 'renderer/context/walletContext';
import {
  FLOCK_TASK_MANAGER_ABI,
  FLOCK_TASK_MANAGER_ADDRESS,
} from '../contracts/flockTaskManager';
import { FLOCK_TASK_ABI } from '../contracts/flockTask';
import { TaskType } from './types';
import Task from './Task';

function Tasks() {
  const { address } = useContext(WalletContext);
  const [tasks, setTasks] = useState<TaskType[]>([] as TaskType[]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const [taskToShow, setTaskToShow] = useState<TaskType>({} as TaskType);

  const { data, isFetching } = useContractRead({
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

          return {
            address: item,
            ...JSON.parse(metadata),
            numberOfParticipants,
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

  const goBack = () => {
    setTaskToShow({} as TaskType);
  };

  if (taskToShow.address) {
    return <Task task={taskToShow} goBack={goBack} />;
  }

  if (isFetching || isLoadingTasks) {
    return (
      <Box align="center" justify="center" fill>
        <Spinner size="medium" />
      </Box>
    );
  }

  return (
    <Box
      gap="medium"
      direction="row-responsive"
      wrap
      width="100%"
      align="center"
      justify="center"
    >
      {tasks?.map((task: TaskType) => {
        return (
          <Box
            background="#FFFFFF"
            key={task.address}
            width="medium"
            align="center"
            justify="center"
            round="small"
            elevation="large"
            pad="medium"
            margin={{ top: 'medium' }}
            height="medium"
          >
            <Box align="center" justify="center">
              <Heading level="2" margin="0">
                {task.name}
              </Heading>
              <Text size="small">{task.description}</Text>
            </Box>
            <Box
              direction="row"
              align="center"
              justify="center"
              pad={{ vertical: 'large' }}
              width="100%"
              gap="medium"
            >
              <Box align="center" justify="center">
                <Heading level="2" color="#6C94EC" margin="0">
                  {task.minParticipants}
                </Heading>
                <Text size="small">Participants Requirements</Text>
              </Box>
              <Box align="center" justify="center">
                <Heading level="2" margin="0">
                  {(
                    ((task.rewardPool / task.rounds) * 100) /
                    task.rewardPool
                  ).toFixed(2)}
                  %
                </Heading>
                <Text size="small">Rewards Return Rate</Text>
              </Box>
            </Box>
            <Box border={{ side: 'top' }} width="90%" />
            <Box
              direction="row"
              align="center"
              justify="between"
              width="100%"
              pad="medium"
            >
              <Box
                direction="row"
                gap="xxsmall"
                align="center"
                justify="center"
              >
                <Text size="small">Short of</Text>
                <Text size="medium" color="#6C94EC">
                  {task.minParticipants - Number(task.numberOfParticipants)}
                </Text>
                <Text size="small">to start</Text>
              </Box>
              {task.numberOfParticipants > 2 && (
                <Box direction="row">
                  <Stack anchor="right">
                    <Box direction="row">
                      <Avatar background="brand" size="small">
                        <UserFemale size="small" />
                      </Avatar>
                      <Box pad="xsmall" />
                    </Box>

                    <Avatar background="brand" size="small">
                      <UserFemale size="small" />
                    </Avatar>
                  </Stack>

                  <Text>+{Number(task.numberOfParticipants) - 2}</Text>
                </Box>
              )}
            </Box>
            <Box>
              <Button
                disabled={!address}
                primary
                onClick={() => {
                  setTaskToShow(task);
                }}
                label="Join"
                margin={{ top: 'medium' }}
                size="medium"
                pad={{ vertical: 'xsmall', horizontal: 'medium' }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default Tasks;
