// Retail Sector Configuration

import { SectorConfigDefinition } from './index';

export const RetailSector: SectorConfigDefinition = {
  slug: 'retail',
  displayName: 'Retail',
  description: 'Physical and omni-channel retail businesses selling products directly to consumers.',
  businessTerminology: {
    'Foot Traffic': 'Number of customers entering a physical store',
    'Conversion Rate': 'Percentage of visitors who make a purchase',
    'Basket Size': 'Average number of items per transaction (similar to AOV)',
    'Shrinkage': 'Inventory loss due to theft, damage, or administrative errors',
    'Sell-Through Rate': 'Percentage of inventory sold in a given period',
    'Same-Store Sales': 'Revenue growth from existing locations vs new openings',
    'Stockout Rate': 'Percentage of time key items are out of stock'
  },
  kpiSlugs: ['aov', 'conversion_rate', 'repeat_purchase_rate', 'nps', 'retention_rate', 'cac'],
  requiredDiscoveryDomains: ['PRODUCT_PORTFOLIO', 'CUSTOMER_SEGMENTS', 'PRICING', 'MARKETING', 'GROWTH_METRICS'],
  marketingChannels: ['Google Ads', 'Meta Ads', 'Local SEO', 'Direct Mail', 'In-store promotions', 'Loyalty program', 'Email marketing', 'Influencer partnerships'],
  leadGenerationChannels: ['Foot traffic', 'Google Local', 'Social ads', 'Loyalty sign-ups', 'Referral word-of-mouth'],
  salesProcessSteps: ['Store visit / Website visit', 'Product browsing', 'Staff assistance', 'Add to basket', 'Checkout', 'Post-purchase follow-up'],
  customerSuccessMetrics: ['Customer satisfaction score', 'Return rate', 'Loyalty program engagement', 'NPS', 'Repeat visit frequency'],
  competitiveDimensions: ['Price', 'Product selection', 'Store experience', 'Location convenience', 'Staff expertise', 'Loyalty rewards', 'Returns policy'],
  questionPriorities: { 'mk_ad_spend': 85, 'sal_conversion_rate': 90, 'mk_cac': 80 },
  growthConstraints: ['Fixed overhead limiting margin', 'Inventory management complexity', 'High competition from eCommerce', 'Seasonal demand spikes'],
  businessLifecycle: {
    stages: [
      { name: 'Launch', focus: 'First location and local awareness', kpi: 'Foot traffic', milestone: 'Break even on first store' },
      { name: 'Established', focus: 'Loyal local customer base', kpi: 'Repeat visit rate', milestone: '$500K/year revenue' },
      { name: 'Expansion', focus: 'Multi-location or eCommerce', kpi: 'Same-store sales growth', milestone: '3+ profitable locations' }
    ]
  },
  customerJourney: {
    stages: [
      { name: 'Discovery', touchpoints: ['Google Maps', 'Social ads', 'Word of mouth'], metric: 'Foot traffic / Website visits' },
      { name: 'In-Store / Online', touchpoints: ['Browsing', 'Staff interaction', 'Product display'], metric: 'Conversion rate' },
      { name: 'Purchase', touchpoints: ['Checkout', 'Receipt', 'Loyalty sign-up'], metric: 'AOV' },
      { name: 'Post-Purchase', touchpoints: ['Email follow-up', 'Review request', 'Loyalty offer'], metric: 'Repeat visit rate' }
    ]
  },
  marketingFunnel: {
    stages: [
      { name: 'Local Awareness', channels: ['Google Local', 'Social ads', 'Flyers'], metric: 'Foot traffic', benchmark: 'Depends on location' },
      { name: 'In-Store Conversion', channels: ['Staff', 'Display', 'Promotions'], metric: 'Conversion rate', benchmark: '25-40%' },
      { name: 'Loyalty', channels: ['Email', 'Loyalty card', 'SMS'], metric: 'Repeat purchase rate', benchmark: '> 35%' }
    ]
  },
  salesFunnel: {
    stages: [
      { name: 'Visitor', criteria: 'Enters store or visits website' },
      { name: 'Browser', criteria: 'Picks up / views 2+ products' },
      { name: 'Buyer', criteria: 'Completes purchase' },
      { name: 'Loyal', criteria: '5+ purchases or loyalty member' }
    ],
    avgCycleDays: 0.1,
    benchmarkWinRate: 30
  },
  commonPainPoints: ['eCommerce cannibalisation', 'Inventory obsolescence', 'Staffing costs', 'Low repeat customer rate', 'Price pressure from online competitors'],
  buyingBehaviour: {
    decisionMakers: ['Individual consumer'],
    avgDecisionTimeWeeks: 0.1,
    keyBuyingFactors: ['Price', 'Availability', 'Location convenience', 'Product quality', 'Staff helpfulness'],
    commonObjections: ['"I can get it cheaper online"', '"You don\'t have my size"', '"I\'ll think about it"']
  },
  commonRisks: ['Online competition', 'Lease cost increases', 'Supply chain disruptions', 'Seasonal revenue concentration'],
  typicalKpis: ['aov', 'conversion_rate', 'repeat_purchase_rate', 'nps'],
  typicalCompetitors: { competitionStyle: 'Local vs eCommerce. Wins on experience and immediacy.', watchSignals: ['Amazon same-day expansion', 'DTC brand pop-ups', 'Competitor loyalty program launch'] },
  growthBottlenecks: ['No digital loyalty program', 'No email list', 'Poor inventory forecasting', 'No online presence'],
  typicalAIOpportunities: ['Demand forecasting for inventory', 'Personalised loyalty offers', 'Staff scheduling optimisation', 'Churn risk from lapsed customers'],
  futureAIPromptTemplates: {
    'strategy-engine': 'You are a retail growth strategist. The business has {locationCount} locations with {avgFootTraffic} monthly visitors. Identify the top 3 growth priorities.',
    'marketing-engine': 'You are a retail marketing expert. Monthly ad spend is ${adSpend} targeting {targetRadius}km radius. Optimise acquisition strategy.',
    'customer-success-engine': 'You are a retail loyalty expert. Repeat purchase rate is {repeatRate}%. Design a loyalty program to improve retention.',
    'analytics-engine': 'Analyse retail performance: conversion rate={conversionRate}%, AOV=${aov}, foot traffic={footTraffic}. Identify top optimisation opportunities.',
    'lead-generation-engine': 'You are a retail demand generation expert. Design a local awareness campaign for {targetSegment} within {locationRadius}.',
    'sales-engine': 'You are a retail sales coach. In-store conversion rate is {conversionRate}%. Design a staff sales playbook.'
  },
  isActive: true
};
