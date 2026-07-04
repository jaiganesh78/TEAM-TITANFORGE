"use strict";
// SaaS Sector Configuration
// The knowledge backbone for every AI engine when operating on a SaaS business.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaaSSector = void 0;
exports.SaaSSector = {
    slug: 'saas',
    displayName: 'SaaS / Software-as-a-Service',
    description: 'B2B and B2C subscription-based software products delivered via the cloud.',
    businessTerminology: {
        'MRR': 'Monthly Recurring Revenue — predictable monthly subscription income',
        'ARR': 'Annual Recurring Revenue — MRR × 12',
        'Churn': 'Customers who cancel their subscription in a given period',
        'Expansion MRR': 'Additional revenue from upgrades and upsells to existing customers',
        'Net Revenue Retention': 'MRR retained including expansions minus churn',
        'Trial-to-Paid': 'Conversion rate from free trial to paying customer',
        'CAC Payback Period': 'Months to recover customer acquisition cost',
        'DAU/MAU': 'Daily vs Monthly Active User ratio — engagement indicator',
        'Feature Adoption': 'Percentage of users using key product features'
    },
    kpiSlugs: ['mrr', 'cac', 'ltv', 'ltv_cac_ratio', 'churn_rate', 'retention_rate', 'roas', 'conversion_rate', 'nps'],
    requiredDiscoveryDomains: ['MARKETING', 'SALES', 'CUSTOMER_SUCCESS', 'PRODUCT_PORTFOLIO', 'GROWTH_METRICS'],
    marketingChannels: ['Content Marketing', 'SEO/SEM', 'LinkedIn Ads', 'Product Hunt', 'G2/Capterra', 'Email Nurture', 'Partner Integrations', 'Developer Communities'],
    leadGenerationChannels: ['Inbound Content', 'Free Trial', 'Freemium', 'Demo Requests', 'Referral Programs', 'API/Integration Listings'],
    salesProcessSteps: ['Lead Qualification', 'Discovery Call', 'Product Demo', 'Technical Evaluation', 'Proposal', 'Security Review', 'Contract Negotiation', 'Closed Won'],
    customerSuccessMetrics: ['Time-to-Value', 'Feature Adoption Rate', 'DAU/MAU', 'Support Ticket Volume', 'Health Score', 'NPS', 'Expansion Rate'],
    competitiveDimensions: ['Pricing model', 'Feature set', 'Integration ecosystem', 'Support quality', 'Security certifications', 'Scalability', 'Ease of onboarding'],
    questionPriorities: { 'fin_burn_rate': 95, 'sal_conversion_rate': 90, 'mk_cac': 95, 'cs_churn_rate': 95, 'mk_ad_spend': 80 },
    growthConstraints: ['High CAC payback period', 'Trial conversion below 5%', 'Churn exceeding 3% monthly', 'Sales cycle over 90 days', 'Low product activation rate'],
    businessLifecycle: {
        stages: [
            { name: 'Pre-Launch', focus: 'Problem validation and MVP', kpi: 'Customer interviews', milestone: '10 design partners' },
            { name: 'Early Stage', focus: 'Product-market fit', kpi: 'Retention & NPS', milestone: '$10K MRR' },
            { name: 'Growth', focus: 'Scalable acquisition', kpi: 'CAC & Payback', milestone: '$100K MRR' },
            { name: 'Scale', focus: 'Expansion and retention', kpi: 'NRR > 120%', milestone: '$1M ARR' },
            { name: 'Enterprise', focus: 'Segment dominance', kpi: 'Market share', milestone: '$10M ARR' }
        ]
    },
    customerJourney: {
        stages: [
            { name: 'Awareness', touchpoints: ['Blog', 'G2/Capterra', 'LinkedIn Ads'], metric: 'Organic traffic' },
            { name: 'Consideration', touchpoints: ['Demo request', 'Free trial sign-up', 'Comparison pages'], metric: 'Trial sign-up rate' },
            { name: 'Decision', touchpoints: ['Demo call', 'Pricing page', 'Security review'], metric: 'Demo-to-close rate' },
            { name: 'Onboarding', touchpoints: ['Setup wizard', 'CS call', 'Email sequence'], metric: 'Activation rate' },
            { name: 'Adoption', touchpoints: ['In-app prompts', 'Training materials', 'Webinars'], metric: 'Feature adoption' },
            { name: 'Advocacy', touchpoints: ['NPS survey', 'Referral program', 'Case studies'], metric: 'NPS & referrals' }
        ]
    },
    marketingFunnel: {
        stages: [
            { name: 'TOFU — Awareness', channels: ['SEO', 'LinkedIn', 'Content'], metric: 'Organic visits', benchmark: '50K/month at scale' },
            { name: 'MOFU — Consideration', channels: ['Retargeting', 'Email', 'Webinars'], metric: 'Lead capture rate', benchmark: '3-5%' },
            { name: 'BOFU — Decision', channels: ['Sales calls', 'Demo emails', 'Competitor comparison'], metric: 'Demo conversion', benchmark: '15-25%' }
        ]
    },
    salesFunnel: {
        stages: [
            { name: 'MQL', criteria: 'Marketing qualified — meets ICP + engagement signal' },
            { name: 'SQL', criteria: 'Sales qualified — confirmed budget, authority, need, timeline' },
            { name: 'Opportunity', criteria: 'Discovery completed, proposal stage' },
            { name: 'Closed Won', criteria: 'Contract signed, payment received' }
        ],
        avgCycleDays: 45,
        benchmarkWinRate: 22
    },
    commonPainPoints: [
        'High churn destroying MRR growth',
        'CAC payback period over 18 months',
        'Poor trial-to-paid conversion',
        'Long enterprise sales cycles',
        'Low feature adoption leading to churn',
        'Difficulty communicating ROI to buyers'
    ],
    buyingBehaviour: {
        decisionMakers: ['CTO', 'VP Engineering', 'Head of Operations', 'CFO'],
        avgDecisionTimeWeeks: 4,
        keyBuyingFactors: ['Integration fit', 'Security', 'ROI proof', 'Support quality', 'Pricing flexibility'],
        commonObjections: ['"We built it internally"', '"Too expensive"', '"Not integrated with X"', '"Need more security review"']
    },
    commonRisks: [
        'Over-reliance on a single customer (>20% revenue)',
        'Tech debt blocking feature velocity',
        'Competitor product parity',
        'Investor funding gap',
        'Key person dependency'
    ],
    typicalKpis: ['mrr', 'ltv_cac_ratio', 'churn_rate', 'nps', 'conversion_rate'],
    typicalCompetitors: {
        competitionStyle: 'Feature parity + pricing wars. Established players defend with ecosystem lock-in.',
        watchSignals: ['New VC-backed entrants', 'Big Tech feature clones', 'Open-source alternatives']
    },
    growthBottlenecks: [
        'Poor onboarding → low activation → early churn',
        'No referral loop → 100% paid acquisition dependency',
        'Sales-marketing misalignment on ICP',
        'Pricing not reflecting customer value',
        'No expansion revenue motion'
    ],
    typicalAIOpportunities: [
        'AI-generated onboarding personalisation',
        'Churn prediction from usage signals',
        'Automated ICP lead scoring',
        'AI-written customer success plays',
        'Pricing optimisation from usage data'
    ],
    futureAIPromptTemplates: {
        'strategy-engine': 'You are a B2B SaaS growth strategist. The business has {mrr} MRR and {ltv_cac_ratio} LTV:CAC ratio. Identify the top 3 strategic priorities for the next 90 days.',
        'marketing-engine': 'You are a SaaS marketing expert. The business uses {marketingChannels}. Current ROAS is {roas}. Recommend channel optimisation.',
        'lead-generation-engine': 'You are a B2B SaaS demand generation expert. ICP is {icpDefinition}. Design a lead generation system targeting {customerSegments}.',
        'sales-engine': 'You are a SaaS sales coach. Win rate is {winRate}% and sales cycle is {salesCycleDays} days. Identify the top 3 friction points.',
        'customer-success-engine': 'You are a SaaS customer success expert. Churn rate is {churnRate}%. Identify the top churn signals and mitigation strategies.',
        'analytics-engine': 'Analyse the unit economics: CAC={cac}, LTV={ltv}, MRR={mrr}. Identify the most critical metric to improve.'
    },
    isActive: true
};
