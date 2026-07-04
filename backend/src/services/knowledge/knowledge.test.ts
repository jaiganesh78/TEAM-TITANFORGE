import { prisma } from '../../database/prisma';
import { KnowledgeIngestionService } from './KnowledgeIngestionService';
import { RetrievalService } from './RetrievalService';
import { BusinessContextService } from './BusinessContextService';
import { KnowledgeHealthService } from './KnowledgeHealthService';
import { DocumentCategory, ChunkStatus, SourceType } from '@prisma/client';
import assert from 'assert';

async function runTests() {
  console.log('🚀 STARTING KNOWLEDGE LAYER & RAG FOUNDATION TESTS...\n');

  // 1. Resolve business
  const business = await prisma.business.findFirst();
  if (!business) {
    console.log('⚠ No active business found. Skipping tests.');
    return;
  }
  const bizId = business.id;
  console.log(`Using Business ID: ${bizId}`);

  // Create a mock document to ingest
  console.log('🧪 Ingesting Document...');
  const doc = await prisma.uploadedDocument.create({
    data: {
      businessId: bizId,
      fileName: 'marketing_v1.txt',
      filePath: '/uploads/marketing_v1.txt',
      fileSize: 1000,
      mimeType: 'text/plain',
      category: DocumentCategory.MARKETING_REPORT,
      version: 1,
      uploadedBy: 'Jai Ganesh',
      hash: 'hash-v1'
    }
  });

  // Extract raw text
  await prisma.documentExtraction.create({
    data: {
      documentId: doc.id,
      rawContent: '# Marketing Strategy\nAcme focuses on digital media channels. Ad spend is 25000 USD.',
      status: 'COMPLETED'
    }
  });

  // Ingest Document Version 1
  await KnowledgeIngestionService.ingestDocument(bizId, doc.id);
  console.log('✔ Ingestion complete. Running lineage assertions...');

  // Test 1: Lineage Integrity
  console.log('🧪 Test 1: Lineage Integrity...');
  const chunksV1 = await prisma.knowledgeChunk.findMany({
    where: { businessId: bizId, uploadedDocumentId: doc.id }
  });
  assert.ok(chunksV1.length > 0, 'Should generate indexed knowledge chunks');
  const chunk = chunksV1[0];
  
  assert.equal(chunk.uploadedDocumentId, doc.id, 'Lineage must link back to UploadedDocument');
  assert.equal(chunk.source, 'marketing_v1.txt', 'Source metadata filename must match');
  assert.equal(chunk.status, ChunkStatus.ACTIVE, 'Chunk status should be ACTIVE on first write');
  console.log('✔ Lineage integrity tracking verified.');

  // Test 2: Invalidation & Chunk Versioning
  console.log('🧪 Test 2: Chunk Invalidation & Diffing...');
  
  // Update document content extraction simulating Version 2
  const updatedDoc = await prisma.uploadedDocument.update({
    where: { id: doc.id },
    data: { hash: 'hash-v2' } // Trigger hash difference
  });

  // Delete previous extraction and create new version
  await prisma.documentExtraction.deleteMany({ where: { documentId: doc.id } });
  await prisma.documentExtraction.create({
    data: {
      documentId: doc.id,
      rawContent: '# Marketing Strategy\nAcme focuses on influencer networks. Ad spend is 45000 USD.',
      status: 'COMPLETED'
    }
  });

  // Run Ingestion again on same document
  await KnowledgeIngestionService.ingestDocument(bizId, doc.id);

  // Assertions for version 2
  const chunksV2 = await prisma.knowledgeChunk.findMany({
    where: { businessId: bizId, uploadedDocumentId: doc.id },
    orderBy: { version: 'desc' }
  });

  const staleChunk = await prisma.knowledgeChunk.findFirst({
    where: { id: chunk.id }
  });
  assert.ok(staleChunk, 'staleChunk must exist');
  assert.equal(staleChunk.status, ChunkStatus.STALE, 'Old chunks must be flagged as STALE');

  const activeChunkV2 = chunksV2.find(c => c.status === ChunkStatus.ACTIVE);
  assert.ok(activeChunkV2, 'Should index new version chunks as ACTIVE');
  assert.equal(activeChunkV2.version, 2, 'New chunk version number should increment');
  assert.equal(activeChunkV2.previousChunkId, staleChunk.id, 'New chunk must reference previous version ID');
  assert.ok(activeChunkV2.diffInfo?.includes('Replaced content text'), 'DiffInfo comparison notes must be generated');
  console.log('✔ Chunk invalidation, version lineage, and diffing passed.');

  // Test 3: Hybrid Retrieval & Explainability
  console.log('🧪 Test 3: Hybrid Retrieval & Explainability...');
  const searchResults = await RetrievalService.retrieve({
    businessId: bizId,
    query: 'Acme marketing strategy',
    limit: 2
  });

  assert.ok(searchResults.length > 0, 'Retrieval service should return results');
  const topResult = searchResults[0];
  assert.ok(topResult.explainability.matchingScore > 0, 'Ranking scores must be calculated');
  assert.ok(topResult.explainability.whySelected.length > 0, 'Selected explainability reason must be attached');
  assert.equal(topResult.explainability.source, 'marketing_v1.txt', 'Source metadata tracing must remain immutable');
  console.log('✔ Hybrid retrieval scoring and explainability verified.');

  // Test 4: Business Context Snapshots
  console.log('🧪 Test 4: Business Context Snapshots...');
  const snapshot = await BusinessContextService.createSnapshot(bizId, 'Marketing Summary', 1);
  assert.equal(snapshot.topic, 'Marketing Summary', 'Snapshot topic scope must match');
  assert.equal(snapshot.contextVersion, 1, 'Snapshot version numbering must persist');
  assert.ok(snapshot.payload.length > 0, 'Payload snapshot string must be serialized');

  const fetchedSnaps = await BusinessContextService.getSnapshots(bizId);
  assert.ok(fetchedSnaps.length > 0, 'Should retrieve Context Snapshots history logs');
  console.log('✔ Context snapshotting and historical retrieves passed.');

  // Test 5: Health & Coverage Metrics
  console.log('🧪 Test 5: Invalidation Health Reports...');
  const health = await KnowledgeHealthService.getHealth(bizId);
  assert.ok(health.freshnessScore < 100.0, 'Freshness index should drop based on stale count');
  assert.ok(health.sourceDistribution.length > 0, 'Distribution statistics must be computed');
  console.log('✔ Knowledge statistics health checks verified.');

  console.log('\n🎉 ALL KNOWLEDGE & RAG FOUNDATION TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
