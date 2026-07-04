import { GraphState, StateGraph, NodeFunction } from './StateGraph';
import { GeminiProvider } from '../../../../ai/providers/GeminiProvider';
import { PromptBuilder } from '../../../../ai/providers/PromptBuilder';
import { 
  ResponseParser, 
  IdealCustomerProfileSchema,
  LeadProfilesSchema,
  LeadSourcesSchema,
  LeadQualificationSchema,
  LeadScoringSchema,
  LeadSegmentationSchema,
  LeadNurturingSchema,
  LeadRecommendationsSchema,
  LeadForecastSchema,
  LeadPlaybooksSchema,
  LeadRecommendationDetailSchema
} from '../../../../ai/providers/ResponseParser';

const llm = new GeminiProvider();

// ==========================================
// 1. LEAD CONTEXT GRAPH
// ==========================================
export const LeadContextGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadContextGraphNode] Lead Context initialized.');
  return {};
};

// ==========================================
// 2. ICP GRAPH
// ==========================================
export const ICPGraphNode: NodeFunction = async (state) => {
  state.logs.push('[ICPGraphNode] Generating structured Ideal Customer Profile (ICP).');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Generate the Ideal Customer Profile (ICP) for the company.
Output a JSON matching this Zod contract:
{
  "industry": "string",
  "companySize": "string",
  "revenueRange": "string",
  "decisionMakers": ["string"],
  "painPoints": ["string"],
  "techStack": ["string"],
  "buyingIntent": "string",
  "budgetLevel": number,
  "growthStage": "string",
  "expectedLtv": number,
  "expectedCac": number,
  "confidence": number,
  "evidence": "string"
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, IdealCustomerProfileSchema);
  return { icpAnalysis: parsed };
};

// ==========================================
// 3. LEAD SOURCE GRAPH
// ==========================================
export const LeadSourceGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadSourceGraphNode] Ranking lead source acquisition channels.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Examine and rank potential lead source acquisition channels (LinkedIn, Google Search, SEO, Referrals, Cold Outreach, Communities, Directories, paid Ads, Offline).
Output a JSON matching this Zod contract:
{
  "sources": [
    {
      "sourceName": "string",
      "rank": number,
      "expectedRoi": "string",
      "difficulty": "string",
      "requiredBudget": number,
      "expectedLeads": number,
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

  const parsed = ResponseParser.parseAndValidate(res.text, LeadSourcesSchema);
  return { leadSources: parsed };
};

// ==========================================
// 4. LEAD ACQUISITION GRAPH
// ==========================================
export const LeadAcquisitionGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadAcquisitionGraphNode] Designing inbound & outbound acquisition strategies.');
  // Creates individual LeadProfiles matching BDT segment requirements
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Identify and generate 1-2 prospective target lead companies matching the ICP and sector profile parameters.
Output a JSON matching this Zod contract:
{
  "leads": [
    {
      "companyName": "string",
      "industry": "string",
      "companySize": "string",
      "revenueRange": "string",
      "decisionMakers": ["string"],
      "painPoints": ["string"],
      "techStack": ["string"],
      "buyingIntent": "string",
      "budgetLevel": number,
      "growthStage": "string",
      "expectedLtv": number,
      "expectedCac": number,
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

  const parsed = ResponseParser.parseAndValidate(res.text, LeadProfilesSchema);
  return { leads: parsed.leads };
};

// ==========================================
// 5. LEAD QUALIFICATION GRAPH
// ==========================================
export const LeadQualificationGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadQualificationGraphNode] Constructing lead qualification thresholds.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Perform lead qualification evaluation. Assess Fit, Intent, Budget, Authority, Need, and Timing scores.
Output a JSON matching this Zod contract:
{
  "fitScore": number,
  "intentScore": number,
  "budgetScore": number,
  "authorityScore": number,
  "needScore": number,
  "timingScore": number,
  "overallQualification": number
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, LeadQualificationSchema);
  return { qualificationRules: parsed };
};

// ==========================================
// 6. LEAD SCORING GRAPH
// ==========================================
export const LeadScoringGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadScoringGraphNode] Calculating quality, value, and conversion scores.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Establish scoring models. Predict quality score, value score, conversion probability, risk score, urgency score, and priority tier.
Output a JSON matching this Zod contract:
{
  "qualityScore": number,
  "valueScore": number,
  "conversionProbability": number,
  "revenuePotential": number,
  "riskScore": number,
  "urgencyScore": number,
  "priorityTier": "Tier 1" | "Tier 2" | "Tier 3",
  "explainability": "string"
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, LeadScoringSchema);
  return { scoringModel: parsed };
};

// ==========================================
// 7. LEAD SEGMENTATION GRAPH
// ==========================================
export const LeadSegmentationGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadSegmentationGraphNode] Partitioning leads by industry/revenue.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Categorize leads into partitions by size, industry, and expected deal sizes.
Output a JSON matching this Zod contract:
{
  "segments": [
    {
      "segmentName": "string",
      "industry": "string",
      "companySize": "string",
      "expectedDealSize": number,
      "leadsCount": number
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, LeadSegmentationSchema);
  return { segmentation: parsed };
};

// ==========================================
// 8. LEAD NURTURING GRAPH
// ==========================================
export const LeadNurturingGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadNurturingGraphNode] Designing nurture sequence workflows.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Map out nurture journeys for lead stages (Cold, Warm, Hot, Enterprise, SMB) detailing waiting periods, message topics, and touchpoints.
Output a JSON matching this Zod contract:
{
  "journeys": [
    {
      "journeyType": "Cold" | "Warm" | "Hot" | "Enterprise" | "SMB",
      "touchpoints": ["string"],
      "messages": ["string"],
      "waitingPeriods": ["string"],
      "successKpis": ["string"]
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, LeadNurturingSchema);
  return { nurtureJourneys: parsed };
};

// ==========================================
// 9. LEAD CONVERSION GRAPH
// ==========================================
export const LeadConversionGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadConversionGraphNode] Recommending Next-Best-Action playbooks.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Build actionable growth team playbooks containing trigger rules, audience scope, and recommended play steps.
Output a JSON matching this Zod contract:
{
  "playbooks": [
    {
      "name": "string",
      "playRules": "string",
      "targetAudience": "string",
      "triggerCondition": "string",
      "recommendedSteps": ["string"]
    }
  ]
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, LeadPlaybooksSchema);
  return { leadPlaybooks: parsed.playbooks };
};

