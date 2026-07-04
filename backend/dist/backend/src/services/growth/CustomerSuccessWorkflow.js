"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerObservabilityGraphNode = exports.CustomerReflectionGraphNode = exports.CustomerRecommendationGraphNode = exports.CustomerPortfolioIntelligenceGraphNode = exports.AdvocacyIntelligenceGraphNode = exports.SuccessPlaybookGraphNode = exports.ExecutiveAccountIntelligenceGraphNode = exports.Customer360TimelineGraphNode = exports.CustomerValueRealizationGraphNode = exports.ChurnPredictionGraphNode = exports.RetentionGraphNode = exports.ExpansionGraphNode = exports.RenewalGraphNode = exports.SentimentGraphNode = exports.SupportIntelligenceGraphNode = exports.AdoptionGraphNode = exports.LifecycleGraphNode = exports.JourneyAnalysisGraphNode = exports.CustomerHealthGraphNode = exports.CustomerContextGraphNode = void 0;
exports.createMasterCustomerSuccessGraph = createMasterCustomerSuccessGraph;
const StateGraph_1 = require("./StateGraph");
const GeminiProvider_1 = require("../../../../ai/providers/GeminiProvider");
const PromptBuilder_1 = require("../../../../ai/providers/PromptBuilder");
const llm = new GeminiProvider_1.GeminiProvider();
// ==========================================
// 1. CUSTOMER CONTEXT GRAPH
// ==========================================
const CustomerContextGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing CustomerContextGraphNode...'];
    // Gathers context information from Lead/Sales models
    const contextPackage = {
        businessId: state.businessId,
        sessionId: state.sessionId,
        timestamp: new Date().toISOString(),
        salesAssetsUsed: ['Enterprise Logistics Expansion Playbook'],
        revenueIntelligenceUsed: ['Pipeline Velocity: 120 USD/day', 'Stability score: 87%']
    };
    return { contextPackage, logs };
};
exports.CustomerContextGraphNode = CustomerContextGraphNode;
// ==========================================
// 2. CUSTOMER HEALTH GRAPH
// ==========================================
const CustomerHealthGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing CustomerHealthGraphNode...'];
    const prompt = PromptBuilder_1.PromptBuilder.buildSystemPrompt() + `
TASK:
Evaluate complete customer success health scores across relationship, support and adoption vectors.

Context Package:
${JSON.stringify(state.contextPackage || {})}

Return a Zod JSON matching CustomerHealthSchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { customerHealth: res, logs };
};
exports.CustomerHealthGraphNode = CustomerHealthGraphNode;
// ==========================================
// 3. JOURNEY ANALYSIS GRAPH
// ==========================================
const JourneyAnalysisGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing JourneyAnalysisGraphNode...'];
    const prompt = `
TASK:
Evaluate customer journey progression milestones.

Customer Health Context:
${JSON.stringify(state.customerHealth || {})}

Return a Zod JSON matching CustomerSuccessJourneySchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { customerSuccessJourney: res, logs };
};
exports.JourneyAnalysisGraphNode = JourneyAnalysisGraphNode;
// ==========================================
// 4. LIFECYCLE GRAPH
// ==========================================
const LifecycleGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing LifecycleGraphNode...'];
    return {
        customerLifecycle: {
            lifecycleState: 'ACTIVE',
            totalDaysActive: 45,
            onboardingDate: new Date(Date.now() - 45 * 86400000).toISOString(),
            lastActiveDate: new Date().toISOString()
        },
        logs
    };
};
exports.LifecycleGraphNode = LifecycleGraphNode;
// ==========================================
// 5. ADOPTION GRAPH
// ==========================================
const AdoptionGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing AdoptionGraphNode...'];
    return {
        customerAdoption: {
            activeModules: ['routing_api', 'dispatch_dashboard'],
            dailyApiQueries: 4500,
            monthlyActiveUsers: 24,
            featureUsageRates: {
                telemetry: 88.0,
                edge_scheduling: 45.0
            }
        },
        logs
    };
};
exports.AdoptionGraphNode = AdoptionGraphNode;
// ==========================================
// 6. SUPPORT INTELLIGENCE GRAPH
// ==========================================
const SupportIntelligenceGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing SupportIntelligenceGraphNode...'];
    const prompt = `
TASK:
Evaluate active support cases to detect root causes, recurring problems, resolution suggestions, and customer impact.

Return a Zod JSON matching SupportIntelligenceSchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { supportIntelligence: res, logs };
};
exports.SupportIntelligenceGraphNode = SupportIntelligenceGraphNode;
// ==========================================
// 7. CUSTOMER SENTIMENT GRAPH
// ==========================================
const SentimentGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing SentimentGraphNode...'];
    const prompt = `
TASK:
Evaluate text verbatims and communication logs to estimate customer sentiment score, trend and relationship risks.

