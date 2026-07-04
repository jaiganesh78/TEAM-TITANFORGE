"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalService = void 0;
const prisma_1 = require("../../database/prisma");
const EmbeddingQueueService_1 = require("./EmbeddingQueueService");
const ChromaProvider_1 = require("./ChromaProvider");
const vectorDb = new ChromaProvider_1.ChromaProvider();
class RetrievalService {
    /**
     * Runs the multi-stage retrieval pipeline:
     * Query -> Metadata Filter -> Keyword Search -> Vector Search -> Merge -> Deduplicate -> Rank -> Return.
     */
    static async retrieve(params) {
        const limit = params.limit || 5;
        const cleanQuery = params.query.trim().toLowerCase();
        // Stage 1: Metadata Filter Setup & Stages
        // Stage 2: Keyword Search (SQL contains match)
        const keywordChunks = await prisma_1.prisma.knowledgeChunk.findMany({
            where: {
                businessId: params.businessId,
                status: 'ACTIVE',
                content: { contains: cleanQuery, mode: 'insensitive' },
                ...(params.sourceType ? { sourceType: params.sourceType } : {})
            },
            take: limit * 2
        });
        // Stage 3: Vector Search (Similarity cosine matching)
        const queryVec = EmbeddingQueueService_1.EmbeddingQueueService.generateEmbedding(params.query);
        const vectorMatches = [];
        // Query both collections
        const collections = ['documents_financials', 'website_crawls'];
        for (const coll of collections) {
            try {
                const results = await vectorDb.querySimilarity(coll, queryVec, limit * 2);
                vectorMatches.push(...results);
            }
            catch (err) {
                console.error(`Chroma collection query error for: ${coll}`, err);
            }
        }
        // Stage 4: Merge & Deduplicate
        const mergedMap = new Map();
        // Map keyword results
        for (const kc of keywordChunks) {
            mergedMap.set(kc.id, {
                chunk: kc,
                vectorScore: 0.0,
                keywordScore: 1.0
            });
        }
        // Map vector results
        for (const vm of vectorMatches) {
            const chunkId = vm.metadata.chunkId;
            if (!chunkId)
                continue;
            // Filter by sourceType if specified
            if (params.sourceType && vm.metadata.sourceType !== params.sourceType)
                continue;
            const existing = mergedMap.get(chunkId);
            if (existing) {
                existing.vectorScore = vm.score;
            }
            else {
                // Find chunk in DB
                const chunk = await prisma_1.prisma.knowledgeChunk.findUnique({
                    where: { id: chunkId }
                });
                if (chunk && chunk.status === 'ACTIVE') {
                    mergedMap.set(chunkId, {
                        chunk,
                        vectorScore: vm.score,
                        keywordScore: 0.0
                    });
                }
            }
        }
        // Stage 5: Rank & Explain
        const retrievalResults = [];
        for (const [id, item] of mergedMap.entries()) {
            const matchingScore = (item.vectorScore * 0.7) + (item.keywordScore * 0.3);
            let whySelected = 'Selected due to high semantic similarity matches.';
            if (item.keywordScore > 0 && item.vectorScore > 0) {
                whySelected = 'Matched exact query keywords and scored high in vector cosine similarity.';
            }
            else if (item.keywordScore > 0) {
                whySelected = 'Contains matching query text keywords.';
            }
            retrievalResults.push({
                chunkId: id,
                content: item.chunk.content,
                source: item.chunk.source,
                sourceType: item.chunk.sourceType,
                section: item.chunk.section,
                pageNumber: item.chunk.pageNumber,
                explainability: {
                    whySelected,
                    matchingScore: parseFloat(matchingScore.toFixed(3)),
                    vectorScore: parseFloat(item.vectorScore.toFixed(3)),
                    keywordScore: item.keywordScore,
                    metadataMatch: params.category ? true : false,
                    confidence: parseFloat((matchingScore * 100).toFixed(1)),
                    source: item.chunk.source
                }
            });
        }
        // Sort by ranked matching score descending
        retrievalResults.sort((a, b) => b.explainability.matchingScore - a.explainability.matchingScore);
        return retrievalResults.slice(0, limit);
    }
}
exports.RetrievalService = RetrievalService;
