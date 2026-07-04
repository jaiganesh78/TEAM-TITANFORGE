"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyMemoryService = void 0;
const prisma_1 = require("../../database/prisma");
class StrategyMemoryService {
    /**
     * Fetches the historical outcome logs and decisions for a given business.
     */
    static async getStrategyMemory(businessId) {
        const recs = await prisma_1.prisma.strategyRecommendation.findMany({
            where: { businessId },
            include: {
                feedback: true,
                executionPlans: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return recs.map(r => {
            const lastFeedback = r.feedback.length > 0 ? r.feedback[r.feedback.length - 1] : null;
            const executionPlan = r.executionPlans.length > 0 ? r.executionPlans[0] : null;
            return {
                recommendationId: r.id,
                title: r.title,
                status: r.status,
                feedbackText: lastFeedback?.feedbackText || undefined,
                executionStatus: executionPlan?.status || undefined,
                createdAt: r.createdAt
            };
        });
    }
    /**
     * Returns a text summary of past strategy decisions to ground the LLM prompts.
     */
    static async getStrategyMemorySummary(businessId) {
        const memory = await this.getStrategyMemory(businessId);
        if (memory.length === 0) {
            return 'HISTORICAL DECISION LOG:\n- No previous strategic decisions recorded.';
        }
        let summary = 'HISTORICAL DECISION LOG:\n';
        memory.forEach(m => {
            summary += `- Recommendation: "${m.title}" | Status: ${m.status}\n`;
            if (m.feedbackText) {
                summary += `  * User feedback: "${m.feedbackText}"\n`;
            }
            if (m.executionStatus) {
                summary += `  * Execution status: ${m.executionStatus}\n`;
            }
        });
        return summary;
    }
}
exports.StrategyMemoryService = StrategyMemoryService;
