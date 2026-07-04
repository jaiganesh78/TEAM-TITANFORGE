export interface MemoryRecord {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  timestamp: Date;
}

export interface MemoryProvider {
  store(record: Omit<MemoryRecord, 'id' | 'timestamp'>): Promise<MemoryRecord>;
  retrieve(id: string): Promise<MemoryRecord | null>;
  search(query: string, limit?: number): Promise<MemoryRecord[]>;
  searchVector(embedding: number[], limit?: number): Promise<MemoryRecord[]>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}
