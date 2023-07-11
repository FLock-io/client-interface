import { Box, Button, FileInput, Heading, Spinner, Text } from 'grommet';
import { FormPrevious, Share } from 'grommet-icons';
import { useContext, useState } from 'react';
import { WalletContext } from 'renderer/context/walletContext';
import { LogViewer } from '@patternfly/react-log-viewer';
import { TaskType } from './types';

interface TaskProps {
  task: TaskType;
  goBack: () => void;
}

function Task({ task, goBack }: TaskProps) {
  const { privateKey } = useContext(WalletContext);
  const [file, setFile] = useState<File | null>(null);
  const [started, setStarted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const joinTraining = () => {
    setStarted(true);
    window.electron.ipcRenderer.sendMessage('ipc', [
      'join',
      task.address,
      privateKey,
      file?.path,
    ]);
  };

  const leaveTraining = () => {
    window.electron.ipcRenderer.sendMessage('ipc', ['leave']);
    setFile(null);
    setLogs([]);
    setStarted(false);
  };

  window.electron.ipcRenderer.on('ipc', (arg) => {
    setLogs([...logs, arg as string]);
  });

  if (started) {
    return (
      <Box margin={{ top: 'small' }} gap="small">
        {logs.length === 0 ? (
          <Box align="center" justify="center" height="460px">
            <Spinner size="medium" />
          </Box>
        ) : (
          <LogViewer hasLineNumbers={false} height={460} data={logs} />
        )}

        <Box direction="row" justify="end">
          <Button label="Leave Training" primary onClick={leaveTraining} />
        </Box>
      </Box>
    );
  }

  return (
    <Box margin={{ top: 'small' }} gap="small">
      <Box background="white" round="small" pad="medium" gap="small">
        <Box direction="row" align="center" justify="between">
          <Button
            plain
            icon={<FormPrevious />}
            label="Back to train"
            onClick={goBack}
          />
          <Button icon={<Share />} label="Share" />
        </Box>
        <Box direction="row" justify="between">
          <Box gap="small">
            <Box>
              <Heading level="2" margin="0">
                {task.name}
              </Heading>
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
            <Box background="#F8FAFB" round="small" pad="medium" align="center">
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
        <Box direction="row" justify="end">
          <Button
            label="Join Training"
            primary
            disabled={!file}
            onClick={joinTraining}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Task;
