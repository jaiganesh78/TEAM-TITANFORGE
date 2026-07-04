// Marketplace Sector Configuration

import { SectorConfigDefinition } from './index';

export const MarketplaceSector: SectorConfigDefinition = {
  slug: 'marketplace',
  displayName: 'Marketplace / Platform',
  description: 'Two-sided platforms connecting buyers and sellers. Success depends on building both supply and demand simultaneously.',
  businessTerminology: {
    'GMV': 'Gross Merchandise Value — total transaction value on the platform',
    'Take Rate': 'Percentage of GMV retained as revenue (platform commission)',
    'Liquidity': 'Ability to match supply and demand within acceptable time',
    'Supply Side': 'Sellers, service providers, or hosts on the platform',
    'Demand Side': 'Buyers or customers using the platform',
    'Chicken-and-Egg Problem': 'Need supply to attract demand and demand to attract supply',
    'Repeat Rate': 'Frequency with which buyers transact again on the platform',
    'Trust Score': 'Rating or review system credibility'
  },
  kpiSlugs: ['cac', 'ltv', 'conversion_rate', 'repeat_purchase_rate', 'nps', 'retention_rate', 'pipeline_velocity'],
  requiredDiscoveryDomains: ['CUSTOMER_SEGMENTS', 'PRODUCT_PORTFOLIO', 'MARKETING', 'GROWTH_METRICS', 'PRICING'],
  marketingChannels: ['Performance marketing', 'SEO', 'App stores', 'Referral programs', 'PR', 'Partnership integrations', 'Community building'],
  leadGenerationChannels: ['Supply: Direct outreach, referral incentives, partnership deals', 'Demand: Performance ads, SEO, referral programs, social'],
  salesProcessSteps: ['Supply onboarding', 'Demand acquisition', 'First match/transaction', 'Repeat usage', 'Network effect triggers'],
  customerSuccessMetrics: ['Supply retention rate', 'Demand repeat rate', 'Transaction completion rate', 'Resolution time for disputes', 'Trust score average'],
  competitiveDimensions: ['Liquidity (match rate)', 'Trust and safety', 'Commission rates', 'UX quality', 'Brand recognition', 'Supply selection depth'],
  questionPriorities: { 'mk_cac': 90, 'sal_conversion_rate': 90, 'fin_burn_rate': 85 },
  growthConstraints: ['Chicken-and-egg supply-demand imbalance', 'Low take rate limits revenue ceiling', 'High fraud/trust risk', 'Geographic density requirements for liquidity'],
  businessLifecycle: {
    stages: [
      { name: 'Seed', focus: 'Solve chicken-and-egg in one city or niche', kpi: 'Transactions per week', milestone: '100 transactions' },
      { name: 'Launch', focus: 'Achieve liquidity in core market', kpi: 'Match rate > 80%', milestone: '1,000 transactions/month' },
      { name: 'Growth', focus: 'Expand geographically or vertically', kpi: 'GMV growth', milestone: '$1M GMV/month' },
      { name: 'Scale', focus: 'Network effects and defensibility', kpi: 'Take rate optimisation', milestone: '$10M GMV/month' }
    ]
  },
  customerJourney: {
    stages: [
      { name: 'Discovery (Demand)', touchpoints: ['App store', 'Google search', 'Referral'], metric: 'Install/sign-up rate' },
      { name: 'First Transaction', touchpoints: ['Search/browse', 'Match/booking', 'Payment'], metric: 'Time-to-first-transaction' },
      { name: 'Trust Building', touchpoints: ['Review system', 'Support', 'Dispute resolution'], metric: 'Review completion rate' },
      { name: 'Repeat Usage', touchpoints: ['Push notification', 'Email', 'Personalisation'], metric: 'Repeat transaction rate' }
    ]
  },
  marketingFunnel: {
    stages: [
      { name: 'Supply Acquisition', channels: ['Outreach', 'Referrals', 'Partnerships'], metric: 'Supplier sign-ups', benchmark: 'Enough for liquidity' },
      { name: 'Demand Acquisition', channels: ['Paid ads', 'SEO', 'Referrals'], metric: 'Demand sign-ups', benchmark: 'Match supply depth' },
      { name: 'Activation', channels: ['Onboarding email', 'Push notification'], metric: 'First transaction rate', benchmark: '> 40%' }
    ]
  },
  salesFunnel: {
    stages: [
      { name: 'Sign-up', criteria: 'User registers on platform' },
      { name: 'Onboarded', criteria: 'Profile completed, payment method added' },
      { name: 'First Transaction', criteria: 'Completes first buy/sell' },
      { name: 'Active User', criteria: '3+ transactions in 90 days' }
    ],
    avgCycleDays: 3,
    benchmarkWinRate: 35
  },
  commonPainPoints: ['Chicken-and-egg bootstrapping challenge', 'Low repeat rate on demand side', 'Supply quality inconsistency', 'High fraud risk', 'Disintermediation attempts'],
  buyingBehaviour: {
    decisionMakers: ['Individual consumer or business buyer'],
    avgDecisionTimeWeeks: 0.2,
    keyBuyingFactors: ['Selection depth', 'Price competitiveness', 'Trust scores', 'UX quality', 'Match speed'],
    commonObjections: ['"Not enough options in my area"', '"I don\'t trust the sellers"', '"Too expensive vs direct"']
  },
  commonRisks: ['Competitor with more liquidity', 'Regulatory changes to gig economy', 'Disintermediation by supply going direct', 'Fraud and trust failures'],
  typicalKpis: ['cac', 'ltv', 'repeat_purchase_rate', 'conversion_rate', 'retention_rate'],
  typicalCompetitors: { competitionStyle: 'Winner-take-most due to network effects. Liquidity is the moat.', watchSignals: ['VC-backed competitor entering market', 'Vertical specialist platform', 'Big platform entering adjacently'] },
  growthBottlenecks: ['Geographic density gaps reducing liquidity', 'No referral flywheel', 'Supply quality issues reducing demand trust', 'Low repeat rate requiring constant re-acquisition'],
  typicalAIOpportunities: ['AI matching optimisation', 'Dynamic pricing for supply', 'Fraud detection', 'Personalised demand recommendations', 'Churn prediction for supply and demand'],
  futureAIPromptTemplates: {
    'strategy-engine': 'You are a marketplace growth strategist. GMV is ${gmv}/month with {takeRate}% take rate. Identify the top 3 strategic priorities.',
    'marketing-engine': 'You are a marketplace marketing expert. Design acquisition strategies for both supply ({supplyCount} suppliers) and demand sides.',
    'lead-generation-engine': 'You are a marketplace growth expert. Design a supply acquisition and demand activation strategy for {targetMarket}.',
    'sales-engine': 'You are a marketplace conversion expert. First-transaction rate is {firstTransactionRate}%. Identify friction points.',
    'customer-success-engine': 'You are a marketplace retention expert. Repeat transaction rate is {repeatRate}%. Design retention strategies for both sides.',
    'analytics-engine': 'Analyse marketplace health: GMV=${gmv}, take rate={takeRate}%, repeat rate={repeatRate}%. Identify the key growth constraint.'
  },
  isActive: true
};
