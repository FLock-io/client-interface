import {
  Anchor,
  Avatar,
  Box,
  Button,
  FileInput,
  Heading,
  Layer,
  Spinner,
  Text,
  TextInput,
  Meter,
  Stack,
} from 'grommet';
import {
  Alert,
  Checkmark,
  FormNext,
  FormPrevious,
  InProgress,
  Share,
  UserFemale,
} from 'grommet-icons';
import { useContext, useEffect, useState } from 'react';
import { LogViewer } from '@patternfly/react-log-viewer';
import { RunnerContext } from 'renderer/context/runnerContext';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { FLOCK_TASK_ABI } from 'renderer/contracts/flockTask';
import { FLOCK_ABI, FLOCK_ADDRESS } from 'renderer/contracts/flock';
import { WalletContext } from 'renderer/context/walletContext';
import { useNavigate } from 'react-router-dom';
import { formatUnits } from 'viem';
import { useTaskData } from 'renderer/hooks/useTaskData';
import { TaskType } from './types';

interface TaskProps {
  task: TaskType;
  goBack: () => void;
}

type STEP = 'DETAIL' | 'LOCAL_DATA' | 'STAKE' | 'MONITOR' | 'REPORT';

// eslint-disable-next-line react/require-default-props
function StepItem({ text, disabled }: { text: string; disabled?: boolean }) {
  return (
    <Box
      pad="xsmall"
      background={disabled ? '#F8FAFB' : '#6C94EC'}
      round
      direction="row"
      align="center"
      gap="xsmall"
    >
      <Checkmark size="small" color={disabled ? '#757575' : 'white'} />
      <Text size="small" color={disabled ? '#757575' : 'white'}>
        {text}
      </Text>
    </Box>
  );
}

