// Growth KPI Registry
// Every KPI the Growth AI OS tracks, with full metadata for Analytics Engine

export interface KPIBenchmark {
  saas?: number;
  ecommerce?: number;
  marketplace?: number;
  services?: number;
  retail?: number;
  default: number;
}

export interface KPIRange {
  min: number;
  max: number;
  label: string;
}

export interface KPIDefinition {
  slug: string;
  displayName: string;
  unit: string;
  definition: string;
  formula: string;
  industryBenchmark: KPIBenchmark;
  healthyRange: KPIRange;
  warningRange: KPIRange;
  criticalRange: KPIRange;
  requiredInputs: string[];
  evidenceSources: string[];
  updateFrequency: 'REAL_TIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  owningEngine: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  businessDomain: string;
  growthDomain: string;
  description: string;
}

export const KPI_REGISTRY: KPIDefinition[] = [
  {
    slug: 'cac',
    displayName: 'Customer Acquisition Cost',
    unit: 'USD',
    definition: 'Total cost to acquire one new paying customer.',
    formula: 'Total Sales & Marketing Spend / New Customers Acquired',
    industryBenchmark: { saas: 450, ecommerce: 85, marketplace: 200, services: 600, default: 300 },
    healthyRange: { min: 0, max: 300, label: 'Healthy' },
    warningRange: { min: 300, max: 700, label: 'Warning' },
    criticalRange: { min: 700, max: 99999, label: 'Critical' },
    requiredInputs: ['totalMarketingSpend', 'totalSalesSpend', 'newCustomersAcquired'],
    evidenceSources: ['FINANCIAL_REPORT', 'MARKETING_REPORT', 'SALES_REPORT'],
    updateFrequency: 'MONTHLY',
    owningEngine: 'analytics-engine',
    confidence: 'HIGH',
    businessDomain: 'marketing',
    growthDomain: 'MARKETING',
    description: 'A foundational efficiency metric. High CAC relative to LTV indicates a broken growth engine.'
  },
  {
    slug: 'ltv',
    displayName: 'Customer Lifetime Value',
    unit: 'USD',
    definition: 'Total revenue expected from a single customer over their lifetime.',
    formula: 'Average Order Value × Purchase Frequency × Customer Lifespan',
    industryBenchmark: { saas: 2500, ecommerce: 400, marketplace: 900, services: 8000, default: 2000 },
    healthyRange: { min: 1000, max: 99999, label: 'Healthy' },
    warningRange: { min: 300, max: 1000, label: 'Warning' },
    criticalRange: { min: 0, max: 300, label: 'Critical' },
    requiredInputs: ['averageOrderValue', 'purchaseFrequency', 'avgCustomerLifespanMonths'],
    evidenceSources: ['FINANCIAL_REPORT', 'CUSTOMER_FEEDBACK', 'SALES_REPORT'],
    updateFrequency: 'MONTHLY',
    owningEngine: 'analytics-engine',
    confidence: 'HIGH',
    businessDomain: 'sales',
    growthDomain: 'GROWTH_METRICS',
    description: 'The economic value of customer relationships. Used to justify acquisition spend and prioritize retention.'
  },
  {
    slug: 'ltv_cac_ratio',
    displayName: 'LTV:CAC Ratio',
    unit: 'ratio',
    definition: 'Ratio of lifetime value to acquisition cost. A key health indicator of business viability.',
    formula: 'LTV / CAC',
    industryBenchmark: { saas: 3.5, ecommerce: 4.0, marketplace: 3.0, services: 5.0, default: 3.0 },
    healthyRange: { min: 3, max: 99, label: 'Healthy' },
    warningRange: { min: 2, max: 3, label: 'Warning' },
    criticalRange: { min: 0, max: 2, label: 'Critical' },
    requiredInputs: ['ltv', 'cac'],
    evidenceSources: ['FINANCIAL_REPORT'],
    updateFrequency: 'MONTHLY',
    owningEngine: 'analytics-engine',
    confidence: 'HIGH',
    businessDomain: 'finance',
    growthDomain: 'GROWTH_METRICS',
    description: 'The single most important metric for investor-grade business health. Must be above 3:1 for SaaS.'
  },
  {
    slug: 'roas',
    displayName: 'Return on Ad Spend',
    unit: 'ratio',
    definition: 'Revenue generated for every dollar spent on advertising.',
    formula: 'Revenue from Ads / Ad Spend',
    industryBenchmark: { saas: 3.0, ecommerce: 4.0, marketplace: 3.5, retail: 5.0, default: 3.5 },
    healthyRange: { min: 3, max: 99, label: 'Healthy' },
    warningRange: { min: 2, max: 3, label: 'Warning' },
    criticalRange: { min: 0, max: 2, label: 'Critical' },
    requiredInputs: ['totalAdSpend', 'revenueFromAds'],
    evidenceSources: ['MARKETING_REPORT', 'FINANCIAL_REPORT'],
    updateFrequency: 'WEEKLY',
    owningEngine: 'marketing-engine',
    confidence: 'HIGH',
    businessDomain: 'marketing',
    growthDomain: 'MARKETING',
    description: 'Measures advertising efficiency. Critical for scaling paid acquisition channels.'
  },
  {
    slug: 'aov',
    displayName: 'Average Order Value',
    unit: 'USD',
    definition: 'Average revenue per transaction.',
    formula: 'Total Revenue / Total Orders',
    industryBenchmark: { ecommerce: 85, saas: 350, retail: 55, marketplace: 120, default: 100 },
    healthyRange: { min: 80, max: 99999, label: 'Healthy' },
    warningRange: { min: 30, max: 80, label: 'Warning' },
    criticalRange: { min: 0, max: 30, label: 'Critical' },
    requiredInputs: ['totalRevenue', 'totalOrders'],
    evidenceSources: ['SALES_REPORT', 'FINANCIAL_REPORT'],
    updateFrequency: 'WEEKLY',
    owningEngine: 'sales-engine',
    confidence: 'HIGH',
    businessDomain: 'sales',
    growthDomain: 'SALES',
    description: 'Increasing AOV is typically the fastest lever to improve revenue without changing traffic.'
  },
  {
    slug: 'conversion_rate',
    displayName: 'Conversion Rate',
    unit: '%',
    definition: 'Percentage of visitors or leads who complete a desired action.',
    formula: '(Conversions / Total Visitors or Leads) × 100',
    industryBenchmark: { ecommerce: 2.5, saas: 3.5, marketplace: 1.8, services: 8.0, default: 3.0 },
    healthyRange: { min: 3, max: 100, label: 'Healthy' },
    warningRange: { min: 1, max: 3, label: 'Warning' },
    criticalRange: { min: 0, max: 1, label: 'Critical' },
    requiredInputs: ['totalConversions', 'totalVisitorsOrLeads'],
    evidenceSources: ['MARKETING_REPORT', 'SALES_REPORT'],
    updateFrequency: 'WEEKLY',
    owningEngine: 'marketing-engine',
    confidence: 'HIGH',
    businessDomain: 'marketing',
    growthDomain: 'LEAD_GENERATION',
    description: 'Funnel efficiency metric. Small improvements compound dramatically across traffic volume.'
  },
  {
    slug: 'lead_quality_score',
    displayName: 'Lead Quality Score',
    unit: 'score 0-100',
    definition: 'Composite score measuring the commercial readiness and fit of incoming leads.',
    formula: 'Weighted average of ICP fit × Engagement Score × Budget Signal × Authority',
    industryBenchmark: { saas: 65, services: 70, marketplace: 55, default: 60 },
    healthyRange: { min: 65, max: 100, label: 'Healthy' },
    warningRange: { min: 45, max: 65, label: 'Warning' },
    criticalRange: { min: 0, max: 45, label: 'Critical' },
    requiredInputs: ['icpFitScore', 'engagementScore', 'budgetSignal', 'contactAuthority'],
    evidenceSources: ['SALES_REPORT', 'CUSTOMER_FEEDBACK'],
    updateFrequency: 'WEEKLY',
    owningEngine: 'lead-generation-engine',
    confidence: 'MEDIUM',
    businessDomain: 'sales',
    growthDomain: 'LEAD_GENERATION',
    description: 'Poor lead quality wastes sales capacity. A high score means marketing is aligned with ICP.'
  },
  {
    slug: 'pipeline_velocity',
    displayName: 'Pipeline Velocity',
    unit: 'USD/day',
    definition: 'Rate at which opportunities move through the sales pipeline generating revenue.',
    formula: '(Active Deals × Win Rate × Avg Deal Size) / Sales Cycle Length in Days',
    industryBenchmark: { saas: 2000, services: 3500, marketplace: 1500, default: 2000 },
    healthyRange: { min: 2000, max: 99999, label: 'Healthy' },
    warningRange: { min: 500, max: 2000, label: 'Warning' },
    criticalRange: { min: 0, max: 500, label: 'Critical' },
    requiredInputs: ['activeDealsCount', 'winRate', 'avgDealSize', 'salesCycleDays'],
    evidenceSources: ['SALES_REPORT'],
    updateFrequency: 'WEEKLY',
    owningEngine: 'sales-engine',
    confidence: 'MEDIUM',
    businessDomain: 'sales',
    growthDomain: 'SALES',
    description: 'The combined measure of pipeline health. Optimizing any of the four inputs improves velocity.'
  },
  {
    slug: 'win_rate',
    displayName: 'Win Rate',
    unit: '%',
    definition: 'Percentage of sales opportunities that result in a closed-won deal.',
    formula: '(Closed Won Deals / Total Opportunities) × 100',
    industryBenchmark: { saas: 22, services: 35, marketplace: 15, default: 25 },
    healthyRange: { min: 25, max: 100, label: 'Healthy' },
    warningRange: { min: 10, max: 25, label: 'Warning' },
    criticalRange: { min: 0, max: 10, label: 'Critical' },
    requiredInputs: ['closedWonDeals', 'totalOpportunities'],
    evidenceSources: ['SALES_REPORT'],
    updateFrequency: 'MONTHLY',
    owningEngine: 'sales-engine',
    confidence: 'HIGH',
    businessDomain: 'sales',
    growthDomain: 'SALES',
    description: 'A core sales efficiency metric. Low win rate typically signals messaging, targeting, or product gaps.'
  },
  {
    slug: 'retention_rate',
    displayName: 'Customer Retention Rate',
    unit: '%',
    definition: 'Percentage of customers retained over a given period.',
    formula: '((Customers at End - New Customers) / Customers at Start) × 100',
    industryBenchmark: { saas: 85, ecommerce: 40, marketplace: 55, services: 75, default: 70 },
    healthyRange: { min: 80, max: 100, label: 'Healthy' },
    warningRange: { min: 60, max: 80, label: 'Warning' },
    criticalRange: { min: 0, max: 60, label: 'Critical' },
    requiredInputs: ['customersAtStart', 'customersAtEnd', 'newCustomersInPeriod'],
    evidenceSources: ['FINANCIAL_REPORT', 'CUSTOMER_FEEDBACK'],
    updateFrequency: 'MONTHLY',
    owningEngine: 'customer-success-engine',
    confidence: 'HIGH',
    businessDomain: 'customer-success',
    growthDomain: 'CUSTOMER_SUCCESS',
    description: 'Retention is the bedrock of compounding growth. 5% improvement can double profitability.'
  },
  {
    slug: 'churn_rate',
    displayName: 'Churn Rate',
    unit: '%',
    definition: 'Percentage of customers who stop using the product or service in a period.',
    formula: '(Lost Customers in Period / Customers at Start of Period) × 100',
    industryBenchmark: { saas: 5, ecommerce: 60, marketplace: 45, services: 15, default: 20 },
    healthyRange: { min: 0, max: 5, label: 'Healthy' },
    warningRange: { min: 5, max: 15, label: 'Warning' },
    criticalRange: { min: 15, max: 100, label: 'Critical' },
    requiredInputs: ['lostCustomers', 'customersAtStart'],
    evidenceSources: ['FINANCIAL_REPORT', 'CUSTOMER_FEEDBACK'],
    updateFrequency: 'MONTHLY',
    owningEngine: 'customer-success-engine',
    confidence: 'HIGH',
    businessDomain: 'customer-success',
    growthDomain: 'CUSTOMER_SUCCESS',
    description: 'The inverse of retention. High churn negates all acquisition investment and destroys LTV.'
  },
  {
    slug: 'nps',
    displayName: 'Net Promoter Score',
    unit: 'score -100 to 100',
    definition: 'Customer loyalty and satisfaction metric based on likelihood to recommend.',
    formula: '% Promoters - % Detractors',
    industryBenchmark: { saas: 35, ecommerce: 45, services: 40, retail: 50, default: 40 },
    healthyRange: { min: 40, max: 100, label: 'Healthy' },
    warningRange: { min: 0, max: 40, label: 'Warning' },
    criticalRange: { min: -100, max: 0, label: 'Critical' },
    requiredInputs: ['promoterCount', 'detractorCount', 'totalRespondents'],
    evidenceSources: ['CUSTOMER_FEEDBACK'],
    updateFrequency: 'QUARTERLY',
    owningEngine: 'customer-success-engine',
    confidence: 'HIGH',
    businessDomain: 'customer-success',
    growthDomain: 'CUSTOMER_SUCCESS',
    description: 'Leading indicator of organic growth. High NPS drives referral loops that reduce CAC.'
  },
  {
    slug: 'repeat_purchase_rate',
    displayName: 'Repeat Purchase Rate',
    unit: '%',
    definition: 'Percentage of customers who purchase more than once.',
    formula: '(Customers with 2+ Purchases / Total Customers) × 100',
    industryBenchmark: { ecommerce: 28, retail: 35, marketplace: 40, default: 30 },
    healthyRange: { min: 30, max: 100, label: 'Healthy' },
    warningRange: { min: 15, max: 30, label: 'Warning' },
    criticalRange: { min: 0, max: 15, label: 'Critical' },
    requiredInputs: ['repeatCustomers', 'totalUniqueCustomers'],
    evidenceSources: ['SALES_REPORT', 'FINANCIAL_REPORT'],
    updateFrequency: 'MONTHLY',
    owningEngine: 'customer-success-engine',
    confidence: 'HIGH',
    businessDomain: 'sales',
    growthDomain: 'CUSTOMER_SUCCESS',
    description: 'Repeat buyers are 5× cheaper to sell to. A critical metric for eCommerce and retail.'
  },
  {
    slug: 'marketing_attribution',
    displayName: 'Marketing Attribution Score',
    unit: '%',
    definition: 'Percentage of revenue that can be attributed to a specific marketing channel.',
    formula: 'Revenue Attributed to Channel / Total Revenue × 100',
    industryBenchmark: { saas: 45, ecommerce: 60, marketplace: 50, default: 50 },
    healthyRange: { min: 40, max: 100, label: 'Healthy' },
    warningRange: { min: 20, max: 40, label: 'Warning' },
    criticalRange: { min: 0, max: 20, label: 'Critical' },
    requiredInputs: ['revenueByChannel', 'totalRevenue'],
    evidenceSources: ['MARKETING_REPORT', 'FINANCIAL_REPORT'],
    updateFrequency: 'MONTHLY',
    owningEngine: 'marketing-engine',
    confidence: 'MEDIUM',
    businessDomain: 'marketing',
    growthDomain: 'MARKETING',
    description: 'Without attribution data, budget allocation is guesswork. Critical for Marketing Engine to operate.'
  },
  {
    slug: 'mrr',
    displayName: 'Monthly Recurring Revenue',
    unit: 'USD',
    definition: 'Predictable monthly revenue from subscriptions or recurring contracts.',
    formula: 'Sum of all active monthly subscription values',
    industryBenchmark: { saas: 50000, marketplace: 30000, services: 20000, default: 25000 },
    healthyRange: { min: 20000, max: 99999999, label: 'Healthy' },
    warningRange: { min: 5000, max: 20000, label: 'Warning' },
    criticalRange: { min: 0, max: 5000, label: 'Critical' },
    requiredInputs: ['activeSubscriptions', 'subscriptionValues'],
    evidenceSources: ['FINANCIAL_REPORT'],
    updateFrequency: 'MONTHLY',
    owningEngine: 'analytics-engine',
    confidence: 'HIGH',
    businessDomain: 'finance',
    growthDomain: 'GROWTH_METRICS',
    description: 'The core revenue metric for subscription businesses. Foundation for ARR, valuation, and runway calculations.'
  }
];

