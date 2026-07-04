"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingMemoryService = void 0;
const prisma_1 = require("../../database/prisma");
class MarketingMemoryService {
    /**
     * Fetches historical marketing performance logs and campaign outcomes for a business.
     */
    static async getCampaignHistory(businessId) {
        const campaigns = await prisma_1.prisma.marketingCampaign.findMany({
            where: { businessId },
            include: {
                feedback: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return campaigns.map(c => {
            const lastFeedback = c.feedback.length > 0 ? c.feedback[c.feedback.length - 1] : null;
            return {
                campaignId: c.id,
                name: c.name,
                channel: c.channel,
                status: lastFeedback ? (lastFeedback.action === 'ACCEPT' ? 'APPROVED' : lastFeedback.action === 'REJECT' ? 'REJECTED' : 'REGENERATED') : 'PENDING',
                feedbackText: lastFeedback?.feedbackText || undefined,
                createdAt: c.createdAt
            };
        });
    }
    /**
     * Generates a grounded summary string of past campaigns for LLM priming.
     */
    static async getCampaignHistorySummary(businessId) {
        const history = await this.getCampaignHistory(businessId);
        if (history.length === 0) {
            return 'HISTORICAL CAMPAIGNS LOG:\n- No previous campaign execution logs found.';
        }
        let summary = 'HISTORICAL CAMPAIGNS LOG:\n';
        history.forEach(h => {
            summary += `- Campaign: "${h.name}" on Channel: "${h.channel}" | Status: ${h.status}\n`;
            if (h.feedbackText) {
                summary += `  * Feedback: "${h.feedbackText}"\n`;
            }
        });
        return summary;
    }
}
exports.MarketingMemoryService = MarketingMemoryService;