Return a Zod JSON matching CustomerSentimentSchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { customerSentiment: res, logs };
};
exports.SentimentGraphNode = SentimentGraphNode;
// ==========================================
// 8. RENEWAL GRAPH
// ==========================================
const RenewalGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing RenewalGraphNode...'];
    const promptForecast = `
TASK:
Calculate renewal probability, expected contract ARR value and key renewal risk metrics.

Return a Zod JSON matching RenewalForecastSchema.
`;
    const forecast = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: promptForecast,
        jsonMode: true
    });
    const promptPlan = `
TASK:
Build draft renewal action playbooks and key owner action items.

Return a Zod JSON matching RenewalPlanSchema.
`;
    const plan = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: promptPlan,
        jsonMode: true
    });
    return {
        renewalForecast: forecast,
        renewalPlan: plan,
        logs
    };
};
exports.RenewalGraphNode = RenewalGraphNode;
// ==========================================
// 9. EXPANSION GRAPH
// ==========================================
const ExpansionGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing ExpansionGraphNode...'];
    const prompt = `
TASK:
Identify cross-sell or upsell expansion opportunities.

Return a Zod JSON matching ExpansionOpportunitySchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { expansionOpportunity: res, logs };
};
exports.ExpansionGraphNode = ExpansionGraphNode;
// ==========================================
// 10. RETENTION GRAPH
// ==========================================
const RetentionGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing RetentionGraphNode...'];
    const prompt = `
TASK:
Generate a proactive retention strategy.

Return a Zod JSON matching RetentionStrategySchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { retentionStrategy: res, logs };
};
exports.RetentionGraphNode = RetentionGraphNode;
// ==========================================
// 11. CHURN PREDICTION GRAPH
// ==========================================
const ChurnPredictionGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing ChurnPredictionGraphNode...'];
    const prompt = `
TASK:
Evaluate risk indices and warn signals to predict churn probability and root causes.

Return a Zod JSON matching ChurnPredictionSchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { churnRisk: res, logs };
};
exports.ChurnPredictionGraphNode = ChurnPredictionGraphNode;
// ==========================================
// 12. CUSTOMER VALUE REALIZATION GRAPH
// ==========================================
const CustomerValueRealizationGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing CustomerValueRealizationGraphNode...'];
    const prompt = `
TASK:
Evaluate customer outcomes achieved vs expected goals. Track ROI delivered.

Return a Zod JSON matching CustomerValueRealizationSchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { customerValueRealization: res, logs };
};
exports.CustomerValueRealizationGraphNode = CustomerValueRealizationGraphNode;
// ==========================================
// 13. CUSTOMER 360 TIMELINE GRAPH
// ==========================================
const Customer360TimelineGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing Customer360TimelineGraphNode...'];
    // Creates chronological history log list
    const historyTimeline = [
        {
            timestamp: new Date(Date.now() - 45 * 86400000).toISOString(),
            engine: 'lead-engine',
            event: 'Onboarding session initialized',
            evidence: 'CS agent onboarding workbook upload checkoff',
            confidence: 90.0,
            impact: 'Successful account activation parameters configured'
        },
        {
            timestamp: new Date(Date.now() - 15 * 86400000).toISOString(),
            engine: 'sales-engine',
            event: 'Enterprise Logistics cross-sell fit identified',
            evidence: 'director level email inquiry on telematics features',
            confidence: 85.0,
            impact: '20,000 ARR potential identified'
        },
        {
            timestamp: new Date().toISOString(),
            engine: 'customer-success-engine',
            event: 'API Latency optimization outcomes validated',
            evidence: 'Staging response latency reduced 12%',
            confidence: 95.0,
            impact: 'Value delivered score maximized'
        }
    ];
    return { customer360Timeline: historyTimeline, logs };
};
exports.Customer360TimelineGraphNode = Customer360TimelineGraphNode;
// ==========================================
// 14. EXECUTIVE ACCOUNT INTELLIGENCE GRAPH
// ==========================================
const ExecutiveAccountIntelligenceGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing ExecutiveAccountIntelligenceGraphNode...'];
    const prompt = `
TASK:
Compile a highly-dense 1-minute summary profile of the account.

Return a Zod JSON matching ExecutiveAccountIntelligenceSchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { executiveAccountSummary: res, logs };
};
exports.ExecutiveAccountIntelligenceGraphNode = ExecutiveAccountIntelligenceGraphNode;
// ==========================================
// 15. SUCCESS PLAYBOOK GRAPH
// ==========================================
const SuccessPlaybookGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing SuccessPlaybookGraphNode...'];
    const prompt = `
TASK:
Build onboarding, adoption, escalation and renewal playbooks.

