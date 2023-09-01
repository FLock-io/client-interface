import { useAccount, useContractRead } from 'wagmi';
import { Box, Button, Heading, Layer, Spinner, Text, TextInput } from 'grommet';
import { useEffect, useState } from 'react';
import { readContract } from '@wagmi/core';
import {
  Chat,
  CreditCard,
  Scorecard,
  Image,
  UserFemale,
  Search,
  StatusGood,
} from 'grommet-icons';
import {
  FLOCK_TASK_MANAGER_ABI,
  FLOCK_TASK_MANAGER_ADDRESS,
} from '../contracts/flockTaskManager';
import { FLOCK_TASK_ABI } from '../contracts/flockTask';
import { TaskType } from './types';
import Task from './Task';
import { CreateTask } from './CreateTask';

interface TaskCardProps {
  cardColor: string;
  // eslint-disable-next-line no-undef
  cardIcon: JSX.Element;
}

type CardColors = {
  [key: string]: TaskCardProps;
};

const cardColors: CardColors = {
  'Large Language Model Finetuning': {
    cardColor: '#A4C0FF',
    cardIcon: <Chat color="black" size="20px" />,
  },
  'NLP': {
    cardColor: '#E69FBD',
    cardIcon: <Scorecard color="black" size="20px" />,
  },
  'Time series prediction': {
    cardColor: '#D9D9D9',
    cardIcon: <CreditCard color="black" size="20px" />,
  },
  'Classification': {
    cardColor: '#BDD4DA',
    cardIcon: <Image color="black" size="20px" />,
  },
  'Finance': {
    cardColor: '#A4C0FF',
    cardIcon: <CreditCard color="black" size="20px" />,
  },
};

function Tasks() {
  const { address } = useAccount();
  const [tasks, setTasks] = useState<TaskType[]>([] as TaskType[]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'completed'>('all');

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
        <Box>
          <Box
            direction="row-responsive"
            align="center"
            justify="between"
            pad={{ top: 'large', bottom: 'medium', horizontal: 'large' }}
          >
            <Box direction="row-responsive" gap="large" align="center">
              <Box direction="row" alignSelf="end" gap="xsmall">
                <Text>Tasks</Text>
                {tasks.length}
              </Box>
              <TextInput placeholder="Search" icon={<Search />} />
              <Button
                primary={filterMode === 'all'}
                plain={filterMode !== 'all'}
                onClick={() => setFilterMode('all')}
                label="All"
              />
              <Button
                primary={filterMode === 'completed'}
                plain={filterMode !== 'completed'}
                onClick={() => setFilterMode('completed')}
                label="Completed"
              />
            </Box>
            <Box direction="row-responsive" align="center" gap="large">
              <Button
                disabled={!address}
                primary
                onClick={() => setShowCreateTask(true)}
                label="Create Task"
                size="medium"
                pad={{ vertical: 'xsmall', horizontal: 'medium' }}
              />
            </Box>
          </Box>
          <Box
            direction="row-responsive"
            wrap
            width="100%"
            align="center"
            justify="center"
            gap="small"
          >
            {tasks
              ?.filter(
                (task) => filterMode === 'all' || task.isTrainingCompleted
              )
              .map((task: TaskType) => {
                return (
                  <Box
                    background="#FFFFFF"
                    key={task.address}
                    align="start"
                    justify="center"
                    round="small"
                    elevation="large"
                    pad="medium"
                    margin={{ top: 'small' }}
                    height={{ min: 'small' }}
                    width="400px"
                    border={{ color: 'black', size: 'small' }}
                  >
                    <Box height="60px" overflow="hidden">
                      <Heading level="3" margin="none">
                        {task.name}
                      </Heading>
                    </Box>
                    <Box height="xxsmall" overflow="hidden">
                      <Text>{task.description}</Text>
                    </Box>
                    <Box
                      direction="row"
                      width="100%"
                      align="center"
                      gap="medium"
                      pad={{ bottom: 'xsmall', top: 'xsmall' }}
                    >
                      <Box
                        border={{ color: 'black', size: 'small' }}
                        round="small"
                        pad="xsmall"
                        background={cardColors[task.taskType]?.cardColor}
                        direction="row"
                        gap="small"
                        align="center"
                        width={{ max: '70%' }}
                      >
                        {cardColors[task.taskType]?.cardIcon}
                        <Text weight="bold" truncate>
                          {task.taskType === 'Large Language Model Finetuning'
                            ? 'LLM Finetuning'
                            : task.taskType}
                        </Text>
                      </Box>
                      {task.isTrainingCompleted && <StatusGood color="green" />}
                    </Box>
                    <Box
                      direction="row"
                      justify="between"
                      border={{
                        color: 'black',
                        size: 'small',
                        style: 'solid',
                        side: 'bottom',
                      }}
                      pad={{ bottom: 'xsmall' }}
                    >
                      <Box direction="row" align="center" gap="xsmall">
                        <Heading level="3" margin="0">
                          {(
                            ((task.rewardPool / task.rounds) * 100) /
                            task.rewardPool
                          ).toFixed(2)}
                          %
                        </Heading>
                        <Box basis="1/2">
                          <Text size="small">Rewards Return Rate</Text>
                        </Box>
                      </Box>
                      <Box
                        direction="row"
                        align="center"
                        gap="xsmall"
                        justify="end"
                        margin={{ left: 'small' }}
                        basis="1/2"
                      >
                        <Heading level="3" color="#6C94EC" margin="0">
                          {task.minParticipants}
                        </Heading>
                        <Box width="xsmall">
                          <Text size="small" color="#6C94EC">
                            Participants Requirements
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                    <Box
                      direction="row"
                      width="100%"
                      justify="between"
                      margin={{ top: 'small' }}
                    >
                      <Box direction="row" gap="small" alignSelf="end">
                        <UserFemale color="brand" />
                        <Text>Creator Name</Text>
                      </Box>
                      <Box align="center">
                        <Box direction="row" gap="xxsmall" align="center">
                          <Text size="small" weight="bold">
                            Short of
                          </Text>
                          <Text size="medium" color="#6C94EC" weight="bold">
                            {task.minParticipants -
                              Number(task.numberOfParticipants)}
                          </Text>
                          <Text size="small" weight="bold">
                            to start
                          </Text>
                        </Box>
                        <Button
                          disabled={!address}
                          primary
                          onClick={() => {
                            setTaskToShow(task);
                          }}
                          label={task.isTrainingCompleted ? 'View' : 'Join'}
                          size="medium"
                          alignSelf="end"
                          pad={{ vertical: 'xsmall', horizontal: 'medium' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
          </Box>
        </Box>
      )}
    </>
  );
}

export default Tasks;
