"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentUploadService = void 0;
const prisma_1 = require("../../database/prisma");
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const JobQueue_1 = require("../jobs/JobQueue");
const EventBroker_1 = require("../events/EventBroker");
class DocumentUploadService {
    /**
     * Registers a new uploaded document, managing versions and hash matches.
     */
    static async uploadDocument(businessId, fileName, fileContent, // Mock content as a string
    category, uploadedBy) {
        const hash = crypto_1.default.createHash('sha256').update(fileContent).digest('hex');
        const existingHash = await prisma_1.prisma.uploadedDocument.findFirst({
            where: { businessId, hash }
        });
        if (existingHash) {
            return existingHash;
        }
        const sameName = await prisma_1.prisma.uploadedDocument.findMany({
            where: { businessId, fileName },
            orderBy: { version: 'desc' }
        });
        const version = sameName.length > 0 ? sameName[0].version + 1 : 1;
        const doc = await prisma_1.prisma.uploadedDocument.create({
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
                status: client_1.DocumentStatus.PENDING
            }
        });
        // Enqueue the background job using our decoupled JobQueue
        await JobQueue_1.jobQueue.enqueue('DOC_PARSING', {
            documentId: doc.id,
            businessId,
            fileContent
        });
        return doc;
    }
    static async runMockParser(documentId, businessId, fileContent) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await prisma_1.prisma.uploadedDocument.update({
            where: { id: documentId },
            data: { status: client_1.DocumentStatus.PROCESSING }
        });
        await prisma_1.prisma.documentExtraction.create({
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
            await prisma_1.prisma.extractedCandidate.create({
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
        await prisma_1.prisma.uploadedDocument.update({
            where: { id: documentId },
            data: { status: client_1.DocumentStatus.COMPLETED }
        });
        // Publish event upon document parsing completion to decouple subscribers
        console.log(`[DocumentUploadService] Publishing DocumentProcessed event for doc: ${documentId}`);
        await EventBroker_1.eventBroker.publish('DocumentProcessed', { businessId, documentId });
    }
}
exports.DocumentUploadService = DocumentUploadService;
// Register Job Queue worker
JobQueue_1.jobQueue.registerWorker('DOC_PARSING', async (payload) => {
    await DocumentUploadService.runMockParser(payload.documentId, payload.businessId, payload.fileContent);
});
