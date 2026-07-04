import { prisma } from '../../database/prisma';
import { ChunkStatus } from '@prisma/client';

export interface HealthReport {
  freshnessScore: number;
  coverageScore: number;
  sourceDiversityScore: number;
  versionHealthScore: number;
  reviewHealthScore: number;
  outdatedDocsCount: number;
  outdatedPagesCount: number;
  knowledgeGapsCount: number;
  sourceDistribution: { name: string; count: number }[];
  categoryDistribution: { name: string; count: number }[];
}

export class KnowledgeHealthService {
  /**
   * Computes comprehensive health stats logs for a business.
   */
  static async getHealth(businessId: string): Promise<HealthReport> {
    const stats = await prisma.knowledgeStatistics.findUnique({
      where: { businessId }
    });

    // Compute distributions
    const activeChunks = await prisma.knowledgeChunk.count({
      where: { businessId, status: ChunkStatus.ACTIVE }
    });
    const staleChunks = await prisma.knowledgeChunk.count({
      where: { businessId, status: ChunkStatus.STALE }
    });

    const docCount = await prisma.uploadedDocument.count({ where: { businessId } });
    const webCount = await prisma.websitePage.count({
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
