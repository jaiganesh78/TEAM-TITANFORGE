export interface VectorDBRecord {
  id: string;
  vector: number[];
  metadata: any;
  document: string;
}

export interface VectorDBProvider {
  createCollection(collectionName: string): Promise<void>;
  deleteCollection(collectionName: string): Promise<void>;
  addRecords(collectionName: string, records: VectorDBRecord[]): Promise<void>;
  querySimilarity(
    collectionName: string,
    queryVector: number[],
    limit: number,
    filter?: any
  ): Promise<(VectorDBRecord & { score: number })[]>;
}
