export interface ExecutiveSummary {
  period: string;
  totalRevenue: number;
  revenueGrowthMoM: number;
  activeCustomers: number;
  customerGrowthMoM: number;
  burnRate: number;
  burnRateChangeMoM: number;
  netLTVtoCAC: number;
}

export interface BusinessHealth {
  overallScore: number; // 0 to 100
  financialHealth: number; // 0 to 100
  operationalHealth: number;
  customerHealth: number;
  technologyHealth: number;
  lastUpdated: string;
}

export interface GrowthScore {
  score: number; // 0 to 100
  benchmarkPercentile: number; // e.g. 85th percentile of industry
  velocityScore: number;
  retentionScore: number;
  efficiencyScore: number;
}

export interface RevenueOpportunity {
  id: string;
  title: string;
  description: string;
  estimatedValueAnnual: number;
  confidenceScore: number; // 0 to 1
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: 'PRICING' | 'EXPANSION' | 'UPSELL' | 'CHURN_MITIGATION';
}

export interface LeadScore {
  leadId: string;
  companyName: string;
  score: number; // 0 to 100
  conversionProbability: number; // 0 to 1
  keySignals: string[];
  lastInteractionDate: string;
}

export interface CustomerHealth {
  customerId: string;
  companyName: string;
  healthScore: number; // 0 to 100
  healthStatus: 'HEALTHY' | 'NEUTRAL' | 'AT_RISK';
  usageActivityScore: number;
  supportTicketsCount: number;
  mrr: number;
}

export interface MarketReadiness {
  productMarketFitScore: number; // 0 to 100
  marketSizeTAM: number;
  marketSharePercent: number;
  barrierToEntryLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  regulatoryRiskScore: number;
}

export interface RiskAlert {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'CASH_RUNWAY' | 'CHURN' | 'COMPETITOR_MOVE' | 'COMPLIANCE';
  detectedAt: string;
  mitigationRecommendationId?: string;
}

export interface RecommendationLifecycle {
  pendingCount: number;
  acceptedCount: number;
  implementedCount: number;
  rejectedCount: number;
  totalKpiImpactEstimated: Record<string, number>;
  realizedKpiImpact: Record<string, number>;
}

export interface BusinessTimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'MILESTONE' | 'DECISION' | 'OUTCOME' | 'RISK_DETECTED';
  kpisAffected?: Record<string, number>;
}

export interface OpportunityRadarMetric {
  subject: string;
  currentValue: number; // 0 to 100
  targetValue: number; // 0 to 100
  industryAverage: number; // 0 to 100
}

export interface OpportunityRadar {
  metrics: OpportunityRadarMetric[];
  title: string;
}

export interface PredictionAccuracy {
  metricName: string;
  predictionsCount: number;
  meanAbsoluteError: number;
  accuracyScore: number; // 0 to 100
  recentPredictions: {
    predictedAt: string;
    horizonDate: string;
    predictedValue: number;
    actualValue?: number;
  }[];
}

// Nodes and edges for UI graphs
export interface GraphNode {
  id: string;
  label: string;
  type: 'DECISION' | 'OUTCOME' | 'AGENT' | 'KPI' | 'CONSTRAINT';
  status?: string;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationType: 'INFLUENCES' | 'BLOCKS' | 'SUPPORTED_BY' | 'TRIGGERS' | 'DEPENDS_ON';
  weight?: number;
}

export interface ExecutiveDecisionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface KPIDependencyGraph {
  nodes: GraphNode[]; // type: KPI
  edges: GraphEdge[]; // type: DEPENDS_ON
}
