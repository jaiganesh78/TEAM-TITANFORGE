"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const prisma_1 = require("../../database/prisma");
const client_1 = require("@prisma/client");
const KnowledgeSyncService_1 = require("./KnowledgeSyncService");
const EvidenceService_1 = require("./EvidenceService");
const DiscoveryEngine_1 = require("../discovery/DiscoveryEngine");
const errorMiddleware_1 = require("../../middleware/errorMiddleware");
class ReviewService {
    /**
     * Retrieves pending review candidates for a business.
     */
    static async getPendingCandidates(businessId) {
        return prisma_1.prisma.extractedCandidate.findMany({
            where: {
                businessId,
                status: client_1.ExtractionStatus.PENDING_REVIEW
            },
            orderBy: { confidence: 'desc' }
        });
    }
    /**
     * Accepts a single candidate suggestion, optionally overriding its value.
     */
    static async acceptCandidate(candidateId, reviewerId, editedValue) {
        const cand = await prisma_1.prisma.extractedCandidate.findUnique({
            where: { id: candidateId }
        });
        if (!cand) {
            throw new errorMiddleware_1.AppError('Candidate suggestion not found.', 404, 'NOT_FOUND');
        }
        const finalValue = editedValue !== undefined ? editedValue : cand.value;
        // 1. Update candidate status
        await prisma_1.prisma.extractedCandidate.update({
            where: { id: candidateId },
            data: { status: client_1.ExtractionStatus.ACCEPTED, value: finalValue }
        });
        // 2. Write Review Action log
        await prisma_1.prisma.reviewAction.create({
            data: {
                businessId: cand.businessId,
                candidateId,
                action: 'ACCEPT',
                userId: reviewerId,
                notes: editedValue ? `Edited value to: ${editedValue}` : 'Accepted suggestion directly.'
            }
        });
        // 3. Write Business Evidence trace record
        await EvidenceService_1.EvidenceService.addEvidence({
            businessId: cand.businessId,
            fieldPath: cand.fieldPath,
            value: finalValue,
            sourceType: cand.sourceType,
            confidence: cand.confidence,
            origin: cand.sourceType === 'WEBSITE' ? 'Website Crawler' : 'Uploaded Document',
            exactLocation: 'Body paragraph context extraction',
            reviewer: reviewerId,
            reviewTimestamp: new Date()
        });
        // 4. Update the Digital Twin value & recalculate Discovery progress metrics
        await KnowledgeSyncService_1.KnowledgeSyncService.applyUpdate(cand.businessId, cand.fieldPath, finalValue, cand.sourceType);
        // 5. Trigger Discovery Engine re-evaluation live
        return DiscoveryEngine_1.DiscoveryEngine.evaluateState(cand.businessId);
    }
    /**
     * Rejects a single candidate suggestion.
     */
    static async rejectCandidate(candidateId, reviewerId) {
        const cand = await prisma_1.prisma.extractedCandidate.findUnique({
            where: { id: candidateId }
        });
        if (!cand) {
            throw new errorMiddleware_1.AppError('Candidate suggestion not found.', 404, 'NOT_FOUND');
        }
        await prisma_1.prisma.extractedCandidate.update({
            where: { id: candidateId },
            data: { status: client_1.ExtractionStatus.REJECTED }
        });
        await prisma_1.prisma.reviewAction.create({
            data: {
                businessId: cand.businessId,
                candidateId,
                action: 'REJECT',
                userId: reviewerId
            }
        });
        return { success: true };
    }
    /**
     * Performs bulk review operations for matching suggestions list.
     */
    static async bulkReview(candidateIds, action, reviewerId) {
        const results = [];
        for (const cid of candidateIds) {
            try {
                if (action === 'ACCEPT') {
                    await this.acceptCandidate(cid, reviewerId);
                }
                else {
                    await this.rejectCandidate(cid, reviewerId);
                }
                results.push({ id: cid, status: 'SUCCESS' });
            }
            catch (err) {
                results.push({ id: cid, status: 'FAILED', error: err.message });
            }
        }
        return results;
    }
}
exports.ReviewService = ReviewService;
