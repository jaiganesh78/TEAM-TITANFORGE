import { z } from 'zod';

// ================================================================
// ZOD OUTPUT CONTRACTS FOR STRATEGY ENGINE
// ================================================================

export const SwotItemSchema = z.object({
  item: z.string(),
  evidence: z.string(),
  confidence: z.number().min(0).max(100)
});

export const SwotSchema = z.object({
  strengths: z.array(SwotItemSchema),
  weaknesses: z.array(SwotItemSchema),
  opportunities: z.array(SwotItemSchema),
  threats: z.array(SwotItemSchema)
});

export const CompetitorProfileSchema = z.object({
  name: z.string(),
  marketPosition: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  differentiators: z.array(z.string()),
  pricingPosition: z.string(),
  brandPosition: z.string(),
  competitiveRisks: z.array(z.string())
});

export const CompetitorAnalysisSchema = z.object({
  competitors: z.array(CompetitorProfileSchema)
});

export const MarketAnalysisSchema = z.object({
  marketOverview: z.string(),
  industryTrends: z.array(z.string()),
  emergingOpportunities: z.array(z.string()),
  threats: z.array(z.string()),
  technologyTrends: z.array(z.string()),
  consumerBehaviour: z.string(),
  marketRisks: z.array(z.string())
});

export const PricingSchema = z.object({
  pricingEvaluation: z.string(),
  pricingOpportunities: z.array(z.string()),
  suggestedPricingStrategy: z.string(),
  risks: z.array(z.string()),
  expectedImpact: z.string()
});

export const PositioningSchema = z.object({
  currentPositioning: z.string(),
  recommendedPositioning: z.string(),
  uniqueValueProposition: z.string(),
  differentiators: z.array(z.string()),
  targetAudienceAlignment: z.string(),
  brandNarrative: z.string()
});

export const GrowthOpportunitySchema = z.object({
  title: z.string(),
  type: z.string(), // Quick Win | Medium-term | Long-term
  expectedImpact: z.string(),
  difficulty: z.string(),
  dependencies: z.array(z.string()),
  confidence: z.number(),
  evidence: z.string()
});

export const GrowthOpportunitiesSchema = z.object({
  opportunities: z.array(GrowthOpportunitySchema)
});

export const RecommendationSchema = z.object({
  title: z.string(),
  problem: z.string(),
  evidence: z.string(),
  businessContext: z.string(),
  reasoning: z.string(),
  expectedKpiImpact: z.string(),
  affectedKpis: z.array(z.string()),
  requiredData: z.array(z.string()),
  dependencies: z.array(z.string()),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  confidence: z.number(),
  estimatedTimeline: z.string(),
  expectedROI: z.string(),
  businessRisks: z.string(),
  alternativeStrategies: z.string(),
  explainability: z.object({
    knowledgeSources: z.array(z.string()),
    businessFactsUsed: z.array(z.string()),
    growthDomainsUsed: z.array(z.string()),
    reasoningSummary: z.string(),
    assumptions: z.array(z.string()),
    constraints: z.array(z.string()),
    whySelected: z.string(),
    whyAlternativesRejected: z.string()
  })
});

export const RecommendationsSchema = z.object({
  recommendations: z.array(RecommendationSchema)
});

export const ExecutiveSummarySchema = z.object({
  summary: z.string(),
  criticalPriorities: z.array(z.string()),
  primaryBlockers: z.array(z.string())
});

// ================================================================
// RESPONSE PARSER
// ================================================================

export class ResponseParser {
  /**
   * Cleans model output string (stripping markdown fences) and parses JSON.
   */
  static parseCleanJson(text: string): Record<string, any> {
    let clean = text.trim();
    // Strip markdown code block wrappers if generated
    if (clean.startsWith('```')) {
      const lines = clean.split('\n');
      if (lines[0].includes('json')) {
        lines.shift();
      } else {
        lines.shift();
      }
      if (lines[lines.length - 1] === '```') {
        lines.pop();
      }
      clean = lines.join('\n').trim();
    }
    
    try {
      return JSON.parse(clean);
    } catch (err) {
      // Direct regex fallback if JSON has leading/trailing characters
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error(`Failed to parse response as JSON: ${text}`);
    }
  }

  /**
   * Parses and validates JSON output against a Zod schema.
   */
  static parseAndValidate<T>(text: string, schema: z.ZodSchema<T>): T {
    const raw = this.parseCleanJson(text);
    try {
      return schema.parse(raw);
    } catch (err) {
      console.warn('[ResponseParser] Schema validation failed. Attempting self-healing...');
      try {
        const healed = healObject(raw, schema);
        return schema.parse(healed);
      } catch (err2: any) {
        console.error('[ResponseParser] Self-healing failed, returning raw/partially parsed object to prevent job failure:', err2.message || err2);
        return raw as T;
      }
    }
  }
}

