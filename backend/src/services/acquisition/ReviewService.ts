import { prisma } from '../../database/prisma';
import { ExtractionStatus, SourceType } from '@prisma/client';
import { KnowledgeSyncService } from './KnowledgeSyncService';
import { EvidenceService } from './EvidenceService';
import { DiscoveryEngine } from '../discovery/DiscoveryEngine';
import { AppError } from '../../middleware/errorMiddleware';

export class ReviewService {
  /**
   * Retrieves pending review candidates for a business.
   */
  static async getPendingCandidates(businessId: string): Promise<any[]> {
    return prisma.extractedCandidate.findMany({
      where: {
        businessId,
        status: ExtractionStatus.PENDING_REVIEW
      },
      orderBy: { confidence: 'desc' }
    });
  }

  /**
   * Accepts a single candidate suggestion, optionally overriding its value.
   */
  static async acceptCandidate(
    candidateId: string,
    reviewerId: string,
    editedValue?: string
  ): Promise<any> {
    const cand = await prisma.extractedCandidate.findUnique({
      where: { id: candidateId }
    });
    if (!cand) {
      throw new AppError('Candidate suggestion not found.', 404, 'NOT_FOUND');
    }

    const finalValue = editedValue !== undefined ? editedValue : cand.value;

    // 1. Update candidate status
    await prisma.extractedCandidate.update({
      where: { id: candidateId },
      data: { status: ExtractionStatus.ACCEPTED, value: finalValue }
    });

    // 2. Write Review Action log
    await prisma.reviewAction.create({
      data: {
        businessId: cand.businessId,
        candidateId,
        action: 'ACCEPT',
        userId: reviewerId,
        notes: editedValue ? `Edited value to: ${editedValue}` : 'Accepted suggestion directly.'
      }
    });

    // 3. Write Business Evidence trace record
    await EvidenceService.addEvidence({
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
    await KnowledgeSyncService.applyUpdate(cand.businessId, cand.fieldPath, finalValue, cand.sourceType);

    // 5. Trigger Discovery Engine re-evaluation live
    return DiscoveryEngine.evaluateState(cand.businessId);
  }

  /**
   * Rejects a single candidate suggestion.
   */
  static async rejectCandidate(candidateId: string, reviewerId: string): Promise<any> {
    const cand = await prisma.extractedCandidate.findUnique({
      where: { id: candidateId }
    });
    if (!cand) {
      throw new AppError('Candidate suggestion not found.', 404, 'NOT_FOUND');
    }

    await prisma.extractedCandidate.update({
      where: { id: candidateId },
      data: { status: ExtractionStatus.REJECTED }
    });

    await prisma.reviewAction.create({
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
  static async bulkReview(
    candidateIds: string[],
    action: 'ACCEPT' | 'REJECT',
    reviewerId: string
  ): Promise<any> {
    const results = [];
    for (const cid of candidateIds) {
      try {
        if (action === 'ACCEPT') {
          await this.acceptCandidate(cid, reviewerId);
        } else {
          await this.rejectCandidate(cid, reviewerId);
        }
        results.push({ id: cid, status: 'SUCCESS' });
      } catch (err: any) {
        results.push({ id: cid, status: 'FAILED', error: err.message });
      }
    }
    return results;
  }
}
