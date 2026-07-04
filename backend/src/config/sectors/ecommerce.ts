// eCommerce Sector Configuration

import { SectorConfigDefinition } from './index';

export const EcommerceSector: SectorConfigDefinition = {
  slug: 'ecommerce',
  displayName: 'eCommerce / Online Retail',
  description: 'Direct-to-consumer and marketplace businesses selling physical or digital products online.',
  businessTerminology: {
    'AOV': 'Average Order Value — average revenue per transaction',
    'ROAS': 'Return on Ad Spend — revenue per advertising dollar',
    'Cart Abandonment': 'Percentage of users who add to cart but do not complete purchase',
    'CLV': 'Customer Lifetime Value — same as LTV but emphasised in eCommerce context',
    'SKU': 'Stock Keeping Unit — unique product identifier',
    'GMV': 'Gross Merchandise Value — total sales value before fees',
    'Fulfillment Rate': 'Percentage of orders shipped on time',
    'Return Rate': 'Percentage of products returned by customers'
  },
  kpiSlugs: ['aov', 'roas', 'cac', 'ltv', 'conversion_rate', 'repeat_purchase_rate', 'retention_rate', 'nps'],
  requiredDiscoveryDomains: ['MARKETING', 'PRODUCT_PORTFOLIO', 'CUSTOMER_SEGMENTS', 'PRICING', 'GROWTH_METRICS'],
  marketingChannels: ['Google Shopping', 'Meta Ads', 'Instagram', 'TikTok Ads', 'Email Marketing', 'Influencer Marketing', 'Affiliate Programs', 'SEO', 'Pinterest'],
  leadGenerationChannels: ['Social Media Ads', 'Search Ads', 'Email Capture', 'Influencer Partnerships', 'Referral Programs', 'Loyalty Programs'],
  salesProcessSteps: ['Ad Click', 'Landing Page Visit', 'Product View', 'Add to Cart', 'Checkout Start', 'Payment', 'Order Confirmation', 'Repeat Purchase'],
  customerSuccessMetrics: ['Post-Purchase NPS', 'Return Rate', 'Repeat Purchase Rate', 'Customer Support Resolution Time', 'Review Score'],
  competitiveDimensions: ['Pricing', 'Product quality', 'Shipping speed', 'Return policy', 'Brand trust', 'Loyalty program', 'Customer experience'],
  questionPriorities: { 'mk_ad_spend': 95, 'sal_conversion_rate': 95, 'mk_cac': 90, 'fin_burn_rate': 75 },
  growthConstraints: ['High cart abandonment rate (>70%)', 'CAC exceeding AOV', 'Low repeat purchase rate', 'High return rates', 'Supply chain disruptions'],
  businessLifecycle: {
    stages: [
      { name: 'Launch', focus: 'First sales and product validation', kpi: 'First 100 orders', milestone: '$10K revenue' },
      { name: 'Growth', focus: 'Scaling paid acquisition', kpi: 'ROAS > 3', milestone: '$50K/month revenue' },
      { name: 'Retention', focus: 'Repeat purchase engine', kpi: 'Repeat rate > 30%', milestone: '$200K/month revenue' },
      { name: 'Scale', focus: 'Category dominance', kpi: 'Market share', milestone: '$1M/month revenue' }
    ]
  },
  customerJourney: {
    stages: [
      { name: 'Discovery', touchpoints: ['Social ads', 'Influencer post', 'Google search'], metric: 'Click-through rate' },
      { name: 'Consideration', touchpoints: ['Product page', 'Reviews', 'Comparison'], metric: 'Add-to-cart rate' },
      { name: 'Purchase', touchpoints: ['Checkout', 'Payment gateway', 'Order email'], metric: 'Conversion rate' },
      { name: 'Post-Purchase', touchpoints: ['Shipping update', 'Unboxing', 'Review request'], metric: 'NPS & review rate' },
      { name: 'Loyalty', touchpoints: ['Email campaign', 'Loyalty program', 'Retargeting'], metric: 'Repeat purchase rate' }
    ]
  },
  marketingFunnel: {
    stages: [
      { name: 'Acquisition', channels: ['Google Shopping', 'Meta Ads', 'TikTok'], metric: 'ROAS', benchmark: '> 4x' },
      { name: 'Conversion', channels: ['Landing page', 'Retargeting', 'Email abandon cart'], metric: 'Conversion rate', benchmark: '2-3%' },
      { name: 'Retention', channels: ['Email flows', 'SMS', 'Loyalty program'], metric: 'Repeat purchase rate', benchmark: '> 28%' }
    ]
  },
  salesFunnel: {
    stages: [
      { name: 'Visitor', criteria: 'Lands on site from any source' },
      { name: 'Shopper', criteria: 'Views 2+ products or spends >60s on site' },
      { name: 'Prospect', criteria: 'Adds to cart' },
      { name: 'Customer', criteria: 'Completes first purchase' },
      { name: 'Loyal', criteria: 'Completes 3+ purchases' }
    ],
    avgCycleDays: 1,
    benchmarkWinRate: 2.5
  },
  commonPainPoints: ['Rising Meta/Google ad costs', 'Cart abandonment over 70%', 'High return rates eating margins', 'Inventory management complexity', 'No loyalty program'],
  buyingBehaviour: {
    decisionMakers: ['Individual consumer'],
    avgDecisionTimeWeeks: 0.1,
    keyBuyingFactors: ['Price', 'Reviews', 'Shipping speed', 'Return policy', 'Brand trust'],
    commonObjections: ['"Too expensive"', '"Not sure about quality"', '"Shipping takes too long"', '"Seen cheaper elsewhere"']
  },
  commonRisks: ['Ad platform policy changes', 'Supply chain delays', 'Margin compression', 'Counterfeit competition', 'Seasonal revenue spikes'],
  typicalKpis: ['roas', 'aov', 'conversion_rate', 'repeat_purchase_rate', 'cac'],
  typicalCompetitors: {
    competitionStyle: 'Price and speed competition. Differentiation through brand and loyalty.',
    watchSignals: ['Amazon category entry', 'Chinese DTC brands', 'New influencer brands']
  },
  growthBottlenecks: ['Over-reliance on paid ads', 'No email retention program', 'Low AOV limiting profitability', 'No upsell/cross-sell strategy', 'Poor mobile checkout UX'],
  typicalAIOpportunities: ['AI product recommendations', 'Dynamic pricing optimisation', 'Personalised email flows', 'Return risk scoring', 'Inventory demand forecasting'],
  futureAIPromptTemplates: {
    'strategy-engine': 'You are an eCommerce growth strategist. ROAS is {roas} and repeat purchase rate is {repeatPurchaseRate}%. Identify the top 3 growth levers.',
    'marketing-engine': 'You are an eCommerce marketing expert. CAC is ${cac} and AOV is ${aov}. Optimise channel allocation to achieve ROAS > 4.',
    'lead-generation-engine': 'You are an eCommerce acquisition expert. Design a full-funnel acquisition strategy targeting {customerSegments}.',
    'sales-engine': 'You are an eCommerce conversion expert. Cart abandonment is {cartAbandonment}%. Identify top friction points and solutions.',
    'customer-success-engine': 'You are an eCommerce retention expert. Repeat purchase rate is {repeatRate}%. Design a loyalty program strategy.',
    'analytics-engine': 'Analyse eCommerce unit economics: CAC={cac}, AOV={aov}, LTV={ltv}. Identify the primary profitability constraint.'
  },
  isActive: true
};
