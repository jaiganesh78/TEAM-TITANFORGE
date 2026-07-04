import { prisma } from '../../database/prisma';
import crypto from 'crypto';
import { DocumentCategory, DocumentStatus } from '@prisma/client';

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
    // 1. Calculate SHA-256 hash
    const hash = crypto.createHash('sha256').update(fileContent).digest('hex');

    // 2. Check if this document hash is already uploaded
    const existingHash = await prisma.uploadedDocument.findFirst({
      where: { businessId, hash }
    });
    if (existingHash) {
      return existingHash; // Return existing instance to avoid duplicate processing
    }

    // 3. Version history check for matching filenames
    const sameName = await prisma.uploadedDocument.findMany({
      where: { businessId, fileName },
      orderBy: { version: 'desc' }
    });

    const version = sameName.length > 0 ? sameName[0].version + 1 : 1;

    // 4. Create document record
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

    // Run background parsing process
    this.runMockParser(doc.id, businessId, fileContent).catch(console.error);

    return doc;
  }

  private static async runMockParser(documentId: string, businessId: string, fileContent: string) {
    // Simulate processing delays
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await prisma.uploadedDocument.update({
      where: { id: documentId },
      data: { status: DocumentStatus.PROCESSING }
    });

    // Store raw parsed text extract
    await prisma.documentExtraction.create({
      data: {
        documentId,
        rawContent: `Parsed content from file: ${fileContent}`,
        status: 'COMPLETED'
      }
    });

    // Create mock candidates based on document keywords
    const mockCandidates = [];
    if (fileContent.toLowerCase().includes('margin') || fileContent.toLowerCase().includes('finance')) {
      mockCandidates.push({ fieldPath: 'operationsProfile.infraCost', value: '45000', confidence: 0.95 });
    }
    if (fileContent.toLowerCase().includes('leads') || fileContent.toLowerCase().includes('marketing')) {
      mockCandidates.push({ fieldPath: 'salesProfile.leadsCount', value: '1200', confidence: 0.95 });
      mockCandidates.push({ fieldPath: 'salesProfile.conversionRate', value: '4.2', confidence: 0.90 });
    }

    // Fallback default candidates
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
  }
}
