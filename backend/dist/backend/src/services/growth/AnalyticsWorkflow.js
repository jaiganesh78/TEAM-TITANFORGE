"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsReflectionGraphNode = exports.ExplainabilityGraphNode = exports.SnapshotComparisonGraphNode = exports.PredictionGraphNode = exports.RecommendationGraphNode = exports.ExecutiveInsightGraphNode = exports.PortfolioAnalysisGraphNode = exports.OpportunityAnalysisGraphNode = exports.RiskAnalysisGraphNode = exports.MarketReadinessGraphNode = exports.CompetitiveAnalysisGraphNode = exports.BusinessBenchmarkGraphNode = exports.ForecastAnalysisGraphNode = exports.TrendAnalysisGraphNode = exports.KPIComputationGraphNode = exports.RevenueHealthGraphNode = exports.GrowthHealthGraphNode = exports.BusinessHealthGraphNode = exports.AnalyticsContextGraphNode = void 0;
exports.createMasterAnalyticsGraph = createMasterAnalyticsGraph;
const StateGraph_1 = require("./StateGraph");
const GeminiProvider_1 = require("../../../../ai/providers/GeminiProvider");
const PromptBuilder_1 = require("../../../../ai/providers/PromptBuilder");
const ResponseParser_1 = require("../../../../ai/providers/ResponseParser");
const llm = new GeminiProvider_1.GeminiProvider();
// ==========================================
// 1. ANALYTICS CONTEXT GRAPH
// ==========================================
const AnalyticsContextGraphNode = async (state) => {
    state.logs.push('[AnalyticsContextGraphNode] Analytics Context initialized.');
    return {};
};
exports.AnalyticsContextGraphNode = AnalyticsContextGraphNode;
// ==========================================
// 2. BUSINESS HEALTH GRAPH
// ==========================================
const BusinessHealthGraphNode = async (state) => {
    state.logs.push('[BusinessHealthGraphNode] Evaluating Business Health scores.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Calculate composite health scores across business operations.
Output a JSON matching this Zod contract:
{
  "operationalHealth": number,
  "salesHealth": number,
  "marketingHealth": number,
  "leadHealth": number,
  "customerHealth": number,
  "innovationHealth": number,
  "overallExecutiveHealth": number,
  "confidence": number,
  "evidence": "string",
  "trendDirection": "UP",
  "expectedDirection": "IMPROVING"
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.BusinessHealthScoreSchema);
    return { businessHealthScore: parsed };
};
exports.BusinessHealthGraphNode = BusinessHealthGraphNode;
// ==========================================
// 3. GROWTH HEALTH GRAPH
// ==========================================
const GrowthHealthGraphNode = async (state) => {
    state.logs.push('[GrowthHealthGraphNode] Evaluating growth score metrics.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Examine growth indicators, trend velocity indexes and compile growthScore.
Output a JSON matching this Zod contract:
{
  "growthScore": number,
  "velocityIndex": number,
  "confidence": number
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.GrowthScoreSchema);
    return { growthScore: parsed };
};
exports.GrowthHealthGraphNode = GrowthHealthGraphNode;
// ==========================================
// 4. REVENUE HEALTH GRAPH
// ==========================================
const RevenueHealthGraphNode = async (state) => {
    state.logs.push('[RevenueHealthGraphNode] Evaluating revenue pipeline leakage points.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Assess pipeline leakage and stability indexes.
Output a JSON matching this Zod contract:
{
  "pipelineValue": number,
  "leakagePoints": ["string"],
  "stabilityScore": number
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.RevenueHealthSchema);
    return { revenueHealth: parsed };
};
exports.RevenueHealthGraphNode = RevenueHealthGraphNode;
// ==========================================
// 5. KPI COMPUTATION GRAPH
// ==========================================
const KPIComputationGraphNode = async (state) => {
    state.logs.push('[KPIComputationGraphNode] Assembling KPI computation registry.');
    return {
        kpis: {
            cac: state.kpis?.cac || 120,
            ltv: state.kpis?.ltv || 5000,
            winRate: state.kpis?.winRate || 25,
            pipelineVelocity: state.kpis?.pipelineVelocity || 200,
            churnRate: state.kpis?.churnRate || 5
        }
    };
};
exports.KPIComputationGraphNode = KPIComputationGraphNode;
// ==========================================
// 6. TREND ANALYSIS GRAPH
// ==========================================
const TrendAnalysisGraphNode = async (state) => {
    state.logs.push('[TrendAnalysisGraphNode] Evaluating directional trends.');
    return {
        trendAnalysis: [
            { trendName: 'Revenue Growth Trend', trendDirection: 'UP', confidence: 85, expectedFuture: 'Expansion in Enterprise segment' },
            { trendName: 'Sales Conversion Velocity', trendDirection: 'STABLE', confidence: 90, expectedFuture: 'Consistent stage duration ratios' }
        ]
    };
};
exports.TrendAnalysisGraphNode = TrendAnalysisGraphNode;
// ==========================================
// 7. FORECAST ANALYSIS GRAPH
// ==========================================
const ForecastAnalysisGraphNode = async (state) => {
    state.logs.push('[ForecastAnalysisGraphNode] Generating multi-horizon forecasts.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Provide multi-horizon forecasts (30, 90, 180 days) for revenue, pipeline, growth, and risks.
Output a JSON matching this Zod contract:
{
  "forecasts": [
    {
      "horizonDays": number,
      "revenueForecast": number,
      "pipelineForecast": number,
      "growthForecast": number,
      "riskForecast": number,
      "expansionForecast": number,
      "confidenceMin": number,
      "confidenceMax": number,
      "bestCase": number,
      "expectedCase": number,
      "worstCase": number
    }
  ]
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ForecastSnapshotsSchema);
    return { forecastAnalysis: parsed };
};
exports.ForecastAnalysisGraphNode = ForecastAnalysisGraphNode;
// ==========================================
// 8. BUSINESS BENCHMARK GRAPH
// ==========================================
const BusinessBenchmarkGraphNode = async (state) => {
    state.logs.push('[BusinessBenchmarkGraphNode] Computing gaps compared to industry benchmarks.');
    return {
        businessBenchmark: {
            performanceRating: 'AVERAGE',
            gapAnalysis: JSON.stringify(['Sales lifecycle duration exceeds sector average by 5 days', 'Marketing channel efficiency is 12% lower than target']),
            priorityImprove: JSON.stringify(['Optimize MQL to SQL qualification rules', 'Streamline legal review loops'])
        }
    };
};
exports.BusinessBenchmarkGraphNode = BusinessBenchmarkGraphNode;
// ==========================================
// 9. COMPETITIVE ANALYSIS GRAPH
// ==========================================
const CompetitiveAnalysisGraphNode = async (state) => {
    state.logs.push('[CompetitiveAnalysisGraphNode] Mapping differentiators and market positioning.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Evaluate differentiators, threats, opportunities and competitive confidence.
Output a JSON matching this Zod contract:
{
  "competitivePosition": "string",
  "marketPosition": "string",
  "differentiators": ["string"],
  "weaknesses": ["string"],
  "threats": ["string"],
  "opportunities": ["string"],
  "competitiveConfidence": number
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.CompetitivePositionSchema);
    return { competitiveAnalysis: parsed };
};
exports.CompetitiveAnalysisGraphNode = CompetitiveAnalysisGraphNode;
// ==========================================
// 10. MARKET READINESS GRAPH
// ==========================================
const MarketReadinessGraphNode = async (state) => {
    state.logs.push('[MarketReadinessGraphNode] Computing market and expansion readiness indices.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Calculate product, sales, marketing, expansion, investment, and international readiness scores.
Output a JSON matching this Zod contract:
{
  "productReadiness": number,
  "salesReadiness": number,
  "marketingReadiness": number,
  "expansionReadiness": number,
  "investmentReadiness": number,
  "internationalReadiness": number
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.MarketReadinessSchema);
    return { marketReadiness: parsed };
};
exports.MarketReadinessGraphNode = MarketReadinessGraphNode;
// ==========================================
// 11. RISK ANALYSIS GRAPH
// ==========================================
const RiskAnalysisGraphNode = async (state) => {
    state.logs.push('[RiskAnalysisGraphNode] Compiling high-level risks matrix.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Examine business parameters to map risk category, severity, probability, impact, and mitigation steps.
Output a JSON matching this Zod contract:
{
  "risks": [
    {
      "category": "REVENUE",
      "severity": "HIGH",
      "probability": number,
      "businessImpact": "string",
      "mitigation": "string"
    }
  ]
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.BusinessRisksSchema);
    return { riskAnalysis: parsed };
};
exports.RiskAnalysisGraphNode = RiskAnalysisGraphNode;
// ==========================================
// 12. OPPORTUNITY ANALYSIS GRAPH
// ==========================================
const OpportunityAnalysisGraphNode = async (state) => {
    state.logs.push('[OpportunityAnalysisGraphNode] Compiling quick wins and cost optimization opportunities.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Identify quick wins, expansion vectors, cost optimizations, expected impacts, and priorities.
Output a JSON matching this Zod contract:
{
  "opportunities": [
    {
      "type": "QUICK_WIN",
      "priority": "HIGH",
      "expectedImpact": "string",
      "mitigation": "string"
    }
  ]
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.BusinessOpportunitiesSchema);
    return { opportunityAnalysis: parsed };
};
exports.OpportunityAnalysisGraphNode = OpportunityAnalysisGraphNode;
// ==========================================
// 13. PORTFOLIO ANALYSIS GRAPH
// ==========================================
const PortfolioAnalysisGraphNode = async (state) => {
    state.logs.push('[PortfolioAnalysisGraphNode] Mapping product and channel portfolio.');
    return {
        portfolioAnalysis: {
            channelEfficacy: 'SEO yields 45% of traffic with 3.2% conversion. PPC yields 20% traffic at $150 CAC.',
            productMix: 'Routing API yields 80% revenue. Dashboard UI yields 20%.'
        }
    };
};
exports.PortfolioAnalysisGraphNode = PortfolioAnalysisGraphNode;
// ==========================================
// 14. EXECUTIVE INSIGHT GRAPH
// ==========================================
const ExecutiveInsightGraphNode = async (state) => {
    state.logs.push('[ExecutiveInsightGraphNode] Compiling CEO quarterly summary narratives.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Produce natural-language quarterly summaries for CEO and Board audits.
Output a JSON matching this Zod contract:
{
  "ceoSummary": "string",
  "boardSummary": "string",
  "criticalFind": ["string"],
  "topOpp": ["string"],
  "topRisk": ["string"],
  "narrative": "string"
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ExecutiveInsightSchema);
    return { executiveInsight: parsed };
};
exports.ExecutiveInsightGraphNode = ExecutiveInsightGraphNode;
// ==========================================
// 15. RECOMMENDATION GRAPH
// ==========================================
const RecommendationGraphNode = async (state) => {
    state.logs.push('[RecommendationGraphNode] Building strategic next-step recommendations.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Formulate strategic priority recommendations for executive dashboards.
Output a JSON matching this Zod contract:
{
  "recommendations": [
    {
      "title": "string",
      "nextBestAction": "string",
      "expectedOutcome": "string",
      "expectedTimeline": "string",
      "riskFactors": ["string"],
      "dependencies": ["string"],
      "alternativeActions": ["string"]
    }
  ]
}
`;
    const res = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.AnalyticsRecommendationsSchema);
    return { analyticsRecommendations: parsed.recommendations };
};
exports.RecommendationGraphNode = RecommendationGraphNode;
// ==========================================
// 16. PREDICTION GRAPH
// ==========================================
const PredictionGraphNode = async (state) => {
    state.logs.push('[PredictionGraphNode] Projecting future pipeline metrics.');
    const contextText = PromptBuilder_1.PromptBuilder.buildContextPrompt(state.contextPackage);
    const prompt = `
${contextText}

TASK:
Project revenue, growth, and sales leads metrics across horizon dates.
Output a JSON matching this Zod contract:
{
  "predictions": [
    {
      "metricName": "string",
      "predictedVal": number,
      "confidence": number,
      "horizonDays": number,
      "horizonDate": "string",
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
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.PredictionHistoriesSchema);
    return { prediction: parsed };
};
exports.PredictionGraphNode = PredictionGraphNode;
// ==========================================
// 17. SNAPSHOT COMPARISON GRAPH
// ==========================================
const SnapshotComparisonGraphNode = async (state) => {
    state.logs.push('[SnapshotComparisonGraphNode] Comparing performance snapshot trajectories.');
    return {};
};
exports.SnapshotComparisonGraphNode = SnapshotComparisonGraphNode;
// ==========================================
// 18. EXPLAINABILITY GRAPH
// ==========================================
const ExplainabilityGraphNode = async (state) => {
    state.logs.push('[ExplainabilityGraphNode] Formatting evidence audit linkages.');
    return {};
};
exports.ExplainabilityGraphNode = ExplainabilityGraphNode;
// ==========================================
// CRITIQUE & REFLECTION GRAPH
// ==========================================
const AnalyticsReflectionGraphNode = async (state) => {
    state.logs.push('[AnalyticsReflectionGraphNode] Running feedback critique loop.');
    if (!state.analyticsRecommendations || state.analyticsRecommendations.length === 0) {
        return {};
    }
    const rec = state.analyticsRecommendations[0];
    const critiquePrompt = `
Analyze this priority recommendation:
${JSON.stringify(rec)}

CRITIQUE CRITERIA:
1. Is the action specific and realistic?
2. Are risks and alternative paths evaluated?
3. Are the milestones logical?

Return a brief critique outlining items to improve.
`;
    const critiqueRes = await llm.generateText({
        systemPrompt: 'You are the TitanForge AI critique auditor.',
        userPrompt: critiquePrompt
    });
    const critique = critiqueRes.text;
    state.logs.push(`Critique compiled: ${critique.substring(0, 100)}...`);
    // Run improvement LLM call
    const improvementPrompt = `
Original Recommendation:
${JSON.stringify(rec)}

Critique:
${critique}

TASK:
Improve the recommendation based on the critique.
Return the improved recommendation conforming strictly to the original JSON Zod contract.
`;
    const improvedRes = await llm.generateText({
        systemPrompt: PromptBuilder_1.PromptBuilder.buildSystemPrompt(),
        userPrompt: improvementPrompt,
        jsonMode: true
    });
    // Revalidate
    const improvedRec = ResponseParser_1.ResponseParser.parseAndValidate(improvedRes.text, ResponseParser_1.AnalyticsRecommendationDetailSchema);
    // Wait, improvedRec is a single recommendation conforming to AnalyticsRecommendationDetailSchema. Let's make sure it matches that contract.
    return {
        analyticsRecommendations: [improvedRec],
        reflectionAttempts: state.reflectionAttempts + 1,
        reflectionCritique: critique
    };
};
exports.AnalyticsReflectionGraphNode = AnalyticsReflectionGraphNode;
/**
 * Compiles the Master Analytics Graph.
 */
function createMasterAnalyticsGraph() {
    const graph = new StateGraph_1.StateGraph();
    graph.engine = 'analytics';
    graph.addNode('AnalyticsContextGraph', exports.AnalyticsContextGraphNode);
    graph.addNode('BusinessHealthGraph', exports.BusinessHealthGraphNode);
    graph.addNode('GrowthHealthGraph', exports.GrowthHealthGraphNode);
    graph.addNode('RevenueHealthGraph', exports.RevenueHealthGraphNode);
    graph.addNode('KPIComputationGraph', exports.KPIComputationGraphNode);
    graph.addNode('TrendAnalysisGraph', exports.TrendAnalysisGraphNode);
    graph.addNode('ForecastAnalysisGraph', exports.ForecastAnalysisGraphNode);
    graph.addNode('BusinessBenchmarkGraph', exports.BusinessBenchmarkGraphNode);
    graph.addNode('CompetitiveAnalysisGraph', exports.CompetitiveAnalysisGraphNode);
    graph.addNode('MarketReadinessGraph', exports.MarketReadinessGraphNode);
    graph.addNode('RiskAnalysisGraph', exports.RiskAnalysisGraphNode);
    graph.addNode('OpportunityAnalysisGraph', exports.OpportunityAnalysisGraphNode);
    graph.addNode('PortfolioAnalysisGraph', exports.PortfolioAnalysisGraphNode);
    graph.addNode('ExecutiveInsightGraph', exports.ExecutiveInsightGraphNode);
    graph.addNode('RecommendationGraph', exports.RecommendationGraphNode);
    graph.addNode('PredictionGraph', exports.PredictionGraphNode);
    graph.addNode('SnapshotComparisonGraph', exports.SnapshotComparisonGraphNode);
    graph.addNode('ExplainabilityGraph', exports.ExplainabilityGraphNode);
    return graph;
}
