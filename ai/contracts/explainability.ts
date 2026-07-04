import { AgentEvidence, AgentAssumption, AgentConstraint } from './shared';
import { Risk, Alternative, RejectedAlternative } from './recommendation';

export type {
  AgentEvidence as Evidence,
  AgentAssumption as Assumption,
  AgentConstraint as BusinessConstraint,
  Risk,
  Alternative,
  RejectedAlternative
};

export interface ExpectedOutcome {
  id: string;
  metricName: string;
  baselineValue: number;
  targetValue: number;
  percentageChange: number;
  horizonDays: number;
  confidenceScore: number;
}

export interface ConfidenceBreakdown {
  overallScore: number;
  dataQualityScore: number;
  historicalPrecedentScore: number;
  simulationConfidenceScore: number;
  logicalConsistencyScore: number;
}

export interface ExplanationTrace {
  recommendationId: string;
  logicalChain: string[];
  evidenceLinked: AgentEvidence[];
  assumptionsUsed: AgentAssumption[];
  constraintsViolated: AgentConstraint[];
  confidenceBreakdown: ConfidenceBreakdown;
  generatedAt: string;
}
