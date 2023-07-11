export interface TaskType {
  address: string;
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
  numberOfParticipants: number;
}
