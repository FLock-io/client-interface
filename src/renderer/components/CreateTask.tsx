import { useContractWrite, useWaitForTransaction } from 'wagmi';
import {
  Box,
  Button,
  FileInput,
  Form,
  FormField,
  Heading,
  Paragraph,
  RangeInput,
  Select,
  Spinner,
  Text,
  TextArea,
  TextInput,
} from 'grommet';
import { DocumentText, SettingsOption, Table } from 'grommet-icons';
import { useEffect, useState } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { createSchema } from 'genson-js/dist';
import { FLOCK_ABI, FLOCK_ADDRESS } from 'renderer/contracts/flock';
import {
  FLOCK_TASK_MANAGER_ABI,
  FLOCK_TASK_MANAGER_ADDRESS,
} from 'renderer/contracts/flockTaskManager';

const ipfsClient = ipfsHttpClient({ url: 'https://ipfs.flock.io/api/v0' });

type FormValues = {
  name: string;
  description: string;
  input: string;
  output: string;
  modelName: string;
  taskType: string;
  sizeMemory: number;
  outputDescription: string;
  minParticipants: number;
  maxParticipants: number;
  rounds: number;
  accuracy: number;
  stake: number;
  rewardPool: number;
  modelDefinitionHash: string;
  schema: string;
  sampleData: any;
  sampleDataContent: string;
  secondsPerRound: number;
};

function DataDefinitionForm({
  value,
  setValue,
  setErrors,
}: {
  value: any;
  setValue: (value: any) => void;
  setErrors(value: any): void;
}) {
  const handleChange = async (nextValue: any) => {
    if (nextValue.sampleData[0]) {
      const fileReader = new FileReader();
      fileReader.readAsText(nextValue.sampleData[0], 'UTF-8');
      fileReader.onload = (e) => {
        setValue({
          ...nextValue,
          schema: JSON.stringify(
            createSchema(JSON.parse(e?.target?.result as string)),
            null,
            2
          ),
        });
      };
    }
  };

  return (
    <Form
      value={value}
      onChange={handleChange}
      validate="blur"
      onValidate={(validationResults) => {
        setErrors(validationResults.errors);
      }}
    >
      <FormField
        name="schema"
        htmlFor="schema"
        label="Data Schema"
        required
        validateOn="blur"
      >
        <Box height="medium">
          <TextArea
            id="schema"
            name="schema"
            fill
            resize={false}
            placeholder='{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "instruction": {
        "type": "string"
      },
      "context": {
        "type": "string"
      },
      "response": {
        "type": "string"
      },
      "category": {
        "type": "string"
      }
    },
    "required": [
      "instruction",
      "context",
      "response",
      "category"
    ]
  }
}'
          />
        </Box>
      </FormField>
      <FormField
        name="sampleData"
        htmlFor="sampleData"
        label="Sample Data"
        required
        validateOn="blur"
      >
        <FileInput id="sampleData" name="sampleData" multiple={false} />
      </FormField>
    </Form>
  );
}

function TrainingSettingsForm({
  value,
  setValue,
  setErrors,
}: {
  value: any;
  setValue: (value: any) => void;
  setErrors(value: any): void;
}) {
  return (
    <Form
      value={value}
      onChange={setValue}
      validate="blur"
      onValidate={(validationResults) => {
        setErrors(validationResults.errors);
      }}
    >
      <Box>
        <Heading level="4">Criteria to start training task:</Heading>
        <Box direction="row" align="center" justify="between" gap="small">
          <Box>
            <Text>Limit minimum number of participants</Text>
            <Box direction="row" align="center" gap="xsmall">
              <RangeInput
                id="minParticipants"
                name="minParticipants"
                step={1}
                max={100}
                min={1}
              />
              <Box>{value.minParticipants}</Box>
            </Box>
          </Box>
          <Box>
            <Text>Limit maximum number of participants</Text>
            <Box direction="row" align="center" gap="xsmall">
              <RangeInput
                id="maxParticipants"
                name="maxParticipants"
                step={1}
                min={1}
                max={100}
              />
              <Box>{value.maxParticipants}</Box>
            </Box>
          </Box>
          <Box>
            <FormField
              name="secondsPerRound"
              htmlFor="secondsPerRound"
              label="Round time in secods"
              required
              validateOn="blur"
            >
              <TextInput
                id="secondsPerRound"
                name="secondsPerRound"
                type="number"
              />
            </FormField>
          </Box>
        </Box>
      </Box>
      <Box>
        <Heading level="4">Criteria to end training task:</Heading>
        <Box direction="row" align="center" justify="between">
          <FormField
            name="rounds"
            htmlFor="rounds"
            label="Number of training rounds in total"
            required
            validateOn="blur"
          >
            <TextInput id="rounds" name="rounds" type="number" />
          </FormField>
          <Box>
            <Text>Expected training accuracy</Text>
            <Box direction="row" align="center" gap="xsmall">
              <RangeInput
                id="accuracy"
                name="accuracy"
                step={1}
                min={0}
                max={100}
              />
              <Box>{value.accuracy}%</Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        direction="row"
        align="center"
        justify="between"
        margin={{ top: 'medium' }}
      >
        <FormField
          name="stake"
          htmlFor="stake"
          label="Initial Stake Requirement"
          required
          validateOn="blur"
        >
          <TextInput id="stake" name="stake" type="number" />
        </FormField>
        <FormField
          name="rewardPool"
          htmlFor="rewardPool"
          label="Rewards Pool"
          required
          validateOn="blur"
        >
          <TextInput id="rewardPool" name="rewardPool" type="number" />
        </FormField>
      </Box>
    </Form>
  );
}

