import { AgentInput, AgentOutput } from '../contracts/shared';

export interface AgentConfig {
  agentId: string;
  name: string;
  role: string;
  systemPrompt: string;
  temperature?: number;
}

export interface AgentProvider {
  registerAgent(config: AgentConfig): void;
  executeAgent(input: AgentInput): Promise<AgentOutput>;
  getRegisteredAgents(): AgentConfig[];
}
