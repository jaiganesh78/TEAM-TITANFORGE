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
    return schema.parse(raw);
  }
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

