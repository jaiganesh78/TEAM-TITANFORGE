"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTION_LIBRARY = void 0;
exports.QUESTION_LIBRARY = [
    // IDENTITY
    {
        id: 'id_legal_name',
        title: 'Company Legal Name',
        description: 'The registered legal name of the entity.',
        type: 'text',
        category: 'identity',
        weight: 10,
        dbPath: 'identity.legalName',
        validation: { required: true },
        industrySupport: ['*'],
        stageSupport: ['*'],
        priority: 'CRITICAL',
        optional: false
    },
    {
        id: 'id_trade_name',
        title: 'Trade Name / Brand Name',
        description: 'The public-facing brand name of your business (if different from legal name).',
        type: 'text',
        category: 'identity',
        weight: 5,
        dbPath: 'identity.tradeName',
        validation: { required: false },
        industrySupport: ['*'],
        stageSupport: ['*'],
        priority: 'MEDIUM',
        optional: true
    },
    {
        id: 'id_founded_year',
        title: 'Founded Year',
        description: 'The year your business was officially registered or launched.',
        type: 'number',
        category: 'identity',
        weight: 5,
        dbPath: 'identity.foundedYear',
        validation: { required: false, min: 1800, max: 2100 },
        industrySupport: ['*'],
        stageSupport: ['*'],
        priority: 'MEDIUM',
        optional: true
    },
    {
        id: 'id_hq',
        title: 'Headquarters Location',
        description: 'City and country of your primary business headquarters.',
        type: 'text',
        category: 'identity',
        weight: 5,
        dbPath: 'identity.headquarters',
        validation: { required: false },
        industrySupport: ['*'],
        stageSupport: ['*'],
        priority: 'LOW',
        optional: true
    },
    {
        id: 'id_desc',
        title: 'Identity Description',
        description: 'A brief summary of what your business does.',
        type: 'text',
        category: 'identity',
        weight: 8,
        dbPath: 'identity.description',
        validation: { required: true },
        industrySupport: ['*'],
        stageSupport: ['*'],
        priority: 'HIGH',
        optional: false
    },
    // MODEL
    {
        id: 'model_type',
        title: 'Business Model Type',
        description: 'Select the primary model class for your operation.',
        type: 'select',
        category: 'model',
        weight: 10,
        dbPath: 'model.type',
        validation: { required: true },
        options: ['SaaS', 'Restaurant', 'Retail', 'Manufacturing', 'Healthcare', 'Education', 'Agency', 'Agriculture', 'Logistics'],
        industrySupport: ['*'],
        stageSupport: ['*'],
        priority: 'CRITICAL',
        optional: false
    },
    {
        id: 'model_val_prop',
        title: 'Core Value Proposition',
        description: 'What unique value does your business deliver to customers?',
        type: 'text',
        category: 'model',
        weight: 10,
        dbPath: 'model.valueProposition',
        validation: { required: true },
        industrySupport: ['*'],
        stageSupport: ['*'],
        priority: 'CRITICAL',
        optional: false
    },
    // MARKETING
    {
        id: 'mkt_ad_spend',
        title: 'Monthly Marketing Ad Spend ($)',
        description: 'Total monthly spend on direct advertisements (Meta, Google, etc.).',
        type: 'number',
        category: 'marketing',
        weight: 8,
        dbPath: 'marketingProfile.adSpend',
        validation: { required: false, min: 0 },
        industrySupport: ['SaaS', 'Retail', 'Agency'],
        stageSupport: ['*'],
        priority: 'HIGH',
        optional: true
    },
    {
        id: 'mkt_roi',
        title: 'Ad Return on Investment (ROI)',
        description: 'Average ROI multiplier from direct marketing ads (e.g., 2.5).',
        type: 'number',
        category: 'marketing',
        weight: 5,
        dbPath: 'marketingProfile.roi',
        validation: { required: false, min: 0 },
        dependencies: [
            { questionId: 'mkt_ad_spend', condition: 'greater_than', value: 0 }
        ],
        industrySupport: ['SaaS', 'Retail', 'Agency'],
        stageSupport: ['*'],
        priority: 'MEDIUM',
        optional: true
    },
    // SALES
    {
        id: 'sales_leads',
        title: 'Monthly Leads Count',
        description: 'Average number of new sales leads generated per month.',
        type: 'number',
        category: 'sales',
        weight: 8,
        dbPath: 'salesProfile.leadsCount',
        validation: { required: false, min: 0 },
        industrySupport: ['SaaS', 'Agency', 'Logistics'],
        stageSupport: ['*'],
        priority: 'HIGH',
        optional: true
    },
    {
        id: 'sales_conv_rate',
        title: 'Lead Conversion Rate (%)',
        description: 'Percentage of leads that successfully close as customers.',
        type: 'number',
        category: 'sales',
        weight: 8,
        dbPath: 'salesProfile.conversionRate',
        validation: { required: false, min: 0, max: 100 },
        industrySupport: ['SaaS', 'Agency', 'Logistics'],
        stageSupport: ['*'],
        priority: 'HIGH',
        optional: true
    },
    // OPERATIONS
    {
        id: 'ops_infra_cost',
        title: 'Monthly Tech Infrastructure Cost ($)',
        description: 'Hosting, SaaS licenses, cloud resources and software spend.',
        type: 'number',
        category: 'operations',
        weight: 8,
        dbPath: 'operationsProfile.infraCost',
        validation: { required: false, min: 0 },
        industrySupport: ['SaaS', 'Education', 'Agency'],
        stageSupport: ['*'],
        priority: 'HIGH',
        optional: true
    },
    {
        id: 'ops_bottlenecks',
        title: 'Key Operational Bottlenecks',
        description: 'Briefly describe your main friction point in delivery.',
        type: 'text',
        category: 'operations',
        weight: 6,
        dbPath: 'operationsProfile.bottlenecks',
        validation: { required: false },
        industrySupport: ['*'],
        stageSupport: ['*'],
        priority: 'MEDIUM',
        optional: true
    },
    // TECHNOLOGY
    {
        id: 'tech_provider',
        title: 'Primary Cloud Infrastructure Provider',
        description: 'E.g., AWS, GCP, Azure, Vercel, or On-Premises.',
        type: 'text',
        category: 'technology',
        weight: 6,
        dbPath: 'technologyProfile.infraProvider',
        validation: { required: false },
        industrySupport: ['SaaS', 'Education'],
        stageSupport: ['*'],
        priority: 'MEDIUM',
        optional: true
    },
    // FINANCE
    {
        id: 'fin_burn_rate',
        title: 'Monthly Burn Rate ($)',
        description: 'Your average total monthly cash outflows.',
        type: 'number',
        category: 'finance',
        weight: 10,
        dbPath: 'operationsProfile.infraCost', // Simple map for mock sync logic representation
        validation: { required: true, min: 0 },
        industrySupport: ['*'],
        stageSupport: ['*'],
        priority: 'CRITICAL',
        optional: false
    }
];
