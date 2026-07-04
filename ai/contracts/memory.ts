import { AgentEvidence, AgentAssumption } from './shared';

export interface BusinessMemory {
  id: string;
  type: 'EVENT' | 'MILESTONE' | 'DOCUMENT_UPLOAD' | 'WEBSITE_CRAWL' | 'PIVOT';
  title: string;
  description: string;
  timestamp: string;
  tags: string[];
  metaData: Record<string, any>;
}

export interface DecisionMemory {
  id: string;
  title: string;
  description: string;
  context: string;
  chosenAlternativeId: string;
  rejectedAlternativeIds: string[];
  madeByUserId?: string;
  madeByAgentId?: string;
  madeAt: string;
  expectedKPIImpact: Record<string, number>;
  assumptions: AgentAssumption[];
}

export interface OutcomeMemory {
  id: string;
  decisionMemoryId: string;
  observedKPIImpact: Record<string, number>;
  variance: Record<string, number>; // expected vs observed difference
  description: string;
  observedAt: string;
  lessonsLearned: string[];
}

export interface ReflectionMemory {
  id: string;
  outcomeMemoryId: string;
  reflectorAgentId: string;
  analysis: string;
  rootCauses: string[];
  actionableInsights: string[];
  reflectedAt: string;
}

export interface UserFeedbackMemory {
  id: string;
  targetId: string; // ID of recommendation or decision
  userId: string;
  rating: number; // e.g. 1 to 5 stars or binary thumb
  comment?: string;
  actionTaken: 'ACCEPTED' | 'REJECTED' | 'MODIFIED';
  timestamp: string;
}

export interface PredictionMemory {
  id: string;
  targetMetric: string;
  predictedValue: number;
  observedValue?: number;
  horizonDate: string; // target date for prediction
  accuracy?: number; // calculated later (0 to 1)
  predictedAt: string;
  confidence: number;
}
