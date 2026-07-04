"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataService = void 0;
class MetadataService {
    /**
     * Generates a fully populated metadata manifest for a given chunk.
     */
    static generateMetadata(params) {
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
exports.MetadataService = MetadataService;
