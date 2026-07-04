"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgePackManager = exports.INDUSTRY_KNOWLEDGE_PACKS = void 0;
exports.INDUSTRY_KNOWLEDGE_PACKS = {
    SaaS: {
        industry: 'SaaS',
        requiredCategories: ['identity', 'model', 'products-services', 'marketing', 'sales', 'operations', 'finance', 'technology'],
        suggestedDiscoveryOrder: ['identity', 'model', 'products-services', 'finance', 'marketing', 'sales', 'operations', 'technology'],
        coverageWeights: {
            identity: 0.1,
            model: 0.15,
            'products-services': 0.15,
            finance: 0.2,
            marketing: 0.1,
            sales: 0.1,
            operations: 0.1,
            technology: 0.1
        },
        priorityKPIs: ['LTV', 'CAC', 'MRR', 'Churn Rate', 'Runway'],
        importantMetrics: ['adSpend', 'roi', 'leadsCount', 'conversionRate', 'infraCost', 'burnRate'],
        questionTemplates: {
            financials: 'What is your current Monthly Recurring Revenue (MRR) and Gross Margin profile?',
            retention: 'Describe your user churn metrics and retention cohorts.'
        },
        constraints: ['Cash Runway > 6 Months', 'Gross Margins > 75%', 'LTV:CAC Ratio > 3:1']
    },
    Restaurant: {
        industry: 'Restaurant',
        requiredCategories: ['identity', 'model', 'products-services', 'operations', 'finance'],
        suggestedDiscoveryOrder: ['identity', 'model', 'products-services', 'finance', 'operations'],
        coverageWeights: {
            identity: 0.15,
            model: 0.2,
            'products-services': 0.25,
            finance: 0.2,
            operations: 0.2
        },
        priorityKPIs: ['Food Cost Percentage', 'Table Turnover Rate', 'Average Order Value (AOV)', 'Labor Cost Percentage'],
        importantMetrics: ['burnRate', 'headcount', 'seatingCapacity'],
        questionTemplates: {
            menu: 'What are your top-selling menu items and their cost of goods sold (COGS)?',
            seating: 'How many covers do you serve on an average weekend night?'
        },
        constraints: ['Food Cost < 35%', 'Labor Cost < 30%', 'Rent Cost < 10% of gross revenue']
    },
    Retail: {
        industry: 'Retail',
        requiredCategories: ['identity', 'model', 'products-services', 'marketing', 'finance', 'operations'],
        suggestedDiscoveryOrder: ['identity', 'model', 'products-services', 'finance', 'marketing', 'operations'],
        coverageWeights: {
            identity: 0.1,
            model: 0.15,
            'products-services': 0.2,
            finance: 0.25,
            marketing: 0.15,
            operations: 0.15
        },
        priorityKPIs: ['Inventory Turnover', 'Gross Margin Return on Investment (GMROI)', 'Average Ticket Size', 'Foot Traffic Conversion'],
        importantMetrics: ['adSpend', 'roi', 'burnRate'],
        questionTemplates: {
            inventory: 'Describe your average inventory turnover frequency and key suppliers.',
            channels: 'Do you sell through physical stores, e-commerce, or hybrid channels?'
        },
        constraints: ['Gross Margin > 40%', 'Inventory Turns > 4x per year']
    },
    Manufacturing: {
        industry: 'Manufacturing',
        requiredCategories: ['identity', 'model', 'products-services', 'operations', 'finance'],
        suggestedDiscoveryOrder: ['identity', 'model', 'products-services', 'finance', 'operations'],
        coverageWeights: {
            identity: 0.1,
            model: 0.1,
            'products-services': 0.2,
            finance: 0.3,
            operations: 0.3
        },
        priorityKPIs: ['Overall Equipment Effectiveness (OEE)', 'Capacity Utilization', 'Cost per Unit', 'Yield Rate'],
        importantMetrics: ['infraCost', 'burnRate', 'headcount'],
        questionTemplates: {
            production: 'What is your current production capacity utilization percentage?',
            logistics: 'Detail your lead times for key raw material supplies.'
        },
        constraints: ['Yield Rate > 98%', 'Capacity Utilization > 75%']
    },
    Healthcare: {
        industry: 'Healthcare',
        requiredCategories: ['identity', 'model', 'operations', 'finance', 'technology'],
        suggestedDiscoveryOrder: ['identity', 'model', 'finance', 'operations', 'technology'],
        coverageWeights: {
            identity: 0.1,
            model: 0.15,
            finance: 0.25,
            operations: 0.3,
            technology: 0.2
        },
        priorityKPIs: ['Patient Retention', 'Average Billing Cycle', 'No-Show Rate', 'Staff-to-Patient Ratio'],
        importantMetrics: ['headcount', 'burnRate', 'infraCost'],
        questionTemplates: {
            billing: 'What is your average insurance claim reimbursement processing cycle?',
            regulatory: 'Are your storage systems HIPAA / GDPR compliant?'
        },
        constraints: ['No-Show Rate < 5%', 'Claim Denial Rate < 2%']
    },
    Education: {
        industry: 'Education',
        requiredCategories: ['identity', 'model', 'products-services', 'finance', 'operations', 'technology'],
        suggestedDiscoveryOrder: ['identity', 'model', 'products-services', 'finance', 'operations', 'technology'],
        coverageWeights: {
            identity: 0.1,
            model: 0.1,
            'products-services': 0.2,
            finance: 0.2,
            operations: 0.2,
            technology: 0.2
        },
        priorityKPIs: ['Student Retention', 'LTV per Student', 'Course Completion Rate', 'CAC per Enrollment'],
        importantMetrics: ['leadsCount', 'conversionRate', 'burnRate', 'infraCost'],
        questionTemplates: {
            curriculum: 'Describe your core courses and pricing structures.',
            engagement: 'What is your average student retention rate across courses?'
        },
        constraints: ['Course Completion > 80%', 'Student Retention > 90%']
    },
    Agency: {
        industry: 'Agency',
        requiredCategories: ['identity', 'model', 'products-services', 'marketing', 'sales', 'finance', 'operations'],
        suggestedDiscoveryOrder: ['identity', 'model', 'products-services', 'finance', 'sales', 'marketing', 'operations'],
        coverageWeights: {
            identity: 0.1,
            model: 0.1,
            'products-services': 0.15,
            finance: 0.25,
            sales: 0.15,
            marketing: 0.1,
            operations: 0.15
        },
        priorityKPIs: ['Resource Utilization Rate', 'Project Gross Margin', 'Client Retention Rate', 'Average Billable Rate'],
        importantMetrics: ['burnRate', 'headcount', 'leadsCount', 'conversionRate'],
        questionTemplates: {
            billable: 'What is your average hourly billable rate and project utilization?',
            sales: 'How do you generate new client contract leads?'
        },
        constraints: ['Resource Utilization > 75%', 'Project Gross Margin > 50%']
    },
    Agriculture: {
        industry: 'Agriculture',
        requiredCategories: ['identity', 'model', 'products-services', 'operations', 'finance'],
        suggestedDiscoveryOrder: ['identity', 'model', 'products-services', 'finance', 'operations'],
        coverageWeights: {
            identity: 0.1,
            model: 0.1,
            'products-services': 0.2,
            finance: 0.3,
            operations: 0.3
        },
        priorityKPIs: ['Yield per Acre', 'Operating Expense Ratio', 'Asset Turnover', 'Market Price Variance'],
        importantMetrics: ['burnRate', 'headcount'],
        questionTemplates: {
            crops: 'What crop/livestock classifications compose your primary yield revenue?',
            machinery: 'Detail your annual machinery lease and maintenance costs.'
        },
        constraints: ['Debt-to-Asset Ratio < 40%', 'Operating Expense Ratio < 70%']
    },
    Construction: {
        industry: 'Construction',
        requiredCategories: ['identity', 'model', 'products-services', 'operations', 'finance'],
        suggestedDiscoveryOrder: ['identity', 'model', 'products-services', 'finance', 'operations'],
        coverageWeights: {
            identity: 0.1,
            model: 0.1,
            'products-services': 0.2,
            finance: 0.3,
            operations: 0.3
        },
        priorityKPIs: ['Project Backlog Ratio', 'Cost Variance (CV)', 'Schedule Variance (SV)', 'Subcontractor Ratio'],
        importantMetrics: ['burnRate', 'headcount'],
        questionTemplates: {
            bids: 'What is your average win rate for submitted project bids?',
            bonded: 'Are your operations fully bonded and insured up to standard contract values?'
        },
        constraints: ['Bid Win Rate > 20%', 'Project Cost Overruns < 5%']
    },
    Logistics: {
        industry: 'Logistics',
        requiredCategories: ['identity', 'model', 'operations', 'finance', 'technology'],
        suggestedDiscoveryOrder: ['identity', 'model', 'finance', 'operations', 'technology'],
        coverageWeights: {
            identity: 0.1,
            model: 0.1,
            finance: 0.3,
            operations: 0.3,
            technology: 0.2
        },
        priorityKPIs: ['On-Time Delivery (OTD)', 'Fuel Efficiency Rate', 'Warehouse Capacity Utilization', 'Cost per Mile'],
        importantMetrics: ['burnRate', 'headcount', 'infraCost'],
        questionTemplates: {
            fleet: 'Describe your fleet size, fuel efficiencies, and routing software integrations.',
            warehousing: 'What is your current warehouse storage capacity utilization percentage?'
        },
        constraints: ['On-Time Delivery > 98%', 'Warehouse Capacity Utilization > 80%']
    }
};
class KnowledgePackManager {
    static getPack(industry) {
        return exports.INDUSTRY_KNOWLEDGE_PACKS[industry] || exports.INDUSTRY_KNOWLEDGE_PACKS['SaaS'];
    }
    static listPacks() {
        return Object.keys(exports.INDUSTRY_KNOWLEDGE_PACKS);
    }
}
exports.KnowledgePackManager = KnowledgePackManager;
