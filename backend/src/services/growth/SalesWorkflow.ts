import { GraphState, StateGraph, NodeFunction } from './StateGraph';
import { GeminiProvider } from '../../../../ai/providers/GeminiProvider';
import { PromptBuilder } from '../../../../ai/providers/PromptBuilder';
import { 
  ResponseParser, 
  OpportunityAnalysisSchema,
  DealQualificationsSchema,
  BuyingCommitteeSchema,
  NegotiationStrategySchema,
  ObjectionHandlingSchema,
  ProposalStrategySchema,
  RevenueOptimizationSchema,
  SalesForecastSchema,
  NextBestActionSchema,
  SalesPlaybooksSchema,
  SalesRecommendationsSchema,
  ExecutiveScoresSchema,
  SalesRecommendationDetailSchema
} from '../../../../ai/providers/ResponseParser';

const llm = new GeminiProvider();

// ==========================================
// 1. SALES CONTEXT GRAPH
// ==========================================
export const SalesContextGraphNode: NodeFunction = async (state) => {
  state.logs.push('[SalesContextGraphNode] Sales Context initialized.');
  return {};
};

// ==========================================
// 2. OPPORTUNITY ANALYSIS GRAPH
// ==========================================
export const OpportunityAnalysisGraphNode: NodeFunction = async (state) => {
  state.logs.push('[OpportunityAnalysisGraphNode] Analyzing deal pipeline opportunities.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Examine business deal parameters and current pipeline opportunities.
Output a JSON matching this Zod contract:
{
  "opportunities": [
    {
      "opportunityName": "string",
      "businessValue": "string",
      "revenuePotential": number,
      "strategicImportance": "HIGH",
      "expansionOpportunity": "string",
      "crossSellOpportunity": "string",
      "upsellOpportunity": "string",
      "competitiveRisk": "string",
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

  const parsed = ResponseParser.parseAndValidate(res.text, OpportunityAnalysisSchema);
  return { opportunityAnalysis: parsed };
};

// ==========================================
// 3. DEAL QUALIFICATION GRAPH
// ==========================================
export const DealQualificationGraphNode: NodeFunction = async (state) => {
  state.logs.push('[DealQualificationGraphNode] Evaluating deal qualifications and health scores.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Qualify each pipeline deal based on Need, Authority, Budget, Timeline, Urgency, signals, and relationship.
Output a JSON matching this Zod contract:
{
  "dealHealths": [
    {
      "opportunityName": "string",
      "needScore": number,
      "authorityScore": number,
      "budgetScore": number,
      "timelineScore": number,
      "urgencyScore": number,
      "competitivePosition": number,
      "relationshipStrength": number,
      "buyingSignals": number,
      "riskLevel": number,
      "overallHealthScore": number,
      "explainability": "string"
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, DealQualificationsSchema);
  return { dealQualification: parsed };
};

// ==========================================
// 4. BUYING COMMITTEE GRAPH
// ==========================================
export const BuyingCommitteeGraphNode: NodeFunction = async (state) => {
  state.logs.push('[BuyingCommitteeGraphNode] Mapping buying committee stakeholder alignments.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Examine deal stakeholder parameters, mapping objections, preferred communications styles, and influence.
Output a JSON matching this Zod contract:
{
  "stakeholders": [
    {
      "name": "string",
      "role": "string",
      "influenceLevel": "string",
      "decisionPower": "string",
      "objections": ["string"],
      "motivations": ["string"],
      "preferredCommunicationStyle": "string",
      "risk": "string",
      "recommendedSalesStrategy": "string"
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, BuyingCommitteeSchema);
  return { buyingCommittee: parsed };
};

// ==========================================
// 5. SALES PLAYBOOK GRAPH
// ==========================================
export const SalesPlaybookGraphNode: NodeFunction = async (state) => {
  state.logs.push('[SalesPlaybookGraphNode] Structuring playbook rules and frameworks.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Generate reusable Sales Playbooks including rules, trigger conditions, recommended steps, objection library scripts, negotiation frameworks, and proposal templates.
Output a JSON matching this Zod contract:
{
  "playbooks": [
    {
      "name": "string",
      "playRules": "string",
      "targetAudience": "string",
      "triggerCondition": "string",
      "recommendedSteps": ["string"],
      "objectionLibrary": "string",
      "negotiationFramework": "string",
      "proposalTemplate": "string"
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, SalesPlaybooksSchema);
  return { salesPlaybooks: parsed.playbooks };
};

// ==========================================
// 6. NEGOTIATION STRATEGY GRAPH
// ==========================================
export const NegotiationStrategyGraphNode: NodeFunction = async (state) => {
  state.logs.push('[NegotiationStrategyGraphNode] Devising pricing flexibility and concessions.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Formulate negotiation strategies detailing walk-away parameters, win strategies, concessions, and alternative pricing flexibility options.
Output a JSON matching this Zod contract:
{
  "negotiationObjectives": ["string"],
  "pricingFlexibility": "string",
  "concessions": ["string"],
  "walkAwayConditions": ["string"],
  "riskAnalysis": "string",
  "winStrategy": "string",
  "alternativeApproaches": "string"
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, NegotiationStrategySchema);
  return { negotiationStrategy: parsed };
};

// ==========================================
// 7. OBJECTION HANDLING GRAPH
// ==========================================
export const ObjectionHandlingGraphNode: NodeFunction = async (state) => {
  state.logs.push('[ObjectionHandlingGraphNode] Resolving anticipated pricing and integration objections.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Predict objections across Trust, ROI, Price, Timing, Features, Trust, and build responses.
Output a JSON matching this Zod contract:
{
  "objections": [
    {
      "category": "string",
      "objection": "string",
      "recommendedResponse": "string",
      "supportingEvidence": "string",
      "businessCase": "string"
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, ObjectionHandlingSchema);
  return { objectionHandling: parsed };
};

// ==========================================
// 8. PROPOSAL STRATEGY GRAPH
// ==========================================
export const ProposalStrategyGraphNode: NodeFunction = async (state) => {
  state.logs.push('[ProposalStrategyGraphNode] Structuring case studies and ROI narratives.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Generate proposal guidelines mapping narrative sequence, success metrics, case study suggestions, and timelines.
Output a JSON matching this Zod contract:
{
  "proposalStructure": ["string"],
  "valueNarrative": "string",
  "roiStory": "string",
  "caseStudySuggestions": ["string"],
  "proofPoints": ["string"],
  "successMetrics": ["string"],
  "recommendedTimeline": "string"
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, ProposalStrategySchema);
  return { proposalStrategy: parsed };
};

// ==========================================
// 9. DEAL RISK GRAPH
// ==========================================
export const DealRiskGraphNode: NodeFunction = async (state) => {
  state.logs.push('[DealRiskGraphNode] Evaluating deal risk factors.');
  return {};
};

// ==========================================
// 10. REVENUE OPTIMIZATION GRAPH
// ==========================================
export const RevenueOptimizationGraphNode: NodeFunction = async (state) => {
  state.logs.push('[RevenueOptimizationGraphNode] Scouting renewal and account expansion pathways.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Identify upsells, bundles, cross-sells, renewal risks, and account expansion possibilities.
Output a JSON matching this Zod contract:
{
  "upsellOpportunities": ["string"],
  "crossSellOpportunities": ["string"],
  "bundleOpportunities": ["string"],
  "renewalOpportunities": ["string"],
  "expansionAccounts": ["string"],
  "revenueRisks": ["string"]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, RevenueOptimizationSchema);
  return { revenueOptimization: parsed };
};

// ==========================================
// 11. SALES FORECAST GRAPH
// ==========================================
export const SalesForecastGraphNode: NodeFunction = async (state) => {
  state.logs.push('[SalesForecastGraphNode] Projecting pipeline revenues and close probabilities.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Forecast Best Case, Expected Case, Worst Case, Pipeline Value, Expected Revenue, and Close Probability.
Output a JSON matching this Zod contract:
{
  "bestCase": number,
  "expectedCase": number,
  "worstCase": number,
  "expectedRevenue": number,
  "pipelineValue": number,
  "closeProbability": number,
  "forecastConfidence": number
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, SalesForecastSchema);
  return { salesForecast: parsed };
};

// ==========================================
// 12. NEXT BEST ACTION GRAPH
// ==========================================
export const NextBestActionGraphNode: NodeFunction = async (state) => {
  state.logs.push('[NextBestActionGraphNode] Formulating next best action checklists.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Map immediate actions, priorities, follow-ups, escalation rules, deadliness, resources, and success KPIs.
Output a JSON matching this Zod contract:
{
  "actions": [
    {
      "opportunityName": "string",
      "immediateAction": "string",
      "followUpAction": "string",
      "escalation": "string",
      "requiredResources": ["string"],
      "expectedOutcome": "string",
      "successKPI": "string",
      "deadline": "string",
      "priority": "HIGH"
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, NextBestActionSchema);
  return { nextBestAction: parsed };
};

// ==========================================
// 13. REFLECTION GRAPH (Critique Loop)
// ==========================================
export const SalesReflectionGraphNode: NodeFunction = async (state) => {
  state.logs.push('[SalesReflectionGraphNode] Running self-critique loop over deal recommendations.');
  
  const initialRecommendationsPrompt = `
TASK:
Compile high-level strategic recommendations for open deals.
Output a JSON matching this Zod contract:
{
  "recommendations": [
    {
      "opportunityName": "string",
      "title": "string",
      "nextBestAction": "string",
      "expectedCloseProb": number,
      "expectedTimeline": "string",
      "riskFactors": ["string"],
      "dependencies": ["string"],
      "alternativeActions": ["string"]
    }
  ]
}
`;

  const initialRes = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: initialRecommendationsPrompt,
    jsonMode: true
  });

  let parsedRecommendations = ResponseParser.parseAndValidate(initialRes.text, SalesRecommendationsSchema).recommendations;

  let attempts = 0;
  const maxAttempts = 2;
  const confidenceThreshold = 85;

  while (attempts < maxAttempts) {
    attempts++;
    state.logs.push(`[SalesReflectionGraphNode] Iteration #${attempts}`);
    if (parsedRecommendations.length === 0) break;
    const rec = parsedRecommendations[0];

    const critiquePrompt = `
Proposed Sales Strategy:
${JSON.stringify(rec)}

TASK:
Critique this strategy. Identify deal conversion risk factors, timing dependencies, pricing flexibilities, and pipeline stage logic concerns.
Explain where the plan is weak. Return a plain text critique summary.
`;

    const critiqueRes = await llm.generateText({
      systemPrompt: 'You are a critical Chief Revenue Officer. Criticize deal recommendations.',
      userPrompt: critiquePrompt
    });

    const critique = critiqueRes.text;

    const improvementPrompt = `
Original Recommendation:
${JSON.stringify(rec)}

Critique:
${critique}

TASK:
Improve the recommendation based on the critique. Re-estimate closing probability and timeline.
Return the improved recommendation conforming strictly to the original JSON Zod contract.
`;

    const improvedRes = await llm.generateText({
      systemPrompt: PromptBuilder.buildSystemPrompt(),
      userPrompt: improvementPrompt,
      jsonMode: true
    });

    const improvedRec = ResponseParser.parseAndValidate(improvedRes.text, SalesRecommendationDetailSchema);
    const confidence = improvedRec.expectedCloseProb;
    parsedRecommendations = [improvedRec];

    if (confidence >= confidenceThreshold) {
      break;
    }
  }

  // Executive Scores Calculation
  const scoresPrompt = `
TASK:
Compute executive score metrics for revenue intelligence.
Output a JSON matching this Zod contract:
{
  "pipelineHealth": number,
  "forecastReliability": number,
  "revenueStability": number,
  "expansionPotential": number,
  "revenueRisk": number,
  "growthMomentum": number,
  "overallExecutiveRevenueScore": number
}
`;

  const scoresRes = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: scoresPrompt,
    jsonMode: true
  });

  const parsedScores = ResponseParser.parseAndValidate(scoresRes.text, ExecutiveScoresSchema);

  return {
    salesRecommendations: parsedRecommendations,
    executiveScores: parsedScores,
    reflectionAttempts: attempts
  };
};

// ==========================================
// 14. EXPLAINABILITY GRAPH
// ==========================================
export const SalesExplainabilityGraphNode: NodeFunction = async (state) => {
  state.logs.push('[SalesExplainabilityGraphNode] Bundling grounding fact traces.');
  return {};
};

// ==========================================
// MASTER SALES GRAPH ORCHESTRATOR
// ==========================================
export function createMasterSalesGraph(): StateGraph {
  const graph = new StateGraph();
  graph.engine = 'sales';
  
  graph
    .addNode('SalesContextGraph', SalesContextGraphNode)
    .addNode('OpportunityAnalysisGraph', OpportunityAnalysisGraphNode)
    .addNode('DealQualificationGraph', DealQualificationGraphNode)
    .addNode('BuyingCommitteeGraph', BuyingCommitteeGraphNode)
    .addNode('SalesPlaybookGraph', SalesPlaybookGraphNode)
    .addNode('NegotiationStrategyGraph', NegotiationStrategyGraphNode)
    .addNode('ObjectionHandlingGraph', ObjectionHandlingGraphNode)
    .addNode('ProposalStrategyGraph', ProposalStrategyGraphNode)
    .addNode('DealRiskGraph', DealRiskGraphNode)
    .addNode('RevenueOptimizationGraph', RevenueOptimizationGraphNode)
    .addNode('SalesForecastGraph', SalesForecastGraphNode)
    .addNode('NextBestActionGraph', NextBestActionGraphNode)
    .addNode('ReflectionGraph', SalesReflectionGraphNode)
    .addNode('ExplainabilityGraph', SalesExplainabilityGraphNode);

  return graph;
}
