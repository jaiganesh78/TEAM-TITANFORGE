import { prisma } from '../../database/prisma';
import { RetrievalService } from './RetrievalService';

export interface ContextPackage {
  businessSummary: {
    legalName: string;
    industry: string;
    description: string;
  };
  digitalTwinData: any;
  relevantKnowledge: any[];
  evidence: any[];
  confidence: number;
  sources: string[];
  constraints: string[];
  missingKnowledge: string[];
}

export class BusinessContextService {
  /**
   * Assembles a structured ContextPackage object for a given topic.
   */
  static async assembleContext(businessId: string, topic: string): Promise<ContextPackage> {
    // 1. Fetch digital twin details
    const biz = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        identity: true,
        model: true,
        constraints: true
      }
    });

    const summary = {
      legalName: biz?.identity?.legalName || biz?.name || 'Unknown Corp',
      industry: biz?.identity?.industry || 'Enterprise Solutions',
      description: biz?.identity?.description || 'Corporate Digital Twin entity.'
    };

    // 2. Retrieve matched knowledge chunks using our RAG Retrieval pipeline
    const chunks = await RetrievalService.retrieve({ businessId, query: topic, limit: 3 });

    // 3. Retrieve matching evidence traces
    const evidences = await prisma.businessEvidence.findMany({
      where: { businessId },
      take: 5
    });

    // 4. Resolve unique source list
    const sources = Array.from(new Set(chunks.map(c => c.source).filter(Boolean))) as string[];

    // 5. Gather gaps and constraints
    const constraintsList = (biz?.constraints.map(c => c.description).filter(Boolean) || []) as string[];
    const missingKnowledge: string[] = [];

    // Calculate overall confidence average
    const totalConf = chunks.reduce((acc, c) => acc + c.explainability.confidence, 0.0);
    const avgConfidence = chunks.length > 0 ? totalConf / chunks.length : 85.0;

    return {
      businessSummary: summary,
      digitalTwinData: {
        identity: biz?.identity || null,
        model: biz?.model || null
      },
      relevantKnowledge: chunks,
      evidence: evidences,
      confidence: parseFloat(avgConfidence.toFixed(1)),
      sources,
      constraints: constraintsList,
      missingKnowledge
    };
  }

  /**
   * Generates and persists an immutable ContextSnapshot.
   */
  static async createSnapshot(businessId: string, topic: string, version: number): Promise<any> {
    const pkg = await this.assembleContext(businessId, topic);

    // Fetch versions
    const docVer = await prisma.knowledgeVersion.count({
      where: { businessId, entityType: 'DOCUMENT' }
    });
    const webVer = await prisma.knowledgeVersion.count({
      where: { businessId, entityType: 'WEBSITE' }
    });

    return prisma.contextSnapshot.create({
      data: {
        businessId,
        contextVersion: version,
        digitalTwinVersion: 1,
        knowledgeVersion: docVer + webVer,
        sourcesUsed: pkg.sources,
        confidenceSummary: pkg.confidence,
        topic,
        payload: JSON.stringify(pkg)
      }
    });
  }

  /**
   * Retrieves Context Snapshot logs.
   */
  static async getSnapshots(businessId: string): Promise<any[]> {
    return prisma.contextSnapshot.findMany({
      where: { businessId },
      orderBy: { timestamp: 'desc' }
    });
  }
}
