"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingQueueService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class EmbeddingQueueService {
    /**
     * Generates a deterministic 384-dimensional floating point vector for a given content string.
     */
    static generateEmbedding(content) {
        const hash = crypto_1.default.createHash('sha256').update(content).digest();
        const vector = [];
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
    static generateBatchEmbeddings(contents) {
        return contents.map(c => this.generateEmbedding(c));
    }
}
exports.EmbeddingQueueService = EmbeddingQueueService;
