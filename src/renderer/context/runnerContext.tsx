import { ReactNode, createContext, useMemo, useState } from 'react';
import { TaskType } from 'renderer/components/types';
import { useConnect } from 'wagmi';

interface RunnerContextProviderProps {
  children: ReactNode;
}

interface IRunnerContext {
  logs: Map<string, string[]>;
  runningTasks: string[];
  runTask: (task: TaskType, file: File) => void;
  stopTask: (task: TaskType) => void;
}

export const RunnerContext = createContext<IRunnerContext>(
  {} as IRunnerContext
);

export function RunnerContextProvider({
  children,
}: RunnerContextProviderProps) {
  const { connectors } = useConnect();

  const [runningTasks, setRunningTasks] = useState<string[]>([]);
  const [logs, setLogs] = useState<Map<string, string[]>>(new Map());
  const listenToLogs = () => {
    window.electron.ipcRenderer.on('ipc', (args: any) => {
      if (args[1].includes('client exited with code')) {
        setRunningTasks(runningTasks.filter((t) => t !== args[0]));
      }
      const currentLogs = logs.get(args[0]) || [];
      setLogs(new Map(logs.set(args[0], [...currentLogs, args[1]])));
    });
  };

  const runTask = async (task: TaskType, file: File) => {
    setLogs(new Map(logs.set(task.address, [])));
    // @ts-ignore
    const privateKey = await connectors[0].web3AuthInstance.provider?.request({
      method: 'eth_private_key',
    });

    window.electron.ipcRenderer.sendMessage('ipc', [
      'join',
      task.address,
      privateKey,
      file?.path,
    ]);
    setRunningTasks([...runningTasks, task.address]);
    listenToLogs();
  };

  const stopTask = (task: TaskType) => {
    window.electron.ipcRenderer.sendMessage('ipc', ['leave', task.address]);
    setRunningTasks(runningTasks.filter((t) => t !== task.address));
  };

  const value = useMemo(
    () => ({ runningTasks, runTask, stopTask, logs }),
    [runningTasks, logs]
  );

  return (
    <RunnerContext.Provider value={value}>{children}</RunnerContext.Provider>
  );
}
