"use strict";
// Engine Contracts
// Defines the I/O contracts for all 6 Growth AI engines.
// No implementation — architecture only.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_ENGINE_CONTRACTS = exports.CustomerSuccessEngineContract = exports.AnalyticsEngineContract = exports.SalesEngineContract = exports.LeadGenerationEngineContract = exports.MarketingEngineContract = exports.StrategyEngineContract = void 0;
exports.getEngineContract = getEngineContract;
// ================================================================
// STRATEGY ENGINE
// ================================================================
exports.StrategyEngineContract = {
    id: 'strategy-engine',
    displayName: 'Strategy Engine',
    description: 'Synthesizes all business knowledge to generate strategic recommendations, priority actions, and growth roadmaps.',
    version: '0.1.0-contract',
    responsibilities: [
        'Identify the highest-leverage growth opportunities',
        'Generate a prioritized strategic action plan',
        'Evaluate business model viability',
        'Identify and score business risks',
        'Produce a SWOT analysis from Digital Twin data',
        'Align goals with available resources'
    ],
    requiredInputs: [
        'GrowthTwinSummary',
        'BusinessIdentity',
        'BusinessGoals',
        'BusinessConstraints',
        'GrowthDomainState[BUSINESS_FOUNDATION]',
        'GrowthDomainState[MARKET_POSITION]',
        'GrowthDomainState[BUSINESS_GOALS]',
        'GrowthDomainState[BUSINESS_CONSTRAINTS]',
        'GrowthDomainState[RISKS]'
    ],
    optionalInputs: [
        'GrowthDomainState[COMPETITORS]',
        'GrowthDomainState[GROWTH_OPPORTUNITIES]',
        'SectorConfig',
        'KPI[ltv_cac_ratio]',
        'KPI[mrr]'
    ],
    produces: [
        'StrategicPriorityList',
        'SWOTAnalysis',
        'GrowthRoadmap',
        'RiskMitigationPlan'
    ],
    consumes: [
        'BusinessDigitalTwin',
        'GrowthDigitalTwin',
        'KnowledgeChunks[BUSINESS_FOUNDATION,MARKET_POSITION,BUSINESS_GOALS]'
    ],
    writesTo: ['AIOperatingContext'],
    readsFrom: ['Business', 'GrowthDomainState', 'GrowthTwinSummary', 'KnowledgeChunk', 'ContextSnapshot'],
    knowledgeDependencies: ['BUSINESS_FOUNDATION', 'MARKET_POSITION', 'BUSINESS_GOALS', 'BUSINESS_CONSTRAINTS', 'RISKS'],
    requiredContext: ['businessStage', 'sectorSlug', 'businessModelType'],
    requiredKpis: ['ltv_cac_ratio', 'mrr'],
    confidenceRequirements: { minimum: 40, recommended: 65 },
    failureConditions: [
        'Overall growth twin confidence below 40%',
        'BUSINESS_FOUNDATION domain has no current state',
        'No business goals defined',
        'Digital Twin identity incomplete'
    ],
    escalationRules: [
        'If confidence < recommended, mark all outputs as DRAFT',
        'If conflicting goals detected, surface for human resolution',
        'If critical risks identified, halt and alert user'
    ],
    futureDebateParticipants: ['marketing-engine', 'sales-engine', 'analytics-engine'],
    supportedDomains: ['BUSINESS_FOUNDATION', 'MARKET_POSITION', 'BRAND_POSITIONING', 'BUSINESS_GOALS', 'BUSINESS_CONSTRAINTS', 'RISKS', 'GROWTH_OPPORTUNITIES'],
    futureAIProvider: 'gemini-2.5-pro'
};
// ================================================================
// MARKETING ENGINE
// ================================================================
exports.MarketingEngineContract = {
    id: 'marketing-engine',
    displayName: 'Marketing Engine',
    description: 'Analyses marketing data to optimise channel mix, messaging, positioning, and campaign strategy.',
    version: '0.1.0-contract',
    responsibilities: [
        'Analyse marketing channel performance',
        'Optimise ad spend allocation',
        'Generate positioning and messaging recommendations',
        'Identify untapped customer acquisition channels',
        'Build brand positioning framework'
    ],
    requiredInputs: [
        'GrowthDomainState[MARKETING]',
        'GrowthDomainState[CUSTOMER_SEGMENTS]',
        'GrowthDomainState[BRAND_POSITIONING]',
        'MarketingProfile',
        'CustomerSegment[]'
    ],
    optionalInputs: [
        'GrowthDomainState[CUSTOMER_PERSONAS]',
        'GrowthDomainState[COMPETITORS]',
        'KPI[roas]',
        'KPI[cac]',
        'KPI[conversion_rate]',
        'KPI[marketing_attribution]',
        'SectorConfig.marketingChannels'
    ],
    produces: [
        'ChannelAllocationRecommendation',
        'MessagingFramework',
        'BrandPositioningReport',
        'CampaignStrategy'
    ],
    consumes: ['GrowthDomainState[MARKETING,CUSTOMER_SEGMENTS]', 'KnowledgeChunks[MARKETING]'],
    writesTo: ['AIOperatingContext'],
    readsFrom: ['MarketingProfile', 'GrowthDomainState', 'CustomerSegment', 'KnowledgeChunk'],
    knowledgeDependencies: ['MARKETING', 'CUSTOMER_SEGMENTS', 'BRAND_POSITIONING'],
    requiredContext: ['sectorSlug', 'marketingChannels'],
    requiredKpis: ['roas', 'cac', 'conversion_rate', 'marketing_attribution'],
    confidenceRequirements: { minimum: 45, recommended: 70 },
    failureConditions: [
        'No marketing channel data available',
        'Customer segments not defined',
        'Brand positioning domain confidence below 20%'
    ],
    escalationRules: [
        'If ROAS < criticalRange, escalate to Strategy Engine',
        'If no marketing channels identified, request user input'
    ],
    futureDebateParticipants: ['strategy-engine', 'lead-generation-engine', 'analytics-engine'],
    supportedDomains: ['MARKETING', 'BRAND_POSITIONING', 'CUSTOMER_SEGMENTS', 'CUSTOMER_PERSONAS'],
    futureAIProvider: 'gemini-2.5-pro'
};
// ================================================================
// LEAD GENERATION ENGINE
// ================================================================
exports.LeadGenerationEngineContract = {
    id: 'lead-generation-engine',
    displayName: 'Lead Generation Engine',
    description: 'Designs and optimises lead generation strategies, ICP targeting, and inbound/outbound funnel architecture.',
    version: '0.1.0-contract',
    responsibilities: [
        'Define Ideal Customer Profile (ICP)',
        'Identify high-quality lead generation channels',
        'Design lead qualification framework',
        'Optimise top-of-funnel conversion',
        'Analyse lead source performance'
    ],
    requiredInputs: [
        'GrowthDomainState[LEAD_GENERATION]',
        'GrowthDomainState[CUSTOMER_PERSONAS]',
        'GrowthDomainState[CUSTOMER_SEGMENTS]',
        'SalesProfile'
    ],
    optionalInputs: [
        'GrowthDomainState[MARKETING]',
        'KPI[lead_quality_score]',
        'KPI[cac]',
        'KPI[conversion_rate]',
        'SectorConfig.leadGenerationChannels'
    ],
    produces: [
        'ICPDefinition',
        'LeadScoringFramework',
        'ChannelPriorityList',
        'FunnelOptimisationPlan'
    ],
    consumes: ['GrowthDomainState[LEAD_GENERATION,CUSTOMER_PERSONAS]', 'KnowledgeChunks[LEAD_GENERATION]'],
    writesTo: ['AIOperatingContext'],
    readsFrom: ['CustomerPersona', 'CustomerSegment', 'GrowthDomainState', 'SalesProfile'],
    knowledgeDependencies: ['LEAD_GENERATION', 'CUSTOMER_PERSONAS', 'CUSTOMER_SEGMENTS'],
    requiredContext: ['sectorSlug', 'businessModelType'],
    requiredKpis: ['lead_quality_score', 'cac', 'conversion_rate'],
    confidenceRequirements: { minimum: 40, recommended: 65 },
    failureConditions: [
        'No customer persona data',
        'Customer segments not defined',
        'Lead generation domain has no state'
    ],
    escalationRules: [
        'If lead quality score critically low, escalate to Marketing Engine',
        'If no lead channels identified, request sector config review'
    ],
    futureDebateParticipants: ['marketing-engine', 'sales-engine'],
    supportedDomains: ['LEAD_GENERATION', 'CUSTOMER_PERSONAS', 'CUSTOMER_SEGMENTS'],
    futureAIProvider: 'gemini-2.5-pro'
};
// ================================================================
// SALES ENGINE
// ================================================================
exports.SalesEngineContract = {
    id: 'sales-engine',
    displayName: 'Sales Engine',
    description: 'Optimises sales process, pipeline management, win rate improvement, and deal velocity.',
    version: '0.1.0-contract',
    responsibilities: [
        'Analyse sales pipeline health',
        'Identify deal velocity bottlenecks',
        'Recommend sales process improvements',
        'Design sales playbook framework',
        'Optimise pricing and packaging strategy'
    ],
    requiredInputs: [
        'GrowthDomainState[SALES]',
        'GrowthDomainState[PRICING]',
        'SalesProfile',
        'CustomerSegment[]'
    ],
    optionalInputs: [
        'GrowthDomainState[COMPETITORS]',
        'GrowthDomainState[PRODUCT_PORTFOLIO]',
        'KPI[win_rate]',
        'KPI[pipeline_velocity]',
        'KPI[aov]',
        'SectorConfig.salesProcessSteps'
    ],
    produces: [
        'SalesPlaybook',
        'PipelineHealthReport',
        'DealVelocityAnalysis',
        'PricingRecommendation'
    ],
    consumes: ['SalesProfile', 'GrowthDomainState[SALES,PRICING]', 'KnowledgeChunks[SALES]'],
    writesTo: ['AIOperatingContext'],
    readsFrom: ['SalesProfile', 'ProductPortfolio', 'GrowthDomainState', 'CustomerSegment'],
    knowledgeDependencies: ['SALES', 'PRICING', 'PRODUCT_PORTFOLIO', 'CUSTOMER_SEGMENTS'],
    requiredContext: ['businessModelType', 'sectorSlug'],
    requiredKpis: ['win_rate', 'pipeline_velocity', 'aov'],
    confidenceRequirements: { minimum: 45, recommended: 65 },
    failureConditions: [
        'No sales profile data',
        'Pricing domain has no current state',
        'No product or service data'
    ],
    escalationRules: [
        'If win rate critically low, escalate to Strategy Engine',
        'If pipeline value zero, request CRM data connection'
    ],
    futureDebateParticipants: ['marketing-engine', 'lead-generation-engine', 'strategy-engine'],
    supportedDomains: ['SALES', 'PRICING', 'PRODUCT_PORTFOLIO', 'COMPETITORS'],
    futureAIProvider: 'gemini-2.5-pro'
};
// ================================================================
// ANALYTICS ENGINE
// ================================================================
exports.AnalyticsEngineContract = {
    id: 'analytics-engine',
    displayName: 'Analytics Engine',
    description: 'Calculates, tracks, and interprets all business KPIs. The single source of truth for metric intelligence.',
    version: '0.1.0-contract',
    responsibilities: [
        'Calculate all Growth KPIs from available data',
        'Track KPI trends and anomalies',
        'Compute LTV:CAC and unit economics',
        'Generate KPI health status reports',
        'Identify metric correlations and leading indicators'
    ],
    requiredInputs: [
        'GrowthDomainState[GROWTH_METRICS]',
        'RevenueProfile',
        'MarketingProfile',
        'SalesProfile'
    ],
    optionalInputs: [
        'GrowthDomainState[MARKETING]',
        'GrowthDomainState[SALES]',
        'GrowthDomainState[CUSTOMER_SUCCESS]',
        'BusinessKPI[]'
    ],
    produces: [
        'KPIHealthReport',
        'UnitEconomicsAnalysis',
        'TrendAnalysis',
        'AnomalyAlerts'
    ],
    consumes: ['RevenueProfile', 'MarketingProfile', 'SalesProfile', 'BusinessKPI[]'],
    writesTo: ['AIOperatingContext', 'BusinessKPI'],
    readsFrom: ['RevenueProfile', 'MarketingProfile', 'SalesProfile', 'GrowthDomainState', 'BusinessKPI'],
    knowledgeDependencies: ['GROWTH_METRICS', 'MARKETING', 'SALES', 'CUSTOMER_SUCCESS'],
    requiredContext: ['sectorSlug', 'businessStage'],
    requiredKpis: ['ltv', 'cac', 'ltv_cac_ratio', 'mrr', 'roas'],
    confidenceRequirements: { minimum: 50, recommended: 75 },
    failureConditions: [
        'No revenue profile data',
        'Insufficient KPI inputs to calculate core metrics',
        'Growth metrics domain confidence below 30%'
    ],
    escalationRules: [
        'If LTV:CAC critically low, escalate to Strategy Engine immediately',
        'If MRR declining 2+ months, alert user'
    ],
    futureDebateParticipants: ['strategy-engine', 'marketing-engine', 'sales-engine'],
    supportedDomains: ['GROWTH_METRICS', 'MARKETING', 'SALES', 'CUSTOMER_SUCCESS', 'PRICING'],
    futureAIProvider: 'gemini-2.5-flash'
};
// ================================================================
// CUSTOMER SUCCESS ENGINE
// ================================================================
exports.CustomerSuccessEngineContract = {
    id: 'customer-success-engine',
    displayName: 'Customer Success Engine',
    description: 'Drives retention, expansion revenue, NPS improvement, and churn reduction strategies.',
    version: '0.1.0-contract',
    responsibilities: [
        'Identify churn risk signals and patterns',
        'Design customer success playbooks',
        'Optimise onboarding and time-to-value',
        'Generate NPS improvement strategies',
        'Identify expansion and upsell opportunities'
    ],
    requiredInputs: [
        'GrowthDomainState[CUSTOMER_SUCCESS]',
        'GrowthDomainState[CUSTOMER_SEGMENTS]',
        'GrowthDomainState[CUSTOMER_PERSONAS]'
    ],
    optionalInputs: [
        'GrowthDomainState[PRODUCT_PORTFOLIO]',
        'KPI[retention_rate]',
        'KPI[churn_rate]',
        'KPI[nps]',
        'KPI[repeat_purchase_rate]',
        'KPI[ltv]',
        'SectorConfig.customerSuccessMetrics'
    ],
    produces: [
        'RetentionPlaybook',
        'ChurnRiskReport',
        'ExpansionOpportunityList',
        'OnboardingOptimisationPlan'
    ],
    consumes: ['CustomerSegment[]', 'GrowthDomainState[CUSTOMER_SUCCESS]', 'KnowledgeChunks[CUSTOMER_SUCCESS]'],
    writesTo: ['AIOperatingContext'],
    readsFrom: ['CustomerSegment', 'CustomerPersona', 'GrowthDomainState', 'KnowledgeChunk'],
    knowledgeDependencies: ['CUSTOMER_SUCCESS', 'CUSTOMER_SEGMENTS', 'CUSTOMER_PERSONAS'],
    requiredContext: ['sectorSlug', 'businessModelType'],
    requiredKpis: ['retention_rate', 'churn_rate', 'nps', 'ltv'],
    confidenceRequirements: { minimum: 40, recommended: 65 },
    failureConditions: [
        'No customer segment data',
        'Customer success domain has no current state',
        'No customer personas defined'
    ],
    escalationRules: [
        'If churn rate critical, escalate to Strategy Engine',
        'If NPS negative, halt expansion recommendations'
    ],
    futureDebateParticipants: ['strategy-engine', 'sales-engine', 'analytics-engine'],
    supportedDomains: ['CUSTOMER_SUCCESS', 'CUSTOMER_SEGMENTS', 'CUSTOMER_PERSONAS'],
    futureAIProvider: 'gemini-2.5-pro'
};
// Registry
exports.ALL_ENGINE_CONTRACTS = [
    exports.StrategyEngineContract,
    exports.MarketingEngineContract,
    exports.LeadGenerationEngineContract,
    exports.SalesEngineContract,
    exports.AnalyticsEngineContract,
    exports.CustomerSuccessEngineContract
];
function getEngineContract(id) {
    return exports.ALL_ENGINE_CONTRACTS.find(e => e.id === id);
}