function healObject(raw: any, schema: any): any {
  if (!raw || typeof raw !== 'object') {
    raw = {};
  }
  
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const healed: any = { ...raw };
    for (const key of Object.keys(shape)) {
      const fieldSchema = shape[key];
      if (healed[key] === undefined || healed[key] === null) {
        healed[key] = getDefaultValueForSchema(fieldSchema);
      } else if (typeof healed[key] === 'object' && fieldSchema instanceof z.ZodObject) {
        healed[key] = healObject(healed[key], fieldSchema);
      } else if (Array.isArray(healed[key]) && fieldSchema instanceof z.ZodArray) {
        healed[key] = healed[key].map((item: any) => healObject(item, fieldSchema.element));
      }
    }
    return healed;
  }
  
  if (schema instanceof z.ZodArray && Array.isArray(raw)) {
    return raw.map((item: any) => healObject(item, schema.element));
  }
  
  return raw;
}

function getDefaultValueForSchema(fieldSchema: any): any {
  if (fieldSchema instanceof z.ZodOptional || fieldSchema instanceof z.ZodNullable) {
    return null;
  }
  if (fieldSchema instanceof z.ZodString) {
    return '';
  }
  if (fieldSchema instanceof z.ZodNumber) {
    return 0;
  }
  if (fieldSchema instanceof z.ZodBoolean) {
    return false;
  }
  if (fieldSchema instanceof z.ZodArray) {
    return [];
  }
  if (fieldSchema instanceof z.ZodObject) {
    return healObject({}, fieldSchema);
  }
  if (fieldSchema && fieldSchema._def && fieldSchema._def.schema) {
    return getDefaultValueForSchema(fieldSchema._def.schema);
  }
  return undefined;
}

// ================================================================
// ZOD OUTPUT CONTRACTS FOR MARKETING ENGINE — SPRINT 8
// ================================================================

export const AudienceAnalysisSchema = z.object({
  primaryAudience: z.string(),
  secondaryAudience: z.string(),
  buyingMotivations: z.array(z.string()),
  painPoints: z.array(z.string()),
  buyingBarriers: z.array(z.string()),
  preferredChannels: z.array(z.string()),
  decisionDrivers: z.array(z.string()),
  confidence: z.number().min(0).max(100),
  evidence: z.string()
});

export const CustomerJourneyStageSchema = z.object({
  objectives: z.array(z.string()),
  painPoints: z.array(z.string()),
  recommendedChannels: z.array(z.string()),
  recommendedContent: z.array(z.string()),
  expectedKPIs: z.array(z.string()),
  risks: z.array(z.string()),
  opportunities: z.array(z.string())
});

export const CustomerJourneySchema = z.object({
  awareness: CustomerJourneyStageSchema,
  interest: CustomerJourneyStageSchema,
  consideration: CustomerJourneyStageSchema,
  purchase: CustomerJourneyStageSchema,
  onboarding: CustomerJourneyStageSchema,
  retention: CustomerJourneyStageSchema,
  advocacy: CustomerJourneyStageSchema
});

export const FunnelAnalysisSchema = z.object({
  tofu: z.object({ objectives: z.array(z.string()), kpis: z.array(z.string()) }),
  mofu: z.object({ objectives: z.array(z.string()), kpis: z.array(z.string()) }),
  bofu: z.object({ objectives: z.array(z.string()), kpis: z.array(z.string()) }),
  conversionPoints: z.array(z.string()),
  dropOffRisks: z.array(z.string()),
  leadQualityExpectations: z.array(z.string()),
  kpis: z.array(z.string())
});

