"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeHealthService = void 0;
const prisma_1 = require("../../database/prisma");
const client_1 = require("@prisma/client");
class KnowledgeHealthService {
    /**
     * Computes comprehensive health stats logs for a business.
     */
    static async getHealth(businessId) {
        const stats = await prisma_1.prisma.knowledgeStatistics.findUnique({
            where: { businessId }
        });
        // Compute distributions
        const activeChunks = await prisma_1.prisma.knowledgeChunk.count({
            where: { businessId, status: client_1.ChunkStatus.ACTIVE }
        });
        const staleChunks = await prisma_1.prisma.knowledgeChunk.count({
            where: { businessId, status: client_1.ChunkStatus.STALE }
        });
        const docCount = await prisma_1.prisma.uploadedDocument.count({ where: { businessId } });
        const webCount = await prisma_1.prisma.websitePage.count({
            where: { analysisRun: { website: { businessId } } }
        });
        const categoryDistribution = [
            { name: 'Financial', count: docCount },
            { name: 'Website Crawls', count: webCount }
        ];
        const sourceDistribution = [
            { name: 'Uploaded Documents', count: docCount },
            { name: 'Crawled Web Pages', count: webCount }
        ];
        return {
            freshnessScore: stats?.freshnessScore ?? 100.0,
            coverageScore: stats?.coverageScore ?? 85.0,
            sourceDiversityScore: stats?.sourceDiversityScore ?? 90.0,
            versionHealthScore: stats?.versionHealthScore ?? 100.0,
            reviewHealthScore: stats?.reviewHealthScore ?? 100.0,
            outdatedDocsCount: staleChunks,
            outdatedPagesCount: 0,
            knowledgeGapsCount: 0,
            sourceDistribution,
            categoryDistribution
        };
    }
}
exports.KnowledgeHealthService = KnowledgeHealthService;
