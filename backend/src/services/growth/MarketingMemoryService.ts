import { prisma } from '../../database/prisma';

export interface MarketingCampaignMemoryRecord {
  campaignId: string;
  name: string;
  channel: string;
  status: string; // APPROVED | REJECTED | PENDING
  feedbackText?: string;
  createdAt: Date;
}

export class MarketingMemoryService {
  /**
   * Fetches historical marketing performance logs and campaign outcomes for a business.
   */
  static async getCampaignHistory(businessId: string): Promise<MarketingCampaignMemoryRecord[]> {
    const campaigns = await prisma.marketingCampaign.findMany({
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
  static async getCampaignHistorySummary(businessId: string): Promise<string> {
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