export const MarketingChannelDetailSchema = z.object({
  channelName: z.string(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  expectedROI: z.string(),
  difficulty: z.string(),
  requiredBudget: z.number(),
  expectedLeads: z.number(),
  supportingEvidence: z.string(),
  confidence: z.number().min(0).max(100),
  readinessScore: z.number().min(0).max(100),
  readinessReason: z.string()
});

export const MarketingChannelStrategySchema = z.object({
  channels: z.array(MarketingChannelDetailSchema)
});

export const CreativeStrategySchema = z.object({
  messagingThemes: z.array(z.string()),
  toneOfVoice: z.string(),
  creativeAngles: z.array(z.string()),
  visualDirection: z.string(),
  campaignHooks: z.array(z.string()),
  offerStrategy: z.string(),
  ctaStrategy: z.string()
});

export const MarketingCampaignDetailSchema = z.object({
  campaignName: z.string(),
  objective: z.string(),
  targetAudience: z.string(),
  channel: z.string(),
  coreMessage: z.string(),
  offer: z.string(),
  callToAction: z.string(),
  expectedKpis: z.array(z.string()),
  duration: z.string(),
  estimatedBudget: z.number(),
  expectedROI: z.string(),
  dependencies: z.array(z.string()),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  journeyStage: z.string(),
  funnelStage: z.string(),
  explainability: z.object({
    businessFactsUsed: z.array(z.string()),
    strategicAssetsUsed: z.array(z.string()),
    journeyStage: z.string(),
    funnelStage: z.string(),
    knowledgeChunks: z.array(z.string()),
    kpis: z.array(z.string()),
    evidence: z.string(),
    reasoningSummary: z.string(),
    confidence: z.number().min(0).max(100),
    assumptions: z.array(z.string()),
    constraints: z.array(z.string()),
    alternativeCampaigns: z.array(z.string()),
    expectedOutcome: z.string()
  })
});

export const MarketingCampaignsSchema = z.object({
  campaigns: z.array(MarketingCampaignDetailSchema)
});

export const MarketingBudgetDetailSchema = z.object({
  category: z.string(),
  minAmount: z.number(),
  recommendedAmount: z.number(),
  aggressiveAmount: z.number(),
  reasoning: z.string()
});

export const MarketingBudgetOptimizerSchema = z.object({
  budgets: z.array(MarketingBudgetDetailSchema),
  sensitivityAnalysis: z.string(),
  breakEvenPoint: z.string()
});

export const MarketingExperimentDetailSchema = z.object({
  hypothesis: z.string(),
  expectedKPI: z.string(),
  duration: z.string(),
  successCriteria: z.string(),
  requiredBudget: z.number(),
  confidence: z.number().min(0).max(100),
  businessRisk: z.string(),
  dependencies: z.array(z.string()),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  status: z.string()
});

export const MarketingExperimentPortfolioSchema = z.object({
  experiments: z.array(MarketingExperimentDetailSchema)
});

export const MarketingContentPlanSchema = z.object({
  contentPillars: z.array(z.string()),
  brandThemes: z.array(z.string()),
  educationalTopics: z.array(z.string()),
  authorityTopics: z.array(z.string()),
  conversionContent: z.array(z.string()),
  retentionContent: z.array(z.string()),
  seasonalCampaignIdeas: z.array(z.string())
});

export const MarketingCalendarDetailSchema = z.object({
  timeFrame: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY']),
  label: z.string(),
  activities: z.array(z.string()),
  dependencies: z.array(z.string())
});

export const MarketingCalendarSchema = z.object({
  calendar: z.array(MarketingCalendarDetailSchema)
});

export const MarketingExecutiveScoresSchema = z.object({
  marketingReadiness: z.number().min(0).max(100),
  brandReadiness: z.number().min(0).max(100),
  channelReadiness: z.number().min(0).max(100),
  campaignReadiness: z.number().min(0).max(100),
  creativeReadiness: z.number().min(0).max(100),
  audienceReadiness: z.number().min(0).max(100),
  overallMarketingScore: z.number().min(0).max(100)
});

export const MarketingRecommendationDetailSchema = z.object({
  title: z.string(),
  problem: z.string(),
  opportunity: z.string(),
  evidence: z.string(),
  affectedKpis: z.array(z.string()),
  expectedROI: z.number(),
  expectedLeads: z.number(),
  budget: z.number(),
  timeline: z.string(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  confidence: z.number().min(0).max(100),
  dependencies: z.array(z.string()),
  alternativeApproaches: z.array(z.string())
});

export const MarketingRecommendationsSchema = z.object({
  recommendations: z.array(MarketingRecommendationDetailSchema)
});

// ==========================================
// LEAD ENGINE SCHEMAS — SPRINT 9
// ==========================================

export const IdealCustomerProfileSchema = z.object({
  industry: z.string(),
  companySize: z.string(),
  revenueRange: z.string(),
  decisionMakers: z.array(z.string()),
  painPoints: z.array(z.string()),
  techStack: z.array(z.string()),
  buyingIntent: z.string(),
  budgetLevel: z.number(),
  growthStage: z.string(),
  expectedLtv: z.number(),
  expectedCac: z.number(),
  confidence: z.number().min(0).max(100),
  evidence: z.string()
});

export const LeadProfileSchema = z.object({
  companyName: z.string(),
  industry: z.string(),
  companySize: z.string(),
  revenueRange: z.string(),
  decisionMakers: z.array(z.string()),
  painPoints: z.array(z.string()),
  techStack: z.array(z.string()),
  buyingIntent: z.string(),
  budgetLevel: z.number(),
  growthStage: z.string(),
  expectedLtv: z.number(),
  expectedCac: z.number(),
  confidence: z.number().min(0).max(100),
  evidence: z.string()
});

export const LeadProfilesSchema = z.object({
  leads: z.array(LeadProfileSchema)
});

export const LeadSourceDetailSchema = z.object({
  sourceName: z.string(),
  rank: z.number(),
  expectedRoi: z.string(),
  difficulty: z.string(),
  requiredBudget: z.number(),
  expectedLeads: z.number(),
  confidence: z.number().min(0).max(100),
  evidence: z.string()
});

export const LeadSourcesSchema = z.object({
  sources: z.array(LeadSourceDetailSchema)
});

export const LeadQualificationSchema = z.object({
  fitScore: z.number().min(0).max(100),
  intentScore: z.number().min(0).max(100),
  budgetScore: z.number().min(0).max(100),
  authorityScore: z.number().min(0).max(100),
  needScore: z.number().min(0).max(100),
  timingScore: z.number().min(0).max(100),
  overallQualification: z.number().min(0).max(100)
});

export const LeadScoringSchema = z.object({
  qualityScore: z.number().min(0).max(100),
  valueScore: z.number().min(0).max(100),
  conversionProbability: z.number().min(0).max(100),
  revenuePotential: z.number(),
  riskScore: z.number().min(0).max(100),
  urgencyScore: z.number().min(0).max(100),
  priorityTier: z.enum(['Tier 1', 'Tier 2', 'Tier 3']),
  explainability: z.string()
});

export const LeadSegmentDetailSchema = z.object({
  segmentName: z.string(),
  industry: z.string(),
  companySize: z.string(),
  expectedDealSize: z.number(),
  leadsCount: z.number()
});

export const LeadSegmentationSchema = z.object({
  segments: z.array(LeadSegmentDetailSchema)
});

export const LeadJourneyDetailSchema = z.object({
  journeyType: z.enum(['Cold', 'Warm', 'Hot', 'Enterprise', 'SMB']),
  touchpoints: z.array(z.string()),
  messages: z.array(z.string()),
  waitingPeriods: z.array(z.string()),
  successKpis: z.array(z.string())
});

export const LeadNurturingSchema = z.object({
  journeys: z.array(LeadJourneyDetailSchema)
});

export const LeadRecommendationDetailSchema = z.object({
  title: z.string(),
  nextBestAction: z.string(),
  expectedCloseProb: z.number().min(0).max(100),
  expectedTimeline: z.string(),
  riskFactors: z.array(z.string()),
  dependencies: z.array(z.string()),
  alternativeActions: z.array(z.string())
});

export const LeadRecommendationsSchema = z.object({
  recommendations: z.array(LeadRecommendationDetailSchema)
});

export const LeadForecastSchema = z.object({
  expectedLeads: z.number(),
  qualifiedLeads: z.number(),
  sqlCount: z.number(),
  conversionRate: z.number(),
  revenue: z.number(),
  pipelineValue: z.number(),
  confidenceMin: z.number(),
  confidenceMax: z.number()
});

export const LeadPlaybookDetailSchema = z.object({
  name: z.string(),
  playRules: z.string(),
  targetAudience: z.string(),
  triggerCondition: z.string(),
  recommendedSteps: z.array(z.string())
});

export const LeadPlaybooksSchema = z.object({
  playbooks: z.array(LeadPlaybookDetailSchema)
});

// ================================================================
// ZOD OUTPUT CONTRACTS FOR SALES ENGINE — SPRINT 10
// ================================================================

export const SalesOpportunityDetailSchema = z.object({
  opportunityName: z.string(),
  businessValue: z.string(),
  revenuePotential: z.number(),
  strategicImportance: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  expansionOpportunity: z.string(),
  crossSellOpportunity: z.string(),
  upsellOpportunity: z.string(),
  competitiveRisk: z.string(),
  confidence: z.number().min(0).max(100),
  evidence: z.string()
});

export const OpportunityAnalysisSchema = z.object({
  opportunities: z.array(SalesOpportunityDetailSchema)
});

export const DealHealthDetailSchema = z.object({
  opportunityName: z.string(),
  needScore: z.number().min(0).max(100),
  authorityScore: z.number().min(0).max(100),
  budgetScore: z.number().min(0).max(100),
  timelineScore: z.number().min(0).max(100),
  urgencyScore: z.number().min(0).max(100),
  competitivePosition: z.number().min(0).max(100),
  relationshipStrength: z.number().min(0).max(100),
  buyingSignals: z.number().min(0).max(100),
  riskLevel: z.number().min(0).max(100),
  overallHealthScore: z.number().min(0).max(100),
  explainability: z.string()
});

export const DealQualificationsSchema = z.object({
  dealHealths: z.array(DealHealthDetailSchema)
});

export const StakeholderDetailSchema = z.object({
  name: z.string(),
  role: z.string(),
  influenceLevel: z.string(),
  decisionPower: z.string(),
  objections: z.array(z.string()),
  motivations: z.array(z.string()),
  preferredCommunicationStyle: z.string(),
  risk: z.string(),
  recommendedSalesStrategy: z.string()
});

export const BuyingCommitteeSchema = z.object({
  stakeholders: z.array(StakeholderDetailSchema)
});

export const NegotiationStrategySchema = z.object({
  negotiationObjectives: z.array(z.string()),
  pricingFlexibility: z.string(),
  concessions: z.array(z.string()),
  walkAwayConditions: z.array(z.string()),
  riskAnalysis: z.string(),
  winStrategy: z.string(),
  alternativeApproaches: z.string()
});

export const ObjectionDetailSchema = z.object({
  category: z.string(),
  objection: z.string(),
  recommendedResponse: z.string(),
  supportingEvidence: z.string(),
  businessCase: z.string()
});

export const ObjectionHandlingSchema = z.object({
  objections: z.array(ObjectionDetailSchema)
});

export const ProposalStrategySchema = z.object({
  proposalStructure: z.array(z.string()),
  valueNarrative: z.string(),
  roiStory: z.string(),
  caseStudySuggestions: z.array(z.string()),
  proofPoints: z.array(z.string()),
  successMetrics: z.array(z.string()),
  recommendedTimeline: z.string()
});

export const RevenueOptimizationSchema = z.object({
  upsellOpportunities: z.array(z.string()),
  crossSellOpportunities: z.array(z.string()),
  bundleOpportunities: z.array(z.string()),
  renewalOpportunities: z.array(z.string()),
  expansionAccounts: z.array(z.string()),
  revenueRisks: z.array(z.string())
});

export const SalesForecastSchema = z.object({
  bestCase: z.number(),
  expectedCase: z.number(),
  worstCase: z.number(),
  expectedRevenue: z.number(),
  pipelineValue: z.number(),
  closeProbability: z.number().min(0).max(100),
  forecastConfidence: z.number().min(0).max(100)
});

export const NextBestActionDetailSchema = z.object({
  opportunityName: z.string(),
  immediateAction: z.string(),
  followUpAction: z.string(),
  escalation: z.string(),
  requiredResources: z.array(z.string()),
  expectedOutcome: z.string(),
  successKPI: z.string(),
  deadline: z.string(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
});

export const NextBestActionSchema = z.object({
  actions: z.array(NextBestActionDetailSchema)
});

export const SalesPlaybookDetailSchema = z.object({
  name: z.string(),
  playRules: z.string(),
  targetAudience: z.string(),
  triggerCondition: z.string(),
  recommendedSteps: z.array(z.string()),
  objectionLibrary: z.string(),
  negotiationFramework: z.string(),
  proposalTemplate: z.string()
});

export const SalesPlaybooksSchema = z.object({
  playbooks: z.array(SalesPlaybookDetailSchema)
});

export const SalesRecommendationDetailSchema = z.object({
  opportunityName: z.string(),
  title: z.string(),
  nextBestAction: z.string(),
  expectedCloseProb: z.number().min(0).max(100),
  expectedTimeline: z.string(),
  riskFactors: z.array(z.string()),
  dependencies: z.array(z.string()),
  alternativeActions: z.array(z.string())
});

export const SalesRecommendationsSchema = z.object({
  recommendations: z.array(SalesRecommendationDetailSchema)
});

export const ExecutiveScoresSchema = z.object({
  pipelineHealth: z.number().min(0).max(100),
  forecastReliability: z.number().min(0).max(100),
  revenueStability: z.number().min(0).max(100),
  expansionPotential: z.number().min(0).max(100),
  revenueRisk: z.number().min(0).max(100),
  growthMomentum: z.number().min(0).max(100),
  overallExecutiveRevenueScore: z.number().min(0).max(100)
});

// ==========================================
// SPRINT 11 — AI ANALYTICS & BUSINESS EVOLUTION SCHEMAS
// ==========================================

export const BusinessHealthScoreSchema = z.object({
  operationalHealth: z.number().min(0).max(100),
  salesHealth: z.number().min(0).max(100),
  marketingHealth: z.number().min(0).max(100),
  leadHealth: z.number().min(0).max(100),
  customerHealth: z.number().min(0).max(100),
  innovationHealth: z.number().min(0).max(100),
  overallExecutiveHealth: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  evidence: z.string(),
  trendDirection: z.enum(['UP', 'DOWN', 'STABLE']),
  expectedDirection: z.enum(['IMPROVING', 'DECLINING', 'STABLE'])
});

export const GrowthScoreSchema = z.object({
  growthScore: z.number().min(0).max(100),
  velocityIndex: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100)
});

export const RevenueHealthSchema = z.object({
  pipelineValue: z.number().min(0),
  leakagePoints: z.array(z.string()),
  stabilityScore: z.number().min(0).max(100)
});

export const MarketReadinessSchema = z.object({
  productReadiness: z.number().min(0).max(100),
  salesReadiness: z.number().min(0).max(100),
  marketingReadiness: z.number().min(0).max(100),
  expansionReadiness: z.number().min(0).max(100),
  investmentReadiness: z.number().min(0).max(100),
  internationalReadiness: z.number().min(0).max(100)
});

export const CompetitivePositionSchema = z.object({
  competitivePosition: z.string(),
  marketPosition: z.string(),
  differentiators: z.array(z.string()),
  weaknesses: z.array(z.string()),
  threats: z.array(z.string()),
  opportunities: z.array(z.string()),
  competitiveConfidence: z.number().min(0).max(100)
});

export const ForecastSnapshotSchema = z.object({
  horizonDays: z.number(),
  revenueForecast: z.number().min(0),
  pipelineForecast: z.number().min(0),
  growthForecast: z.number().min(0),
  riskForecast: z.number().min(0),
  expansionForecast: z.number().min(0),
  confidenceMin: z.number().min(0).max(100),
  confidenceMax: z.number().min(0).max(100),
  bestCase: z.number().min(0),
  expectedCase: z.number().min(0),
  worstCase: z.number().min(0)
});

export const ForecastSnapshotsSchema = z.object({
  forecasts: z.array(ForecastSnapshotSchema)
});

export const BusinessRiskSchema = z.object({
  category: z.enum(['REVENUE', 'MARKETING', 'SALES', 'OPERATIONAL', 'FINANCIAL', 'COMPETITIVE', 'TECHNOLOGY', 'EXECUTION']),
  severity: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  probability: z.number().min(0).max(100),
  businessImpact: z.string(),
  mitigation: z.string()
});

export const BusinessRisksSchema = z.object({
  risks: z.array(BusinessRiskSchema)
});

export const BusinessOpportunitySchema = z.object({
  type: z.enum(['QUICK_WIN', 'HIGH_IMPACT', 'EXPANSION', 'COST_OPTIMIZATION', 'REVENUE_GROWTH', 'MARKET_EXPANSION', 'PARTNERSHIP']),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  expectedImpact: z.string(),
  mitigation: z.string().optional()
});

export const BusinessOpportunitiesSchema = z.object({
  opportunities: z.array(BusinessOpportunitySchema)
});

export const ExecutiveInsightSchema = z.object({
  ceoSummary: z.string(),
  boardSummary: z.string(),
  criticalFind: z.array(z.string()),
  topOpp: z.array(z.string()),
  topRisk: z.array(z.string()),
  narrative: z.string()
});

export const PredictionHistorySchema = z.object({
  metricName: z.string(),
  predictedVal: z.number(),
  confidence: z.number().min(0).max(100),
  horizonDays: z.number(),
  horizonDate: z.string(), // ISO String
  evidence: z.string()
});

export const PredictionHistoriesSchema = z.object({
  predictions: z.array(PredictionHistorySchema)
});

export const AnalyticsRecommendationDetailSchema = z.object({
  title: z.string(),
  nextBestAction: z.string(),
  expectedOutcome: z.string(),
  expectedTimeline: z.string(),
  riskFactors: z.array(z.string()),
  dependencies: z.array(z.string()),
  alternativeActions: z.array(z.string())
});

export const AnalyticsRecommendationsSchema = z.object({
  recommendations: z.array(AnalyticsRecommendationDetailSchema)
});

export const SnapshotComparisonSchema = z.object({
  whatChanged: z.string(),
  whyItChanged: z.string(),
  causativeEngine: z.string(),
  positiveImpact: z.string(),
  negativeImpact: z.string(),
  metricsAffected: z.array(z.string()),
  forecastDiff: z.string(),
  confidenceDiff: z.string(),
  riskDiff: z.string(),
  opportunityDiff: z.string(),
  executiveSummary: z.string()
});

// ==========================================
// CUSTOMER SUCCESS SCHEMAS — SPRINT 12
// ==========================================

export const CustomerDigitalTwinSchema = z.object({
  name: z.string(),
  profileData: z.any(),
  productsPurchased: z.array(z.string()),
  customerGoals: z.array(z.string()),
  businessOutcomes: z.array(z.string()),
  usagePatterns: z.any(),
  featureAdoption: z.any(),
  relationHealth: z.number().min(0).max(100),
  satisfactionScore: z.number().min(0).max(100),
  revenueContribution: z.number().min(0),
  executiveSponsor: z.string(),
  riskRegister: z.array(z.string())
});

export const CustomerHealthSchema = z.object({
  overallHealth: z.number().min(0).max(100),
  relationshipHealth: z.number().min(0).max(100),
  productAdoption: z.number().min(0).max(100),
  featureAdoption: z.number().min(0).max(100),
  supportHealth: z.number().min(0).max(100),
  valueRealization: z.number().min(0).max(100),
  execEngagement: z.number().min(0).max(100),
  renewalReadiness: z.number().min(0).max(100),
  expansionReadiness: z.number().min(0).max(100),
  riskLevel: z.number().min(0).max(100),
  healthTrend: z.enum(['UP', 'DOWN', 'STABLE']),
  confidence: z.number().min(0).max(100)
});

export const CustomerSuccessJourneySchema = z.object({
  currentStage: z.enum(['ONBOARDING', 'ACTIVATION', 'ADOPTION', 'VALUE_REALIZATION', 'EXPANSION', 'RENEWAL', 'ADVOCACY']),
  stageStatus: z.string(),
  successCriteria: z.array(z.string()),
  risks: z.array(z.string()),
  recommendedActions: z.array(z.string())
});

export const SupportIntelligenceSchema = z.object({
  ticketNumber: z.string(),
  category: z.enum(['BUG', 'QUESTION', 'FEATURE_REQUEST', 'INTEGRATION']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  subject: z.string(),
  description: z.string(),
  rootCause: z.string().optional(),
  resolution: z.string().optional(),
  expectedResolutionTime: z.string().optional(),
  customerImpact: z.string().optional(),
  isRecurring: z.boolean().default(false)
});

export const CustomerSentimentSchema = z.object({
  sentimentScore: z.number().min(-100).max(100),
  sentimentTrend: z.enum(['IMPROVING', 'DECLINING', 'STABLE']),
  confidence: z.number().min(0).max(100),
  businessImpact: z.string(),
  relationshipRisk: z.string(),
  executiveRisk: z.string()
});

export const RenewalForecastSchema = z.object({
  renewalDate: z.string(),
  renewalProbability: z.number().min(0).max(100),
  expectedValue: z.number().min(0),
  confidence: z.number().min(0).max(100)
});

export const RenewalPlanSchema = z.object({
  planOwner: z.string(),
  renewalStrategy: z.string(),
  executiveActions: z.array(z.string()),
  keyRisks: z.array(z.string()),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXECUTED'])
});

export const ExpansionOpportunitySchema = z.object({
  title: z.string(),
  type: z.enum(['CROSS_SELL', 'UPSELL', 'NEW_PRODUCT']),
  fitScore: z.number().min(0).max(100),
  expectedRevenue: z.number().min(0),
  businessJustification: z.string()
});

export const ChurnPredictionSchema = z.object({
  churnProbability: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  primaryRootCause: z.string(),
  earlyWarningSignals: z.array(z.string()),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
});

export const RetentionStrategySchema = z.object({
  strategyName: z.string(),
  executionPlan: z.string(),
  estimatedCost: z.number().min(0),
  successProbability: z.number().min(0).max(100)
});

export const CustomerRecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  nextBestAction: z.string(),
  expectedOutcome: z.string(),
  confidence: z.number().min(0).max(100),
  factsUsed: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  alternativeActions: z.array(z.string()).optional()
});

export const CustomerRecommendationsSchema = z.object({
  recommendations: z.array(CustomerRecommendationSchema)
});

export const CustomerSuccessScoreSchema = z.object({
  healthScore: z.number().min(0).max(100),
  relationshipStrength: z.number().min(0).max(100),
  valueDelivered: z.number().min(0).max(100),
  renewalConfidence: z.number().min(0).max(100),
  expansionPotential: z.number().min(0).max(100),
  executiveSatisfaction: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100)
});

