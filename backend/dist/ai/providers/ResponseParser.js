"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityAnalysisSchema = exports.SalesOpportunityDetailSchema = exports.LeadPlaybooksSchema = exports.LeadPlaybookDetailSchema = exports.LeadForecastSchema = exports.LeadRecommendationsSchema = exports.LeadRecommendationDetailSchema = exports.LeadNurturingSchema = exports.LeadJourneyDetailSchema = exports.LeadSegmentationSchema = exports.LeadSegmentDetailSchema = exports.LeadScoringSchema = exports.LeadQualificationSchema = exports.LeadSourcesSchema = exports.LeadSourceDetailSchema = exports.LeadProfilesSchema = exports.LeadProfileSchema = exports.IdealCustomerProfileSchema = exports.MarketingRecommendationsSchema = exports.MarketingRecommendationDetailSchema = exports.MarketingExecutiveScoresSchema = exports.MarketingCalendarSchema = exports.MarketingCalendarDetailSchema = exports.MarketingContentPlanSchema = exports.MarketingExperimentPortfolioSchema = exports.MarketingExperimentDetailSchema = exports.MarketingBudgetOptimizerSchema = exports.MarketingBudgetDetailSchema = exports.MarketingCampaignsSchema = exports.MarketingCampaignDetailSchema = exports.CreativeStrategySchema = exports.MarketingChannelStrategySchema = exports.MarketingChannelDetailSchema = exports.FunnelAnalysisSchema = exports.CustomerJourneySchema = exports.CustomerJourneyStageSchema = exports.AudienceAnalysisSchema = exports.ResponseParser = exports.ExecutiveSummarySchema = exports.RecommendationsSchema = exports.RecommendationSchema = exports.GrowthOpportunitiesSchema = exports.GrowthOpportunitySchema = exports.PositioningSchema = exports.PricingSchema = exports.MarketAnalysisSchema = exports.CompetitorAnalysisSchema = exports.CompetitorProfileSchema = exports.SwotSchema = exports.SwotItemSchema = void 0;
exports.CustomerPortfolioIntelligenceSchema = exports.CustomerAdvocacySchema = exports.CustomerValueRealizationSchema = exports.CustomerSuccessScoreSchema = exports.CustomerRecommendationsSchema = exports.CustomerRecommendationSchema = exports.RetentionStrategySchema = exports.ChurnPredictionSchema = exports.ExpansionOpportunitySchema = exports.RenewalPlanSchema = exports.RenewalForecastSchema = exports.CustomerSentimentSchema = exports.SupportIntelligenceSchema = exports.CustomerSuccessJourneySchema = exports.CustomerHealthSchema = exports.CustomerDigitalTwinSchema = exports.SnapshotComparisonSchema = exports.AnalyticsRecommendationsSchema = exports.AnalyticsRecommendationDetailSchema = exports.PredictionHistoriesSchema = exports.PredictionHistorySchema = exports.ExecutiveInsightSchema = exports.BusinessOpportunitiesSchema = exports.BusinessOpportunitySchema = exports.BusinessRisksSchema = exports.BusinessRiskSchema = exports.ForecastSnapshotsSchema = exports.ForecastSnapshotSchema = exports.CompetitivePositionSchema = exports.MarketReadinessSchema = exports.RevenueHealthSchema = exports.GrowthScoreSchema = exports.BusinessHealthScoreSchema = exports.ExecutiveScoresSchema = exports.SalesRecommendationsSchema = exports.SalesRecommendationDetailSchema = exports.SalesPlaybooksSchema = exports.SalesPlaybookDetailSchema = exports.NextBestActionSchema = exports.NextBestActionDetailSchema = exports.SalesForecastSchema = exports.RevenueOptimizationSchema = exports.ProposalStrategySchema = exports.ObjectionHandlingSchema = exports.ObjectionDetailSchema = exports.NegotiationStrategySchema = exports.BuyingCommitteeSchema = exports.StakeholderDetailSchema = exports.DealQualificationsSchema = exports.DealHealthDetailSchema = void 0;
exports.ExecutiveDecisionSimulationSchema = exports.ExecutiveRoadmapsSchema = exports.ExecutiveRoadmapSchema = exports.ExecutiveOperatingPlanSchema = exports.ExecutiveAlertsSchema = exports.ExecutiveAlertSchema = exports.ExecutiveBriefSchema = exports.ExecutiveDecisionSchema = exports.ExecutivePrioritySchema = exports.ExecutiveActionOwnerSchema = exports.ExecutiveActionSchema = exports.ExecutiveMeetingSchema = exports.ExecutiveAgendaSchema = exports.ExecutiveConsensusesSchema = exports.ExecutiveConsensusSchema = exports.ExecutiveConflictsSchema = exports.ExecutiveConflictSchema = exports.ExecutiveRecommendationsSchema = exports.ExecutiveRecommendationSchema = exports.SuccessPlaybooksSchema = exports.ExecutiveAccountIntelligenceSchema = void 0;
const zod_1 = require("zod");
// ================================================================
// ZOD OUTPUT CONTRACTS FOR STRATEGY ENGINE
// ================================================================
exports.SwotItemSchema = zod_1.z.object({
    item: zod_1.z.string(),
    evidence: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(100)
});
exports.SwotSchema = zod_1.z.object({
    strengths: zod_1.z.array(exports.SwotItemSchema),
    weaknesses: zod_1.z.array(exports.SwotItemSchema),
    opportunities: zod_1.z.array(exports.SwotItemSchema),
    threats: zod_1.z.array(exports.SwotItemSchema)
});
exports.CompetitorProfileSchema = zod_1.z.object({
    name: zod_1.z.string(),
    marketPosition: zod_1.z.string(),
    strengths: zod_1.z.array(zod_1.z.string()),
    weaknesses: zod_1.z.array(zod_1.z.string()),
    differentiators: zod_1.z.array(zod_1.z.string()),
    pricingPosition: zod_1.z.string(),
    brandPosition: zod_1.z.string(),
    competitiveRisks: zod_1.z.array(zod_1.z.string())
});
exports.CompetitorAnalysisSchema = zod_1.z.object({
    competitors: zod_1.z.array(exports.CompetitorProfileSchema)
});
exports.MarketAnalysisSchema = zod_1.z.object({
    marketOverview: zod_1.z.string(),
    industryTrends: zod_1.z.array(zod_1.z.string()),
    emergingOpportunities: zod_1.z.array(zod_1.z.string()),
    threats: zod_1.z.array(zod_1.z.string()),
    technologyTrends: zod_1.z.array(zod_1.z.string()),
    consumerBehaviour: zod_1.z.string(),
    marketRisks: zod_1.z.array(zod_1.z.string())
});
exports.PricingSchema = zod_1.z.object({
    pricingEvaluation: zod_1.z.string(),
    pricingOpportunities: zod_1.z.array(zod_1.z.string()),
    suggestedPricingStrategy: zod_1.z.string(),
    risks: zod_1.z.array(zod_1.z.string()),
    expectedImpact: zod_1.z.string()
});
exports.PositioningSchema = zod_1.z.object({
    currentPositioning: zod_1.z.string(),
    recommendedPositioning: zod_1.z.string(),
    uniqueValueProposition: zod_1.z.string(),
    differentiators: zod_1.z.array(zod_1.z.string()),
    targetAudienceAlignment: zod_1.z.string(),
    brandNarrative: zod_1.z.string()
});
exports.GrowthOpportunitySchema = zod_1.z.object({
    title: zod_1.z.string(),
    type: zod_1.z.string(), // Quick Win | Medium-term | Long-term
    expectedImpact: zod_1.z.string(),
    difficulty: zod_1.z.string(),
    dependencies: zod_1.z.array(zod_1.z.string()),
    confidence: zod_1.z.number(),
    evidence: zod_1.z.string()
});
exports.GrowthOpportunitiesSchema = zod_1.z.object({
    opportunities: zod_1.z.array(exports.GrowthOpportunitySchema)
});
exports.RecommendationSchema = zod_1.z.object({
    title: zod_1.z.string(),
    problem: zod_1.z.string(),
    evidence: zod_1.z.string(),
    businessContext: zod_1.z.string(),
    reasoning: zod_1.z.string(),
    expectedKpiImpact: zod_1.z.string(),
    affectedKpis: zod_1.z.array(zod_1.z.string()),
    requiredData: zod_1.z.array(zod_1.z.string()),
    dependencies: zod_1.z.array(zod_1.z.string()),
    priority: zod_1.z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    confidence: zod_1.z.number(),
    estimatedTimeline: zod_1.z.string(),
    expectedROI: zod_1.z.string(),
    businessRisks: zod_1.z.string(),
    alternativeStrategies: zod_1.z.string(),
    explainability: zod_1.z.object({
        knowledgeSources: zod_1.z.array(zod_1.z.string()),
        businessFactsUsed: zod_1.z.array(zod_1.z.string()),
        growthDomainsUsed: zod_1.z.array(zod_1.z.string()),
        reasoningSummary: zod_1.z.string(),
        assumptions: zod_1.z.array(zod_1.z.string()),
        constraints: zod_1.z.array(zod_1.z.string()),
        whySelected: zod_1.z.string(),
        whyAlternativesRejected: zod_1.z.string()
    })
});
exports.RecommendationsSchema = zod_1.z.object({
    recommendations: zod_1.z.array(exports.RecommendationSchema)
});
exports.ExecutiveSummarySchema = zod_1.z.object({
    summary: zod_1.z.string(),
    criticalPriorities: zod_1.z.array(zod_1.z.string()),
    primaryBlockers: zod_1.z.array(zod_1.z.string())
});
// ================================================================
// RESPONSE PARSER
// ================================================================
class ResponseParser {
    /**
     * Cleans model output string (stripping markdown fences) and parses JSON.
     */
    static parseCleanJson(text) {
        let clean = text.trim();
        // Strip markdown code block wrappers if generated
        if (clean.startsWith('```')) {
            const lines = clean.split('\n');
            if (lines[0].includes('json')) {
                lines.shift();
            }
            else {
                lines.shift();
            }
            if (lines[lines.length - 1] === '```') {
                lines.pop();
            }
            clean = lines.join('\n').trim();
        }
        try {
            return JSON.parse(clean);
        }
        catch (err) {
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
    static parseAndValidate(text, schema) {
        const raw = this.parseCleanJson(text);
        return schema.parse(raw);
    }
}
exports.ResponseParser = ResponseParser;
// ================================================================
// ZOD OUTPUT CONTRACTS FOR MARKETING ENGINE — SPRINT 8
// ================================================================
exports.AudienceAnalysisSchema = zod_1.z.object({
    primaryAudience: zod_1.z.string(),
    secondaryAudience: zod_1.z.string(),
    buyingMotivations: zod_1.z.array(zod_1.z.string()),
    painPoints: zod_1.z.array(zod_1.z.string()),
    buyingBarriers: zod_1.z.array(zod_1.z.string()),
    preferredChannels: zod_1.z.array(zod_1.z.string()),
    decisionDrivers: zod_1.z.array(zod_1.z.string()),
    confidence: zod_1.z.number().min(0).max(100),
    evidence: zod_1.z.string()
});
exports.CustomerJourneyStageSchema = zod_1.z.object({
    objectives: zod_1.z.array(zod_1.z.string()),
    painPoints: zod_1.z.array(zod_1.z.string()),
    recommendedChannels: zod_1.z.array(zod_1.z.string()),
    recommendedContent: zod_1.z.array(zod_1.z.string()),
    expectedKPIs: zod_1.z.array(zod_1.z.string()),
    risks: zod_1.z.array(zod_1.z.string()),
    opportunities: zod_1.z.array(zod_1.z.string())
});
exports.CustomerJourneySchema = zod_1.z.object({
    awareness: exports.CustomerJourneyStageSchema,
    interest: exports.CustomerJourneyStageSchema,
    consideration: exports.CustomerJourneyStageSchema,
    purchase: exports.CustomerJourneyStageSchema,
    onboarding: exports.CustomerJourneyStageSchema,
    retention: exports.CustomerJourneyStageSchema,
    advocacy: exports.CustomerJourneyStageSchema
});
exports.FunnelAnalysisSchema = zod_1.z.object({
    tofu: zod_1.z.object({ objectives: zod_1.z.array(zod_1.z.string()), kpis: zod_1.z.array(zod_1.z.string()) }),
    mofu: zod_1.z.object({ objectives: zod_1.z.array(zod_1.z.string()), kpis: zod_1.z.array(zod_1.z.string()) }),
    bofu: zod_1.z.object({ objectives: zod_1.z.array(zod_1.z.string()), kpis: zod_1.z.array(zod_1.z.string()) }),
    conversionPoints: zod_1.z.array(zod_1.z.string()),
    dropOffRisks: zod_1.z.array(zod_1.z.string()),
    leadQualityExpectations: zod_1.z.array(zod_1.z.string()),
    kpis: zod_1.z.array(zod_1.z.string())
});
exports.MarketingChannelDetailSchema = zod_1.z.object({
    channelName: zod_1.z.string(),
    priority: zod_1.z.enum(['HIGH', 'MEDIUM', 'LOW']),
    expectedROI: zod_1.z.string(),
    difficulty: zod_1.z.string(),
    requiredBudget: zod_1.z.number(),
    expectedLeads: zod_1.z.number(),
    supportingEvidence: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(100),
    readinessScore: zod_1.z.number().min(0).max(100),
    readinessReason: zod_1.z.string()
});
exports.MarketingChannelStrategySchema = zod_1.z.object({
    channels: zod_1.z.array(exports.MarketingChannelDetailSchema)
});
exports.CreativeStrategySchema = zod_1.z.object({
    messagingThemes: zod_1.z.array(zod_1.z.string()),
    toneOfVoice: zod_1.z.string(),
    creativeAngles: zod_1.z.array(zod_1.z.string()),
    visualDirection: zod_1.z.string(),
    campaignHooks: zod_1.z.array(zod_1.z.string()),
    offerStrategy: zod_1.z.string(),
    ctaStrategy: zod_1.z.string()
});
exports.MarketingCampaignDetailSchema = zod_1.z.object({
    campaignName: zod_1.z.string(),
    objective: zod_1.z.string(),
    targetAudience: zod_1.z.string(),
    channel: zod_1.z.string(),
    coreMessage: zod_1.z.string(),
    offer: zod_1.z.string(),
    callToAction: zod_1.z.string(),
    expectedKpis: zod_1.z.array(zod_1.z.string()),
    duration: zod_1.z.string(),
    estimatedBudget: zod_1.z.number(),
    expectedROI: zod_1.z.string(),
    dependencies: zod_1.z.array(zod_1.z.string()),
    priority: zod_1.z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    journeyStage: zod_1.z.string(),
    funnelStage: zod_1.z.string(),
    explainability: zod_1.z.object({
        businessFactsUsed: zod_1.z.array(zod_1.z.string()),
        strategicAssetsUsed: zod_1.z.array(zod_1.z.string()),
        journeyStage: zod_1.z.string(),
        funnelStage: zod_1.z.string(),
        knowledgeChunks: zod_1.z.array(zod_1.z.string()),
        kpis: zod_1.z.array(zod_1.z.string()),
        evidence: zod_1.z.string(),
        reasoningSummary: zod_1.z.string(),
        confidence: zod_1.z.number().min(0).max(100),
        assumptions: zod_1.z.array(zod_1.z.string()),
        constraints: zod_1.z.array(zod_1.z.string()),
        alternativeCampaigns: zod_1.z.array(zod_1.z.string()),
        expectedOutcome: zod_1.z.string()
    })
});
exports.MarketingCampaignsSchema = zod_1.z.object({
    campaigns: zod_1.z.array(exports.MarketingCampaignDetailSchema)
});
exports.MarketingBudgetDetailSchema = zod_1.z.object({
    category: zod_1.z.string(),
    minAmount: zod_1.z.number(),
    recommendedAmount: zod_1.z.number(),
    aggressiveAmount: zod_1.z.number(),
    reasoning: zod_1.z.string()
});
exports.MarketingBudgetOptimizerSchema = zod_1.z.object({
    budgets: zod_1.z.array(exports.MarketingBudgetDetailSchema),
    sensitivityAnalysis: zod_1.z.string(),
    breakEvenPoint: zod_1.z.string()
});
exports.MarketingExperimentDetailSchema = zod_1.z.object({
    hypothesis: zod_1.z.string(),
    expectedKPI: zod_1.z.string(),
    duration: zod_1.z.string(),
    successCriteria: zod_1.z.string(),
    requiredBudget: zod_1.z.number(),
    confidence: zod_1.z.number().min(0).max(100),
    businessRisk: zod_1.z.string(),
    dependencies: zod_1.z.array(zod_1.z.string()),
    priority: zod_1.z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    status: zod_1.z.string()
});
exports.MarketingExperimentPortfolioSchema = zod_1.z.object({
    experiments: zod_1.z.array(exports.MarketingExperimentDetailSchema)
});
exports.MarketingContentPlanSchema = zod_1.z.object({
    contentPillars: zod_1.z.array(zod_1.z.string()),
    brandThemes: zod_1.z.array(zod_1.z.string()),
    educationalTopics: zod_1.z.array(zod_1.z.string()),
    authorityTopics: zod_1.z.array(zod_1.z.string()),
    conversionContent: zod_1.z.array(zod_1.z.string()),
    retentionContent: zod_1.z.array(zod_1.z.string()),
    seasonalCampaignIdeas: zod_1.z.array(zod_1.z.string())
});
exports.MarketingCalendarDetailSchema = zod_1.z.object({
    timeFrame: zod_1.z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY']),
    label: zod_1.z.string(),
    activities: zod_1.z.array(zod_1.z.string()),
    dependencies: zod_1.z.array(zod_1.z.string())
});
exports.MarketingCalendarSchema = zod_1.z.object({
    calendar: zod_1.z.array(exports.MarketingCalendarDetailSchema)
});
exports.MarketingExecutiveScoresSchema = zod_1.z.object({
    marketingReadiness: zod_1.z.number().min(0).max(100),
    brandReadiness: zod_1.z.number().min(0).max(100),
    channelReadiness: zod_1.z.number().min(0).max(100),
    campaignReadiness: zod_1.z.number().min(0).max(100),
    creativeReadiness: zod_1.z.number().min(0).max(100),
    audienceReadiness: zod_1.z.number().min(0).max(100),
    overallMarketingScore: zod_1.z.number().min(0).max(100)
});
exports.MarketingRecommendationDetailSchema = zod_1.z.object({
    title: zod_1.z.string(),
    problem: zod_1.z.string(),
    opportunity: zod_1.z.string(),
    evidence: zod_1.z.string(),
    affectedKpis: zod_1.z.array(zod_1.z.string()),
    expectedROI: zod_1.z.number(),
    expectedLeads: zod_1.z.number(),
    budget: zod_1.z.number(),
    timeline: zod_1.z.string(),
    priority: zod_1.z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    confidence: zod_1.z.number().min(0).max(100),
    dependencies: zod_1.z.array(zod_1.z.string()),
    alternativeApproaches: zod_1.z.array(zod_1.z.string())
});
exports.MarketingRecommendationsSchema = zod_1.z.object({
    recommendations: zod_1.z.array(exports.MarketingRecommendationDetailSchema)
});
// ==========================================
// LEAD ENGINE SCHEMAS — SPRINT 9
// ==========================================
exports.IdealCustomerProfileSchema = zod_1.z.object({
    industry: zod_1.z.string(),
    companySize: zod_1.z.string(),
    revenueRange: zod_1.z.string(),
    decisionMakers: zod_1.z.array(zod_1.z.string()),
    painPoints: zod_1.z.array(zod_1.z.string()),
    techStack: zod_1.z.array(zod_1.z.string()),
    buyingIntent: zod_1.z.string(),
    budgetLevel: zod_1.z.number(),
    growthStage: zod_1.z.string(),
    expectedLtv: zod_1.z.number(),
    expectedCac: zod_1.z.number(),
    confidence: zod_1.z.number().min(0).max(100),
    evidence: zod_1.z.string()
});
exports.LeadProfileSchema = zod_1.z.object({
    companyName: zod_1.z.string(),
    industry: zod_1.z.string(),
    companySize: zod_1.z.string(),
    revenueRange: zod_1.z.string(),
    decisionMakers: zod_1.z.array(zod_1.z.string()),
    painPoints: zod_1.z.array(zod_1.z.string()),
    techStack: zod_1.z.array(zod_1.z.string()),
    buyingIntent: zod_1.z.string(),
    budgetLevel: zod_1.z.number(),
    growthStage: zod_1.z.string(),
    expectedLtv: zod_1.z.number(),
    expectedCac: zod_1.z.number(),
    confidence: zod_1.z.number().min(0).max(100),
    evidence: zod_1.z.string()
});
exports.LeadProfilesSchema = zod_1.z.object({
    leads: zod_1.z.array(exports.LeadProfileSchema)
});
exports.LeadSourceDetailSchema = zod_1.z.object({
    sourceName: zod_1.z.string(),
    rank: zod_1.z.number(),
    expectedRoi: zod_1.z.string(),
    difficulty: zod_1.z.string(),
    requiredBudget: zod_1.z.number(),
    expectedLeads: zod_1.z.number(),
    confidence: zod_1.z.number().min(0).max(100),
    evidence: zod_1.z.string()
});
exports.LeadSourcesSchema = zod_1.z.object({
    sources: zod_1.z.array(exports.LeadSourceDetailSchema)
});
exports.LeadQualificationSchema = zod_1.z.object({
    fitScore: zod_1.z.number().min(0).max(100),
    intentScore: zod_1.z.number().min(0).max(100),
    budgetScore: zod_1.z.number().min(0).max(100),
    authorityScore: zod_1.z.number().min(0).max(100),
    needScore: zod_1.z.number().min(0).max(100),
    timingScore: zod_1.z.number().min(0).max(100),
    overallQualification: zod_1.z.number().min(0).max(100)
});
exports.LeadScoringSchema = zod_1.z.object({
    qualityScore: zod_1.z.number().min(0).max(100),
    valueScore: zod_1.z.number().min(0).max(100),
    conversionProbability: zod_1.z.number().min(0).max(100),
    revenuePotential: zod_1.z.number(),
    riskScore: zod_1.z.number().min(0).max(100),
    urgencyScore: zod_1.z.number().min(0).max(100),
    priorityTier: zod_1.z.enum(['Tier 1', 'Tier 2', 'Tier 3']),
    explainability: zod_1.z.string()
});
exports.LeadSegmentDetailSchema = zod_1.z.object({
    segmentName: zod_1.z.string(),
    industry: zod_1.z.string(),
    companySize: zod_1.z.string(),
    expectedDealSize: zod_1.z.number(),
    leadsCount: zod_1.z.number()
});
exports.LeadSegmentationSchema = zod_1.z.object({
    segments: zod_1.z.array(exports.LeadSegmentDetailSchema)
});
exports.LeadJourneyDetailSchema = zod_1.z.object({
    journeyType: zod_1.z.enum(['Cold', 'Warm', 'Hot', 'Enterprise', 'SMB']),
    touchpoints: zod_1.z.array(zod_1.z.string()),
    messages: zod_1.z.array(zod_1.z.string()),
    waitingPeriods: zod_1.z.array(zod_1.z.string()),
    successKpis: zod_1.z.array(zod_1.z.string())
});
exports.LeadNurturingSchema = zod_1.z.object({
    journeys: zod_1.z.array(exports.LeadJourneyDetailSchema)
});
exports.LeadRecommendationDetailSchema = zod_1.z.object({
    title: zod_1.z.string(),
    nextBestAction: zod_1.z.string(),
    expectedCloseProb: zod_1.z.number().min(0).max(100),
    expectedTimeline: zod_1.z.string(),
    riskFactors: zod_1.z.array(zod_1.z.string()),
    dependencies: zod_1.z.array(zod_1.z.string()),
    alternativeActions: zod_1.z.array(zod_1.z.string())
});
exports.LeadRecommendationsSchema = zod_1.z.object({
    recommendations: zod_1.z.array(exports.LeadRecommendationDetailSchema)
});
exports.LeadForecastSchema = zod_1.z.object({
    expectedLeads: zod_1.z.number(),
    qualifiedLeads: zod_1.z.number(),
    sqlCount: zod_1.z.number(),
    conversionRate: zod_1.z.number(),
    revenue: zod_1.z.number(),
    pipelineValue: zod_1.z.number(),
    confidenceMin: zod_1.z.number(),
    confidenceMax: zod_1.z.number()
});
exports.LeadPlaybookDetailSchema = zod_1.z.object({
    name: zod_1.z.string(),
    playRules: zod_1.z.string(),
    targetAudience: zod_1.z.string(),
    triggerCondition: zod_1.z.string(),
    recommendedSteps: zod_1.z.array(zod_1.z.string())
});
exports.LeadPlaybooksSchema = zod_1.z.object({
    playbooks: zod_1.z.array(exports.LeadPlaybookDetailSchema)
});
// ================================================================
// ZOD OUTPUT CONTRACTS FOR SALES ENGINE — SPRINT 10
// ================================================================
exports.SalesOpportunityDetailSchema = zod_1.z.object({
    opportunityName: zod_1.z.string(),
    businessValue: zod_1.z.string(),
    revenuePotential: zod_1.z.number(),
    strategicImportance: zod_1.z.enum(['HIGH', 'MEDIUM', 'LOW']),
    expansionOpportunity: zod_1.z.string(),
    crossSellOpportunity: zod_1.z.string(),
    upsellOpportunity: zod_1.z.string(),
    competitiveRisk: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(100),
    evidence: zod_1.z.string()
});
exports.OpportunityAnalysisSchema = zod_1.z.object({
    opportunities: zod_1.z.array(exports.SalesOpportunityDetailSchema)
});
exports.DealHealthDetailSchema = zod_1.z.object({
    opportunityName: zod_1.z.string(),
    needScore: zod_1.z.number().min(0).max(100),
    authorityScore: zod_1.z.number().min(0).max(100),
    budgetScore: zod_1.z.number().min(0).max(100),
    timelineScore: zod_1.z.number().min(0).max(100),
    urgencyScore: zod_1.z.number().min(0).max(100),
    competitivePosition: zod_1.z.number().min(0).max(100),
    relationshipStrength: zod_1.z.number().min(0).max(100),
    buyingSignals: zod_1.z.number().min(0).max(100),
    riskLevel: zod_1.z.number().min(0).max(100),
    overallHealthScore: zod_1.z.number().min(0).max(100),
    explainability: zod_1.z.string()
});
exports.DealQualificationsSchema = zod_1.z.object({
    dealHealths: zod_1.z.array(exports.DealHealthDetailSchema)
});
exports.StakeholderDetailSchema = zod_1.z.object({
    name: zod_1.z.string(),
    role: zod_1.z.string(),
    influenceLevel: zod_1.z.string(),
    decisionPower: zod_1.z.string(),
    objections: zod_1.z.array(zod_1.z.string()),
    motivations: zod_1.z.array(zod_1.z.string()),
    preferredCommunicationStyle: zod_1.z.string(),
    risk: zod_1.z.string(),
    recommendedSalesStrategy: zod_1.z.string()
});
exports.BuyingCommitteeSchema = zod_1.z.object({
    stakeholders: zod_1.z.array(exports.StakeholderDetailSchema)
});
exports.NegotiationStrategySchema = zod_1.z.object({
    negotiationObjectives: zod_1.z.array(zod_1.z.string()),
    pricingFlexibility: zod_1.z.string(),
    concessions: zod_1.z.array(zod_1.z.string()),
    walkAwayConditions: zod_1.z.array(zod_1.z.string()),
    riskAnalysis: zod_1.z.string(),
    winStrategy: zod_1.z.string(),
    alternativeApproaches: zod_1.z.string()
});
exports.ObjectionDetailSchema = zod_1.z.object({
    category: zod_1.z.string(),
    objection: zod_1.z.string(),
    recommendedResponse: zod_1.z.string(),
    supportingEvidence: zod_1.z.string(),
    businessCase: zod_1.z.string()
});
exports.ObjectionHandlingSchema = zod_1.z.object({
    objections: zod_1.z.array(exports.ObjectionDetailSchema)
});
exports.ProposalStrategySchema = zod_1.z.object({
    proposalStructure: zod_1.z.array(zod_1.z.string()),
    valueNarrative: zod_1.z.string(),
    roiStory: zod_1.z.string(),
    caseStudySuggestions: zod_1.z.array(zod_1.z.string()),
    proofPoints: zod_1.z.array(zod_1.z.string()),
    successMetrics: zod_1.z.array(zod_1.z.string()),
    recommendedTimeline: zod_1.z.string()
});
exports.RevenueOptimizationSchema = zod_1.z.object({
    upsellOpportunities: zod_1.z.array(zod_1.z.string()),
    crossSellOpportunities: zod_1.z.array(zod_1.z.string()),
    bundleOpportunities: zod_1.z.array(zod_1.z.string()),
    renewalOpportunities: zod_1.z.array(zod_1.z.string()),
    expansionAccounts: zod_1.z.array(zod_1.z.string()),
    revenueRisks: zod_1.z.array(zod_1.z.string())
});
exports.SalesForecastSchema = zod_1.z.object({
    bestCase: zod_1.z.number(),
    expectedCase: zod_1.z.number(),
    worstCase: zod_1.z.number(),
    expectedRevenue: zod_1.z.number(),
    pipelineValue: zod_1.z.number(),
    closeProbability: zod_1.z.number().min(0).max(100),
    forecastConfidence: zod_1.z.number().min(0).max(100)
});
exports.NextBestActionDetailSchema = zod_1.z.object({
    opportunityName: zod_1.z.string(),
    immediateAction: zod_1.z.string(),
    followUpAction: zod_1.z.string(),
    escalation: zod_1.z.string(),
    requiredResources: zod_1.z.array(zod_1.z.string()),
    expectedOutcome: zod_1.z.string(),
    successKPI: zod_1.z.string(),
    deadline: zod_1.z.string(),
    priority: zod_1.z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
});
exports.NextBestActionSchema = zod_1.z.object({
    actions: zod_1.z.array(exports.NextBestActionDetailSchema)
});
exports.SalesPlaybookDetailSchema = zod_1.z.object({
    name: zod_1.z.string(),
    playRules: zod_1.z.string(),
    targetAudience: zod_1.z.string(),
    triggerCondition: zod_1.z.string(),
    recommendedSteps: zod_1.z.array(zod_1.z.string()),
    objectionLibrary: zod_1.z.string(),
    negotiationFramework: zod_1.z.string(),
    proposalTemplate: zod_1.z.string()
});
exports.SalesPlaybooksSchema = zod_1.z.object({
    playbooks: zod_1.z.array(exports.SalesPlaybookDetailSchema)
});
exports.SalesRecommendationDetailSchema = zod_1.z.object({
    opportunityName: zod_1.z.string(),
    title: zod_1.z.string(),
    nextBestAction: zod_1.z.string(),
    expectedCloseProb: zod_1.z.number().min(0).max(100),
    expectedTimeline: zod_1.z.string(),
    riskFactors: zod_1.z.array(zod_1.z.string()),
    dependencies: zod_1.z.array(zod_1.z.string()),
    alternativeActions: zod_1.z.array(zod_1.z.string())
});
exports.SalesRecommendationsSchema = zod_1.z.object({
    recommendations: zod_1.z.array(exports.SalesRecommendationDetailSchema)
});
exports.ExecutiveScoresSchema = zod_1.z.object({
    pipelineHealth: zod_1.z.number().min(0).max(100),
    forecastReliability: zod_1.z.number().min(0).max(100),
    revenueStability: zod_1.z.number().min(0).max(100),
    expansionPotential: zod_1.z.number().min(0).max(100),
    revenueRisk: zod_1.z.number().min(0).max(100),
    growthMomentum: zod_1.z.number().min(0).max(100),
    overallExecutiveRevenueScore: zod_1.z.number().min(0).max(100)
});
// ==========================================
// SPRINT 11 — AI ANALYTICS & BUSINESS EVOLUTION SCHEMAS
// ==========================================
exports.BusinessHealthScoreSchema = zod_1.z.object({
    operationalHealth: zod_1.z.number().min(0).max(100),
    salesHealth: zod_1.z.number().min(0).max(100),
    marketingHealth: zod_1.z.number().min(0).max(100),
    leadHealth: zod_1.z.number().min(0).max(100),
    customerHealth: zod_1.z.number().min(0).max(100),
    innovationHealth: zod_1.z.number().min(0).max(100),
    overallExecutiveHealth: zod_1.z.number().min(0).max(100),
    confidence: zod_1.z.number().min(0).max(100),
    evidence: zod_1.z.string(),
    trendDirection: zod_1.z.enum(['UP', 'DOWN', 'STABLE']),
    expectedDirection: zod_1.z.enum(['IMPROVING', 'DECLINING', 'STABLE'])
});
exports.GrowthScoreSchema = zod_1.z.object({
    growthScore: zod_1.z.number().min(0).max(100),
    velocityIndex: zod_1.z.number().min(0).max(100),
    confidence: zod_1.z.number().min(0).max(100)
});
exports.RevenueHealthSchema = zod_1.z.object({
    pipelineValue: zod_1.z.number().min(0),
    leakagePoints: zod_1.z.array(zod_1.z.string()),
    stabilityScore: zod_1.z.number().min(0).max(100)
});
exports.MarketReadinessSchema = zod_1.z.object({
    productReadiness: zod_1.z.number().min(0).max(100),
    salesReadiness: zod_1.z.number().min(0).max(100),
    marketingReadiness: zod_1.z.number().min(0).max(100),
    expansionReadiness: zod_1.z.number().min(0).max(100),
    investmentReadiness: zod_1.z.number().min(0).max(100),
    internationalReadiness: zod_1.z.number().min(0).max(100)
});
exports.CompetitivePositionSchema = zod_1.z.object({
    competitivePosition: zod_1.z.string(),
    marketPosition: zod_1.z.string(),
    differentiators: zod_1.z.array(zod_1.z.string()),
    weaknesses: zod_1.z.array(zod_1.z.string()),
    threats: zod_1.z.array(zod_1.z.string()),
    opportunities: zod_1.z.array(zod_1.z.string()),
    competitiveConfidence: zod_1.z.number().min(0).max(100)
});
exports.ForecastSnapshotSchema = zod_1.z.object({
    horizonDays: zod_1.z.number(),
    revenueForecast: zod_1.z.number().min(0),
    pipelineForecast: zod_1.z.number().min(0),
    growthForecast: zod_1.z.number().min(0),
    riskForecast: zod_1.z.number().min(0),
    expansionForecast: zod_1.z.number().min(0),
    confidenceMin: zod_1.z.number().min(0).max(100),
    confidenceMax: zod_1.z.number().min(0).max(100),
    bestCase: zod_1.z.number().min(0),
    expectedCase: zod_1.z.number().min(0),
    worstCase: zod_1.z.number().min(0)
});
exports.ForecastSnapshotsSchema = zod_1.z.object({
    forecasts: zod_1.z.array(exports.ForecastSnapshotSchema)
});
exports.BusinessRiskSchema = zod_1.z.object({
    category: zod_1.z.enum(['REVENUE', 'MARKETING', 'SALES', 'OPERATIONAL', 'FINANCIAL', 'COMPETITIVE', 'TECHNOLOGY', 'EXECUTION']),
    severity: zod_1.z.enum(['HIGH', 'MEDIUM', 'LOW']),
    probability: zod_1.z.number().min(0).max(100),
    businessImpact: zod_1.z.string(),
    mitigation: zod_1.z.string()
});
exports.BusinessRisksSchema = zod_1.z.object({
    risks: zod_1.z.array(exports.BusinessRiskSchema)
});
exports.BusinessOpportunitySchema = zod_1.z.object({
    type: zod_1.z.enum(['QUICK_WIN', 'HIGH_IMPACT', 'EXPANSION', 'COST_OPTIMIZATION', 'REVENUE_GROWTH', 'MARKET_EXPANSION', 'PARTNERSHIP']),
    priority: zod_1.z.enum(['HIGH', 'MEDIUM', 'LOW']),
    expectedImpact: zod_1.z.string(),
    mitigation: zod_1.z.string().optional()
});
exports.BusinessOpportunitiesSchema = zod_1.z.object({
    opportunities: zod_1.z.array(exports.BusinessOpportunitySchema)
});
exports.ExecutiveInsightSchema = zod_1.z.object({
    ceoSummary: zod_1.z.string(),
    boardSummary: zod_1.z.string(),
    criticalFind: zod_1.z.array(zod_1.z.string()),
    topOpp: zod_1.z.array(zod_1.z.string()),
    topRisk: zod_1.z.array(zod_1.z.string()),
    narrative: zod_1.z.string()
});
exports.PredictionHistorySchema = zod_1.z.object({
    metricName: zod_1.z.string(),
    predictedVal: zod_1.z.number(),
    confidence: zod_1.z.number().min(0).max(100),
    horizonDays: zod_1.z.number(),
    horizonDate: zod_1.z.string(), // ISO String
    evidence: zod_1.z.string()
});
exports.PredictionHistoriesSchema = zod_1.z.object({
    predictions: zod_1.z.array(exports.PredictionHistorySchema)
});
exports.AnalyticsRecommendationDetailSchema = zod_1.z.object({
    title: zod_1.z.string(),
    nextBestAction: zod_1.z.string(),
    expectedOutcome: zod_1.z.string(),
    expectedTimeline: zod_1.z.string(),
    riskFactors: zod_1.z.array(zod_1.z.string()),
    dependencies: zod_1.z.array(zod_1.z.string()),
    alternativeActions: zod_1.z.array(zod_1.z.string())
});
exports.AnalyticsRecommendationsSchema = zod_1.z.object({
    recommendations: zod_1.z.array(exports.AnalyticsRecommendationDetailSchema)
});
exports.SnapshotComparisonSchema = zod_1.z.object({
    whatChanged: zod_1.z.string(),
    whyItChanged: zod_1.z.string(),
    causativeEngine: zod_1.z.string(),
    positiveImpact: zod_1.z.string(),
    negativeImpact: zod_1.z.string(),
    metricsAffected: zod_1.z.array(zod_1.z.string()),
    forecastDiff: zod_1.z.string(),
    confidenceDiff: zod_1.z.string(),
    riskDiff: zod_1.z.string(),
    opportunityDiff: zod_1.z.string(),
    executiveSummary: zod_1.z.string()
});
// ==========================================
// CUSTOMER SUCCESS SCHEMAS — SPRINT 12
// ==========================================
exports.CustomerDigitalTwinSchema = zod_1.z.object({
    name: zod_1.z.string(),
    profileData: zod_1.z.any(),
    productsPurchased: zod_1.z.array(zod_1.z.string()),
    customerGoals: zod_1.z.array(zod_1.z.string()),
    businessOutcomes: zod_1.z.array(zod_1.z.string()),
    usagePatterns: zod_1.z.any(),
    featureAdoption: zod_1.z.any(),
    relationHealth: zod_1.z.number().min(0).max(100),
    satisfactionScore: zod_1.z.number().min(0).max(100),
    revenueContribution: zod_1.z.number().min(0),
    executiveSponsor: zod_1.z.string(),
    riskRegister: zod_1.z.array(zod_1.z.string())
});
exports.CustomerHealthSchema = zod_1.z.object({
    overallHealth: zod_1.z.number().min(0).max(100),
    relationshipHealth: zod_1.z.number().min(0).max(100),
    productAdoption: zod_1.z.number().min(0).max(100),
    featureAdoption: zod_1.z.number().min(0).max(100),
    supportHealth: zod_1.z.number().min(0).max(100),
    valueRealization: zod_1.z.number().min(0).max(100),
    execEngagement: zod_1.z.number().min(0).max(100),
    renewalReadiness: zod_1.z.number().min(0).max(100),
    expansionReadiness: zod_1.z.number().min(0).max(100),
    riskLevel: zod_1.z.number().min(0).max(100),
    healthTrend: zod_1.z.enum(['UP', 'DOWN', 'STABLE']),
    confidence: zod_1.z.number().min(0).max(100)
});
exports.CustomerSuccessJourneySchema = zod_1.z.object({
    currentStage: zod_1.z.enum(['ONBOARDING', 'ACTIVATION', 'ADOPTION', 'VALUE_REALIZATION', 'EXPANSION', 'RENEWAL', 'ADVOCACY']),
    stageStatus: zod_1.z.string(),
    successCriteria: zod_1.z.array(zod_1.z.string()),
    risks: zod_1.z.array(zod_1.z.string()),
    recommendedActions: zod_1.z.array(zod_1.z.string())
});
exports.SupportIntelligenceSchema = zod_1.z.object({
    ticketNumber: zod_1.z.string(),
    category: zod_1.z.enum(['BUG', 'QUESTION', 'FEATURE_REQUEST', 'INTEGRATION']),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    status: zod_1.z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    subject: zod_1.z.string(),
    description: zod_1.z.string(),
    rootCause: zod_1.z.string().optional(),
    resolution: zod_1.z.string().optional(),
    expectedResolutionTime: zod_1.z.string().optional(),
    customerImpact: zod_1.z.string().optional(),
    isRecurring: zod_1.z.boolean().default(false)
});
exports.CustomerSentimentSchema = zod_1.z.object({
    sentimentScore: zod_1.z.number().min(-100).max(100),
    sentimentTrend: zod_1.z.enum(['IMPROVING', 'DECLINING', 'STABLE']),
    confidence: zod_1.z.number().min(0).max(100),
    businessImpact: zod_1.z.string(),
    relationshipRisk: zod_1.z.string(),
    executiveRisk: zod_1.z.string()
});
exports.RenewalForecastSchema = zod_1.z.object({
    renewalDate: zod_1.z.string(),
    renewalProbability: zod_1.z.number().min(0).max(100),
    expectedValue: zod_1.z.number().min(0),
    confidence: zod_1.z.number().min(0).max(100)
});
exports.RenewalPlanSchema = zod_1.z.object({
    planOwner: zod_1.z.string(),
    renewalStrategy: zod_1.z.string(),
    executiveActions: zod_1.z.array(zod_1.z.string()),
    keyRisks: zod_1.z.array(zod_1.z.string()),
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'EXECUTED'])
});
exports.ExpansionOpportunitySchema = zod_1.z.object({
    title: zod_1.z.string(),
    type: zod_1.z.enum(['CROSS_SELL', 'UPSELL', 'NEW_PRODUCT']),
    fitScore: zod_1.z.number().min(0).max(100),
    expectedRevenue: zod_1.z.number().min(0),
    businessJustification: zod_1.z.string()
});
exports.ChurnPredictionSchema = zod_1.z.object({
    churnProbability: zod_1.z.number().min(0).max(100),
    confidence: zod_1.z.number().min(0).max(100),
    primaryRootCause: zod_1.z.string(),
    earlyWarningSignals: zod_1.z.array(zod_1.z.string()),
    severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
});
exports.RetentionStrategySchema = zod_1.z.object({
    strategyName: zod_1.z.string(),
    executionPlan: zod_1.z.string(),
    estimatedCost: zod_1.z.number().min(0),
    successProbability: zod_1.z.number().min(0).max(100)
});
exports.CustomerRecommendationSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    nextBestAction: zod_1.z.string(),
    expectedOutcome: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(100),
    factsUsed: zod_1.z.array(zod_1.z.string()).optional(),
    assumptions: zod_1.z.array(zod_1.z.string()).optional(),
    constraints: zod_1.z.array(zod_1.z.string()).optional(),
    alternativeActions: zod_1.z.array(zod_1.z.string()).optional()
});
exports.CustomerRecommendationsSchema = zod_1.z.object({
    recommendations: zod_1.z.array(exports.CustomerRecommendationSchema)
});
exports.CustomerSuccessScoreSchema = zod_1.z.object({
    healthScore: zod_1.z.number().min(0).max(100),
    relationshipStrength: zod_1.z.number().min(0).max(100),
    valueDelivered: zod_1.z.number().min(0).max(100),
    renewalConfidence: zod_1.z.number().min(0).max(100),
    expansionPotential: zod_1.z.number().min(0).max(100),
    executiveSatisfaction: zod_1.z.number().min(0).max(100),
    overallScore: zod_1.z.number().min(0).max(100)
});
exports.CustomerValueRealizationSchema = zod_1.z.object({
    goals: zod_1.z.array(zod_1.z.string()),
    expectedOutcomes: zod_1.z.array(zod_1.z.string()),
    actualOutcomes: zod_1.z.array(zod_1.z.string()),
    goalAchievementRate: zod_1.z.number().min(0).max(100),
    roiDelivered: zod_1.z.number(),
    valueDelivered: zod_1.z.number(),
    timeToValueDays: zod_1.z.number().int(),
    valueScore: zod_1.z.number().min(0).max(100),
    valueTrend: zod_1.z.enum(['IMPROVING', 'DECLINING', 'STABLE']),
    valueRisk: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']),
    recommendedActions: zod_1.z.array(zod_1.z.string())
});
exports.CustomerAdvocacySchema = zod_1.z.object({
    advocacyScore: zod_1.z.number().min(0).max(100),
    referenceLikelihood: zod_1.z.number().min(0).max(100),
    testimonialProb: zod_1.z.number().min(0).max(100),
    caseStudyProb: zod_1.z.number().min(0).max(100),
    npsScore: zod_1.z.number(),
    advocacyStrategy: zod_1.z.string(),
    executiveActions: zod_1.z.array(zod_1.z.string())
});
exports.CustomerPortfolioIntelligenceSchema = zod_1.z.object({
    highestRiskAccounts: zod_1.z.array(zod_1.z.object({ customerId: zod_1.z.string(), companyName: zod_1.z.string(), riskProb: zod_1.z.number() })),
    highestValueAccounts: zod_1.z.array(zod_1.z.object({ customerId: zod_1.z.string(), companyName: zod_1.z.string(), arr: zod_1.z.number() })),
    fastestGrowingAccounts: zod_1.z.array(zod_1.z.object({ customerId: zod_1.z.string(), companyName: zod_1.z.string(), growthRate: zod_1.z.number() })),
    accountsRequiringAttention: zod_1.z.array(zod_1.z.object({ customerId: zod_1.z.string(), companyName: zod_1.z.string(), reason: zod_1.z.string() })),
    expansionPipelineValue: zod_1.z.number(),
    renewalPipelineValue: zod_1.z.number(),
    overallPortfolioHealth: zod_1.z.number()
});
exports.ExecutiveAccountIntelligenceSchema = zod_1.z.object({
    currentHealth: zod_1.z.number(),
    businessGoals: zod_1.z.array(zod_1.z.string()),
    roiDelivered: zod_1.z.number(),
    expansionPotential: zod_1.z.number(),
    renewalReadiness: zod_1.z.number(),
    relationshipStrength: zod_1.z.number(),
    customerRisks: zod_1.z.array(zod_1.z.string()),
    executiveActions: zod_1.z.array(zod_1.z.string()),
    priorityScore: zod_1.z.number(),
    confidence: zod_1.z.number()
});
exports.SuccessPlaybooksSchema = zod_1.z.object({
    playbooks: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        triggerCondition: zod_1.z.string(),
        steps: zod_1.z.array(zod_1.z.string()),
        responsibleRole: zod_1.z.string(),
        kpiToMonitor: zod_1.z.string()
    }))
});
// ==========================================
// EXECUTIVE BOARD SCHEMAS — SPRINT 13
// ==========================================
exports.ExecutiveRecommendationSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    nextBestAction: zod_1.z.string(),
    expectedOutcome: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(100),
    status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
    priority: zod_1.z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    businessImpact: zod_1.z.string(),
    dependencies: zod_1.z.array(zod_1.z.string()),
    strategicAlignment: zod_1.z.string()
});
exports.ExecutiveRecommendationsSchema = zod_1.z.object({
    recommendations: zod_1.z.array(exports.ExecutiveRecommendationSchema)
});
exports.ExecutiveConflictSchema = zod_1.z.object({
    title: zod_1.z.string(),
    severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    affectedEngines: zod_1.z.array(zod_1.z.string()),
    businessImpact: zod_1.z.string(),
    resolutionOptions: zod_1.z.array(zod_1.z.string()),
    recommendedResolution: zod_1.z.string(),
    status: zod_1.z.enum(['OPEN', 'RESOLVED']).default('OPEN')
});
exports.ExecutiveConflictsSchema = zod_1.z.object({
    conflicts: zod_1.z.array(exports.ExecutiveConflictSchema)
});
exports.ExecutiveConsensusSchema = zod_1.z.object({
    recommendationId: zod_1.z.string().optional(),
    supportScore: zod_1.z.number().min(0).max(100),
    confidence: zod_1.z.number().min(0).max(100),
    businessImpact: zod_1.z.string(),
    dependencies: zod_1.z.array(zod_1.z.string()),
    priority: zod_1.z.string(),
    finalConsensus: zod_1.z.string()
});
exports.ExecutiveConsensusesSchema = zod_1.z.object({
    consensus: zod_1.z.array(exports.ExecutiveConsensusSchema)
});
exports.ExecutiveAgendaSchema = zod_1.z.object({
    topic: zod_1.z.string(),
    priority: zod_1.z.string(),
    discussionPoints: zod_1.z.array(zod_1.z.string()),
    status: zod_1.z.string().default('OPEN')
});
exports.ExecutiveMeetingSchema = zod_1.z.object({
    notes: zod_1.z.string(),
    decisionSummary: zod_1.z.string(),
    consensusHistory: zod_1.z.string(),
    agenda: zod_1.z.string(),
    participants: zod_1.z.array(zod_1.z.string()),
    votes: zod_1.z.array(zod_1.z.object({ engine: zod_1.z.string(), vote: zod_1.z.string(), reason: zod_1.z.string() })),
    conflicts: zod_1.z.array(zod_1.z.string()),
    consensus: zod_1.z.number(),
    supportingEvidence: zod_1.z.string(),
    finalDecisions: zod_1.z.array(zod_1.z.string()),
    assignedOwners: zod_1.z.array(zod_1.z.object({ task: zod_1.z.string(), owner: zod_1.z.string() })),
    deadlines: zod_1.z.array(zod_1.z.object({ task: zod_1.z.string(), date: zod_1.z.string() })),
    affectedKPIs: zod_1.z.array(zod_1.z.string()),
    meetingOutcome: zod_1.z.string(),
    meetingConfidence: zod_1.z.number(),
    reflectionSummary: zod_1.z.string()
});
exports.ExecutiveActionSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).default('PENDING'),
    timeline: zod_1.z.string(),
    priority: zod_1.z.string(),
    kpiImpact: zod_1.z.string(),
    expectedOutcome: zod_1.z.string()
});
exports.ExecutiveActionOwnerSchema = zod_1.z.object({
    engineName: zod_1.z.string(),
    name: zod_1.z.string(),
    role: zod_1.z.string(),
    email: zod_1.z.string().optional()
});
exports.ExecutivePrioritySchema = zod_1.z.object({
    level: zod_1.z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    businessImpact: zod_1.z.string(),
    revenue: zod_1.z.number(),
    risk: zod_1.z.number(),
    confidence: zod_1.z.number(),
    dependencies: zod_1.z.array(zod_1.z.string()),
    strategicAlignment: zod_1.z.string()
});
exports.ExecutiveDecisionSchema = zod_1.z.object({
    title: zod_1.z.string(),
    choice: zod_1.z.string(),
    logic: zod_1.z.string(),
    status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
    expectedOutcome: zod_1.z.string().optional(),
    confidence: zod_1.z.number(),
    evidenceUsed: zod_1.z.array(zod_1.z.string()),
    assumptions: zod_1.z.array(zod_1.z.string()),
    constraints: zod_1.z.array(zod_1.z.string()),
    alternativeDecisions: zod_1.z.array(zod_1.z.string()),
    participatingEngines: zod_1.z.array(zod_1.z.string()),
    businessFacts: zod_1.z.array(zod_1.z.string()),
    knowledgeChunks: zod_1.z.array(zod_1.z.string()),
    historicalContext: zod_1.z.array(zod_1.z.string())
});
exports.ExecutiveBriefSchema = zod_1.z.object({
    businessHealth: zod_1.z.number(),
    growthScore: zod_1.z.number(),
    revenueHealth: zod_1.z.number(),
    customerHealth: zod_1.z.number(),
    topOpportunities: zod_1.z.array(zod_1.z.string()),
    topRisks: zod_1.z.array(zod_1.z.string()),
    urgentDecisions: zod_1.z.array(zod_1.z.string()),
    forecast: zod_1.z.object({ revenue: zod_1.z.number(), margin: zod_1.z.number() }),
    kpiSummary: zod_1.z.array(zod_1.z.object({ kpi: zod_1.z.string(), value: zod_1.z.string() })),
    trendSummary: zod_1.z.array(zod_1.z.string()),
    competitiveSummary: zod_1.z.string(),
    marketReadiness: zod_1.z.number(),
    recommendedActions: zod_1.z.array(zod_1.z.string()),
    executiveCalendar: zod_1.z.array(zod_1.z.string()),
    expectedOutcomes: zod_1.z.array(zod_1.z.string())
});
exports.ExecutiveAlertSchema = zod_1.z.object({
    category: zod_1.z.enum(['CRITICAL', 'REVENUE', 'GROWTH', 'CUSTOMER', 'COMPETITIVE', 'FORECAST', 'RISK']),
    severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    confidence: zod_1.z.number(),
    businessImpact: zod_1.z.string(),
    recommendedAction: zod_1.z.string()
});
exports.ExecutiveAlertsSchema = zod_1.z.object({
    alerts: zod_1.z.array(exports.ExecutiveAlertSchema)
});
exports.ExecutiveOperatingPlanSchema = zod_1.z.object({
    todayPriorities: zod_1.z.array(zod_1.z.string()),
    thisWeek: zod_1.z.array(zod_1.z.string()),
    thisMonth: zod_1.z.array(zod_1.z.string()),
    quarterGoals: zod_1.z.array(zod_1.z.string()),
    strategicInitiatives: zod_1.z.array(zod_1.z.object({ title: zod_1.z.string(), outcome: zod_1.z.string() })),
    operationalInitiatives: zod_1.z.array(zod_1.z.object({ title: zod_1.z.string(), outcome: zod_1.z.string() })),
    revenueInitiatives: zod_1.z.array(zod_1.z.object({ title: zod_1.z.string(), outcome: zod_1.z.string() })),
    customerInitiatives: zod_1.z.array(zod_1.z.object({ title: zod_1.z.string(), outcome: zod_1.z.string() })),
    innovationInitiatives: zod_1.z.array(zod_1.z.object({ title: zod_1.z.string(), outcome: zod_1.z.string() }))
});
exports.ExecutiveRoadmapSchema = zod_1.z.object({
    phase: zod_1.z.enum(['NOW', 'NEXT', 'LATER']),
    itemText: zod_1.z.string(),
    businessValue: zod_1.z.string(),
    risk: zod_1.z.string(),
    confidence: zod_1.z.number(),
    requiredResources: zod_1.z.array(zod_1.z.string()),
    dependencies: zod_1.z.array(zod_1.z.string()),
    status: zod_1.z.string().default('PLANNED')
});
exports.ExecutiveRoadmapsSchema = zod_1.z.object({
    roadmaps: zod_1.z.array(exports.ExecutiveRoadmapSchema)
});
exports.ExecutiveDecisionSimulationSchema = zod_1.z.object({
    executiveSummary: zod_1.z.string(),
    revenueImpact: zod_1.z.string(),
    leadImpact: zod_1.z.string(),
    cacImpact: zod_1.z.string(),
    ltvImpact: zod_1.z.string(),
    growthScoreImpact: zod_1.z.string(),
    businessHealthImpact: zod_1.z.string(),
    risks: zod_1.z.array(zod_1.z.string()),
    departmentsAffected: zod_1.z.array(zod_1.z.string()),
    confidence: zod_1.z.number(),
    engineDisagreements: zod_1.z.array(zod_1.z.object({ engine: zod_1.z.string(), challenge: zod_1.z.string() })),
    consensusLevel: zod_1.z.number(),
    recommendedExecutionOrder: zod_1.z.array(zod_1.z.string())
});