Return a Zod JSON matching SuccessPlaybooksSchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { successPlaybooks: res, logs };
};
exports.SuccessPlaybookGraphNode = SuccessPlaybookGraphNode;
// ==========================================
// 16. ADVOCACY INTELLIGENCE GRAPH
// ==========================================
const AdvocacyIntelligenceGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing AdvocacyIntelligenceGraphNode...'];
    const prompt = `
TASK:
Evaluate likelihood to become reference, case studies and recommendation score.

Return a Zod JSON matching CustomerAdvocacySchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { customerAdvocacy: res, logs };
};
exports.AdvocacyIntelligenceGraphNode = AdvocacyIntelligenceGraphNode;
// ==========================================
// 17. CUSTOMER PORTFOLIO INTELLIGENCE GRAPH
// ==========================================
const CustomerPortfolioIntelligenceGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing CustomerPortfolioIntelligenceGraphNode...'];
    const prompt = `
TASK:
Aggregate portfolios for highest value, highest risk, fastest growing accounts.

Return a Zod JSON matching CustomerPortfolioIntelligenceSchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { customerPortfolioIntelligence: res, logs };
};
exports.CustomerPortfolioIntelligenceGraphNode = CustomerPortfolioIntelligenceGraphNode;
// ==========================================
// 18. CUSTOMER RECOMMENDATION GRAPH
// ==========================================
const CustomerRecommendationGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing CustomerRecommendationGraphNode...'];
    const prompt = `
TASK:
Compile next-best CCO recommendations. Expose facts used, assumptions, constraints, and alternative actions.

Return a Zod JSON matching CustomerRecommendationsSchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge AI CCO.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { customerRecommendations: res.recommendations || [], logs };
};
exports.CustomerRecommendationGraphNode = CustomerRecommendationGraphNode;
// ==========================================
// 19. REFLECTION GRAPH
// ==========================================
const CustomerReflectionGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing CustomerReflectionGraphNode...'];
    const currentRecommendations = state.customerRecommendations || [];
    if (currentRecommendations.length === 0)
        return { logs };
    const prompt = `
Critique these customer success recommendations to verify evidence grounding:
${JSON.stringify(currentRecommendations)}

Return improved recommendations matching CustomerRecommendationsSchema.
`;
    const res = await llm.generateJson({
        systemPrompt: 'You are the TitanForge CCO critique.',
        userPrompt: prompt,
        jsonMode: true
    });
    return { customerRecommendations: res.recommendations || currentRecommendations, logs };
};
exports.CustomerReflectionGraphNode = CustomerReflectionGraphNode;
// ==========================================
// 20. EXPLAINABILITY & OBSERVABILITY GRAPH
// ==========================================
const CustomerObservabilityGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing CustomerObservabilityGraphNode...'];
    return { logs };
};
exports.CustomerObservabilityGraphNode = CustomerObservabilityGraphNode;
// ==========================================
// MASTER CUSTOMER SUCCESS WORKFLOW COMPILER
// ==========================================
function createMasterCustomerSuccessGraph() {
    const graph = new StateGraph_1.StateGraph();
    graph.engine = 'customer-success';
    // Register nodes in linear execution order
    graph.addNode('CustomerContextGraph', exports.CustomerContextGraphNode);
    graph.addNode('CustomerHealthGraph', exports.CustomerHealthGraphNode);
    graph.addNode('JourneyAnalysisGraph', exports.JourneyAnalysisGraphNode);
    graph.addNode('LifecycleGraph', exports.LifecycleGraphNode);
    graph.addNode('AdoptionGraph', exports.AdoptionGraphNode);
    graph.addNode('SupportIntelligenceGraph', exports.SupportIntelligenceGraphNode);
    graph.addNode('SentimentGraph', exports.SentimentGraphNode);
    graph.addNode('RenewalGraph', exports.RenewalGraphNode);
    graph.addNode('ExpansionGraph', exports.ExpansionGraphNode);
    graph.addNode('RetentionGraph', exports.RetentionGraphNode);
    graph.addNode('ChurnPredictionGraph', exports.ChurnPredictionGraphNode);
    graph.addNode('CustomerValueRealizationGraph', exports.CustomerValueRealizationGraphNode);
    graph.addNode('Customer360TimelineGraph', exports.Customer360TimelineGraphNode);
    graph.addNode('ExecutiveAccountIntelligenceGraph', exports.ExecutiveAccountIntelligenceGraphNode);
    graph.addNode('SuccessPlaybookGraph', exports.SuccessPlaybookGraphNode);
    graph.addNode('AdvocacyIntelligenceGraph', exports.AdvocacyIntelligenceGraphNode);
    graph.addNode('CustomerPortfolioIntelligenceGraph', exports.CustomerPortfolioIntelligenceGraphNode);
    graph.addNode('CustomerRecommendationGraph', exports.CustomerRecommendationGraphNode);
    graph.addNode('ReflectionGraph', exports.CustomerReflectionGraphNode);
    graph.addNode('ObservabilityGraph', exports.CustomerObservabilityGraphNode);
    return graph;
}