export const CustomerValueRealizationSchema = z.object({
  goals: z.array(z.string()),
  expectedOutcomes: z.array(z.string()),
  actualOutcomes: z.array(z.string()),
  goalAchievementRate: z.number().min(0).max(100),
  roiDelivered: z.number(),
  valueDelivered: z.number(),
  timeToValueDays: z.number().int(),
  valueScore: z.number().min(0).max(100),
  valueTrend: z.enum(['IMPROVING', 'DECLINING', 'STABLE']),
  valueRisk: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  recommendedActions: z.array(z.string())
});

export const CustomerAdvocacySchema = z.object({
  advocacyScore: z.number().min(0).max(100),
  referenceLikelihood: z.number().min(0).max(100),
  testimonialProb: z.number().min(0).max(100),
  caseStudyProb: z.number().min(0).max(100),
  npsScore: z.number(),
  advocacyStrategy: z.string(),
  executiveActions: z.array(z.string())
});

export const CustomerPortfolioIntelligenceSchema = z.object({
  highestRiskAccounts: z.array(z.object({ customerId: z.string(), companyName: z.string(), riskProb: z.number() })),
  highestValueAccounts: z.array(z.object({ customerId: z.string(), companyName: z.string(), arr: z.number() })),
  fastestGrowingAccounts: z.array(z.object({ customerId: z.string(), companyName: z.string(), growthRate: z.number() })),
  accountsRequiringAttention: z.array(z.object({ customerId: z.string(), companyName: z.string(), reason: z.string() })),
  expansionPipelineValue: z.number(),
  renewalPipelineValue: z.number(),
  overallPortfolioHealth: z.number()
});