function TaskDefinitionForm({
  value,
  setValue,
  setErrors,
}: {
  value: any;
  setValue: (value: any) => void;
  setErrors(value: any): void;
}) {
  return (
    <Form
      value={value}
      onChange={setValue}
      validate="blur"
      onValidate={(validationResults) => {
        setErrors(validationResults.errors);
      }}
    >
      <FormField
        name="name"
        htmlFor="name"
        label="Name"
        required
        validateOn="blur"
      >
        <TextInput id="name" name="name" />
      </FormField>
      <FormField
        name="description"
        htmlFor="description"
        label="Description"
        required
        validateOn="blur"
      >
        <TextInput id="description" name="description" />
      </FormField>
      <Box direction="row" align="center" justify="between">
        <FormField
          name="input"
          htmlFor="input"
          label="Input"
          required
          validateOn="blur"
        >
          <TextInput id="input" name="input" />
        </FormField>
        <FormField
          name="output"
          htmlFor="output"
          label="Output"
          required
          validateOn="blur"
        >
          <TextInput id="output" name="output" />
        </FormField>
      </Box>
      <Box direction="row" align="center" justify="between">
        <FormField
          name="modelName"
          htmlFor="modelName"
          label="Model Name"
          required
          validateOn="blur"
        >
          <Select
            id="modelName"
            name="modelName"
            options={[
              'Linear Regression',
              'MLP',
              'Three-layer CNN',
              'ResNet18',
              'ResNet20',
              'ResNet56',
              'VGG16',
            ]}
          />
        </FormField>
        <FormField
          name="taskType"
          htmlFor="taskType"
          label="Task Type"
          required
          validateOn="blur"
        >
          <Select
            id="taskType"
            name="taskType"
            options={['NLP', 'Finance', 'Computer Vision']}
          />
        </FormField>
      </Box>
      <Box direction="row" align="center" justify="between">
        <Box gap="medium">
          <Text>Model Size in Memory</Text>
          <Box direction="row" align="center" gap="xsmall">
            <RangeInput
              id="sizeMemory"
              name="sizeMemory"
              step={4}
              max={1024}
              min={128}
            />
            <Box>{value.sizeMemory}MB</Box>
          </Box>
        </Box>

        <FormField
          name="outputDescription"
          htmlFor="outputDescription"
          label="Output Description"
          required
          validateOn="blur"
        >
          <TextInput id="outputDescription" name="outputDescription" />
        </FormField>
      </Box>
      <FormField
        name="modelDefinitionHash"
        htmlFor="modelDefinitionHash"
        label="Model Definition Hash"
        required
        validateOn="blur"
      >
        <TextInput id="modelDefinitionHash" name="modelDefinitionHash" />
      </FormField>
    </Form>
  );
}

