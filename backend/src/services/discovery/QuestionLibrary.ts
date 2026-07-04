export type GrowthDomainKey =
  | 'BUSINESS_FOUNDATION' | 'MARKET_POSITION' | 'BRAND_POSITIONING'
  | 'PRODUCT_PORTFOLIO' | 'CUSTOMER_SEGMENTS' | 'CUSTOMER_PERSONAS'
  | 'MARKETING' | 'LEAD_GENERATION' | 'SALES' | 'CUSTOMER_SUCCESS'
  | 'COMPETITORS' | 'PRICING' | 'GROWTH_METRICS' | 'BUSINESS_GOALS'
  | 'BUSINESS_CONSTRAINTS' | 'RISKS' | 'GROWTH_OPPORTUNITIES';

export interface LibraryQuestion {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  category: string;
  weight: number;
  dbPath: string; // e.g. 'identity.legalName', 'marketingProfile.adSpend'
  validation?: {
    required: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  options?: string[]; // for type: 'select'
  dependencies?: {
    questionId: string;
    condition: 'equals' | 'greater_than' | 'exists';
    value: any;
  }[];
  industrySupport: string[]; // e.g. ['SaaS', 'Restaurant', '*']
  stageSupport: string[];    // e.g. ['MVP', 'GROWTH', '*']
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  optional: boolean;
  aiNotes?: string;

  // Sprint 6 — Growth Digital Twin metadata
  // All new fields are optional with defaults for backward compatibility
  businessDomain?: string;              // e.g. 'marketing', 'sales', 'identity'
  growthDomain?: GrowthDomainKey;       // e.g. 'MARKETING', 'LEAD_GENERATION'
  relatedKpiSlug?: string;              // e.g. 'cac', 'ltv'
  relatedEngine?: string;               // e.g. 'marketing-engine', 'sales-engine'
  expectedBusinessValue?: string;       // Human-readable description of value
  discoveryPriority?: number;           // 1-100 ordinal ranking (overrides priority enum)
  confidenceImpact?: number;            // 0.0-1.0 contribution to domain confidence
  whyItMatters?: string;               // Discovery explanation for users
  businessImpact?: string;             // What becomes possible after answering
  futureAIPromptNotes?: string;        // Notes for future AI questioning system
}

export const QUESTION_LIBRARY: LibraryQuestion[] = [
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
    optional: false,
    businessDomain: 'identity',
    growthDomain: 'BUSINESS_FOUNDATION',
    expectedBusinessValue: 'Required for all business operations and contracts.',
    discoveryPriority: 100,
    confidenceImpact: 0.3,
    whyItMatters: 'Without the legal name, no AI engine can reference the business correctly.',
    businessImpact: 'Unlocks all identity-dependent AI recommendations.'
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
    optional: true,
    businessDomain: 'brand',
    growthDomain: 'BRAND_POSITIONING',
    discoveryPriority: 70,
    confidenceImpact: 0.2,
    whyItMatters: 'Brand name drives all marketing positioning and messaging.',
    businessImpact: 'Enables Marketing Engine to craft on-brand messaging.'
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
    optional: true,
    businessDomain: 'identity',
    growthDomain: 'BUSINESS_FOUNDATION',
    discoveryPriority: 50,
    confidenceImpact: 0.1,
    whyItMatters: 'Establishes the tenure and maturity stage of the business.',
    businessImpact: 'Aids Strategy Engine in adjusting growth recommendations for age/stability.'
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
    optional: true,
    businessDomain: 'identity',
    growthDomain: 'BUSINESS_FOUNDATION',
    discoveryPriority: 30,
    confidenceImpact: 0.05,
    whyItMatters: 'Identifies geographic jurisdiction and local market context.',
    businessImpact: 'Enables regional pricing and marketing compliance strategy.'
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
    optional: false,
    businessDomain: 'identity',
    growthDomain: 'BUSINESS_FOUNDATION',
    discoveryPriority: 90,
    confidenceImpact: 0.25,
    whyItMatters: 'Provides primary semantic overview of core activities.',
    businessImpact: 'Unlocks initial RAG semantic mapping for recommendation matching.'
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
    optional: false,
    businessDomain: 'model',
    growthDomain: 'BUSINESS_FOUNDATION',
    discoveryPriority: 98,
    confidenceImpact: 0.35,
    whyItMatters: 'Determines the engine configurations and KPI benchmarks applied.',
    businessImpact: 'Enables tailored growth analysis specific to model playbook.'
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
    optional: false,
    businessDomain: 'model',
    growthDomain: 'BRAND_POSITIONING',
    discoveryPriority: 95,
    confidenceImpact: 0.3,
    whyItMatters: 'Clarifies customer utility and product uniqueness.',
    businessImpact: 'Enables Marketing and Strategy Engines to check positioning alignment.'
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
    optional: true,
    businessDomain: 'marketing',
    growthDomain: 'MARKETING',
    relatedKpiSlug: 'cac',
    relatedEngine: 'marketing-engine',
    discoveryPriority: 80,
    confidenceImpact: 0.2,
    whyItMatters: 'Direct input for calculating CAC and acquisition efficiency.',
    businessImpact: 'Allows Marketing Engine to compute ROAS and budget efficiency.'
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
    optional: true,
    businessDomain: 'marketing',
    growthDomain: 'MARKETING',
    relatedKpiSlug: 'roas',
    relatedEngine: 'marketing-engine',
    discoveryPriority: 75,
    confidenceImpact: 0.15,
    whyItMatters: 'Determines ad campaign profitability and channel scale potential.',
    businessImpact: 'Enables Marketing Engine to run attribution modeling.'
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
    optional: true,
    businessDomain: 'sales',
    growthDomain: 'LEAD_GENERATION',
    relatedKpiSlug: 'conversion_rate',
    relatedEngine: 'lead-generation-engine',
    discoveryPriority: 85,
    confidenceImpact: 0.22,
    whyItMatters: 'Quantifies the volume of raw opportunities feeding the sales funnel.',
    businessImpact: 'Enables Lead Gen and Sales Engines to identify volume bottlenecks.'
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
    optional: true,
    businessDomain: 'sales',
    growthDomain: 'SALES',
    relatedKpiSlug: 'conversion_rate',
    relatedEngine: 'sales-engine',
    discoveryPriority: 90,
    confidenceImpact: 0.25,
    whyItMatters: 'Measures the conversion efficiency of the sales process.',
    businessImpact: 'Unlocks Pipeline Velocity tracking in the Sales Engine.'
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
    optional: true,
    businessDomain: 'operations',
    growthDomain: 'BUSINESS_CONSTRAINTS',
    relatedEngine: 'analytics-engine',
    discoveryPriority: 72,
    confidenceImpact: 0.15,
    whyItMatters: 'Highlights key baseline operational overheads.',
    businessImpact: 'Used by Analytics Engine to model gross margins and unit economics.'
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
    optional: true,
    businessDomain: 'operations',
    growthDomain: 'BUSINESS_CONSTRAINTS',
    relatedEngine: 'strategy-engine',
    discoveryPriority: 65,
    confidenceImpact: 0.1,
    whyItMatters: 'Pinpoints self-identified efficiency drains.',
    businessImpact: 'Enables Strategy Engine to suggest targeted process automation.'
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
    optional: true,
    businessDomain: 'technology',
    growthDomain: 'BUSINESS_CONSTRAINTS',
    discoveryPriority: 45,
    confidenceImpact: 0.08,
    whyItMatters: 'Declares platform infrastructure stack details.',
    businessImpact: 'Enables cost optimisation suggestions for hosting.'
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
    optional: false,
    businessDomain: 'finance',
    growthDomain: 'BUSINESS_CONSTRAINTS',
    relatedKpiSlug: 'mrr',
    relatedEngine: 'analytics-engine',
    discoveryPriority: 96,
    confidenceImpact: 0.32,
    whyItMatters: 'Calculates financial runway and operational viability.',
    businessImpact: 'Unlocks cash flow health check in the Analytics Engine.'
  }
];
