"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesExplainabilityGraphNode = exports.SalesReflectionGraphNode = exports.NextBestActionGraphNode = exports.SalesForecastGraphNode = exports.RevenueOptimizationGraphNode = exports.DealRiskGraphNode = exports.ProposalStrategyGraphNode = exports.ObjectionHandlingGraphNode = exports.NegotiationStrategyGraphNode = exports.SalesPlaybookGraphNode = exports.BuyingCommitteeGraphNode = exports.DealQualificationGraphNode = exports.OpportunityAnalysisGraphNode = exports.SalesContextGraphNode = void 0;
exports.createMasterSalesGraph = createMasterSalesGraph;
const StateGraph_1 = require("./StateGraph");
const GeminiProvider_1 = require("../../../../ai/providers/GeminiProvider");
const PromptBuilder_1 = require("../../../../ai/providers/PromptBuilder");
const ResponseParser_1 = require("../../../../ai/providers/ResponseParser");
const llm = new GeminiProvider_1.GeminiProvider();
// ==========================================
// 1. SALES CONTEXT GRAPH
// ==========================================
const SalesContextGraphNode = async (state) => {
    state.logs.push('[SalesContextGraphNode] Sales Context initialized.');
    return {};
};
exports.SalesContextGraphNode = SalesContextGraphNode;
// ==========================================
// 2. OPPORTUNITY ANALYSIS GRAPH
// ==========================================
const OpportunityAnalysisGraphNode = async (state) => {
    state.logs.push('[OpportunityAnalysisGraphNode] Analyzing deal pipeline opportunities.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.OpportunityAnalysisSchema);
    return { opportunityAnalysis: parsed };
};
exports.OpportunityAnalysisGraphNode = OpportunityAnalysisGraphNode;
// ==========================================
// 3. DEAL QUALIFICATION GRAPH
// ==========================================
const DealQualificationGraphNode = async (state) => {
    state.logs.push('[DealQualificationGraphNode] Evaluating deal qualifications and health scores.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.DealQualificationsSchema);
    return { dealQualification: parsed };
};
exports.DealQualificationGraphNode = DealQualificationGraphNode;
// ==========================================
// 4. BUYING COMMITTEE GRAPH
// ==========================================
const BuyingCommitteeGraphNode = async (state) => {
    state.logs.push('[BuyingCommitteeGraphNode] Mapping buying committee stakeholder alignments.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.BuyingCommitteeSchema);
    return { buyingCommittee: parsed };
};
exports.BuyingCommitteeGraphNode = BuyingCommitteeGraphNode;
// ==========================================
// 5. SALES PLAYBOOK GRAPH
// ==========================================
const SalesPlaybookGraphNode = async (state) => {
    state.logs.push('[SalesPlaybookGraphNode] Structuring playbook rules and frameworks.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.SalesPlaybooksSchema);
    return { salesPlaybooks: parsed.playbooks };
};
exports.SalesPlaybookGraphNode = SalesPlaybookGraphNode;
// ==========================================
// 6. NEGOTIATION STRATEGY GRAPH
// ==========================================
const NegotiationStrategyGraphNode = async (state) => {
    state.logs.push('[NegotiationStrategyGraphNode] Devising pricing flexibility and concessions.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.NegotiationStrategySchema);
    return { negotiationStrategy: parsed };
};
exports.NegotiationStrategyGraphNode = NegotiationStrategyGraphNode;
// ==========================================
// 7. OBJECTION HANDLING GRAPH
// ==========================================
const ObjectionHandlingGraphNode = async (state) => {
    state.logs.push('[ObjectionHandlingGraphNode] Resolving anticipated pricing and integration objections.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ObjectionHandlingSchema);
    return { objectionHandling: parsed };
};
exports.ObjectionHandlingGraphNode = ObjectionHandlingGraphNode;
// ==========================================
// 8. PROPOSAL STRATEGY GRAPH
// ==========================================
const ProposalStrategyGraphNode = async (state) => {
    state.logs.push('[ProposalStrategyGraphNode] Structuring case studies and ROI narratives.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ProposalStrategySchema);
    return { proposalStrategy: parsed };
};
exports.ProposalStrategyGraphNode = ProposalStrategyGraphNode;
// ==========================================
// 9. DEAL RISK GRAPH
// ==========================================
const DealRiskGraphNode = async (state) => {
    state.logs.push('[DealRiskGraphNode] Evaluating deal risk factors.');
    return {};
};
exports.DealRiskGraphNode = DealRiskGraphNode;
// ==========================================
// 10. REVENUE OPTIMIZATION GRAPH
// ==========================================
const RevenueOptimizationGraphNode = async (state) => {
    state.logs.push('[RevenueOptimizationGraphNode] Scouting renewal and account expansion pathways.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.RevenueOptimizationSchema);
    return { revenueOptimization: parsed };
};
exports.RevenueOptimizationGraphNode = RevenueOptimizationGraphNode;
// ==========================================
// 11. SALES FORECAST GRAPH
// ==========================================
const SalesForecastGraphNode = async (state) => {
    state.logs.push('[SalesForecastGraphNode] Projecting pipeline revenues and close probabilities.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.SalesForecastSchema);
    return { salesForecast: parsed };
};
exports.SalesForecastGraphNode = SalesForecastGraphNode;
// ==========================================
// 12. NEXT BEST ACTION GRAPH
// ==========================================
const NextBestActionGraphNode = async (state) => {
    state.logs.push('[NextBestActionGraphNode] Formulating next best action checklists.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.NextBestActionSchema);
    return { nextBestAction: parsed };
};
exports.NextBestActionGraphNode = NextBestActionGraphNode;
// ==========================================
// 13. REFLECTION GRAPH (Critique Loop)
// ==========================================
const SalesReflectionGraphNode = async (state) => {
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: initialRecommendationsPrompt,
        jsonMode: true
    });
    let parsedRecommendations = ResponseParser_1.ResponseParser.parseAndValidate(initialRes.text, ResponseParser_1.SalesRecommendationsSchema).recommendations;
    let attempts = 0;
    const maxAttempts = 2;
    const confidenceThreshold = 85;
    while (attempts < maxAttempts) {
        attempts++;
        state.logs.push(`[SalesReflectionGraphNode] Iteration #${attempts}`);
        if (parsedRecommendations.length === 0)
            break;
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
            systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
            userPrompt: improvementPrompt,
            jsonMode: true
        });
        const improvedRec = ResponseParser_1.ResponseParser.parseAndValidate(improvedRes.text, ResponseParser_1.SalesRecommendationDetailSchema);
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
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: scoresPrompt,
        jsonMode: true
    });
    const parsedScores = ResponseParser_1.ResponseParser.parseAndValidate(scoresRes.text, ResponseParser_1.ExecutiveScoresSchema);
    return {
        salesRecommendations: parsedRecommendations,
        executiveScores: parsedScores,
        reflectionAttempts: attempts
    };
};
exports.SalesReflectionGraphNode = SalesReflectionGraphNode;
// ==========================================
// 14. EXPLAINABILITY GRAPH
// ==========================================
const SalesExplainabilityGraphNode = async (state) => {
    state.logs.push('[SalesExplainabilityGraphNode] Bundling grounding fact traces.');
    return {};
};
exports.SalesExplainabilityGraphNode = SalesExplainabilityGraphNode;
// ==========================================
// MASTER SALES GRAPH ORCHESTRATOR
// ==========================================
function createMasterSalesGraph() {
    const graph = new StateGraph_1.StateGraph();
    graph.engine = 'sales';
    graph
        .addNode('SalesContextGraph', exports.SalesContextGraphNode)
        .addNode('OpportunityAnalysisGraph', exports.OpportunityAnalysisGraphNode)
        .addNode('DealQualificationGraph', exports.DealQualificationGraphNode)
        .addNode('BuyingCommitteeGraph', exports.BuyingCommitteeGraphNode)
        .addNode('SalesPlaybookGraph', exports.SalesPlaybookGraphNode)
        .addNode('NegotiationStrategyGraph', exports.NegotiationStrategyGraphNode)
        .addNode('ObjectionHandlingGraph', exports.ObjectionHandlingGraphNode)
        .addNode('ProposalStrategyGraph', exports.ProposalStrategyGraphNode)
        .addNode('DealRiskGraph', exports.DealRiskGraphNode)
        .addNode('RevenueOptimizationGraph', exports.RevenueOptimizationGraphNode)
        .addNode('SalesForecastGraph', exports.SalesForecastGraphNode)
        .addNode('NextBestActionGraph', exports.NextBestActionGraphNode)
        .addNode('ReflectionGraph', exports.SalesReflectionGraphNode)
        .addNode('ExplainabilityGraph', exports.SalesExplainabilityGraphNode);
    return graph;
}
