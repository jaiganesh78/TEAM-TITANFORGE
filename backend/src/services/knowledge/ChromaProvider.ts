import { VectorDBProvider, VectorDBRecord } from './VectorDBProvider';

// Performant fallback in-memory registry simulating ChromaDB
class MemoryVectorDB {
  private collections: Map<string, VectorDBRecord[]> = new Map();

  createCollection(name: string) {
    if (!this.collections.has(name)) {
      this.collections.set(name, []);
    }
  }

  deleteCollection(name: string) {
    this.collections.delete(name);
  }

  addRecords(name: string, records: VectorDBRecord[]) {
    this.createCollection(name);
    const list = this.collections.get(name)!;
    
    // De-duplicate existing IDs
    const newRecords = records.filter(r => !list.some(existing => existing.id === r.id));
    list.push(...newRecords);
  }

  query(name: string, queryVector: number[], limit: number, filter?: any): (VectorDBRecord & { score: number })[] {
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

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

const memoryDb = new MemoryVectorDB();

export class ChromaProvider implements VectorDBProvider {
  async createCollection(collectionName: string): Promise<void> {
    memoryDb.createCollection(collectionName);
  }

  async deleteCollection(collectionName: string): Promise<void> {
    memoryDb.deleteCollection(collectionName);
  }

  async addRecords(collectionName: string, records: VectorDBRecord[]): Promise<void> {
    memoryDb.addRecords(collectionName, records);
  }

  async querySimilarity(
    collectionName: string,
    queryVector: number[],
    limit: number,
    filter?: any
  ): Promise<(VectorDBRecord & { score: number })[]> {
    return memoryDb.query(collectionName, queryVector, limit, filter);
  }
}