function Task({ task, goBack }: TaskProps) {
  const navigate = useNavigate();
  const { address } = useAccount();

  const { nativeTokenBalance, flockTokenBalance } = useContext(WalletContext);
  const { runningTasks, runTask, logs } = useContext(RunnerContext);
  const [file, setFile] = useState<File>({} as File);
  const [step, setStep] = useState<STEP>('DETAIL');
  const [stake, setStake] = useState<number>(task.stake);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [showCompletedModal, setShowCompletedModal] = useState<boolean>(false);

  const isRunning = runningTasks?.includes(task.address);

  const {
    dataCurrentRound,
    isTrainingCompleted,
    totalRewardedAmount,
    dataStakedBalance,
    dataInitialStake,
    participantRewardedAmounts
  } = useTaskData({
    task,
    participantAddress: address,
  });

  const { data: dataApprove, writeAsync: writeAsyncApprove } = useContractWrite(
    {
      address: FLOCK_ADDRESS as `0x${string}`,
      abi: FLOCK_ABI,
      functionName: 'approve',
    }
  );

  const { data: dataStake, write: writeStake } = useContractWrite({
    address: task.address as `0x${string}`,
    abi: FLOCK_TASK_ABI,
    functionName: 'stake',
  });

  const { isSuccess: isSuccessApprove } = useWaitForTransaction({
    hash: dataApprove?.hash,
  });

  const { isSuccess: isSuccessStake } = useWaitForTransaction({
    hash: dataStake?.hash,
  });

  const handleStake = async () => {
    setIsStaking(true);
    await writeAsyncApprove?.({ args: [task.address, stake * 10 ** 18] });
  };

  useEffect(() => {
    if (isSuccessApprove) {
      writeStake?.({ args: [stake * 10 ** 18] });
    }
  }, [isSuccessApprove]);

  useEffect(() => {
    if (isSuccessStake) {
      setIsStaking(false);
    }
  }, [isSuccessStake]);

  const nextStep = () => {
    switch (step) {
      case 'LOCAL_DATA':
        setStep('STAKE');
        break;
      case 'STAKE':
        setStep('MONITOR');
        runTask(task, file);
        break;
      case 'MONITOR':
        if (!isRunning) {
          setStep('DETAIL');
        } else {
          setStep('REPORT');
        }
        break;
      case 'DETAIL':
      default:
        setStep('LOCAL_DATA');
        setFile({} as File);
        break;
    }
  };

  const currentStep = () => {
    switch (step) {
      case 'LOCAL_DATA':
        return (
          <Box gap="medium">
            <Box>
              <Heading level="3" margin="0">
                Locate local data
              </Heading>
              <Text size="small">
                Link your local data for training, if you want to join training
              </Text>
            </Box>
            <FileInput
              name="file"
              multiple={false}
              onChange={(event: any) => setFile(event.target.files[0])}
            />
          </Box>
        );
      case 'STAKE':
        return (
          <Box gap="medium">
            <Box>
              <Heading level="3" margin={{ bottom: '0' }}>
                Stake $F
              </Heading>
              <Text size="small">Stake $F to start training</Text>
            </Box>
            <Box direction="row" align="center" justify="start" gap="medium">
              <Box>
                <TextInput
                  width="medium"
                  type="number"
                  value={stake}
                  onChange={(event: any) => setStake(event.target.value)}
                />
              </Box>
              <Box>
                <Button
                  label={isStaking ? 'Staking' : 'Stake'}
                  disabled={isStaking}
                  primary
                  onClick={handleStake}
                />
              </Box>
            </Box>
            <Box>
              <Heading level="5" margin={{ bottom: '0' }}>
                Your staked balance:{' '}
                {dataStakedBalance ? formatUnits(dataStakedBalance, 18) : 0} $F
              </Heading>
            </Box>
          </Box>
        );
      case 'MONITOR':
        return (
          <Box margin={{ top: 'small' }} gap="small">
            {logs.get(task.address)?.length === 0 ? (
              <Box align="center" justify="center" height="460px">
                <Spinner size="medium" />
              </Box>
            ) : (
              <LogViewer
                hasLineNumbers={false}
                height={460}
                data={logs.get(task.address)}
              />
            )}
          </Box>
        );
      // case 'REPORT':
      //   return (
      //     <>
      //       <Heading>Rounds and Balance Record</Heading>
      //       <Text>{Number(participantRewardedAmounts)}</Text>
      //     </>
      //   )
      case 'DETAIL':
      default:
        return (
          <Box width="large">
            <Text size="small">{task.description}</Text>
            <Text>{Number(participantRewardedAmounts)}</Text>
          </Box>
        );
    }
  };

  useEffect(() => {
    if (isRunning) {
      setStep('MONITOR');
    }
  }, [isRunning]);

  useEffect(() => {
    if (isTrainingCompleted) {
      setShowCompletedModal(true);
      setStep('REPORT');
    }
  }, [isTrainingCompleted]);

  return (
    <>
      {showCompletedModal && (
        <Layer
          modal
          onEsc={() => setShowCompletedModal(false)}
          onClickOutside={() => setShowCompletedModal(false)}
        >
          <Box
            pad="medium"
            align="center"
            gap="small"
            width="medium"
            height="medium"
          >
            <Box
              round="full"
              border={{
                color: '#6E96EC',
                size: 'large',
                side: 'all',
              }}
              pad="large"
              align="center"
              justify="center"
            >
              <Heading level="2" margin="0">
                {Number(dataCurrentRound) + 1}
              </Heading>
              <Text size="medium">Rounds</Text>
            </Box>
            <Heading level="3">Training Complete!</Heading>
            <Box align="start">
              <Text size="medium">FLock Reward: {totalRewardedAmount}</Text>
              <Text size="medium">Final Accuracy: </Text>
            </Box>
          </Box>
        </Layer>
      )}
      {Number(nativeTokenBalance?.value) === 0 && (
        <Layer modal onEsc={goBack} onClickOutside={goBack}>
          <Box pad="large" align="center" gap="medium">
            <Alert size="large" />
            <Heading level="3">MATIC Required</Heading>
            <Text size="medium">Please go get some MATIC first at: </Text>
            <Anchor
              target="_blank"
              href="https://faucet.polygon.technology/"
              label="https://faucet.polygon.technology/"
            />
            <Text>Your Wallet address: {address}</Text>
          </Box>
        </Layer>
      )}
      {Number(nativeTokenBalance?.value) !== 0 &&
        Number(flockTokenBalance?.value) === 0 && (
          <Layer modal onEsc={goBack} onClickOutside={goBack}>
            <Box pad="large" align="center" gap="medium">
              <Alert size="large" />
              <Heading level="3">FLock Token(FLC) Required</Heading>
              <Text size="medium">Please go get some FLC first at: </Text>
              <Anchor onClick={() => navigate('/faucet')} label="Faucet" />
            </Box>
          </Layer>
        )}
      <Box margin={{ top: 'small' }} gap="small">
        <Box background="white" round="small" pad="medium" gap="small">
          <Box direction="row" align="center" justify="between">
            <Button
              plain
              icon={<FormPrevious />}
              label="Back to train"
              onClick={goBack}
            />
            <Box pad="small" round="small">
              <Button icon={<Share size="small" />} label="Share" primary />
            </Box>
          </Box>
          <Box direction="row" justify="between" gap="medium">
            <Box direction="row" gap="small">
              <Box>
                <Avatar background="brand">
                  <UserFemale color="text-strong" />
                </Avatar>
              </Box>
              <Box gap="small">
                <Box>
                  <Box direction="row" gap="small" align="center">
                    <Heading level="3" margin="0">
                      {task.name}
                    </Heading>
                    {isRunning && (
                      <Box
                        round
                        background="#76CA66"
                        pad={{ vertical: 'xxsmall', horizontal: 'small' }}
                        align="center"
                        justify="center"
                      >
                        <Box
                          direction="row"
                          align="center"
                          justify="center"
                          gap="xsmall"
                        >
                          <InProgress size="small" color="white" />
                          <Text size="xsmall" color="white">
                            In Progress
                          </Text>
                        </Box>
                      </Box>
                    )}
                    {isTrainingCompleted && (
                      <Box
                        round
                        background="#70A4FF"
                        pad={{ vertical: 'xxsmall', horizontal: 'small' }}
                        align="center"
                        justify="center"
                      >
                        <Box
                          direction="row"
                          align="center"
                          justify="center"
                          gap="xsmall"
                        >
                          <Checkmark size="small" color="white" />
                          <Text size="xsmall" color="white">
                            Finished
                          </Text>
                        </Box>
                      </Box>
                    )}
                  </Box>
                  <Text size="xsmall">Task Creator: 0xdB5a...30Bce8</Text>
                </Box>
                <Box direction="row" gap="small">
                  <Box background="#F5F5F5" round="medium" pad="xsmall">
                    <Text size="xsmall">
                      Reward Pool: <b>$F {task.rewardPool}</b>
                    </Text>
                  </Box>
                  <Box background="#F2F6FF" round="medium" pad="xsmall">
                    <Text size="xsmall">
                      Initial Stake: <b>$F {task.stake}</b>
                    </Text>
                  </Box>
                </Box>
                <Box
                  background="#F8FAFB"
                  round="small"
                  pad="medium"
                  width="598px"
                >
                  <Box direction="row" justify="between" align="center">
                    <Box direction="row" align="center" gap="xsmall">
                      <Text color="brand" size="2xl" weight="bold">
                        {Number(task.numberOfParticipants)}
                      </Text>
                      <Text weight="bold">
                        participant
                        {Number(task.numberOfParticipants) !== 1 && 's'} have
                        joined the task
                      </Text>
                    </Box>
                    <Box direction="row" align="center">
                      <Stack anchor="right">
                        {Array.from(
                          {
                            length: Math.min(
                              Number(task.numberOfParticipants),
                              7
                            ),
                          },
                          (_, i) => (
                            <Box key={i} direction="row">
                              <Avatar background="brand" size="small">
                                <UserFemale size="small" />
                              </Avatar>
                              {Array.from(
                                {
                                  length:
                                    Number(task.numberOfParticipants) - (i + 1),
                                },
                                (_, j) => (
                                  <Box key={j} pad="xsmall" />
                                )
                              )}
                            </Box>
                          )
                        )}
                      </Stack>
                      {Number(task.numberOfParticipants) > 7 && (
                        <Text>+{Number(task.numberOfParticipants) - 7}</Text>
                      )}
                    </Box>
                  </Box>
                  <Box
                    direction="row"
                    justify="between"
                    margin={{ top: 'small' }}
                  >
                    <Text size="small">Min: {task.minParticipants}</Text>
                    <Text size="small">Max: {task.maxParticipants}</Text>
                  </Box>
                  <Box
                    border={{
                      color: 'grey',
                      size: 'xsmall',
                      style: 'solid',
                      side: 'all',
                    }}
                    round="small"
                  >
                    <Meter
                      values={[
                        {
                          value: Number(task.numberOfParticipants),
                          color: 'brand',
                          onClick: () => {},
                          label: `Min: ${task.minParticipants}`,
                          highlight: true,
                        },
                        {
                          value: Number(task.maxParticipants),
                          color: '#A0F2FF',
                          onClick: () => {},
                          label: `Max: ${task.maxParticipants}`,
                          highlight: true,
                        },
                      ]}
                      aria-label="meter"
                      max={Number(task.maxParticipants)}
                      round
                      size="full"
                      thickness="small"
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box direction="row" gap="medium">
              <Box
                background="#F8FAFB"
                round="small"
                pad="medium"
                align="center"
                width="230px"
                justify="between"
              >
                <Heading level="4" margin="0" alignSelf="start" weight="bold">
                  Learning Rounds
                </Heading>
                <Heading level="1" color="#6C94EC" weight="bold">
                  {isTrainingCompleted
                    ? Number(task.rounds)
                    : Number(dataCurrentRound)}
                </Heading>
                <Box alignSelf="stretch">
                  <Box direction="row" justify="between" border="bottom">
                    <Text size="xsmall" alignSelf="start">
                      Completion Percentage
                    </Text>
                    <Text size="xsmall" alignSelf="end">
                      {isTrainingCompleted
                        ? '100'
                        : Math.round(
                            (Number(dataCurrentRound) / Number(task.rounds)) * 1000
                          ) / 10}
                      %
                    </Text>
                  </Box>
                  <Box direction="row" justify="between">
                    <Heading level="6" margin="0">
                      Total Rounds
                    </Heading>
                    <Heading level="6" margin="0">
                      {task.rounds}
                    </Heading>
                  </Box>
                </Box>
              </Box>
              <Box
                background="#F8FAFB"
                round="small"
                pad="medium"
                align="center"
                width="230px"
                justify="between"
              >
                <Heading level="4" margin="0" alignSelf="start" weight="bold">
                  Model Accuracy
                </Heading>
                <Heading level="1" color="#6C94EC" weight="bold">
                  0
                </Heading>
                <Box alignSelf="stretch">
                  <Box direction="row" justify="between" border="bottom">
                    <Text size="xsmall" alignSelf="start">
                      Completion Percentage
                    </Text>
                    <Text size="xsmall" alignSelf="end">
                      5%
                    </Text>
                  </Box>
                  <Box direction="row" justify="between">
                    <Heading level="6" margin="0">
                      Target Accuracy
                    </Heading>
                    <Heading level="6" margin="0">
                      {Number(task.accuracy)}
                    </Heading>
                  </Box>
                </Box>
              </Box>
              <Box
                background="#F8FAFB"
                round="small"
                pad="medium"
                align="center"
                width="230px"
                justify="between"
              >
                <Heading level="4" margin="0" alignSelf="start" weight="bold">
                  Balance
                </Heading>
                <Heading level="1" color="#6C94EC" weight="bold">
                  {dataStakedBalance ? formatUnits(dataStakedBalance, 18) : 0}
                </Heading>
                <Box alignSelf="stretch">
                  <Box direction="row" justify="between" border="bottom">
                    <Text size="xsmall" alignSelf="start">
                      Return Rate
                    </Text>
                    <Text size="xsmall" alignSelf="end">
                      {Number(dataInitialStake) === 0
                        ? '0'
                        : Math.round(
                            (Number(dataStakedBalance) - Number(dataInitialStake) /
                              Number(dataInitialStake)) *
                              1000
                          ) / 10}
                      %
                    </Text>
                  </Box>
                  <Box direction="row" justify="between">
                    <Heading level="6" margin="0">
                      Stake Amount
                    </Heading>
                    <Heading level="6" margin="0">
                      $F
                      {dataInitialStake ? formatUnits(dataInitialStake, 18) : 0}
                    </Heading>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box background="white" round="small" pad="medium" gap="medium">
          <Box direction="row" align="center">
            <StepItem text="Check model detail" />
            <FormNext />
            <StepItem text="Locate local data" disabled={step === 'DETAIL'} />
            <FormNext />
            <StepItem
              text="Stake"
              disabled={step === 'DETAIL' || step === 'LOCAL_DATA'}
            />
            <FormNext />
            <StepItem
              text="Monitor"
              disabled={
                step === 'DETAIL' || step === 'LOCAL_DATA' || step === 'STAKE'
              }
            />
            <FormNext />
            <StepItem
              text="Report"
              disabled={
                step === 'DETAIL' ||
                step === 'LOCAL_DATA' ||
                step === 'MONITOR' ||
                step === 'STAKE'
              }
            />
          </Box>
          {currentStep()}
          {!isTrainingCompleted && (
            <Box direction="row" justify="end" height="xxsmall">
              <Button
                label={step === 'MONITOR' && !isRunning ? 'Restart' : 'Next'}
                primary
                disabled={
                  (step === 'LOCAL_DATA' && !file.path) ||
                  isRunning ||
                  (step === 'STAKE' &&
                    Number(dataStakedBalance) < stake * 10 ** 18)
                }
                onClick={nextStep}
              />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

export default Task;