export const ExecutiveAccountIntelligenceSchema = z.object({
  currentHealth: z.number(),
  businessGoals: z.array(z.string()),
  roiDelivered: z.number(),
  expansionPotential: z.number(),
  renewalReadiness: z.number(),
  relationshipStrength: z.number(),
  customerRisks: z.array(z.string()),
  executiveActions: z.array(z.string()),
  priorityScore: z.number(),
  confidence: z.number()
});

export const SuccessPlaybooksSchema = z.object({
  playbooks: z.array(z.object({
    name: z.string(),
    triggerCondition: z.string(),
    steps: z.array(z.string()),
    responsibleRole: z.string(),
    kpiToMonitor: z.string()
  }))
});

// ==========================================
// EXECUTIVE BOARD SCHEMAS — SPRINT 13
// ==========================================

export const ExecutiveRecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  nextBestAction: z.string(),
  expectedOutcome: z.string(),
  confidence: z.number().min(0).max(100),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  businessImpact: z.string(),
  dependencies: z.array(z.string()),
  strategicAlignment: z.string()
});

export const ExecutiveRecommendationsSchema = z.object({
  recommendations: z.array(ExecutiveRecommendationSchema)
});

export const ExecutiveConflictSchema = z.object({
  title: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  affectedEngines: z.array(z.string()),
  businessImpact: z.string(),
  resolutionOptions: z.array(z.string()),
  recommendedResolution: z.string(),
  status: z.enum(['OPEN', 'RESOLVED']).default('OPEN')
});

