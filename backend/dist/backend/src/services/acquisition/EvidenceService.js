"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceService = void 0;
const prisma_1 = require("../../database/prisma");
class EvidenceService {
    /**
     * Adds or updates a traceability evidence record for a Digital Twin field.
     */
    static async addEvidence(data) {
        return prisma_1.prisma.businessEvidence.create({
            data: {
                businessId: data.businessId,
                fieldPath: data.fieldPath,
                value: data.value,
                sourceType: data.sourceType,
                confidence: data.confidence,
                origin: data.origin,
                exactLocation: data.exactLocation || null,
                pageNumber: data.pageNumber || null,
                sectionName: data.sectionName || null,
                reviewer: data.reviewer || null,
                reviewTimestamp: data.reviewTimestamp || null
            }
        });
    }
    /**
     * Returns all evidence sources supporting a specific Digital Twin field path.
     */
    static async getEvidences(businessId, fieldPath) {
        return prisma_1.prisma.businessEvidence.findMany({
            where: { businessId, fieldPath },
            orderBy: { updatedAt: 'desc' }
        });
    }
}
exports.EvidenceService = EvidenceService;
