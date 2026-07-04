import { prisma } from '../../database/prisma';
import { ALL_ENGINE_CONTRACTS, EngineContract } from '../../engines/contracts';
import { KPIRegistry } from '../../config/kpis';
import { GrowthDomain } from '@prisma/client';

export interface EngineReadinessReport {
  engineId: string;
  engineName: string;
  readinessScore: number;         // 0-100 composite
  canExecute: boolean;            // score >= minimum confidence threshold
  coverageScore: number;          // % of required growth domains covered
  knowledgeScore: number;         // % of required knowledge chunks indexed
  confidenceScore: number;        // avg confidence across required domains
  kpiScore: number;               // % of required KPIs that have data
  missingInformation: string[];   // Human-readable gaps
  blockingGaps: string[];         // Critical gaps that prevent execution
  recommendations: string[];      // What to do to improve readiness
}

export class AIReadinessService {
  /**
   * Calculates readiness for all 6 engines for a given business.
   */
  static async calculateAllReadiness(businessId: string): Promise<EngineReadinessReport[]> {
    const reports: EngineReadinessReport[] = [];
    for (const contract of ALL_ENGINE_CONTRACTS) {
      const report = await this.calculateReadiness(businessId, contract.id);
      reports.push(report);
    }
    return reports;
  }

  /**
   * Calculates readiness for a single engine.
   */
  static async calculateReadiness(businessId: string, engineId: string): Promise<EngineReadinessReport> {
    const contract = ALL_ENGINE_CONTRACTS.find(e => e.id === engineId);
    if (!contract) {
      throw new Error(`Unknown engine: ${engineId}`);
    }

    // 1. Coverage Score — growth domain coverage
    const coverageScore = await this.computeCoverageScore(businessId, contract);

    // 2. Knowledge Score — RAG chunk availability
    const knowledgeScore = await this.computeKnowledgeScore(businessId, contract);

    // 3. Confidence Score — avg confidence on required domains
    const { confidenceScore, domainGaps } = await this.computeConfidenceScore(businessId, contract);

    // 4. KPI Score — required KPI data availability
    const { kpiScore, missingKpis } = await this.computeKPIScore(businessId, contract);

    // 5. Composite readiness score (weighted)
    const readinessScore = Math.round(
      coverageScore * 0.35 +
      knowledgeScore * 0.20 +
      confidenceScore * 0.30 +
      kpiScore * 0.15
    );

    // 6. Determine blocking gaps
    const blockingGaps = await this.identifyBlockingGaps(businessId, contract, coverageScore, confidenceScore);

    // 7. Generate recommendations
    const recommendations = this.generateRecommendations(contract, domainGaps, missingKpis, coverageScore, confidenceScore);

    // 8. Generate human-readable missing information list
    const missingInformation = [
      ...domainGaps.map(d => `Growth domain "${d}" has insufficient data`),
      ...missingKpis.map(k => `KPI "${k}" has no tracked data`),
      ...(coverageScore < 50 ? [`Only ${coverageScore}% of required knowledge domains are covered`] : []),
      ...(knowledgeScore < 30 ? ['Insufficient knowledge chunks indexed for this engine'] : [])
    ];

    return {
      engineId: contract.id,
      engineName: contract.displayName,
      readinessScore,
      canExecute: readinessScore >= contract.confidenceRequirements.minimum,
      coverageScore,
      knowledgeScore,
      confidenceScore,
      kpiScore,
      missingInformation,
      blockingGaps,
      recommendations
    };
  }

  // ─────────── Private helpers ───────────

  private static async computeCoverageScore(businessId: string, contract: EngineContract): Promise<number> {
    const requiredDomains = contract.knowledgeDependencies;
    if (requiredDomains.length === 0) return 100;

    const states = await prisma.growthDomainState.findMany({
      where: {
        businessId,
        domain: { in: requiredDomains as GrowthDomain[] }
      }
    });

    const coveredCount = states.filter(s => s.currentState !== null && s.confidence > 20).length;
    return Math.round((coveredCount / requiredDomains.length) * 100);
  }