export const ExecutiveConflictsSchema = z.object({
  conflicts: z.array(ExecutiveConflictSchema)
});

export const ExecutiveConsensusSchema = z.object({
  recommendationId: z.string().optional(),
  supportScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  businessImpact: z.string(),
  dependencies: z.array(z.string()),
  priority: z.string(),
  finalConsensus: z.string()
});

export const ExecutiveConsensusesSchema = z.object({
  consensus: z.array(ExecutiveConsensusSchema)
});

export const ExecutiveAgendaSchema = z.object({
  topic: z.string(),
  priority: z.string(),
  discussionPoints: z.array(z.string()),
  status: z.string().default('OPEN')
});

export const ExecutiveMeetingSchema = z.object({
  notes: z.string(),
  decisionSummary: z.string(),
  consensusHistory: z.string(),
  agenda: z.string(),
  participants: z.array(z.string()),
  votes: z.array(z.object({ engine: z.string(), vote: z.string(), reason: z.string() })),
  conflicts: z.array(z.string()),
  consensus: z.number(),
  supportingEvidence: z.string(),
  finalDecisions: z.array(z.string()),
  assignedOwners: z.array(z.object({ task: z.string(), owner: z.string() })),
  deadlines: z.array(z.object({ task: z.string(), date: z.string() })),
  affectedKPIs: z.array(z.string()),
  meetingOutcome: z.string(),
  meetingConfidence: z.number(),
  reflectionSummary: z.string()
});

