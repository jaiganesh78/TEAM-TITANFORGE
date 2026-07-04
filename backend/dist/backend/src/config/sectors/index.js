"use strict";
// Sector Manager — loads and exposes sector configurations
// All AI engines query this manager for sector-specific context.
// Never hardcode sector logic in business services.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectorManager = void 0;
const saas_1 = require("./saas");
const ecommerce_1 = require("./ecommerce");
const professional_services_1 = require("./professional-services");
const retail_1 = require("./retail");
const marketplace_1 = require("./marketplace");
const kpis_1 = require("../kpis");
const QuestionLibrary_1 = require("../../services/discovery/QuestionLibrary");
// ================================================================
// SECTOR REGISTRY
// ================================================================
const SECTOR_REGISTRY = [
    saas_1.SaaSSector,
    ecommerce_1.EcommerceSector,
    professional_services_1.ProfessionalServicesSector,
    retail_1.RetailSector,
    marketplace_1.MarketplaceSector
];
// ================================================================
// SECTOR MANAGER
// ================================================================
class SectorManager {
    /**
     * Returns all active sector configurations.
     */
    static getAllSectors() {
        return SECTOR_REGISTRY.filter(s => s.isActive);
    }
    /**
     * Returns a sector configuration by slug.
     * Falls back to a generic default if slug is not found.
     */
    static getSector(slug) {
        const sector = SECTOR_REGISTRY.find(s => s.slug === slug && s.isActive);
        if (!sector) {
            return this.getDefaultSector();
        }
        return sector;
    }
    /**
     * Returns all KPI definitions relevant to a sector.
     */
    static getKpisForSector(slug) {
        const sector = this.getSector(slug);
        return kpis_1.KPIRegistry.getBySlugs(sector.kpiSlugs);
    }
    /**
     * Returns questions from the library that apply to this sector,
     * ordered by sector-specific priority overrides.
     */
    static getQuestionsForSector(slug) {
        const sector = this.getSector(slug);
        const overrides = sector.questionPriorities;
        return QuestionLibrary_1.QUESTION_LIBRARY
            .filter(q => q.industrySupport.includes('*') || q.industrySupport.includes(slug))
            .sort((a, b) => {
            const pa = overrides[a.id] ?? a.discoveryPriority ?? 50;
            const pb = overrides[b.id] ?? b.discoveryPriority ?? 50;
            return pb - pa; // descending priority
        });
    }
    /**
     * Returns the AI prompt template for a specific engine in this sector.
     */
    static getPromptTemplate(slug, engineId) {
        const sector = this.getSector(slug);
        return sector.futureAIPromptTemplates[engineId] ?? `You are an AI ${engineId} expert analysing a ${sector.displayName} business. Provide growth recommendations.`;
    }
    /**
     * Returns all discovery domains required by this sector.
     */
    static getRequiredDomains(slug) {
        return this.getSector(slug).requiredDiscoveryDomains;
    }
    /**
     * Returns sector-specific growth bottlenecks.
     */
    static getGrowthBottlenecks(slug) {
        return this.getSector(slug).growthBottlenecks;
    }
    /**
     * Returns common pain points for a sector.
     */
    static getPainPoints(slug) {
        return this.getSector(slug).commonPainPoints;
    }
    /**
     * Returns typical AI opportunities for a sector.
     */
    static getAIOpportunities(slug) {
        return this.getSector(slug).typicalAIOpportunities;
    }
    /**
     * Returns a generic fallback sector for unrecognised slugs.
     */
    static getDefaultSector() {
        return {
            slug: 'generic',
            displayName: 'Generic Business',
            description: 'A general business without a specific sector configuration.',
            businessTerminology: {},
            kpiSlugs: ['cac', 'ltv', 'ltv_cac_ratio', 'conversion_rate', 'nps'],
            requiredDiscoveryDomains: ['MARKETING', 'SALES', 'CUSTOMER_SEGMENTS', 'GROWTH_METRICS'],
            marketingChannels: ['Digital advertising', 'Content marketing', 'Email', 'Social media'],
            leadGenerationChannels: ['Website', 'Referrals', 'Paid ads'],
            salesProcessSteps: ['Lead', 'Qualification', 'Proposal', 'Close'],
            customerSuccessMetrics: ['NPS', 'Retention rate', 'Support satisfaction'],
            competitiveDimensions: ['Price', 'Quality', 'Service', 'Delivery speed'],
            questionPriorities: {},
            growthConstraints: ['Limited marketing budget', 'Small team capacity'],
            businessLifecycle: { stages: [] },
            customerJourney: { stages: [] },
            marketingFunnel: { stages: [] },
            salesFunnel: { stages: [], avgCycleDays: 14, benchmarkWinRate: 20 },
            commonPainPoints: ['Inconsistent revenue', 'Low brand awareness'],
            buyingBehaviour: { decisionMakers: ['Owner'], avgDecisionTimeWeeks: 1, keyBuyingFactors: ['Price', 'Quality'], commonObjections: [] },
            commonRisks: ['Cash flow risk', 'Market changes'],
            typicalKpis: ['cac', 'ltv', 'conversion_rate'],
            typicalCompetitors: { competitionStyle: 'General market competition.', watchSignals: [] },
            growthBottlenecks: ['Limited brand awareness', 'No systematic lead generation'],
            typicalAIOpportunities: ['Marketing automation', 'Customer segmentation', 'Revenue forecasting'],
            futureAIPromptTemplates: { 'strategy-engine': 'You are a business growth strategist. Provide top 3 growth recommendations.' },
            isActive: true
        };
    }
}
exports.SectorManager = SectorManager;
