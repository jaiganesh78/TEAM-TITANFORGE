import { AgentOutput, AgentDecision } from '../contracts/shared';
import { DebateRound } from '../contracts/debate';

export interface OrchestratorConfig {
  debateRoundsMax?: number;
  consensusThreshold?: number; // 0 to 1 scale
}

export interface Orchestrator {
  runDebate(topic: string, agentIds: string[], context: Record<string, any>): Promise<DebateRound[]>;
  synthesizeProposal(debateHistory: DebateRound[]): Promise<AgentDecision>;
  evaluateOutcome(decisionId: string, observedKPIs: Record<string, number>): Promise<void>;
}
