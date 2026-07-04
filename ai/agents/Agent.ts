import { AgentInput, AgentOutput } from '../contracts/shared';

export interface Agent {
  id: string;
  name: string;
  role: string;
  run(input: AgentInput): Promise<AgentOutput>;
}
