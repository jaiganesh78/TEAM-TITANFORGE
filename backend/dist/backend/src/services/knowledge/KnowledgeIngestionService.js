"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeIngestionService = void 0;
const prisma_1 = require("../../database/prisma");
const ChunkingService_1 = require("./ChunkingService");
const MetadataService_1 = require("./MetadataService");
const EmbeddingQueueService_1 = require("./EmbeddingQueueService");
const ChromaProvider_1 = require("./ChromaProvider");
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const vectorDb = new ChromaProvider_1.ChromaProvider();
class KnowledgeIngestionService {
    /**
     * Performs incremental indexing of an uploaded document.
     */
    static async ingestDocument(businessId, documentId) {
        const doc = await prisma_1.prisma.uploadedDocument.findUnique({
            where: { id: documentId },
            include: { extractions: true }
        });
        if (!doc || doc.extractions.length === 0)
            return;
        const rawText = doc.extractions[0].rawContent;
        const contentHash = crypto_1.default.createHash('md5').update(rawText).digest('hex');
        // 1. Check if version and hash match to enable incremental skip
        const latestVersion = await prisma_1.prisma.knowledgeVersion.findFirst({
            where: { businessId, entityId: documentId, entityType: 'DOCUMENT' },
            orderBy: { versionNumber: 'desc' }
        });
        if (latestVersion && latestVersion.hash === contentHash) {
            console.log(`Document ${doc.fileName} hash matches. Skipping re-indexing.`);
            return;
        }
        const nextVer = latestVersion ? latestVersion.versionNumber + 1 : 1;
        // 2. Mark previous chunks as STALE
        const oldChunks = await prisma_1.prisma.knowledgeChunk.findMany({
            where: { businessId, uploadedDocumentId: documentId, status: client_1.ChunkStatus.ACTIVE }
        });
        for (const chunk of oldChunks) {
            await prisma_1.prisma.knowledgeChunk.update({
                where: { id: chunk.id },
                data: { status: client_1.ChunkStatus.STALE }
            });
        }
        // 3. Create KnowledgeVersion snapshot
        await prisma_1.prisma.knowledgeVersion.create({
            data: {
                businessId,
                entityType: 'DOCUMENT',
                entityId: documentId,
                versionNumber: nextVer,
                hash: contentHash
            }
        });
        // 4. Run chunk splitting, embedding, and vector insertion
        const chunks = ChunkingService_1.ChunkingService.splitText(rawText, 'section');
        const biz = await prisma_1.prisma.business.findUnique({ where: { id: businessId } });
        const bizName = biz?.name || 'Unknown Business';
        const chromaCollection = 'documents_financials';
        await vectorDb.createCollection(chromaCollection);
        for (let i = 0; i < chunks.length; i++) {
            const c = chunks[i];
            const prevChunk = oldChunks[i] || null;
            // Create chunk record
            const dbChunk = await prisma_1.prisma.knowledgeChunk.create({
                data: {
                    businessId,
                    source: doc.fileName,
                    sourceType: client_1.SourceType.DOCUMENT,
                    section: c.section,
                    pageNumber: c.pageNumber || 1,
                    tokenCount: c.tokenCount,
                    content: c.content,
                    version: nextVer,
                    status: client_1.ChunkStatus.ACTIVE,
                    previousChunkId: prevChunk?.id || null,
                    uploadedDocumentId: documentId,
                    diffInfo: prevChunk ? `Replaced content text: "${prevChunk.content.substring(0, 30)}..."` : null
                }
            });
            // Write metadata
            const meta = MetadataService_1.MetadataService.generateMetadata({
                businessId,
                businessName: bizName,
                source: doc.fileName,
                sourceType: client_1.SourceType.DOCUMENT,
                confidence: 0.95,
                category: doc.category.toString()
            });
            await prisma_1.prisma.knowledgeMetadata.createMany({
                data: Object.entries(meta).map(([key, val]) => ({
                    chunkId: dbChunk.id,
                    key,
                    value: val
                }))
            });
            // Write embedding reference in Postgres & add records to ChromaDB
            const vec = EmbeddingQueueService_1.EmbeddingQueueService.generateEmbedding(c.content);
            const chromaDocId = `doc-chunk-${dbChunk.id}`;
            await prisma_1.prisma.embeddingReference.create({
                data: {
                    chunkId: dbChunk.id,
                    chromaCollection,
                    chromaDocumentId: chromaDocId,
                    embeddingModel: 'mock-all-mini-lm-v2',
                    embeddingVersion: '1.0'
                }
            });
            await vectorDb.addRecords(chromaCollection, [{
                    id: chromaDocId,
                    vector: vec,
                    metadata: { ...meta, chunkId: dbChunk.id },
                    document: c.content
                }]);
        }
        // Refresh health stats
        await this.updateStats(businessId);
    }
    /**
     * Performs incremental indexing of a crawled website page.
     */
    static async ingestWebsitePage(businessId, pageId) {
        const page = await prisma_1.prisma.websitePage.findUnique({
            where: { id: pageId }
        });
        if (!page || !page.content)
            return;
        const contentHash = crypto_1.default.createHash('md5').update(page.content).digest('hex');
        const latestVersion = await prisma_1.prisma.knowledgeVersion.findFirst({
            where: { businessId, entityId: pageId, entityType: 'WEBSITE' },
            orderBy: { versionNumber: 'desc' }
        });
        if (latestVersion && latestVersion.hash === contentHash) {
            console.log(`Website page ${page.url} hash matches. Skipping re-indexing.`);
            return;
        }
        const nextVer = latestVersion ? latestVersion.versionNumber + 1 : 1;
        // Mark previous chunks as STALE
        const oldChunks = await prisma_1.prisma.knowledgeChunk.findMany({
            where: { businessId, websitePageId: pageId, status: client_1.ChunkStatus.ACTIVE }
        });
        for (const chunk of oldChunks) {
            await prisma_1.prisma.knowledgeChunk.update({
                where: { id: chunk.id },
                data: { status: client_1.ChunkStatus.STALE }
            });
        }
        // Create KnowledgeVersion
        await prisma_1.prisma.knowledgeVersion.create({
            data: {
                businessId,
                entityType: 'WEBSITE',
                entityId: pageId,
                versionNumber: nextVer,
                hash: contentHash
            }
        });
        const chunks = ChunkingService_1.ChunkingService.splitText(page.content, 'website');
        const biz = await prisma_1.prisma.business.findUnique({ where: { id: businessId } });
        const bizName = biz?.name || 'Unknown Business';
        const chromaCollection = 'website_crawls';
        await vectorDb.createCollection(chromaCollection);
        for (let i = 0; i < chunks.length; i++) {
            const c = chunks[i];
            const prevChunk = oldChunks[i] || null;
            const dbChunk = await prisma_1.prisma.knowledgeChunk.create({
                data: {
                    businessId,
                    source: page.url,
                    sourceType: client_1.SourceType.WEBSITE,
                    section: c.section,
                    pageNumber: 1,
                    tokenCount: c.tokenCount,
                    content: c.content,
                    version: nextVer,
                    status: client_1.ChunkStatus.ACTIVE,
                    previousChunkId: prevChunk?.id || null,
                    websitePageId: pageId,
                    diffInfo: prevChunk ? `Replaced content text: "${prevChunk.content.substring(0, 30)}..."` : null
                }
            });
            const meta = MetadataService_1.MetadataService.generateMetadata({
                businessId,
                businessName: bizName,
                source: page.url,
                sourceType: client_1.SourceType.WEBSITE,
                confidence: 0.90,
                category: 'WEBSITE_CRAWL'
            });
            await prisma_1.prisma.knowledgeMetadata.createMany({
                data: Object.entries(meta).map(([key, val]) => ({
                    chunkId: dbChunk.id,
                    key,
                    value: val
                }))
            });
            const vec = EmbeddingQueueService_1.EmbeddingQueueService.generateEmbedding(c.content);
            const chromaDocId = `web-chunk-${dbChunk.id}`;
            await prisma_1.prisma.embeddingReference.create({
                data: {
                    chunkId: dbChunk.id,
                    chromaCollection,
                    chromaDocumentId: chromaDocId,
                    embeddingModel: 'mock-all-mini-lm-v2',
                    embeddingVersion: '1.0'
                }
            });
            await vectorDb.addRecords(chromaCollection, [{
                    id: chromaDocId,
                    vector: vec,
                    metadata: { ...meta, chunkId: dbChunk.id },
                    document: c.content
                }]);
        }
        await this.updateStats(businessId);
    }
    /**
     * Refreshes stats counter matrices.
     */
    static async updateStats(businessId) {
        const docsCount = await prisma_1.prisma.uploadedDocument.count({ where: { businessId } });
        const pagesCount = await prisma_1.prisma.websitePage.count({
            where: { analysisRun: { website: { businessId } } }
        });
        const totalChunks = await prisma_1.prisma.knowledgeChunk.count({ where: { businessId } });
        const activeChunks = await prisma_1.prisma.knowledgeChunk.count({ where: { businessId, status: client_1.ChunkStatus.ACTIVE } });
        const staleChunks = await prisma_1.prisma.knowledgeChunk.count({ where: { businessId, status: client_1.ChunkStatus.STALE } });
        await prisma_1.prisma.knowledgeStatistics.upsert({
            where: { businessId },
            create: {
                businessId,
                indexedDocs: docsCount,
                indexedPages: pagesCount,
                totalChunks,
                approvedCount: activeChunks,
                pendingCount: staleChunks,
                freshnessScore: 100.0 - (staleChunks * 2.5),
                coverageScore: 85.0,
                sourceDiversityScore: docsCount > 0 && pagesCount > 0 ? 95.0 : 50.0,
                versionHealthScore: 100.0,
                reviewHealthScore: 100.0,
                outdatedDocsCount: staleChunks,
                outdatedPagesCount: 0,
                knowledgeGapsCount: 0
            },
            update: {
                indexedDocs: docsCount,
                indexedPages: pagesCount,
                totalChunks,
                approvedCount: activeChunks,
                pendingCount: staleChunks,
                freshnessScore: Math.max(0.0, 100.0 - (staleChunks * 2.5)),
                sourceDiversityScore: docsCount > 0 && pagesCount > 0 ? 95.0 : 50.0
            }
        });
    }
}
exports.KnowledgeIngestionService = KnowledgeIngestionService;
