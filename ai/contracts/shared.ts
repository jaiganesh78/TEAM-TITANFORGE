export interface AgentInput {
  agentId: string;
  taskId: string;
  context: Record<string, any>;
  metadata: {
    timestamp: string;
    correlationId: string;
  };
}

export interface AgentEvidence {
  id: string;
  source: string;
  type: 'DOCUMENT' | 'WEBSITE' | 'HISTORICAL_DATA' | 'SIMULATION' | 'EXTERNAL_QUERY';
  content: string;
  confidenceScore: number;
  extractedAt: string;
}

export interface AgentConstraint {
  id: string;
  name: string;
  type: 'BUDGET' | 'TIMELINE' | 'RESOURCES' | 'REGULATORY' | 'TECHNICAL';
  description: string;
  value: any;
}

export interface AgentAssumption {
  id: string;
  statement: string;
  rationale: string;
  riskFactor: number; // 0 to 1 scale
  impactOnOutput: number; // 0 to 1 scale
}

export interface AgentConfidence {
  overallScore: number; // 0 to 1 scale
  factors: {
    dataQuality: number;
    modelCertainty: number;
    historicalAlignment: number;
    constraintMatch: number;
  };
  explanation: string;
}

export interface AgentDecision {
  decisionId: string;
  title: string;
  actionTaken: string;
  rationale: string;
  assumptions: AgentAssumption[];
  constraintsChecked: AgentConstraint[];
  evidenceUsed: AgentEvidence[];
  confidence: AgentConfidence;
}

export interface AgentConflict {
  id: string;
  conflictingAgentIds: string[];
  pointOfConflict: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

export interface AgentRecommendation {
  id: string;
  agentId: string;
  title: string;
  description: string;
  kpiImpact: Record<string, number>;
  confidence: AgentConfidence;
}

export interface AgentOutput {
  agentId: string;
  taskId: string;
  decisions: AgentDecision[];
  recommendations: AgentRecommendation[];
  conflicts: AgentConflict[];
  logs: string[];
  metadata: {
    durationMs: number;
    tokensUsed?: number;
  };
}
