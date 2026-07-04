import { GraphState, StateGraph, NodeFunction } from './StateGraph';
import { GeminiProvider } from '../../../../ai/providers/GeminiProvider';
import { PromptBuilder } from '../../../../ai/providers/PromptBuilder';
import { 
  ResponseParser, 
  SwotSchema, 
  CompetitorAnalysisSchema, 
  MarketAnalysisSchema,
  PricingSchema,
  PositioningSchema,
  GrowthOpportunitiesSchema,
  RecommendationsSchema,
  RecommendationSchema
} from '../../../../ai/providers/ResponseParser';
import { GeminiMarketResearchProvider } from './MarketResearchProvider';
import { StrategyMemoryService } from './StrategyMemoryService';

const llm = new GeminiProvider();
const researchProvider = new GeminiMarketResearchProvider();

// ==========================================
// 1. CONTEXT GRAPH NODE
// ==========================================
export const ContextGraphNode: NodeFunction = async (state) => {
  // Gathers Context package already pre-compiled by the orchestrator
  state.logs.push('[ContextGraphNode] Context loaded successfully');
  return {};
};

// ==========================================
// 2. MARKET RESEARCH GRAPH NODE
// ==========================================
export const MarketResearchGraphNode: NodeFunction = async (state) => {
  const industry = state.contextPackage.businessSummary.industry;
  const location = state.contextPackage.digitalTwinData.identity?.headquarters || 'Global';
  const stage = state.contextPackage.growthTwinSummary?.businessStage || 'GROWTH';

  state.logs.push(`[MarketResearchGraphNode] Querying market research for ${industry} in ${location}`);
  const result = await researchProvider.fetchResearch({ industry, location, stage });

  return { marketResearch: result };
};

// ==========================================
// 3. COMPETITOR ANALYSIS GRAPH NODE
// ==========================================
export const CompetitorAnalysisGraphNode: NodeFunction = async (state) => {
  const competitorsList = state.contextPackage.digitalTwinData.identity?.competitors || [];
  
  state.logs.push('[CompetitorAnalysisGraphNode] Evaluating competitor profile positions');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = PromptBuilder.buildCompetitorPrompt(contextText, competitorsList);

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, CompetitorAnalysisSchema);
  return { competitorAnalysis: parsed };
};

// ==========================================
// 4. GAP ANALYSIS GRAPH NODE
// ==========================================
export const GapAnalysisGraphNode: NodeFunction = async (state) => {
  state.logs.push('[GapAnalysisGraphNode] Compiling GDT domain state gap lists (deterministic)');
  const domains = state.contextPackage.growthDomainStates || [];
  const gaps: Record<string, string[]> = {};

  for (const d of domains) {
    if (d.gap) {
      try {
        gaps[d.domain] = JSON.parse(d.gap);
      } catch {
        gaps[d.domain] = [d.gap];
      }
    }
  }

  return { gaps };
};

// ==========================================
// 5. SWOT GRAPH NODE
// ==========================================
export const SWOTGraphNode: NodeFunction = async (state) => {
  state.logs.push('[SWOTGraphNode] Formulating SWOT matrix from RAG facts');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = PromptBuilder.buildSwotPrompt(contextText);

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, SwotSchema);
  return { swot: parsed };
};

// ==========================================
// 6. POSITIONING GRAPH NODE
// ==========================================
export const PositioningGraphNode: NodeFunction = async (state) => {
  state.logs.push('[PositioningGraphNode] Building unique value prop alignment');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
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
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, PositioningSchema);
  return { positioning: parsed };
};

// ==========================================
// 7. PRICING GRAPH NODE
// ==========================================
export const PricingGraphNode: NodeFunction = async (state) => {
  state.logs.push('[PricingGraphNode] Evaluating pricing strategy benchmarks');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
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
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, PricingSchema);
  return { pricing: parsed };
};

// ==========================================
// 8. OPPORTUNITY GRAPH NODE
// ==========================================
export const OpportunityGraphNode: NodeFunction = async (state) => {
  state.logs.push('[OpportunityGraphNode] Classifying Quick Wins vs Strategic Gaps');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
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
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, GrowthOpportunitiesSchema);
  return { opportunities: parsed };
};

// ==========================================
// 9. RECOMMENDATION GRAPH NODE
// ==========================================
export const RecommendationGraphNode: NodeFunction = async (state) => {
  state.logs.push('[RecommendationGraphNode] Drafting strategy recommendation initiatives');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const sectorText = JSON.stringify(state.contextPackage.sectorConfig || {});
  const gapText = JSON.stringify(state.gaps || {});

  // Fetch memory log summary to ground recommendations
  const memorySummary = await StrategyMemoryService.getStrategyMemorySummary(state.businessId);

  const prompt = `
${contextText}
${memorySummary}

${PromptBuilder.buildRecommendationsPrompt(contextText, sectorText, gapText)}`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, RecommendationsSchema);
  return { recommendations: parsed.recommendations };
};

// ==========================================
// 10. REFLECTION GRAPH NODE (Self Critique Loop)
// ==========================================
export const ReflectionGraphNode: NodeFunction = async (state) => {
  state.logs.push('[ReflectionGraphNode] Commencing self critique loop');
  let currentRecs = state.recommendations || [];
  let reflectionAttempts = 0;
  const maxAttempts = 3;
  const targetConfidenceThreshold = 85;
  let overallConfidence = 0;

  while (reflectionAttempts < maxAttempts) {
    reflectionAttempts++;
    state.logs.push(`[ReflectionGraphNode] Iteration #${reflectionAttempts}`);

    if (currentRecs.length === 0) break;
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
      systemPrompt: PromptBuilder.buildSystemPrompt(),
      userPrompt: improvementPrompt,
      jsonMode: true
    });

    const improvedRec = ResponseParser.parseAndValidate(improvedRes.text, RecommendationSchema);
    
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

// ==========================================
// 11. EXPLAINABILITY GRAPH NODE
// ==========================================
export const ExplainabilityGraphNode: NodeFunction = async (state) => {
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

// ==========================================
// MASTER STRATEGY GRAPH ORCHESTRATOR
// ==========================================
export function createMasterStrategyGraph(): StateGraph {
  const graph = new StateGraph();
  
  graph
    .addNode('ContextGraph', ContextGraphNode)
    .addNode('MarketResearchGraph', MarketResearchGraphNode)
    .addNode('CompetitorAnalysisGraph', CompetitorAnalysisGraphNode)
    .addNode('GapAnalysisGraph', GapAnalysisGraphNode)
    .addNode('SWOTGraph', SWOTGraphNode)
    .addNode('PositioningGraph', PositioningGraphNode)
    .addNode('PricingGraph', PricingGraphNode)
    .addNode('OpportunityGraph', OpportunityGraphNode)
    .addNode('RecommendationGraph', RecommendationGraphNode)
    .addNode('ReflectionGraph', ReflectionGraphNode)
    .addNode('ExplainabilityGraph', ExplainabilityGraphNode);

  return graph;
}