export const ExecutiveActionSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).default('PENDING'),
  timeline: z.string(),
  priority: z.string(),
  kpiImpact: z.string(),
  expectedOutcome: z.string()
});

export const ExecutiveActionOwnerSchema = z.object({
  engineName: z.string(),
  name: z.string(),
  role: z.string(),
  email: z.string().optional()
});

export const ExecutivePrioritySchema = z.object({
  level: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  businessImpact: z.string(),
  revenue: z.number(),
  risk: z.number(),
  confidence: z.number(),
  dependencies: z.array(z.string()),
  strategicAlignment: z.string()
});

export const ExecutiveDecisionSchema = z.object({
  title: z.string(),
  choice: z.string(),
  logic: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
  expectedOutcome: z.string().optional(),
  confidence: z.number(),
  evidenceUsed: z.array(z.string()),
  assumptions: z.array(z.string()),
  constraints: z.array(z.string()),
  alternativeDecisions: z.array(z.string()),
  participatingEngines: z.array(z.string()),
  businessFacts: z.array(z.string()),
  knowledgeChunks: z.array(z.string()),
  historicalContext: z.array(z.string())
});

export const ExecutiveBriefSchema = z.object({
  businessHealth: z.number(),
  growthScore: z.number(),
  revenueHealth: z.number(),
  customerHealth: z.number(),
  topOpportunities: z.array(z.string()),
  topRisks: z.array(z.string()),
  urgentDecisions: z.array(z.string()),
  forecast: z.object({ revenue: z.number(), margin: z.number() }),
  kpiSummary: z.array(z.object({ kpi: z.string(), value: z.string() })),
  trendSummary: z.array(z.string()),
  competitiveSummary: z.string(),
  marketReadiness: z.number(),
  recommendedActions: z.array(z.string()),
  executiveCalendar: z.array(z.string()),
  expectedOutcomes: z.array(z.string())
});

