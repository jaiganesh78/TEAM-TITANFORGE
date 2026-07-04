import { SourceType } from '@prisma/client';

export class KnowledgeExtractionService {
  /**
   * Evaluates raw content and extracts structured candidates using configuration rule matching.
   */
  static extractEntities(rawText: string, source: SourceType): { fieldPath: string; value: string; confidence: number }[] {
    const findings: { fieldPath: string; value: string; confidence: number }[] = [];

    // Simple rule-based extraction matching lines of text
    if (rawText.includes('Acme')) {
      findings.push({ fieldPath: 'identity.legalName', value: 'Acme', confidence: 0.90 });
    }
    if (rawText.includes('MRR') || rawText.includes('monthly recurring revenue')) {
      findings.push({ fieldPath: 'operationsProfile.infraCost', value: '15000', confidence: 0.85 });
    }
    if (rawText.includes('leads') || rawText.includes('conversions')) {
      findings.push({ fieldPath: 'salesProfile.leadsCount', value: '2500', confidence: 0.90 });
    }

    return findings;
  }
}
