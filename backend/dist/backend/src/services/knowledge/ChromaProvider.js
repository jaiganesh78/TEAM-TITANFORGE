"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromaProvider = void 0;
// Performant fallback in-memory registry simulating ChromaDB
class MemoryVectorDB {
    collections = new Map();
    createCollection(name) {
        if (!this.collections.has(name)) {
            this.collections.set(name, []);
        }
    }
    deleteCollection(name) {
        this.collections.delete(name);
    }
    addRecords(name, records) {
        this.createCollection(name);
        const list = this.collections.get(name);
        // De-duplicate existing IDs
        const newRecords = records.filter(r => !list.some(existing => existing.id === r.id));
        list.push(...newRecords);
    }
    query(name, queryVector, limit, filter) {
        const list = this.collections.get(name) || [];
        // 1. Calculate cosine similarity
        const results = list.map(item => {
            const score = this.cosineSimilarity(queryVector, item.vector);
            return { ...item, score };
        });
        // 2. Sort by highest score descending
        results.sort((a, b) => b.score - a.score);
        // 3. Apply limit
        return results.slice(0, limit);
    }
    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0.0;
        let normA = 0.0;
        let normB = 0.0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
const memoryDb = new MemoryVectorDB();
class ChromaProvider {
    async createCollection(collectionName) {
        memoryDb.createCollection(collectionName);
    }
    async deleteCollection(collectionName) {
        memoryDb.deleteCollection(collectionName);
    }
    async addRecords(collectionName, records) {
        memoryDb.addRecords(collectionName, records);
    }
    async querySimilarity(collectionName, queryVector, limit, filter) {
        return memoryDb.query(collectionName, queryVector, limit, filter);
    }
}
exports.ChromaProvider = ChromaProvider;
