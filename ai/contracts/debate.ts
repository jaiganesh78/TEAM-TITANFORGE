import { AgentConfidence, AgentEvidence, AgentAssumption } from './shared';

export interface Argument {
  id: string;
  proponentAgentId: string;
  thesis: string;
  rationale: string;
  evidence: AgentEvidence[];
  assumptions: AgentAssumption[];
  confidence: AgentConfidence;
  timestamp: string;
}

export interface CounterArgument {
  id: string;
  opponentAgentId: string;
  targetArgumentId: string;
  rebuttal: string;
  evidence: AgentEvidence[];
  assumptions: AgentAssumption[];
  confidence: AgentConfidence;
  timestamp: string;
}

export interface Vote {
  agentId: string;
  argumentId: string;
  stance: 'SUPPORT' | 'OPPOSE' | 'ABSTAIN';
  weight: number; // e.g. based on agent role expertise (0 to 1)
  reason: string;
}

export interface Conflict {
  id: string;
  topic: string;
  contendingArguments: string[]; // Argument IDs
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Resolution {
  id: string;
  resolvedConflictId: string;
  compromiseOrVerdict: string;
  justification: string;
  consentingAgentIds: string[];
  dissentingAgentIds: string[];
  resolvedAt: string;
}

export interface Review {
  reviewerAgentId: string;
  subjectId: string; // e.g., debate round ID or final proposal ID
  evaluation: string;
  score: number; // 0 to 1 scale
  feedback: string;
}

export interface DebateRound {
  roundNumber: number;
  topic: string;
  arguments: Argument[];
  counterArguments: CounterArgument[];
  conflicts: Conflict[];
  resolutions: Resolution[];
  votes: Vote[];
  status: 'ACTIVE' | 'RESOLVED' | 'STALEMATE';
  startedAt: string;
  endedAt?: string;
}
