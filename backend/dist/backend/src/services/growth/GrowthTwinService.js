"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrowthTwinService = void 0;
const prisma_1 = require("../../database/prisma");
const ALL_DOMAINS = [
    'BUSINESS_FOUNDATION', 'MARKET_POSITION', 'BRAND_POSITIONING',
    'PRODUCT_PORTFOLIO', 'CUSTOMER_SEGMENTS', 'CUSTOMER_PERSONAS',
    'MARKETING', 'LEAD_GENERATION', 'SALES', 'CUSTOMER_SUCCESS',
    'COMPETITORS', 'PRICING', 'GROWTH_METRICS', 'BUSINESS_GOALS',
    'BUSINESS_CONSTRAINTS', 'RISKS', 'GROWTH_OPPORTUNITIES'
];
class GrowthTwinService {
    /**
     * Initialises all 17 Growth Domain states for a business if they don't exist.
     */
    static async initDomains(businessId) {
        for (const domain of ALL_DOMAINS) {
            await prisma_1.prisma.growthDomainState.upsert({
                where: { businessId_domain: { businessId, domain } },
                update: {},
                create: { businessId, domain }
            });
        }
    }
    /**
     * Updates a growth domain state and records history.
     */
    static async syncDomain(businessId, domain, updates) {
        const existing = await prisma_1.prisma.growthDomainState.upsert({
            where: { businessId_domain: { businessId, domain } },
            update: {},
            create: { businessId, domain }
        });
        const gap = this.computeGapSeverity(updates.currentState, updates.desiredState);
        const updated = await prisma_1.prisma.growthDomainState.update({
            where: { businessId_domain: { businessId, domain } },
            data: {
                currentState: updates.currentState ? JSON.stringify(updates.currentState) : undefined,
                desiredState: updates.desiredState ? JSON.stringify(updates.desiredState) : undefined,
                gap: gap.gap.length > 0 ? JSON.stringify(gap.gap) : undefined,
                gapSeverity: gap.gapSeverity,
                confidence: updates.confidence ?? existing.confidence,
                evidenceIds: updates.evidenceIds ?? existing.evidenceIds,
                knowledgeSources: updates.knowledgeSources ?? existing.knowledgeSources,
                lastUpdated: new Date(),
                version: { increment: 1 }
            }
        });
        // Append history record
        await prisma_1.prisma.growthDomainHistory.create({
            data: {
                domainStateId: updated.id,
                businessId,
                domain,
                snapshot: JSON.stringify(updated),
                version: updated.version,
                changedBy: updates.changedBy ?? 'SYSTEM'
            }
        });
        // Refresh summary
        await this.refreshSummary(businessId);
        return updated;
    }
    /**
     * Returns all 17 domain states for a business.
     */
    static async getDomains(businessId) {
        const states = await prisma_1.prisma.growthDomainState.findMany({
            where: { businessId },
            orderBy: { domain: 'asc' }
        });
        // Ensure all 17 domains exist
        if (states.length < ALL_DOMAINS.length) {
            await this.initDomains(businessId);
            return prisma_1.prisma.growthDomainState.findMany({ where: { businessId }, orderBy: { domain: 'asc' } });
        }
        return states;
    }
    /**
     * Returns or creates the Growth Twin Summary for a business.
     */
    static async getSummary(businessId) {
        let summary = await prisma_1.prisma.growthTwinSummary.findUnique({ where: { businessId } });
        if (!summary) {
            summary = await prisma_1.prisma.growthTwinSummary.create({
                data: { businessId }
            });
        }
        return summary;
    }
    /**
     * Returns the history for a specific domain.
     */
    static async getHistory(businessId, domain) {
        return prisma_1.prisma.growthDomainHistory.findMany({
            where: { businessId, domain },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
    /**
     * Syncs the Growth Twin from the Business Digital Twin data.
     * Maps existing BDT data into growth domain states.
     */
    static async syncFromBusinessTwin(businessId) {
        const business = await prisma_1.prisma.business.findUnique({
            where: { id: businessId },
            include: {
                identity: true,
                profile: true,
                model: true,
                marketingProfile: true,
                salesProfile: true,
                operationsProfile: true,
                products: true,
                services: true,
                customerSegments: true,
                customerPersonas: true,
                competitors: true,
                goals: true,
                constraints: true,
                risks: true,
                kpis: true
            }
        });
        if (!business)
            return;
        // BUSINESS_FOUNDATION ← identity + profile + model
        if (business.identity || business.profile) {
            await this.syncDomain(businessId, 'BUSINESS_FOUNDATION', {
                currentState: {
                    legalName: business.identity?.legalName,
                    tradeName: business.identity?.tradeName,
                    founded: business.identity?.foundedYear,
                    headquarters: business.identity?.headquarters,
                    industry: business.identity?.industry,
                    vision: business.profile?.vision,
                    mission: business.profile?.mission,
                    businessModel: business.model?.type
                },
                confidence: this.calcFieldConfidence([business.identity?.legalName, business.identity?.foundedYear, business.profile?.vision]),
                changedBy: 'WEBSITE_SYNC'
            });
        }
        // PRODUCT_PORTFOLIO ← products + services
        if (business.products.length > 0 || business.services.length > 0) {
            await this.syncDomain(businessId, 'PRODUCT_PORTFOLIO', {
                currentState: {
                    products: business.products.map(p => ({ name: p.name, price: p.price })),
                    services: business.services.map(s => ({ name: s.name, rate: s.rate }))
                },
                confidence: Math.min(100, (business.products.length + business.services.length) * 20),
                changedBy: 'DOCUMENT_SYNC'
            });
        }
        // CUSTOMER_SEGMENTS ← customerSegments
        if (business.customerSegments.length > 0) {
            await this.syncDomain(businessId, 'CUSTOMER_SEGMENTS', {
                currentState: { segments: business.customerSegments.map(s => ({ name: s.segmentName, cac: s.cac, ltv: s.ltv })) },
                confidence: Math.min(100, business.customerSegments.length * 25),
                changedBy: 'DOCUMENT_SYNC'
            });
        }
        // CUSTOMER_PERSONAS ← customerPersonas
        if (business.customerPersonas.length > 0) {
            await this.syncDomain(businessId, 'CUSTOMER_PERSONAS', {
                currentState: { personas: business.customerPersonas.map(p => ({ name: p.name, demographics: p.demographics })) },
                confidence: Math.min(100, business.customerPersonas.length * 30),
                changedBy: 'DOCUMENT_SYNC'
            });
        }
        // MARKETING ← marketingProfile
        if (business.marketingProfile) {
            await this.syncDomain(businessId, 'MARKETING', {
                currentState: {
                    adSpend: business.marketingProfile.adSpend,
                    roi: business.marketingProfile.roi,
                    channels: business.marketingProfile.channelsUsed
                },
                confidence: this.calcFieldConfidence([business.marketingProfile.adSpend, business.marketingProfile.roi]),
                changedBy: 'WEBSITE_SYNC'
            });
        }
        // SALES ← salesProfile
        if (business.salesProfile) {
            await this.syncDomain(businessId, 'SALES', {
                currentState: {
                    leads: business.salesProfile.leadsCount,
                    conversionRate: business.salesProfile.conversionRate,
                    pipeline: business.salesProfile.pipelineValue,
                    cycledays: business.salesProfile.salesCycleDays
                },
                confidence: this.calcFieldConfidence([business.salesProfile.conversionRate, business.salesProfile.pipelineValue]),
                changedBy: 'WEBSITE_SYNC'
            });
        }
        // COMPETITORS
        if (business.competitors.length > 0) {
            await this.syncDomain(businessId, 'COMPETITORS', {
                currentState: { competitors: business.competitors.map(c => ({ name: c.competitorName, marketShare: c.marketShare })) },
                confidence: Math.min(100, business.competitors.length * 25),
                changedBy: 'DOCUMENT_SYNC'
            });
        }
        // BUSINESS_GOALS
        if (business.goals.length > 0) {
            await this.syncDomain(businessId, 'BUSINESS_GOALS', {
                currentState: { goals: business.goals.map(g => ({ title: g.title, progress: g.progress, target: g.targetDate })) },
                confidence: Math.min(100, business.goals.length * 25),
                changedBy: 'USER'
            });
        }
        // BUSINESS_CONSTRAINTS
        if (business.constraints.length > 0) {
            await this.syncDomain(businessId, 'BUSINESS_CONSTRAINTS', {
                currentState: { constraints: business.constraints.map(c => ({ type: c.type, description: c.description })) },
                confidence: Math.min(100, business.constraints.length * 30),
                changedBy: 'USER'
            });
        }
        // RISKS
        if (business.risks.length > 0) {
            await this.syncDomain(businessId, 'RISKS', {
                currentState: { risks: business.risks.map(r => ({ title: r.title, likelihood: r.likelihood, impact: r.impact })) },
                confidence: Math.min(100, business.risks.length * 25),
                changedBy: 'USER'
            });
        }
        // GROWTH_METRICS ← kpis
        if (business.kpis.length > 0) {
            await this.syncDomain(businessId, 'GROWTH_METRICS', {
                currentState: { kpis: business.kpis.map(k => ({ name: k.name, current: k.currentValue, target: k.targetValue })) },
                confidence: Math.min(100, business.kpis.length * 20),
                changedBy: 'USER'
            });
        }
        await this.refreshSummary(businessId);
    }
    /**
     * Recomputes and saves the GrowthTwinSummary.
     */
    static async refreshSummary(businessId) {
        const domains = await prisma_1.prisma.growthDomainState.findMany({ where: { businessId } });
        const coveredDomains = domains.filter(d => d.currentState !== null).length;
        const avgConfidence = domains.length > 0
            ? domains.reduce((sum, d) => sum + d.confidence, 0) / domains.length
            : 0;
        const highGapDomains = domains
            .filter(d => d.gapSeverity === 'HIGH' || d.gapSeverity === 'CRITICAL')
            .map(d => d.domain);
        return prisma_1.prisma.growthTwinSummary.upsert({
            where: { businessId },
            update: {
                coveredDomains,
                overallConfidence: Math.round(avgConfidence * 10) / 10,
                highGapDomains,
                lastSyncedAt: new Date()
            },
            create: {
                businessId,
                coveredDomains,
                overallConfidence: Math.round(avgConfidence * 10) / 10,
                highGapDomains,
                totalDomains: ALL_DOMAINS.length
            }
        });
    }
    /**
     * Returns or creates the AI Operating Context for a business.
     */
    static async getAIOperatingContext(businessId) {
        return prisma_1.prisma.aIOperatingContext.upsert({
            where: { businessId },
            update: {},
            create: { businessId }
        });
    }
    // ───────── Private Helpers ─────────
    static calcFieldConfidence(fields) {
        const filled = fields.filter(f => f !== null && f !== undefined && f !== '').length;
        return Math.round((filled / fields.length) * 100);
    }
    static computeGapSeverity(currentState, desiredState) {
        if (!currentState && !desiredState)
            return { gap: [], gapSeverity: 'NONE' };
        if (!currentState && desiredState)
            return { gap: ['No current state defined'], gapSeverity: 'HIGH' };
        if (currentState && !desiredState)
            return { gap: [], gapSeverity: 'NONE' };
        const current = typeof currentState === 'object' ? currentState : {};
        const desired = typeof desiredState === 'object' ? desiredState : {};
        const gaps = [];
        for (const key of Object.keys(desired)) {
            if (current[key] === undefined || current[key] === null || current[key] === '') {
                gaps.push(`Missing: ${key}`);
            }
            else if (typeof desired[key] === 'number' && typeof current[key] === 'number') {
                if (current[key] < desired[key]) {
                    gaps.push(`Below target: ${key} (current: ${current[key]}, target: ${desired[key]})`);
                }
            }
        }
        let severity = 'NONE';
        if (gaps.length === 0)
            severity = 'NONE';
        else if (gaps.length <= 2)
            severity = 'LOW';
        else if (gaps.length <= 4)
            severity = 'MEDIUM';
        else if (gaps.length <= 6)
            severity = 'HIGH';
        else
            severity = 'CRITICAL';
        return { gap: gaps, gapSeverity: severity };
    }
}
exports.GrowthTwinService = GrowthTwinService;
