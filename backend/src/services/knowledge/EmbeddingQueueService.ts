import crypto from 'crypto';

export class EmbeddingQueueService {
  /**
   * Generates a deterministic 384-dimensional floating point vector for a given content string.
   */
  static generateEmbedding(content: string): number[] {
    const hash = crypto.createHash('sha256').update(content).digest();
    const vector: number[] = [];
    
    // Extrapolate 384 dimensions from the hash buffer values
    for (let i = 0; i < 384; i++) {
      const offset = (i * 3) % hash.length;
      const val = hash[offset] / 255.0; // Normalize between 0 and 1
      vector.push(val);
    }
    
    return vector;
  }

  /**
   * Generates embeddings in batch.
   */
  static generateBatchEmbeddings(contents: string[]): number[][] {
    return contents.map(c => this.generateEmbedding(c));
  }
}
