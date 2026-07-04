import { SourceType } from '@prisma/client';

export interface ChunkMetadata {
  businessId: string;
  businessDomain: string;
  industry: string;
  source: string;
  documentType: string;
  websiteUrl: string;
  confidence: string;
  reviewStatus: string;
  knowledgeCategory: string;
  createdDate: string;
  updatedDate: string;
  futureAIVisibility: string;
}

export class MetadataService {
  /**
   * Generates a fully populated metadata manifest for a given chunk.
   */
  static generateMetadata(params: {
    businessId: string;
    businessName: string;
    source: string;
    sourceType: SourceType;
    confidence: number;
    category?: string;
  }): ChunkMetadata {
    const cleanDomain = params.businessName.toLowerCase().replace(/\s+/g, '-') + '.com';
    
    return {
      businessId: params.businessId,
      businessDomain: cleanDomain,
      industry: 'Enterprise Solutions',
      source: params.source,
      documentType: params.sourceType === 'DOCUMENT' ? 'Structured Report' : 'Web Resource',
      websiteUrl: params.sourceType === 'WEBSITE' ? params.source : `https://${cleanDomain}/docs/${params.source}`,
      confidence: String(params.confidence),
      reviewStatus: 'APPROVED',
      knowledgeCategory: params.category || 'Core Profile',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      futureAIVisibility: 'TRUE'
    };
  }
}
