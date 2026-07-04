"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingExplainabilityGraphNode = exports.MarketingReflectionGraphNode = exports.CalendarGraphNode = exports.ContentPillarGraphNode = exports.ExperimentGraphNode = exports.BudgetAllocationGraphNode = exports.CampaignStrategyGraphNode = exports.CreativeStrategyGraphNode = exports.ChannelReadinessGraphNode = exports.MarketingChannelGraphNode = exports.FunnelAnalysisGraphNode = exports.CustomerJourneyGraphNode = exports.AudienceAnalysisGraphNode = exports.MarketingContextGraphNode = void 0;
exports.createMasterMarketingGraph = createMasterMarketingGraph;
const StateGraph_1 = require("./StateGraph");
const GeminiProvider_1 = require("../../../../ai/providers/GeminiProvider");
const PromptBuilder_1 = require("../../../../ai/providers/PromptBuilder");
const ResponseParser_1 = require("../../../../ai/providers/ResponseParser");
const llm = new GeminiProvider_1.GeminiProvider();
// ==========================================
// 1. MARKETING CONTEXT GRAPH
// ==========================================
const MarketingContextGraphNode = async (state) => {
    state.logs.push('[MarketingContextGraphNode] Marketing Context initialized.');
    return {};
};
exports.MarketingContextGraphNode = MarketingContextGraphNode;
// ==========================================
// 2. AUDIENCE ANALYSIS GRAPH
// ==========================================
const AudienceAnalysisGraphNode = async (state) => {
    state.logs.push('[AudienceAnalysisGraphNode] Evaluating Target Audience & Motivation triggers.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.AudienceAnalysisSchema);
    return { audienceAnalysis: parsed };
};
exports.AudienceAnalysisGraphNode = AudienceAnalysisGraphNode;
// ==========================================
// 3. CUSTOMER JOURNEY GRAPH
// ==========================================
const CustomerJourneyGraphNode = async (state) => {
    state.logs.push('[CustomerJourneyGraphNode] Mapping stage-by-stage customer journey paths.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.CustomerJourneySchema);
    return { customerJourney: parsed };
};
exports.CustomerJourneyGraphNode = CustomerJourneyGraphNode;
// ==========================================
// 4. FUNNEL ANALYSIS GRAPH
// ==========================================
const FunnelAnalysisGraphNode = async (state) => {
    state.logs.push('[FunnelAnalysisGraphNode] Compiling TOFU/MOFU/BOFU drop-off risks.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.FunnelAnalysisSchema);
    return { funnelAnalysis: parsed };
};
exports.FunnelAnalysisGraphNode = FunnelAnalysisGraphNode;
// ==========================================
// 5. MARKETING CHANNEL GRAPH
// ==========================================
const MarketingChannelGraphNode = async (state) => {
    state.logs.push('[MarketingChannelGraphNode] Evaluating marketing channels priority metrics.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.MarketingChannelStrategySchema);
    return { channelEvaluation: parsed };
};
exports.MarketingChannelGraphNode = MarketingChannelGraphNode;
// ==========================================
// 6. CHANNEL READINESS GRAPH
// ==========================================
const ChannelReadinessGraphNode = async (state) => {
    state.logs.push('[ChannelReadinessGraphNode] Assessing channel assets checklist.');
    // readiness checks mapped inside channelEvaluation already
    return {};
};
exports.ChannelReadinessGraphNode = ChannelReadinessGraphNode;
// ==========================================
// 7. CREATIVE STRATEGY GRAPH
// ==========================================
const CreativeStrategyGraphNode = async (state) => {
    state.logs.push('[CreativeStrategyGraphNode] Generating messaging themes & visual directions.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.CreativeStrategySchema);
    return { creativeStrategy: parsed };
};
exports.CreativeStrategyGraphNode = CreativeStrategyGraphNode;
// ==========================================
// 8. CAMPAIGN STRATEGY GRAPH
// ==========================================
const CampaignStrategyGraphNode = async (state) => {
    state.logs.push('[CampaignStrategyGraphNode] Formulating campaign recommendations.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.MarketingCampaignsSchema);
    return { campaigns: parsed.campaigns };
};
exports.CampaignStrategyGraphNode = CampaignStrategyGraphNode;
// ==========================================
// 9. BUDGET ALLOCATION GRAPH
// ==========================================
const BudgetAllocationGraphNode = async (state) => {
    state.logs.push('[BudgetAllocationGraphNode] Executing multi-tier budget optimizer.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.MarketingBudgetOptimizerSchema);
    return { budgetOptimizer: parsed };
};
exports.BudgetAllocationGraphNode = BudgetAllocationGraphNode;
// ==========================================
// 10. EXPERIMENT GRAPH
// ==========================================
const ExperimentGraphNode = async (state) => {
    state.logs.push('[ExperimentGraphNode] Building marketing experiment backlog.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.MarketingExperimentPortfolioSchema);
    return { experimentPortfolio: parsed };
};
exports.ExperimentGraphNode = ExperimentGraphNode;
// ==========================================
// 11. CONTENT PILLAR GRAPH
// ==========================================
const ContentPillarGraphNode = async (state) => {
    state.logs.push('[ContentPillarGraphNode] Formulating content themes & pillars.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.MarketingContentPlanSchema);
    return { contentPlan: parsed };
};
exports.ContentPillarGraphNode = ContentPillarGraphNode;
// ==========================================
// 12. CALENDAR GRAPH
// ==========================================
const CalendarGraphNode = async (state) => {
    state.logs.push('[CalendarGraphNode] Mapping quarterly execution calendars.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.MarketingCalendarSchema);
    return { calendar: parsed };
};
exports.CalendarGraphNode = CalendarGraphNode;
// ==========================================
// 13. REFLECTION GRAPH
// ==========================================
const MarketingReflectionGraphNode = async (state) => {
    state.logs.push('[MarketingReflectionGraphNode] Commencing CMO self critique loop.');
    let currentCampaigns = state.campaigns || [];
    let reflectionAttempts = 0;
    const maxAttempts = 2;
    const targetConfidenceThreshold = 85;
    let overallConfidence = 0;
    while (reflectionAttempts < maxAttempts) {
        reflectionAttempts++;
        state.logs.push(`[MarketingReflectionGraphNode] Iteration #${reflectionAttempts}`);
        if (currentCampaigns.length === 0)
            break;
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
            systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
            userPrompt: improvementPrompt,
            jsonMode: true
        });
        const improvedCamp = ResponseParser_1.ResponseParser.parseAndValidate(improvedRes.text, ResponseParser_1.MarketingCampaignDetailSchema);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: scoresPrompt,
        jsonMode: true
    });
    const executiveScores = ResponseParser_1.ResponseParser.parseAndValidate(scoresRes.text, ResponseParser_1.MarketingExecutiveScoresSchema);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: recsPrompt,
        jsonMode: true
    });
    const marketingRecommendations = ResponseParser_1.ResponseParser.parseAndValidate(recsRes.text, ResponseParser_1.MarketingRecommendationsSchema);
    return {
        campaigns: currentCampaigns,
        reflectionAttempts,
        confidenceScore: overallConfidence,
        executiveScores,
        marketingRecommendations: marketingRecommendations.recommendations
    };
};
exports.MarketingReflectionGraphNode = MarketingReflectionGraphNode;
// ==========================================
// 14. EXPLAINABILITY GRAPH
// ==========================================
const MarketingExplainabilityGraphNode = async (state) => {
    state.logs.push('[MarketingExplainabilityGraphNode] Compiling asset package & trace metadata.');
    return {};
};
exports.MarketingExplainabilityGraphNode = MarketingExplainabilityGraphNode;
// ==========================================
// MASTER MARKETING GRAPH ORCHESTRATOR
// ==========================================
function createMasterMarketingGraph() {
    const graph = new StateGraph_1.StateGraph();
    graph.engine = 'marketing';
    graph
        .addNode('MarketingContextGraph', exports.MarketingContextGraphNode)
        .addNode('AudienceAnalysisGraph', exports.AudienceAnalysisGraphNode)
        .addNode('CustomerJourneyGraph', exports.CustomerJourneyGraphNode)
        .addNode('FunnelAnalysisGraph', exports.FunnelAnalysisGraphNode)
        .addNode('MarketingChannelGraph', exports.MarketingChannelGraphNode)
        .addNode('ChannelReadinessGraph', exports.ChannelReadinessGraphNode)
        .addNode('CreativeStrategyGraph', exports.CreativeStrategyGraphNode)
        .addNode('CampaignStrategyGraph', exports.CampaignStrategyGraphNode)
        .addNode('BudgetAllocationGraph', exports.BudgetAllocationGraphNode)
        .addNode('ExperimentGraph', exports.ExperimentGraphNode)
        .addNode('ContentPillarGraph', exports.ContentPillarGraphNode)
        .addNode('CalendarGraph', exports.CalendarGraphNode)
        .addNode('ReflectionGraph', exports.MarketingReflectionGraphNode)
        .addNode('ExplainabilityGraph', exports.MarketingExplainabilityGraphNode);
    return graph;
}
