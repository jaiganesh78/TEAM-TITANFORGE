"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentUploadService = void 0;
const prisma_1 = require("../../database/prisma");
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
class DocumentUploadService {
    /**
     * Registers a new uploaded document, managing versions and hash matches.
     */
    static async uploadDocument(businessId, fileName, fileContent, // Mock content as a string
    category, uploadedBy) {
        // 1. Calculate SHA-256 hash
        const hash = crypto_1.default.createHash('sha256').update(fileContent).digest('hex');
        // 2. Check if this document hash is already uploaded
        const existingHash = await prisma_1.prisma.uploadedDocument.findFirst({
            where: { businessId, hash }
        });
        if (existingHash) {
            return existingHash; // Return existing instance to avoid duplicate processing
        }
        // 3. Version history check for matching filenames
        const sameName = await prisma_1.prisma.uploadedDocument.findMany({
            where: { businessId, fileName },
            orderBy: { version: 'desc' }
        });
        const version = sameName.length > 0 ? sameName[0].version + 1 : 1;
        // 4. Create document record
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
        // Run background parsing process
        this.runMockParser(doc.id, businessId, fileContent).catch(console.error);
        return doc;
    }
    static async runMockParser(documentId, businessId, fileContent) {
        // Simulate processing delays
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await prisma_1.prisma.uploadedDocument.update({
            where: { id: documentId },
            data: { status: client_1.DocumentStatus.PROCESSING }
        });
        // Store raw parsed text extract
        await prisma_1.prisma.documentExtraction.create({
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
    }
}
exports.DocumentUploadService = DocumentUploadService;
