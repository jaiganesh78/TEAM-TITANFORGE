import { GraphState, StateGraph, NodeFunction } from './StateGraph';
import { GeminiProvider } from '../../../../ai/providers/GeminiProvider';
import { PromptBuilder } from '../../../../ai/providers/PromptBuilder';
import { 
  ResponseParser, 
  AudienceAnalysisSchema,
  CustomerJourneySchema,
  FunnelAnalysisSchema,
  MarketingChannelStrategySchema,
  CreativeStrategySchema,
  MarketingCampaignsSchema,
  MarketingCampaignDetailSchema,
  MarketingBudgetOptimizerSchema,
  MarketingExperimentPortfolioSchema,
  MarketingContentPlanSchema,
  MarketingCalendarSchema,
  MarketingExecutiveScoresSchema,
  MarketingRecommendationsSchema,
  MarketingRecommendationDetailSchema
} from '../../../../ai/providers/ResponseParser';

const llm = new GeminiProvider();

// ==========================================
// 1. MARKETING CONTEXT GRAPH
// ==========================================
export const MarketingContextGraphNode: NodeFunction = async (state) => {
  state.logs.push('[MarketingContextGraphNode] Marketing Context initialized.');
  return {};
};

// ==========================================
// 2. AUDIENCE ANALYSIS GRAPH
// ==========================================
export const AudienceAnalysisGraphNode: NodeFunction = async (state) => {
  state.logs.push('[AudienceAnalysisGraphNode] Evaluating Target Audience & Motivation triggers.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Perform B2B SaaS target audience segmentation, identifying primary and secondary audience targets, buying motivations, preferred channel profiles, and buying barriers.
Output a JSON matching this Zod contract:
{
  "primaryAudience": "string",
  "secondaryAudience": "string",
  "buyingMotivations": ["string"],
  "painPoints": ["string"],
  "buyingBarriers": ["string"],
  "preferredChannels": ["string"],
  "decisionDrivers": ["string"],
  "confidence": number,
  "evidence": "string"
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, AudienceAnalysisSchema);
  return { audienceAnalysis: parsed };
};

// ==========================================
// 3. CUSTOMER JOURNEY GRAPH
// ==========================================
export const CustomerJourneyGraphNode: NodeFunction = async (state) => {
  state.logs.push('[CustomerJourneyGraphNode] Mapping stage-by-stage customer journey paths.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Map the complete customer journey stages (awareness, interest, consideration, purchase, onboarding, retention, advocacy).
Output a JSON matching this Zod contract:
{
  "awareness": { "objectives": ["string"], "painPoints": ["string"], "recommendedChannels": ["string"], "recommendedContent": ["string"], "expectedKPIs": ["string"], "risks": ["string"], "opportunities": ["string"] },
  "interest": { "objectives": ["string"], "painPoints": ["string"], "recommendedChannels": ["string"], "recommendedContent": ["string"], "expectedKPIs": ["string"], "risks": ["string"], "opportunities": ["string"] },
  "consideration": { "objectives": ["string"], "painPoints": ["string"], "recommendedChannels": ["string"], "recommendedContent": ["string"], "expectedKPIs": ["string"], "risks": ["string"], "opportunities": ["string"] },
  "purchase": { "objectives": ["string"], "painPoints": ["string"], "recommendedChannels": ["string"], "recommendedContent": ["string"], "expectedKPIs": ["string"], "risks": ["string"], "opportunities": ["string"] },
  "onboarding": { "objectives": ["string"], "painPoints": ["string"], "recommendedChannels": ["string"], "recommendedContent": ["string"], "expectedKPIs": ["string"], "risks": ["string"], "opportunities": ["string"] },
  "retention": { "objectives": ["string"], "painPoints": ["string"], "recommendedChannels": ["string"], "recommendedContent": ["string"], "expectedKPIs": ["string"], "risks": ["string"], "opportunities": ["string"] },
  "advocacy": { "objectives": ["string"], "painPoints": ["string"], "recommendedChannels": ["string"], "recommendedContent": ["string"], "expectedKPIs": ["string"], "risks": ["string"], "opportunities": ["string"] }
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, CustomerJourneySchema);
  return { customerJourney: parsed };
};

// ==========================================
// 4. FUNNEL ANALYSIS GRAPH
// ==========================================
export const FunnelAnalysisGraphNode: NodeFunction = async (state) => {
  state.logs.push('[FunnelAnalysisGraphNode] Compiling TOFU/MOFU/BOFU drop-off risks.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Perform funnel analysis. Detail TOFU, MOFU, and BOFU stages, defining conversion points, drop-off risks, and lead quality expectations.
Output a JSON matching this Zod contract:
{
  "tofu": { "objectives": ["string"], "kpis": ["string"] },
  "mofu": { "objectives": ["string"], "kpis": ["string"] },
  "bofu": { "objectives": ["string"], "kpis": ["string"] },
  "conversionPoints": ["string"],
  "dropOffRisks": ["string"],
  "leadQualityExpectations": ["string"],
  "kpis": ["string"]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, FunnelAnalysisSchema);
  return { funnelAnalysis: parsed };
};

// ==========================================
// 5. MARKETING CHANNEL GRAPH
// ==========================================
export const MarketingChannelGraphNode: NodeFunction = async (state) => {
  state.logs.push('[MarketingChannelGraphNode] Evaluating marketing channels priority metrics.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Examine potential marketing channels (LinkedIn Ads, Google Ads, SEO, Content Marketing, WhatsApp, Events).
Assign readiness scores, ROIs, and difficulty ratings.
Output a JSON matching this Zod contract:
{
  "channels": [
    {
      "channelName": "string",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "expectedROI": "string",
      "difficulty": "string",
      "requiredBudget": number,
      "expectedLeads": number,
      "supportingEvidence": "string",
      "confidence": number,
      "readinessScore": number,
      "readinessReason": "string"
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, MarketingChannelStrategySchema);
  return { channelEvaluation: parsed };
};

// ==========================================
// 6. CHANNEL READINESS GRAPH
// ==========================================
export const ChannelReadinessGraphNode: NodeFunction = async (state) => {
  state.logs.push('[ChannelReadinessGraphNode] Assessing channel assets checklist.');
  // readiness checks mapped inside channelEvaluation already
  return {};
};

// ==========================================
// 7. CREATIVE STRATEGY GRAPH
// ==========================================
export const CreativeStrategyGraphNode: NodeFunction = async (state) => {
  state.logs.push('[CreativeStrategyGraphNode] Generating messaging themes & visual directions.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Establish tone of voice, visual direction, messaging themes, campaign hooks, and offer strategies (do not output marketing copywriting, output CMO creative direction).
Output a JSON matching this Zod contract:
{
  "messagingThemes": ["string"],
  "toneOfVoice": "string",
  "creativeAngles": ["string"],
  "visualDirection": "string",
  "campaignHooks": ["string"],
  "offerStrategy": "string",
  "ctaStrategy": "string"
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, CreativeStrategySchema);
  return { creativeStrategy: parsed };
};

// ==========================================
// 8. CAMPAIGN STRATEGY GRAPH
// ==========================================
export const CampaignStrategyGraphNode: NodeFunction = async (state) => {
  state.logs.push('[CampaignStrategyGraphNode] Formulating campaign recommendations.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Produce marketing campaigns mapped to journeyStage and funnelStage. Detail expected KPIs, estimated budgets, ROI, and dependencies.
Output a JSON matching this Zod contract:
{
  "campaigns": [
    {
      "campaignName": "string",
      "objective": "string",
      "targetAudience": "string",
      "channel": "string",
      "coreMessage": "string",
      "offer": "string",
      "callToAction": "string",
      "expectedKpis": ["string"],
      "duration": "string",
      "estimatedBudget": number,
      "expectedROI": "string",
      "dependencies": ["string"],
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "journeyStage": "string",
      "funnelStage": "string",
      "explainability": {
        "businessFactsUsed": ["string"],
        "strategicAssetsUsed": ["string"],
        "journeyStage": "string",
        "funnelStage": "string",
        "knowledgeChunks": ["string"],
        "kpis": ["string"],
        "evidence": "string",
        "reasoningSummary": "string",
        "confidence": number,
        "assumptions": ["string"],
        "constraints": ["string"],
        "alternativeCampaigns": ["string"],
        "expectedOutcome": "string"
      }
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, MarketingCampaignsSchema);
  return { campaigns: parsed.campaigns };
};

// ==========================================
// 9. BUDGET ALLOCATION GRAPH
// ==========================================
export const BudgetAllocationGraphNode: NodeFunction = async (state) => {
  state.logs.push('[BudgetAllocationGraphNode] Executing multi-tier budget optimizer.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Evaluate budget allocations across paid ads, content, email, and SEO. Return minAmount, recommendedAmount, and aggressiveAmount estimates.
Output a JSON matching this Zod contract:
{
  "budgets": [
    {
      "category": "string",
      "minAmount": number,
      "recommendedAmount": number,
      "aggressiveAmount": number,
      "reasoning": "string"
    }
  ],
  "sensitivityAnalysis": "string",
  "breakEvenPoint": "string"
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, MarketingBudgetOptimizerSchema);
  return { budgetOptimizer: parsed };
};

// ==========================================
// 10. EXPERIMENT GRAPH
// ==========================================
export const ExperimentGraphNode: NodeFunction = async (state) => {
  state.logs.push('[ExperimentGraphNode] Building marketing experiment backlog.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Generate 1-2 marketing experiments containing hypotheses, Success Criteria, Success Metrics, duration, required budgets, and confidence levels.
Output a JSON matching this Zod contract:
{
  "experiments": [
    {
      "hypothesis": "string",
      "expectedKPI": "string",
      "duration": "string",
      "successCriteria": "string",
      "requiredBudget": number,
      "confidence": number,
      "businessRisk": "string",
      "dependencies": ["string"],
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "status": "string"
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, MarketingExperimentPortfolioSchema);
  return { experimentPortfolio: parsed };
};

// ==========================================
// 11. CONTENT PILLAR GRAPH
// ==========================================
export const ContentPillarGraphNode: NodeFunction = async (state) => {
  state.logs.push('[ContentPillarGraphNode] Formulating content themes & pillars.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Produce B2B content strategy plans, outlining brand themes, content pillars, and conversion topics.
Output a JSON matching this Zod contract:
{
  "contentPillars": ["string"],
  "brandThemes": ["string"],
  "educationalTopics": ["string"],
  "authorityTopics": ["string"],
  "conversionContent": ["string"],
  "retentionContent": ["string"],
  "seasonalCampaignIdeas": ["string"]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, MarketingContentPlanSchema);
  return { contentPlan: parsed };
};

// ==========================================
// 12. CALENDAR GRAPH
// ==========================================
export const CalendarGraphNode: NodeFunction = async (state) => {
  state.logs.push('[CalendarGraphNode] Mapping quarterly execution calendars.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Generate weekly, monthly, and quarterly schedules and sequences.
Output a JSON matching this Zod contract:
{
  "calendar": [
    {
      "timeFrame": "WEEKLY" | "MONTHLY" | "QUARTERLY",
      "label": "string",
      "activities": ["string"],
      "dependencies": ["string"]
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, MarketingCalendarSchema);
  return { calendar: parsed };
};

// ==========================================
// 13. REFLECTION GRAPH
// ==========================================
export const MarketingReflectionGraphNode: NodeFunction = async (state) => {
  state.logs.push('[MarketingReflectionGraphNode] Commencing CMO self critique loop.');
  let currentCampaigns = state.campaigns || [];
  let reflectionAttempts = 0;
  const maxAttempts = 2;
  const targetConfidenceThreshold = 85;
  let overallConfidence = 0;

  while (reflectionAttempts < maxAttempts) {
    reflectionAttempts++;
    state.logs.push(`[MarketingReflectionGraphNode] Iteration #${reflectionAttempts}`);

    if (currentCampaigns.length === 0) break;
    const camp = currentCampaigns[0];

    const critiquePrompt = `
Marketing Campaign Proposed:
${JSON.stringify(camp)}

TASK:
Critique this campaign. Identify messaging alignment issues, budget gaps, and channel readiness concerns.
Explain where the plan is weak. Return a plain text critique summary.
`;

    const critiqueRes = await llm.generateText({
      systemPrompt: 'You are a critical CMO reviewer. Find gaps in campaigns.',
      userPrompt: critiquePrompt
    });

    const critique = critiqueRes.text;

    const improvementPrompt = `
Original Campaign:
${JSON.stringify(camp)}

Critique:
${critique}

TASK:
Improve the campaign based on the critique. Re-estimate budgets and ROI.
Return the improved campaign conforming strictly to the original JSON Zod contract.
`;

    const improvedRes = await llm.generateText({
      systemPrompt: PromptBuilder.buildSystemPrompt(),
      userPrompt: improvementPrompt,
      jsonMode: true
    });

    const improvedCamp = ResponseParser.parseAndValidate(improvedRes.text, MarketingCampaignDetailSchema);
    overallConfidence = improvedCamp.explainability.confidence;

    currentCampaigns = [improvedCamp];

    if (overallConfidence >= targetConfidenceThreshold) {
      break;
    }
  }

  // Generate readiness scores block
  const scoresPrompt = `
TASK:
Compute marketing readiness scores.
Output a JSON matching this Zod contract:
{
  "marketingReadiness": number,
  "brandReadiness": number,
  "channelReadiness": number,
  "campaignReadiness": number,
  "creativeReadiness": number,
  "audienceReadiness": number,
  "overallMarketingScore": number
}
`;

  const scoresRes = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: scoresPrompt,
    jsonMode: true
  });

  const executiveScores = ResponseParser.parseAndValidate(scoresRes.text, MarketingExecutiveScoresSchema);

  // Generate high level recommendations list
  const recsPrompt = `
TASK:
Generate high-level recommendations.
Output a JSON matching this Zod contract:
{
  "recommendations": [
    {
      "title": "string",
      "problem": "string",
      "opportunity": "string",
      "evidence": "string",
      "affectedKpis": ["string"],
      "expectedROI": number,
      "expectedLeads": number,
      "budget": number,
      "timeline": "string",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "confidence": number,
      "dependencies": ["string"],
      "alternativeApproaches": ["string"]
    }
  ]
}
`;

  const recsRes = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: recsPrompt,
    jsonMode: true
  });

  const marketingRecommendations = ResponseParser.parseAndValidate(recsRes.text, MarketingRecommendationsSchema);

  return {
    campaigns: currentCampaigns,
    reflectionAttempts,
    confidenceScore: overallConfidence,
    executiveScores,
    marketingRecommendations: marketingRecommendations.recommendations
  };
};

// ==========================================
// 14. EXPLAINABILITY GRAPH
// ==========================================
export const MarketingExplainabilityGraphNode: NodeFunction = async (state) => {
  state.logs.push('[MarketingExplainabilityGraphNode] Compiling asset package & trace metadata.');
  return {};
};

// ==========================================
// MASTER MARKETING GRAPH ORCHESTRATOR
// ==========================================
export function createMasterMarketingGraph(): StateGraph {
  const graph = new StateGraph();
  graph.engine = 'marketing';

  graph
    .addNode('MarketingContextGraph', MarketingContextGraphNode)
    .addNode('AudienceAnalysisGraph', AudienceAnalysisGraphNode)
    .addNode('CustomerJourneyGraph', CustomerJourneyGraphNode)
    .addNode('FunnelAnalysisGraph', FunnelAnalysisGraphNode)
    .addNode('MarketingChannelGraph', MarketingChannelGraphNode)
    .addNode('ChannelReadinessGraph', ChannelReadinessGraphNode)
    .addNode('CreativeStrategyGraph', CreativeStrategyGraphNode)
    .addNode('CampaignStrategyGraph', CampaignStrategyGraphNode)
    .addNode('BudgetAllocationGraph', BudgetAllocationGraphNode)
    .addNode('ExperimentGraph', ExperimentGraphNode)
    .addNode('ContentPillarGraph', ContentPillarGraphNode)
    .addNode('CalendarGraph', CalendarGraphNode)
    .addNode('ReflectionGraph', MarketingReflectionGraphNode)
    .addNode('ExplainabilityGraph', MarketingExplainabilityGraphNode);

  return graph;
}
