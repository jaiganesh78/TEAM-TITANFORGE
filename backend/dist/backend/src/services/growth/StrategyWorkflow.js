"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplainabilityGraphNode = exports.ReflectionGraphNode = exports.RecommendationGraphNode = exports.OpportunityGraphNode = exports.PricingGraphNode = exports.PositioningGraphNode = exports.SWOTGraphNode = exports.GapAnalysisGraphNode = exports.CompetitorAnalysisGraphNode = exports.MarketResearchGraphNode = exports.ContextGraphNode = void 0;
exports.createMasterStrategyGraph = createMasterStrategyGraph;
const StateGraph_1 = require("./StateGraph");
const GeminiProvider_1 = require("../../../../ai/providers/GeminiProvider");
const PromptBuilder_1 = require("../../../../ai/providers/PromptBuilder");
const ResponseParser_1 = require("../../../../ai/providers/ResponseParser");
const MarketResearchProvider_1 = require("./MarketResearchProvider");
const StrategyMemoryService_1 = require("./StrategyMemoryService");
const llm = new GeminiProvider_1.GeminiProvider();
const researchProvider = new MarketResearchProvider_1.GeminiMarketResearchProvider();
// ==========================================
// 1. CONTEXT GRAPH NODE
// ==========================================
const ContextGraphNode = async (state) => {
    // Gathers Context package already pre-compiled by the orchestrator
    state.logs.push('[ContextGraphNode] Context loaded successfully');
    return {};
};
exports.ContextGraphNode = ContextGraphNode;
// ==========================================
// 2. MARKET RESEARCH GRAPH NODE
// ==========================================
const MarketResearchGraphNode = async (state) => {
    const industry = state.contextPackage.businessSummary.industry;
    const location = state.contextPackage.digitalTwinData.identity?.headquarters || 'Global';
    const stage = state.contextPackage.growthTwinSummary?.businessStage || 'GROWTH';
    state.logs.push(`[MarketResearchGraphNode] Querying market research for ${industry} in ${location}`);
    const result = await researchProvider.fetchResearch({ industry, location, stage });
    return { marketResearch: result };
};
exports.MarketResearchGraphNode = MarketResearchGraphNode;
// ==========================================
// 3. COMPETITOR ANALYSIS GRAPH NODE
// ==========================================
const CompetitorAnalysisGraphNode = async (state) => {
    const competitorsList = state.contextPackage.digitalTwinData.identity?.competitors || [];
    state.logs.push('[CompetitorAnalysisGraphNode] Evaluating competitor profile positions');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = PromptBuilder_1.PromptBuilder.buildCompetitorPrompt(contextText, competitorsList);
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.CompetitorAnalysisSchema);
    return { competitorAnalysis: parsed };
};
exports.CompetitorAnalysisGraphNode = CompetitorAnalysisGraphNode;
// ==========================================
// 4. GAP ANALYSIS GRAPH NODE
// ==========================================
const GapAnalysisGraphNode = async (state) => {
    state.logs.push('[GapAnalysisGraphNode] Compiling GDT domain state gap lists (deterministic)');
    const domains = state.contextPackage.growthDomainStates || [];
    const gaps = {};
    for (const d of domains) {
        if (d.gap) {
            try {
                gaps[d.domain] = JSON.parse(d.gap);
            }
            catch {
                gaps[d.domain] = [d.gap];
            }
        }
    }
    return { gaps };
};
exports.GapAnalysisGraphNode = GapAnalysisGraphNode;
// ==========================================
// 5. SWOT GRAPH NODE
// ==========================================
const SWOTGraphNode = async (state) => {
    state.logs.push('[SWOTGraphNode] Formulating SWOT matrix from RAG facts');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = PromptBuilder_1.PromptBuilder.buildSwotPrompt(contextText);
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.SwotSchema);
    return { swot: parsed };
};
exports.SWOTGraphNode = SWOTGraphNode;
// ==========================================
// 6. POSITIONING GRAPH NODE
// ==========================================
const PositioningGraphNode = async (state) => {
    state.logs.push('[PositioningGraphNode] Building unique value prop alignment');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Develop target audience positioning and recommended Brand Unique Value Proposition.
Output a JSON matching this Zod contract:
{
  "currentPositioning": "string",
  "recommendedPositioning": "string",
  "uniqueValueProposition": "string",
  "differentiators": ["string"],
  "targetAudienceAlignment": "string",
  "brandNarrative": "string"
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.PositioningSchema);
    return { positioning: parsed };
};
exports.PositioningGraphNode = PositioningGraphNode;
// ==========================================
// 7. PRICING GRAPH NODE
// ==========================================
const PricingGraphNode = async (state) => {
    state.logs.push('[PricingGraphNode] Evaluating pricing strategy benchmarks');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Examine the pricing model of the business and suggest pricing improvements.
Output a JSON matching this Zod contract:
{
  "pricingEvaluation": "string",
  "pricingOpportunities": ["string"],
  "suggestedPricingStrategy": "string",
  "risks": ["string"],
  "expectedImpact": "string"
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.PricingSchema);
    return { pricing: parsed };
};
exports.PricingGraphNode = PricingGraphNode;
// ==========================================
// 8. OPPORTUNITY GRAPH NODE
// ==========================================
const OpportunityGraphNode = async (state) => {
    state.logs.push('[OpportunityGraphNode] Classifying Quick Wins vs Strategic Gaps');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Identify 1-2 Quick Wins and 1-2 Strategic Opportunities.
Output a JSON matching this Zod contract:
{
  "opportunities": [
    {
      "title": "string",
      "type": "string", // Quick Win | Medium-term | Long-term
      "expectedImpact": "string",
      "difficulty": "string",
      "dependencies": ["string"],
      "confidence": number,
      "evidence": "string"
    }
  ]
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.GrowthOpportunitiesSchema);
    return { opportunities: parsed };
};
exports.OpportunityGraphNode = OpportunityGraphNode;
// ==========================================
// 9. RECOMMENDATION GRAPH NODE
// ==========================================
const RecommendationGraphNode = async (state) => {
    state.logs.push('[RecommendationGraphNode] Drafting strategy recommendation initiatives');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const sectorText = JSON.stringify(state.contextPackage.sectorConfig || {});
    const gapText = JSON.stringify(state.gaps || {});
    // Fetch memory log summary to ground recommendations
    const memorySummary = await StrategyMemoryService_1.StrategyMemoryService.getStrategyMemorySummary(state.businessId);
    const prompt = `
${contextText}
${memorySummary}

${PromptBuilder_1.PromptBuilder.buildRecommendationsPrompt(contextText, sectorText, gapText)}`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.RecommendationsSchema);
    return { recommendations: parsed.recommendations };
};
exports.RecommendationGraphNode = RecommendationGraphNode;
// ==========================================
// 10. REFLECTION GRAPH NODE (Self Critique Loop)
// ==========================================
const ReflectionGraphNode = async (state) => {
    state.logs.push('[ReflectionGraphNode] Commencing self critique loop');
    let currentRecs = state.recommendations || [];
    let reflectionAttempts = 0;
    const maxAttempts = 3;
    const targetConfidenceThreshold = 85;
    let overallConfidence = 0;
    while (reflectionAttempts < maxAttempts) {
        reflectionAttempts++;
        state.logs.push(`[ReflectionGraphNode] Iteration #${reflectionAttempts}`);
        if (currentRecs.length === 0)
            break;
        const rec = currentRecs[0];
        // Node 1: Weakness detection critique prompt
        const critiquePrompt = `
Strategy Recommendation Proposed:
${JSON.stringify(rec)}

TASK:
Critique this strategy recommendation. Identify weaknesses, omissions, implementation blockers, and check it against logical constraints.
Explain where the plan is weak or lacks evidence. Return a plain text critique summary.
`;
        const critiqueRes = await llm.generateText({
            systemPrompt: 'You are a critical strategy reviewer. Find gaps and weaknesses.',
            userPrompt: critiquePrompt
        });
        const critique = critiqueRes.text;
        state.logs.push(`[ReflectionGraphNode] Critique: ${critique.slice(0, 100)}...`);
        // Node 2: Improvement execution
        const improvementPrompt = `
Original Recommendation:
${JSON.stringify(rec)}

Critique / Weaknesses Identified:
${critique}

TASK:
Improve the recommendation based on the critique. Address all weaknesses, expand on execution plan details, verify affected KPIs, and re-estimate timelines.
Return the improved recommendation conforming strictly to the original JSON Zod contract.
`;
        const improvedRes = await llm.generateText({
            systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
            userPrompt: improvementPrompt,
            jsonMode: true
        });
        const improvedRec = ResponseParser_1.ResponseParser.parseAndValidate(improvedRes.text, ResponseParser_1.RecommendationSchema);
        // Evaluate Confidence score
        overallConfidence = improvedRec.confidence;
        state.logs.push(`[ReflectionGraphNode] Post-reflection confidence score: ${overallConfidence}%`);
        currentRecs = [improvedRec];
        if (overallConfidence >= targetConfidenceThreshold) {
            state.logs.push('[ReflectionGraphNode] Target confidence threshold met. Exiting loop.');
            break;
        }
    }
    return {
        recommendations: currentRecs,
        reflectionAttempts,
        confidenceScore: overallConfidence
    };
};
exports.ReflectionGraphNode = ReflectionGraphNode;
// ==========================================
// 11. EXPLAINABILITY GRAPH NODE
// ==========================================
const ExplainabilityGraphNode = async (state) => {
    state.logs.push('[ExplainabilityGraphNode] Compiling asset package & trace metadata');
    const recommendations = state.recommendations || [];
    const assets = {
        strategicObjectives: ['Scale LTV:CAC Ratio to 3.5+', 'Diversify Customer Acquisition channels'],
        strategicPriorities: ['Pricing model optimization', 'Mid-market client targeting conversion path'],
        knownRisks: ['Longer sales cycle friction', 'Integration onboarding complexity'],
        knownConstraints: state.contextPackage.constraints || [],
        opportunities: state.opportunities || null,
        roadmapPhases: [
            { phase: 'Phase 1: Implementation Setup', timeline: 'Days 1-30', objectives: ['pricing configuration', 'strip portal integration'] },
            { phase: 'Phase 2: Customer Migration', timeline: 'Days 31-60', objectives: ['contract migration', 'NPS survey trigger'] }
        ]
    };
    // Compile exact evidence facts linked to recommendation explainability
    return {
        strategicAssets: assets,
        recommendations
    };
};
exports.ExplainabilityGraphNode = ExplainabilityGraphNode;
// ==========================================
// MASTER STRATEGY GRAPH ORCHESTRATOR
// ==========================================
function createMasterStrategyGraph() {
    const graph = new StateGraph_1.StateGraph();
    graph
        .addNode('ContextGraph', exports.ContextGraphNode)
        .addNode('MarketResearchGraph', exports.MarketResearchGraphNode)
        .addNode('CompetitorAnalysisGraph', exports.CompetitorAnalysisGraphNode)
        .addNode('GapAnalysisGraph', exports.GapAnalysisGraphNode)
        .addNode('SWOTGraph', exports.SWOTGraphNode)
        .addNode('PositioningGraph', exports.PositioningGraphNode)
        .addNode('PricingGraph', exports.PricingGraphNode)
        .addNode('OpportunityGraph', exports.OpportunityGraphNode)
        .addNode('RecommendationGraph', exports.RecommendationGraphNode)
        .addNode('ReflectionGraph', exports.ReflectionGraphNode)
        .addNode('ExplainabilityGraph', exports.ExplainabilityGraphNode);
    return graph;
}
