import { prisma } from '../../database/prisma';
import crypto from 'crypto';
import { DocumentCategory, DocumentStatus } from '@prisma/client';
import { jobQueue } from '../jobs/JobQueue';
import { eventBroker } from '../events/EventBroker';

export class DocumentUploadService {
  /**
   * Registers a new uploaded document, managing versions and hash matches.
   */
  static async uploadDocument(
    businessId: string,
    fileName: string,
    fileContent: string, // Mock content as a string
    category: DocumentCategory,
    uploadedBy: string
  ): Promise<any> {
    const hash = crypto.createHash('sha256').update(fileContent).digest('hex');

    const existingHash = await prisma.uploadedDocument.findFirst({
      where: { businessId, hash }
    });
    if (existingHash) {
      return existingHash;
    }

    const sameName = await prisma.uploadedDocument.findMany({
      where: { businessId, fileName },
      orderBy: { version: 'desc' }
    });

    const version = sameName.length > 0 ? sameName[0].version + 1 : 1;

    const doc = await prisma.uploadedDocument.create({
      data: {
        businessId,
        fileName,
        filePath: `/uploads/${businessId}/${version}_${fileName}`,
        fileSize: Buffer.byteLength(fileContent),
        mimeType: 'application/octet-stream',
        category,
        version,
        uploadedBy,
        hash,
        status: DocumentStatus.PENDING
      }
    });

    // Enqueue the background job using our decoupled JobQueue
    await jobQueue.enqueue('DOC_PARSING', {
      documentId: doc.id,
      businessId,
      fileContent
    });

    return doc;
  }

  static async runMockParser(documentId: string, businessId: string, fileContent: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    await prisma.uploadedDocument.update({
      where: { id: documentId },
      data: { status: DocumentStatus.PROCESSING }
    });

    await prisma.documentExtraction.create({
      data: {
        documentId,
        rawContent: `Parsed content from file: ${fileContent}`,
        status: 'COMPLETED'
      }
    });

    const mockCandidates = [];
    if (fileContent.toLowerCase().includes('margin') || fileContent.toLowerCase().includes('finance')) {
      mockCandidates.push({ fieldPath: 'operationsProfile.infraCost', value: '45000', confidence: 0.95 });
    }
    if (fileContent.toLowerCase().includes('leads') || fileContent.toLowerCase().includes('marketing')) {
      mockCandidates.push({ fieldPath: 'salesProfile.leadsCount', value: '1200', confidence: 0.95 });
      mockCandidates.push({ fieldPath: 'salesProfile.conversionRate', value: '4.2', confidence: 0.90 });
    }

    if (mockCandidates.length === 0) {
      mockCandidates.push({ fieldPath: 'operationsProfile.bottlenecks', value: 'Supply logistics latency', confidence: 0.80 });
    }

    for (const cand of mockCandidates) {
      await prisma.extractedCandidate.create({
        data: {
          businessId,
          fieldPath: cand.fieldPath,
          value: cand.value,
          confidence: cand.confidence,
          sourceType: 'DOCUMENT',
          sourceId: documentId,
          status: 'PENDING_REVIEW',
          extractionMethod: 'MOCK_EXTRACTOR'
        }
      });
    }

    await prisma.uploadedDocument.update({
      where: { id: documentId },
      data: { status: DocumentStatus.COMPLETED }
    });

    // Publish event upon document parsing completion to decouple subscribers
    console.log(`[DocumentUploadService] Publishing DocumentProcessed event for doc: ${documentId}`);
    await eventBroker.publish('DocumentProcessed', { businessId, documentId });
  }
}

// Register Job Queue worker
jobQueue.registerWorker('DOC_PARSING', async (payload: { documentId: string; businessId: string; fileContent: string }) => {
  await DocumentUploadService.runMockParser(payload.documentId, payload.businessId, payload.fileContent);
});