export const ExecutiveAlertSchema = z.object({
  category: z.enum(['CRITICAL', 'REVENUE', 'GROWTH', 'CUSTOMER', 'COMPETITIVE', 'FORECAST', 'RISK']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidence: z.number(),
  businessImpact: z.string(),
  recommendedAction: z.string()
});

export const ExecutiveAlertsSchema = z.object({
  alerts: z.array(ExecutiveAlertSchema)
});

export const ExecutiveOperatingPlanSchema = z.object({
  todayPriorities: z.array(z.string()),
  thisWeek: z.array(z.string()),
  thisMonth: z.array(z.string()),
  quarterGoals: z.array(z.string()),
  strategicInitiatives: z.array(z.object({ title: z.string(), outcome: z.string() })),
  operationalInitiatives: z.array(z.object({ title: z.string(), outcome: z.string() })),
  revenueInitiatives: z.array(z.object({ title: z.string(), outcome: z.string() })),
  customerInitiatives: z.array(z.object({ title: z.string(), outcome: z.string() })),
  innovationInitiatives: z.array(z.object({ title: z.string(), outcome: z.string() }))
});

export const ExecutiveRoadmapSchema = z.object({
  phase: z.enum(['NOW', 'NEXT', 'LATER']),
  itemText: z.string(),
  businessValue: z.string(),
  risk: z.string(),
  confidence: z.number(),
  requiredResources: z.array(z.string()),
  dependencies: z.array(z.string()),
  status: z.string().default('PLANNED')
});

export const ExecutiveRoadmapsSchema = z.object({
  roadmaps: z.array(ExecutiveRoadmapSchema)
});

export const ExecutiveDecisionSimulationSchema = z.object({
  executiveSummary: z.string(),
  revenueImpact: z.string(),
  leadImpact: z.string(),
  cacImpact: z.string(),
  ltvImpact: z.string(),
  growthScoreImpact: z.string(),
  businessHealthImpact: z.string(),
  risks: z.array(z.string()),
  departmentsAffected: z.array(z.string()),
  confidence: z.number(),
  engineDisagreements: z.array(z.object({ engine: z.string(), challenge: z.string() })),
  consensusLevel: z.number(),
  recommendedExecutionOrder: z.array(z.string())
});
