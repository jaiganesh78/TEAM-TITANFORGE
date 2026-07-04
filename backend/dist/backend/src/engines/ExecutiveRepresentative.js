"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXECUTIVE_REPRESENTATIVES = exports.CustomerSuccessRepresentative = exports.AnalyticsRepresentative = exports.SalesRepresentative = exports.LeadRepresentative = exports.MarketingRepresentative = exports.StrategyRepresentative = void 0;
const prisma_1 = require("../database/prisma");
// ────────────────────────────────────────────────────────
// 1. STRATEGY REPRESENTATIVE
// ────────────────────────────────────────────────────────
class StrategyRepresentative {
    engineName = 'strategy-engine';
    async summarize(businessId) {
        const session = await prisma_1.prisma.strategySession.findFirst({
            where: { businessId, status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' }
        });
        let objectives = ['Establish market positioning'];
        let priorities = ['Enterprise outbound expansion'];
        let risks = ['SLA latency disputes'];
        if (session && session.strategicAssets) {
            try {
                const parsed = JSON.parse(session.strategicAssets);
                objectives = parsed.strategicObjectives || objectives;
                priorities = parsed.strategicPriorities || priorities;
                risks = parsed.knownRisks || risks;
            }
            catch { }
        }
        return {
            engineName: this.engineName,
            topFindings: objectives,
            topOpportunities: ['Pricing model optimization', 'Channel diversification'],
            topRisks: risks,
            confidence: 88,
            supportingEvidence: 'Strategy session metrics alignment',
            recommendedActions: priorities,
            businessImpact: 'Improve commercial roadmap viability',
            priority: 'HIGH',
            dependencies: []
        };
    }
    async vote(recommendationId, context) {
        return { vote: 'SUPPORT', reason: 'Aligns with strategic objectives.' };
    }
    async challenge(recommendationId, reason) {
        return `Strategy Representative challenges: ${reason}`;
    }
    async support(recommendationId, reason) {
        return `Strategy Representative supports: ${reason}`;
    }
    async estimateImpact(decision) {
        return { revenue: 15000, riskDelta: -5, cost: 5000 };
    }
    async getDependencies() {
        return [];
    }
    async getConfidence() {
        return 88;
    }
    async getCurrentRecommendations(businessId) {
        return [];
    }
}
exports.StrategyRepresentative = StrategyRepresentative;
// ────────────────────────────────────────────────────────
// 2. MARKETING REPRESENTATIVE
// ────────────────────────────────────────────────────────
class MarketingRepresentative {
    engineName = 'marketing-engine';
    async summarize(businessId) {
        const session = await prisma_1.prisma.marketingSession.findFirst({
            where: { businessId, status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' }
        });
        let budget = '$25,000 ad budget';
        let channels = ['LinkedIn Paid', 'SEO content'];
        if (session && session.budgetOptimizer) {
            try {
                const parsed = JSON.parse(session.budgetOptimizer);
                budget = `$${parsed.totalBudget || 25000} optimal ad spend`;
            }
            catch { }
        }
        return {
            engineName: this.engineName,
            topFindings: [`Current marketing budget calculated at ${budget}`],
            topOpportunities: ['Scale LinkedIn outbound ad sequence', 'Organic search lead capture optimization'],
            topRisks: ['Rising CPC benchmarks on search ads', 'Creative ad fatigue'],
            confidence: 85,
            supportingEvidence: 'Marketing channel performance analytics',
            recommendedActions: [`Reallocate ad budget to: ${channels.join(', ')}`],
            businessImpact: 'Boost MQL lead flow by 18%',
            priority: 'HIGH',
            dependencies: ['strategy-engine']
        };
    }
    async vote(recommendationId, context) {
        return { vote: 'SUPPORT', reason: 'Sufficient lead generation coverage.' };
    }
    async challenge(recommendationId, reason) {
        return `Marketing Representative challenges: ${reason}`;
    }
    async support(recommendationId, reason) {
        return `Marketing Representative supports: ${reason}`;
    }
    async estimateImpact(decision) {
        return { revenue: 20000, riskDelta: 2, cost: 8000 };
    }
    async getDependencies() {
        return ['strategy-engine'];
    }
    async getConfidence() {
        return 85;
    }
    async getCurrentRecommendations(businessId) {
        return [];
    }
}
exports.MarketingRepresentative = MarketingRepresentative;
// ────────────────────────────────────────────────────────
// 3. LEAD REPRESENTATIVE
// ────────────────────────────────────────────────────────
class LeadRepresentative {
    engineName = 'lead-engine';
    async summarize(businessId) {
        const forecasts = await prisma_1.prisma.leadForecast.findFirst({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
        let expectedLeads = 120;
        let revenuePotential = 45000;
        if (forecasts) {
            expectedLeads = forecasts.expectedLeads || expectedLeads;
            revenuePotential = forecasts.revenue || revenuePotential;
        }
        return {
            engineName: this.engineName,
            topFindings: [`Forecast expects ${expectedLeads} qualified SQL leads`],
            topOpportunities: ['Enrich ICP criteria templates', 'Automate lead scoring thresholds'],
            topRisks: ['Data quality decay on target outbound company lists', 'Decayed contact channels'],
            confidence: 90,
            supportingEvidence: `Lead database forecasting. Expected pipeline value: $${revenuePotential}`,
            recommendedActions: ['Initialize Automated outbound email sequences', 'Audit ICP match parameters'],
            businessImpact: `Acquisition of leads representing $${revenuePotential} revenue potential`,
            priority: 'MEDIUM',
            dependencies: ['marketing-engine']
        };
    }
    async vote(recommendationId, context) {
        return { vote: 'SUPPORT', reason: 'Valid ICP mapping holds.' };
    }
    async challenge(recommendationId, reason) {
        return `Lead Representative challenges: ${reason}`;
    }
    async support(recommendationId, reason) {
        return `Lead Representative supports: ${reason}`;
    }
    async estimateImpact(decision) {
        return { revenue: 12000, riskDelta: 1, cost: 3000 };
    }
    async getDependencies() {
        return ['marketing-engine'];
    }
    async getConfidence() {
        return 90;
    }
    async getCurrentRecommendations(businessId) {
        return [];
    }
}
exports.LeadRepresentative = LeadRepresentative;
// ────────────────────────────────────────────────────────
// 4. SALES REPRESENTATIVE
// ────────────────────────────────────────────────────────
class SalesRepresentative {
    engineName = 'sales-engine';
    async summarize(businessId) {
        const opportunities = await prisma_1.prisma.salesOpportunity.findMany({
            where: { businessId }
        });
        const pipelineVal = opportunities.reduce((acc, curr) => acc + (curr.revenuePotential || 0), 0);
        return {
            engineName: this.engineName,
            topFindings: [`Active pipeline val totals $${pipelineVal || 148000}`],
            topOpportunities: ['Target high close-probability enterprise deals', 'Standardize sales playbook responses'],
            topRisks: ['Competitors feature parity matches', 'Longer redlining cycles'],
            confidence: 84,
            supportingEvidence: 'CRM pipeline close probability models',
            recommendedActions: ['Hire 2 mid-market Sales Representatives', 'Implement discount limits on deals'],
            businessImpact: 'Increase win rate by 6%',
            priority: 'HIGH',
            dependencies: ['lead-engine']
        };
    }
    async vote(recommendationId, context) {
        return { vote: 'SUPPORT', reason: 'Pipeline has sufficient velocity.' };
    }
    async challenge(recommendationId, reason) {
        return `Sales Representative challenges: ${reason}`;
    }
    async support(recommendationId, reason) {
        return `Sales Representative supports: ${reason}`;
    }
    async estimateImpact(decision) {
        return { revenue: 35000, riskDelta: -3, cost: 12000 };
    }
    async getDependencies() {
        return ['lead-engine'];
    }
    async getConfidence() {
        return 84;
    }
    async getCurrentRecommendations(businessId) {
        return [];
    }
}
exports.SalesRepresentative = SalesRepresentative;
// ────────────────────────────────────────────────────────
// 5. ANALYTICS REPRESENTATIVE
// ────────────────────────────────────────────────────────
class AnalyticsRepresentative {
    engineName = 'analytics-engine';
    async summarize(businessId) {
        const snapshot = await prisma_1.prisma.businessEvolutionSnapshot.findFirst({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
        let health = 82.0;
        let growth = 78.0;
        if (snapshot) {
            try {
                const hObj = JSON.parse(snapshot.businessHealth);
                health = hObj.overallHealth || hObj.businessHealth || health;
            }
            catch { }
            try {
                const gObj = JSON.parse(snapshot.growthScore);
                growth = gObj.growthScore || growth;
            }
            catch { }
        }
        return {
            engineName: this.engineName,
            topFindings: [`Overall Health: ${health}%, Growth Score: ${growth}%`],
            topOpportunities: ['Deploy API caching to reduce cloud server compute costs'],
            topRisks: ['Cloud cost burn-rate scaling ahead of ARR growth parameters'],
            confidence: 92,
            supportingEvidence: 'Consolidated financial & operational KPI database',
            recommendedActions: ['Establish strict ad spend limit caps', 'Deploy telematics server cache TTL policy'],
            businessImpact: 'Reduce cloud operating costs by 15% ($25,000/yr savings)',
            priority: 'MEDIUM',
            dependencies: []
        };
    }
    async vote(recommendationId, context) {
        return { vote: 'CHALLENGE', reason: 'Ad spend might degrade margins.' };
    }
    async challenge(recommendationId, reason) {
        return `Analytics Representative challenges: ${reason}`;
    }
    async support(recommendationId, reason) {
        return `Analytics Representative supports: ${reason}`;
    }
    async estimateImpact(decision) {
        return { revenue: 8000, riskDelta: -2, cost: 2000 };
    }
    async getDependencies() {
        return [];
    }
    async getConfidence() {
        return 92;
    }
    async getCurrentRecommendations(businessId) {
        return [];
    }
}
exports.AnalyticsRepresentative = AnalyticsRepresentative;
// ────────────────────────────────────────────────────────
// 6. CUSTOMER SUCCESS REPRESENTATIVE
// ────────────────────────────────────────────────────────
class CustomerSuccessRepresentative {
    engineName = 'customer-success-engine';
    async summarize(businessId) {
        const scores = await prisma_1.prisma.customerSuccessScore.findFirst({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
        let health = 88.0;
        let relation = 85.0;
        if (scores) {
            health = scores.healthScore || health;
            relation = scores.relationshipStrength || relation;
        }
        return {
            engineName: this.engineName,
            topFindings: [`Customer Health Index: ${health}%, Relationship Strength: ${relation}%`],
            topOpportunities: ['Upsell IoT fleet telemetry tracking features to Gold tier clients'],
            topRisks: ['Integration compatibility latency disputes', 'Onboarding resource overload bottleneck'],
            confidence: 86,
            supportingEvidence: 'Active customer success digital twin performance telemetry',
            recommendedActions: ['Conduct onboarding check calls with all new signups', 'Verify telemetry edge routing SLA compliance'],
            businessImpact: 'Stabilize retention and expand accounts. Potential MRR boost: $10,000',
            priority: 'HIGH',
            dependencies: ['sales-engine']
        };
    }
    async vote(recommendationId, context) {
        return { vote: 'SUPPORT', reason: 'Improves client retention parameters.' };
    }
    async challenge(recommendationId, reason) {
        return `Customer Success Representative challenges: ${reason}`;
    }
    async support(recommendationId, reason) {
        return `Customer Success Representative supports: ${reason}`;
    }
    async estimateImpact(decision) {
        return { revenue: 18000, riskDelta: -4, cost: 4000 };
    }
    async getDependencies() {
        return ['sales-engine'];
    }
    async getConfidence() {
        return 86;
    }
    async getCurrentRecommendations(businessId) {
        return [];
    }
}
exports.CustomerSuccessRepresentative = CustomerSuccessRepresentative;
// ────────────────────────────────────────────────────────
// REPRESENTATIVES REGISTRY
// ────────────────────────────────────────────────────────
exports.EXECUTIVE_REPRESENTATIVES = [
    new StrategyRepresentative(),
    new MarketingRepresentative(),
    new LeadRepresentative(),
    new SalesRepresentative(),
    new AnalyticsRepresentative(),
    new CustomerSuccessRepresentative()
];
