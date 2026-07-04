"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessContextService = void 0;
const prisma_1 = require("../../database/prisma");
const RetrievalService_1 = require("./RetrievalService");
const sectors_1 = require("../../config/sectors");
const contracts_1 = require("../../engines/contracts");
class BusinessContextService {
    /**
     * Assembles a structured ContextPackage object for a given topic.
     */
    static async assembleContext(businessId, topic) {
        // 1. Fetch digital twin details
        const biz = await prisma_1.prisma.business.findUnique({
            where: { id: businessId },
            include: {
                identity: true,
                model: true,
                constraints: true,
                kpis: true,
                growthDomainStates: true,
                growthTwinSummary: true,
                aiOperatingContext: true
            }
        });
        const summary = {
            legalName: biz?.identity?.legalName || biz?.name || 'Unknown Corp',
            industry: biz?.identity?.industry || 'Enterprise Solutions',
            description: biz?.identity?.description || 'Corporate Digital Twin entity.'
        };
        // 2. Retrieve matched knowledge chunks using our RAG Retrieval pipeline
        const chunks = await RetrievalService_1.RetrievalService.retrieve({ businessId, query: topic, limit: 3 });
        // 3. Retrieve matching evidence traces
        const evidences = await prisma_1.prisma.businessEvidence.findMany({
            where: { businessId },
            take: 5
        });
        // 4. Resolve unique source list
        const sources = Array.from(new Set(chunks.map(c => c.source).filter(Boolean)));
        // 5. Gather gaps and constraints
        const constraintsList = (biz?.constraints.map(c => c.description).filter(Boolean) || []);
        const missingKnowledge = [];
        // Calculate overall confidence average
        const totalConf = chunks.reduce((acc, c) => acc + c.explainability.confidence, 0.0);
        const avgConfidence = chunks.length > 0 ? totalConf / chunks.length : 85.0;
        // Resolve sector configuration details
        const sectorSlug = biz?.growthTwinSummary?.sectorSlug || biz?.identity?.industry?.toLowerCase() || 'generic';
        const sectorConfig = sectors_1.SectorManager.getSector(sectorSlug);
        return {
            businessSummary: summary,
            digitalTwinData: {
                identity: biz?.identity || null,
                model: biz?.model || null
            },
            relevantKnowledge: chunks,
            evidence: evidences,
            confidence: parseFloat(avgConfidence.toFixed(1)),
            sources,
            constraints: constraintsList,
            missingKnowledge,
            // Sprint 7 Additions
            growthTwinSummary: biz?.growthTwinSummary || null,
            growthDomainStates: biz?.growthDomainStates || [],
            aiOperatingContext: biz?.aiOperatingContext || null,
            sectorConfig,
            growthKpis: biz?.kpis || [],
            engineContracts: contracts_1.ALL_ENGINE_CONTRACTS
        };
    }
    /**
     * Generates and persists an immutable ContextSnapshot.
     */
    static async createSnapshot(businessId, topic, version) {
        const pkg = await this.assembleContext(businessId, topic);
        // Fetch versions
        const docVer = await prisma_1.prisma.knowledgeVersion.count({
            where: { businessId, entityType: 'DOCUMENT' }
        });
        const webVer = await prisma_1.prisma.knowledgeVersion.count({
            where: { businessId, entityType: 'WEBSITE' }
        });
        return prisma_1.prisma.contextSnapshot.create({
            data: {
                businessId,
                contextVersion: version,
                digitalTwinVersion: 1,
                knowledgeVersion: docVer + webVer,
                sourcesUsed: pkg.sources,
                confidenceSummary: pkg.confidence,
                topic,
                payload: JSON.stringify(pkg)
            }
        });
    }
    /**
     * Fetches all snapshots for a business.
     */
    static async getSnapshots(businessId) {
        return prisma_1.prisma.contextSnapshot.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
exports.BusinessContextService = BusinessContextService;
