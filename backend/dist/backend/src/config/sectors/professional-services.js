"use strict";
// Professional Services Sector Configuration
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalServicesSector = void 0;
exports.ProfessionalServicesSector = {
    slug: 'professional-services',
    displayName: 'Professional Services',
    description: 'Consulting, law, accounting, agency, and advisory businesses selling expertise and time.',
    businessTerminology: {
        'Utilisation Rate': 'Percentage of billable hours vs total hours available',
        'Realization Rate': 'Percentage of billed hours actually collected as revenue',
        'Retainer': 'Pre-paid ongoing engagement at fixed monthly rate',
        'Project Revenue': 'One-time project-based income',
        'Pipeline Value': 'Total value of active proposals in progress',
        'Win Rate': 'Percentage of proposals that convert to signed contracts',
        'NPS': 'Net Promoter Score — probability clients recommend the firm'
    },
    kpiSlugs: ['cac', 'ltv', 'ltv_cac_ratio', 'win_rate', 'pipeline_velocity', 'nps', 'retention_rate'],
    requiredDiscoveryDomains: ['SALES', 'CUSTOMER_SEGMENTS', 'BRAND_POSITIONING', 'PRICING', 'GROWTH_METRICS'],
    marketingChannels: ['Referral network', 'LinkedIn', 'Thought leadership content', 'Speaking events', 'Podcasts', 'Case studies', 'Awards & rankings'],
    leadGenerationChannels: ['Referrals', 'LinkedIn outreach', 'Speaking engagements', 'Content marketing', 'Strategic partnerships', 'PR'],
    salesProcessSteps: ['Initial inquiry', 'Discovery meeting', 'Scope definition', 'Proposal submission', 'Negotiation', 'Contract signed', 'Kickoff'],
    customerSuccessMetrics: ['Project delivery on time', 'Client NPS', 'Reference-ability score', 'Repeat engagement rate', 'Scope change frequency'],
    competitiveDimensions: ['Expertise depth', 'Track record', 'Team seniority', 'Industry specialisation', 'Pricing', 'Speed to deliver', 'Network'],
    questionPriorities: { 'sal_conversion_rate': 95, 'fin_burn_rate': 80, 'mk_cac': 70 },
    growthConstraints: ['Reliance on referrals with no systematic pipeline', 'Capacity constraints limiting growth', 'Single key person dependency', 'Low retainer vs project ratio'],
    businessLifecycle: {
        stages: [
            { name: 'Solo/Boutique', focus: 'Reputation and first clients', kpi: 'Revenue per client', milestone: '$10K/month revenue' },
            { name: 'Established', focus: 'Repeatable delivery', kpi: 'Utilisation rate', milestone: '5 concurrent clients' },
            { name: 'Growth', focus: 'Scaling beyond founder', kpi: 'Win rate & pipeline', milestone: '$50K/month revenue' },
            { name: 'Scale', focus: 'Market positioning', kpi: 'NPS & referrals', milestone: '$1M/year revenue' }
        ]
    },
    customerJourney: {
        stages: [
            { name: 'Awareness', touchpoints: ['Referral', 'LinkedIn post', 'Speaking event'], metric: 'Inbound inquiries' },
            { name: 'Evaluation', touchpoints: ['Discovery call', 'Case studies', 'Credentials review'], metric: 'Proposal request rate' },
            { name: 'Selection', touchpoints: ['Proposal', 'Pricing discussion', 'Reference calls'], metric: 'Win rate' },
            { name: 'Engagement', touchpoints: ['Project delivery', 'Status updates', 'Reviews'], metric: 'Client satisfaction' },
            { name: 'Expansion', touchpoints: ['Retainer offer', 'New project', 'Referral request'], metric: 'Repeat & referral rate' }
        ]
    },
    marketingFunnel: {
        stages: [
            { name: 'Authority Building', channels: ['Content', 'Speaking', 'LinkedIn'], metric: 'Inbound inquiries', benchmark: '5-10/month at scale' },
            { name: 'Lead Capture', channels: ['Website', 'LinkedIn contact', 'Referral intro'], metric: 'Discovery call rate', benchmark: '60-80% of inquiries' },
            { name: 'Conversion', channels: ['Proposal', 'Reference calls'], metric: 'Proposal win rate', benchmark: '30-50%' }
        ]
    },
    salesFunnel: {
        stages: [
            { name: 'Lead', criteria: 'Initial inquiry received' },
            { name: 'Discovery', criteria: 'Discovery call completed, fit confirmed' },
            { name: 'Proposal', criteria: 'Formal proposal submitted' },
            { name: 'Negotiation', criteria: 'Pricing and scope under discussion' },
            { name: 'Closed', criteria: 'Contract signed' }
        ],
        avgCycleDays: 30,
        benchmarkWinRate: 35
    },
    commonPainPoints: ['Referral-only pipeline creates feast-or-famine cycles', 'Pricing below market value', 'Difficult to scale past founder capacity', 'Long payment cycles'],
    buyingBehaviour: {
        decisionMakers: ['CEO', 'Managing Director', 'CFO', 'Department Head'],
        avgDecisionTimeWeeks: 3,
        keyBuyingFactors: ['Trust and reputation', 'Relevant case studies', 'Team expertise', 'Pricing', 'Cultural fit'],
        commonObjections: ['"Too expensive"', '"Can we hire someone internally?"', '"We tried consultants before and it didn\'t work"']
    },
    commonRisks: ['Key person dependency', 'Client concentration risk', 'Feast-or-famine revenue cycles', 'Scope creep on fixed-price projects'],
    typicalKpis: ['win_rate', 'pipeline_velocity', 'ltv', 'nps', 'retention_rate'],
    typicalCompetitors: { competitionStyle: 'Relationship and trust-based. Reputation is the moat.', watchSignals: ['Offshore alternatives', 'AI automation tools', 'Large firm expansion into SMB'] },
    growthBottlenecks: ['No systematic lead generation beyond referrals', 'Underpricing relative to value delivered', 'No retainer model', 'Low referral activation rate'],
    typicalAIOpportunities: ['AI-assisted proposal generation', 'Client health scoring', 'Automated follow-up sequences', 'Knowledge base from past projects'],
    futureAIPromptTemplates: {
        'strategy-engine': 'You are a professional services growth strategist. The firm has {clientCount} clients and {utilizationRate}% utilisation. Identify the top 3 strategic priorities.',
        'marketing-engine': 'You are a professional services marketing expert. Current leads come {leadSources}. Build a systematic demand generation strategy.',
        'lead-generation-engine': 'You are a professional services business development expert. Design a referral activation and outbound system for {targetSegment}.',
        'sales-engine': 'You are a professional services sales expert. Win rate is {winRate}% on {proposalCount} proposals. Improve the conversion strategy.',
        'customer-success-engine': 'You are a client success expert. Repeat engagement rate is {repeatRate}%. Design a client expansion playbook.',
        'analytics-engine': 'Analyse the firm financials: pipeline value=${pipelineValue}, win rate={winRate}%, avg deal size=${avgDealSize}. Identify revenue growth opportunities.'
    },
    isActive: true
};
