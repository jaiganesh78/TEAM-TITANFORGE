export interface KnowledgeDocument {
  id: string;
  title: string;
  source: string;
  content: string;
  hash: string;
  metadata: Record<string, any>;
}

export interface KnowledgeChunk {
  documentId: string;
  chunkIndex: number;
  text: string;
  metadata: Record<string, any>;
}

export interface KnowledgeProvider {
  indexDocument(doc: Omit<KnowledgeDocument, 'id'>): Promise<KnowledgeDocument>;
  queryContext(query: string, filter?: Record<string, any>, limit?: number): Promise<KnowledgeChunk[]>;
  removeDocument(documentId: string): Promise<boolean>;
}
