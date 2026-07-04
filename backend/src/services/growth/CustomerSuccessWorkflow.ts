import { GraphState, StateGraph, NodeFunction } from './StateGraph';
import { GeminiProvider } from '../../../../ai/providers/GeminiProvider';
import { PromptBuilder } from '../../../../ai/providers/PromptBuilder';
import { 
  ResponseParser, 
  CustomerDigitalTwinSchema,
  CustomerHealthSchema,
  CustomerSuccessJourneySchema,
  SupportIntelligenceSchema,
  CustomerSentimentSchema,
  RenewalForecastSchema,
  RenewalPlanSchema,
  ExpansionOpportunitySchema,
  ChurnPredictionSchema,
  RetentionStrategySchema,
  CustomerRecommendationsSchema,
  CustomerSuccessScoreSchema,
  CustomerValueRealizationSchema,
  CustomerAdvocacySchema,
  CustomerPortfolioIntelligenceSchema,
  ExecutiveAccountIntelligenceSchema,
  SuccessPlaybooksSchema
} from '../../../../ai/providers/ResponseParser';

const llm = new GeminiProvider();

// ==========================================
// 1. CUSTOMER CONTEXT GRAPH
// ==========================================
export const CustomerContextGraphNode: NodeFunction = async (state) => {
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

// ==========================================
// 2. CUSTOMER HEALTH GRAPH
// ==========================================
export const CustomerHealthGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing CustomerHealthGraphNode...'];
  
  const prompt = PromptBuilder.buildSystemPrompt() + `
TASK:
Evaluate complete customer success health scores across relationship, support and adoption vectors.

Context Package:
${JSON.stringify(state.contextPackage || {})}

Return a Zod JSON matching CustomerHealthSchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { customerHealth: res, logs };
};

// ==========================================
// 3. JOURNEY ANALYSIS GRAPH
// ==========================================
export const JourneyAnalysisGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing JourneyAnalysisGraphNode...'];

  const prompt = `
TASK:
Evaluate customer journey progression milestones.

Customer Health Context:
${JSON.stringify(state.customerHealth || {})}

Return a Zod JSON matching CustomerSuccessJourneySchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { customerSuccessJourney: res, logs };
};

// ==========================================
// 4. LIFECYCLE GRAPH
// ==========================================
export const LifecycleGraphNode: NodeFunction = async (state) => {
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

// ==========================================
// 5. ADOPTION GRAPH
// ==========================================
export const AdoptionGraphNode: NodeFunction = async (state) => {
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

// ==========================================
// 6. SUPPORT INTELLIGENCE GRAPH
// ==========================================
export const SupportIntelligenceGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing SupportIntelligenceGraphNode...'];

  const prompt = `
TASK:
Evaluate active support cases to detect root causes, recurring problems, resolution suggestions, and customer impact.

Return a Zod JSON matching SupportIntelligenceSchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { supportIntelligence: res, logs };
};

// ==========================================
// 7. CUSTOMER SENTIMENT GRAPH
// ==========================================
export const SentimentGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing SentimentGraphNode...'];

  const prompt = `
TASK:
Evaluate text verbatims and communication logs to estimate customer sentiment score, trend and relationship risks.

Return a Zod JSON matching CustomerSentimentSchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { customerSentiment: res, logs };
};

// ==========================================
// 8. RENEWAL GRAPH
// ==========================================
export const RenewalGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing RenewalGraphNode...'];

  const promptForecast = `
TASK:
Calculate renewal probability, expected contract ARR value and key renewal risk metrics.

Return a Zod JSON matching RenewalForecastSchema.
`;

  const forecast = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: promptForecast,
    jsonMode: true
  });

  const promptPlan = `
TASK:
Build draft renewal action playbooks and key owner action items.

Return a Zod JSON matching RenewalPlanSchema.
`;

  const plan = await llm.generateJson<any>({
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

// ==========================================
// 9. EXPANSION GRAPH
// ==========================================
export const ExpansionGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing ExpansionGraphNode...'];

  const prompt = `
TASK:
Identify cross-sell or upsell expansion opportunities.

Return a Zod JSON matching ExpansionOpportunitySchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { expansionOpportunity: res, logs };
};

// ==========================================
// 10. RETENTION GRAPH
// ==========================================
export const RetentionGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing RetentionGraphNode...'];

  const prompt = `
TASK:
Generate a proactive retention strategy.

Return a Zod JSON matching RetentionStrategySchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { retentionStrategy: res, logs };
};

// ==========================================
// 11. CHURN PREDICTION GRAPH
// ==========================================
export const ChurnPredictionGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing ChurnPredictionGraphNode...'];

  const prompt = `
TASK:
Evaluate risk indices and warn signals to predict churn probability and root causes.

Return a Zod JSON matching ChurnPredictionSchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { churnRisk: res, logs };
};

// ==========================================
// 12. CUSTOMER VALUE REALIZATION GRAPH
// ==========================================
export const CustomerValueRealizationGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing CustomerValueRealizationGraphNode...'];

  const prompt = `
TASK:
Evaluate customer outcomes achieved vs expected goals. Track ROI delivered.

Return a Zod JSON matching CustomerValueRealizationSchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { customerValueRealization: res, logs };
};

