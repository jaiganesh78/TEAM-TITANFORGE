import { prisma } from '../../database/prisma';
import { ChunkingService } from './ChunkingService';
import { MetadataService } from './MetadataService';
import { EmbeddingQueueService } from './EmbeddingQueueService';
import { ChromaProvider } from './ChromaProvider';
import { SourceType, ChunkStatus, DocumentCategory } from '@prisma/client';
import crypto from 'crypto';

const vectorDb = new ChromaProvider();

export class KnowledgeIngestionService {
  /**
   * Performs incremental indexing of an uploaded document.
   */
  static async ingestDocument(businessId: string, documentId: string): Promise<void> {
    const doc = await prisma.uploadedDocument.findUnique({
      where: { id: documentId },
      include: { extractions: true }
    });
    if (!doc || doc.extractions.length === 0) return;

    const rawText = doc.extractions[0].rawContent;
    const contentHash = crypto.createHash('md5').update(rawText).digest('hex');

    // 1. Check if version and hash match to enable incremental skip
    const latestVersion = await prisma.knowledgeVersion.findFirst({
      where: { businessId, entityId: documentId, entityType: 'DOCUMENT' },
      orderBy: { versionNumber: 'desc' }
    });

    if (latestVersion && latestVersion.hash === contentHash) {
      console.log(`Document ${doc.fileName} hash matches. Skipping re-indexing.`);
      return;
    }

    const nextVer = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // 2. Mark previous chunks as STALE
    const oldChunks = await prisma.knowledgeChunk.findMany({
      where: { businessId, uploadedDocumentId: documentId, status: ChunkStatus.ACTIVE }
    });

    for (const chunk of oldChunks) {
      await prisma.knowledgeChunk.update({
        where: { id: chunk.id },
        data: { status: ChunkStatus.STALE }
      });
    }

    // 3. Create KnowledgeVersion snapshot
    await prisma.knowledgeVersion.create({
      data: {
        businessId,
        entityType: 'DOCUMENT',
        entityId: documentId,
        versionNumber: nextVer,
        hash: contentHash
      }
    });

    // 4. Run chunk splitting, embedding, and vector insertion
    const chunks = ChunkingService.splitText(rawText, 'section');
    const biz = await prisma.business.findUnique({ where: { id: businessId } });
    const bizName = biz?.name || 'Unknown Business';

    const chromaCollection = 'documents_financials';
    await vectorDb.createCollection(chromaCollection);

    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const prevChunk = oldChunks[i] || null;

      // Create chunk record
      const dbChunk = await prisma.knowledgeChunk.create({
        data: {
          businessId,
          source: doc.fileName,
          sourceType: SourceType.DOCUMENT,
          section: c.section,
          pageNumber: c.pageNumber || 1,
          tokenCount: c.tokenCount,
          content: c.content,
          version: nextVer,
          status: ChunkStatus.ACTIVE,
          previousChunkId: prevChunk?.id || null,
          uploadedDocumentId: documentId,
          diffInfo: prevChunk ? `Replaced content text: "${prevChunk.content.substring(0, 30)}..."` : null
        }
      });

      // Write metadata
      const meta = MetadataService.generateMetadata({
        businessId,
        businessName: bizName,
        source: doc.fileName,
        sourceType: SourceType.DOCUMENT,
        confidence: 0.95,
        category: doc.category.toString()
      });

      await prisma.knowledgeMetadata.createMany({
        data: Object.entries(meta).map(([key, val]) => ({
          chunkId: dbChunk.id,
          key,
          value: val
        }))
      });

      // Write embedding reference in Postgres & add records to ChromaDB
      const vec = EmbeddingQueueService.generateEmbedding(c.content);
      const chromaDocId = `doc-chunk-${dbChunk.id}`;

      await prisma.embeddingReference.create({
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
  static async ingestWebsitePage(businessId: string, pageId: string): Promise<void> {
    const page = await prisma.websitePage.findUnique({
      where: { id: pageId }
    });
    if (!page || !page.content) return;

    const contentHash = crypto.createHash('md5').update(page.content).digest('hex');

    const latestVersion = await prisma.knowledgeVersion.findFirst({
      where: { businessId, entityId: pageId, entityType: 'WEBSITE' },
      orderBy: { versionNumber: 'desc' }
    });

    if (latestVersion && latestVersion.hash === contentHash) {
      console.log(`Website page ${page.url} hash matches. Skipping re-indexing.`);
      return;
    }

    const nextVer = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Mark previous chunks as STALE
    const oldChunks = await prisma.knowledgeChunk.findMany({
      where: { businessId, websitePageId: pageId, status: ChunkStatus.ACTIVE }
    });

    for (const chunk of oldChunks) {
      await prisma.knowledgeChunk.update({
        where: { id: chunk.id },
        data: { status: ChunkStatus.STALE }
      });
    }

    // Create KnowledgeVersion
    await prisma.knowledgeVersion.create({
      data: {
        businessId,
        entityType: 'WEBSITE',
        entityId: pageId,
        versionNumber: nextVer,
        hash: contentHash
      }
    });

    const chunks = ChunkingService.splitText(page.content, 'website');
    const biz = await prisma.business.findUnique({ where: { id: businessId } });
    const bizName = biz?.name || 'Unknown Business';

    const chromaCollection = 'website_crawls';
    await vectorDb.createCollection(chromaCollection);

    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const prevChunk = oldChunks[i] || null;

      const dbChunk = await prisma.knowledgeChunk.create({
        data: {
          businessId,
          source: page.url,
          sourceType: SourceType.WEBSITE,
          section: c.section,
          pageNumber: 1,
          tokenCount: c.tokenCount,
          content: c.content,
          version: nextVer,
          status: ChunkStatus.ACTIVE,
          previousChunkId: prevChunk?.id || null,
          websitePageId: pageId,
          diffInfo: prevChunk ? `Replaced content text: "${prevChunk.content.substring(0, 30)}..."` : null
        }
      });

      const meta = MetadataService.generateMetadata({
        businessId,
        businessName: bizName,
        source: page.url,
        sourceType: SourceType.WEBSITE,
        confidence: 0.90,
        category: 'WEBSITE_CRAWL'
      });

      await prisma.knowledgeMetadata.createMany({
        data: Object.entries(meta).map(([key, val]) => ({
          chunkId: dbChunk.id,
          key,
          value: val
        }))
      });

      const vec = EmbeddingQueueService.generateEmbedding(c.content);
      const chromaDocId = `web-chunk-${dbChunk.id}`;

      await prisma.embeddingReference.create({
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
  private static async updateStats(businessId: string): Promise<void> {
    const docsCount = await prisma.uploadedDocument.count({ where: { businessId } });
    const pagesCount = await prisma.websitePage.count({
      where: { analysisRun: { website: { businessId } } }
    });
    const totalChunks = await prisma.knowledgeChunk.count({ where: { businessId } });
    const activeChunks = await prisma.knowledgeChunk.count({ where: { businessId, status: ChunkStatus.ACTIVE } });
    const staleChunks = await prisma.knowledgeChunk.count({ where: { businessId, status: ChunkStatus.STALE } });

    await prisma.knowledgeStatistics.upsert({
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
