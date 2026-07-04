import { LibraryQuestion } from './QuestionLibrary';
import { QuestionEngine } from './QuestionEngine';
import { prisma } from '../../database/prisma';

export interface MissingInfoAlert {
  questionId: string;
  fieldPath: string;
  category: string;
  priority: string;
  message: string;
}

export class MissingInformationEngine {
  /**
   * Scans the business profile twin and detects missing critical or high priority metrics.
   * Generates actionable consultant-style warnings.
   */
  static async detectMissing(
    businessId: string,
    activeQuestions: LibraryQuestion[]
  ): Promise<MissingInfoAlert[]> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        identity: true,
        profile: true,
        model: true,
        marketingProfile: true,
        salesProfile: true,
        operationsProfile: true,
        technologyProfile: true,
        organizationStructure: true
      }
    });

    if (!business) return [];

    const alerts: MissingInfoAlert[] = [];

    // Filter questions that are critical or high, and are not filled
    for (const q of activeQuestions) {
      if (q.priority !== 'CRITICAL' && q.priority !== 'HIGH') {
        continue;
      }

      const val = QuestionEngine.extractValue(business, q.dbPath);
      const isFilled = val !== null && val !== undefined && val !== '';

      if (!isFilled) {
        let message = `We recommend entering details for ${q.title} to complete your profile twin.`;
        if (q.id === 'model_val_prop') {
          message = 'We recommend defining your Core Value Proposition to guide your business strategy.';
        } else if (q.id === 'fin_burn_rate') {
          message = 'Financial Cash Burn Rate is not set. We recommend entering it to calculate runway projections.';
        } else if (q.id === 'mkt_ad_spend') {
          message = 'Customer acquisition ad spend is unconfigured. We recommend adding it to optimize your marketing ROI.';
        }

        alerts.push({
          questionId: q.id,
          fieldPath: q.dbPath,
          category: q.category,
          priority: q.priority,
          message
        });
      }
    }

    return alerts;
  }
}