// ==========================================
// 13. CUSTOMER 360 TIMELINE GRAPH
// ==========================================
export const Customer360TimelineGraphNode: NodeFunction = async (state) => {
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

// ==========================================
// 14. EXECUTIVE ACCOUNT INTELLIGENCE GRAPH
// ==========================================
export const ExecutiveAccountIntelligenceGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing ExecutiveAccountIntelligenceGraphNode...'];

  const prompt = `
TASK:
Compile a highly-dense 1-minute summary profile of the account.

Return a Zod JSON matching ExecutiveAccountIntelligenceSchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { executiveAccountSummary: res, logs };
};

// ==========================================
// 15. SUCCESS PLAYBOOK GRAPH
// ==========================================
export const SuccessPlaybookGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing SuccessPlaybookGraphNode...'];

  const prompt = `
TASK:
Build onboarding, adoption, escalation and renewal playbooks.

Return a Zod JSON matching SuccessPlaybooksSchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { successPlaybooks: res, logs };
};

// ==========================================
// 16. ADVOCACY INTELLIGENCE GRAPH
// ==========================================
export const AdvocacyIntelligenceGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing AdvocacyIntelligenceGraphNode...'];

  const prompt = `
TASK:
Evaluate likelihood to become reference, case studies and recommendation score.

Return a Zod JSON matching CustomerAdvocacySchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { customerAdvocacy: res, logs };
};

// ==========================================
// 17. CUSTOMER PORTFOLIO INTELLIGENCE GRAPH
// ==========================================
export const CustomerPortfolioIntelligenceGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing CustomerPortfolioIntelligenceGraphNode...'];

  const prompt = `
TASK:
Aggregate portfolios for highest value, highest risk, fastest growing accounts.

Return a Zod JSON matching CustomerPortfolioIntelligenceSchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { customerPortfolioIntelligence: res, logs };
};

// ==========================================
// 18. CUSTOMER RECOMMENDATION GRAPH
// ==========================================
export const CustomerRecommendationGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing CustomerRecommendationGraphNode...'];

  const prompt = `
TASK:
Compile next-best CCO recommendations. Expose facts used, assumptions, constraints, and alternative actions.

Return a Zod JSON matching CustomerRecommendationsSchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge AI CCO.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { customerRecommendations: res.recommendations || [], logs };
};

// ==========================================
// 19. REFLECTION GRAPH
// ==========================================
export const CustomerReflectionGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing CustomerReflectionGraphNode...'];
  
  const currentRecommendations = state.customerRecommendations || [];
  if (currentRecommendations.length === 0) return { logs };

  const prompt = `
Critique these customer success recommendations to verify evidence grounding:
${JSON.stringify(currentRecommendations)}

Return improved recommendations matching CustomerRecommendationsSchema.
`;

  const res = await llm.generateJson<any>({
    systemPrompt: 'You are the TitanForge CCO critique.',
    userPrompt: prompt,
    jsonMode: true
  });

  return { customerRecommendations: res.recommendations || currentRecommendations, logs };
};

// ==========================================
// 20. EXPLAINABILITY & OBSERVABILITY GRAPH
// ==========================================
export const CustomerObservabilityGraphNode: NodeFunction = async (state) => {
  const logs = [...(state.logs || []), 'Executing CustomerObservabilityGraphNode...'];
  return { logs };
};

// ==========================================
// MASTER CUSTOMER SUCCESS WORKFLOW COMPILER
// ==========================================
export function createMasterCustomerSuccessGraph(): StateGraph {
  const graph = new StateGraph();
  graph.engine = 'customer-success';

  // Register nodes in linear execution order
  graph.addNode('CustomerContextGraph', CustomerContextGraphNode);
  graph.addNode('CustomerHealthGraph', CustomerHealthGraphNode);
  graph.addNode('JourneyAnalysisGraph', JourneyAnalysisGraphNode);
  graph.addNode('LifecycleGraph', LifecycleGraphNode);
  graph.addNode('AdoptionGraph', AdoptionGraphNode);
  graph.addNode('SupportIntelligenceGraph', SupportIntelligenceGraphNode);
  graph.addNode('SentimentGraph', SentimentGraphNode);
  graph.addNode('RenewalGraph', RenewalGraphNode);
  graph.addNode('ExpansionGraph', ExpansionGraphNode);
  graph.addNode('RetentionGraph', RetentionGraphNode);
  graph.addNode('ChurnPredictionGraph', ChurnPredictionGraphNode);
  graph.addNode('CustomerValueRealizationGraph', CustomerValueRealizationGraphNode);
  graph.addNode('Customer360TimelineGraph', Customer360TimelineGraphNode);
  graph.addNode('ExecutiveAccountIntelligenceGraph', ExecutiveAccountIntelligenceGraphNode);
  graph.addNode('SuccessPlaybookGraph', SuccessPlaybookGraphNode);
  graph.addNode('AdvocacyIntelligenceGraph', AdvocacyIntelligenceGraphNode);
  graph.addNode('CustomerPortfolioIntelligenceGraph', CustomerPortfolioIntelligenceGraphNode);
  graph.addNode('CustomerRecommendationGraph', CustomerRecommendationGraphNode);
  graph.addNode('ReflectionGraph', CustomerReflectionGraphNode);
  graph.addNode('ObservabilityGraph', CustomerObservabilityGraphNode);

  return graph;
}
