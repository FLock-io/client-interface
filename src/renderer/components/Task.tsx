import {
  Anchor,
  Box,
  Button,
  FileInput,
  Heading,
  Layer,
  Spinner,
  Text,
  TextInput,
} from 'grommet';
import {
  Alert,
  Checkmark,
  FormNext,
  FormPrevious,
  InProgress,
  Share,
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
import { TaskType } from './types';
import Chart from './Chart';

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

  const isRunning = runningTasks?.includes(task.address);

  const { data: dataStakedBalance, refetch } = useContractRead({
    address: task.address as `0x${string}`,
    abi: FLOCK_TASK_ABI,
    functionName: 'stakedTokens',
    args: [address],
  }) as { data: number; refetch: () => void };

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
      refetch?.();
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
              <Chart />
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
                Your staked balance: {formatUnits(dataStakedBalance, 18)} $F
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
      case 'REPORT':
        return (
          <Box width="large">
              <LogViewer
                hasLineNumbers={false}
                height={460}
                data={logs.get(task.address)}
              />
            <Text size="small">{task.description}</Text>
          </Box>
        );
      case 'DETAIL':
      default:
        return (
          <Box width="large">
            <Text size="small">{task.description}</Text>
          </Box>
        );
    }
  };

  useEffect(() => {
    if (isRunning) {
      setStep('MONITOR');
    }
  }, [isRunning]);

  return (
    <>
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
            <Button icon={<Share size="small" />} label="Share" />
          </Box>
          <Box direction="row" justify="between">
            <Box gap="small">
              <Box>
                <Box
                  direction="row"
                  gap="small"
                  align="center"
                  justify="center"
                >
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
                </Box>
                <Text size="xsmall">Task Creator: 0xdB5a...30Bce8</Text>
              </Box>
              <Box direction="row" gap="small">
                <Box background="#F5F5F5" round="small" pad="xsmall">
                  <Text size="xsmall">
                    Reward Pool: <b>$F {task.rewardPool}</b>
                  </Text>
                </Box>
                <Box background="#F2F6FF" round="small" pad="xsmall">
                  <Text size="xsmall">
                    Initial Stake: <b>$F {task.stake}</b>
                  </Text>
                </Box>
              </Box>
            </Box>
            <Box direction="row">
              <Box
                background="#F8FAFB"
                round="small"
                pad="medium"
                align="center"
              >
                <Heading level="5" margin="0">
                  Learning Rounds
                </Heading>
                <Heading level="2" color="#6C94EC">
                  0
                </Heading>
                <Box align="start">
                  <Text size="xsmall">Completion Percentage 0%</Text>
                  <Heading level="6" margin="0">
                    Total Rounds {task.rounds}
                  </Heading>
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
          <Box direction="row" justify="end" height="xxsmall">
            <Button
              label={step === 'MONITOR' && !isRunning ? 'Restart' : 'Next'}
              primary
              disabled={
                (step === 'LOCAL_DATA' && !file.path) ||
                isRunning ||
                (step === 'STAKE' && dataStakedBalance < stake * 10 ** 18)
              }
              onClick={nextStep}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Task;