export function CreateTask({
  setShowCreateTask,
}: {
  setShowCreateTask: (show: boolean) => void;
}) {
  const [value, setValue] = useState<FormValues>({} as FormValues);
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [creationError, setCreationError] = useState<any>({});

  const [step, setStep] = useState(1);

  const {
    data: approveTx,
    writeAsync: writeAsyncApprove,
    isError: isErrorApprove,
    error: errorApprove,
  } = useContractWrite({
    address: FLOCK_ADDRESS as `0x${string}`,
    abi: FLOCK_ABI,
    functionName: 'approve',
  });

  const { isSuccess: isSuccessApprove } = useWaitForTransaction({
    hash: approveTx?.hash,
  });

  const {
    data: createTaskTx,
    writeAsync,
    isError,
    error,
  } = useContractWrite({
    address: FLOCK_TASK_MANAGER_ADDRESS as `0x${string}`,
    abi: FLOCK_TASK_MANAGER_ABI,
    functionName: 'createTask',
  });

  const { isSuccess: isSuccessCreateTask } = useWaitForTransaction({
    hash: createTaskTx?.hash,
  });

  const handleCreate = async () => {
    setIsProcessing(true);
    const { path: schemaPath } = await ipfsClient.add(
      JSON.stringify(value.schema, null, 4)
    );

    const { path: sampleDataPath } = await ipfsClient.add(value.sampleData[0]);

    value.sampleData = sampleDataPath;
    value.schema = schemaPath;

    await writeAsyncApprove?.({
      args: [
        FLOCK_TASK_MANAGER_ADDRESS as `0x${string}`,
        value.rewardPool * 10 ** 18,
      ],
    });
  };

  useEffect(() => {
    if (isSuccessApprove) {
      writeAsync?.({
        args: [
          JSON.stringify(value),
          value.secondsPerRound,
          value.modelDefinitionHash,
          value.rounds,
          value.minParticipants,
          value.maxParticipants,
          value.stake * 10 ** 18,
          value.rewardPool * 10 ** 18,
        ],
      });
    }
  }, [isSuccessApprove]);

  useEffect(() => {
    console.error(error);
    setCreationError(error);
    setIsProcessing(false);
  }, [isError]);

  useEffect(() => {
    console.error(errorApprove);
    setCreationError(errorApprove);
    setIsProcessing(false);
  }, [isErrorApprove]);

  useEffect(() => {
    if (isSuccessCreateTask) {
      setIsProcessing(false);
      setShowCreateTask(false);
    }
  }, [isSuccessCreateTask]);

  const hasNoValues =
    (step === 1 && Object.keys(value).length < 9) ||
    (step === 2 && Object.keys(value).length < 11) ||
    (step === 3 && Object.keys(value).length < 16);

  const handleContinue = () => {
    setStep(step + 1);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Box>
      <Box
        background="#EEEEEE"
        direction="row"
        align="center"
        justify="start"
        width="100%"
        pad={{ horizontal: 'xlarge', vertical: 'small' }}
      >
        <Box>
          <Box direction="row" gap="xsmall">
            <Heading level="3">Create your</Heading>
            <Heading level="3" color="#6C94EC">
              task
            </Heading>
          </Box>
          <Paragraph>Fill in the following information step by step</Paragraph>
        </Box>
      </Box>
      <Box
        pad={{ horizontal: 'xlarge', vertical: 'small' }}
        direction="row-responsive"
        align="start"
        justify="start"
      >
        <Box width="30%">
          <Box
            direction="row"
            align="center"
            gap="small"
            onClick={() => setStep(1)}
          >
            <DocumentText size="medium" color={step === 1 ? '#6C94EC' : ''} />
            <Heading level="4" color={step === 1 ? '#6C94EC' : ''}>
              1. Task Definition
            </Heading>
          </Box>
          <Box
            direction="row"
            align="center"
            gap="small"
            onClick={() => setStep(2)}
          >
            <Table size="medium" color={step === 2 ? '#6C94EC' : ''} />
            <Heading level="4" color={step === 2 ? '#6C94EC' : ''}>
              2. Data Definition
            </Heading>
          </Box>
          <Box
            direction="row"
            align="center"
            gap="small"
            onClick={() => setStep(3)}
          >
            <SettingsOption size="medium" color={step === 3 ? '#6C94EC' : ''} />
            <Heading level="4" color={step === 3 ? '#6C94EC' : ''}>
              3. Training Settings
            </Heading>
          </Box>
        </Box>
        <Box width="70%">
          {step === 1 && (
            <TaskDefinitionForm
              value={value}
              setErrors={setErrors}
              setValue={setValue}
            />
          )}
          {step === 2 && (
            <DataDefinitionForm
              value={value}
              setErrors={setErrors}
              setValue={setValue}
            />
          )}
          {step === 3 && (
            <TrainingSettingsForm
              value={value}
              setErrors={setErrors}
              setValue={setValue}
            />
          )}
        </Box>
      </Box>
      <Box
        direction="row"
        gap="large"
        alignSelf="end"
        pad={{ horizontal: 'xlarge', vertical: 'small' }}
      >
        <Button
          secondary
          onClick={() => setShowCreateTask(false)}
          margin={{ top: 'medium' }}
          label="Cancel"
          size="medium"
          pad={{ vertical: 'small', horizontal: 'large' }}
        />
        <Button
          primary
          onClick={step === 3 ? handleCreate : handleContinue}
          disabled={hasErrors || hasNoValues || isProcessing}
          margin={{ top: 'medium' }}
          label={
            // eslint-disable-next-line no-nested-ternary
            step === 3 ? (
              isProcessing ? (
                <Spinner color="black" />
              ) : (
                'Create'
              )
            ) : (
              'Continue'
            )
          }
          size="medium"
          pad={{ vertical: 'small', horizontal: 'large' }}
        />
      </Box>
      <Box>{creationError?.message}</Box>
    </Box>
  );
}

export default CreateTask;
