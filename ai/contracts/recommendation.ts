import {
  AgentEvidence,
  AgentAssumption,
  AgentConstraint,
  AgentConfidence
} from './shared';

export interface Risk {
  id: string;
  description: string;
  probability: number; // 0 to 1
  impact: number; // 0 to 1
  mitigationStrategy: string;
}

export interface Alternative {
  id: string;
  title: string;
  description: string;
  expectedKPIImpact: Record<string, number>;
}

export interface RejectedAlternative {
  id: string;
  title: string;
  description: string;
  rejectionReason: string;
}

export interface RecommendationTimelineEvent {
  id: string;
  title: string;
  description: string;
  daysAfterStart: number;
}

export interface RecommendationReflection {
  agentId: string;
  timestamp: string;
  analysis: string;
  critique: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  supportingAgents: string[]; // Agent IDs
  opposingAgents: string[]; // Agent IDs
  evidence: AgentEvidence[];
  assumptions: AgentAssumption[];
  constraints: AgentConstraint[];
  risks: Risk[];
  alternatives: Alternative[];
  rejectedAlternatives: RejectedAlternative[];
  expectedKPIImpact: Record<string, number>; // e.g. { "revenue": 15.2, "churn": -2.1 }
  confidence: AgentConfidence;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IMPLEMENTED' | 'DISCARDED';
  timeline: RecommendationTimelineEvent[];
  reflection?: RecommendationReflection;
  createdAt: string;
  updatedAt: string;
}
