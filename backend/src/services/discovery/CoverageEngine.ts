import { LibraryQuestion } from './QuestionLibrary';
import { QuestionEngine } from './QuestionEngine';
import { prisma } from '../../database/prisma';

export interface CoverageReport {
  overallCoverage: number; // 0-100
  categoryCoverage: Record<string, number>; // e.g. { "finance": 42 }
  metadata: Record<string, { status: string; source: string }>;
}

export class CoverageEngine {
  /**
   * Computes the information coverage/completeness for a business
   * based on the list of active questions and their database values.
   */
  static async calculateCoverage(
    businessId: string,
    activeQuestions: LibraryQuestion[]
  ): Promise<CoverageReport> {
    // 1. Fetch full business twin data including all nested profiles
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

    if (!business) {
      return { overallCoverage: 0, categoryCoverage: {}, metadata: {} };
    }

    // 2. Fetch all AnswerMetadata for this business
    const metaList = await prisma.answerMetadata.findMany({
      where: { businessId }
    });

    const metaMap: Record<string, { status: string; source: string }> = {};
    for (const m of metaList) {
      metaMap[m.fieldPath] = { status: m.status, source: m.source };
    }

    // 3. For each active question, check if it has a value in the twin
    const categoryScores: Record<string, { earned: number; possible: number }> = {};

    for (const q of activeQuestions) {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { earned: 0, possible: 0 };
      }

      const val = QuestionEngine.extractValue(business, q.dbPath);
      const isFilled = val !== null && val !== undefined && val !== '';

      categoryScores[q.category].possible += q.weight;

      if (isFilled) {
        // Evaluate the status modifier: KNOWN = 1.0, ESTIMATED = 0.5, UNKNOWN = 0
        const mInfo = metaMap[q.dbPath] || { status: 'KNOWN', source: 'USER' };
        let modifier = 1.0;
        if (mInfo.status === 'ESTIMATED') {
          modifier = 0.5;
        } else if (mInfo.status === 'UNKNOWN') {
          modifier = 0.0;
        }
        categoryScores[q.category].earned += q.weight * modifier;
      }
    }

    // 4. Calculate final percentages per category
    const categoryCoverage: Record<string, number> = {};
    let totalEarned = 0;
    let totalPossible = 0;

    for (const cat of Object.keys(categoryScores)) {
      const { earned, possible } = categoryScores[cat];
      categoryCoverage[cat] = possible > 0 ? Math.round((earned / possible) * 100) : 0;
      totalEarned += earned;
      totalPossible += possible;
    }

    const overallCoverage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

    return {
      overallCoverage,
      categoryCoverage,
      metadata: metaMap
    };
  }
}
