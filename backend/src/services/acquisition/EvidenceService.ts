import { prisma } from '../../database/prisma';
import { SourceType } from '@prisma/client';

export class EvidenceService {
  /**
   * Adds or updates a traceability evidence record for a Digital Twin field.
   */
  static async addEvidence(data: {
    businessId: string;
    fieldPath: string;
    value: string;
    sourceType: SourceType;
    confidence: number;
    origin: string;
    exactLocation?: string;
    pageNumber?: number;
    sectionName?: string;
    reviewer?: string;
    reviewTimestamp?: Date;
  }): Promise<any> {
    return prisma.businessEvidence.create({
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
  static async getEvidences(businessId: string, fieldPath: string): Promise<any[]> {
    return prisma.businessEvidence.findMany({
      where: { businessId, fieldPath },
      orderBy: { updatedAt: 'desc' }
    });
  }
}