  private static async computeKnowledgeScore(businessId: string, contract: EngineContract): Promise<number> {
    const requiredDomains = contract.knowledgeDependencies;
    if (requiredDomains.length === 0) return 100;

    const chunkCount = await prisma.knowledgeChunk.count({
      where: {
        businessId,
        status: 'ACTIVE',
        growthDomain: { in: requiredDomains }
      }
    });

    // Target: 10 chunks per required domain is considered good coverage
    const target = requiredDomains.length * 10;
    return Math.min(100, Math.round((chunkCount / target) * 100));
  }

  private static async computeConfidenceScore(
    businessId: string,
    contract: EngineContract
  ): Promise<{ confidenceScore: number; domainGaps: string[] }> {
    const requiredDomains = contract.knowledgeDependencies;
    if (requiredDomains.length === 0) return { confidenceScore: 100, domainGaps: [] };

    const states = await prisma.growthDomainState.findMany({
      where: {
        businessId,
        domain: { in: requiredDomains as GrowthDomain[] }
      }
    });

    const domainGaps: string[] = [];
    let totalConfidence = 0;

    for (const domain of requiredDomains) {
      const state = states.find(s => s.domain === domain);
      if (!state || state.confidence < 20) {
        domainGaps.push(domain);
        totalConfidence += 0;
      } else {
        totalConfidence += state.confidence;
      }
    }

    const confidenceScore = Math.round(totalConfidence / requiredDomains.length);
    return { confidenceScore, domainGaps };
  }

  private static async computeKPIScore(
    businessId: string,
    contract: EngineContract
  ): Promise<{ kpiScore: number; missingKpis: string[] }> {
    const requiredKpis = contract.requiredKpis;
    if (requiredKpis.length === 0) return { kpiScore: 100, missingKpis: [] };

    // Check BusinessKPI records
    const kpiRecords = await prisma.businessKPI.findMany({ where: { businessId } });
    const trackedNames = new Set(kpiRecords.map(k => k.name.toLowerCase()));

    const missingKpis: string[] = [];
    let covered = 0;
    for (const slug of requiredKpis) {
      const kpiDef = KPIRegistry.getBySlug(slug);
      const displayName = kpiDef?.displayName.toLowerCase() ?? slug.toLowerCase();
      if (trackedNames.has(slug) || trackedNames.has(displayName)) {
        covered++;
      } else {
        missingKpis.push(kpiDef?.displayName ?? slug);
      }
    }

    return {
      kpiScore: Math.round((covered / requiredKpis.length) * 100),
      missingKpis
    };
  }

  private static async identifyBlockingGaps(
    businessId: string,
    contract: EngineContract,
    coverageScore: number,
    confidenceScore: number
  ): Promise<string[]> {
    const blocking: string[] = [];

    if (coverageScore < contract.confidenceRequirements.minimum) {
      blocking.push(`Domain coverage too low (${coverageScore}% < required ${contract.confidenceRequirements.minimum}%)`);
    }

    if (confidenceScore < contract.confidenceRequirements.minimum) {
      blocking.push(`Average confidence too low (${confidenceScore}% < required ${contract.confidenceRequirements.minimum}%)`);
    }

    // Check failure conditions
    for (const condition of contract.failureConditions) {
      if (condition.toLowerCase().includes('no current state') && coverageScore === 0) {
        blocking.push(condition);
      }
    }

    return blocking;
  }

  private static generateRecommendations(
    contract: EngineContract,
    domainGaps: string[],
    missingKpis: string[],
    coverageScore: number,
    confidenceScore: number
  ): string[] {
    const recs: string[] = [];

    if (domainGaps.length > 0) {
      recs.push(`Complete discovery for: ${domainGaps.slice(0, 3).join(', ')} to improve engine readiness`);
    }

    if (missingKpis.length > 0) {
      recs.push(`Add KPI data for: ${missingKpis.slice(0, 3).join(', ')}`);
    }

    if (coverageScore < 50) {
      recs.push(`Upload business documents or add website URL to auto-extract knowledge`);
    }

    if (confidenceScore < 40) {
      recs.push(`Answer more discovery questions to increase data confidence`);
    }

    if (recs.length === 0) {
      recs.push(`${contract.displayName} is ready. Activate when AI engines are deployed.`);
    }

    return recs;
  }
}