export class KPIRegistry {
  static getAll(): KPIDefinition[] {
    return KPI_REGISTRY;
  }

  static getBySlug(slug: string): KPIDefinition | undefined {
    return KPI_REGISTRY.find(k => k.slug === slug);
  }

  static getByEngine(engineId: string): KPIDefinition[] {
    return KPI_REGISTRY.filter(k => k.owningEngine === engineId);
  }

  static getByGrowthDomain(domain: string): KPIDefinition[] {
    return KPI_REGISTRY.filter(k => k.growthDomain === domain);
  }

  static getBySlugs(slugs: string[]): KPIDefinition[] {
    return KPI_REGISTRY.filter(k => slugs.includes(k.slug));
  }

  static getBenchmark(slug: string, sectorSlug: string): number {
    const kpi = this.getBySlug(slug);
    if (!kpi) return 0;
    const benchmarks = kpi.industryBenchmark as any;
    return benchmarks[sectorSlug] ?? benchmarks.default;
  }

  static getHealthStatus(slug: string, value: number): 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN' {
    const kpi = this.getBySlug(slug);
    if (!kpi) return 'UNKNOWN';
    const { healthyRange, warningRange, criticalRange } = kpi;
    if (value >= healthyRange.min && value <= healthyRange.max) return 'HEALTHY';
    if (value >= warningRange.min && value <= warningRange.max) return 'WARNING';
    if (value >= criticalRange.min && value <= criticalRange.max) return 'CRITICAL';
    return 'UNKNOWN';
  }
}