// ==========================================
// 10. LEAD FORECAST GRAPH
// ==========================================
export const LeadForecastGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadForecastGraphNode] Projecting conversion rates & SQL revenue.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Forecast pipeline outcomes: expected leads, qualified counts, close conversion rate, and pipeline value bounds.
Output a JSON matching this Zod contract:
{
  "expectedLeads": number,
  "qualifiedLeads": number,
  "sqlCount": number,
  "conversionRate": number,
  "revenue": number,
  "pipelineValue": number,
  "confidenceMin": number,
  "confidenceMax": number
}
`;

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, LeadForecastSchema);
  return { forecasts: parsed };
};

// ==========================================
// 11. LEAD RECOMMENDATION GRAPH
// ==========================================
export const LeadRecommendationGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadRecommendationGraphNode] Structuring lead strategy recommendations.');
  const contextText = PromptBuilder.buildContextPrompt(state.contextPackage);
  const prompt = `
${contextText}

TASK:
Synthesize recommendations, next best action steps, closing probabilities, and dependencies.
Output a JSON matching this Zod contract:
{
  "recommendations": [
    {
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

  const res = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: prompt,
    jsonMode: true
  });

  const parsed = ResponseParser.parseAndValidate(res.text, LeadRecommendationsSchema);
  return { leadRecommendations: parsed.recommendations };
};

// ==========================================
// 12. REFLECTION GRAPH
// ==========================================
export const LeadReflectionGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadReflectionGraphNode] Self critique validation check loop.');
  let currentRecommendations = state.leadRecommendations || [];
  let attempts = 0;
  const maxAttempts = 2;
  const confidenceThreshold = 85;

  while (attempts < maxAttempts) {
    attempts++;
    state.logs.push(`[LeadReflectionGraphNode] Iteration #${attempts}`);
    if (currentRecommendations.length === 0) break;
    const rec = currentRecommendations[0];

    const critiquePrompt = `
Proposed Lead Strategy:
${JSON.stringify(rec)}

TASK:
Critique this strategy. Identify lead conversion risk factors, timing dependencies, and pipeline stage logic concerns.
Explain where the plan is weak. Return a plain text critique summary.
`;

    const critiqueRes = await llm.generateText({
      systemPrompt: 'You are a critical VP of Growth. Criticize lead recommendations.',
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

    const improvedRec = ResponseParser.parseAndValidate(improvedRes.text, LeadRecommendationDetailSchema);
    const confidence = improvedRec.expectedCloseProb;
    currentRecommendations = [improvedRec];

    if (confidence >= confidenceThreshold) {
      break;
    }
  }

  // Executive Scores Calculation
  const scoresPrompt = `
TASK:
Compute executive score metrics for lead intelligence.
Output a JSON matching this Zod contract:
{
  "expectedLeads": number,
  "qualifiedLeads": number,
  "sqlCount": number,
  "conversionRate": number,
  "revenue": number,
  "pipelineValue": number,
  "confidenceMin": number,
  "confidenceMax": number
}
`;

  const scoresRes = await llm.generateText({
    systemPrompt: PromptBuilder.buildSystemPrompt(),
    userPrompt: scoresPrompt,
    jsonMode: true
  });

  const parsedScores = ResponseParser.parseAndValidate(scoresRes.text, LeadForecastSchema);

  return {
    leadRecommendations: currentRecommendations,
    executiveScores: parsedScores,
    reflectionAttempts: attempts
  };
};

// ==========================================
// 13. EXPLAINABILITY GRAPH
// ==========================================
export const LeadExplainabilityGraphNode: NodeFunction = async (state) => {
  state.logs.push('[LeadExplainabilityGraphNode] Bundling grounding fact traces.');
  return {};
};

// ==========================================
// MASTER LEAD GRAPH ORCHESTRATOR
// ==========================================
export function createMasterLeadGraph(): StateGraph {
  const graph = new StateGraph();
  graph.engine = 'lead';
  
  graph
    .addNode('LeadContextGraph', LeadContextGraphNode)
    .addNode('ICPGraph', ICPGraphNode)
    .addNode('LeadSourceGraph', LeadSourceGraphNode)
    .addNode('LeadAcquisitionGraph', LeadAcquisitionGraphNode)
    .addNode('LeadQualificationGraph', LeadQualificationGraphNode)
    .addNode('LeadScoringGraph', LeadScoringGraphNode)
    .addNode('LeadSegmentationGraph', LeadSegmentationGraphNode)
    .addNode('LeadNurturingGraph', LeadNurturingGraphNode)
    .addNode('LeadConversionGraph', LeadConversionGraphNode)
    .addNode('LeadForecastGraph', LeadForecastGraphNode)
    .addNode('LeadRecommendationGraph', LeadRecommendationGraphNode)
    .addNode('ReflectionGraph', LeadReflectionGraphNode)
    .addNode('ExplainabilityGraph', LeadExplainabilityGraphNode);

  return graph;
}
